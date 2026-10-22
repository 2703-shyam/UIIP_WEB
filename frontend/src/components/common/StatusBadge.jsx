import React from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Circle,
  CircleAlert,
  CircleCheck,
  CircleDot,
  CircleX,
  ClipboardCheck,
  UserRoundCheck,
  Wrench
} from 'lucide-react';

const STATUS_PRESENTATION = {
  Submitted: { tone: 'neutral', icon: CircleDot },
  Verified: { tone: 'ink', icon: ClipboardCheck },
  Assigned: { tone: 'ink', icon: UserRoundCheck },
  'In Progress': { tone: 'ink', icon: Wrench },
  Resolved: { tone: 'success', icon: CircleCheck },
  Rejected: { tone: 'danger', icon: CircleX }
};

const PRIORITY_PRESENTATION = {
  Low: { tone: 'neutral', icon: ArrowDown },
  Medium: { tone: 'warning', icon: CircleAlert },
  High: { tone: 'danger', icon: ArrowUp },
  Critical: { tone: 'danger', icon: AlertTriangle }
};

export const StatusBadge = ({ status, type = 'status', className = '' }) => {
  const label = status || 'Unknown';
  const presentation = (type === 'priority' ? PRIORITY_PRESENTATION : STATUS_PRESENTATION)[label]
    || { tone: 'neutral', icon: Circle };
  const Icon = presentation.icon;

  return (
    <span className={`status-badge status-badge-${presentation.tone} ${className}`.trim()}>
      <span className="status-badge-dot" aria-hidden="true" />
      <Icon className="status-badge-icon" size={14} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
};
