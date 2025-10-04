// Frontend/src/api/ChatApi.js
import { api } from './client';

export const getChats = async () => {
  const { data } = await api.get('/api/chat');
  return data;
};

export const getChat = async (id) => {
  const { data } = await api.get(`/api/chat/${id}`);
  return data;
};

export const sendMessage = async (id, text) => {
  const { data } = await api.post(`/api/chat/${id}/message`, { text });
  return data;
};

export const getUnreadCount = async () => {
  const { data } = await api.get('/api/chat/unread/count');
  return data;
};

export const deleteChat = async (id) => {
  const { data } = await api.delete(`/api/chat/${id}`);
  return data;
};