// Frontend/src/api/UserApi.js
import { api } from './client';

// GET /api/users/search
export const searchUsers = async ({ teach, learn, location, page = 1, limit = 20 } = {}) => {
  const params = {};
  if (teach) params.teach = teach;
  if (learn) params.learn = learn;
  if (location) params.location = location;
  if (page) params.page = page;
  if (limit) params.limit = limit;

  const { data } = await api.get('/api/users/search', { params });
  return data;
};

// GET /api/users/matches (auth)
export const getMatches = async () => {
  const { data } = await api.get('/api/users/matches');
  return data;
};

// GET /api/users/:id
export const getUser = async (id) => {
  const { data } = await api.get(`/api/users/${id}`);
  return data;
};

// PUT /api/users/:id (auth)
export const updateUser = async (id, payload) => {
  const allowed = ['name', 'bio', 'skillsToTeach', 'skillsToLearn', 'location', 'availability', 'phone'];
  const body = {};
  Object.keys(payload || {}).forEach((k) => {
    if (allowed.includes(k)) body[k] = payload[k];
  });

  const { data } = await api.put(`/api/users/${id}`, body);
  return data;
};

// POST /api/users/:id/profile-pic (auth)
export const uploadProfilePic = async (id, file) => {
  const form = new FormData();
  form.append('profilePic', file);

  const { data } = await api.post(`/api/users/${id}/profile-pic`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

// DELETE /api/users/:id (auth)
export const deleteAccount = async (id) => {
  const { data } = await api.delete(`/api/users/${id}`);
  return data;
};