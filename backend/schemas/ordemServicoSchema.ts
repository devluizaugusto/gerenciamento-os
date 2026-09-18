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
  }).superRefine((data, ctx) => {
    const parseDate = (value?: string | null) => {
      if (!value) return null;
      const matchBR = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (matchBR) return new Date(Number(matchBR[3]), Number(matchBR[2]) - 1, Number(matchBR[1]));
      const matchISO = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (matchISO) return new Date(Number(matchISO[1]), Number(matchISO[2]) - 1, Number(matchISO[3]));
      return null;
    };
    const abertura = parseDate(data.data_abertura);
    const fechamento = parseDate(data.data_fechamento);
    const hoje = new Date();
    hoje.setHours(23, 59, 59, 999);

    if (abertura && abertura > hoje) {
      ctx.addIssue({ code: 'custom', path: ['data_abertura'], message: 'A data de abertura não pode ser futura' });
    }
    if (data.status === 'finalizado') {
      if (!data.servico_realizado || !data.servico_realizado.trim()) {
        ctx.addIssue({ code: 'custom', path: ['servico_realizado'], message: 'Informe o serviço realizado para finalizar a OS' });
      }
      if (!fechamento) {
        ctx.addIssue({ code: 'custom', path: ['data_fechamento'], message: 'Informe a data de fechamento para finalizar a OS' });
      }
      if (abertura && fechamento && fechamento < abertura) {
        ctx.addIssue({ code: 'custom', path: ['data_fechamento'], message: 'A data de fechamento não pode ser anterior à abertura' });
      }
    } else if (data.data_fechamento) {
      ctx.addIssue({ code: 'custom', path: ['data_fechamento'], message: 'Data de fechamento só pode ser informada em OS finalizada' });
    }
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
  .superRefine((data, ctx) => {
    const parseDate = (value?: string | null) => {
      if (!value) return null;
      const br = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (br) return new Date(Number(br[3]), Number(br[2]) - 1, Number(br[1]));
      const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
      return null;
    };
    const abertura = parseDate(data.data_abertura);
    const fechamento = parseDate(data.data_fechamento);
    const hoje = new Date();
    hoje.setHours(23, 59, 59, 999);

    if (abertura && abertura > hoje) {
      ctx.addIssue({ code: 'custom', path: ['data_abertura'], message: 'A data de abertura não pode ser futura' });
    }
    if (data.status === 'finalizado') {
      if (data.servico_realizado !== undefined && !data.servico_realizado?.trim()) {
        ctx.addIssue({ code: 'custom', path: ['servico_realizado'], message: 'Informe o serviço realizado para finalizar a OS' });
      }
      if (data.data_fechamento !== undefined && !fechamento) {
        ctx.addIssue({ code: 'custom', path: ['data_fechamento'], message: 'Informe uma data de fechamento válida para finalizar a OS' });
      }
      if (abertura && fechamento && fechamento < abertura) {
        ctx.addIssue({ code: 'custom', path: ['data_fechamento'], message: 'A data de fechamento não pode ser anterior à abertura' });
      }
    } else if (data.data_fechamento) {
      ctx.addIssue({ code: 'custom', path: ['data_fechamento'], message: 'Data de fechamento só pode ser informada em OS finalizada' });
    }
  })
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
