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
exports.updateCustomer = exports.getCustomerById = void 0;
const database_1 = require("../database");
const getCustomerById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    const response = yield database_1.pool.query('SELECT * FROM customer WHERE id = $1', [id]);
    return res.json(response.rows);
});
exports.getCustomerById = getCustomerById;
const updateCustomer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    const { name, email } = req.body;
    const response = yield database_1.pool.query('UPDATE customer SET name = $1, email = $2 WHERE id = $3', [name, email, id]);
    return res.json(`Customer ${id} Updated`);
});
exports.updateCustomer = updateCustomer;
