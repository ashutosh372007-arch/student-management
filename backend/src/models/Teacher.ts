import mongoose, { Schema } from 'mongoose';
import { ITeacher } from '../types';

const teacherSchema = new Schema<ITeacher>(
  {
    name: { type: String, required: true, trim: true },
    employeeId: { type: String, required: true, unique: true, trim: true },
    subject: { type: String, required: true, trim: true },
    qualification: { type: String, required: true, trim: true },
    contact: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    address: { type: String, required: true, trim: true },
    salary: { type: Number, default: 50000 },
    joiningDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<ITeacher>('Teacher', teacherSchema);
