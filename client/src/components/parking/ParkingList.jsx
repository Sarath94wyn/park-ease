import { MapPin } from 'lucide-react';
import ParkingCard from './ParkingCard';
import { InlineLoader } from '../common/Loader';

export default function ParkingList({
  parkingLots = [],
  loading = false,
  onSelect,
  onFavorite,
  favorites = [],
}) {
  if (loading) {
    return <InlineLoader message="Loading parking lots..." />;
  }

  if (parkingLots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-20 h-20 rounded-2xl bg-slate-100/50 flex items-center justify-center mb-4">
          <MapPin className="w-10 h-10 text-slate-600" />
        </div>
        <h3 className="text-slate-900 font-semibold text-lg mb-2">No parking lots found</h3>
        <p className="text-slate-600 text-sm text-center max-w-sm">
          Try adjusting your search or filters to discover available parking spots.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {parkingLots.map((lot, index) => (
        <div
          key={lot._id || lot.id || index}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <ParkingCard
            lot={lot}
            onSelect={onSelect}
            onFavorite={onFavorite}
            isFavorite={favorites.includes(lot._id || lot.id)}
          />
        </div>
      ))}
    </div>
  );
}
