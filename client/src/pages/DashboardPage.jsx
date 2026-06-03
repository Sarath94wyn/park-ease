import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import UserBookings from '../components/dashboard/UserBookings';
import FavoritesList from '../components/dashboard/FavoritesList';
import ProfileCard from '../components/dashboard/ProfileCard';
import RewardsHub from '../components/dashboard/RewardsHub';
import { Ticket, Heart, User, Sparkles, Gift, LogOut, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useGeolocation from '../hooks/useGeolocation';
import LocationPermissionModal from '../components/common/LocationPermissionModal';
import LocationSearch from '../components/map/LocationSearch';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('bookings'); // bookings | favorites | rewards | profile
  
  const { position, permissionState, getCurrentPosition, checkPermission } = useGeolocation();
  const [showLocationModal, setShowLocationModal] = useState(false);

  useEffect(() => {
    if (permissionState === 'denied' || permissionState === 'prompt') {
      setShowLocationModal(true);
    } else {
      setShowLocationModal(false);
    }
  }, [permissionState]);

  const handleUseMyLocation = () => {
    getCurrentPosition();
    if (position && position.lat != null && position.lng != null && !isNaN(position.lat) && !isNaN(position.lng)) {
      navigate(`/explore?lat=${position.lat}&lng=${position.lng}&name=${encodeURIComponent('Your Location')}`);
    } else {
      navigate('/explore');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  const TABS_CONFIG = [
    { key: 'bookings', label: 'My Bookings', icon: <Ticket className="w-4 h-4" /> },
    { key: 'favorites', label: 'Saved Lots', icon: <Heart className="w-4 h-4" /> },
    { key: 'rewards', label: 'Offers & Rewards', icon: <Gift className="w-4 h-4" /> },
    { key: 'profile', label: 'Account Profile', icon: <User className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6 relative select-none pt-24">
      {/* Background decoration blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-primary-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        {/* Greetings Banner in space dark gradient style */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-3xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 select-none shadow-sm">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[9px] uppercase font-black bg-indigo-500/20 border border-indigo-500/35 text-indigo-300 px-2.5 py-1 rounded-full flex items-center gap-1 w-fit mx-auto sm:mx-0">
              <Sparkles className="w-2.5 h-2.5" />
              <span>User Panel</span>
            </span>
            <h2 className="text-2xl font-black tracking-tight mt-2 text-white">Welcome Back, {user.name}!</h2>
            <p className="text-xs text-slate-600 font-semibold">{user.email}</p>
          </div>

          <div className="flex gap-2">
            {user.role === 'admin' && (
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="btn-outline text-xs px-5 py-2.5 rounded-xl border-slate-300 text-slate-350 hover:text-white"
              >
                Admin Panel
              </button>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="px-5 py-2.5 rounded-xl border border-rose-900/40 bg-rose-50 hover:bg-rose-900/30 text-rose-700 hover:text-rose-300 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Find Parking Search Box */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative z-30 select-none animate-fade-in">
          <div className="absolute top-[-50%] right-[-10%] w-72 h-72 bg-primary-600/5 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="max-w-xl space-y-3 relative z-10">
            <span className="text-[9px] uppercase font-black bg-indigo-500/10 border border-indigo-500/25 text-indigo-700 px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit">
              <MapPin className="w-3 h-3 text-indigo-600" />
              <span>Quick Search</span>
            </span>
            <h3 className="text-lg font-black tracking-tight text-slate-900">
              Find Available Parking Lots
            </h3>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Search by city, landmark, or specific parking plaza to check real-time slot availability, reserve a spot, and get navigation directions.
            </p>
            <div className="pt-2">
               <LocationSearch
                onSelect={(coords, name) => {
                  let lat, lng;
                  if (Array.isArray(coords)) {
                    lng = parseFloat(coords[0]);
                    lat = parseFloat(coords[1]);
                  } else if (coords && typeof coords === 'object') {
                    const location = coords.location || {};
                    if (Array.isArray(location.coordinates)) {
                      lng = parseFloat(location.coordinates[0]);
                      lat = parseFloat(location.coordinates[1]);
                    } else {
                      lat = parseFloat(coords.latitude || coords.lat);
                      lng = parseFloat(coords.longitude || coords.lng);
                    }
                  }
                  if (lat != null && lng != null && !isNaN(lat) && !isNaN(lng)) {
                    navigate(`/explore?lat=${lat}&lng=${lng}&name=${encodeURIComponent(name || (coords && coords.name) || 'searched location')}`);
                  } else {
                    navigate('/explore');
                  }
                }}
                onUseMyLocation={handleUseMyLocation}
                userPosition={position}
              />
            </div>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="flex gap-4 border-b border-slate-200 pb-1 overflow-x-auto scrollbar-none select-none">
          {TABS_CONFIG.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-wider border-b-2 whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'border-cyan-400 text-cyan-600 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tabs views controller */}
        <div className="animate-fade-in pt-2">
          {activeTab === 'bookings' && <UserBookings />}
          {activeTab === 'favorites' && <FavoritesList />}
          {activeTab === 'rewards' && <RewardsHub />}
          {activeTab === 'profile' && <ProfileCard />}
        </div>
      </div>

      <LocationPermissionModal
        isOpen={showLocationModal}
        permissionState={permissionState}
        onRequestLocation={() => {
          getCurrentPosition();
          checkPermission();
        }}
        onClose={() => setShowLocationModal(false)}
      />
    </div>
  );
}
