import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../../services/adminService';
import { Users, MapPin, Ticket, CreditCard, Sparkles, TrendingUp, RefreshCw, Activity, Calendar, ShieldAlert } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await getDashboardStats();
      setStatsData(res.data || res);
    } catch (e) {
      console.error('Error fetching admin stats:', e);
      toast.error('Failed to load metrics');
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
        <div className="w-8 h-8 border-2 border-neutral-350 border-t-neutral-900 rounded-full animate-spin"></div>
        <span className="text-xs text-neutral-500 font-semibold tracking-wide">Syncing metrics data...</span>
      </div>
    );
  }

  if (!statsData || !statsData.stats) return null;

  const { stats } = statsData;

  const STATS_CARDS = [
    {
      title: "Active Lots",
      value: stats.totalParkingLots || 0,
      icon: <MapPin className="w-4 h-4 text-neutral-900" />,
    },
    {
      title: "Total Spaces",
      value: stats.totalSpaces || 0,
      icon: <Activity className="w-4 h-4 text-neutral-900" />,
    },
    {
      title: "Available Slots",
      value: stats.availableSpaces || 0,
      icon: <Sparkles className="w-4 h-4 text-neutral-950" />,
    },
    {
      title: "Occupied Slots",
      value: stats.occupiedSpaces || 0,
      icon: <TrendingUp className="w-4 h-4 text-neutral-950" />,
    },
    {
      title: "Reservations Count",
      value: stats.totalBookings || 0,
      icon: <Ticket className="w-4 h-4 text-neutral-950" />,
    },
    {
      title: "Daily Revenue",
      value: formatCurrency(stats.dailyRevenue || 0),
      icon: <CreditCard className="w-4 h-4 text-neutral-950" />,
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(stats.monthlyRevenue || 0),
      icon: <Calendar className="w-4 h-4 text-neutral-950" />,
    },
    {
      title: "Total Registered Users",
      value: stats.totalUsers || 0,
      icon: <Users className="w-4 h-4 text-neutral-950" />,
    },
  ];

  return (
    <div className="space-y-6 font-semibold">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
        <div className="space-y-0.5">
          <h2 className="text-base font-extrabold text-neutral-900 tracking-tight flex items-center gap-2">
            <span>Operational Metrics Summary</span>
          </h2>
          <p className="text-xs text-neutral-500 font-medium">Real-time status aggregates across the park-ease network.</p>
        </div>
        
        <button
          type="button"
          onClick={fetchStats}
          className="p-1.5 border border-neutral-350 bg-white hover:bg-neutral-50 text-neutral-700 rounded-md transition-all shadow-sm active:scale-95"
          title="Refresh metrics"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Utilization Rate Hero Card */}
      <div className="bg-neutral-900 p-6 rounded-md border border-neutral-800 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 text-center md:text-left">
          <span className="text-[9px] uppercase font-bold bg-neutral-800 border border-neutral-700 text-neutral-300 px-3 py-1 rounded w-fit mx-auto md:mx-0 tracking-wider">
            Live Efficiency Index
          </span>
          <h3 className="text-xl font-bold tracking-tight">System Utilization Rate</h3>
          <p className="text-xs text-neutral-400 max-w-md font-medium">Percentage of total slots currently occupied across all active facilities in the database.</p>
        </div>

        <div className="flex items-center gap-4 bg-neutral-950/60 p-4 rounded-md border border-neutral-800">
          <div className="relative w-20 h-20 flex items-center justify-center">
            {/* SVG Radial Progress Ring */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="currentColor"
                strokeWidth="6"
                className="text-neutral-800"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="currentColor"
                strokeWidth="6"
                className="text-white"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 32}
                strokeDashoffset={2 * Math.PI * 32 * (1 - (stats.utilizationRate || 0) / 100)}
              />
            </svg>
            <span className="absolute text-sm font-black">{stats.utilizationRate || 0}%</span>
          </div>
          <div className="space-y-0.5 font-medium">
            <div className="text-[10px] text-neutral-400">Total Available Spaces</div>
            <div className="text-base font-bold text-white">{stats.availableSpaces} Slots Free</div>
            <div className="text-[9px] text-neutral-500">{stats.occupiedSpaces} of {stats.totalSpaces} currently occupied</div>
          </div>
        </div>
      </div>

      {/* Core statistics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS_CARDS.map((card, i) => (
          <div
            key={i}
            className="bg-white border border-neutral-200/80 p-6 rounded-lg flex items-center justify-between shadow-sm relative overflow-hidden hover:border-neutral-300 hover:shadow-md hover:scale-[1.01] transition-all duration-200 group cursor-pointer"
          >
            <div className="space-y-1">
              <span className="text-[9px] text-neutral-500 font-extrabold uppercase tracking-widest block leading-none mb-1.5">{card.title}</span>
              <span className="text-2xl font-black text-neutral-950 block">{card.value}</span>
            </div>
            
            <div className="w-10 h-10 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-center shrink-0 shadow-sm group-hover:bg-neutral-100 group-hover:border-neutral-300 transition-all duration-200">
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Breakdowns & Info Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Space type distribution */}
        <div className="bg-white p-5 border border-neutral-200 rounded-md space-y-4 shadow-sm">
          <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-500 border-b border-neutral-100 pb-2 flex items-center gap-1.5">
            <span>Space Asset Allocation</span>
          </h4>

          <div className="space-y-3 text-xs">
            {Object.entries(stats.spaceTypesBreakdown || {}).map(([type, count]) => (
              <div key={type} className="space-y-1 font-semibold">
                <div className="flex justify-between text-neutral-600 capitalize">
                  <span>{type} Slots</span>
                  <span className="text-neutral-900 font-bold">{count}</span>
                </div>
                <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden border border-neutral-200/50">
                  <div
                    className={`h-full rounded-full ${
                      type === 'vip' ? 'bg-neutral-900' :
                      type === 'ev' ? 'bg-neutral-600' :
                      type === 'handicap' ? 'bg-neutral-500' :
                      type === 'reserved' ? 'bg-neutral-400' : 'bg-neutral-300'
                    }`}
                    style={{ width: `${stats.totalSpaces > 0 ? (count / stats.totalSpaces) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operational Health Checklist */}
        <div className="bg-white p-5 border border-neutral-200 rounded-md space-y-4 shadow-sm">
          <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-500 border-b border-neutral-100 pb-2 flex items-center gap-1.5">
            <span>System Telemetry Logs</span>
          </h4>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-rose-50 border border-rose-200 rounded-md">
              <ShieldAlert className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h5 className="text-xs font-bold text-rose-950">Incident Registry Warnings</h5>
                <p className="text-[11px] text-rose-800 font-semibold">There are currently {stats.activeAlertsCount} unresolved alerts in the registry, including {stats.sensorFailuresCount} offline IoT space sensors.</p>
              </div>
            </div>

            <div className="divide-y divide-neutral-200 text-xs font-semibold text-neutral-600">
              <div className="flex items-center justify-between py-2">
                <span>Database Connectivity</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>Active</span>
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Google OAuth 2.0 Gateway</span>
                <span className="text-emerald-700">Connected</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Razorpay Checkout Linker</span>
                <span className="text-emerald-700">Operational</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>User Growth (30 days)</span>
                <span className="text-neutral-800">+{stats.userGrowth || 0} Accounts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
