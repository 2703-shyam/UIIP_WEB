import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { Loading } from '../../components/common/Loading';
import { ErrorState } from '../../components/common/ErrorState';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { COMPLAINT_STATUS } from '../../constants/status';

export const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await complaintService.getAllComplaints();
      setComplaints(data || []);
    } catch (err) {
      setError('Failed to fetch master complaints list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const filtered = complaints.filter((c) => {
    const matchesSearch =
      (c.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? c.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <Loading message="Loading complaints registry..." />;
  if (error) return <ErrorState message={error} onRetry={fetchComplaints} />;

  return (
    <div className="page-container">
      <h1 className="page-title">City Infrastructure Complaints Registry</h1>
      <p className="page-subtitle">Verify, assign engineers, and manage all municipal complaints.</p>

      <div className="filter-bar">
        <Input
          placeholder="Search by ID or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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

      <div className="card table-container">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Photo</th>
              <th>Description</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const id = c._id || c.id;
              const hasPhoto = c.images && c.images.length > 0;
              const photoSrc = hasPhoto ? c.images[0] : null;
              const isLive = c.aiDetection?.isLiveCaptured !== false;

              return (
                <tr key={id}>
                  <td>#{id.substring(0, 8)}</td>
                  <td>
                    {photoSrc ? (
                      <Link to={`/citizen/complaints/${id}`} className="table-thumb-link" title="Click to inspect photo">
                        <img src={photoSrc} alt="Defect" className="table-thumb-img" />
                        {isLive && <span className="table-thumb-badge" title="Authentic Live Camera Capture">✓</span>}
                      </Link>
                    ) : (
                      <span className="text-muted" style={{ fontSize: '0.8rem' }}>No photo</span>
                    )}
                  </td>
                  <td>{(c.description || 'No description provided').slice(0, 90)}</td>
                  <td>
                    <StatusBadge status={c.status} type="status" />
                    {c.status === 'Resolved' && (
                      <span style={{ display: 'block', fontSize: '0.72rem', color: '#059669', fontWeight: 600, marginTop: '2px' }}>
                        ✓ Report Ready
                      </span>
                    )}
                  </td>
                  <td>
                    {c.priority ? <StatusBadge status={c.priority} type="priority" /> : 'Unassigned'}
                  </td>
                  <td>{c.department || 'N/A'}</td>
                  <td className="actions-cell">
                    {c.status === 'Submitted' && (
                      <Link to={`/admin/complaints/${id}/verify`} className="btn btn-sm btn-primary">
                        Verify
                      </Link>
                    )}
                    {c.status === 'Verified' && (
                      <Link to={`/admin/complaints/${id}/verify`} className="btn btn-sm btn-warning">
                        Assign Engineer
                      </Link>
                    )}
                    <Link to={`/citizen/complaints/${id}`} className="btn btn-sm btn-outline">
                      {c.status === 'Resolved' ? 'View Report' : 'Inspect'}
                    </Link>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center">
                  No complaints match your query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
