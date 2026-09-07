import { Router } from 'express';
import { getNotices, createNotice, updateNotice, deleteNotice } from '../controllers/noticeController';
import auth, { authorize } from '../middlewares/auth';

const router = Router();

router.get('/', auth, getNotices);
router.post('/', auth, authorize(['admin']), createNotice);
router.put('/:id', auth, authorize(['admin']), updateNotice);
router.delete('/:id', auth, authorize(['admin']), deleteNotice);

export default router;
