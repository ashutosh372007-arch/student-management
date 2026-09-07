import { Request, Response } from 'express';
import Notice from '../models/Notice';
import { logAudit } from '../utils/auditLogger';

export const getNotices = async (_req: Request, res: Response): Promise<void> => {
  try {
    const notices = await Notice.find().sort({ date: -1 });
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createNotice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content, category, isImportant } = req.body;
    const user = (req as any).user;

    const notice = new Notice({
      title,
      content,
      category,
      isImportant: !!isImportant,
      createdBy: user?.name || user?.username || 'Admin',
      date: new Date(),
    });

    await notice.save();

    await logAudit(req, `Published new notice: "${title}" (${category})`);

    res.status(201).json(notice);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateNotice = async (req: Request, res: Response): Promise<void> => {
  try {
    const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!notice) {
      res.status(404).json({ message: 'Notice not found' });
      return;
    }

    await logAudit(req, `Updated notice: "${notice.title}"`);

    res.json(notice);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteNotice = async (req: Request, res: Response): Promise<void> => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) {
      res.status(404).json({ message: 'Notice not found' });
      return;
    }

    await logAudit(req, `Deleted notice: "${notice.title}"`);

    res.json({ message: 'Notice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
