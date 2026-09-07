import { Router } from 'express';
import { getResults, getStudentResultCard, createResult, updateResult, deleteResult } from '../controllers/resultController';
import auth from '../middlewares/auth';

const router = Router();

router.get('/', auth, getResults);
router.get('/student/:studentId', auth, getStudentResultCard);
router.post('/', auth, createResult);
router.put('/:id', auth, updateResult);
router.delete('/:id', auth, deleteResult);

export default router;
