
import React, { useState, useCallback, createContext, useContext } from 'react';
import { Check, X, AlertTriangle, Info } from './Icons';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface ToastContextType {
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    // Return dummy implementation if no provider
    return {
      success: (msg) => console.log('[Toast Success]', msg),
      error: (msg) => console.error('[Toast Error]', msg),
      warning: (msg) => console.warn('[Toast Warning]', msg),
      info: (msg) => console.info('[Toast Info]', msg),
    };
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastMessage['type'], message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);

    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const contextValue: ToastContextType = {
    success: (msg) => addToast('success', msg),
    error: (msg) => addToast('error', msg),
    warning: (msg) => addToast('warning', msg),
    info: (msg) => addToast('info', msg),
  };

  // Only show last 3 toasts to prevent screen clutter
  const visibleToasts = toasts.slice(-3);
  const hiddenCount = Math.max(0, toasts.length - 3);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* Toast Container - Compact Stacking Pills */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[300] flex flex-col-reverse items-center pointer-events-none w-full max-w-[280px]">
        {visibleToasts.map((toast, index) => {
          const reverseIndex = visibleToasts.length - 1 - index; // 0 = newest
          const scale = 1 - reverseIndex * 0.05;
          const translateY = reverseIndex * 4;
          const opacity = 1 - reverseIndex * 0.15;

          return (
            <div
              key={toast.id}
              style={{
                transform: `scale(${scale}) translateY(${translateY}px)`,
                opacity,
                zIndex: 10 - reverseIndex,
                marginBottom: reverseIndex === 0 ? 0 : -28,
              }}
              className={`pointer-events-auto pl-3 pr-2 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 toast-enter backdrop-blur-md border border-white/10 select-none transition-all duration-300 ${
                toast.type === 'success' ? 'bg-green-600/90 text-white' :
                toast.type === 'error' ? 'bg-red-600/90 text-white' :
                toast.type === 'warning' ? 'bg-yellow-500/90 text-white' :
                'bg-gray-800/90 text-white'
              }`}
            >
              {toast.type === 'success' && <Check size={10} strokeWidth={3} />}
              {toast.type === 'error' && <X size={10} strokeWidth={3} />}
              {toast.type === 'warning' && <AlertTriangle size={10} strokeWidth={3} />}
              {toast.type === 'info' && <Info size={10} strokeWidth={3} />}

              <span className="font-bold text-[10px] tracking-wide leading-none truncate max-w-[200px]">
                {toast.message}
              </span>

              <button
                onClick={() => removeToast(toast.id)}
                className="ml-0.5 w-4 h-4 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
              >
                <X size={8} />
              </button>
            </div>
          );
        })}
        {hiddenCount > 0 && (
          <div className="text-[9px] font-bold text-gray-400 mt-1 pointer-events-none">
            +{hiddenCount} more
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
