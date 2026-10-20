import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { noticeService } from '../../services/noticeService';
import { useToast } from '../../hooks/useToast';
import { NoticeForm } from '../../components/notices/NoticeForm';

export const CreateNotice = () => {
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (noticeData) => {
    setLoading(true);
    try {
      await noticeService.createNotice(noticeData);
      addToast('Public notice published successfully!', 'success');
      navigate('/admin/notices');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to publish notice.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Publish New Public Notice</h1>
      <p className="page-subtitle">Broadcasting maintenance alerts, traffic diversions, or utility schedules.</p>

      <div className="card form-container">
        <NoticeForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
};
