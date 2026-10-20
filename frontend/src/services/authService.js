import api from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export const authService = {
  login: async (credentials) => {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data.data;
  },

  register: async (userData) => {
    const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
    return response.data.data;
  },

  getCurrentUser: async () => {
    const response = await api.get(API_ENDPOINTS.AUTH.ME);
    return response.data.data;
  }
};
