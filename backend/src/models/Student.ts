import mongoose, { Schema } from 'mongoose';
import { IStudent } from '../types';

const studentSchema = new Schema<IStudent>(
  {
    name: { type: String, required: true, trim: true },
    rollNo: { type: String, required: true, unique: true, trim: true },
    class: { type: String, required: true, trim: true },
    section: { type: String, required: true, trim: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    dateOfBirth: { type: Date, required: true },
    contact: { type: String, required: true, trim: true },
    parentName: { type: String, required: true, trim: true },
    parentContact: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    admissionDate: { type: Date, default: Date.now },
    skills: [
      {
        name: { type: String, required: true },
        level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' }
      }
    ],
    projects: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        url: { type: String }
      }
    ],
    certifications: [
      {
        name: { type: String, required: true },
        issuingOrganization: { type: String, required: true },
        date: { type: Date, required: true },
        credentialId: { type: String }
      }
    ],
    aptitudeScore: { type: Number, default: 0 },
    communicationScore: { type: Number, default: 0 },
    profilePhoto: { type: String },
    riskLevel: { type: String, enum: ['LOW RISK', 'MEDIUM RISK', 'HIGH RISK'], default: 'LOW RISK' },
    riskReasons: [{ type: String }],
    placementScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IStudent>('Student', studentSchema);
