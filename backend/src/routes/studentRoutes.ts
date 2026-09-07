import { Router } from 'express';
import {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentStats,
  updateStudentSkills,
  getStudentPublic
} from '../controllers/studentController';
import auth, { authorize } from '../middlewares/auth';

const router = Router();

router.get('/public/:id', getStudentPublic);
router.get('/stats', auth, getStudentStats);
router.get('/', auth, getStudents);
router.get('/:id', auth, getStudent);
router.post('/', auth, authorize(['admin']), createStudent);
router.put('/:id', auth, authorize(['admin']), updateStudent);
router.put('/:id/skills', auth, authorize(['admin', 'student', 'teacher']), updateStudentSkills);
router.delete('/:id', auth, authorize(['admin']), deleteStudent);

export default router;
