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
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5 shadow-lg mb-6">
      <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center gap-2">
        <span className="text-3xl">📊</span>
        Estatísticas de Ordens de Serviço
        {temFiltros && <span className="text-base text-green-600 font-normal ml-2">(Filtrado)</span>}
      </h2>
      
      <div className={`grid grid-cols-1 ${statistics.temFiltroPeriodo ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-4`}>
        {/* OS do Dia */}
        <div className="group bg-gradient-to-br from-emerald-100 via-emerald-200 to-emerald-100 rounded-xl p-5 border-2 border-emerald-300 shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all duration-300 cursor-default">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-extrabold text-emerald-800 uppercase tracking-widest drop-shadow-sm">
              {diaFilter ? `Dia ${statistics.diaAtual}` : 'Hoje'}
            </p>
            <span className="text-2xl">📅</span>
          </div>
          <p className="text-5xl font-extrabold text-emerald-900 mb-2 group-hover:scale-105 transition-transform duration-300">
            {statistics.osDia}
          </p>
          <p className="text-sm text-emerald-700 font-semibold">
            {statistics.osDia === 1 ? 'Ordem criada' : 'Ordens criadas'}
          </p>
        </div>

        {/* OS do Mês */}
        <div className="group bg-gradient-to-br from-green-100 via-green-200 to-green-100 rounded-xl p-5 border-2 border-green-300 shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all duration-300 cursor-default">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-extrabold text-green-800 uppercase tracking-widest drop-shadow-sm">
              Mês: {getNomeMes(statistics.mesAtual)}
            </p>
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-5xl font-extrabold text-green-900 mb-2 group-hover:scale-105 transition-transform duration-300">
            {statistics.osMes}
          </p>
          <p className="text-sm text-green-700 font-semibold">
            {statistics.osMes === 1 ? 'Ordem criada' : 'Ordens criadas'}
          </p>
        </div>

        {/* OS do Ano */}
        <div className="group bg-gradient-to-br from-teal-100 via-teal-200 to-teal-100 rounded-xl p-5 border-2 border-teal-300 shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all duration-300 cursor-default">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-extrabold text-teal-800 uppercase tracking-widest drop-shadow-sm">
              Ano: {statistics.anoAtual}
            </p>
            <span className="text-2xl">🗓️</span>
          </div>
          <p className="text-5xl font-extrabold text-teal-900 mb-2 group-hover:scale-105 transition-transform duration-300">
            {statistics.osAno}
          </p>
          <p className="text-sm text-teal-700 font-semibold">
            {statistics.osAno === 1 ? 'Ordem criada' : 'Ordens criadas'}
          </p>
        </div>

        {/* OS do Período (se houver filtro) */}
        {statistics.temFiltroPeriodo && (
          <div className="group bg-gradient-to-br from-cyan-100 via-cyan-200 to-cyan-100 rounded-xl p-5 border-2 border-cyan-300 shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all duration-300 cursor-default">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-extrabold text-cyan-800 uppercase tracking-widest drop-shadow-sm">
                Período
              </p>
              <span className="text-2xl">📆</span>
            </div>
            <p className="text-5xl font-extrabold text-cyan-900 mb-2 group-hover:scale-105 transition-transform duration-300">
              {statistics.osPeriodo}
            </p>
            <p className="text-sm text-cyan-700 font-semibold">
              {dataInicioFilter && dataFimFilter ? (
                <>
                  {formatarDataBR(dataInicioFilter)} - {formatarDataBR(dataFimFilter)}
                </>
              ) : dataInicioFilter ? (
                <>A partir de {formatarDataBR(dataInicioFilter)}</>
              ) : dataFimFilter ? (
                <>Até {formatarDataBR(dataFimFilter)}</>
              ) : (
                'Ordens criadas'
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

Statistics.displayName = 'Statistics';

export default Statistics;
