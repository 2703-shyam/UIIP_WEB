import React from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../common/StatusBadge';
import { formatDate } from '../../utils/formatDate';
import { MapPin, Calendar, ArrowRight } from 'lucide-react';

export const ComplaintCard = ({ complaint, linkPrefix = '/citizen/complaints' }) => {
  const id = complaint._id || complaint.id;

  return (
    <div className="complaint-card">
      <div className="card-header">
        <span className="complaint-id">#{id.substring(0, 8)}</span>
        <StatusBadge status={complaint.status} type="status" />
      </div>

      <div className="card-body">
        <h4 className="complaint-title">{complaint.title || complaint.issueType || 'Infrastructure Issue'}</h4>
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
          View Details <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};
