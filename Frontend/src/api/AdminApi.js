import { api } from './client';

// GET /api/admin/users - Get all users with pagination and filtering
export const getAllUsers = async ({ page = 1, limit = 20, search = '', status = 'all' } = {}) => {
  const params = { page, limit };
  if (search) params.search = search;
  if (status && status !== 'all') params.status = status;

  const { data } = await api.get('/api/admin/users', { params });
  return data;
};

// GET /api/admin/stats - Get dashboard statistics
export const getDashboardStats = async () => {
  const { data } = await api.get('/api/admin/stats');
  return data;
};

// PUT /api/admin/users/:id/deactivate - Deactivate user
export const deactivateUser = async (userId) => {
  const { data } = await api.put(`/api/admin/users/${userId}/deactivate`);
  return data;
};

// PUT /api/admin/users/:id/activate - Activate user
export const activateUser = async (userId) => {
  const { data } = await api.put(`/api/admin/users/${userId}/activate`);
  return data;
};

// DELETE /api/admin/users/:id - Delete user permanently
export const deleteUser = async (userId) => {
  const { data } = await api.delete(`/api/admin/users/${userId}`);
  return data;
};

// POST /api/admin/skills - Create new skill
export const createSkill = async (skillData) => {
  const { data } = await api.post('/api/admin/skills', skillData);
  return data;
};

// GET /api/admin/skills - Get all skills
export const getAllSkills = async () => {
  const { data } = await api.get('/api/admin/skills');
  return data;
};

// GET /api/admin/get-deactivated - Get deactivated users
export const getDeactivatedUsers = async () => {
  const { data } = await api.get('/api/admin/get-deactivated');
  return data;
};

// PUT /api/admin/skills/:id - Update skill
export const updateSkill = async (skillId, skillData) => {
    const { data } = await api.put(`/api/admin/skills/${skillId}`, skillData);
    return data;
  };
  
  // DELETE /api/admin/skills/:id - Delete skill
  export const deleteSkill = async (skillId) => {
    const { data } = await api.delete(`/api/admin/skills/${skillId}`);
    return data;
  };
  
  // POST /api/admin/skills/:id/approve - Approve skill suggestion
  export const approveSkillSuggestion = async (suggestionId, adminNotes) => {
    const { data } = await api.post(`/api/admin/skills/${suggestionId}/approve`, { adminNotes });
    return data;
  };
  
  // POST /api/admin/skills/:id/reject - Reject skill suggestion
  export const rejectSkillSuggestion = async (suggestionId, adminNotes) => {
    const { data } = await api.post(`/api/admin/skills/${suggestionId}/reject`, { adminNotes });
    return data;
  };
  
  // GET /api/admin/skills/stats - Get skill statistics (optional)
  export const getSkillStats = async () => {
    const { data } = await api.get('/api/admin/skills/stats');
    return data;
  };