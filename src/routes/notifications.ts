import {Router} from 'express';
import {getNotification, getNotificationById, createNotification, deleteNotification, updateNotification} from '../controllers/notifications.controller';
import { verifyToken } from '../middlewares';
const router = Router();

router.get('/notifications', getNotification);
router.get('/notifications/:user_id', getNotificationById);
router.post('/notifications', createNotification);
router.put('/notifications/:id', updateNotification);
router.delete('/notifications/:id', deleteNotification);

export default router;