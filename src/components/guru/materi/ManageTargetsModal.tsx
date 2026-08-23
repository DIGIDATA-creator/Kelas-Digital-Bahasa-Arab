import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Materi } from '../../../types';
import {
  X,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Pencil,
  Check,
  Target,
  Sparkles,
  Save,
  RotateCcw,
  ListOrdered,
  AlertCircle,
  GripVertical
} from 'lucide-react';

interface ManageTargetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  materi: Materi | null;
  onSaveTargets: (materiId: string, updatedTargets: string[]) => void;
}

export const ManageTargetsModal: React.FC<ManageTargetsModalProps> = ({
  isOpen,
  onClose,
  materi,
  onSaveTargets,
}) => {
  const [targets, setTargets] = useState<string[]>([]);
  const [newTargetText, setNewTargetText] = useState('');
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && materi) {
      const initialTargets = materi.learningTargets ? [...materi.learningTargets] : [];
      setTargets(initialTargets);
      setNewTargetText('');
      setEditingIdx(null);
      setEditingText('');
      setHasChanges(false);
      setDraggedIdx(null);
      setDragOverIdx(null);
    }
  }, [isOpen, materi]);

  if (!isOpen || !materi) return null;

  const handleAddTarget = () => {
    if (!newTargetText.trim()) return;
    setTargets([...targets, newTargetText.trim()]);
    setNewTargetText('');
    setHasChanges(true);
  };

  const handleRemoveTarget = (index: number) => {
    if (editingIdx === index) {
      setEditingIdx(null);
      setEditingText('');
    }
    const updated = targets.filter((_, i) => i !== index);
    setTargets(updated);
    setHasChanges(true);
  };

  const handleStartEdit = (index: number) => {
    setEditingIdx(index);
    setEditingText(targets[index] || '');
  };

  const handleSaveEdit = (index: number) => {
    if (editingText.trim()) {
      const updated = [...targets];
      updated[index] = editingText.trim();
      setTargets(updated);
      setHasChanges(true);
    }
    setEditingIdx(null);
    setEditingText('');
  };

  const handleCancelEdit = () => {
    setEditingIdx(null);
    setEditingText('');
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const updated = [...targets];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setTargets(updated);
    setHasChanges(true);

    if (editingIdx === index) {
      setEditingIdx(index - 1);
    } else if (editingIdx === index - 1) {
      setEditingIdx(index);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index >= targets.length - 1) return;
    const updated = [...targets];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setTargets(updated);
    setHasChanges(true);

    if (editingIdx === index) {
      setEditingIdx(index + 1);
    } else if (editingIdx === index + 1) {
      setEditingIdx(index);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIdx !== index) {
      setDragOverIdx(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIdx(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setDragOverIdx(null);
    if (draggedIdx === null || draggedIdx === targetIndex) {
      setDraggedIdx(null);
      return;
    }

    const updated = [...targets];
    const [movedItem] = updated.splice(draggedIdx, 1);
    updated.splice(targetIndex, 0, movedItem);

    setTargets(updated);
    setHasChanges(true);
    setDraggedIdx(null);

    if (editingIdx === draggedIdx) {
      setEditingIdx(targetIndex);
    }
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleReset = () => {
    if (materi.learningTargets) {
      setTargets([...materi.learningTargets]);
    } else {
      setTargets([]);
    }
    setEditingIdx(null);
    setEditingText('');
    setHasChanges(false);
  };

  const handleSaveAll = () => {
    onSaveTargets(materi.id, targets);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/20 shadow-inner">
                <Target size={22} className="text-emerald-300" />
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg leading-tight">
                  Kelola &amp; Urutkan Target Materi
                </h3>
                <p className="text-xs text-emerald-200 mt-0.5 line-clamp-1">
                  Bab {materi.babNumber || 1}: {materi.title}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-200 hover:text-white p-1.5 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Subheader info */}
          <div className="p-3 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
              <ListOrdered size={15} className="text-emerald-700 shrink-0" />
              <span>Total: {targets.length} Target Pembelajaran</span>
            </div>
            <span className="text-[11px] text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full font-semibold">
              Tarik (drag) atau gunakan tombol panah ⬆️ ⬇️
            </span>
          </div>

          {/* Body Container (Scrollable with min-h-0) */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-4">
            {/* Target List */}
            {targets.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl space-y-2">
                <AlertCircle size={32} className="text-slate-400 mx-auto" />
                <p className="font-bold text-slate-700 text-sm">Belum ada Target Pembelajaran</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Tambahkan poin capaian/target pembelajaran agar siswa dapat memantau progres hafalan dan pemahaman kaidah materi ini.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {targets.map((target, idx) => (
                  <div
                    key={idx}
                    draggable={editingIdx !== idx}
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, idx)}
                    onDragEnd={handleDragEnd}
                    className={`transition-all ${
                      draggedIdx === idx ? 'opacity-40 scale-[0.98]' : ''
                    } ${
                      dragOverIdx === idx && draggedIdx !== idx
                        ? 'border-2 border-dashed border-emerald-500 rounded-2xl p-1 bg-emerald-50/50'
                        : ''
                    }`}
                  >
                    {editingIdx === idx ? (
                      <div className="p-3 bg-emerald-100/80 border border-emerald-400 rounded-2xl space-y-2 shadow-xs animate-in fade-in duration-150">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-emerald-800 text-white rounded-md text-xs font-black shrink-0">
                            #{idx + 1}
                          </span>
                          <input
                            type="text"
                            autoFocus
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSaveEdit(idx);
                              } else if (e.key === 'Escape') {
                                handleCancelEdit();
                              }
                            }}
                            className="flex-1 px-3 py-1.5 bg-white border border-emerald-400 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-emerald-950"
                            placeholder="Tulis redaksi target pembelajaran..."
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(idx)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer shrink-0 transition-colors"
                            title="Simpan Redaksi Baru"
                          >
                            <Check size={14} /> Simpan
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer shrink-0 transition-colors"
                            title="Batal Edit"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="group flex items-center justify-between gap-2.5 p-3 bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 rounded-2xl transition-all shadow-xs cursor-grab active:cursor-grabbing">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="text-slate-400 group-hover:text-emerald-600 shrink-0 cursor-grab" title="Tarik untuk memindahkan urutan">
                            <GripVertical size={16} />
                          </div>
                          <span className="w-7 h-7 rounded-xl bg-emerald-700 text-white flex items-center justify-center text-xs font-black shrink-0 shadow-2xs">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-slate-800 text-xs sm:text-sm leading-snug break-words">
                            {target}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 bg-slate-50 p-1 rounded-xl border border-slate-100">
                          {/* Move Up */}
                          <button
                            type="button"
                            onClick={() => handleMoveUp(idx)}
                            disabled={idx === 0}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-100 disabled:opacity-25 disabled:hover:bg-transparent rounded-lg cursor-pointer transition-colors"
                            title={idx === 0 ? 'Sudah paling atas' : 'Geser Naik ke Atas'}
                          >
                            <ChevronUp size={16} />
                          </button>

                          {/* Move Down */}
                          <button
                            type="button"
                            onClick={() => handleMoveDown(idx)}
                            disabled={idx === targets.length - 1}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-100 disabled:opacity-25 disabled:hover:bg-transparent rounded-lg cursor-pointer transition-colors"
                            title={idx === targets.length - 1 ? 'Sudah paling bawah' : 'Geser Turun ke Bawah'}
                          >
                            <ChevronDown size={16} />
                          </button>

                          {/* Edit Text */}
                          <button
                            type="button"
                            onClick={() => handleStartEdit(idx)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-100 rounded-lg cursor-pointer transition-colors"
                            title="Edit Redaksi Teks Target"
                          >
                            <Pencil size={14} />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleRemoveTarget(idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg cursor-pointer transition-colors"
                            title="Hapus Target Ini"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Form Tambah Target Baru */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <label className="block font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Sparkles size={14} className="text-emerald-600" /> Tambah Poin Target Pembelajaran Baru
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTargetText}
                  onChange={(e) => setNewTargetText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTarget();
                    }
                  }}
                  placeholder="Ketik target capaian baru lalu tekan Enter / Tambah..."
                  className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-hidden focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleAddTarget}
                  disabled={!newTargetText.trim()}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer transition-all"
                >
                  <Plus size={15} /> Tambah
                </button>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={handleReset}
              disabled={!hasChanges}
              className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-40 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw size={14} /> Reset
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveAll}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Save size={15} /> Simpan Perubahan Target
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
