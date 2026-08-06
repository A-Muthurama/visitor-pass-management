// client/src/components/ActivityTimelineModal.jsx
import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { X, Clock, CheckCircle, XCircle, LogIn, LogOut, FileText, User } from 'lucide-react';

export default function ActivityTimelineModal({ visitId, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await API.get(`/visits/${visitId}/history`);
        setLogs(res.data);
      } catch (err) {
        console.error('Failed to load activity logs:', err);
      } finally {
        setLoading(false);
      }
    };
    if (visitId) fetchHistory();
  }, [visitId]);

  const getActionBadge = (action) => {
    switch (action) {
      case 'CREATED':
        return { icon: FileText, color: 'text-blue-700 bg-blue-50 border-blue-200' };
      case 'APPROVED':
        return { icon: CheckCircle, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
      case 'REJECTED':
        return { icon: XCircle, color: 'text-rose-700 bg-rose-50 border-rose-200' };
      case 'CHECKED_IN':
        return { icon: LogIn, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
      case 'CHECKED_OUT':
        return { icon: LogOut, color: 'text-slate-700 bg-slate-100 border-slate-200' };
      case 'CANCELLED':
        return { icon: XCircle, color: 'text-slate-500 bg-slate-50 border-slate-200' };
      default:
        return { icon: Clock, color: 'text-slate-600 bg-slate-100 border-slate-200' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 relative border border-slate-200 shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-1">
          <Clock className="w-5 h-5 text-blue-600" />
          Audit Trail & Activity History
        </h3>
        <p className="text-xs text-slate-500 font-medium mb-6">Complete timeline of state transitions and user actions.</p>

        {loading ? (
          <div className="py-12 text-center text-slate-500 font-medium">Loading activity history...</div>
        ) : logs.length === 0 ? (
          <div className="py-8 text-center text-slate-500 font-medium">No activity history recorded yet.</div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {logs.map((log) => {
              const { icon: ActionIcon, color } = getActionBadge(log.action);
              return (
                <div key={log._id} className="relative flex flex-col gap-1">
                  <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border flex items-center justify-center ${color}`}>
                    <ActionIcon className="w-3 h-3" />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 uppercase tracking-wider">{log.action}</span>
                    <span className="text-slate-400 font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 mt-1">
                    <p className="font-semibold text-slate-800">{log.details || 'No details provided'}</p>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium mt-1">
                      <User className="w-3 h-3 text-blue-600" />
                      <span>Performed by: {log.performedBy ? `${log.performedBy.name} (${log.performedBy.role})` : 'System'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
