import React, { useEffect, useState } from 'react';
import { complaintService } from '../../services/complaintService';
import { ComplaintCard } from '../../components/complaints/ComplaintCard';
import { Loading } from '../../components/common/Loading';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';

export const EngineerComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWorkOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await complaintService.getAllComplaints();
      // Active tasks: Assigned or In Progress
      const active = (data || []).filter((c) => c.status === 'Assigned' || c.status === 'In Progress');
      setComplaints(active);
    } catch (err) {
      setError('Failed to fetch assigned work orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  if (loading) return <Loading message="Loading work orders..." />;
  if (error) return <ErrorState message={error} onRetry={fetchWorkOrders} />;

  return (
    <div className="page-container">
      <h1 className="page-title">Assigned Field Complaints</h1>
      <p className="page-subtitle">Inspect complaint details, travel coordinates, and resolve issues.</p>

      {complaints.length === 0 ? (
        <EmptyState title="No pending assignments" message="You have completed all assigned issues." />
      ) : (
        <div className="cards-grid">
          {complaints.map((c) => (
            <ComplaintCard key={c._id || c.id} complaint={c} linkPrefix="/engineer/complaints" />
          ))}
        </div>
      )}
    </div>
  );
};
