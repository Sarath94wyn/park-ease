import { Heart, MapPin, Star, Clock, Zap, Shield, Camera, Wifi } from 'lucide-react';
import { formatCurrency, getAvailabilityColor, getAvailabilityText, getDistanceText, getParkingImageUrl } from '../../utils/helpers';

const amenityIconMap = {
  cctv: Camera,
  ev_charging: Zap,
  security: Shield,
  wifi: Wifi,
  WiFi: Wifi,
  '24/7': Clock,
};

export default function ParkingCard({ lot, onSelect, onFavorite, isFavorite = false }) {
  if (!lot) return null;

  const available = lot.availableSlots ?? lot.totalSlots ?? 0;
  const total = lot.totalSlots ?? 0;
  const percentage = total > 0 ? (available / total) * 100 : 0;
  const amenities = lot.amenities || [];

  return (
    <div
      onClick={() => onSelect?.(lot)}
      className="group relative glass-card-dark overflow-hidden cursor-pointer hover:scale-[1.02] hover:shadow-neon hover:border-primary-500/30 transition-all duration-300"
    >
      {/* Header / Image area */}
      <div className="relative h-36 bg-gradient-to-br from-primary-600/40 to-cyan-600/20 overflow-hidden">
        <img
          src={lot.images?.[0] || getParkingImageUrl(lot.name)}
          alt={lot.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />

        {/* Price badge */}
        <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-amber-500/90 backdrop-blur-sm text-xs font-bold text-slate-900">
          {formatCurrency(lot.pricePerHour)}/hr
        </div>

        {/* Distance badge */}
        {lot.distance != null && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/70 backdrop-blur-sm text-xs font-medium text-slate-800">
            {getDistanceText(lot.distance)}
          </div>
        )}

        {/* Favorite button */}
        {onFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavorite(lot._id || lot.id);
            }}
            className="absolute bottom-3 right-3 p-2 rounded-full bg-white/60 backdrop-blur-sm hover:bg-slate-900/80 transition-all duration-200"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white'
              }`}
            />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name & Rating */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-slate-900 font-semibold text-sm leading-tight line-clamp-1 group-hover:text-primary-300 transition-colors">
            {lot.name}
          </h3>
          {lot.rating && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-700" />
              <span className="text-xs font-medium text-amber-700">{lot.rating?.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Address */}
        <p className="text-slate-600 text-xs flex items-start gap-1 mb-3 line-clamp-1">
          <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" />
          {lot.address}
        </p>

        {/* Availability bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className={`font-medium ${getAvailabilityColor(available, total)}`}>
              {getAvailabilityText(available, total)}
            </span>
            <span className="text-slate-600">{available}/{total} spots</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentage > 50 ? 'bg-emerald-500' : percentage > 20 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Amenities */}
        {amenities.length > 0 && (
          <div className="flex items-center gap-2">
            {amenities.slice(0, 4).map((amenity) => {
              const IconComponent = amenityIconMap[amenity];
              return (
                <div
                  key={amenity}
                  className="w-7 h-7 rounded-lg bg-white/5 border border-slate-200/80 flex items-center justify-center"
                  title={amenity}
                >
                  {IconComponent ? (
                    <IconComponent className="w-3.5 h-3.5 text-slate-600" />
                  ) : (
                    <span className="text-[10px] text-slate-600">{amenity.charAt(0).toUpperCase()}</span>
                  )}
                </div>
              );
            })}
            {amenities.length > 4 && (
              <span className="text-xs text-slate-600">+{amenities.length - 4}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
