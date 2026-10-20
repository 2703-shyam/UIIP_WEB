import React from 'react';
import { STATUS_COLORS } from '../../constants/status';
import { PRIORITY_COLORS } from '../../constants/priority';

export const StatusBadge = ({ status, type = 'status' }) => {
  let color = 'default';
  if (type === 'status') {
    color = STATUS_COLORS[status] || 'secondary';
  } else if (type === 'priority') {
    color = PRIORITY_COLORS[status] || 'secondary';
  }

  return <span className={`badge badge-${color}`}>{status || 'Unknown'}</span>;
};
