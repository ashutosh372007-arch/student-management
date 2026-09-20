import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import studentRoutes from './routes/studentRoutes';
import teacherRoutes from './routes/teacherRoutes';
import classRoutes from './routes/classRoutes';
import timetableRoutes from './routes/timetableRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import resultRoutes from './routes/resultRoutes';
import feeRoutes from './routes/feeRoutes';
import assignmentRoutes from './routes/assignmentRoutes';
import notificationRoutes from './routes/notificationRoutes';
import analysisRoutes from './routes/analysisRoutes';
import noticeRoutes from './routes/noticeRoutes';
import certificateRoutes from './routes/certificateRoutes';
import auditLogRoutes from './routes/auditLogRoutes';
import { runMigrations } from './utils/migration';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/audit-logs', auditLogRoutes);

// Root Health check for Cloud Render health probes
app.get('/', (_req, res) => {
  res.send('🚀 Student Management System API is live!');
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', message: 'Student Management API is running' });
});

// Start listening immediately on 0.0.0.0 so cloud providers (Render) pass health checks instantly
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  
  // Connect to DB and run migrations asynchronously
  connectDB().then(async () => {
    await runMigrations();
  }).catch((err) => {
    console.error('❌ Error during async DB initialization:', err);
  });
});

export default app;
