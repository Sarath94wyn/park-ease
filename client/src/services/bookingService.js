import api from './api';

export const createBooking = async (bookingData) => {
  const { data } = await api.post('/bookings', bookingData);
  return data;
};

export const getUserBookings = async () => {
  const { data } = await api.get('/bookings/my');
  return data;
};

export const getBookingById = async (id) => {
  const { data } = await api.get(`/bookings/${id}`);
  return data;
};

export const cancelBooking = async (id) => {
  const { data } = await api.put(`/bookings/${id}/cancel`);
  return data;
};

export const simulatePayment = async (id) => {
  const { data } = await api.post(`/bookings/${id}/pay`);
  return data;
};

export const getAllBookings = async () => {
  const { data } = await api.get('/bookings/all');
  return data;
};

export const createRazorpayOrder = async (id) => {
  const { data } = await api.post(`/bookings/${id}/razorpay-order`);
  return data;
};

export const verifyRazorpayPayment = async (id, paymentData) => {
  const { data } = await api.post(`/bookings/${id}/razorpay-verify`, paymentData);
  return data;
};
