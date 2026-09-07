export interface Skill {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface Project {
  title: string;
  description: string;
  url?: string;
}

export interface Certification {
  name: string;
  issuingOrganization: string;
  date: string;
  credentialId?: string;
}

export interface Student {
  _id: string;
  name: string;
  rollNo: string;
  class: string;
  section: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  contact: string;
  parentName: string;
  parentContact: string;
  address: string;
  email: string;
  admissionDate: string;
  skills?: Skill[];
  projects?: Project[];
  certifications?: Certification[];
  aptitudeScore?: number;
  communicationScore?: number;
  profilePhoto?: string;
  riskLevel?: 'LOW RISK' | 'MEDIUM RISK' | 'HIGH RISK';
  riskReasons?: string[];
  placementScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Teacher {
  _id: string;
  name: string;
  employeeId: string;
  subject: string;
  qualification: string;
  contact: string;
  email: string;
  gender: 'Male' | 'Female' | 'Other';
  address: string;
  joiningDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Class {
  _id: string;
  name: string;
  section: string;
  classTeacher: string;
  studentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Period {
  subject: string;
  teacher: string;
  startTime: string;
  endTime: string;
}

export interface Timetable {
  _id: string;
  class: string;
  section: string;
  day: string;
  periods: Period[];
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  _id: string;
  student: string;
  studentName: string;
  class: string;
  section: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late';
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: string;
  studentId?: string;
  teacherId?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface SubjectMark {
  subject: string;
  marksObtained: number;
  maxMarks: number;
}

export interface Result {
  _id: string;
  student: any;
  class: string;
  section: string;
  semester: string;
  subjectMarks: SubjectMark[];
  totalMarks: number;
  percentage: number;
  grade: string;
  gpa: number;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeePayment {
  amount: number;
  date: string;
  paymentMethod: string;
}

export interface Fee {
  _id: string;
  student: any;
  totalFee: number;
  paidFee: number;
  remainingFee: number;
  paymentStatus: 'Paid' | 'Pending' | 'Partially Paid';
  paymentDate?: string;
  history: FeePayment[];
  createdAt: string;
  updatedAt: string;
}

export interface Assignment {
  _id: string;
  title: string;
  description?: string;
  class: string;
  section: string;
  subject: string;
  dueDate: string;
  teacher: string;
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  _id: string;
  assignment: any;
  student: any;
  studentName: string;
  rollNo: string;
  status: 'Pending' | 'Submitted' | 'Late' | 'Evaluated';
  submittedAt?: string;
  grade?: string;
  score?: number;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'Low Attendance' | 'Pending Fee' | 'Assignment' | 'Exam' | 'Result' | 'General';
  targetRole: 'all' | 'teacher' | 'student' | 'admin';
  student?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PerformanceAnalysis {
  studentId: string;
  studentName: string;
  rollNo: string;
  overallScore: number;
  classification: 'Excellent' | 'Good' | 'Average' | 'Needs Improvement';
  metrics: {
    attendance: number;
    marks: number;
    assignments: number;
  };
  subjectWiseAttendance: Array<{ subject: string; percentage: number }>;
  subjectWiseMarks: Array<{ subject: string; average: number }>;
  weakSubjects: string[];
  suggestions: string[];
  semesterHistory: Array<{ semester: string; percentage: number; gpa: number }>;
}

export interface Notice {
  _id: string;
  title: string;
  content: string;
  category: 'Exam' | 'Assignment' | 'Event' | 'Holiday' | 'Placement' | 'General';
  isImportant: boolean;
  createdBy: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Certificate {
  _id: string;
  certificateId: string;
  student: string | Student;
  studentName: string;
  course: string;
  achievement: string;
  date: string;
  collegeName: string;
  generatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  _id: string;
  username: string;
  role: string;
  action: string;
  targetStudentName?: string;
  targetStudentId?: string;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}
