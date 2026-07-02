import React, { useCallback, useMemo, useState } from 'react';
import Modal from '../common/Modal';
import Toast from '../common/Toast';
import ComputerSwapCard from './ComputerSwapCard';
import ComputerSwapForm from './ComputerSwapForm';
import { TrocaComputador, TrocaComputadorFormData, TrocaComputadorStatusFilter } from '../../types';
import {
  useTrocasComputador,
  useCreateTrocaComputador,
  useUpdateTrocaComputador,
  useDeleteTrocaComputador,
} from '../../hooks/useTrocaComputador';
import { useToast } from '../../hooks/useToast';
import { UNIDADES_PREDEFINIDAS } from '../../constants/unidades';

const ComputerSwapManagement: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<TrocaComputadorStatusFilter>('todos');
  const [unidadeFilter, setUnidadeFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedTroca, setSelectedTroca] = useState<TrocaComputador | null>(null);

  const { data: trocas = [], isLoading, error, refetch } = useTrocasComputador();
  const createMutation = useCreateTrocaComputador();
  const updateMutation = useUpdateTrocaComputador();
  const deleteMutation = useDeleteTrocaComputador();
  const { toasts, removeToast, success, error: errorToast } = useToast();

  const filteredTrocas = useMemo(() => {
    let filtered = [...trocas];

    if (statusFilter !== 'todos') {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    if (unidadeFilter) {
      filtered = filtered.filter((t) => t.unidade === unidadeFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((t) =>
        t.patrimonio_cpu_antigo.toLowerCase().includes(term) ||
        t.patrimonio_monitor_antigo.toLowerCase().includes(term) ||
        t.patrimonio_cpu_novo.toLowerCase().includes(term) ||
        t.patrimonio_monitor_novo.toLowerCase().includes(term) ||
        t.unidade.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [trocas, statusFilter, unidadeFilter, searchTerm]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setSelectedTroca(null);
  }, []);

  const handleCreate = useCallback(() => {
    setSelectedTroca(null);
    setShowModal(true);
  }, []);

  const handleEdit = useCallback((troca: TrocaComputador) => {
    setSelectedTroca(troca);
    setShowModal(true);
  }, []);

  const handleSubmit = async (formData: TrocaComputadorFormData) => {
    try {
      if (selectedTroca) {
        await updateMutation.mutateAsync({ id: selectedTroca.id, data: formData });
        success('Troca de computador atualizada com sucesso!');
      } else {
        await createMutation.mutateAsync(formData);
        success('Troca de computador registrada com sucesso!');
      }
      closeModal();
    } catch (err: any) {
      errorToast(err.response?.data?.error || 'Erro ao salvar registro de troca');
    }
  };

  const handleDelete = useCallback(async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este registro de troca?')) {
      try {
        await deleteMutation.mutateAsync(id);
        success('Registro de troca excluído com sucesso!');
      } catch (err: any) {
        errorToast(err.response?.data?.error || 'Erro ao excluir registro de troca');
      }
    }
  }, [deleteMutation, success, errorToast]);

  const statusPills = [
    { value: 'todos' as const, label: 'Todos', count: trocas.length, activeCls: 'bg-slate-800 border-slate-800 text-white', cls: 'border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50' },
    { value: 'em_andamento' as const, label: 'Em Andamento', count: trocas.filter((t) => t.status === 'em_andamento').length, activeCls: 'bg-amber-500 border-amber-500 text-white', cls: 'border-amber-200 text-amber-600 hover:border-amber-300 hover:bg-amber-50' },
    { value: 'finalizado' as const, label: 'Finalizados', count: trocas.filter((t) => t.status === 'finalizado').length, activeCls: 'bg-emerald-600 border-emerald-600 text-white', cls: 'border-emerald-200 text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50' },
  ];

  return (
    <div className="page-inner">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-800">Troca de Computadores</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Controle de substituição de CPU e monitor — Setor Vacina
          </p>
        </div>
        <button onClick={handleCreate} className="btn btn-primary w-full sm:w-auto">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Nova Troca
        </button>
      </div>

      <div className="filter-bar bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-sm px-3 py-3 sm:px-4 sm:py-4 mb-4">
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
          {statusPills.map((p) => (
            <button
              key={p.value}
              onClick={() => setStatusFilter(p.value)}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold rounded-lg border transition-all duration-150 ${statusFilter === p.value ? p.activeCls : p.cls}`}
            >
              {p.label}
              <span className={`ml-1 sm:ml-1.5 px-1 sm:px-1.5 py-0.5 rounded-full text-[10px] font-bold ${statusFilter === p.value ? 'bg-white/25' : 'bg-slate-100 text-slate-500'}`}>
                {p.count}
              </span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por patrimônio ou unidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-9"
            />
          </div>
          <div>
            <select
              value={unidadeFilter}
              onChange={(e) => setUnidadeFilter(e.target.value)}
              className="input"
            >
              <option value="">Todas as unidades</option>
              {UNIDADES_PREDEFINIDAS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <p className="text-sm text-slate-500">
          {filteredTrocas.length === 0 ? (
            'Nenhum registro encontrado'
          ) : (
            <>
              <span className="font-semibold text-slate-700">{filteredTrocas.length}</span>{' '}
              {filteredTrocas.length === 1 ? 'registro encontrado' : 'registros encontrados'}
            </>
          )}
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-10 h-10 border-2 border-slate-200 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="card p-6 text-center border-red-200">
          <p className="text-sm font-semibold text-red-600 mb-1">Erro ao carregar dados</p>
          <p className="text-xs text-red-500 mb-4">{(error as Error).message}</p>
          <button onClick={() => refetch()} className="btn btn-primary text-xs">Tentar Novamente</button>
        </div>
      )}

      {!isLoading && !error && (
        filteredTrocas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-700 mb-1">Nenhuma troca registrada</h3>
            <p className="text-sm text-slate-500 mb-4">Clique em &quot;Nova Troca&quot; para registrar a primeira substituição.</p>
            <button onClick={handleCreate} className="btn btn-outline text-xs">Registrar Troca</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredTrocas.map((troca) => (
              <ComputerSwapCard
                key={troca.id}
                troca={troca}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )
      )}

      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={selectedTroca ? `Editar Troca #${selectedTroca.id}` : 'Nova Troca de Computador'}
      >
        <ComputerSwapForm
          troca={selectedTroca}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>

      {toasts.map((toast) => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

export default ComputerSwapManagement;
