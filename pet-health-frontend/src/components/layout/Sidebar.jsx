import React from 'react';
import { Menu, X, LogOut } from 'lucide-react';

const Sidebar = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  userRole, 
  navItems, 
  currentPage, 
  setCurrentPage,
  logout
}) => {
  return (
    <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-blue-800 to-blue-900 text-white transition-all duration-300 flex flex-col`}>
      {/* Logo */}
      <div className="p-4 flex items-center justify-between border-b border-blue-700">
        {sidebarOpen && <h1 className="text-xl font-bold">🐾 PetHealth</h1>}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* User role label */}
      {sidebarOpen && (
        <div className="p-4 border-b border-blue-700 text-blue-100">
          <div className="text-xs uppercase opacity-70 mb-1">Signed in as</div>
          <div className="font-medium">{userRole === 'owner' ? 'Pet Owner' : 'Veterinarian'}</div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentPage === item.id
                ? 'bg-blue-700 text-white'
                : 'text-blue-100 hover:bg-blue-700/50'
            }`}
          >
            <item.icon size={20} />
            {sidebarOpen && <span className="font-medium">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-blue-700">
        <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-blue-100 hover:bg-blue-700/50 rounded-lg transition-colors">
          <LogOut size={20} />
          {sidebarOpen && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
