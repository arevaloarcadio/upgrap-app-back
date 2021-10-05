import {Request, Response} from 'express';
import { QueryResult } from 'pg';
import { pool } from '../database';
import jwt from 'jsonwebtoken';
import { comparePassword, encriptPassword } from '../utils/auth';
import config from '../utils/config';
import Joi from '@hapi/joi'

const accountSid = 'AC829f1905f71223f90e086aede4d411f5';
const authToken = '407ad9f3b1ac76427b0ecb4cc42d308f';
const client = require('twilio')(accountSid, authToken);

const schemaLogin = Joi.object({
    email: Joi.string().min(6).max(255).required().email().messages({
      'string.email': `Correo no es valido`,
      'string.base':  `Correo es requerido`,
      'string.empty': `Correo es requerido`,
      'any.required': `Correo es requerido`,
    }),
    password: Joi.string().min(6).max(1024).required().messages({
      'string.base':  `Contraseña es requerido`,
      'string.empty': `Contraseña es requerido`,
      'string.min':   `Contraseña es minimo de 6 caracteres`,
      'any.required': `Contraseña es requerido`,
    }),
})

const schemaRegister = Joi.object({
    email: Joi.string().required().email().messages({
      'string.required': `Correo es requerido`,
      'string.email': `Correo no es valido`,
    }),
})




export const signUp = async (req: Request, res: Response): Promise<Response> => {
    const {name, email, city, dir, pais, password, phone, rol} =req.body;
    try{
        const pass = await encriptPassword(password);
        const create: QueryResult = await pool.query('INSERT INTO customer (name, email, city, dir, pais, password, phone, rol) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [name, email, city, dir, pais, pass, phone, rol]);
        const response: QueryResult = await pool.query('SELECT * FROM customer ORDER BY id DESC LIMIT 1');
        const token = jwt.sign({id: response.rows[0].id}, config.SECRET, {
            expiresIn: 86400 // 24 horas
        })
        return res.status(200).json({user: response.rows[0], token});
    }catch(error){
        console.log(error)
        return res.status(500).json({message : 'Error Interno', error : error});
    }
  
}
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NywiaWF0IjoxNjEyMjg3NDQ2LCJleHAiOjE2MTIzNzM4NDZ9.AnSiJ_LYzMVZceF8V2VSYngfI0JiQYkiKrYkPNt4020

export const signIn = async (req: Request, res: Response): Promise<Response> => {
    const {email, password} = req.body; 
    try{
        const login: QueryResult = await pool.query('SELECT * FROM customer WHERE email = $1 LIMIT 1', [email]);
        const pass = await comparePassword(password, login.rows[0].password);
        if(!pass) return res.status(401).json({token: null, message: 'invalid password'});
        
        const token = jwt.sign({id: login.rows[0].id}, config.SECRET, {
            expiresIn: 86400
        })

        return res.json({user: login.rows[0], token});

    }catch(error){
        console.log(error)
        return res.status(500).json({message : 'Error Interno', error : error});
    }
}


export const signUpMobile = async (req: Request, res: Response): Promise<Response> => {
    let data = {email : req.body.email}
    const { error } = schemaRegister.validate(data);
    if (error) return res.status(422).json({error: true,type : 'validation', data: error.details[0].message})
    
    const {name, email, city, dir, pais, password, phone, rol, singin_method} = req.body;
    let lower_email : string = email.toLocaleLowerCase()
    try{
         const validate: QueryResult = await pool.query('SELECT * FROM customer WHERE email = $1 LIMIT 1', [lower_email]);
        if(validate.rows.length != 0) return res.status(422).json({error: true,type : 'validation', data: 'Ya existe cuenta con ese correo'})
        const pass = await encriptPassword(password);
        const create: QueryResult = await pool.query('INSERT INTO customer (name, email, city, dir, pais, password, phone, rol, singin_method,photo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,$10) returning id', [name, lower_email, city, dir, pais, pass, phone, rol,singin_method,'default.png']);
        return res.status(200).json({user: create.rows[0]});
    }catch(error){
        console.log(error)
        return res.status(500).json({message : 'Error Interno', error : error});
    }
}

export const signInMobile = async (req: Request, res: Response): Promise<Response> => {
    const { error } = schemaLogin.validate(req.body);
    if (error) return res.status(422).json({error: true,type : 'validation', data: error.details[0].message})
    
    const {email, password} = req.body; 
    let lower_email : string = email.toLocaleLowerCase()
    
    try{
        const login: QueryResult = await pool.query('SELECT * FROM customer WHERE email = $1 LIMIT 1', [lower_email]);
        if(login.rows.length == 0) return res.status(422).json({token: null, message: 'Usuario no encontrado'});
        const pass = await comparePassword(password, login.rows[0].password);
        if(!pass) return res.status(422).json({token: null, message: 'Contraseña incorrecta'});
        const token = jwt.sign({id: login.rows[0].id}, config.SECRET)
        return res.json({user: login.rows[0], token});
    }catch(error){
        console.log(error)
        return res.status(500).json({message : 'Error Interno', error : error});
    }
}

export const signUpPhone = async (req: Request, res: Response): Promise<Response> => {
    const { phone } = req.body;
    const validate_phone: QueryResult = await pool.query('SELECT phone FROM customer WHERE phone = $1' , [phone]);
    if(validate_phone.rows.length != 0) return res.status(422).json({error: true,type : 'validation', data: 'Ya existe cuenta con este número de telefono'})
    const customer: QueryResult = await pool.query('INSERT INTO customer (phone,singin_method,photo) VALUES ($1,$2,$3) returning id', [phone,'phone','default.png']);
    const id_user = customer.rows[0].id
    const code = GetRandomNum(1000,9999)
    const verify_phone: QueryResult = await pool.query('INSERT INTO verify_phone(code, id_user,create_at,expire_at)VALUES ($1, $2, now(), now())', [code,id_user]);

    client.messages
    .create({
        body: 'UPGRAP: El código para verificación es: '+code,
        from: '+18182755786',
        to: phone
    })
    .catch((error : any) => {
        return res.status(422).json({error: true,type : 'validation', data: 'Error al enviar el código'})
    });

    return res.status(200).json({message : 'codigo enviado' , id_user : id_user }); 
}

export const verifyCode = async (req: Request, res: Response): Promise<Response> => {
    const { code,id_user } = req.body;
    try{
        const verify_code: QueryResult = await pool.query('SELECT code, expire_at FROM verify_phone WHERE id_user = $1 ORDER BY create_at DESC LIMIT 1', [id_user]);
        if(verify_code.rows[0].code != code){
           return res.status(422).json({error: true,type : 'validation', data: 'Código de verificación incorrecto'})
        }
        const login: QueryResult = await pool.query('SELECT * FROM customer WHERE id = $1 LIMIT 1', [id_user]);
        const token = jwt.sign({id: id_user}, config.SECRET)
        return res.status(200).json({user: login.rows[0], token});
    }catch(error){
        console.log(error)
        return res.status(500).json({message : 'Error Interno', error : error});
    }
}



export const signUpAuthSocial = async (req: Request, res: Response): Promise<Response> => {
    const {name, email} =req.body;
    const singin_method = req.params.singin_method;
    try{
        const validate: QueryResult = await pool.query('SELECT * FROM customer WHERE email = $1 LIMIT 1', [email]);
        if(validate.rows.length != 0) {
            const token = jwt.sign({id: validate.rows[0].id}, config.SECRET)
            return res.json({user: validate.rows[0], token}); 
        }else{
            const user: QueryResult = await pool.query('INSERT INTO customer (name, email, photo,singin_method) VALUES ($1, $2, $3, $4) returning id,name, email, photo,singin_method', [name, email,'default.png',singin_method]);
            const token = jwt.sign({id: user.rows[0].id}, config.SECRET)
            return res.json({user: user.rows[0], token}); 
        }
    }catch(error){
        console.log(error)
        return res.status(500).json({message : 'Error Interno', error : error});
    }
}

export const signInAuthSocial = async (req: Request, res: Response): Promise<Response> => {
    const {email,name} = req.body;
    const singin_method = req.params.singin_method;
    try{
        const login: QueryResult = await pool.query('SELECT * FROM customer WHERE email = $1 LIMIT 1', [email]);
        if(login.rows.length == 0) {
            const user: QueryResult = await pool.query('INSERT INTO customer (name, email, photo,singin_method) VALUES ($1, $2, $3, $4) returning id,name, email, photo,singin_method', [name, email,'default.png',singin_method]);
            const token = jwt.sign({id: user.rows[0].id}, config.SECRET)
            return res.json({user: user.rows[0], token}); 
        }else{
            const token = jwt.sign({id: login.rows[0].id}, config.SECRET)
            return res.json({user: login.rows[0], token});
        }
    }catch(error){
        console.log(error)
        return res.status(500).json({message : 'Error Interno', error : error});
    }
}


function GetRandomNum(Min :any,Max:any){   
    var Range = Max - Min;   
    var Rand = Math.random();   
    return(Min + Math.round(Rand * Range));   
}
