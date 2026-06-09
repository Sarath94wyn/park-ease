import React, { useState, useEffect } from 'react';
import { getDashboardStats, refundBooking } from '../../services/adminService';
import { getAllBookings } from '../../services/bookingService';
import { DollarSign, RefreshCw, XCircle, CreditCard, TrendingUp, Calendar } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function RevenuePaymentsManager() {
  const [statsData, setStatsData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refundingId, setRefundingId] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, bookingsRes] = await Promise.all([
        getDashboardStats(),
        getAllBookings({ page: 1, limit: 100 })
      ]);
      setStatsData(statsRes.data || statsRes);
      setBookings(bookingsRes.bookings || bookingsRes.data || bookingsRes);
    } catch (e) {
      console.error(e);
      toast.error('Failed to sync financial logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProcessRefund = async (bookingId) => {
    if (!window.confirm('Initiate refund process? The transaction will be marked as Refunded.')) return;
    try {
      setRefundingId(bookingId);
      await refundBooking(bookingId);
      toast.success('Refund completed successfully');
      fetchData();
    } catch (e) {
      console.error(e);
      toast.error('Refund transaction failed');
    } finally {
      setRefundingId('');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-3">
        <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div>
        <span className="text-xs text-neutral-550">Syncing transaction receipts database...</span>
      </div>
    );
  }

  const stats = statsData?.stats || {};
  const revenueByLot = statsData?.revenueByLot || [];
  const paidTransactions = bookings.filter(b => b.paymentStatus === 'paid' || b.paymentStatus === 'refunded');

  return (
    <div className="space-y-6 font-semibold">
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
        <div className="space-y-0.5">
          <h3 className="font-extrabold text-base text-neutral-900">
            <span>Revenue & Audit logs</span>
          </h3>
          <p className="text-xs text-neutral-550 font-medium font-sans">Inspect payment gateways, review billing audits, and process refunds.</p>
        </div>

        <button
          type="button"
          onClick={fetchData}
          className="p-1.5 border border-neutral-300 bg-white hover:bg-slate-50 text-neutral-700 rounded-md shadow-sm active:scale-95 flex items-center gap-1.5 text-xs font-bold transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload</span>
        </button>
      </div>

      {/* Revenue Aggregate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-neutral-200 p-5 rounded-md flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest block font-sans">Daily Gross Receipts</span>
            <span className="text-2xl font-bold text-neutral-900">{formatCurrency(stats.dailyRevenue || 0)}</span>
          </div>
          <div className="w-8 h-8 rounded bg-neutral-50 border border-neutral-200 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-neutral-700" />
          </div>
        </div>

        <div className="bg-white border border-neutral-200 p-5 rounded-md flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest block font-sans">Weekly Gross Receipts</span>
            <span className="text-2xl font-bold text-neutral-900">{formatCurrency(stats.weeklyRevenue || 0)}</span>
          </div>
          <div className="w-8 h-8 rounded bg-neutral-50 border border-neutral-200 flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-neutral-700" />
          </div>
        </div>

        <div className="bg-white border border-neutral-200 p-5 rounded-md flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest block font-sans">Monthly Gross Receipts</span>
            <span className="text-2xl font-bold text-neutral-900">{formatCurrency(stats.monthlyRevenue || 0)}</span>
          </div>
          <div className="w-8 h-8 rounded bg-neutral-50 border border-neutral-200 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-neutral-700" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue by Parking Lot list */}
        <div className="bg-white border border-neutral-200 p-5 rounded-md shadow-sm lg:col-span-1 space-y-4">
          <h4 className="font-extrabold text-xs uppercase tracking-wider text-neutral-500 border-b border-neutral-100 pb-2">
            Revenue by Facility
          </h4>
          
          <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
            {revenueByLot.map((lot, index) => (
              <div key={lot._id || index} className="flex items-center justify-between p-3 bg-neutral-50 border border-neutral-200 rounded-md hover:bg-neutral-100 transition-colors">
                <div className="space-y-0.5 max-w-[60%]">
                  <div className="text-xs font-bold text-neutral-900 truncate">{lot.name}</div>
                  <div className="text-[10px] text-neutral-400 font-medium">{lot.bookingsCount || 0} Bookings</div>
                </div>
                <div className="text-xs font-bold text-neutral-900">{formatCurrency(lot.revenue || 0)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Transactions & Refund log */}
        <div className="bg-white border border-neutral-200 p-5 rounded-md shadow-sm lg:col-span-2 space-y-4">
          <h4 className="font-extrabold text-xs uppercase tracking-wider text-neutral-500 border-b border-neutral-100 pb-2">
            Payment Transactions List
          </h4>

          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="min-w-full divide-y divide-neutral-200 text-left text-xs">
              <thead className="bg-neutral-50 text-slate-500 uppercase text-[9px] tracking-wider font-bold select-none">
                <tr>
                  <th className="px-4 py-3">Transaction Reference</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-neutral-700 bg-white">
                {paidTransactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-[10px] text-neutral-500">
                      {tx.paymentId || 'MOCK_REF_N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-neutral-800">{tx.user?.name || 'Client User'}</span>
                        <span className="text-[9px] text-neutral-400">{tx.user?.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold text-neutral-900">{formatCurrency(tx.totalAmount)}</td>
                    <td className="px-4 py-3 text-neutral-550 text-[10px]">{formatDate(tx.createdAt)}</td>
                    <td className="px-4 py-3 text-center">
                       <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${
                         tx.paymentStatus === 'paid'
                           ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                           : 'bg-neutral-100 text-neutral-400 border-neutral-200 line-through'
                       }`}>
                         {tx.paymentStatus}
                       </span>
                     </td>
                     <td className="px-4 py-3 text-right">
                       {tx.paymentStatus === 'paid' ? (
                         <button
                           type="button"
                           disabled={refundingId === tx._id}
                           onClick={() => handleProcessRefund(tx._id)}
                           className="px-2.5 py-1 text-[9px] bg-rose-50 hover:bg-rose-100 border border-rose-250 text-rose-700 rounded shadow-sm flex items-center gap-1 ml-auto transition-all font-bold disabled:opacity-50"
                         >
                           <XCircle className="w-3 h-3" />
                           <span>{refundingId === tx._id ? 'Refunding...' : 'Refund'}</span>
                         </button>
                       ) : (
                         <span className="text-[10px] font-bold text-neutral-400 font-sans">Refunded</span>
                       )}
                     </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
