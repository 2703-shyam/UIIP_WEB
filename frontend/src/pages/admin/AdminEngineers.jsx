import React, { useCallback, useEffect, useState } from 'react';
import { Copy, UserPlus, Users, UserX, UserCheck } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Loading } from '../../components/common/Loading';
import { useToast } from '../../hooks/useToast';
import { userService } from '../../services/userService';
import { DEPARTMENTS } from '../../constants/departments';
import { getDepartmentLabel } from '../../constants/departmentLabels';
import { FeedbackBanner } from '../../components/common/FeedbackBanner';

const emptyForm = { name: '', email: '', phone: '', department: '', password: '' };

export const AdminEngineers = () => {
  const [engineers, setEngineers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');
  const [issuedCredentials, setIssuedCredentials] = useState(null);
  const { addToast } = useToast();

  const fetchEngineers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setEngineers(await userService.getEngineers(undefined, true));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load engineer accounts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEngineers(); }, [fetchEngineers]);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setCreating(true);
    setError('');
    try {
      const created = await userService.createEngineer(form);
      setEngineers((current) => [...current, created].sort((a, b) => a.name.localeCompare(b.name)));
      setIssuedCredentials({ name: created.name, email: created.email, password: form.password });
      setForm(emptyForm);
      addToast('Engineer account created. Share the credentials securely.', 'success');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create the engineer account.');
    } finally {
      setCreating(false);
    }
  };

  const toggleStatus = async (engineer) => {
    setUpdatingId(engineer._id);
    try {
      const updated = await userService.setEngineerActive(engineer._id, !engineer.isActive);
      setEngineers((current) => current.map((item) => item._id === updated._id ? updated : item));
      addToast(`Engineer account ${updated.isActive ? 'activated' : 'deactivated'}.`, 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Could not update engineer account.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const copyCredentials = async () => {
    const { email, password } = issuedCredentials;
    try {
      await navigator.clipboard.writeText(`Email: ${email}\nTemporary password: ${password}`);
      addToast('Credentials copied. Share them securely.', 'success');
    } catch {
      addToast('Clipboard access is unavailable. Copy the credentials from this panel.', 'error');
    }
  };

  const activeCount = engineers.filter((engineer) => engineer.isActive).length;

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Engineer Management</h1>
          <p className="page-subtitle">Create engineer logins, share their credentials, and manage account access.</p>
        </div>
        <span className="badge badge-primary">{activeCount} active · {engineers.length} total</span>
      </div>

      {error && <FeedbackBanner tone="danger">{error}</FeedbackBanner>}

      {issuedCredentials && (
        <section className="card" aria-live="polite">
          <div className="section-header">
            <div>
              <h2>Account created for {issuedCredentials.name}</h2>
              <p className="page-subtitle">Share these credentials with the engineer. The password is shown here only until you leave or refresh this page.</p>
            </div>
            <Button onClick={copyCredentials} variant="outline" icon={Copy}>Copy credentials</Button>
          </div>
          <div className="credential-details">
            <p><strong>Email:</strong> {issuedCredentials.email}</p>
            <p><strong>Temporary password:</strong> <code>{issuedCredentials.password}</code></p>
          </div>
          <Button className="btn-sm" variant="secondary" onClick={() => setIssuedCredentials(null)}>Close credentials</Button>
        </section>
      )}

      <section className="card">
        <h2 className="section-title-left"><UserPlus size={20} /> Add Engineer</h2>
        <p className="helper-text">Create an account with a temporary password of at least 8 characters, then share it with the engineer.</p>
        <form onSubmit={handleCreate} className="engineer-form">
          <div className="form-row">
            <Input label="Full name" name="name" value={form.name} onChange={handleChange} required />
            <Input label="Email address" type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <Input label="Phone number" type="tel" name="phone" value={form.phone} onChange={handleChange} />
            <div className="form-group">
              <label className="form-label" htmlFor="engineer-department">Department <span className="required-star">*</span></label>
              <select id="engineer-department" className="form-select" name="department" value={form.department} onChange={handleChange} required>
                <option value="">Select department</option>
                {DEPARTMENTS.map((department) => <option key={department} value={department}>{getDepartmentLabel(department)}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <Input label="Temporary password" type="password" name="password" value={form.password} onChange={handleChange} minLength={8} autoComplete="new-password" required helperText="At least 8 characters. Share this password securely." />
            <div className="form-group engineer-create-action">
              <Button type="submit" loading={creating} icon={UserPlus}>Create Engineer Account</Button>
            </div>
          </div>
        </form>
      </section>

      <section className="card">
        <h2 className="section-title-left"><Users size={20} /> Engineer Accounts</h2>
        {loading ? <Loading message="Loading engineer accounts..." /> : engineers.length === 0 ? (
          <p className="empty-list-message">No engineer accounts yet. Add an engineer using the form above.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead><tr><th>Name</th><th>Email</th><th>Department</th><th>Status</th><th>Access</th></tr></thead>
              <tbody>
                {engineers.map((engineer) => (
                  <tr key={engineer._id}>
                    <td>{engineer.name}</td>
                    <td>{engineer.email}</td>
                    <td>{getDepartmentLabel(engineer.department)}</td>
                    <td><span className={`badge ${engineer.isActive ? 'badge-success' : 'badge-secondary'}`}>{engineer.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <Button
                        variant={engineer.isActive ? 'outline' : 'success'}
                        size="sm"
                        loading={updatingId === engineer._id}
                        icon={engineer.isActive ? UserX : UserCheck}
                        onClick={() => toggleStatus(engineer)}
                      >{engineer.isActive ? 'Deactivate' : 'Activate'}</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
