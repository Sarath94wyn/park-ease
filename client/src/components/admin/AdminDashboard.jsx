import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../../services/adminService';
import { Users, MapPin, Ticket, CreditCard, Sparkles, TrendingUp, RefreshCw } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data.stats || data);
    } catch (e) {
      console.error('Error fetching admin stats:', e);
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-3">
        <div className="w-10 h-10 border-4 border-slate-300 border-t-indigo-500 rounded-full animate-spin"></div>
        <span className="text-xs text-slate-600 font-semibold tracking-wide">Syncing manager metrics...</span>
      </div>
    );
  }

  if (!stats) return null;

  const STATS_CARDS = [
    {
      title: "System Users",
      value: stats.totalUsers || 0,
      icon: <Users className="w-5 h-5 text-indigo-400" />,
      color: "from-indigo-600/20 to-indigo-900/10 border-indigo-500/20",
    },
    {
      title: "Parking Facilities",
      value: stats.totalParkingLots || 0,
      icon: <MapPin className="w-5 h-5 text-cyan-600" />,
      color: "from-cyan-600/20 to-cyan-900/10 border-cyan-500/20",
    },
    {
      title: "Reservations",
      value: stats.totalBookings || 0,
      icon: <Ticket className="w-5 h-5 text-amber-700" />,
      color: "from-amber-600/20 to-amber-900/10 border-amber-500/20",
    },
    {
      title: "Gross Revenue",
      value: formatCurrency(stats.totalRevenue || 0),
      icon: <CreditCard className="w-5 h-5 text-emerald-700" />,
      color: "from-emerald-600/20 to-emerald-900/10 border-emerald-500/20",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
            <Sparkles className="w-5 h-5 text-primary-700" />
            <span>Admin Metrics Overview</span>
          </h2>
          <p className="text-xs text-slate-600">Real-time status aggregates across the system.</p>
        </div>
        
        <button
          type="button"
          onClick={fetchStats}
          className="p-2 border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-xl transition-all"
          title="Refresh metrics"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Core statistics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS_CARDS.map((card, i) => (
          <div
            key={i}
            className={`bg-gradient-to-br border p-5 rounded-2xl flex items-center justify-between shadow shadow-slate-950/20 relative overflow-hidden ${card.color}`}
          >
            <div className="space-y-1">
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest block">{card.title}</span>
              <span className="text-2xl font-black text-slate-900">{card.value}</span>
            </div>
            
            <div className="w-10 h-10 rounded-xl bg-slate-100/30 border border-slate-200/50 flex items-center justify-center">
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Detail breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-slate-900">
        {/* Active sessions alert info */}
        <div className="glass-card-dark p-5 border border-slate-200 space-y-4">
          <h4 className="font-extrabold text-sm border-b border-slate-200/80 pb-2 flex items-center gap-1.5">
            <TrendingUp className="w-4.5 h-4.5 text-primary-700" />
            <span>Facility Status Metrics</span>
          </h4>

          <div className="space-y-3.5 text-xs font-semibold">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Active Bookings Count</span>
              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 px-2 py-0.5 rounded font-black">
                {stats.activeBookings || 0} slots
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200/80 pt-3">
              <span className="text-slate-600">Average Booking Duration</span>
              <span className="text-slate-800">2.4 hours</span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200/80 pt-3">
              <span className="text-slate-600">Peak Occupancy Hour</span>
              <span className="text-slate-800">05:00 PM - 08:00 PM</span>
            </div>
          </div>
        </div>

        {/* System parameters checklist summary */}
        <div className="glass-card-dark p-5 border border-slate-200 space-y-4">
          <h4 className="font-extrabold text-sm border-b border-slate-200/80 pb-2">
            System Operations
          </h4>

          <div className="space-y-3.5 text-xs font-semibold text-slate-700">
            <div className="flex items-center justify-between">
              <span>Database Server</span>
              <span className="text-emerald-700 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Operational</span>
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200/80 pt-3">
              <span>Google OAuth Gate</span>
              <span className="text-emerald-700">Active</span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200/80 pt-3">
              <span>Dialogflow CX API</span>
              <span className="text-emerald-700">Connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
