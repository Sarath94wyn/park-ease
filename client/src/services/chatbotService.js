import api from './api';

export const sendMessage = async (message) => {
  const { data } = await api.post('/chatbot/message', { message });
  return data;
};
