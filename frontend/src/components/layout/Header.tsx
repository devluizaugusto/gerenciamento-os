import React from 'react';

type Page = 'helpdesk' | 'tintas';

interface HeaderProps {
  currentPage: Page;
  onChangePage: (page: Page) => void;
  onNewOS: () => void;
  onGeneratePDF: () => void;
  canGeneratePDF: boolean;
}

const PAGE_META: Record<Page, { label: string; sub: string; icon: React.ReactNode }> = {
  helpdesk: {
    label: 'Ordens de Serviço',
    sub: 'Gerenciamento de ordens de serviço - TI',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  tintas: {
    label: 'Tintas Epson',
    sub: 'Controle de estoque e saídas',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
      </svg>
    ),
  },
};

const Header: React.FC<HeaderProps> = ({ currentPage, onNewOS, onGeneratePDF, canGeneratePDF }) => {
  const meta = PAGE_META[currentPage];

  return (
    <header className="h-14 md:h-16 bg-white border-b border-slate-200 flex items-center px-3 md:px-6 gap-2 md:gap-4 sticky top-0 z-30 shadow-sm">

      {/* Mobile: Brand icon */}
      <div className="flex md:hidden items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shrink-0">
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>

      {/* Desktop: Page icon */}
      <div className="hidden md:flex w-9 h-9 rounded-lg bg-primary/10 items-center justify-center text-primary shrink-0">
        {meta.icon}
      </div>

      {/* Title block */}
      <div className="min-w-0 flex-1 md:flex-none">
        <h1 className="text-sm font-bold text-slate-800 leading-tight truncate">{meta.label}</h1>
        <p className="text-xs text-slate-500 leading-tight hidden sm:block">{meta.sub}</p>
      </div>

      {/* Spacer desktop */}
      <div className="hidden md:flex flex-1" />

      {/* Mobile action buttons — compact */}
      <div className="flex md:hidden items-center gap-1.5 ml-auto">
        {currentPage === 'helpdesk' && (
          <>
            <button
              onClick={onNewOS}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Nova OS
            </button>
            <button
              onClick={onGeneratePDF}
              disabled={!canGeneratePDF}
              className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all
                ${canGeneratePDF
                  ? 'border-slate-300 text-slate-600 hover:bg-slate-50 active:bg-slate-100'
                  : 'border-slate-200 text-slate-300 cursor-not-allowed'
                }`}
              title="Gerar PDF"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Desktop: Date chip */}
      <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
      </div>
    </header>
  );
};

export default Header;
