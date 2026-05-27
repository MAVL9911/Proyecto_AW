import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import pool from '../config/db';

export const getCards = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM tarjetas WHERE user_id = ?',
      [req.user!.id]
    ) as any[];
    res.status(200).json(rows);
  } catch {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const addCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { nombreTitular, numero, expiracion, cvv } = req.body;

    if (!nombreTitular || !numero || !expiracion || !cvv) {
      res.status(400).json({ message: 'Nombre del titular, número, expiración y CVV son requeridos' });
      return;
    }

    const cleanNumber = numero.replace(/\s/g, '');
    if (!/^\d{16}$/.test(cleanNumber)) {
      res.status(400).json({ message: 'El número de tarjeta debe tener 16 dígitos' });
      return;
    }

    if (!/^\d{2}\/\d{2}$/.test(expiracion)) {
      res.status(400).json({ message: 'El formato de expiración debe ser MM/YY' });
      return;
    }

    if (!/^\d{3,4}$/.test(cvv)) {
      res.status(400).json({ message: 'El CVV debe tener 3 o 4 dígitos' });
      return;
    }

    const numeroEnmascarado = `**** **** **** ${cleanNumber.slice(-4)}`;

    const [result] = await pool.execute(
      'INSERT INTO tarjetas (user_id, nombre_titular, numero_enmascarado, expiracion) VALUES (?, ?, ?, ?)',
      [req.user!.id, nombreTitular, numeroEnmascarado, expiracion]
    ) as any[];

    res.status(201).json({ message: 'Tarjeta agregada', id: (result as any).insertId });
  } catch {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const deleteCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await pool.execute(
      'DELETE FROM tarjetas WHERE id = ? AND user_id = ?',
      [req.params.id, req.user!.id]
    );
    res.status(200).json({ message: 'Tarjeta eliminada' });
  } catch {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};