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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRequests = exports.updateRequests = exports.createRequests = exports.getRequestsById = exports.getRequestsByUser = exports.getRequests = void 0;
const database_1 = require("../database");
const uuid_random_1 = __importDefault(require("uuid-random"));
// get
const getRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const limit = req.params.limit;
        const offset = req.params.offset;
        const response = yield database_1.pool.query('SELECT *,cast(fecha as timestamp) as created_at FROM requests WHERE id > 733 ORDER BY cast(fecha as timestamp) DESC LIMIT $1 OFFSET $2', [limit, offset]);
        return res.status(200).json(response.rows);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.getRequests = getRequests;
const getRequestsByUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id_user = parseInt(req.params.id_user);
        const response = yield database_1.pool.query('SELECT products.* FROM requests INNER JOIN products ON products.id = requests.product_customer_id INNER JOIN customer ON products.id_user = customer.id WHERE requests.id_user = $1', [id_user]);
        return res.status(200).json(response.rows);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.getRequestsByUser = getRequestsByUser;
const getRequestsById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    try {
        const response = yield database_1.pool.query('SELECT * FROM requests WHERE id = $1', [id]);
        return res.json(response.rows[0]);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.getRequestsById = getRequestsById;
// post 
const createRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { product_id, product_id_user, product_select_id, product_select_id_user, message } = req.body;
    try {
        const insert_request = yield database_1.pool.query('INSERT INTO requests (id_user,product_user_id, product_customer_id) VALUES ($1,$2,$3) returning id', [product_select_id_user, product_select_id, product_id]);
        const insert_message = yield database_1.pool.query('INSERT INTO messages (id_sender, id_receiver, message,id_request, fecha, issee) VALUES ($1, $2, $3,$4, now(), FALSE)', [product_select_id_user, product_id_user, message, insert_request.rows[0].id]);
        const insert_chat_list = yield database_1.pool.query('INSERT INTO chat_list_mobile(id_user, id_customer,id_request) VALUES ($1, $2, $3)', [product_select_id_user, product_id_user, insert_request.rows[0].id]);
        const request_id = insert_request.rows[0].id;
        const product = yield database_1.pool.query('SELECT photo FROM products WHERE id = $1 LIMIT 1', [product_select_id]);
        const photo = product.rows[0].photo;
        const insert_notification = yield database_1.pool.query('INSERT INTO notifications(id,notifiable_id, data, type, request_id,photo,created_at) VALUES ($1, $2, $3, $4,$5,$6,now()) returning  id,notifiable_id, data, type, request_id,photo,created_at', [uuid_random_1.default(), product_id_user, 'Has recibido una solicitud de cambio', 'request', request_id, photo]);
        const insert_exchange = yield database_1.pool.query('INSERT INTO exchanges(customer_id, product_id, status) VALUES ($1, $2, $3)', [product_select_id_user, product_id, 'Por confirmar']);
        const response = yield database_1.pool.query('SELECT name, email, city, dir, pais, phone, validate_phone, migrate_key, prefix, userid, singin_method, rol, id FROM customer WHERE id = $1', [product_id_user]);
        console.log(product_id_user);
        const io = req.app.locals.io;
        io.emit('notification', insert_notification.rows[0]);
        return res.status(200).json({
            message: 'Request created Successfully',
            customer: response.rows[0],
            request: insert_request.rows[0].id
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.createRequests = createRequests;
const updateRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    try {
        const response = yield database_1.pool.query('UPDATE requests SET status = $1 WHERE id = $2', [status, id]);
        return res.json(`Categoria ${id} Updated`);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.updateRequests = updateRequests;
const deleteRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    try {
        const response = yield database_1.pool.query('DELETE FROM requests WHERE id = $1', [id]);
        return res.json(`Productos ${id} delete Successsfuly`);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.deleteRequests = deleteRequests;
