import mongoose, { Schema } from 'mongoose';
import { IResult } from '../types';

const resultSchema = new Schema<IResult>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    class: { type: String, required: true, trim: true },
    section: { type: String, required: true, trim: true },
    semester: { type: String, required: true, trim: true },
    subjectMarks: [
      {
        subject: { type: String, required: true, trim: true },
        marksObtained: { type: Number, required: true },
        maxMarks: { type: Number, required: true, default: 100 },
      },
    ],
    totalMarks: { type: Number },
    percentage: { type: Number },
    grade: { type: String },
    gpa: { type: Number },
    remarks: { type: String, trim: true },
  },
  { timestamps: true }
);

resultSchema.pre('save', function (this: any, next) {
  if (this.subjectMarks && this.subjectMarks.length > 0) {
    let obtained = 0;
    let max = 0;
    for (const sub of this.subjectMarks) {
      obtained += sub.marksObtained;
      max += sub.maxMarks;
    }
    this.totalMarks = obtained;
    this.percentage = max > 0 ? parseFloat(((obtained / max) * 100).toFixed(2)) : 0;
    
    // Calculate grade & GPA based on percentage
    const p = this.percentage;
    if (p >= 90) {
      this.grade = 'A+';
      this.gpa = 10.0;
    } else if (p >= 80) {
      this.grade = 'A';
      this.gpa = 9.0;
    } else if (p >= 70) {
      this.grade = 'B';
      this.gpa = 8.0;
    } else if (p >= 60) {
      this.grade = 'C';
      this.gpa = 7.0;
    } else if (p >= 50) {
      this.grade = 'D';
      this.gpa = 6.0;
    } else {
      this.grade = 'F';
      this.gpa = 0.0;
    }
  }
  next();
});

export default mongoose.model<IResult>('Result', resultSchema);
