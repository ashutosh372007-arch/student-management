import mongoose, { Schema } from 'mongoose';
import { IClass } from '../types';

const classSchema = new Schema<IClass>(
  {
    name: { type: String, required: true, trim: true },
    section: { type: String, required: true, trim: true },
    classTeacher: { type: String, required: true, trim: true },
    studentCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

classSchema.index({ name: 1, section: 1 }, { unique: true });

export default mongoose.model<IClass>('Class', classSchema);
