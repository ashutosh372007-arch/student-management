import mongoose, { Schema } from 'mongoose';
import { IAuditLog } from '../types';

const auditLogSchema = new Schema<IAuditLog>(
  {
    username: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    action: { type: String, required: true, trim: true },
    targetStudentName: { type: String, trim: true },
    targetStudentId: { type: Schema.Types.ObjectId, ref: 'Student' },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
