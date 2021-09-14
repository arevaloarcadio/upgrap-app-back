"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateChatReadAt = exports.getChatStatus = exports.createChatList = exports.updateConfigChat = exports.createConfigChat = exports.getConfigChat = exports.createMessageChat = exports.getChatMessages = exports.getTermsChatAcceptedByUser = exports.createTermsChatAccepted = exports.getChats = void 0;
const database_1 = require("../database");
function compare(a, b) {
    if (a.last_message.fecha < b.last_message.fecha) {
        return 1;
    }
    if (a.last_message.fecha > b.last_message.fecha) {
        return -1;
    }
    return 0;
}
const getChats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = parseInt(req.params.user_id);
        const chats = yield database_1.pool.query("SELECT * FROM (" +
            "SELECT chat_list_mobile.*,products.id as product_id,products.id_user as product_id_user ,products.name as product_name ,'recibido' as exchange,products.photo FROM chat_list_mobile " +
            "INNER JOIN requests ON requests.id = chat_list_mobile.id_request " +
            "INNER JOIN products ON products.id = requests.product_user_id " +
            "UNION ALL " +
            "SELECT chat_list_mobile.*,products.id as product_id,products.id_user as product_id_user,products.name as product_name ,'enviado' as exchange,products.photo FROM chat_list_mobile " +
            "INNER JOIN requests ON requests.id = chat_list_mobile.id_request " +
            "INNER JOIN products ON products.id = requests.product_customer_id ) as chats " +
            "WHERE id_user = $1 and product_id_user != $1 ", [user_id]);
        let response = [];
        for (var i = 0; i < chats.rows.length; i++) {
            const last_message = yield database_1.pool.query('SELECT * FROM messages WHERE (id_sender = $1 AND id_receiver = $2) OR (id_sender = $2 AND id_receiver = $1) ORDER BY fecha DESC LIMIT 1', [user_id, chats.rows[i].id_customer]);
            const customer = yield database_1.pool.query('SELECT name, email, city, dir, pais, phone, validate_phone, migrate_key, prefix, userid, singin_method, rol, id FROM customer WHERE id = $1 LIMIT 1', [chats.rows[i].id_customer]);
            response.push(Object.assign(Object.assign({}, chats.rows[i]), { last_message: last_message.rows[0], customer: customer.rows[0] }));
        }
        return res.status(200).json(response.sort(compare));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.getChats = getChats;
const createTermsChatAccepted = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id } = req.body;
    try {
        const response = yield database_1.pool.query('INSERT INTO terms_chat_accepted(user_id,created_at)VALUES ($1,now());', [user_id]);
        return res.json({ message: 'Terminos accepto correctamente' });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.createTermsChatAccepted = createTermsChatAccepted;
const getTermsChatAcceptedByUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user_id = parseInt(req.params.user_id);
    try {
        const response = yield database_1.pool.query('SELECT * FROM terms_chat_accepted WHERE user_id = $1', [user_id]);
        if (response.rows[0] == null)
            return res.json({ terms_chat_accepted: false });
        return res.json({ terms_chat_accepted: true });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.getTermsChatAcceptedByUser = getTermsChatAcceptedByUser;
const getChatMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = parseInt(req.params.user_id);
        const customer_id = parseInt(req.params.customer_id);
        const response = yield database_1.pool.query('SELECT * FROM messages WHERE (id_sender = $1 AND id_receiver = $2) OR (id_sender = $2 AND id_receiver = $1) ORDER BY fecha ASC', [user_id, customer_id]);
        return res.status(200).json(response.rows);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.getChatMessages = getChatMessages;
const createMessageChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { is_file } = req.body;
    try {
        if (is_file) {
            const { id_sender, id_receiver } = req.body;
            const file = req.file.filename;
            const response = yield database_1.pool.query('INSERT INTO messages(id_sender, id_receiver, message, fecha, issee,is_file) VALUES ($1, $2, $3,now(),false,$4)', [id_sender, id_receiver, file, is_file]);
            return res.json({ message: 'Mensaje enviado' });
        }
        else {
            const { id_sender, id_receiver, message } = req.body;
            const response = yield database_1.pool.query('INSERT INTO messages(id_sender, id_receiver, message, fecha, issee,is_file) VALUES ($1, $2, $3,now(),false,$4)', [id_sender, id_receiver, message, is_file]);
            return res.json({ message: 'Mensaje enviado' });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.createMessageChat = createMessageChat;
const getConfigChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user_id = parseInt(req.params.user_id);
    try {
        const response = yield database_1.pool.query('SELECT * FROM config_chat WHERE customer_id = $1 LIMIT 1', [user_id]);
        return res.json(response.rows[0]);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.getConfigChat = getConfigChat;
const createConfigChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { customer_id, enable_chat_all_proposal, decide_proposal_accept } = req.body;
    try {
        const response = yield database_1.pool.query('INSERT INTO config_chat (customer_id,enable_chat_all_proposal,decide_proposal_accept) VALUES($1, $2, $3)', [customer_id, enable_chat_all_proposal, decide_proposal_accept]);
        return res.json({ message: 'Configuración de chat exitoso' });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.createConfigChat = createConfigChat;
const updateConfigChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user_id = parseInt(req.params.user_id);
    const { enable_chat_all_proposal, decide_proposal_accept } = req.body;
    try {
        const response = yield database_1.pool.query('UPDATE config_chat SET enable_chat_all_proposal = $1,decide_proposal_accept = $2 WHERE customer_id = $3', [enable_chat_all_proposal, decide_proposal_accept, user_id]);
        return res.json({ message: 'Configuración de chat exitoso' });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.updateConfigChat = updateConfigChat;
const createChatList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id_user, id_customer, id_request } = req.body;
    try {
        const validate = yield database_1.pool.query('SELECT * FROM chat_list_mobile WHERE id_user = $1 and id_customer = $2 and id_request = $3 ', [id_user, id_customer, id_request]);
        if (validate.rows.length == 0) {
            const response = yield database_1.pool.query('INSERT INTO chat_list_mobile(id_user, id_customer,id_request) VALUES ($1, $2, $3);', [id_user, id_customer, id_request]);
        }
        return res.json({ message: 'Creacion de Chat exitoso' });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.createChatList = createChatList;
const getChatStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = parseInt(req.params.user_id);
        const customer_id = parseInt(req.params.customer_id);
        const response = yield database_1.pool.query('SELECT product_accepted_rejeted FROM chat_list_mobile WHERE id_user = $1 and id_customer = $2', [user_id, customer_id]);
        return res.status(200).json(response.rows[0]);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.getChatStatus = getChatStatus;
const updateChatReadAt = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id_message = parseInt(req.params.id_message);
        const read_at = yield database_1.pool.query('UPDATE messages SET read_at=now() WHERE id = $1', [id_message]);
        return res.status(200).json({ read_at: true });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.updateChatReadAt = updateChatReadAt;
