import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

type Page = 'helpdesk' | 'tintas' | 'trocas';

interface HeaderProps {
  currentPage: Page;
  onChangePage: (page: Page) => void;
  onNewOS: () => void;
  onGeneratePDF: () => void;
  canGeneratePDF: boolean;
  onOpenUsers?: () => void;
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
  trocas: {
    label: 'Troca de Computadores',
    sub: 'Controle de substituição — Setor Vacina',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
};

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  tecnico: 'bg-blue-100 text-blue-700',
  visualizador: 'bg-slate-100 text-slate-600',
};

const Header: React.FC<HeaderProps> = ({ currentPage, onNewOS, onGeneratePDF, canGeneratePDF, onOpenUsers }) => {
  const meta = PAGE_META[currentPage];
  const { user, logout, isAdmin, canCreate } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = user?.nome
    ? user.nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : '?';

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
        {currentPage === 'helpdesk' && canCreate && (
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

      {/* ─── User dropdown ─────────────────────────────────────── */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(v => !v)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-50 transition-colors group"
        >
          {/* Avatar */}
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm
            ${user?.role === 'admin' ? 'bg-purple-500' : user?.role === 'tecnico' ? 'bg-blue-500' : 'bg-slate-400'}`}>
            {initials}
          </div>
          <div className="hidden md:block text-left min-w-0">
            <p className="text-xs font-semibold text-slate-700 leading-tight truncate max-w-[120px]">{user?.nome}</p>
            <p className={`text-[10px] font-medium leading-tight px-1.5 rounded-full inline-block ${ROLE_COLORS[user?.role ?? ''] ?? 'bg-slate-100 text-slate-500'}`}>
              {user?.role_label}
            </p>
          </div>
          <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 hidden md:block ${dropdownOpen ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown */}
        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50">
            {/* User info */}
            <div className="px-4 py-3.5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold
                  ${user?.role === 'admin' ? 'bg-purple-500' : user?.role === 'tecnico' ? 'bg-blue-500' : 'bg-slate-400'}`}>
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-800 truncate">{user?.nome}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full mt-0.5 inline-block ${ROLE_COLORS[user?.role ?? ''] ?? 'bg-slate-100 text-slate-500'}`}>
                    {user?.role_label}
                  </span>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="py-1.5">
              {isAdmin && onOpenUsers && (
                <button
                  onClick={() => { setDropdownOpen(false); onOpenUsers(); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Gerenciar Usuários
                </button>
              )}

              {/* Permission summary */}
              <div className="mx-3 my-1.5 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Suas Permissões</p>
                <div className="space-y-1">
                  {[
                    { label: 'Visualizar dados', allowed: true },
                    { label: 'Criar registros', allowed: user?.role !== 'visualizador' },
                    { label: 'Editar registros', allowed: user?.role !== 'visualizador' },
                    { label: 'Excluir registros', allowed: user?.role === 'admin' },
                    { label: 'Gerenciar usuários', allowed: user?.role === 'admin' },
                  ].map(p => (
                    <div key={p.label} className="flex items-center gap-2">
                      {p.allowed ? (
                        <svg className="w-3 h-3 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-3 h-3 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      <span className={`text-[11px] ${p.allowed ? 'text-slate-700' : 'text-slate-400'}`}>{p.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-2 pb-2 border-t border-slate-100">
              <button
                onClick={() => { setDropdownOpen(false); logout(); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 mt-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sair do Sistema
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
