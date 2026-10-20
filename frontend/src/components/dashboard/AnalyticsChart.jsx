import React from 'react';

export const AnalyticsChart = ({ title, data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="analytics-card">
        <h3>{title}</h3>
        <p className="no-data">No data available for analytics.</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="analytics-card">
      <h3 className="analytics-title">{title}</h3>
      <div className="chart-bar-list">
        {data.map((item, index) => {
          const percentage = (item.value / maxValue) * 100;
          return (
            <div key={index} className="bar-row">
              <span className="bar-label">{item.label}</span>
              <div className="bar-wrapper">
                <div
                  className="bar-fill"
                  style={{ width: `${percentage}%`, backgroundColor: item.color || '#3b82f6' }}
                />
              </div>
              <span className="bar-value">{item.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
