import { OrdemServico as PrismaOrdemServico } from '@prisma/client';

// Tipos básicos
export type StatusOrdemServico = 'aberto' | 'em_andamento' | 'finalizado';

// Tipo da Ordem de Serviço do banco
export type OrdemServico = PrismaOrdemServico;

// Tipo da Ordem de Serviço formatada (com datas em string brasileiro)
export interface OrdemServicoFormatada {
  id: number;
  numero_os: number;
  solicitante: string;
  ubs: string;
  setor: string;
  descricao_problema: string;
  data_abertura: string | null;
  servico_realizado: string | null;
  status: string;
  data_fechamento: string | null;
}

// Tipos para criação
export interface CreateOrdemServicoInput {
  solicitante: string;
  ubs: string;
  setor: string;
  descricao_problema: string;
  data_abertura: string;
  servico_realizado?: string | null;
  status?: StatusOrdemServico;
  data_fechamento?: string | null;
}

// Tipos para atualização
export interface UpdateOrdemServicoInput {
  solicitante?: string;
  ubs?: string;
  setor?: string;
  descricao_problema?: string;
  data_abertura?: string;
  servico_realizado?: string | null;
  status?: StatusOrdemServico;
  data_fechamento?: string | null;
}

// Tipos para filtros de relatório
export interface RelatorioQueryParams {
  status?: 'todos' | StatusOrdemServico;
  search?: string;
  dia?: string;
  mes?: string;
  ano?: string;
  dataInicio?: string;
  dataFim?: string;
}
