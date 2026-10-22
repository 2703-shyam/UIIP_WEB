import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/common/Button';
import { ImageUploader } from '../../components/complaints/ImageUploader';
import { ImagePreview } from '../../components/complaints/ImagePreview';
import { 
  CheckCircle, 
  ArrowLeft, 
  Camera, 
  Upload, 
  FileCheck, 
  AlertCircle, 
  Building, 
  MapPin,
  ShieldCheck 
} from 'lucide-react';

export const ResolveComplaint = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [resolutionDetails, setResolutionDetails] = useState('');
  const [materialsUsed, setMaterialsUsed] = useState('');
  const [evidenceImages, setEvidenceImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRef = async () => {
      setFetching(true);
      try {
        const data = await complaintService.getComplaintById(id);
        setComplaint(data);
      } catch (err) {
        addToast('Failed to load complaint reference.', 'error');
      } finally {
        setFetching(false);
      }
    };
    fetchRef();
  }, [id]);

  const handleUpload = (files) => {
    setEvidenceImages((prev) => [...prev, ...files]);
  };

  const handleRemove = (index) => {
    setEvidenceImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Camera snapshot input handler
  const handleCameraSnap = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setEvidenceImages((prev) => [...prev, file]);
      addToast('Resolution proof photo captured from camera!', 'success');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resolutionDetails.trim()) {
      addToast('Please provide details on how the issue was resolved.', 'error');
      return;
    }

    if (evidenceImages.length === 0) {
      addToast('Please attach at least one resolution proof photo of the completed repair.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const fullDetails = materialsUsed 
        ? `${resolutionDetails}\n\n[Equipment / Materials Used: ${materialsUsed}]`
        : resolutionDetails;

      const formData = new FormData();
      formData.append('resolutionDetails', fullDetails);
      evidenceImages.forEach((img) => formData.append('resolutionImages', img));

      await complaintService.resolveComplaint(id, formData);
      addToast('Resolution report & completion photos successfully submitted!', 'success');
      navigate(`/engineer/complaints/${id}`);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit resolution report.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const citizenImg = complaint?.images && complaint.images.length > 0 ? complaint.images[0] : null;

  return (
    <div className="page-container">
      <button 
        type="button" 
        className="back-link btn-link" 
        onClick={() => navigate(-1)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <ArrowLeft size={16} /> Back to Work Order
      </button>

      <h1 className="page-title">Submit Field Resolution Report</h1>
      <p className="page-subtitle">
        Document repairs completed and upload photographic proof for Citizen and Municipal Admin verification.
      </p>

      {/* Reference Card: What the Citizen Reported */}
      {complaint && (
        <div className="card reference-complaint-card" style={{ marginBottom: '24px' }}>
          <div className="reference-card-header">
            <div>
              <span className="reference-badge">ORIGINAL CITIZEN REPORT</span>
              <h3 style={{ margin: '6px 0 2px 0' }}>{complaint.aiDetection?.primaryClass || 'Civic Infrastructure Defect'}</h3>
              {(complaint.location?.address || complaint.locationName) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.88rem' }}>
                  <MapPin size={14} /> {complaint.location?.address || complaint.locationName}
                </div>
              )}
            </div>
            {citizenImg && (
              <div className="reference-photo-thumb">
                <img src={citizenImg} alt="Citizen defect" />
                <span className="thumb-label">Original Photo</span>
              </div>
            )}
          </div>
          <p className="reference-description">
            "{complaint.description}"
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card form-container">
        <div className="form-group">
          <label className="form-label section-heading-label">
            <FileCheck size={18} className="text-primary" /> Technical Resolution Summary & Work Log *
          </label>
          <textarea
            rows={5}
            className="form-textarea"
            placeholder="Detailed report of work done: e.g. Patched 2x1.5m pothole with hot asphalt mix, compacted, cleared road debris, and reopened lane..."
            value={resolutionDetails}
            onChange={(e) => setResolutionDetails(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Materials, Machinery or Equipment Used (Optional)</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. 50kg bitumen, roller compactor, 4 sanitation crew members"
            value={materialsUsed}
            onChange={(e) => setMaterialsUsed(e.target.value)}
          />
        </div>

        {/* Resolution Evidence Upload & Live Camera */}
        <div className="form-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label className="form-label" style={{ margin: 0 }}>
              Completed Work Evidence Photos (Required for verification) *
            </label>
            <label className="btn btn-sm btn-outline-primary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Camera size={14} /> Snap Live Camera Proof
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                onChange={handleCameraSnap} 
                style={{ display: 'none' }} 
              />
            </label>
          </div>

          <ImageUploader images={evidenceImages} onUpload={handleUpload} maxFiles={4} />
          <ImagePreview images={evidenceImages} onRemove={handleRemove} />

          {evidenceImages.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontSize: '0.85rem', marginTop: '10px' }}>
              <ShieldCheck size={16} />
              <span>{evidenceImages.length} resolution proof photo(s) ready for Citizen & Admin review.</span>
            </div>
          )}
        </div>

        <div className="form-actions" style={{ marginTop: '24px' }}>
          <Button type="submit" variant="success" loading={loading} size="large">
            <CheckCircle size={18} /> Submit Official Resolution Report
          </Button>
          <Button variant="outline" onClick={() => navigate(-1)} disabled={loading}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};
