// client/src/pages/ManageEmployees.jsx
import React, { useEffect, useState } from 'react';
import API from '../services/api';
import ToastModal from '../components/ToastModal';
import ConfirmModal from '../components/ConfirmModal';
import { Users, Plus, X, Edit2, Trash2, Phone, Mail, Building, UserCheck, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function ManageEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null); // { title, message, targetUser }

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'EMPLOYEE',
    department: 'Engineering',
  });

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await API.get('/users');
      setEmployees(res.data);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const openCreateModal = () => {
    setEditingUser(null);
    setShowPassword(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: 'password123',
      role: 'EMPLOYEE',
      department: 'Engineering',
    });
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setShowPassword(false);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      password: '',
      role: user.role || 'EMPLOYEE',
      department: user.department || 'General',
    });
    setError('');
    setModalOpen(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (editingUser) {
        await API.put(`/users/${editingUser._id}`, formData);
        setToast({
          type: 'success',
          title: 'Account Updated',
          message: `Staff user account for ${formData.name} updated successfully.`,
        });
      } else {
        await API.post('/users', formData);
        setToast({
          type: 'success',
          title: 'Account Created',
          message: `New staff user account for ${formData.name} created successfully.`,
        });
      }
      setModalOpen(false);
      await fetchEmployees();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save user account');
    } finally {
      setSubmitting(false);
    }
  };

  const triggerDeleteUser = (user) => {
    setConfirmModal({
      title: 'Permanently Delete Staff Account?',
      message: `Are you sure you want to delete staff account '${user.name}' (${user.email})? This action cannot be undone.`,
      confirmText: 'Delete Staff User',
      confirmVariant: 'danger',
      targetUser: user,
    });
  };

  const handleConfirmDelete = async () => {
    if (!confirmModal) return;
    setSubmitting(true);
    try {
      await API.delete(`/users/${confirmModal.targetUser._id}`);
      setToast({
        type: 'error',
        title: 'Account Deleted',
        message: `Staff user account '${confirmModal.targetUser.name}' permanently deleted.`,
      });
      setConfirmModal(null);
      await fetchEmployees();
    } catch (err) {
      setToast({
        type: 'error',
        title: 'Delete Failed',
        message: err.response?.data?.message || 'Failed to delete user account',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Users className="w-6 h-6 text-purple-600" />
            Manage Staff Accounts & System Roles
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">Admin User Management for Employees, Receptionists, and Administrators.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-md shadow-purple-600/20 transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add User Account
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500 font-medium">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            <span>Loading user accounts...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-3 sm:p-4">User Details</th>
                  <th className="p-3 sm:p-4">Mobile Number</th>
                  <th className="p-3 sm:p-4">System Role</th>
                  <th className="p-3 sm:p-4">Department</th>
                  <th className="p-3 sm:p-4">Status</th>
                  <th className="p-3 sm:p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-50 transition">
                    <td className="p-3 sm:p-4">
                      <div className="font-bold text-slate-900">{emp.name}</div>
                      <div className="text-xs text-slate-500">{emp.email}</div>
                    </td>

                    <td className="p-3 sm:p-4 text-slate-700 font-mono text-xs font-semibold">
                      {emp.phone ? (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                          <span>{emp.phone}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-normal">Not Provided</span>
                      )}
                    </td>

                    <td className="p-3 sm:p-4">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                        emp.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        emp.role === 'RECEPTIONIST' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {emp.role}
                      </span>
                    </td>

                    <td className="p-3 sm:p-4 text-slate-700 text-xs font-semibold">
                      {emp.department}
                    </td>

                    <td className="p-3 sm:p-4">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        emp.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {emp.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>

                    <td className="p-3 sm:p-4 text-right space-x-1.5 sm:space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => openEditModal(emp)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold transition border bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 inline-flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-blue-600" /> Edit
                      </button>

                      <button
                        onClick={() => triggerDeleteUser(emp)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold transition border bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 inline-flex items-center gap-1"
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

      {/* Add / Edit User Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl p-5 sm:p-6 relative border border-slate-200 shadow-xl">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-700">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {editingUser ? 'Edit Staff Account' : 'Create Staff User Account'}
            </h3>

            {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl mb-4">{error}</div>}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Ramesh Sharma"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Work Email Address *</label>
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ramesh@company.in"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-none font-medium"
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
                  placeholder="e.g. +91 98765 43210"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">System Role *</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-none font-medium"
                  >
                    <option value="EMPLOYEE">EMPLOYEE</option>
                    <option value="RECEPTIONIST">RECEPTIONIST</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="IT / HR / Admin"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {editingUser ? 'New Password (Leave blank to keep current)' : 'Password *'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!editingUser}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={editingUser ? '••••••••' : 'password123'}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-3.5 pr-10 py-2 text-sm text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-none font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2 p-1 text-slate-400 hover:text-slate-700 rounded-lg transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Account...</span>
                    </>
                  ) : (
                    <span>{editingUser ? 'Update Staff Account' : 'Save User Account'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastModal toast={toast} onClose={() => setToast(null)} />

      <ConfirmModal
        confirm={confirmModal}
        loading={submitting}
        onClose={() => setConfirmModal(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
