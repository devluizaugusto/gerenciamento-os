import axios, { AxiosInstance } from 'axios';
import {
  ServiceOrder,
  FormData,
  EstoqueTinta,
  CreateEstoqueData,
  UpdateEstoqueData,
  SaidaTinta,
  CreateSaidaData,
  SaidasFilter,
  ModeloImpressoraCadastro,
  CreateModeloData,
  UpdateModeloData
} from '../types';

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

    try {
      const response = await api.get(url, {
        responseType: 'blob'
      });
      return response.data;
    } catch (err: any) {
      // When responseType is 'blob', error responses are also Blobs.
      // We need to read the Blob to extract the actual JSON error message.
      if (err.response?.data instanceof Blob) {
        const text = await err.response.data.text();
        try {
          const json = JSON.parse(text);
          const message = json.error || json.message || 'Erro ao gerar relatório PDF';
          const error = new Error(message) as any;
          error.response = { data: json, status: err.response.status };
          throw error;
        } catch (parseErr) {
          // If it's not valid JSON, re-throw the original error
          throw err;
        }
      }
      throw err;
    }
  },
};

export default api;

// ─── Ink / Tinta API ─────────────────────────────────────────
export const tintaAPI = {
  // Estoque
  getAllEstoque: async (): Promise<EstoqueTinta[]> => {
    const response = await api.get<EstoqueTinta[]>('/tintas/estoque');
    return response.data;
  },

  getEstoqueById: async (id: number): Promise<EstoqueTinta> => {
    const response = await api.get<EstoqueTinta>(`/tintas/estoque/${id}`);
    return response.data;
  },

  createEstoque: async (data: CreateEstoqueData): Promise<EstoqueTinta> => {
    const response = await api.post<EstoqueTinta>('/tintas/estoque', data);
    return response.data;
  },

  updateEstoque: async (id: number, data: UpdateEstoqueData): Promise<EstoqueTinta> => {
    const response = await api.put<EstoqueTinta>(`/tintas/estoque/${id}`, data);
    return response.data;
  },

  deleteEstoque: async (id: number): Promise<void> => {
    await api.delete(`/tintas/estoque/${id}`);
  },

  // Saídas
  getAllSaidas: async (filters?: SaidasFilter): Promise<SaidaTinta[]> => {
    const params = new URLSearchParams();
    if (filters?.estoque_id) params.append('estoque_id', String(filters.estoque_id));
    if (filters?.setor) params.append('setor', filters.setor);
    if (filters?.dataInicio) params.append('dataInicio', filters.dataInicio);
    if (filters?.dataFim) params.append('dataFim', filters.dataFim);
    if (filters?.modelo) params.append('modelo', filters.modelo);

    const url = `/tintas/saidas${params.toString() ? '?' + params.toString() : ''}`;
    const response = await api.get<SaidaTinta[]>(url);
    return response.data;
  },

  createSaida: async (data: CreateSaidaData): Promise<SaidaTinta> => {
    const response = await api.post<SaidaTinta>('/tintas/saidas', data);
    return response.data;
  },

  deleteSaida: async (id: number): Promise<void> => {
    await api.delete(`/tintas/saidas/${id}`);
  },
};

// ─── Modelos de Impressora API ────────────────────────────────
export const modeloImpressoraAPI = {
  getAll: async (apenasAtivos = false): Promise<ModeloImpressoraCadastro[]> => {
    const params = apenasAtivos ? '?ativo=true' : '';
    const response = await api.get<ModeloImpressoraCadastro[]>(`/modelos-impressora${params}`);
    return response.data;
  },

  getById: async (id: number): Promise<ModeloImpressoraCadastro> => {
    const response = await api.get<ModeloImpressoraCadastro>(`/modelos-impressora/${id}`);
    return response.data;
  },

  create: async (data: CreateModeloData): Promise<ModeloImpressoraCadastro> => {
    const response = await api.post<ModeloImpressoraCadastro>('/modelos-impressora', data);
    return response.data;
  },

  update: async (id: number, data: UpdateModeloData): Promise<ModeloImpressoraCadastro> => {
    const response = await api.put<ModeloImpressoraCadastro>(`/modelos-impressora/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/modelos-impressora/${id}`);
  },
};
