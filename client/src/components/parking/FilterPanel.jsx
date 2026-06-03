import React from 'react';
import { SlidersHorizontal, Trash2, Camera, Zap, Shield, Accessibility, Clock, Bath, Droplets, UserCheck } from 'lucide-react';

const AMENITY_LIST = [
  { key: 'CCTV', label: 'CCTV Security', icon: <Camera className="w-4 h-4 text-indigo-400" /> },
  { key: 'EV Charging', label: 'EV Charging', icon: <Zap className="w-4 h-4 text-cyan-600" /> },
  { key: 'Covered Parking', label: 'Covered Roof', icon: <Shield className="w-4 h-4 text-emerald-700" /> },
  { key: 'Security Guard', label: 'Security Guard', icon: <Shield className="w-4 h-4 text-amber-700" /> },
  { key: 'Wheelchair Accessible', label: 'Accessible', icon: <Accessibility className="w-4 h-4 text-blue-700" /> },
  { key: '24/7 Access', label: '24/7 Support', icon: <Clock className="w-4 h-4 text-purple-400" /> },
  { key: 'Restroom', label: 'Restrooms', icon: <Bath className="w-4 h-4 text-pink-400" /> },
  { key: 'Car Wash', label: 'Car Wash', icon: <Droplets className="w-4 h-4 text-teal-400" /> },
  { key: 'Valet Service', label: 'Valet Parking', icon: <UserCheck className="w-4 h-4 text-violet-400" /> },
];

export default function FilterPanel({ filters, onFilterChange, onClearFilters }) {
  const handleAmenityToggle = (amenity) => {
    const active = filters.amenities || [];
    let updated;
    if (active.includes(amenity)) {
      updated = active.filter(a => a !== amenity);
    } else {
      updated = [...active, amenity];
    }
    onFilterChange({ ...filters, amenities: updated });
  };

  const handlePriceChange = (e) => {
    onFilterChange({ ...filters, maxPrice: parseInt(e.target.value, 10) });
  };

  const handleAvailabilityToggle = () => {
    onFilterChange({ ...filters, availableOnly: !filters.availableOnly });
  };

  return (
    <div className="glass-card p-6 space-y-6 w-full text-slate-900">
      {/* Title */}
      <div className="flex items-center justify-between flex-nowrap gap-2 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-2 shrink-0">
          <SlidersHorizontal className="w-5 h-5 text-primary-700 animate-pulse-slow shrink-0" />
          <h3 className="font-bold text-base sm:text-lg tracking-wide whitespace-nowrap">Refine Search</h3>
        </div>
        <button
          type="button"
          onClick={onClearFilters}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 transition-colors shrink-0 whitespace-nowrap"
        >
          <Trash2 className="w-3.5 h-3.5 shrink-0" />
          <span>Clear All</span>
        </button>
      </div>

      {/* Real-time availability filter */}
      <div className="flex items-center justify-between bg-slate-100/30 p-3.5 rounded-xl border border-slate-200">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-slate-800">Real-time Spot Available</span>
          <span className="text-[10px] text-slate-600">Show only lots with active vacant slots</span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={!!filters.availableOnly}
            onChange={handleAvailabilityToggle}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary-500/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
        </label>
      </div>

      {/* Price Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-800">Max Budget (per hour)</span>
          <span className="text-sm font-bold text-cyan-600">₹{filters.maxPrice || 200}</span>
        </div>
        <input
          type="range"
          min="10"
          max="200"
          step="10"
          value={filters.maxPrice || 200}
          onChange={handlePriceChange}
          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-500 focus:outline-none"
        />
        <div className="flex justify-between text-[10px] text-slate-600 font-semibold px-1">
          <span>₹10</span>
          <span>₹100</span>
          <span>₹200+</span>
        </div>
      </div>

      {/* Amenities Section */}
      <div className="space-y-3">
        <span className="text-sm font-semibold text-slate-800 block">Amenities</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
          {AMENITY_LIST.map((amenity) => {
            const isChecked = (filters.amenities || []).includes(amenity.key);
            return (
              <button
                key={amenity.key}
                type="button"
                onClick={() => handleAmenityToggle(amenity.key)}
                className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  isChecked
                    ? 'bg-primary-600/20 border-primary-500 text-slate-900 font-bold shadow-md'
                    : 'bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${isChecked ? 'bg-primary-500/20' : 'bg-slate-100'}`}>
                    {amenity.icon}
                  </div>
                  <span className="text-xs font-semibold">{amenity.label}</span>
                </div>
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                  isChecked ? 'bg-primary-500 border-primary-500' : 'border-slate-300'
                }`}>
                  {isChecked && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
