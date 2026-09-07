import mongoose, { Schema } from 'mongoose';
import { INotice } from '../types';

const noticeSchema = new Schema<INotice>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Exam', 'Assignment', 'Event', 'Holiday', 'Placement', 'General'],
      required: true,
    },
    isImportant: { type: Boolean, default: false },
    createdBy: { type: String, required: true, trim: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<INotice>('Notice', noticeSchema);
