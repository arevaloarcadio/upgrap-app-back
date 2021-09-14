import {Router} from 'express';
import { getProducts, getProductsById, getProductsByUser,getProductsFilter,getProductsSavedById,getCountProducts,createProductsSavePosts,getProductsInvite,getProductsSaved,createProducts,getProductsByCategory,updateProducts, deleteProductsSaved,deleteProducts } from '../controllers/products.controller.js';
import { verifyToken } from '../middlewares';
import multer from 'multer';
import path from 'path';

const router = Router();


let storage = multer.diskStorage({
    destination:(req  :any, file  :any, cb :any)=>{
        cb(null, './uploads')
    },
    filename:(req  :any, file  :any, cb :any) => {
	   cb(null, 'file-'+Date.now()+'.'+file.originalname);
    }
})
const upload = multer({ storage });

router.get('/products/user/:user_id',verifyToken, getProductsByUser);
router.get('/products/category/:category_id',verifyToken, getProductsByCategory);
router.get('/products/saved/:user_id',verifyToken, getProductsSaved);
router.get('/products/saved/:user_id/:product_id',verifyToken, getProductsSavedById);
router.get('/products/count', getCountProducts);
router.get('/products/:id',verifyToken, getProductsById);
router.post('/products', upload.single('image'),createProducts);
router.post('/products/save/post',verifyToken,createProductsSavePosts);
router.post('/products/filter',getProductsFilter);
router.post('/products/:limit/:offset/invite', getProductsInvite);
router.post('/products/:limit/:offset/:user_id', verifyToken, getProducts);
router.put('/products/:id',upload.single('image'),verifyToken, updateProducts);
router.delete('/products/:id',verifyToken, deleteProducts);
router.delete('/products/saved/:user_id/:product_id',verifyToken, deleteProductsSaved);

export default router;