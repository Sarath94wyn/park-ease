import React, { useState } from 'react';
import { Sparkles, MapPin, Tag, Clock, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const AMENITIES_LIST = [
  'CCTV',
  'EV Charging',
  'Covered Parking',
  'Wheelchair Accessible',
  'Security Guard',
  '24/7 Access',
  'Restroom',
  'Car Wash',
  'Valet Service'
];

export default function ParkingLotForm({ initialData = null, onSubmit, onCancel }) {
  const [name, setName] = useState(initialData?.name || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [pricePerHour, setPricePerHour] = useState(initialData?.pricePerHour || 40);
  const [totalSlots, setTotalSlots] = useState(initialData?.totalSlots || 20);
  
  // Operating hours
  const [openTime, setOpenTime] = useState(initialData?.operatingHours?.open || '06:00');
  const [closeTime, setCloseTime] = useState(initialData?.operatingHours?.close || '22:00');

  // Coordinates
  const [lat, setLat] = useState(initialData?.location?.coordinates?.[1] || 10.0261);
  const [lng, setLng] = useState(initialData?.location?.coordinates?.[0] || 76.3125);

  // Amenities checklist
  const [amenities, setAmenities] = useState(initialData?.amenities || []);

  const handleAmenityToggle = (amenity) => {
    if (amenities.includes(amenity)) {
      setAmenities(prev => prev.filter(a => a !== amenity));
    } else {
      setAmenities(prev => [...prev, amenity]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) {
      toast.error('Name and Address are required');
      return;
    }

    onSubmit({
      name,
      address,
      description,
      pricePerHour: parseInt(pricePerHour, 10),
      totalSlots: parseInt(totalSlots, 10),
      operatingHours: {
        open: openTime,
        close: closeTime
      },
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)]
      },
      amenities
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-2 space-y-5 text-slate-900 max-h-[80vh] overflow-y-auto pr-1 scrollbar-thin">
      <div className="space-y-4">
        {/* Name input */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">Lot Name</label>
          <input
            type="text"
            required
            placeholder="e.g. Lulu Mall Multi-Level Parking"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
          />
        </div>

        {/* Address input */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">Address</label>
          <div className="relative">
            <input
              type="text"
              required
              placeholder="e.g. Edappally, Kochi, Kerala"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="input-field pl-10"
            />
            <MapPin className="w-4 h-4 text-slate-600 absolute left-3.5 top-3.5" />
          </div>
        </div>

        {/* Description textarea */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">Description (Optional)</label>
          <textarea
            placeholder="Provide detail specifications or rules..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field h-20 resize-none py-2.5"
          />
        </div>

        {/* Price and slots row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">Price (per hr)</label>
            <div className="relative">
              <input
                type="number"
                required
                min="10"
                max="250"
                value={pricePerHour}
                onChange={(e) => setPricePerHour(e.target.value)}
                className="input-field pl-8"
              />
              <span className="text-sm font-bold text-slate-600 absolute left-3.5 top-3">₹</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">Total Capacity Slots</label>
            <input
              type="number"
              required
              min="5"
              max="100"
              value={totalSlots}
              disabled={initialData !== null} // Disable for edits to avoid deleting booked slot references
              onChange={(e) => setTotalSlots(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        {/* Operating Hours row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">Open Time</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="06:00"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
                className="input-field pl-10"
              />
              <Clock className="w-4 h-4 text-slate-600 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">Close Time</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="22:00"
                value={closeTime}
                onChange={(e) => setCloseTime(e.target.value)}
                className="input-field pl-10"
              />
              <Clock className="w-4 h-4 text-slate-600 absolute left-3.5 top-3.5" />
            </div>
          </div>
        </div>

        {/* Coordinates row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">Latitude</label>
            <input
              type="number"
              required
              step="0.000001"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">Longitude</label>
            <input
              type="number"
              required
              step="0.000001"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        {/* Amenities checklists */}
        <div className="space-y-2 pt-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">Select Amenities</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {AMENITIES_LIST.map((amenity) => {
              const isChecked = amenities.includes(amenity);
              return (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => handleAmenityToggle(amenity)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-semibold select-none transition-all ${
                    isChecked
                      ? 'bg-primary-600/20 border-primary-500/50 text-slate-900 font-bold'
                      : 'bg-slate-50 border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${
                    isChecked ? 'bg-primary-500 border-primary-400' : 'border-slate-500'
                  }`}>
                    {isChecked && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <span>{amenity}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 pt-4 border-t border-slate-700/30">
        <button
          type="button"
          onClick={onCancel}
          className="w-1/3 py-3 rounded-2xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold transition-all animate-fade-in"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 btn-primary py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow"
        >
          <Sparkles className="w-4 h-4" />
          <span>{initialData ? 'Update Parking Lot' : 'Create Parking Facility'}</span>
        </button>
      </div>
    </form>
  );
}
