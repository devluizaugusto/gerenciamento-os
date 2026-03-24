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

const Header: React.FC<HeaderProps> = ({ currentPage }) => {
  const meta = PAGE_META[currentPage];

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 gap-4 sticky top-0 z-30 shadow-sm">
      {/* Icon */}
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
        {meta.icon}
      </div>

      {/* Titles */}
      <div className="min-w-0">
        <h1 className="text-sm font-bold text-slate-800 leading-tight">{meta.label}</h1>
        <p className="text-xs text-slate-500 leading-tight hidden sm:block">{meta.sub}</p>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Date chip */}
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
