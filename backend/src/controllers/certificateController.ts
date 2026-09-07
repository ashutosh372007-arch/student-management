import { Request, Response } from 'express';
import Certificate from '../models/Certificate';
import Student from '../models/Student';
import { logAudit } from '../utils/auditLogger';

export const generateCertificate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, course, achievement, collegeName } = req.body;
    const user = (req as any).user;

    const studentObj = await Student.findById(studentId);
    if (!studentObj) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }

    // Generate unique Certificate ID (e.g. CERT-20260819-A3F9)
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const certificateId = `CERT-${dateStr}-${randomSuffix}`;

    const certificate = new Certificate({
      certificateId,
      student: studentId,
      studentName: studentObj.name,
      course,
      achievement,
      date: new Date(),
      collegeName: collegeName || 'Excel Campus Academy',
      generatedBy: user?.name || user?.username || 'Admin',
    });

    await certificate.save();

    await logAudit(req, `Generated certificate "${achievement}"`, studentObj.name, studentObj._id.toString());

    res.status(201).json(certificate);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getCertificates = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    let filter = {};

    // If student or parent, restrict to their own certificates
    if (user.role === 'student' || user.role === 'parent') {
      if (!user.studentId) {
        res.status(403).json({ message: 'Access denied: No linked student record' });
        return;
      }
      filter = { student: user.studentId };
    }

    const certificates = await Certificate.find(filter).populate('student').sort({ createdAt: -1 });
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getStudentCertificates = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const user = (req as any).user;

    // Check permissions
    if (user.role === 'student' || user.role === 'parent') {
      if (!user.studentId || user.studentId.toString() !== studentId) {
        res.status(403).json({ message: 'Access denied: Unauthorized student record' });
        return;
      }
    }

    const certificates = await Certificate.find({ student: studentId }).sort({ createdAt: -1 });
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
