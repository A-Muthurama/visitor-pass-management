// client/src/pages/Reports.jsx
import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { FileBarChart, Calendar, Download, TrendingUp, Filter } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

export default function Reports() {
  const [range, setRange] = useState('week');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    try {
      setLoading(true);
      let url = `/reports/summary?range=${range}`;
      if (range === 'custom' && startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      const res = await API.get(url);
      setReportData(res.data);
    } catch (err) {
      console.error('Failed to load report data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [range]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <FileBarChart className="w-6 h-6 text-purple-400" />
            Visitor Analytics & Summary Reports
          </h1>
          <p className="text-sm text-slate-400 mt-1">Aggregated statistics, traffic trends, and visit breakdown metrics.</p>
        </div>

        {/* Range Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setRange('today')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
              range === 'today' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setRange('week')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
              range === 'week' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            Past 7 Days
          </button>
          <button
            onClick={() => setRange('custom')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
              range === 'custom' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            Custom Range
          </button>
        </div>
      </div>

      {range === 'custom' && (
        <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
            />
          </div>
          <button
            onClick={fetchReport}
            className="mt-5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition"
          >
            Apply Filter
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-slate-400">Aggregating visitor report analytics...</div>
      ) : reportData && (
        <div className="space-y-6">
          {/* Summary Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <ReportCard title="Total Registrations" value={reportData.metrics.total} color="border-cyan-500/30 text-cyan-400" />
            <ReportCard title="Approved" value={reportData.metrics.approved} color="border-blue-500/30 text-blue-400" />
            <ReportCard title="Checked In" value={reportData.metrics.checkedIn} color="border-emerald-500/30 text-emerald-400" />
            <ReportCard title="Checked Out" value={reportData.metrics.checkedOut} color="border-slate-500/30 text-slate-300" />
            <ReportCard title="Rejected" value={reportData.metrics.rejected} color="border-rose-500/30 text-rose-400" />
            <ReportCard title="Cancelled" value={reportData.metrics.cancelled} color="border-purple-500/30 text-purple-400" />
          </div>

          {/* Graphical Trends */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              Visitor Traffic Volume
            </h3>
            {reportData.dailyTrends.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No date trend points found for this range.</div>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData.dailyTrends}>
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                      labelStyle={{ color: '#0284c7', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="count" fill="#0284c7" radius={[8, 8, 0, 0]}>
                      {reportData.dailyTrends.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#0284c7' : '#38bdf8'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ReportCard({ title, value, color }) {
  return (
    <div className={`glass-card p-4 rounded-xl border ${color} text-center`}>
      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{title}</div>
      <div className="text-2xl font-black mt-1 text-white">{value}</div>
    </div>
  );
}
