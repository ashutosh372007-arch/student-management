import mongoose, { Schema } from 'mongoose';
import { IFee } from '../types';

const feeSchema = new Schema<IFee>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    totalFee: { type: Number, required: true },
    paidFee: { type: Number, required: true, default: 0 },
    remainingFee: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Pending', 'Partially Paid'],
      default: 'Pending',
    },
    paymentDate: { type: Date },
    history: [
      {
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        paymentMethod: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

feeSchema.pre('save', function (this: any, next) {
  this.remainingFee = this.totalFee - this.paidFee;
  if (this.remainingFee <= 0) {
    this.paymentStatus = 'Paid';
    this.remainingFee = 0;
  } else if (this.paidFee > 0) {
    this.paymentStatus = 'Partially Paid';
  } else {
    this.paymentStatus = 'Pending';
  }
  next();
});

export default mongoose.model<IFee>('Fee', feeSchema);
