import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { serviceOrderAPI } from '../services/api';
import { FormData as ServiceOrderFormData } from '../types';

// Query keys
export const serviceOrderKeys = {
  all: ['service-orders'] as const,
  lists: () => [...serviceOrderKeys.all, 'list'] as const,
  list: (filters?: any) => [...serviceOrderKeys.lists(), { filters }] as const,
  details: () => [...serviceOrderKeys.all, 'detail'] as const,
  detail: (id: number) => [...serviceOrderKeys.details(), id] as const,
};

// Hook to fetch all service orders
export const useServiceOrders = () => {
  return useQuery({
    queryKey: serviceOrderKeys.lists(),
    queryFn: () => serviceOrderAPI.getAll(),
    staleTime: 1000 * 60 * 5, // 5 minutes - data is valid for 5 min
    refetchOnMount: false, // No automatic refetch on mount
    refetchOnWindowFocus: false, // No refetch on window focus
  });
};

// Hook to fetch a service order by ID
export const useServiceOrder = (id: number) => {
  return useQuery({
    queryKey: serviceOrderKeys.detail(id),
    queryFn: () => serviceOrderAPI.getById(id),
    enabled: !!id,
  });
};

// Hook to create a service order
export const useCreateServiceOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ServiceOrderFormData) => serviceOrderAPI.create(data),
    onSuccess: () => {
      // Just invalidate - React Query will refetch automatically if needed
      queryClient.invalidateQueries({ 
        queryKey: serviceOrderKeys.lists()
      });
    },
  });
};

// Hook to update a service order
export const useUpdateServiceOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ServiceOrderFormData }) =>
      serviceOrderAPI.update(id, data),
    onSuccess: (_, variables) => {
      // Just invalidate - React Query will refetch automatically if needed
      queryClient.invalidateQueries({ 
        queryKey: serviceOrderKeys.lists()
      });
      queryClient.invalidateQueries({ 
        queryKey: serviceOrderKeys.detail(variables.id)
      });
    },
  });
};

// Hook to delete a service order
export const useDeleteServiceOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => serviceOrderAPI.delete(id),
    onSuccess: () => {
      // Just invalidate - React Query will refetch automatically if needed
      queryClient.invalidateQueries({ 
        queryKey: serviceOrderKeys.lists()
      });
    },
  });
};

// Hook to generate PDF of a service order
export const useGeneratePDF = () => {
  return useMutation({
    mutationFn: (id: number) => serviceOrderAPI.generatePDF(id),
    onSuccess: (blob, id) => {
      // Create blob URL and download
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

// Hook to generate report PDF
export const useGenerateReportPDF = () => {
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
      serviceOrderAPI.generateReportPDF(
        status,
        search,
        dia,
        mes,
        ano,
        dataInicio,
        dataFim
      ),
    onSuccess: (blob) => {
      // Create blob URL and download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const today = new Date();
      const timestamp = `${String(today.getDate()).padStart(2, '0')}-${String(
        today.getMonth() + 1
      ).padStart(2, '0')}-${today.getFullYear()}`;
      link.download = `Relatorio-OS-${timestamp}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
};
