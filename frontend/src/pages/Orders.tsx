import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

interface OrderItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: string;
  addressId?: number;
}

const statusLabel: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-600' },
  paid: { label: 'Pagado', color: 'bg-green-100 text-green-600' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-600' }
};

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        setOrders(res.data);
      } catch {
        setError('Error al cargar pedidos');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Mis Pedidos</h1>
          <button onClick={() => navigate('/profile')} className="text-blue-500 hover:underline text-sm mt-1">
            ← Volver al perfil
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-gray-500">Cargando pedidos...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-5xl mb-4">📦</p>
            <p className="text-xl mb-4">No tienes pedidos aún</p>
            <button
              onClick={() => navigate('/catalog')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-full transition font-medium"
            >
              Ver productos
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-100">
                  <div>
                    <p className="font-bold text-gray-800 text-lg">Pedido #{order.id}</p>
                    <p className="text-gray-500 text-sm mt-1">
                      📅 {new Date(order.createdAt).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-gray-500 text-sm">
                      🕐 {new Date(order.createdAt).toLocaleTimeString('es-MX', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusLabel[order.status].color}`}>
                    {statusLabel[order.status].label}
                  </span>
                </div>

                {/* Productos */}
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-600 mb-2">Productos:</p>
                  <div className="flex flex-col gap-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm bg-gray-50 px-3 py-2 rounded-lg">
                        <span className="text-gray-700">{item.name} <span className="text-gray-400">x{item.quantity}</span></span>
                        <span className="text-gray-800 font-medium">
                          ${(item.price * item.quantity).toLocaleString('es-MX')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dirección */}
                {order.addressId && (
                  <div className="mb-4 bg-gray-50 px-3 py-2 rounded-lg">
                    <p className="text-sm font-semibold text-gray-600">📍 Dirección de entrega:</p>
                    <p className="text-sm text-gray-500 mt-1">ID de dirección: #{order.addressId}</p>
                  </div>
                )}

                {/* Totales */}
                <div className="border-t border-gray-100 pt-4 flex flex-col gap-1">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span>${order.subtotal.toLocaleString('es-MX')}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>IVA (16%)</span>
                    <span>${order.tax.toLocaleString('es-MX')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-800 mt-1 text-lg">
                    <span>Total</span>
                    <span>${order.total.toLocaleString('es-MX')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;