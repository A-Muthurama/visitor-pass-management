// client/src/components/ConfirmModal.jsx
import React from 'react';
import { AlertTriangle, Trash2, LogOut, X, Loader2 } from 'lucide-react';

export default function ConfirmModal({ confirm, onClose, onConfirm, loading }) {
  if (!confirm) return null;

  const { title, message, confirmText, confirmVariant } = confirm;

  const isDanger = confirmVariant === 'danger';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-2xl p-6 relative border border-slate-200 shadow-2xl text-center space-y-4">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-700 rounded-lg transition disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center ${
          isDanger ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-800'
        }`}>
          {isDanger ? (
            <Trash2 className="w-6 h-6" />
          ) : (
            <LogOut className="w-6 h-6" />
          )}
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1 leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="w-1/2 py-2.5 px-4 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`w-1/2 py-2.5 px-4 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 ${
              isDanger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{confirmText || 'Confirm'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
