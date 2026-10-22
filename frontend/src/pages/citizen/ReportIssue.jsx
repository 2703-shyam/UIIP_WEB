import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, Search, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { complaintService } from '../../services/complaintService';
import { useToast } from '../../hooks/useToast';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { LocationPicker } from '../../components/maps/LocationPicker';
import { LiveCameraCapture } from '../../components/complaints/LiveCameraCapture';
import { extractGpsFromImage } from '../../utils/exifGps';
import { searchPlaces } from '../../utils/geocoding';
import { aiService } from '../../services/aiService';

export const ReportIssue = () => {
  const [formData, setFormData] = useState({
    description: '',
    locationName: '',
    coordinates: null
  });

  // Live Camera & Authentic Evidence State
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [images, setImages] = useState([]);

  const [loading, setLoading] = useState(false);
  const [submittedId, setSubmittedId] = useState(null);
  const [photoGps, setPhotoGps] = useState(null);

  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Triggered when citizen snaps authentic photo with live camera
  const handlePhotoCaptured = async (file, previewUrl, meta) => {
    setCapturedPhoto({ file, previewUrl, ...meta });
    setImages([file]);
    setIsAnalyzingAi(true);

    // Also inspect if image contains EXIF GPS
    try {
      const gps = await extractGpsFromImage(file);
      if (gps) {
        setPhotoGps(gps);
        if (!formData.coordinates) {
          setFormData((prev) => ({
            ...prev,
            coordinates: { lat: gps.lat, lng: gps.lng, accuracy: 5 }
          }));
        }
      }
    } catch (err) {
      console.warn('EXIF inspection:', err);
    }

    // Call ai-service (YOLOv8 model running on http://localhost:8000)
    try {
      const result = await aiService.classifyImage(file);
      setAiResult(result);

      if (result.primaryClass && !result.needsManualReview) {
        addToast(
          `🤖 AI detected ${result.primaryClass} (${Math.round((result.confidence || 0) * 100)}% confidence).`,
          'success'
        );
      } else {
        addToast('No qualifying issue was detected. Add a description and submit your report.', 'info');
      }
    } catch (err) {
      console.warn('AI classification failed:', err);
      addToast(
        'AI service offline or model loading (http://localhost:8000). You can still describe and submit the issue.',
        'warning'
      );
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  const handleClearPhoto = () => {
    setCapturedPhoto(null);
    setImages([]);
    setAiResult(null);
  };

  const handleLocationSelect = (coords) => {
    setFormData((prev) => ({
      ...prev,
      coordinates: coords,
      locationName: prev.locationName ? prev.locationName : coords.address || prev.locationName
    }));
  };

  const handleAddressSelect = (address) => {
    setFormData((prev) => ({ ...prev, locationName: address }));
  };

  const handleFindAddressOnMap = async () => {
    if (!formData.locationName?.trim()) {
      addToast('Please type an address or landmark to locate.', 'warning');
      return;
    }
    try {
      const results = await searchPlaces(formData.locationName, { lat: 22.5586, lng: 72.9627 });
      if (results && results.length > 0) {
        const top = results[0];
        setFormData((prev) => ({
          ...prev,
          coordinates: { lat: top.lat, lng: top.lng, accuracy: 1 }
        }));
        addToast(`Found "${top.title}" on map!`, 'success');
      } else {
        addToast(`Could not find "${formData.locationName}". Search directly in the map search bar.`, 'warning');
      }
    } catch {
      addToast('Search failed. Please try the map search bar.', 'error');
    }
  };

  const handleApplyPhotoGps = () => {
    if (photoGps) {
      setFormData((prev) => ({
        ...prev,
        coordinates: { lat: photoGps.lat, lng: photoGps.lng, accuracy: 5 }
      }));
      addToast('Pin updated to photo GPS location!', 'success');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!capturedPhoto && images.length === 0) {
      addToast('Please capture an authentic live photo using the camera before submitting.', 'error');
      return;
    }

    if (!formData.description) {
      addToast('Please provide a description of the issue', 'error');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('description', formData.description);
      data.append('locationName', formData.locationName);
      if (formData.coordinates) {
        data.append('latitude', formData.coordinates.lat);
        data.append('longitude', formData.coordinates.lng);
      }

      // Attach AI Diagnosis & Authenticity metadata
      if (aiResult) {
        data.append(
          'aiDetection',
          JSON.stringify({
            primaryClass: aiResult.primaryClass,
            confidence: aiResult.confidence,
            detections: aiResult.detections,
            imageSize: aiResult.imageSize,
            thresholdUsed: aiResult.thresholdUsed,
            suggestedDepartment: aiResult.suggestedDepartment,
            priority: aiResult.priority,
            isLiveCaptured: true,
            capturedAt: capturedPhoto?.capturedAt || new Date().toISOString()
          })
        );
      }

      // Attach binary files
      const filesToUpload = images.length > 0 ? images : (capturedPhoto?.file ? [capturedPhoto.file] : []);
      filesToUpload.forEach((file) => data.append('images', file));

      // Also send base64 dataUrl as a bulletproof fallback
      if (capturedPhoto?.dataUrl) {
        data.append('imageBase64', capturedPhoto.dataUrl);
      }

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
            Your verified complaint has been registered with ID: <strong>#{submittedId}</strong>
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
      <p className="page-subtitle">
        Snap an authentic live photo for AI inspection, describe the issue, pin its location, and submit your report.
      </p>

      <form onSubmit={handleSubmit} className="report-form card">
        {/* Step 1: Live Camera Evidence & AI Diagnosis */}
        <div className="form-section">
          <label className="form-label section-heading-label">
            <ShieldCheck size={18} className="text-primary" /> Step 1: Live Camera Capture & AI Diagnosis *
          </label>
          <LiveCameraCapture
            onCapture={handlePhotoCaptured}
            onClear={handleClearPhoto}
            capturedPhoto={capturedPhoto}
            isAnalyzing={isAnalyzingAi}
            aiResult={aiResult}
          />
        </div>

        {/* Report details */}
        <div className="form-group">
          <label className="form-label">Detailed Description *</label>
          <textarea
            name="description"
            rows={3}
            className="form-textarea"
            placeholder="Describe the issue, landmarks, severity, or hazards..."
            value={formData.description}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Location Address & Map Pin */}
        <div className="address-search-row">
          <Input
            label="Location Address / Nearby Landmark"
            name="locationName"
            value={formData.locationName}
            onChange={handleInputChange}
            placeholder="e.g. Near Anand Railway Station, Amul Dairy Rd, Anand"
          />
          {formData.locationName && (
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={handleFindAddressOnMap}
              title="Search this address on map"
              style={{ marginBottom: '16px', height: '42px', whiteSpace: 'nowrap' }}
            >
              <Search size={14} /> Find on Map
            </button>
          )}
        </div>

        {photoGps && (
          <div className="photo-gps-banner">
            <div className="photo-gps-info">
              <Camera size={18} className="photo-gps-icon" />
              <div>
                <strong>Camera GPS Detected ({photoGps.fileName}):</strong>
                <span> Hardware coordinates {photoGps.lat.toFixed(6)}, {photoGps.lng.toFixed(6)} found in photo</span>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={handleApplyPhotoGps}
            >
              <MapPin size={14} /> Pin Photo Location
            </button>
          </div>
        )}

        <div className="form-section">
          <label className="form-label">Pin Exact Location on Map (Default: Anand, Gujarat)</label>
          <LocationPicker
            value={formData.coordinates}
            onChange={handleLocationSelect}
            onAddressSelect={handleAddressSelect}
          />
        </div>

        <div className="form-actions">
          <Button type="submit" loading={loading} variant="primary" size="large">
            Submit Verified Complaint
          </Button>
        </div>
      </form>
    </div>
  );
};
