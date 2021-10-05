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
exports.updateCustomerMobile = exports.updateCustomer = exports.getCustomerById = void 0;
const database_1 = require("../database");
const auth_1 = require("../utils/auth");
const getCustomerById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    try {
        const response = yield database_1.pool.query('SELECT * FROM customer WHERE id = $1', [id]);
        delete response.rows[0].password;
        return res.json(response.rows[0]);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.getCustomerById = getCustomerById;
const updateCustomer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    const { name, email } = req.body;
    try {
        const response = yield database_1.pool.query('UPDATE customer SET name = $1, email = $2 WHERE id = $3', [name, email, id]);
        return res.json(`Customer ${id} Updated`);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.updateCustomer = updateCustomer;
const updateCustomerMobile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = parseInt(req.params.id);
    const upload = req.file === undefined ? false : true;
    const { name, city, dir, pais, phone, email, password, complete } = req.body;
    try {
        let lower_email = email.toLocaleLowerCase();
        if (complete == 'true') {
            const validate = yield database_1.pool.query('SELECT * FROM customer WHERE email = $1 LIMIT 1', [lower_email]);
            if (validate.rows.length != 0)
                return res.status(422).json({ error: true, type: 'validation', data: 'Ya existe una cuenta con ese correo' });
        }
        if (password != '') {
            const pass = yield auth_1.encriptPassword(password);
            yield database_1.pool.query('UPDATE customer SET password = $1 WHERE id = $2', [pass, id]);
        }
        else {
            if (complete == 'true') {
                return res.status(422).json({ error: true, type: 'validation', data: 'La constraseña es requerida' });
            }
        }
        if (upload) {
            const update = yield database_1.pool.query('UPDATE customer SET name = $1, city = $2,dir = $3,pais = $4,phone = $5, photo = $6,email = $7 WHERE id = $8', [name, city, dir, pais, phone, (_a = req === null || req === void 0 ? void 0 : req.file) === null || _a === void 0 ? void 0 : _a.filename, lower_email, id]);
        }
        else {
            const update = yield database_1.pool.query('UPDATE customer SET name = $1, city = $2,dir = $3,pais = $4,phone = $5,email = $6 WHERE id = $7', [name, city, dir, pais, phone, lower_email, id]);
        }
        const response = yield database_1.pool.query('SELECT name, email, city, dir, pais, phone, validate_phone, migrate_key, prefix, userid, singin_method, rol,photo ,id FROM customer WHERE id = $1', [id]);
        return res.json({ message: `Customer ${id} Updated`, customer: response.rows[0] });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.updateCustomerMobile = updateCustomerMobile;
