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
        return { icon: FileText, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
      case 'APPROVED':
        return { icon: CheckCircle, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
      case 'REJECTED':
        return { icon: XCircle, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
      case 'CHECKED_IN':
        return { icon: LogIn, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' };
      case 'CHECKED_OUT':
        return { icon: LogOut, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
      case 'CANCELLED':
        return { icon: XCircle, color: 'text-slate-400 bg-slate-500/10 border-slate-500/30' };
      default:
        return { icon: Clock, color: 'text-slate-400 bg-slate-800 border-slate-700' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass-card w-full max-w-lg rounded-2xl p-6 relative border border-slate-700 shadow-2xl animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
          <Clock className="w-5 h-5 text-cyan-400" />
          Audit Trail & Activity Log
        </h3>
        <p className="text-xs text-slate-400 mb-6">Complete timeline of state transitions and user actions.</p>

        {loading ? (
          <div className="py-12 text-center text-slate-400 animate-pulse">Loading activity history...</div>
        ) : logs.length === 0 ? (
          <div className="py-8 text-center text-slate-400">No activity history recorded yet.</div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-700">
            {logs.map((log) => {
              const { icon: ActionIcon, color } = getActionBadge(log.action);
              return (
                <div key={log._id} className="relative flex flex-col gap-1">
                  <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border flex items-center justify-center ${color}`}>
                    <ActionIcon className="w-3 h-3" />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 uppercase tracking-wider">{log.action}</span>
                    <span className="text-slate-400">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-slate-300 bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50 mt-1">
                    <p className="font-medium text-slate-200">{log.details || 'No details provided'}</p>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                      <User className="w-3 h-3" />
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
