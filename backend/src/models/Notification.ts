import mongoose, { Schema } from 'mongoose';
import { INotification } from '../types';

const notificationSchema = new Schema<INotification>(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['Low Attendance', 'Pending Fee', 'Assignment', 'Exam', 'Result', 'General'],
      required: true,
    },
    targetRole: {
      type: String,
      enum: ['all', 'teacher', 'student', 'admin'],
      default: 'all',
    },
    student: { type: Schema.Types.ObjectId, ref: 'Student' },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<INotification>('Notification', notificationSchema);
