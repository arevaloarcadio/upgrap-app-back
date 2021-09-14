import {Router} from 'express';
import {updateExchange, getExchangeById ,getExchangesByUser} from '../controllers/exchanges.controller';
const router = Router();

router.post('/exchanges/user/:user_id/', getExchangesByUser);
router.get('/exchanges/:product_id/:customer_id', getExchangeById);
router.put('/exchanges/:request_id/:status', updateExchange);

export default router;