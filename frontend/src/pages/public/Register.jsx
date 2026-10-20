import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { ROLES, ROLE_LABELS } from '../../constants/roles';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: ROLES.CITIZEN,
    department: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...payload } = formData;
      const user = await register(payload);
      addToast('Registration successful!', 'success');

      if (user.role === ROLES.ADMIN) {
        navigate('/admin/dashboard');
      } else if (user.role === ROLES.ENGINEER) {
        navigate('/engineer/dashboard');
      } else {
        navigate('/citizen/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Register to report issues or access official portals</p>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            required
          />

          <Input
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
            required
          />

          <Input
            label="Phone Number"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="9876543210"
          />

          <Select
            label="Account Role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            options={[
              { value: ROLES.CITIZEN, label: ROLE_LABELS[ROLES.CITIZEN] },
              { value: ROLES.ENGINEER, label: ROLE_LABELS[ROLES.ENGINEER] }
            ]}
            required
          />

          {formData.role === ROLES.ENGINEER && (
            <Select
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              options={[
                'Roads & Public Works',
                'Water Works & Sewage',
                'Electrical & Streetlighting',
                'Sanitation & Solid Waste',
                'Horticulture & Parks'
              ]}
              required
            />
          )}

          <div className="form-row">
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <Button type="submit" loading={loading} variant="primary" className="btn-block">
            Register
          </Button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
