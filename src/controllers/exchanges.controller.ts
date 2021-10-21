import {Request, Response} from 'express';
import { QueryResult } from 'pg';
import {pool} from '../database';
import format from 'pg-format';
import uuid from 'uuid-random';
import {Socket} from 'socket.io'

export const getExchangeById = async (req: Request, res: Response): Promise<Response> => {
    const product_id = parseInt(req.params.id);
    const customer_id = parseInt(req.params.customer_id);
    try {
         const response: QueryResult = await pool.query('SELECT * FROM exchanges WHERE product_id = $1 and customer_id = $2', [product_id,customer_id]);
        return res.json(response.rows[0]);
    } catch (error) {
        console.log(error)
        return res.status(500).json({message : 'Error Interno', error : error});
    }
}

export const getExchangesByUser = async (req: Request, res: Response): Promise<Response> => {
    const user_id = parseInt(req.params.user_id);
    const {filters} = req.body;
    try {
        let response: QueryResult;
        if(filters.length  == 0) {
            response = await pool.query('SELECT * FROM exchanges INNER JOIN products ON products.id = exchanges.product_id WHERE customer_id = $1', [user_id]);
        }else{
            response = await pool.query(format('SELECT * FROM exchanges INNER JOIN products ON products.id = exchanges.product_id WHERE  exchanges.status IN (%L) and exchanges.customer_id = %L',filters ,user_id));
        }
        return res.json(response.rows);
    } catch (error) {
        console.log(error)
        return res.status(500).json({message : 'Error Interno', error : error});
    }
}

export const updateExchange = async (req: Request, res: Response): Promise<Response> => {
    const request_id = parseInt(req.params.request_id);
    const status = req.params.status;
    const {user_id} = req.body
    
    try {
        const requests: QueryResult = await pool.query('SELECT * FROM requests WHERE id = $1 LIMIT 1', [request_id]);
    
        if(requests.rows.length == 0) return res.status(404).json(`Request not found`)
        
        const request = requests.rows[0]
        const response: QueryResult = await pool.query('UPDATE exchanges SET status=$1 WHERE product_id = $2 and customer_id = $3', [status,request.product_customer_id,request.id_user]);
        
        let messages : QueryResult;

        if(status == 'Aceptada') {
            await pool.query('INSERT INTO exchanges(customer_id, product_id, status) VALUES ( $1, $2, $3)', [user_id,request.product_user_id,status]);
            messages = await pool.query('INSERT INTO messages(id_sender, id_receiver, message, fecha, issee, is_file, type,id_request)VALUES ($1, $2, $3, now(), false, false, $4,$5) returning id,id_sender, id_receiver, message, fecha, issee, is_file, type,id_request', [user_id,request.id_user,'Ha aceptado el cambio','accepted',request_id]);
        }else{
            messages = await pool.query('INSERT INTO messages(id_sender, id_receiver, message, fecha, issee, is_file, type,id_request)VALUES ($1, $2, $3, now(), false, false, $4,$5) returning id,id_sender, id_receiver, message, fecha, issee, is_file, type,id_request', [user_id,request.id_user,'Ha rechazado el cambio','rejeted',request_id]);
        }

        const update : QueryResult = await pool.query('UPDATE chat_list_mobile SET product_accepted_rejeted = true WHERE id_request = $1',[request_id]);
        
        const product : QueryResult = await pool.query('SELECT photo FROM products WHERE id = $1 LIMIT 1',[request.product_customer_id]);
        const photo = product.rows[0].photo;
        
        const insert_notification: QueryResult = await pool.query('INSERT INTO notifications(id,notifiable_id, data, type, request_id,photo,created_at) VALUES ($1, $2, $3, $4,$5,$6, now()) returning  id,notifiable_id, data, type, request_id,photo,created_at',[uuid(),request.id_user, 'Tu intercambio ha sido '+status.toLowerCase(),status.toLowerCase()  == 'aceptada' ? 'request.accepted' :  'request.rejected',request_id,photo]);
        
        const io: Socket = req.app.locals.io;
        io.emit('notification',insert_notification.rows[0])
        
        return res.status(200).json({message : `Exchange Updated` , data : messages.rows[0]});
    } catch (error) {
        console.log(error)
        return res.status(500).json({message : 'Error Interno', error : error});
    }
}

