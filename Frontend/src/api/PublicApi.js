import { api } from './client';

// GET /api/public/stats - Get public platform statistics
export const getPublicStats = async () => {
  const { data } = await api.get('/api/public/stats');
  return data;
};
