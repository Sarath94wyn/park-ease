import React, { useState, useEffect } from 'react';
import { getAllBookings } from '../../services/bookingService';
import { checkInBooking, checkOutBooking, refundBooking } from '../../services/adminService';
import { Search, CheckCircle, RefreshCw, XCircle, Calendar } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function BookingManager() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await getAllBookings({ page: 1, limit: 200 });
      setBookings(res.bookings || res.data || res);
    } catch (e) {
      console.error(e);
      toast.error('Failed to retrieve reservations log');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCheckIn = async (bookingId) => {
    try {
      await checkInBooking(bookingId);
      toast.success('Check-in processed');
      fetchBookings();
    } catch (e) {
      console.error(e);
      toast.error('Check-in failed');
    }
  };

  const handleCheckOut = async (bookingId) => {
    try {
      await checkOutBooking(bookingId);
      toast.success('Check-out processed and slot freed');
      fetchBookings();
    } catch (e) {
      console.error(e);
      toast.error('Check-out failed');
    }
  };

  const handleRefund = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel and refund this booking?')) return;
    try {
      await refundBooking(bookingId);
      toast.success('Booking cancelled and refund processed');
      fetchBookings();
    } catch (e) {
      console.error(e);
      toast.error('Refund failed');
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      (b.vehicleNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.slotNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.parkingLot?.name || '').toLowerCase().includes(search.toLowerCase());

    const isUpcoming = new Date(b.startTime) > new Date();

    if (filter === 'active') return b.status === 'active' && !isUpcoming && matchesSearch;
    if (filter === 'completed') return b.status === 'completed' && matchesSearch;
    if (filter === 'cancelled') return b.status === 'cancelled' && matchesSearch;
    if (filter === 'upcoming') return isUpcoming && b.status === 'active' && matchesSearch;
    return matchesSearch;
  });

  return (
    <div className="space-y-6 font-semibold">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div className="space-y-0.5">
          <h3 className="font-extrabold text-base text-neutral-900">
            <span>Reservations Log</span>
          </h3>
          <p className="text-xs text-neutral-500 font-medium">Log client check-ins/check-outs, process cancellations, and audit slot occupancy logs.</p>
        </div>

        <button
          type="button"
          onClick={fetchBookings}
          className="p-1.5 border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 rounded-md shadow-sm active:scale-95 flex items-center gap-1.5 text-xs font-bold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-neutral-50 p-4 border border-neutral-200 rounded-md">
        <div className="flex flex-wrap gap-1.5">
          {[
            { key: 'all', label: 'All Logs' },
            { key: 'active', label: 'Currently Parked' },
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'completed', label: 'Completed' },
            { key: 'cancelled', label: 'Cancelled / Refunded' }
          ].map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md border transition-all ${
                filter === tab.key
                  ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm font-extrabold'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vehicle, client, lot, or slot..."
            className="w-full pl-9 pr-4 py-2 text-xs font-semibold bg-white border border-neutral-300 rounded-md outline-none focus:border-neutral-900 shadow-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-3">
          <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div>
          <span className="text-xs text-neutral-550">Syncing reservation records...</span>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-12 text-neutral-500 font-semibold text-xs border border-dashed border-neutral-350 rounded-md bg-white">
          No matching records found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-neutral-200 bg-white max-w-full">
          <table className="min-w-full divide-y divide-neutral-200 text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider text-[9px] font-bold">
              <tr>
                <th className="px-6 py-3.5">Client</th>
                <th className="px-6 py-3.5">Lot / Slot</th>
                <th className="px-6 py-3.5">Vehicle</th>
                <th className="px-6 py-3.5">Timings</th>
                <th className="px-6 py-3.5 text-center">Amount</th>
                <th className="px-6 py-3.5 text-center">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-neutral-800 bg-white">
              {filteredBookings.map((booking) => {
                const isUpcoming = new Date(booking.startTime) > new Date();
                return (
                  <tr key={booking._id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-neutral-900">{booking.user?.name || 'Client User'}</span>
                        <span className="text-[10px] text-neutral-400 font-medium">{booking.user?.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-neutral-900">{booking.parkingLot?.name || 'Lot Plaza'}</span>
                        <span className="text-[10px] font-bold text-neutral-500">Slot {booking.slotNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono tracking-widest font-bold uppercase bg-neutral-100 border border-neutral-250 px-2 py-0.5 rounded text-neutral-700">
                        {booking.vehicleNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-neutral-500 font-medium">
                      <div className="flex flex-col">
                        <span>In: {formatDate(booking.startTime)}</span>
                        <span>Out: {formatDate(booking.endTime)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-neutral-900">{formatCurrency(booking.totalAmount)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[9px] uppercase font-bold px-2.5 py-0.5 rounded border ${
                        booking.status === 'active'
                          ? isUpcoming
                            ? 'bg-amber-50 border-amber-200 text-amber-700 font-extrabold animate-pulse'
                            : 'bg-indigo-50 border-indigo-200 text-indigo-700 font-extrabold'
                          : booking.status === 'completed'
                          ? 'bg-emerald-50 border-emerald-250 text-emerald-700'
                          : 'bg-neutral-100 border-neutral-200 text-neutral-400 font-medium line-through'
                      }`}>
                        {booking.status === 'active' ? (isUpcoming ? 'upcoming' : 'parked') : booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        {booking.status === 'active' && isUpcoming && (
                          <button
                            type="button"
                            onClick={() => handleCheckIn(booking._id)}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-800 font-bold border border-indigo-200 rounded-md transition-all text-[10px]"
                          >
                            Check-In
                          </button>
                        )}

                        {booking.status === 'active' && !isUpcoming && (
                          <button
                            type="button"
                            onClick={() => handleCheckOut(booking._id)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 font-bold border border-emerald-200 rounded-md transition-all text-[10px]"
                          >
                            Check-Out
                          </button>
                        )}

                        {booking.status === 'active' && (
                          <button
                            type="button"
                            onClick={() => handleRefund(booking._id)}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 font-bold border border-rose-250 rounded-md transition-all text-[10px]"
                          >
                            Refund
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
