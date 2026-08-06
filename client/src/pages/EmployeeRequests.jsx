// client/src/pages/EmployeeRequests.jsx
import React, { useEffect, useState } from 'react';
import API from '../services/api';
import ActivityTimelineModal from '../components/ActivityTimelineModal';
import { 
  CheckSquare, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MessageSquare, 
  History, 
  AlertCircle 
} from 'lucide-react';

export default function EmployeeRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVisitId, setSelectedVisitId] = useState(null);
  const [actionModal, setActionModal] = useState(null); // { visit, action: 'APPROVED' | 'REJECTED' }
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await API.get('/visits');
      setRequests(res.data);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await API.put(`/visits/${actionModal.visit._id}/status`, {
        status: actionModal.action,
        remarks: remarks || (actionModal.action === 'APPROVED' ? 'Approved by host' : 'Rejected by host'),
      });
      setActionModal(null);
      setRemarks('');
      fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update request status');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'APPROVED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'REJECTED':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'CHECKED_IN':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-2xl border border-slate-800">
        <h1 className="text-2xl font-black text-white flex items-center gap-3">
          <CheckSquare className="w-6 h-6 text-cyan-400" />
          My Visitor Approvals & Requests
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Review visitor requests assigned to you. Enforces Rule 5 (Max 3 pending requests).
        </p>
      </div>

      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading your visitor requests...</div>
        ) : requests.length === 0 ? (
          <div className="py-12 text-center text-slate-400">You currently have no visitor requests.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/60 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Visitor Info</th>
                  <th className="p-4">Purpose</th>
                  <th className="p-4">Visit Schedule</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {requests.map((req) => (
                  <tr key={req._id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4">
                      <div className="font-bold text-slate-100">{req.visitor?.fullName}</div>
                      <div className="text-xs text-slate-400">{req.visitor?.email}</div>
                      <div className="text-[11px] text-cyan-400 font-semibold">{req.visitor?.company || 'Individual'}</div>
                    </td>

                    <td className="p-4 max-w-xs text-slate-300 text-xs">
                      {req.purpose}
                      {req.remarks && (
                        <div className="mt-1 text-[11px] text-amber-300 italic flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> Remarks: "{req.remarks}"
                        </div>
                      )}
                    </td>

                    <td className="p-4 text-xs font-mono text-slate-300">
                      <div>Date: {req.visitDate}</div>
                      <div className="text-slate-400">Time: {req.expectedTime}</div>
                    </td>

                    <td className="p-4">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${getStatusBadge(req.status)}`}>
                        {req.status}
                      </span>
                    </td>

                    <td className="p-4 text-right space-x-2">
                      {req.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => setActionModal({ visit: req, action: 'APPROVED' })}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-md inline-flex items-center gap-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => setActionModal({ visit: req, action: 'REJECTED' })}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition shadow-md inline-flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => setSelectedVisitId(req._id)}
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

      {/* Approval/Rejection Modal with Remarks */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md rounded-2xl p-6 relative border border-slate-700">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
              {actionModal.action === 'APPROVED' ? (
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400" />
              )}
              {actionModal.action === 'APPROVED' ? 'Approve Visitor Request' : 'Reject Visitor Request'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Visitor: <strong className="text-slate-200">{actionModal.visit.visitor?.fullName}</strong> ({actionModal.visit.purpose})
            </p>

            {error && <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl mb-4">{error}</div>}

            <form onSubmit={handleActionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Add Remarks / Notes (Optional)</label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder={actionModal.action === 'APPROVED' ? 'e.g. Approved. Please escort to Conference Room 2.' : 'e.g. Reschedule needed due to out-of-office.'}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-white rounded-xl text-xs font-bold shadow-lg ${
                    actionModal.action === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  Confirm {actionModal.action === 'APPROVED' ? 'Approval' : 'Rejection'}
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
