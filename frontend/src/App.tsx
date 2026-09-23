import { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import Modal from './components/common/Modal';
import Toast from './components/common/Toast';
import Statistics from './components/common/Statistics';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Sidebar from './components/layout/Sidebar';
import LoginPage from './pages/LoginPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const Spinner = () => (
  <div className="flex items-center justify-center py-16">
    <div className="w-10 h-10 border-2 border-slate-200 border-t-primary rounded-full animate-spin" />
  </div>
);

const ServiceOrderForm = lazy(() => import('./components/orders/ServiceOrderForm'));
const ServiceOrderDetails = lazy(() => import('./components/orders/ServiceOrderDetails'));
const InkManagement = lazy(() => import('./components/ink/InkManagement'));
const ComputerSwapManagement = lazy(() => import('./components/computers/ComputerSwapManagement'));
const UsersManagement = lazy(() => import('./components/users/UsersManagement'));

import { ServiceOrder, StatusFilter } from './types';
import { ServiceOrderFormData } from './schemas/ordemServicoSchema';
import {
  useServiceOrders,
  useCreateServiceOrder,
  useUpdateServiceOrder,
  useDeleteServiceOrder,
  useGenerateReportPDF,
} from './hooks/useOrdemServico';
import { useToast } from './hooks/useToast';
import { useDebounce } from './hooks/useDebounce';
import ServiceOrderCard from './components/orders/ServiceOrderCard';

const getCurrentDate = () => {
  const date = new Date();
  return {
    day: String(date.getDate()).padStart(2, '0'),
    month: String(date.getMonth() + 1).padStart(2, '0'),
    year: String(date.getFullYear()),
  };
};

const normalizeSearch = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

const parseBRDate = (value?: string | null) => {
  if (!value) return null;

  const brMatch = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brMatch) {
    // Usa horário local para que o filtro por data não perca o dia por causa do UTC.
    return new Date(Number(brMatch[3]), Number(brMatch[2]) - 1, Number(brMatch[1])).getTime();
  }

  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3])).getTime();
  }

  return null;
};

/* ─── Main App logic (authenticated) ─────────────────────────────────────── */
function AppContent() {
  const { isAuthenticated, isLoading, canCreate, canEdit, canDelete } = useAuth();
  const { day: currentDay, month: currentMonth, year: currentYear } = getCurrentDate();
  const currentDateISO = `${currentYear}-${currentMonth}-${currentDay}`;

  // O menu principal do sistema fica restrito a Ordens de Serviço.
  // Mantemos as telas antigas no código para não quebrar dependências,
  // mas qualquer sessão antiga que aponte para elas volta para OS.
  const [currentPage, setCurrentPage] = useState<'helpdesk' | 'tintas' | 'trocas'>(() => {
    sessionStorage.setItem('currentPage', 'helpdesk');
    return 'helpdesk';
  });

  const handleChangePage = useCallback((page: 'helpdesk' | 'tintas' | 'trocas') => {
    // Apenas OS é navegável pelo menu atual.
    const nextPage = page === 'helpdesk' ? 'helpdesk' : 'helpdesk';
    sessionStorage.setItem('currentPage', nextPage);
    setCurrentPage(nextPage);
  }, []);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  // O período usa apenas duas datas: início e fim. Por padrão, a tela abre em Hoje.
  const [startDateFilter, setStartDateFilter] = useState<string>(currentDateISO);
  const [endDateFilter, setEndDateFilter] = useState<string>(currentDateISO);
  const [showFilters, setShowFilters] = useState(false);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<'create' | 'edit' | 'view' | 'users' | null>(null);
  const [modalTitle, setModalTitle] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);

  const { data: orders = [], isLoading: ordersLoading, error, refetch } = useServiceOrders(isAuthenticated);
  const createMutation = useCreateServiceOrder();
  const updateMutation = useUpdateServiceOrder();
  const deleteMutation = useDeleteServiceOrder();
  const generateReportPDFMutation = useGenerateReportPDF();

  const { toasts, removeToast, success, error: errorToast } = useToast();

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  /*
   * IMPORTANTE: todos os hooks deste componente precisam ser executados em
   * todas as renderizações. O filtro ficava depois do gate de login, fazendo
   * com que a quantidade de hooks mudasse quando o usuário entrava no sistema.
   * Isso causava "Rendered more hooks than during the previous render" e a
   * tela ficava branca/piscando após o login.
   */
  const dateScopedOrders = useMemo(() => {
    const hasRange = Boolean(startDateFilter || endDateFilter);

    return orders.filter((order) => {
      const date = parseBRDate(order.data_abertura);
      if (date === null) return false;

      if (!hasRange) return true;

      const start = startDateFilter ? new Date(`${startDateFilter}T00:00:00`) : null;
      const end = endDateFilter ? new Date(`${endDateFilter}T23:59:59.999`) : null;
      return (!start || date >= start.getTime()) && (!end || date <= end.getTime());
    });
  }, [orders, startDateFilter, endDateFilter]);

  const filteredOrders = useMemo(() => {
    let filtered = [...dateScopedOrders];

    if (statusFilter !== 'todos') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    const term = normalizeSearch(debouncedSearchTerm);
    if (term) {
      filtered = filtered.filter(order => {
        const searchable = normalizeSearch([
          String(order.numero_os),
          order.solicitante,
          order.unidade,
          order.setor,
          order.descricao_problema,
          order.servico_realizado || '',
        ].join(' '));
        return searchable.includes(term);
      });
    }

    return filtered.sort((a, b) => (parseBRDate(b.data_abertura) ?? -Infinity) - (parseBRDate(a.data_abertura) ?? -Infinity));
  }, [dateScopedOrders, statusFilter, debouncedSearchTerm]);

  /* ─── Loading / Login gate ─────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const closeModal = () => {
    setShowModal(false);
    setModalContent(null);
    setModalTitle('');
    setSelectedOrder(null);
  };

  const handleCreate = () => {
    if (!canCreate) return;
    setSelectedOrder(null);
    setModalContent('create');
    setModalTitle('Nova Ordem de Serviço');
    setShowModal(true);
  };

  const handleEdit = (order: ServiceOrder) => {
    if (!canEdit) return;
    setSelectedOrder(order);
    setModalContent('edit');
    setModalTitle(`Editar OS #${order.numero_os}`);
    setShowModal(true);
  };

  const handleOpenUsers = () => {
    setModalContent('users');
    setModalTitle('Gerenciar Usuários');
    setShowModal(true);
  };

  const handleSubmit = async (formData: ServiceOrderFormData) => {
    try {
      if (modalContent === 'edit' && selectedOrder) {
        await updateMutation.mutateAsync({ id: selectedOrder.id, data: formData });
        success(`✅ Ordem de Serviço #${selectedOrder.numero_os} atualizada com sucesso!`);
      } else {
        const newOrder = await createMutation.mutateAsync(formData);
        success(`🎉 Ordem de Serviço #${newOrder.numero_os} criada com sucesso!`);
      }
      await new Promise(resolve => setTimeout(resolve, 300));
      closeModal();
    } catch (err: any) {
      console.error('Erro ao salvar ordem:', err);
      const msg = err.response?.data?.error || err.response?.data?.message || '❌ Erro ao salvar ordem de serviço';
      errorToast(msg);
    }
  };

  const handleDelete = async (id: number) => {
    if (!canDelete) { errorToast('Sem permissão para excluir registros'); return; }
    if (window.confirm(`Atenção: a OS #${orders.find(o => o.id === id)?.numero_os ?? id} será excluída permanentemente. Esta ação não pode ser desfeita.

Deseja continuar?`)) {
      try {
        await deleteMutation.mutateAsync(id);
        success('🗑️ Ordem de Serviço excluída com sucesso!');
      } catch (err: any) {
        console.error('Erro ao deletar ordem:', err);
        errorToast(err.response?.data?.error || '❌ Erro ao deletar ordem de serviço');
      }
    }
  };

  const handleGenerateReportPDF = async () => {
    try {
      await generateReportPDFMutation.mutateAsync({
        status: statusFilter !== 'todos' ? statusFilter : null,
        search: searchTerm || null,
        dia: null,
        mes: null,
        ano: null,
        dataInicio: startDateFilter || null,
        dataFim: endDateFilter || null,
      });
      success('📊 Relatório PDF gerado com sucesso!');
    } catch (err: any) {
      console.error('Erro ao gerar relatório PDF:', err);
      errorToast(err.response?.data?.error || err.message || '❌ Erro ao gerar relatório PDF');
    }
  };

  const resetToToday = () => {
    setStatusFilter('todos');
    setStartDateFilter(currentDateISO);
    setEndDateFilter(currentDateISO);
  };

  const clearAllFilters = () => {
    setStatusFilter('todos');
    setSearchTerm('');
    setStartDateFilter('');
    setEndDateFilter('');
  };

  const resetToTodayAndClearSearch = () => {
    resetToToday();
    setSearchTerm('');
  };

  const handleStatusFilterChange = (status: StatusFilter) => {
    setStatusFilter(status);

    // Status é um filtro de visão e não deve ficar preso ao "Hoje".
    // Ao escolher um status, removemos o escopo de data para mostrar todas
    // as OS daquele status. O usuário ainda pode aplicar uma data depois.
    if (status !== 'todos') {
      setStartDateFilter('');
      setEndDateFilter('');
    }
  };

  const handleStatisticsStatus = (status: StatusFilter) => {
    handleStatusFilterChange(status);
    window.setTimeout(() => {
      document.getElementById('lista-os')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleStartDateFilterChange = (value: string) => {
    setStartDateFilter(value);
  };

  const handleEndDateFilterChange = (value: string) => {
    setEndDateFilter(value);
  };

  const viewAllHistory = () => {
    clearAllFilters();
  };

  const isUsingDateRangeFilters = startDateFilter !== '' || endDateFilter !== '';
  const isTodayScope = startDateFilter === currentDateISO && endDateFilter === currentDateISO;
  const isHistoryScope = !isUsingDateRangeFilters;
  const hasActiveFilters =
    statusFilter !== 'todos' ||
    searchTerm.trim() !== '' ||
    (!isTodayScope && !isHistoryScope);
  const dateScopeLabel = isUsingDateRangeFilters
    ? (startDateFilter && endDateFilter ? `${startDateFilter.split('-').reverse().join('/')} — ${endDateFilter.split('-').reverse().join('/')}` : startDateFilter ? `A partir de ${startDateFilter.split('-').reverse().join('/')}` : `Até ${endDateFilter.split('-').reverse().join('/')}`)
    : 'Todo o histórico';

  const renderModalContent = () => {
    if (modalContent === 'create' || modalContent === 'edit') {
      return (
        <Suspense fallback={<Spinner />}>
          <ServiceOrderForm
            order={selectedOrder}
            onSubmit={handleSubmit}
            onCancel={closeModal}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </Suspense>
      );
    }
    if (modalContent === 'view' && selectedOrder) {
      return (
        <Suspense fallback={<Spinner />}>
          <ServiceOrderDetails ordem={selectedOrder} />
        </Suspense>
      );
    }
    if (modalContent === 'users') {
      return (
        <Suspense fallback={<Spinner />}>
          <UsersManagement onClose={closeModal} />
        </Suspense>
      );
    }
    return null;
  };

  const statusPills = [
    { value: 'todos' as StatusFilter, label: 'Todos', count: dateScopedOrders.length, cls: 'filter-pill-neutral', activeCls: 'filter-pill-neutral-active' },
    { value: 'aberto' as StatusFilter, label: 'Abertas', count: dateScopedOrders.filter(o => o.status === 'aberto').length, cls: 'filter-pill-open', activeCls: 'filter-pill-open-active' },
    { value: 'em_andamento' as StatusFilter, label: 'Andamento', count: dateScopedOrders.filter(o => o.status === 'em_andamento').length, cls: 'filter-pill-progress', activeCls: 'filter-pill-progress-active' },
    { value: 'finalizado' as StatusFilter, label: 'Finalizadas', count: dateScopedOrders.filter(o => o.status === 'finalizado').length, cls: 'filter-pill-done', activeCls: 'filter-pill-done-active' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        currentPage={currentPage}
        onChangePage={handleChangePage}
        onNewOS={handleCreate}
        onGeneratePDF={handleGenerateReportPDF}
        canGeneratePDF={filteredOrders.length > 0}
        onOpenUsers={handleOpenUsers}
      />

      <div className="flex flex-col flex-1 min-h-screen overflow-x-hidden">
        <Header
          currentPage={currentPage}
          onChangePage={handleChangePage}
          onNewOS={handleCreate}
          onGeneratePDF={handleGenerateReportPDF}
          canGeneratePDF={filteredOrders.length > 0}
          onOpenUsers={handleOpenUsers}
        />

        {currentPage === 'tintas' && (
          <main className="flex-1 pb-20 md:pb-0">
            <Suspense fallback={<Spinner />}>
              <InkManagement />
            </Suspense>
          </main>
        )}

        {currentPage === 'trocas' && (
          <main className="flex-1 pb-20 md:pb-0">
            <Suspense fallback={<Spinner />}>
              <ComputerSwapManagement />
            </Suspense>
          </main>
        )}

        {currentPage === 'helpdesk' && (
          <main className="flex-1 page-inner pb-24 md:pb-8">

            <Statistics
              orders={orders}
              onSelectPeriod={(period) => {
                setStatusFilter('todos');
                setSearchTerm('');
                setStartDateFilter('');
                setEndDateFilter('');
                if (period === 'today') {
                  setStartDateFilter(currentDateISO);
                  setEndDateFilter(currentDateISO);
                } else if (period === 'month') {
                  const now = new Date();
                  const firstDay = `${currentYear}-${currentMonth}-01`;
                  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
                  setStartDateFilter(firstDay);
                  setEndDateFilter(lastDay);
                } else {
                  setStartDateFilter(`${currentYear}-01-01`);
                  setEndDateFilter(`${currentYear}-12-31`);
                }
                window.setTimeout(() => document.getElementById('lista-os')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
              }}
            />

            <section className="filter-bar filter-panel mb-5" aria-label="Filtros das ordens de serviço">
              <div className="filter-panel-inner flex flex-col gap-4">
                <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="filter-panel-icon filter-panel-icon-modern">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414A1 1 0 0014 13.828V19a1 1 0 01-.553.894l-4 2A1 1 0 018 21v-7.172a1 1 0 00-.293-.707L1.293 6.707A1 1 0 011 6V4z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <h2 className="text-sm font-bold text-slate-800">Filtros e pesquisa</h2>
                          {hasActiveFilters && <span className="filter-active-badge">Ativos</span>}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">Exibindo: <span className="font-semibold text-slate-500">{dateScopeLabel}</span></p>
                    </div>
                  </div>

                  <div className="filter-quick-actions flex items-center gap-1.5 flex-wrap">
                    <button type="button" onClick={resetToToday} className={`filter-preset filter-preset-primary ${isTodayScope && statusFilter === 'todos' ? 'filter-preset-active' : ''}`}>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      Hoje
                    </button>
                    <button type="button" onClick={viewAllHistory} className={`filter-preset ${isHistoryScope && statusFilter === 'todos' ? 'filter-preset-active filter-history-active' : ''}`}>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0Z" /></svg>
                      Histórico
                    </button>
                    {hasActiveFilters && (
                      <button type="button" onClick={resetToTodayAndClearSearch} className="filter-preset text-red-600 hover:bg-red-50 hover:border-red-200">
                        Limpar
                      </button>
                    )}
                    <button type="button" onClick={() => setShowFilters(v => !v)} className="filter-preset sm:hidden">
                      <svg className={`w-3.5 h-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      Período
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Pesquisar por OS, solicitante, unidade, setor ou serviço realizado..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value.replace(/-/g, ''))}
                    onKeyDown={(e) => { if (e.key === '-') e.preventDefault(); }}
                    className="input filter-search pl-10 pr-10"
                  />
                  {searchTerm && (
                    <button type="button" onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Limpar pesquisa">
                      ×
                    </button>
                  )}
                </div>

                <div className="filter-section-block">
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div>
                      <span className="filter-section-title">Status</span>
                      <span className="filter-section-subtitle">Escolha uma situação para consultar</span>
                    </div>
                    <span className="filter-section-hint">O status limpa o período atual</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {statusPills.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => handleStatusFilterChange(p.value)}
                        aria-pressed={statusFilter === p.value}
                        className={`filter-status-card ${statusFilter === p.value ? p.activeCls : p.cls}`}
                      >
                        <span className="filter-status-card-label">
                          <span className="filter-status-dot" />
                          {p.label}
                        </span>
                        <span className="filter-status-count">{p.count}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className={`${showFilters ? 'block' : 'hidden'} sm:block filter-period-section`}>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div>
                      <span className="filter-section-title">Período</span>
                      <span className="filter-section-subtitle">Escolha uma data ou um intervalo</span>
                    </div>
                    <span className="filter-mode-badge">{isTodayScope ? 'Hoje' : isHistoryScope ? 'Histórico' : 'Intervalo'}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl">
                    <div className="filter-field">
                      <label>Data inicial</label>
                      <input type="date" value={startDateFilter} onChange={(e) => handleStartDateFilterChange(e.target.value)} max={endDateFilter || undefined} className="input text-sm" />
                    </div>
                    <div className="filter-field">
                      <label>Data final</label>
                      <input type="date" value={endDateFilter} onChange={(e) => handleEndDateFilterChange(e.target.value)} min={startDateFilter || undefined} className="input text-sm" />
                    </div>
                  </div>
                </div>

                {hasActiveFilters && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">Ativos:</span>
                    {statusFilter !== 'todos' && <span className="filter-chip">Status: {statusPills.find(p => p.value === statusFilter)?.label}</span>}
                    {searchTerm && <span className="filter-chip">Busca: {searchTerm}</span>}
                    {(startDateFilter || endDateFilter) && <span className="filter-chip">Período: {dateScopeLabel}</span>}
                  </div>
                )}
              </div>
            </section>

            <div id="lista-os" className="flex items-center justify-between mb-3 sm:mb-4 scroll-mt-24">
              <p className="text-sm text-slate-500">
                {filteredOrders.length === 0 ? '' : (
                  <>
                    <span className="font-semibold text-slate-700">{filteredOrders.length}</span>{' '}
                    {filteredOrders.length === 1 ? 'ordem encontrada' : 'ordens encontradas'}
                  </>
                )}
              </p>
              {hasActiveFilters && (
                <button onClick={resetToTodayAndClearSearch} className="text-xs text-slate-500 hover:text-slate-700 underline">
                  Limpar
                </button>
              )}
            </div>

            {ordersLoading && <Spinner />}

            {error && (
              <div className="card p-6 text-center border-red-200">
                <p className="text-sm font-semibold text-red-600 mb-1">Erro ao carregar dados</p>
                <p className="text-xs text-red-500 mb-4">{(error as Error).message}</p>
                <button onClick={() => refetch()} className="btn btn-primary text-xs">Tentar Novamente</button>
              </div>
            )}

            {!ordersLoading && !error && (
              filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 sm:w-8 sm:h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-slate-700 mb-1">Nenhuma ordem encontrada</h3>
                  <p className="text-sm text-slate-500 mb-4">
                    {hasActiveFilters
                      ? 'Tente ajustar os filtros.'
                      : canCreate
                        ? 'Toque em "Nova OS" para criar a primeira.'
                        : 'Nenhuma ordem disponível no momento.'}
                  </p>
                  {hasActiveFilters && (
                    <button onClick={resetToTodayAndClearSearch} className="btn btn-outline text-xs">Limpar Filtros</button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {filteredOrders.map((order) => (
                    <ServiceOrderCard
                      key={order.id}
                      ordem={order}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )
            )}
          </main>
        )}

        <Footer />
      </div>

      <Modal isOpen={showModal} onClose={closeModal} title={modalTitle}>
        {renderModalContent()}
      </Modal>

      {toasts.map((toast) => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

/* ─── Root with AuthProvider ──────────────────────────────────────────────── */
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
