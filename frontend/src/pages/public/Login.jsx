import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ROLES } from '../../constants/roles';

export const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!credentials.email) {
      setErrors((prev) => ({ ...prev, email: 'Email is required' }));
      return;
    }
    if (!credentials.password) {
      setErrors((prev) => ({ ...prev, password: 'Password is required' }));
      return;
    }

    setLoading(true);
    try {
      const user = await login(credentials);
      addToast('Welcome back! Login successful.', 'success');
      
      // Navigate according to user role
      if (user.role === ROLES.ADMIN) {
        navigate('/admin/dashboard');
      } else if (user.role === ROLES.ENGINEER) {
        navigate('/engineer/dashboard');
      } else {
        navigate('/citizen/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Sign In to UIIP</h2>
        <p className="auth-subtitle">Enter your credentials to access your account</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <Input
            label="Email Address"
            type="email"
            name="email"
            value={credentials.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="e.g. user@domain.com"
            required
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="••••••••"
            required
          />

          <Button type="submit" loading={loading} variant="primary" className="btn-block">
            Sign In
          </Button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
