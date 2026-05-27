import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Product } from '../types';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch {
        navigate('/catalog');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!product) return;
    await addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.image
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="text-center py-20 text-gray-500">Cargando producto...</div>
    </div>
  );

  if (!product) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6">
          <span className="hover:text-blue-500 cursor-pointer" onClick={() => navigate('/')}>Inicio</span>
          <span className="mx-2">/</span>
          <span className="hover:text-blue-500 cursor-pointer" onClick={() => navigate('/catalog')}>Catálogo</span>
          <span className="mx-2">/</span>
          <span className="text-gray-800">{product.name}</span>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8 flex flex-col md:flex-row gap-10">
          {/* Imagen */}
          <div className="bg-gray-100 rounded-xl h-72 w-full md:w-96 flex items-center justify-center shrink-0">
            {product.image ? (
              <img src={product.image} alt={product.name} className="h-full w-full object-cover rounded-xl" />
            ) : (
              <span className="text-gray-400 text-8xl">📦</span>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col flex-1">
            <span className="text-blue-500 font-medium text-sm">{product.category}</span>
            <h1 className="text-3xl font-bold text-gray-800 mt-2">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-yellow-400">★★★★★</span>
              <span className="text-gray-500">{product.rating} / 5</span>
            </div>

            <div className="text-4xl font-bold text-gray-900 mt-4">
              ${product.price.toLocaleString('es-MX')}
            </div>

            {/* Stock */}
            <div className="mt-3">
              {product.stock === 0 ? (
                <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">Sin stock</span>
              ) : (
                <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-medium">
                  {product.stock} disponibles
                </span>
              )}
            </div>

            {/* Cantidad */}
            {product.stock > 0 && (
              <div className="flex items-center gap-4 mt-6">
                <span className="text-gray-700 font-medium">Cantidad:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-3 py-2 hover:bg-gray-100 transition"
                  >-</button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="px-3 py-2 hover:bg-gray-100 transition"
                  >+</button>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-semibold transition flex-1"
              >
                {added ? '✅ Agregado' : '🛒 Agregar al carrito'}
              </button>
              <button
                onClick={() => navigate('/catalog')}
                className="border border-gray-300 hover:bg-gray-50 px-6 py-3 rounded-xl transition"
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;