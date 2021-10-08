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
exports.signInAuthSocial = exports.signUpAuthSocial = exports.verifyCode = exports.signUpPhone = exports.signInMobile = exports.signUpMobile = exports.signIn = exports.signUp = void 0;
const database_1 = require("../database");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = require("../utils/auth");
const config_1 = __importDefault(require("../utils/config"));
const joi_1 = __importDefault(require("@hapi/joi"));
const accountSid = 'AC829f1905f71223f90e086aede4d411f5';
const authToken = '407ad9f3b1ac76427b0ecb4cc42d308f';
const client = require('twilio')(accountSid, authToken);
const schemaLogin = joi_1.default.object({
    email: joi_1.default.string().min(6).max(255).required().email().messages({
        'string.email': `Correo no es valido`,
        'string.base': `Correo es requerido`,
        'string.empty': `Correo es requerido`,
        'any.required': `Correo es requerido`,
    }),
    password: joi_1.default.string().min(6).max(1024).required().messages({
        'string.base': `Contraseña es requerido`,
        'string.empty': `Contraseña es requerido`,
        'string.min': `Contraseña es minimo de 6 caracteres`,
        'any.required': `Contraseña es requerido`,
    }),
});
const schemaRegister = joi_1.default.object({
    email: joi_1.default.string().required().email().messages({
        'string.required': `Correo es requerido`,
        'string.email': `Correo no es valido`,
    }),
});
const signUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, city, dir, pais, password, phone, rol } = req.body;
    try {
        const pass = yield auth_1.encriptPassword(password);
        const create = yield database_1.pool.query('INSERT INTO customer (name, email, city, dir, pais, password, phone, rol) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [name, email, city, dir, pais, pass, phone, rol]);
        const response = yield database_1.pool.query('SELECT * FROM customer ORDER BY id DESC LIMIT 1');
        const token = jsonwebtoken_1.default.sign({ id: response.rows[0].id }, config_1.default.SECRET, {
            expiresIn: 86400 // 24 horas
        });
        return res.status(200).json({ user: response.rows[0], token });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.signUp = signUp;
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NywiaWF0IjoxNjEyMjg3NDQ2LCJleHAiOjE2MTIzNzM4NDZ9.AnSiJ_LYzMVZceF8V2VSYngfI0JiQYkiKrYkPNt4020
const signIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const login = yield database_1.pool.query('SELECT * FROM customer WHERE email = $1 LIMIT 1', [email]);
        const pass = yield auth_1.comparePassword(password, login.rows[0].password);
        if (!pass)
            return res.status(401).json({ token: null, message: 'invalid password' });
        const token = jsonwebtoken_1.default.sign({ id: login.rows[0].id }, config_1.default.SECRET, {
            expiresIn: 86400
        });
        return res.json({ user: login.rows[0], token });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.signIn = signIn;
const signUpMobile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = { email: req.body.email };
    const { error } = schemaRegister.validate(data);
    if (error)
        return res.status(422).json({ error: true, type: 'validation', data: error.details[0].message });
    const { name, email, city, dir, pais, password, phone, rol, singin_method } = req.body;
    let lower_email = email.toLocaleLowerCase();
    try {
        const validate = yield database_1.pool.query('SELECT * FROM customer WHERE email = $1 LIMIT 1', [lower_email]);
        if (validate.rows.length != 0)
            return res.status(422).json({ error: true, type: 'validation', data: 'Ya existe cuenta con ese correo' });
        const pass = yield auth_1.encriptPassword(password);
        const create = yield database_1.pool.query('INSERT INTO customer (name, email, city, dir, pais, password, phone, rol, singin_method,photo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,$10) returning id', [name, lower_email, city, dir, pais, pass, phone, rol, singin_method, 'default.png']);
        database_1.pool.query('INSERT INTO customer_setting(show_name, show_city, show_dir, show_pais, show_phone, show_email, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7)', [true, true, true, true, true, true, create.rows[0].id]);
        return res.status(200).json({ user: create.rows[0] });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.signUpMobile = signUpMobile;
const signInMobile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { error } = schemaLogin.validate(req.body);
    if (error)
        return res.status(422).json({ error: true, type: 'validation', data: error.details[0].message });
    const { email, password } = req.body;
    let lower_email = email.toLocaleLowerCase();
    try {
        const login = yield database_1.pool.query('SELECT * FROM customer WHERE email = $1 LIMIT 1', [lower_email]);
        if (login.rows.length == 0)
            return res.status(422).json({ token: null, data: 'Usuario no encontrado' });
        const pass = yield auth_1.comparePassword(password, login.rows[0].password);
        if (!pass)
            return res.status(422).json({ token: null, data: 'Contraseña incorrecta' });
        const token = jsonwebtoken_1.default.sign({ id: login.rows[0].id }, config_1.default.SECRET);
        return res.json({ user: login.rows[0], token });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.signInMobile = signInMobile;
const signUpPhone = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { phone } = req.body;
    const validate_phone = yield database_1.pool.query('SELECT phone FROM customer WHERE phone = $1', [phone]);
    if (validate_phone.rows.length != 0)
        return res.status(422).json({ error: true, type: 'validation', data: 'Ya existe cuenta con este número de telefono' });
    const customer = yield database_1.pool.query('INSERT INTO customer (phone,singin_method,photo) VALUES ($1,$2,$3) returning id', [phone, 'phone', 'default.png']);
    const id_user = customer.rows[0].id;
    const code = GetRandomNum(1000, 9999);
    const verify_phone = yield database_1.pool.query('INSERT INTO verify_phone(code, id_user,create_at,expire_at)VALUES ($1, $2, now(), now())', [code, id_user]);
    client.messages
        .create({
        body: 'UPGRAP: El código para verificación es: ' + code,
        from: '+18182755786',
        to: phone
    })
        .catch((error) => {
        return res.status(422).json({ error: true, type: 'validation', data: 'Error al enviar el código' });
    });
    return res.status(200).json({ message: 'codigo enviado', id_user: id_user });
});
exports.signUpPhone = signUpPhone;
const verifyCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code, id_user } = req.body;
    try {
        const verify_code = yield database_1.pool.query('SELECT code, expire_at FROM verify_phone WHERE id_user = $1 ORDER BY create_at DESC LIMIT 1', [id_user]);
        if (verify_code.rows[0].code != code) {
            return res.status(422).json({ error: true, type: 'validation', data: 'Código de verificación incorrecto' });
        }
        const login = yield database_1.pool.query('SELECT * FROM customer WHERE id = $1 LIMIT 1', [id_user]);
        const token = jsonwebtoken_1.default.sign({ id: id_user }, config_1.default.SECRET);
        return res.status(200).json({ user: login.rows[0], token });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.verifyCode = verifyCode;
const signUpAuthSocial = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email } = req.body;
    const singin_method = req.params.singin_method;
    try {
        const validate = yield database_1.pool.query('SELECT * FROM customer WHERE email = $1 LIMIT 1', [email]);
        if (validate.rows.length != 0) {
            const token = jsonwebtoken_1.default.sign({ id: validate.rows[0].id }, config_1.default.SECRET);
            return res.json({ user: validate.rows[0], token });
        }
        else {
            const user = yield database_1.pool.query('INSERT INTO customer (name, email, photo,singin_method) VALUES ($1, $2, $3, $4) returning id,name, email, photo,singin_method', [name, email, 'default.png', singin_method]);
            const token = jsonwebtoken_1.default.sign({ id: user.rows[0].id }, config_1.default.SECRET);
            return res.json({ user: user.rows[0], token });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.signUpAuthSocial = signUpAuthSocial;
const signInAuthSocial = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, name } = req.body;
    const singin_method = req.params.singin_method;
    try {
        const login = yield database_1.pool.query('SELECT * FROM customer WHERE email = $1 LIMIT 1', [email]);
        if (login.rows.length == 0) {
            const user = yield database_1.pool.query('INSERT INTO customer (name, email, photo,singin_method) VALUES ($1, $2, $3, $4) returning id,name, email, photo,singin_method', [name, email, 'default.png', singin_method]);
            const token = jsonwebtoken_1.default.sign({ id: user.rows[0].id }, config_1.default.SECRET);
            return res.json({ user: user.rows[0], token });
        }
        else {
            const token = jsonwebtoken_1.default.sign({ id: login.rows[0].id }, config_1.default.SECRET);
            return res.json({ user: login.rows[0], token });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error Interno', error: error });
    }
});
exports.signInAuthSocial = signInAuthSocial;
function GetRandomNum(Min, Max) {
    var Range = Max - Min;
    var Rand = Math.random();
    return (Min + Math.round(Rand * Range));
}
