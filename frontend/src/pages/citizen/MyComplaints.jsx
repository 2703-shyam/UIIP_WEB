import React, { useEffect, useState } from 'react';
import { complaintService } from '../../services/complaintService';
import { ComplaintCard } from '../../components/complaints/ComplaintCard';
import { Loading } from '../../components/common/Loading';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { COMPLAINT_STATUS } from '../../constants/status';

export const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await complaintService.getMyComplaints();
      setComplaints(data || []);
    } catch (err) {
      setError('Failed to fetch your complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      (c.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? c.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <Loading message="Loading complaints history..." />;
  if (error) return <ErrorState message={error} onRetry={fetchComplaints} />;

  return (
    <div className="page-container">
      <h1 className="page-title">My Reported Complaints</h1>
      <p className="page-subtitle">Track status, timeline updates, and progress for all your reports.</p>

      <div className="filter-bar">
        <Input
          placeholder="Search by keyword..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          placeholder="All Statuses"
          options={Object.values(COMPLAINT_STATUS)}
          className="filter-select"
        />
      </div>

      {filteredComplaints.length === 0 ? (
        <EmptyState
          title="No complaints match your criteria"
          message="Try adjusting filters or submit a new report."
        />
      ) : (
        <div className="cards-grid">
          {filteredComplaints.map((complaint) => (
            <ComplaintCard
              key={complaint._id || complaint.id}
              complaint={complaint}
              linkPrefix="/citizen/complaints"
            />
          ))}
        </div>
      )}
    </div>
  );
};
