import React from 'react';
import { CircleAlert } from 'lucide-react';

export const Input = ({
  label,
  id,
  type = 'text',
  name,
  value,
  onChange,
  placeholder = '',
  error = '',
  required = false,
  disabled = false,
  helperText = '',
  className = '',
  ...props
}) => {
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={id || name} className="form-label">
          {label} {required && <span className="required-star">*</span>}
        </label>
      )}
      <input
        id={id || name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`form-input ${error ? 'is-invalid' : ''}`}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id || name}-error` : undefined}
        {...props}
      />
      {error && <p className="error-message" id={`${id || name}-error`}><CircleAlert size={14} aria-hidden="true" />{error}</p>}
      {helperText && !error && <p className="helper-text">{helperText}</p>}
    </div>
  );
};
