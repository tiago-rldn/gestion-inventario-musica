import axios from 'axios';

const API_URL = 'http://localhost:8080/api';
export const TOKEN_KEY = 'auth_token';

export const api = axios.create({ baseURL: API_URL });

export async function loginRequest(username, password) {
  const { data } = await api.post('/auth/login', { username, password });
  return data.token;
}

// Request interceptor: agregar token si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: manejar 401 (token expirado/inválido)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      // Redirigir a login si no estamos ya ahí
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);