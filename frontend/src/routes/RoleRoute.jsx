import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loading } from '../components/common/Loading';
import { ROLES } from '../constants/roles';

export const RoleRoute = ({ allowedRoles = [] }) => {
  const { role, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <Loading fullScreen message="Verifying role access..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    // Redirect user to their appropriate default dashboard based on their role
    switch (role) {
      case ROLES.ADMIN:
        return <Navigate to="/admin/dashboard" replace />;
      case ROLES.ENGINEER:
        return <Navigate to="/engineer/dashboard" replace />;
      case ROLES.CITIZEN:
      default:
        return <Navigate to="/citizen/dashboard" replace />;
    }
  }

  return <Outlet />;
};
