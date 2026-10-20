import React, { useEffect, useState } from 'react';
import { noticeService } from '../../services/noticeService';
import { NoticeCard } from '../../components/notices/NoticeCard';
import { Loading } from '../../components/common/Loading';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';

export const CitizenNotices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotices = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await noticeService.getActiveNotices();
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

  if (loading) return <Loading message="Loading public notices..." />;
  if (error) return <ErrorState message={error} onRetry={fetchNotices} />;

  return (
    <div className="page-container">
      <h1 className="page-title">Public Maintenance & Service Notices</h1>
      <p className="page-subtitle">Stay informed about scheduled water cutoffs, road closures, and municipal work.</p>

      {notices.length === 0 ? (
        <EmptyState title="No active notices" message="There are currently no active public alerts." />
      ) : (
        <div className="notices-grid">
          {notices.map((n) => (
            <NoticeCard key={n._id || n.id} notice={n} />
          ))}
        </div>
      )}
    </div>
  );
};
