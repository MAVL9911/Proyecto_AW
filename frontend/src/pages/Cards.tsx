import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

interface Card {
  id: number;
  nombreTitular: string;
  numeroEnmascarado: string;
  expiracion: string;
}

const Cards = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState<Card[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    nombreTitular: '',
    numero: '',
    expiracion: '',
    cvv: ''
  });

  const fetchCards = async () => {
    try {
      const res = await api.get('/cards');
      setCards(res.data);
    } catch {
      setError('Error al cargar tarjetas');
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    if (e.target.name === 'numero') {
      value = value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})/g, '$1 ').trim();
    }

    if (e.target.name === 'expiracion') {
      value = value.replace(/\D/g, '').slice(0, 4);
      if (value.length >= 2) value = value.slice(0, 2) + '/' + value.slice(2);
    }

    if (e.target.name === 'cvv') {
      value = value.replace(/\D/g, '').slice(0, 4);
    }

    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/cards', {
        nombreTitular: form.nombreTitular,
        numero: form.numero.replace(/\s/g, ''),
        expiracion: form.expiracion,
        cvv: form.cvv
      });
      setForm({ nombreTitular: '', numero: '', expiracion: '', cvv: '' });
      setShowForm(false);
      fetchCards();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al agregar tarjeta');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta tarjeta?')) return;
    try {
      await api.delete(`/cards/${id}`);
      fetchCards();
    } catch {
      setError('Error al eliminar tarjeta');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Mis Tarjetas</h1>
            <button onClick={() => navigate('/profile')} className="text-blue-500 hover:underline text-sm mt-1">
              ← Volver al perfil
            </button>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
          >
            {showForm ? 'Cancelar' : '+ Nueva Tarjeta'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Formulario */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Nueva Tarjeta</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del titular</label>
                <input
                  type="text"
                  name="nombreTitular"
                  value={form.nombreTitular}
                  onChange={handleChange}
                  placeholder="Juan García"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número de tarjeta</label>
                <input
                  type="text"
                  name="numero"
                  value={form.numero}
                  onChange={handleChange}
                  placeholder="1234 5678 9012 3456"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de expiración</label>
                  <input
                    type="text"
                    name="expiracion"
                    value={form.expiracion}
                    onChange={handleChange}
                    placeholder="MM/YY"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                  <input
                    type="password"
                    name="cvv"
                    value={form.cvv}
                    onChange={handleChange}
                    placeholder="123"
                    maxLength={4}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition font-medium"
              >
                Agregar tarjeta
              </button>
            </form>
          </div>
        )}

        {/* Lista de tarjetas */}
        {cards.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-5xl mb-4">💳</p>
            <p className="text-xl">No tienes tarjetas guardadas</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {cards.map(card => (
              <div key={card.id} className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white flex justify-between items-center">
                <div>
                  <p className="text-xl font-mono tracking-widest mb-2">{card.numeroEnmascarado}</p>
                  <p className="font-medium">{card.nombreTitular}</p>
                  <p className="text-blue-200 text-sm">Expira: {card.expiracion}</p>
                </div>
                <button
                  onClick={() => handleDelete(card.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm transition"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cards;