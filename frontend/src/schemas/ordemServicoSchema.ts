import { z } from 'zod';

// Validation schema for service order form
const parseDateInput = (value?: string | null): Date | null => {
  if (!value) return null;
  const parts = value.includes('-') ? value.split('-').map(Number) : value.split('/').reverse().map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
  const [year, month, day] = parts;
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
};

export const serviceOrderSchema = z.object({
  solicitante: z.string().trim().min(3, 'O nome do solicitante deve ter no mínimo 3 caracteres').max(255, 'O nome do solicitante deve ter no máximo 255 caracteres'),
  unidade: z.string().trim().min(3, 'O nome da unidade deve ter no mínimo 3 caracteres').max(255, 'O nome da unidade deve ter no máximo 255 caracteres'),
  setor: z.string().trim().min(3, 'O nome do setor deve ter no mínimo 3 caracteres').max(255, 'O nome do setor deve ter no máximo 255 caracteres'),
  descricao_problema: z.string().trim().min(10, 'A descrição do problema deve ter no mínimo 10 caracteres'),
  data_abertura: z.string().min(1, 'A data de abertura é obrigatória'),
  servico_realizado: z.string().nullable().optional(),
  status: z.enum(['aberto', 'em_andamento', 'finalizado']).default('aberto'),
  data_fechamento: z.string().nullable().optional(),
}).superRefine((data, ctx) => {
  const abertura = parseDateInput(data.data_abertura);
  const fechamento = parseDateInput(data.data_fechamento);
  const hoje = new Date();
  hoje.setHours(23, 59, 59, 999);

  if (!abertura) {
    ctx.addIssue({ code: 'custom', path: ['data_abertura'], message: 'Informe uma data de abertura válida' });
    return;
  }
  if (abertura > hoje) {
    ctx.addIssue({ code: 'custom', path: ['data_abertura'], message: 'A data de abertura não pode ser futura' });
  }

  if (data.status === 'finalizado') {
    if (!data.servico_realizado?.trim()) {
      ctx.addIssue({ code: 'custom', path: ['servico_realizado'], message: 'Informe o serviço realizado para finalizar a OS' });
    }
    if (!fechamento) {
      ctx.addIssue({ code: 'custom', path: ['data_fechamento'], message: 'Informe a data de fechamento para finalizar a OS' });
    } else {
      if (fechamento < abertura) {
        ctx.addIssue({ code: 'custom', path: ['data_fechamento'], message: 'A data de fechamento não pode ser anterior à abertura' });
      }
      if (fechamento > hoje) {
        ctx.addIssue({ code: 'custom', path: ['data_fechamento'], message: 'A data de fechamento não pode ser futura' });
      }
    }
  } else {
    if (data.data_fechamento) {
      ctx.addIssue({ code: 'custom', path: ['data_fechamento'], message: 'A data de fechamento só pode ser usada em OS finalizada' });
    }
    if (data.servico_realizado?.trim()) {
      ctx.addIssue({ code: 'custom', path: ['servico_realizado'], message: 'O serviço realizado só pode ser informado em OS finalizada' });
    }
  }
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
