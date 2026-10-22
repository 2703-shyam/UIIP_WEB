const DEPARTMENT_LABELS = Object.freeze({
  'Roads & Infrastructure': 'Roads',
  Roads: 'Roads',
  'Roads & Public Works': 'Roads',
  'Public Works': 'Roads',
  'Electrical & Streetlighting': 'Roads',
  'Water Supply & Drainage': 'Water Works',
  'Water Works': 'Water Works',
  'Water Works & Sewage': 'Water Works',
  'Water Supply': 'Water Works',
  'Drainage & Stormwater': 'Water Works',
  'Sanitation & Solid Waste Management': 'Sanitation & Solid Waste',
  'Sanitation & Solid Waste': 'Sanitation & Solid Waste',
  'Sanitation & Hygiene': 'Sanitation & Solid Waste',
  'Horticulture & Parks': 'Sanitation & Solid Waste'
});

export const getDepartmentLabel = (department, fallback = '—') => (
  department ? DEPARTMENT_LABELS[department] || department : fallback
);

export { DEPARTMENT_LABELS };
