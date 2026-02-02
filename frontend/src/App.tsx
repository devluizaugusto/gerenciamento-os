import { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import Modal from './components/common/Modal';
import Toast from './components/common/Toast';
import Statistics from './components/common/Statistics';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

const ServiceOrderForm = lazy(() => import('./components/orders/ServiceOrderForm'));
const ServiceOrderDetails = lazy(() => import('./components/orders/ServiceOrderDetails'));
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
  '01': 'Jan',
  '02': 'Fev',
  '03': 'Mar',
  '04': 'Abr',
  '05': 'Mai',
  '06': 'Jun',
  '07': 'Jul',
  '08': 'Ago',
  '09': 'Set',
  '10': 'Out',
  '11': 'Nov',
  '12': 'Dez',
};

const getCurrentDate = () => {
  const date = new Date();
  return {
    month: String(date.getMonth() + 1).padStart(2, '0'),
    year: String(date.getFullYear())
  };
};

const formatMonthYear = (month: string, year: string): string => {
  const abbreviatedMonth = ABBREVIATED_MONTHS[month] || month;
  return `${abbreviatedMonth}/${year}`;
};

function App() {
  const { month: currentMonth, year: currentYear } = getCurrentDate();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dayFilter, setDayFilter] = useState<string>('');
  const [monthFilter, setMonthFilter] = useState<string>(currentMonth);
  const [yearFilter, setYearFilter] = useState<string>(currentYear);
  const [startDateFilter, setStartDateFilter] = useState<string>('');
  const [endDateFilter, setEndDateFilter] = useState<string>('');

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
          if (orderDate < startDate) {
            withinRange = false;
          }
        }

        if (endDateFilter && withinRange) {
          const [endYear, endMonth, endDay] = endDateFilter.split('-');
          const endDate = Date.UTC(parseInt(endYear), parseInt(endMonth) - 1, parseInt(endDay));
          if (orderDate > endDate) {
            withinRange = false;
          }
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
        await updateMutation.mutateAsync({
          id: selectedOrder.id,
          data: formData,
        });
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
      errorToast(err.response?.data?.error || '❌ Erro ao gerar relatório PDF');
    }
  }, [generateReportPDFMutation, statusFilter, searchTerm, dayFilter, monthFilter, yearFilter, startDateFilter, endDateFilter, success, errorToast]);

  const clearFilters = useCallback(() => {
    const { month, year } = getCurrentDate();
    
    setStatusFilter('todos');
    setSearchTerm('');
    setDayFilter('');
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
           dayFilter !== '' || 
           monthFilter !== currentMonth || 
           yearFilter !== currentYear || 
           startDateFilter !== '' || 
           endDateFilter !== '';
  }, [statusFilter, searchTerm, dayFilter, monthFilter, yearFilter, startDateFilter, endDateFilter, currentMonth, currentYear]);

  const isUsingDateFilters = useMemo(() => {
    return dayFilter !== '' || monthFilter !== '' || yearFilter !== '';
  }, [dayFilter, monthFilter, yearFilter]);

  const isUsingDateRangeFilters = useMemo(() => {
    return startDateFilter !== '' || endDateFilter !== '';
  }, [startDateFilter, endDateFilter]);

  const renderModalContent = () => {
    if (modalContent === 'create' || modalContent === 'edit') {
      return (
        <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
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
        <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
          <ServiceOrderDetails ordem={selectedOrder} />
        </Suspense>
      );
    }
    
    return null;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onNewOS={handleCreate}
        onGeneratePDF={handleGenerateReportPDF}
        canGeneratePDF={filteredOrders.length > 0}
      />

      <main className="min-h-[calc(100vh-280px)] pb-12 flex-1 pt-8">
        <div className="container p-4 md:p-6 lg:p-8">
          <Statistics 
            orders={orders} 
            dayFilter={dayFilter}
            monthFilter={monthFilter}
            yearFilter={yearFilter}
            startDateFilter={startDateFilter}
            endDateFilter={endDateFilter}
          />

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 shadow-lg mb-6">
            <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center gap-2">
              <span className="text-3xl">🔍</span>
              Filtros e Buscas
            </h2>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                  statusFilter === 'todos' 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' 
                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200 hover:shadow-md border border-blue-300'
                }`}
                onClick={() => setStatusFilter('todos')}
              >
                Todos ({orders.length})
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  statusFilter === 'aberto' 
                    ? 'bg-red-800 text-white hover:bg-red-900' 
                    : 'bg-red-200 text-red-900 hover:bg-red-300'
                }`}
                onClick={() => setStatusFilter('aberto')}
              >
                Abertos ({orders.filter(o => o.status === 'aberto').length})
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  statusFilter === 'em_andamento' 
                    ? 'bg-yellow-700 text-white hover:bg-yellow-800' 
                    : 'bg-yellow-200 text-yellow-900 hover:bg-yellow-300'
                }`}
                onClick={() => setStatusFilter('em_andamento')}
              >
                Em Andamento ({orders.filter(o => o.status === 'em_andamento').length})
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  statusFilter === 'finalizado' 
                    ? 'bg-green-800 text-white hover:bg-green-900' 
                    : 'bg-green-200 text-green-900 hover:bg-green-300'
                }`}
                onClick={() => setStatusFilter('finalizado')}
              >
                Finalizados ({orders.filter(o => o.status === 'finalizado').length})
              </button>
            </div>

            <div className="mb-4 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar por número, solicitante, unidade, setor ou descrição..."
                value={searchTerm}
                onChange={(e) => {
                  const value = e.target.value;
                  const sanitizedValue = value.replace(/-/g, '');
                  setSearchTerm(sanitizedValue);
                }}
                onKeyDown={(e) => {
                  if (e.key === '-') {
                    e.preventDefault();
                  }
                }}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              />
            </div>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label htmlFor="dayFilter" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  Dia:
                </label>
                <input
                  type="number"
                  id="dayFilter"
                  value={dayFilter}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 31 && !value.includes('-'))) {
                      setDayFilter(value);
                    }
                  }}
                  onKeyDown={(e) => {
                    // Block minus (-), plus (+) and 'e' keys
                    if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') {
                      e.preventDefault();
                    }
                  }}
                  placeholder="Dia (1-31)"
                  min="1"
                  max="31"
                  disabled={isUsingDateRangeFilters}
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div>
                <label htmlFor="monthFilter" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  Mês:
                </label>
                <select
                  id="monthFilter"
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  disabled={isUsingDateRangeFilters}
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">Todos</option>
                  <option value="01">Janeiro</option>
                  <option value="02">Fevereiro</option>
                  <option value="03">Março</option>
                  <option value="04">Abril</option>
                  <option value="05">Maio</option>
                  <option value="06">Junho</option>
                  <option value="07">Julho</option>
                  <option value="08">Agosto</option>
                  <option value="09">Setembro</option>
                  <option value="10">Outubro</option>
                  <option value="11">Novembro</option>
                  <option value="12">Dezembro</option>
                </select>
              </div>

              <div>
                <label htmlFor="yearFilter" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  Ano:
                </label>
                <input
                  type="number"
                  id="yearFilter"
                  value={yearFilter}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || (parseInt(value) >= 2020 && parseInt(value) <= 2100 && !value.includes('-'))) {
                      setYearFilter(value);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') {
                      e.preventDefault();
                    }
                  }}
                  placeholder="Ano (2020-2100)"
                  min="2020"
                  max="2100"
                  disabled={isUsingDateRangeFilters}
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label htmlFor="startDateFilter" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  Data Inicial:
                </label>
                <input
                  type="date"
                  id="startDateFilter"
                  value={startDateFilter}
                  onChange={(e) => setStartDateFilter(e.target.value)}
                  max={endDateFilter || undefined}
                  disabled={isUsingDateFilters}
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div>
                <label htmlFor="endDateFilter" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  Data Final:
                </label>
                <input
                  type="date"
                  id="endDateFilter"
                  value={endDateFilter}
                  onChange={(e) => setEndDateFilter(e.target.value)}
                  min={startDateFilter || undefined}
                  disabled={isUsingDateFilters}
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div className="flex items-end gap-2">
                <button
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                >
                  📅 Mês Atual
                </button>
                <button
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={viewAllHistory}
                >
                  📚 Todo Histórico
                </button>
              </div>
            </div>
            
            {monthFilter && yearFilter && (
              <div className="mt-4 bg-green-100 border-2 border-green-300 rounded-lg p-3 flex items-center gap-2">
                <span className="text-lg">📌</span>
                <p className="text-sm font-semibold text-green-800">
                  Mostrando Ordens de Serviços de: <span className="font-bold">{formatMonthYear(monthFilter, yearFilter)}</span>
                </p>
              </div>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin text-6xl mb-4">⏳</div>
              <p className="text-text-muted text-lg">Carregando ordens de serviço...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
              <p className="text-red-600 text-lg font-semibold mb-2">❌ Erro ao carregar dados</p>
              <p className="text-red-500">{(error as Error).message}</p>
              <button onClick={() => refetch()} className="btn btn-primary mt-4">
                🔄 Tentar Novamente
              </button>
            </div>
          )}

          {!isLoading && !error && (
            <>
              {filteredOrders.length === 0 ? (
                <div className="text-center py-16 px-4 md:px-8">
                  <div className="text-8xl mb-6">📋</div>
                  <h3 className="text-2xl font-bold text-text-primary mb-3">
                    Nenhuma ordem de serviço encontrada
                  </h3>
                  <p className="text-text-muted mb-6 text-base md:text-lg">
                    {hasActiveFilters
                      ? 'Tente ajustar os filtros ou limpe-os para ver todas as ordens.'
                      : 'Crie sua primeira ordem de serviço clicando no botão "Nova OS" acima.'}
                  </p>
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="btn btn-secondary">
                      Limpar Filtros
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {filteredOrders.map((order) => (
                    <ServiceOrderCard
                      key={order.id}
                      ordem={order}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />

      {/* Modal */}
      <Modal isOpen={showModal} onClose={closeModal} title={modalTitle}>
        {renderModalContent()}
      </Modal>

      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

export default App;
