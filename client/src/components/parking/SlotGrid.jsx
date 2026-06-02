import React, { useState } from 'react';
import { Car, Zap, Accessibility, ShieldAlert, Award } from 'lucide-react';

export default function SlotGrid({ slots = [], selectedSlot, onSlotSelect, disabled = false }) {
  const [activeFloor, setActiveFloor] = useState(1);

  // Group slots by floor
  const floors = [...new Set(slots.map(s => s.floor || 1))].sort((a, b) => a - b);
  const filteredSlots = slots.filter(s => (s.floor || 1) === activeFloor);

  const getSlotIcon = (type) => {
    switch (type) {
      case 'ev':
        return <Zap className="w-4 h-4" />;
      case 'handicap':
        return <Accessibility className="w-4 h-4" />;
      case 'large':
        return <Award className="w-4 h-4" />;
      default:
        return <Car className="w-4 h-4" />;
    }
  };

  const getSlotTypeLabel = (type) => {
    switch (type) {
      case 'ev': return 'EV';
      case 'handicap': return 'Handicap';
      case 'large': return 'SUV/Large';
      case 'compact': return 'Compact';
      default: return 'Standard';
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Floor Selector tabs */}
      {floors.length > 1 && (
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2 overflow-x-auto scrollbar-none">
          {floors.map(floor => (
            <button
              key={floor}
              type="button"
              onClick={() => setActiveFloor(floor)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                activeFloor === floor
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                  : 'bg-slate-50/40 text-slate-600 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              Floor {floor === 0 ? 'G (Ground)' : floor > 0 ? floor : `B${Math.abs(floor)}`}
            </button>
          ))}
        </div>
      )}

      {/* Responsive Slot Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
        {filteredSlots.map((slot) => {
          const isSelected = selectedSlot === slot.slotNumber;
          const isOccupied = slot.isOccupied;

          let slotClass = 'slot-available';
          if (isOccupied) slotClass = 'slot-occupied';
          if (isSelected) slotClass = 'slot-selected';

          return (
            <button
              key={slot._id || slot.slotNumber}
              type="button"
              disabled={isOccupied || disabled}
              onClick={() => onSlotSelect && onSlotSelect(slot.slotNumber)}
              className={`relative flex flex-col items-center justify-between p-3 rounded-xl border text-center h-20 transition-all ${slotClass}`}
            >
              <span className="text-xs font-bold uppercase tracking-wider">{slot.slotNumber}</span>
              
              <div className="flex items-center justify-center p-1 rounded-full bg-slate-100/50">
                {getSlotIcon(slot.type)}
              </div>

              <span className="text-[10px] opacity-80 uppercase font-semibold">
                {getSlotTypeLabel(slot.type)}
              </span>

              {isOccupied && (
                <div className="absolute inset-0 bg-slate-100/40 rounded-xl flex items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-bold text-rose-300 uppercase tracking-widest bg-rose-950/80 px-2 py-0.5 rounded border border-rose-500/20">
                    Full
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Grid Legend */}
      <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-600 border-t border-slate-700/30 pt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-emerald-500/20 border border-emerald-500/50"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-rose-500/20 border border-rose-500/50"></div>
          <span>Occupied</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-primary-500/30 border border-primary-400 ring-1 ring-primary-400/50"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1.5 border-l border-slate-200/80 pl-4">
          <Accessibility className="w-3.5 h-3.5 text-blue-700" />
          <span>Handicap</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-emerald-700" />
          <span>EV Charger</span>
        </div>
      </div>
    </div>
  );
}
