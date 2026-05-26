export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  image: string;
  discontinued: boolean;
  rating: number;
}

export interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
}

export interface User {
  id: number;
  email: string;
  role: 'user' | 'admin';
}

export interface Order {
  id: number;
  userId: number;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}