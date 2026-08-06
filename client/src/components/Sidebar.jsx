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
  CheckSquare,
  ShieldCheck
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
      title: 'Visitor Log Master',
      path: '/visitors',
      icon: ClipboardList,
      roles: ['ADMIN', 'RECEPTIONIST'],
    },
    {
      title: 'Visitor Approvals',
      path: '/requests',
      icon: CheckSquare,
      roles: ['EMPLOYEE'],
    },
    {
      title: 'Manage Staff',
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
    <aside className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-65px)]">
      <div className="space-y-6">
        <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Navigation Portal
        </div>
        <nav className="space-y-1">
          {filteredLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200/80 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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

      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 text-blue-700 text-xs font-bold mb-1">
          <ShieldCheck className="w-4 h-4" />
          Enterprise Compliance
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
          Automated Rule Engine active (Rules 1-10 validated on all check-ins & approvals).
        </p>
      </div>
    </aside>
  );
}
