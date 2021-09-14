"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const exchanges_controller_1 = require("../controllers/exchanges.controller");
const router = express_1.Router();
router.post('/exchanges/user/:user_id/', exchanges_controller_1.getExchangesByUser);
router.get('/exchanges/:product_id/:customer_id', exchanges_controller_1.getExchangeById);
router.put('/exchanges/:request_id/:status', exchanges_controller_1.updateExchange);
exports.default = router;
