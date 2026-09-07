import { Request, Response } from 'express';
import Result from '../models/Result';
import Student from '../models/Student';
import Notification from '../models/Notification';
import { logAudit } from '../utils/auditLogger';
import { recalculateStudentMetrics } from './studentController';

export const getResults = async (req: Request, res: Response): Promise<void> => {
  try {
    const { class: className, section, semester, student } = req.query;
    const filter: any = {};
    if (className) filter.class = className;
    if (section) filter.section = section;
    if (semester) filter.semester = semester;
    if (student) filter.student = student;

    const user = (req as any).user;
    if (user && (user.role === 'student' || user.role === 'parent') && user.studentId) {
      filter.student = user.studentId;
    }

    const results = await Result.find(filter).populate('student').sort({ createdAt: -1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getStudentResultCard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    
    const user = (req as any).user;
    if (user && (user.role === 'student' || user.role === 'parent') && user.studentId && user.studentId.toString() !== studentId) {
      res.status(403).json({ message: 'Unauthorized access to student results' });
      return;
    }

    const results = await Result.find({ student: studentId }).sort({ semester: 1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createResult = async (req: Request, res: Response): Promise<void> => {
  try {
    const { student, semester, subjectMarks, remarks } = req.body;
    
    const studentInfo = await Student.findById(student);
    if (!studentInfo) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }

    const existing = await Result.findOne({ student, semester });
    if (existing) {
      existing.subjectMarks = subjectMarks;
      existing.remarks = remarks;
      await existing.save();
      
      await recalculateStudentMetrics(student);

      await Notification.create({
        title: 'Result Updated',
        message: `Your results for ${semester} have been updated.`,
        type: 'Result',
        targetRole: 'student',
        student: student,
      });

      await logAudit(req, `Updated results for ${semester}`, studentInfo.name, studentInfo._id.toString());

      res.json(existing);
      return;
    }

    const result = new Result({
      student,
      class: studentInfo.class,
      section: studentInfo.section,
      semester,
      subjectMarks,
      remarks,
    });

    await result.save();

    await recalculateStudentMetrics(student);

    await Notification.create({
      title: 'New Result Published',
      message: `Your results for ${semester} have been published. Grade: ${result.grade}, GPA: ${result.gpa}`,
      type: 'Result',
      targetRole: 'student',
      student: student,
    });

    await logAudit(req, `Published new results for ${semester}`, studentInfo.name, studentInfo._id.toString());

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateResult = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { subjectMarks, remarks } = req.body;

    const result = await Result.findById(id);
    if (!result) {
      res.status(404).json({ message: 'Result record not found' });
      return;
    }

    result.subjectMarks = subjectMarks;
    result.remarks = remarks;
    await result.save();

    const studentInfo = await Student.findById(result.student);
    if (studentInfo) {
      await recalculateStudentMetrics(result.student.toString());
      await logAudit(req, `Updated results for ${result.semester}`, studentInfo.name, studentInfo._id.toString());
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteResult = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await Result.findByIdAndDelete(req.params.id);
    if (!result) {
      res.status(404).json({ message: 'Result record not found' });
      return;
    }

    const studentInfo = await Student.findById(result.student);
    if (studentInfo) {
      await recalculateStudentMetrics(result.student.toString());
      await logAudit(req, `Deleted results for ${result.semester}`, studentInfo.name, studentInfo._id.toString());
    }

    res.json({ message: 'Result record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
