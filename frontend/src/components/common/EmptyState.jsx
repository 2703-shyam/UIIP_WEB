import React from 'react';
import { Inbox } from 'lucide-react';

export const EmptyState = ({
  title = 'No items found',
  message = 'There are no records to display at this time.',
  action = null,
  icon: Icon = Inbox
}) => {
  return (
    <div className="empty-state">
      <div className="empty-icon-wrapper">
        <Icon size={48} />
      </div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-message">{message}</p>
      {action && <div className="empty-action">{action}</div>}
    </div>
  );
};
