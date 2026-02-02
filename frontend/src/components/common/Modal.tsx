import React, { useEffect, ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-black/60 via-black/50 to-black/40 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-scaleIn border-2 border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex justify-between items-center px-8 py-6 bg-gradient-to-br from-primary via-primary to-primary-light overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-24"></div>
          </div>
          
          <h2 className="relative text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span className="text-3xl">📋</span>
            {title}
          </h2>
          
          <button
            onClick={onClose}
            className="relative text-white/90 hover:text-white transition-all duration-200 p-2.5 rounded-xl hover:bg-white/20 text-3xl leading-none font-light hover:rotate-90 hover:scale-110"
            aria-label="Fechar modal"
          >
            ×
          </button>
        </div>
        
        <div className="overflow-y-auto p-8 flex-1 bg-gradient-to-br from-gray-50/50 to-white">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
