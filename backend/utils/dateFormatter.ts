import { OrdemServico, OrdemServicoFormatada } from '../types';

export function formatDateToBR(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return null;
  }
  
  const day = String(dateObj.getUTCDate()).padStart(2, '0');
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
  const year = dateObj.getUTCFullYear();
  
  return `${day}/${month}/${year}`;
}

export function parseDateFromBR(dateBR: string | null | undefined): Date | null {
  if (!dateBR) return null;
  
  const parts = dateBR.split('/');
  if (parts.length !== 3) return null;
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);
  
  const date = new Date(year, month, day);
  
  if (isNaN(date.getTime())) {
    return null;
  }
  
  return date;
}

/**
 * Formats a service order object by formatting dates
 * @param ordemServico - Service order object
 * @returns Object with formatted dates
 */
export function formatServiceOrder(ordemServico: OrdemServico | null): OrdemServicoFormatada | null {
  if (!ordemServico) return null;
  
  return {
    id: ordemServico.id,
    numero_os: ordemServico.numero_os,
    solicitante: ordemServico.solicitante,
    unidade: ordemServico.unidade,
    setor: ordemServico.setor,
    descricao_problema: ordemServico.descricao_problema,
    data_abertura: formatDateToBR(ordemServico.data_abertura),
    servico_realizado: ordemServico.servico_realizado,
    status: ordemServico.status,
    data_fechamento: formatDateToBR(ordemServico.data_fechamento),
  };
}

export function formatServiceOrders(ordensServico: OrdemServico[]): OrdemServicoFormatada[] {
  if (!Array.isArray(ordensServico)) return [];
  
  return ordensServico.map(ordem => formatServiceOrder(ordem)).filter((ordem): ordem is OrdemServicoFormatada => ordem !== null);
}
