export const COMPLAINT_STATUS = {
  SUBMITTED: 'Submitted',
  VERIFIED: 'Verified',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  REJECTED: 'Rejected'
};

export const STATUS_COLORS = {
  [COMPLAINT_STATUS.SUBMITTED]: 'info',
  [COMPLAINT_STATUS.VERIFIED]: 'secondary',
  [COMPLAINT_STATUS.ASSIGNED]: 'warning',
  [COMPLAINT_STATUS.IN_PROGRESS]: 'primary',
  [COMPLAINT_STATUS.RESOLVED]: 'success',
  [COMPLAINT_STATUS.REJECTED]: 'danger'
};

export const NOTICE_TYPES = {
  WATER_CUTOFF: 'Water Cutoff',
  POWER_OUTAGE: 'Power Outage',
  ROAD_CLOSURE: 'Road Closure',
  GENERAL: 'General'
};
