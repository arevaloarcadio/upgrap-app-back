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
exports.deleteNotification = exports.updateNotification = exports.createNotification = exports.getNotificationById = exports.getNotification = void 0;
const database_1 = require("../database");
// get
const getNotification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield database_1.pool.query('SELECT * FROM notifications');
        return res.status(200).json(response.rows);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.getNotification = getNotification;
const getNotificationById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user_id = parseInt(req.params.user_id);
    try {
        const response = yield database_1.pool.query('SELECT notifications.* FROM notifications  WHERE notifiable_id = $1 ORDER BY created_at DESC', [user_id]);
        return res.json(response.rows);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.getNotificationById = getNotificationById;
const createNotification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { notifiable_id, data, type, product_id } = req.body;
    try {
        const response = yield database_1.pool.query('INSERT INTO notifications( notifiable_id, data, type, product_id, read_at, created_at)VALUES (?, ?, ?, ?, ?, ?);', [notifiable_id, data, type, product_id]);
        return res.json({
            message: 'Notification created Successfully',
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.createNotification = createNotification;
const updateNotification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    const { notifiable_id, data, type, product_id } = req.body;
    try {
        const response = yield database_1.pool.query('UPDATE notificationsSET id=?, notifiable_id=?, data=?, type=?, product_id=? WHERE <condition>;', [notifiable_id, data, type, product_id, id]);
        return res.json(`Notification ${id} Updated`);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.updateNotification = updateNotification;
const deleteNotification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        const response = yield database_1.pool.query('DELETE FROM notifications WHERE id = $1', [id]);
        return res.json(`Notification ${id} delete Successsfuly`);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.deleteNotification = deleteNotification;
