import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Rooms API
export const roomsAPI = {
  getAll: async (filters?: any) => {
    const response = await api.get('/rooms', { params: filters });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/rooms/${id}`);
    return response.data;
  },
  create: async (roomData: any) => {
    const response = await api.post('/rooms', roomData);
    return response.data;
  },
  update: async (id: string, roomData: any) => {
    const response = await api.put(`/rooms/${id}`, roomData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/rooms/${id}`);
    return response.data;
  },
};

// Events API
export const eventsAPI = {
  getAll: async (filters?: any) => {
    const response = await api.get('/events', { params: filters });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },
  create: async (eventData: any) => {
    const response = await api.post('/events', eventData);
    return response.data;
  },
  update: async (id: string, eventData: any) => {
    const response = await api.put(`/events/${id}`, eventData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },
};

// Bookings API
export const bookingsAPI = {
  getAll: async (filters?: any) => {
    const response = await api.get('/bookings', { params: filters });
    return response.data;
  },
  getMyBookings: async () => {
    const response = await api.get('/bookings/my-bookings');
    return response.data;
  },
  create: async (bookingData: any) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },
  updateStatus: async (id: string, status: string) => {
    const response = await api.patch(`/bookings/${id}/status`, { status });
    return response.data;
  },
  cancel: async (id: string) => {
    const response = await api.patch(`/bookings/${id}/cancel`);
    return response.data;
  },
};

export default api; 