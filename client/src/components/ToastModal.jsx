// client/src/components/ToastModal.jsx
import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastModal({ toast, onClose }) {
  if (!toast) return null;

  const { type, title, message } = toast;

  const isSuccess = type === 'success';
  const isError = type === 'error';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-2xl p-6 relative border border-slate-200 shadow-2xl text-center space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-700 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center ${
          isSuccess ? 'bg-emerald-100 text-emerald-600' : isError ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
        }`}>
          {isSuccess ? (
            <CheckCircle2 className="w-7 h-7" />
          ) : isError ? (
            <AlertCircle className="w-7 h-7" />
          ) : (
            <Info className="w-7 h-7" />
          )}
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1 leading-relaxed">
            {message}
          </p>
        </div>

        <button
          onClick={onClose}
          className={`w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs shadow-md transition ${
            isSuccess ? 'bg-emerald-600 hover:bg-emerald-700' : isError ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          Understand & Close
        </button>
      </div>
    </div>
  );
}
