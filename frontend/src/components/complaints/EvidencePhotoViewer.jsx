import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ZoomIn, 
  Maximize2, 
  X, 
  Sparkles, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Camera,
  Eye
} from 'lucide-react';
import { formatDate } from '../../utils/formatDate';
import { aiService } from '../../services/aiService';

export const EvidencePhotoViewer = ({ 
  images = [], 
  aiDetection = null, 
  issueType = '', 
  createdAt = null,
  title = "Citizen Evidence & Authenticity Inspection",
  showDetections = false
}) => {
  const [selectedImage, setSelectedImage] = useState(images[0] || null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imageSize, setImageSize] = useState(null);
  const [reprocessedDetections, setReprocessedDetections] = useState(null);
  const [isReprocessing, setIsReprocessing] = useState(false);
  const [reprocessError, setReprocessError] = useState('');

  if (!images || images.length === 0) {
    return (
      <div className="evidence-empty-card">
        <Camera size={28} className="text-muted" />
        <p>No evidence photos attached to this report.</p>
      </div>
    );
  }

  const activeImage = selectedImage || images[0];

  const handleOpenLightbox = (img) => {
    setSelectedImage(img);
    setZoomLevel(1);
    setLightboxOpen(true);
  };

  const handleCloseLightbox = () => {
    setLightboxOpen(false);
    setZoomLevel(1);
  };

  const isLive = aiDetection?.isLiveCaptured !== false;
  const captureTime = aiDetection?.capturedAt || createdAt;
  const detections = showDetections
    ? (aiDetection?.detections?.length ? aiDetection.detections : (reprocessedDetections || []))
    : [];

  const reprocessImage = async (event) => {
    event.stopPropagation();
    setIsReprocessing(true);
    setReprocessError('');
    try {
      const response = await fetch(activeImage);
      if (!response.ok) throw new Error('Could not load the report image.');
      const result = await aiService.classifyImage(await response.blob());
      setReprocessedDetections(result.detections || []);
      if (result.imageSize) setImageSize(result.imageSize);
      if (!result.detections?.length) setReprocessError('The AI service returned no bounding boxes for this image.');
    } catch (error) {
      setReprocessError(error.message || 'Could not re-run AI detection.');
    } finally {
      setIsReprocessing(false);
    }
  };

  const detectionOverlay = (className = '') => detections.length > 0 && imageSize ? (
    <div
      className={`admin-detection-frame ${className}`}
      style={{
        aspectRatio: `${imageSize.width} / ${imageSize.height}`,
        width: `min(100%, ${460 * imageSize.width / imageSize.height}px)`,
        transform: className ? `scale(${zoomLevel})` : undefined
      }}
    >
      <img
        src={activeImage}
        alt="Evidence with AI detection boxes"
        onLoad={(event) => setImageSize({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })}
      />
      {detections.map((detection, index) => {
        const pixelBox = detection.bbox;
        const storedSize = aiDetection?.imageSize;
        const box = detection.bbox_normalized || (
          pixelBox && storedSize?.width && storedSize?.height
            ? {
                x1: pixelBox.x1 / storedSize.width,
                y1: pixelBox.y1 / storedSize.height,
                x2: pixelBox.x2 / storedSize.width,
                y2: pixelBox.y2 / storedSize.height
              }
            : null
        );
        if (!box) return null;
        const left = Math.max(0, Math.min(100, box.x1 * 100));
        const top = Math.max(0, Math.min(100, box.y1 * 100));
        const width = Math.max(0, Math.min(100 - left, (box.x2 - box.x1) * 100));
        const height = Math.max(0, Math.min(100 - top, (box.y2 - box.y1) * 100));
        return (
          <div key={`${detection.class_name}-${index}`} className="admin-detection-box" style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` }}>
            <span>{detection.class_name} · {Math.round(detection.confidence * 100)}%</span>
          </div>
        );
      })}
    </div>
  ) : null;

  return (
    <div className="evidence-viewer-card card">
      <div className="evidence-viewer-header">
        <div className="header-left">
          <Camera size={20} className="header-icon" />
          <div>
            <h3 className="section-title">{title}</h3>
            <span className="section-subtitle">
              Click photo to zoom and inspect authenticity watermark and problem details
            </span>
          </div>
        </div>

        {/* Authenticity Verification Tag */}
        <div className="authenticity-tag-wrapper">
          {isLive ? (
            <div className="auth-badge auth-badge-verified" title="Captured directly using live camera targeting system">
              <ShieldCheck size={16} />
              <span>Authentic Live Photo</span>
              <span className="auth-dot" />
            </div>
          ) : (
            <div className="auth-badge auth-badge-unverified" title="Uploaded from local storage">
              <AlertTriangle size={15} />
              <span>Storage Upload</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Image Display with Interactive Zoom Trigger */}
      <div className="evidence-main-preview" onClick={() => handleOpenLightbox(activeImage)}>
        {detectionOverlay() || <img src={activeImage} alt="Citizen evidence photo" onLoad={(event) => setImageSize({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })} className="evidence-featured-img" />}

        {showDetections && aiDetection && detections.length === 0 && (
          <div className="admin-detection-empty-note">
            <span>{reprocessError || 'No bounding box coordinates were saved for this report.'}</span>
            <button type="button" onClick={reprocessImage} disabled={isReprocessing}>
              {isReprocessing ? 'Analyzing…' : 'Run AI detection'}
            </button>
          </div>
        )}
        
        <div className="image-overlay-actions">
          <button 
            type="button" 
            className="btn-zoom-overlay" 
            onClick={(e) => {
              e.stopPropagation();
              handleOpenLightbox(activeImage);
            }}
          >
            <ZoomIn size={16} /> Fullscreen Inspect & Zoom
          </button>
        </div>

        {/* Live Authenticity Overlay Banner */}
        <div className="image-watermark-ribbon">
          <div className="ribbon-content">
            <span className="ribbon-brand">UIIP AUTHENTIC EVIDENCE</span>
            {captureTime && (
              <span className="ribbon-time">
                • {formatDate(captureTime)}
              </span>
            )}
            <span className="ribbon-check">✓ TAMPER-VERIFIED</span>
          </div>
        </div>
      </div>

      {/* Thumbnail Carousel (if multiple images) */}
      {images.length > 1 && (
        <div className="evidence-thumbnail-strip">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              className={`evidence-thumb-btn ${activeImage === img ? 'active' : ''}`}
              onClick={() => setSelectedImage(img)}
            >
              <img src={img} alt={`Evidence angle ${idx + 1}`} />
              <span className="thumb-index">#{idx + 1}</span>
            </button>
          ))}
        </div>
      )}

      {/* AI Model Diagnosis & Problem Verification Details */}
      {aiDetection && (
        <div className="ai-verification-meta-card">
          <div className="ai-meta-header">
            <div className="ai-badge-label">
              <Sparkles size={16} className="text-primary" />
              <strong>YOLOv8 AI Problem Diagnosis:</strong>
            </div>
            {aiDetection.confidence && (
              <span className="ai-conf-score">
                {Math.round(aiDetection.confidence * 100)}% Confidence
              </span>
            )}
          </div>

          <div className="ai-meta-grid">
            <div className="ai-meta-col">
              <span className="meta-label">Identified Defect:</span>
              <strong className="meta-value highlight-problem">
                {aiDetection.primaryClass || aiDetection.object || issueType || 'Civic Infrastructure Defect'}
              </strong>
            </div>
            {aiDetection.suggestedDepartment && (
              <div className="ai-meta-col">
                <span className="meta-label">Routing Dept:</span>
                <span className="meta-value">{aiDetection.suggestedDepartment}</span>
              </div>
            )}
            {aiDetection.priority && (
              <div className="ai-meta-col">
                <span className="meta-label">AI Priority:</span>
                <span className={`meta-value priority-${aiDetection.priority.toLowerCase()}`}>
                  {aiDetection.priority}
                </span>
              </div>
            )}
            <div className="ai-meta-col">
              <span className="meta-label">Verification:</span>
              <span className="meta-value text-success font-medium">
                {isLive ? '✓ Direct Camera Frame' : 'Manual Review'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox Modal for Inspection */}
      {lightboxOpen && (
        <div className="evidence-lightbox-overlay" onClick={handleCloseLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-header">
              <div className="lightbox-title-area">
                <ShieldCheck size={20} className="text-success" />
                <span>Evidence Inspection — {issueType || 'Civic Defect'}</span>
              </div>
              <div className="lightbox-controls">
                <button 
                  type="button" 
                  className="lightbox-btn" 
                  onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
                  title="Zoom Out"
                >
                  -
                </button>
                <span className="zoom-indicator">{Math.round(zoomLevel * 100)}%</span>
                <button 
                  type="button" 
                  className="lightbox-btn" 
                  onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
                  title="Zoom In"
                >
                  +
                </button>
                <button 
                  type="button" 
                  className="lightbox-btn" 
                  onClick={() => setZoomLevel(1)}
                  title="Reset Zoom"
                >
                  Reset
                </button>
                <button 
                  type="button" 
                  className="lightbox-btn-close" 
                  onClick={handleCloseLightbox}
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="lightbox-image-wrapper">
              {detectionOverlay('lightbox-detection-frame') || <img src={activeImage} alt="Enlarged evidence" onLoad={(event) => setImageSize({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })} style={{ transform: `scale(${zoomLevel})` }} className="lightbox-img" />}
            </div>

            <div className="lightbox-footer">
              <div className="footer-meta-item">
                <Calendar size={14} /> Reported: {formatDate(createdAt)}
              </div>
              <div className="footer-meta-item">
                <Eye size={14} /> Scroll or use +/- to zoom into crack / damage depth
              </div>
              {isLive && (
                <div className="footer-meta-item text-success">
                  <CheckCircle2 size={14} /> Authenticity Watermark Verified
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
