import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { noticeService } from '../../services/noticeService';
import { StatCard } from '../../components/dashboard/StatCard';
import { ComplaintCard } from '../../components/complaints/ComplaintCard';
import { NoticeCard } from '../../components/notices/NoticeCard';
import { Loading } from '../../components/common/Loading';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { PlusCircle, FileText, CheckCircle, Clock, Megaphone } from 'lucide-react';

export const CitizenDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [compRes, noticeRes] = await Promise.allSettled([
        complaintService.getMyComplaints(),
        noticeService.getActiveNotices()
      ]);

      if (compRes.status === 'fulfilled') setComplaints(compRes.value || []);
      if (noticeRes.status === 'fulfilled') setNotices(noticeRes.value || []);
    } catch (err) {
      setError('Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) return <Loading message="Loading dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={loadDashboardData} />;

  const activeComplaints = complaints.filter((c) => c.status !== 'Resolved' && c.status !== 'Rejected');
  const resolvedComplaints = complaints.filter((c) => c.status === 'Resolved');

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Citizen Dashboard</h1>
          <p className="page-subtitle">Welcome! Monitor your submitted issues and civic notices.</p>
        </div>
        <Link to="/citizen/report-issue" className="btn btn-primary">
          <PlusCircle size={18} /> Report New Issue
        </Link>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Submitted"
          value={complaints.length}
          icon={FileText}
          color="primary"
        />
        <StatCard
          title="Active Issues"
          value={activeComplaints.length}
          icon={Clock}
          color="warning"
        />
        <StatCard
          title="Resolved Issues"
          value={resolvedComplaints.length}
          icon={CheckCircle}
          color="success"
        />
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-section">
          <div className="section-header">
            <h3>Recent Complaints</h3>
            <Link to="/citizen/complaints" className="view-all-link">
              View All
            </Link>
          </div>
          {complaints.length === 0 ? (
            <EmptyState
              title="No complaints submitted"
              message="You haven't reported any issues yet."
              action={
                <Link to="/citizen/report-issue" className="btn btn-primary btn-sm">
                  Report First Issue
                </Link>
              }
            />
          ) : (
            <div className="cards-grid">
              {complaints.slice(0, 3).map((c) => (
                <ComplaintCard key={c._id || c.id} complaint={c} linkPrefix="/citizen/complaints" />
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <h3>Active Public Notices</h3>
            <Link to="/citizen/notices" className="view-all-link">
              View All Notices
            </Link>
          </div>
          {notices.length === 0 ? (
            <EmptyState
              icon={Megaphone}
              title="No active notices"
              message="There are no public maintenance notices currently active."
            />
          ) : (
            <div className="notices-list">
              {notices.slice(0, 2).map((notice) => (
                <NoticeCard key={notice._id || notice.id} notice={notice} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
