import {Router} from 'express';
import { createConfigChat,getConfigChat,createTermsChatAccepted,getChatStatus,getChats,createMessageChat,updateChatReadAt,getTermsChatAcceptedByUser,getChatMessages ,updateConfigChat,createChatList} from '../controllers/chat.controller';
import multer from 'multer';
const router = Router();

let storage = multer.diskStorage({
    destination:(req  :any, file :any, cb :any)=>{
        cb(null, '../images/public')
    },
    filename:(req :any, file :any, cb :any) => {
	   cb(null, 'file-'+Date.now()+'.'+file.originalname);
    }
})

const upload = multer({ storage });

router.get('/chat/config/:user_id', getConfigChat);
router.get('/chat/terms/:user_id', getTermsChatAcceptedByUser);
router.get('/chat/:user_id/:customer_id', getChatMessages);
router.get('/chat/status/:user_id/:customer_id', getChatStatus);
router.get('/chats/:user_id', getChats);
router.post('/chat/config', createConfigChat);
router.post('/chat/terms', createTermsChatAccepted);
router.post('/chat/list', createChatList);
router.post('/chat/message',upload.single('message'), createMessageChat);
router.put('/chat/config/:user_id', updateConfigChat);
router.put('/chat/read_at/:id_message', updateChatReadAt);

export default router;