import { Request, Response } from 'express';
import Attendance from '../models/Attendance';
import { logAudit } from '../utils/auditLogger';

export const getAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { class: className, section, date, student } = req.query;
    const filter: any = {};
    if (className) filter.class = className;
    if (section) filter.section = section;
    if (student) filter.student = student;
    if (date) filter.date = new Date(date as string);
    const attendance = await Attendance.find(filter).sort({ date: -1, studentName: 1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const markAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { records } = req.body;
    if (!Array.isArray(records)) {
      res.status(400).json({ message: 'Records must be an array' });
      return;
    }

    const results = [];
    for (const record of records) {
      const existing = await Attendance.findOne({
        student: record.student,
        date: new Date(record.date),
      });

      if (existing) {
        existing.status = record.status;
        await existing.save();
        results.push(existing);
      } else {
        const attendance = new Attendance(record);
        await attendance.save();
        results.push(attendance);
      }
    }

    await logAudit(req, `Marked attendance for ${records.length} students`);

    res.status(201).json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getAttendanceStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { class: className, section } = req.query;
    const filter: any = {};
    if (className) filter.class = className;
    if (section) filter.section = section;

    const total = await Attendance.countDocuments(filter);
    const present = await Attendance.countDocuments({ ...filter, status: 'Present' });
    const absent = await Attendance.countDocuments({ ...filter, status: 'Absent' });
    const late = await Attendance.countDocuments({ ...filter, status: 'Late' });

    res.json({
      total,
      present,
      absent,
      late,
      presentPercentage: total > 0 ? Math.round((present / total) * 100) : 0,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!attendance) {
      res.status(404).json({ message: 'Attendance record not found' });
      return;
    }
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
