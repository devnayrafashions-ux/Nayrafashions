import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, getAccessToken, setTokens, clearTokens } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      authAPI.getProfile()
        .then(setUser)
        .catch(() => clearTokens())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await authAPI.login(email, password);

    // Guard: if data or tokens are missing, throw a readable error
    // instead of crashing with "Cannot read properties of null (reading 'access')"
    if (!data) throw new Error('No response from server. Please try again.');
    if (!data.access) throw new Error('Login failed: missing access token.');

    setTokens(data.access, data.refresh);
    const profile = await authAPI.getProfile();
    setUser(profile);
    return profile;
  };

  const register = async (formData) => {
    const data = await authAPI.register(formData);

    // Same guard for register
    if (!data) throw new Error('No response from server. Please try again.');
    if (!data.access) throw new Error('Registration failed: missing access token.');

    setTokens(data.access, data.refresh);
    const profile = await authAPI.getProfile();
    setUser(profile);
    return profile;
  };

  const logout = () => {
    clearTokens();
    setUser(null);
    window.location.href = '/';
  };

  const updateUser = (data) => setUser(prev => ({ ...prev, ...data }));

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);