import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="h-10 bg-white border-t border-slate-200 flex items-center justify-center px-6 shrink-0">
      <p className="text-xs text-slate-400">
        © {new Date().getFullYear()} Help Desk TI — Desenvolvido por{' '}
        <span className="font-semibold text-slate-500">Luiz Augusto de Andrade Silva</span>
      </p>
    </footer>
  );
};

export default Footer;
