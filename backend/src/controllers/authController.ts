import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Student from '../models/Student';
import Teacher from '../models/Teacher';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, name, role } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const user = new User({ username, password, name, role: role || 'admin' });

    // Link student/teacher/parent if records exist
    if (user.role === 'student') {
      const student = await Student.findOne({ $or: [{ email: username }, { rollNo: username }] });
      if (student) user.studentId = student._id as any;
    } else if (user.role === 'parent') {
      const { studentRollNo } = req.body;
      if (studentRollNo) {
        const student = await Student.findOne({ rollNo: studentRollNo });
        if (student) {
          user.studentId = student._id as any;
        } else {
          res.status(400).json({ message: `Student with roll number '${studentRollNo}' not found` });
          return;
        }
      } else {
        res.status(400).json({ message: 'Linked student roll number is required for Parent registration' });
        return;
      }
    } else if (user.role === 'teacher') {
      const teacher = await Teacher.findOne({ $or: [{ email: username }, { employeeId: username }] });
      if (teacher) user.teacherId = teacher._id as any;
    }

    await user.save();

    const secret = process.env.JWT_SECRET || 'student-mgmt-secret-key-2024';
    const token = jwt.sign(
      { id: user._id, role: user.role, studentId: user.studentId, teacherId: user.teacherId },
      secret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        studentId: user.studentId,
        teacherId: user.teacherId,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    // Link if not already linked
    let updated = false;
    if (user.role === 'student' && !user.studentId) {
      const student = await Student.findOne({ $or: [{ email: username }, { rollNo: username }] });
      if (student) {
        user.studentId = student._id as any;
        updated = true;
      }
    } else if (user.role === 'teacher' && !user.teacherId) {
      const teacher = await Teacher.findOne({ $or: [{ email: username }, { employeeId: username }] });
      if (teacher) {
        user.teacherId = teacher._id as any;
        updated = true;
      }
    }
    if (updated) {
      await user.save();
    }

    const secret = process.env.JWT_SECRET || 'student-mgmt-secret-key-2024';
    const token = jwt.sign(
      { id: user._id, role: user.role, studentId: user.studentId, teacherId: user.teacherId },
      secret,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        studentId: user.studentId,
        teacherId: user.teacherId,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
