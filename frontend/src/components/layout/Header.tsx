import React from 'react';

type Page = 'helpdesk' | 'tintas';

interface HeaderProps {
  currentPage: Page;
  onChangePage: (page: Page) => void;
  onNewOS: () => void;
  onGeneratePDF: () => void;
  canGeneratePDF: boolean;
}

const Header: React.FC<HeaderProps> = ({ currentPage, onChangePage, onNewOS, onGeneratePDF, canGeneratePDF }) => {
  return (
    <header className="bg-gradient-to-br from-primary-hover via-primary to-primary-light shadow-xl sticky top-0 z-50 border-b-4 border-primary-hover/30">
      <div className="container px-4 py-4 md:py-5">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-6">
          {/* Title + Nav */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-3 w-full md:w-auto">
            <div className="flex items-center gap-3">
              <span className="text-4xl md:text-5xl drop-shadow-lg">💻</span>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  Help Desk TI
                </h1>
                <p className="text-white/90 text-xs md:text-sm font-medium mt-0.5">
                  Sistema de Gerenciamento
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex gap-1.5 md:ml-6 bg-white/15 backdrop-blur-sm rounded-xl p-1.5">
              <button
                onClick={() => onChangePage('helpdesk')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  currentPage === 'helpdesk'
                    ? 'bg-white text-primary shadow-md'
                    : 'text-white/90 hover:bg-white/20 hover:text-white'
                }`}
              >
                <span className="text-base">🔧</span>
                <span className="whitespace-nowrap">Ordens de Serviço</span>
              </button>
              <button
                onClick={() => onChangePage('tintas')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  currentPage === 'tintas'
                    ? 'bg-white text-cyan-700 shadow-md'
                    : 'text-white/90 hover:bg-white/20 hover:text-white'
                }`}
              >
                <span className="text-base">🖨️</span>
                <span className="whitespace-nowrap">Tintas Epson</span>
              </button>
            </nav>
          </div>

          {/* Action Buttons — only shown on OS page */}
          {currentPage === 'helpdesk' && (
            <div className="flex gap-2 md:gap-3 flex-wrap justify-center md:justify-end">
              <button
                className="btn bg-white text-primary font-bold px-4 md:px-6 py-2.5 md:py-3 rounded-lg flex items-center gap-2 text-sm md:text-base shadow-md border-2 border-transparent transition-all duration-300 ease-in-out hover:bg-gradient-to-br hover:from-white hover:to-gray-50 hover:shadow-2xl hover:scale-105 hover:-translate-y-0.5 active:scale-100 active:translate-y-0 active:shadow-md"
                onClick={onNewOS}
                title="Criar nova ordem de serviço"
              >
                <span className="text-lg transition-transform duration-300 group-hover:rotate-90">➕</span>
                <span className="whitespace-nowrap">Nova OS</span>
              </button>
              <button
                className={`btn font-bold px-4 md:px-6 py-2.5 md:py-3 rounded-lg transition-all duration-300 ease-in-out flex items-center gap-2 text-sm md:text-base shadow-md border-2 ${
                  canGeneratePDF
                    ? 'bg-white text-primary border-transparent hover:bg-gradient-to-br hover:from-white hover:to-gray-50 hover:shadow-2xl hover:scale-105 hover:-translate-y-0.5 active:scale-100 active:translate-y-0 active:shadow-md cursor-pointer'
                    : 'bg-white/50 text-primary/40 cursor-not-allowed opacity-60'
                }`}
                onClick={onGeneratePDF}
                disabled={!canGeneratePDF}
                title={canGeneratePDF ? 'Gerar relatório em PDF com filtros aplicados' : 'Nenhuma ordem disponível para gerar relatório'}
              >
                <span className="text-lg">📄</span>
                <span className="whitespace-nowrap">Gerar Relatório</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
