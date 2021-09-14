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
exports.deleteCustomerCategories = exports.getCustomerCategories = exports.updateCustomerCategories = exports.createCustomerCategories = exports.deleteCategories = exports.updateCategories = exports.createCategories = exports.getCategoriesById = exports.getCategories = void 0;
const pg_format_1 = __importDefault(require("pg-format"));
const database_1 = require("../database");
// get
const getCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield database_1.pool.query('SELECT * FROM categories');
        return res.status(200).json(response.rows);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.getCategories = getCategories;
const getCategoriesById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const response = yield database_1.pool.query('SELECT * FROM categories WHERE id = $1', [id]);
        return res.json(response.rows[0]);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.getCategoriesById = getCategoriesById;
// post 
const createCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, namei, image, visible } = req.body;
    try {
        const response = yield database_1.pool.query('INSERT INTO categories (name, namei, image, visible) VALUES($1, $2, $3, $4)', [name, namei, image, visible]);
        return res.json({
            message: 'User created Successfully',
            body: {
                user: {
                    name,
                    namei,
                    image,
                    visible
                }
            }
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.createCategories = createCategories;
const updateCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    const { name, namei, image, visible } = req.body;
    try {
        const response = yield database_1.pool.query('UPDATE categories SET name = $1, namei = $2, image = $3, visible = $4 WHERE id = $5', [name, namei, image, visible, id]);
        return res.json(`Categoria ${id} Updated`);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.updateCategories = updateCategories;
const deleteCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    try {
        const response = yield database_1.pool.query('DELETE FROM categories WHERE id = $1', [id]);
        return res.json(`Categorias ${id} delete Successsfuly`);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.deleteCategories = deleteCategories;
const createCustomerCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { customer_id, categories_ids } = req.body;
    try {
        const responses = yield database_1.pool.query(pg_format_1.default('SELECT * FROM categories WHERE name in(%L)', categories_ids));
        let values = '';
        for (var i = 0; i < responses.rows.length; i++) {
            if (i + 1 == responses.rows.length) {
                values += '(' + customer_id + ',' + responses.rows[i].id + ');';
            }
            else {
                values += '(' + customer_id + ',' + responses.rows[i].id + '),';
            }
        }
        const insert = yield database_1.pool.query('INSERT INTO customer_category (customer_id, category_id) VALUES ' + values);
        return res.json({ message: 'Creación de categorias exitoso' });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.createCustomerCategories = createCustomerCategories;
const updateCustomerCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { categories_ids } = req.body;
    const customer_id = req.params.customer_id;
    try {
        const responses = yield database_1.pool.query(pg_format_1.default('SELECT * FROM categories WHERE name in(%L)', categories_ids));
        let values = '';
        for (var i = 0; i < responses.rows.length; i++) {
            if (i + 1 == responses.rows.length) {
                values += '(' + customer_id + ',' + responses.rows[i].id + ');';
            }
            else {
                values += '(' + customer_id + ',' + responses.rows[i].id + '),';
            }
        }
        yield database_1.pool.query('DELETE FROM customer_category WHERE customer_id = $1', [customer_id]);
        const insert = yield database_1.pool.query('INSERT INTO customer_category (customer_id, category_id) VALUES ' + values);
        return res.json({ message: 'Modificación de categorias exitoso' });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.updateCustomerCategories = updateCustomerCategories;
const getCustomerCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = parseInt(req.params.user_id);
        const response = yield database_1.pool.query('SELECT categories.* FROM categories INNER JOIN customer_category ON customer_category.category_id = categories.id WHERE customer_category.customer_id = $1', [user_id]);
        return res.status(200).json(response.rows);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.getCustomerCategories = getCustomerCategories;
const deleteCustomerCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user_id = parseInt(req.params.user_id);
    const id = parseInt(req.params.id);
    try {
        const response = yield database_1.pool.query('DELETE FROM customer_category WHERE category_id = $1 and customer_id = $2', [id, user_id]);
        return res.json(`Categorias ${id} delete Successsfuly`);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.deleteCustomerCategories = deleteCustomerCategories;
