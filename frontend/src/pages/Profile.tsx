import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Mi Perfil</h1>

        {/* Datos del usuario */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-blue-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold">
              {user?.nombre?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{user?.nombre} {user?.apellido}</h2>
              <p className="text-gray-500">{user?.email}</p>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${user?.role === 'admin' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'}`}>
                {user?.role === 'admin' ? 'Administrador' : 'Cliente'}
              </span>
            </div>
          </div>
        </div>

        {/* Opciones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => navigate('/addresses')}
            className="bg-white rounded-xl shadow-sm p-6 text-left hover:shadow-md transition"
          >
            <p className="text-3xl mb-3">📍</p>
            <h3 className="font-bold text-gray-800 text-lg">Mis Direcciones</h3>
            <p className="text-gray-500 text-sm mt-1">Administra tus direcciones de entrega</p>
          </button>

          <button
            onClick={() => navigate('/cards')}
            className="bg-white rounded-xl shadow-sm p-6 text-left hover:shadow-md transition"
          >
            <p className="text-3xl mb-3">💳</p>
            <h3 className="font-bold text-gray-800 text-lg">Mis Tarjetas</h3>
            <p className="text-gray-500 text-sm mt-1">Administra tus métodos de pago</p>
          </button>

          <button
            onClick={() => navigate('/orders')}
            className="bg-white rounded-xl shadow-sm p-6 text-left hover:shadow-md transition"
          >
            <p className="text-3xl mb-3">📦</p>
            <h3 className="font-bold text-gray-800 text-lg">Mis Pedidos</h3>
            <p className="text-gray-500 text-sm mt-1">Revisa el historial de tus compras</p>
          </button>

          {user?.role === 'admin' && (
            <button
              onClick={() => navigate('/admin')}
              className="bg-yellow-50 border border-yellow-200 rounded-xl shadow-sm p-6 text-left hover:shadow-md transition"
            >
              <p className="text-3xl mb-3">⚙️</p>
              <h3 className="font-bold text-gray-800 text-lg">Panel Admin</h3>
              <p className="text-gray-500 text-sm mt-1">Gestiona productos y órdenes</p>
            </button>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default Profile;