import React from 'react';
import { Star, Clock, MapPin, Sparkles, Navigation, Heart } from 'lucide-react';
import SlotGrid from './SlotGrid';
import { AMENITY_ICONS } from '../../utils/constants';
import * as LucideIcons from 'lucide-react';

export default function ParkingDetails({
  lot,
  selectedSlot,
  onSlotSelect,
  isFavorite,
  onFavoriteToggle,
  onBookClick
}) {
  if (!lot) return null;

  // Dynamically retrieve Lucide icon component
  const getAmenityIcon = (name) => {
    const iconName = AMENITY_ICONS[name.toLowerCase()] || 'HelpCircle';
    const IconComponent = LucideIcons[iconName] || LucideIcons.HelpCircle;
    return <IconComponent className="w-4 h-4 text-indigo-400" />;
  };

  return (
    <div className="glass-card text-slate-900 overflow-hidden shadow-2xl rounded-3xl border border-slate-200">
      {/* Visual Header / Premium Gradient Background Banner */}
      <div className="relative h-48 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 flex items-end p-6 border-b border-slate-700/30">
        <div className="absolute top-4 right-4 flex gap-2">
          {/* Favorite button */}
          <button
            type="button"
            onClick={onFavoriteToggle}
            className="p-3 bg-white/60 backdrop-blur-md rounded-full border border-slate-200/80 hover:bg-slate-800/80 active:scale-95 transition-all"
          >
            <Heart className={`w-5 h-5 transition-transform duration-300 ${isFavorite ? 'text-rose-500 fill-rose-500 scale-110' : 'text-slate-700'}`} />
          </button>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest bg-primary-500/20 border border-primary-500/30 text-primary-700 px-2.5 py-1 rounded-full">
              Parking Facility
            </span>
            {lot.availableSlots > 0 ? (
              <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-2.5 py-1 rounded-full">
                Active Slots
              </span>
            ) : (
              <span className="text-[10px] uppercase font-bold tracking-widest bg-rose-500/20 border border-rose-500/30 text-rose-300 px-2.5 py-1 rounded-full">
                Full Lot
              </span>
            )}
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight mt-2 text-white">{lot.name}</h2>
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-slate-600" />
            <span>{lot.address}</span>
          </div>
        </div>
      </div>

      {/* Grid details */}
      <div className="p-6 space-y-6">
        {/* Core Specs Grid */}
        <div className="grid grid-cols-3 gap-4 border-b border-slate-700/30 pb-5">
          <div className="bg-slate-50/50 p-3.5 rounded-2xl border border-slate-200 text-center">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Pricing</span>
            <span className="text-lg font-black text-cyan-600">₹{lot.pricePerHour}<span className="text-xs font-semibold text-slate-600">/hr</span></span>
          </div>
          <div className="bg-slate-50/50 p-3.5 rounded-2xl border border-slate-200 text-center">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Hours</span>
            <div className="flex items-center justify-center gap-1.5 text-slate-800">
              <Clock className="w-3.5 h-3.5 text-primary-700" />
              <span className="text-xs font-bold">{lot.operatingHours?.open || '24h'} - {lot.operatingHours?.close || '24h'}</span>
            </div>
          </div>
          <div className="bg-slate-50/50 p-3.5 rounded-2xl border border-slate-200 text-center">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">Rating</span>
            <div className="flex items-center justify-center gap-1 text-slate-800">
              <Star className="w-3.5 h-3.5 text-amber-700 fill-amber-400" />
              <span className="text-sm font-black">{lot.rating?.toFixed(1) || '4.2'}</span>
              <span className="text-[10px] text-slate-600">({lot.totalReviews || 12})</span>
            </div>
          </div>
        </div>

        {/* Description */}
        {lot.description && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Description</span>
            <p className="text-sm text-slate-700 leading-relaxed font-medium bg-slate-100 p-3 rounded-xl border border-slate-200">
              {lot.description}
            </p>
          </div>
        )}

        {/* Amenities grid */}
        {lot.amenities && lot.amenities.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Amenities Available</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {lot.amenities.map((amenity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 hover:border-slate-350 hover:bg-slate-100 transition-colors"
                >
                  <div className="p-1 rounded-lg bg-slate-100/50">
                    {getAmenityIcon(amenity)}
                  </div>
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Visual Slot Selector Grid */}
        <div className="space-y-3 border-t border-slate-700/30 pt-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary-700 animate-pulse-slow" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Select Available Parking Slot</span>
            </div>
            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              {lot.availableSlots} / {lot.totalSlots} Slots Free
            </span>
          </div>

          <SlotGrid
            slots={lot.slots}
            selectedSlot={selectedSlot}
            onSlotSelect={onSlotSelect}
          />
        </div>

        {/* Actions bar / Book CTA */}
        <div className="flex items-center gap-3 pt-4 border-t border-slate-700/30">
          <button
            type="button"
            onClick={() => {
              if (lot.location?.coordinates) {
                const [lng, lat] = lot.location.coordinates;
                window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
              }
            }}
            className="flex items-center justify-center gap-2 p-3.5 bg-slate-100 hover:bg-slate-200 text-slate-850 rounded-2xl border border-slate-300 font-bold active:scale-95 transition-all text-sm px-5"
          >
            <Navigation className="w-4 h-4 text-primary-700" />
            <span>Directions</span>
          </button>
          
          <button
            type="button"
            disabled={!selectedSlot}
            onClick={onBookClick}
            className={`flex-1 btn-primary text-sm p-4 rounded-2xl ${!selectedSlot ? 'opacity-50 cursor-not-allowed filter grayscale' : ''}`}
          >
            {selectedSlot ? `Book Slot ${selectedSlot}` : 'Select a Slot to Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
