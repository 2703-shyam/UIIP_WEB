import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { noticeService } from '../../services/noticeService';
import { NoticeCard } from '../../components/notices/NoticeCard';
import { Loading } from '../../components/common/Loading';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { PlusCircle, Megaphone } from 'lucide-react';

export const AdminNotices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotices = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await noticeService.getAllNotices();
      setNotices(data || []);
    } catch (err) {
      setError('Failed to fetch public notices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  if (loading) return <Loading message="Loading public notices management..." />;
  if (error) return <ErrorState message={error} onRetry={fetchNotices} />;

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Public Notices Management</h1>
          <p className="page-subtitle">Publish and manage public service alerts for citizens.</p>
        </div>
        <Link to="/admin/notices/create" className="btn btn-primary">
          <PlusCircle size={18} /> Publish New Notice
        </Link>
      </div>

      {notices.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No published notices"
          message="No active or archived notices found."
          action={
            <Link to="/admin/notices/create" className="btn btn-primary btn-sm">
              Create First Notice
            </Link>
          }
        />
      ) : (
        <div className="notices-grid">
          {notices.map((notice) => (
            <NoticeCard key={notice._id || notice.id} notice={notice} />
          ))}
        </div>
      )}
    </div>
  );
};
