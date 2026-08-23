import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2, X, AlertCircle, Info } from 'lucide-react';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  itemName?: string;
  itemDetails?: string | string[];
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Ya, Hapus Sekarang',
  cancelText = 'Batal',
  variant = 'danger',
  itemName,
  itemDetails,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const headerColors = {
    danger: 'bg-rose-600 dark:bg-rose-700 text-white',
    warning: 'bg-amber-600 dark:bg-amber-700 text-white',
    info: 'bg-emerald-600 dark:bg-emerald-700 text-white',
  };

  const buttonColors = {
    danger: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-rose-900/20',
    warning: 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white shadow-amber-900/20',
    info: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-emerald-900/20',
  };

  const IconComponent =
    variant === 'danger' ? Trash2 : variant === 'warning' ? AlertTriangle : Info;

  const detailsList = Array.isArray(itemDetails)
    ? itemDetails
    : itemDetails
    ? [itemDetails]
    : [];

  return (
    <AnimatePresence>
      <div
        id="universal-confirmation-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget && !isLoading) {
            onClose();
          }
        }}
      >
        <motion.div
          id="universal-confirmation-modal-dialog"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden my-8"
        >
          {/* Header */}
          <div
            id="confirmation-modal-header"
            className={`p-4 flex items-center justify-between ${headerColors[variant]}`}
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1 bg-white/20 rounded-lg">
                <IconComponent className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-extrabold text-sm tracking-tight text-white">
                {title}
              </h3>
            </div>
            <button
              id="btn-close-confirmation-modal"
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer text-white disabled:opacity-50"
              aria-label="Tutup dialog"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div id="confirmation-modal-body" className="p-5 space-y-4">
            {/* Target Item Name Highlight */}
            {itemName && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5 uppercase tracking-wider">
                  Item yang dipilih:
                </span>
                <span className="text-xs font-black text-slate-900 dark:text-slate-100 break-words">
                  {itemName}
                </span>
              </div>
            )}

            {/* Main Message */}
            <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {typeof message === 'string' ? <p>{message}</p> : message}
            </div>

            {/* Extra details (e.g. list of items to be deleted) */}
            {detailsList.length > 0 && (
              <div className="max-h-36 overflow-y-auto space-y-1 p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs">
                {detailsList.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium text-[11px]"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    <span className="truncate">{item}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Warning Note */}
            {variant === 'danger' && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-start gap-2 text-xs text-rose-800 dark:text-rose-300 font-bold">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-snug">
                  Perhatian: Tindakan ini permanen. Data yang dihapus tidak dapat dipulihkan kembali.
                </span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div
            id="confirmation-modal-footer"
            className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5"
          >
            <button
              id="btn-cancel-confirmation-modal"
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              id="btn-confirm-action-modal"
              type="button"
              disabled={isLoading}
              onClick={async () => {
                await onConfirm();
              }}
              className={`px-4 py-2 ${buttonColors[variant]} text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50`}
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <IconComponent size={14} />
                  <span>{confirmText}</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
