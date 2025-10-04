// Frontend/src/api/ExchangeApi.js
import { api } from './client';

// POST /api/exchanges/request
export const createRequest = async (payload) => {
  const { data } = await api.post('/api/exchanges/request', payload);
  return data;
};

// GET /api/exchanges/my
export const getMyExchanges = async (params = {}) => {
  const { data } = await api.get('/api/exchanges/my', { params });
  return data;
};

// GET /api/exchanges/:id
export const getExchange = async (id) => {
  const { data } = await api.get(`/api/exchanges/${id}`);
  return data;
};

// PUT /api/exchanges/:id/accept
export const acceptExchange = async (id) => {
  const { data } = await api.put(`/api/exchanges/${id}/accept`);
  return data;
};

// PUT /api/exchanges/:id/reject
export const rejectExchange = async (id, reason) => {
  const { data } = await api.put(`/api/exchanges/${id}/reject`, { reason });
  return data;
};

// PUT /api/exchanges/:id/cancel
export const cancelExchange = async (id) => {
  const { data } = await api.put(`/api/exchanges/${id}/cancel`);
  return data;
};

// POST /api/exchanges/:id/schedule
export const scheduleSession = async (id, payload) => {
  const { data } = await api.post(`/api/exchanges/${id}/schedule`, payload);
  return data;
};

// PUT /api/exchanges/:id/complete
export const completeExchange = async (id) => {
  const { data } = await api.put(`/api/exchanges/${id}/complete`);
  return data;
};