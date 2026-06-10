import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { getParkingLotById } from '../services/parkingService';
import { createBooking, simulatePayment } from '../services/bookingService';
import BookingForm from '../components/booking/BookingForm';
import PaymentSimulator from '../components/booking/PaymentSimulator';
import MapView from '../components/map/MapView';
import useGeolocation from '../hooks/useGeolocation';
import { Calendar, CreditCard, CheckCircle2, ChevronRight, QrCode, Navigation, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

// Helper to generate route points simulating roads
function generateRoutePoints(startLat, startLng, endLat, endLng) {
  const midLat = (startLat + endLat) / 2;
  const midLng = (startLng + endLng) / 2;
  const offsetLat = (endLat - startLat) * 0.12;
  const offsetLng = (endLng - startLng) * -0.12;
  return [
    [startLat, startLng],
    [startLat + (endLat - startLat) * 0.25, startLng + offsetLng],
    [midLat + offsetLat, midLng],
    [endLat - (endLat - startLat) * 0.25, endLng + offsetLng],
    [endLat, endLng]
  ];
}

export default function BookingPage() {
  const { lotId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const slotQuery = searchParams.get('slot');

  const [lot, setLot] = useState(null);
  const [loading, setLoading] = useState(true);

  // Wizard state: 'form' | 'navigation' | 'payment' | 'success'
  const [step, setStep] = useState('form');
  const [createdBooking, setCreatedBooking] = useState(null);

  // Geolocation and Simulator States
  const { position, getCurrentPosition } = useGeolocation();
  const [isNavigating, setIsNavigating] = useState(false);
  const [simulatedUserPosition, setSimulatedUserPosition] = useState(null);
  const [navigationStepIndex, setNavigationStepIndex] = useState(0);
  const [navigationRoute, setNavigationRoute] = useState([]);
  const [showReachedModal, setShowReachedModal] = useState(false);

  useEffect(() => {
    const fetchLot = async () => {
      try {
        setLoading(true);
        const data = await getParkingLotById(lotId);
        setLot(data.parkingLot || data.data || data);
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
      setCreatedBooking(res.booking || res.data || res);
      setStep('navigation');
    } catch (e) {
      console.error('Failed to register booking slots:', e);
      const serverErrorMsg = e.response?.data?.message;
      const fieldErrors = e.response?.data?.errors;
      if (fieldErrors && Array.isArray(fieldErrors) && fieldErrors.length > 0) {
        const joinedErrors = fieldErrors.map(fe => fe.message).join(', ');
        toast.error(`Validation Failed: ${joinedErrors}`);
      } else {
        toast.error(serverErrorMsg || 'Conflict detected. Slot occupied.');
      }
    }
  };

  const handleStartNavigation = () => {
    const startLat = position?.lat || 10.0261;
    const startLng = position?.lng || 76.3125;
    const endLat = lot.location?.coordinates?.[1] || lot.latitude;
    const endLng = lot.location?.coordinates?.[0] || lot.longitude;

    if (!endLat || !endLng) {
      toast.error("Invalid parking lot location");
      return;
    }

    const points = generateRoutePoints(startLat, startLng, endLat, endLng);
    setNavigationRoute(points);
    setNavigationStepIndex(0);
    setSimulatedUserPosition({ lat: points[0][0], lng: points[0][1] });
    setIsNavigating(true);
    toast.success(`Starting navigation simulation to ${lot.name}...`);
  };

  const handleCancelNavigation = () => {
    setIsNavigating(false);
    setSimulatedUserPosition(null);
    setNavigationRoute([]);
    setNavigationStepIndex(0);
    toast.info("Navigation cancelled");
  };

  useEffect(() => {
    let interval = null;
    if (isNavigating && navigationRoute.length > 0) {
      interval = setInterval(() => {
        setNavigationStepIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          if (nextIndex >= navigationRoute.length) {
            clearInterval(interval);
            setIsNavigating(false);
            setSimulatedUserPosition({ 
              lat: navigationRoute[navigationRoute.length - 1][0], 
              lng: navigationRoute[navigationRoute.length - 1][1] 
            });
            setShowReachedModal(true);
            return prevIndex;
          }
          const nextPt = navigationRoute[nextIndex];
          setSimulatedUserPosition({ lat: nextPt[0], lng: nextPt[1] });
          return nextIndex;
        });
      }, 1500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isNavigating, navigationRoute]);

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
        <div className="w-10 h-10 border-4 border-slate-350 border-t-indigo-500 rounded-full animate-spin"></div>
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
        <div className="flex items-center justify-center gap-2 sm:gap-6 bg-slate-100/30 p-4.5 rounded-2xl border border-slate-200 max-w-xl mx-auto">
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
              step === 'navigation' ? 'bg-primary-500 text-white' : step === 'payment' || step === 'success' ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-700' : 'bg-slate-100 text-slate-600'
            }`}>
              2
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${step === 'navigation' ? 'text-primary-700' : 'text-slate-600'}`}>Navigate</span>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-600" />

          <div className="flex items-center gap-1.5">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
              step === 'payment' ? 'bg-primary-500 text-white' : step === 'success' ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-700' : 'bg-slate-100 text-slate-600'
            }`}>
              3
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${step === 'payment' ? 'text-primary-700' : 'text-slate-600'}`}>Payment</span>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-600" />

          <div className="flex items-center gap-1.5">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
              step === 'success' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              4
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

          {step === 'navigation' && createdBooking && (
            <div className="glass-card p-6 w-full max-w-2xl border border-slate-200 shadow-2xl rounded-3xl space-y-5 animate-slide-up relative overflow-hidden bg-white/95">
              <div className="flex justify-between items-center select-none border-b pb-3.5 border-slate-200">
                <div className="space-y-0.5">
                  <span className="text-[9px] uppercase font-black text-cyan-600 bg-cyan-950/10 border border-cyan-800/25 px-2 py-0.5 rounded">Step 2: Route Guide</span>
                  <h3 className="text-base font-black text-slate-900 mt-1.5">Drive to {lot.name}</h3>
                </div>
                {!isNavigating && (
                  <button
                    onClick={handleStartNavigation}
                    className="py-2.5 px-5 bg-gradient-to-r from-cyan-500 to-indigo-700 hover:from-cyan-400 hover:to-indigo-550 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-98"
                  >
                    Start Driving Navigation
                  </button>
                )}
              </div>

              {/* Live navigation Map panel */}
              <div className="relative w-full h-[50vh] min-h-[380px] md:h-[450px] rounded-2xl overflow-hidden border border-slate-200">
                <MapView
                  parkingLots={[lot]}
                  center={[lot.location?.coordinates?.[1] || lot.latitude, lot.location?.coordinates?.[0] || lot.longitude]}
                  zoom={isNavigating ? 16 : 14}
                  userPosition={simulatedUserPosition || position}
                  selectedLot={lot._id}
                  isNavigating={isNavigating}
                  onStartNavigation={handleStartNavigation}
                  hideDetailsActions={true}
                />
              </div>

              {/* Progress Panel details */}
              {isNavigating && (
                <div className="bg-slate-900/95 border border-cyan-500/20 text-white p-4.5 rounded-2xl flex flex-col gap-2">
                  <div className="flex justify-between text-[10px] text-slate-400 font-extrabold uppercase tracking-wider font-mono">
                    <span>Origin</span>
                    <span>{((navigationRoute.length - 1 - navigationStepIndex) * 0.4).toFixed(1)} km remaining</span>
                    <span>Destination</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 transition-all duration-1000 ease-out"
                      style={{ width: `${(navigationStepIndex / (navigationRoute.length - 1)) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Arrival confirmation Modal */}
              {showReachedModal && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" />
                  <div className="relative w-full max-w-sm bg-white border border-slate-200 shadow-2xl rounded-3xl p-6 text-center space-y-5 animate-slide-up select-none">
                    <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                      <CheckCircle2 className="w-8 h-8 animate-bounce-gentle" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-emerald-600 uppercase font-black tracking-widest block">Arrived safely</span>
                      <h3 className="text-lg font-black text-slate-900">Reached the Lot!</h3>
                      <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                        You have arrived at <strong>{lot.name}</strong>. Please park your car in <strong>SLOT {slotQuery}</strong>.
                      </p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-semibold text-slate-700">
                      Please proceed to payment now to finalize your slot reservation.
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowReachedModal(false);
                        setStep('payment');
                      }}
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-md transition-all active:scale-98"
                    >
                      Proceed to Payment
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 'payment' && createdBooking && (
            <PaymentSimulator
              booking={createdBooking}
              onPaymentComplete={handlePaymentSuccess}
              onCancel={() => setStep('form')}
            />
          )}

          {step === 'success' && createdBooking && (
            <div className="glass-card p-8 max-w-md w-full text-center space-y-6 border border-slate-200 shadow-2xl relative overflow-hidden bg-white/95 animate-slide-up">
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

                <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                  <span className="text-slate-600 text-[10px] uppercase font-bold tracking-wider">Reserved Slot</span>
                  <span className="text-cyan-600 font-black">SLOT {slotQuery}</span>
                </div>

                <div className="flex justify-between items-center border-t border-slate-200 pt-2">
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
