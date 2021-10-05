"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = express_1.default();
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const index_1 = __importDefault(require("./routes/index"));
const categories_1 = __importDefault(require("./routes/categories"));
const upload_1 = __importDefault(require("./routes/upload"));
const auth_1 = __importDefault(require("./routes/auth"));
const chat_1 = __importDefault(require("./routes/chat"));
const products_1 = __importDefault(require("./routes/products"));
const customers_1 = __importDefault(require("./routes/customers"));
const requests_1 = __importDefault(require("./routes/requests"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const exchanges_1 = __importDefault(require("./routes/exchanges"));
const fcm_1 = __importDefault(require("./routes/fcm"));
app.set('port', process.env.PORT || 5000);
// middlewares
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use(cors_1.default());
app.use('/public', express_1.default.static(path_1.default.join(__dirname, '../../images/public')));
// routers
app.use(index_1.default);
app.use(categories_1.default);
app.use(upload_1.default);
app.use(auth_1.default);
app.use(chat_1.default);
app.use(products_1.default);
app.use(customers_1.default);
app.use(requests_1.default);
app.use(notifications_1.default);
app.use(exchanges_1.default);
app.use(fcm_1.default);
let http = require("http").Server(app);
const io = require("socket.io")(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    allowEIO3: true
});
io.on("connection", function (socket) {
    socket.on("chat_message", function (message) {
        socket.broadcast.emit("new_message", message);
    });
    socket.on("user_conected", function (user) {
        socket.broadcast.emit("users_conected", user);
    });
    socket.on('user_inactive', (user) => {
        socket.broadcast.emit("users_inactive", user);
    });
    socket.on('notifications', (notification) => {
        socket.broadcast.emit("notification", notification);
    });
});
http.listen(app.get('port'), () => {
    console.log(`Server on http://localhost:${app.get('port')}`);
});
app.locals.io = io;
