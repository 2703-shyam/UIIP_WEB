import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/common/Button';
import { ImageUploader } from '../../components/complaints/ImageUploader';
import { ImagePreview } from '../../components/complaints/ImagePreview';

export const ResolveComplaint = () => {
  const { id } = useParams();
  const [resolutionDetails, setResolutionDetails] = useState('');
  const [evidenceImages, setEvidenceImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleUpload = (files) => {
    setEvidenceImages((prev) => [...prev, ...files]);
  };

  const handleRemove = (index) => {
    setEvidenceImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resolutionDetails) {
      addToast('Please provide details on how the issue was resolved.', 'error');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('resolutionDetails', resolutionDetails);
      evidenceImages.forEach((img) => formData.append('resolutionImages', img));

      await complaintService.resolveComplaint(id, formData);
      addToast('Work order successfully marked as Resolved!', 'success');
      navigate(`/engineer/complaints/${id}`);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit resolution report.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Submit Resolution Evidence</h1>
      <p className="page-subtitle">Document repairs made and upload proof of work completion.</p>

      <form onSubmit={handleSubmit} className="card form-container">
        <div className="form-group">
          <label className="form-label">Resolution Summary & Technical Work Log *</label>
          <textarea
            rows={5}
            className="form-textarea"
            placeholder="Describe what repairs were executed, materials used, contractor notes..."
            value={resolutionDetails}
            onChange={(e) => setResolutionDetails(e.target.value)}
            required
          />
        </div>

        <div className="form-section">
          <label className="form-label">Upload Completed Work Evidence Photos</label>
          <ImageUploader images={evidenceImages} onUpload={handleUpload} maxFiles={4} />
          <ImagePreview images={evidenceImages} onRemove={handleRemove} />
        </div>

        <div className="form-actions">
          <Button type="submit" variant="success" loading={loading} size="large">
            Complete & Resolve Issue
          </Button>
          <Button variant="outline" onClick={() => navigate(-1)} disabled={loading}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};
