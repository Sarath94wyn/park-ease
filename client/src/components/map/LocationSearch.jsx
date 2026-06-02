import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Crosshair, MapPin, X } from 'lucide-react';
import { searchParkingLots } from '../../services/parkingService';

export default function LocationSearch({ onSelect, onUseMyLocation, className = '' }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  const handleSearch = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      const data = await searchParkingLots(searchQuery);
      const lots = data.parkingLots || data.data || data || [];
      setResults(Array.isArray(lots) ? lots.slice(0, 6) : []);
      setIsOpen(true);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const handleSelect = (lot) => {
    setQuery(lot.name || '');
    setIsOpen(false);
    if (lot.location && lot.location.coordinates) {
      onSelect?.(lot.location.coordinates, lot.name);
    } else {
      onSelect?.(lot);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Search for parking lots, locations..."
          className="w-full pl-12 pr-24 py-3.5 bg-slate-100/60 backdrop-blur-lg border border-slate-300 rounded-2xl text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all duration-300 text-sm"
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <button
              onClick={handleClear}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-655 transition-colors"
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
      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden z-50 animate-slide-down"
        >
          {results.map((lot) => (
            <button
              key={lot._id || lot.id}
              onClick={() => handleSelect(lot)}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-100 transition-colors text-left"
            >
              <MapPin className="w-4 h-4 text-primary-700 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{lot.name}</p>
                <p className="text-xs text-slate-600 truncate">{lot.address}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute top-full mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-lg p-4 z-50 animate-slide-down">
          <p className="text-sm text-slate-600 text-center">No results found</p>
        </div>
      )}
    </div>
  );
}
