import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  discontinueProduct,
  getCategories
} from '../controllers/product.controller';
import { verifyToken, verifyAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Rutas públicas (sin token)
router.get('/categories', getCategories);
router.get('/', getProducts);
router.get('/:id', getProductById);

// Rutas protegidas (solo admin)
router.post('/', verifyToken, verifyAdmin, createProduct);
router.put('/:id', verifyToken, verifyAdmin, updateProduct);
router.delete('/:id', verifyToken, verifyAdmin, discontinueProduct);

export default router;