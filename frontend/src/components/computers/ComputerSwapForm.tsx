import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { trocaComputadorSchema, TrocaComputadorFormData } from '../../schemas/trocaComputadorSchema';
import { TrocaComputador } from '../../types';
import { UNIDADES_PREDEFINIDAS, SETOR_TROCA_COMPUTADOR } from '../../constants/unidades';

interface ComputerSwapFormProps {
  troca?: TrocaComputador | null;
  onSubmit: (formData: TrocaComputadorFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const formatDateForInput = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '';
  if (dateStr.includes('/')) {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
  }
  return dateStr;
};

const formatDateToBR = (dateStr: string): string => {
  if (!dateStr) return '';
  if (dateStr.includes('-')) {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }
  return dateStr;
};

const ComputerSwapForm: React.FC<ComputerSwapFormProps> = ({
  troca,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TrocaComputadorFormData>({
    resolver: zodResolver(trocaComputadorSchema),
    defaultValues: {
      patrimonio_cpu_antigo: '',
      patrimonio_monitor_antigo: '',
      patrimonio_cpu_novo: '',
      patrimonio_monitor_novo: '',
      unidade: '',
      data_troca: '',
      status: 'em_andamento',
    },
  });

  useEffect(() => {
    if (troca) {
      reset({
        patrimonio_cpu_antigo: troca.patrimonio_cpu_antigo,
        patrimonio_monitor_antigo: troca.patrimonio_monitor_antigo,
        patrimonio_cpu_novo: troca.patrimonio_cpu_novo,
        patrimonio_monitor_novo: troca.patrimonio_monitor_novo,
        unidade: troca.unidade,
        data_troca: formatDateForInput(troca.data_troca),
        status: troca.status,
      });
    }
  }, [troca, reset]);

  const handleFormSubmit = (data: TrocaComputadorFormData) => {
    onSubmit({
      ...data,
      data_troca: formatDateToBR(data.data_troca),
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 sm:space-y-6">
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 rounded-xl border-2 border-slate-200">
        <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
          <span className="text-xl">🖥️</span>
          Equipamentos Antigos
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="patrimonio_cpu_antigo" className="label">
              Patrimônio CPU Antigo <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              id="patrimonio_cpu_antigo"
              {...register('patrimonio_cpu_antigo')}
              className={`input uppercase ${errors.patrimonio_cpu_antigo ? 'border-danger ring-2 ring-danger/20' : ''}`}
              placeholder="Nº patrimônio CPU antigo"
            />
            {errors.patrimonio_cpu_antigo && (
              <p className="text-danger text-xs mt-1.5">{errors.patrimonio_cpu_antigo.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="patrimonio_monitor_antigo" className="label">
              Patrimônio Monitor Antigo <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              id="patrimonio_monitor_antigo"
              {...register('patrimonio_monitor_antigo')}
              className={`input uppercase ${errors.patrimonio_monitor_antigo ? 'border-danger ring-2 ring-danger/20' : ''}`}
              placeholder="Nº patrimônio monitor antigo"
            />
            {errors.patrimonio_monitor_antigo && (
              <p className="text-danger text-xs mt-1.5">{errors.patrimonio_monitor_antigo.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl border-2 border-blue-100">
        <h3 className="text-base sm:text-lg font-bold text-blue-900 mb-3 sm:mb-4 flex items-center gap-2">
          <span className="text-xl">💻</span>
          Equipamentos Novos
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="patrimonio_cpu_novo" className="label text-blue-900">
              Patrimônio CPU Novo <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              id="patrimonio_cpu_novo"
              {...register('patrimonio_cpu_novo')}
              className={`input uppercase ${errors.patrimonio_cpu_novo ? 'border-danger ring-2 ring-danger/20' : 'border-blue-200 focus:border-blue-500'}`}
              placeholder="Nº patrimônio CPU novo"
            />
            {errors.patrimonio_cpu_novo && (
              <p className="text-danger text-xs mt-1.5">{errors.patrimonio_cpu_novo.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="patrimonio_monitor_novo" className="label text-blue-900">
              Patrimônio Monitor Novo <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              id="patrimonio_monitor_novo"
              {...register('patrimonio_monitor_novo')}
              className={`input uppercase ${errors.patrimonio_monitor_novo ? 'border-danger ring-2 ring-danger/20' : 'border-blue-200 focus:border-blue-500'}`}
              placeholder="Nº patrimônio monitor novo"
            />
            {errors.patrimonio_monitor_novo && (
              <p className="text-danger text-xs mt-1.5">{errors.patrimonio_monitor_novo.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-4 sm:p-6 rounded-xl border-2 border-emerald-100">
        <h3 className="text-base sm:text-lg font-bold text-emerald-900 mb-3 sm:mb-4 flex items-center gap-2">
          <span className="text-xl">🏥</span>
          Local e Status
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="unidade" className="label text-emerald-900">
              Unidade (UBS) <span className="text-danger">*</span>
            </label>
            <select
              id="unidade"
              {...register('unidade')}
              className={`input ${errors.unidade ? 'border-danger ring-2 ring-danger/20' : 'border-emerald-200 focus:border-emerald-500'}`}
            >
              <option value="">Selecione a unidade</option>
              {UNIDADES_PREDEFINIDAS.map((unidade) => (
                <option key={unidade} value={unidade}>{unidade}</option>
              ))}
            </select>
            {errors.unidade && (
              <p className="text-danger text-xs mt-1.5">{errors.unidade.message}</p>
            )}
          </div>
          <div>
            <label className="label text-emerald-900">Setor</label>
            <input
              type="text"
              value={SETOR_TROCA_COMPUTADOR}
              disabled
              className="input bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed uppercase"
            />
          </div>
          <div>
            <label htmlFor="data_troca" className="label text-emerald-900">
              Data da Troca <span className="text-danger">*</span>
            </label>
            <input
              type="date"
              id="data_troca"
              {...register('data_troca')}
              className={`input ${errors.data_troca ? 'border-danger ring-2 ring-danger/20' : 'border-emerald-200 focus:border-emerald-500'}`}
            />
            {errors.data_troca && (
              <p className="text-danger text-xs mt-1.5">{errors.data_troca.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="status" className="label text-emerald-900">
              Status <span className="text-danger">*</span>
            </label>
            <select
              id="status"
              {...register('status')}
              className={`input ${errors.status ? 'border-danger ring-2 ring-danger/20' : 'border-emerald-200 focus:border-emerald-500'}`}
            >
              <option value="em_andamento">🟡 Em Andamento</option>
              <option value="finalizado">🟢 Finalizado</option>
            </select>
            {errors.status && (
              <p className="text-danger text-xs mt-1.5">{errors.status.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 sm:justify-end pt-4 border-t-2 border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="btn !bg-red-600 hover:!bg-red-700 text-white w-full sm:w-auto px-6 py-3 text-sm font-semibold"
          disabled={isSubmitting || isLoading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn !bg-green-600 hover:!bg-green-700 text-white w-full sm:w-auto px-6 py-3 text-sm font-semibold"
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting || isLoading
            ? (troca ? 'Atualizando...' : 'Salvando...')
            : (troca ? 'Atualizar Troca' : 'Registrar Troca')}
        </button>
      </div>
    </form>
  );
};

export default ComputerSwapForm;
