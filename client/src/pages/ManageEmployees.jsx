// client/src/pages/ManageEmployees.jsx
import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { Users, UserPlus, Shield, Mail, Phone, Building, CheckCircle, XCircle, Plus, X } from 'lucide-react';

export default function ManageEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'password123',
    role: 'EMPLOYEE',
    department: 'Engineering',
    phone: '',
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await API.post('/users', formData);
      setModalOpen(false);
      setFormData({
        name: '',
        email: '',
        password: 'password123',
        role: 'EMPLOYEE',
        department: 'Engineering',
        phone: '',
      });
      fetchEmployees();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await API.delete(`/users/${id}`);
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <Users className="w-6 h-6 text-purple-400" />
            Manage Organization Staff & Users
          </h1>
          <p className="text-sm text-slate-400 mt-1">Admin Management of Employees, Receptionists, and User Roles.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-purple-500/20 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New User
        </button>
      </div>

      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading user accounts...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/60 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="p-4">User Details</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4">
                      <div className="font-bold text-slate-100">{emp.name}</div>
                      <div className="text-xs text-slate-400">{emp.email} | {emp.phone || 'No Phone'}</div>
                    </td>

                    <td className="p-4">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                        emp.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' :
                        emp.role === 'RECEPTIONIST' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' :
                        'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}>
                        {emp.role}
                      </span>
                    </td>

                    <td className="p-4 text-slate-300 text-xs font-medium">
                      {emp.department}
                    </td>

                    <td className="p-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        emp.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {emp.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleToggleActive(emp._id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                          emp.isActive 
                            ? 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20' 
                            : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                        }`}
                      >
                        {emp.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md rounded-2xl p-6 relative border border-slate-700">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-2">Create New User Account</h3>

            {error && <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl mb-4">{error}</div>}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input type="text" required name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Sarah Connor" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:border-purple-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input type="email" required name="email" value={formData.email} onChange={handleChange} placeholder="sarah@system.com" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:border-purple-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Role</label>
                  <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:border-purple-500 focus:outline-none">
                    <option value="EMPLOYEE">EMPLOYEE</option>
                    <option value="RECEPTIONIST">RECEPTIONIST</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                  <input type="text" name="department" value={formData.department} onChange={handleChange} placeholder="HR / Tech" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:border-purple-500 focus:outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-lg">Save User Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
