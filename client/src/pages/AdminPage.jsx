import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminDashboard from '../components/admin/AdminDashboard';
import ParkingLotForm from '../components/admin/ParkingLotForm';
import { getAllParkingLots, createParkingLot, updateParkingLot, deleteParkingLot } from '../services/parkingService';
import { getAllBookings } from '../services/bookingService';
import { getAllUsers, updateUserRole } from '../services/adminService';
import Modal from '../components/common/Modal';
import { Shield, Sparkles, MapPin, Ticket, Users, Edit3, Trash2, ShieldAlert, Plus, Award, User, RefreshCw } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // overview | lots | bookings | users

  // Parking lots admin state
  const [lots, setLots] = useState([]);
  const [lotsLoading, setLotsLoading] = useState(false);
  const [showLotModal, setShowLotModal] = useState(false);
  const [selectedLotForEdit, setSelectedLotForEdit] = useState(null);

  // Bookings list state
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  // Users listing state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const fetchLots = async () => {
    try {
      setLotsLoading(true);
      const data = await getAllParkingLots();
      setLots(data.parkingLots || data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load parking lots');
    } finally {
      setLotsLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setBookingsLoading(true);
      const data = await getAllBookings();
      setBookings(data.bookings || data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load bookings');
    } finally {
      setBookingsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const data = await getAllUsers();
      setUsers(data.users || data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load users list');
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'lots') fetchLots();
    if (activeTab === 'bookings') fetchBookings();
    if (activeTab === 'users') fetchUsers();
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
    if (!window.confirm('Are you sure you want to deactivate this parking lot? It will no longer show in search.')) return;
    try {
      await deleteParkingLot(id);
      toast.success('Parking lot deactivated');
      fetchLots();
    } catch (e) {
      console.error(e);
      toast.error('Failed to deactivate lot');
    }
  };

  const handleRoleToggle = async (targetUser) => {
    const nextRole = targetUser.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Are you sure you want to change role of ${targetUser.name} to ${nextRole}?`)) return;
    
    try {
      await updateUserRole(targetUser._id, nextRole);
      toast.success(`Role changed to ${nextRole}`);
      fetchUsers();
    } catch (e) {
      console.error(e);
      toast.error('Failed to update role');
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6 relative select-none">
      {/* Background decoration radial blurs */}
      <div className="absolute top-[-10%] right-[-10%] w-72 h-72 bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        {/* Visual Greetings Admin Banner */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-3xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[9px] uppercase font-black bg-indigo-500/20 border border-indigo-500/35 text-indigo-300 px-2.5 py-1 rounded-full flex items-center gap-1 w-fit mx-auto sm:mx-0">
              <Shield className="w-2.5 h-2.5" />
              <span>Administrative System Panel</span>
            </span>
            <h2 className="text-2xl font-black tracking-tight mt-2">Console Dashboard</h2>
            <p className="text-xs text-slate-600 font-semibold">Logged in as {user.name} ({user.email})</p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => (window.location.href = '/dashboard')}
              className="btn-outline text-xs px-5 py-2.5 rounded-xl border-slate-300 text-slate-700 hover:text-white"
            >
              User Dashboard
            </button>
          </div>
        </div>

        {/* Dynamic tabs switcher bar */}
        <div className="flex gap-4 border-b border-slate-200 pb-1 overflow-x-auto scrollbar-none select-none">
          {[
            { key: 'overview', label: 'Overview', icon: <Shield className="w-4 h-4" /> },
            { key: 'lots', label: 'Facilities', icon: <MapPin className="w-4 h-4" /> },
            { key: 'bookings', label: 'Reservations', icon: <Ticket className="w-4 h-4" /> },
            { key: 'users', label: 'Userbase', icon: <Users className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-wider border-b-2 whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'border-primary-500 text-primary-700 font-black'
                  : 'border-transparent text-slate-600 hover:text-slate-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Dynamic panels controller */}
        <div className="animate-fade-in pt-2">
          
          {/* Panel 1: Overview */}
          {activeTab === 'overview' && <AdminDashboard />}

          {/* Panel 2: Facilities lots */}
          {activeTab === 'lots' && (
            <div className="space-y-6">
              {/* Header actions */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="font-extrabold text-lg flex items-center gap-1.5">
                    <MapPin className="w-5 h-5 text-indigo-400" />
                    <span>Manage Parking Lots</span>
                  </h3>
                  <p className="text-xs text-slate-600">Configure geo positions, pricing, capacity and slot vacancies.</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedLotForEdit(null);
                    setShowLotModal(true);
                  }}
                  className="btn-primary text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Lot</span>
                </button>
              </div>

              {lotsLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <div className="w-10 h-10 border-4 border-slate-300 border-t-indigo-500 rounded-full animate-spin"></div>
                  <span className="text-xs text-slate-600 font-semibold tracking-wide">Syncing parking lots...</span>
                </div>
              ) : lots.length === 0 ? (
                <div className="glass-card-dark p-12 text-center border border-slate-200">
                  <span className="text-4xl">🗺️</span>
                  <h3 className="text-base font-extrabold mt-3 text-slate-700 font-bold">No parking lots configured</h3>
                  <p className="text-xs text-slate-600 mt-1">Configure slot assets to populate client search map screens.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-100/20 max-w-full">
                  <table className="min-w-full divide-y divide-slate-800 text-left text-xs font-semibold">
                    <thead className="bg-slate-100/60 text-slate-600 font-bold uppercase tracking-wider select-none text-[10px]">
                      <tr>
                        <th className="px-6 py-4">Facility Name</th>
                        <th className="px-6 py-4">City Location</th>
                        <th className="px-6 py-4 text-center">Hourly Pricing</th>
                        <th className="px-6 py-4 text-center">Capacity spots</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-slate-800">
                      {lots.map((lot) => (
                        <tr key={lot._id} className="hover:bg-slate-800/20 transition-colors">
                          <td className="px-6 py-4 font-extrabold">{lot.name}</td>
                          <td className="px-6 py-4 text-slate-600">{lot.address}</td>
                          <td className="px-6 py-4 text-center font-bold text-cyan-600">₹{lot.pricePerHour}</td>
                          <td className="px-6 py-4 text-center">{lot.availableSlots} / {lot.totalSlots} Slots Free</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full ${
                              lot.isActive
                                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-700'
                                : 'bg-slate-100 text-slate-600 border border-slate-800/40'
                            }`}>
                              {lot.isActive ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedLotForEdit(lot);
                                setShowLotModal(true);
                              }}
                              className="p-2 border border-slate-300 bg-slate-100/30 hover:bg-slate-800 text-primary-700 hover:text-primary-300 rounded-xl"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            
                            {lot.isActive && (
                              <button
                                type="button"
                                onClick={() => handleDeleteLot(lot._id)}
                                className="p-2 border border-slate-300 bg-slate-100/30 hover:bg-rose-950/20 hover:border-rose-900/50 text-slate-600 hover:text-rose-400 rounded-xl transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Panel 3: Booking reservations */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="space-y-0.5">
                  <h3 className="font-extrabold text-lg flex items-center gap-1.5">
                    <Ticket className="w-5 h-5 text-indigo-400" />
                    <span>Client Reservations Log</span>
                  </h3>
                  <p className="text-xs text-slate-600">Monitor vehicle entries and transactions logs.</p>
                </div>
                
                <button
                  type="button"
                  onClick={fetchBookings}
                  className="p-2 border border-slate-300 bg-slate-100/30 hover:bg-slate-800 text-slate-600 hover:text-white rounded-xl transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {bookingsLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <div className="w-10 h-10 border-4 border-slate-300 border-t-indigo-500 rounded-full animate-spin"></div>
                  <span className="text-xs text-slate-600 font-semibold tracking-wide">Syncing transaction receipts...</span>
                </div>
              ) : bookings.length === 0 ? (
                <div className="glass-card-dark p-12 text-center border border-slate-200">
                  <span className="text-4xl">🎟️</span>
                  <h3 className="text-base font-extrabold mt-3 text-slate-700 font-bold">No reservations logged yet</h3>
                  <p className="text-xs text-slate-600 mt-1">Bookings submitted by users populate here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-100/20 max-w-full">
                  <table className="min-w-full divide-y divide-slate-800 text-left text-xs font-semibold">
                    <thead className="bg-slate-100/60 text-slate-600 font-bold uppercase tracking-wider select-none text-[10px]">
                      <tr>
                        <th className="px-6 py-4">Client User</th>
                        <th className="px-6 py-4">Lot & Slot</th>
                        <th className="px-6 py-4">Vehicle Info</th>
                        <th className="px-6 py-4">Timings Check In/Out</th>
                        <th className="px-6 py-4 text-center">Amount Bill</th>
                        <th className="px-6 py-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-slate-800">
                      {bookings.map((booking) => (
                        <tr key={booking._id} className="hover:bg-slate-800/20 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex flex-col font-extrabold">
                              <span>{booking.user?.name || 'Client User'}</span>
                              <span className="text-[10px] text-slate-600 font-semibold">{booking.user?.email}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-extrabold">{booking.parkingLot?.name || 'Lot Plaza'}</span>
                              <span className="text-[10px] font-bold text-cyan-600 tracking-wider">SLOT {booking.slotNumber}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-mono tracking-widest font-bold uppercase bg-slate-100/40 border border-slate-200/80 px-2 py-1 rounded">
                              {booking.vehicleNumber}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-700 font-medium">
                            <div className="flex flex-col">
                              <span>In: {formatDate(booking.startTime)}</span>
                              <span>Out: {formatDate(booking.endTime)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center font-bold text-cyan-600">{formatCurrency(booking.totalAmount)}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full ${
                              booking.status === 'active'
                                ? booking.paymentStatus === 'paid' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-700' : 'bg-amber-500/10 border border-amber-500/20 text-amber-700'
                                : booking.status === 'completed' ? 'bg-slate-700/30 text-slate-600' : 'bg-rose-500/10 border border-rose-500/20 text-rose-700'
                            }`}>
                              {booking.status === 'active' ? (booking.paymentStatus === 'paid' ? 'Paid' : 'Unpaid') : booking.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Panel 4: Users listing */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="space-y-0.5">
                  <h3 className="font-extrabold text-lg flex items-center gap-1.5">
                    <Users className="w-5 h-5 text-indigo-400" />
                    <span>Userbase Directory</span>
                  </h3>
                  <p className="text-xs text-slate-600">Configure administrative roles and credentials.</p>
                </div>
                
                <button
                  type="button"
                  onClick={fetchUsers}
                  className="p-2 border border-slate-300 bg-slate-100/30 hover:bg-slate-800 text-slate-600 hover:text-white rounded-xl transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {usersLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <div className="w-10 h-10 border-4 border-slate-300 border-t-indigo-500 rounded-full animate-spin"></div>
                  <span className="text-xs text-slate-600 font-semibold tracking-wide">Syncing user directory...</span>
                </div>
              ) : users.length === 0 ? (
                <div className="glass-card-dark p-12 text-center border border-slate-200">
                  <span className="text-4xl">👥</span>
                  <h3 className="text-base font-extrabold mt-3 text-slate-700">No users found</h3>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-100/20 max-w-full">
                  <table className="min-w-full divide-y divide-slate-800 text-left text-xs font-semibold">
                    <thead className="bg-slate-100/60 text-slate-600 font-bold uppercase tracking-wider select-none text-[10px]">
                      <tr>
                        <th className="px-6 py-4">Profile Avatar</th>
                        <th className="px-6 py-4">User Name</th>
                        <th className="px-6 py-4">Email Address</th>
                        <th className="px-6 py-4 text-center">System Role</th>
                        <th className="px-6 py-4 text-right">Configure Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-slate-800">
                      {users.map((targetUser) => (
                        <tr key={targetUser._id} className="hover:bg-slate-800/20 transition-colors">
                          <td className="px-6 py-4">
                            {targetUser.avatar ? (
                              <img
                                src={targetUser.avatar}
                                alt={targetUser.name}
                                className="w-8 h-8 rounded-full border border-slate-750"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-750">
                                <User className="w-4 h-4 text-slate-600" />
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 font-extrabold">{targetUser.name}</td>
                          <td className="px-6 py-4 text-slate-600 font-medium">{targetUser.email}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`text-[9px] uppercase font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit mx-auto ${
                              targetUser.role === 'admin'
                                ? 'bg-indigo-500/20 border border-indigo-500/35 text-indigo-300'
                                : 'bg-slate-100 text-slate-600 border border-slate-800/30'
                            }`}>
                              {targetUser.role === 'admin' ? <Award className="w-2.5 h-2.5" /> : <User className="w-2.5 h-2.5 text-slate-600" />}
                              <span>{targetUser.role}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleRoleToggle(targetUser)}
                              className="px-3.5 py-1.5 border border-slate-300 bg-slate-100/30 hover:bg-slate-800 text-[10px] font-bold rounded-xl flex items-center gap-1 shadow active:scale-[0.98] w-fit ml-auto"
                            >
                              <ShieldAlert className="w-3.5 h-3.5 text-cyan-600" />
                              <span>Toggle Admin</span>
                            </button>
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
      </div>

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
