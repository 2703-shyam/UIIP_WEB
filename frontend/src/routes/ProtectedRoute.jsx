import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loading } from '../components/common/Loading';

export const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading fullScreen message="Checking authentication..." />;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace state={{ reauthenticationRequired: true }} />;
};
