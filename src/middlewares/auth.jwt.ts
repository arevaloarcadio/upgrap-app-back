import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import config from '../utils/config';

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers["x-access-token"];

    console.log(token);
    if(!token) return res.status(403).json({message: 'Prohibido'});
    // const decoded = await jwt.verify(token, config.SECRET);
    // req.userId = decoded.id;
    // console.log(decoded)
    next();
}