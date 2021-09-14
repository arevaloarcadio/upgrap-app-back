import {Router} from 'express';
import { getRequests, createRequests, getRequestsById,getRequestsByUser, updateRequests, deleteRequests } from '../controllers/requests.controller';
import { verifyToken } from '../middlewares';
const router = Router();

router.get('/requests', verifyToken, getRequests);
router.post('/requests',createRequests);
router.get('/requests/:id', getRequestsById);
router.get('/requests/user/:id_user', verifyToken, getRequestsByUser);
router.put('/requests/:id', updateRequests);
router.delete('/requests/:id', deleteRequests);

export default router;