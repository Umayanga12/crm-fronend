import api from '@/api/axios';

export interface TeamMember {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'Admin' | 'Manager' | 'Staff';
  is_active: boolean;
}

export const userService = {
  getUsers: async (params = {}) => {
    const response = await api.get('/auth/users/', { params });
    return response.data;
  },

  createUser: async (data: Partial<TeamMember> & { password?: string }): Promise<TeamMember> => {
    const response = await api.post('/auth/users/', data);
    return response.data.data;
  },

  updateUser: async (id: number, data: Partial<TeamMember>): Promise<TeamMember> => {
    const response = await api.patch(`/auth/users/${id}/`, data);
    return response.data.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/auth/users/${id}/`);
  },
};
