'use client';

import { useToastStore, ToastType } from '@/app/hooks/use-toast';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const iconMap: Record<ToastType, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const borderStyles: Record<ToastType, string> = {
  success: 'border-[#10b981]/30 bg-[#061c14]/80 text-[#a7f3d0]',
  error: 'border-[#ef4444]/30 bg-[#2d1212]/80 text-[#fca5a5]',
  info: 'border-[#3b82f6]/30 bg-[#0f1b2d]/80 text-[#bfdbfe]',
};

const iconStyles: Record<ToastType, string> = {
  success: 'text-[#10b981]',
  error: 'text-[#ef4444]',
  info: 'text-[#3b82f6]',
};

export default function ToastContainer() {
  const { toasts, dismissToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 left-6 md:left-auto md:w-96 flex flex-col gap-3 z-50 pointer-events-none">
      {toasts.map((t) => {
        const Icon = iconMap[t.type];
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-lg animate-in slide-in-from-bottom-5 fade-in duration-200 ${borderStyles[t.type]}`}
          >
            <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${iconStyles[t.type]}`} />
            <div className="flex-1 text-sm font-medium leading-5">
              {t.message}
            </div>
            <button
              onClick={() => dismissToast(t.id)}
              className="p-1 rounded-lg text-[#a1a1aa] hover:bg-white/10 hover:text-white transition-all shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
