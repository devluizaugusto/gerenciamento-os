import { OrdemServico, OrdemServicoFormatada } from '../types';

/**
 * Formata uma data para o padrão brasileiro (DD/MM/YYYY)
 * @param date - Data a ser formatada
 * @returns Data formatada ou null
 */
export function formatDateToBR(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return null;
  }
  
  // Usar UTC para evitar problemas de timezone
  const day = String(dateObj.getUTCDate()).padStart(2, '0');
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
  const year = dateObj.getUTCFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Converte uma data do formato brasileiro (DD/MM/YYYY) para Date
 * @param dateBR - Data no formato brasileiro
 * @returns Objeto Date ou null
 */
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
 * Formata um objeto de ordem de serviço formatando as datas
 * @param ordemServico - Objeto da ordem de serviço
 * @returns Objeto com datas formatadas
 */
export function formatOrdemServico(ordemServico: OrdemServico | null): OrdemServicoFormatada | null {
  if (!ordemServico) return null;
  
  return {
    ...ordemServico,
    data_abertura: formatDateToBR(ordemServico.data_abertura),
    data_fechamento: formatDateToBR(ordemServico.data_fechamento),
  };
}

/**
 * Formata um array de ordens de serviço
 * @param ordensServico - Array de ordens de serviço
 * @returns Array com datas formatadas
 */
export function formatOrdensServico(ordensServico: OrdemServico[]): OrdemServicoFormatada[] {
  if (!Array.isArray(ordensServico)) return [];
  
  return ordensServico.map(ordem => formatOrdemServico(ordem)).filter((ordem): ordem is OrdemServicoFormatada => ordem !== null);
}
