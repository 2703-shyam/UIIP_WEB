import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, Shield } from 'lucide-react';

export const Navbar = () => {
  const { user, role, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const homePath = {
    admin: '/admin/dashboard',
    engineer: '/engineer/dashboard',
    citizen: '/citizen/dashboard'
  }[role] || '/';

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <Link to={isAuthenticated ? homePath : '/'} className="logo-link">
          <div className="logo-badge">
            <Shield size={28} />
          </div>
          <span className="logo-text">
            UIIP <span>Portal</span>
          </span>
        </Link>
      </div>

      <nav className="navbar-actions" aria-label="Account navigation">
        {isAuthenticated ? (
          <div className="user-menu">
            <div className="user-avatar">{getInitials(user?.name || user?.email)}</div>
            <div className="user-name">
              <span>{user?.name || user?.email}</span>
            </div>
            <span className="user-role-tag">{user?.role}</span>
            <button onClick={handleLogout} className="btn-logout" title="Logout account">
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <div className="auth-links">
            <Link to="/login" className="btn btn-outline btn-sm">
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Register
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};
