import React, { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { EstoqueTinta, SaidaTinta, ModeloImpressora, CreateEstoqueData, UpdateEstoqueData, CreateSaidaData } from '../../types';
import Modal from '../common/Modal';
import {
  useEstoqueTintas,
  useCreateEstoque,
  useUpdateEstoque,
  useDeleteEstoque,
  useSaidasTinta,
  useCreateSaida,
  useDeleteSaida,
} from '../../hooks/useTinta';
import { useToast } from '../../hooks/useToast';
import Toast from '../common/Toast';

const InkSaidaForm = lazy(() => import('./InkSaidaForm'));
const InkEstoqueForm = lazy(() => import('./InkEstoqueForm'));

// ─── Listas predefinidas (igual ao ServiceOrderForm) ──────────
const UNIDADES_PREDEFINIDAS = [
  'URUCUBA', 'MENDES', 'GAMELEIRA', 'JUA', 'LAGOA AZUL',
  'RIBEIRO DO MEL', 'SANTANA', 'SANTA CRUZ', 'ALEGRIA', 'REDENTOR',
  'JOAO ERNESTO', 'CONGAL', 'SANTA TEREZINHA', 'SANTO ANTONIO',
  'N. SRA DE FATIMA', 'CONVALES', 'SAO SEBASTIAO', 'OTACIO DE LEMOS',
  'PONTO CERTO', 'CTA', 'CER', 'CEO', 'POLICLINICA', 'SAMU',
  'HOSPITAL DE CAMPANHA', 'VISA', 'VIGILANCIA AMBIENTAL', 'CAPS',
  'RESIDENCIA TERAPEUTICA', 'UNIDADE DE ACOLHIMENTO', 'SEDE DA SECRETARIA',
  'CAF', 'LABORATÓRIO', 'CAPS III DAS PONTES'
].sort();

const SETORES_PREDEFINIDOS = [
  'VACINA', 'MEDICO', 'DENTISTA', 'ENFERMEIRA', 'RECEPÇÃO',
  'SALA ADM', 'VIGILÂNCIA EPIDEMIOLOGICA', 'REGULAÇÃO', 'RH',
  'ATENÇÃO BÁSICA', 'UBS', 'GABINETE', 'PNI', 'OUVIDORIA',
  'ADMINISTRAÇÃO', 'TELECARDIO', 'FINCANCEIRO/ADM'
].sort();

// ─── Helpers ──────────────────────────────────────────────────
const COR_STYLE: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  Preto:   { bg: 'bg-gray-900',   border: 'border-gray-700', text: 'text-white',      badge: 'bg-gray-800 text-white' },
  Ciano:   { bg: 'bg-cyan-500',   border: 'border-cyan-600', text: 'text-white',      badge: 'bg-cyan-100 text-cyan-800' },
  Magenta: { bg: 'bg-pink-600',   border: 'border-pink-700', text: 'text-white',      badge: 'bg-pink-100 text-pink-800' },
  Amarelo: { bg: 'bg-yellow-400', border: 'border-yellow-500', text: 'text-yellow-900', badge: 'bg-yellow-100 text-yellow-800' },
};

const formatDate = (isoOrBr: string): string => {
  if (!isoOrBr) return '—';
  // If already BR format
  if (isoOrBr.includes('/')) return isoOrBr;
  const [y, m, d] = isoOrBr.split('T')[0].split('-');
  return `${d}/${m}/${y}`;
};

// ─── Card de estoque ─────────────────────────────────────────
interface EstoqueCardProps {
  estoque: EstoqueTinta;
  onSaida: (e: EstoqueTinta) => void;
  onEdit: (e: EstoqueTinta) => void;
  onDelete: (id: number) => void;
  onViewHistory: (e: EstoqueTinta) => void;
}

const EstoqueCard: React.FC<EstoqueCardProps> = ({ estoque, onSaida, onEdit, onDelete, onViewHistory }) => {
  const style = COR_STYLE[estoque.cor_tinta] ?? { bg: 'bg-primary', border: 'border-primary-hover', text: 'text-white', badge: 'bg-red-100 text-red-800' };
  const isCritical = estoque.quantidade_atual <= estoque.quantidade_minima;
  const isOut = estoque.quantidade_atual === 0;

  return (
    <div className={`bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
      isOut ? 'border-red-400' : isCritical ? 'border-orange-400' : 'border-gray-200'
    }`}>
      {/* Header colorido */}
      <div className={`${style.bg} rounded-t-xl px-5 py-4 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <span className={`text-2xl font-black ${style.text}`}>
            {estoque.cor_tinta === 'Preto' ? '⬛' :
             estoque.cor_tinta === 'Ciano' ? '🔵' :
             estoque.cor_tinta === 'Magenta' ? '🟣' : '🟡'}
          </span>
          <div>
            <p className={`font-bold text-base ${style.text}`}>{estoque.cor_tinta}</p>
            <p className={`text-xs opacity-80 ${style.text}`}>Código: {estoque.codigo_tinta}</p>
          </div>
        </div>
        <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
          Epson {estoque.modelo_impressora}
        </span>
      </div>

      {/* Body */}
      <div className="p-5">
        {/* Alerta */}
        {isOut && (
          <div className="mb-3 bg-red-50 border border-red-300 rounded-lg px-3 py-2 flex items-center gap-2 text-red-700 text-sm font-semibold">
            🚨 Sem estoque!
          </div>
        )}
        {!isOut && isCritical && (
          <div className="mb-3 bg-orange-50 border border-orange-300 rounded-lg px-3 py-2 flex items-center gap-2 text-orange-700 text-sm font-semibold">
            ⚠️ Estoque crítico!
          </div>
        )}

        {/* Quantidade */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-center">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Disponível</p>
            <p className={`text-4xl font-black ${isOut ? 'text-red-600' : isCritical ? 'text-orange-600' : 'text-green-700'}`}>
              {estoque.quantidade_atual}
            </p>
            <p className="text-xs text-gray-400">unidade{estoque.quantidade_atual !== 1 ? 's' : ''}</p>
          </div>
          <div className="w-px h-16 bg-gray-200" />
          <div className="text-center">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Mínimo</p>
            <p className="text-3xl font-bold text-gray-400">{estoque.quantidade_minima}</p>
            <p className="text-xs text-gray-400">alerta</p>
          </div>
          <div className="w-px h-16 bg-gray-200" />
          <div className="text-center">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Últimas saídas</p>
            <p className="text-3xl font-bold text-primary">{estoque.saidas?.length ?? 0}</p>
            <p className="text-xs text-gray-400">registros</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Nível do estoque</span>
            <span>{Math.min(100, Math.round((estoque.quantidade_atual / Math.max(estoque.quantidade_minima * 3, 1)) * 100))}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isOut ? 'bg-red-500' : isCritical ? 'bg-orange-500' : 'bg-green-500'
              }`}
              style={{
                width: `${Math.min(100, (estoque.quantidade_atual / Math.max(estoque.quantidade_minima * 3, 1)) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Ações */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onSaida(estoque)}
            disabled={isOut}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold text-white bg-gradient-to-br from-primary-hover via-primary to-primary-light rounded-xl hover:from-primary-hover hover:to-primary-hover transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            title="Registrar saída de tinta"
          >
            🖨️ Registrar Saída
          </button>
          <button
            onClick={() => onViewHistory(estoque)}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold text-primary bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-all"
            title="Ver histórico de saídas"
          >
            📋 Histórico
          </button>
          <button
            onClick={() => onEdit(estoque)}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold text-orange-700 bg-orange-50 border border-orange-200 rounded-xl hover:bg-orange-100 transition-all"
            title="Editar estoque / registrar entrada"
          >
            ✏️ Entrada/Editar
          </button>
          <button
            onClick={() => onDelete(estoque.id)}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-all"
            title="Remover este item do estoque"
          >
            🗑️ Remover
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Linha do histórico ───────────────────────────────────────
interface SaidaRowProps {
  saida: SaidaTinta;
  onDelete: (id: number) => void;
}

const SaidaRow: React.FC<SaidaRowProps> = ({ saida, onDelete }) => {
  const style = COR_STYLE[saida.estoque?.cor_tinta ?? ''] ?? { badge: 'bg-gray-100 text-gray-700' };
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{formatDate(saida.data_saida)}</td>
      <td className="px-4 py-3">
        <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${style.badge}`}>
          {saida.estoque?.cor_tinta ?? '—'}
        </span>
      </td>
      <td className="px-4 py-3 text-sm font-medium text-gray-700">{saida.estoque?.modelo_impressora ?? '—'}</td>
      <td className="px-4 py-3 text-sm text-gray-700">{saida.unidade || '—'}</td>
      <td className="px-4 py-3 text-sm text-gray-700">{saida.setor}</td>
      <td className="px-4 py-3 text-sm text-gray-700">{saida.responsavel}</td>
      <td className="px-4 py-3 text-center">
        <span className="inline-block bg-red-100 text-red-800 font-bold text-sm px-3 py-1 rounded-full">
          -{saida.quantidade}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-500 max-w-[160px] truncate" title={saida.observacao ?? ''}>
        {saida.observacao || <span className="italic text-gray-400">—</span>}
      </td>
      <td className="px-4 py-3 text-center">
        <button
          onClick={() => onDelete(saida.id)}
          className="text-xs font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
          title="Estornar / cancelar esta saída"
        >
          🗑️ Estornar
        </button>
      </td>
    </tr>
  );
};

// ─── Main Component ───────────────────────────────────────────
const InkManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'estoque' | 'historico'>('estoque');
  const [modeloFilter, setModeloFilter] = useState<ModeloImpressora | 'todos'>('todos');
  const [histModeloFilter, setHistModeloFilter] = useState<ModeloImpressora | 'todos'>('todos');
  const [histUnidadeFilter, setHistUnidadeFilter] = useState<string>('');
  const [histSetorFilter, setHistSetorFilter] = useState<string>('');
  const [histDataSaida, setHistDataSaida] = useState<string>('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'saida' | 'estoque_create' | 'estoque_edit' | null>(null);
  const [selectedEstoque, setSelectedEstoque] = useState<EstoqueTinta | null>(null);

  const { data: estoques = [], isLoading: estoqueLoading, error: estoqueError, refetch: refetchEstoque } = useEstoqueTintas();
  const saidasFilters = useMemo(() => ({
    modelo: histModeloFilter !== 'todos' ? histModeloFilter : undefined,
    unidade: histUnidadeFilter || undefined,
    setor: histSetorFilter || undefined,
    dataInicio: histDataSaida || undefined,
  }), [histModeloFilter, histUnidadeFilter, histSetorFilter, histDataSaida]);

  const { data: saidas = [], isLoading: saidasLoading, refetch: refetchSaidas } = useSaidasTinta(saidasFilters);

  const createEstoqueMutation = useCreateEstoque();
  const updateEstoqueMutation = useUpdateEstoque();
  const deleteEstoqueMutation = useDeleteEstoque();
  const createSaidaMutation = useCreateSaida();
  const deleteSaidaMutation = useDeleteSaida();

  const { toasts, removeToast, success, error: errorToast } = useToast();

  // ── Filtered estoque ──
  const filteredEstoque = useMemo(() => {
    if (modeloFilter === 'todos') return estoques;
    return estoques.filter((e) => e.modelo_impressora === modeloFilter);
  }, [estoques, modeloFilter]);

  const statsL3150 = useMemo(() => estoques.filter((e) => e.modelo_impressora === 'L3150'), [estoques]);
  const statsL3250 = useMemo(() => estoques.filter((e) => e.modelo_impressora === 'L3250'), [estoques]);
  const criticalCount = useMemo(
    () => estoques.filter((e) => e.quantidade_atual <= e.quantidade_minima).length,
    [estoques]
  );

  const closeModal = useCallback(() => {
    setShowModal(false);
    setModalMode(null);
    setSelectedEstoque(null);
  }, []);

  const handleOpenSaida = useCallback((estoque: EstoqueTinta) => {
    setSelectedEstoque(estoque);
    setModalMode('saida');
    setShowModal(true);
  }, []);

  const handleOpenEdit = useCallback((estoque: EstoqueTinta) => {
    setSelectedEstoque(estoque);
    setModalMode('estoque_edit');
    setShowModal(true);
  }, []);

  const handleOpenCreate = useCallback(() => {
    setSelectedEstoque(null);
    setModalMode('estoque_create');
    setShowModal(true);
  }, []);

  const handleViewHistory = useCallback((estoque: EstoqueTinta) => {
    setActiveTab('historico');
    setHistModeloFilter(estoque.modelo_impressora);
  }, []);

  // ── Submit saída ──
  const handleSubmitSaida = useCallback(async (data: CreateSaidaData) => {
    try {
      await createSaidaMutation.mutateAsync(data);
      const est = selectedEstoque!;
      success(`✅ Saída de ${data.quantidade}x Tinta ${est.cor_tinta} (${est.modelo_impressora}) registrada para o setor "${data.setor}"!`);
      closeModal();
    } catch (err: any) {
      errorToast(err.response?.data?.error || '❌ Erro ao registrar saída');
    }
  }, [createSaidaMutation, selectedEstoque, success, errorToast, closeModal]);

  // ── Submit estoque ──
  const handleSubmitEstoque = useCallback(async (data: CreateEstoqueData | UpdateEstoqueData) => {
    try {
      if (modalMode === 'estoque_edit' && selectedEstoque) {
        await updateEstoqueMutation.mutateAsync({ id: selectedEstoque.id, data });
        success(`💾 Estoque atualizado com sucesso!`);
      } else {
        await createEstoqueMutation.mutateAsync(data as CreateEstoqueData);
        success(`➕ Tinta cadastrada no estoque com sucesso!`);
      }
      closeModal();
    } catch (err: any) {
      errorToast(err.response?.data?.error || '❌ Erro ao salvar estoque');
    }
  }, [modalMode, selectedEstoque, createEstoqueMutation, updateEstoqueMutation, success, errorToast, closeModal]);

  // ── Delete estoque ──
  const handleDeleteEstoque = useCallback(async (id: number) => {
    if (!window.confirm('Tem certeza que deseja remover este item do estoque? Todas as saídas registradas serão excluídas.')) return;
    try {
      await deleteEstoqueMutation.mutateAsync(id);
      success('🗑️ Item removido do estoque!');
    } catch (err: any) {
      errorToast(err.response?.data?.error || '❌ Erro ao remover item');
    }
  }, [deleteEstoqueMutation, success, errorToast]);

  // ── Delete saída ──
  const handleDeleteSaida = useCallback(async (id: number) => {
    if (!window.confirm('Deseja estornar esta saída? A quantidade será devolvida ao estoque.')) return;
    try {
      await deleteSaidaMutation.mutateAsync(id);
      success('↩️ Saída estornada e estoque revertido!');
      refetchSaidas();
    } catch (err: any) {
      errorToast(err.response?.data?.error || '❌ Erro ao estornar saída');
    }
  }, [deleteSaidaMutation, success, errorToast, refetchSaidas]);

  // ── Modal title ──
  const modalTitle = useMemo(() => {
    if (modalMode === 'saida' && selectedEstoque)
      return `Registrar Saída — Tinta ${selectedEstoque.cor_tinta} (${selectedEstoque.modelo_impressora})`;
    if (modalMode === 'estoque_edit' && selectedEstoque)
      return `Editar Estoque — ${selectedEstoque.cor_tinta} (${selectedEstoque.modelo_impressora})`;
    if (modalMode === 'estoque_create') return 'Cadastrar Nova Tinta';
    return '';
  }, [modalMode, selectedEstoque]);

  // ── Modal content ──
  const renderModalContent = useCallback(() => {
    if (modalMode === 'saida' && selectedEstoque) {
      return (
        <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>}>
          <InkSaidaForm
            estoque={selectedEstoque}
            onSubmit={handleSubmitSaida}
            onCancel={closeModal}
            isLoading={createSaidaMutation.isPending}
          />
        </Suspense>
      );
    }
    if (modalMode === 'estoque_create' || modalMode === 'estoque_edit') {
      return (
        <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>}>
          <InkEstoqueForm
            estoque={modalMode === 'estoque_edit' ? selectedEstoque : null}
            onSubmit={handleSubmitEstoque}
            onCancel={closeModal}
            isLoading={createEstoqueMutation.isPending || updateEstoqueMutation.isPending}
          />
        </Suspense>
      );
    }
    return null;
  }, [modalMode, selectedEstoque, handleSubmitSaida, handleSubmitEstoque, closeModal, createSaidaMutation.isPending, createEstoqueMutation.isPending, updateEstoqueMutation.isPending]);

  return (
    <div className="min-h-screen pb-12">
      {/* Page Header — mesma cor do Help Desk */}
      <div className="bg-gradient-to-br from-primary-hover via-primary to-primary-light shadow-xl border-b-4 border-primary-hover/30 px-4 py-6 mb-8">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-4xl">🖨️</span>
                <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                    Controle de Tintas
                  </h2>
                  <p className="text-white/90 text-sm font-medium">
                    Epson L3150 &amp; L3250 — Gestão de Estoque e Saídas
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-5 py-3 bg-white text-primary font-bold rounded-xl shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 text-sm"
            >
              ➕ Nova Tinta
            </button>
          </div>

          {/* Stats rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {[
              { label: 'Total de Tintas', value: estoques.length, icon: '📦', color: 'bg-white/10' },
              { label: 'Tintas L3150 no estoque', value: statsL3150.length, icon: '🖨️', color: 'bg-white/10' },
              { label: 'Tintas L3250 no estoque', value: statsL3250.length, icon: '🖨️', color: 'bg-white/10' },
              { label: 'Estoque crítico', value: criticalCount, icon: '⚠️', color: criticalCount > 0 ? 'bg-red-500/30' : 'bg-white/10' },
            ].map((stat) => (
              <div key={stat.label} className={`${stat.color} backdrop-blur-sm rounded-xl p-3 text-white border border-white/20`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{stat.icon}</span>
                  <span className="text-xs font-medium opacity-80">{stat.label}</span>
                </div>
                <p className="text-2xl font-black">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container px-4">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-gray-100 p-1.5 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('estoque')}
            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
              activeTab === 'estoque'
                ? 'bg-white text-primary shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            📦 Estoque
          </button>
          <button
            onClick={() => setActiveTab('historico')}
            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
              activeTab === 'historico'
                ? 'bg-white text-primary shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            📋 Histórico de Saídas
          </button>
        </div>

        {/* ─── TAB ESTOQUE ─── */}
        {activeTab === 'estoque' && (
          <>
            {/* Filtro modelo */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {(['todos', 'L3150', 'L3250'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setModeloFilter(m)}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                    modeloFilter === m
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-white text-primary border border-red-300 hover:bg-red-50'
                  }`}
                >
                  {m === 'todos' ? `Todos (${estoques.length})` : `Epson ${m} (${estoques.filter((e) => e.modelo_impressora === m).length})`}
                </button>
              ))}
            </div>

            {/* Loading / Error */}
            {estoqueLoading && (
              <div className="text-center py-16">
                <div className="inline-block animate-spin text-5xl mb-4">⏳</div>
                <p className="text-gray-500 text-lg">Carregando estoque...</p>
              </div>
            )}
            {estoqueError && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
                <p className="text-red-600 font-semibold mb-2">❌ Erro ao carregar estoque</p>
                <button onClick={() => refetchEstoque()} className="btn btn-primary mt-2">🔄 Tentar Novamente</button>
              </div>
            )}

            {!estoqueLoading && !estoqueError && (
              <>
                {filteredEstoque.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="text-7xl mb-4">🖨️</div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">Nenhuma tinta cadastrada</h3>
                    <p className="text-gray-500 mb-6">
                      {modeloFilter !== 'todos'
                        ? `Nenhuma tinta para Epson ${modeloFilter}.`
                        : 'Clique em "Nova Tinta" para começar.'}
                    </p>
                    <button
                      onClick={handleOpenCreate}
                      className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors"
                    >
                      ➕ Cadastrar primeira tinta
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredEstoque.map((estoque) => (
                      <EstoqueCard
                        key={estoque.id}
                        estoque={estoque}
                        onSaida={handleOpenSaida}
                        onEdit={handleOpenEdit}
                        onDelete={handleDeleteEstoque}
                        onViewHistory={handleViewHistory}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ─── TAB HISTÓRICO ─── */}
        {activeTab === 'historico' && (
          <>
            {/* Filtros */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-5 shadow-lg mb-6">
              <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
                🔍 Filtrar Histórico de Saídas
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Modelo */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Modelo:</label>
                  <select
                    value={histModeloFilter}
                    onChange={(e) => setHistModeloFilter(e.target.value as ModeloImpressora | 'todos')}
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="todos">Todos os modelos</option>
                    <option value="L3150">Epson L3150</option>
                    <option value="L3250">Epson L3250</option>
                  </select>
                </div>

                {/* Unidade */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Unidade:</label>
                  <select
                    value={histUnidadeFilter}
                    onChange={(e) => setHistUnidadeFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    <option value="">Todas as unidades</option>
                    {UNIDADES_PREDEFINIDAS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>

                {/* Setor */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Setor:</label>
                  <select
                    value={histSetorFilter}
                    onChange={(e) => setHistSetorFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    <option value="">Todos os setores</option>
                    {SETORES_PREDEFINIDOS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Data de Saída */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Data de Saída:</label>
                  <input
                    type="date"
                    value={histDataSaida}
                    onChange={(e) => setHistDataSaida(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-primary">{saidas.length}</span> registro{saidas.length !== 1 ? 's' : ''} encontrado{saidas.length !== 1 ? 's' : ''}
                </p>
                <button
                  onClick={() => {
                    setHistModeloFilter('todos');
                    setHistUnidadeFilter('');
                    setHistSetorFilter('');
                    setHistDataSaida('');
                  }}
                  className="text-sm font-semibold text-red-600 hover:text-red-800 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                >
                  🗑️ Limpar filtros
                </button>
              </div>
            </div>

            {/* Tabela */}
            {saidasLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin text-5xl mb-4">⏳</div>
                <p className="text-gray-500">Carregando histórico...</p>
              </div>
            ) : saidas.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">Nenhuma saída registrada</h3>
                <p className="text-gray-500">As saídas de tinta aparecerão aqui.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto table-scroll">
                  <table className="w-full text-left">
                    <thead className="bg-gradient-to-r from-primary-hover to-primary text-white">
                      <tr>
                        {['Data de Saída', 'Cor', 'Modelo', 'Unidade', 'Setor', 'Responsável', 'Qtd', 'Observação', 'Ação'].map((h) => (
                          <th key={h} className="px-4 py-3 text-xs font-bold uppercase tracking-wide whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {saidas.map((saida) => (
                        <SaidaRow key={saida.id} saida={saida} onDelete={handleDeleteSaida} />
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Sumário */}
                <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 flex flex-wrap gap-4 text-sm text-gray-600">
                  <span>
                    Total de saídas:{' '}
                    <strong className="text-gray-800">{saidas.reduce((acc, s) => acc + s.quantidade, 0)} unidade{saidas.reduce((acc, s) => acc + s.quantidade, 0) !== 1 ? 's' : ''}</strong>
                  </span>
                  <span>
                    Registros:{' '}
                    <strong className="text-gray-800">{saidas.length}</strong>
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={showModal} onClose={closeModal} title={modalTitle}>
        {renderModalContent()}
      </Modal>

      {/* Toasts */}
      {toasts.map((toast) => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

export default InkManagement;
