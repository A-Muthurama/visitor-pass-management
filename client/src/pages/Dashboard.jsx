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
  CheckCircle, 
  ArrowUpRight,
  TrendingUp,
  FileCheck,
  Building
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
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const renderAdminDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Employees" value={stats?.totalEmployees} icon={Users} color="text-purple-600" bg="bg-purple-50" border="border-purple-200" />
        <StatCard title="Today's Visitors" value={stats?.todayVisitors} icon={Calendar} color="text-blue-600" bg="bg-blue-50" border="border-blue-200" />
        <StatCard title="Currently Inside" value={stats?.currentlyInside} icon={LogIn} color="text-emerald-600" bg="bg-emerald-50" border="border-emerald-200" />
        <StatCard title="Pending Approvals" value={stats?.pendingRequests} icon={Clock} color="text-amber-600" bg="bg-amber-50" border="border-amber-200" />
        <StatCard title="Scheduled Visitors" value={stats?.scheduledVisitors} icon={UserCheck} color="text-indigo-600" bg="bg-indigo-50" border="border-indigo-200" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Recent Visitor Logs
            </h3>
            <Link to="/visitors" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
              View All Log <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <VisitTable visits={recentVisits} />
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building className="w-5 h-5 text-blue-600" /> Administrative Actions
          </h3>
          <div className="space-y-2.5">
            <Link to="/employees" className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition text-slate-800 text-sm font-semibold">
              <span>Manage Staff Users</span>
              <Users className="w-4 h-4 text-blue-600" />
            </Link>
            <Link to="/reports" className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition text-slate-800 text-sm font-semibold">
              <span>Visitor Analytics Reports</span>
              <FileCheck className="w-4 h-4 text-purple-600" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReceptionistDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Visitors" value={stats?.todayVisitors} icon={Calendar} color="text-blue-600" bg="bg-blue-50" border="border-blue-200" />
        <StatCard title="Currently Inside" value={stats?.currentlyInside} icon={LogIn} color="text-emerald-600" bg="bg-emerald-50" border="border-emerald-200" />
        <StatCard title="Today Pending" value={stats?.todayPending} icon={Clock} color="text-amber-600" bg="bg-amber-50" border="border-amber-200" />
        <StatCard title="Today Approved" value={stats?.todayApproved} icon={CheckCircle} color="text-indigo-600" bg="bg-indigo-50" border="border-indigo-200" />
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Front Desk Check-In Desk</h3>
            <p className="text-xs text-slate-500 font-medium">Register visitors and issue visitor entry passes.</p>
          </div>
          <Link to="/register-visitor" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition flex items-center gap-1.5 self-start">
            + Register New Visitor
          </Link>
        </div>
        <VisitTable visits={recentVisits} />
      </div>
    </div>
  );

  const renderEmployeeDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Pending My Approval" value={stats?.pendingRequests} icon={Clock} color="text-amber-600" bg="bg-amber-50" border="border-amber-200" highlight={stats?.pendingRequests > 0} />
        <StatCard title="Approved Visits Today" value={stats?.todayApprovedVisits} icon={CheckCircle} color="text-emerald-600" bg="bg-emerald-50" border="border-emerald-200" />
        <StatCard title="Visitors Currently Visiting Me" value={stats?.activeVisitorsInside} icon={LogIn} color="text-blue-600" bg="bg-blue-50" border="border-blue-200" />
        <StatCard title="Total Visit History" value={stats?.totalHistory} icon={Users} color="text-purple-600" bg="bg-purple-50" border="border-purple-200" />
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">My Incoming Visitor Requests</h3>
            <p className="text-xs text-slate-500 font-medium">Review and respond to guest visit requests.</p>
          </div>
          <Link to="/requests" className="text-xs font-bold text-blue-600 hover:underline">
            Manage Requests &rarr;
          </Link>
        </div>
        <VisitTable visits={recentVisits} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, <span className="text-blue-600">{user.name}</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Logged in as <span className="font-bold text-slate-800">{user.role}</span> ({user.department} Department)
          </p>
        </div>
        <div className="text-left sm:text-right bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">System Time</div>
          <div className="text-sm font-bold text-slate-800 font-mono">{new Date().toLocaleTimeString()}</div>
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
    <div className={`bg-white p-4 rounded-2xl border ${border} relative overflow-hidden transition-all shadow-xs`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
          <p className={`text-2xl font-black mt-1 text-slate-900 ${highlight ? 'text-amber-600' : ''}`}>{value || 0}</p>
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
    return <div className="py-8 text-center text-sm text-slate-400 font-medium">No recent visitor records found.</div>;
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'APPROVED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'CHECKED_IN':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CHECKED_OUT':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <th className="pb-3">Visitor Name</th>
            <th className="pb-3">Host Employee</th>
            <th className="pb-3">Date & Time</th>
            <th className="pb-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {visits.map((v) => (
            <tr key={v._id} className="hover:bg-slate-50 transition">
              <td className="py-3 font-semibold text-slate-900">
                {v.visitor?.fullName || 'N/A'}
                <div className="text-[11px] text-slate-500 font-normal">{v.visitor?.company}</div>
              </td>
              <td className="py-3 text-slate-700 font-medium">
                {v.hostEmployee?.name || 'N/A'}
                <div className="text-[11px] text-slate-400 font-normal">{v.hostEmployee?.department}</div>
              </td>
              <td className="py-3 text-slate-600 text-xs font-mono">
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
