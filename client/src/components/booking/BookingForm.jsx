import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Car, Bike, Info, CreditCard, ChevronRight, Tag, Award, Check } from 'lucide-react';
import { format, differenceInMinutes, parseISO } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function BookingForm({ parkingLot, selectedSlot, onSubmit, onCancel }) {
  const { user } = useAuth();

  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('car');
  const [startTime, setStartTime] = useState(() => {
    const now = new Date();
    const min = now.getMinutes();
    const rem = 15 - (min % 15);
    const rounded = new Date(now.getTime() + rem * 60 * 1000);
    return format(rounded, "yyyy-MM-dd'T'HH:mm");
  });
  const [endTime, setEndTime] = useState(() => {
    const now = new Date();
    const min = now.getMinutes();
    const rem = 15 - (min % 15);
    const rounded = new Date(now.getTime() + rem * 60 * 1000 + 2 * 60 * 60 * 1000);
    return format(rounded, "yyyy-MM-dd'T'HH:mm");
  });

  const [duration, setDuration] = useState(2);
  const [basePrice, setBasePrice] = useState(0);

  // Promo Vouchers State
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [flatDiscount, setFlatDiscount] = useState(0);
  const [pointsRedeemed, setPointsRedeemed] = useState(0);

  // Re-calculate pricing
  useEffect(() => {
    if (!startTime || !endTime) return;
    try {
      const start = parseISO(startTime);
      const end = parseISO(endTime);
      
      const diffMins = differenceInMinutes(end, start);
      if (diffMins > 0) {
        const hours = Math.ceil(diffMins / 60 * 10) / 10;
        setDuration(hours);
        if (parkingLot?.pricePerHour) {
          setBasePrice(Math.round(hours * parkingLot.pricePerHour));
        }
      } else {
        setDuration(0);
        setBasePrice(0);
      }
    } catch (e) {
      console.error(e);
    }
  }, [startTime, endTime, parkingLot]);

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    if (code === 'PARK50') {
      setAppliedPromo(code);
      setDiscountPercent(50);
      setFlatDiscount(0);
      setPointsRedeemed(0);
      toast.success('Promo PARK50 applied: 50% Off!');
    } else if (code === 'WELCOME10') {
      setAppliedPromo(code);
      setDiscountPercent(10);
      setFlatDiscount(0);
      setPointsRedeemed(0);
      toast.success('Promo WELCOME10 applied: 10% Off!');
    } else if (code === 'FREEPARK') {
      const userPoints = user?.points || 0;
      if (userPoints < 5) {
        toast.error('Insufficient Loyalty Points. Need 5 points for FREEPARK.');
        return;
      }
      setAppliedPromo(code);
      setDiscountPercent(0);
      setFlatDiscount(50);
      setPointsRedeemed(5);
      toast.success('Promo FREEPARK applied: ₹50 deducted using 5 loyalty points!');
    } else {
      toast.error('Invalid Voucher Code. Try PARK50 or WELCOME10.');
    }
    setPromoInput('');
  };

  const handleRemovePromo = () => {
    setAppliedPromo('');
    setDiscountPercent(0);
    setFlatDiscount(0);
    setPointsRedeemed(0);
    toast.success('Promo code removed');
  };

  // Bill Invoicing Calculations
  const calculatedDiscount = Math.round((basePrice * discountPercent) / 100) + flatDiscount;
  const finalPrice = Math.max(0, basePrice - calculatedDiscount);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!vehicleNumber.trim()) return;
    
    const cleanPlate = vehicleNumber.replace(/\s+/g, '').toUpperCase();

    onSubmit({
      parkingLot: parkingLot._id,
      slotNumber: selectedSlot,
      vehicleNumber: cleanPlate,
      vehicleType,
      startTime: parseISO(startTime).toISOString(),
      endTime: parseISO(endTime).toISOString(),
      duration,
      totalAmount: finalPrice,
      pointsRedeemed
    });
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6 text-slate-900 max-w-md w-full border border-slate-200 shadow-2xl relative overflow-hidden">
      {/* Ambient glowing highlights */}
      <div className="absolute top-[-15%] right-[-15%] w-36 h-36 bg-primary-500/5 rounded-full blur-2xl pointer-events-none"></div>

      {/* Header */}
      <div className="border-b border-slate-200/80 pb-4 select-none relative z-10">
        <h3 className="font-extrabold text-lg text-slate-950 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-cyan-600" />
          <span>Confirm Booking details</span>
        </h3>
        <p className="text-xs text-slate-600 mt-1">
          Review details for slot <span className="font-extrabold text-cyan-600 bg-slate-100/40 px-2 py-0.5 rounded border border-slate-200">{selectedSlot}</span> at {parkingLot?.name}
        </p>
      </div>

      {/* Vehicle Info */}
      <div className="space-y-3 relative z-10">
        <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 block px-1">Vehicle Classification</label>
        
        {/* Toggles */}
        <div className="grid grid-cols-3 gap-2.5 select-none">
          {[
            { key: 'car', label: 'Four Wheeler', icon: <Car className="w-5 h-5" /> },
            { key: 'bike', label: 'Two Wheeler', icon: <Bike className="w-5 h-5" /> },
            { key: 'suv', label: 'SUV / Large', icon: <Car className="w-5 h-5 text-cyan-450" /> }
          ].map(type => (
            <button
              key={type.key}
              type="button"
              onClick={() => setVehicleType(type.key)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all ${
                vehicleType === type.key
                  ? 'bg-primary-600/20 border-primary-500 text-slate-900 font-bold'
                  : 'bg-slate-100/30 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {type.icon}
              <span className="text-[9px] uppercase font-bold tracking-wider">{type.label}</span>
            </button>
          ))}
        </div>

        {/* License Input */}
        <div className="space-y-1">
          <input
            type="text"
            required
            placeholder="e.g. KL 07 CD 4589"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value)}
            className="input-field text-center font-mono text-lg tracking-widest uppercase border-slate-200 focus:border-cyan-400"
          />
          <div className="flex items-start gap-1 text-[10px] text-slate-600 px-1 mt-1 font-semibold select-none">
            <Info className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" />
            <span>Digital registration plate unlocks automatic barriers.</span>
          </div>
        </div>
      </div>

      {/* Date Selectors */}
      <div className="grid grid-cols-2 gap-4 select-none relative z-10">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 block px-1">Check In</label>
          <input
            type="datetime-local"
            required
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="bg-slate-100/40 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-cyan-400 w-full focus:outline-none font-bold"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 block px-1">Check Out</label>
          <input
            type="datetime-local"
            required
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="bg-slate-100/40 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-cyan-400 w-full focus:outline-none font-bold"
          />
        </div>
      </div>

      {/* Promo Voucher Coupon Input block */}
      <div className="space-y-2 select-none border-t border-slate-200/80 pt-4 relative z-10">
        <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 block px-1 flex items-center gap-1">
          <Tag className="w-3.5 h-3.5 text-cyan-450" />
          <span>Voucher Promo Coupons</span>
        </label>

        {appliedPromo ? (
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 rounded-xl">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-bold text-emerald-700 font-mono">Voucher "{appliedPromo}" Applied</span>
            </div>
            <button
              type="button"
              onClick={handleRemovePromo}
              className="text-xs font-black text-rose-700 hover:text-rose-500"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. PARK50 or FREEPARK"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              className="bg-slate-100/40 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-500 focus:border-cyan-400 flex-1 focus:outline-none font-bold uppercase tracking-wider font-mono"
            />
            <button
              type="button"
              onClick={handleApplyPromo}
              className="px-4 py-2 text-xs font-black text-cyan-600 bg-cyan-950/10 hover:bg-cyan-950/30 rounded-xl border border-cyan-800/50"
            >
              Apply
            </button>
          </div>
        )}

        {/* Promo code help list */}
        {!appliedPromo && (
          <div className="bg-indigo-950/20 border border-indigo-900/30 p-2.5 rounded-xl text-[9px] text-slate-600 font-semibold space-y-0.5 leading-relaxed">
            🎟️ <strong>Offers catalog</strong> available: <br />
            • <code className="text-cyan-600 font-bold">PARK50</code> — 50% discount on final invoice.<br />
            • <code className="text-cyan-600 font-bold">FREEPARK</code> — Deducts flat ₹50 (requires 5 points).
          </div>
        )}
      </div>

      {/* Bill Receipt breakdown */}
      <div className="bg-slate-100/40 rounded-2xl border border-slate-200 p-4 space-y-3 font-semibold select-none text-slate-700 relative z-10">
        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block border-b border-slate-200/80 pb-2">Receipt Breakdown</span>
        
        <div className="flex items-center justify-between text-xs">
          <span>Parking Hourly Rate</span>
          <span>₹{parkingLot?.pricePerHour || 40}/hr</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span>Est. Duration</span>
          <span className="flex items-center gap-1 text-slate-900 font-bold">
            <Clock className="w-3.5 h-3.5 text-slate-600" />
            <span>{duration} hrs</span>
          </span>
        </div>

        {appliedPromo && (
          <div className="flex items-center justify-between text-xs text-emerald-700 font-extrabold border-t border-dashed border-slate-200 pt-2">
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 fill-emerald-950/25" />
              <span>Voucher Coupon Discount</span>
            </span>
            <span>- ₹{calculatedDiscount}</span>
          </div>
        )}

        {duration <= 0 && (
          <div className="text-[10px] text-rose-700 font-bold bg-rose-50 border border-rose-200 p-2 rounded-xl text-center">
            Checkout time must be after check-in.
          </div>
        )}

        <div className="flex items-center justify-between text-sm font-extrabold border-t border-slate-200/80 pt-3.5 select-all">
          <span className="text-slate-800">Final Bill Price</span>
          <span className="text-xl font-black text-cyan-600">₹{finalPrice}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 select-none relative z-10">
        <button
          type="button"
          onClick={onCancel}
          className="w-1/3 py-3 rounded-xl border border-slate-350 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold transition-colors"
        >
          Cancel
        </button>
        
        <button
          type="submit"
          disabled={duration <= 0 || !vehicleNumber.trim()}
          className={`flex-1 py-3.5 rounded-xl btn-primary text-xs font-bold flex items-center justify-center gap-1.5 ${
            duration <= 0 || !vehicleNumber.trim() ? 'opacity-50 cursor-not-allowed filter grayscale' : ''
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Confirm & Pay</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
