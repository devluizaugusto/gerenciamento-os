import { z } from 'zod';

export const MODELOS_IMPRESSORA = ['L3150', 'L3250'] as const;

export const TINTAS_POR_MODELO: Record<string, { cor: string; codigo: string }[]> = {
  L3150: [
    { cor: 'Preto',   codigo: '544' },
    { cor: 'Ciano',   codigo: '544' },
    { cor: 'Magenta', codigo: '544' },
    { cor: 'Amarelo', codigo: '544' },
  ],
  L3250: [
    { cor: 'Preto',   codigo: '544' },
    { cor: 'Ciano',   codigo: '544' },
    { cor: 'Magenta', codigo: '544' },
    { cor: 'Amarelo', codigo: '544' },
  ],
};

// Schema para criar estoque de tinta
export const createEstoqueTintaSchema = z.object({
  body: z.object({
    modelo_impressora: z.enum(MODELOS_IMPRESSORA, {
      message: 'Modelo de impressora inválido. Use L3150 ou L3250.',
    }),
    cor_tinta: z.string().min(1, 'Cor da tinta é obrigatória').max(50),
    codigo_tinta: z.string().min(1, 'Código da tinta é obrigatório').max(50),
    quantidade_atual: z
      .number({ message: 'Quantidade deve ser um número' })
      .int('Quantidade deve ser um número inteiro')
      .min(0, 'Quantidade não pode ser negativa'),
    quantidade_minima: z
      .number({ message: 'Quantidade mínima deve ser um número' })
      .int('Quantidade mínima deve ser um número inteiro')
      .min(0, 'Quantidade mínima não pode ser negativa')
      .optional()
      .default(2),
  }),
});

export const updateEstoqueTintaSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, 'ID deve ser um número inteiro positivo')
      .transform(Number),
  }),
  body: z.object({
    modelo_impressora: z
      .enum(MODELOS_IMPRESSORA, {
        message: 'Modelo de impressora inválido. Use L3150 ou L3250.',
      })
      .optional(),
    cor_tinta: z.string().min(1, 'Cor da tinta é obrigatória').max(50).optional(),
    codigo_tinta: z.string().min(1, 'Código da tinta é obrigatório').max(50).optional(),
    quantidade_atual: z
      .number({ message: 'Quantidade deve ser um número' })
      .int('Quantidade deve ser um número inteiro')
      .min(0, 'Quantidade não pode ser negativa')
      .optional(),
    quantidade_minima: z
      .number({ message: 'Quantidade mínima deve ser um número' })
      .int('Quantidade mínima deve ser um número inteiro')
      .min(0, 'Quantidade mínima não pode ser negativa')
      .optional(),
  }),
});

// Schema para registrar saída de tinta
export const createSaidaTintaSchema = z.object({
  body: z.object({
    estoque_id: z
      .number({ message: 'ID do estoque deve ser um número' })
      .int()
      .positive('ID do estoque deve ser positivo'),
    quantidade: z
      .number({ message: 'Quantidade deve ser um número' })
      .int('Quantidade deve ser um número inteiro')
      .min(1, 'Quantidade deve ser pelo menos 1'),
    unidade: z
      .string()
      .min(1, 'Unidade é obrigatória')
      .max(255, 'Unidade não pode ter mais de 255 caracteres'),
    setor: z
      .string()
      .min(1, 'Setor é obrigatório')
      .max(255, 'Setor não pode ter mais de 255 caracteres'),
    responsavel: z
      .string()
      .min(1, 'Responsável é obrigatório')
      .max(255, 'Responsável não pode ter mais de 255 caracteres'),
    observacao: z
      .string()
      .max(1000, 'Observação não pode ter mais de 1000 caracteres')
      .optional()
      .nullable(),
    data_saida: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de saída deve estar no formato YYYY-MM-DD'),
  }),
});

// Schema para parâmetro de ID
export const idParamTintaSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, 'ID deve ser um número inteiro positivo')
      .transform(Number),
  }),
});

// Schema para query de filtros do histórico
export const historicoQuerySchema = z.object({
  query: z.object({
    estoque_id: z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .optional(),
    setor: z.string().optional(),
    unidade: z.string().optional(),
    dataInicio: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data início deve estar no formato YYYY-MM-DD')
      .optional(),
    dataFim: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data fim deve estar no formato YYYY-MM-DD')
      .optional(),
    modelo: z.enum(MODELOS_IMPRESSORA, { message: 'Modelo inválido' }).optional(),
  }),
});
