import React, { memo, useMemo } from 'react';
import { ServiceOrder } from '../../types';

interface StatisticsProps {
  orders: ServiceOrder[];
  dayFilter?: string;
  monthFilter?: string;
  yearFilter?: string;
  startDateFilter?: string;
  endDateFilter?: string;
}

const MONTHS = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const Statistics: React.FC<StatisticsProps> = memo(({
  orders, dayFilter, monthFilter, yearFilter, startDateFilter, endDateFilter,
}) => {
  const stats = useMemo(() => {
    const today = new Date();
    const cDay   = dayFilter   ? parseInt(dayFilter)   : today.getDate();
    const cMonth = monthFilter ? parseInt(monthFilter) : today.getMonth() + 1;
    const cYear  = yearFilter  ? parseInt(yearFilter)  : today.getFullYear();

    let osDay = 0, osMonth = 0, osYear = 0, osPeriod = 0;
    const hasPeriod = !!(startDateFilter || endDateFilter);

    let startDate: Date | null = null;
    let endDate: Date | null = null;
    if (startDateFilter) {
      const [y, m, d] = startDateFilter.split('-');
      startDate = new Date(+y, +m - 1, +d);
    }
    if (endDateFilter) {
      const [y, m, d] = endDateFilter.split('-');
      endDate = new Date(+y, +m - 1, +d, 23, 59, 59);
    }

    orders.forEach(o => {
      if (!o.data_abertura) return;
      const [d, m, y] = o.data_abertura.split('/').map(Number);
      const dt = new Date(y, m - 1, d);
      if (hasPeriod) {
        if ((!startDate || dt >= startDate) && (!endDate || dt <= endDate)) osPeriod++;
      }
      if (y === cYear) {
        osYear++;
        if (m === cMonth) {
          osMonth++;
          if (d === cDay) osDay++;
        }
      }
    });

    return { osDay, osMonth, osYear, osPeriod, cDay, cMonth, cYear, hasPeriod };
  }, [orders, dayFilter, monthFilter, yearFilter, startDateFilter, endDateFilter]);

  const fmtBR = (iso: string) => {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  };

  type Tile = {
    label: string;
    value: number;
    sub: string;
    accent: string;
    icon: React.ReactNode;
  };

  const tiles: Tile[] = [
    {
      label: dayFilter ? `Dia ${stats.cDay}` : 'Hoje',
      value: stats.osDay,
      sub: 'OS abertas',
      accent: 'text-primary bg-red-50 border-red-100',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: `${MONTHS[stats.cMonth]}/${stats.cYear}`,
      value: stats.osMonth,
      sub: 'No mês',
      accent: 'text-amber-600 bg-amber-50 border-amber-100',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      label: `Ano ${stats.cYear}`,
      value: stats.osYear,
      sub: 'No ano',
      accent: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    ...(stats.hasPeriod ? [{
      label: 'Período',
      value: stats.osPeriod,
      sub: startDateFilter && endDateFilter
        ? `${fmtBR(startDateFilter)} — ${fmtBR(endDateFilter)}`
        : startDateFilter ? `A partir de ${fmtBR(startDateFilter)}`
        : endDateFilter   ? `Até ${fmtBR(endDateFilter!)}` : '',
      accent: 'text-blue-600 bg-blue-50 border-blue-100',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    } as Tile] : []),
  ];

  return (
    <div className={`grid gap-3 mb-5 ${
      tiles.length === 4
        ? 'grid-cols-2 lg:grid-cols-4'
        : 'grid-cols-3'
    }`}>
      {tiles.map((t) => (
        <div key={t.label} className="stat-card">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide leading-tight">{t.label}</span>
            <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center border shrink-0 ${t.accent}`}>
              {t.icon}
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-800 leading-none mb-0.5 sm:mb-1">{t.value}</p>
          <p className="text-[10px] sm:text-xs text-slate-500 leading-tight truncate">{t.sub}</p>
        </div>
      ))}
    </div>
  );
});

Statistics.displayName = 'Statistics';
export default Statistics;
