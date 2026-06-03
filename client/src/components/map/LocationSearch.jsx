import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Crosshair, MapPin, X, Building2 } from 'lucide-react';
import { searchParkingLots } from '../../services/parkingService';

const CITY_LOCATIONS = [
  { name: 'Kochi', label: 'City • Kochi, Kerala', coordinates: [76.2711, 9.9312] },
  { name: 'Thiruvananthapuram', label: 'City • Thiruvananthapuram (Trivandrum), Kerala', coordinates: [76.9366, 8.5241] },
  { name: 'Kozhikode', label: 'City • Kozhikode (Calicut), Kerala', coordinates: [75.7804, 11.2588] },
  { name: 'Bangalore', label: 'City • Bangalore, Karnataka', coordinates: [77.5946, 12.9716] },
  { name: 'Chennai', label: 'City • Chennai, Tamil Nadu', coordinates: [80.2707, 13.0827] },
];

function haversineDistance(lat1, lng1, lat2, lng2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export default function LocationSearch({ onSelect, onUseMyLocation, userPosition, className = '' }) {
  const [query, setQuery] = useState('');
  const [lotResults, setLotResults] = useState([]);
  const [cityResults, setCityResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  const getDistanceToUser = useCallback((lng, lat) => {
    if (!userPosition || userPosition.lat == null || userPosition.lng == null) return null;
    return haversineDistance(userPosition.lat, userPosition.lng, lat, lng);
  }, [userPosition]);

  const handleSearch = useCallback(async (searchQuery) => {
    const trimmed = searchQuery?.trim().toLowerCase() || '';

    if (trimmed.length < 1) {
      setLotResults([]);
      setCityResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    // Fetch matching places from Nominatim (OpenStreetMap)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=5&addressdetails=1&countrycodes=in`
      );
      if (response.ok) {
        const data = await response.json();
        const places = data.map((item) => {
          const name = item.display_name.split(',')[0];
          return {
            name: name,
            label: item.display_name,
            coordinates: [parseFloat(item.lon), parseFloat(item.lat)],
          };
        });
        setCityResults(places);
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      // Fallback: filter static cities
      const matchingCities = CITY_LOCATIONS.filter((city) =>
        city.name.toLowerCase().includes(trimmed)
      );
      setCityResults(matchingCities);
    }

    // Fetch matching parking lots from API
    try {
      const data = await searchParkingLots(searchQuery);
      const lots = data.parkingLots || data.data || data || [];
      setLotResults(Array.isArray(lots) ? lots.slice(0, 6) : []);
    } catch (error) {
      console.error('Search error:', error);
      setLotResults([]);
    } finally {
      setLoading(false);
    }

    setIsOpen(true);
  }, []);

  const handleFocus = () => {
    if (!query.trim()) {
      setCityResults(CITY_LOCATIONS);
    }
    setIsOpen(true);
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSearch(query), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, handleSearch]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !inputRef.current?.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCity = (city) => {
    setQuery(city.name);
    setIsOpen(false);
    onSelect?.(city.coordinates, city.name);
  };

  const handleSelectLot = (lot) => {
    setQuery(lot.name || '');
    setIsOpen(false);
    
    let coords = null;
    if (lot.location && Array.isArray(lot.location.coordinates)) {
      coords = lot.location.coordinates;
    } else if (lot.latitude != null && lot.longitude != null) {
      coords = [parseFloat(lot.longitude), parseFloat(lot.latitude)];
    } else if (lot.lat != null && lot.lng != null) {
      coords = [parseFloat(lot.lng), parseFloat(lot.lat)];
    }

    if (coords && !isNaN(coords[0]) && !isNaN(coords[1])) {
      onSelect?.(coords, lot.name);
    } else {
      console.warn('Selected parking lot has invalid coordinates, falling back to full object selection:', lot);
      onSelect?.(lot, lot.name);
    }
  };

  const handleClear = () => {
    setQuery('');
    setLotResults([]);
    setCityResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const hasResults = cityResults.length > 0 || lotResults.length > 0;

  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          placeholder={isMobile ? "Search parking, cities..." : "Search for parking lots, locations..."}
          className="w-full pl-10 sm:pl-12 pr-20 sm:pr-24 py-3 sm:py-3.5 bg-slate-100/60 backdrop-blur-lg border border-slate-300 rounded-2xl text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all duration-300 text-xs sm:text-sm"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 z-10 pointer-events-none" />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <button
              onClick={handleClear}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {onUseMyLocation && (
            <button
              onClick={onUseMyLocation}
              className="p-2 rounded-xl bg-primary-500/20 text-primary-700 hover:bg-primary-500/30 transition-colors"
              title="Use my location"
            >
              <Crosshair className="w-4 h-4" />
            </button>
          )}
        </div>

        {loading && (
          <div className="absolute right-20 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && hasResults && (
        <div
          ref={dropdownRef}
          className="absolute top-full mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden z-50 animate-slide-down max-h-80 overflow-y-auto"
        >
          {/* City Results */}
          {cityResults.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Cities & Places</p>
              </div>
              {cityResults.map((city) => {
                if (!city || !Array.isArray(city.coordinates) || city.coordinates.length < 2) return null;
                const dist = getDistanceToUser(city.coordinates[0], city.coordinates[1]);
                return (
                  <button
                    key={`${city.name}-${city.coordinates?.join(',')}`}
                    onClick={() => handleSelectCity(city)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-100 transition-colors text-left"
                  >
                    <Building2 className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 truncate">{city.name}</p>
                      <p className="text-xs text-slate-500 truncate">{city.label}</p>
                    </div>
                    {dist != null && (
                      <span className="text-xs text-slate-400 flex-shrink-0 whitespace-nowrap">
                        {formatDistance(dist)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Parking Lot Results */}
          {lotResults.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Parking Spaces</p>
              </div>
              {lotResults.map((lot) => {
                if (!lot) return null;
                const lotLng = lot.location?.coordinates?.[0] ?? lot.longitude ?? lot.lng;
                const lotLat = lot.location?.coordinates?.[1] ?? lot.latitude ?? lot.lat;
                const dist = lotLng != null && lotLat != null ? getDistanceToUser(lotLng, lotLat) : null;
                const pricePerHour = lot.pricePerHour ?? lot.price ?? lot.rates?.hourly;
                const availableSlots = lot.availableSlots ?? lot.available ?? lot.slotsAvailable;

                return (
                  <button
                    key={lot._id || lot.id}
                    onClick={() => handleSelectLot(lot)}
                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-100 transition-colors text-left"
                  >
                    <MapPin className="w-4 h-4 text-primary-700 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 truncate">{lot.name}</p>
                      <p className="text-xs text-slate-600 truncate">{lot.address}</p>
                      {dist != null && (
                        <p className="text-xs text-slate-400 mt-0.5">{formatDistance(dist)} away</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0 gap-0.5">
                      {pricePerHour != null && (
                        <span className="text-xs font-semibold text-emerald-600">₹{pricePerHour}/hr</span>
                      )}
                      {availableSlots != null && (
                        <span className="text-xs text-slate-500">{availableSlots} slots free</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {isOpen && query.length >= 1 && !hasResults && !loading && (
        <div className="absolute top-full mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-lg p-4 z-50 animate-slide-down">
          <p className="text-sm text-slate-600 text-center">No results found</p>
        </div>
      )}
    </div>
  );
}
