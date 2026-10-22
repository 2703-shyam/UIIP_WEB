import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { FeedbackBanner } from './FeedbackBanner';

export const ErrorState = ({
  title = 'Something went wrong',
  message = 'Failed to load data. Please try again.',
  onRetry
}) => {
  return (
    <div className="error-state">
      <AlertTriangle className="error-icon" size={48} />
      <h3 className="error-title">{title}</h3>
      <FeedbackBanner tone="danger">{message}</FeedbackBanner>
      {onRetry && (
        <button className="btn btn-primary btn-retry" onClick={onRetry}>
          <RefreshCw size={16} /> Try Again
        </button>
      )}
    </div>
  );
};
