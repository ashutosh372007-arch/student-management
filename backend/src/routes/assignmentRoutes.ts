import { Router } from 'express';
import { getAssignments, createAssignment, getSubmissions, submitAssignment, gradeSubmission } from '../controllers/assignmentController';
import auth from '../middlewares/auth';

const router = Router();

router.get('/', auth, getAssignments);
router.post('/', auth, createAssignment);
router.get('/submissions', auth, getSubmissions);
router.post('/submissions/:id/submit', auth, submitAssignment);
router.put('/submissions/:id/grade', auth, gradeSubmission);

export default router;
