import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { trocaComputadorAPI } from '../services/api';
import { TrocaComputadorFormData } from '../types';

export const trocaComputadorKeys = {
  all: ['trocas-computador'] as const,
  lists: () => [...trocaComputadorKeys.all, 'list'] as const,
  details: () => [...trocaComputadorKeys.all, 'detail'] as const,
  detail: (id: number) => [...trocaComputadorKeys.details(), id] as const,
};

export const useTrocasComputador = () => {
  return useQuery({
    queryKey: trocaComputadorKeys.lists(),
    queryFn: () => trocaComputadorAPI.getAll(),
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

export const useTrocaComputador = (id: number) => {
  return useQuery({
    queryKey: trocaComputadorKeys.detail(id),
    queryFn: () => trocaComputadorAPI.getById(id),
    enabled: !!id,
  });
};

export const useCreateTrocaComputador = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TrocaComputadorFormData) => trocaComputadorAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trocaComputadorKeys.lists() });
    },
  });
};

export const useUpdateTrocaComputador = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TrocaComputadorFormData }) =>
      trocaComputadorAPI.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: trocaComputadorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: trocaComputadorKeys.detail(variables.id) });
    },
  });
};

export const useDeleteTrocaComputador = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => trocaComputadorAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trocaComputadorKeys.lists() });
    },
  });
};
