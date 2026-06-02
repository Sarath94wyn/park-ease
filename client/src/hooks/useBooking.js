import { useState, useCallback } from 'react';
import { createBooking, cancelBooking, simulatePayment } from '../services/bookingService';
import toast from 'react-hot-toast';

export function useBooking() {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createNewBooking = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const result = await createBooking(data);
      const booking = result.booking || result;
      setBookingDetails(booking);
      toast.success('Booking created successfully!');
      return booking;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create booking';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelExistingBooking = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await cancelBooking(id);
      toast.success('Booking cancelled');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel booking';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const payForBooking = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const result = await simulatePayment(id);
      toast.success('Payment successful!');
      return result;
    } catch (err) {
      const msg = err.response?.data?.message || 'Payment failed';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetBooking = useCallback(() => {
    setSelectedSlot(null);
    setBookingDetails(null);
    setError(null);
  }, []);

  return {
    selectedSlot,
    setSelectedSlot,
    bookingDetails,
    setBookingDetails,
    loading,
    error,
    createNewBooking,
    cancelExistingBooking,
    payForBooking,
    resetBooking,
  };
}

export default useBooking;
