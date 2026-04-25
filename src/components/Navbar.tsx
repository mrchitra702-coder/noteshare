import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Upload, User, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900 tracking-tight">NoteShare</span>
            </Link>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <Link to="/" className="text-gray-600 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors">Home</Link>
              <Link to="/notes" className="text-gray-600 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors">Courses</Link>
              {user && (
                <Link to="/upload" className="text-gray-600 hover:text-indigo-600 flex items-center space-x-1 px-3 py-2 text-sm font-medium transition-colors">
                  <Upload className="h-4 w-4" />
                  <span>Upload Notes</span>
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-gray-600 hover:text-indigo-600 p-2 rounded-full transition-colors" title="Admin Panel">
                    <Shield className="h-5 w-5" />
                  </Link>
                )}
                <Link to="/profile" className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-red-600 p-2 rounded-full transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-600 hover:text-indigo-600 text-sm font-medium">Login</Link>
                <Link
                  to="/signup"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
