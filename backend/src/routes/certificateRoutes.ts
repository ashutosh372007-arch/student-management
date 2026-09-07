import { Router } from 'express';
import { generateCertificate, getCertificates, getStudentCertificates } from '../controllers/certificateController';
import auth, { authorize } from '../middlewares/auth';

const router = Router();

router.get('/', auth, getCertificates);
router.post('/', auth, authorize(['admin', 'teacher']), generateCertificate);
router.get('/student/:studentId', auth, getStudentCertificates);

export default router;
