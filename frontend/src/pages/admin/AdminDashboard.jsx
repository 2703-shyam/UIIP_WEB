import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { userService } from '../../services/userService';
import { StatCard } from '../../components/dashboard/StatCard';
import { AnalyticsChart } from '../../components/dashboard/AnalyticsChart';
import { Loading } from '../../components/common/Loading';
import { ErrorState } from '../../components/common/ErrorState';
import { FileText, ShieldAlert, UserCheck, CheckCircle, MapPin } from 'lucide-react';

export const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [compData, analyticsData] = await Promise.allSettled([
        complaintService.getAllComplaints(),
        userService.getAnalyticsSummary()
      ]);

      if (compData.status === 'fulfilled') setComplaints(compData.value || []);
      if (analyticsData.status === 'fulfilled') setAnalytics(analyticsData.value);
    } catch (err) {
      setError('Failed to fetch administrator metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (loading) return <Loading message="Loading administration console..." />;
  if (error) return <ErrorState message={error} onRetry={fetchAdminData} />;

  const submitted = complaints.filter((c) => c.status === 'Submitted');
  const verified = complaints.filter((c) => c.status === 'Verified');
  const assigned = complaints.filter((c) => c.status === 'Assigned' || c.status === 'In Progress');
  const resolved = complaints.filter((c) => c.status === 'Resolved');

  const chartData = [
    { label: 'Submitted', value: submitted.length, color: '#0ea5e9' },
    { label: 'Verified', value: verified.length, color: '#8b5cf6' },
    { label: 'Assigned / In Progress', value: assigned.length, color: '#f59e0b' },
    { label: 'Resolved', value: resolved.length, color: '#10b981' }
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Municipal Operations Dashboard</h1>
          <p className="page-subtitle">Citywide infrastructure overview, verification queue, and resource allocation.</p>
        </div>
        <div className="admin-actions">
          <Link to="/admin/map" className="btn btn-outline">
            <MapPin size={18} /> View GIS Map
          </Link>
          <Link to="/admin/notices/create" className="btn btn-primary">
            Publish Public Notice
          </Link>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard title="Total Complaints" value={complaints.length} icon={FileText} color="primary" />
        <StatCard title="Pending Verification" value={submitted.length} icon={ShieldAlert} color="danger" />
        <StatCard title="Awaiting Assignment" value={verified.length} icon={UserCheck} color="warning" />
        <StatCard title="Resolved Issues" value={resolved.length} icon={CheckCircle} color="success" />
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <AnalyticsChart title="Complaint Lifecycle Distribution" data={chartData} />
        </div>

        <div className="dashboard-section card">
          <h3>Verification Queue ({submitted.length})</h3>
          <p className="section-subtitle">Newly submitted citizen reports needing classification</p>

          <div className="table-responsive" style={{ marginTop: '15px' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Category</th>
                  <th>Submitted Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {submitted.slice(0, 5).map((c) => {
                  const id = c._id || c.id;
                  return (
                    <tr key={id}>
                      <td>#{id.substring(0, 8)}</td>
                      <td>{c.issueType || 'Infrastructure'}</td>
                      <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Link to={`/admin/complaints/${id}/verify`} className="btn btn-sm btn-primary">
                          Verify
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {submitted.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center">
                      No complaints pending verification!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
