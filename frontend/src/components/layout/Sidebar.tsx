import React, { useState } from 'react';

type Page = 'helpdesk' | 'tintas';

interface SidebarProps {
  currentPage: Page;
  onChangePage: (page: Page) => void;
  onNewOS: () => void;
  onGeneratePDF: () => void;
  canGeneratePDF: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onChangePage,
  onNewOS,
  onGeneratePDF,
  canGeneratePDF,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    {
      id: 'helpdesk' as Page,
      label: 'Ordens de Serviço',
      description: 'Gerenciar chamados',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
    {
      id: 'tintas' as Page,
      label: 'Tintas Epson',
      description: 'Controle de estoque',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
      ),
    },
  ];

  return (
    <aside
      className={`
        relative flex flex-col h-screen sticky top-0 z-40
        bg-[#1a2236]
        border-r border-white/5
        shadow-[4px_0_24px_rgba(0,0,0,0.35)]
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-[72px]' : 'w-64'}
      `}
    >
      {/* ══════════════════════════════════
          LOGO / BRAND
      ══════════════════════════════════ */}
      <div className={`flex items-center h-16 border-b border-white/8 px-4 shrink-0 ${collapsed ? 'justify-center' : 'gap-3'}`}>
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        {!collapsed && (
          <div className="overflow-hidden flex-1 min-w-0">
            <p className="text-white font-bold text-[15px] leading-tight tracking-tight truncate">
              Help Desk TI
            </p>
            <p className="text-white/40 text-[11px] font-medium truncate">
              Sistema de Gerenciamento
            </p>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════
          NAVEGAÇÃO
      ══════════════════════════════════ */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto overflow-x-hidden">
        {!collapsed && (
          <p className="text-white/30 text-[10px] font-semibold uppercase tracking-[0.12em] px-3 mb-3">
            Navegação
          </p>
        )}

        {navItems.map(item => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangePage(item.id)}
              title={collapsed ? item.label : undefined}
              className={`
                group relative w-full flex items-center rounded-xl
                text-sm font-medium transition-all duration-200
                ${collapsed ? 'justify-center h-11 w-11 mx-auto p-0' : 'gap-3 px-3.5 py-3'}
                ${isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                  : 'text-white/60 hover:text-white hover:bg-white/8'
                }
              `}
            >
              {/* Active left bar */}
              {isActive && !collapsed && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-blue-300 rounded-r-full" />
              )}

              <span className={`shrink-0 transition-transform duration-200 ${!isActive ? 'group-hover:scale-110' : ''}`}>
                {item.icon}
              </span>

              {!collapsed && (
                <div className="flex-1 min-w-0 text-left">
                  <p className="truncate font-semibold text-[13.5px] leading-tight">
                    {item.label}
                  </p>
                  {!isActive && (
                    <p className="truncate text-[11px] text-white/35 leading-tight mt-0.5">
                      {item.description}
                    </p>
                  )}
                </div>
              )}

              {isActive && !collapsed && (
                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-blue-300/80" />
              )}

              {/* Tooltip when collapsed */}
              {collapsed && (
                <div className="
                  pointer-events-none absolute left-full ml-3 z-50
                  bg-gray-900 text-white text-xs font-medium
                  px-3 py-2 rounded-lg whitespace-nowrap
                  shadow-xl border border-white/10
                  opacity-0 group-hover:opacity-100
                  transition-opacity duration-150
                ">
                  {item.label}
                  <span className="absolute top-1/2 -left-1.5 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* ══════════════════════════════════
          AÇÕES (somente Ordens de Serviço)
      ══════════════════════════════════ */}
      {currentPage === 'helpdesk' && (
        <div className="px-3 py-4 border-t border-white/8 space-y-2.5 shrink-0">
          {!collapsed && (
            <p className="text-white/30 text-[10px] font-semibold uppercase tracking-[0.12em] px-3 mb-3">
              Ações Rápidas
            </p>
          )}

          {/* Nova OS */}
          <button
            onClick={onNewOS}
            title={collapsed ? 'Nova Ordem de Serviço' : undefined}
            className={`
              group relative w-full flex items-center gap-3
              bg-blue-600 hover:bg-blue-500 active:bg-blue-700
              text-white font-semibold text-[13px] rounded-xl
              shadow-lg shadow-blue-900/40
              transition-all duration-200 hover:shadow-blue-800/50 hover:scale-[1.02] active:scale-100
              ${collapsed ? 'justify-center h-11 w-11 mx-auto p-0' : 'px-4 py-3'}
            `}
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4v16m8-8H4" />
            </svg>
            {!collapsed && <span>Nova OS</span>}

            {collapsed && (
              <div className="
                pointer-events-none absolute left-full ml-3 z-50
                bg-gray-900 text-white text-xs font-medium
                px-3 py-2 rounded-lg whitespace-nowrap
                shadow-xl border border-white/10
                opacity-0 group-hover:opacity-100
                transition-opacity duration-150
              ">
                Nova Ordem de Serviço
                <span className="absolute top-1/2 -left-1.5 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
              </div>
            )}
          </button>

          {/* Gerar Relatório */}
          <button
            onClick={onGeneratePDF}
            disabled={!canGeneratePDF}
            title={collapsed ? (canGeneratePDF ? 'Gerar Relatório PDF' : 'Sem ordens para gerar relatório') : undefined}
            className={`
              group relative w-full flex items-center gap-3
              text-[13px] font-semibold rounded-xl
              border transition-all duration-200
              ${collapsed ? 'justify-center h-11 w-11 mx-auto p-0' : 'px-4 py-3'}
              ${canGeneratePDF
                ? 'bg-white/8 border-white/12 text-white/80 hover:bg-white/14 hover:text-white hover:scale-[1.02] active:scale-100 cursor-pointer'
                : 'bg-white/4 border-white/6 text-white/25 cursor-not-allowed'
              }
            `}
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {!collapsed && <span>Gerar Relatório</span>}

            {collapsed && (
              <div className="
                pointer-events-none absolute left-full ml-3 z-50
                bg-gray-900 text-white text-xs font-medium
                px-3 py-2 rounded-lg whitespace-nowrap
                shadow-xl border border-white/10
                opacity-0 group-hover:opacity-100
                transition-opacity duration-150
              ">
                {canGeneratePDF ? 'Gerar Relatório PDF' : 'Sem ordens disponíveis'}
                <span className="absolute top-1/2 -left-1.5 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
              </div>
            )}
          </button>
        </div>
      )}

      {/* ══════════════════════════════════
          RODAPÉ + BOTÃO COLLAPSE
      ══════════════════════════════════ */}
      <div className={`px-3 py-4 border-t border-white/8 shrink-0 ${collapsed ? 'flex justify-center' : 'flex items-center justify-between'}`}>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-white/50 text-[11px] font-medium truncate">Help Desk TI</p>
            <p className="text-white/25 text-[10px] truncate">© {new Date().getFullYear()} — Todos os direitos reservados.</p>
          </div>
        )}

        <button
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
          className="
            flex items-center justify-center w-8 h-8 rounded-lg
            text-white/40 hover:text-white hover:bg-white/10
            transition-all duration-200 shrink-0
          "
        >
          <svg
            className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
