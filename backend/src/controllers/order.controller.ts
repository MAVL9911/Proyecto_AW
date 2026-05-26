import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';

// Órdenes temporales en memoria (hasta conectar MySQL)
interface OrderItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  userId: number;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: Date;
}

const orders: Order[] = [];
let nextOrderId = 1;

// GET /api/orders - Obtener órdenes del usuario
export const getOrders = (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ message: 'No autenticado' });
    return;
  }

  const userOrders = orders.filter(o => o.userId === req.user!.id);
  res.status(200).json(userOrders);
};

// GET /api/orders/all - Obtener todas las órdenes (admin)
export const getAllOrders = (req: AuthRequest, res: Response): void => {
  res.status(200).json(orders);
};

// POST /api/orders - Crear orden
export const createOrder = (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ message: 'Debes iniciar sesión para realizar una compra' });
    return;
  }

  const { items, subtotal, tax, total } = req.body;

  if (!items || items.length === 0) {
    res.status(400).json({ message: 'El carrito está vacío' });
    return;
  }

  const newOrder: Order = {
    id: nextOrderId++,
    userId: req.user.id,
    items,
    subtotal,
    tax,
    total,
    status: 'pending',
    createdAt: new Date()
  };

  orders.push(newOrder);
  res.status(201).json({ message: 'Orden creada exitosamente', order: newOrder });
};

// PUT /api/orders/:id/status - Actualizar estado de orden (admin)
export const updateOrderStatus = (req: AuthRequest, res: Response): void => {
  const order = orders.find(o => o.id === parseInt(req.params.id as string));

  if (!order) {
    res.status(404).json({ message: 'Orden no encontrada' });
    return;
  }

  const { status } = req.body;
  if (!['pending', 'paid', 'cancelled'].includes(status)) {
    res.status(400).json({ message: 'Estado inválido' });
    return;
  }

  order.status = status;
  res.status(200).json({ message: 'Estado actualizado', order });
};