import React, { memo, useMemo } from 'react';
import { ServiceOrder } from '../../types';

interface StatisticsProps {
  orders: ServiceOrder[];
  onSelectPeriod?: (period: 'today' | 'month' | 'year') => void;
}

const parseBRDate = (value?: string | null) => {
  if (!value) return null;
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
};

const sameDay = (date: Date, target: Date) =>
  date.getDate() === target.getDate() &&
  date.getMonth() === target.getMonth() &&
  date.getFullYear() === target.getFullYear();

const sameMonth = (date: Date, target: Date) =>
  date.getMonth() === target.getMonth() && date.getFullYear() === target.getFullYear();

const sameYear = (date: Date, target: Date) => date.getFullYear() === target.getFullYear();

const getCounts = (orders: ServiceOrder[]) => ({
  total: orders.length,
  aberto: orders.filter((o) => o.status === 'aberto').length,
  andamento: orders.filter((o) => o.status === 'em_andamento').length,
  finalizado: orders.filter((o) => o.status === 'finalizado').length,
});

const Statistics: React.FC<StatisticsProps> = memo(({ orders, onSelectPeriod }) => {
  const data = useMemo(() => {
    const now = new Date();
    const parsed = orders
      .map((order) => ({ order, date: parseBRDate(order.data_abertura) }))
      .filter((item): item is { order: ServiceOrder; date: Date } => Boolean(item.date));

    return {
      today: getCounts(parsed.filter(({ date }) => sameDay(date, now)).map(({ order }) => order)),
      month: getCounts(parsed.filter(({ date }) => sameMonth(date, now)).map(({ order }) => order)),
      year: getCounts(parsed.filter(({ date }) => sameYear(date, now)).map(({ order }) => order)),
    };
  }, [orders]);

  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = now.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase();
  const year = now.getFullYear();

  const cards = [
    {
      key: 'today' as const,
      eyebrow: 'Hoje',
      title: `Dia ${day}`,
      value: data.today.total,
      description: 'Ordens abertas hoje',
      counts: data.today,
      icon: 'calendar',
      accent: 'blue',
    },
    {
      key: 'month' as const,
      eyebrow: 'Este mês',
      title: `${month}/${year}`,
      value: data.month.total,
      description: 'Ordens abertas no mês',
      counts: data.month,
      icon: 'month',
      accent: 'violet',
    },
    {
      key: 'year' as const,
      eyebrow: 'Este ano',
      title: `Ano ${year}`,
      value: data.year.total,
      description: 'Ordens abertas no ano',
      counts: data.year,
      icon: 'year',
      accent: 'emerald',
    },
  ];

  const icons: Record<string, React.ReactNode> = {
    calendar: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M8 3v3m8-3v3M4.5 9.5h15M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"/><path strokeLinecap="round" d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01"/></svg>,
    month: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M5 4h14a1 1 0 0 1 1 1v15H4V5a1 1 0 0 1 1-1Z"/><path strokeLinecap="round" d="M8 2v4m8-4v4M7 10h10M7 14h3M14 14h3M7 18h3M14 18h3"/></svg>,
    year: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M4 19V5m0 14h16M8 16v-4m4 4V8m4 8V5"/></svg>,
  };

  const accents: Record<string, { icon: string; number: string; glow: string; line: string }> = {
    blue: { icon: 'bg-blue-50 text-blue-600 ring-blue-100', number: 'text-blue-700', glow: 'from-blue-500/10', line: 'bg-blue-500' },
    violet: { icon: 'bg-violet-50 text-violet-600 ring-violet-100', number: 'text-violet-700', glow: 'from-violet-500/10', line: 'bg-violet-500' },
    emerald: { icon: 'bg-emerald-50 text-emerald-600 ring-emerald-100', number: 'text-emerald-700', glow: 'from-emerald-500/10', line: 'bg-emerald-500' },
  };

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-5" aria-label="Resumo por período">
      {cards.map((card) => {
        const accent = accents[card.accent];
        return (
          <button
            key={card.key}
            type="button"
            onClick={() => onSelectPeriod?.(card.key)}
            className="period-card group text-left"
            title={`Filtrar pelas ordens de ${card.key === 'today' ? 'hoje' : card.key === 'month' ? 'este mês' : 'este ano'}`}
          >
            <div className={`period-card-glow bg-gradient-to-br ${accent.glow} to-transparent`} />
            <div className="relative z-10 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400">{card.eyebrow}</span>
                  <span className="period-card-arrow">↗</span>
                </div>
                <p className="mt-1 text-sm font-semibold text-slate-600">{card.title}</p>
              </div>
              <span className={`period-card-icon ring-4 ${accent.icon}`}>{icons[card.icon]}</span>
            </div>

            <div className="relative z-10 mt-4 flex items-end justify-between gap-3">
              <div>
                <p className={`text-4xl sm:text-[2.65rem] leading-none font-black tracking-tight ${accent.number}`}>{card.value}</p>
                <p className="mt-1.5 text-[11px] font-medium text-slate-400">{card.description}</p>
              </div>
            </div>

            <div className="relative z-10 mt-4 grid grid-cols-3 gap-1.5 border-t border-slate-100 pt-3">
              <span className="period-mini-stat"><strong>{card.counts.aberto}</strong> abertas</span>
              <span className="period-mini-stat"><strong>{card.counts.andamento}</strong> andamento</span>
              <span className="period-mini-stat"><strong>{card.counts.finalizado}</strong> finalizadas</span>
            </div>
            <span className={`absolute left-0 bottom-0 h-1 w-full ${accent.line} opacity-70`} />
          </button>
        );
      })}
    </section>
  );
});

Statistics.displayName = 'Statistics';
export default Statistics;
