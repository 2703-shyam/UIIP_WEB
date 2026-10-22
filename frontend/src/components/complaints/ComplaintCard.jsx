import React from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../common/StatusBadge';
import { formatDate } from '../../utils/formatDate';
import { MapPin, Calendar, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const ComplaintCard = ({ complaint, linkPrefix = '/citizen/complaints' }) => {
  const id = complaint._id || complaint.id;
  const hasPhoto = complaint.images && complaint.images.length > 0;
  const photoSrc = hasPhoto ? complaint.images[0] : null;
  const isLive = complaint.aiDetection?.isLiveCaptured !== false;
  const isResolved = complaint.status === 'Resolved';

  return (
    <div className="complaint-card">
      {/* Top Evidence Photo Preview if Available */}
      {photoSrc && (
        <div className="complaint-card-image-box">
          <img src={photoSrc} alt="Reported issue" className="complaint-card-img" />
          <div className="card-img-badges">
            {isLive ? (
              <span className="card-auth-pill card-auth-live" title="Authentic Live Camera Capture">
                <ShieldCheck size={12} /> Live Capture
              </span>
            ) : (
              <span className="card-auth-pill card-auth-upload">
                Storage Upload
              </span>
            )}
            {isResolved && (
              <span className="card-auth-pill card-auth-resolved">
                <CheckCircle2 size={12} /> Resolved
              </span>
            )}
          </div>
        </div>
      )}

      <div className="card-header">
        <span className="complaint-id">#{id.substring(0, 8)}</span>
        <StatusBadge status={complaint.status} type="status" />
      </div>

      <div className="card-body">
        <h4 className="complaint-title">{complaint.title || complaint.description?.slice(0, 90) || 'Infrastructure Issue'}</h4>
        <p className="complaint-desc">{complaint.description}</p>

        <div className="card-meta">
          <div className="meta-item">
            <Calendar size={14} />
            <span>{formatDate(complaint.createdAt)}</span>
          </div>
          {(complaint.location?.address || complaint.locationName) && (
            <div className="meta-item">
              <MapPin size={14} />
              <span>{complaint.location?.address || complaint.locationName}</span>
            </div>
          )}
        </div>

        {complaint.priority && (
          <div className="card-tags">
            <StatusBadge status={complaint.priority} type="priority" />
          </div>
        )}
      </div>

      <div className="card-footer">
        <Link to={`${linkPrefix}/${id}`} className="btn btn-outline btn-sm btn-block">
          {isResolved ? 'View Resolution Report' : 'Inspect Defect Details'} <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};
