import React, { useState, useEffect } from 'react';
import { getFavorites, removeFavorite } from '../../services/userService';
import ParkingCard from '../parking/ParkingCard';
import toast from 'react-hot-toast';

export default function FavoritesList() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const data = await getFavorites();
      setFavorites(data.favorites || data);
    } catch (e) {
      console.error('Error fetching favorites:', e);
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleFavoriteToggle = async (lotId) => {
    try {
      await removeFavorite(lotId);
      toast.success('Removed from favorites');
      setFavorites(prev => prev.filter(f => f._id !== lotId));
    } catch (e) {
      console.error('Remove favorite failed:', e);
      toast.error('Failed to update favorite');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-3">
        <div className="w-10 h-10 border-4 border-slate-300 border-t-indigo-500 rounded-full animate-spin"></div>
        <span className="text-xs text-slate-600 font-semibold tracking-wide">Syncing saved spots...</span>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="glass-card-dark p-12 text-center border border-slate-200">
        <span className="text-4xl">❤️</span>
        <h3 className="text-base font-extrabold mt-3 text-slate-700">No favorite lots found</h3>
        <p className="text-xs text-slate-600 mt-1">Click the heart icon on any parking lot details to save here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {favorites.map((lot) => (
        <ParkingCard
          key={lot._id}
          lot={lot}
          onSelect={() => window.location.href = `/parking/${lot._id}`}
          onFavorite={() => handleFavoriteToggle(lot._id)}
          isFavorite={true}
        />
      ))}
    </div>
  );
}
