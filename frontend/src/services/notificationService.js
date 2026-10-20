import api from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export const notificationService = {
  getNotifications: async () => {
    const response = await api.get(API_ENDPOINTS.NOTIFICATIONS.BASE);
    return response.data.data;
  },

  markAsRead: async (id) => {
    const response = await api.put(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
    return response.data.data;
  }
};
