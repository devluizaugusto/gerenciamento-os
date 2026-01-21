import { z } from 'zod';

// Schema de validação para o formulário de ordem de serviço
export const ordemServicoSchema = z.object({
  solicitante: z
    .string()
    .min(3, 'O nome do solicitante deve ter no mínimo 3 caracteres')
    .max(255, 'O nome do solicitante deve ter no máximo 255 caracteres')
    .trim(),
  
  unidade: z
    .string()
    .min(3, 'O nome da unidade deve ter no mínimo 3 caracteres')
    .max(255, 'O nome da unidade deve ter no máximo 255 caracteres')
    .trim(),
  
  setor: z
    .string()
    .min(3, 'O nome do setor deve ter no mínimo 3 caracteres')
    .max(255, 'O nome do setor deve ter no máximo 255 caracteres')
    .trim(),
  
  descricao_problema: z
    .string()
    .min(10, 'A descrição do problema deve ter no mínimo 10 caracteres')
    .trim(),
  
  data_abertura: z
    .string()
    .min(1, 'A data de abertura é obrigatória'),
  
  servico_realizado: z
    .string()
    .optional()
    .nullable(),
  
  status: z
    .enum(['aberto', 'em_andamento', 'finalizado'])
    .default('aberto'),
  
  data_fechamento: z
    .string()
    .optional()
    .nullable(),
});

// Tipo TypeScript inferido do schema
export type OrdemServicoFormData = z.infer<typeof ordemServicoSchema>;

// Schema para filtros (opcional)
export const filtroSchema = z.object({
  status: z.string().optional(),
  searchTerm: z.string().optional(),
  dia: z.string().optional(),
  mes: z.string().optional(),
  ano: z.string().optional(),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
});

export type FiltroData = z.infer<typeof filtroSchema>;
