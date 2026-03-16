import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modeloImpressoraAPI } from '../services/api';
import { CreateModeloData, UpdateModeloData } from '../types';

// ─── Query Keys ───────────────────────────────────────────────
const MODELOS_KEY = ['modelos-impressora'] as const;

// ─── Hooks ────────────────────────────────────────────────────

export const useModelosImpressora = (apenasAtivos = false) =>
  useQuery({
    queryKey: [...MODELOS_KEY, { ativo: apenasAtivos }],
    queryFn: () => modeloImpressoraAPI.getAll(apenasAtivos),
    staleTime: 60_000,
  });

export const useCreateModelo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateModeloData) => modeloImpressoraAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MODELOS_KEY });
    },
  });
};

export const useUpdateModelo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateModeloData }) =>
      modeloImpressoraAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MODELOS_KEY });
    },
  });
};

export const useDeleteModelo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => modeloImpressoraAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MODELOS_KEY });
    },
  });
};
