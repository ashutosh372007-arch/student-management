import { Router } from 'express';
import { getClasses, getClass, createClass, updateClass, deleteClass } from '../controllers/classController';
import auth from '../middlewares/auth';

const router = Router();

router.get('/', auth, getClasses);
router.get('/:id', auth, getClass);
router.post('/', auth, createClass);
router.put('/:id', auth, updateClass);
router.delete('/:id', auth, deleteClass);

export default router;
