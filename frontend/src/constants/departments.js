import departmentConfig from '../../../shared/departments.json';

export const DEPARTMENTS = departmentConfig.departments;

export const LEGACY_DEPARTMENT_MAP = Object.freeze({
  Roads: DEPARTMENTS[0],
  'Roads & Public Works': DEPARTMENTS[0],
  'Public Works': DEPARTMENTS[0],
  'Electrical & Streetlighting': DEPARTMENTS[0],
  'Water Works': DEPARTMENTS[1],
  'Water Works & Sewage': DEPARTMENTS[1],
  'Water Supply': DEPARTMENTS[1],
  'Drainage & Stormwater': DEPARTMENTS[1],
  'Sanitation & Solid Waste': DEPARTMENTS[2],
  'Sanitation & Hygiene': DEPARTMENTS[2],
  'Horticulture & Parks': DEPARTMENTS[2]
});

export const normalizeDepartment = (department) => (
  DEPARTMENTS.includes(department) ? department : LEGACY_DEPARTMENT_MAP[department] || null
);
