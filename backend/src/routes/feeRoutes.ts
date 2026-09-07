import { Router } from 'express';
import { getFees, getStudentFee, payFee, getFeeStats } from '../controllers/feeController';
import auth from '../middlewares/auth';

const router = Router();

router.get('/stats', auth, getFeeStats);
router.get('/', auth, getFees);
router.get('/student/:studentId', auth, getStudentFee);
router.post('/payment', auth, payFee);

export default router;
