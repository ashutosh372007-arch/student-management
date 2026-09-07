import mongoose, { Schema } from 'mongoose';
import { ISubmission } from '../types';

const submissionSchema = new Schema<ISubmission>(
  {
    assignment: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    studentName: { type: String, required: true, trim: true },
    rollNo: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['Pending', 'Submitted', 'Late', 'Evaluated'],
      default: 'Pending',
    },
    submittedAt: { type: Date },
    grade: { type: String, trim: true },
    score: { type: Number },
    feedback: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model<ISubmission>('Submission', submissionSchema);
