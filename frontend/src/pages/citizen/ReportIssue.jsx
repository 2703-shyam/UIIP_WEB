import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { useToast } from '../../hooks/useToast';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { ImageUploader } from '../../components/complaints/ImageUploader';
import { ImagePreview } from '../../components/complaints/ImagePreview';
import { LocationPicker } from '../../components/maps/LocationPicker';

export const ReportIssue = () => {
  const [formData, setFormData] = useState({
    issueType: '',
    description: '',
    locationName: '',
    coordinates: null
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submittedId, setSubmittedId] = useState(null);

  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImagesUpload = (newFiles) => {
    setImages((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLocationSelect = (coords) => {
    setFormData((prev) => ({ ...prev, coordinates: coords }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description) {
      addToast('Please provide a description of the issue', 'error');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('issueType', formData.issueType || 'General Infrastructure');
      data.append('description', formData.description);
      data.append('locationName', formData.locationName);
      if (formData.coordinates) {
        data.append('latitude', formData.coordinates.lat);
        data.append('longitude', formData.coordinates.lng);
      }
      images.forEach((file) => data.append('images', file));

      const result = await complaintService.createComplaint(data);
      const newId = result.complaint?._id || result._id || result.id || 'SUBMITTED';

      setSubmittedId(newId);
      addToast('Complaint submitted successfully!', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit complaint.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (submittedId) {
    return (
      <div className="success-container">
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h2>Complaint Submitted Successfully!</h2>
          <p className="success-message">
            Your complaint has been registered with ID: <strong>#{submittedId}</strong>
          </p>
          <p className="success-subtext">
            Our municipal admin team will review and verify your report shortly.
          </p>
          <div className="success-actions">
            <Button variant="primary" onClick={() => navigate(`/citizen/complaints/${submittedId}`)}>
              View Complaint Status
            </Button>
            <Button variant="outline" onClick={() => navigate('/citizen/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page-container">
      <h1 className="page-title">Report an Infrastructure Issue</h1>
      <p className="page-subtitle">Provide details, photos, and location coordinates to report civic issues.</p>

      <form onSubmit={handleSubmit} className="report-form card">
        <Select
          label="Issue Category"
          name="issueType"
          value={formData.issueType}
          onChange={handleInputChange}
          options={[
            'Pothole / Road Damage',
            'Streetlight Failure',
            'Water Leakage / Drainage',
            'Garbage Accumulation',
            'Traffic Signal Failure',
            'Tree Fall / Pathway Obstruction',
            'Other'
          ]}
          required
        />

        <div className="form-group">
          <label className="form-label">Detailed Description *</label>
          <textarea
            name="description"
            rows={4}
            className="form-textarea"
            placeholder="Describe the issue, size, severity, landmarks..."
            value={formData.description}
            onChange={handleInputChange}
            required
          />
        </div>

        <Input
          label="Location Address / Nearby Landmark"
          name="locationName"
          value={formData.locationName}
          onChange={handleInputChange}
          placeholder="e.g. Near City Center Mall, Main St"
        />

        <div className="form-section">
          <label className="form-label">Pin GPS Location on Map</label>
          <LocationPicker value={formData.coordinates} onChange={handleLocationSelect} />
        </div>

        <div className="form-section">
          <label className="form-label">Upload Evidence Photos</label>
          <ImageUploader images={images} onUpload={handleImagesUpload} maxFiles={4} />
          <ImagePreview images={images} onRemove={handleRemoveImage} />
        </div>

        <div className="form-actions">
          <Button type="submit" loading={loading} variant="primary" size="large">
            Submit Complaint Report
          </Button>
        </div>
      </form>
    </div>
  );
};
