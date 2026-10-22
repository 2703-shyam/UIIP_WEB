import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { useToast } from '../../hooks/useToast';
import { Loading } from '../../components/common/Loading';
import { ErrorState } from '../../components/common/ErrorState';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { EvidencePhotoViewer } from '../../components/complaints/EvidencePhotoViewer';
import { ResolutionReportView } from '../../components/complaints/ResolutionReportView';
import { formatDate } from '../../utils/formatDate';
import { ArrowLeft, MapPin, Calendar, Wrench, CheckCircle } from 'lucide-react';

export const EngineerComplaintDetails = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  const { addToast } = useToast();
  const navigate = useNavigate();

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await complaintService.getComplaintById(id);
      setComplaint(data);
    } catch (err) {
      setError('Failed to load complaint assignment details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleStartProgress = async () => {
    setUpdating(true);
    try {
      await complaintService.updateStatus(id, 'In Progress');
      addToast('Task marked as In Progress', 'success');
      fetchDetails();
    } catch (err) {
      addToast('Failed to update status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Loading message="Loading work order..." />;
  if (error || !complaint) return <ErrorState message={error || 'Work order not found'} onRetry={fetchDetails} />;

  return (
    <div className="page-container">
      <Link to="/engineer/complaints" className="back-link">
        <ArrowLeft size={16} /> Back to Assigned Work
      </Link>

      <div className="details-header">
        <div>
          <span className="details-id">Task #{complaint._id || complaint.id}</span>
          <h1 className="page-title">{complaint.title || complaint.description || 'Work Order'}</h1>
        </div>
        <div className="status-badges-row">
          <StatusBadge status={complaint.status} type="status" />
          {complaint.priority && <StatusBadge status={complaint.priority} type="priority" />}
        </div>
      </div>

      <div className="details-grid">
        <div className="details-main">
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3>Issue Description & Work Order Scope</h3>
            <p className="description-text" style={{ fontSize: '1.05rem', lineHeight: 1.6 }}>
              {complaint.description}
            </p>
          </div>

          {/* Citizen Authentic Photo & Problem Identification */}
          <EvidencePhotoViewer
            images={complaint.images}
            aiDetection={complaint.aiDetection}
            createdAt={complaint.createdAt}
            title="Citizen Photo & Defect Identification"
          />

          {/* Action Panel for Active Tasks */}
          {complaint.status !== 'Resolved' && (
            <div className="engineer-action-panel card" style={{ marginTop: '20px', padding: '20px' }}>
              <h4>Field Engineering Actions</h4>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '12px' }}>
                {complaint.status === 'Assigned' && (
                  <Button
                    variant="primary"
                    onClick={handleStartProgress}
                    loading={updating}
                    icon={Wrench}
                  >
                    Mark Work as In Progress
                  </Button>
                )}

                {(complaint.status === 'In Progress' || complaint.status === 'Assigned') && (
                  <Button
                    variant="success"
                    onClick={() => navigate(`/engineer/complaints/${id}/resolve`)}
                    icon={CheckCircle}
                  >
                    Complete Work & Submit Resolution Report
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Resolution Report (if already completed) */}
          {complaint.status === 'Resolved' && (
            <div style={{ marginTop: '20px' }}>
              <ResolutionReportView complaint={complaint} />
            </div>
          )}
        </div>

        <div className="details-sidebar card">
          <h3>Task Details</h3>
          <div className="info-list">
            <div className="info-item">
              <Calendar size={18} />
              <div>
                <strong>Assigned Date:</strong>
                <p>{formatDate(complaint.createdAt)}</p>
              </div>
            </div>

            {(complaint.location?.address || complaint.locationName) && (
              <div className="info-item">
                <MapPin size={18} />
                <div>
                  <strong>Site Address:</strong>
                  <p>{complaint.location?.address || complaint.locationName}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
