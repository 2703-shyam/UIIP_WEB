import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { useAuth } from '../../hooks/useAuth';
import { Loading } from '../../components/common/Loading';
import { ErrorState } from '../../components/common/ErrorState';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ComplaintTimeline } from '../../components/complaints/ComplaintTimeline';
import { EvidencePhotoViewer } from '../../components/complaints/EvidencePhotoViewer';
import { ResolutionReportView } from '../../components/complaints/ResolutionReportView';
import { formatDate } from '../../utils/formatDate';
import { ArrowLeft, MapPin, Calendar, User, Building, ShieldCheck } from 'lucide-react';

export const ComplaintDetails = () => {
  const { id } = useParams();
  const { role } = useAuth();
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

  // Dynamic back link based on user role
  const backLink = role === 'admin' 
    ? '/admin/complaints' 
    : role === 'engineer' 
      ? '/engineer/complaints' 
      : '/citizen/complaints';
  const backLabel = role === 'admin' 
    ? 'Back to Admin Registry' 
    : role === 'engineer' 
      ? 'Back to Assigned Tasks' 
      : 'Back to My Complaints';

  return (
    <div className="page-container">
      <Link to={backLink} className="back-link">
        <ArrowLeft size={16} /> {backLabel}
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
        <div className="details-main">
          {/* Issue Description Card */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3>Reported Issue Description</h3>
            <p className="description-text" style={{ fontSize: '1.05rem', lineHeight: 1.6 }}>
              {complaint.description}
            </p>
          </div>

          {/* Citizen Evidence Photo & Authenticity Verification */}
          <EvidencePhotoViewer
            images={complaint.images}
            aiDetection={complaint.aiDetection}
            showDetections={role === 'admin'}
            issueType={complaint.issueType}
            createdAt={complaint.createdAt}
            title="Citizen Submitted Evidence Photo"
          />

          {/* Engineer's Resolution Report & Before/After Proof */}
          <div style={{ marginTop: '20px' }}>
            <ResolutionReportView complaint={complaint} />
          </div>
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
