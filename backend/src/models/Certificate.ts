import mongoose, { Schema } from 'mongoose';
import { ICertificate } from '../types';

const certificateSchema = new Schema<ICertificate>(
  {
    certificateId: { type: String, required: true, unique: true, trim: true },
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    studentName: { type: String, required: true, trim: true },
    course: { type: String, required: true, trim: true },
    achievement: { type: String, required: true, trim: true },
    date: { type: Date, default: Date.now },
    collegeName: { type: String, required: true, trim: true },
    generatedBy: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model<ICertificate>('Certificate', certificateSchema);
