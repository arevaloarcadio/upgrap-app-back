import {Router} from 'express';
import {getFcmByCustomerId,createFcm,deleteFcm} from '../controllers/fcm.controller';
import { verifyToken } from '../middlewares';
const router = Router();

router.get('/fcm/:customer_id', getFcmByCustomerId);
router.post('/fcm', createFcm);
router.delete('/fcm/:customer_id/:token', deleteFcm);

export default router;