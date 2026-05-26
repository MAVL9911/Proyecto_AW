import { Router } from 'express';
import {
  getCartItems,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../controllers/cart.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas del carrito son públicas (visitantes también pueden usar el carrito)
router.get('/', getCartItems);
router.post('/', addToCart);
router.put('/:productId', updateCartItem);
router.delete('/clear', clearCart);
router.delete('/:productId', removeFromCart);

export default router;