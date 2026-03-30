import api from '@/api/axios';

export const authService = {
  login: async (email: string, password: string) => {
    const res = await api.post('/auth/token/', { email, password });
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me/');
    return res.data.data;
  },
  register: async (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    organization_name: string;
  }) => {
    const res = await api.post('/auth/register/', data);
    return res.data;
  },
};
