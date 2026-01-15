import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ordemServicoAPI } from '../services/api';
import { FormData as OrdemServicoFormData } from '../types';

// Query keys
export const ordemServicoKeys = {
  all: ['ordens-servico'] as const,
  lists: () => [...ordemServicoKeys.all, 'list'] as const,
  list: (filters?: any) => [...ordemServicoKeys.lists(), { filters }] as const,
  details: () => [...ordemServicoKeys.all, 'detail'] as const,
  detail: (id: number) => [...ordemServicoKeys.details(), id] as const,
};

// Hook para buscar todas as ordens de serviço
export const useOrdensServico = () => {
  return useQuery({
    queryKey: ordemServicoKeys.lists(),
    queryFn: () => ordemServicoAPI.getAll(),
    staleTime: 1000 * 60 * 5, // 5 minutos - dados são válidos por 5 min
    refetchOnMount: false, // Não refetch automático ao montar
    refetchOnWindowFocus: false, // Não refetch ao focar janela
  });
};

// Hook para buscar uma ordem de serviço por ID
export const useOrdemServico = (id: number) => {
  return useQuery({
    queryKey: ordemServicoKeys.detail(id),
    queryFn: () => ordemServicoAPI.getById(id),
    enabled: !!id,
  });
};

// Hook para criar uma ordem de serviço
export const useCreateOrdemServico = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OrdemServicoFormData) => ordemServicoAPI.create(data),
    onSuccess: () => {
      // Apenas invalidar - React Query fará refetch automaticamente se necessário
      queryClient.invalidateQueries({ 
        queryKey: ordemServicoKeys.lists()
      });
    },
  });
};

// Hook para atualizar uma ordem de serviço
export const useUpdateOrdemServico = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: OrdemServicoFormData }) =>
      ordemServicoAPI.update(id, data),
    onSuccess: (_, variables) => {
      // Apenas invalidar - React Query fará refetch automaticamente se necessário
      queryClient.invalidateQueries({ 
        queryKey: ordemServicoKeys.lists()
      });
      queryClient.invalidateQueries({ 
        queryKey: ordemServicoKeys.detail(variables.id)
      });
    },
  });
};

// Hook para deletar uma ordem de serviço
export const useDeleteOrdemServico = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ordemServicoAPI.delete(id),
    onSuccess: () => {
      // Apenas invalidar - React Query fará refetch automaticamente se necessário
      queryClient.invalidateQueries({ 
        queryKey: ordemServicoKeys.lists()
      });
    },
  });
};

// Hook para gerar PDF de uma ordem de serviço
export const useGeneratePDF = () => {
  return useMutation({
    mutationFn: (id: number) => ordemServicoAPI.generatePDF(id),
    onSuccess: (blob, id) => {
      // Criar URL do blob e fazer download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `OS-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
};

// Hook para gerar relatório PDF
export const useGenerateRelatorioPDF = () => {
  return useMutation({
    mutationFn: ({
      status,
      search,
      dia,
      mes,
      ano,
      dataInicio,
      dataFim,
    }: {
      status?: string | null;
      search?: string | null;
      dia?: string | null;
      mes?: string | null;
      ano?: string | null;
      dataInicio?: string | null;
      dataFim?: string | null;
    }) =>
      ordemServicoAPI.generateRelatorioPDF(
        status,
        search,
        dia,
        mes,
        ano,
        dataInicio,
        dataFim
      ),
    onSuccess: (blob) => {
      // Criar URL do blob e fazer download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const hoje = new Date();
      const timestamp = `${String(hoje.getDate()).padStart(2, '0')}-${String(
        hoje.getMonth() + 1
      ).padStart(2, '0')}-${hoje.getFullYear()}`;
      link.download = `Relatorio-OS-${timestamp}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
};
