import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { StatCard } from '../../components/dashboard/StatCard';
import { ComplaintCard } from '../../components/complaints/ComplaintCard';
import { Loading } from '../../components/common/Loading';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { CheckSquare, Clock, Wrench, CheckCircle } from 'lucide-react';

export const EngineerDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAssignments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await complaintService.getAllComplaints();
      setComplaints(data || []);
    } catch (err) {
      setError('Failed to fetch assigned tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  if (loading) return <Loading message="Loading engineer dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={fetchAssignments} />;

  const assigned = complaints.filter((c) => c.status === 'Assigned');
  const inProgress = complaints.filter((c) => c.status === 'In Progress');
  const resolved = complaints.filter((c) => c.status === 'Resolved');

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Engineer Workspace</h1>
          <p className="page-subtitle">Manage assigned field repair work orders and update task progress.</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard title="Assigned Tasks" value={assigned.length} icon={Clock} color="warning" />
        <StatCard title="In Progress" value={inProgress.length} icon={Wrench} color="primary" />
        <StatCard title="Resolved Tasks" value={resolved.length} icon={CheckCircle} color="success" />
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h3>Current Active Tasks</h3>
          <Link to="/engineer/complaints" className="view-all-link">
            View All Assigned
          </Link>
        </div>

        {[...assigned, ...inProgress].length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="No active tasks assigned"
            message="You currently have no pending work orders."
          />
        ) : (
          <div className="cards-grid">
            {[...assigned, ...inProgress].slice(0, 4).map((c) => (
              <ComplaintCard
                key={c._id || c.id}
                complaint={c}
                linkPrefix="/engineer/complaints"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
