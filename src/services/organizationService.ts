import api from '@/api/axios';

export interface Organization {
  id: number;
  name: string;
  subscription_plan: 'Basic' | 'Pro' | 'Enterprise';
  created_at: string;
}

export const organizationService = {
  getOrganizations: async () => {
    const res = await api.get('/organizations/');
    return res.data;
  },
  getOrganization: async (id: number | string) => {
    const res = await api.get(`/organizations/${id}/`);
    return res.data;
  },
  updateOrganization: async (id: number | string, data: Partial<Organization>) => {
    const res = await api.patch(`/organizations/${id}/`, data);
    return res.data;
  },
};
