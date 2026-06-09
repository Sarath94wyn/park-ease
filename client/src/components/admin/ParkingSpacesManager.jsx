import React, { useState, useEffect } from 'react';
import { getAllParkingLots, getParkingLotById } from '../../services/parkingService';
import { updateParkingSpace } from '../../services/adminService';
import { RefreshCw, Cpu, Wrench, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ParkingSpacesManager() {
  const [lots, setLots] = useState([]);
  const [selectedLotId, setSelectedLotId] = useState('');
  const [currentLot, setCurrentLot] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [loadingLots, setLoadingLots] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  // Selected slot configuration state
  const [editingSlot, setEditingSlot] = useState(null);
  const [slotType, setSlotType] = useState('standard');
  const [slotMaintenance, setSlotMaintenance] = useState('operational');
  const [slotSensor, setSlotSensor] = useState('online');
  const [updating, setUpdating] = useState(false);

  const fetchLots = async () => {
    try {
      setLoadingLots(true);
      const res = await getAllParkingLots();
      const lotList = res.parkingLots || res.data || res;
      setLots(lotList);
      if (lotList.length > 0 && !selectedLotId) {
        setSelectedLotId(lotList[0]._id);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load parking facilities');
    } finally {
      setLoadingLots(false);
    }
  };

  const fetchLotDetails = async (id) => {
    if (!id) return;
    try {
      setLoadingDetail(true);
      const res = await getParkingLotById(id);
      setCurrentLot(res.data || res);
      setSelectedFloor(1);
      setEditingSlot(null);
    } catch (e) {
      console.error(e);
      toast.error('Failed to fetch lot details');
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    fetchLots();
  }, []);

  useEffect(() => {
    if (selectedLotId) {
      fetchLotDetails(selectedLotId);
    }
  }, [selectedLotId]);

  const handleEditSlotClick = (slot) => {
    setEditingSlot(slot);
    setSlotType(slot.type);
    setSlotMaintenance(slot.maintenanceStatus || 'operational');
    setSlotSensor(slot.sensorStatus || 'online');
  };

  const handleSaveSlotConfig = async (e) => {
    e.preventDefault();
    if (!currentLot || !editingSlot) return;
    try {
      setUpdating(true);
      await updateParkingSpace(currentLot._id, editingSlot.slotNumber, {
        type: slotType,
        maintenanceStatus: slotMaintenance,
        sensorStatus: slotSensor
      });
      toast.success(`Slot ${editingSlot.slotNumber} parameters updated`);
      fetchLotDetails(currentLot._id);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update slot');
    } finally {
      setUpdating(false);
    }
  };

  // Extract unique floors
  const floors = currentLot && currentLot.slots
    ? [...new Set(currentLot.slots.map(s => s.floor || 1))].sort((a, b) => a - b)
    : [1];

  const filteredSlots = currentLot && currentLot.slots
    ? currentLot.slots.filter(s => (s.floor || 1) === selectedFloor)
    : [];

  return (
    <div className="space-y-6 font-semibold">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div className="space-y-0.5">
          <h3 className="font-extrabold text-base text-neutral-900 flex items-center gap-1.5">
            <span>Slots Grid Config</span>
          </h3>
          <p className="text-xs text-neutral-500 font-medium">Configure space categories, telemetry sensors, and maintenance logs.</p>
        </div>

        <div className="flex items-center gap-2">
          {loadingLots ? (
            <div className="w-4 h-4 border border-neutral-350 border-t-neutral-900 rounded-full animate-spin"></div>
          ) : (
            <select
              value={selectedLotId}
              onChange={(e) => setSelectedLotId(e.target.value)}
              className="px-3.5 py-2 text-xs font-bold bg-white border border-neutral-300 rounded-md outline-none focus:border-neutral-900 shadow-sm"
            >
              {lots.map((lot) => (
                <option key={lot._id} value={lot._id}>
                  {lot.name}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={() => fetchLotDetails(selectedLotId)}
            className="p-2 border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 rounded-md shadow-sm active:scale-95 transition-all"
            title="Reload Layout"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {loadingDetail ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-3">
          <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div>
          <span className="text-xs text-neutral-550">Loading physical slots layout...</span>
        </div>
      ) : currentLot ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main layout view */}
          <div className="lg:col-span-2 space-y-4">
            {/* Floor tabs bar */}
            <div className="flex gap-2 border-b border-neutral-100 pb-2">
              {floors.map(floor => (
                <button
                  key={floor}
                  type="button"
                  onClick={() => {
                    setSelectedFloor(floor);
                    setEditingSlot(null);
                  }}
                  className={`px-4 py-2 text-xs font-bold rounded-md border transition-all ${
                    selectedFloor === floor
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm font-extrabold'
                      : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  Floor {floor}
                </button>
              ))}
            </div>

            {/* Grid display */}
            <div className="bg-neutral-50 border border-neutral-200 p-5 rounded-md">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {filteredSlots.map((slot) => {
                  const isMaintenance = slot.maintenanceStatus === 'maintenance';
                  const isOffline = slot.sensorStatus === 'offline';
                  const isOccupied = slot.isOccupied;

                  let cardStyle = '';
                  let statusLabel = '';

                  if (isMaintenance) {
                    cardStyle = 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100/70 hover:border-amber-300';
                    statusLabel = 'Maintenance';
                  } else if (isOccupied) {
                    cardStyle = 'border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100/70 hover:border-rose-300';
                    statusLabel = 'Occupied';
                  } else if (isOffline) {
                    cardStyle = 'border-dashed border-neutral-350 bg-neutral-100 text-neutral-500 hover:bg-neutral-200/50';
                    statusLabel = 'Offline';
                  } else {
                    cardStyle = 'border-emerald-250 bg-emerald-50 text-emerald-800 hover:bg-emerald-100/70 hover:border-emerald-300';
                    statusLabel = 'Vacant';
                  }

                  return (
                    <button
                      key={slot._id || slot.slotNumber}
                      type="button"
                      onClick={() => handleEditSlotClick(slot)}
                      className={`border p-3 rounded-md flex flex-col items-center justify-between text-center gap-1.5 transition-all shadow-sm ${cardStyle} ${
                        editingSlot && editingSlot.slotNumber === slot.slotNumber ? 'ring-1 ring-neutral-900 ring-offset-1' : ''
                      }`}
                    >
                      <span className="text-xs font-extrabold tracking-wider">{slot.slotNumber}</span>
                      
                      <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded border ${
                        slot.type === 'vip' ? 'bg-neutral-950 text-white border-neutral-955' :
                        slot.type === 'ev' ? 'bg-blue-50 border-blue-200 text-blue-755' :
                        slot.type === 'handicap' ? 'bg-indigo-50 border-indigo-200 text-indigo-755' :
                        slot.type === 'reserved' ? 'bg-neutral-900 text-white border-neutral-900' :
                        'bg-white border-neutral-200 text-neutral-500'
                      }`}>
                        {slot.type}
                      </span>
                      
                      <span className="text-[9px] font-bold opacity-80">
                        {statusLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Legend guide */}
            <div className="flex flex-wrap gap-4 text-[10px] uppercase font-bold text-neutral-500 bg-white p-4 border border-neutral-200 rounded-md">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 bg-emerald-50 border border-emerald-250 rounded"></span>
                <span>Vacant / Available</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 bg-rose-50 border border-rose-250 rounded"></span>
                <span>Occupied</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 bg-amber-50 border border-amber-250 rounded"></span>
                <span>Under Maintenance</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 bg-neutral-100 border border-dashed border-neutral-350 rounded"></span>
                <span>Sensor Offline</span>
              </div>
            </div>
          </div>

          {/* Config sidebar panel */}
          <div className="bg-white border border-neutral-200 p-5 rounded-md shadow-sm h-fit">
            <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-500 border-b border-neutral-100 pb-2.5 flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-neutral-800" />
              <span>Space Configuration</span>
            </h4>

            {editingSlot ? (
              <form onSubmit={handleSaveSlotConfig} className="space-y-4 pt-3">
                <div className="space-y-1">
                  <span className="text-[9px] text-neutral-400 font-extrabold uppercase tracking-wide block">Target Space</span>
                  <div className="text-base font-bold text-neutral-950">Slot {editingSlot.slotNumber} (Floor {editingSlot.floor})</div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-700 block uppercase tracking-wider text-[10px]">Classification</label>
                  <select
                    value={slotType}
                    onChange={(e) => setSlotType(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold border border-neutral-300 rounded-md outline-none focus:border-neutral-900 bg-white"
                  >
                    <option value="standard">Regular (Standard)</option>
                    <option value="compact">Compact (2 Wheelers)</option>
                    <option value="ev">EV Charging</option>
                    <option value="large">Large (Heavy Vehicle)</option>
                    <option value="vip">VIP Space</option>
                    <option value="reserved">Reserved Space</option>
                    <option value="handicap">Handicapped Access</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-700 block uppercase tracking-wider text-[10px]">Operational State</label>
                  <select
                    value={slotMaintenance}
                    onChange={(e) => setSlotMaintenance(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold border border-neutral-300 rounded-md outline-none focus:border-neutral-900 bg-white"
                  >
                    <option value="operational">Operational</option>
                    <option value="maintenance">Under Maintenance</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-700 block uppercase tracking-wider text-[10px]">Sensor Telemetry</label>
                  <select
                    value={slotSensor}
                    onChange={(e) => setSlotSensor(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold border border-neutral-300 rounded-md outline-none focus:border-neutral-900 bg-white"
                  >
                    <option value="online">Online (Active)</option>
                    <option value="offline">Offline (Faulty)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="w-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs py-2.5 px-4 rounded-md flex items-center justify-center gap-1.5 shadow font-bold transition-all"
                >
                  {updating ? (
                    <span className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Update Slot Parameters</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="py-12 text-center text-neutral-400 space-y-2">
                <p className="text-xs font-medium">Select a slot in the grid layout to edit parameters.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-neutral-500 font-semibold text-xs border border-dashed border-neutral-300 rounded-md bg-white">
          Select a facility to inspect floor grid layout.
        </div>
      )}
    </div>
  );
}
