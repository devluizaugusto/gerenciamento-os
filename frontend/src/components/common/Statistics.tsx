import { memo, useMemo } from 'react';
import { OrdemServico } from '../../types';

interface StatisticsProps {
  ordens: OrdemServico[];
  diaFilter?: string;
  mesFilter?: string;
  anoFilter?: string;
  dataInicioFilter?: string;
  dataFimFilter?: string;
}

const Statistics: React.FC<StatisticsProps> = memo(({ ordens, diaFilter, mesFilter, anoFilter, dataInicioFilter, dataFimFilter }) => {
  const statistics = useMemo(() => {
    const hoje = new Date();
    const diaAtual = diaFilter ? parseInt(diaFilter) : hoje.getDate();
    const mesAtual = mesFilter ? parseInt(mesFilter) : hoje.getMonth() + 1;
    const anoAtual = anoFilter ? parseInt(anoFilter) : hoje.getFullYear();

    let osDia = 0;
    let osMes = 0;
    let osAno = 0;
    let osPeriodo = 0;

    // Se houver filtro de período, contar apenas as OS dentro do intervalo
    const temFiltroPeriodo = dataInicioFilter || dataFimFilter;
    let dataInicio: Date | null = null;
    let dataFim: Date | null = null;

    if (dataInicioFilter) {
      const [ano, mes, dia] = dataInicioFilter.split('-');
      dataInicio = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    }

    if (dataFimFilter) {
      const [ano, mes, dia] = dataFimFilter.split('-');
      dataFim = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
      dataFim.setHours(23, 59, 59, 999); // Incluir o dia inteiro
    }

    ordens.forEach(ordem => {
      if (!ordem.data_abertura) return;

      const [dia, mes, ano] = ordem.data_abertura.split('/').map(Number);
      const dataOrdem = new Date(ano, mes - 1, dia);

      // Se houver filtro de período, contar para o período
      if (temFiltroPeriodo) {
        let dentroDoIntervalo = true;

        if (dataInicio && dataOrdem < dataInicio) {
          dentroDoIntervalo = false;
        }
        if (dataFim && dataOrdem > dataFim) {
          dentroDoIntervalo = false;
        }

        if (dentroDoIntervalo) {
          osPeriodo++;
        }
      }

      // Contar por ano
      if (ano === anoAtual) {
        osAno++;

        // Contar por mês
        if (mes === mesAtual) {
          osMes++;

          // Contar por dia
          if (dia === diaAtual) {
            osDia++;
          }
        }
      }
    });

    return { osDia, osMes, osAno, osPeriodo, diaAtual, mesAtual, anoAtual, temFiltroPeriodo };
  }, [ordens, diaFilter, mesFilter, anoFilter, dataInicioFilter, dataFimFilter]);

  // Função para formatar nome do mês
  const getNomeMes = (mes: number) => {
    const meses = [
      '', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return meses[mes];
  };

  // Verificar se há filtros aplicados
  const temFiltros = diaFilter || mesFilter || anoFilter || dataInicioFilter || dataFimFilter;

  // Formatar datas do período para exibição
  const formatarDataBR = (dataISO: string): string => {
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 shadow-lg mb-6 animate-fadeInUp">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">📊</span>
        <h2 className="text-lg font-bold text-blue-900">
          Estatísticas de Ordens de Serviço
          {temFiltros && <span className="text-sm text-blue-600 ml-2">(Filtrado)</span>}
        </h2>
      </div>
      
      <div className={`grid grid-cols-1 ${statistics.temFiltroPeriodo ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-4`}>
        {/* OS do Dia */}
        <div className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-2 border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-1">
                📅 {diaFilter ? `Dia ${statistics.diaAtual}` : 'Hoje'}
              </p>
              <p className="text-3xl font-extrabold text-blue-900">
                {statistics.osDia}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {statistics.osDia === 1 ? 'OS criada' : 'OS criadas'}
              </p>
            </div>
            <div className="text-4xl opacity-20">📋</div>
          </div>
        </div>

        {/* OS do Mês */}
        <div className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-2 border-indigo-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide mb-1">
                📆 {mesFilter ? getNomeMes(statistics.mesAtual) : 'Este Mês'}
              </p>
              <p className="text-3xl font-extrabold text-indigo-900">
                {statistics.osMes}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {statistics.osMes === 1 ? 'OS criada' : 'OS criadas'}
              </p>
            </div>
            <div className="text-4xl opacity-20">📊</div>
          </div>
        </div>

        {/* OS do Ano */}
        <div className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-2 border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide mb-1">
                🗓️ {anoFilter ? `Ano ${statistics.anoAtual}` : 'Este Ano'}
              </p>
              <p className="text-3xl font-extrabold text-purple-900">
                {statistics.osAno}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {statistics.osAno === 1 ? 'OS criada' : 'OS criadas'}
              </p>
            </div>
            <div className="text-4xl opacity-20">📈</div>
          </div>
        </div>

        {/* OS do Período (se houver filtro) */}
        {statistics.temFiltroPeriodo && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-2 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1 whitespace-nowrap">
                  📅 OS criadas por período
                </p>
                <p className="text-3xl font-extrabold text-green-900">
                  {statistics.osPeriodo}
                </p>
                <p className="text-xs text-gray-600 mt-1 font-medium">
                  {dataInicioFilter && dataFimFilter ? (
                    <>
                      {formatarDataBR(dataInicioFilter)} a {formatarDataBR(dataFimFilter)}
                    </>
                  ) : dataInicioFilter ? (
                    <>A partir de {formatarDataBR(dataInicioFilter)}</>
                  ) : dataFimFilter ? (
                    <>Até {formatarDataBR(dataFimFilter)}</>
                  ) : (
                    'Período selecionado'
                  )}
                </p>
              </div>
              <div className="text-4xl opacity-20">🎯</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

Statistics.displayName = 'Statistics';

export default Statistics;
