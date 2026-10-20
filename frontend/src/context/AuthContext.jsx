import React, { createContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(storage.getUser());
  const [token, setToken] = useState(storage.getToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = storage.getToken();
      if (storedToken) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
          storage.setUser(userData);
        } catch (error) {
          console.error('Failed to restore auth session:', error);
          storage.clear();
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const data = await authService.login(credentials);
      // Expected response payload: { token, user }
      const authToken = data.token;
      const userInfo = data.user;

      storage.setToken(authToken);
      storage.setUser(userInfo);
      setToken(authToken);
      setUser(userInfo);
      return userInfo;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const data = await authService.register(userData);
      const authToken = data.token;
      const userInfo = data.user;

      storage.setToken(authToken);
      storage.setUser(userInfo);
      setToken(authToken);
      setUser(userInfo);
      return userInfo;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    storage.clear();
    setUser(null);
    setToken(null);
    setLoading(false);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    role: user?.role || null,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
