import React from 'react';
import { Star, Clock, MapPin, Sparkles, Navigation, Heart } from 'lucide-react';
import SlotGrid from './SlotGrid';
import { AMENITY_ICONS } from '../../utils/constants';
import * as LucideIcons from 'lucide-react';
import { getParkingImageUrl } from '../../utils/helpers';

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
      {/* Visual Header / Dynamic Premium Cover Background with Gradient Overlay */}
      <div 
        className="relative h-48 bg-cover bg-center flex items-end p-6 border-b border-slate-700/30"
        style={{ backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.25), rgba(15, 23, 42, 0.85)), url(${lot.images?.[0] || getParkingImageUrl(lot.name)})` }}
      >
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

        {/* Vehicle Category Capacity */}
        {lot.slots && (
          <div className="space-y-3 border-t border-slate-700/30 pt-5">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Parking Capacity by Vehicle Category</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(() => {
                const categories = {
                  twoWheeler: { total: 0, available: 0, label: '2 Wheelers', sub: 'Bikes & Scooters', icon: <LucideIcons.Bike className="w-5 h-5 text-cyan-600" />, types: ['compact'] },
                  fourWheeler: { total: 0, available: 0, label: '4 Wheelers', sub: 'Cars & SUVs', icon: <LucideIcons.Car className="w-5 h-5 text-indigo-500" />, types: ['standard', 'ev'] },
                  heavyVehicle: { total: 0, available: 0, label: 'Heavy Vehicles', sub: '6+ Wheelers / Trucks', icon: <LucideIcons.Truck className="w-5 h-5 text-amber-600" />, types: ['large'] },
                  handicap: { total: 0, available: 0, label: 'Handicap Access', sub: 'Specially Abled', icon: <LucideIcons.Accessibility className="w-5 h-5 text-rose-500" />, types: ['handicap'] },
                };

                lot.slots.forEach(slot => {
                  const type = slot.type;
                  let target = null;
                  if (categories.twoWheeler.types.includes(type)) target = categories.twoWheeler;
                  else if (categories.fourWheeler.types.includes(type)) target = categories.fourWheeler;
                  else if (categories.heavyVehicle.types.includes(type)) target = categories.heavyVehicle;
                  else if (categories.handicap.types.includes(type)) target = categories.handicap;

                  if (target) {
                    target.total++;
                    if (!slot.isOccupied) target.available++;
                  }
                });

                return Object.entries(categories).map(([key, cat]) => (
                  <div key={key} className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl flex flex-col justify-between space-y-2 hover:border-slate-350 transition-colors shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="p-2 bg-white rounded-xl border border-slate-200/80">
                        {cat.icon}
                      </div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        cat.available > 0 ? 'bg-emerald-500/10 text-emerald-700' : 'bg-rose-500/10 text-rose-700'
                      }`}>
                        {cat.available} Free
                      </span>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900 leading-none">{cat.label}</h4>
                      <p className="text-[9px] text-slate-500 mt-0.5 font-medium">{cat.sub}</p>
                    </div>
                    <div className="text-[10px] text-slate-600 font-semibold border-t border-slate-200/60 pt-1.5 flex justify-between items-center">
                      <span>Total capacity:</span>
                      <span className="font-bold text-slate-900">{cat.total} spots</span>
                    </div>
                  </div>
                ));
              })()}
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
