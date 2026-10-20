import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { Loading } from '../../components/common/Loading';
import { ErrorState } from '../../components/common/ErrorState';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ComplaintTimeline } from '../../components/complaints/ComplaintTimeline';
import { ImagePreview } from '../../components/complaints/ImagePreview';
import { formatDate } from '../../utils/formatDate';
import { ArrowLeft, MapPin, Calendar, User, Building } from 'lucide-react';

export const ComplaintDetails = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await complaintService.getComplaintById(id);
      setComplaint(data);
    } catch (err) {
      setError('Failed to fetch complaint details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  if (loading) return <Loading message="Loading complaint details..." />;
  if (error || !complaint) return <ErrorState message={error || 'Complaint not found'} onRetry={fetchDetails} />;

  return (
    <div className="page-container">
      <Link to="/citizen/complaints" className="back-link">
        <ArrowLeft size={16} /> Back to Complaints
      </Link>

      <div className="details-header">
        <div>
          <span className="details-id">Complaint #{complaint._id || complaint.id}</span>
          <h1 className="page-title">{complaint.title || complaint.issueType}</h1>
        </div>
        <div className="status-badges-row">
          <StatusBadge status={complaint.status} type="status" />
          {complaint.priority && <StatusBadge status={complaint.priority} type="priority" />}
        </div>
      </div>

      <div className="details-grid">
        <div className="details-main card">
          <h3>Issue Description</h3>
          <p className="description-text">{complaint.description}</p>

          {complaint.images && complaint.images.length > 0 && (
            <div className="evidence-section">
              <h4>Submitted Evidence Images</h4>
              <ImagePreview images={complaint.images} />
            </div>
          )}

          {complaint.resolutionDetails && (
            <div className="resolution-card">
              <h4>Resolution Details</h4>
              <p>{complaint.resolutionDetails}</p>
              {complaint.resolutionImages && (
                <ImagePreview images={complaint.resolutionImages} />
              )}
            </div>
          )}
        </div>

        <div className="details-sidebar card">
          <h3>Complaint Information</h3>
          <div className="info-list">
            <div className="info-item">
              <Calendar size={18} />
              <div>
                <strong>Reported On:</strong>
                <p>{formatDate(complaint.createdAt)}</p>
              </div>
            </div>

            {(complaint.location?.address || complaint.locationName) && (
              <div className="info-item">
                <MapPin size={18} />
                <div>
                  <strong>Location:</strong>
                  <p>{complaint.location?.address || complaint.locationName}</p>
                </div>
              </div>
            )}

            {complaint.department && (
              <div className="info-item">
                <Building size={18} />
                <div>
                  <strong>Department:</strong>
                  <p>{complaint.department}</p>
                </div>
              </div>
            )}

            {complaint.assignedEngineerId && (
              <div className="info-item">
                <User size={18} />
                <div>
                  <strong>Assigned Engineer:</strong>
                  <p>{complaint.assignedEngineerId.name || complaint.assignedEngineerId}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card timeline-section">
        <ComplaintTimeline history={complaint.history || []} currentStatus={complaint.status} />
      </div>
    </div>
  );
};
