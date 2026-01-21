import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-br from-primary-hover via-primary to-primary-light mt-auto py-8 border-t-4 border-primary-hover/30">
      <div className="container px-4">
        <div className="max-w-4xl mx-auto">
          {/* Título Principal */}
          <div className="text-center mb-4">
            <h3 className="text-white font-bold text-lg mb-1 tracking-wide">
              Help Desk TI
            </h3>
            <p className="text-white/90 text-sm font-medium">
              Sistema de Gerenciamento de Ordens de Serviço
            </p>
          </div>

          {/* Divisor */}
          <div className="w-24 h-0.5 bg-white/30 mx-auto mb-4"></div>

          {/* Informações do Desenvolvedor e Copyright */}
          <div className="text-center space-y-2">
            <p className="text-white/95 text-sm">
              Desenvolvido por{' '}
              <span className="font-bold text-white">Luiz Augusto de Andrade Silva</span>
            </p>
            <p className="text-white/80 text-xs">
              © {currentYear} - Todos os direitos reservados
            </p>
          </div>

          {/* Rodapé adicional */}
          <div className="text-center mt-4 pt-4 border-t border-white/20">
            <p className="text-white/70 text-xs">
              Versão 2.0 | Feito com dedicação para otimizar o gerenciamento de serviços
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
