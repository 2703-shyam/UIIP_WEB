import api from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export const userService = {
  getEngineers: async (department) => {
    const response = await api.get(API_ENDPOINTS.ENGINEERS.BASE, {
      params: department ? { department } : {}
    });
    return response.data.data;
  },

  getAnalyticsSummary: async () => {
    const response = await api.get(API_ENDPOINTS.ANALYTICS.SUMMARY);
    return response.data.data;
  }
};
