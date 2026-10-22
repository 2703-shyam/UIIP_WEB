import api from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export const userService = {
  getEngineers: async (department, includeInactive = false) => {
    const response = await api.get(API_ENDPOINTS.ENGINEERS.BASE, {
      params: { ...(department ? { department } : {}), ...(includeInactive ? { includeInactive: true } : {}) }
    });
    return response.data.data;
  },

  createEngineer: async (engineerData) => {
    const response = await api.post(API_ENDPOINTS.ENGINEERS.BASE, engineerData);
    return response.data.data;
  },

  setEngineerActive: async (id, isActive) => {
    const response = await api.patch(API_ENDPOINTS.ENGINEERS.STATUS(id), { isActive });
    return response.data.data;
  },

  getAnalyticsSummary: async () => {
    const response = await api.get(API_ENDPOINTS.ANALYTICS.SUMMARY);
    return response.data.data;
  }
};
