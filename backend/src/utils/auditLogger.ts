import { Request } from 'express';
import AuditLog from '../models/AuditLog';

export const logAudit = async (
  req: Request,
  action: string,
  targetStudentName?: string,
  targetStudentId?: string
): Promise<void> => {
  try {
    const user = (req as any).user;
    if (!user) return;

    await AuditLog.create({
      username: user.name || user.username || 'System',
      role: user.role || 'unknown',
      action,
      targetStudentName,
      targetStudentId,
    });
  } catch (error) {
    console.error('❌ Failed to save audit log:', error);
  }
};
