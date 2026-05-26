import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import api from '../services/api';

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleOrder = async () => {
    setError('');
    setLoading(true);
    try {
      await api.post('/orders', {
        items: cart.items,
        subtotal: cart.subtotal,
        tax: cart.tax,
        total: cart.total
      });
      await clearCart();
      navigate('/');
      alert('¡Orden creada exitosamente! Gracias por tu compra.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al procesar la orden');
    } finally {
      setLoading(false);
    }
  };

  if (cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Resumen de productos */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Tu pedido</h2>
              <div className="flex flex-col gap-3">
                {cart.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-gray-800">
                      ${(item.price * item.quantity).toLocaleString('es-MX')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Total y pago */}
          <div className="lg:w-80">
            <div className="bg-white rounded-xl shadow-sm p-6">
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
                onClick={handleOrder}
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white py-3 rounded-xl font-semibold mt-6 transition"
              >
                {loading ? 'Procesando...' : 'Confirmar orden'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;