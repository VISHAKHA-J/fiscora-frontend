import axios from 'axios';

export const AUTH_STORAGE_KEY = 'fiscora.auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});

// Attach the JWT to every request.
api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    const token = raw ? JSON.parse(raw).token : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Storage unavailable or corrupted: send the request without a token.
  }
  return config;
});

// An expired or invalid token on a protected call sends the user back to log in.
// Login and register failures are handled by their own pages, so they are skipped.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthCall = error.config?.url?.startsWith('/api/auth/');
    if (error.response?.status === 401 && !isAuthCall) {
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } catch {
        // ignore
      }
      window.location.assign('/login');
    }
    return Promise.reject(error);
  },
);

export default api;