// client/src/pages/VisitorLog.jsx
import React, { useEffect, useState } from 'react';
import API from '../services/api';
import ActivityTimelineModal from '../components/ActivityTimelineModal';
import { 
  Search, 
  Filter, 
  LogIn, 
  LogOut, 
  History,
  Trash2,
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

  const handleDeleteVisit = async (visit) => {
    if (!window.confirm(`Are you sure you want to permanently delete visitor pass record for '${visit.visitor?.fullName}'?`)) return;
    try {
      await API.delete(`/visits/${visit._id}`);
      fetchVisits();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete record');
    }
  };

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
      case 'CANCELLED':
        return 'bg-slate-100 text-slate-400 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Visitor Pass & Log Master</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">Search, check in, check out, delete, and view activity audit timelines.</p>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Visitor Name, Mobile (+91), Host, or Badge..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none w-full sm:w-auto font-medium"
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
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-500 font-medium">Loading visitor logs...</div>
        ) : visits.length === 0 ? (
          <div className="py-12 text-center text-slate-500 font-medium">No matching visitor records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-3 sm:p-4">Visitor Info</th>
                  <th className="p-3 sm:p-4">Host Employee</th>
                  <th className="p-3 sm:p-4">Schedule & Times</th>
                  <th className="p-3 sm:p-4">Status & Badge</th>
                  <th className="p-3 sm:p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visits.map((v) => (
                  <tr key={v._id} className="hover:bg-slate-50 transition">
                    <td className="p-3 sm:p-4">
                      <div className="font-bold text-slate-900">{v.visitor?.fullName || 'Unknown'}</div>
                      <div className="text-xs text-slate-500 font-mono">{v.visitor?.phone}</div>
                      <div className="text-[11px] text-blue-600 font-semibold mt-0.5">{v.visitor?.company || 'Personal'}</div>
                    </td>

                    <td className="p-3 sm:p-4">
                      <div className="font-semibold text-slate-800">{v.hostEmployee?.name || 'N/A'}</div>
                      <div className="text-xs text-slate-500">{v.hostEmployee?.department} Dept</div>
                    </td>

                    <td className="p-3 sm:p-4 font-mono text-xs text-slate-700">
                      <div>{v.visitDate}</div>
                      <div className="text-slate-500">Exp: {v.expectedTime}</div>
                      {v.checkInTime && <div className="text-emerald-700 font-bold text-[11px]">In: {new Date(v.checkInTime).toLocaleTimeString()}</div>}
                      {v.checkOutTime && <div className="text-slate-600 text-[11px]">Out: {new Date(v.checkOutTime).toLocaleTimeString()}</div>}
                    </td>

                    <td className="p-3 sm:p-4">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${getStatusBadge(v.status)}`}>
                        {v.status}
                      </span>
                      {v.badgeNumber && (
                        <div className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                          Pass: {v.badgeNumber}
                        </div>
                      )}
                    </td>

                    <td className="p-3 sm:p-4 text-right space-x-1.5 sm:space-x-2 whitespace-nowrap">
                      {v.status === 'APPROVED' && (
                        <button
                          onClick={() => setCheckInModalVisit(v)}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs inline-flex items-center gap-1"
                        >
                          <LogIn className="w-3.5 h-3.5" /> Check In
                        </button>
                      )}

                      {v.status === 'CHECKED_IN' && (
                        <button
                          onClick={() => handleCheckOut(v._id)}
                          className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition shadow-xs inline-flex items-center gap-1"
                        >
                          <LogOut className="w-3.5 h-3.5" /> Check Out
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedVisitId(v._id)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition border border-slate-200 inline-flex items-center gap-1"
                      >
                        <History className="w-3.5 h-3.5 text-blue-600" /> History
                      </button>

                      <button
                        onClick={() => handleDeleteVisit(v)}
                        className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition border border-rose-200 inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Check-in Modal */}
      {checkInModalVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl p-5 sm:p-6 relative border border-slate-200 shadow-xl">
            <button
              onClick={() => setCheckInModalVisit(null)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2">
              <LogIn className="w-5 h-5 text-emerald-600" />
              Issue Pass & Check In Visitor
            </h3>
            <p className="text-xs text-slate-500 font-medium mb-4">
              Checking in <strong className="text-slate-800">{checkInModalVisit.visitor?.fullName}</strong> visiting <strong className="text-slate-800">{checkInModalVisit.hostEmployee?.name}</strong>.
            </p>

            {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl mb-4">{error}</div>}

            <form onSubmit={handleCheckInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assign Visitor Pass Number / Badge</label>
                <input
                  type="text"
                  required
                  value={badgeInput}
                  onChange={(e) => setBadgeInput(e.target.value)}
                  placeholder="e.g. VIP-001 or PASS-44"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCheckInModalVisit(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Confirm Check In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedVisitId && (
        <ActivityTimelineModal
          visitId={selectedVisitId}
          onClose={() => setSelectedVisitId(null)}
        />
      )}
    </div>
  );
}
