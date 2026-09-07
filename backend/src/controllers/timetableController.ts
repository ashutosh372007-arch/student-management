import { Request, Response } from 'express';
import Timetable from '../models/Timetable';

export const getTimetables = async (req: Request, res: Response): Promise<void> => {
  try {
    const { class: className, section } = req.query;
    const filter: any = {};
    if (className) filter.class = className;
    if (section) filter.section = section;
    const timetables = await Timetable.find(filter).sort({ day: 1 });
    res.json(timetables);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getTimetable = async (req: Request, res: Response): Promise<void> => {
  try {
    const timetable = await Timetable.findById(req.params.id);
    if (!timetable) {
      res.status(404).json({ message: 'Timetable not found' });
      return;
    }
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createTimetable = async (req: Request, res: Response): Promise<void> => {
  try {
    const timetable = new Timetable(req.body);
    await timetable.save();
    res.status(201).json(timetable);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateTimetable = async (req: Request, res: Response): Promise<void> => {
  try {
    const timetable = await Timetable.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!timetable) {
      res.status(404).json({ message: 'Timetable not found' });
      return;
    }
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteTimetable = async (req: Request, res: Response): Promise<void> => {
  try {
    const timetable = await Timetable.findByIdAndDelete(req.params.id);
    if (!timetable) {
      res.status(404).json({ message: 'Timetable not found' });
      return;
    }
    res.json({ message: 'Timetable deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
