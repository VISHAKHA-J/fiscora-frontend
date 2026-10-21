import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AUTH_STORAGE_KEY } from '../services/api.js';
import * as authService from '../services/authService.js';

const AuthContext = createContext(null);

function readStoredAuth() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  // { token, username, email, role } or null
  const [auth, setAuth] = useState(readStoredAuth);

  const saveAuth = useCallback((data) => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
    } catch {
      // The session still works for this tab if storage is unavailable.
    }
    setAuth(data);
  }, []);

  const login = useCallback(
    async (credentials) => {
      const data = await authService.login(credentials);
      saveAuth(data);
      return data;
    },
    [saveAuth],
  );

  const register = useCallback(
    async (details) => {
      const data = await authService.register(details);
      saveAuth(data);
      return data;
    },
    [saveAuth],
  );

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // ignore
    }
    setAuth(null);
  }, []);

  const value = useMemo(
    () => ({
      user: auth ? { username: auth.username, email: auth.email, role: auth.role } : null,
      token: auth?.token ?? null,
      isAuthenticated: Boolean(auth?.token),
      login,
      register,
      logout,
    }),
    [auth, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}