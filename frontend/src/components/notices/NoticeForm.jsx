import React, { useState } from 'react';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { NOTICE_TYPES } from '../../constants/status';
import { DEPARTMENTS } from '../../constants/departments';

export const NoticeForm = ({ onSubmit, loading = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: NOTICE_TYPES.GENERAL,
    department: '',
    affectedArea: '',
    startAt: '',
    endAt: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="notice-form">
      <Input
        label="Notice Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        required
        placeholder="e.g. Scheduled Water Maintenance in Ward 4"
      />

      <div className="form-row">
        <Select
          label="Notice Type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          options={Object.values(NOTICE_TYPES)}
          required
        />
        <Select
          label="Department"
          name="department"
          value={formData.department}
          onChange={handleChange}
          options={DEPARTMENTS}
          placeholder="Select a department"
        />
      </div>

      <Input
        label="Affected Area / Ward"
        name="affectedArea"
        value={formData.affectedArea}
        onChange={handleChange}
        placeholder="e.g. Sector 12, Ward 4"
      />

      <div className="form-row">
        <Input
          label="Start Date & Time"
          type="datetime-local"
          name="startAt"
          value={formData.startAt}
          onChange={handleChange}
        />
        <Input
          label="End Date & Time"
          type="datetime-local"
          name="endAt"
          value={formData.endAt}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Description / Notice Details *</label>
        <textarea
          name="description"
          rows={4}
          className="form-textarea"
          value={formData.description}
          onChange={handleChange}
          required
          placeholder="Provide complete details about the public notice..."
        />
      </div>

      <Button type="submit" loading={loading} variant="primary">
        Publish Notice
      </Button>
    </form>
  );
};
