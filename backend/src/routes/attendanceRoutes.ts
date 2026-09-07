import { Router } from 'express';
import { getAttendance, markAttendance, getAttendanceStats, deleteAttendance } from '../controllers/attendanceController';
import auth from '../middlewares/auth';

const router = Router();

router.get('/stats', auth, getAttendanceStats);
router.get('/', auth, getAttendance);
router.post('/', auth, markAttendance);
router.delete('/:id', auth, deleteAttendance);

export default router;
