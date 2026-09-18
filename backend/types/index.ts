export type StatusOrdemServico = 'aberto' | 'em_andamento' | 'finalizado';
export type RoleUsuario = 'admin' | 'tecnico' | 'visualizador';

export interface UsuarioPayload {
  id: number;
  nome: string;
  email: string;
  role: RoleUsuario;
}

// Types for Prisma model (raw DB types)
export interface OrdemServico {
  id: number;
  numero_os: number;
  solicitante: string;
  unidade: string;
  setor: string;
  descricao_problema: string;
  data_abertura: Date | null;
  servico_realizado?: string | null;
  status: string;
  data_fechamento?: Date | null;
}

// Formatted type (dates as strings)
export interface OrdemServicoFormatada {
  id: number;
  numero_os: number;
  solicitante: string;
  unidade: string;
  setor: string;
  descricao_problema: string;
  data_abertura: string | null;
  servico_realizado?: string | null;
  status: string;
  data_fechamento?: string | null;
}

declare global {
  namespace Express {
    interface Request {
      usuario?: UsuarioPayload;
    }
  }
}
