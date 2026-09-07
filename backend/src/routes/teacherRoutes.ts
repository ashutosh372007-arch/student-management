import { Router } from 'express';
import { getTeachers, getTeacher, createTeacher, updateTeacher, deleteTeacher } from '../controllers/teacherController';
import auth from '../middlewares/auth';

const router = Router();

router.get('/', auth, getTeachers);
router.get('/:id', auth, getTeacher);
router.post('/', auth, createTeacher);
router.put('/:id', auth, updateTeacher);
router.delete('/:id', auth, deleteTeacher);

export default router;
