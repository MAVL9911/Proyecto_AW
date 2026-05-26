import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';

interface Props {
  product: Product;
}

const ProductCard = ({ product }: Props) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition flex flex-col">
      {/* Imagen */}
      <Link to={`/product/${product.id}`}>
        <div className="bg-gray-100 h-48 flex items-center justify-center relative">
          {product.image ? (
            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-gray-400 text-5xl">📦</span>
          )}
          {product.stock === 0 && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              Sin stock
            </span>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <span className="text-xs text-blue-500 font-medium">{product.category}</span>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-gray-800 mt-1 hover:text-blue-600 transition">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-1">
          <span className="text-yellow-400 text-sm">★</span>
          <span className="text-gray-500 text-sm">{product.rating}</span>
        </div>

        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">
            ${product.price.toLocaleString('es-MX')}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-sm transition"
          >
            {product.stock === 0 ? 'Sin stock' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;