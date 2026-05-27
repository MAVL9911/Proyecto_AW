import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import pool from '../config/db';

export const getOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [orders] = await pool.execute(
      'SELECT * FROM ordenes WHERE user_id = ? ORDER BY created_at DESC',
      [req.user!.id]
    ) as any[];

    for (const order of orders) {
      const [items] = await pool.execute(
        'SELECT * FROM orden_items WHERE orden_id = ?',
        [order.id]
      ) as any[];
      order.items = items;

      const [direccion] = await pool.execute(
        'SELECT * FROM direcciones WHERE id = ?',
        [order.direccion_id]
      ) as any[];
      order.direccion = direccion[0] || null;
    }

    res.status(200).json(orders);
  } catch {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const getAllOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [orders] = await pool.execute(
      'SELECT o.*, u.nombre, u.apellido, u.email FROM ordenes o JOIN usuarios u ON o.user_id = u.id ORDER BY o.created_at DESC'
    ) as any[];

    for (const order of orders) {
      const [items] = await pool.execute(
        'SELECT * FROM orden_items WHERE orden_id = ?',
        [order.id]
      ) as any[];
      order.items = items;
    }

    res.status(200).json(orders);
  } catch {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Debes iniciar sesión para realizar una compra' });
      return;
    }

    const { items, subtotal, tax, total, addressId, cardId } = req.body;

    if (!items || items.length === 0) {
      res.status(400).json({ message: 'El carrito está vacío' });
      return;
    }

    if (!addressId || !cardId) {
      res.status(400).json({ message: 'Debes seleccionar una dirección y método de pago' });
      return;
    }

    const [result] = await pool.execute(
      'INSERT INTO ordenes (user_id, direccion_id, tarjeta_id, subtotal, tax, total) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, addressId, cardId, subtotal, tax, total]
    ) as any[];

    const orderId = result.insertId;

    for (const item of items) {
      await pool.execute(
        'INSERT INTO orden_items (orden_id, product_id, name, price, quantity) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.productId, item.name, item.price, item.quantity]
      );

      await pool.execute(
        'UPDATE productos SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.productId]
      );
    }

    res.status(201).json({ message: 'Orden creada exitosamente', orderId });
  } catch {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;

    if (!['pending', 'paid', 'cancelled'].includes(status)) {
      res.status(400).json({ message: 'Estado inválido' });
      return;
    }

    await pool.execute(
      'UPDATE ordenes SET status = ? WHERE id = ?',
      [status, req.params.id]
    );

    res.status(200).json({ message: 'Estado actualizado' });
  } catch {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};