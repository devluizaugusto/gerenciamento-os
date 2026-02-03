import axios, { AxiosInstance } from 'axios';
import { ServiceOrder, FormData } from '../types';

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const serviceOrderAPI = {
  getAll: async (): Promise<ServiceOrder[]> => {
    const response = await api.get<ServiceOrder[]>('/ordens-servico');
    return response.data;
  },

  getById: async (id: number): Promise<ServiceOrder> => {
    const response = await api.get<ServiceOrder>(`/ordens-servico/${id}`);
    return response.data;
  },

  getByNumber: async (number: number): Promise<ServiceOrder> => {
    const response = await api.get<ServiceOrder>(`/ordens-servico/numero/${number}`);
    return response.data;
  },

  getByStatus: async (status: string): Promise<ServiceOrder[]> => {
    const response = await api.get<ServiceOrder[]>(`/ordens-servico/status/${status}`);
    return response.data;
  },

  create: async (data: FormData): Promise<ServiceOrder> => {
    const response = await api.post<ServiceOrder>('/ordens-servico', data);
    return response.data;
  },

  update: async (id: number, data: FormData): Promise<ServiceOrder> => {
    const response = await api.put<ServiceOrder>(`/ordens-servico/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/ordens-servico/${id}`);
  },

  generatePDF: async (id: number): Promise<Blob> => {
    const response = await api.get(`/ordens-servico/pdf/${id}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  generateReportPDF: async (
    status: string | null = null,
    search: string | null = null,
    dia: string | null = null,
    mes: string | null = null,
    ano: string | null = null,
    dataInicio: string | null = null,
    dataFim: string | null = null
  ): Promise<Blob> => {
    const params = new URLSearchParams();
    if (status && status !== 'todos') {
      params.append('status', status);
    }
    if (search) {
      params.append('search', search);
    }
    if (dia) {
      params.append('dia', dia);
    }
    if (mes) {
      params.append('mes', mes);
    }
    if (ano) {
      params.append('ano', ano);
    }
    if (dataInicio) {
      params.append('dataInicio', dataInicio);
    }
    if (dataFim) {
      params.append('dataFim', dataFim);
    }
    
    const url = `/ordens-servico/pdf/relatorio/geral${params.toString() ? '?' + params.toString() : ''}`;
    const response = await api.get(url, {
      responseType: 'blob'
    });
    return response.data;
  },
};

export default api;
