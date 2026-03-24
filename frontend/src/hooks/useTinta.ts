import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tintaAPI } from '../services/api';
import { CreateEstoqueData, UpdateEstoqueData, CreateSaidaData, SaidasFilter } from '../types';

// ─── Query Keys ───────────────────────────────────────────────
const ESTOQUE_KEY = ['tintas', 'estoque'] as const;
const SAIDAS_KEY = ['tintas', 'saidas'] as const;

// ─── Estoque Hooks ────────────────────────────────────────────

export const useEstoqueTintas = () =>
  useQuery({
    queryKey: ESTOQUE_KEY,
    queryFn: () => tintaAPI.getAllEstoque(),
    staleTime: 30_000,
  });

export const useCreateEstoque = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEstoqueData) => tintaAPI.createEstoque(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ESTOQUE_KEY });
    },
  });
};

export const useUpdateEstoque = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEstoqueData }) =>
      tintaAPI.updateEstoque(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ESTOQUE_KEY });
    },
  });
};

export const useDeleteEstoque = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => tintaAPI.deleteEstoque(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ESTOQUE_KEY });
      queryClient.invalidateQueries({ queryKey: SAIDAS_KEY });
    },
  });
};

// ─── Saídas Hooks ─────────────────────────────────────────────

export const useSaidasTinta = (filters?: SaidasFilter) =>
  useQuery({
    queryKey: [...SAIDAS_KEY, filters],
    queryFn: () => tintaAPI.getAllSaidas(filters),
    staleTime: 30_000,
  });

export const useCreateSaida = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSaidaData) => tintaAPI.createSaida(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ESTOQUE_KEY });
      queryClient.invalidateQueries({ queryKey: SAIDAS_KEY });
    },
  });
};

export const useDeleteSaida = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => tintaAPI.deleteSaida(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ESTOQUE_KEY });
      queryClient.invalidateQueries({ queryKey: SAIDAS_KEY });
    },
  });
};

export const useEstornarSaida = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, quantidade }: { id: number; quantidade: number }) =>
      tintaAPI.estornarSaida(id, quantidade),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ESTOQUE_KEY });
      queryClient.invalidateQueries({ queryKey: SAIDAS_KEY });
    },
  });
};
