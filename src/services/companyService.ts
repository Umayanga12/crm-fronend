import api from '@/api/axios';

interface CompanyParams {
  page?: number;
  search?: string;
  industry?: string;
  country?: string;
}

export const companyService = {
  getCompanies: async (params: CompanyParams = {}) => {
    const res = await api.get('/companies/', { params });
    return res.data;
  },
  getCompany: async (id: string | number) => {
    const res = await api.get(`/companies/${id}/`);
    return res.data;
  },
  createCompany: async (formData: FormData) => {
    const res = await api.post('/companies/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  updateCompany: async (id: string | number, formData: FormData) => {
    const res = await api.patch(`/companies/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  deleteCompany: async (id: string | number) => {
    const res = await api.delete(`/companies/${id}/`);
    return res.data;
  },
};
