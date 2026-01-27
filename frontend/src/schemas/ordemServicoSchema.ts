import { z } from 'zod';

// Validation schema for service order form
export const serviceOrderSchema = z.object({
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

// TypeScript type inferred from schema
export type ServiceOrderFormData = z.infer<typeof serviceOrderSchema>;

// Schema for filters (optional)
export const filterSchema = z.object({
  status: z.string().optional(),
  searchTerm: z.string().optional(),
  day: z.string().optional(),
  month: z.string().optional(),
  year: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type FilterData = z.infer<typeof filterSchema>;
