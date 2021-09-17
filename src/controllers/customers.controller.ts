import {Request, Response} from 'express';
import { QueryResult } from 'pg';
import {pool} from '../database';


export const getCustomerById = async (req: Request, res: Response): Promise<Response> => {
    const id = parseInt(req.params.id);
    try {
        const response: QueryResult = await pool.query('SELECT * FROM customer WHERE id = $1', [id]);
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
    const {name, city, dir,pais,phone} = req.body;
    try {
        if (upload){
            const update: QueryResult = await pool.query('UPDATE customer SET name = $1, city = $2,dir = $3,pais = $4,phone = $5, photo = $6 WHERE id = $7', [name, city, dir,pais,phone,req?.file?.filename,id]);
        }else{
            const update: QueryResult = await pool.query('UPDATE customer SET name = $1, city = $2,dir = $3,pais = $4,phone = $5 WHERE id = $6', [name, city, dir,pais,phone,id]);
        }
        const response: QueryResult = await pool.query('SELECT name, email, city, dir, pais, phone, validate_phone, migrate_key, prefix, userid, singin_method, rol,photo ,id FROM customer WHERE id = $1', [id]);
        return res.json({message : `Customer ${id} Updated` , customer : response.rows[0]} );
    } catch (error) {
        console.log(error)
        return res.status(500).json({message : 'Error Interno', error : error});
    }
}
