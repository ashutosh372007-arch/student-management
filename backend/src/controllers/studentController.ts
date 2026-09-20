import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Student from '../models/Student';
import { logAudit } from '../utils/auditLogger';

export const calculateRiskLevel = (attendanceRate: number, avgPercentage: number, pendingSubmissions: number) => {
  const riskReasons: string[] = [];
  if (attendanceRate < 75) {
    riskReasons.push('Low attendance');
  }
  if (avgPercentage < 50) {
    riskReasons.push('Poor marks');
  }
  if (pendingSubmissions > 2) {
    riskReasons.push('Multiple pending assignments');
  }

  let riskLevel = 'LOW RISK';
  if (attendanceRate < 65 || avgPercentage < 40 || pendingSubmissions > 3) {
    riskLevel = 'HIGH RISK';
  } else if (riskReasons.length > 0) {
    riskLevel = 'MEDIUM RISK';
  }

  return { riskLevel, riskReasons };
};

export const calculatePlacementScore = (
  avgPercentage: number,
  skills: Array<{ level: string }> = [],
  projects: any[] = [],
  certifications: any[] = [],
  aptitudeScore: number = 0,
  communicationScore: number = 0
) => {
  const academicPoints = (avgPercentage / 100) * 30; // max 30

  let skillPoints = 0;
  if (Array.isArray(skills)) {
    skills.forEach((s: any) => {
      if (s.level === 'Advanced') skillPoints += 5;
      else if (s.level === 'Intermediate') skillPoints += 3;
      else skillPoints += 1;
    });
  }
  skillPoints = Math.min(skillPoints, 20); // max 20

  const projectPoints = Math.min((Array.isArray(projects) ? projects.length : 0) * 7, 20); // max 20
  const certPoints = Math.min((Array.isArray(certifications) ? certifications.length : 0) * 5, 15); // max 15
  const aptPoints = ((aptitudeScore || 0) / 100) * 10; // max 10
  const commPoints = ((communicationScore || 0) / 100) * 5; // max 5

  return Math.round(academicPoints + skillPoints + projectPoints + certPoints + aptPoints + commPoints);
};

export const recalculateStudentMetrics = async (studentId: string): Promise<any> => {
  try {
    const student = await Student.findById(studentId);
    if (!student) return null;

    // 1. Get average percentage from Results
    const Result = mongoose.model('Result');
    const results = await Result.find({ student: studentId });
    let percentageSum = 0;
    results.forEach((r: any) => {
      percentageSum += r.percentage;
    });
    const avgPercentage = results.length > 0 ? percentageSum / results.length : 75; // default to 75% if no results

    // 2. Get attendance rate
    const Attendance = mongoose.model('Attendance');
    const attendanceRecords = await Attendance.find({ student: studentId });
    const totalAttendance = attendanceRecords.length;
    const presentAttendance = attendanceRecords.filter((a: any) => a.status === 'Present' || a.status === 'Late').length;
    const attendanceRate = totalAttendance > 0 ? (presentAttendance / totalAttendance) * 100 : 100;

    // 3. Get pending submissions
    const Submission = mongoose.model('Submission');
    const pendingSubmissions = await Submission.countDocuments({ student: studentId, status: 'Pending' });

    // 4. Calculate Risk Level & Reasons
    const { riskLevel, riskReasons } = calculateRiskLevel(attendanceRate, avgPercentage, pendingSubmissions);

    // 5. Calculate Placement Score
    const placementScore = calculatePlacementScore(
      avgPercentage,
      student.skills,
      student.projects,
      student.certifications,
      student.aptitudeScore,
      student.communicationScore
    );

    student.riskLevel = riskLevel as any;
    student.riskReasons = riskReasons;
    student.placementScore = placementScore;
    await student.save();

    return student;
  } catch (err) {
    console.error('Error in recalculateStudentMetrics:', err);
    return null;
  }
};

export const getStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, class: className, section } = req.query;
    const filter: any = {};
    if (className) filter.class = className;
    if (section) filter.section = section;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { rollNo: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const students = await Student.find(filter).sort({ name: 1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const student = await recalculateStudentMetrics(req.params.id);
    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const student = new Student(req.body);
    await student.save();
    
    await logAudit(req, 'Created student record', student.name, student._id.toString());
    
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }

    await logAudit(req, 'Updated student record details', student.name, student._id.toString());

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }

    await logAudit(req, 'Deleted student record', student.name, student._id.toString());

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateStudentSkills = async (req: Request, res: Response): Promise<void> => {
  try {
    const { skills, projects, certifications, aptitudeScore, communicationScore, profilePhoto } = req.body;
    
    const updatedData: any = {};
    if (skills !== undefined) updatedData.skills = skills;
    if (projects !== undefined) updatedData.projects = projects;
    if (certifications !== undefined) updatedData.certifications = certifications;
    if (aptitudeScore !== undefined) updatedData.aptitudeScore = aptitudeScore;
    if (communicationScore !== undefined) updatedData.communicationScore = communicationScore;
    if (profilePhoto !== undefined) updatedData.profilePhoto = profilePhoto;

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: updatedData },
      { new: true, runValidators: true }
    );

    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }

    // Recalculate placement & risk level
    const updatedStudent = await recalculateStudentMetrics(student._id.toString());

    await logAudit(req, 'Updated skills & technical profile', updatedStudent.name, updatedStudent._id.toString());

    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getStudentStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const total = await Student.countDocuments();
    const active = await Student.countDocuments(); // Assume all are active
    const highRisk = await Student.countDocuments({ riskLevel: 'HIGH RISK' });
    
    // Calculate average placement ready students (placementScore >= 70%)
    const placementReady = await Student.countDocuments({ placementScore: { $gte: 70 } });

    const byClass = await Student.aggregate([
      { $group: { _id: '$class', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      total,
      active,
      highRisk,
      placementReady,
      byClass,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getStudentPublic = async (req: Request, res: Response): Promise<void> => {
  try {
    const student = await recalculateStudentMetrics(req.params.id);
    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }
    res.json({
      name: student.name,
      rollNo: student.rollNo,
      class: student.class,
      section: student.section,
      gender: student.gender,
      skills: student.skills,
      projects: student.projects,
      certifications: student.certifications,
      placementScore: student.placementScore,
      riskLevel: student.riskLevel,
      admissionDate: student.admissionDate,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
