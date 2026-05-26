import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';

// Carrito temporal en memoria (hasta conectar MySQL)
interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const carts: { [userId: number]: CartItem[] } = {};
const guestCart: CartItem[] = []; // Carrito para visitantes

const getCart = (userId?: number): CartItem[] => {
  if (!userId) return guestCart;
  if (!carts[userId]) carts[userId] = [];
  return carts[userId];
};

// GET /api/cart - Obtener carrito
export const getCartItems = (req: AuthRequest, res: Response): void => {
  const cart = getCart(req.user?.id);
  
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.16; // IVA 16%
  const total = subtotal + tax;

  res.status(200).json({
    items: cart,
    subtotal: parseFloat(subtotal.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    total: parseFloat(total.toFixed(2))
  });
};

// POST /api/cart - Agregar producto al carrito (RF08)
export const addToCart = (req: AuthRequest, res: Response): void => {
  const { productId, name, price, quantity, image } = req.body;

  if (!productId || !name || !price || !quantity) {
    res.status(400).json({ message: 'Faltan datos del producto' });
    return;
  }

  const cart = getCart(req.user?.id);
  const existingItem = cart.find(item => item.productId === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      id: Date.now(),
      productId,
      name,
      price,
      quantity,
      image: image || ''
    });
  }

  res.status(200).json({ message: 'Producto agregado al carrito', cart });
};

// PUT /api/cart/:productId - Modificar cantidad (RF08)
export const updateCartItem = (req: AuthRequest, res: Response): void => {
  const { quantity } = req.body;
  const productId = parseInt(req.params.productId as string);

  if (!quantity || quantity < 1) {
    res.status(400).json({ message: 'Cantidad inválida' });
    return;
  }

  const cart = getCart(req.user?.id);
  const item = cart.find(i => i.productId === productId);

  if (!item) {
    res.status(404).json({ message: 'Producto no encontrado en el carrito' });
    return;
  }

  item.quantity = quantity;
  res.status(200).json({ message: 'Cantidad actualizada', cart });
};

// DELETE /api/cart/:productId - Eliminar producto del carrito (RF08)
export const removeFromCart = (req: AuthRequest, res: Response): void => {
  const productId = parseInt(req.params.productId as string);
  const cart = getCart(req.user?.id);
  const index = cart.findIndex(i => i.productId === productId);

  if (index === -1) {
    res.status(404).json({ message: 'Producto no encontrado en el carrito' });
    return;
  }

  cart.splice(index, 1);
  res.status(200).json({ message: 'Producto eliminado del carrito', cart });
};

// DELETE /api/cart - Vaciar carrito
export const clearCart = (req: AuthRequest, res: Response): void => {
  const userId = req.user?.id;
  if (userId) {
    carts[userId] = [];
  } else {
    guestCart.length = 0;
  }
  res.status(200).json({ message: 'Carrito vaciado' });
};