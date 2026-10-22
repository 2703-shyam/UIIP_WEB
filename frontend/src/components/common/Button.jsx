import React from 'react';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  icon: Icon = null,
  ...props
}) => {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size === 'large' ? 'lg' : size}`;

  return (
    <button
      type={type}
      className={`${baseClass} ${variantClass} ${sizeClass} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <span className="button-spinner" aria-hidden="true" />
      ) : Icon ? <Icon className="btn-icon" size={18} aria-hidden="true" /> : null}
      <span>{children}</span>
    </button>
  );
};
