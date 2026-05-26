import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';

// Base de datos temporal en memoria (hasta conectar MySQL)
const users: {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  loginAttempts: number;
  blockedUntil: Date | null;
}[] = [];
let nextId = 1;

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, apellido, email, password } = req.body;

    // Validar campos obligatorios
    if (!nombre || !apellido || !email || !password) {
      res.status(400).json({ message: 'Nombre, apellido, email y contraseña son requeridos' });
      return;
    }

    // Validar formato de contraseña (RNF08)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      res.status(400).json({ message: 'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número' });
      return;
    }

    // Verificar si el usuario ya existe
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      res.status(409).json({ message: 'El email ya está registrado' });
      return;
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const newUser = {
      id: nextId++,
      nombre,
      apellido,
      email,
      password: hashedPassword,
      role: 'user' as const,
      loginAttempts: 0,
      blockedUntil: null
    };
    users.push(newUser);

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

    // Buscar usuario
    const user = users.find(u => u.email === email);
    if (!user) {
      res.status(401).json({ message: 'Credenciales incorrectas' });
      return;
    }

    // Verificar bloqueo temporal (RNF03)
    if (user.blockedUntil && new Date() < user.blockedUntil) {
      const minutesLeft = Math.ceil((user.blockedUntil.getTime() - Date.now()) / 60000);
      res.status(403).json({ message: `Cuenta bloqueada temporalmente. Intenta en ${minutesLeft} minuto(s)` });
      return;
    }

    // Verificar contraseña
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= 5) {
        user.blockedUntil = new Date(Date.now() + 15 * 60 * 1000);
        user.loginAttempts = 0;
        res.status(403).json({ message: 'Demasiados intentos fallidos. Cuenta bloqueada por 15 minutos' });
        return;
      }
      res.status(401).json({ message: `Credenciales incorrectas. Intentos fallidos: ${user.loginAttempts}/5` });
      return;
    }

    // Reset intentos fallidos
    user.loginAttempts = 0;
    user.blockedUntil = null;

    // Generar token JWT
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