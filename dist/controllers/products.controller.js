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
exports.deleteProductsSaved = exports.deleteProducts = exports.updateProducts = exports.createProductsSavePosts = exports.getProductsSavedById = exports.getProductsSaved = exports.createProducts = exports.getProductsById = exports.getProductsByCategory = exports.getCountProducts = exports.getProductsByUser = exports.getProductsFilter = exports.getProductsInvite = exports.getProducts = void 0;
const database_1 = require("../database");
const pg_format_1 = __importDefault(require("pg-format"));
const jimp_1 = __importDefault(require("jimp"));
// get
const getProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const limit = req.params.limit;
        const offset = req.params.offset;
        const user_id = req.params.user_id;
        let { filter } = req.body;
        let products = null;
        if (filter == null) {
            const categories = yield database_1.pool.query('SELECT category_id FROM customer_category WHERE customer_id =  $1', [user_id]);
            if (categories.rows.length == 0) {
                products = yield database_1.pool.query('SELECT products.*,cast(fecha as timestamp) as created_at FROM products INNER JOIN categories ON  categories.id =  products.category WHERE products.id > 733  ORDER BY products.id DESC LIMIT $1 OFFSET $2', [limit, offset]);
            }
            else {
                let categories_ids = [];
                for (i = 0; i < categories.rows.length; i++) {
                    categories_ids.push(categories.rows[i].category_id);
                }
                let sql = pg_format_1.default('SELECT DISTINCT * FROM ((SELECT products.*,cast(fecha as timestamp) as created_at ' +
                    'FROM products ' +
                    'INNER JOIN categories ON  categories.id =  products.category ' +
                    'WHERE products.id > 733  and category in(%L) ' +
                    'ORDER BY products.id DESC ' +
                    'LIMIT %L OFFSET %L) ' +
                    'UNION ALL ' +
                    '(SELECT products.*,cast(fecha as timestamp) as created_at ' +
                    'FROM products ' +
                    'INNER JOIN categories ON  categories.id =  products.category ' +
                    'WHERE products.id > 733 ' +
                    'ORDER BY products.id DESC ' +
                    'LIMIT %L OFFSET %L)' +
                    ') as products_by_user', categories_ids, limit, offset, limit, offset);
                products = yield database_1.pool.query(sql);
            }
        }
        else {
            products = yield database_1.pool.query('SELECT products.*,cast(fecha as timestamp) as created_at FROM products INNER JOIN categories ON  categories.id =  products.category WHERE products.id > 733  and categories.name = $1 ORDER BY products.id DESC LIMIT $2 OFFSET $3', [filter, limit, offset]);
        }
        let response = [];
        for (var i = 0; i < products.rows.length; i++) {
            const requests = yield database_1.pool.query('SELECT count(*) as requests FROM requests WHERE product_customer_id = $1;', [products.rows[i].id]);
            response.push(Object.assign(Object.assign({}, products.rows[i]), { requests: requests.rows[0].requests }));
        }
        return res.status(200).json(response);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.getProducts = getProducts;
const getProductsInvite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("2");
        const limit = req.params.limit;
        const offset = req.params.offset;
        let { filter } = req.body;
        let products = null;
        if (filter == null) {
            let sql = pg_format_1.default('SELECT products.*,cast(fecha as timestamp) as created_at ' +
                'FROM products ' +
                'INNER JOIN categories ON  categories.id =  products.category ' +
                'WHERE products.id > 733 ' +
                'ORDER BY products.id DESC ' +
                'LIMIT %L OFFSET %L', limit, offset);
            products = yield database_1.pool.query(sql);
        }
        else {
            products = yield database_1.pool.query('SELECT products.*,cast(fecha as timestamp) as created_at FROM products INNER JOIN categories ON  categories.id =  products.category WHERE products.id > 733  and categories.name = $1 ORDER BY products.id DESC LIMIT $2 OFFSET $3', [filter, limit, offset]);
        }
        let response = [];
        for (var i = 0; i < products.rows.length; i++) {
            const requests = yield database_1.pool.query('SELECT count(*) as requests FROM requests WHERE product_customer_id = $1;', [products.rows[i].id]);
            response.push(Object.assign(Object.assign({}, products.rows[i]), { requests: requests.rows[0].requests }));
        }
        return res.status(200).json(response);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.getProductsInvite = getProductsInvite;
const getProductsFilter = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { filter } = req.body;
        console.log(filter);
        const products = yield database_1.pool.query("SELECT products.*, categories.name as category_name FROM products INNER JOIN categories ON categories.id = products.category WHERE (products.name like $1 OR categories.name like $1)", ['%' + filter + '%']);
        let response = [];
        for (var i = 0; i < products.rows.length; i++) {
            const requests = yield database_1.pool.query('SELECT count(*) as requests FROM requests WHERE product_customer_id = $1;', [products.rows[i].id]);
            response.push(Object.assign(Object.assign({}, products.rows[i]), { requests: requests.rows[0].requests }));
        }
        return res.status(200).json(response);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.getProductsFilter = getProductsFilter;
const getProductsByUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = parseInt(req.params.user_id);
        const response = yield database_1.pool.query('SELECT * FROM products WHERE id_user = $1', [user_id]);
        return res.status(200).json(response.rows);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.getProductsByUser = getProductsByUser;
const getCountProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield database_1.pool.query('SELECT count(id) FROM products');
        return res.status(200).json(response.rows[0]);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.getCountProducts = getCountProducts;
const getProductsByCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category_id = parseInt(req.params.category_id);
        console.log(category_id);
        const products = yield database_1.pool.query('SELECT products.*,cast(fecha as timestamp) FROM products INNER JOIN categories ON categories.id = products.category WHERE categories.id = $1 and products.id > 733 ORDER BY random() LIMIT 4 ', [category_id]);
        let response = [];
        for (var i = 0; i < products.rows.length; i++) {
            const requests = yield database_1.pool.query('SELECT count(*) as requests FROM requests WHERE product_customer_id = $1;', [products.rows[i].id]);
            response.push(Object.assign(Object.assign({}, products.rows[i]), { requests: requests.rows[0].requests }));
        }
        return res.status(200).json(response);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.getProductsByCategory = getProductsByCategory;
const getProductsById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    try {
        const response = yield database_1.pool.query('SELECT * FROM products WHERE id = $1', [id]);
        return res.json(response.rows[0]);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.getProductsById = getProductsById;
// post 
const createProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { address, category_id, to_change, city, descripcion, estado, user_id, nombre, country } = req.body;
    try {
        jimp_1.default.read(req.file.path).then(info => {
            var _a;
            info.resize(512, jimp_1.default.AUTO, jimp_1.default.RESIZE_BEZIER)
                .write('./uploads/' + ((_a = req === null || req === void 0 ? void 0 : req.file) === null || _a === void 0 ? void 0 : _a.filename));
        })
            .catch(err => {
            res.status(500).json({ message: 'Error Interno', error: err });
        });
        const response = yield database_1.pool.query('INSERT INTO products (address, category, change, city, description, estado, fecha, id_user, name, pais,photo) VALUES($1, $2, $3, $4,$5, $6, now(), $7,$8,$9,$10)', [address, category_id, to_change, city, descripcion, estado, user_id, nombre, country, (_a = req === null || req === void 0 ? void 0 : req.file) === null || _a === void 0 ? void 0 : _a.filename]);
        return res.status(200).json({
            message: 'User created Successfully',
            body: {
                product: {
                    address, category_id, to_change, city, descripcion, estado, user_id, nombre, country, file: (_b = req === null || req === void 0 ? void 0 : req.file) === null || _b === void 0 ? void 0 : _b.filename
                }
            }
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.createProducts = createProducts;
const getProductsSaved = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = parseInt(req.params.user_id);
        const products = yield database_1.pool.query('SELECT products.* FROM products INNER JOIN saved_posts ON saved_posts.product_id = products.id WHERE saved_posts.user_id = $1', [user_id]);
        let response = [];
        for (var i = 0; i < products.rows.length; i++) {
            const requests = yield database_1.pool.query('SELECT count(*) as requests FROM requests WHERE product_customer_id = $1;', [products.rows[i].id]);
            response.push(Object.assign(Object.assign({}, products.rows[i]), { requests: requests.rows[0].requests }));
        }
        return res.status(200).json(response);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.getProductsSaved = getProductsSaved;
const getProductsSavedById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user_id = parseInt(req.params.user_id);
    const product_id = parseInt(req.params.product_id);
    try {
        const response = yield database_1.pool.query('SELECT true as saved FROM products INNER JOIN saved_posts ON saved_posts.product_id = products.id WHERE saved_posts.user_id = $1 and saved_posts.product_id = $2', [user_id, product_id]);
        return res.json(response.rows[0]);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.getProductsSavedById = getProductsSavedById;
const createProductsSavePosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id, product_id } = req.body;
    try {
        const response = yield database_1.pool.query('INSERT INTO saved_posts(user_id,product_id) VALUES ($1, $2)', [user_id, product_id]);
        return res.status(200).json({
            message: 'Product saved Successfully',
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.createProductsSavePosts = createProductsSavePosts;
const updateProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    const { address, category_id, to_change, city, descripcion, estado, user_id, nombre, country } = req.body;
    try {
        if (req.file !== undefined) {
            const filename = req.file.filename;
            const response = yield database_1.pool.query('UPDATE products SET address=$1, category=$2, change=$3, city=$4, description=$5, estado=$6, id_user=$7, name=$8, pais=$9, photo=$10 WHERE id = $11;', [address, category_id, to_change, city, descripcion, estado, user_id, nombre, country, filename, id]);
        }
        else {
            const response = yield database_1.pool.query('UPDATE products SET address=$1, category=$2, change=$3, city=$4, description=$5, estado=$6, id_user=$7, name=$8, pais=$9 WHERE id = $10;', [address, category_id, to_change, city, descripcion, estado, user_id, nombre, country, id]);
        }
        return res.json(`Categoria ${id} Updated`);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.updateProducts = updateProducts;
const deleteProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    try {
        const response = yield database_1.pool.query('DELETE FROM products WHERE id = $1', [id]);
        return res.json(`Productos ${id} delete Successsfuly`);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.deleteProducts = deleteProducts;
const deleteProductsSaved = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const product_id = parseInt(req.params.product_id);
    const user_id = parseInt(req.params.user_id);
    try {
        const response = yield database_1.pool.query('DELETE FROM saved_posts WHERE user_id = $1 and product_id = $2', [user_id, product_id]);
        return res.json(`Productos ${product_id} delete Successsfuly`);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.deleteProductsSaved = deleteProductsSaved;
