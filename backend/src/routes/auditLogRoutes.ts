import { Router } from 'express';
import { getAuditLogs } from '../controllers/auditLogController';
import auth, { authorize } from '../middlewares/auth';

const router = Router();

router.get('/', auth, authorize(['admin']), getAuditLogs);

export default router;
