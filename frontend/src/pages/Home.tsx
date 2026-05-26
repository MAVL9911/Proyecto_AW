import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import Navbar from '../components/Navbar';

const Home = () => {
  const [trending, setTrending] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get('/products?sort=rating'),
          api.get('/products/categories')
        ]);
        setTrending(productsRes.data.slice(0, 4));
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 px-6 text-center">
        <h1 className="text-5xl font-bold mb-4">Bienvenido a ShopAW</h1>
        <p className="text-xl text-blue-100 mb-8">Los mejores productos al mejor precio</p>
        <Link
          to="/catalog"
          className="bg-white text-blue-600 font-semibold px-8 py-3 rounded-full hover:bg-blue-50 transition text-lg"
        >
          Ver catálogo
        </Link>
      </div>

      {/* Categorías */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Categorías</h2>
        <div className="flex gap-4 flex-wrap">
          {categories.map(cat => (
            <Link
              key={cat}
              to={`/catalog?category=${cat}`}
              className="bg-white border border-gray-200 px-6 py-3 rounded-full hover:bg-blue-500 hover:text-white hover:border-blue-500 transition font-medium"
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>

      {/* Productos en tendencia */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Productos en tendencia</h2>
        {loading ? (
          <div className="text-center text-gray-500 py-10">Cargando productos...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trending.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        <div className="text-center mt-8">
          <Link
            to="/catalog"
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-full transition font-medium"
          >
            Ver todos los productos
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;