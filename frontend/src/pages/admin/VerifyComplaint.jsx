import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { userService } from '../../services/userService';
import { useToast } from '../../hooks/useToast';
import { Loading } from '../../components/common/Loading';
import { ErrorState } from '../../components/common/ErrorState';
import { Select } from '../../components/common/Select';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ImagePreview } from '../../components/complaints/ImagePreview';
import { EvidencePhotoViewer } from '../../components/complaints/EvidencePhotoViewer';
import { ResolutionReportView } from '../../components/complaints/ResolutionReportView';
import { PRIORITY_LEVELS, SEVERITY_LEVELS } from '../../constants/priority';
import { DEPARTMENTS, normalizeDepartment } from '../../constants/departments';
import { getDepartmentLabel } from '../../constants/departmentLabels';

export const VerifyComplaint = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    severity: SEVERITY_LEVELS.MODERATE,
    priority: PRIORITY_LEVELS.MEDIUM,
    department: DEPARTMENTS[0],
    engineerId: ''
  });

  const { addToast } = useToast();
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const compData = await complaintService.getComplaintById(id);
      setComplaint(compData);

      const suggestedDept = compData.department || compData.aiDetection?.suggestedDepartment;
      const resolvedDept = normalizeDepartment(suggestedDept) || DEPARTMENTS[0];
      const resolvedPriority = compData.priority || compData.aiDetection?.priority || PRIORITY_LEVELS.MEDIUM;

      setFormData((prev) => ({
        ...prev,
        department: resolvedDept,
        priority: resolvedPriority
      }));

      const engList = await userService.getEngineers(resolvedDept);
      setEngineers(engList || []);
    } catch (err) {
      setError('Failed to load complaint verification details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
      ...(name === 'department' ? { engineerId: '' } : {})
    }));

    if (name === 'department') {
      try {
        const matchingEngineers = await userService.getEngineers(value);
        setEngineers(matchingEngineers || []);
      } catch {
        setEngineers([]);
      }
    }
  };

  const handleVerifyAndAssign = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // 1. Verify complaint parameters
      await complaintService.verifyComplaint(id, {
        severity: formData.severity,
        priority: formData.priority,
        department: formData.department
      });

      // 2. Assign engineer if selected
      if (formData.engineerId) {
        await complaintService.assignEngineer(id, { engineerId: formData.engineerId });
      }

      addToast('Complaint verified and updated successfully!', 'success');
      navigate('/admin/complaints');
    } catch (err) {
      addToast(err.response?.data?.message || 'Verification failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading message="Loading complaint details..." />;
  if (error || !complaint) return <ErrorState message={error || 'Complaint not found'} onRetry={loadData} />;

  return (
    <div className="page-container">
      <h1 className="page-title">Verify & Categorize Complaint</h1>
      <p className="page-subtitle">Inspect citizen report, evaluate severity, set department & assign field engineer.</p>

      <div className="details-grid">
        <div className="details-main">
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3>Submitted Issue Description</h3>
            <p className="description-text" style={{ fontSize: '1.05rem', lineHeight: 1.6 }}>
              {complaint.description}
            </p>
          </div>

          {/* Interactive Evidence Photo & Authenticity Verification Viewer */}
          <EvidencePhotoViewer
            images={complaint.images}
            aiDetection={complaint.aiDetection}
            showDetections
            createdAt={complaint.createdAt}
            title="Citizen Submitted Photo & Authenticity Verification"
          />

          {/* If already resolved, show Engineer's Resolution Report */}
          {complaint.status === 'Resolved' && (
            <div style={{ marginTop: '20px' }}>
              <ResolutionReportView complaint={complaint} />
            </div>
          )}
        </div>

        <form onSubmit={handleVerifyAndAssign} className="details-sidebar card">
          <h3>Verification Settings</h3>

          <Select
            label="Severity Level"
            name="severity"
            value={formData.severity}
            onChange={handleChange}
            options={Object.values(SEVERITY_LEVELS)}
            required
          />

          <Select
            label="Priority Level"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            options={Object.values(PRIORITY_LEVELS)}
            required
          />

          <Select
            label="Responsible Department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            options={DEPARTMENTS.map((value) => ({ value, label: getDepartmentLabel(value) }))}
            required
          />

          <Select
            label="Assign Field Engineer"
            name="engineerId"
            value={formData.engineerId}
            onChange={handleChange}
            placeholder="Select available engineer..."
            options={engineers.map((eng) => ({
              value: eng._id || eng.id,
              label: `${eng.name} (${getDepartmentLabel(eng.department, 'Field')})`
            }))}
          />
          {engineers.length === 0 && (
            <p className="helper-text">
              No active engineers are assigned to {getDepartmentLabel(formData.department)}. Add or activate an engineer for this department in Engineer Management.
            </p>
          )}

          <Button type="submit" variant="primary" loading={submitting} className="btn-block" style={{ marginTop: '15px' }}>
            Confirm Verification & Assign
          </Button>
        </form>
      </div>
    </div>
  );
};
