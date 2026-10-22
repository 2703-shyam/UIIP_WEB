import React from 'react';
import { CircleAlert } from 'lucide-react';

export const Select = ({
  label,
  id,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  error = '',
  required = false,
  disabled = false,
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
      <select
        id={id || name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`form-select ${error ? 'is-invalid' : ''}`}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id || name}-error` : undefined}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const lbl = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={val} value={val}>
              {lbl}
            </option>
          );
        })}
      </select>
      {error && <p className="error-message" id={`${id || name}-error`}><CircleAlert size={14} aria-hidden="true" />{error}</p>}
    </div>
  );
};
