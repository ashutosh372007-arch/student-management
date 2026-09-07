import { Router } from 'express';
import { getStudentPerformanceAnalysis } from '../controllers/analysisController';
import auth from '../middlewares/auth';

const router = Router();

router.get('/student/:studentId', auth, getStudentPerformanceAnalysis);

export default router;
