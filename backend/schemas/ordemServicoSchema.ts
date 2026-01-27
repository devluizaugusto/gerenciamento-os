import { z } from 'zod';

// Schema to create service order
export const createServiceOrderSchema = z.object({
  body: z.object({
    solicitante: z
      .string({ message: 'Solicitante deve ser um texto' })
      .min(1, 'Campo obrigatório: solicitante')
      .max(255, 'Solicitante deve ter no máximo 255 caracteres')
      .trim(),
    
    unidade: z
      .string({ message: 'Unidade deve ser um texto' })
      .min(1, 'Campo obrigatório: Unidade')
      .max(255, 'Unidade deve ter no máximo 255 caracteres')
      .trim(),
    
    setor: z
      .string({ message: 'Setor deve ser um texto' })
      .min(1, 'Campo obrigatório: setor')
      .max(255, 'Setor deve ter no máximo 255 caracteres')
      .trim(),
    
    descricao_problema: z
      .string({ message: 'Descrição do problema deve ser um texto' })
      .min(1, 'Campo obrigatório: descrição do problema')
      .trim(),
    
    data_abertura: z
      .string({ message: 'Data de abertura deve ser um texto' })
      .min(1, 'Campo obrigatório: data de abertura')
      .refine(
        (val) => {
          // Accept DD/MM/YYYY or YYYY-MM-DD format
          const brFormat = /^\d{2}\/\d{2}\/\d{4}$/;
          const isoFormat = /^\d{4}-\d{2}-\d{2}$/;
          return brFormat.test(val) || isoFormat.test(val);
        },
        { message: 'Data de abertura deve estar no formato DD/MM/YYYY ou YYYY-MM-DD' }
      ),
    
    servico_realizado: z
      .string()
      .optional()
      .nullable()
      .transform(val => val === '' ? null : val),
    
    status: z
      .enum(['aberto', 'em_andamento', 'finalizado'], { 
        message: 'Status deve ser: aberto, em_andamento ou finalizado' 
      })
      .optional()
      .default('aberto'),
    
    data_fechamento: z
      .string()
      .optional()
      .nullable()
      .refine(
        (val) => {
          if (!val || val === '') return true;
          const brFormat = /^\d{2}\/\d{2}\/\d{4}$/;
          const isoFormat = /^\d{4}-\d{2}-\d{2}$/;
          return brFormat.test(val) || isoFormat.test(val);
        },
        { message: 'Data de fechamento deve estar no formato DD/MM/YYYY ou YYYY-MM-DD' }
      )
      .transform(val => val === '' ? null : val)
  })
});

// Schema to update service order
export const updateServiceOrderSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, 'ID deve ser um número')
      .transform(Number)
  }),
  
  body: z.object({
    solicitante: z
      .string()
      .min(1, 'Solicitante não pode estar vazio')
      .max(255, 'Solicitante deve ter no máximo 255 caracteres')
      .trim()
      .optional(),
    
    unidade: z
      .string()
      .min(1, 'Unidade não pode estar vazia')
      .max(255, 'Unidade deve ter no máximo 255 caracteres')
      .trim()
      .optional(),
    
    setor: z
      .string()
      .min(1, 'Setor não pode estar vazio')
      .max(255, 'Setor deve ter no máximo 255 caracteres')
      .trim()
      .optional(),
    
    descricao_problema: z
      .string()
      .min(1, 'Descrição do problema não pode estar vazia')
      .trim()
      .optional(),
    
    data_abertura: z
      .string()
      .refine(
        (val) => {
          const brFormat = /^\d{2}\/\d{2}\/\d{4}$/;
          const isoFormat = /^\d{4}-\d{2}-\d{2}$/;
          return brFormat.test(val) || isoFormat.test(val);
        },
        { message: 'Data de abertura deve estar no formato DD/MM/YYYY ou YYYY-MM-DD' }
      )
      .optional(),
    
    servico_realizado: z
      .string()
      .nullable()
      .optional()
      .transform(val => val === '' ? null : val),
    
    status: z
      .enum(['aberto', 'em_andamento', 'finalizado'], { 
        message: 'Status deve ser: aberto, em_andamento ou finalizado' 
      })
      .optional(),
    
    data_fechamento: z
      .string()
      .nullable()
      .optional()
      .refine(
        (val) => {
          if (!val || val === '') return true;
          const brFormat = /^\d{2}\/\d{2}\/\d{4}$/;
          const isoFormat = /^\d{4}-\d{2}-\d{2}$/;
          return brFormat.test(val) || isoFormat.test(val);
        },
        { message: 'Data de fechamento deve estar no formato DD/MM/YYYY ou YYYY-MM-DD' }
      )
      .transform(val => val === '' ? null : val)
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: 'Pelo menos um campo deve ser fornecido para atualização' }
  )
});

// Schema to validate ID in params
export const idParamSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/, 'ID deve ser um número')
      .transform(Number)
  })
});

// Schema to validate order number in params
export const orderNumberParamSchema = z.object({
  params: z.object({
    numero: z
      .string()
      .regex(/^\d+$/, 'Número da OS deve ser um número')
  })
});

// Schema to validate status in params
export const statusParamSchema = z.object({
  params: z.object({
    status: z.enum(['aberto', 'em_andamento', 'finalizado'], { 
      message: 'Status deve ser: aberto, em_andamento ou finalizado' 
    })
  })
});

// Schema to validate report query params
export const reportQuerySchema = z.object({
  query: z.object({
    status: z
      .enum(['todos', 'aberto', 'em_andamento', 'finalizado'])
      .optional(),
    
    search: z
      .string()
      .optional(),
    
    dia: z
      .string()
      .regex(/^\d{1,2}$/, 'Dia deve ser um número de 1 a 31')
      .optional(),
    
    mes: z
      .string()
      .regex(/^\d{1,2}$/, 'Mês deve ser um número de 1 a 12')
      .optional(),
    
    ano: z
      .string()
      .regex(/^\d{4}$/, 'Ano deve ter 4 dígitos')
      .optional(),
    
    dataInicio: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de início deve estar no formato YYYY-MM-DD')
      .optional(),
    
    dataFim: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de fim deve estar no formato YYYY-MM-DD')
      .optional()
  })
});
