import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/common/Button';
import { LiveCameraCapture } from '../../components/complaints/LiveCameraCapture';
import { ImagePreview } from '../../components/complaints/ImagePreview';
import { FeedbackBanner } from '../../components/common/FeedbackBanner';
import { haversineMeters } from '../../utils/geo';
import { RESOLUTION_MAX_ACCURACY_M, RESOLUTION_MAX_DISTANCE_M } from '../../constants/resolution';
import { CheckCircle, ArrowLeft, FileCheck, MapPin, ShieldCheck, Upload } from 'lucide-react';

export const ResolveComplaint = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [resolutionDetails, setResolutionDetails] = useState('');
  const [materialsUsed, setMaterialsUsed] = useState('');
  const [evidenceImages, setEvidenceImages] = useState([]);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const { addToast } = useToast();
  const navigate = useNavigate();
  const deviceInputRef = useRef(null);

  useEffect(() => {
    complaintService.getComplaintById(id).then(setComplaint).catch(() => addToast('Failed to load complaint reference.', 'error')).finally(() => setFetching(false));
  }, [id]);

  const handleCapture = (file, previewUrl, meta) => {
    const hasIssueGps = Number.isFinite(complaint?.location?.latitude) && Number.isFinite(complaint?.location?.longitude);
    const distanceFromIssueM = hasIssueGps ? haversineMeters(meta.lat, meta.lng, Number(complaint.location.latitude), Number(complaint.location.longitude)) : null;
    if (distanceFromIssueM !== null && distanceFromIssueM > RESOLUTION_MAX_DISTANCE_M) {
      setCameraError(`You're ~${Math.round(distanceFromIssueM)} m from the issue location. Move within ${RESOLUTION_MAX_DISTANCE_M} m and retake.`);
      URL.revokeObjectURL(previewUrl);
      return;
    }
    setEvidenceImages((prev) => [...prev, { file, previewUrl, source: 'live', meta: { lat: meta.lat, lng: meta.lng, accuracy: meta.accuracy, capturedAt: meta.capturedAt, source: 'live' }, distanceFromIssueM }]);
    setCameraError('');
    setCameraOpen(false);
  };

  const handleRemove = (index) => setEvidenceImages((prev) => {
    URL.revokeObjectURL(prev[index].previewUrl);
    return prev.filter((_, i) => i !== index);
  });

  const handleDeviceUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;
    if (files.some((file) => !file.type.startsWith('image/'))) {
      setCameraError('Choose image files only.');
      return;
    }
    if (evidenceImages.length + files.length > 4) {
      setCameraError('You can attach up to 4 resolution photos total.');
      return;
    }
    setUploading(true);
    setCameraError('');
    try {
      if (!navigator.geolocation) throw new Error('Location services are not supported by this browser.');
      const position = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true, timeout: 20000, maximumAge: 0
      }));
      const { latitude: lat, longitude: lng, accuracy } = position.coords;
      if (accuracy > RESOLUTION_MAX_ACCURACY_M) throw new Error(`Location accuracy is ${Math.round(accuracy)} m. Wait for a better GPS fix (within ${RESOLUTION_MAX_ACCURACY_M} m) and try again.`);
      const hasIssueGps = Number.isFinite(complaint?.location?.latitude) && Number.isFinite(complaint?.location?.longitude);
      const distanceFromIssueM = hasIssueGps ? haversineMeters(lat, lng, complaint.location.latitude, complaint.location.longitude) : null;
      if (distanceFromIssueM !== null && distanceFromIssueM > RESOLUTION_MAX_DISTANCE_M) throw new Error(`You're ~${Math.round(distanceFromIssueM)} m from the issue location. Move within ${RESOLUTION_MAX_DISTANCE_M} m to add these photos.`);
      const capturedAt = new Date().toISOString();
      const entries = files.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
        source: 'device',
        meta: { lat, lng, accuracy, capturedAt, source: 'device' },
        distanceFromIssueM
      }));
      setEvidenceImages((prev) => [...prev, ...entries]);
    } catch (error) {
      const locationErrors = {
        1: 'Location permission was denied. A photo without a location fix cannot be used.',
        2: 'Unable to acquire a location fix. Try again when GPS reception is better.',
        3: 'Location request timed out. Try again when GPS reception is better.'
      };
      setCameraError(locationErrors[error.code] || error.message || 'Could not get your location.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resolutionDetails.trim()) return addToast('Please provide details on how the issue was resolved.', 'error');
    if (!evidenceImages.length) return addToast('Capture at least one live resolution photo.', 'warning');
    setLoading(true);
    try {
      const fullDetails = materialsUsed ? `${resolutionDetails}\n\n[Equipment / Materials Used: ${materialsUsed}]` : resolutionDetails;
      const formData = new FormData();
      formData.append('resolutionDetails', fullDetails);
      evidenceImages.forEach(({ file }) => formData.append('resolutionImages', file));
      formData.append('captureMeta', JSON.stringify(evidenceImages.map(({ meta }) => meta)));
      await complaintService.resolveComplaint(id, formData);
      addToast('Resolution report & completion photos successfully submitted!', 'success');
      navigate(`/engineer/complaints/${id}`);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit resolution report.', 'error');
    } finally { setLoading(false); }
  };

  const citizenImg = complaint?.images?.[0];
  if (fetching) return <div className="page-container">Loading complaint…</div>;

  return <div className="page-container">
    <button type="button" className="back-link btn-link" onClick={() => navigate(`/engineer/complaints/${id}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><ArrowLeft size={16} /> Back to Work Order</button>
    <h1 className="page-title">Submit Field Resolution Report</h1>
    <p className="page-subtitle">Document repairs completed and add photographic proof at the complaint location.</p>
    {complaint && <div className="card reference-complaint-card" style={{ marginBottom: 24 }}><div className="reference-card-header"><div><span className="reference-badge">ORIGINAL CITIZEN REPORT</span><h3 style={{ margin: '6px 0 2px' }}>{complaint.aiDetection?.primaryClass || 'Civic Infrastructure Defect'}</h3>{(complaint.location?.address || complaint.locationName) && <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: '0.88rem' }}><MapPin size={14} />{complaint.location?.address || complaint.locationName}</div>}</div>{citizenImg && <div className="reference-photo-thumb"><img src={citizenImg} alt="Citizen defect" /><span className="thumb-label">Original Photo</span></div>}</div><p className="reference-description">"{complaint.description}"</p></div>}
    <form onSubmit={handleSubmit} className="card form-container">
      <div className="form-group"><label className="form-label section-heading-label"><FileCheck size={18} className="text-primary" /> Technical Resolution Summary & Work Log *</label><textarea rows={5} className="form-textarea" placeholder="Detailed report of work done..." value={resolutionDetails} onChange={(e) => setResolutionDetails(e.target.value)} required /></div>
      <div className="form-group"><label className="form-label">Materials, Machinery or Equipment Used (Optional)</label><input type="text" className="form-input" placeholder="e.g. bitumen, compactor, sanitation crew" value={materialsUsed} onChange={(e) => setMaterialsUsed(e.target.value)} /></div>
      <div className="form-section">
        <label className="form-label">Completed Work Evidence Photos (1–4 required) *</label>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 0 }}>Use the live camera or upload images from your device. Add photos within {RESOLUTION_MAX_DISTANCE_M} m of the issue location with GPS accuracy of {RESOLUTION_MAX_ACCURACY_M} m or better.</p>
        {cameraError && <FeedbackBanner tone="danger">{cameraError}</FeedbackBanner>}
        {evidenceImages.length < 4 && !cameraOpen && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button type="button" variant="outline" onClick={() => { setCameraError(''); setCameraOpen(true); }}><span>Open Live Camera</span></Button>
          <Button type="button" variant="outline" disabled={uploading} onClick={() => deviceInputRef.current?.click()}><Upload size={16} /><span>{uploading ? 'Checking location…' : 'Upload from Device'}</span></Button>
          <input ref={deviceInputRef} type="file" accept="image/*" multiple onChange={handleDeviceUpload} style={{ display: 'none' }} />
        </div>}
        {cameraOpen && <LiveCameraCapture onCapture={handleCapture} onClear={() => setCameraOpen(false)} capturedPhoto={null} allowNativeFallback={false} showAiPanel={false} captureLocation />}
        <ImagePreview images={evidenceImages.map((item) => item.previewUrl)} onRemove={handleRemove} />
        {evidenceImages.map((item, index) => <p key={index} style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Photo {index + 1} ({item.source === 'device' ? 'device upload' : 'live capture'}): {item.distanceFromIssueM === null ? 'Issue GPS unavailable; distance check skipped.' : `Added ${Math.round(item.distanceFromIssueM)} m from issue location.`}</p>)}
        {!!evidenceImages.length && <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#059669', fontSize: '0.85rem', marginTop: 10 }}><ShieldCheck size={16} /><span>{evidenceImages.length} live resolution proof photo(s) ready.</span></div>}
      </div>
      <div className="form-actions" style={{ marginTop: 24 }}><Button type="submit" variant="success" loading={loading} size="large"><CheckCircle size={18} /> Submit Official Resolution Report</Button><Button variant="outline" onClick={() => navigate(`/engineer/complaints/${id}`)} disabled={loading}>Cancel</Button></div>
    </form>
  </div>;
};
