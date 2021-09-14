import {Router} from 'express';
import { getCategories, createCategories, getCategoriesById,getCustomerCategories,createCustomerCategories,updateCustomerCategories, updateCategories, deleteCategories,deleteCustomerCategories } from '../controllers/categories.controller';
import { verifyToken } from '../middlewares';
const router = Router();

router.get('/categories/customer/:user_id',getCustomerCategories);
router.get('/categories', verifyToken, getCategories);
router.post('/categories',createCategories);
router.post('/categories/customer',createCustomerCategories);
router.get('/categories/:id', getCategoriesById);
router.put('/categories/:id', updateCategories);
router.put('/categories/customer/:customer_id',updateCustomerCategories);
router.delete('/categories/:id', deleteCategories);
router.delete('/categories/customer/:id/:user_id', deleteCustomerCategories);

export default router;