"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const products_controller_js_1 = require("../controllers/products.controller.js");
const middlewares_1 = require("../middlewares");
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
router.get('/products/user/:user_id', middlewares_1.verifyToken, products_controller_js_1.getProductsByUser);
router.get('/products/category/:category_id', middlewares_1.verifyToken, products_controller_js_1.getProductsByCategory);
router.get('/products/saved/:user_id', middlewares_1.verifyToken, products_controller_js_1.getProductsSaved);
router.get('/products/saved/:user_id/:product_id', middlewares_1.verifyToken, products_controller_js_1.getProductsSavedById);
router.get('/products/count', products_controller_js_1.getCountProducts);
router.get('/products/:id', middlewares_1.verifyToken, products_controller_js_1.getProductsById);
router.post('/products', upload.single('image'), products_controller_js_1.createProducts);
router.post('/products/save/post', middlewares_1.verifyToken, products_controller_js_1.createProductsSavePosts);
router.post('/products/filter', products_controller_js_1.getProductsFilter);
router.post('/products/:limit/:offset/invite', products_controller_js_1.getProductsInvite);
router.post('/products/:limit/:offset/:user_id', middlewares_1.verifyToken, products_controller_js_1.getProducts);
router.put('/products/:id', upload.single('image'), middlewares_1.verifyToken, products_controller_js_1.updateProducts);
router.delete('/products/:id', middlewares_1.verifyToken, products_controller_js_1.deleteProducts);
router.delete('/products/saved/:user_id/:product_id', middlewares_1.verifyToken, products_controller_js_1.deleteProductsSaved);
exports.default = router;
