import api from './api';

export const register = async (userData) => {
  const { data } = await api.post('/auth/register', userData);
  return data;
};

export const login = async (credentials) => {
  const { data } = await api.post('/auth/login', credentials);
  return data;
};

export const getMe = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};

export const refreshToken = async (token) => {
  const { data } = await api.post('/auth/refresh', { refreshToken: token });
  return data;
};
