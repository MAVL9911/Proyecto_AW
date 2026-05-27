import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import pool from '../config/db';


export const getAddresses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM direcciones WHERE user_id = ?',
      [req.user!.id]
    ) as any[];
    res.status(200).json(rows);
  } catch {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const addAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { calle, ciudad, estado, codigoPostal, esPrincipal } = req.body;

    if (!calle || !ciudad || !estado || !codigoPostal) {
      res.status(400).json({ message: 'Calle, ciudad, estado y código postal son requeridos' });
      return;
    }

    if (esPrincipal) {
      await pool.execute(
        'UPDATE direcciones SET es_principal = FALSE WHERE user_id = ?',
        [req.user!.id]
      );
    }

    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM direcciones WHERE user_id = ?',
      [req.user!.id]
    ) as any[];

    const isFirst = rows[0].count === 0;

    const [result] = await pool.execute(
      'INSERT INTO direcciones (user_id, calle, ciudad, estado, codigo_postal, es_principal) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user!.id, calle, ciudad, estado, codigoPostal, esPrincipal || isFirst]
    ) as any[];

    res.status(201).json({ message: 'Dirección agregada', id: (result as any).insertId });
  } catch {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const updateAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { calle, ciudad, estado, codigoPostal, esPrincipal } = req.body;

    if (esPrincipal) {
      await pool.execute(
        'UPDATE direcciones SET es_principal = FALSE WHERE user_id = ?',
        [req.user!.id]
      );
    }

    await pool.execute(
      'UPDATE direcciones SET calle = ?, ciudad = ?, estado = ?, codigo_postal = ?, es_principal = ? WHERE id = ? AND user_id = ?',
      [calle, ciudad, estado, codigoPostal, esPrincipal || false, req.params.id, req.user!.id]
    );

    res.status(200).json({ message: 'Dirección actualizada' });
  } catch {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const deleteAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await pool.execute(
      'DELETE FROM direcciones WHERE id = ? AND user_id = ?',
      [req.params.id, req.user!.id]
    );
    res.status(200).json({ message: 'Dirección eliminada' });
  } catch {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};