import axios from 'axios';

// Use relative URLs for API calls (nginx will proxy them)
const api = axios.create({
  baseURL: '',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth Service
export const authAPI = {
  register: (email, password) => 
    api.post('/api/auth/register', { email, password }),
  login: (email, password) => 
    api.post('/api/auth/login', { email, password }),
  logout: () => 
    api.post('/api/auth/logout'),
  me: () => 
    api.get('/api/auth/me'),
};

// User Service
export const profileAPI = {
  getProfile: () => api.get('/api/profile'),
  submitQuiz: (answers) => api.post('/api/profile/quiz', { answers }),
  getSuggestions: () => api.get('/api/profile/suggestions'),
  updateProfile: (data) => api.patch('/api/profile', data),
};

// Group Service
export const groupsAPI = {
  getMyGroups: () => api.get('/api/groups/my-groups'), // Groups user is a member of
  browseGroups: () => api.get('/api/groups/browse'), // All available groups
  getById: (id) => api.get(`/api/groups/${id}`),
  create: (data) => api.post('/api/groups', data),
  update: (id, data) => api.patch(`/api/groups/${id}`, data),
  delete: (id) => api.delete(`/api/groups/${id}`),
  join: (id) => api.post(`/api/groups/${id}/join`),
  leave: (id) => api.post(`/api/groups/${id}/leave`),
  getChannels: (id) => api.get(`/api/groups/${id}/channels`),
  createChannel: (id, data) => api.post(`/api/groups/${id}/channels`, data),
};

// Chat Service
export const chatAPIs = {
  getMessages: (channelId, params) => 
    api.get(`/api/channels/${channelId}/messages`, { params }),
  getEvents: (channelId) => 
    api.get(`/api/channels/${channelId}/events`),
  createEvent: (channelId, data) => 
    api.post(`/api/channels/${channelId}/events`, data),
  updateEvent: (id, data) => 
    api.patch(`/api/events/${id}`, data),
  deleteEvent: (id) => 
    api.delete(`/api/events/${id}`),
  getResources: (channelId) => 
    api.get(`/api/channels/${channelId}/resources`),
  uploadResource: (channelId, formData) => 
    api.post(`/api/channels/${channelId}/resources`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  summarizeResource: (id, content) => 
    api.post(`/api/resources/${id}/summarize`, { content }),
  deleteResource: (id) => 
    api.delete(`/api/resources/${id}`),
};

export default api;

