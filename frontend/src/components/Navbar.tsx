import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { isAuthenticated, isAdmin, logout, user } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      {/* Logo */}
      <Link to="/" className="text-2xl font-bold text-blue-400 hover:text-blue-300">
        ShopAW
      </Link>

      {/* Links centrales */}
      <div className="flex gap-6">
        <Link to="/" className="hover:text-blue-400 transition">Inicio</Link>
        <Link to="/catalog" className="hover:text-blue-400 transition">Catálogo</Link>
        {isAdmin && (
          <Link to="/admin" className="hover:text-yellow-400 transition">Panel Admin</Link>
        )}
      </div>

      {/* Derecha */}
      <div className="flex items-center gap-4">
        {/* Carrito */}
        <Link to="/cart" className="relative hover:text-blue-400 transition">
          🛒
          {cart.items.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {cart.items.length}
            </span>
          )}
        </Link>

        {/* Auth */}
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm">Hola, {user?.nombre}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm transition"
            >
              Cerrar sesión
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link to="/login" className="hover:text-blue-400 transition text-sm">Iniciar sesión</Link>
            <span className="text-gray-500">|</span>
            <Link to="/register" className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-sm transition">Registrarse</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;