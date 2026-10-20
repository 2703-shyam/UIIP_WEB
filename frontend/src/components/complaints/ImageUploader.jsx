import React from 'react';
import { Upload, X } from 'lucide-react';

export const ImageUploader = ({ images = [], onUpload, onRemove, maxFiles = 4 }) => {
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > maxFiles) {
      alert(`Maximum ${maxFiles} images allowed.`);
      return;
    }
    onUpload(files);
  };

  return (
    <div className="image-uploader">
      <label className="uploader-box">
        <Upload size={32} className="upload-icon" />
        <span className="upload-text">Click or drag images to upload</span>
        <span className="upload-subtext">JPEG, PNG up to 5MB (max {maxFiles} files)</span>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          disabled={images.length >= maxFiles}
          className="hidden-file-input"
        />
      </label>
    </div>
  );
};
