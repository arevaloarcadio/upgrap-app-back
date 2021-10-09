import {Request, Response} from 'express';
import { QueryResult } from 'pg';
import {pool} from '../database';
import jwt from 'jsonwebtoken';
import format from 'pg-format';
import jimp from 'jimp'
// get
export const getProducts = async (req: Request, res: Response): Promise<Response> => {
    try {
        const limit = req.params.limit
        const offset = req.params.offset
        const user_id = req.params.user_id
        let { filter } = req.body
        let products = null
        if(filter == null){
           
            const categories : QueryResult  = await pool.query('SELECT category_id FROM customer_category WHERE customer_id =  $1',[user_id]);
          
            if(categories.rows.length  == 0){
                products = await pool.query('SELECT products.*,cast(fecha as timestamp) as created_at FROM products INNER JOIN categories ON  categories.id =  products.category WHERE products.id > 733  ORDER BY products.id DESC LIMIT $1 OFFSET $2',[limit,offset]);
            }else{
                let categories_ids = []

                for(i= 0; i < categories.rows.length ; i++){
                    categories_ids.push(categories.rows[i].category_id)
                }

                let sql = format('SELECT DISTINCT * FROM ((SELECT products.*,cast(fecha as timestamp) as created_at '+ 
                                    'FROM products ' +
                                    'INNER JOIN categories ON  categories.id =  products.category ' +
                                    'WHERE products.id > 733  and category in(%L) ' +
                                    'ORDER BY products.id DESC ' +
                                    'LIMIT %L OFFSET %L) '+

                                    'UNION ALL '+

                                    '(SELECT products.*,cast(fecha as timestamp) as created_at ' +
                                    'FROM products '+
                                    'INNER JOIN categories ON  categories.id =  products.category ' +
                                    'WHERE products.id > 733 ' +
                                    'ORDER BY products.id DESC '+ 
                                    'LIMIT %L OFFSET %L)' +
                                    ') as products_by_user',
                                categories_ids,limit,offset,limit,offset)
            
                products = await pool.query(sql);
            }
        }else{
            products = await pool.query('SELECT products.*,cast(fecha as timestamp) as created_at FROM products INNER JOIN categories ON  categories.id =  products.category WHERE products.id > 733  and categories.name = $1 ORDER BY products.id DESC LIMIT $2 OFFSET $3',[filter,limit,offset]);
        }
        
        let response:any[]= []
        for(var i = 0; i < products.rows.length; i++){
            const requests : QueryResult = await pool.query('SELECT count(*) as requests FROM requests WHERE product_customer_id = $1;',[products.rows[i].id]);
            response.push({... products.rows[i], requests : requests.rows[0].requests })
        }
        return res.status(200).json(response);
    } catch (error) {
      console.log(error)
      return res.status(500).json({message : 'Error Interno', error : error});
    }
    
}

export const getProductsInvite = async (req: Request, res: Response): Promise<Response> => {
    try {

        const limit = req.params.limit
        const offset = req.params.offset
        let { filter } = req.body
        let products = null
        if(filter == null){
           
           let sql = format('SELECT products.*,cast(fecha as timestamp) as created_at ' +
                                'FROM products '+
                                'INNER JOIN categories ON  categories.id =  products.category ' +
                                'WHERE products.id > 733 ' +
                                'ORDER BY products.id DESC '+ 
                                'LIMIT %L OFFSET %L'
                            ,limit,offset)
        
            products = await pool.query(sql);
            
        }else{
            products = await pool.query('SELECT products.*,cast(fecha as timestamp) as created_at FROM products INNER JOIN categories ON  categories.id =  products.category WHERE products.id > 733  and categories.name = $1 ORDER BY products.id DESC LIMIT $2 OFFSET $3',[filter,limit,offset]);
        }
        
        let response:any[]= []
        for(var i = 0; i < products.rows.length; i++){
            const requests : QueryResult = await pool.query('SELECT count(*) as requests FROM requests WHERE product_customer_id = $1;',[products.rows[i].id]);
            response.push({... products.rows[i], requests : requests.rows[0].requests })
        }

        return res.status(200).json(response);
    } catch (error) {
      console.log(error)
      return res.status(500).json({message : 'Error Interno', error : error});
    }
    
}

export const getProductsFilter = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { filter } = req.body
        
        const products: QueryResult = await pool.query("SELECT products.*, categories.name as category_name FROM products INNER JOIN categories ON categories.id = products.category WHERE (products.name like $1 OR categories.name like $1)",['%'+filter+'%']);
        let response:any[]= []
        
        for(var i = 0; i < products.rows.length; i++){
            const requests : QueryResult = await pool.query('SELECT count(*) as requests FROM requests WHERE product_customer_id = $1;',[products.rows[i].id]);
            response.push({... products.rows[i], requests : requests.rows[0].requests })
        }
        return res.status(200).json(response);
    } catch (error) {
      console.log(error)
      return res.status(500).json({message : 'Error Interno', error : error});
    }
}

export const getProductsByUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        const user_id = parseInt(req.params.user_id);
        const response: QueryResult = await pool.query('SELECT * FROM products WHERE id_user = $1',[user_id]);
        return res.status(200).json(response.rows);
    } catch (error) {
      console.log(error)
      return res.status(500).json({message : 'Error Interno', error : error});
    }
}

export const getCountProducts = async (req: Request, res: Response): Promise<Response> => {
    try {
        const response: QueryResult = await pool.query('SELECT count(id) FROM products');
        return res.status(200).json(response.rows[0]);
    } catch (error) {
      console.log(error)
      return res.status(500).json({message : 'Error Interno', error : error});
    }
}

export const getProductsByCategory = async (req: Request, res: Response): Promise<Response> => {
    try {
        const category_id = parseInt(req.params.category_id);
        console.log(category_id)
        const products: QueryResult = await pool.query('SELECT products.*,cast(fecha as timestamp) FROM products INNER JOIN categories ON categories.id = products.category WHERE categories.id = $1 and products.id > 733 ORDER BY random() LIMIT 4 ',[category_id]);
        let response:any[]= []
        
        for(var i = 0; i < products.rows.length; i++){
            const requests : QueryResult = await pool.query('SELECT count(*) as requests FROM requests WHERE product_customer_id = $1;',[products.rows[i].id]);
            response.push({... products.rows[i], requests : requests.rows[0].requests })
        }
        return res.status(200).json(response);
    }catch (error) {
      console.log(error)
      return res.status(500).json({message : 'Error Interno', error : error});
    }
}

export const getProductsById = async (req: Request, res: Response): Promise<Response> => {
    const id = parseInt(req.params.id);
    try {
        const response: QueryResult = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
        return res.json(response.rows[0]);
    }catch (error) {
        console.log(error)
        return res.status(500).json({message : 'Error Interno', error : error});
    }
}

// post 
export const createProducts = async (req: Request, res: Response): Promise<Response> => {
    
    const {address,category_id,to_change,city,descripcion,estado,user_id,nombre,country,show_direction}=req.body;
    try {
           
        /*  jimp.read('./uploads/'+req?.file?.filename).then(info => {
            info.resize(512, jimp.AUTO,jimp.RESIZE_BEZIER)
            .write('./uploads/'+req?.file?.filename)
            
        })
        .catch(err => {
            res.status(500).json({message : 'Error Interno', error : err})
        })*/

        const response: QueryResult = await pool.query('INSERT INTO products (address, category, change, city, description, estado, fecha, id_user, name, pais,photo,show_direction) VALUES($1, $2, $3, $4,$5, $6, now(), $7,$8,$9,$10,$11)', [address,category_id,to_change,city,descripcion,estado,user_id,nombre,country,req?.file?.filename,show_direction]);
        return res.status(200).json({
            message: 'User created Successfully',
            body: {
                product: {
                   address,category_id,to_change,city,descripcion,estado,user_id,nombre,country, file : req?.file?.filename,show_direction
                }
            }
        })
    }catch (error) {
        console.log(error)
        return res.status(500).json({message : 'Error Interno', error : error});
    }
}

export const getProductsSaved = async (req: Request, res: Response): Promise<Response> => {
    try {
        const user_id = parseInt(req.params.user_id);
        const products: QueryResult = await pool.query('SELECT products.* FROM products INNER JOIN saved_posts ON saved_posts.product_id = products.id WHERE saved_posts.user_id = $1',[user_id]);
        let response:any[]= []
        
        for(var i = 0; i < products.rows.length; i++){
            const requests : QueryResult = await pool.query('SELECT count(*) as requests FROM requests WHERE product_customer_id = $1;',[products.rows[i].id]);
            response.push({... products.rows[i], requests : requests.rows[0].requests })
        }
        
        return res.status(200).json(response);
    }catch (error) {
        console.log(error)
        return res.status(500).json({message : 'Error Interno', error : error});
    }
}

export const getProductsSavedById = async (req: Request, res: Response): Promise<Response> => {
    const user_id = parseInt(req.params.user_id);
    const product_id = parseInt(req.params.product_id);
    try {
        const response: QueryResult = await pool.query('SELECT true as saved FROM products INNER JOIN saved_posts ON saved_posts.product_id = products.id WHERE saved_posts.user_id = $1 and saved_posts.product_id = $2', [user_id,product_id]);
        return res.json(response.rows[0]);
    }catch (error) {
        console.log(error)
        return res.status(500).json({message : 'Error Interno', error : error});
    }
}

export const createProductsSavePosts = async (req: Request, res: Response): Promise<Response> => {
    const {user_id,product_id}=req.body;
    try {
        const response: QueryResult = await pool.query('INSERT INTO saved_posts(user_id,product_id) VALUES ($1, $2)', [user_id,product_id]);
        return res.status(200).json({
            message: 'Product saved Successfully',
        })
    }catch (error) {
        console.log(error)
        return res.status(500).json({message : 'Error Interno', error : error});
    }
}

export const updateProducts = async (req: Request, res: Response): Promise<Response> => {
    const id = parseInt(req.params.id);
    const {address,category_id,to_change,city,descripcion,estado,user_id,nombre,country,show_direction}=req.body;
    try {
        if(req.file !== undefined){
            const filename = req.file.filename
            const response: QueryResult = await pool.query('UPDATE products SET address=$1, category=$2, change=$3, city=$4, description=$5, estado=$6, id_user=$7, name=$8, pais=$9, photo=$10 ,show_direction=$11 WHERE id = $12;', [address,category_id,to_change,city,descripcion,estado,user_id,nombre,country,filename,show_direction,id]);
        }else{
            const response: QueryResult = await pool.query('UPDATE products SET address=$1, category=$2, change=$3, city=$4, description=$5, estado=$6, id_user=$7, name=$8, pais=$9,show_direction=$10 WHERE id = $11;', [address,category_id,to_change,city,descripcion,estado,user_id,nombre,country,show_direction,id]);
        }
    return res.json(`Categoria ${id} Updated`);
    }catch (error) {
        console.log(error)
        return res.status(500).json({message : 'Error Interno', error : error});
    }
}

export const deleteProducts = async (req: Request, res: Response): Promise<Response> => {
    const id = parseInt(req.params.id);
    try {
        const response: QueryResult = await pool.query('DELETE FROM products WHERE id = $1', [id]);
        return res.json(`Productos ${id} delete Successsfuly`);
    }catch (error) {
        console.log(error)
        return res.status(500).json({message : 'Error Interno', error : error});
    }
}

export const deleteProductsSaved = async (req: Request, res: Response): Promise<Response> => {
    const product_id = parseInt(req.params.product_id);
    const user_id = parseInt(req.params.user_id);
    try {
        const response: QueryResult = await pool.query('DELETE FROM saved_posts WHERE user_id = $1 and product_id = $2', [user_id,product_id]);
        return res.json(`Productos ${product_id} delete Successsfuly`);
    }catch (error) {
        console.log(error)
        return res.status(500).json({message : 'Error Interno', error : error});
    }
}



