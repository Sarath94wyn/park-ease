import { useState, useCallback } from 'react';
import { getAllParkingLots, getNearbyParkingLots } from '../services/parkingService';

export function useParkingLots() {
  const [parkingLots, setParkingLots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const fetchParkingLots = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllParkingLots(filters);
      const lots = data.parkingLots || data.data || data || [];
      setParkingLots(Array.isArray(lots) ? lots : []);
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch parking lots:', err);
      setError(err.response?.data?.message || 'Failed to fetch parking lots');
      setParkingLots([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNearby = useCallback(async (lat, lng, radius = 5000) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNearbyParkingLots(lat, lng, radius);
      const lots = data.parkingLots || data.data || data || [];
      setParkingLots(Array.isArray(lots) ? lots : []);
    } catch (err) {
      console.error('Failed to fetch nearby lots:', err);
      setError(err.response?.data?.message || 'Failed to fetch nearby lots');
      setParkingLots([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    parkingLots,
    loading,
    error,
    pagination,
    fetchParkingLots,
    fetchNearby,
  };
}

export default useParkingLots;
