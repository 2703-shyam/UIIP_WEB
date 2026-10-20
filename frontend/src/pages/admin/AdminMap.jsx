import React, { useEffect, useState } from 'react';
import { complaintService } from '../../services/complaintService';
import { ComplaintMap } from '../../components/maps/ComplaintMap';
import { Loading } from '../../components/common/Loading';
import { ErrorState } from '../../components/common/ErrorState';

export const AdminMap = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMapData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await complaintService.getAllComplaints();
      setComplaints(data || []);
    } catch (err) {
      setError('Failed to fetch GIS map coordinates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapData();
  }, []);

  if (loading) return <Loading message="Loading GIS Map..." />;
  if (error) return <ErrorState message={error} onRetry={fetchMapData} />;

  return (
    <div className="page-container">
      <h1 className="page-title">Citywide Infrastructure GIS Map</h1>
      <p className="page-subtitle">Visualize live complaint distribution, priority markers, and resolution status across city wards.</p>

      <div className="card map-card">
        <ComplaintMap complaints={complaints} />
      </div>
    </div>
  );
};
