import { StatusConfig } from '../types';

export const statusConfig: Record<string, StatusConfig> = {
  aberto: {
    label: 'Aberto',
    color: '#dc2626', // Vibrant red
    bgColor: '#fee2e2',
    borderColor: '#fecaca'
  },
  em_andamento: {
    label: 'Em Andamento',
    color: '#f59e0b', // Vibrant yellow/orange
    bgColor: '#fef3c7',
    borderColor: '#fde68a'
  },
  finalizado: {
    label: 'Finalizado',
    color: '#16a34a', // Vibrant green
    bgColor: '#dcfce7',
    borderColor: '#bbf7d0'
  }
};

export const getStatusConfig = (status: string): StatusConfig => {
  return statusConfig[status] || statusConfig.aberto;
};
