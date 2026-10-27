import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // No token to check anymore — just ask the backend. If the
    // httpOnly cookie is valid (or gets refreshed via the 401 flow
    // in api.js), this succeeds; otherwise it throws and we treat
    // the user as logged out.
    authAPI.getProfile()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));

    // api.js dispatches this when a refresh fails (session truly
    // expired) — keep local state in sync when that happens.
    const onExpired = () => setUser(null);
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, []);

  const login = async (email, password) => {
    const data = await authAPI.login(email, password);

    if (!data) throw new Error('No response from server. Please try again.');
    // Tokens are set as cookies by the backend now, not in the body,
    // so there's nothing to check/store here — just fetch the profile.

    const profile = await authAPI.getProfile();
    setUser(profile);
    return profile;
  };

  const register = async (formData) => {
    const data = await authAPI.register(formData);

    if (!data) throw new Error('No response from server. Please try again.');

    const profile = await authAPI.getProfile();
    setUser(profile);
    return profile;
  };

  const logout = async () => {
    try {
      await authAPI.logout(); // backend clears cookies + blacklists refresh token
    } finally {
      setUser(null);
      window.location.href = '/';
    }
  };

  const updateUser = (data) => setUser(prev => ({ ...prev, ...data }));

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);