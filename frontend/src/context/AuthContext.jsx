import React, { createContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../utils/storage';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const authGeneration = useRef(0);
  const [user, setUser] = useState(storage.getUser());
  const [token, setToken] = useState(storage.getToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      storage.clearLegacyPersistentSession();
      const generation = authGeneration.current;
      const storedToken = storage.getToken();
      if (storedToken) {
        try {
          const userData = await authService.getCurrentUser();
          if (generation !== authGeneration.current) return;
          setUser(userData);
          storage.setUser(userData);
        } catch (error) {
          if (generation !== authGeneration.current) return;
          console.error('Failed to restore auth session:', error);
          storage.clear();
          setUser(null);
          setToken(null);
        }
      }
      if (generation === authGeneration.current) setLoading(false);
    };

    initAuth();
  }, [navigate]);

  useEffect(() => {
    const syncRestoredPage = async (event) => {
      if (!event.persisted) return;

      // Back to the sign-in page ends this tab's session. Protected pages
      // restored by Forward will then be stopped by ProtectedRoute.
      if (window.location.pathname === '/login') {
        authGeneration.current += 1;
        storage.clear();
        setUser(null);
        setToken(null);
        setLoading(false);
        return;
      }

      const storedToken = storage.getToken();
      const generation = ++authGeneration.current;

      // A browser may restore a page from its back/forward cache with stale
      // React state. Trust the current tab storage, not the cached UI state.
      if (!storedToken) {
        setUser(null);
        setToken(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const userData = await authService.getCurrentUser();
        if (generation !== authGeneration.current) return;
        setUser(userData);
        setToken(storedToken);
        storage.setUser(userData);
      } catch (error) {
        if (generation !== authGeneration.current) return;
        storage.clear();
        setUser(null);
        setToken(null);
        navigate('/login', { replace: true, state: { reauthenticationRequired: true } });
      } finally {
        if (generation === authGeneration.current) setLoading(false);
      }
    };

    window.addEventListener('pageshow', syncRestoredPage);
    return () => window.removeEventListener('pageshow', syncRestoredPage);
  }, [navigate]);

  useEffect(() => {
    const endSessionOnLoginHistoryEntry = () => {
      if (window.location.pathname !== '/login' || !storage.getToken()) return;

      authGeneration.current += 1;
      storage.clear();
      setUser(null);
      setToken(null);
      setLoading(false);
    };

    window.addEventListener('popstate', endSessionOnLoginHistoryEntry);
    return () => window.removeEventListener('popstate', endSessionOnLoginHistoryEntry);
  }, []);

  useEffect(() => {
    const expireSession = () => {
      if (!storage.getToken()) return;
      authGeneration.current += 1;
      storage.clear();
      setUser(null);
      setToken(null);
      setLoading(false);
      navigate('/login', { replace: true, state: { reauthenticationRequired: true } });
    };

    window.addEventListener('uiip:auth-expired', expireSession);
    return () => window.removeEventListener('uiip:auth-expired', expireSession);
  }, [navigate]);

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
    authGeneration.current += 1;
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
