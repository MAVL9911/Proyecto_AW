import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, fetchCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Carrito de compras</h1>

        {cart.items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🛒</p>
            <p className="text-xl text-gray-500 mb-6">Tu carrito está vacío</p>
            <Link
              to="/catalog"
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-full transition font-medium"
            >
              Ver productos
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Lista de productos */}
            <div className="flex-1 flex flex-col gap-4">
              {cart.items.map(item => (
                <div key={item.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
                  {/* Imagen */}
                  <div className="bg-gray-100 rounded-lg h-20 w-20 flex items-center justify-center shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover rounded-lg" />
                    ) : (
                      <span className="text-3xl">📦</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                    <p className="text-blue-600 font-bold">${item.price.toLocaleString('es-MX')}</p>
                  </div>

                  {/* Cantidad */}
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50 transition"
                    >-</button>
                    <span className="px-3 py-1 font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="px-3 py-1 hover:bg-gray-100 transition"
                    >+</button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right min-w-24">
                    <p className="font-bold text-gray-800">
                      ${(item.price * item.quantity).toLocaleString('es-MX')}
                    </p>
                  </div>

                  {/* Eliminar */}
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="text-red-400 hover:text-red-600 transition text-xl"
                  >✕</button>
                </div>
              ))}
            </div>

            {/* Resumen */}
            <div className="lg:w-80">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Resumen</h2>
                <div className="flex flex-col gap-3 text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${cart.subtotal.toLocaleString('es-MX')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IVA (16%)</span>
                    <span>${cart.tax.toLocaleString('es-MX')}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-bold text-gray-800 text-lg">
                    <span>Total</span>
                    <span>${cart.total.toLocaleString('es-MX')}</span>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold mt-6 transition"
                >
                  {isAuthenticated ? 'Proceder al pago' : 'Iniciar sesión para comprar'}
                </button>
                <Link
                  to="/catalog"
                  className="block text-center text-blue-500 hover:underline mt-3 text-sm"
                >
                  Seguir comprando
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;