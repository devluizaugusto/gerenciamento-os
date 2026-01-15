export interface OrdemServico {
  id: number;
  numero_os: number;
  solicitante: string;
  ubs: string;
  setor: string;
  descricao_problema: string;
  data_abertura: string;
  servico_realizado?: string | null;
  status: 'aberto' | 'em_andamento' | 'finalizado';
  data_fechamento?: string | null;
}

export interface FormData {
  solicitante: string;
  ubs: string;
  setor: string;
  descricao_problema: string;
  data_abertura: string;
  servico_realizado?: string | null;
  status: 'aberto' | 'em_andamento' | 'finalizado';
  data_fechamento?: string | null;
}

export interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor?: string;
}

export type StatusFilter = 'todos' | 'aberto' | 'em_andamento' | 'finalizado';
