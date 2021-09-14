import {Request, Response} from 'express';
import { QueryResult } from 'pg';
import format from 'pg-format';
import {pool} from '../database';
import jwt from 'jsonwebtoken';
import uuid from 'uuid-random';
// get
export const getNotification = async (req: Request, res: Response): Promise<Response> => {
    try {
        const response: QueryResult = await pool.query('SELECT * FROM notifications');
        return res.status(200).json(response.rows);
    }catch (error) {
      console.log(error)
      return res.status(500).json({message : 'Error Interno', error : error});
    }
}

export const getNotificationById = async (req: Request, res: Response): Promise<Response> => {
    const user_id = parseInt(req.params.user_id);
    try {
        const response: QueryResult = await pool.query('SELECT notifications.* FROM notifications  WHERE notifiable_id = $1 ORDER BY created_at DESC', [user_id]);
        return res.json(response.rows);
    }catch (error) {
      console.log(error)
      return res.status(500).json({message : 'Error Interno', error : error});
    }
}

export const createNotification = async (req: Request, res: Response): Promise<Response> => {
    const {notifiable_id, data, type, product_id}=req.body;
    try {
        const response: QueryResult = await pool.query('INSERT INTO notifications( notifiable_id, data, type, product_id, read_at, created_at)VALUES (?, ?, ?, ?, ?, ?);', [notifiable_id, data, type, product_id]);
        return res.json({
            message: 'Notification created Successfully',
        })
    }catch (error) {
      console.log(error)
      return res.status(500).json({message : 'Error Interno', error : error});
    }
}

export const updateNotification = async (req: Request, res: Response): Promise<Response> => {
    const id = parseInt(req.params.id);
    const {notifiable_id, data, type, product_id} = req.body;
    try {
        const response: QueryResult = await pool.query('UPDATE notificationsSET id=?, notifiable_id=?, data=?, type=?, product_id=? WHERE <condition>;', [ notifiable_id, data, type, product_id,id]);
        return res.json(`Notification ${id} Updated`);
    }catch (error) {
      console.log(error)
      return res.status(500).json({message : 'Error Interno', error : error});
    }
}

export const deleteNotification = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params.id 
    try {
        const response: QueryResult = await pool.query('DELETE FROM notifications WHERE id = $1', [id]);
        return res.json(`Notification ${id} delete Successsfuly`);
    }catch (error) {
      console.log(error)
      return res.status(500).json({message : 'Error Interno', error : error});
    }
}

