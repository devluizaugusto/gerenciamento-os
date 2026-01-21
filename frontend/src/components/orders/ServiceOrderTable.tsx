import React, { memo } from 'react';
import { getStatusConfig } from '../../utils/statusColors';
import { OrdemServico } from '../../types';

interface ServiceOrderTableProps {
  ordens: OrdemServico[];
  onEdit: (ordem: OrdemServico) => void;
  onDelete: (id: number) => void;
}

const ServiceOrderTable: React.FC<ServiceOrderTableProps> = memo(({ ordens, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-green-200">
      <div className="overflow-x-auto table-scroll">
        <table className="w-full">
          {/* Cabeçalho da tabela */}
          <thead>
            <tr className="bg-gradient-to-r from-green-600 to-emerald-600">
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                Nº OS
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                Solicitante
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                Unidade
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                Setor
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                Problema
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                Data Abertura
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>

          {/* Corpo da tabela */}
          <tbody className="bg-white divide-y divide-gray-200">
            {ordens.map((ordem, index) => {
              const status = getStatusConfig(ordem.status);
              const isEven = index % 2 === 0;
              
              return (
                <tr 
                  key={ordem.id}
                  className={`transition-all duration-200 hover:bg-green-50 hover:shadow-lg ${
                    isEven ? 'bg-white' : 'bg-gray-50/50'
                  }`}
                >
                  {/* Número OS */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-base">#{ordem.numero_os}</span>
                      </div>
                    </div>
                  </td>

                  {/* Solicitante */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">{ordem.solicitante}</div>
                  </td>

                  {/* Unidade */}
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700">{ordem.unidade}</div>
                  </td>

                  {/* Setor */}
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700">{ordem.setor}</div>
                  </td>

                  {/* Problema */}
                  <td className="px-6 py-4 max-w-xs">
                    <div className="text-sm text-gray-600 truncate" title={ordem.descricao_problema}>
                      {ordem.descricao_problema}
                    </div>
                  </td>

                  {/* Data Abertura */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700 font-medium">{ordem.data_abertura}</div>
                    {ordem.data_fechamento && (
                      <div className="text-xs text-success font-semibold mt-1">
                        Fechado: {ordem.data_fechamento}
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className="px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm"
                      style={{
                        backgroundColor: `${status.color}20`,
                        color: status.color,
                        border: `2px solid ${status.color}`
                      }}
                    >
                      {status.label}
                    </span>
                  </td>

                  {/* Ações */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onEdit(ordem)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg flex items-center gap-2 text-sm font-semibold"
                        title="Editar ordem de serviço"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => onDelete(ordem.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg flex items-center gap-2 text-sm font-semibold"
                        title="Excluir ordem de serviço"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Excluir</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Resumo no rodapé */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t-2 border-gray-200">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 font-semibold">
            Total de <span className="text-green-600 font-bold">{ordens.length}</span> {ordens.length === 1 ? 'ordem' : 'ordens'} de serviço
          </p>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-700 border-2 border-red-900"></span>
              <span className="text-gray-600 font-medium">Aberto</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-600 border-2 border-amber-800"></span>
              <span className="text-gray-600 font-medium">Em Andamento</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-700 border-2 border-green-900"></span>
              <span className="text-gray-600 font-medium">Finalizado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ServiceOrderTable.displayName = 'ServiceOrderTable';

export default ServiceOrderTable;
