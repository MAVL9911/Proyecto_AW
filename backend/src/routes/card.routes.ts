import { Router } from 'express';
import {
  getCards,
  addCard,
  deleteCard
} from '../controllers/card.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', verifyToken, getCards);
router.post('/', verifyToken, addCard);
router.delete('/:id', verifyToken, deleteCard);

export default router;