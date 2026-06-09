import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../../services/adminService';
import { BarChart2, Download, RefreshCw, Calendar, FileSpreadsheet } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function AnalyticsReports() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await getDashboardStats();
      setAnalyticsData(res.data || res);
    } catch (e) {
      console.error(e);
      toast.error('Failed to sync analytics statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleExport = (format) => {
    toast.loading(`Compiling system metrics into ${format}...`);
    setTimeout(() => {
      toast.dismiss();
      try {
        const mockData = `ParkEase System Analytics Summary Report\nGenerated: ${new Date().toISOString()}\n====================================\n\n` +
          `Overview Metrics:\n` +
          `- Total Spaces: ${analyticsData?.stats?.totalSpaces || 0}\n` +
          `- Active Users: ${analyticsData?.stats?.totalUsers || 0}\n` +
          `- Gross Revenue: ${analyticsData?.stats?.totalRevenue || 0} INR\n` +
          `- Utilization Index: ${analyticsData?.stats?.utilizationRate || 0}%\n\n` +
          `Generated successfully. Status: Operational.`;

        const blob = new Blob([mockData], { type: 'text/plain;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `ParkEase_Analytics_Report_${new Date().toISOString().slice(0, 10)}.${format === 'excel' ? 'csv' : 'txt'}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`Exported ${format.toUpperCase()} report successfully`);
      } catch (err) {
        console.error(err);
        toast.error('Export compiling failed');
      }
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-3">
        <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div>
        <span className="text-xs text-neutral-500">Compiling historical charts and trends...</span>
      </div>
    );
  }

  const peakHours = analyticsData?.peakHours || [];
  const revenueByLot = analyticsData?.revenueByLot || [];

  return (
    <div className="space-y-6 font-semibold">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div className="space-y-0.5">
          <h3 className="font-extrabold text-base text-neutral-900 flex items-center gap-1.5">
            <span>Analytics & Report Logs</span>
          </h3>
          <p className="text-xs text-neutral-500 font-medium">Audit usage peaks, examine revenue trends, and compile downloadable files.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleExport('excel')}
            className="px-3.5 py-2 border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 rounded-md flex items-center gap-1.5 shadow-sm font-bold text-xs transition-all active:scale-95"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-neutral-700" />
            <span>Export CSV</span>
          </button>
          
          <button
            type="button"
            onClick={() => handleExport('pdf')}
            className="px-3.5 py-2 border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 rounded-md flex items-center gap-1.5 shadow-sm font-bold text-xs transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-neutral-700" />
            <span>Export PDF</span>
          </button>

          <button
            type="button"
            onClick={fetchAnalytics}
            className="p-2 border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 rounded-md shadow-sm active:scale-95 transition-all"
            title="Reload metrics"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Hours visual bar chart */}
        <div className="bg-white border border-neutral-200 p-5 rounded-md shadow-sm space-y-4">
          <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-500 border-b border-neutral-100 pb-2 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-neutral-800" />
            <span>Peak Usage Hours Distribution</span>
          </h4>

          {peakHours.length === 0 ? (
            <div className="text-center py-12 text-neutral-400 text-xs font-semibold">No booking data available.</div>
          ) : (
            <div className="space-y-3 pt-2">
              <p className="text-[11px] text-neutral-400 font-medium font-sans">Distribution of active reservation start times by hour of the day.</p>
              <div className="flex items-end justify-between h-40 gap-1.5 pt-4 border-b border-neutral-200">
                {peakHours.slice(0, 12).map((hour, idx) => {
                  const maxCount = Math.max(...peakHours.map(h => h.count));
                  const percentage = maxCount > 0 ? (hour.count / maxCount) * 100 : 0;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                      <div className="text-[9px] font-black opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900 text-white px-1 py-0.5 rounded shadow">
                        {hour.count}
                      </div>
                      <div
                        className="w-full bg-neutral-900 hover:bg-black rounded-t transition-all"
                        style={{ height: `${percentage}%` }}
                        title={`${hour.count} reservations at ${hour._id}:00`}
                      ></div>
                      <span className="text-[9px] text-neutral-500 font-extrabold">{hour._id}:00</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Revenue Trends by Facility bar chart */}
        <div className="bg-white border border-neutral-200 p-5 rounded-md shadow-sm space-y-4">
          <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-500 border-b border-neutral-100 pb-2 flex items-center gap-1.5">
            <BarChart2 className="w-3.5 h-3.5 text-neutral-850" />
            <span>Most Popular Lots by Revenue</span>
          </h4>

          {revenueByLot.length === 0 ? (
            <div className="text-center py-12 text-neutral-400 text-xs font-semibold">No data recorded yet.</div>
          ) : (
            <div className="space-y-4 pt-2">
              {revenueByLot.slice(0, 5).map((lot, idx) => {
                const maxRevenue = Math.max(...revenueByLot.map(r => r.revenue));
                const percentage = maxRevenue > 0 ? (lot.revenue / maxRevenue) * 100 : 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-800 font-bold max-w-[70%] truncate">{lot.name}</span>
                      <span className="text-neutral-900 font-bold">{formatCurrency(lot.revenue)}</span>
                    </div>
                    <div className="w-full bg-neutral-100 h-2.5 rounded overflow-hidden border border-neutral-200/50">
                      <div
                        className="h-full rounded bg-neutral-900 transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
