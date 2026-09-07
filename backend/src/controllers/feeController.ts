import { Request, Response } from 'express';
import Fee from '../models/Fee';
import Student from '../models/Student';
import Notification from '../models/Notification';
import { logAudit } from '../utils/auditLogger';

export const getFees = async (req: Request, res: Response): Promise<void> => {
  try {
    const { student, class: className, paymentStatus } = req.query;
    const filter: any = {};
    if (student) filter.student = student;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const user = (req as any).user;
    if (user && (user.role === 'student' || user.role === 'parent') && user.studentId) {
      filter.student = user.studentId;
    }

    let fees = await Fee.find(filter).populate('student').sort({ createdAt: -1 });

    if (className) {
      fees = fees.filter((fee: any) => fee.student && fee.student.class === className);
    }

    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getStudentFee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;

    const user = (req as any).user;
    if (user && (user.role === 'student' || user.role === 'parent') && user.studentId && user.studentId.toString() !== studentId) {
      res.status(403).json({ message: 'Unauthorized access to fee status' });
      return;
    }

    const fee = await Fee.findOne({ student: studentId }).populate('student');
    res.json(fee);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const payFee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { student, amount, paymentMethod } = req.body;

    const studentInfo = await Student.findById(student);
    if (!studentInfo) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }

    let fee = await Fee.findOne({ student });
    if (!fee) {
      fee = new Fee({
        student,
        totalFee: 50000,
        paidFee: 0,
        remainingFee: 50000,
        paymentStatus: 'Pending',
        history: [],
      });
    }

    fee.paidFee += Number(amount);
    fee.remainingFee = Math.max(0, fee.totalFee - fee.paidFee);
    
    if (fee.remainingFee === 0) {
      fee.paymentStatus = 'Paid';
    } else if (fee.paidFee > 0) {
      fee.paymentStatus = 'Partially Paid';
    } else {
      fee.paymentStatus = 'Pending';
    }

    fee.paymentDate = new Date();
    fee.history.push({
      amount: Number(amount),
      date: new Date(),
      paymentMethod: paymentMethod || 'Cash',
    });

    await fee.save();

    await Notification.create({
      title: 'Fee Payment Received',
      message: `We received your fee payment of ₹${amount}. Remaining balance: ₹${fee.remainingFee}.`,
      type: 'Pending Fee',
      targetRole: 'student',
      student,
    });

    await logAudit(req, `Recorded fee payment of ₹${amount} via ${paymentMethod}`, studentInfo.name, studentInfo._id.toString());

    res.json(fee);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getFeeStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const totalFeesCollected = await Fee.aggregate([
      { $group: { _id: null, total: { $sum: '$paidFee' } } }
    ]);
    const totalPendingFees = await Fee.aggregate([
      { $group: { _id: null, total: { $sum: '$remainingFee' } } }
    ]);

    const pendingCount = await Fee.countDocuments({ paymentStatus: { $ne: 'Paid' } });
    const paidCount = await Fee.countDocuments({ paymentStatus: 'Paid' });

    res.json({
      totalCollected: totalFeesCollected[0]?.total || 0,
      totalPending: totalPendingFees[0]?.total || 0,
      pendingStudents: pendingCount,
      paidStudents: paidCount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
