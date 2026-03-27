export interface ServiceOrder {
  id: number;
  numero_os: number;
  solicitante: string;
  unidade: string;
  setor: string;
  descricao_problema: string;
  data_abertura: string;
  servico_realizado?: string | null;
  status: 'aberto' | 'em_andamento' | 'finalizado';
  data_fechamento?: string | null;
}

export interface FormData {
  solicitante: string;
  unidade: string;
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

// ─── Ink Management Types ───────────────────────────────────
export type ModeloImpressora = string;

export interface ModeloImpressoraCadastro {
  id: number;
  nome: string;
  descricao?: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  _count?: { estoques: number };
}

export interface CreateModeloData {
  nome: string;
  descricao?: string | null;
}

export interface UpdateModeloData {
  nome?: string;
  descricao?: string | null;
  ativo?: boolean;
}

export interface SaidaTinta {
  id: number;
  estoque_id: number;
  quantidade: number;
  unidade: string;
  setor: string;
  responsavel: string;
  observacao?: string | null;
  data_saida: string;
  created_at: string;
  estoque?: EstoqueTinta;
}

export interface EstoqueTinta {
  id: number;
  modelo_impressora: ModeloImpressora;
  cor_tinta: string;
  codigo_tinta: string;
  quantidade_atual: number;
  quantidade_minima: number;
  created_at: string;
  updated_at: string;
  saidas?: SaidaTinta[];
  _count?: { saidas: number };
}

export interface CreateEstoqueData {
  modelo_impressora: ModeloImpressora;
  cor_tinta: string;
  codigo_tinta: string;
  quantidade_atual: number;
  quantidade_minima?: number;
}

export interface UpdateEstoqueData {
  modelo_impressora?: ModeloImpressora;
  cor_tinta?: string;
  codigo_tinta?: string;
  quantidade_atual?: number;
  quantidade_minima?: number;
}

export interface CreateSaidaData {
  estoque_id: number;
  quantidade: number;
  unidade: string;
  setor: string;
  responsavel: string;
  observacao?: string | null;
  data_saida: string;
}

export interface UpdateSaidaData {
  quantidade?: number;
  unidade?: string;
  setor?: string;
  responsavel?: string;
  observacao?: string | null;
  data_saida?: string;
}

export interface SaidasFilter {
  estoque_id?: number;
  unidade?: string;
  setor?: string;
  dataInicio?: string;
  dataFim?: string;
  modelo?: ModeloImpressora;
}