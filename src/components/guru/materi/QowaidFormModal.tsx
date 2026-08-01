import React, { useState } from 'react';
import { Materi } from '../../../types';
import { X, Plus, Trash2, UploadCloud, Loader2, Save } from 'lucide-react';
import { uploadToSupabaseStorage } from '../../../lib/supabase';

interface QowaidFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingMateri: Materi | null;
  existingMateriList: Materi[];
  onSave: (materi: Partial<Materi>) => void;
}

export const QowaidFormModal: React.FC<QowaidFormModalProps> = ({
  isOpen,
  onClose,
  editingMateri,
  existingMateriList,
  onSave,
}) => {
  if (!isOpen) return null;

  // Filter already used Bab numbers in Qowaid category (except the one currently being edited)
  const usedBabs = existingMateriList
    .filter(m => m.category === 'qowaid' && m.id !== editingMateri?.id)
    .map(m => m.babNumber)
    .filter((b): b is number => typeof b === 'number');

  // Available Babs from 1 to 30
  const availableBabs = Array.from({ length: 30 }, (_, i) => i + 1).filter(b => !usedBabs.includes(b));

  const [babNumber, setBabNumber] = useState<number>(editingMateri?.babNumber || availableBabs[0] || 1);
  const [title, setTitle] = useState<string>(editingMateri?.title || '');
  const [qowaidCategory, setQowaidCategory] = useState<'قواعد' | 'النحو' | 'الصرف'>(
    (editingMateri?.qowaidCategory as any) || 'قواعد'
  );
  const [learningTargets, setLearningTargets] = useState<string[]>(
    editingMateri?.learningTargets && editingMateri.learningTargets.length > 0
      ? editingMateri.learningTargets
      : ['Memahami kaidah qowaid', 'Dapat mengidentifikasi contoh dalam kalimat']
  );
  const [newTargetInput, setNewTargetInput] = useState('');
  const [content, setContent] = useState(editingMateri?.content || '');
  const [pdfFileName, setPdfFileName] = useState(editingMateri?.pdfFileName || '');
  const [pdfUrl, setPdfUrl] = useState(editingMateri?.pdfUrl || '');
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);

  const handleAddTarget = () => {
    if (newTargetInput.trim()) {
      setLearningTargets([...learningTargets, newTargetInput.trim()]);
      setNewTargetInput('');
    }
  };

  const handleRemoveTarget = (index: number) => {
    setLearningTargets(learningTargets.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Harap pilih file berformat PDF.');
      return;
    }

    setIsUploadingPdf(true);
    setPdfFileName(file.name);

    try {
      const publicUrl = await uploadToSupabaseStorage(file, 'materi_pdf');
      setPdfUrl(publicUrl);
    } catch (err: any) {
      console.error('Supabase upload error:', err);
      // Fallback local data url
      const reader = new FileReader();
      reader.onload = () => {
        setPdfUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSave({
      category: 'qowaid',
      babNumber,
      title: title.trim() || `Bab ${babNumber}: Qowaid`,
      qowaidCategory,
      learningTargets,
      content: content || `Penjelasan materi Qowaid Bab ${babNumber}`,
      pdfFileName,
      pdfUrl,
      authorName: 'Ust. Ahmad Dahlan, M.Pd.',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-extrabold rounded-full">
              Formulir Materi Qowaid
            </span>
            <h3 className="text-lg font-extrabold text-slate-900 mt-1">
              {editingMateri ? `Edit Qowaid - Bab ${babNumber}` : 'Tambah Materi Qowaid Baru'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Bab Selection & Qowaid Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Pilih Bab (Nomor Unik)
              </label>
              <select
                value={babNumber}
                onChange={(e) => setBabNumber(Number(e.target.value))}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:border-emerald-500 font-extrabold text-emerald-800 bg-slate-50"
              >
                {editingMateri && editingMateri.babNumber && !availableBabs.includes(editingMateri.babNumber) && (
                  <option value={editingMateri.babNumber}>Bab {editingMateri.babNumber} (Saat Ini)</option>
                )}
                {availableBabs.map(b => (
                  <option key={b} value={b}>Bab {b}</option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 mt-1">Nomor bab yang sudah ada tidak ditampilkan lagi.</p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Kategori Modul Qowaid
              </label>
              <select
                value={qowaidCategory}
                onChange={(e) => setQowaidCategory(e.target.value as any)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:border-emerald-500 font-arabic text-base font-bold text-slate-900 bg-slate-50"
              >
                <option value="قواعد">قواعد (Qowaid Umum)</option>
                <option value="النحو">النحو (Nahwu)</option>
                <option value="الصرف">الصرف (Shorof)</option>
              </select>
            </div>
          </div>

          {/* Judul Materi Qowaid */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Judul Materi Qowaid
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Jumlah Ismiyyah & Fi'liyyah atau Pembagian Isim (الأَسْمَاءُ)"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:border-emerald-500 font-bold text-slate-900"
            />
          </div>

          {/* Target Pembelajaran (Multi Input) */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Target Pembelajaran
            </label>
            <div className="space-y-2 mb-2">
              {learningTargets.map((target, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-emerald-50/60 border border-emerald-200 rounded-xl">
                  <span className="font-semibold text-emerald-900">{idx + 1}. {target}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTarget(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newTargetInput}
                onChange={(e) => setNewTargetInput(e.target.value)}
                placeholder="Tambah poin target pembelajaran..."
                className="flex-1 px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTarget();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddTarget}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1 shrink-0"
              >
                <Plus size={16} /> Tambah Target
              </button>
            </div>
          </div>

          {/* Penjelasan Ringkas Materi Qowaid */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Penjelasan / Rangkuman Kaidah Qowaid
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tuliskan penjelasan kaidah qowaid, contoh kata/kalimat, serta ketentuannya..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-emerald-500 font-medium"
            />
          </div>

          {/* Upload File PDF Modular */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <label className="block font-bold text-slate-800">
              Dokumen / Modul Pembelajaran PDF (Supabase Storage)
            </label>
            <div className="flex items-center gap-3">
              <label className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-bold cursor-pointer flex items-center gap-2 shadow-2xs">
                {isUploadingPdf ? <Loader2 size={16} className="animate-spin text-emerald-600" /> : <UploadCloud size={16} className="text-emerald-600" />}
                {isUploadingPdf ? 'Mengunggah...' : 'Pilih File PDF'}
                <input type="file" accept="application/pdf" onChange={handleFileUpload} className="hidden" />
              </label>

              {pdfFileName && (
                <span className="text-xs font-semibold text-emerald-700 truncate max-w-xs">
                  ✓ {pdfFileName}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-md"
            >
              <Save size={16} /> Simpan Materi Qowaid
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
