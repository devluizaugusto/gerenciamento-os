import { TrocaComputador } from '@prisma/client';
import { formatDateToBR } from './dateFormatter';

export interface TrocaComputadorFormatada {
  id: number;
  patrimonio_cpu_antigo: string;
  patrimonio_monitor_antigo: string;
  patrimonio_cpu_novo: string;
  patrimonio_monitor_novo: string;
  unidade: string;
  setor: string;
  data_troca: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

function formatDateTimeBR(date: Date | string): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  return dateObj.toISOString();
}

export function formatTrocaComputador(troca: TrocaComputador): TrocaComputadorFormatada {
  return {
    id: troca.id,
    patrimonio_cpu_antigo: troca.patrimonio_cpu_antigo,
    patrimonio_monitor_antigo: troca.patrimonio_monitor_antigo,
    patrimonio_cpu_novo: troca.patrimonio_cpu_novo,
    patrimonio_monitor_novo: troca.patrimonio_monitor_novo,
    unidade: troca.unidade,
    setor: troca.setor,
    data_troca: formatDateToBR(troca.data_troca),
    status: troca.status,
    created_at: formatDateTimeBR(troca.created_at),
    updated_at: formatDateTimeBR(troca.updated_at),
  };
}

export function formatTrocasComputador(trocas: TrocaComputador[]): TrocaComputadorFormatada[] {
  return trocas.map(formatTrocaComputador);
}

export function parseDateInput(dateStr: string): Date {
  if (dateStr.includes('/')) {
    const [day, month, year] = dateStr.split('/');
    return new Date(`${year}-${month}-${day}T12:00:00.000Z`);
  }
  return new Date(`${dateStr}T12:00:00.000Z`);
}
