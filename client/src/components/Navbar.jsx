// client/src/components/Navbar.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu, X } from 'lucide-react';
import { Link, useNavigate, NavLink } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'RECEPTIONIST':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'EMPLOYEE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const links = [
    { title: 'Dashboard', path: '/dashboard', roles: ['ADMIN', 'RECEPTIONIST', 'EMPLOYEE'] },
    { title: 'Register Visitor', path: '/register-visitor', roles: ['RECEPTIONIST', 'ADMIN'] },
    { title: 'Visitor Log Master', path: '/visitors', roles: ['ADMIN', 'RECEPTIONIST'] },
    { title: 'Visitor Approvals', path: '/requests', roles: ['EMPLOYEE'] },
    { title: 'Manage Staff', path: '/employees', roles: ['ADMIN'] },
    { title: 'Visitor Reports', path: '/reports', roles: ['ADMIN'] },
  ];

  const userLinks = user ? links.filter(l => l.roles.includes(user.role)) : [];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between shadow-xs">
      <div className="flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-blue-600 p-2 flex items-center justify-center shadow-md shadow-blue-600/20 group-hover:bg-blue-700 transition-colors">
            <img src="/visitor.png" alt="PassGuard" className="w-full h-full object-contain brightness-0 invert" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-2">
              PassGuard
            </h1>
            <p className="text-xs text-slate-500 font-medium">Visitor Pass Management System</p>
          </div>
        </Link>

        {user && (
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        )}
      </div>

      {user && (
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-bold text-rose-600 hover:text-rose-700 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 transition-colors border border-rose-200 shadow-2xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>

          <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              {user.name.charAt(0)}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-800 leading-tight">{user.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRoleBadge(user.role)}`}>
                  {user.role}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">{user.department}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {user && mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-slate-200 space-y-3 pb-2 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                {user.name.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">{user.name}</p>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${getRoleBadge(user.role)}`}>
                  {user.role}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs font-bold text-rose-600 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>

          <nav className="grid grid-cols-2 gap-2">
            {userLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`
                }
              >
                {link.title}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
