import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';

// Tarjetas temporales en memoria (hasta conectar MySQL)
interface Card {
  id: number;
  userId: number;
  nombreTitular: string;
  numeroEnmascarado: string;
  expiracion: string;
}

const cards: Card[] = [];
let nextId = 1;

// GET /api/cards - Obtener tarjetas del usuario
export const getCards = (req: AuthRequest, res: Response): void => {
  const userCards = cards.filter(c => c.userId === req.user!.id);
  res.status(200).json(userCards);
};

// POST /api/cards - Agregar tarjeta
export const addCard = (req: AuthRequest, res: Response): void => {
  const { nombreTitular, numero, expiracion } = req.body;

  if (!nombreTitular || !numero || !expiracion) {
    res.status(400).json({ message: 'Nombre del titular, número y expiración son requeridos' });
    return;
  }

  // Validar que el número tenga 16 dígitos
  const cleanNumber = numero.replace(/\s/g, '');
  if (!/^\d{16}$/.test(cleanNumber)) {
    res.status(400).json({ message: 'El número de tarjeta debe tener 16 dígitos' });
    return;
  }

  // Validar formato de expiración MM/YY
  if (!/^\d{2}\/\d{2}$/.test(expiracion)) {
    res.status(400).json({ message: 'El formato de expiración debe ser MM/YY' });
    return;
  }

  // Enmascarar número
  const numeroEnmascarado = `**** **** **** ${cleanNumber.slice(-4)}`;

  const newCard: Card = {
    id: nextId++,
    userId: req.user!.id,
    nombreTitular,
    numeroEnmascarado,
    expiracion
  };

  cards.push(newCard);
  res.status(201).json({ message: 'Tarjeta agregada', card: newCard });
};

// DELETE /api/cards/:id - Eliminar tarjeta
export const deleteCard = (req: AuthRequest, res: Response): void => {
  const index = cards.findIndex(c => c.id === parseInt(req.params.id as string) && c.userId === req.user!.id);

  if (index === -1) {
    res.status(404).json({ message: 'Tarjeta no encontrada' });
    return;
  }

  cards.splice(index, 1);
  res.status(200).json({ message: 'Tarjeta eliminada' });
};