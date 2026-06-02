import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { DEFAULT_CENTER, DEFAULT_ZOOM } from '../../utils/constants';
import { formatCurrency, getAvailabilityColor } from '../../utils/helpers';
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
        width: 32px; height: 32px;
        background: ${color};
        border: 2px solid white;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        color: white; font-weight: 850; font-size: 11px;
        box-shadow: 0 0 12px ${color}80;
      ">
        P
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
}

// Sub-component for map control (fly to location)
function MapController({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom || map.getZoom(), { duration: 1.5 });
    }
  }, [center, zoom, map]);

  return null;
}

export default function MapView({
  parkingLots = [],
  center,
  zoom,
  onMarkerClick,
  selectedLot,
  userPosition,
}) {
  const mapCenter = center || DEFAULT_CENTER;
  const mapZoom = zoom || DEFAULT_ZOOM;

  const markers = useMemo(() => {
    return parkingLots.map((lot) => {
      const lat = lot.location?.coordinates?.[1] || lot.latitude;
      const lng = lot.location?.coordinates?.[0] || lot.longitude;
      if (!lat || !lng) return null;

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

  return (
    <div className="relative w-full h-[50vh] md:h-[70vh] rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
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

        <MapController center={center || mapCenter} zoom={mapZoom} />

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
                <p className="text-slate-650 text-xs mb-2 leading-relaxed">{lot.address}</p>
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
        {userPosition && (
          <CircleMarker
            center={[userPosition.lat, userPosition.lng]}
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
        )}
      </MapContainer>

      {/* Selected lot indicator */}
      {selectedLot && (
        <div className="absolute bottom-4 left-4 right-4 bg-white/90 border border-slate-200 p-4 animate-slide-up z-[1000] shadow-sm rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-slate-900 font-extrabold text-sm">{selectedLot.name}</h3>
              <p className="text-slate-600 text-xs leading-relaxed">{selectedLot.address}</p>
            </div>
            <div className="bg-slate-100/40 px-3 py-1.5 rounded-xl border border-slate-200 text-right">
              <span className="text-[10px] text-slate-600 font-bold block uppercase tracking-wider">Rate</span>
              <span className="text-sm font-black text-cyan-600">
                {formatCurrency(selectedLot.pricePerHour)}/hr
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
