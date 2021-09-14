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
exports.deleteFcm = exports.createFcm = exports.getFcmByCustomerId = void 0;
const database_1 = require("../database");
const getFcmByCustomerId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const customer_id = parseInt(req.params.customer_id);
    try {
        const response = yield database_1.pool.query('SELECT customer_id, token FROM fcm WHERE customer_id = $1', [customer_id]);
        return res.json(response.rows);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.getFcmByCustomerId = getFcmByCustomerId;
const createFcm = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { customer_id, token } = req.body;
    try {
        if (token == null) {
            return res.status(404).json({ message: 'Token no encontrado' });
        }
        const validate = yield database_1.pool.query('SELECT customer_id, token FROM fcm WHERE customer_id = $1 and token =$2', [customer_id, token]);
        let response;
        if (validate.rows[0] == null) {
            response = yield database_1.pool.query('INSERT INTO fcm(customer_id, token)VALUES ($1,$2);', [customer_id, token]);
        }
        return res.json({ message: 'Fcm created Successfully' });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.createFcm = createFcm;
const deleteFcm = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const customer_id = req.params.customer_id;
    const token = req.params.token;
    try {
        const response = yield database_1.pool.query('DELETE FROM fcm WHERE customer_id = $1 and token = $2', [customer_id, token]);
        return res.json(`Fcm ${customer_id} delete Successsfuly`);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.deleteFcm = deleteFcm;
