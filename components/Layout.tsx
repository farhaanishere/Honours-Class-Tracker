import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  Archive, 
  LogOut, 
  Menu, 
  X,
  GraduationCap,
  Settings,
  Heart
} from 'lucide-react';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { to: '/tracker', label: 'Class Tracker', icon: <BookOpen size={20} /> },
    { to: '/archives', label: 'Archives', icon: <Archive size={20} /> },
    { to: '/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-bou-900 text-white shadow-xl fixed h-full z-10">
        <div className="p-6 border-b border-bou-800 flex items-center gap-3">
          <img src="https://i.ibb.co.com/Gj1sFwY/Untitled-design-16.png" alt="Logo" className="w-8 h-8" />
          <div>
            <h1 className="font-bold text-xl leading-tight">Honours</h1>
            <p className="text-xs text-bou-300 opacity-80">Class Tracker</p>
          </div>
        </div>
        
        <div className="p-4 border-b border-bou-800 bg-bou-800/50">
           <p className="text-xs uppercase text-bou-300 font-semibold mb-1">Current Program</p>
           <p className="text-sm font-medium truncate">{user?.program}</p>
           <p className="text-xs text-gray-300 truncate opacity-80">{user?.subject}</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  isActive
                    ? 'bg-bou-700 text-white shadow-md translate-x-1'
                    : 'text-gray-300 hover:bg-bou-800 hover:text-white hover:translate-x-1'
                }`
              }
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-bou-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-200 hover:bg-red-900/50 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
          
          <div className="mt-4 pt-4 border-t border-bou-800/50 text-center">
             <p className="text-[10px] text-bou-400 font-medium tracking-wider flex items-center justify-center gap-1 opacity-70">
               Made by Farhaan <Heart size={10} className="fill-current" />
             </p>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden bg-bou-900 text-white p-4 flex justify-between items-center sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-2">
          <img src="https://i.ibb.co.com/Gj1sFwY/Untitled-design-16.png" alt="Logo" className="w-6 h-6" />
          <span className="font-bold text-lg">Honours Class Tracker</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-bou-900 z-10 pt-20 px-6 animate-fade-in">
          <div className="mb-6 pb-6 border-b border-bou-700">
             <p className="text-xl font-bold text-white">{user?.name}</p>
             <p className="text-sm text-bou-300">{user?.program}</p>
             <p className="text-xs text-gray-400 mt-1">{user?.subject}</p>
          </div>
          <nav className="space-y-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3 rounded-lg text-lg ${
                    isActive
                      ? 'bg-bou-800 text-white border-l-4 border-bou-300'
                      : 'text-gray-300 hover:bg-bou-800'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-4 px-4 py-3 w-full rounded-lg text-red-300 hover:bg-red-900/20 text-lg mt-8"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </nav>
          
          <div className="absolute bottom-8 left-0 right-0 text-center">
             <p className="text-xs text-bou-500 font-medium tracking-widest uppercase">
               Made by Farhaan
             </p>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto animate-slide-up">
          <Outlet />
        </div>
        
        {/* Mobile Footer (visible only on mobile if content is short, otherwise scrolls) */}
        <div className="md:hidden mt-8 py-6 text-center border-t border-gray-200">
            <p className="text-xs text-gray-400">Made by Farhaan</p>
        </div>
      </main>
    </div>
  );
};

export default Layout;