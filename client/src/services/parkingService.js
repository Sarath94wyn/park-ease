import api from './api';

export const getAllParkingLots = async (params = {}) => {
  const { data } = await api.get('/parking', { params });
  return data;
};

export const getParkingLotById = async (id) => {
  const { data } = await api.get(`/parking/${id}`);
  return data;
};

export const getNearbyParkingLots = async (lat, lng, radius = 5000) => {
  const { data } = await api.get('/parking/nearby', {
    params: { lat, lng, radius },
  });
  return data;
};

export const searchParkingLots = async (query) => {
  const { data } = await api.get('/parking/search', {
    params: { q: query },
  });
  return data;
};

export const createParkingLot = async (lotData) => {
  const { data } = await api.post('/parking', lotData);
  return data;
};

export const updateParkingLot = async (id, lotData) => {
  const { data } = await api.put(`/parking/${id}`, lotData);
  return data;
};

export const deleteParkingLot = async (id) => {
  const { data } = await api.delete(`/parking/${id}`);
  return data;
};
