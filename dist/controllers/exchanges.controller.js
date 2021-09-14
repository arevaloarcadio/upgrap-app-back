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
exports.updateExchange = exports.getExchangesByUser = exports.getExchangeById = void 0;
const database_1 = require("../database");
const pg_format_1 = __importDefault(require("pg-format"));
const uuid_random_1 = __importDefault(require("uuid-random"));
const getExchangeById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const product_id = parseInt(req.params.id);
    const customer_id = parseInt(req.params.customer_id);
    try {
        const response = yield database_1.pool.query('SELECT * FROM exchanges WHERE product_id = $1 and customer_id = $2', [product_id, customer_id]);
        return res.json(response.rows[0]);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.getExchangeById = getExchangeById;
const getExchangesByUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user_id = parseInt(req.params.user_id);
    const { filters } = req.body;
    try {
        let response;
        if (filters.length == 0) {
            response = yield database_1.pool.query('SELECT * FROM exchanges INNER JOIN products ON products.id = exchanges.product_id WHERE customer_id = $1', [user_id]);
        }
        else {
            response = yield database_1.pool.query(pg_format_1.default('SELECT * FROM exchanges INNER JOIN products ON products.id = exchanges.product_id WHERE  exchanges.status IN (%L) and exchanges.customer_id = %L', filters, user_id));
        }
        return res.json(response.rows);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.getExchangesByUser = getExchangesByUser;
const updateExchange = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const request_id = parseInt(req.params.request_id);
    const status = req.params.status;
    const { user_id } = req.body;
    try {
        const requests = yield database_1.pool.query('SELECT * FROM requests WHERE id = $1 LIMIT 1', [request_id]);
        if (requests.rows.length == 0)
            return res.status(404).json(`Request not found`);
        const request = requests.rows[0];
        const response = yield database_1.pool.query('UPDATE exchanges SET status=$1 WHERE product_id = $2 and customer_id = $3', [status, request.product_customer_id, request.id_user]);
        let messages;
        if (status == 'Aceptada') {
            yield database_1.pool.query('INSERT INTO exchanges(customer_id, product_id, status) VALUES ( $1, $2, $3)', [user_id, request.product_user_id, status]);
            messages = yield database_1.pool.query('INSERT INTO messages(id_sender, id_receiver, message, fecha, issee, is_file, type)VALUES ($1, $2, $3, now(), false, false, $4) returning id,id_sender, id_receiver, message, fecha, issee, is_file, type', [user_id, request.id_user, 'Ha aceptado el cambio', 'accepted']);
        }
        else {
            messages = yield database_1.pool.query('INSERT INTO messages(id_sender, id_receiver, message, fecha, issee, is_file, type)VALUES ($1, $2, $3, now(), false, false, $4) returning id,id_sender, id_receiver, message, fecha, issee, is_file, type', [user_id, request.id_user, 'Ha rechazado el cambio', 'rejeted']);
        }
        const update = yield database_1.pool.query('UPDATE chat_list_mobile SET product_accepted_rejeted = true WHERE id_request = $1', [request_id]);
        const product = yield database_1.pool.query('SELECT photo FROM products WHERE id = $1 LIMIT 1', [request.product_customer_id]);
        const photo = product.rows[0].photo;
        const insert_notification = yield database_1.pool.query('INSERT INTO notifications(id,notifiable_id, data, type, request_id,photo,created_at) VALUES ($1, $2, $3, $4,$5,$6, now()) returning  id,notifiable_id, data, type, request_id,photo,created_at', [uuid_random_1.default(), request.id_user, 'Tu intercambio ha sido ' + status.toLowerCase(), status.toLowerCase() == 'aceptada' ? 'request.accepted' : 'request.rejected', request_id, photo]);
        const io = req.app.locals.io;
        io.emit('notification', insert_notification.rows[0]);
        return res.status(200).json({ message: `Exchange Updated`, message: messages.rows[0] });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.updateExchange = updateExchange;
