import React from 'react';
import { AlertTriangle, CircleCheck, Info } from 'lucide-react';

const FEEDBACK_ICONS = {
  danger: AlertTriangle,
  warning: AlertTriangle,
  success: CircleCheck,
  neutral: Info
};

export const FeedbackBanner = ({ tone = 'neutral', children, className = '', ...props }) => {
  const Icon = FEEDBACK_ICONS[tone] || Info;
  const role = tone === 'danger' ? 'alert' : 'status';
  return (
    <div className={`feedback-banner feedback-banner-${tone} ${className}`.trim()} role={role} {...props}>
      <Icon className="feedback-banner-icon" size={18} aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
};
