import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import api from '../services/api';

interface Address {
  id: number;
  calle: string;
  ciudad: string;
  estado: string;
  codigoPostal: string;
  esPrincipal: boolean;
}

interface Card {
  id: number;
  nombreTitular: string;
  numeroEnmascarado: string;
  expiracion: string;
}

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [addressRes, cardRes] = await Promise.all([
          api.get('/addresses'),
          api.get('/cards')
        ]);
        setAddresses(addressRes.data);
        setCards(cardRes.data);

        // Seleccionar dirección principal por default
        const principal = addressRes.data.find((a: Address) => a.esPrincipal);
        if (principal) setSelectedAddress(principal.id);

        // Seleccionar primera tarjeta por default
        if (cardRes.data.length > 0) setSelectedCard(cardRes.data[0].id);
      } catch {
        setError('Error al cargar datos');
      }
    };
    fetchData();
  }, []);

  const handleOrder = async () => {
    if (!selectedAddress) {
      setError('Debes seleccionar una dirección de entrega');
      return;
    }
    if (!selectedCard) {
      setError('Debes seleccionar un método de pago');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await api.post('/orders', {
        items: cart.items,
        subtotal: cart.subtotal,
        tax: cart.tax,
        total: cart.total,
        addressId: selectedAddress,
        cardId: selectedCard
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
          <div className="flex-1 flex flex-col gap-6">
            {/* Dirección */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Dirección de entrega</h2>
                <button
                  onClick={() => navigate('/addresses')}
                  className="text-blue-500 hover:underline text-sm"
                >
                  + Agregar
                </button>
              </div>
              {addresses.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <p>No tienes direcciones guardadas</p>
                  <button
                    onClick={() => navigate('/addresses')}
                    className="text-blue-500 hover:underline mt-2 text-sm"
                  >
                    Agregar dirección
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {addresses.map(address => (
                    <div
                      key={address.id}
                      onClick={() => setSelectedAddress(address.id)}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition ${selectedAddress === address.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedAddress === address.id ? 'border-blue-500' : 'border-gray-300'}`}>
                          {selectedAddress === address.id && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{address.calle}</p>
                          <p className="text-gray-600 text-sm">{address.ciudad}, {address.estado} - CP {address.codigoPostal}</p>
                        </div>
                        {address.esPrincipal && (
                          <span className="ml-auto bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">Principal</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tarjeta */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Método de pago</h2>
                <button
                  onClick={() => navigate('/cards')}
                  className="text-blue-500 hover:underline text-sm"
                >
                  + Agregar
                </button>
              </div>
              {cards.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <p>No tienes tarjetas guardadas</p>
                  <button
                    onClick={() => navigate('/cards')}
                    className="text-blue-500 hover:underline mt-2 text-sm"
                  >
                    Agregar tarjeta
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {cards.map(card => (
                    <div
                      key={card.id}
                      onClick={() => setSelectedCard(card.id)}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition ${selectedCard === card.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedCard === card.id ? 'border-blue-500' : 'border-gray-300'}`}>
                          {selectedCard === card.id && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                        </div>
                        <div>
                          <p className="font-mono font-medium text-gray-800">{card.numeroEnmascarado}</p>
                          <p className="text-gray-600 text-sm">{card.nombreTitular} · Expira {card.expiracion}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Productos */}
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