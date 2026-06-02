import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getParkingLotById } from '../services/parkingService';
import { getFavorites, addFavorite, removeFavorite } from '../services/userService';
import ParkingDetails from '../components/parking/ParkingDetails';
import { useAuth } from '../contexts/AuthContext';
import { ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ParkingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [lot, setLot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const fetchLotAndFavorites = async () => {
    try {
      setLoading(true);
      const lotData = await getParkingLotById(id);
      setLot(lotData.parkingLot || lotData);

      // Check if favorited if logged in
      if (isAuthenticated) {
        const favsData = await getFavorites();
        const favs = favsData.favorites || favsData;
        const exists = favs.some(f => f._id === id);
        setIsFavorite(exists);
      }
    } catch (e) {
      console.error('Failed to load lot specifications:', e);
      toast.error('Parking lot not found');
      navigate('/explore');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLotAndFavorites();
  }, [id, isAuthenticated]);

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to add to favorites');
      navigate('/login');
      return;
    }

    try {
      if (isFavorite) {
        await removeFavorite(id);
        setIsFavorite(false);
        toast.success('Removed from favorites');
      } else {
        await addFavorite(id);
        setIsFavorite(true);
        toast.success('Saved to favorites');
      }
    } catch (e) {
      console.error('Favorite update failed:', e);
      toast.error('Update failed');
    }
  };

  const handleBookClick = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to book a spot');
      navigate('/login');
      return;
    }
    
    // Redirect to booking checkout wizard page
    navigate(`/booking/${id}?slot=${selectedSlot}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-white space-y-3">
        <div className="w-10 h-10 border-4 border-slate-300 border-t-indigo-500 rounded-full animate-spin"></div>
        <span className="text-xs text-slate-600 font-semibold tracking-wide">Syncing facility map floor layouts...</span>
      </div>
    );
  }

  if (!lot) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6 relative select-none">
      {/* Background decoration radial blurs */}
      <div className="absolute top-[-10%] right-[-10%] w-72 h-72 bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        {/* Back breadcrumb navigation */}
        <button
          type="button"
          onClick={() => navigate('/explore')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-white uppercase tracking-widest transition-colors"
        >
          <ChevronLeft className="w-4.5 h-4.5" />
          <span>Back to Explorer</span>
        </button>

        {/* Detailed ParkingLot profile component */}
        <ParkingDetails
          lot={lot}
          selectedSlot={selectedSlot}
          onSlotSelect={setSelectedSlot}
          isFavorite={isFavorite}
          onFavoriteToggle={handleFavoriteToggle}
          onBookClick={handleBookClick}
        />
      </div>
    </div>
  );
}
