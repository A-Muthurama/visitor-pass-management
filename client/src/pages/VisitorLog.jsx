// client/src/pages/VisitorLog.jsx
import React, { useEffect, useState } from 'react';
import API from '../services/api';
import ActivityTimelineModal from '../components/ActivityTimelineModal';
import ToastModal from '../components/ToastModal';
import ConfirmModal from '../components/ConfirmModal';
import { 
  Search, 
  Filter, 
  LogIn, 
  LogOut, 
  History,
  Trash2,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function VisitorLog() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedVisitId, setSelectedVisitId] = useState(null);
  const [badgeInput, setBadgeInput] = useState('');
  const [checkInModalVisit, setCheckInModalVisit] = useState(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

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
    setSubmitting(true);
    try {
      await API.put(`/visits/${checkInModalVisit._id}/checkin`, { badgeNumber: badgeInput });
      setCheckInModalVisit(null);
      setBadgeInput('');
      await fetchVisits();
      setToast({
        type: 'success',
        title: 'Visitor Checked In',
        message: 'Visitor pass assigned and check-in logged successfully!',
      });
    } catch (err) {
      const rawMsg = err.response?.data?.message || 'Check-in failed';
      const cleanMsg = rawMsg.replace(/^Rule \d+ Violation:\s*/i, '');
      setError(cleanMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const triggerCheckOut = (visit) => {
    setConfirmModal({
      title: 'Confirm Visitor Check-Out',
      message: `Are you sure you want to check out ${visit.visitor?.fullName}?`,
      confirmText: 'Check Out Visitor',
      confirmVariant: 'slate',
      actionType: 'CHECK_OUT',
      targetId: visit._id,
    });
  };

  const triggerDeleteVisit = (visit) => {
    setConfirmModal({
      title: 'Permanently Delete Visitor Record?',
      message: `Are you sure you want to permanently delete the visitor pass record for ${visit.visitor?.fullName}? This action cannot be undone.`,
      confirmText: 'Delete Record',
      confirmVariant: 'danger',
      actionType: 'DELETE',
      targetId: visit._id,
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmModal) return;
    setSubmitting(true);

    try {
      if (confirmModal.actionType === 'CHECK_OUT') {
        await API.put(`/visits/${confirmModal.targetId}/checkout`);
        setToast({
          type: 'info',
          title: 'Visitor Checked Out',
          message: 'Visitor check-out timestamp recorded.',
        });
      } else if (confirmModal.actionType === 'DELETE') {
        await API.delete(`/visits/${confirmModal.targetId}`);
        setToast({
          type: 'error',
          title: 'Record Deleted',
          message: 'Visitor pass record permanently deleted.',
        });
      }
      setConfirmModal(null);
      await fetchVisits();
    } catch (err) {
      const rawMsg = err.response?.data?.message || 'Operation failed';
      setToast({
        type: 'error',
        title: 'Action Failed',
        message: rawMsg.replace(/^Rule \d+ Violation:\s*/i, ''),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'APPROVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CHECKED_IN':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'CHECKED_OUT':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Visitor Master Log</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">Search, filter, check-in approved guests & track live audit trails.</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Visitor Name, Mobile, Host Employee..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none font-medium"
          />
        </div>

        <div className="relative">
          <Filter className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none font-medium"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="CHECKED_IN">CHECKED IN</option>
            <option value="CHECKED_OUT">CHECKED OUT</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500 font-medium">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <span>Loading visitor records...</span>
          </div>
        ) : visits.length === 0 ? (
          <div className="py-12 text-center text-slate-500 font-medium">No visitor logs found matching criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-3 sm:p-4">Visitor Details</th>
                  <th className="p-3 sm:p-4">Purpose of Visit</th>
                  <th className="p-3 sm:p-4">Host Employee</th>
                  <th className="p-3 sm:p-4">ID Proof</th>
                  <th className="p-3 sm:p-4">Schedule / Badge</th>
                  <th className="p-3 sm:p-4">Status</th>
                  <th className="p-3 sm:p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visits.map((v) => (
                  <tr key={v._id} className="hover:bg-slate-50 transition">
                    <td className="p-3 sm:p-4">
                      <div className="font-bold text-slate-900">{v.visitor?.fullName}</div>
                      <div className="text-xs text-slate-500 font-medium">{v.visitor?.email}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{v.visitor?.phone}</div>
                      <div className="text-[11px] text-slate-400 italic mt-0.5">{v.visitor?.company}</div>
                    </td>

                    <td className="p-3 sm:p-4 text-slate-800 font-medium max-w-xs">
                      <span className="inline-block bg-slate-100 border border-slate-200/80 text-slate-800 text-xs px-3 py-1.5 rounded-full font-medium shadow-2xs">
                        {v.purpose || 'N/A'}
                      </span>
                    </td>

                    <td className="p-3 sm:p-4">
                      <div className="font-semibold text-slate-800">{v.hostEmployee?.name}</div>
                      <div className="text-xs text-slate-500">{v.hostEmployee?.department} Dept</div>
                    </td>

                    <td className="p-3 sm:p-4 text-xs font-semibold text-slate-700">
                      <div>{v.visitor?.governmentIdType || 'N/A'}</div>
                      <div className="text-slate-500 font-mono">{v.visitor?.governmentIdNumber || '—'}</div>
                    </td>

                    <td className="p-3 sm:p-4 text-xs font-mono">
                      <div className="text-slate-800 font-semibold">{new Date(v.visitDate).toLocaleDateString('en-IN')}</div>
                      <div className="text-slate-500">{v.expectedTime}</div>
                      {v.badgeNumber && (
                        <div className="mt-1.5">
                          <span className="inline-block bg-slate-100 border border-slate-200/80 text-slate-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                            Badge #{v.badgeNumber}
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="p-3 sm:p-4">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${getStatusBadge(v.status)}`}>
                        {v.status}
                      </span>
                    </td>

                    <td className="p-3 sm:p-4 text-right space-x-1 sm:space-x-2 whitespace-nowrap">
                      {v.status === 'APPROVED' && (
                        <button
                          onClick={() => setCheckInModalVisit(v)}
                          className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition border bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-1 shadow-xs"
                        >
                          <LogIn className="w-3.5 h-3.5" /> Check In
                        </button>
                      )}

                      {v.status === 'CHECKED_IN' && (
                        <button
                          onClick={() => triggerCheckOut(v)}
                          className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition border bg-slate-800 text-white hover:bg-slate-900 inline-flex items-center gap-1 shadow-xs"
                        >
                          <LogOut className="w-3.5 h-3.5" /> Check Out
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedVisitId(v._id)}
                        className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition border bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 inline-flex items-center gap-1"
                      >
                        <History className="w-3.5 h-3.5 text-slate-500" /> Audit Log
                      </button>

                      <button
                        onClick={() => triggerDeleteVisit(v)}
                        className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition border bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 inline-flex items-center gap-1"
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

      {/* Enhanced Check-In Modal */}
      {checkInModalVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 relative border border-slate-200 shadow-2xl">
            <button onClick={() => setCheckInModalVisit(null)} className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-700">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <LogIn className="w-5 h-5 text-blue-600" /> Check In Visitor
            </h3>
            <p className="text-xs text-slate-500 font-medium mb-4">
              Visitor: <strong className="text-slate-800">{checkInModalVisit.visitor?.fullName}</strong> ({checkInModalVisit.visitor?.phone})
            </p>

            <form onSubmit={handleCheckInSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assign Visitor Pass / Badge Number *</label>
                <input
                  type="text"
                  required
                  disabled={submitting}
                  value={badgeInput}
                  onChange={(e) => setBadgeInput(e.target.value)}
                  placeholder="e.g. VISITOR-102"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none font-medium disabled:opacity-50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setCheckInModalVisit(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Checking In Visitor...</span>
                    </>
                  ) : (
                    <span>Confirm Check-In</span>
                  )}
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

      <ToastModal toast={toast} onClose={() => setToast(null)} />
      
      <ConfirmModal
        confirm={confirmModal}
        loading={submitting}
        onClose={() => setConfirmModal(null)}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
}
