// client/src/pages/RegisterVisitor.jsx
import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { UserPlus, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RegisterVisitor() {
  const todayDateStr = new Date().toISOString().split('T')[0];
  const currentTimeStr = new Date().toTimeString().slice(0, 5);

  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    governmentIdType: 'Aadhaar Card',
    governmentIdNumber: '',
    hostEmployeeId: '',
    purpose: '',
    visitDate: todayDateStr,
    expectedTime: currentTimeStr,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [toastModal, setToastModal] = useState(null); // { type: 'error' | 'success', title: string, message: string }
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await API.get('/users?role=EMPLOYEE');
        setEmployees(res.data);
        if (res.data.length > 0) {
          setFormData((prev) => ({ ...prev, hostEmployeeId: res.data[0]._id }));
        }
      } catch (err) {
        console.error('Failed to fetch host employees:', err);
      }
    };
    fetchEmployees();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const triggerToast = (type, title, message) => {
    setError(message);
    setToastModal({ type, title, message });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Date bounds check
    if (formData.visitDate < todayDateStr) {
      triggerToast('error', 'Validation Notice', 'Scheduled visit date cannot be earlier than today.');
      return;
    }

    // Time bounds check if date is today
    if (formData.visitDate === todayDateStr && formData.expectedTime < currentTimeStr) {
      triggerToast('error', 'Validation Notice', "For today's registration, expected arrival time cannot be earlier than current time.");
      return;
    }

    setLoading(true);

    try {
      await API.post('/visits', formData);
      setSuccess('Visitor request registered successfully! Pending host employee approval.');
      setToastModal({
        type: 'success',
        title: 'Registration Successful',
        message: 'Visitor request registered successfully! Redirecting to Visitor Master Log...',
      });
      setTimeout(() => {
        navigate('/visitors');
      }, 1500);
    } catch (err) {
      const rawMsg = err.response?.data?.message || 'Failed to register visitor';
      const cleanMsg = rawMsg.replace(/^Rule \d+ Violation:\s*/i, '');
      triggerToast('error', 'Registration Notice', cleanMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-3">
          <UserPlus className="w-6 h-6 text-blue-600" />
          Register New Visitor Request
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Office Entry Standard — Fill visitor details & host schedule below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        
        {/* Section 1: Visitor Profile */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
            1. Visitor Personal Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Ramesh Kumar"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ramesh@vendor.com"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number (Indian Standard) *</label>
              <input
                type="text"
                required
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company / Organization</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Tata Consultancy Services"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ID Proof Type (India)</label>
              <select
                name="governmentIdType"
                value={formData.governmentIdType}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none font-medium"
              >
                <option value="Aadhaar Card">Aadhaar Card</option>
                <option value="PAN Card">PAN Card</option>
                <option value="Driving License">Driving License</option>
                <option value="Voter ID">Voter ID</option>
                <option value="Passport">Passport</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ID Number</label>
              <input
                type="text"
                name="governmentIdNumber"
                value={formData.governmentIdNumber}
                onChange={handleChange}
                placeholder="e.g. XXXX-XXXX-1234"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none font-medium"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Visit Details */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
            2. Host & Visit Schedule
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Host Employee to Visit *</label>
              <select
                required
                name="hostEmployeeId"
                value={formData.hostEmployeeId}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none font-medium"
              >
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} ({emp.department} Dept) — {emp.phone || emp.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Scheduled Visit Date *</label>
              <input
                type="date"
                required
                min={todayDateStr}
                name="visitDate"
                value={formData.visitDate}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Expected Arrival Time *</label>
              <input
                type="time"
                required
                name="expectedTime"
                value={formData.expectedTime}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Purpose of Visit *</label>
              <textarea
                required
                rows={3}
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                placeholder="e.g. Vendor project discussion & contract signing..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none font-medium"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Inline alert right above Submit button */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? 'Submitting Visitor Registration...' : 'Submit Visitor Registration Request'}
        </button>
      </form>

      {/* Floating Center-Screen Popup Modal for Instant Notice Visibility */}
      {toastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 relative border border-slate-200 shadow-2xl text-center space-y-4">
            <button
              onClick={() => setToastModal(null)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center ${
              toastModal.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
            }`}>
              {toastModal.type === 'success' ? (
                <CheckCircle2 className="w-7 h-7" />
              ) : (
                <AlertCircle className="w-7 h-7" />
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">{toastModal.title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1 leading-relaxed">
                {toastModal.message}
              </p>
            </div>

            <button
              onClick={() => setToastModal(null)}
              className={`w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs shadow-md transition ${
                toastModal.type === 'success' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              Understand & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
