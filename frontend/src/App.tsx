import { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import Modal from './components/common/Modal';
import Toast from './components/common/Toast';
import Statistics from './components/common/Statistics';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Sidebar from './components/layout/Sidebar';

// ── Spinner helper ─────────────────────────────────────────
const Spinner = () => (
  <div className="flex items-center justify-center py-16">
    <div className="w-10 h-10 border-2 border-slate-200 border-t-primary rounded-full animate-spin" />
  </div>
);

const ServiceOrderForm = lazy(() => import('./components/orders/ServiceOrderForm'));
const ServiceOrderDetails = lazy(() => import('./components/orders/ServiceOrderDetails'));
const InkManagement = lazy(() => import('./components/ink/InkManagement'));
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

const ABBREVIATED_MONTHS: Record<string, string> = {
  '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr',
  '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago',
  '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez',
};

const getCurrentDate = () => {
  const date = new Date();
  return {
    day: String(date.getDate()).padStart(2, '0'),
    month: String(date.getMonth() + 1).padStart(2, '0'),
    year: String(date.getFullYear()),
  };
};

const formatMonthYear = (month: string, year: string): string => {
  const abbreviatedMonth = ABBREVIATED_MONTHS[month] || month;
  return `${abbreviatedMonth}/${year}`;
};

function App() {
  const { day: currentDay, month: currentMonth, year: currentYear } = getCurrentDate();

  const [currentPage, setCurrentPage] = useState<'helpdesk' | 'tintas'>(() => {
    const saved = sessionStorage.getItem('currentPage');
    return (saved === 'tintas' ? 'tintas' : 'helpdesk') as 'helpdesk' | 'tintas';
  });

  const handleChangePage = useCallback((page: 'helpdesk' | 'tintas') => {
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

  // Mobile filter panel toggle
  const [showFilters, setShowFilters] = useState(false);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<'create' | 'edit' | 'view' | null>(null);
  const [modalTitle, setModalTitle] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);

  const { data: orders = [], isLoading, error, refetch } = useServiceOrders();
  const createMutation = useCreateServiceOrder();
  const updateMutation = useUpdateServiceOrder();
  const deleteMutation = useDeleteServiceOrder();
  const generateReportPDFMutation = useGenerateReportPDF();

  const { toasts, removeToast, success, error: errorToast } = useToast();

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    if (statusFilter !== 'todos') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.numero_os.toString().includes(term) ||
        order.solicitante.toLowerCase().includes(term) ||
        order.unidade.toLowerCase().includes(term) ||
        order.setor.toLowerCase().includes(term) ||
        order.descricao_problema.toLowerCase().includes(term)
      );
    }

    if (dayFilter) {
      filtered = filtered.filter(order => {
        if (!order.data_abertura) return false;
        const [day] = order.data_abertura.split('/');
        return parseInt(day) === parseInt(dayFilter);
      });
    }

    if (monthFilter) {
      filtered = filtered.filter(order => {
        if (!order.data_abertura) return false;
        const [, month] = order.data_abertura.split('/');
        return parseInt(month) === parseInt(monthFilter);
      });
    }

    if (yearFilter) {
      filtered = filtered.filter(order => {
        if (!order.data_abertura) return false;
        const [, , year] = order.data_abertura.split('/');
        return parseInt(year) === parseInt(yearFilter);
      });
    }

    if (startDateFilter || endDateFilter) {
      filtered = filtered.filter(order => {
        if (!order.data_abertura) return false;
        const [day, month, year] = order.data_abertura.split('/');
        const orderDate = Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day));
        let withinRange = true;
        if (startDateFilter) {
          const [startYear, startMonth, startDay] = startDateFilter.split('-');
          const startDate = Date.UTC(parseInt(startYear), parseInt(startMonth) - 1, parseInt(startDay));
          if (orderDate < startDate) withinRange = false;
        }
        if (endDateFilter && withinRange) {
          const [endYear, endMonth, endDay] = endDateFilter.split('-');
          const endDate = Date.UTC(parseInt(endYear), parseInt(endMonth) - 1, parseInt(endDay));
          if (orderDate > endDate) withinRange = false;
        }
        return withinRange;
      });
    }

    filtered.sort((a, b) => {
      if (!a.data_abertura) return 1;
      if (!b.data_abertura) return -1;
      const [dayA, monthA, yearA] = a.data_abertura.split('/');
      const [dayB, monthB, yearB] = b.data_abertura.split('/');
      const dateA = Date.UTC(parseInt(yearA), parseInt(monthA) - 1, parseInt(dayA));
      const dateB = Date.UTC(parseInt(yearB), parseInt(monthB) - 1, parseInt(dayB));
      return dateA - dateB;
    });

    return filtered;
  }, [orders, statusFilter, debouncedSearchTerm, dayFilter, monthFilter, yearFilter, startDateFilter, endDateFilter]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setModalContent(null);
    setModalTitle('');
    setSelectedOrder(null);
  }, []);

  const handleCreate = useCallback(() => {
    setSelectedOrder(null);
    setModalContent('create');
    setModalTitle('Nova Ordem de Serviço');
    setShowModal(true);
  }, []);

  const handleEdit = useCallback((order: ServiceOrder) => {
    setSelectedOrder(order);
    setModalContent('edit');
    setModalTitle(`Editar OS #${order.numero_os}`);
    setShowModal(true);
  }, []);

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
      errorToast(err.response?.data?.error || '❌ Erro ao salvar ordem de serviço');
    }
  };

  const handleDelete = useCallback(async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta ordem de serviço?')) {
      try {
        await deleteMutation.mutateAsync(id);
        success('🗑️ Ordem de Serviço excluída com sucesso!');
      } catch (err: any) {
        console.error('Erro ao deletar ordem:', err);
        errorToast(err.response?.data?.error || '❌ Erro ao deletar ordem de serviço');
      }
    }
  }, [deleteMutation, success, errorToast]);

  const handleGenerateReportPDF = useCallback(async () => {
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
      const errorMessage = err.response?.data?.error || err.message || '❌ Erro ao gerar relatório PDF';
      errorToast(errorMessage);
    }
  }, [generateReportPDFMutation, statusFilter, searchTerm, dayFilter, monthFilter, yearFilter, startDateFilter, endDateFilter, success, errorToast]);

  const clearFilters = useCallback(() => {
    const { day, month, year } = getCurrentDate();
    setStatusFilter('todos');
    setSearchTerm('');
    setDayFilter(day);
    setMonthFilter(month);
    setYearFilter(year);
    setStartDateFilter('');
    setEndDateFilter('');
  }, []);

  const viewAllHistory = useCallback(() => {
    setStatusFilter('todos');
    setSearchTerm('');
    setDayFilter('');
    setMonthFilter('');
    setYearFilter('');
    setStartDateFilter('');
    setEndDateFilter('');
  }, []);

  const hasActiveFilters = useMemo(() => {
    return statusFilter !== 'todos' ||
      searchTerm !== '' ||
      dayFilter !== currentDay ||
      monthFilter !== currentMonth ||
      yearFilter !== currentYear ||
      startDateFilter !== '' ||
      endDateFilter !== '';
  }, [statusFilter, searchTerm, dayFilter, monthFilter, yearFilter, startDateFilter, endDateFilter, currentDay, currentMonth, currentYear]);

  const isUsingDateFilters = useMemo(() => {
    return dayFilter !== '' || monthFilter !== '' || yearFilter !== '';
  }, [dayFilter, monthFilter, yearFilter]);

  const isUsingDateRangeFilters = useMemo(() => {
    return startDateFilter !== '' || endDateFilter !== '';
  }, [startDateFilter, endDateFilter]);

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
    return null;
  };

  // ── Status filter pills config ─────────────────────────
  const statusPills = [
    { value: 'todos', label: 'Todos', count: orders.length, cls: 'border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50', activeCls: 'bg-slate-800 border-slate-800 text-white' },
    { value: 'aberto', label: 'Abertos', count: orders.filter(o => o.status === 'aberto').length, cls: 'border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50', activeCls: 'bg-red-600 border-red-600 text-white' },
    { value: 'em_andamento', label: 'Andamento', count: orders.filter(o => o.status === 'em_andamento').length, cls: 'border-amber-200 text-amber-600 hover:border-amber-300 hover:bg-amber-50', activeCls: 'bg-amber-500 border-amber-500 text-white' },
    { value: 'finalizado', label: 'Finalizados', count: orders.filter(o => o.status === 'finalizado').length, cls: 'border-emerald-200 text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50', activeCls: 'bg-emerald-600 border-emerald-600 text-white' },
  ] as const;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* ─── Sidebar ─── */}
      <Sidebar
        currentPage={currentPage}
        onChangePage={handleChangePage}
        onNewOS={handleCreate}
        onGeneratePDF={handleGenerateReportPDF}
        canGeneratePDF={filteredOrders.length > 0}
      />

      {/* ─── Main wrapper ─── */}
      <div className="flex flex-col flex-1 min-h-screen overflow-x-hidden">
        <Header
          currentPage={currentPage}
          onChangePage={handleChangePage}
          onNewOS={handleCreate}
          onGeneratePDF={handleGenerateReportPDF}
          canGeneratePDF={filteredOrders.length > 0}
        />

        {/* ── Tintas page ── */}
        {currentPage === 'tintas' && (
          <main className="flex-1 pb-20 md:pb-0">
            <Suspense fallback={<Spinner />}>
              <InkManagement />
            </Suspense>
          </main>
        )}

        {/* ── Helpdesk page ── */}
        {currentPage === 'helpdesk' && (
          <main className="flex-1 page-inner pb-24 md:pb-8">

            {/* Stats */}
            <Statistics
              orders={orders}
              dayFilter={dayFilter}
              monthFilter={monthFilter}
              yearFilter={yearFilter}
              startDateFilter={startDateFilter}
              endDateFilter={endDateFilter}
            />

            {/* ── Filter card ── */}
            <div className="filter-bar">
              {/* Header row */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-slate-100 flex items-center justify-center">
                    <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414A1 1 0 0014 13.828V19a1 1 0 01-.553.894l-4 2A1 1 0 018 21v-7.172a1 1 0 00-.293-.707L1.293 6.707A1 1 0 011 6V4z" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-slate-700">Filtros</span>
                  {hasActiveFilters && (
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold">
                      !
                    </span>
                  )}
                </div>
                <div className="flex gap-1.5 sm:gap-2">
                  <button
                    onClick={clearFilters}
                    disabled={!hasActiveFilters}
                    className="btn btn-outline text-xs py-1.5 px-2.5 sm:px-3 disabled:opacity-40"
                  >
                    Hoje
                  </button>
                  <button
                    onClick={viewAllHistory}
                    className="btn btn-ghost text-xs py-1.5 px-2.5 sm:px-3 text-slate-600"
                  >
                    Histórico
                  </button>
                  {/* Mobile toggle advanced filters */}
                  <button
                    onClick={() => setShowFilters(v => !v)}
                    className="sm:hidden btn btn-ghost text-xs py-1.5 px-2.5 text-slate-600"
                    aria-label="Filtros Avançados"
                  >
                    <svg className={`w-4 h-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Status pills */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
                {statusPills.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => {
                      setStatusFilter(p.value);
                      if (p.value !== 'todos') {
                        setDayFilter(''); setMonthFilter(''); setYearFilter('');
                        setStartDateFilter(''); setEndDateFilter('');
                      }
                    }}
                    className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold rounded-lg border transition-all duration-150 ${statusFilter === p.value ? p.activeCls : p.cls}`}
                  >
                    {p.label}
                    <span className={`ml-1 sm:ml-1.5 px-1 sm:px-1.5 py-0.5 rounded-full text-[10px] font-bold ${statusFilter === p.value ? 'bg-white/25' : 'bg-slate-100 text-slate-500'}`}>
                      {p.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Search */}
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

              {/* Date filters grid — always visible on desktop, collapsible on mobile */}
              <div className={`${showFilters ? 'block' : 'hidden'} sm:block`}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
                  {/* Dia */}
                  <div>
                    <label className="label">Dia</label>
                    <input type="number" value={dayFilter}
                      onChange={(e) => { const v = e.target.value; if (v === '' || (+v >= 1 && +v <= 31)) setDayFilter(v); }}
                      onKeyDown={(e) => { if (['-', '+', 'e', 'E'].includes(e.key)) e.preventDefault(); }}
                      onWheel={(e) => e.currentTarget.blur()}
                      placeholder="1–31" min="1" max="31"
                      disabled={isUsingDateRangeFilters}
                      className="input"
                    />
                  </div>
                  {/* Mês */}
                  <div>
                    <label className="label">Mês</label>
                    <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}
                      disabled={isUsingDateRangeFilters} className="input">
                      <option value="">Todos</option>
                      {['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
                        .map((m, i) => <option key={m} value={String(i + 1).padStart(2, '0')}>{m}</option>)}
                    </select>
                  </div>
                  {/* Ano */}
                  <div>
                    <label className="label">Ano</label>
                    <input type="number" value={yearFilter}
                      onChange={(e) => { const v = e.target.value; if (v === '' || (+v >= 2020 && +v <= 2100)) setYearFilter(v); }}
                      onKeyDown={(e) => { if (['-', '+', 'e', 'E'].includes(e.key)) e.preventDefault(); }}
                      onWheel={(e) => e.currentTarget.blur()}
                      placeholder="2020–2100" min="2020" max="2100"
                      disabled={isUsingDateRangeFilters}
                      className="input"
                    />
                  </div>
                  {/* Data início */}
                  <div>
                    <label className="label">Dt. Inicial</label>
                    <input type="date" value={startDateFilter}
                      onChange={(e) => setStartDateFilter(e.target.value)}
                      max={endDateFilter || undefined}
                      disabled={isUsingDateFilters} className="input" />
                  </div>
                  {/* Data fim */}
                  <div>
                    <label className="label">Dt. Final</label>
                    <input type="date" value={endDateFilter}
                      onChange={(e) => setEndDateFilter(e.target.value)}
                      min={startDateFilter || undefined}
                      disabled={isUsingDateFilters} className="input" />
                  </div>
                </div>
              </div>

              {/* Active filter info */}
              {(dayFilter || (monthFilter && yearFilter)) && (
                <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-600 bg-slate-100 rounded-lg px-3 py-2 w-fit">
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {dayFilter && monthFilter && yearFilter
                    ? `Dia ${String(dayFilter).padStart(2, '0')}/${monthFilter}/${yearFilter}`
                    : monthFilter && yearFilter ? formatMonthYear(monthFilter, yearFilter) : ''}
                </div>
              )}
            </div>

            {/* ── Results count ── */}
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <p className="text-sm text-slate-500">
                {filteredOrders.length === 0
                  ? "Nenhuma ordem encontrada"
                  : (
                    <>
                      <span className="font-semibold text-slate-700">{filteredOrders.length}</span>{" "}
                      {filteredOrders.length === 1 ? "ordem encontrada" : "ordens encontradas"}
                    </>
                  )}
              </p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-xs text-slate-500 hover:text-slate-700 underline">
                  Limpar
                </button>
              )}
            </div>

            {/* Loading */}
            {isLoading && <Spinner />}

            {/* Error */}
            {error && (
              <div className="card p-6 text-center border-red-200">
                <p className="text-sm font-semibold text-red-600 mb-1">Erro ao carregar dados</p>
                <p className="text-xs text-red-500 mb-4">{(error as Error).message}</p>
                <button onClick={() => refetch()} className="btn btn-primary text-xs">Tentar Novamente</button>
              </div>
            )}

            {/* Cards grid */}
            {!isLoading && !error && (
              filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 sm:w-8 sm:h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-slate-700 mb-1">Nenhuma ordem encontrada</h3>
                  <p className="text-sm text-slate-500 mb-4">
                    {hasActiveFilters ? 'Tente ajustar os filtros.' : 'Toque em "Nova OS" para criar a primeira.'}
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

      {/* Modal */}
      <Modal isOpen={showModal} onClose={closeModal} title={modalTitle}>
        {renderModalContent()}
      </Modal>

      {toasts.map((toast) => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

export default App;
