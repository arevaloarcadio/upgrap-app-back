import {Router} from 'express';
import {updateCustomer, getCustomerById ,updateCustomerMobile} from '../controllers/customers.controller';
import multer from 'multer';
const router = Router();

let storage = multer.diskStorage({
    destination:(req  :any, file :any, cb :any)=>{
        cb(null, '../public/products')
    },
    filename:(req :any, file :any, cb :any) => {
	   cb(null, 'file-'+Date.now()+'.'+file.originalname);
    }
})

const upload = multer({ storage });

router.get('/customers/:id', getCustomerById);
router.put('/customers/:id/mobile', upload.single('photo') ,updateCustomerMobile);
router.put('/customers/:id', updateCustomer);

export default router;