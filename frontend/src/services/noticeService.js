import api from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export const noticeService = {
  getActiveNotices: async () => {
    const response = await api.get(API_ENDPOINTS.NOTICES.ACTIVE);
    return response.data.data;
  },

  getAllNotices: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.NOTICES.BASE, { params });
    return response.data.data;
  },

  getNoticeById: async (id) => {
    const response = await api.get(`${API_ENDPOINTS.NOTICES.BASE}/${id}`);
    return response.data.data;
  },

  createNotice: async (noticeData) => {
    const response = await api.post(API_ENDPOINTS.NOTICES.BASE, noticeData);
    return response.data.data;
  },

  deleteNotice: async (id) => {
    const response = await api.delete(`${API_ENDPOINTS.NOTICES.BASE}/${id}`);
    return response.data.data;
  }
};
