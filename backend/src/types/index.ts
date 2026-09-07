import { Document } from 'mongoose';

export interface ISkill {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface IProject {
  title: string;
  description: string;
  url?: string;
}

export interface ICertification {
  name: string;
  issuingOrganization: string;
  date: Date;
  credentialId?: string;
}

export interface IStudent extends Document {
  name: string;
  rollNo: string;
  class: string;
  section: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: Date;
  contact: string;
  parentName: string;
  parentContact: string;
  address: string;
  email: string;
  admissionDate: Date;
  skills?: ISkill[];
  projects?: IProject[];
  certifications?: ICertification[];
  aptitudeScore?: number;
  communicationScore?: number;
  profilePhoto?: string;
  riskLevel?: 'LOW RISK' | 'MEDIUM RISK' | 'HIGH RISK';
  riskReasons?: string[];
  placementScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITeacher extends Document {
  name: string;
  employeeId: string;
  subject: string;
  qualification: string;
  contact: string;
  email: string;
  gender: 'Male' | 'Female' | 'Other';
  address: string;
  salary?: number;
  joiningDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IClass extends Document {
  name: string;
  section: string;
  classTeacher: string;
  studentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPeriod {
  subject: string;
  teacher: string;
  startTime: string;
  endTime: string;
}

export interface ITimetable extends Document {
  class: string;
  section: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  periods: IPeriod[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IAttendance extends Document {
  student: string;
  studentName: string;
  class: string;
  section: string;
  date: Date;
  status: 'Present' | 'Absent' | 'Late';
  subject?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser extends Document {
  username: string;
  password: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  name: string;
  studentId?: any;
  teacherId?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubjectMark {
  subject: string;
  marksObtained: number;
  maxMarks: number;
}

export interface IResult extends Document {
  student: any;
  class: string;
  section: string;
  semester: string;
  subjectMarks: ISubjectMark[];
  totalMarks: number;
  percentage: number;
  grade: string;
  gpa: number;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFeePayment {
  amount: number;
  date: Date;
  paymentMethod: string;
}

export interface IFee extends Document {
  student: any;
  totalFee: number;
  paidFee: number;
  remainingFee: number;
  paymentStatus: 'Paid' | 'Pending' | 'Partially Paid';
  paymentDate?: Date;
  history: IFeePayment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IAssignment extends Document {
  title: string;
  description?: string;
  class: string;
  section: string;
  subject: string;
  dueDate: Date;
  teacher: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubmission extends Document {
  assignment: any;
  student: any;
  studentName: string;
  rollNo: string;
  status: 'Pending' | 'Submitted' | 'Late' | 'Evaluated';
  submittedAt?: Date;
  grade?: string;
  score?: number;
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotification extends Document {
  title: string;
  message: string;
  type: 'Low Attendance' | 'Pending Fee' | 'Assignment' | 'Exam' | 'Result' | 'General';
  targetRole: 'all' | 'teacher' | 'student' | 'admin';
  student?: any;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotice extends Document {
  title: string;
  content: string;
  category: 'Exam' | 'Assignment' | 'Event' | 'Holiday' | 'Placement' | 'General';
  isImportant: boolean;
  createdBy: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICertificate extends Document {
  certificateId: string;
  student: any;
  studentName: string;
  course: string;
  achievement: string;
  date: Date;
  collegeName: string;
  generatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuditLog extends Document {
  username: string;
  role: string;
  action: string;
  targetStudentName?: string;
  targetStudentId?: any;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}


