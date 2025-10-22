// Frontend/src/api/SkillsApi.js
import { api } from './client';

// === PUBLIC SKILLS API (No admin auth required) ===
// These functions are for normal users to browse skills and suggest new ones

// GET /api/public/skills - Get skills for public browsing (registration, profile editing)
export const getSkillsForPublic = async (params = {}) => {
  const { data } = await api.get('/api/public/skills', { params });
  return data;
};

// GET /api/public/skills/categories - Get skill categories for filtering
export const getSkillCategories = async () => {
  const { data } = await api.get('/api/public/skills/categories');
  return data;
};

// POST /api/public/skills/suggest - Suggest a new skill (requires authentication)
export const suggestNewSkill = async (skillData) => {
  const { data } = await api.post('/api/public/skills/suggest', skillData);
  return data;
};