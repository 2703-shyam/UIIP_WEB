import React from 'react';

export const Loading = ({ message = 'Loading...', fullScreen = false }) => {
  return (
    <div className={`${fullScreen ? 'loading-fullscreen' : 'loading-container'}`} role="status" aria-live="polite">
      <p className="loading-text">{message}</p>
      <div className="skeleton-stack" aria-hidden="true">
        <div className="skeleton-block" />
        <div className="skeleton-block" />
        <div className="skeleton-block" />
      </div>
    </div>
  );
};
