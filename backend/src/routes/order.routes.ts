import { Router } from 'express';
import {
  getOrders,
  getAllOrders,
  createOrder,
  updateOrderStatus
} from '../controllers/order.controller';
import { verifyToken, verifyAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', verifyToken, getOrders);
router.post('/', verifyToken, createOrder);
router.get('/all', verifyToken, verifyAdmin, getAllOrders);
router.put('/:id/status', verifyToken, verifyAdmin, updateOrderStatus);

export default router;