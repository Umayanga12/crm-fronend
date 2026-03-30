import api from '@/api/axios';

export const authService = {
  login: async (email: string, password: string) => {
    const res = await api.post('/auth/token/', { email, password });
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me/');
    return res.data;
  },
};
