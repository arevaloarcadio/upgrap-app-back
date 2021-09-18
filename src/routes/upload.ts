import {Router} from 'express';
import multer from 'multer';
import path from 'path';
import { uploadCategory } from '../controllers/upload.controller';

const router = Router();

let storage = multer.diskStorage({
    destination:(req  :any, file :any, cb :any)=>{
        cb(null, path.join(__dirname, '../../images/public'))
    },
    filename:(req :any, file :any, cb :any) => {
        cb(null, file.fieldname+'-'+Date.now()+'.'+file.originalname);
    }
})

const upload = multer({ storage });

router.post('/category', upload.single('file'), uploadCategory)

export default router;