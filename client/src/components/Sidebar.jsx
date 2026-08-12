import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Package, Boxes, FileText, Bot, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
  { name: 'Customers', href: '/customers', icon: Users, roles: ['ADMIN', 'SALES', 'ACCOUNTS'] },
  { name: 'Products', href: '/products', icon: Package, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
  { name: 'Inventory', href: '/inventory', icon: Boxes, roles: ['ADMIN', 'WAREHOUSE'] },
  { name: 'Sales Challans', href: '/challans', icon: FileText, roles: ['ADMIN', 'SALES', 'ACCOUNTS'] },
  { name: 'AI Assistant', href: '/ai-assistant', icon: Bot, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
];

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const allowedNav = navigation.filter(item => item.roles.includes(user.role));

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto flex flex-col shadow-xl lg:shadow-none",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        
        {/* Sidebar Header */}
        <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary p-2 rounded-xl">
              <Boxes className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
              Mini ERP
            </span>
          </div>
          <button 
            type="button" 
            className="lg:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6 custom-scrollbar bg-slate-50/30">
          <div className="space-y-1.5">
            <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Menu
            </div>
            {allowedNav.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => cn(
                    "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-primary text-white shadow-md shadow-primary/20" 
                      : "text-slate-600 hover:bg-white hover:text-primary hover:shadow-sm"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? "text-white" : "text-slate-400 group-hover:text-primary"
                  )} />
                  {item.name}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* User Profile Summary inside Sidebar (optional enhancement for mobile) */}
        <div className="p-4 border-t border-slate-100 bg-white lg:hidden">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900 truncate max-w-[160px]">{user.name}</span>
              <span className="text-xs text-slate-500 font-medium">{user.role}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
