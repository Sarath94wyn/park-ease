import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import MapView from '../components/map/MapView';
import ParkingList from '../components/parking/ParkingList';
import FilterPanel from '../components/parking/FilterPanel';
import LocationSearch from '../components/map/LocationSearch';
import LocationPermissionModal from '../components/common/LocationPermissionModal';
import useParkingLots from '../hooks/useParkingLots';
import useGeolocation from '../hooks/useGeolocation';
import { List, Map as MapIcon, SlidersHorizontal, ArrowUpDown, Navigation, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getParkingImageUrl } from '../utils/helpers';

// Helper to generate route points simulating roads
function generateRoutePoints(startLat, startLng, endLat, endLng) {
  const midLat = (startLat + endLat) / 2;
  const midLng = (startLng + endLng) / 2;
  const offsetLat = (endLat - startLat) * 0.12;
  const offsetLng = (endLng - startLng) * -0.12;
  return [
    [startLat, startLng],
    [startLat + (endLat - startLat) * 0.25, startLng + offsetLng],
    [midLat + offsetLat, midLng],
    [endLat - (endLat - startLat) * 0.25, endLng + offsetLng],
    [endLat, endLng]
  ];
}

// Haversine formula — returns distance in meters between two lat/lng points
function computeDistance(lat1, lng1, lat2, lng2) {
  if (lat1 == null || lng1 == null || lat2 == null || lng2 == null || isNaN(lat1) || isNaN(lng1) || isNaN(lat2) || isNaN(lng2)) {
    return null;
  }
  const R = 6371000; // Earth radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function ExplorePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { position, error: geoError, loading: geoLoading, permissionState, getCurrentPosition, checkPermission } = useGeolocation();
  const { parkingLots, loading, fetchParkingLots } = useParkingLots();

  // Search parameters from home page
  const searchLat = searchParams.get('lat');
  const searchLng = searchParams.get('lng');
  const searchName = searchParams.get('name');
  const searchRadius = searchParams.get('radius');

  // State for user reference point
  const [userRefPoint, setUserRefPoint] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Navigation Simulator State
  const [isNavigating, setIsNavigating] = useState(false);
  const [simulatedUserPosition, setSimulatedUserPosition] = useState(null);
  const [navigationStepIndex, setNavigationStepIndex] = useState(0);
  const [navigationRoute, setNavigationRoute] = useState([]);
  const [showReachedModal, setShowReachedModal] = useState(false);


  // Filters state
  const [filters, setFilters] = useState({
    maxPrice: 200,
    amenities: [],
    availableOnly: false,
  });

  const [sortBy, setSortBy] = useState('price');
  const [activeView, setActiveView] = useState('list');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchContext, setSearchContext] = useState('all locations');

  // Map center/zoom state
  const [mapCenter, setMapCenter] = useState([10.0261, 76.3125]);
  const [mapZoom, setMapZoom] = useState(12);
  const [selectedLotId, setSelectedLotId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const shouldRenderMap = !isMobile || activeView === 'map';

  // Determine user reference point for distance computation
  const userRef = userRefPoint || position || { lat: 10.0261, lng: 76.3125 };

  // Find the selected lot object from the lots list
  const selectedLotObj = parkingLots.find(lot => (lot._id || lot.id) === selectedLotId);

  // Control permission modal visibility
  useEffect(() => {
    if (permissionState === 'denied' && !searchLat && !searchLng) {
      setShowLocationModal(true);
    } else if (permissionState === 'prompt' && !searchLat && !searchLng) {
      setShowLocationModal(true);
    } else {
      setShowLocationModal(false);
    }
  }, [permissionState, searchLat, searchLng]);

  // Sync position from search params or navigator geolocation
  useEffect(() => {
    if (searchLat && searchLng) {
      const lat = parseFloat(searchLat);
      const lng = parseFloat(searchLng);
      if (!isNaN(lat) && !isNaN(lng)) {
        setMapCenter([lat, lng]);
        setMapZoom(14);
        setSearchContext(searchName || 'searched location');
        setUserRefPoint({ lat, lng });
        fetchParkingLots({ lat, lng, radius: searchRadius || 5, limit: 100, ...filters });
      }
    } else if (position && position.lat != null && position.lng != null && !isNaN(position.lat) && !isNaN(position.lng)) {
      setMapCenter([position.lat, position.lng]);
      setSearchContext('your location');
      setUserRefPoint(position);
      fetchParkingLots({ lat: position.lat, lng: position.lng, radius: 5, limit: 100, ...filters });
    } else {
      setSearchContext('all locations');
      setUserRefPoint({ lat: 10.0261, lng: 76.3125 });
      fetchParkingLots({ limit: 100 });
    }
  }, [searchLat, searchLng, position, searchRadius]);


  const handleApplyFilters = (updatedFilters) => {
    setFilters(updatedFilters);
    const params = {
      maxPrice: updatedFilters.maxPrice,
      available: updatedFilters.availableOnly,
      limit: 100,
    };
    if (updatedFilters.amenities?.length > 0) {
      params.amenities = updatedFilters.amenities.join(',');
    }
    if (searchLat && searchLng) {
      const lat = parseFloat(searchLat);
      const lng = parseFloat(searchLng);
      if (!isNaN(lat) && !isNaN(lng)) {
        params.lat = lat;
        params.lng = lng;
        params.radius = searchRadius || 5;
      }
    } else if (position && position.lat != null && position.lng != null && !isNaN(position.lat) && !isNaN(position.lng)) {
      params.lat = position.lat;
      params.lng = position.lng;
      params.radius = 5;
    }
    fetchParkingLots(params);
  };

  const handleClearFilters = () => {
    const cleared = { maxPrice: 200, amenities: [], availableOnly: false };
    setFilters(cleared);
    const params = { limit: 100 };
    if (searchLat && searchLng) {
      const lat = parseFloat(searchLat);
      const lng = parseFloat(searchLng);
      if (!isNaN(lat) && !isNaN(lng)) {
        params.lat = lat;
        params.lng = lng;
        params.radius = searchRadius || 5;
      }
    } else if (position && position.lat != null && position.lng != null && !isNaN(position.lat) && !isNaN(position.lng)) {
      params.lat = position.lat;
      params.lng = position.lng;
      params.radius = 5;
    }
    fetchParkingLots(params);
    toast.success('Filters cleared');
  };

  const handleSearchSelect = (coords, name) => {
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
      setMapCenter([lat, lng]);
      setMapZoom(14);
      setSearchContext(name || (coords && coords.name) || 'searched location');
      setUserRefPoint({ lat, lng });
      fetchParkingLots({ lat, lng, radius: 5, limit: 100, ...filters });
      toast.success(`Centered map on ${name || (coords && coords.name)}`);
      
      // Auto-toggle to map view on mobile device widths
      if (window.innerWidth < 640) {
        setActiveView('map');
      }
    } else {
      toast.error('Could not determine coordinates for the selection');
    }
  };

  const handleUseMyLocation = () => {
    getCurrentPosition();
    if (position && position.lat != null && position.lng != null && !isNaN(position.lat) && !isNaN(position.lng)) {
      setMapCenter([position.lat, position.lng]);
      setMapZoom(14);
      setSearchContext('your location');
      setUserRefPoint(position);
      fetchParkingLots({ lat: position.lat, lng: position.lng, radius: 5, limit: 100, ...filters });
      toast.success('Centered map on your GPS location');
      
      // Auto-toggle to map view on mobile device widths
      if (window.innerWidth < 640) {
        setActiveView('map');
      }
    } else if (geoError) {
      toast.error(`GPS error: ${geoError}. Please enable location permissions in browser settings.`);
    } else {
      toast.info('Requesting GPS coordinate access...');
    }
  };

  const handleStartNavigation = (lot) => {
    const startLat = userRef.lat;
    const startLng = userRef.lng;
    const endLat = lot.location?.coordinates?.[1] || lot.latitude;
    const endLng = lot.location?.coordinates?.[0] || lot.longitude;

    if (!endLat || !endLng) {
      toast.error("Invalid parking lot location");
      return;
    }

    const points = generateRoutePoints(startLat, startLng, endLat, endLng);
    setNavigationRoute(points);
    setNavigationStepIndex(0);
    setSimulatedUserPosition({ lat: points[0][0], lng: points[0][1] });
    setIsNavigating(true);
    setMapCenter([points[0][0], points[0][1]]);
    setMapZoom(16);
    setSelectedLotId(lot._id || lot.id);
    toast.success(`Starting navigation simulation to ${lot.name}...`);
  };

  const handleCancelNavigation = () => {
    setIsNavigating(false);
    setSimulatedUserPosition(null);
    setNavigationRoute([]);
    setNavigationStepIndex(0);
    setMapZoom(12);
    if (position) {
      setMapCenter([position.lat, position.lng]);
    }
    toast.info("Navigation cancelled");
  };

  const handleConfirmParked = () => {
    setShowReachedModal(false);
    if (selectedLotId) {
      navigate(`/booking/${selectedLotId}`);
    }
  };

  useEffect(() => {
    let interval = null;
    if (isNavigating && navigationRoute.length > 0) {
      interval = setInterval(() => {
        setNavigationStepIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          if (nextIndex >= navigationRoute.length) {
            clearInterval(interval);
            setIsNavigating(false);
            setSimulatedUserPosition({ 
              lat: navigationRoute[navigationRoute.length - 1][0], 
              lng: navigationRoute[navigationRoute.length - 1][1] 
            });
            setShowReachedModal(true);
            return prevIndex;
          }
          const nextPt = navigationRoute[nextIndex];
          setSimulatedUserPosition({ lat: nextPt[0], lng: nextPt[1] });
          setMapCenter([nextPt[0], nextPt[1]]);
          return nextIndex;
        });
      }, 1500); // drive step every 1.5s
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isNavigating, navigationRoute]);

  const handleMarkerClick = (lot) => {
    const targetId = lot._id || lot.id;
    setSelectedLotId(targetId);

    // Smooth scroll mobile horizontal carousel card into view
    const mobileCardEl = document.getElementById(`mobile-card-${targetId}`);
    if (mobileCardEl) {
      mobileCardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    const cardEl = document.getElementById(`lot-card-${targetId}`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Attach distance to each lot (mutates a shallow copy)
  const lotsWithDistance = parkingLots.map((lot) => {
    if (userRef && lot.location?.coordinates) {
      const lotLng = lot.location.coordinates[0];
      const lotLat = lot.location.coordinates[1];
      return { ...lot, distance: computeDistance(userRef.lat, userRef.lng, lotLat, lotLng) };
    }
    return { ...lot, distance: null };
  });

  // Client-side filtering as fallback
  const filteredLots = lotsWithDistance.filter((lot) => {
    // Price filter
    if (filters.maxPrice && lot.pricePerHour > filters.maxPrice) return false;
    // Availability filter
    if (filters.availableOnly && (!lot.availableSlots || lot.availableSlots <= 0)) return false;
    // Amenities filter — lot must have ALL selected amenities
    if (filters.amenities && filters.amenities.length > 0) {
      const lotAmenities = (lot.amenities || []).map((a) => a.toLowerCase());
      const allPresent = filters.amenities.every((am) => lotAmenities.includes(am.toLowerCase()));
      if (!allPresent) return false;
    }
    return true;
  });

  // Sort parking lots
  const sortedLots = [...filteredLots].sort((a, b) => {
    if (sortBy === 'price') return a.pricePerHour - b.pricePerHour;
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'distance') {
      // If distance is not available for either, push those to the end
      if (a.distance == null && b.distance == null) return 0;
      if (a.distance == null) return 1;
      if (b.distance == null) return -1;
      return a.distance - b.distance;
    }
    return (b.availableSlots || 0) - (a.availableSlots || 0);
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Search bar row */}
      <div className="p-4 bg-white border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between sticky top-[68px] z-30 select-none">
        <div className="w-full sm:max-w-md">
          <LocationSearch
            onSelect={handleSearchSelect}
            onUseMyLocation={handleUseMyLocation}
            userPosition={userRef}
          />
        </div>
        {/* Sort and mobile toggle buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex items-center bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 flex-1 sm:flex-none">
            <ArrowUpDown className="w-4 h-4 text-slate-600 mr-2" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer uppercase tracking-wider"
            >
              <option value="price" className="bg-white">Sort: Price</option>
              <option value="rating" className="bg-white">Sort: Rating</option>
              <option value="availability" className="bg-white">Sort: Vacancy</option>
              <option value="distance" className="bg-white">Sort: Distance</option>
            </select>
          </div>
          <button
            type="button"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden p-2.5 bg-slate-100 hover:bg-slate-750 border border-slate-300 rounded-xl"
            title="Toggle Filters"
          >
            <SlidersHorizontal className="w-4.5 h-4.5 text-primary-700" />
          </button>
          <div className="sm:hidden flex bg-slate-100 rounded-xl p-1 border border-slate-300">
            <button
              type="button"
              onClick={() => setActiveView('list')}
              className={`p-2 rounded-lg transition-colors ${activeView === 'list' ? 'bg-primary-600 text-white shadow' : 'text-slate-600'}`}
            >
              <List className="w-4.5 h-4.5" />
            </button>
            <button
              type="button"
              onClick={() => setActiveView('map')}
              className={`p-2 rounded-lg transition-colors ${activeView === 'map' ? 'bg-primary-600 text-white shadow' : 'text-slate-600'}`}
            >
              <MapIcon className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row relative">
        <aside className="hidden lg:block w-80 shrink-0 border-r border-slate-200 bg-slate-50 p-6 overflow-y-auto h-[calc(100vh-160px)] sm:h-[calc(100vh-150px)] scrollbar-thin select-none">
          <FilterPanel
            filters={filters}
            onFilterChange={handleApplyFilters}
            onClearFilters={handleClearFilters}
          />
        </aside>
        {showMobileFilters && (
          <div className="fixed inset-0 bg-slate-100/80 backdrop-blur-sm z-50 flex items-end justify-center lg:hidden">
            <div className="w-full max-w-md bg-white rounded-t-3xl p-5 border-t border-slate-750 max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl relative animate-slide-up">
              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="absolute top-4 right-4 text-xs font-bold text-slate-600 uppercase tracking-widest bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-300"
              >
                Close
              </button>
              <div className="pt-8">
                <FilterPanel
                  filters={filters}
                  onFilterChange={handleApplyFilters}
                  onClearFilters={handleClearFilters}
                />
              </div>
            </div>
          </div>
        )}
        <main className="flex-1 flex flex-col sm:flex-row relative h-[calc(100vh-160px)] sm:h-[calc(100vh-150px)] select-none">
          {/* List Section: Floating overlay on mobile when activeView is list; split pane on desktop */}
          <section className={`scrollbar-thin transition-all ${
            isMobile
              ? `absolute inset-0 w-full h-full z-10 bg-slate-50 p-5 overflow-y-auto ${
                  activeView === 'list' ? 'block animate-fade-in' : 'hidden'
                }`
              : 'flex-1 overflow-y-auto p-5 sm:block'
          }`}>
            <div className="space-y-4">
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest block">
                Found {sortedLots.length} facilities near {searchContext}
              </span>
              <ParkingList
                parkingLots={sortedLots}
                loading={loading}
                onSelect={(lot) => navigate(`/parking/${lot._id}`)}
              />
            </div>
          </section>

          {/* Map Section: Fullscreen background on mobile; split pane on desktop */}
          <section className={`border-slate-200 transition-all duration-300 ${
            isMobile
              ? activeView === 'map'
                ? 'relative w-full h-full z-0 flex flex-col opacity-100'
                : 'absolute inset-0 w-full h-full z-0 opacity-0 pointer-events-none flex flex-col'
              : 'w-full sm:w-[45vw] lg:w-[40vw] shrink-0 border-l h-full flex flex-col'
          }`}>
            {geoError && (
              <div className="absolute top-2 left-2 right-2 bg-amber-500/90 backdrop-blur-sm border border-amber-400 p-2.5 rounded-xl text-slate-900 font-bold text-[11px] leading-tight flex items-center gap-2 z-[2000] shadow-md select-none">
                <span>⚠️ GPS permission blocked. Enable location settings to use your physical coordinates. (Using Kochi as fallback)</span>
              </div>
            )}
            <MapView
              parkingLots={sortedLots}
              center={mapCenter}
              zoom={mapZoom}
              userPosition={simulatedUserPosition || position}
              selectedLot={selectedLotId}
              onMarkerClick={handleMarkerClick}
              isNavigating={isNavigating}
              onStartNavigation={handleStartNavigation}
              onCloseDetails={() => setSelectedLotId(null)}
              activeView={activeView}
            />
          </section>

          {/* Horizontal carousel overlay for mobile view when in map view mode (similar to Uber) */}
          {isMobile && activeView === 'map' && !selectedLotId && sortedLots.length > 0 && (
            <div className="absolute bottom-6 left-0 right-0 z-[1000] flex gap-3 overflow-x-auto px-4 scrollbar-none snap-x snap-mandatory">
              {sortedLots.map((lot) => (
                <div
                  key={lot._id || lot.id}
                  id={`mobile-card-${lot._id || lot.id}`}
                  className={`snap-center shrink-0 w-[82vw] max-w-[300px] bg-white rounded-3xl border shadow-xl p-3 flex flex-col gap-2 transition-all ${
                    selectedLotId === (lot._id || lot.id)
                      ? 'border-cyan-500 ring-2 ring-cyan-500/20 scale-[1.02]'
                      : 'border-slate-200'
                  }`}
                  onClick={() => {
                    setSelectedLotId(lot._id || lot.id);
                    const lat = lot.location?.coordinates?.[1] || lot.latitude || lot.lat;
                    const lng = lot.location?.coordinates?.[0] || lot.longitude || lot.lng;
                    if (lat != null && lng != null && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
                      setMapCenter([parseFloat(lat), parseFloat(lng)]);
                      setMapZoom(15);
                    }
                  }}
                >
                  <div className="flex gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 border border-slate-100 overflow-hidden shrink-0 relative">
                      <img
                        src={lot.images?.[0] || getParkingImageUrl(lot.name)}
                        alt={lot.name}
                        className="w-full h-full object-cover animate-fade-in"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <h4 className="text-xs font-black text-slate-900 truncate uppercase tracking-tight">{lot.name}</h4>
                      <p className="text-[10px] text-slate-500 truncate leading-relaxed">{lot.address}</p>
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span className="text-xs font-black text-cyan-600">₹{lot.pricePerHour}/hr</span>
                        <span className="text-[9px] text-slate-400 font-bold">•</span>
                        <span className={`text-[9px] font-black uppercase tracking-wider ${
                          (lot.availableSlots ?? 0) > 10 ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {lot.availableSlots ?? 0}/{lot.totalSlots ?? 0} spots
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/parking/${lot._id || lot.id}`);
                      }}
                      className="flex-1 py-2 bg-gradient-to-r from-cyan-500 to-indigo-700 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl text-center shadow-sm active:scale-95 transition-transform"
                    >
                      Book Spot
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartNavigation(lot);
                      }}
                      className="py-2 px-3 bg-slate-50 hover:bg-slate-150 border border-slate-200 text-slate-800 font-extrabold text-[10px] uppercase tracking-wider rounded-xl text-center active:scale-95 transition-transform"
                    >
                      Directions
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Navigation HUD Overlay */}
      {isNavigating && selectedLotObj && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-slate-900/95 backdrop-blur-md border border-cyan-500/30 text-white rounded-3xl p-5 shadow-2xl z-[999] flex flex-col gap-3.5 animate-slide-up select-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-500/20 border border-cyan-500/35 rounded-xl flex items-center justify-center text-cyan-400 animate-pulse">
                <Navigation className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-widest block">Live Simulated Navigation</span>
                <h4 className="text-sm font-black truncate max-w-[200px] sm:max-w-xs">Navigating to {selectedLotObj.name}</h4>
              </div>
            </div>
            <button
              onClick={handleCancelNavigation}
              className="px-3.5 py-1.5 border border-rose-900/40 bg-rose-950/40 text-rose-450 hover:bg-rose-900/40 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all"
            >
              Cancel
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-slate-400 font-extrabold uppercase tracking-wider font-mono">
              <span>Origin</span>
              <span>{((navigationRoute.length - 1 - navigationStepIndex) * 0.4).toFixed(1)} km remaining</span>
              <span>Destination</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-indigo-700 transition-all duration-1000 ease-out"
                style={{ width: `${(navigationStepIndex / (navigationRoute.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Reached Destination Modal */}
      {showReachedModal && selectedLotObj && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" />
          <div className="relative w-full max-w-sm bg-white border border-slate-200 shadow-2xl rounded-3xl p-6 text-center space-y-5 animate-slide-up select-none">
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-8 h-8 animate-bounce-gentle" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-emerald-600 uppercase font-black tracking-widest block">Arrived safely</span>
              <h3 className="text-lg font-black text-slate-900">Reached the Location!</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                You have successfully arrived at <strong>{selectedLotObj.name}</strong>. Please confirm you have parked your car.
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-semibold text-slate-700">
              Confirming parking will redirect you to the payment page to pay the parking fee.
            </div>
            <button
              type="button"
              onClick={handleConfirmParked}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-md transition-all active:scale-98"
            >
              Confirm Parked & Pay
            </button>
          </div>
        </div>
      )}

      {/* Geolocation Permissions Prompt Modal */}
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
