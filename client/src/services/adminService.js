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

export const updateUserPoints = async (userId, points) => {
  const { data } = await api.put(`/admin/users/${userId}/points`, { points });
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
