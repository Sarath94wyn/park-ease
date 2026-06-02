import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Award, Gift, Copy, Check, Ticket, HelpCircle, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const OFFERS = [
  {
    code: 'PARK50',
    title: '50% Flat Discount Voucher',
    desc: 'Redeem this coupon to get flat 50% discount on any slot check-in duration bill totals.',
    pointsCost: 0,
    requiresPoints: false,
  },
  {
    code: 'WELCOME10',
    title: '10% New Sign Up Coupon',
    desc: 'Get flat 10% discount on any booking. Active for all new accounts across Indian cities.',
    pointsCost: 0,
    requiresPoints: false,
  },
  {
    code: 'FREEPARK',
    title: '₹50 Flat Points Voucher',
    desc: 'Redeem 5 Loyalty Points to deduct a flat ₹50 from your booking fee totals.',
    pointsCost: 5,
    requiresPoints: true,
  },
];

export default function RewardsHub() {
  const { user } = useAuth();
  const currentPoints = user?.points || 0;

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Coupon "${code}" copied to clipboard!`);
  };

  return (
    <div className="space-y-6 text-slate-900 animate-slide-up select-none">
      {/* Premium glowing Loyalty Points Card */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 rounded-3xl p-6 border border-amber-500/30 text-slate-900 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
        {/* Ambient glow decoration blur */}
        <div className="absolute top-[-20%] right-[-20%] w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="space-y-2 text-center sm:text-left z-10">
          <span className="text-[10px] uppercase font-black tracking-widest bg-amber-500/20 border border-amber-500/35 text-amber-300 px-3 py-1 rounded-full w-fit mx-auto sm:mx-0 animate-pulse-slow">
            Gold Loyalty Tier
          </span>
          <h3 className="text-2xl font-black tracking-tight mt-1.5 text-slate-950">Your Points Balance</h3>
          <p className="text-xs text-slate-600 font-semibold max-w-sm leading-relaxed">
            Redeem points directly on your booking checkout receipts to claim free hourly slots.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100/40 border border-slate-200/80 px-6 py-4.5 rounded-2xl z-10 shrink-0">
          <Award className="w-8 h-8 text-amber-450 fill-amber-500/10" />
          <div className="text-left">
            <span className="text-3xl font-black block leading-none text-amber-700">{currentPoints}</span>
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-600 block mt-1">Loyalty Points</span>
          </div>
        </div>
      </div>

      {/* Offers & Vouchers Catalog */}
      <div className="space-y-4">
        <div className="space-y-0.5 border-b border-slate-200/80 pb-2 flex items-center gap-2">
          <Gift className="w-5 h-5 text-cyan-600 animate-pulse-slow" />
          <h4 className="font-extrabold text-base text-slate-900">Offers & Coupon Vouchers</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {OFFERS.map((offer) => {
            const hasEnoughPoints = currentPoints >= offer.pointsCost;
            const canClaim = !offer.requiresPoints || hasEnoughPoints;

            return (
              <div
                key={offer.code}
                className="glass-card border border-slate-200 shadow-sm rounded-3xl p-5 hover:border-cyan-500/20 hover:shadow-neon/5 transition-all duration-300 flex flex-col justify-between space-y-4 relative group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Active Offer</span>
                    {offer.requiresPoints && (
                      <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded ${
                        hasEnoughPoints ? 'bg-amber-500/10 text-amber-700 border border-amber-500/20' : 'bg-slate-100 text-slate-600'
                      }`}>
                        Cost: {offer.pointsCost} pts
                      </span>
                    )}
                  </div>

                  <h4 className="font-extrabold text-base tracking-tight text-slate-950">{offer.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-semibold">{offer.desc}</p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-200/80">
                  <div className="bg-slate-100/60 border border-slate-200 px-3.5 py-2.5 rounded-xl text-center text-xs font-mono font-black uppercase tracking-widest text-cyan-455 flex-1 select-all border-dashed">
                    {offer.code}
                  </div>
                  
                  <button
                    type="button"
                    disabled={!canClaim}
                    onClick={() => copyToClipboard(offer.code)}
                    className={`p-2.5 rounded-xl border border-slate-200 flex items-center justify-center transition-all ${
                      canClaim
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 active:scale-95'
                        : 'opacity-40 cursor-not-allowed bg-white'
                    }`}
                    title="Copy Voucher Code"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* How to Earn Points Panel */}
      <div className="bg-slate-100/30 border border-slate-200 p-5 rounded-3xl space-y-4">
        <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
          <Star className="w-4.5 h-4.5 text-amber-500 fill-amber-500/20" />
          <span>Loyalty Milestones</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
          <div className="flex items-start gap-3 bg-slate-100/30 p-3.5 rounded-2xl border border-slate-200">
            <Ticket className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-slate-900 font-extrabold block">Sign Up Bonus</span>
              <span>Get 10 points instantly credited upon creating an account.</span>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-slate-100/30 p-3.5 rounded-2xl border border-slate-200">
            <Gift className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-slate-900 font-extrabold block">Booking Rewards</span>
              <span>Earn 5 points for every completed reservation parking session.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
