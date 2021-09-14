import {Router} from 'express';
const router = Router();
import {getUser, getUserById, createUser, deleteUser, updateUser} from '../controllers/index.controller';
// router.get('/test', (req, res) => res.send('hello world'));


router.get('/users', getUser);
router.get('/users/:id', getUserById);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;