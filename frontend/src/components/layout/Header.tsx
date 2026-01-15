import React from 'react';

interface HeaderProps {
  onNewOS: () => void;
  onGeneratePDF: () => void;
  canGeneratePDF: boolean;
}

const Header: React.FC<HeaderProps> = ({ onNewOS, onGeneratePDF, canGeneratePDF }) => {
  return (
    <header className="bg-gradient-to-br from-primary-hover via-primary to-primary-light shadow-xl sticky top-0 z-50 border-b-4 border-primary-hover/30">
      <div className="container px-4 py-5 md:py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
          {/* Logo e Título */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
              <span className="text-4xl md:text-5xl drop-shadow-lg">📋</span>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  Help Desk TI
                </h1>
                <p className="text-white/90 text-xs md:text-sm font-medium mt-0.5">
                  Sistema de Gerenciamento de Ordens de Serviço
                </p>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-2 md:gap-3 flex-wrap justify-center md:justify-end">
            <button
              className="btn bg-white text-primary hover:bg-gray-50 hover:shadow-lg active:scale-95 font-bold px-4 md:px-6 py-2.5 md:py-3 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm md:text-base shadow-md border-2 border-transparent hover:border-white"
              onClick={onNewOS}
              title="Criar nova ordem de serviço"
            >
              <span className="text-lg">➕</span>
              <span className="whitespace-nowrap">Nova OS</span>
            </button>
            <button
              className={`btn font-bold px-4 md:px-6 py-2.5 md:py-3 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm md:text-base shadow-md border-2 ${
                canGeneratePDF
                  ? 'bg-white text-primary hover:bg-gray-50 hover:shadow-lg active:scale-95 border-transparent hover:border-white cursor-pointer'
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
        </div>
      </div>
    </header>
  );
};

export default Header;
