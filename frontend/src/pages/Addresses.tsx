import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

interface Address {
  id: number;
  calle: string;
  ciudad: string;
  estado: string;
  codigoPostal: string;
  esPrincipal: boolean;
}

const Addresses = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    calle: '',
    ciudad: '',
    estado: '',
    codigoPostal: '',
    esPrincipal: false
  });

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/addresses');
      setAddresses(res.data);
    } catch {
      setError('Error al cargar direcciones');
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.put(`/addresses/${editingId}`, form);
      } else {
        await api.post('/addresses', form);
      }
      setForm({ calle: '', ciudad: '', estado: '', codigoPostal: '', esPrincipal: false });
      setShowForm(false);
      setEditingId(null);
      fetchAddresses();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar dirección');
    }
  };

  const handleEdit = (address: Address) => {
    setForm({
      calle: address.calle,
      ciudad: address.ciudad,
      estado: address.estado,
      codigoPostal: address.codigoPostal,
      esPrincipal: address.esPrincipal
    });
    setEditingId(address.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta dirección?')) return;
    try {
      await api.delete(`/addresses/${id}`);
      fetchAddresses();
    } catch {
      setError('Error al eliminar dirección');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Mis Direcciones</h1>
            <button onClick={() => navigate('/profile')} className="text-blue-500 hover:underline text-sm mt-1">
              ← Volver al perfil
            </button>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ calle: '', ciudad: '', estado: '', codigoPostal: '', esPrincipal: false }); }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
          >
            {showForm ? 'Cancelar' : '+ Nueva Dirección'}
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
            <h2 className="text-lg font-semibold mb-4">{editingId ? 'Editar Dirección' : 'Nueva Dirección'}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Calle y número</label>
                <input
                  type="text"
                  name="calle"
                  value={form.calle}
                  onChange={handleChange}
                  placeholder="Av. Principal 123"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                  <input
                    type="text"
                    name="ciudad"
                    value={form.ciudad}
                    onChange={handleChange}
                    placeholder="Ensenada"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <input
                    type="text"
                    name="estado"
                    value={form.estado}
                    onChange={handleChange}
                    placeholder="Baja California"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
                <input
                  type="text"
                  name="codigoPostal"
                  value={form.codigoPostal}
                  onChange={handleChange}
                  placeholder="22800"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="esPrincipal"
                  checked={form.esPrincipal}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <label className="text-sm text-gray-700">Establecer como dirección principal</label>
              </div>
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition font-medium"
              >
                {editingId ? 'Guardar cambios' : 'Agregar dirección'}
              </button>
            </form>
          </div>
        )}

        {/* Lista de direcciones */}
        {addresses.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-5xl mb-4">📍</p>
            <p className="text-xl">No tienes direcciones guardadas</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {addresses.map(address => (
              <div key={address.id} className="bg-white rounded-xl shadow-sm p-6 flex justify-between items-start">
                <div>
                  {address.esPrincipal && (
                    <span className="bg-blue-100 text-blue-600 text-xs font-medium px-2 py-1 rounded-full mb-2 inline-block">
                      Principal
                    </span>
                  )}
                  <p className="font-semibold text-gray-800">{address.calle}</p>
                  <p className="text-gray-600">{address.ciudad}, {address.estado}</p>
                  <p className="text-gray-500 text-sm">CP: {address.codigoPostal}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(address)}
                    className="text-blue-500 hover:text-blue-700 text-sm font-medium transition"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium transition"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Addresses;