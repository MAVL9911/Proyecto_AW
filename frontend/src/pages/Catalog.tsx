import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Product } from '../types';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import Navbar from '../components/Navbar';

const Catalog = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category) params.append('category', category);
        if (sort) params.append('sort', sort);

        const [productsRes, categoriesRes] = await Promise.all([
          api.get(`/products?${params.toString()}`),
          api.get('/products/categories')
        ]);
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [search, category, sort]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Catálogo</h1>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8 flex flex-wrap gap-4 items-center">
          {/* Búsqueda */}
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={e => updateFilter('search', e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Categoría */}
          <select
            value={category}
            onChange={e => updateFilter('category', e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Ordenamiento */}
          <select
            value={sort}
            onChange={e => updateFilter('sort', e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Ordenar por</option>
            <option value="price_asc">Precio: menor a mayor</option>
            <option value="price_desc">Precio: mayor a menor</option>
            <option value="rating">Mejor calificación</option>
          </select>

          {/* Limpiar filtros */}
          {(search || category || sort) && (
            <button
              onClick={() => setSearchParams({})}
              className="text-red-500 hover:text-red-700 text-sm font-medium transition"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Productos */}
        {loading ? (
          <div className="text-center text-gray-500 py-20">Cargando productos...</div>
        ) : products.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            <p className="text-xl">No se encontraron productos</p>
            <button
              onClick={() => setSearchParams({})}
              className="mt-4 text-blue-500 hover:underline"
            >
              Ver todos los productos
            </button>
          </div>
        ) : (
          <>
            <p className="text-gray-500 mb-4">{products.length} productos encontrados</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Catalog;