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
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  return Date.UTC(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
};

/* ─── Main App logic (authenticated) ─────────────────────────────────────── */
function AppContent() {
  const { isAuthenticated, isLoading, canCreate, canEdit, canDelete } = useAuth();
  const { day: currentDay, month: currentMonth, year: currentYear } = getCurrentDate();

  const [currentPage, setCurrentPage] = useState<'helpdesk' | 'tintas' | 'trocas'>(() => {
    const saved = sessionStorage.getItem('currentPage');
    if (saved === 'tintas' || saved === 'trocas') return saved;
    return 'helpdesk';
  });

  const handleChangePage = useCallback((page: 'helpdesk' | 'tintas' | 'trocas') => {
    sessionStorage.setItem('currentPage', page);
    setCurrentPage(page);
  }, []);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dayFilter, setDayFilter] = useState<string>(currentDay);
  const [monthFilter, setMonthFilter] = useState<string>(currentMonth);
  const [yearFilter, setYearFilter] = useState<string>(currentYear);
  const [startDateFilter, setStartDateFilter] = useState<string>('');
  const [endDateFilter, setEndDateFilter] = useState<string>('');
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
  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

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

    // Filtros de período: quando o intervalo estiver ativo, ele tem prioridade.
    if (startDateFilter || endDateFilter) {
      const start = startDateFilter ? Date.parse(`${startDateFilter}T00:00:00`) : -Infinity;
      const end = endDateFilter ? Date.parse(`${endDateFilter}T23:59:59`) : Infinity;
      filtered = filtered.filter(order => {
        const date = parseBRDate(order.data_abertura);
        return date !== null && date >= start && date <= end;
      });
    } else {
      if (dayFilter) {
        filtered = filtered.filter(order => parseBRDate(order.data_abertura) !== null && new Date(parseBRDate(order.data_abertura)!).getUTCDate() === Number(dayFilter));
      }
      if (monthFilter) {
        filtered = filtered.filter(order => parseBRDate(order.data_abertura) !== null && new Date(parseBRDate(order.data_abertura)!).getUTCMonth() + 1 === Number(monthFilter));
      }
      if (yearFilter) {
        filtered = filtered.filter(order => parseBRDate(order.data_abertura) !== null && new Date(parseBRDate(order.data_abertura)!).getUTCFullYear() === Number(yearFilter));
      }
    }

    return filtered.sort((a, b) => (parseBRDate(b.data_abertura) ?? -Infinity) - (parseBRDate(a.data_abertura) ?? -Infinity));
  }, [orders, statusFilter, debouncedSearchTerm, dayFilter, monthFilter, yearFilter, startDateFilter, endDateFilter]);

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
        dia: dayFilter || null,
        mes: monthFilter || null,
        ano: yearFilter || null,
        dataInicio: startDateFilter || null,
        dataFim: endDateFilter || null,
      });
      success('📊 Relatório PDF gerado com sucesso!');
    } catch (err: any) {
      console.error('Erro ao gerar relatório PDF:', err);
      errorToast(err.response?.data?.error || err.message || '❌ Erro ao gerar relatório PDF');
    }
  };

  const clearFilters = () => {
    const { day, month, year } = getCurrentDate();
    setStatusFilter('todos');
    setSearchTerm('');
    setDayFilter(day);
    setMonthFilter(month);
    setYearFilter(year);
    setStartDateFilter('');
    setEndDateFilter('');
  };

  const handleDayFilterChange = (value: string) => {
    setDayFilter(value);
    if (value) { setStartDateFilter(''); setEndDateFilter(''); }
  };

  const handleMonthFilterChange = (value: string) => {
    setMonthFilter(value);
    if (value) { setStartDateFilter(''); setEndDateFilter(''); }
  };

  const handleYearFilterChange = (value: string) => {
    setYearFilter(value);
    if (value) { setStartDateFilter(''); setEndDateFilter(''); }
  };

  const handleStartDateFilterChange = (value: string) => {
    setStartDateFilter(value);
    if (value) { setDayFilter(''); setMonthFilter(''); setYearFilter(''); }
  };

  const handleEndDateFilterChange = (value: string) => {
    setEndDateFilter(value);
    if (value) { setDayFilter(''); setMonthFilter(''); setYearFilter(''); }
  };

  const viewAllHistory = () => {
    setStatusFilter('todos');
    setSearchTerm('');
    setDayFilter('');
    setMonthFilter('');
    setYearFilter('');
    setStartDateFilter('');
    setEndDateFilter('');
  };

  const hasActiveFilters =
    statusFilter !== 'todos' ||
    searchTerm.trim() !== '' ||
    dayFilter !== currentDay ||
    monthFilter !== currentMonth ||
    yearFilter !== currentYear ||
    startDateFilter !== '' ||
    endDateFilter !== '';

  const isUsingDateFilters = dayFilter !== '' || monthFilter !== '' || yearFilter !== '';
  const isUsingDateRangeFilters = startDateFilter !== '' || endDateFilter !== '';

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
    { value: 'todos', label: 'Todos', count: orders.length, cls: 'border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50', activeCls: 'bg-slate-800 border-slate-800 text-white' },
    { value: 'aberto', label: 'Abertos', count: orders.filter(o => o.status === 'aberto').length, cls: 'border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50', activeCls: 'bg-red-600 border-red-600 text-white' },
    { value: 'em_andamento', label: 'Andamento', count: orders.filter(o => o.status === 'em_andamento').length, cls: 'border-amber-200 text-amber-600 hover:border-amber-300 hover:bg-amber-50', activeCls: 'bg-amber-500 border-amber-500 text-white' },
    { value: 'finalizado', label: 'Finalizados', count: orders.filter(o => o.status === 'finalizado').length, cls: 'border-emerald-200 text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50', activeCls: 'bg-emerald-600 border-emerald-600 text-white' },
  ] as const;

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
              dayFilter={dayFilter}
              monthFilter={monthFilter}
              yearFilter={yearFilter}
              startDateFilter={startDateFilter}
              endDateFilter={endDateFilter}
            />

            <div className="filter-bar bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-sm px-3 py-3 sm:px-4 sm:py-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-slate-100 flex items-center justify-center">
                    <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414A1 1 0 0014 13.828V19a1 1 0 01-.553.894l-4 2A1 1 0 018 21v-7.172a1 1 0 00-.293-.707L1.293 6.707A1 1 0 011 6V4z" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-slate-700">Filtros</span>
                  {hasActiveFilters && (
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold">!</span>
                  )}
                </div>
                <div className="flex gap-1.5 sm:gap-2">
                  <button onClick={clearFilters} disabled={!hasActiveFilters}
                    className="btn btn-outline text-xs py-1.5 px-2.5 sm:px-3 disabled:opacity-40">
                    Hoje
                  </button>
                  <button onClick={viewAllHistory}
                    className="btn btn-ghost text-xs py-1.5 px-2.5 sm:px-3 text-slate-600">
                    Histórico
                  </button>
                  <button
                    onClick={() => setShowFilters(v => !v)}
                    className="sm:hidden btn btn-ghost text-xs py-1.5 px-2.5 text-slate-600"
                    aria-label="Filtros Avançados"
                  >
                    <svg className={`w-4 h-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
                {statusPills.map((p) => (
                  <button key={p.value}
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

              <div className="relative mb-3">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar por nº, solicitante, unidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value.replace(/-/g, ''))}
                  onKeyDown={(e) => { if (e.key === '-') e.preventDefault(); }}
                  className="input pl-9"
                />
              </div>

              <div className={`${showFilters ? 'block' : 'hidden'} sm:block`}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
                  <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white/70 shadow-sm px-2.5 py-2 sm:px-3 sm:py-2.5 flex flex-col gap-1">
                    <label className="label !mb-0 !text-[11px] sm:!text-xs !text-slate-500 flex items-center justify-between"><span>Dia</span></label>
                    <input type="number" value={dayFilter}
                      onChange={(e) => { const v = e.target.value; if (v === '' || (+v >= 1 && +v <= 31)) handleDayFilterChange(v); }}
                      onKeyDown={(e) => { if (['-', '+', 'e', 'E'].includes(e.key)) e.preventDefault(); }}
                      onWheel={(e) => e.currentTarget.blur()}
                      placeholder="1–31" min="1" max="31"
                      disabled={isUsingDateRangeFilters}
                      className="input text-center font-semibold tracking-wide text-slate-800 placeholder:text-slate-300 mt-1" />
                  </div>
                  <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white/70 shadow-sm px-2.5 py-2 sm:px-3 sm:py-2.5 flex flex-col gap-1">
                    <label className="label !mb-0 !text-[11px] sm:!text-xs !text-slate-500 flex items-center justify-between"><span>Mês</span></label>
                    <select value={monthFilter} onChange={(e) => handleMonthFilterChange(e.target.value)}
                      disabled={isUsingDateRangeFilters}
                      className="input text-xs sm:text-sm mt-1">
                      <option value="">Todos</option>
                      {['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
                        .map((m, i) => <option key={m} value={String(i + 1).padStart(2, '0')}>{m}</option>)}
                    </select>
                  </div>
                  <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white/70 shadow-sm px-2.5 py-2 sm:px-3 sm:py-2.5 flex flex-col gap-1">
                    <label className="label !mb-0 !text-[11px] sm:!text-xs !text-slate-500 flex items-center justify-between"><span>Ano</span></label>
                    <input type="number" value={yearFilter}
                      onChange={(e) => { const v = e.target.value; if (v === '' || (+v >= 2000 && +v <= Number(currentYear))) handleYearFilterChange(v); }}
                      onKeyDown={(e) => { if (['-', '+', 'e', 'E'].includes(e.key)) e.preventDefault(); }}
                      onWheel={(e) => e.currentTarget.blur()}
                      placeholder="2020–2100" min="2020" max="2100"
                      disabled={isUsingDateRangeFilters}
                      className="input text-center font-semibold tracking-wide text-slate-800 placeholder:text-slate-300 mt-1" />
                  </div>
                  <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white/70 shadow-sm px-2.5 py-2 sm:px-3 sm:py-2.5 flex flex-col gap-1">
                    <label className="label !mb-0 !text-[11px] sm:!text-xs !text-slate-500">Dt. Inicial</label>
                    <input type="date" value={startDateFilter} onChange={(e) => handleStartDateFilterChange(e.target.value)}
                      max={endDateFilter || undefined}
                      disabled={isUsingDateFilters}
                      className="input text-xs sm:text-sm mt-1" />
                  </div>
                  <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white/70 shadow-sm px-2.5 py-2 sm:px-3 sm:py-2.5 flex flex-col gap-1">
                    <label className="label !mb-0 !text-[11px] sm:!text-xs !text-slate-500">Dt. Final</label>
                    <input type="date" value={endDateFilter} onChange={(e) => handleEndDateFilterChange(e.target.value)}
                      min={startDateFilter || undefined}
                      disabled={isUsingDateFilters}
                      className="input text-xs sm:text-sm mt-1" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <p className="text-sm text-slate-500">
                {filteredOrders.length === 0 ? '' : (
                  <>
                    <span className="font-semibold text-slate-700">{filteredOrders.length}</span>{' '}
                    {filteredOrders.length === 1 ? 'ordem encontrada' : 'ordens encontradas'}
                  </>
                )}
              </p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-xs text-slate-500 hover:text-slate-700 underline">
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
                    <button onClick={clearFilters} className="btn btn-outline text-xs">Limpar Filtros</button>
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
