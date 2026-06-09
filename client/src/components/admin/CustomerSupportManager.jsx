import React, { useState, useEffect } from 'react';
import { getAllQueries, resolveQuery } from '../../services/adminService';
import { MessageSquare, RefreshCw, CheckCircle, Clock } from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function CustomerSupportManager() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const res = await getAllQueries();
      setQueries(res.queries || res.data || res);
    } catch (e) {
      console.error(e);
      toast.error('Failed to sync support inbox');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  const handleResolve = async (id) => {
    try {
      await resolveQuery(id);
      toast.success('Support query ticket resolved');
      fetchQueries();
    } catch (e) {
      console.error(e);
      toast.error('Failed to resolve support ticket');
    }
  };

  const filteredQueries = queries.filter(q => {
    if (filter === 'pending') return q.status === 'pending';
    if (filter === 'resolved') return q.status === 'resolved';
    return true;
  });

  const totalTickets = queries.length;
  const pendingTickets = queries.filter(q => q.status === 'pending').length;
  const resolvedPercent = totalTickets > 0 ? Math.round(((totalTickets - pendingTickets) / totalTickets) * 100) : 100;

  return (
    <div className="space-y-6 font-semibold">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div className="space-y-0.5">
          <h3 className="font-extrabold text-base text-neutral-900">
            <span>Support Queries & Logs</span>
          </h3>
          <p className="text-xs text-neutral-500 font-medium">Review chatbot complaints, user feedback details, and support logs.</p>
        </div>

        <button
          type="button"
          onClick={fetchQueries}
          className="p-1.5 border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 rounded-md shadow-sm active:scale-95 flex items-center gap-1.5 text-xs font-bold transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload</span>
        </button>
      </div>

      {/* Support KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-neutral-200 p-4 rounded-md flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider block font-sans">Total Complaints</span>
            <span className="text-xl font-bold text-neutral-900">{totalTickets}</span>
          </div>
          <MessageSquare className="w-4.5 h-4.5 text-neutral-900" />
        </div>

        <div className="bg-white border border-neutral-200 p-4 rounded-md flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider block font-sans">Pending Tickets</span>
            <span className="text-xl font-bold text-neutral-900 text-neutral-950">{pendingTickets}</span>
          </div>
          <Clock className="w-4.5 h-4.5 text-neutral-950" />
        </div>

        <div className="bg-white border border-neutral-200 p-4 rounded-md flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider block font-sans">Resolution Rate</span>
            <span className="text-xl font-bold text-neutral-900">{resolvedPercent}%</span>
          </div>
          <CheckCircle className="w-4.5 h-4.5 text-neutral-900" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 bg-neutral-50 p-2 border border-neutral-200 rounded-md w-fit shadow-sm">
        {[
          { key: 'all', label: 'All Tickets' },
          { key: 'pending', label: 'Pending Complaints' },
          { key: 'resolved', label: 'Resolved' }
        ].map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-1.5 text-xs font-bold rounded-md border transition-all ${
              filter === tab.key
                ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm font-extrabold'
                : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-3">
          <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div>
          <span className="text-xs text-neutral-550">Syncing support tickets inbox...</span>
        </div>
      ) : filteredQueries.length === 0 ? (
        <div className="text-center py-12 text-neutral-550 font-semibold text-xs border border-dashed border-neutral-350 rounded-md bg-white animate-fade-in">
          No complaints logged.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-neutral-200 bg-white max-w-full">
          <table className="min-w-full divide-y divide-neutral-200 text-left text-xs text-neutral-800">
            <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider text-[9px] font-bold">
              <tr>
                <th className="px-6 py-3.5">Client</th>
                <th className="px-6 py-3.5">Message Transcript</th>
                <th className="px-6 py-3.5">Logged Time</th>
                <th className="px-6 py-3.5 text-center font-bold">Status</th>
                <th className="px-6 py-3.5 text-right font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 bg-white">
              {filteredQueries.map((q) => (
                <tr key={q._id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-neutral-900">{q.user?.name || q.name || 'Anonymous User'}</span>
                      <span className="text-[10px] text-neutral-400 font-medium font-sans">{q.user?.email || q.email || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-neutral-700 leading-relaxed font-medium whitespace-pre-wrap max-w-md">
                    {q.message}
                  </td>
                  <td className="px-6 py-4 text-neutral-500 text-[10px]">{formatDate(q.createdAt)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-[9px] uppercase font-bold px-2.5 py-0.5 rounded border ${
                      q.status === 'resolved'
                        ? 'bg-neutral-100 border-neutral-250 text-neutral-700'
                        : 'bg-neutral-900 text-white border-neutral-900 font-extrabold'
                    }`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {q.status !== 'resolved' && (
                      <button
                        type="button"
                        onClick={() => handleResolve(q._id)}
                        className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-250 text-emerald-700 rounded shadow-sm font-bold transition-all flex items-center gap-1.5 ml-auto"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Resolve Ticket</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
