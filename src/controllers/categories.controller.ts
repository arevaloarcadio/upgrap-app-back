import {Request, Response} from 'express';
import { QueryResult } from 'pg';
import format from 'pg-format';
import {pool} from '../database';

// get
export const getCategories = async (req: Request, res: Response): Promise<Response> => {
   try{
        const response: QueryResult = await pool.query('SELECT * FROM categories');
        return res.status(200).json(response.rows);
    }catch(error){
        console.log(error)
        return res.status(500).json({message : 'Error Interno', error : error});
    }
}

export const getCategoriesById = async (req: Request, res: Response): Promise<Response> => {
    try{
        const id = parseInt(req.params.id);
        const response: QueryResult = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
        return res.json(response.rows[0]);
    }catch(error){
        console.log(error)
        return res.status(500).json({message : 'Error Interno', error : error});
    }
}

// post 
export const createCategories = async (req: Request, res: Response): Promise<Response> => {
    const {name, namei, image, visible}=req.body;
    try{
        const response: QueryResult = await pool.query('INSERT INTO categories (name, namei, image, visible) VALUES($1, $2, $3, $4)', [name, namei, image, visible]);
        return res.json({
            message: 'User created Successfully',
            body: {
                user: {
                    name, 
                    namei, 
                    image, 
                    visible
                }
            }
        })
    }catch(error){
        console.log(error)
        return res.status(500).json({message : 'Error Interno', error : error});
    }
}

export const updateCategories = async (req: Request, res: Response): Promise<Response> => {
    const id = parseInt(req.params.id);
    const {name, namei, image, visible} = req.body;
    try{
        
        const response: QueryResult = await pool.query('UPDATE categories SET name = $1, namei = $2, image = $3, visible = $4 WHERE id = $5', [name, namei, image, visible, id]);
        return res.json(`Categoria ${id} Updated`);
    }catch(error){
        console.log(error)
        return res.status(500).json({message : 'Error Interno', error : error});
    }
}

export const deleteCategories = async (req: Request, res: Response): Promise<Response> => {
    const id = parseInt(req.params.id);
    try{
        
        const response: QueryResult = await pool.query('DELETE FROM categories WHERE id = $1', [id]);
        return res.json(`Categorias ${id} delete Successsfuly`);
    }catch(error){
        console.log(error)
        return res.status(500).json({message : 'Error Interno', error : error});
    }
}

 
export const createCustomerCategories = async (req: Request, res: Response): Promise<Response> => {
    const {customer_id, categories_ids}=req.body;
    
    try{
        
        const responses: QueryResult = await pool.query(format('SELECT * FROM categories WHERE name in(%L)',categories_ids));
        let values:any = '';
        for(var i = 0; i < responses.rows.length ; i++){
            if(i+1 == responses.rows.length){
                values += '('+customer_id+','+responses.rows[i].id+');'   
            }else{
                values += '('+customer_id+','+responses.rows[i].id+'),'
            }
        }
        const insert: QueryResult = await pool.query('INSERT INTO customer_category (customer_id, category_id) VALUES '+values);
        return  res.json({message : 'Creación de categorias exitoso'})
    }catch(error){
        console.log(error)
        return res.status(500).json({message : 'Error Interno', error : error});
    }

}


export const updateCustomerCategories = async (req: Request, res: Response): Promise<Response> => {
    const { categories_ids }=req.body;
    const customer_id  = req.params.customer_id;
    
    try{
        const responses: QueryResult = await pool.query(format('SELECT * FROM categories WHERE name in(%L)',categories_ids));
        let values:any = '';
        for(var i = 0; i < responses.rows.length ; i++){
            if(i+1 == responses.rows.length){
                values += '('+customer_id+','+responses.rows[i].id+');'   
            }else{
                values += '('+customer_id+','+responses.rows[i].id+'),'
            }
        }
        await pool.query('DELETE FROM customer_category WHERE customer_id = $1',[customer_id]);
        const insert: QueryResult = await pool.query('INSERT INTO customer_category (customer_id, category_id) VALUES '+values);
        return  res.json({message : 'Modificación de categorias exitoso'})
    }catch(error){
        console.log(error)
        return res.status(500).json({message : 'Error Interno', error : error});
    }
}

export const getCustomerCategories = async (req: Request, res: Response): Promise<Response> => {
    try {
        const user_id = parseInt(req.params.user_id);
        const response: QueryResult = await pool.query('SELECT categories.* FROM categories INNER JOIN customer_category ON customer_category.category_id = categories.id WHERE customer_category.customer_id = $1',[user_id]);
        return res.status(200).json(response.rows);
    } catch (error) {
          console.log(error)
        return res.status(500).json({message : 'Error Interno', error : error});
    }
}

export const deleteCustomerCategories = async (req: Request, res: Response): Promise<Response> => {
    const user_id = parseInt(req.params.user_id);
    const id = parseInt(req.params.id);
    try {
        const response: QueryResult = await pool.query('DELETE FROM customer_category WHERE category_id = $1 and customer_id = $2', [id,user_id]);
    return res.json(`Categorias ${id} delete Successsfuly`);
    } catch (error) {
          console.log(error)
        return res.status(500).json({message : 'Error Interno', error : error});
    }
}