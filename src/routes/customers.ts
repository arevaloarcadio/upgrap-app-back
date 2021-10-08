import {Router} from 'express';
import {updateCustomer, getCustomerById ,updateCustomerMobile,getCustomerSetting} from '../controllers/customers.controller';
import multer from 'multer';
import path  from 'path';
const router = Router();

let storage = multer.diskStorage({
    destination:(req  :any, file :any, cb :any)=>{
         cb(null, path.join(__dirname, '../../../images/public'))
    },
    filename:(req :any, file :any, cb :any) => {
	   cb(null, 'file-'+Date.now()+'.'+file.originalname);
    }
})

const upload = multer({ storage });

router.get('/customers/:id', getCustomerById);
router.get('/customers/setting/:id', getCustomerSetting);
router.put('/customers/:id/mobile', upload.single('photo') ,updateCustomerMobile);
router.put('/customers/:id', updateCustomer);

export default router;