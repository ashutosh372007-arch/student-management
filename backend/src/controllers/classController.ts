import { Request, Response } from 'express';
import Class from '../models/Class';

export const getClasses = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search } = req.query;
    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { classTeacher: { $regex: search, $options: 'i' } },
      ];
    }
    const classes = await Class.find(filter).sort({ name: 1, section: 1 });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getClass = async (req: Request, res: Response): Promise<void> => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) {
      res.status(404).json({ message: 'Class not found' });
      return;
    }
    res.json(cls);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createClass = async (req: Request, res: Response): Promise<void> => {
  try {
    const cls = new Class(req.body);
    await cls.save();
    res.status(201).json(cls);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateClass = async (req: Request, res: Response): Promise<void> => {
  try {
    const cls = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!cls) {
      res.status(404).json({ message: 'Class not found' });
      return;
    }
    res.json(cls);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteClass = async (req: Request, res: Response): Promise<void> => {
  try {
    const cls = await Class.findByIdAndDelete(req.params.id);
    if (!cls) {
      res.status(404).json({ message: 'Class not found' });
      return;
    }
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
