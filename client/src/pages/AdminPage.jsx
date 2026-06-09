import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminDashboard from '../components/admin/AdminDashboard';
import ParkingLotForm from '../components/admin/ParkingLotForm';

// Import new modular subcomponents
import ParkingSpacesManager from '../components/admin/ParkingSpacesManager';
import BookingManager from '../components/admin/BookingManager';
import UserManager from '../components/admin/UserManager';
import RevenuePaymentsManager from '../components/admin/RevenuePaymentsManager';
import LiveMonitoring from '../components/admin/LiveMonitoring';
import AnalyticsReports from '../components/admin/AnalyticsReports';
import AlertsFeed from '../components/admin/AlertsFeed';
import StaffRolesManager from '../components/admin/StaffRolesManager';
import CustomerSupportManager from '../components/admin/CustomerSupportManager';

import { getAllParkingLots, createParkingLot, updateParkingLot, deleteParkingLot } from '../services/parkingService';
import Modal from '../components/common/Modal';
import { getDashboardStats } from '../services/adminService';
import { 
  Shield, MapPin, Ticket, Users, Edit3, Trash2, Plus, LogOut,
  LayoutDashboard, Cpu, DollarSign, Activity, BarChart3, Bell, ShieldCheck, MessageSquare 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Parking lots admin state
  const [lots, setLots] = useState([]);
  const [lotsLoading, setLotsLoading] = useState(false);
  const [showLotModal, setShowLotModal] = useState(false);
  const [selectedLotForEdit, setSelectedLotForEdit] = useState(null);

  // Sidebar live indicators state
  const [sidebarStats, setSidebarStats] = useState(null);

  const fetchSidebarStats = async () => {
    try {
      const res = await getDashboardStats();
      const statsObj = res.data?.stats || res.stats || res;
      setSidebarStats(statsObj);
    } catch (e) {
      console.error('Sidebar stats fetch failed:', e);
    }
  };

  useEffect(() => {
    fetchSidebarStats();
    const timer = setInterval(fetchSidebarStats, 15000);
    return () => clearInterval(timer);
  }, []);

  const fetchLots = async () => {
    try {
      setLotsLoading(true);
      const data = await getAllParkingLots();
      setLots(data.parkingLots || data.data || data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load parking lots');
    } finally {
      setLotsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'lots') {
      fetchLots();
    }
  }, [activeTab]);

  const handleCreateLot = async (formData) => {
    try {
      await createParkingLot(formData);
      toast.success('Parking lot created successfully!');
      setShowLotModal(false);
      fetchLots();
    } catch (e) {
      console.error(e);
      toast.error('Failed to create lot');
    }
  };

  const handleUpdateLot = async (formData) => {
    try {
      await updateParkingLot(selectedLotForEdit._id, formData);
      toast.success('Parking lot updated successfully!');
      setShowLotModal(false);
      setSelectedLotForEdit(null);
      fetchLots();
    } catch (e) {
      console.error(e);
      toast.error('Failed to update lot');
    }
  };

  const handleDeleteLot = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this parking lot? It will no longer show in client searches.')) return;
    try {
      await deleteParkingLot(id);
      toast.success('Parking lot deactivated');
      fetchLots();
    } catch (e) {
      console.error(e);
      toast.error('Failed to deactivate lot');
    }
  };

  if (!user || user.role !== 'admin') return null;

  // Sidebar Menu Items Config
  const MENU_ITEMS = [
    { key: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: 'lots', label: 'Facilities CRUD', icon: <MapPin className="w-4 h-4" /> },
    { key: 'spaces', label: 'Slots Config', icon: <Cpu className="w-4 h-4" /> },
    { key: 'bookings', label: 'Reservations Log', icon: <Ticket className="w-4 h-4" /> },
    { key: 'users', label: 'Userbase Registry', icon: <Users className="w-4 h-4" /> },
    { key: 'revenue', label: 'Revenue & Payments', icon: <DollarSign className="w-4 h-4" /> },
    { key: 'live', label: 'Live Monitoring', icon: <Activity className="w-4 h-4" /> },
    { key: 'analytics', label: 'Analytics & Trends', icon: <BarChart3 className="w-4 h-4" /> },
    { key: 'alerts', label: 'Incident Feed', icon: <Bell className="w-4 h-4" /> },
    { key: 'staff', label: 'Staff Roles', icon: <ShieldCheck className="w-4 h-4" /> },
    { key: 'support', label: 'Support Inquiries', icon: <MessageSquare className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col md:flex-row relative">
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-neutral-950 text-neutral-300 flex flex-col justify-between border-r border-neutral-800 shrink-0 z-20">
        <div className="p-5 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-neutral-800 pb-5">
            <Shield className="w-5 h-5 text-white" />
            <div className="flex flex-col">
              <span className="font-extrabold text-xs tracking-wider text-white uppercase">PARKEASE SYSTEM</span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-neutral-500">ADMINISTRATIVE PORTAL</span>
            </div>
          </div>

          <nav className="space-y-1 text-left">
            {MENU_ITEMS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all rounded-md ${
                  activeTab === item.key
                    ? 'bg-neutral-800 text-white font-extrabold border-l-2 border-white pl-3.5 shadow-sm'
                    : 'text-neutral-500 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="shrink-0">{item.icon}</div>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.key === 'alerts' && sidebarStats?.activeAlertsCount > 0 && (
                  <span className="bg-rose-600 border border-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black animate-pulse">
                    {sidebarStats.activeAlertsCount}
                  </span>
                )}
                {item.key === 'live' && sidebarStats?.activeBookings > 0 && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-neutral-900 bg-neutral-950 text-neutral-400 text-[10px] space-y-3 font-sans">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=333333&color=ffffff`}
                alt={user.name}
                className="w-8 h-8 rounded-full border border-neutral-800 shadow-sm"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-neutral-950" title="System Operator Online"></span>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-extrabold text-neutral-100 truncate leading-tight">{user.name}</span>
              <span className="text-[9px] text-neutral-400 truncate font-semibold mb-0.5">{user.email}</span>
              <span className="text-[8px] uppercase tracking-wider font-black text-neutral-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-600"></span>
                <span>{user.staffRole ? user.staffRole.replace('_', ' ') : (user.role || 'Admin')}</span>
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              window.location.href = '/';
            }}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white rounded text-[9px] font-bold uppercase tracking-wider transition-all"
          >
            <LogOut className="w-3 h-3" />
            <span>Logout Session</span>
          </button>
        </div>
      </aside>

      {/* Main panel content space */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-full z-10 relative">
        <div className="max-w-6xl mx-auto">
          {/* Active Tab Panel Controller */}
          <div className="animate-fade-in bg-white border border-neutral-200 p-6 rounded-lg shadow-sm">
            
            {activeTab === 'overview' && <AdminDashboard />}
            
            {activeTab === 'spaces' && <ParkingSpacesManager />}
            
            {activeTab === 'bookings' && <BookingManager />}
            
            {activeTab === 'users' && <UserManager />}
            
            {activeTab === 'revenue' && <RevenuePaymentsManager />}
            
            {activeTab === 'live' && <LiveMonitoring />}
            
            {activeTab === 'analytics' && <AnalyticsReports />}
            
            {activeTab === 'alerts' && <AlertsFeed />}
            
            {activeTab === 'staff' && <StaffRolesManager />}
            
            {activeTab === 'support' && <CustomerSupportManager />}

            {/* Parking Lot Management Tab CRUD panel */}
            {activeTab === 'lots' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                  <div className="space-y-0.5">
                    <h3 className="font-extrabold text-base text-neutral-900">
                      Parking Lot Facilities CRUD
                    </h3>
                    <p className="text-xs text-neutral-500">Configure geo positions, pricing, capacity, and active status.</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLotForEdit(null);
                      setShowLotModal(true);
                    }}
                    className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs py-2.5 px-4 rounded-md font-bold transition-all shadow active:scale-95 flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Lot</span>
                  </button>
                </div>

                {lotsLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-3">
                    <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div>
                    <span className="text-xs text-neutral-550 font-semibold">Syncing lots...</span>
                  </div>
                ) : lots.length === 0 ? (
                  <div className="text-center py-12 text-neutral-500 font-semibold text-xs border border-dashed border-neutral-300 rounded-md">
                    No parking lots found in database.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-md border border-neutral-200 max-w-full font-semibold">
                    <table className="min-w-full divide-y divide-neutral-200 text-left text-xs text-neutral-800">
                      <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider text-[9px] select-none font-bold">
                        <tr>
                          <th className="px-6 py-3.5">Facility Name</th>
                          <th className="px-6 py-3.5">Address</th>
                          <th className="px-6 py-3.5 text-center">Hourly Rate</th>
                          <th className="px-6 py-3.5 text-center">Available Capacity</th>
                          <th className="px-6 py-3.5 text-center">Status</th>
                          <th className="px-6 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200 bg-white">
                        {lots.map((lot) => (
                          <tr key={lot._id} className="hover:bg-neutral-50 transition-colors">
                            <td className="px-6 py-4 font-bold text-neutral-900">{lot.name}</td>
                            <td className="px-6 py-4 text-neutral-500 font-medium max-w-xs truncate">{lot.address}</td>
                            <td className="px-6 py-4 text-center font-bold">
                              <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-mono text-xs font-bold inline-block">
                                ₹{lot.pricePerHour} /hr
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center text-neutral-600 font-bold">
                              {lot.availableSlots} / {lot.totalSlots} Slots Free
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${
                                lot.isActive
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-extrabold'
                                  : 'bg-rose-50 border-rose-200 text-rose-700 font-extrabold'
                              }`}>
                                {lot.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedLotForEdit(lot);
                                    setShowLotModal(true);
                                  }}
                                  className="p-1.5 border border-emerald-200 hover:bg-emerald-50 text-emerald-700 rounded-md transition-all bg-white"
                                  title="Edit Parameters"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                
                                {lot.isActive && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteLot(lot._id)}
                                    className="p-1.5 border border-rose-200 hover:bg-rose-50 text-rose-700 rounded-md transition-all bg-white"
                                    title="Deactivate Lot"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

          </div>
          {/* Dashboard footer */}
          <footer className="mt-8 pt-6 border-t border-neutral-200 text-neutral-400 text-[9px] font-bold uppercase tracking-wider flex justify-between items-center font-sans">
            <span className="flex items-center gap-1.5">
              <span>ParkEase Administrative System</span>
              <span className="h-1 w-1 rounded-full bg-neutral-300"></span>
              <span className="text-neutral-500 font-semibold lowercase">v1.4.0</span>
            </span>
            <span className="flex items-center gap-2 text-neutral-500">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>All Systems Operational</span>
              <span>&copy; {new Date().getFullYear()}</span>
            </span>
          </footer>
        </div>
      </main>

      {/* Add / Edit ParkingLot Modal */}
      <Modal isOpen={showLotModal} onClose={() => setShowLotModal(false)} title={selectedLotForEdit ? 'Update Facility Parameters' : 'Add Parking Facility'} size="lg">
        <div className="p-2">
          <ParkingLotForm
            initialData={selectedLotForEdit}
            onSubmit={selectedLotForEdit ? handleUpdateLot : handleCreateLot}
            onCancel={() => {
              setShowLotModal(false);
              setSelectedLotForEdit(null);
            }}
          />
        </div>
      </Modal>
    </div>
  );
}
