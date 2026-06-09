import React, { useState } from 'react';
import { CreditCard, Lock, Sparkles, CheckCircle2, ShieldCheck, AlertCircle, RefreshCw, Smartphone } from 'lucide-react';
import { createRazorpayOrder, verifyRazorpayPayment } from '../../services/bookingService';
import toast from 'react-hot-toast';

export default function PaymentSimulator({ booking, onPaymentComplete, onCancel }) {
  const amount = booking.totalAmount;
  const [paymentMethod, setPaymentMethod] = useState(null); // 'card' or 'razorpay'
  const [loadingRazorpay, setLoadingRazorpay] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Card Simulator State
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  // Helper: Dynamically load Razorpay SDK script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    setErrorMsg(null);
    setLoadingRazorpay(true);
    try {
      // 1. Load Razorpay SDK
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Razorpay SDK failed to load. Check your network connection.');
        setLoadingRazorpay(false);
        return;
      }

      // 2. Request Razorpay Order from Backend
      const res = await createRazorpayOrder(booking._id);
      if (!res.success) {
        setErrorMsg(res.message || 'Failed to initialize order');
        setLoadingRazorpay(false);
        return;
      }

      const { orderId, amount: orderAmount, currency, keyId } = res;

      // 3. Configure Razorpay Pop-up Options
      const options = {
        key: keyId,
        amount: orderAmount,
        currency: currency,
        name: 'ParkEase Parking',
        description: `Slot Reservation ${booking.slotNumber}`,
        order_id: orderId,
        handler: async function (response) {
          setProcessing(true);
          try {
            // 4. Verify Razorpay Payment Signature on Server
            const verifyRes = await verifyRazorpayPayment(booking._id, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              setProcessing(false);
              setSuccess(true);
              toast.success('Payment captured successfully!');
              setTimeout(() => {
                onPaymentComplete(response.razorpay_payment_id);
              }, 1500);
            } else {
              toast.error(verifyRes.message || 'Verification failed');
              setProcessing(false);
            }
          } catch (err) {
            console.error('Razorpay verification error:', err);
            toast.error(err.response?.data?.message || 'Verification failed');
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            toast.error('Payment popup closed');
            setLoadingRazorpay(false);
          },
        },
        prefill: {
          name: booking.user?.name || '',
          email: booking.user?.email || '',
        },
        theme: {
          color: '#4F46E5', // Indigo theme accent
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      setLoadingRazorpay(false);
    } catch (err) {
      console.error('Razorpay gateway error:', err);
      const backendErr = err.response?.data?.message || 'Razorpay order creation failed';
      setErrorMsg(backendErr);
      setLoadingRazorpay(false);
    }
  };

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
    setCardNumber(parts.length > 0 ? parts.join(' ') : value);
  };

  // Format Expiry (MM/YY)
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    setExpiry(value.length >= 2 ? `${value.slice(0, 2)}/${value.slice(2)}` : value);
  };

  // Format CVV
  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 3) setCvv(value);
  };

  const handleCardPaymentSubmit = (e) => {
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
      {/* Glow highlight */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {success ? (
        /* Payment Success View */
        <div className="flex flex-col items-center justify-center text-center py-8 space-y-4 animate-slide-up">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl scale-125 animate-pulse-slow"></div>
            <CheckCircle2 className="w-20 h-20 text-emerald-700 relative z-10" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-emerald-700">Payment Successful</h3>
            <p className="text-xs text-slate-600 font-semibold tracking-wide">Securing booking pass & slots allocation...</p>
          </div>
        </div>
      ) : processing ? (
        /* Processing / Verification View */
        <div className="flex flex-col items-center justify-center text-center py-10 space-y-5">
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
            <Lock className="w-5 h-5 text-indigo-600 absolute" />
          </div>
          <div className="space-y-1.5">
            <h4 className="text-sm font-extrabold tracking-wide uppercase">Verifying Transaction Signature</h4>
            <p className="text-xs text-slate-600 font-medium">Please do not close checkout or press back button</p>
          </div>
        </div>
      ) : errorMsg ? (
        /* Error Screen (e.g. credentials missing in .env) */
        <div className="space-y-5 py-4 animate-slide-up text-left">
          <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-250 rounded-xl text-rose-800">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-black uppercase tracking-wide">Razorpay Key Configuration Missing</h4>
              <p className="text-[11px] font-medium leading-relaxed">{errorMsg}</p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 text-[11px] leading-relaxed text-slate-600 font-semibold">
            <p className="text-slate-800 font-black text-xs uppercase tracking-wide mb-1">How to setup credentials:</p>
            <p>1. Open your backend environment config file at <code className="bg-white px-1.5 py-0.5 border border-slate-200 rounded font-mono font-bold text-slate-800">server/.env</code></p>
            <p>2. Add your Razorpay Test API keys obtained from your dashboard:</p>
            <pre className="bg-slate-900 text-neutral-300 p-2.5 rounded font-mono text-[9px] mt-1 border border-slate-850">
{`# Razorpay Credentials
RAZORPAY_KEY_ID=rzp_test_xxxxxx
RAZORPAY_KEY_SECRET=yyyyyyyyyyyy`}
            </pre>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                setPaymentMethod(null);
              }}
              className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-300 text-xs transition-all"
            >
              Go Back
            </button>
            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                setPaymentMethod('card');
              }}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow"
            >
              Use Card Simulator
            </button>
          </div>
        </div>
      ) : paymentMethod === null ? (
        /* Landing Selection View */
        <div className="space-y-6 animate-slide-up text-left">
          {/* Header Info */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block">SECURE CHECKOUT</span>
              <h3 className="font-extrabold text-base text-slate-900">Choose Payment Method</h3>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl text-center">
              <span className="text-[10px] text-slate-600 uppercase font-semibold block mb-0.5">Pay Amount</span>
              <span className="text-base font-black text-indigo-700">₹{amount}</span>
            </div>
          </div>

          {/* Selector options */}
          <div className="space-y-3">
            {/* Razorpay Option */}
            <button
              type="button"
              disabled={loadingRazorpay}
              onClick={handleRazorpayPayment}
              className="w-full p-4 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100/70 text-indigo-900 transition-all flex items-center justify-between font-bold text-xs relative group shadow-sm"
            >
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-indigo-600 shrink-0" />
                <div className="text-left space-y-0.5">
                  <span className="block font-black text-indigo-950">Razorpay Payment Gateway</span>
                  <span className="block text-[10px] text-indigo-600 font-medium">UPI, Cards, Wallets, Netbanking</span>
                </div>
              </div>
              {loadingRazorpay ? (
                <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
              ) : (
                <span className="text-[10px] uppercase font-black bg-indigo-600 text-white px-2 py-0.5 rounded">Official</span>
              )}
            </button>

            {/* Simulator Option */}
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className="w-full p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 transition-all flex items-center justify-between font-bold text-xs relative group shadow-sm"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-slate-600 shrink-0" />
                <div className="text-left space-y-0.5">
                  <span className="block font-black text-slate-900">Sandbox Card Simulator</span>
                  <span className="block text-[10px] text-slate-600 font-medium">Test reservations with mock inputs</span>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">Sandbox</span>
            </button>
          </div>

          <div className="flex items-start gap-2 bg-slate-100/50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-500 leading-relaxed font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Select Razorpay to pay with UPI or card. Select Simulator if you do not have API keys configured.</span>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-end border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /* Card Details Simulator Input View */
        <form onSubmit={handleCardPaymentSubmit} className="space-y-6 animate-slide-up text-left">
          {/* Header info */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest block">SANDBOX GATEWAY</span>
              <h3 className="font-extrabold text-base flex items-center gap-1.5 text-slate-950">
                <CreditCard className="w-5 h-5 text-slate-600" />
                <span>Simulated Payment</span>
              </h3>
            </div>
            <div className="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl text-center">
              <span className="text-[10px] text-slate-600 uppercase font-semibold block mb-0.5">Pay Amount</span>
              <span className="text-base font-black text-slate-700">₹{amount}</span>
            </div>
          </div>

          {/* Secure lock notice */}
          <div className="flex items-start gap-2 bg-slate-100/40 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <span>This is a secure simulated environment. Real financial cards will not be billed.</span>
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
                className="input-field placeholder-slate-400 font-semibold"
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
                  className="input-field font-mono tracking-widest placeholder-slate-400"
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
                  className="input-field text-center font-mono placeholder-slate-400"
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
                    className="input-field text-center font-mono placeholder-slate-400"
                  />
                  <Lock className="w-4 h-4 text-slate-600 absolute right-3 top-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={() => setPaymentMethod(null)}
              className="w-1/3 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold border border-slate-300 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary py-3.5 rounded-2xl text-xs font-bold"
            >
              Authorize Sandbox Payment of ₹{amount}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
