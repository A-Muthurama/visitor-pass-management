// client/src/pages/VisitorLog.jsx
import React, { useEffect, useState } from 'react';
import API from '../services/api';
import ActivityTimelineModal from '../components/ActivityTimelineModal';
import { 
  Search, 
  Filter, 
  LogIn, 
  LogOut, 
  Clock, 
  CheckCircle, 
  XCircle, 
  History,
  FileText,
  Badge,
  X
} from 'lucide-react';

export default function VisitorLog() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedVisitId, setSelectedVisitId] = useState(null);
  const [badgeInput, setBadgeInput] = useState('');
  const [checkInModalVisit, setCheckInModalVisit] = useState(null);
  const [error, setError] = useState('');

  const fetchVisits = async () => {
    try {
      setLoading(true);
      let url = '/visits?';
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (statusFilter) url += `status=${statusFilter}&`;
      const res = await API.get(url);
      setVisits(res.data);
    } catch (err) {
      console.error('Failed to fetch visits:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, [search, statusFilter]);

  const handleCheckInSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await API.put(`/visits/${checkInModalVisit._id}/checkin`, { badgeNumber: badgeInput });
      setCheckInModalVisit(null);
      setBadgeInput('');
      fetchVisits();
    } catch (err) {
      setError(err.response?.data?.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async (visitId) => {
    if (!window.confirm('Are you sure you want to check out this visitor?')) return;
    try {
      await API.put(`/visits/${visitId}/checkout`);
      fetchVisits();
    } catch (err) {
      alert(err.response?.data?.message || 'Check-out failed');
    }
  };

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
      case 'CANCELLED':
        return 'bg-slate-800 text-slate-500 border-slate-700';
      default:
        return 'bg-slate-800 text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white">Visitor Pass & Log Master</h1>
          <p className="text-sm text-slate-400 mt-1">Search, check in, check out, and review full activity audit logs.</p>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Visitor Name, Phone, Host Employee, or Badge..."
            className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none w-full sm:w-auto"
          >
            <option value="">All Statuses (Excl. Cancelled)</option>
            <option value="PENDING">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="CHECKED_IN">Currently Checked In</option>
            <option value="CHECKED_OUT">Checked Out</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Visitors List Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading visitor logs...</div>
        ) : visits.length === 0 ? (
          <div className="py-12 text-center text-slate-400">No matching visitor records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/60 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Visitor Info</th>
                  <th className="p-4">Host Employee</th>
                  <th className="p-4">Visit Date & Time</th>
                  <th className="p-4">Status & Badge</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {visits.map((v) => (
                  <tr key={v._id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4">
                      <div className="font-bold text-slate-100">{v.visitor?.fullName || 'Unknown'}</div>
                      <div className="text-xs text-slate-400">{v.visitor?.email} | {v.visitor?.phone}</div>
                      <div className="text-[11px] text-cyan-400 mt-0.5">{v.visitor?.company || 'Personal'}</div>
                    </td>

                    <td className="p-4">
                      <div className="font-medium text-slate-200">{v.hostEmployee?.name || 'N/A'}</div>
                      <div className="text-xs text-slate-400">{v.hostEmployee?.department} Dept</div>
                    </td>

                    <td className="p-4 font-mono text-xs text-slate-300">
                      <div>{v.visitDate}</div>
                      <div className="text-slate-400">Expected: {v.expectedTime}</div>
                      {v.checkInTime && <div className="text-emerald-400 text-[11px]">In: {new Date(v.checkInTime).toLocaleTimeString()}</div>}
                      {v.checkOutTime && <div className="text-amber-400 text-[11px]">Out: {new Date(v.checkOutTime).toLocaleTimeString()}</div>}
                    </td>

                    <td className="p-4">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${getStatusBadge(v.status)}`}>
                        {v.status}
                      </span>
                      {v.badgeNumber && (
                        <div className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                          Badge: {v.badgeNumber}
                        </div>
                      )}
                    </td>

                    <td className="p-4 text-right space-x-2">
                      {v.status === 'APPROVED' && (
                        <button
                          onClick={() => setCheckInModalVisit(v)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-md flex items-center gap-1 inline-flex"
                        >
                          <LogIn className="w-3.5 h-3.5" /> Check In
                        </button>
                      )}

                      {v.status === 'CHECKED_IN' && (
                        <button
                          onClick={() => handleCheckOut(v._id)}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition shadow-md flex items-center gap-1 inline-flex"
                        >
                          <LogOut className="w-3.5 h-3.5" /> Check Out
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedVisitId(v._id)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition border border-slate-700 inline-flex items-center gap-1"
                      >
                        <History className="w-3.5 h-3.5 text-cyan-400" /> History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Check-in Modal with Badge Number Assignment */}
      {checkInModalVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md rounded-2xl p-6 relative border border-slate-700">
            <button
              onClick={() => setCheckInModalVisit(null)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
              <LogIn className="w-5 h-5 text-emerald-400" />
              Check In Visitor
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Checking in <strong className="text-slate-200">{checkInModalVisit.visitor?.fullName}</strong> visiting <strong className="text-slate-200">{checkInModalVisit.hostEmployee?.name}</strong>.
            </p>

            {error && <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl mb-4">{error}</div>}

            <form onSubmit={handleCheckInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assign Badge / Pass Number</label>
                <input
                  type="text"
                  required
                  value={badgeInput}
                  onChange={(e) => setBadgeInput(e.target.value)}
                  placeholder="e.g. VIP-001 or PASS-44"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCheckInModalVisit(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg"
                >
                  Confirm Check In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activity History Modal */}
      {selectedVisitId && (
        <ActivityTimelineModal
          visitId={selectedVisitId}
          onClose={() => setSelectedVisitId(null)}
        />
      )}
    </div>
  );
}
