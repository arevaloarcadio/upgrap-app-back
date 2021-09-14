"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = express_1.Router();
const customer_controller_1 = require("../controllers/customer.controller");
router.get('/customers/:id', customer_controller_1.getCustomerById);
router.put('/customers/:id', customer_controller_1.updateCustomer);
exports.default = router;
