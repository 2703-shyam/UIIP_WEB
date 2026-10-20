import React from 'react';
import { formatDate } from '../../utils/formatDate';
import { CheckCircle2, Clock, ShieldCheck, UserCheck, Wrench } from 'lucide-react';

export const ComplaintTimeline = ({ history = [], currentStatus }) => {
  const steps = [
    { key: 'Submitted', label: 'Submitted', icon: Clock },
    { key: 'Verified', label: 'Verified', icon: ShieldCheck },
    { key: 'Assigned', label: 'Assigned', icon: UserCheck },
    { key: 'In Progress', label: 'In Progress', icon: Wrench },
    { key: 'Resolved', label: 'Resolved', icon: CheckCircle2 }
  ];

  const getStepIndex = (status) => {
    return steps.findIndex((s) => s.key === status);
  };

  const currentIndex = getStepIndex(currentStatus);

  return (
    <div className="timeline-container">
      <h3 className="timeline-title">Complaint Lifecycle Progress</h3>
      <div className="timeline-steps">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isDone = index <= currentIndex;
          const isCurrent = index === currentIndex;

          // Find history entry for this step if provided by backend
          const historyEntry = history.find((entry) => (entry.newStatus || entry.status) === step.key);

          return (
            <div
              key={step.key}
              className={`timeline-step ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}
            >
              <div className="step-icon-wrapper">
                <Icon size={20} />
              </div>
              <div className="step-content">
                <span className="step-label">{step.label}</span>
                {historyEntry && (
                  <span className="step-date">{formatDate(historyEntry.createdAt || historyEntry.timestamp)}</span>
                )}
                {historyEntry?.comment && (
                  <p className="step-comment">{historyEntry.comment}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
