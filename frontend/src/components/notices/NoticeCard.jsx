import React from 'react';
import { formatDate } from '../../utils/formatDate';
import { Megaphone, Calendar, MapPin, AlertTriangle } from 'lucide-react';
import { getDepartmentLabel } from '../../constants/departmentLabels';

export const NoticeCard = ({ notice }) => {
  return (
    <div className="notice-card">
      <div className="notice-header">
        <span className="notice-type-badge">
          <Megaphone size={14} /> {notice.type || 'General Notice'}
        </span>
        <span className="notice-date">{formatDate(notice.createdAt)}</span>
      </div>

      <h3 className="notice-title">{notice.title}</h3>
      <p className="notice-description">{notice.description}</p>

      <div className="notice-details">
        {notice.department && (
          <div className="detail-item">
            <strong>Department:</strong> {getDepartmentLabel(notice.department)}
          </div>
        )}
        {notice.affectedArea && (
          <div className="detail-item">
            <MapPin size={14} /> <strong>Area:</strong> {notice.affectedArea}
          </div>
        )}
        {notice.startDate && notice.endDate && (
          <div className="detail-item">
            <Calendar size={14} /> <strong>Duration:</strong> {formatDate(notice.startDate)} - {formatDate(notice.endDate)}
          </div>
        )}
      </div>
    </div>
  );
};
