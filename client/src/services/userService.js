import api from './api';

export const updateProfile = async (profileData) => {
  const { data } = await api.put('/users/profile', profileData);
  return data;
};

export const addFavorite = async (lotId) => {
  const { data } = await api.post(`/users/favorites/${lotId}`);
  return data;
};

export const removeFavorite = async (lotId) => {
  const { data } = await api.delete(`/users/favorites/${lotId}`);
  return data;
};

export const getFavorites = async () => {
  const { data } = await api.get('/users/favorites');
  return data;
};
