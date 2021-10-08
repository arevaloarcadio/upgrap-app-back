import {Request, Response} from 'express';
import { QueryResult } from 'pg';
import {pool} from '../database';
import { comparePassword, encriptPassword } from '../utils/auth';

export const getCustomerById = async (req: Request, res: Response): Promise<Response> => {
    const id = parseInt(req.params.id);
    try {
        const response: QueryResult = await pool.query('SELECT * FROM customer WHERE id = $1', [id]);
        delete response.rows[0].password
        return res.json(response.rows[0]);
    } catch (error) {
        console.log(error)
        return res.status(500).json({message : 'Error Interno', error : error});
    }
}

export const updateCustomer = async (req: Request, res: Response): Promise<Response> => {
    const id = parseInt(req.params.id);
    const {name, email} = req.body;
	try {
        const response: QueryResult = await pool.query('UPDATE customer SET name = $1, email = $2 WHERE id = $3', [name, email, id]);
        return res.json(`Customer ${id} Updated`);
    } catch (error) {
        console.log(error)
        return res.status(500).json({message : 'Error Interno', error : error});
    }
}

export const updateCustomerMobile = async (req: Request, res: Response): Promise<Response> => {
    const id = parseInt(req.params.id);
    const upload = req.file === undefined ? false : true;
    const {name, city, dir,pais,phone,email,password,complete,checked_} = req.body;
    let checked = JSON.parse(checked_)
    try {
        let lower_email : string = email.toLocaleLowerCase()
    
        if(complete == 'true'){
            const validate: QueryResult = await pool.query('SELECT * FROM customer WHERE email = $1 LIMIT 1', [lower_email]);
            if(validate.rows.length != 0) return res.status(422).json({error: true,type : 'validation', data: 'Ya existe una cuenta con ese correo'})
            
        }
        console.log(checked)
        if(password != ''){
            const pass = await encriptPassword(password);
            await pool.query('UPDATE customer SET password = $1 WHERE id = $2', [pass,id]);
        }else{
            if(complete == 'true'){
                return res.status(422).json({error: true,type : 'validation', data: 'La constraseña es requerida'})
            }
        }

        if (upload){
            const update: QueryResult = await pool.query('UPDATE customer SET name = $1, city = $2,dir = $3,pais = $4,phone = $5, photo = $6,email = $7 WHERE id = $8', [name, city, dir,pais,phone,req?.file?.filename,lower_email,id]);
        }else{
            const update: QueryResult = await pool.query('UPDATE customer SET name = $1, city = $2,dir = $3,pais = $4,phone = $5,email = $6 WHERE id = $7', [name, city, dir,pais,phone,lower_email,id]);
        }

        const customer_setting : QueryResult = await pool.query('SELECT id FROM customer_setting WHERE user_id = $1', [id]);
       
        if (customer_setting.rows.length == 0){
            pool.query('INSERT INTO customer_setting(show_name, show_city, show_dir, show_pais, show_phone, show_email, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7)', [checked.show_name, checked.show_city, checked.show_dir, checked.show_pais, checked.show_phone, checked.show_email, id]);
        }else{
            pool.query('UPDATE customer_setting SET show_name=$1, show_city=$2, show_dir=$3, show_pais=$4, show_phone=$5,  show_email=$6 WHERE user_id = $7;', [checked.show_name, checked.show_city, checked.show_dir, checked.show_pais, checked.show_phone, checked.show_email, id]);
        }

        const response: QueryResult = await pool.query('SELECT name, email, city, dir, pais, phone, validate_phone, migrate_key, prefix, userid, singin_method, rol,photo ,id FROM customer WHERE id = $1', [id]);
        return res.json({message : `Customer ${id} Updated` , customer : response.rows[0]} );
    } catch (error) {
        console.log(error)
        return res.status(500).json({message : 'Error Interno', error : error});
    }
}


export const getCustomerSetting = async (req: Request, res: Response): Promise<Response> => {
    const id = parseInt(req.params.id);
    try {
        const customer_setting : QueryResult = await pool.query('SELECT * FROM customer_setting WHERE user_id = $1', [id]);
        return res.json(customer_setting.rows[0]);
    } catch (error) {
        console.log(error)
        return res.status(500).json({message : 'Error Interno', error : error});
    }
}

