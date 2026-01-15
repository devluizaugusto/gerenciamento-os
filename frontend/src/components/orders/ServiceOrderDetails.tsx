import React from 'react';
import { getStatusConfig } from '../../utils/statusColors';
import { OrdemServico } from '../../types';

interface ServiceOrderDetailsProps {
  ordem: OrdemServico;
}

const ServiceOrderDetails: React.FC<ServiceOrderDetailsProps> = ({ ordem }) => {
  const status = getStatusConfig(ordem.status);

  return (
    <div className="flex flex-col gap-8">
      {/* Informações Gerais */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-100 animate-fadeInUp">
        <h3 className="text-xl font-extrabold text-blue-900 mb-6 flex items-center gap-3">
          <span className="text-3xl">📊</span>
          Informações Gerais
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Número da OS */}
          <div className="bg-white/80 backdrop-blur-sm p-5 rounded-xl border-2 border-blue-200/50 hover:border-blue-300 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🔢</span>
              <span className="font-bold text-blue-700 text-xs uppercase tracking-wide">Número da OS</span>
            </div>
            <span className="text-blue-950 text-2xl font-extrabold">{ordem.numero_os}</span>
          </div>

          {/* Status */}
          <div className="bg-white/80 backdrop-blur-sm p-5 rounded-xl border-2 border-blue-200/50 hover:border-blue-300 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🔄</span>
              <span className="font-bold text-blue-700 text-xs uppercase tracking-wide">Status</span>
            </div>
            <span 
              className="inline-block px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide shadow-md"
              style={{
                backgroundColor: status.color,
                color: 'white'
              }}
            >
              {status.label}
            </span>
          </div>

          {/* Solicitante */}
          <div className="bg-white/80 backdrop-blur-sm p-5 rounded-xl border-2 border-blue-200/50 hover:border-blue-300 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">👤</span>
              <span className="font-bold text-blue-700 text-xs uppercase tracking-wide">Solicitante</span>
            </div>
            <span className="text-blue-950 text-base font-bold">{ordem.solicitante}</span>
          </div>

          {/* Unidade */}
          <div className="bg-white/80 backdrop-blur-sm p-5 rounded-xl border-2 border-blue-200/50 hover:border-blue-300 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🏥</span>
              <span className="font-bold text-blue-700 text-xs uppercase tracking-wide">Unidade</span>
            </div>
            <span className="text-blue-950 text-base font-bold">{ordem.ubs}</span>
          </div>

          {/* Setor */}
          <div className="bg-white/80 backdrop-blur-sm p-5 rounded-xl border-2 border-blue-200/50 hover:border-blue-300 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🏢</span>
              <span className="font-bold text-blue-700 text-xs uppercase tracking-wide">Setor</span>
            </div>
            <span className="text-blue-950 text-base font-bold">{ordem.setor}</span>
          </div>

          {/* Data de Abertura */}
          <div className="bg-white/80 backdrop-blur-sm p-5 rounded-xl border-2 border-blue-200/50 hover:border-blue-300 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📅</span>
              <span className="font-bold text-blue-700 text-xs uppercase tracking-wide">Data Abertura</span>
            </div>
            <span className="text-blue-950 text-base font-bold">{ordem.data_abertura}</span>
          </div>

          {/* Data de Fechamento */}
          {ordem.data_fechamento && (
            <div className="bg-white/80 backdrop-blur-sm p-5 rounded-xl border-2 border-blue-200/50 hover:border-blue-300 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">✅</span>
                <span className="font-bold text-blue-700 text-xs uppercase tracking-wide">Data Fechamento</span>
              </div>
              <span className="text-blue-950 text-base font-bold">{ordem.data_fechamento}</span>
            </div>
          )}
        </div>
      </div>

      {/* Descrição do Problema */}
      <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-2xl border-2 border-red-100 animate-fadeInUp">
        <h3 className="text-xl font-extrabold text-red-900 mb-6 flex items-center gap-3">
          <span className="text-3xl">🔧</span>
          Descrição do Problema
        </h3>
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border-2 border-red-200/50 text-red-950 leading-relaxed whitespace-pre-wrap text-base font-medium shadow-sm">
          {ordem.descricao_problema}
        </div>
      </div>

      {/* Serviço Realizado */}
      {ordem.servico_realizado && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-100 animate-fadeInUp">
          <h3 className="text-xl font-extrabold text-green-900 mb-6 flex items-center gap-3">
            <span className="text-3xl">✅</span>
            Serviço Realizado
          </h3>
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border-2 border-green-200/50 text-green-950 leading-relaxed whitespace-pre-wrap text-base font-medium shadow-sm">
            {ordem.servico_realizado}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceOrderDetails;
