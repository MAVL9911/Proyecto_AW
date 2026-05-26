import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Cart, CartItem } from '../types';
import api from '../services/api';

interface CartContextType {
  cart: Cart;
  addToCart: (item: Omit<CartItem, 'id'>) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
}

const emptyCart: Cart = { items: [], subtotal: 0, tax: 0, total: 0 };

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Cart>(emptyCart);

  const fetchCart = async () => {
    const res = await api.get('/cart');
    setCart(res.data);
  };

  const addToCart = async (item: Omit<CartItem, 'id'>) => {
    await api.post('/cart', item);
    await fetchCart();
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    await api.put(`/cart/${productId}`, { quantity });
    await fetchCart();
  };

  const removeFromCart = async (productId: number) => {
    await api.delete(`/cart/${productId}`);
    await fetchCart();
  };

  const clearCart = async () => {
    await api.delete('/cart/clear');
    setCart(emptyCart);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart debe usarse dentro de CartProvider');
  return context;
};