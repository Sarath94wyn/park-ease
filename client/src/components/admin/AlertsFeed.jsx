import React, { useState, useEffect } from 'react';
import { getAllAlerts, resolveAlert } from '../../services/adminService';
import { ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function AlertsFeed() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await getAllAlerts();
      setAlerts(res.data || res);
    } catch (e) {
      console.error(e);
      toast.error('Failed to sync alerts feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleResolveAlert = async (alertId) => {
    try {
      await resolveAlert(alertId);
      toast.success('Incident alert marked as resolved');
      fetchAlerts();
    } catch (e) {
      console.error(e);
      toast.error('Failed to resolve alert');
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'active') return a.status === 'active';
    if (filter === 'resolved') return a.status === 'resolved';
    return true;
  });

  return (
    <div className="space-y-6 font-semibold">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div className="space-y-0.5">
          <h3 className="font-extrabold text-base text-neutral-900 flex items-center gap-1.5">
            <span>Incident Registry Feed</span>
          </h3>
          <p className="text-xs text-neutral-550 font-medium font-sans">Monitor offline IoT sensors, capacity levels, and payment gateway issues.</p>
        </div>

        <button
          type="button"
          onClick={fetchAlerts}
          className="p-1.5 border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 rounded-md shadow-sm active:scale-95 flex items-center gap-1.5 text-xs font-bold transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 bg-neutral-50 p-2 border border-neutral-200 rounded-md w-fit shadow-sm">
        {[
          { key: 'all', label: 'All Alerts' },
          { key: 'active', label: 'Active Alerts' },
          { key: 'resolved', label: 'Resolved Tickets' }
        ].map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-1.5 text-xs font-bold rounded-md border transition-all ${
              filter === tab.key
                ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm font-extrabold'
                : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-3">
          <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div>
          <span className="text-xs text-neutral-500">Retrieving incident logs...</span>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="text-center py-12 text-neutral-500 font-semibold text-xs border border-dashed border-neutral-300 rounded-md bg-white">
          No system incidents logged. Systems status normal.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAlerts.map((alert) => {
            const isCritical = alert.severity === 'critical';
            const isWarning = alert.severity === 'warning';
            const isResolved = alert.status === 'resolved';

            let borderStyle = 'border-neutral-200 bg-white text-neutral-800';
            let iconStyle = 'bg-neutral-50 border-neutral-200 text-neutral-700';

            if (!isResolved) {
              if (isCritical) {
                borderStyle = 'border-neutral-900 bg-neutral-950 text-white';
                iconStyle = 'bg-neutral-850 border-neutral-750 text-neutral-200';
              } else if (isWarning) {
                borderStyle = 'border-neutral-400 bg-neutral-100 text-neutral-900';
                iconStyle = 'bg-neutral-200 border-neutral-300 text-neutral-800';
              } else {
                borderStyle = 'border-neutral-250 bg-neutral-50 text-neutral-900';
                iconStyle = 'bg-neutral-150 border-neutral-200 text-neutral-700';
              }
            }

            return (
              <div
                key={alert._id}
                className={`p-4 border rounded-md flex items-start gap-4 transition-all shadow-sm ${borderStyle}`}
              >
                <div className={`p-2 rounded border shrink-0 mt-0.5 ${iconStyle}`}>
                  <ShieldAlert className="w-4.5 h-4.5" />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold">{alert.title}</span>
                    <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded border ${
                      isResolved
                        ? 'bg-neutral-100 border-neutral-250 text-neutral-700'
                        : isCritical
                        ? 'bg-white text-neutral-950 border-white font-black'
                        : 'bg-neutral-900 text-white border-neutral-900 font-extrabold'
                    }`}>
                      {alert.status}
                    </span>
                  </div>

                  <p className={`text-[11px] leading-relaxed font-medium ${isCritical && !isResolved ? 'text-neutral-300' : 'text-neutral-550'}`}>
                    {alert.message}
                  </p>

                  <div className="flex items-center justify-between gap-2 pt-2 text-[10px] text-neutral-400 font-medium">
                    <span>{formatDate(alert.createdAt)}</span>
                    {alert.parkingLot && (
                      <span className="font-bold">
                        Plaza: {alert.parkingLot.name}
                      </span>
                    )}
                  </div>

                  {!isResolved && (
                    <button
                      type="button"
                      onClick={() => handleResolveAlert(alert._id)}
                      className="mt-3 px-3 py-1.5 text-[9px] bg-emerald-50 hover:bg-emerald-100 border border-emerald-250 text-emerald-700 rounded shadow-sm flex items-center gap-1.5 font-bold transition-all"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Resolve Alert</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
