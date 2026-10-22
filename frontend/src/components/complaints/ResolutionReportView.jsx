import React, { useState } from 'react';
import { 
  CheckCircle, 
  Wrench, 
  UserCheck, 
  Calendar, 
  Clock, 
  FileCheck, 
  ZoomIn, 
  X, 
  ArrowRight,
  ShieldCheck,
  Building
} from 'lucide-react';
import { formatDate } from '../../utils/formatDate';
import { DEPARTMENTS } from '../../constants/departments';
import { getDepartmentLabel } from '../../constants/departmentLabels';

export const ResolutionReportView = ({ complaint }) => {
  const [lightboxImg, setLightboxImg] = useState(null);
  const [lightboxTitle, setLightboxTitle] = useState('');

  if (!complaint || (complaint.status !== 'Resolved' && !complaint.resolutionDetails)) {
    return null;
  }

  const engineerName = complaint.assignedEngineerId?.name || 
                       (typeof complaint.assignedEngineerId === 'string' ? complaint.assignedEngineerId : 'Field Engineering Division');
  const engineerDept = complaint.assignedEngineerId?.department || complaint.department || DEPARTMENTS[0];
  const resolvedDate = complaint.resolvedAt || complaint.updatedAt;

  const citizenImg = complaint.images && complaint.images.length > 0 ? complaint.images[0] : null;
  const resolutionImages = complaint.resolutionImages || [];

  return (
    <div className="resolution-report-container card">
      {/* Header Banner */}
      <div className="resolution-report-header">
        <div className="report-badge-icon">
          <CheckCircle size={28} className="text-success" />
        </div>
        <div className="report-header-text">
          <div className="badge-resolved-pill">
            <ShieldCheck size={14} /> Official Resolution Report • Verified Complete
          </div>
          <h2 className="report-main-title">Issue Resolved & Repaired</h2>
          <p className="report-subtitle">
            Technical resolution report and field evidence submitted by the assigned engineer.
          </p>
        </div>
      </div>

      {/* Engineer & Audit Metadata Strip */}
      <div className="resolution-meta-strip">
        <div className="meta-strip-item">
          <UserCheck size={18} className="meta-icon" />
          <div>
            <span className="meta-strip-label">Resolved By Engineer:</span>
            <strong className="meta-strip-val">{engineerName}</strong>
          </div>
        </div>

        <div className="meta-strip-item">
          <Building size={18} className="meta-icon" />
          <div>
            <span className="meta-strip-label">Department:</span>
            <strong className="meta-strip-val">{getDepartmentLabel(engineerDept)}</strong>
          </div>
        </div>

        <div className="meta-strip-item">
          <Calendar size={18} className="meta-icon" />
          <div>
            <span className="meta-strip-label">Resolution Date:</span>
            <strong className="meta-strip-val">{formatDate(resolvedDate)}</strong>
          </div>
        </div>
      </div>

      {/* Resolution Work Log / Technical Summary */}
      <div className="resolution-details-block">
        <h4 className="block-title">
          <FileCheck size={18} className="text-primary" /> Technical Resolution Notes & Work Performed
        </h4>
        <div className="work-log-content">
          <p>{complaint.resolutionDetails || 'Repairs completed according to municipal infrastructure standards.'}</p>
        </div>
      </div>

      {/* Side-by-Side Before & After Visual Comparison */}
      <div className="before-after-section">
        <h4 className="block-title">
          <Wrench size={18} className="text-primary" /> Visual Inspection: Before vs. After
        </h4>
        
        <div className="before-after-grid">
          {/* Column 1: Citizen Original Evidence */}
          <div className="comparison-card before-card">
            <div className="comparison-header">
              <span className="comparison-tag tag-before">BEFORE • Citizen Report</span>
              <span className="comparison-date">{formatDate(complaint.createdAt)}</span>
            </div>
            <div className="comparison-image-wrapper">
              {citizenImg ? (
                <div 
                  className="comparison-img-box"
                  onClick={() => {
                    setLightboxImg(citizenImg);
                    setLightboxTitle('BEFORE: Citizen Evidence Photo');
                  }}
                >
                  <img src={citizenImg} alt="Before repairs" className="comparison-img" />
                  <div className="img-hover-overlay">
                    <ZoomIn size={18} /> Click to Enlarge
                  </div>
                </div>
              ) : (
                <div className="comparison-placeholder">
                  <span>No before photo available</span>
                </div>
              )}
            </div>
            <div className="comparison-caption">
              <strong>Detected issue:</strong> {complaint.aiDetection?.primaryClass || 'Reported Issue'}
            </div>
          </div>

          <div className="comparison-divider">
            <div className="arrow-circle">
              <ArrowRight size={20} />
            </div>
          </div>

          {/* Column 2: Engineer Resolution Proof */}
          <div className="comparison-card after-card">
            <div className="comparison-header">
              <span className="comparison-tag tag-after">AFTER • Engineer Resolution Proof</span>
              <span className="comparison-date">{formatDate(resolvedDate)}</span>
            </div>
            <div className="comparison-image-wrapper">
              {resolutionImages.length > 0 ? (
                <div className="resolution-images-gallery">
                  {resolutionImages.map((rImg, idx) => (
                    <div 
                      key={idx} 
                      className="comparison-img-box"
                      onClick={() => {
                        setLightboxImg(rImg);
                        setLightboxTitle(`AFTER: Resolution Proof #${idx + 1}`);
                      }}
                    >
                      <img src={rImg} alt={`After repairs ${idx + 1}`} className="comparison-img" />
                      <div className="img-hover-overlay">
                        <ZoomIn size={18} /> Click to Enlarge
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="comparison-placeholder">
                  <CheckCircle size={32} className="text-success" />
                  <span>Work verified on site by municipal department.</span>
                </div>
              )}
            </div>
            <div className="comparison-caption">
              <strong>Status:</strong> 100% Repaired & Reopened for Public Use
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox for Zooming Before or After Photos */}
      {lightboxImg && (
        <div className="evidence-lightbox-overlay" onClick={() => setLightboxImg(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-header">
              <div className="lightbox-title-area">
                <CheckCircle size={20} className="text-success" />
                <span>{lightboxTitle}</span>
              </div>
              <button 
                type="button" 
                className="lightbox-btn-close" 
                onClick={() => setLightboxImg(null)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="lightbox-image-wrapper">
              <img src={lightboxImg} alt="Enlarged inspection" className="lightbox-img" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
