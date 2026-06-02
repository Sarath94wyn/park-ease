import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MapView from '../components/map/MapView';
import ParkingList from '../components/parking/ParkingList';
import FilterPanel from '../components/parking/FilterPanel';
import LocationSearch from '../components/map/LocationSearch';
import useParkingLots from '../hooks/useParkingLots';
import useGeolocation from '../hooks/useGeolocation';
import { List, Map as MapIcon, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ExplorePage() {
  const [searchParams] = useSearchParams();
  const { position, loading: geoLoading } = useGeolocation();
  const { parkingLots, loading, fetchParkingLots } = useParkingLots();

  // Search parameters from home page
  const searchLat = searchParams.get('lat');
  const searchLng = searchParams.get('lng');
  const searchName = searchParams.get('name');
  const searchRadius = searchParams.get('radius');

  // Filters state
  const [filters, setFilters] = useState({
    maxPrice: 200,
    amenities: [],
    availableOnly: false,
  });

  const [sortBy, setSortBy] = useState('price'); // price, rating, availability
  const [activeView, setActiveView] = useState('list'); // list or map (for mobile stacked toggle)
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Map center/zoom state
  const [mapCenter, setMapCenter] = useState([10.0261, 76.3125]); // Kochi default
  const [mapZoom, setMapZoom] = useState(12);
  const [selectedLotId, setSelectedLotId] = useState(null);

  // Sync position from search params or navigator geolocation
  useEffect(() => {
    if (searchLat && searchLng) {
      const lat = parseFloat(searchLat);
      const lng = parseFloat(searchLng);
      setMapCenter([lat, lng]);
      setMapZoom(14);
      fetchParkingLots({ lat, lng, radius: searchRadius || 5000, ...filters });
    } else if (position) {
      setMapCenter([position.lat, position.lng]);
      fetchParkingLots({ lat: position.lat, lng: position.lng, radius: searchRadius || 8000, ...filters });
    } else {
      fetchParkingLots(filters);
    }
  }, [searchLat, searchLng, position, searchRadius]);

  const handleApplyFilters = (updatedFilters) => {
    setFilters(updatedFilters);
    const params = {
      maxPrice: updatedFilters.maxPrice,
      available: updatedFilters.availableOnly,
    };
    if (updatedFilters.amenities?.length > 0) {
      params.amenities = updatedFilters.amenities.join(',');
    }
    
    // Add geospatial context if available
    if (searchLat && searchLng) {
      params.lat = parseFloat(searchLat);
      params.lng = parseFloat(searchLng);
    } else if (position) {
      params.lat = position.lat;
      params.lng = position.lng;
    }

    if (searchRadius) {
      params.radius = searchRadius;
    }

    fetchParkingLots(params);
  };

  const handleClearFilters = () => {
    const cleared = { maxPrice: 200, amenities: [], availableOnly: false };
    setFilters(cleared);
    
    const params = {};
    if (searchLat && searchLng) {
      params.lat = parseFloat(searchLat);
      params.lng = parseFloat(searchLng);
    } else if (position) {
      params.lat = position.lat;
      params.lng = position.lng;
    }

    if (searchRadius) {
      params.radius = searchRadius;
    }

    fetchParkingLots(params);
    toast.success('Filters cleared');
  };

  const handleSearchSelect = (coords, name) => {
    const lat = coords[1];
    const lng = coords[0];
    setMapCenter([lat, lng]);
    setMapZoom(14);
    fetchParkingLots({ lat, lng, radius: 5000, ...filters });
    toast.success(`Centered map on ${name}`);
  };

  const handleMarkerClick = (lot) => {
    setSelectedLotId(lot._id);
    // Scroll list card into view if needed
    const cardEl = document.getElementById(`lot-card-${lot._id}`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Sort parking lots
  const sortedLots = [...parkingLots].sort((a, b) => {
    if (sortBy === 'price') return a.pricePerHour - b.pricePerHour;
    if (sortBy === 'rating') return b.rating - a.rating;
    return b.availableSlots - a.availableSlots;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Search bar row */}
      <div className="p-4 bg-white border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between sticky top-[68px] z-30 select-none">
        <div className="w-full sm:max-w-md">
          <LocationSearch onSelect={handleSearchSelect} />
        </div>

        {/* Sort and mobile toggle buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Sorting */}
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
            </select>
          </div>

          {/* Collapsible Mobile filter panel toggle */}
          <button
            type="button"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden p-2.5 bg-slate-100 hover:bg-slate-750 border border-slate-300 rounded-xl"
            title="Toggle Filters"
          >
            <SlidersHorizontal className="w-4.5 h-4.5 text-primary-700" />
          </button>

          {/* Mobile view switchers (Stacked map vs list) */}
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

      {/* Main split grid layout */}
      <div className="flex-1 flex flex-col lg:flex-row relative">
        {/* Sidebar FilterPanel (Desktop only) */}
        <aside className="hidden lg:block w-80 shrink-0 border-r border-slate-200 bg-slate-50 p-6 overflow-y-auto max-h-[calc(100vh-140px)] scrollbar-thin select-none">
          <FilterPanel
            filters={filters}
            onFilterChange={handleApplyFilters}
            onClearFilters={handleClearFilters}
          />
        </aside>

        {/* Mobile Filter Sheet overlay drawer */}
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

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col sm:flex-row relative max-h-[calc(100vh-140px)] select-none">
          {/* List panel */}
          <section className={`flex-1 overflow-y-auto p-5 scrollbar-thin transition-all ${
            activeView === 'list' ? 'block' : 'hidden sm:block'
          }`}>
            <div className="space-y-4">
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest block">
                Found {sortedLots.length} facilities near Kochi/Kerala
              </span>
              <ParkingList
                parkingLots={sortedLots}
                loading={loading}
                onSelect={(lot) => window.location.href = `/parking/${lot._id}`}
              />
            </div>
          </section>

          {/* Leaflet map panel */}
          <section className={`w-full sm:w-[45vw] lg:w-[40vw] shrink-0 border-l border-slate-200 relative ${
            activeView === 'map' ? 'block h-[calc(100vh-140px)]' : 'hidden sm:block'
          }`}>
            <MapView
              parkingLots={sortedLots}
              center={mapCenter}
              zoom={mapZoom}
              userPosition={position}
              selectedLot={selectedLotId}
              onMarkerClick={handleMarkerClick}
            />
          </section>
        </main>
      </div>
    </div>
  );
}
