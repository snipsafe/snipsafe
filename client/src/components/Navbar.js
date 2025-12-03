import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PlusIcon, UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-slate-800 shadow-sm border-b border-slate-700">
      <div className="px-6">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SS</span>
            </div>
            <span className="text-xl font-bold text-slate-100">SnipSafe</span>
          </Link>

          {user ? (
            <div className="flex items-center space-x-4">
              <Link
                to="/create"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                New Snippet
              </Link>
              
              <div className="flex items-center space-x-2 text-sm text-slate-300">
                <UserIcon className="w-4 h-4" />
                <span>{user.username}</span>
                <span className="text-slate-500">({user.organization})</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-slate-300 transition-colors"
                title="Logout"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-slate-300 hover:text-slate-100 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
