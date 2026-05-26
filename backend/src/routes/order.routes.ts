import { Router } from 'express';
import {
  getOrders,
  getAllOrders,
  createOrder,
  updateOrderStatus
} from '../controllers/order.controller';
import { verifyToken, verifyAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Rutas de usuario (requieren login)
router.get('/', verifyToken, getOrders);
router.post('/', verifyToken, createOrder);

// Rutas de admin
router.get('/all', verifyToken, verifyAdmin, getAllOrders);
router.put('/:id/status', verifyToken, verifyAdmin, updateOrderStatus);

export default router;