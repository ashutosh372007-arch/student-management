import { Request, Response } from 'express';
import Student from '../models/Student';
import Result from '../models/Result';
import Attendance from '../models/Attendance';
import Submission from '../models/Submission';

export const getStudentPerformanceAnalysis = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;

    const user = (req as any).user;
    if (user && user.role === 'student' && user.studentId && user.studentId !== studentId) {
      res.status(403).json({ message: 'Unauthorized to view this student\'s analysis' });
      return;
    }

    const student = await Student.findById(studentId);
    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }

    const results = await Result.find({ student: studentId }).sort({ semester: 1 });
    const attendance = await Attendance.find({ student: studentId });
    const submissions = await Submission.find({ student: studentId });

    const totalAttendanceCount = attendance.length;
    const presentAttendanceCount = attendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
    const overallAttendanceRate = totalAttendanceCount > 0 ? (presentAttendanceCount / totalAttendanceCount) * 100 : 0;

    const subjectAttendance: Record<string, { total: number; present: number }> = {};
    attendance.forEach(a => {
      const sub = a.subject || 'General';
      if (!subjectAttendance[sub]) {
        subjectAttendance[sub] = { total: 0, present: 0 };
      }
      subjectAttendance[sub].total += 1;
      if (a.status === 'Present' || a.status === 'Late') {
        subjectAttendance[sub].present += 1;
      }
    });

    const subjectWiseAttendance = Object.keys(subjectAttendance).map(sub => ({
      subject: sub,
      percentage: Math.round((subjectAttendance[sub].present / subjectAttendance[sub].total) * 100),
    }));

    let totalScoreSum = 0;
    let totalMarksWeightCount = 0;
    const subjectMarksMap: Record<string, { totalObtained: number; totalMax: number }> = {};
    const semesterHistory: Array<{ semester: string; percentage: number; gpa: number }> = [];

    results.forEach(resRecord => {
      semesterHistory.push({
        semester: resRecord.semester,
        percentage: resRecord.percentage,
        gpa: resRecord.gpa,
      });

      resRecord.subjectMarks.forEach(sm => {
        if (!subjectMarksMap[sm.subject]) {
          subjectMarksMap[sm.subject] = { totalObtained: 0, totalMax: 0 };
        }
        subjectMarksMap[sm.subject].totalObtained += sm.marksObtained;
        subjectMarksMap[sm.subject].totalMax += sm.maxMarks;
      });

      totalScoreSum += resRecord.percentage;
      totalMarksWeightCount += 1;
    });

    const avgMarksPercentage = totalMarksWeightCount > 0 ? totalScoreSum / totalMarksWeightCount : 0;

    const subjectWiseMarks = Object.keys(subjectMarksMap).map(sub => ({
      subject: sub,
      average: Math.round((subjectMarksMap[sub].totalObtained / subjectMarksMap[sub].totalMax) * 100),
    }));

    const totalAssignments = submissions.length;
    const completedAssignments = submissions.filter(s => s.status === 'Submitted' || s.status === 'Late' || s.status === 'Evaluated').length;
    const assignmentCompletionRate = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;

    const attendanceWeight = overallAttendanceRate * 0.3;
    const marksWeight = (totalMarksWeightCount > 0 ? avgMarksPercentage : 75) * 0.5;
    const assignmentWeight = (totalAssignments > 0 ? assignmentCompletionRate : 80) * 0.2;

    const overallScore = Math.round(attendanceWeight + marksWeight + assignmentWeight);

    let classification: 'Excellent' | 'Good' | 'Average' | 'Needs Improvement' = 'Average';
    if (overallScore >= 85) classification = 'Excellent';
    else if (overallScore >= 70) classification = 'Good';
    else if (overallScore >= 50) classification = 'Average';
    else classification = 'Needs Improvement';

    const weakSubjects = subjectWiseMarks.filter(s => s.average < 60).map(s => s.subject);
    const suggestions: string[] = [];

    if (overallAttendanceRate < 75) {
      suggestions.push('Keep regular attendance! Your overall attendance is below the mandatory 75%.');
    }
    if (assignmentCompletionRate < 80) {
      suggestions.push('Ensure timely submission of all class assignments to avoid scoring penalties.');
    }
    if (weakSubjects.length > 0) {
      suggestions.push(`Focus on extra practice in: ${weakSubjects.join(', ')}. Dedicate 1-2 hours daily.`);
      suggestions.push('Request remedial sessions or contact your subject teachers for personal guidance.');
    } else if (overallScore < 75) {
      suggestions.push('Overall score is average. Consistent review of weekly classes will help boost grades.');
    } else {
      suggestions.push('Superb performance! Keep up the excellent work and assist your peers in joint study sessions.');
    }

    res.json({
      studentId,
      studentName: student.name,
      rollNo: student.rollNo,
      overallScore,
      classification,
      metrics: {
        attendance: Math.round(overallAttendanceRate),
        marks: Math.round(avgMarksPercentage),
        assignments: Math.round(assignmentCompletionRate),
      },
      subjectWiseAttendance,
      subjectWiseMarks,
      weakSubjects,
      suggestions,
      semesterHistory,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
