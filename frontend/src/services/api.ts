import axios from 'axios';

// Utilizar ID de sessão persistente no localStorage para visitantes
let sessionId = localStorage.getItem('aurum_session_id');
if (!sessionId) {
  sessionId = 'sess_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  localStorage.setItem('aurum_session_id', sessionId);
}

const host = typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1';
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || `http://${host}:8000/api`;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-session-id': sessionId
  }
});

// Interceptor para injetar JWT Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aurum_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export default api;
