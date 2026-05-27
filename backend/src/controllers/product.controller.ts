import { Request, Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middlewares/auth.middleware';

// GET /api/products
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, category, sort } = req.query;

    let query = 'SELECT * FROM productos WHERE discontinued = FALSE';
    const params: any[] = [];

    if (search) {
      query += ' AND name LIKE ?';
      params.push(`%${search}%`);
    }

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (sort === 'price_asc') query += ' ORDER BY price ASC';
    else if (sort === 'price_desc') query += ' ORDER BY price DESC';
    else if (sort === 'rating') query += ' ORDER BY rating DESC';

    const [rows] = await pool.execute(query, params) as any[];
    res.status(200).json(rows);
  } catch {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// GET /api/products/categories
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.execute(
      'SELECT DISTINCT category FROM productos WHERE discontinued = FALSE'
    ) as any[];
    const categories = rows.map((r: any) => r.category);
    res.status(200).json(categories);
  } catch {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// GET /api/products/:id
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM productos WHERE id = ?',
      [req.params.id]
    ) as any[];

    if (rows.length === 0) {
      res.status(404).json({ message: 'Producto no encontrado' });
      return;
    }

    res.status(200).json(rows[0]);
  } catch {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// POST /api/products
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, price, category, stock, image } = req.body;

    if (!name || !price || !category || stock === undefined) {
      res.status(400).json({ message: 'Nombre, precio, categoría y stock son requeridos' });
      return;
    }

    const [result] = await pool.execute(
      'INSERT INTO productos (name, price, category, stock, image) VALUES (?, ?, ?, ?, ?)',
      [name, price, category, stock, image || '']
    ) as any[];

    res.status(201).json({ message: 'Producto creado exitosamente', id: result.insertId });
  } catch {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// PUT /api/products/:id
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, price, category, stock, image } = req.body;

    await pool.execute(
      'UPDATE productos SET name = ?, price = ?, category = ?, stock = ?, image = ? WHERE id = ?',
      [name, price, category, stock, image || '', req.params.id]
    );

    res.status(200).json({ message: 'Producto actualizado' });
  } catch {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// DELETE /api/products/:id
export const discontinueProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    await pool.execute(
      'UPDATE productos SET discontinued = TRUE WHERE id = ?',
      [req.params.id]
    );

    res.status(200).json({ message: 'Producto marcado como descontinuado' });
  } catch {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};