import React, { useEffect } from 'react';
import { CheckCircle2, Sparkles, Award, Trophy, X, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface ToastItem {
  id: string;
  type: 'materi' | 'exp' | 'quiz' | 'hafalan' | 'info';
  title: string;
  message: string;
  expGained?: number;
  timestamp?: string;
}

interface ToastNotificationProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const ToastNotificationContainer: React.FC<ToastNotificationProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full px-4 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast, idx) => (
          <ToastCard key={`${toast.id || 'toast'}-${idx}`} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastCard: React.FC<{ toast: ToastItem; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 6000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case 'materi':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'exp':
        return <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />;
      case 'quiz':
        return <Trophy className="w-5 h-5 text-yellow-300" />;
      case 'hafalan':
        return <Award className="w-5 h-5 text-purple-400" />;
      default:
        return <Bell className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBgGradients = () => {
    switch (toast.type) {
      case 'materi':
        return 'bg-gradient-to-r from-emerald-900/95 via-teal-900/95 to-slate-900/95 border-emerald-500/50 text-white';
      case 'exp':
        return 'bg-gradient-to-r from-amber-900/95 via-orange-900/95 to-slate-900/95 border-amber-500/50 text-white';
      case 'quiz':
        return 'bg-gradient-to-r from-indigo-900/95 via-purple-900/95 to-slate-900/95 border-indigo-500/50 text-white';
      case 'hafalan':
        return 'bg-gradient-to-r from-purple-900/95 via-pink-900/95 to-slate-900/95 border-purple-500/50 text-white';
      default:
        return 'bg-gradient-to-r from-slate-900/95 via-blue-900/95 to-slate-900/95 border-slate-600/50 text-white';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.8 }}
      className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl backdrop-blur-md flex items-start gap-3 relative overflow-hidden ${getBgGradients()}`}
    >
      <div className="p-2 rounded-xl bg-white/10 border border-white/10 shrink-0">
        {getIcon()}
      </div>

      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-center gap-2">
          <h4 className="font-extrabold text-sm tracking-tight">{toast.title}</h4>
          {toast.expGained !== undefined && toast.expGained > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-black text-[10px]">
              +{toast.expGained} EXP
            </span>
          )}
        </div>
        <p className="text-xs text-slate-200 mt-0.5 leading-snug">{toast.message}</p>
        <span className="text-[10px] text-slate-400 block mt-1 font-mono">
          {toast.timestamp || 'Baru Saja'}
        </span>
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
      >
        <X size={14} />
      </button>

      {/* Subtle Progress Bar */}
      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 6, ease: 'linear' }}
        className="absolute bottom-0 left-0 h-1 bg-amber-400/60"
      />
    </motion.div>
  );
};
