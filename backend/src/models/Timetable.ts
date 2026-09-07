import mongoose, { Schema } from 'mongoose';
import { ITimetable } from '../types';

const periodSchema = new Schema(
  {
    subject: { type: String, required: true, trim: true },
    teacher: { type: String, required: true, trim: true },
    startTime: { type: String, required: true, trim: true },
    endTime: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const timetableSchema = new Schema<ITimetable>(
  {
    class: { type: String, required: true, trim: true },
    section: { type: String, required: true, trim: true },
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: true,
    },
    periods: [periodSchema],
  },
  { timestamps: true }
);

timetableSchema.index({ class: 1, section: 1, day: 1 }, { unique: true });

export default mongoose.model<ITimetable>('Timetable', timetableSchema);
