import React, { useState } from 'react';
import { CreditCard, Lock, Sparkles, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PaymentSimulator({ amount, onPaymentComplete, onCancel }) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  // Format Card Number (adds spaces every 4 digits)
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    const matches = value.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(' '));
    } else {
      setCardNumber(value);
    }
  };

  // Format Expiry (MM/YY)
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 2) {
      setExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
    } else {
      setExpiry(value);
    }
  };

  // Format CVV (max 3 digits)
  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 3) {
      setCvv(value);
    }
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (cardNumber.replace(/\s/g, '').length < 16) {
      toast.error('Invalid Card Number');
      return;
    }
    if (expiry.length < 5) {
      toast.error('Invalid Expiry Date');
      return;
    }
    if (cvv.length < 3) {
      toast.error('Invalid CVV');
      return;
    }

    setProcessing(true);

    // Simulate payment transaction delays
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      toast.success('Payment authorized successfully!');

      setTimeout(() => {
        const mockPaymentId = `PAY_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        onPaymentComplete(mockPaymentId);
      }, 1500);
    }, 2500);
  };

  return (
    <div className="glass-card max-w-md w-full p-6 text-slate-900 border border-slate-200/80 shadow-2xl space-y-6 relative overflow-hidden">
      {/* Background radial highlight glow */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary-500/20 rounded-full blur-3xl pointer-events-none"></div>

      {success ? (
        // Payment Success View
        <div className="flex flex-col items-center justify-center text-center py-8 space-y-4 animate-slide-up">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl scale-125 animate-pulse-slow"></div>
            <CheckCircle2 className="w-20 h-20 text-emerald-700 relative z-10" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-emerald-700">Payment Successful</h3>
            <p className="text-xs text-slate-600 font-semibold tracking-wide">Validating gate authorization pass...</p>
          </div>
        </div>
      ) : processing ? (
        // Processing Loader View
        <div className="flex flex-col items-center justify-center text-center py-10 space-y-5">
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-cyan-400 rounded-full animate-spin"></div>
            <Lock className="w-5 h-5 text-cyan-600 absolute" />
          </div>
          <div className="space-y-1.5">
            <h4 className="text-sm font-extrabold tracking-wide uppercase">Authorizing Transaction</h4>
            <p className="text-xs text-slate-600 font-medium">Please do not refresh or press back button</p>
          </div>
        </div>
      ) : (
        // Card Details Input View
        <form onSubmit={handlePaymentSubmit} className="space-y-6 animate-slide-up">
          {/* Header info */}
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block">SECURE GATEWAY</span>
              <h3 className="font-extrabold text-base flex items-center gap-1.5 text-slate-950">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                <span>Simulated Payment</span>
              </h3>
            </div>
            <div className="bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 rounded-xl text-center">
              <span className="text-[10px] text-slate-600 uppercase font-semibold block mb-0.5">Pay Amount</span>
              <span className="text-base font-black text-cyan-600">₹{amount}</span>
            </div>
          </div>

          {/* Secure lock notice */}
          <div className="flex items-start gap-2 bg-slate-100/40 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <span>This is a secure 256-bit SSL simulated environment. Real financial cards will not be billed or processed.</span>
          </div>

          <div className="space-y-4">
            {/* Cardholder Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">Cardholder Name</label>
              <input
                type="text"
                required
                placeholder="SARATH S"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                className="input-field placeholder-slate-500 font-semibold"
              />
            </div>

            {/* Card Number */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">Card Number</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="4321 8765 2468 1357"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  className="input-field font-mono tracking-widest placeholder-slate-500"
                />
                <CreditCard className="w-5 h-5 text-slate-600 absolute right-3 top-3.5" />
              </div>
            </div>

            {/* Expiry / CVV Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">Expiration Date</label>
                <input
                  type="text"
                  required
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={handleExpiryChange}
                  className="input-field text-center font-mono placeholder-slate-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">CVV Code</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="***"
                    value={cvv}
                    onChange={handleCvvChange}
                    className="input-field text-center font-mono placeholder-slate-500"
                  />
                  <Lock className="w-4 h-4 text-slate-600 absolute right-3 top-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-3 border-t border-slate-700/30 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="w-1/3 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold border border-slate-300 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary py-3.5 rounded-2xl text-xs font-bold"
            >
              Authorize Payment of ₹{amount}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
