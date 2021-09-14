import {Request, Response} from 'express';

export const uploadCategory = async (req: Request, res: Response): Promise<Response> => {
    console.log(`Storage location is ${req.hostname}/${req.file.path}`);
    return res.send(req.file);
}