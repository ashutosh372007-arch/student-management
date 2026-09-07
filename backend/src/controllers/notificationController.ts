import { Request, Response } from 'express';
import Notification from '../models/Notification';

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const filter: any = {
      $or: [
        { targetRole: 'all' },
        { targetRole: user.role }
      ]
    };

    if (user.role === 'student' && user.studentId) {
      filter.$or.push({ student: user.studentId });
    }

    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const clearAllNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const filter: any = {
      $or: [
        { targetRole: 'all' },
        { targetRole: user.role }
      ]
    };

    if (user.role === 'student' && user.studentId) {
      filter.$or.push({ student: user.studentId });
    }

    await Notification.updateMany(filter, { isRead: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
