import { Request, Response } from 'express';
import Teacher from '../models/Teacher';

export const getTeachers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, subject } = req.query;
    const filter: any = {};
    if (subject) filter.subject = subject;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }
    const teachers = await Teacher.find(filter).sort({ name: 1 });
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getTeacher = async (req: Request, res: Response): Promise<void> => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      res.status(404).json({ message: 'Teacher not found' });
      return;
    }
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createTeacher = async (req: Request, res: Response): Promise<void> => {
  try {
    const teacher = new Teacher(req.body);
    await teacher.save();
    res.status(201).json(teacher);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateTeacher = async (req: Request, res: Response): Promise<void> => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!teacher) {
      res.status(404).json({ message: 'Teacher not found' });
      return;
    }
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteTeacher = async (req: Request, res: Response): Promise<void> => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!teacher) {
      res.status(404).json({ message: 'Teacher not found' });
      return;
    }
    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
