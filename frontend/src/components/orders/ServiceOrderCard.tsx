import React, { memo } from 'react';
import { ServiceOrder } from '../../types';

interface ServiceOrderCardProps {
  ordem: ServiceOrder;
  onEdit: (ordem: ServiceOrder) => void;
  onDelete: (id: number) => void;
}

const STATUS_STYLE: Record<string, { bar: string; badge: string; label: string }> = {
  aberto:       { bar: 'bg-red-500',    badge: 'bg-red-100 text-red-700 border-red-200',    label: 'Aberto' },
  em_andamento: { bar: 'bg-amber-500',  badge: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Em Andamento' },
  finalizado:   { bar: 'bg-emerald-500',badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Finalizado' },
};

const Field: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="flex items-start gap-2 min-w-0">
    <span className="text-slate-400 mt-0.5 shrink-0">{icon}</span>
    <div className="min-w-0">
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-semibold text-slate-700 truncate" title={value}>{value}</p>
    </div>
  </div>
);

const ServiceOrderCard: React.FC<ServiceOrderCardProps> = memo(({ ordem, onEdit, onDelete }) => {
  const st = STATUS_STYLE[ordem.status] ?? STATUS_STYLE.aberto;

  return (
    <div className="card flex flex-col animate-fadeInUp hover:-translate-y-0.5">
      {/* Status bar */}
      <div className={`h-1 w-full ${st.bar} rounded-t-xl`} />

      {/* Card top */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div>
            <p className="text-sm font-bold text-slate-800 leading-tight">OS #{ordem.numero_os}</p>
            <p className="text-xs text-slate-500">{ordem.data_abertura}</p>
          </div>
        </div>
        <span className={`badge border ${st.badge}`}>{st.label}</span>
      </div>

      {/* Body */}
      <div className="px-4 py-3 flex flex-col gap-3 flex-1">
        {/* Fields */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
          <Field label="Solicitante" value={ordem.solicitante}
            icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>}
          />
          <Field label="Unidade" value={ordem.unidade}
            icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>}
          />
          <Field label="Setor" value={ordem.setor}
            icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>}
          />
          {ordem.data_fechamento && (
            <Field label="Fechamento" value={ordem.data_fechamento}
              icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>}
            />
          )}
        </div>

        {/* Problem */}
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Problema</p>
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{ordem.descricao_problema}</p>
        </div>

        {/* Service done */}
        {ordem.servico_realizado && (
          <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
            <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide mb-1">Serviço Realizado</p>
            <p className="text-xs text-emerald-800 leading-relaxed line-clamp-2">{ordem.servico_realizado}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2">
        <button
          onClick={() => onEdit(ordem)}
          className="btn btn-edit flex-1 text-xs py-2"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
          Editar
        </button>
        <button
          onClick={() => onDelete(ordem.id)}
          className="btn btn-delete flex-1 text-xs py-2"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
          Excluir
        </button>
      </div>
    </div>
  );
});

ServiceOrderCard.displayName = 'ServiceOrderCard';
export default ServiceOrderCard;
