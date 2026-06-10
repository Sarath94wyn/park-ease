import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Polyline, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { DEFAULT_CENTER, DEFAULT_ZOOM } from '../../utils/constants';
import { formatCurrency } from '../../utils/helpers';
import { Navigation, Compass, Info, X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue with Vite/Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom marker icon creator matching Google Maps Pins look in dark mode
function createParkingIcon(available, total) {
  const percentage = total > 0 ? (available / total) * 100 : 0;
  let color = '#ef4444'; // Red (Occupied)
  if (percentage > 50) color = '#10b981'; // Emerald Green (Available)
  else if (percentage > 20) color = '#f59e0b'; // Amber Yellow (Filling fast)

  return L.divIcon({
    className: 'custom-parking-marker',
    html: `
      <div style="
        background: ${color};
        border: 2px solid white;
        border-radius: 9999px;
        display: flex; align-items: center; justify-content: center;
        color: white; font-weight: 850; font-size: 10px;
        box-shadow: 0 0 12px ${color}80;
        padding: 4px 8px;
        white-space: nowrap;
      ">
        Free: ${available}
      </div>
    `,
    iconSize: [64, 28],
    iconAnchor: [32, 14],
    popupAnchor: [0, -14],
  });
}

// Haversine distance calculator
function getHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Sub-component for map control (fly to location and handle responsiveness)
function MapController({ center, zoom, activeView }) {
  const map = useMap();

  // Force size recalculation when activeView toggles (with delay to allow mobile drawer transition to settle)
  useEffect(() => {
    if (!map) return;
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [map, activeView]);

  // Handle automatic size invalidation when container dimensions change (e.g., hidden to visible toggle)
  useEffect(() => {
    if (!map) return;

    let resizeObserver;
    try {
      const container = map.getContainer();
      if (container) {
        resizeObserver = new ResizeObserver(() => {
          // Use requestAnimationFrame to let layout engine settle
          requestAnimationFrame(() => {
            if (map) {
              map.invalidateSize();
            }
          });
        });
        resizeObserver.observe(container);
      }
    } catch (err) {
      console.error("Error setting up map ResizeObserver:", err);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [map]);

  // Handle center and zoom updates safely
  useEffect(() => {
    if (!map) return;
    map.invalidateSize();

    if (!center || !Array.isArray(center) || center.length < 2) return;

    const lat = parseFloat(center[0]);
    const lng = parseFloat(center[1]);

    if (!isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng)) {
      try {
        const currentZoom = map.getZoom();
        const targetZoom = (zoom && !isNaN(parseFloat(zoom))) ? parseFloat(zoom) : (currentZoom || 12);
        
        const size = map.getSize();
        if (size.x > 0 && size.y > 0) {
          // Only animate if the container is visible and has a positive area
          map.flyTo([lat, lng], targetZoom, { duration: 1.5 });
        } else {
          // If hidden or 0-size, set view directly without animation to avoid Leaflet flyTo NaN crash
          map.setView([lat, lng], targetZoom);
        }
      } catch (e) {
        console.error("Map transition error:", e);
        // Fallback to direct setView if flyTo fails
        try {
          map.setView([lat, lng], (zoom && !isNaN(parseFloat(zoom))) ? parseFloat(zoom) : 12);
        } catch (err) {
          console.error("Map setView fallback error:", err);
        }
      }
    }
  }, [center, zoom, map, activeView]);

  return null;
}

export default function MapView({
  parkingLots = [],
  center,
  zoom,
  onMarkerClick,
  selectedLot,
  userPosition,
  isNavigating = false,
  onStartNavigation,
  onCloseDetails,
  activeView,
  hideDetailsActions = false,
}) {
  const navigate = useNavigate();
  const mapCenter = (center && Array.isArray(center) && center.length >= 2 && !isNaN(parseFloat(center[0])) && !isNaN(parseFloat(center[1])))
    ? [parseFloat(center[0]), parseFloat(center[1])]
    : DEFAULT_CENTER;
  const mapZoom = (zoom && !isNaN(parseFloat(zoom))) ? parseFloat(zoom) : DEFAULT_ZOOM;

  const markers = useMemo(() => {
    return parkingLots.map((lot) => {
      if (!lot) return null;
      const rawLat = lot.location?.coordinates?.[1] ?? lot.latitude ?? lot.lat;
      const rawLng = lot.location?.coordinates?.[0] ?? lot.longitude ?? lot.lng;
      const lat = parseFloat(rawLat);
      const lng = parseFloat(rawLng);
      if (isNaN(lat) || isNaN(lng)) return null;

      const available = lot.availableSlots ?? lot.totalSlots ?? 0;
      const total = lot.totalSlots ?? 0;

      return {
        ...lot,
        lat,
        lng,
        available,
        total,
        icon: createParkingIcon(available, total),
      };
    }).filter(Boolean);
  }, [parkingLots]);

  // Find full selected lot details
  const selectedLotObj = useMemo(() => {
    return markers.find(lot => lot._id === selectedLot || lot.id === selectedLot);
  }, [markers, selectedLot]);

  // Generate route geometry coordinates
  const routePoints = useMemo(() => {
    if (!userPosition || !selectedLotObj) return [];
    
    const lat1 = parseFloat(userPosition.lat ?? userPosition.latitude);
    const lng1 = parseFloat(userPosition.lng ?? userPosition.longitude);
    const lat2 = parseFloat(selectedLotObj.lat);
    const lng2 = parseFloat(selectedLotObj.lng);
    
    if (isNaN(lat1) || isNaN(lng1) || isNaN(lat2) || isNaN(lng2)) {
      return [];
    }
    
    const midLat = (lat1 + lat2) / 2;
    const midLng = (lng1 + lng2) / 2;
    
    // Add slightly zig-zagging offset points to simulate roads
    const offsetLat = (lat2 - lat1) * 0.12;
    const offsetLng = (lng2 - lng1) * -0.12;
    
    return [
      [lat1, lng1],
      [lat1 + (lat2 - lat1) * 0.25, lng1 + offsetLng],
      [midLat + offsetLat, midLng],
      [lat2 - (lat2 - lat1) * 0.25, lng2 + offsetLng],
      [lat2, lng2]
    ];
  }, [userPosition, selectedLotObj]);

  // Calculate distance, duration, and simulated traffic level
  const routeStats = useMemo(() => {
    if (!userPosition || !selectedLotObj) return null;
    const lat1 = parseFloat(userPosition.lat ?? userPosition.latitude);
    const lng1 = parseFloat(userPosition.lng ?? userPosition.longitude);
    const lat2 = parseFloat(selectedLotObj.lat);
    const lng2 = parseFloat(selectedLotObj.lng);

    if (isNaN(lat1) || isNaN(lng1) || isNaN(lat2) || isNaN(lng2)) {
      return null;
    }

    const distance = getHaversineDistance(lat1, lng1, lat2, lng2);
    
    // Traffic generator based on name length to keep it consistent
    const nameLen = selectedLotObj.name.length;
    let traffic = 'Low';
    let trafficColor = '#22c55e'; // Green
    let speed = 40; // km/h
    
    if (nameLen % 3 === 1) {
      traffic = 'Moderate';
      trafficColor = '#f59e0b'; // Amber
      speed = 25;
    } else if (nameLen % 3 === 2) {
      traffic = 'Heavy';
      trafficColor = '#ef4444'; // Red
      speed = 12;
    }
    
    const timeMins = Math.max(1, Math.round((distance / speed) * 60));
    
    return {
      distance: distance.toFixed(1),
      duration: timeMins,
      traffic,
      trafficColor
    };
  }, [userPosition, selectedLotObj]);

  return (
    <div className="relative w-full h-full flex-1 min-h-[400px] rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="w-full h-full z-0"
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          subdomains="abcd"
          maxZoom={19}
        />

        <MapController center={center || mapCenter} zoom={mapZoom} activeView={activeView} />

        {/* Parking lot markers */}
        {markers.map((lot) => (
          <Marker
            key={lot._id || lot.id}
            position={[lot.lat, lot.lng]}
            icon={lot.icon}
            eventHandlers={{
              click: () => onMarkerClick?.(lot),
            }}
          >
            <Popup>
              <div className="min-w-[180px] text-slate-800 p-1">
                <h3 className="font-extrabold text-slate-900 text-sm mb-0.5">{lot.name}</h3>
                <p className="text-slate-600 text-xs mb-2 leading-relaxed">{lot.address}</p>
                <div className="flex items-center justify-between border-t border-slate-200/80 pt-2.5">
                  <span className={`text-xs font-black uppercase tracking-wider ${
                    lot.available > 10 ? 'text-emerald-700' : 'text-rose-700'
                  }`}>
                    {lot.available}/{lot.total} spots free
                  </span>
                  <span className="text-xs font-extrabold text-cyan-600">
                    {formatCurrency(lot.pricePerHour)}/hr
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* User position marker */}
        {(() => {
          if (!userPosition) return null;
          const userLat = parseFloat(userPosition.lat ?? userPosition.latitude);
          const userLng = parseFloat(userPosition.lng ?? userPosition.longitude);
          if (isNaN(userLat) || isNaN(userLng)) return null;

          return isNavigating ? (
            <Marker
              position={[userLat, userLng]}
              icon={L.divIcon({
                className: 'custom-car-marker',
                html: `
                  <div style="
                    background: #22d3ee;
                    border: 2px solid white;
                    border-radius: 9999px;
                    width: 32px; height: 32px;
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 0 12px #22d3ee80;
                    font-size: 16px;
                  ">
                    🚗
                  </div>
                `,
                iconSize: [32, 32],
                iconAnchor: [16, 16],
              })}
            >
              <Popup>
                <span className="text-slate-900 text-xs font-bold font-sans">Simulating driving to destination...</span>
              </Popup>
            </Marker>
          ) : (
            <CircleMarker
              center={[userLat, userLng]}
              radius={8}
              pathOptions={{
                color: '#ffffff',
                fillColor: '#22d3ee', // Cyan User Locator Dot
                fillOpacity: 1,
                weight: 2,
              }}
            >
              <Popup>
                <span className="text-slate-900 text-xs font-bold">You are here</span>
              </Popup>
            </CircleMarker>
          );
        })()}

        {/* Draw Simulated Road Route Path */}
        {routePoints.length > 0 && (
          <>
            {/* Outer thick glowing line matching traffic condition color */}
            <Polyline
              positions={routePoints}
              pathOptions={{
                color: routeStats?.trafficColor || '#3b82f6',
                weight: 8,
                opacity: 0.6,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />
            {/* Inner dashed casing line to look like a premium road map */}
            <Polyline
              positions={routePoints}
              pathOptions={{
                color: '#ffffff',
                weight: 2,
                opacity: 0.9,
                dashArray: '6, 8',
                lineCap: 'round'
              }}
            />
          </>
        )}
      </MapContainer>

      {/* Selected lot directions / traffic details panel */}
      {selectedLotObj && (
        <div className="absolute bottom-4 left-4 right-4 bg-white/95 border border-slate-200 p-4 animate-slide-up z-[1000] shadow-xl rounded-2xl space-y-3">
          {onCloseDetails && (
            <button
              type="button"
              onClick={onCloseDetails}
              className="absolute top-3 right-3 p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors z-10"
              title="Close details"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <div className="flex items-start justify-between gap-2 pr-8">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-slate-900 font-extrabold text-sm leading-tight">{selectedLotObj.name}</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 font-black uppercase tracking-wider px-1.5 py-0.5 rounded whitespace-nowrap">
                  ₹{selectedLotObj.pricePerHour}/hr
                </span>
                <span className="text-[10px] text-slate-600 bg-slate-100 border border-slate-200 font-bold uppercase tracking-wider px-1.5 py-0.5 rounded whitespace-nowrap">
                  {selectedLotObj.available}/{selectedLotObj.total} Free
                </span>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed truncate max-w-[280px] sm:max-w-md">{selectedLotObj.address}</p>
            </div>
          </div>

          {/* GPS Info Dashboard Row */}
          {routeStats ? (
            <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl text-center select-none text-xs font-semibold text-slate-700">
              <div className="border-r border-slate-200">
                <span className="text-[9px] uppercase font-bold tracking-widest text-slate-600 block mb-0.5">Distance</span>
                <span className="text-sm font-black text-slate-900">{routeStats.distance} km</span>
              </div>
              <div className="border-r border-slate-200">
                <span className="text-[9px] uppercase font-bold tracking-widest text-slate-600 block mb-0.5">ETA</span>
                <span className="text-sm font-black text-indigo-600">{routeStats.duration} mins</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold tracking-widest text-slate-600 block mb-0.5">Traffic</span>
                <span className="text-sm font-black flex items-center justify-center gap-1" style={{ color: routeStats.trafficColor }}>
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: routeStats.trafficColor }} />
                  <span>{routeStats.traffic}</span>
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl flex items-center gap-2 text-xs font-medium text-slate-600">
              <Info className="w-4 h-4 text-cyan-600 shrink-0" />
              <span>Enable GPS/Geolocation to calculate route distance & traffic live.</span>
            </div>
          )}

          {/* Action Navigation Row */}
          {!hideDetailsActions && (
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => {
                  const lat = selectedLotObj.lat;
                  const lng = selectedLotObj.lng;
                  window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
                }}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-extrabold text-[11px] rounded-xl flex items-center justify-center gap-1 border border-slate-300 shadow-sm transition-all active:scale-98 select-none"
              >
                <Navigation className="w-4.5 h-4.5 text-primary-700" />
                <span>Google Maps</span>
              </button>

              {!isNavigating && (
                <button
                  type="button"
                  onClick={() => onStartNavigation?.(selectedLotObj)}
                  className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-[11px] rounded-xl flex items-center justify-center gap-1 shadow-md transition-all active:scale-98 select-none"
                >
                  <Compass className="w-4.5 h-4.5 text-white animate-pulse" />
                  <span>Simulate Driving</span>
                </button>
              )}
              
              <button
                type="button"
                onClick={() => navigate(`/parking/${selectedLotObj._id}`)}
                className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-700 hover:from-cyan-400 hover:to-indigo-550 text-white font-extrabold text-[11px] rounded-xl flex items-center justify-center gap-1 shadow-md transition-all active:scale-98 select-none"
              >
                <Compass className="w-4.5 h-4.5" />
                <span>Reserve Slot</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
