// Frontend/src/api/AuthApi.js
import { api } from './client';

// POST /api/auth/register
export const register = async (payload) => {
  const { data } = await api.post('/api/auth/register', payload);
  return data; // { success, message, data: { user, token } }
};

// POST /api/auth/login
export const login = async ({ email, password }) => {
  const { data } = await api.post('/api/auth/login', { email, password });
  return data; // { success, message, data: { user, token } }
};

// GET /api/auth/me
export const getMe = async () => {
  const { data } = await api.get('/api/auth/me');
  return data; // { success, data: { user } }
};

// POST /api/auth/forgot-password
export const forgotPassword = async ({ email }) => {
  const { data } = await api.post('/api/auth/forgot-password', { email });
  return data;
};

// POST /api/auth/reset-password?token=...
export const resetPassword = async ({ token, password }) => {
  const { data } = await api.post(`/api/auth/reset-password`, { password }, { params: { token } });
  return data;
};

// PUT /api/auth/change-password
export const changePassword = async ({ currentPassword, newPassword }) => {
  const { data } = await api.put('/api/auth/change-password', { currentPassword, newPassword });
  return data;
};

// POST /api/auth/logout
export const logout = async () => {
  const { data } = await api.post('/api/auth/logout');
  return data;
};