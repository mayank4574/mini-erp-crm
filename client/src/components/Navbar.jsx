import React from 'react';
import { Menu, LogOut, Bell, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ setSidebarOpen, sidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between bg-white px-4 shadow-sm sm:px-6 lg:px-8 border-b border-slate-100">
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-lg lg:hidden transition-colors"
          onClick={() => setSidebarOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        
        {/* Optional Global Search Placeholder */}
        <div className="hidden md:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
          <Search className="h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-transparent border-none focus:outline-none text-sm text-slate-700 w-48 lg:w-64"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        {/* Notifications Mock */}
        <button className="relative p-2 text-slate-400 hover:text-primary transition-colors rounded-full hover:bg-primary/5">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger border-2 border-white"></span>
        </button>

        <div className="hidden sm:block h-6 w-px bg-slate-200" aria-hidden="true" />
        
        {/* User Menu */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-semibold text-slate-900 leading-tight">{user?.name}</span>
            <span className="text-xs font-medium text-slate-500">{user?.role}</span>
          </div>
          
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold shadow-md shadow-primary/20 border border-white">
            {user?.name?.charAt(0) || 'U'}
          </div>

          <button
            onClick={handleLogout}
            className="ml-2 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-danger/10 hover:text-danger transition-colors"
          >
            <LogOut className="h-4 w-4 hidden sm:block" />
            <span className="sr-only sm:not-sr-only">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
