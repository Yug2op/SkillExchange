// Frontend/src/api/ReviewApi.js
import { api } from './client';

export const createReview = async (payload) => {
  const { data } = await api.post('/api/reviews', payload);
  return data;
};

export const getMyGivenReviews = async () => {
  const { data } = await api.get('/api/reviews/my/given');
  return data;
};

export const getUserReviews = async (userId, { page = 1, limit = 10 } = {}) => {
  const { data } = await api.get(`/api/reviews/${userId}`, { params: { page, limit } });
  return data;
};

export const updateReview = async (id, payload) => {
  const { data } = await api.put(`/api/reviews/${id}`, payload);
  return data;
};

export const deleteReview = async (id) => {
  const { data } = await api.delete(`/api/reviews/${id}`);
  return data;
};