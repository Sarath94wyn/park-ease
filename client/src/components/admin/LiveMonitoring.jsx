import React, { useState, useEffect } from 'react';
import { getAllParkingLots } from '../../services/parkingService';
import { Activity, Clock, RefreshCw, Car } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LiveMonitoring() {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Real-time entry/exit simulation logs state
  const [simulatedLogs, setSimulatedLogs] = useState([
    { id: 1, type: 'checkin', vehicleNumber: 'KL-07-CD-1234', lotName: 'Lulu Mall Parking', slot: 'A3', time: 'Just now' },
    { id: 2, type: 'checkout', vehicleNumber: 'KL-07-EF-5678', lotName: 'MG Road Multi-Level Parking', slot: 'B5', time: '2 mins ago' },
    { id: 3, type: 'checkin', vehicleNumber: 'KL-08-MN-9012', lotName: 'Marine Drive Parking Plaza', slot: 'A1', time: '5 mins ago' },
    { id: 4, type: 'checkin', vehicleNumber: 'KL-11-XY-3456', lotName: 'Cyberpark Parking Tower', slot: 'A10', time: '8 mins ago' },
    { id: 5, type: 'checkout', vehicleNumber: 'KL-07-ZZ-7890', lotName: 'Lulu Mall Parking', slot: 'C2', time: '12 mins ago' }
  ]);

  const fetchLots = async () => {
    try {
      setLoading(true);
      const res = await getAllParkingLots();
      const lotList = res.parkingLots || res.data || res;
      setLots(lotList);
    } catch (e) {
      console.error(e);
      toast.error('Failed to connect to feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLots();
  }, []);

  // Simulate incoming live telemetry events
  useEffect(() => {
    const interval = setInterval(() => {
      if (lots.length === 0) return;
      const randomLot = lots[Math.floor(Math.random() * lots.length)];
      const checkinTypes = ['checkin', 'checkout'];
      const eventType = checkinTypes[Math.floor(Math.random() * 2)];
      const prefix = ['KL', 'KA', 'TN', 'MH', 'DL'][Math.floor(Math.random() * 5)];
      const district = Math.floor(Math.random() * 14) + 1;
      const series = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + String.fromCharCode(65 + Math.floor(Math.random() * 26));
      const suffix = Math.floor(Math.random() * 9000) + 1000;
      const vehicleNum = `${prefix}-${district.toString().padStart(2, '0')}-${series}-${suffix}`;
      const randomSlot = `A${Math.floor(Math.random() * 10) + 1}`;

      const newEvent = {
        id: Date.now(),
        type: eventType,
        vehicleNumber: vehicleNum,
        lotName: randomLot.name,
        slot: randomSlot,
        time: 'Just now'
      };

      setSimulatedLogs(prev => [newEvent, ...prev.slice(0, 7)]);
    }, 8000);

    return () => clearInterval(interval);
  }, [lots]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-3">
        <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div>
        <span className="text-xs text-neutral-500">Syncing live IoT telemetry feed...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-semibold">
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
        <div className="space-y-0.5">
          <h3 className="font-extrabold text-base text-neutral-900 flex items-center gap-1.5">
            <span>Live Telemetry Surveillance</span>
          </h3>
          <p className="text-xs text-neutral-500 font-medium">Real-time occupancy heatmaps, active vehicle check-in tickers, and network traffic status.</p>
        </div>

        <button
          type="button"
          onClick={fetchLots}
          className="p-1.5 border border-neutral-350 bg-white hover:bg-neutral-50 text-neutral-700 rounded-md shadow-sm active:scale-95 flex items-center gap-1.5 text-xs font-bold transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Feed</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap & Availability list */}
        <div className="bg-white border border-neutral-200 p-5 rounded-md shadow-sm lg:col-span-2 space-y-4">
          <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-500 border-b border-neutral-100 pb-2">
            Facility Capacity Distribution
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-1">
            {lots.map((lot) => {
              const occupancyPercentage = Math.round(((lot.totalSlots - lot.availableSlots) / lot.totalSlots) * 100);
              
              let progressColor = 'bg-neutral-900';
              let bgColor = 'bg-neutral-50 border-neutral-200 text-neutral-900';

              if (occupancyPercentage >= 95) {
                progressColor = 'bg-black animate-pulse';
                bgColor = 'bg-white border-neutral-950 text-neutral-950';
              } else if (occupancyPercentage >= 75) {
                progressColor = 'bg-neutral-700';
                bgColor = 'bg-neutral-50 border-neutral-250 text-neutral-800';
              }

              return (
                <div
                  key={lot._id}
                  className={`p-4 border rounded-md flex flex-col gap-2.5 transition-all shadow-sm ${bgColor}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold truncate">{lot.name}</span>
                    <span className="text-[10px] font-black uppercase tracking-wider shrink-0 bg-white border border-neutral-200 px-2 py-0.5 rounded shadow-sm">
                      {occupancyPercentage}% Occupied
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="w-full bg-neutral-150 border border-neutral-200/50 h-2 rounded overflow-hidden">
                      <div
                        className={`h-full rounded ${progressColor}`}
                        style={{ width: `${occupancyPercentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[9px] font-bold text-neutral-550">
                      <span>{lot.availableSlots} Slots Free</span>
                      <span>{lot.totalSlots} Total Spots</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Logs Ticker */}
        <div className="bg-white border border-neutral-200 p-5 rounded-md shadow-sm lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-neutral-800" />
              <span>Surveillance Ticker</span>
            </h4>
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-950"></span>
          </div>

          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {simulatedLogs.map((log) => (
              <div
                key={log.id}
                className={`p-3 border rounded-md flex items-start gap-2.5 text-xs font-semibold shadow-sm transition-all ${
                  log.type === 'checkin'
                    ? 'bg-neutral-900 border-neutral-900 text-white'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-900'
                }`}
              >
                <div className={`p-1.5 rounded border shrink-0 mt-0.5 ${
                  log.type === 'checkin' ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-neutral-100 border-neutral-250 text-neutral-800'
                }`}>
                  <Car className="w-3.5 h-3.5" />
                </div>

                <div className="flex-1 space-y-0.5">
                  <div className="flex justify-between text-[9px] font-bold text-neutral-400">
                    <span>{log.type === 'checkin' ? 'CHECK-IN' : 'CHECK-OUT'}</span>
                    <span>{log.time}</span>
                  </div>
                  <div className="font-extrabold">{log.vehicleNumber}</div>
                  <div className={`text-[10px] ${log.type === 'checkin' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    {log.lotName} (Slot {log.slot})
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
