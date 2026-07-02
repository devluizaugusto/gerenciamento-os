import { z } from 'zod';

const dateField = z
  .string({ message: 'Data deve ser um texto' })
  .min(1, 'Campo obrigatório: data da troca')
  .refine(
    (val) => {
      const brFormat = /^\d{2}\/\d{2}\/\d{4}$/;
      const isoFormat = /^\d{4}-\d{2}-\d{2}$/;
      return brFormat.test(val) || isoFormat.test(val);
    },
    { message: 'Data deve estar no formato DD/MM/YYYY ou YYYY-MM-DD' }
  );

const patrimonioField = z
  .string({ message: 'Patrimônio deve ser um texto' })
  .min(1, 'Patrimônio é obrigatório')
  .max(100, 'Patrimônio deve ter no máximo 100 caracteres')
  .trim();

export const createTrocaComputadorSchema = z.object({
  body: z.object({
    patrimonio_cpu_antigo: patrimonioField,
    patrimonio_monitor_antigo: patrimonioField,
    patrimonio_cpu_novo: patrimonioField,
    patrimonio_monitor_novo: patrimonioField,
    unidade: z
      .string({ message: 'Unidade deve ser um texto' })
      .min(1, 'Campo obrigatório: unidade (UBS)')
      .max(255, 'Unidade deve ter no máximo 255 caracteres')
      .trim(),
    data_troca: dateField,
    status: z
      .enum(['em_andamento', 'finalizado'], {
        message: 'Status deve ser: em_andamento ou finalizado',
      })
      .optional()
      .default('em_andamento'),
  }),
});

export const updateTrocaComputadorSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, 'ID deve ser um número')
      .transform(Number),
  }),
  body: z
    .object({
      patrimonio_cpu_antigo: patrimonioField.optional(),
      patrimonio_monitor_antigo: patrimonioField.optional(),
      patrimonio_cpu_novo: patrimonioField.optional(),
      patrimonio_monitor_novo: patrimonioField.optional(),
      unidade: z
        .string()
        .min(1, 'Unidade não pode estar vazia')
        .max(255, 'Unidade deve ter no máximo 255 caracteres')
        .trim()
        .optional(),
      data_troca: dateField.optional(),
      status: z
        .enum(['em_andamento', 'finalizado'], {
          message: 'Status deve ser: em_andamento ou finalizado',
        })
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Pelo menos um campo deve ser fornecido para atualização',
    }),
});

export const idParamSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, 'ID deve ser um número')
      .transform(Number),
  }),
});
