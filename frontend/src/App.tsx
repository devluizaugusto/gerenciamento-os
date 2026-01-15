import { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import ServiceOrderCard from './components/orders/ServiceOrderCard';
import Modal from './components/common/Modal';
import Toast from './components/common/Toast';
import Statistics from './components/common/Statistics';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Lazy load componentes pesados do modal
const ServiceOrderForm = lazy(() => import('./components/orders/ServiceOrderForm'));
const ServiceOrderDetails = lazy(() => import('./components/orders/ServiceOrderDetails'));
import { OrdemServico, StatusFilter } from './types';
import { OrdemServicoFormData } from './schemas/ordemServicoSchema';
import {
  useOrdensServico,
  useCreateOrdemServico,
  useUpdateOrdemServico,
  useDeleteOrdemServico,
  useGeneratePDF,
  useGenerateRelatorioPDF,
} from './hooks/useOrdemServico';
import { useToast } from './hooks/useToast';

function App() {
  // Estados de filtros
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [diaFilter, setDiaFilter] = useState<string>('');
  const [mesFilter, setMesFilter] = useState<string>('');
  const [anoFilter, setAnoFilter] = useState<string>('');
  const [dataInicioFilter, setDataInicioFilter] = useState<string>('');
  const [dataFimFilter, setDataFimFilter] = useState<string>('');

  // Estados do modal
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<'create' | 'edit' | 'view' | null>(null);
  const [modalTitle, setModalTitle] = useState<string>('');
  const [selectedOrdem, setSelectedOrdem] = useState<OrdemServico | null>(null);

  // React Query hooks
  const { data: ordens = [], isLoading, error, refetch } = useOrdensServico();
  const createMutation = useCreateOrdemServico();
  const updateMutation = useUpdateOrdemServico();
  const deleteMutation = useDeleteOrdemServico();
  const generatePDFMutation = useGeneratePDF();
  const generateRelatorioPDFMutation = useGenerateRelatorioPDF();

  // Toast notifications
  const { toasts, removeToast, success, error: errorToast } = useToast();

  // Filtrar ordens com useMemo para otimização
  const filteredOrdens = useMemo(() => {
    let filtered = [...ordens];

    // Filtrar por status
    if (statusFilter !== 'todos') {
      filtered = filtered.filter(ordem => ordem.status === statusFilter);
    }

    // Filtrar por busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(ordem =>
        ordem.numero_os.toString().includes(term) ||
        ordem.solicitante.toLowerCase().includes(term) ||
        ordem.ubs.toLowerCase().includes(term) ||
        ordem.setor.toLowerCase().includes(term) ||
        ordem.descricao_problema.toLowerCase().includes(term)
      );
    }

    // Filtrar por dia
    if (diaFilter) {
      filtered = filtered.filter(ordem => {
        if (!ordem.data_abertura) return false;
        const [dia] = ordem.data_abertura.split('/');
        return parseInt(dia) === parseInt(diaFilter);
      });
    }

    // Filtrar por mês
    if (mesFilter) {
      filtered = filtered.filter(ordem => {
        if (!ordem.data_abertura) return false;
        const [, mes] = ordem.data_abertura.split('/');
        return parseInt(mes) === parseInt(mesFilter);
      });
    }

    // Filtrar por ano
    if (anoFilter) {
      filtered = filtered.filter(ordem => {
        if (!ordem.data_abertura) return false;
        const [, , ano] = ordem.data_abertura.split('/');
        return parseInt(ano) === parseInt(anoFilter);
      });
    }

    // Filtrar por intervalo de datas
    if (dataInicioFilter || dataFimFilter) {
      filtered = filtered.filter(ordem => {
        if (!ordem.data_abertura) return false;

        const [dia, mes, ano] = ordem.data_abertura.split('/');
        const dataOrdem = Date.UTC(parseInt(ano), parseInt(mes) - 1, parseInt(dia));

        let dentroDoIntervalo = true;

        if (dataInicioFilter) {
          const [anoInicio, mesInicio, diaInicio] = dataInicioFilter.split('-');
          const dataInicio = Date.UTC(parseInt(anoInicio), parseInt(mesInicio) - 1, parseInt(diaInicio));
          if (dataOrdem < dataInicio) {
            dentroDoIntervalo = false;
          }
        }

        if (dataFimFilter && dentroDoIntervalo) {
          const [anoFim, mesFim, diaFim] = dataFimFilter.split('-');
          const dataFim = Date.UTC(parseInt(anoFim), parseInt(mesFim) - 1, parseInt(diaFim));
          if (dataOrdem > dataFim) {
            dentroDoIntervalo = false;
          }
        }
        return dentroDoIntervalo;
      });
    }

    // Ordenar por data de abertura (crescente - do primeiro dia ao último)
    filtered.sort((a, b) => {
      if (!a.data_abertura) return 1;
      if (!b.data_abertura) return -1;
      
      const [diaA, mesA, anoA] = a.data_abertura.split('/');
      const [diaB, mesB, anoB] = b.data_abertura.split('/');
      
      const dataA = Date.UTC(parseInt(anoA), parseInt(mesA) - 1, parseInt(diaA));
      const dataB = Date.UTC(parseInt(anoB), parseInt(mesB) - 1, parseInt(diaB));
      
      return dataA - dataB;
    });

    return filtered;
  }, [ordens, statusFilter, searchTerm, diaFilter, mesFilter, anoFilter, dataInicioFilter, dataFimFilter]);

  // Handlers com useCallback para evitar re-renders
  const closeModal = useCallback(() => {
    setShowModal(false);
    setModalContent(null);
    setModalTitle('');
    setSelectedOrdem(null);
  }, []);

  const handleCreate = useCallback(() => {
    setSelectedOrdem(null);
    setModalContent('create');
    setModalTitle('Nova Ordem de Serviço');
    setShowModal(true);
  }, []);

  const handleEdit = useCallback((ordem: OrdemServico) => {
    setSelectedOrdem(ordem);
    setModalContent('edit');
    setModalTitle(`Editar OS #${ordem.numero_os}`);
    setShowModal(true);
  }, []);

  const handleView = useCallback((ordem: OrdemServico) => {
    setSelectedOrdem(ordem);
    setModalContent('view');
    setModalTitle(`Detalhes da OS #${ordem.numero_os}`);
    setShowModal(true);
  }, []);

  const handleSubmit = async (formData: OrdemServicoFormData) => {
    try {
      if (modalContent === 'edit' && selectedOrdem) {
        // Atualizar ordem existente
        await updateMutation.mutateAsync({
          id: selectedOrdem.id,
          data: formData,
        });
        success(`✅ Ordem de Serviço #${selectedOrdem.numero_os} atualizada com sucesso!`);
      } else {
        // Criar nova ordem
        const novaOrdem = await createMutation.mutateAsync(formData);
        success(`🎉 Ordem de Serviço #${novaOrdem.numero_os} criada com sucesso!`);
      }
      
      // Aguardar um pouco para garantir que o refetch foi completado
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
        errorToast('🗑️ Ordem de Serviço excluída com sucesso!');
      } catch (err: any) {
        console.error('Erro ao deletar ordem:', err);
        errorToast(err.response?.data?.error || '❌ Erro ao deletar ordem de serviço');
      }
    }
  }, [deleteMutation, errorToast]);

  const handleGeneratePDF = useCallback(async (id: number) => {
    try {
      await generatePDFMutation.mutateAsync(id);
      success('📄 PDF gerado com sucesso!');
    } catch (err: any) {
      console.error('Erro ao gerar PDF:', err);
      errorToast(err.response?.data?.error || '❌ Erro ao gerar PDF');
    }
  }, [generatePDFMutation, success, errorToast]);

  const handleGenerateRelatorioPDF = useCallback(async () => {
    try {
      await generateRelatorioPDFMutation.mutateAsync({
        status: statusFilter !== 'todos' ? statusFilter : null,
        search: searchTerm || null,
        dia: diaFilter || null,
        mes: mesFilter || null,
        ano: anoFilter || null,
        dataInicio: dataInicioFilter || null,
        dataFim: dataFimFilter || null,
      });
      success('📊 Relatório PDF gerado com sucesso!');
    } catch (err: any) {
      console.error('Erro ao gerar relatório PDF:', err);
      errorToast(err.response?.data?.error || '❌ Erro ao gerar relatório PDF');
    }
  }, [generateRelatorioPDFMutation, statusFilter, searchTerm, diaFilter, mesFilter, anoFilter, dataInicioFilter, dataFimFilter, success, errorToast]);

  const limparFiltros = useCallback(() => {
    setStatusFilter('todos');
    setSearchTerm('');
    setDiaFilter('');
    setMesFilter('');
    setAnoFilter('');
    setDataInicioFilter('');
    setDataFimFilter('');
  }, []);

  const temFiltrosAtivos = statusFilter !== 'todos' || searchTerm || diaFilter || mesFilter || anoFilter || dataInicioFilter || dataFimFilter;

  // Renderizar conteúdo do modal com Suspense
  const renderModalContent = () => {
    if (modalContent === 'create' || modalContent === 'edit') {
      return (
        <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
          <ServiceOrderForm
            ordem={selectedOrdem}
            onSubmit={handleSubmit}
            onCancel={closeModal}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </Suspense>
      );
    }
    
    if (modalContent === 'view' && selectedOrdem) {
      return (
        <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
          <ServiceOrderDetails ordem={selectedOrdem} />
        </Suspense>
      );
    }
    
    return null;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onNewOS={handleCreate}
        onGeneratePDF={handleGenerateRelatorioPDF}
        canGeneratePDF={filteredOrdens.length > 0}
      />

      <main className="min-h-[calc(100vh-280px)] pb-12 flex-1 pt-8">
        <div className="container p-4 md:p-6 lg:p-8">
          {/* Estatísticas */}
          <Statistics 
            ordens={ordens} 
            diaFilter={diaFilter}
            mesFilter={mesFilter}
            anoFilter={anoFilter}
            dataInicioFilter={dataInicioFilter}
            dataFimFilter={dataFimFilter}
          />

          {/* Filtros de Status */}
          <div className="flex flex-wrap gap-2 md:gap-3 mb-6">
            <button
              className={`btn px-3 md:px-5 py-2 md:py-3 text-xs md:text-sm font-semibold ${
                statusFilter === 'todos' 
                  ? '!bg-green-600 text-white hover:!bg-green-700' 
                  : '!bg-green-100 !text-green-700 hover:!bg-green-200'
              }`}
              onClick={() => setStatusFilter('todos')}
            >
              Todos ({ordens.length})
            </button>
            <button
              className={`btn px-3 md:px-5 py-2 md:py-3 text-xs md:text-sm font-semibold ${
                statusFilter === 'aberto' 
                  ? '!bg-red-600 text-white hover:!bg-red-700' 
                  : '!bg-red-100 !text-red-700 hover:!bg-red-200'
              }`}
              onClick={() => setStatusFilter('aberto')}
            >
              Abertos ({ordens.filter(o => o.status === 'aberto').length})
            </button>
            <button
              className={`btn px-3 md:px-5 py-2 md:py-3 text-xs md:text-sm font-semibold ${
                statusFilter === 'em_andamento' 
                  ? '!bg-amber-500 text-white hover:!bg-amber-600' 
                  : '!bg-amber-100 !text-amber-700 hover:!bg-amber-200'
              }`}
              onClick={() => setStatusFilter('em_andamento')}
            >
              Em Andamento ({ordens.filter(o => o.status === 'em_andamento').length})
            </button>
            <button
              className={`btn px-3 md:px-5 py-2 md:py-3 text-xs md:text-sm font-semibold ${
                statusFilter === 'finalizado' 
                  ? '!bg-green-600 text-white hover:!bg-green-700' 
                  : '!bg-green-100 !text-green-700 hover:!bg-green-200'
              }`}
              onClick={() => setStatusFilter('finalizado')}
            >
              Finalizados ({ordens.filter(o => o.status === 'finalizado').length})
            </button>
          </div>

          {/* Busca */}
          <div className="mb-6 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-text-muted pointer-events-none">
              🔍
            </span>
            <input
              type="text"
              placeholder="Buscar por número, solicitante, unidade, setor ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-5 py-3 text-sm md:text-base border-2 border-border-light rounded-xl focus:outline-none focus:border-primary transition-colors duration-200"
            />
          </div>

          {/* Filtros de Data */}
          <div className="mb-6 pb-6 border-b border-border-light">
            {/* Primeira linha: Dia, Mês, Ano */}
            <div className="flex gap-3 md:gap-4 flex-wrap items-end mb-4">
              <div className="m-0 min-w-[100px] md:min-w-[120px] flex-1 max-w-full md:max-w-[200px]">
                <label htmlFor="diaFilter" className="text-sm font-semibold mb-2 block text-text-secondary tracking-wide uppercase text-xs">
                  Dia:
                </label>
                <input
                  type="number"
                  id="diaFilter"
                  value={diaFilter}
                  onChange={(e) => setDiaFilter(e.target.value)}
                  placeholder="Informe o dia"
                  min="1"
                  max="31"
                  className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-border-light rounded-lg text-sm md:text-[0.9375rem] cursor-pointer font-medium transition-all duration-200 bg-white text-text-primary hover:border-border focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(220,38,38,0.08)]"
                />
              </div>

              <div className="m-0 min-w-[100px] md:min-w-[120px] flex-1 max-w-full md:max-w-[200px]">
                <label htmlFor="mesFilter" className="text-sm font-semibold mb-2 block text-text-secondary tracking-wide uppercase text-xs">
                  Mês:
                </label>
                <select
                  id="mesFilter"
                  value={mesFilter}
                  onChange={(e) => setMesFilter(e.target.value)}
                  className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-border-light rounded-lg text-sm md:text-[0.9375rem] cursor-pointer font-medium transition-all duration-200 bg-white text-text-primary hover:border-border focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(220,38,38,0.08)]"
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

              <div className="m-0 min-w-[100px] md:min-w-[120px] flex-1 max-w-full md:max-w-[200px]">
                <label htmlFor="anoFilter" className="text-sm font-semibold mb-2 block text-text-secondary tracking-wide uppercase text-xs">
                  Ano:
                </label>
                <input
                  type="number"
                  id="anoFilter"
                  value={anoFilter}
                  onChange={(e) => setAnoFilter(e.target.value)}
                  placeholder="Informe o ano"
                  min="2020"
                  max="2100"
                  className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-border-light rounded-lg text-sm md:text-[0.9375rem] cursor-pointer font-medium transition-all duration-200 bg-white text-text-primary hover:border-border focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(220,38,38,0.08)]"
                />
              </div>
            </div>

            {/* Segunda linha: Data Inicial, Data Final, Limpar Filtros */}
            <div className="flex gap-3 md:gap-4 flex-wrap items-end">
              <div className="m-0 min-w-[100px] md:min-w-[120px] flex-1 max-w-full md:max-w-[200px]">
                <label htmlFor="dataInicioFilter" className="text-sm font-semibold mb-2 block text-text-secondary tracking-wide uppercase text-xs">
                  Data Inicial:
                </label>
                <input
                  type="date"
                  id="dataInicioFilter"
                  value={dataInicioFilter}
                  onChange={(e) => setDataInicioFilter(e.target.value)}
                  max={dataFimFilter || undefined}
                  className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-border-light rounded-lg text-sm md:text-[0.9375rem] cursor-pointer font-medium transition-all duration-200 bg-white text-text-primary hover:border-border focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(220,38,38,0.08)]"
                />
              </div>

              <div className="m-0 min-w-[100px] md:min-w-[120px] flex-1 max-w-full md:max-w-[200px]">
                <label htmlFor="dataFimFilter" className="text-sm font-semibold mb-2 block text-text-secondary tracking-wide uppercase text-xs">
                  Data Final:
                </label>
                <input
                  type="date"
                  id="dataFimFilter"
                  value={dataFimFilter}
                  onChange={(e) => setDataFimFilter(e.target.value)}
                  min={dataInicioFilter || undefined}
                  className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-border-light rounded-lg text-sm md:text-[0.9375rem] cursor-pointer font-medium transition-all duration-200 bg-white text-text-primary hover:border-border focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(220,38,38,0.08)]"
                />
              </div>

              <div className="flex flex-col justify-end w-full md:w-auto">
                <label className="text-sm font-semibold mb-2 hidden md:block text-transparent select-none pointer-events-none">
                  -
                </label>
                <button
                  className="btn btn-secondary whitespace-nowrap text-sm md:text-base"
                  onClick={limparFiltros}
                  disabled={!temFiltrosAtivos}
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin text-6xl mb-4">⏳</div>
              <p className="text-text-muted text-lg">Carregando ordens de serviço...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
              <p className="text-red-600 text-lg font-semibold mb-2">❌ Erro ao carregar dados</p>
              <p className="text-red-500">{(error as Error).message}</p>
              <button onClick={() => refetch()} className="btn btn-primary mt-4">
                🔄 Tentar Novamente
              </button>
            </div>
          )}

          {/* Cards */}
          {!isLoading && !error && (
            <>
              {filteredOrdens.length === 0 ? (
                <div className="text-center py-16 px-4 md:px-8">
                  <div className="text-8xl mb-6">📋</div>
                  <h3 className="text-2xl font-bold text-text-primary mb-3">
                    Nenhuma ordem de serviço encontrada
                  </h3>
                  <p className="text-text-muted mb-6 text-base md:text-lg">
                    {temFiltrosAtivos
                      ? 'Tente ajustar os filtros ou limpe-os para ver todas as ordens.'
                      : 'Crie sua primeira ordem de serviço clicando no botão "Nova OS" acima.'}
                  </p>
                  {temFiltrosAtivos && (
                    <button onClick={limparFiltros} className="btn btn-secondary">
                      Limpar Filtros
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {filteredOrdens.map((ordem) => (
                    <ServiceOrderCard
                      key={ordem.id}
                      ordem={ordem}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onView={handleView}
                      onGeneratePDF={handleGeneratePDF}
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

      {/* Toast Notifications */}
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
