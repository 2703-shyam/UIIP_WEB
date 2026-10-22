import React from 'react';

export const Chip = ({ icon: Icon, children, className = '', ...props }) => (
  <span className={`ui-chip ${className}`.trim()} {...props}>
    {Icon && <Icon className="ui-chip-icon" size={14} aria-hidden="true" />}
    <span>{children}</span>
  </span>
);
