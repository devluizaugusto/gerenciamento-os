import { memo, useMemo } from 'react';
import { ServiceOrder } from '../../types';

interface StatisticsProps {
  orders: ServiceOrder[];
  dayFilter?: string;
  monthFilter?: string;
  yearFilter?: string;
  startDateFilter?: string;
  endDateFilter?: string;
}

const Statistics: React.FC<StatisticsProps> = memo(({ orders, dayFilter, monthFilter, yearFilter, startDateFilter, endDateFilter }) => {
  const statistics = useMemo(() => {
    const today = new Date();
    const currentDay = dayFilter ? parseInt(dayFilter) : today.getDate();
    const currentMonth = monthFilter ? parseInt(monthFilter) : today.getMonth() + 1;
    const currentYear = yearFilter ? parseInt(yearFilter) : today.getFullYear();

    let osDay = 0;
    let osMonth = 0;
    let osYear = 0;
    let osPeriod = 0;

    // If there's a period filter, count only OS within range
    const hasPeriodFilter = startDateFilter || endDateFilter;
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    if (startDateFilter) {
      const [year, month, day] = startDateFilter.split('-');
      startDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    if (endDateFilter) {
      const [year, month, day] = endDateFilter.split('-');
      endDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      endDate.setHours(23, 59, 59, 999); // Include the entire day
    }

    orders.forEach(order => {
      if (!order.data_abertura) return;

      const [day, month, year] = order.data_abertura.split('/').map(Number);
      const orderDate = new Date(year, month - 1, day);

      // If there's a period filter, count for the period
      if (hasPeriodFilter) {
        let withinRange = true;

        if (startDate && orderDate < startDate) {
          withinRange = false;
        }
        if (endDate && orderDate > endDate) {
          withinRange = false;
        }

        if (withinRange) {
          osPeriod++;
        }
      }

      // Count by year
      if (year === currentYear) {
        osYear++;

        // Count by month
        if (month === currentMonth) {
          osMonth++;

          // Count by day
          if (day === currentDay) {
            osDay++;
          }
        }
      }
    });

    return { osDay, osMonth, osYear, osPeriod, currentDay, currentMonth, currentYear, hasPeriodFilter };
  }, [orders, dayFilter, monthFilter, yearFilter, startDateFilter, endDateFilter]);

  // Function to format month name
  const getMonthName = (month: number) => {
    const months = [
      '', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month];
  };

  // Check if there are applied filters
  const hasFilters = dayFilter || monthFilter || yearFilter || startDateFilter || endDateFilter;

  // Format dates from period for display
  const formatDateBR = (isoDate: string): string => {
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5 shadow-lg mb-6">
      <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center gap-2">
        <span className="text-3xl">📊</span>
        Estatísticas de Ordens de Serviços
        {hasFilters && <span className="text-base text-green-600 font-normal ml-2">(Filtrado)</span>}
      </h2>
      
      <div className={`grid grid-cols-1 ${statistics.hasPeriodFilter ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-4`}>
        {/* Day OS */}
        <div className="group bg-gradient-to-br from-emerald-100 via-emerald-200 to-emerald-100 rounded-xl p-5 border-2 border-emerald-300 shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all duration-300 cursor-default">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-extrabold text-emerald-800 uppercase tracking-widest drop-shadow-sm">
              {dayFilter ? `Dia ${statistics.currentDay}` : 'Hoje'}
            </p>
            <span className="text-2xl">📅</span>
          </div>
          <p className="text-5xl font-extrabold text-emerald-900 mb-2 group-hover:scale-105 transition-transform duration-300">
            {statistics.osDay}
          </p>
          <p className="text-sm text-emerald-700 font-semibold">
            {statistics.osDay === 1 ? 'Ordem de Serviço Criada' : 'Ordens de Serviços Criadas'}
          </p>
        </div>

        {/* Month OS */}
        <div className="group bg-gradient-to-br from-green-100 via-green-200 to-green-100 rounded-xl p-5 border-2 border-green-300 shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all duration-300 cursor-default">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-extrabold text-green-800 uppercase tracking-widest drop-shadow-sm">
              Mês: {getMonthName(statistics.currentMonth)}
            </p>
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-5xl font-extrabold text-green-900 mb-2 group-hover:scale-105 transition-transform duration-300">
            {statistics.osMonth}
          </p>
          <p className="text-sm text-green-700 font-semibold">
            {statistics.osMonth === 1 ? 'Ordem de Serviço Criada' : 'Ordens de Serviços Criadas'}
          </p>
        </div>

        {/* Year OS */}
        <div className="group bg-gradient-to-br from-teal-100 via-teal-200 to-teal-100 rounded-xl p-5 border-2 border-teal-300 shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all duration-300 cursor-default">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-extrabold text-teal-800 uppercase tracking-widest drop-shadow-sm">
              Ano: {statistics.currentYear}
            </p>
            <span className="text-2xl">🗓️</span>
          </div>
          <p className="text-5xl font-extrabold text-teal-900 mb-2 group-hover:scale-105 transition-transform duration-300">
            {statistics.osYear}
          </p>
          <p className="text-sm text-teal-700 font-semibold">
            {statistics.osYear === 1 ? 'Ordem de Serviço Criada' : 'Ordens de Serviços Criadas'}
          </p>
        </div>

        {/* Period OS (if there's a filter) */}
        {statistics.hasPeriodFilter && (
          <div className="group bg-gradient-to-br from-cyan-100 via-cyan-200 to-cyan-100 rounded-xl p-5 border-2 border-cyan-300 shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all duration-300 cursor-default">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-extrabold text-cyan-800 uppercase tracking-widest drop-shadow-sm">
                Período
              </p>
              <span className="text-2xl">📆</span>
            </div>
            <p className="text-5xl font-extrabold text-cyan-900 mb-2 group-hover:scale-105 transition-transform duration-300">
              {statistics.osPeriod}
            </p>
            <p className="text-sm text-cyan-700 font-semibold">
              {startDateFilter && endDateFilter ? (
                <>
                  {formatDateBR(startDateFilter)} - {formatDateBR(endDateFilter)}
                </>
              ) : startDateFilter ? (
                <>A partir de {formatDateBR(startDateFilter)}</>
              ) : endDateFilter ? (
                <>Até {formatDateBR(endDateFilter)}</>
              ) : (
                'Ordens de Serviços Criadas'
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
