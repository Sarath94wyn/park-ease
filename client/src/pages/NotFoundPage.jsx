import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, AlertCircle } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 text-center select-none relative overflow-hidden">
      {/* Decorative gradient blur background highlights */}
      <div className="absolute top-[-20%] left-[-20%] w-72 h-72 bg-rose-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-md space-y-6 relative z-10 animate-slide-up">
        {/* Error icon badge */}
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 flex items-center justify-center mx-auto shadow animate-bounce-gentle">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-black tracking-tighter text-gradient from-rose-400 to-amber-400">404</h1>
          <h2 className="text-xl font-extrabold tracking-tight">Facility Map Page Lost</h2>
          <p className="text-slate-600 text-xs sm:text-sm font-semibold leading-relaxed px-4">
            The page you are attempting to locate does not exist or has been shifted. Check the URL parameters.
          </p>
        </div>

        {/* Back home CTA button */}
        <button
          type="button"
          onClick={() => navigate('/')}
          className="btn-primary text-xs px-6 py-3 rounded-2xl inline-flex items-center gap-2 shadow mx-auto mt-2"
        >
          <Compass className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
      </div>
    </div>
  );
}
