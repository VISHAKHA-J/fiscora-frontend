import api from './api.js';

// Both calls resolve to { token, username, email, role }.

export async function register({ username, email, password }) {
  const { data } = await api.post('/api/auth/register', { username, email, password });
  return data;
}

export async function login({ username, password }) {
  const { data } = await api.post('/api/auth/login', { username, password });
  return data;
}