export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me'
  },
  COMPLAINTS: {
    BASE: '/complaints',
    MY: '/complaints',
    VERIFY: (id) => `/complaints/${id}/verify`,
    ASSIGN: '/assignments',
    RESOLVE: (id) => `/complaints/${id}/resolve`
  },
  ASSIGNMENTS: {
    BASE: '/assignments'
  },
  NOTICES: {
    BASE: '/notices',
    ACTIVE: '/notices'
  },
  ENGINEERS: {
    BASE: '/users/engineers',
    STATUS: (id) => `/users/engineers/${id}/status`
  },
  ANALYTICS: {
    SUMMARY: '/analytics/complaints',
    WORKLOAD: '/analytics/workload'
  }
};
