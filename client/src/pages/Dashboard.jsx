// client/src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { 
  Users, 
  UserCheck, 
  Clock, 
  Calendar, 
  LogIn, 
  LogOut, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentVisits, setRecentVisits] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, visitsRes] = await Promise.all([
          API.get('/reports/dashboard'),
          API.get('/visits?limit=5')
        ]);
        setStats(statsRes.data);
        setRecentVisits(visitsRes.data.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  const renderAdminDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Employees" value={stats?.totalEmployees} icon={Users} color="text-purple-400" bg="bg-purple-500/10" border="border-purple-500/20" />
        <StatCard title="Today's Visitors" value={stats?.todayVisitors} icon={Calendar} color="text-cyan-400" bg="bg-cyan-500/10" border="border-cyan-500/20" />
        <StatCard title="Currently Inside" value={stats?.currentlyInside} icon={LogIn} color="text-emerald-400" bg="bg-emerald-500/10" border="border-emerald-500/20" />
        <StatCard title="Pending Approvals" value={stats?.pendingRequests} icon={Clock} color="text-amber-400" bg="bg-amber-500/10" border="border-amber-500/20" />
        <StatCard title="Scheduled Visitors" value={stats?.scheduledVisitors} icon={UserCheck} color="text-blue-400" bg="bg-blue-500/10" border="border-blue-500/20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              Live Activity Overview
            </h3>
            <Link to="/visitors" className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <VisitTable visits={recentVisits} />
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheckIcon /> Quick Actions
          </h3>
          <div className="space-y-2.5">
            <Link to="/employees" className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-cyan-500/40 hover:bg-cyan-500/10 transition text-slate-200 text-sm font-medium">
              <span>Manage Employees</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </Link>
            <Link to="/reports" className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-purple-500/40 hover:bg-purple-500/10 transition text-slate-200 text-sm font-medium">
              <span>Generate Summary Reports</span>
              <FileCheck className="w-4 h-4 text-purple-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReceptionistDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Visitors" value={stats?.todayVisitors} icon={Calendar} color="text-cyan-400" bg="bg-cyan-500/10" border="border-cyan-500/20" />
        <StatCard title="Currently Inside" value={stats?.currentlyInside} icon={LogIn} color="text-emerald-400" bg="bg-emerald-500/10" border="border-emerald-500/20" />
        <StatCard title="Today Pending" value={stats?.todayPending} icon={Clock} color="text-amber-400" bg="bg-amber-500/10" border="border-amber-500/20" />
        <StatCard title="Today Approved" value={stats?.todayApproved} icon={CheckCircle} color="text-blue-400" bg="bg-blue-500/10" border="border-blue-500/20" />
      </div>

      <div className="glass-card rounded-2xl p-5 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Front Desk Active Visitors</h3>
            <p className="text-xs text-slate-400">Perform Check-In and Check-Out operations instantly.</p>
          </div>
          <Link to="/register-visitor" className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 transition flex items-center gap-1.5">
            + New Visitor Registration
          </Link>
        </div>
        <VisitTable visits={recentVisits} />
      </div>
    </div>
  );

  const renderEmployeeDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Pending My Approval" value={stats?.pendingRequests} icon={Clock} color="text-amber-400" bg="bg-amber-500/10" border="border-amber-500/20" highlight={stats?.pendingRequests > 0} />
        <StatCard title="Approved Visits Today" value={stats?.todayApprovedVisits} icon={CheckCircle} color="text-emerald-400" bg="bg-emerald-500/10" border="border-emerald-500/20" />
        <StatCard title="Visitors Currently Visiting Me" value={stats?.activeVisitorsInside} icon={LogIn} color="text-cyan-400" bg="bg-cyan-500/10" border="border-cyan-500/20" />
        <StatCard title="Total Visit History" value={stats?.totalHistory} icon={Users} color="text-purple-400" bg="bg-purple-500/10" border="border-purple-500/20" />
      </div>

      <div className="glass-card rounded-2xl p-5 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">My Incoming Visitor Requests</h3>
            <p className="text-xs text-slate-400">Review, approve, or reject visitor requests assigned to you.</p>
          </div>
          <Link to="/requests" className="text-xs font-semibold text-cyan-400 hover:underline">
            Manage Requests &rarr;
          </Link>
        </div>
        <VisitTable visits={recentVisits} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Welcome Back, <span className="text-cyan-400">{user.name}</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Logged in as <span className="font-semibold text-slate-200">{user.role}</span> ({user.department} Department)
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400">System Time (Local)</div>
          <div className="text-sm font-bold text-cyan-400 font-mono">{new Date().toLocaleTimeString()}</div>
        </div>
      </div>

      {user.role === 'ADMIN' && renderAdminDashboard()}
      {user.role === 'RECEPTIONIST' && renderReceptionistDashboard()}
      {user.role === 'EMPLOYEE' && renderEmployeeDashboard()}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg, border, highlight }) {
  return (
    <div className={`glass-card p-4 rounded-2xl border ${border} relative overflow-hidden transition-all hover:scale-[1.02]`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <p className={`text-2xl font-black mt-1 text-white ${highlight ? 'text-amber-400 animate-pulse' : ''}`}>{value || 0}</p>
        </div>
        <div className={`p-3 rounded-xl ${bg} ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function VisitTable({ visits }) {
  if (!visits || visits.length === 0) {
    return <div className="py-8 text-center text-sm text-slate-400">No recent visitor records found.</div>;
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'APPROVED':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'CHECKED_IN':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'CHECKED_OUT':
        return 'bg-slate-700 text-slate-300 border-slate-600';
      case 'REJECTED':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default:
        return 'bg-slate-800 text-slate-400';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <th className="pb-3">Visitor Name</th>
            <th className="pb-3">Host Employee</th>
            <th className="pb-3">Date & Time</th>
            <th className="pb-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {visits.map((v) => (
            <tr key={v._id} className="hover:bg-slate-800/40 transition">
              <td className="py-3 font-medium text-slate-100">
                {v.visitor?.fullName || 'N/A'}
                <div className="text-[11px] text-slate-400">{v.visitor?.company}</div>
              </td>
              <td className="py-3 text-slate-300">
                {v.hostEmployee?.name || 'N/A'}
                <div className="text-[11px] text-slate-400">{v.hostEmployee?.department}</div>
              </td>
              <td className="py-3 text-slate-300 text-xs font-mono">
                {v.visitDate} @ {v.expectedTime}
              </td>
              <td className="py-3">
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${getStatusBadge(v.status)}`}>
                  {v.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ShieldCheckIcon() {
  return (
    <svg className="w-5 h-5 text-purple-400 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}
