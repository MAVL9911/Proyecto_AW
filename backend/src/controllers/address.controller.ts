import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';

// Direcciones temporales en memoria (hasta conectar MySQL)
interface Address {
  id: number;
  userId: number;
  calle: string;
  ciudad: string;
  estado: string;
  codigoPostal: string;
  esPrincipal: boolean;
}

const addresses: Address[] = [];
let nextId = 1;

// GET /api/addresses - Obtener direcciones del usuario
export const getAddresses = (req: AuthRequest, res: Response): void => {
  const userAddresses = addresses.filter(a => a.userId === req.user!.id);
  res.status(200).json(userAddresses);
};

// POST /api/addresses - Agregar dirección
export const addAddress = (req: AuthRequest, res: Response): void => {
  const { calle, ciudad, estado, codigoPostal, esPrincipal } = req.body;

  if (!calle || !ciudad || !estado || !codigoPostal) {
    res.status(400).json({ message: 'Calle, ciudad, estado y código postal son requeridos' });
    return;
  }

  // Si es principal, quitar principal de las demás
  if (esPrincipal) {
    addresses.forEach(a => {
      if (a.userId === req.user!.id) a.esPrincipal = false;
    });
  }

  const newAddress: Address = {
    id: nextId++,
    userId: req.user!.id,
    calle,
    ciudad,
    estado,
    codigoPostal,
    esPrincipal: esPrincipal || addresses.filter(a => a.userId === req.user!.id).length === 0
  };

  addresses.push(newAddress);
  res.status(201).json({ message: 'Dirección agregada', address: newAddress });
};

// PUT /api/addresses/:id - Editar dirección
export const updateAddress = (req: AuthRequest, res: Response): void => {
  const address = addresses.find(a => a.id === parseInt(req.params.id as string) && a.userId === req.user!.id);

  if (!address) {
    res.status(404).json({ message: 'Dirección no encontrada' });
    return;
  }

  if (req.body.esPrincipal) {
    addresses.forEach(a => {
      if (a.userId === req.user!.id) a.esPrincipal = false;
    });
  }

  Object.assign(address, req.body);
  res.status(200).json({ message: 'Dirección actualizada', address });
};

// DELETE /api/addresses/:id - Eliminar dirección
export const deleteAddress = (req: AuthRequest, res: Response): void => {
  const index = addresses.findIndex(a => a.id === parseInt(req.params.id as string) && a.userId === req.user!.id);

  if (index === -1) {
    res.status(404).json({ message: 'Dirección no encontrada' });
    return;
  }

  addresses.splice(index, 1);
  res.status(200).json({ message: 'Dirección eliminada' });
};