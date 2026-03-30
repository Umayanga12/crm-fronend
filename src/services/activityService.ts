import api from '@/api/axios';

interface ActivityParams {
  page?: number;
}

export const activityService = {
  getActivityLogs: async (params: ActivityParams = {}) => {
    const res = await api.get('/activity-logs/', { params });
    return res.data;
  },
};
