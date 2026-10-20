import React from 'react';

export const StatCard = ({ title, value, icon: Icon, color = 'primary', description = '' }) => {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-icon-container">
        {Icon && <Icon size={24} />}
      </div>
      <div className="stat-content">
        <h4 className="stat-title">{title}</h4>
        <div className="stat-value">{value}</div>
        {description && <p className="stat-desc">{description}</p>}
      </div>
    </div>
  );
};
