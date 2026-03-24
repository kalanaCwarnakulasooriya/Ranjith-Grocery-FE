import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { ShoppingCart, User, Menu, X, LogOut, Package } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { items } = useCartStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const cartItemCount = items.reduce((acc, current) => acc + current.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Package className="h-8 w-8 text-grocery-green" />
              <span className="font-bold text-xl tracking-tight text-gray-900">
                Ranjith <span className="text-grocery-orange">Grocery</span>
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-600 hover:text-grocery-green font-medium transition-colors">Shop</Link>
            
            {isAuthenticated && user?.role === 'ADMIN' && (
              <Link to="/admin" className="text-gray-600 hover:text-grocery-orange font-medium transition-colors">Dashboard</Link>
            )}

            {isAuthenticated && user?.role === 'CUSTOMER' && (
              <Link to="/orders" className="text-gray-600 hover:text-grocery-green font-medium transition-colors">My Orders</Link>
            )}

            <Link to="/cart" className="relative text-gray-600 hover:text-grocery-green transition-colors">
              <ShoppingCart className="h-6 w-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-grocery-orange text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-4 border-l pl-4 ml-2">
                <span className="text-sm font-medium text-gray-700">Hi, {user.name}</span>
                <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 transition-colors">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 border-l pl-4 ml-2">
                <Link to="/login" className="text-gray-600 hover:text-grocery-green font-medium">Login</Link>
                <Link to="/register" className="btn-primary py-1.5 px-3 text-sm">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Link to="/cart" className="relative mr-4 text-gray-600">
              <ShoppingCart className="h-6 w-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-grocery-orange text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t p-4 absolute w-full shadow-lg">
          <div className="flex flex-col space-y-4">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-gray-600 font-medium">Shop</Link>
            
            {isAuthenticated && user?.role === 'ADMIN' && (
              <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="text-gray-600 font-medium">Dashboard</Link>
            )}
            
            {isAuthenticated && user?.role === 'CUSTOMER' && (
              <Link to="/orders" onClick={() => setIsMenuOpen(false)} className="text-gray-600 font-medium">My Orders</Link>
            )}

            {isAuthenticated ? (
              <div className="pt-4 border-t flex items-center justify-between">
                <span className="font-medium text-gray-700">{user.name} ({user.role})</span>
                <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 font-medium">
                  <LogOut className="h-5 w-5" /> Logout
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t flex flex-col gap-3">
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-center text-gray-600 font-medium border py-2 rounded-lg">Login</Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)} className="btn-primary text-center">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
