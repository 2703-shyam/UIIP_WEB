import React, { useEffect, useState } from 'react';
import { complaintService } from '../../services/complaintService';
import { ComplaintCard } from '../../components/complaints/ComplaintCard';
import { Loading } from '../../components/common/Loading';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';

export const EngineerHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await complaintService.getAllComplaints();
      const resolved = (data || []).filter((c) => c.status === 'Resolved');
      setHistory(resolved);
    } catch (err) {
      setError('Failed to fetch completion history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading) return <Loading message="Loading work history..." />;
  if (error) return <ErrorState message={error} onRetry={fetchHistory} />;

  return (
    <div className="page-container">
      <h1 className="page-title">Completed Work History</h1>
      <p className="page-subtitle">Archive of all resolved infrastructure repairs.</p>

      {history.length === 0 ? (
        <EmptyState title="No historical records" message="You have not completed any complaints yet." />
      ) : (
        <div className="cards-grid">
          {history.map((c) => (
            <ComplaintCard key={c._id || c.id} complaint={c} linkPrefix="/engineer/complaints" />
          ))}
        </div>
      )}
    </div>
  );
};
