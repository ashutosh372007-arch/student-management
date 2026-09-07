import { Request, Response } from 'express';
import Assignment from '../models/Assignment';
import Submission from '../models/Submission';
import Student from '../models/Student';
import Notification from '../models/Notification';

export const getAssignments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { class: className, section, subject } = req.query;
    const filter: any = {};
    if (className) filter.class = className;
    if (section) filter.section = section;
    if (subject) filter.subject = subject;

    const user = (req as any).user;
    if (user && user.role === 'student' && user.studentId) {
      const student = await Student.findById(user.studentId);
      if (student) {
        filter.class = student.class;
        filter.section = student.section;
      }
    }

    const assignments = await Assignment.find(filter).sort({ dueDate: 1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, class: className, section, subject, dueDate } = req.body;
    const teacherName = (req as any).user?.name || 'Class Teacher';

    const assignment = new Assignment({
      title,
      description,
      class: className,
      section,
      subject,
      dueDate: new Date(dueDate),
      teacher: teacherName,
    });

    await assignment.save();

    const students = await Student.find({ class: className, section });
    for (const student of students) {
      await Submission.create({
        assignment: assignment._id,
        student: student._id,
        studentName: student.name,
        rollNo: student.rollNo,
        status: 'Pending',
      });

      await Notification.create({
        title: 'New Assignment Added',
        message: `New assignment: "${title}" added for ${subject}. Due date: ${new Date(dueDate).toLocaleDateString()}`,
        type: 'Assignment',
        targetRole: 'student',
        student: student._id,
      });
    }

    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getSubmissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { assignmentId, studentId } = req.query;
    const filter: any = {};
    if (assignmentId) filter.assignment = assignmentId;
    if (studentId) filter.student = studentId;

    const user = (req as any).user;
    if (user && user.role === 'student' && user.studentId) {
      filter.student = user.studentId;
    }

    const submissions = await Submission.find(filter)
      .populate('assignment')
      .sort({ updatedAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const submitAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const submission = await Submission.findById(id).populate('assignment');
    if (!submission) {
      res.status(404).json({ message: 'Submission record not found' });
      return;
    }

    const user = (req as any).user;
    if (user && user.role === 'student' && user.studentId && submission.student.toString() !== user.studentId) {
      res.status(403).json({ message: 'Unauthorized to submit for this student' });
      return;
    }

    const assignment = submission.assignment as any;
    const dueDate = new Date(assignment.dueDate);
    const now = new Date();

    submission.status = now > dueDate ? 'Late' : 'Submitted';
    submission.submittedAt = now;
    await submission.save();

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const gradeSubmission = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { score, grade, feedback } = req.body;

    const submission = await Submission.findById(id).populate('assignment');
    if (!submission) {
      res.status(404).json({ message: 'Submission record not found' });
      return;
    }

    submission.score = Number(score);
    submission.grade = grade;
    submission.feedback = feedback;
    submission.status = 'Evaluated';
    await submission.save();

    const assignment = submission.assignment as any;
    await Notification.create({
      title: 'Assignment Evaluated',
      message: `Your assignment "${assignment.title}" has been evaluated. Score: ${score}, Grade: ${grade}`,
      type: 'Assignment',
      targetRole: 'student',
      student: submission.student,
    });

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
