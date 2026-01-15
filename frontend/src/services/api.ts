import axios, { AxiosInstance } from 'axios';
import { OrdemServico, FormData } from '../types';

// Usar /api em desenvolvimento (proxy do Vite) e produção
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const ordemServicoAPI = {
  // Listar todas as ordens de serviço
  getAll: async (): Promise<OrdemServico[]> => {
    const response = await api.get<OrdemServico[]>('/ordens-servico');
    return response.data;
  },

  // Buscar por ID
  getById: async (id: number): Promise<OrdemServico> => {
    const response = await api.get<OrdemServico>(`/ordens-servico/${id}`);
    return response.data;
  },

  // Buscar por número
  getByNumero: async (numero: number): Promise<OrdemServico> => {
    const response = await api.get<OrdemServico>(`/ordens-servico/numero/${numero}`);
    return response.data;
  },

  // Filtrar por status
  getByStatus: async (status: string): Promise<OrdemServico[]> => {
    const response = await api.get<OrdemServico[]>(`/ordens-servico/status/${status}`);
    return response.data;
  },

  // Criar nova ordem de serviço
  create: async (data: FormData): Promise<OrdemServico> => {
    const response = await api.post<OrdemServico>('/ordens-servico', data);
    return response.data;
  },

  // Atualizar ordem de serviço
  update: async (id: number, data: FormData): Promise<OrdemServico> => {
    const response = await api.put<OrdemServico>(`/ordens-servico/${id}`, data);
    return response.data;
  },

  // Deletar ordem de serviço
  delete: async (id: number): Promise<void> => {
    await api.delete(`/ordens-servico/${id}`);
  },

  // Gerar PDF de uma ordem de serviço
  generatePDF: async (id: number): Promise<Blob> => {
    const response = await api.get(`/ordens-servico/pdf/${id}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Gerar relatório PDF
  generateRelatorioPDF: async (
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
