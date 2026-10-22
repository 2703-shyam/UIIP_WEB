import api from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export const complaintService = {
  // Citizen: create new complaint
  createComplaint: async (formData) => {
    const response = await api.post(API_ENDPOINTS.COMPLAINTS.BASE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;
  },

  // Citizen: get user's complaints
  getMyComplaints: async () => {
    const response = await api.get(API_ENDPOINTS.COMPLAINTS.MY);
    return response.data.data;
  },

  // Get single complaint by ID
  getComplaintById: async (id) => {
    const response = await api.get(`${API_ENDPOINTS.COMPLAINTS.BASE}/${id}`);
    return response.data.data;
  },

  // Admin/Engineer: Get list of complaints with filters
  getAllComplaints: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.COMPLAINTS.BASE, { params });
    return response.data.data;
  },

  // Admin: verify complaint (set severity, priority, department)
  verifyComplaint: async (id, data) => {
    const response = await api.put(API_ENDPOINTS.COMPLAINTS.VERIFY(id), data);
    return response.data.data;
  },

  // Admin: assign complaint to engineer
  assignEngineer: async (id, assignmentData) => {
    const response = await api.post(API_ENDPOINTS.COMPLAINTS.ASSIGN, {
      complaintId: id,
      ...assignmentData
    });
    return response.data.data;
  },

  // Engineer: resolve complaint
  resolveComplaint: async (id, formData) => {
    const response = await api.post(API_ENDPOINTS.COMPLAINTS.RESOLVE(id), formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;
  },

  // Engineer: update status (e.g. In Progress)
  updateStatus: async (id, status) => {
    const response = await api.put(`${API_ENDPOINTS.COMPLAINTS.BASE}/${id}/status`, { status });
    return response.data.data;
  }
};
