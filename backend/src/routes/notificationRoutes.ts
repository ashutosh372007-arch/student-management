import { Router } from 'express';
import { getNotifications, markAsRead, clearAllNotifications } from '../controllers/notificationController';
import auth from '../middlewares/auth';

const router = Router();

router.get('/', auth, getNotifications);
router.put('/:id/read', auth, markAsRead);
router.put('/read-all', auth, clearAllNotifications);

export default router;
