// client/src/pages/ManageEmployees.jsx
import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { Users, Plus, X } from 'lucide-react';

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Users className="w-6 h-6 text-purple-600" />
            Manage Staff Accounts & System Roles
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Admin User Management for Employees, Receptionists, and Administrators.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-md shadow-purple-600/20 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add User Account
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-500 font-medium">Loading user accounts...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-4">User Details</th>
                  <th className="p-4">System Role</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-50 transition">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{emp.name}</div>
                      <div className="text-xs text-slate-500">{emp.email} | {emp.phone || 'No Phone'}</div>
                    </td>

                    <td className="p-4">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                        emp.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        emp.role === 'RECEPTIONIST' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {emp.role}
                      </span>
                    </td>

                    <td className="p-4 text-slate-700 text-xs font-semibold">
                      {emp.department}
                    </td>

                    <td className="p-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        emp.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {emp.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleToggleActive(emp._id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                          emp.isActive 
                            ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' 
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 relative border border-slate-200 shadow-xl">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-700">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Create Staff User Account</h3>

            {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl mb-4">{error}</div>}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input type="text" required name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Sarah Connor" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-none font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input type="email" required name="email" value={formData.email} onChange={handleChange} placeholder="sarah@system.com" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-none font-medium" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Role</label>
                  <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-none font-medium">
                    <option value="EMPLOYEE">EMPLOYEE</option>
                    <option value="RECEPTIONIST">RECEPTIONIST</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <input type="text" name="department" value={formData.department} onChange={handleChange} placeholder="HR / Tech" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-none font-medium" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md">Save User Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
