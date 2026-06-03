import React from 'react';
import { MapPin, ShieldAlert, Compass, Settings, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

export default function LocationPermissionModal({
  isOpen,
  permissionState,
  onRequestLocation,
  onClose,
}) {
  if (!isOpen) return null;

  const isDenied = permissionState === 'denied';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Dark backdrop blur */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Glassmorphic Modal Content Container */}
      <div className="relative w-full max-w-md bg-white border border-slate-200/80 shadow-2xl rounded-3xl p-6 sm:p-8 animate-slide-up overflow-hidden select-none">
        
        {/* Glow effect design in background */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Visual Icon Header */}
        <div className="flex flex-col items-center justify-center text-center space-y-4 relative z-10">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 duration-300 ${
            isDenied 
              ? 'bg-rose-50 border border-rose-200 text-rose-600' 
              : 'bg-primary-50 border border-primary-200 text-primary-700'
          }`}>
            {isDenied ? (
              <ShieldAlert className="w-8 h-8 animate-pulse" />
            ) : (
              <Compass className="w-8 h-8 animate-spin-slow text-indigo-600" />
            )}
          </div>

          <div className="space-y-1.5">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {isDenied ? 'Location Permission Blocked' : 'Enable Location Services'}
            </h3>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed px-2">
              ParkEase requires GPS access to locate available parking spaces in your area and guide you to them.
            </p>
          </div>
        </div>

        {/* Content details and instructions block */}
        <div className="mt-6 relative z-10">
          {isDenied ? (
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4.5 space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <span className="text-xs font-bold text-rose-800">How to turn on location:</span>
              </div>
              <ul className="text-[11px] text-rose-700 space-y-2 list-decimal list-inside font-medium leading-relaxed pl-1">
                <li>Click the <strong className="font-extrabold flex inline-flex items-center gap-1"><Settings className="w-3 h-3" /> lock / settings</strong> icon in your browser's address bar (next to the website URL).</li>
                <li>Locate the <strong>Location</strong> setting and set it to <strong>Allow</strong>.</li>
                <li>Refresh this page or click the <strong>Retry Sync</strong> button below.</li>
              </ul>
            </div>
          ) : (
            <div className="bg-indigo-50/50 border border-indigo-100/70 rounded-2xl p-4.5 flex gap-3 items-center">
              <MapPin className="w-6 h-6 text-cyan-600 shrink-0 animate-bounce-gentle" />
              <div className="space-y-0.5">
                <h4 className="text-xs font-extrabold text-slate-800">Auto-Detect Nearby Slots</h4>
                <p className="text-[10px] text-slate-500 font-semibold leading-normal">
                  Find vacant slots, compare prices, and navigate with real-time ETA estimations.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions button footer */}
        <div className="mt-6 flex gap-3 relative z-10">
          <button
            type="button"
            onClick={onClose}
            className="w-1/3 py-3 border border-slate-350 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-extrabold rounded-2xl transition-all active:scale-98"
          >
            Dismiss
          </button>

          {isDenied ? (
            <button
              type="button"
              onClick={onRequestLocation}
              className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
              <span>Retry Sync</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onRequestLocation}
              className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-indigo-700 hover:from-cyan-400 hover:to-indigo-550 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Allow GPS</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
