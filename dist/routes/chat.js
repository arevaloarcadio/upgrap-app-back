"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chat_controller_1 = require("../controllers/chat.controller");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const router = express_1.Router();
let storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path_1.default.join(__dirname, '../../../images/public'));
    },
    filename: (req, file, cb) => {
        cb(null, 'file-' + Date.now() + '.' + file.originalname);
    }
});
const upload = multer_1.default({ storage });
router.get('/chat/config/:user_id', chat_controller_1.getConfigChat);
router.get('/chat/terms/:user_id', chat_controller_1.getTermsChatAcceptedByUser);
router.get('/chat/status/:user_id/:customer_id', chat_controller_1.getChatStatus);
router.get('/chat/:user_id/:customer_id/:request_id', chat_controller_1.getChatMessages);
router.get('/chats/:user_id', chat_controller_1.getChats);
router.post('/chat/config', chat_controller_1.createConfigChat);
router.post('/chat/terms', chat_controller_1.createTermsChatAccepted);
router.post('/chat/list', chat_controller_1.createChatList);
router.post('/chat/message', upload.single('message'), chat_controller_1.createMessageChat);
router.put('/chat/config/:user_id', chat_controller_1.updateConfigChat);
router.put('/chat/read_at/:id_message', chat_controller_1.updateChatReadAt);
exports.default = router;
