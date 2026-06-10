import React, { useState, useEffect } from 'react';
import { Clock, Navigation, Ban, RefreshCw, CreditCard, Sparkles, MapPin, Calendar, QrCode } from 'lucide-react';
import { getUserBookings, cancelBooking, simulatePayment } from '../../services/bookingService';
import { formatCurrency, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import PaymentSimulator from '../booking/PaymentSimulator';

export default function UserBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  
  // Payment Modal integration
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // QR Modal integration
  const [qrBooking, setQrBooking] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getUserBookings();
      setBookings(data.data || data.bookings || (Array.isArray(data) ? data : []));
    } catch (e) {
      console.error('Error fetching bookings:', e);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? You will get a full refund.')) return;
    try {
      await cancelBooking(bookingId);
      toast.success('Booking cancelled successfully! Refund initiated.');
      fetchBookings();
    } catch (e) {
      console.error('Cancellation failed:', e);
      toast.error(e.response?.data?.message || 'Cancellation failed');
    }
  };

  const triggerPayment = (booking) => {
    setSelectedBooking(booking);
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = async (paymentId, isSandbox) => {
    try {
      if (isSandbox) {
        await simulatePayment(selectedBooking._id);
      }
      toast.success('Booking fully confirmed!');
      setShowPaymentModal(false);
      setSelectedBooking(null);
      fetchBookings();
    } catch (e) {
      console.error('Payment callback error:', e);
      toast.error('Payment sync failed');
    }
  };

  // Filter bookings
  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'active') return b.status === 'active';
    if (activeTab === 'completed') return b.status === 'completed';
    return b.status === 'cancelled';
  });

  return (
    <div className="space-y-6">
      {/* Tab Selectors */}
      <div className="flex bg-slate-100/30 p-1.5 rounded-2xl border border-slate-200/80">
        {['active', 'completed', 'cancelled'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-xs font-bold rounded-xl uppercase tracking-wider transition-all ${
              activeTab === tab
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/10'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tab} Spots
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-3">
          <div className="w-10 h-10 border-4 border-slate-300 border-t-indigo-500 rounded-full animate-spin"></div>
          <span className="text-xs text-slate-600 font-semibold tracking-wide">Syncing booking data...</span>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="glass-card-dark p-12 text-center border border-slate-200">
          <span className="text-4xl">🎟️</span>
          <h3 className="text-base font-extrabold mt-3 text-slate-700">No {activeTab} bookings found</h3>
          <p className="text-xs text-slate-600 mt-1">Book slots on the explore map to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBookings.map((booking) => {
            const lot = booking.parkingLot;
            const startTimeStr = formatDate(booking.startTime);
            const endTimeStr = formatDate(booking.endTime);

            return (
              <div
                key={booking._id}
                className="glass-card p-5 border border-slate-200 flex flex-col justify-between space-y-4 hover:border-indigo-500/20 hover:shadow-neon/5 transition-all duration-300 group text-slate-900"
              >
                {/* Visual Header / Lot info */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest bg-white/60 border border-slate-200 text-slate-700 px-2 py-0.5 rounded">
                      Slot {booking.slotNumber}
                    </span>
                    <h3 className="font-extrabold text-base tracking-tight mt-1.5 group-hover:text-primary-400 transition-colors">
                      {lot?.name || 'Parking lot Facility'}
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{lot?.address}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    {/* Status badge */}
                    {booking.status === 'active' ? (
                      <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full ${
                        booking.paymentStatus === 'paid'
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-700'
                          : 'bg-amber-500/10 border border-amber-500/20 text-amber-700'
                      }`}>
                        {booking.paymentStatus === 'paid' ? 'CONFIRMED' : 'PENDING PAYMENT'}
                      </span>
                    ) : (
                      <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full ${
                        booking.status === 'completed'
                          ? 'bg-slate-700/10 border border-slate-200 text-slate-600'
                          : 'bg-rose-500/10 border border-rose-500/20 text-rose-700'
                      }`}>
                        {booking.status}
                      </span>
                    )}
                    
                    <span className="text-sm font-black text-cyan-600">{formatCurrency(booking.totalAmount)}</span>
                  </div>
                </div>

                {/* Date time and details */}
                <div className="bg-slate-100/40 rounded-xl border border-slate-200 p-3.5 space-y-2 text-xs font-semibold text-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 text-[10px] uppercase font-bold tracking-wider">Vehicle</span>
                    <span className="font-mono tracking-widest text-slate-900 uppercase">{booking.vehicleNumber} ({booking.vehicleType})</span>
                  </div>
                  
                  <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                    <span className="text-slate-600 text-[10px] uppercase font-bold tracking-wider">In</span>
                    <span>{startTimeStr}</span>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                    <span className="text-slate-600 text-[10px] uppercase font-bold tracking-wider">Out</span>
                    <span>{endTimeStr}</span>
                  </div>
                </div>

                {/* Actions row */}
                <div className="flex gap-2.5 pt-1 border-t border-slate-800/40">
                  {booking.status === 'active' && (
                    <>
                      {/* Navigate */}
                      <button
                        type="button"
                        onClick={() => {
                          if (lot?.location?.coordinates) {
                            const [lng, lat] = lot.location.coordinates;
                            window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
                          }
                        }}
                        className="flex-1 py-2.5 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <Navigation className="w-3.5 h-3.5 text-primary-700" />
                        <span>Navigate</span>
                      </button>

                      {/* Digital Pass / QR code */}
                      <button
                        type="button"
                        onClick={() => {
                          setQrBooking(booking);
                          setShowQrModal(true);
                        }}
                        className="p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl flex items-center justify-center"
                        title="View Digital Pass QR"
                      >
                        <QrCode className="w-4 h-4 text-cyan-600" />
                      </button>

                      {/* Pay if pending */}
                      {booking.paymentStatus === 'pending' && (
                        <button
                          type="button"
                          onClick={() => triggerPayment(booking)}
                          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Pay Now</span>
                        </button>
                      )}

                      {/* Cancel */}
                      <button
                        type="button"
                        onClick={() => handleCancel(booking._id)}
                        className="p-2.5 bg-slate-100 hover:bg-rose-100 border border-slate-300 hover:border-rose-300 rounded-xl flex items-center justify-center text-slate-600 hover:text-rose-700 transition-colors"
                        title="Cancel Booking"
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                  {booking.status === 'completed' && (
                    <button
                      type="button"
                      onClick={() => toast.success('Feedback system coming soon!')}
                      className="w-full py-2.5 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold"
                    >
                      Rate Facility
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Payment Checkout Modal */}
      <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="Secure Checkout Gateway" size="md">
        {selectedBooking && (
          <div className="flex items-center justify-center p-2">
            <PaymentSimulator
              booking={selectedBooking}
              onPaymentComplete={handlePaymentComplete}
              onCancel={() => setShowPaymentModal(false)}
            />
          </div>
        )}
      </Modal>

      {/* QR Digital Ticket Pass Modal */}
      <Modal isOpen={showQrModal} onClose={() => setShowQrModal(false)} title="Gate Entry Ticket Pass" size="sm">
        {qrBooking && (
          <div className="flex flex-col items-center justify-center text-center p-6 text-slate-900 space-y-5">
            <div className="bg-white p-4 rounded-3xl shadow-2xl relative">
              <div className="absolute -inset-1 border border-primary-500/10 rounded-[28px] animate-pulse-slow"></div>
              {/* Real SVG QR design placeholder */}
              <div className="w-48 h-48 bg-slate-100 flex items-center justify-center text-slate-800 font-extrabold text-xs uppercase relative rounded-2xl border-4 border-slate-200">
                <div className="absolute inset-4 border border-dashed border-slate-400 flex flex-col items-center justify-center gap-1.5 p-2">
                  <QrCode className="w-12 h-12 text-indigo-600" />
                  <span className="font-mono text-[9px] uppercase tracking-wider text-slate-600">Lot finder Gate</span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-600 uppercase tracking-widest font-black block">Digital Check-In Pass</span>
              <h4 className="font-extrabold text-base">{qrBooking.parkingLot?.name}</h4>
              <p className="font-mono text-cyan-600 text-sm font-black">SLOT {qrBooking.slotNumber} • {qrBooking.vehicleNumber}</p>
            </div>

            <div className="bg-slate-100/40 rounded-xl border border-slate-200 p-3.5 w-full text-xs font-semibold text-slate-700">
              Show this QR code at the automatic boom barrier scanner to open gate.
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
