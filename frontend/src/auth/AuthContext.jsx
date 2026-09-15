/**
 * Authentication context.
 *
 * Holds the current user, exposes login/register/logout/profile actions, and
 * rehydrates the session from localStorage on first mount so a page refresh
 * keeps the user signed in.
 */

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { api } from '../api';
import { getCurrentUser, getToken, saveSession, clearSession, updateStoredUser } from './session';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getCurrentUser());
  const [initialising, setInitialising] = useState(true);

  useEffect(() => {
    // Rehydrate: if a token exists, trust the stored user snapshot.
    const token = getToken();
    if (token && getCurrentUser()) {
      setUser(getCurrentUser());
    } else {
      clearSession();
      setUser(null);
    }
    setInitialising(false);
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await api.auth.login(credentials);
    saveSession(res);
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(async (form) => {
    const res = await api.auth.register(form);
    saveSession(res);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(() => {
    api.auth.logout();
    clearSession();
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async (patch) => {
    const updated = await api.auth.updateProfile(patch);
    updateStoredUser(updated);
    setUser(updated);
    return updated;
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      role: user?.role || null,
      initialising,
      login,
      register,
      logout,
      refreshProfile,
    }),
    [user, initialising, login, register, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
