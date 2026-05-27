import { useEffect, useState } from 'react';
import type { Product } from '../../types';
import api from '../../services/api';

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    price: '',
    category: '',
    stock: '',
    image: ''
  });

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch {
      setError('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEdit = (product: Product) => {
    setForm({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      image: product.image
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, {
          name: form.name,
          price: parseFloat(form.price),
          category: form.category,
          stock: parseInt(form.stock),
          image: form.image
        });
      } else {
        await api.post('/products', {
          name: form.name,
          price: parseFloat(form.price),
          category: form.category,
          stock: parseInt(form.stock),
          image: form.image
        });
      }
      setForm({ name: '', price: '', category: '', stock: '', image: '' });
      setShowForm(false);
      setEditingId(null);
      fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar producto');
    }
  };

  const handleDiscontinue = async (id: number) => {
    if (!confirm('¿Marcar este producto como descontinuado?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch {
      setError('Error al descontinuar producto');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Productos</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setForm({ name: '', price: '', category: '', stock: '', image: '' });
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
        >
          {showForm ? 'Cancelar' : '+ Nuevo Producto'}
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
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Editar Producto' : 'Nuevo Producto'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
              <input
                type="number"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <input
                type="text"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input
                type="number"
                value={form.stock}
                onChange={e => setForm({ ...form, stock: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">URL de imagen</label>
              <input
                type="text"
                value={form.image}
                onChange={e => setForm({ ...form, image: e.target.value })}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {form.image && (
                <img
                  src={form.image}
                  alt="Preview"
                  className="mt-2 h-24 w-24 object-cover rounded-lg border border-gray-200"
                  onError={e => (e.currentTarget.style.display = 'none')}
                />
              )}
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition"
              >
                {editingId ? 'Guardar cambios' : 'Crear Producto'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Cargando productos...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Imagen</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Producto</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Categoría</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Precio</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Stock</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                          onError={e => (e.currentTarget.style.display = 'none')}
                        />
                      ) : (
                        <span className="text-xl">📦</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">{product.name}</td>
                  <td className="px-6 py-4 text-gray-600">{product.category}</td>
                  <td className="px-6 py-4 text-gray-800">${product.price.toLocaleString('es-MX')}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock === 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      {product.stock === 0 ? 'Sin stock' : product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-500 hover:text-blue-700 text-sm font-medium transition"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDiscontinue(product.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium transition"
                      >
                        Descontinuar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;