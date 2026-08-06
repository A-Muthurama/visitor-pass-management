// client/src/pages/Reports.jsx
import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { FileBarChart, TrendingUp } from 'lucide-react';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <FileBarChart className="w-6 h-6 text-purple-600" />
            Visitor Analytics & Summary Reports
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Aggregated visitor statistics, traffic trends, and operational breakdown.</p>
        </div>

        {/* Range Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setRange('today')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition border ${
              range === 'today' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setRange('week')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition border ${
              range === 'week' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            Past 7 Days
          </button>
          <button
            onClick={() => setRange('custom')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition border ${
              range === 'custom' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            Custom Range
          </button>
        </div>
      </div>

      {range === 'custom' && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none font-medium"
            />
          </div>
          <button
            onClick={fetchReport}
            className="mt-5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            Apply Date Filter
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-slate-500 font-medium">Aggregating visitor report analytics...</div>
      ) : reportData && (
        <div className="space-y-6">
          {/* Summary Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <ReportCard title="Total Registrations" value={reportData.metrics.total} color="border-blue-200 text-blue-700 bg-blue-50/50" />
            <ReportCard title="Approved" value={reportData.metrics.approved} color="border-indigo-200 text-indigo-700 bg-indigo-50/50" />
            <ReportCard title="Checked In" value={reportData.metrics.checkedIn} color="border-emerald-200 text-emerald-700 bg-emerald-50/50" />
            <ReportCard title="Checked Out" value={reportData.metrics.checkedOut} color="border-slate-200 text-slate-700 bg-slate-50/50" />
            <ReportCard title="Rejected" value={reportData.metrics.rejected} color="border-rose-200 text-rose-700 bg-rose-50/50" />
            <ReportCard title="Cancelled" value={reportData.metrics.cancelled} color="border-purple-200 text-purple-700 bg-purple-50/50" />
          </div>

          {/* Graphical Trends */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Visitor Traffic Density
            </h3>
            {reportData.dailyTrends.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 font-medium">No trend records found for the selected date range.</div>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData.dailyTrends}>
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ color: '#2563eb', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]}>
                      {reportData.dailyTrends.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#2563eb' : '#3b82f6'} />
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
    <div className={`p-4 rounded-xl border ${color} text-center bg-white shadow-2xs`}>
      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{title}</div>
      <div className="text-2xl font-black mt-1 text-slate-900">{value}</div>
    </div>
  );
}
