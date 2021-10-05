"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customers_controller_1 = require("../controllers/customers.controller");
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
router.get('/customers/:id', customers_controller_1.getCustomerById);
router.put('/customers/:id/mobile', upload.single('photo'), customers_controller_1.updateCustomerMobile);
router.put('/customers/:id', customers_controller_1.updateCustomer);
exports.default = router;
