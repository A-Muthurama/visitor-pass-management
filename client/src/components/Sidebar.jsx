// client/src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  UserPlus, 
  Users, 
  ClipboardList, 
  FileBarChart, 
  History, 
  CheckSquare,
  ShieldAlert
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const links = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'RECEPTIONIST', 'EMPLOYEE'],
    },
    {
      title: 'Register Visitor',
      path: '/register-visitor',
      icon: UserPlus,
      roles: ['RECEPTIONIST', 'ADMIN'],
    },
    {
      title: 'Visitor Log',
      path: '/visitors',
      icon: ClipboardList,
      roles: ['ADMIN', 'RECEPTIONIST'],
    },
    {
      title: 'Visitor Requests',
      path: '/requests',
      icon: CheckSquare,
      roles: ['EMPLOYEE'],
    },
    {
      title: 'Manage Employees',
      path: '/employees',
      icon: Users,
      roles: ['ADMIN'],
    },
    {
      title: 'Visitor Reports',
      path: '/reports',
      icon: FileBarChart,
      roles: ['ADMIN'],
    },
  ];

  const filteredLinks = links.filter((link) => link.roles.includes(role));

  return (
    <aside className="w-64 glass-card border-r border-slate-800 p-4 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-65px)]">
      <div className="space-y-6">
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Navigation ({role})
        </div>
        <nav className="space-y-1.5">
          {filteredLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-500/5'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{link.title}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold mb-1">
          <ShieldAlert className="w-3.5 h-3.5" />
          Active Business Rules
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Rules 1-10 strictly enforced by API engine (Single active visit, max 3 pending/employee, check-in validation).
        </p>
      </div>
    </aside>
  );
}
