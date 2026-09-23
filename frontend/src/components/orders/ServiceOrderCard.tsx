import React, { memo } from 'react';
import { ServiceOrder } from '../../types';
import { getStatusConfig } from '../../utils/statusColors';
import { useAuth } from '../../contexts/AuthContext';

interface ServiceOrderCardProps {
  ordem: ServiceOrder;
  onEdit: (ordem: ServiceOrder) => void;
  onDelete: (id: number) => void;
}

const STATUS_DOT: Record<string, string> = {
  aberto: '●',
  em_andamento: '◐',
  finalizado: '✓',
};

const Field: React.FC<{ label: string; value?: string | null; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="flex items-start gap-2 min-w-0">
    <span className="mt-0.5 shrink-0 text-slate-400">{icon}</span>
    <div className="min-w-0">
      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="truncate text-xs sm:text-sm font-semibold text-slate-700" title={value ?? ''}>{value || '—'}</p>
    </div>
  </div>
);

const ServiceOrderCard: React.FC<ServiceOrderCardProps> = memo(({ ordem, onEdit, onDelete }) => {
  const status = getStatusConfig(ordem.status);
  const { canEdit, canDelete } = useAuth();
  const statusIcon = STATUS_DOT[ordem.status] ?? '●';

  return (
    <article
      className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg animate-fadeInUp"
    >
      <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: status.color }} />

      <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 pb-3.5 pt-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base font-black tracking-tight text-slate-900">OS #{ordem.numero_os}</span>
            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">Chamado</span>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Aberta em {ordem.data_abertura}
          </p>
        </div>
        <span
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wide shadow-sm"
          style={{ backgroundColor: status.bgColor, color: status.color, border: `1px solid ${status.borderColor ?? status.color}` }}
        >
          <span aria-hidden>{statusIcon}</span>
          {status.label}
        </span>
      </header>

      <div className="flex flex-1 flex-col gap-3 px-4 py-4">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <Field label="Solicitante" value={ordem.solicitante} icon={<svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} />
          <Field label="Unidade" value={ordem.unidade} icon={<svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>} />
          <Field label="Setor" value={ordem.setor} icon={<svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>} />
          <Field label="Fechamento" value={ordem.data_fechamento} icon={<svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5">
          <div className="mb-1 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">Problema relatado</p>
          </div>
          <p className="line-clamp-3 text-xs leading-relaxed text-slate-700">{ordem.descricao_problema}</p>
        </div>

        {ordem.servico_realizado && (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3.5">
            <div className="mb-1 flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              <p className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-700">Serviço realizado</p>
            </div>
            <p className="line-clamp-2 text-xs leading-relaxed text-slate-700">{ordem.servico_realizado}</p>
          </div>
        )}
      </div>

      <footer className="flex gap-2 border-t border-slate-100 bg-slate-50/70 px-4 py-3">
        {canEdit ? (
          <button type="button" onClick={() => onEdit(ordem)} className="btn btn-edit flex-1 text-xs py-2">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            Editar OS
          </button>
        ) : (
          <div className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-100 py-2 text-xs text-slate-400">
            Somente leitura
          </div>
        )}
        {canDelete && (
          <button type="button" onClick={() => onDelete(ordem.id)} className="btn btn-delete px-3 text-xs py-2" title="Excluir OS" aria-label={`Excluir OS ${ordem.numero_os}`}>
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        )}
      </footer>
    </article>
  );
});

ServiceOrderCard.displayName = 'ServiceOrderCard';
export default ServiceOrderCard;
