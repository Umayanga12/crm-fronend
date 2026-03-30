import api from '@/api/axios';

interface ContactParams {
  page?: number;
  search?: string;
}

export const contactService = {
  getContacts: async (companyId: string | number, params: ContactParams = {}) => {
    const res = await api.get(`/companies/${companyId}/contacts/`, { params });
    return res.data;
  },
  createContact: async (companyId: string | number, data: Record<string, unknown>) => {
    const res = await api.post(`/companies/${companyId}/contacts/`, data);
    return res.data;
  },
  updateContact: async (companyId: string | number, contactId: string | number, data: Record<string, unknown>) => {
    const res = await api.patch(`/companies/${companyId}/contacts/${contactId}/`, data);
    return res.data;
  },
  deleteContact: async (companyId: string | number, contactId: string | number) => {
    const res = await api.delete(`/companies/${companyId}/contacts/${contactId}/`);
    return res.data;
  },
};
