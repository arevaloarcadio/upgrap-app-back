import {Request, Response} from 'express';
import { QueryResult } from 'pg';
import format from 'pg-format';
import {pool} from '../database';

export const getFcmByCustomerId = async (req: Request, res: Response): Promise<Response> => {
    const customer_id = parseInt(req.params.customer_id);
    try {
      const response: QueryResult = await pool.query('SELECT customer_id, token FROM fcm WHERE customer_id = $1', [customer_id]);
      return res.json(response.rows);
    } catch (error) {
        console.log(error)
        return res.status(500).json({message : 'Error Interno', error : error});
    }
}

export const createFcm = async (req: Request, res: Response): Promise<Response> => {
    const { customer_id, token }=req.body;
    try {
      if(token == null){
         return res.status(404).json({message : 'Token no encontrado'});
      }
      const validate: QueryResult = await pool.query('SELECT customer_id, token FROM fcm WHERE customer_id = $1 and token =$2', [customer_id,token]);
      let response: QueryResult;
      if(validate.rows[0] == null){
        response = await pool.query('INSERT INTO fcm(customer_id, token)VALUES ($1,$2);', [customer_id, token]);
      }
      return res.json({message: 'Fcm created Successfully'})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message : 'Error Interno', error : error});
    }
}

export const deleteFcm = async (req: Request, res: Response): Promise<Response> => {
    const customer_id = req.params.customer_id
    const token = req.params.token 
    
    try {
      const response: QueryResult = await pool.query('DELETE FROM fcm WHERE customer_id = $1 and token = $2', [customer_id,token]);
      return res.json(`Fcm ${customer_id} delete Successsfuly`);
    }catch (error) {
      console.log(error)
      return res.status(500).json({message : 'Error Interno', error : error});
    }
}

