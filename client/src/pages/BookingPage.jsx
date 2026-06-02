import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { getParkingLotById } from '../services/parkingService';
import { createBooking, simulatePayment } from '../services/bookingService';
import BookingForm from '../components/booking/BookingForm';
import PaymentSimulator from '../components/booking/PaymentSimulator';
import { Calendar, CreditCard, CheckCircle2, ChevronRight, QrCode, Navigation, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BookingPage() {
  const { lotId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const slotQuery = searchParams.get('slot');

  const [lot, setLot] = useState(null);
  const [loading, setLoading] = useState(true);

  // Wizard state: 'form' | 'payment' | 'success'
  const [step, setStep] = useState('form');
  const [bookingData, setBookingData] = useState(null);
  const [createdBooking, setCreatedBooking] = useState(null);

  useEffect(() => {
    const fetchLot = async () => {
      try {
        setLoading(true);
        const data = await getParkingLotById(lotId);
        setLot(data.parkingLot || data);
      } catch (e) {
        console.error('Failed to load lot specifications for checkout:', e);
        toast.error('Parking lot not found');
        navigate('/explore');
      } finally {
        setLoading(false);
      }
    };
    fetchLot();
  }, [lotId]);

  const handleFormSubmit = async (formData) => {
    try {
      // Create pending booking
      const res = await createBooking(formData);
      setCreatedBooking(res.booking || res);
      setStep('payment');
    } catch (e) {
      console.error('Failed to register booking slots:', e);
      toast.error(e.response?.data?.message || 'Conflict detected. Slot occupied.');
    }
  };

  const handlePaymentSuccess = async (paymentId) => {
    try {
      // Authorize booking via express simulate payment endpoint
      await simulatePayment(createdBooking._id);
      setStep('success');
      toast.success('Parking spot reserved successfully!');
    } catch (e) {
      console.error('Sync payment error:', e);
      toast.error('Failed to confirm reservation payments');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-900 space-y-3">
        <div className="w-10 h-10 border-4 border-slate-300 border-t-indigo-500 rounded-full animate-spin"></div>
        <span className="text-xs text-slate-600 font-semibold tracking-wide">Initializing checkout gateway...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6 relative select-none">
      {/* Background radial blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-primary-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        {/* Wizard Steps indicator bar */}
        <div className="flex items-center justify-center gap-2 sm:gap-6 bg-slate-100/30 p-4.5 rounded-2xl border border-slate-200 max-w-lg mx-auto">
          <div className="flex items-center gap-1.5">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
              step === 'form' ? 'bg-primary-500 text-white' : 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-700'
            }`}>
              1
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${step === 'form' ? 'text-primary-700' : 'text-slate-600'}`}>Details</span>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-600" />

          <div className="flex items-center gap-1.5">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
              step === 'payment' ? 'bg-primary-500 text-white' : step === 'success' ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-700' : 'bg-slate-100 text-slate-600'
            }`}>
              2
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${step === 'payment' ? 'text-primary-700' : 'text-slate-600'}`}>Payment</span>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-600" />

          <div className="flex items-center gap-1.5">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
              step === 'success' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              3
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${step === 'success' ? 'text-primary-700' : 'text-slate-600'}`}>Pass</span>
          </div>
        </div>

        {/* Wizard Forms Controller switch */}
        <div className="flex items-center justify-center">
          {step === 'form' && (
            <BookingForm
              parkingLot={lot}
              selectedSlot={slotQuery}
              onSubmit={handleFormSubmit}
              onCancel={() => navigate(`/parking/${lotId}`)}
            />
          )}

          {step === 'payment' && createdBooking && (
            <PaymentSimulator
              amount={createdBooking.totalAmount}
              onPaymentComplete={handlePaymentSuccess}
              onCancel={() => setStep('form')}
            />
          )}

          {step === 'success' && createdBooking && (
            <div className="glass-card p-8 max-w-md w-full text-center space-y-6 border border-slate-200 shadow-2xl relative overflow-hidden animate-slide-up">
              {/* Pulse background highlights */}
              <div className="absolute top-[-10%] right-[-10%] w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

              <div className="flex flex-col items-center space-y-3">
                <CheckCircle2 className="w-16 h-16 text-emerald-700 animate-bounce-gentle" />
                <h3 className="text-xl font-black text-emerald-700">Spot Reserved!</h3>
                <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Pass code generated successfully</p>
              </div>

              {/* Digital QR ticket pass */}
              <div className="bg-white p-4.5 rounded-3xl inline-block shadow-xl select-none mx-auto relative border border-slate-200">
                <div className="w-40 h-40 bg-slate-100 flex items-center justify-center text-slate-800 font-bold text-xs border border-slate-200 rounded-xl relative">
                  <div className="absolute inset-3 border border-dashed border-slate-400 flex flex-col items-center justify-center gap-1">
                    <QrCode className="w-10 h-10 text-indigo-600 animate-pulse-slow" />
                    <span className="font-mono text-[9px] uppercase tracking-wider text-slate-600">Gate checkpass</span>
                  </div>
                </div>
              </div>

              {/* Info panel breakdown */}
              <div className="bg-slate-100/40 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs font-semibold text-slate-700">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 text-[10px] uppercase font-bold tracking-wider">Facility</span>
                  <span className="text-slate-900 font-black">{lot.name}</span>
                </div>

                <div className="flex justify-between items-center border-t border-slate-900/50 pt-2">
                  <span className="text-slate-600 text-[10px] uppercase font-bold tracking-wider">Reserved Slot</span>
                  <span className="text-cyan-600 font-black">SLOT {slotQuery}</span>
                </div>

                <div className="flex justify-between items-center border-t border-slate-900/50 pt-2">
                  <span className="text-slate-600 text-[10px] uppercase font-bold tracking-wider">Authorized Vehicle</span>
                  <span className="text-slate-800 uppercase tracking-widest font-mono font-bold">{createdBooking.vehicleNumber}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (lot.location?.coordinates) {
                      const [lng, lat] = lot.location.coordinates;
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
                    }
                  }}
                  className="w-1/2 py-3 border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Navigation className="w-4 h-4 text-cyan-600" />
                  <span>Get Directions</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 btn-primary py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1 shadow"
                >
                  <span>Go to Dashboard</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
