import { api, TOKEN_KEY } from './http.js';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function isLoggedIn() {
  return !!getToken();
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function login(username, password) {
  const { data } = await api.post('/auth/login', { username, password });
  localStorage.setItem(TOKEN_KEY, data.token);
  return data;
}