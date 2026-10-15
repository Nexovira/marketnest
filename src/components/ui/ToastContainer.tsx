/**
 * @file src/components/ui/ToastContainer.tsx
 * Floating toast notifications system for user actions (cart additions, wishlist toggles, etc.).
 */

import React from 'react';
import { useMarket } from '../../context/MarketContext';
import { CheckCircle2, AlertCircle, Info, X, ArrowRight } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useMarket();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-4 h-4 text-[#0E8F5A] shrink-0" />,
          error: <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />,
          warning: <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />,
          info: <Info className="w-4 h-4 text-slate-700 shrink-0" />
        };

        return (
          <div
            key={toast.id}
            role="alert"
            className="pointer-events-auto bg-[#FFFFFF] border border-[#E4E7E5] shadow-lg rounded-lg p-3.5 flex items-start gap-3 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
          >
            {icons[toast.type || 'info']}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-[#101413]">{toast.title}</h4>
              {toast.description && (
                <p className="text-xs text-[#6B726E] mt-0.5 leading-relaxed">{toast.description}</p>
              )}
              {toast.action && (
                <button
                  type="button"
                  onClick={() => {
                    toast.action?.onClick();
                    removeToast(toast.id);
                  }}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#0E8F5A] hover:text-[#0b7348] hover:underline cursor-pointer"
                >
                  <span>{toast.action.label}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#6B726E] hover:text-[#101413] transition-colors p-0.5 rounded cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
