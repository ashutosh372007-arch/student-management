import { Router } from 'express';
import { getTimetables, getTimetable, createTimetable, updateTimetable, deleteTimetable } from '../controllers/timetableController';
import auth from '../middlewares/auth';

const router = Router();

router.get('/', auth, getTimetables);
router.get('/:id', auth, getTimetable);
router.post('/', auth, createTimetable);
router.put('/:id', auth, updateTimetable);
router.delete('/:id', auth, deleteTimetable);

export default router;
