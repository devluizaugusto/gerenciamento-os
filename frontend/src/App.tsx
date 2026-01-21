import { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import ServiceOrderTable from './components/orders/ServiceOrderTable';
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
  useGenerateRelatorioPDF,
} from './hooks/useOrdemServico';
import { useToast } from './hooks/useToast';
import { useDebounce } from './hooks/useDebounce';

// Função utilitária para obter mês e ano atual
const getDataAtual = () => {
  const data = new Date();
  return {
    mes: String(data.getMonth() + 1).padStart(2, '0'),
    ano: String(data.getFullYear())
  };
};

function App() {
  // Obter mês e ano atual para filtro padrão
  const { mes: mesAtual, ano: anoAtual } = getDataAtual();

  // Estados de filtros
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [diaFilter, setDiaFilter] = useState<string>('');
  const [mesFilter, setMesFilter] = useState<string>(mesAtual); // Mês atual por padrão
  const [anoFilter, setAnoFilter] = useState<string>(anoAtual); // Ano atual por padrão
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
  const generateRelatorioPDFMutation = useGenerateRelatorioPDF();

  // Toast notifications
  const { toasts, removeToast, success, error: errorToast } = useToast();

  // Debounce do searchTerm para evitar re-renders excessivos durante digitação
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Filtrar ordens com useMemo para otimização
  const filteredOrdens = useMemo(() => {
    let filtered = [...ordens];

    // Filtrar por status
    if (statusFilter !== 'todos') {
      filtered = filtered.filter(ordem => ordem.status === statusFilter);
    }

    // Filtrar por busca (usando debounced value)
    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(ordem =>
        ordem.numero_os.toString().includes(term) ||
        ordem.solicitante.toLowerCase().includes(term) ||
        ordem.unidade.toLowerCase().includes(term) ||
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
  }, [ordens, statusFilter, debouncedSearchTerm, diaFilter, mesFilter, anoFilter, dataInicioFilter, dataFimFilter]);

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
        success('🗑️ Ordem de Serviço excluída com sucesso!');
      } catch (err: any) {
        console.error('Erro ao deletar ordem:', err);
        errorToast(err.response?.data?.error || '❌ Erro ao deletar ordem de serviço');
      }
    }
  }, [deleteMutation, success, errorToast]);

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
    const { mes, ano } = getDataAtual();
    
    setStatusFilter('todos');
    setSearchTerm('');
    setDiaFilter('');
    setMesFilter(mes);
    setAnoFilter(ano);
    setDataInicioFilter('');
    setDataFimFilter('');
  }, []);

  const verTodoHistorico = useCallback(() => {
    setStatusFilter('todos');
    setSearchTerm('');
    setDiaFilter('');
    setMesFilter(''); // Remove filtro de mês
    setAnoFilter(''); // Remove filtro de ano
    setDataInicioFilter('');
    setDataFimFilter('');
  }, []);

  // Verificar se há filtros ativos além do padrão (mês e ano atual)
  const temFiltrosAtivos = useMemo(() => {
    return statusFilter !== 'todos' || 
           searchTerm !== '' || 
           diaFilter !== '' || 
           mesFilter !== mesAtual || 
           anoFilter !== anoAtual || 
           dataInicioFilter !== '' || 
           dataFimFilter !== '';
  }, [statusFilter, searchTerm, diaFilter, mesFilter, anoFilter, dataInicioFilter, dataFimFilter, mesAtual, anoAtual]);

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

          {/* Card de Filtros */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5 shadow-lg mb-6">
            {/* Título */}
            <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center gap-2">
              <span className="text-3xl">🔍</span>
              Filtros e Buscas
            </h2>
            
            {/* Filtros de Status */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                  statusFilter === 'todos' 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' 
                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200 hover:shadow-md border border-blue-300'
                }`}
                onClick={() => setStatusFilter('todos')}
              >
                Todos ({ordens.length})
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  statusFilter === 'aberto' 
                    ? 'bg-red-800 text-white hover:bg-red-900' 
                    : 'bg-red-200 text-red-900 hover:bg-red-300'
                }`}
                onClick={() => setStatusFilter('aberto')}
              >
                Abertos ({ordens.filter(o => o.status === 'aberto').length})
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  statusFilter === 'em_andamento' 
                    ? 'bg-amber-700 text-white hover:bg-amber-800' 
                    : 'bg-amber-200 text-amber-900 hover:bg-amber-300'
                }`}
                onClick={() => setStatusFilter('em_andamento')}
              >
                Em Andamento ({ordens.filter(o => o.status === 'em_andamento').length})
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  statusFilter === 'finalizado' 
                    ? 'bg-green-800 text-white hover:bg-green-900' 
                    : 'bg-green-200 text-green-900 hover:bg-green-300'
                }`}
                onClick={() => setStatusFilter('finalizado')}
              >
                Finalizados ({ordens.filter(o => o.status === 'finalizado').length})
              </button>
            </div>

            {/* Busca */}
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
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              />
            </div>

            {/* Primeira linha: Dia, Mês, Ano */}
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label htmlFor="diaFilter" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  Dia:
                </label>
                <input
                  type="number"
                  id="diaFilter"
                  value={diaFilter}
                  onChange={(e) => setDiaFilter(e.target.value)}
                  placeholder="Dia (1-31)"
                  min="1"
                  max="31"
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label htmlFor="mesFilter" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  Mês:
                </label>
                <select
                  id="mesFilter"
                  value={mesFilter}
                  onChange={(e) => setMesFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors cursor-pointer"
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
                <label htmlFor="anoFilter" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  Ano:
                </label>
                <input
                  type="number"
                  id="anoFilter"
                  value={anoFilter}
                  onChange={(e) => setAnoFilter(e.target.value)}
                  placeholder="Ano (2020-2100)"
                  min="2020"
                  max="2100"
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>

            {/* Segunda linha: Data Inicial, Data Final, Limpar Filtros */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label htmlFor="dataInicioFilter" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  Data Inicial:
                </label>
                <input
                  type="date"
                  id="dataInicioFilter"
                  value={dataInicioFilter}
                  onChange={(e) => setDataInicioFilter(e.target.value)}
                  max={dataFimFilter || undefined}
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label htmlFor="dataFimFilter" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                  Data Final:
                </label>
                <input
                  type="date"
                  id="dataFimFilter"
                  value={dataFimFilter}
                  onChange={(e) => setDataFimFilter(e.target.value)}
                  min={dataInicioFilter || undefined}
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                />
              </div>

              <div className="flex items-end gap-2">
                <button
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={limparFiltros}
                  disabled={!temFiltrosAtivos}
                >
                  📅 Mês Atual
                </button>
                <button
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={verTodoHistorico}
                >
                  📚 Todo Histórico
                </button>
              </div>
            </div>
            
            {/* Indicador de filtro ativo */}
            {mesFilter && anoFilter && (
              <div className="mt-4 bg-green-100 border-2 border-green-300 rounded-lg p-3 flex items-center gap-2">
                <span className="text-lg">📌</span>
                <p className="text-sm font-semibold text-green-800">
                  Mostrando ordens de <span className="font-bold">{mesFilter}/{anoFilter}</span>
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
                <ServiceOrderTable
                  ordens={filteredOrdens}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={handleView}
                />
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
