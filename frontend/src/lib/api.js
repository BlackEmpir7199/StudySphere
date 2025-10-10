import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth Service (port 5001)
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

// User Service (port 5002)
const userServiceURL = import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:5002';
const userAPI = axios.create({
  baseURL: userServiceURL,
  withCredentials: true,
});

export const profileAPI = {
  getProfile: () => userAPI.get('/api/profile'),
  submitQuiz: (answers) => userAPI.post('/api/profile/quiz', { answers }),
  getSuggestions: () => userAPI.get('/api/profile/suggestions'),
  updateProfile: (data) => userAPI.patch('/api/profile', data),
};

// Group Service (port 5003)
const groupServiceURL = import.meta.env.VITE_GROUP_SERVICE_URL || 'http://localhost:5003';
const groupAPI = axios.create({
  baseURL: groupServiceURL,
  withCredentials: true,
});

export const groupsAPI = {
  getAll: () => groupAPI.get('/api/groups'),
  getById: (id) => groupAPI.get(`/api/groups/${id}`),
  create: (data) => groupAPI.post('/api/groups', data),
  update: (id, data) => groupAPI.patch(`/api/groups/${id}`, data),
  delete: (id) => groupAPI.delete(`/api/groups/${id}`),
  join: (id) => groupAPI.post(`/api/groups/${id}/join`),
  leave: (id) => groupAPI.post(`/api/groups/${id}/leave`),
  getChannels: (id) => groupAPI.get(`/api/groups/${id}/channels`),
  createChannel: (id, data) => groupAPI.post(`/api/groups/${id}/channels`, data),
};

// Chat Service (port 5004)
const chatServiceURL = import.meta.env.VITE_CHAT_SERVICE_URL || 'http://localhost:5004';
const chatAPI = axios.create({
  baseURL: chatServiceURL,
  withCredentials: true,
});

export const chatAPIs = {
  getMessages: (channelId, params) => 
    chatAPI.get(`/api/channels/${channelId}/messages`, { params }),
  getEvents: (channelId) => 
    chatAPI.get(`/api/channels/${channelId}/events`),
  createEvent: (channelId, data) => 
    chatAPI.post(`/api/channels/${channelId}/events`, data),
  updateEvent: (id, data) => 
    chatAPI.patch(`/api/events/${id}`, data),
  deleteEvent: (id) => 
    chatAPI.delete(`/api/events/${id}`),
  getResources: (channelId) => 
    chatAPI.get(`/api/channels/${channelId}/resources`),
  uploadResource: (channelId, formData) => 
    chatAPI.post(`/api/channels/${channelId}/resources`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  summarizeResource: (id, content) => 
    chatAPI.post(`/api/resources/${id}/summarize`, { content }),
  deleteResource: (id) => 
    chatAPI.delete(`/api/resources/${id}`),
};

export default api;

