"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fcm_controller_1 = require("../controllers/fcm.controller");
const router = express_1.Router();
router.get('/fcm/:customer_id', fcm_controller_1.getFcmByCustomerId);
router.post('/fcm', fcm_controller_1.createFcm);
router.delete('/fcm/:customer_id/:token', fcm_controller_1.deleteFcm);
exports.default = router;
