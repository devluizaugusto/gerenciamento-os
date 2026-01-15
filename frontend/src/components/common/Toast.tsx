import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 2000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-br from-green-500 to-green-600 border-green-400';
      case 'error':
        return 'bg-gradient-to-br from-red-500 to-red-600 border-red-400';
      case 'warning':
        return 'bg-gradient-to-br from-amber-500 to-amber-600 border-amber-400';
      case 'info':
        return 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-400';
      default:
        return 'bg-gradient-to-br from-gray-500 to-gray-600 border-gray-400';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📌';
    }
  };

  return (
    <div className="fixed top-24 right-6 z-[100] animate-slideDown">
      <div
        className={`${getToastStyles()} text-white px-6 py-4 rounded-xl shadow-2xl border-2 min-w-[320px] max-w-md flex items-center gap-4 backdrop-blur-sm`}
      >
        <span className="text-3xl flex-shrink-0">{getIcon()}</span>
        <p className="flex-1 font-semibold text-base leading-relaxed">{message}</p>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors text-2xl leading-none hover:scale-110 transform duration-200 flex-shrink-0"
          aria-label="Fechar notificação"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;
