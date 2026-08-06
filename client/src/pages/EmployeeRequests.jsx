// client/src/pages/EmployeeRequests.jsx
import React, { useEffect, useState } from 'react';
import API from '../services/api';
import ActivityTimelineModal from '../components/ActivityTimelineModal';
import { 
  CheckSquare, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  History 
} from 'lucide-react';

export default function EmployeeRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVisitId, setSelectedVisitId] = useState(null);
  const [actionModal, setActionModal] = useState(null);
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
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'APPROVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'CHECKED_IN':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <CheckSquare className="w-6 h-6 text-blue-600" />
          My Visitor Approvals & Requests
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Review visitor requests assigned to you. Enforces Rule 5 (Max 3 pending requests).
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-500 font-medium">Loading your visitor requests...</div>
        ) : requests.length === 0 ? (
          <div className="py-12 text-center text-slate-500 font-medium">You currently have no visitor requests.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Visitor Info</th>
                  <th className="p-4">Purpose</th>
                  <th className="p-4">Visit Schedule</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((req) => (
                  <tr key={req._id} className="hover:bg-slate-50 transition">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{req.visitor?.fullName}</div>
                      <div className="text-xs text-slate-500">{req.visitor?.email}</div>
                      <div className="text-[11px] text-blue-600 font-semibold">{req.visitor?.company || 'Individual'}</div>
                    </td>

                    <td className="p-4 max-w-xs text-slate-700 text-xs font-medium">
                      {req.purpose}
                      {req.remarks && (
                        <div className="mt-1 text-[11px] text-slate-500 italic flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 text-blue-600" /> Remarks: "{req.remarks}"
                        </div>
                      )}
                    </td>

                    <td className="p-4 text-xs font-mono text-slate-700">
                      <div>Date: {req.visitDate}</div>
                      <div className="text-slate-500">Time: {req.expectedTime}</div>
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
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs inline-flex items-center gap-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => setActionModal({ visit: req, action: 'REJECTED' })}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition shadow-xs inline-flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => setSelectedVisitId(req._id)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition border border-slate-200 inline-flex items-center gap-1"
                      >
                        <History className="w-3.5 h-3.5 text-blue-600" /> History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 relative border border-slate-200 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2">
              {actionModal.action === 'APPROVED' ? (
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600" />
              )}
              {actionModal.action === 'APPROVED' ? 'Approve Visitor Request' : 'Reject Visitor Request'}
            </h3>
            <p className="text-xs text-slate-500 font-medium mb-4">
              Visitor: <strong className="text-slate-900">{actionModal.visit.visitor?.fullName}</strong> ({actionModal.visit.purpose})
            </p>

            {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl mb-4">{error}</div>}

            <form onSubmit={handleActionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Add Remarks / Instructions (Optional)</label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder={actionModal.action === 'APPROVED' ? 'e.g. Approved. Escort visitor to Executive Boardroom.' : 'e.g. Reschedule needed due to conflicting meeting.'}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none font-medium"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-white rounded-xl text-xs font-bold shadow-md ${
                    actionModal.action === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
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
