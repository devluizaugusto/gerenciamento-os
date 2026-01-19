import React, { memo } from 'react';
import { getStatusConfig } from '../../utils/statusColors';
import { OrdemServico } from '../../types';

interface ServiceOrderCardProps {
  ordem: OrdemServico;
  onEdit: (ordem: OrdemServico) => void;
  onDelete: (id: number) => void;
  onView: (ordem: OrdemServico) => void;
}

const ServiceOrderCard: React.FC<ServiceOrderCardProps> = memo(({ ordem, onEdit, onDelete, onView }) => {
  const status = getStatusConfig(ordem.status);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 border-2 border-green-200 hover:-translate-y-2 hover:shadow-2xl animate-fadeInUp group">
      {/* Header com gradiente */}
      <div 
        className="relative px-6 py-5 bg-gradient-to-r overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${status.color} 0%, ${status.color}dd 50%, ${status.color}cc 100%)`
        }}
      >
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="relative flex justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/25 backdrop-blur-sm flex items-center justify-center shadow-lg flex-shrink-0 border border-white/30 p-1">
              <span className="text-sm font-bold text-white drop-shadow-md leading-none">#{ordem.numero_os}</span>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-white font-extrabold text-base tracking-wide drop-shadow-sm">Ordem de Serviço</h3>
              <p className="text-white/95 text-xs font-semibold tracking-normal drop-shadow-sm">Nº {ordem.numero_os}</p>
            </div>
          </div>
          <div 
            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide shadow-lg border-2 whitespace-nowrap"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              color: status.color,
              borderColor: 'rgba(255, 255, 255, 0.5)'
            }}
          >
            {status.label}
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="p-6 bg-gradient-to-br from-white to-gray-50/50">
        {/* Informações principais em grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-border-light/50 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-primary text-lg">👤</span>
              <span className="text-[0.625rem] font-bold text-text-muted uppercase tracking-wider">Solicitante</span>
            </div>
            <p className="text-text-primary font-semibold text-sm truncate" title={ordem.solicitante}>
              {ordem.solicitante}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-border-light/50 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-primary text-lg">🏢</span>
              <span className="text-[0.625rem] font-bold text-text-muted uppercase tracking-wider">Unidade</span>
            </div>
            <p className="text-text-primary font-semibold text-sm truncate" title={ordem.ubs}>
              {ordem.ubs}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-border-light/50 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-primary text-lg">📋</span>
              <span className="text-[0.625rem] font-bold text-text-muted uppercase tracking-wider">Setor</span>
            </div>
            <p className="text-text-primary font-semibold text-sm truncate" title={ordem.setor}>
              {ordem.setor}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-border-light/50 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-primary text-lg">📅</span>
              <span className="text-[0.625rem] font-bold text-text-muted uppercase tracking-wider">Abertura</span>
            </div>
            <p className="text-text-primary font-semibold text-sm">
              {ordem.data_abertura}
            </p>
          </div>
        </div>

        {/* Data de fechamento se existir */}
        {ordem.data_fechamento && (
          <div className="mb-4 bg-gradient-to-r from-success/10 to-success/5 rounded-xl p-3 border border-success/20">
            <div className="flex items-center gap-2">
              <span className="text-success text-lg">✅</span>
              <div>
                <span className="text-[0.625rem] font-bold text-success uppercase tracking-wider block">Fechamento</span>
                <p className="text-text-primary font-semibold text-sm">{ordem.data_fechamento}</p>
              </div>
            </div>
          </div>
        )}

        {/* Descrição do problema */}
        <div className="mb-4 bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-border-light/50 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-primary text-lg">🔧</span>
            <strong className="text-text-primary text-xs uppercase tracking-widest font-bold">Problema</strong>
          </div>
          <p className="text-text-secondary text-sm leading-relaxed line-clamp-3">
            {ordem.descricao_problema}
          </p>
        </div>

        {/* Serviço realizado se existir */}
        {ordem.servico_realizado && (
          <div className="mb-4 bg-gradient-to-br from-success/5 to-success/10 rounded-xl p-4 border border-success/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-success text-lg">✨</span>
              <strong className="text-text-primary text-xs uppercase tracking-widest font-bold">Serviço Realizado</strong>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed line-clamp-3">
              {ordem.servico_realizado}
            </p>
          </div>
        )}
      </div>

      {/* Botões de ação */}
      <div className="px-6 py-4 bg-gradient-to-br from-gray-50 to-white border-t-2 border-border-light/50">
        <div className="grid grid-cols-3 gap-2">
          <button 
            className="btn btn-view text-xs px-3 py-2.5 font-semibold rounded-lg transition-all duration-200 hover:scale-105" 
            onClick={() => onView(ordem)}
          >
            👁️ Ver
          </button>
          <button 
            className="btn btn-edit text-xs px-3 py-2.5 font-semibold rounded-lg transition-all duration-200 hover:scale-105" 
            onClick={() => onEdit(ordem)}
          >
            ✏️ Editar
          </button>
          <button 
            className="btn btn-delete text-xs px-3 py-2.5 font-semibold rounded-lg transition-all duration-200 hover:scale-105" 
            onClick={() => onDelete(ordem.id)}
          >
            🗑️ Excluir
          </button>
        </div>
      </div>
    </div>
  );
});

ServiceOrderCard.displayName = 'ServiceOrderCard';

export default ServiceOrderCard;
