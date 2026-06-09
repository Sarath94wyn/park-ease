import api from './api';

export const getDashboardStats = async () => {
  const { data } = await api.get('/admin/stats');
  return data;
};

export const getAllUsers = async (params = {}) => {
  const { data } = await api.get('/admin/users', { params });
  return data;
};

export const updateUserRole = async (userId, role) => {
  const { data } = await api.put(`/admin/users/${userId}/role`, { role });
  return data;
};

export const toggleBlockUser = async (userId) => {
  const { data } = await api.put(`/admin/users/${userId}/block`);
  return data;
};

export const updateUserPoints = async (userId, points) => {
  const { data } = await api.put(`/admin/users/${userId}/points`, { points });
  return data;
};

export const updateParkingSpace = async (lotId, slotNumber, payload) => {
  const { data } = await api.put(`/admin/slots/${lotId}/${slotNumber}`, payload);
  return data;
};

export const getAllQueries = async () => {
  const { data } = await api.get('/admin/queries');
  return data;
};

export const resolveQuery = async (queryId) => {
  const { data } = await api.put(`/admin/queries/${queryId}/resolve`);
  return data;
};

export const getAllAlerts = async () => {
  const { data } = await api.get('/admin/alerts');
  return data;
};

export const resolveAlert = async (alertId) => {
  const { data } = await api.put(`/admin/alerts/${alertId}/resolve`);
  return data;
};

export const refundBooking = async (bookingId) => {
  const { data } = await api.post(`/admin/bookings/${bookingId}/refund`);
  return data;
};

export const getAllStaff = async () => {
  const { data } = await api.get('/admin/staff');
  return data;
};

export const addStaff = async (payload) => {
  const { data } = await api.post('/admin/staff', payload);
  return data;
};

export const checkInBooking = async (bookingId) => {
  const { data } = await api.put(`/admin/bookings/${bookingId}/checkin`);
  return data;
};

export const checkOutBooking = async (bookingId) => {
  const { data } = await api.put(`/admin/bookings/${bookingId}/checkout`);
  return data;
};
