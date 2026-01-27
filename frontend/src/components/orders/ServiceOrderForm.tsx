import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { serviceOrderSchema, ServiceOrderFormData } from '../../schemas/ordemServicoSchema';
import { ServiceOrder } from '../../types';

interface ServiceOrderFormProps {
  order?: ServiceOrder | null;
  onSubmit: (formData: ServiceOrderFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ServiceOrderForm: React.FC<ServiceOrderFormProps> = ({ 
  order, 
  onSubmit, 
  onCancel,
  isLoading = false 
}) => {
  const [showUnidadeInput, setShowUnidadeInput] = useState(false);
  const [showSetorInput, setShowSetorInput] = useState(false);

  // Configure React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<ServiceOrderFormData>({
    resolver: zodResolver(serviceOrderSchema),
    defaultValues: {
      solicitante: '',
      unidade: '',
      setor: '',
      descricao_problema: '',
      data_abertura: '',
      servico_realizado: '',
      status: 'aberto',
      data_fechamento: '',
    },
  });

  // Predefined options lists
  const unidadesPredefinidas = [
    'URUCUBA', 'MENDES', 'GAMELEIRA', 'JUA', 'LAGOA AZUL',
    'RIBEIRO DO MEL', 'SANTANA', 'SANTA CRUZ', 'ALEGRIA', 'REDENTOR',
    'JOAO ERNESTO', 'CONGAL', 'SANTA TEREZINHA', 'SANTO ANTONIO',
    'N. SRA DE FATIMA', 'CONVALES', 'SAO SEBASTIAO', 'OTACIO DE LEMOS',
    'PONTO CERTO', 'CTA', 'CER', 'CEO', 'POLICLINICA', 'SAMU',
    'HOSPITAL DE CAMPANHA', 'VISA', 'VIGILANCIA AMBIENTAL', 'CAPS',
    'RESIDENCIA TERAPEUTICA', 'UNIDADE DE ACOLHIMENTO', 'SEDE DA SECRETARIA',
    'CAF', 'LABORATÓRIO', 'CAPS DAS 3 PONTES'
  ];

  const setoresPredefinidos = [
    'VACINA', 'MEDICO', 'DENTISTA', 'ENFERMEIRA', 'RECEPÇÃO',
    'SALA ADM', 'VIGILÂNCIA EPIDEMIOLOGICA', 'REGULAÇÃO', 'RH',
    'ATENÇÃO BÁSICA', 'UBS', 'GABINETE', 'PNI', 'OUVIDORIA',
    'ADMINISTRAÇÃO', 'TELECARDIO', 'FINCANCEIRO/ADM'
  ];

  // Watch current values
  const unidadeValue = watch('unidade');
  const setorValue = watch('setor');

  // Convert date from Brazilian format (DD/MM/YYYY) to input format (YYYY-MM-DD)
  const formatDateForInput = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '';
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/');
      return `${year}-${month}-${day}`;
    }
    return dateStr;
  };

  // Convert date from input format (YYYY-MM-DD) to Brazilian format (DD/MM/YYYY)
  const formatDateToBR = (dateStr: string): string => {
    if (!dateStr) return '';
    if (dateStr.includes('-')) {
      const [year, month, day] = dateStr.split('-');
      const formatted = `${day}/${month}/${year}`;
      console.log(`📅 [FORMAT] ${dateStr} => ${formatted}`);
      return formatted;
    }
    return dateStr;
  };

  // Fill form when there's an order for editing
  useEffect(() => {
    if (order) {
      const unidadeVal = order.unidade || '';
      const setorVal = order.setor || '';
      
      reset({
        solicitante: order.solicitante || '',
        unidade: unidadeVal,
        setor: setorVal,
        descricao_problema: order.descricao_problema || '',
        data_abertura: formatDateForInput(order.data_abertura),
        servico_realizado: order.servico_realizado || '',
        status: order.status || 'aberto',
        data_fechamento: formatDateForInput(order.data_fechamento),
      });
      
      // Check if values are customized
      setShowUnidadeInput(!!unidadeVal && !unidadesPredefinidas.includes(unidadeVal));
      setShowSetorInput(!!setorVal && !setoresPredefinidos.includes(setorVal));
    }
  }, [order, reset]);

  // Form submit handler
  const handleFormSubmit = (data: ServiceOrderFormData) => {
    console.log('📝 [FORM] Form data (raw):', data);
    
    // Convert dates to Brazilian format
    const formattedData: ServiceOrderFormData = {
      ...data,
      data_abertura: formatDateToBR(data.data_abertura),
      data_fechamento: data.data_fechamento && data.data_fechamento.trim() !== ''
        ? formatDateToBR(data.data_fechamento) 
        : null,
      servico_realizado: data.servico_realizado && data.servico_realizado.trim() !== ''
        ? data.servico_realizado.trim()
        : null,
    };

    console.log('📤 [FORM] Formatted data to send:', formattedData);
    onSubmit(formattedData);
  };

  // Handlers to toggle between select and custom input
  const handleUnidadeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === '__custom__') {
      setShowUnidadeInput(true);
      setValue('unidade', '');
    } else {
      setShowUnidadeInput(false);
      setValue('unidade', value);
    }
  };

  const handleSetorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === '__custom__') {
      setShowSetorInput(true);
      setValue('setor', '');
    } else {
      setShowSetorInput(false);
      setValue('setor', value);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Section: Requester Information */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-100">
        <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">👤</span>
          Informações do Solicitante
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Solicitante */}
          <div className="md:col-span-2">
            <label htmlFor="solicitante" className="label text-blue-900">
              <span className="text-lg mr-2">📝</span>
              Solicitante <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              id="solicitante"
              {...register('solicitante')}
              className={`input uppercase ${errors.solicitante ? 'border-danger ring-2 ring-danger/20' : 'border-blue-200 focus:border-blue-500'}`}
              placeholder="Nome completo do solicitante"
              onChange={(e) => {
                e.target.value = e.target.value.toUpperCase();
                setValue('solicitante', e.target.value);
              }}
            />
            {errors.solicitante && (
              <p className="text-danger text-sm mt-2 flex items-center gap-1 animate-slideDown">
                <span>⚠️</span> {errors.solicitante.message}
              </p>
            )}
          </div>

          {/* Unidade */}
          <div>
            <label htmlFor="unidade" className="label text-blue-900">
              <span className="text-lg mr-2">🏥</span>
              Unidade <span className="text-danger">*</span>
            </label>
            {showUnidadeInput ? (
              <div className="space-y-2">
                <input
                  type="text"
                  id="unidade"
                  {...register('unidade')}
                  className={`input ${errors.unidade ? 'border-danger ring-2 ring-danger/20' : 'border-blue-200 focus:border-blue-500'}`}
                  placeholder="Digite a unidade"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowUnidadeInput(false);
                    setValue('unidade', '');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                >
                  ← Voltar para lista de unidades
                </button>
              </div>
            ) : (
              <select
                id="unidade"
                onChange={handleUnidadeChange}
                value={unidadeValue}
                className={`input ${errors.unidade ? 'border-danger ring-2 ring-danger/20' : 'border-blue-200 focus:border-blue-500'}`}
              >
                <option value="">Selecione uma unidade</option>
                {unidadesPredefinidas.map((unidade) => (
                  <option key={unidade} value={unidade}>
                    {unidade}
                  </option>
                ))}
                <option value="__custom__">➕ Adicionar outra unidade</option>
              </select>
            )}
            {errors.unidade && (
              <p className="text-danger text-sm mt-2 flex items-center gap-1 animate-slideDown">
                <span>⚠️</span> {errors.unidade.message}
              </p>
            )}
          </div>

          {/* Setor */}
          <div>
            <label htmlFor="setor" className="label text-blue-900">
              <span className="text-lg mr-2">🏢</span>
              Setor <span className="text-danger">*</span>
            </label>
            {showSetorInput ? (
              <div className="space-y-2">
                <input
                  type="text"
                  id="setor"
                  {...register('setor')}
                  className={`input ${errors.setor ? 'border-danger ring-2 ring-danger/20' : 'border-blue-200 focus:border-blue-500'}`}
                  placeholder="Digite o setor"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowSetorInput(false);
                    setValue('setor', '');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                >
                  ← Voltar para lista de setores
                </button>
              </div>
            ) : (
              <select
                id="setor"
                onChange={handleSetorChange}
                value={setorValue}
                className={`input ${errors.setor ? 'border-danger ring-2 ring-danger/20' : 'border-blue-200 focus:border-blue-500'}`}
              >
                <option value="">Selecione um setor</option>
                {setoresPredefinidos.map((setor) => (
                  <option key={setor} value={setor}>
                    {setor}
                  </option>
                ))}
                <option value="__custom__">➕ Adicionar outro setor</option>
              </select>
            )}
            {errors.setor && (
              <p className="text-danger text-sm mt-2 flex items-center gap-1 animate-slideDown">
                <span>⚠️</span> {errors.setor.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Section: Problem Description */}
      <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-xl border-2 border-red-100">
        <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">🔧</span>
          Descrição do Problema
        </h3>
        
        <div>
          <label htmlFor="descricao_problema" className="label text-red-900">
            <span className="text-lg mr-2">📋</span>
            Descrição <span className="text-danger">*</span>
          </label>
          <textarea
            id="descricao_problema"
            {...register('descricao_problema')}
            rows={5}
            className={`input resize-none uppercase ${errors.descricao_problema ? 'border-danger ring-2 ring-danger/20' : 'border-red-200 focus:border-red-500'}`}
            placeholder="Descreva detalhadamente o problema encontrado..."
            onChange={(e) => {
              e.target.value = e.target.value.toUpperCase();
              setValue('descricao_problema', e.target.value);
            }}
          />
          {errors.descricao_problema && (
            <p className="text-danger text-sm mt-2 flex items-center gap-1 animate-slideDown">
              <span>⚠️</span> {errors.descricao_problema.message}
            </p>
          )}
        </div>
      </div>

      {/* Section: Dates and Status */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-100">
        <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">📅</span>
          Datas e Status
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Data de Abertura */}
          <div>
            <label htmlFor="data_abertura" className="label text-purple-900">
              <span className="text-lg mr-2">📆</span>
              Data de Abertura <span className="text-danger">*</span>
            </label>
            <input
              type="date"
              id="data_abertura"
              {...register('data_abertura')}
              className={`input ${errors.data_abertura ? 'border-danger ring-2 ring-danger/20' : 'border-purple-200 focus:border-purple-500'}`}
            />
            {errors.data_abertura && (
              <p className="text-danger text-sm mt-2 flex items-center gap-1 animate-slideDown">
                <span>⚠️</span> {errors.data_abertura.message}
              </p>
            )}
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="label text-purple-900">
              <span className="text-lg mr-2">🔄</span>
              Status <span className="text-danger">*</span>
            </label>
            <select
              id="status"
              {...register('status')}
              className={`input ${errors.status ? 'border-danger ring-2 ring-danger/20' : 'border-purple-200 focus:border-purple-500'}`}
            >
              <option value="aberto">🔴 Aberto</option>
              <option value="em_andamento">🟡 Em Andamento</option>
              <option value="finalizado">🟢 Finalizado</option>
            </select>
            {errors.status && (
              <p className="text-danger text-sm mt-2 flex items-center gap-1 animate-slideDown">
                <span>⚠️</span> {errors.status.message}
              </p>
            )}
          </div>

          {/* Data de Fechamento */}
          <div>
            <label htmlFor="data_fechamento" className="label text-purple-900">
              <span className="text-lg mr-2">✅</span>
              Data de Fechamento
            </label>
            <input
              type="date"
              id="data_fechamento"
              {...register('data_fechamento')}
              className="input border-purple-200 focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Section: Service Performed */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-100">
        <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">✅</span>
          Serviço Realizado
        </h3>
        
        <div>
          <label htmlFor="servico_realizado" className="label text-green-900">
            <span className="text-lg mr-2">🛠️</span>
            Descrição do Serviço
          </label>
          <textarea
            id="servico_realizado"
            {...register('servico_realizado')}
            rows={5}
            className="input resize-none uppercase border-green-200 focus:border-green-500"
            placeholder="Descreva o serviço realizado para resolução do problema..."
            onChange={(e) => {
              e.target.value = e.target.value.toUpperCase();
              setValue('servico_realizado', e.target.value);
            }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end pt-6 border-t-2 border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="btn !bg-red-600 hover:!bg-red-700 text-white px-8 py-3 text-base font-semibold hover:scale-105 transition-transform shadow-lg"
          disabled={isSubmitting || isLoading}
        >
          ❌ Cancelar
        </button>
        <button
          type="submit"
          className="btn !bg-green-600 hover:!bg-green-700 text-white px-8 py-3 text-base font-semibold hover:scale-105 transition-transform shadow-lg"
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting || isLoading ? (
            <>
              <span className="inline-block animate-spin mr-2">⏳</span>
              {order ? 'Atualizando...' : 'Criando...'}
            </>
          ) : (
            order ? '✅ Atualizar Ordem de Serviço' : '✅ Criar Ordem de Serviço'
          )}
        </button>
      </div>
    </form>
  );
};

export default ServiceOrderForm;
