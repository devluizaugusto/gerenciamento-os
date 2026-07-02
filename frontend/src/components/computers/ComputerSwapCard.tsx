import React, { memo } from 'react';
import { TrocaComputador } from '../../types';
import { getStatusConfig } from '../../utils/statusColors';

interface ComputerSwapCardProps {
  troca: TrocaComputador;
  onEdit: (troca: TrocaComputador) => void;
  onDelete: (id: number) => void;
}

const PatrimonioBlock: React.FC<{ title: string; cpu: string; monitor: string; variant: 'old' | 'new' }> = ({
  title,
  cpu,
  monitor,
  variant,
}) => {
  const styles = variant === 'old'
    ? 'bg-slate-50 border-slate-200'
    : 'bg-blue-50 border-blue-200';

  return (
    <div className={`rounded-lg p-3 border ${styles}`}>
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-2">{title}</p>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-[10px] text-slate-400 font-semibold">CPU</p>
          <p className="font-bold text-slate-800 truncate" title={cpu}>{cpu}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 font-semibold">Monitor</p>
          <p className="font-bold text-slate-800 truncate" title={monitor}>{monitor}</p>
        </div>
      </div>
    </div>
  );
};

const ComputerSwapCard: React.FC<ComputerSwapCardProps> = memo(({ troca, onEdit, onDelete }) => {
  const status = getStatusConfig(troca.status);
  const borderColor = status.borderColor ?? status.color;

  return (
    <article
      className="flex flex-col rounded-xl bg-white shadow-sm transition-all duration-200 animate-fadeInUp hover:-translate-y-1 hover:shadow-lg overflow-hidden border-2"
      style={{
        borderColor,
        boxShadow: `0 1px 3px 0 rgb(0 0 0 / 0.06), 4px 0 0 0 ${status.color}`,
      }}
    >
      <header
        className="flex items-center justify-between gap-3 px-4 py-3.5 border-b-2"
        style={{ backgroundColor: status.bgColor, borderColor }}
      >
        <div className="min-w-0">
          <p className="text-base font-extrabold text-slate-900 leading-tight truncate">
            {troca.unidade}
          </p>
          <p className="text-xs font-medium text-slate-600 mt-0.5">
            {troca.data_troca} · Setor {troca.setor}
          </p>
        </div>
        <span
          className="inline-flex items-center shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide shadow-md ring-2 ring-white/60"
          style={{ backgroundColor: status.color, color: '#fff' }}
        >
          {status.label}
        </span>
      </header>

      <div className="px-4 py-3.5 flex flex-col gap-3 flex-1">
        <PatrimonioBlock
          title="Equipamentos Antigos"
          cpu={troca.patrimonio_cpu_antigo}
          monitor={troca.patrimonio_monitor_antigo}
          variant="old"
        />
        <PatrimonioBlock
          title="Equipamentos Novos"
          cpu={troca.patrimonio_cpu_novo}
          monitor={troca.patrimonio_monitor_novo}
          variant="new"
        />
      </div>

      <footer className="px-4 pb-4 flex gap-2 border-t border-slate-100 pt-3 mt-auto bg-slate-50/80">
        <button type="button" onClick={() => onEdit(troca)} className="btn btn-edit flex-1 text-xs py-2">
          Editar
        </button>
        <button type="button" onClick={() => onDelete(troca.id)} className="btn btn-delete flex-1 text-xs py-2">
          Excluir
        </button>
      </footer>
    </article>
  );
});

ComputerSwapCard.displayName = 'ComputerSwapCard';
export default ComputerSwapCard;
