import React from 'react';

export const Loading = ({ message = 'Loading...', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        <div className="spinner"></div>
        <p className="loading-text">{message}</p>
      </div>
    );
  }

  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p className="loading-text">{message}</p>
    </div>
  );
};
