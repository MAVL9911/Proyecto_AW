import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import pool from '../config/db';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, apellido, email, password } = req.body;

    if (!nombre || !apellido || !email || !password) {
      res.status(400).json({ message: 'Nombre, apellido, email y contraseña son requeridos' });
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      res.status(400).json({ message: 'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número' });
      return;
    }

    const [existing] = await pool.execute(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    ) as any[];

    if (existing.length > 0) {
      res.status(409).json({ message: 'El email ya está registrado' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.execute(
      'INSERT INTO usuarios (nombre, apellido, email, password) VALUES (?, ?, ?, ?)',
      [nombre, apellido, email, hashedPassword]
    );

    res.status(201).json({ message: 'Usuario registrado exitosamente' });
  } catch {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email y contraseña son requeridos' });
      return;
    }

    const [rows] = await pool.execute(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    ) as any[];

    if (rows.length === 0) {
      res.status(401).json({ message: 'Credenciales incorrectas' });
      return;
    }

    const user = rows[0];

    // Verificar bloqueo temporal
    if (user.blocked_until && new Date() < new Date(user.blocked_until)) {
      const minutesLeft = Math.ceil((new Date(user.blocked_until).getTime() - Date.now()) / 60000);
      res.status(403).json({ message: `Cuenta bloqueada temporalmente. Intenta en ${minutesLeft} minuto(s)` });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      const newAttempts = user.login_attempts + 1;
      if (newAttempts >= 5) {
        const blockedUntil = new Date(Date.now() + 15 * 60 * 1000);
        await pool.execute(
          'UPDATE usuarios SET login_attempts = 0, blocked_until = ? WHERE id = ?',
          [blockedUntil, user.id]
        );
        res.status(403).json({ message: 'Demasiados intentos fallidos. Cuenta bloqueada por 15 minutos' });
        return;
      }
      await pool.execute(
        'UPDATE usuarios SET login_attempts = ? WHERE id = ?',
        [newAttempts, user.id]
      );
      res.status(401).json({ message: `Credenciales incorrectas. Intentos fallidos: ${newAttempts}/5` });
      return;
    }

    await pool.execute(
      'UPDATE usuarios SET login_attempts = 0, blocked_until = NULL WHERE id = ?',
      [user.id]
    );

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      ENV.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login exitoso',
      token,
      user: { id: user.id, nombre: user.nombre, apellido: user.apellido, email: user.email, role: user.role }
    });
  } catch {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};