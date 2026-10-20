import React from 'react';
import { X } from 'lucide-react';

export const ImagePreview = ({ images = [], onRemove }) => {
  if (!images || images.length === 0) return null;

  return (
    <div className="image-preview-grid">
      {images.map((img, index) => {
        const src = typeof img === 'string' ? img : URL.createObjectURL(img);
        return (
          <div key={index} className="preview-item">
            <img src={src} alt={`Preview ${index + 1}`} className="preview-image" />
            {onRemove && (
              <button
                type="button"
                className="remove-btn"
                onClick={() => onRemove(index)}
                aria-label="Remove image"
              >
                <X size={14} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
