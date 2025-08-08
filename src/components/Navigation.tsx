import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Music, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export const Navigation: React.FC = () => {
  const location = useLocation();
  const { user, signOut } = useAuthStore();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    await signOut();
    setIsUserMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
              <Music className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">English Practice</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-8">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'bg-teal-100 text-teal-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Discover</span>
            </Link>
            
            <Link
              to="/playlist"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/playlist')
                  ? 'bg-teal-100 text-teal-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Music className="w-4 h-4" />
              <span>My Playlists</span>
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors rounded-md hover:bg-gray-100"
              >
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {user?.user_metadata?.display_name || user?.email || 'User'}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                    <div className="font-medium">
                      {user?.user_metadata?.display_name || 'User'}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {user?.email}
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Backdrop for mobile menu */}
      {isUserMenuOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </nav>
  );
};
