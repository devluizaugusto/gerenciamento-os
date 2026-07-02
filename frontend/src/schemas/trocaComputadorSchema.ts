import { z } from 'zod';

const patrimonioSchema = z
  .string()
  .min(1, 'Patrimônio é obrigatório')
  .max(100, 'Patrimônio deve ter no máximo 100 caracteres')
  .trim();

export const trocaComputadorSchema = z.object({
  patrimonio_cpu_antigo: patrimonioSchema,
  patrimonio_monitor_antigo: patrimonioSchema,
  patrimonio_cpu_novo: patrimonioSchema,
  patrimonio_monitor_novo: patrimonioSchema,
  unidade: z
    .string()
    .min(1, 'Selecione a unidade (UBS)')
    .max(255, 'Unidade deve ter no máximo 255 caracteres'),
  data_troca: z
    .string()
    .min(1, 'Data da troca é obrigatória'),
  status: z.enum(['em_andamento', 'finalizado'], {
    message: 'Status deve ser Em Andamento ou Finalizado',
  }),
});

export type TrocaComputadorFormData = z.infer<typeof trocaComputadorSchema>;
