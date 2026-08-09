import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Materi } from '../../../types';
import { X, Plus, Trash2, UploadCloud, Loader2, Save, Video } from 'lucide-react';
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
  const [videoUrl, setVideoUrl] = useState(editingMateri?.videoUrl || '');
  const [pdfFileName, setPdfFileName] = useState(editingMateri?.pdfFileName || '');
  const [pdfUrl, setPdfUrl] = useState(editingMateri?.pdfUrl || '');
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingMateri) {
        setBabNumber(editingMateri.babNumber || 1);
        setTitle(editingMateri.title || '');
        setQowaidCategory((editingMateri.qowaidCategory as any) || 'قواعد');
        setLearningTargets(
          editingMateri.learningTargets && editingMateri.learningTargets.length > 0
            ? [...editingMateri.learningTargets]
            : ['Memahami kaidah qowaid', 'Dapat mengidentifikasi contoh dalam kalimat']
        );
        setContent(editingMateri.content || '');
        setVideoUrl(editingMateri.videoUrl || '');
        setPdfFileName(editingMateri.pdfFileName || '');
        setPdfUrl(editingMateri.pdfUrl || '');
      } else {
        setBabNumber(availableBabs[0] || 1);
        setTitle('');
        setQowaidCategory('قواعد');
        setLearningTargets(['Memahami kaidah qowaid', 'Dapat mengidentifikasi contoh dalam kalimat']);
        setContent('');
        setVideoUrl('');
        setPdfFileName('');
        setPdfUrl('');
      }
    }
  }, [isOpen, editingMateri]);

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

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Harap pilih file berformat PDF.');
      return;
    }

    setIsUploadingPdf(true);
    setPdfFileName(file.name);

    try {
      const uploadResult = await uploadToSupabaseStorage(file, file.name, 'materi_pdf');
      if (uploadResult && uploadResult.publicUrl) {
        setPdfUrl(uploadResult.publicUrl);
      }
    } catch (err: any) {
      console.error('PDF upload error:', err);
      const fileToDataUrlLocal = (f: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (readErr) => reject(readErr);
          reader.readAsDataURL(f);
        });
      };
      try {
        const dataUrl = await fileToDataUrlLocal(file);
        setPdfUrl(dataUrl);
      } catch (readErr) {
        console.error('Failed to read file:', readErr);
        alert('Gagal membaca file PDF.');
      }
    } finally {
      setIsUploadingPdf(false);
      e.target.value = '';
    }
  };

  const handleRemovePdf = () => {
    setPdfFileName('');
    setPdfUrl('');
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
      videoUrl: videoUrl.trim(),
      pdfFileName,
      pdfUrl,
      authorName: 'Ust. Ahmad Dahlan, M.Pd.',
    });

    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-5 overflow-hidden"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
          >
            {/* Header - Fixed Top */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
              <div>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-extrabold rounded-full">
                  Formulir Materi Qowaid
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-1">
                  {editingMateri ? `Edit Qowaid - Bab ${babNumber}` : 'Tambah Materi Qowaid Baru'}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden text-xs">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
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

          {/* Link Video Panduan / Pembelajaran */}
          <div className="p-3.5 bg-rose-50/60 border border-rose-200 rounded-2xl space-y-1.5">
            <label className="block font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <Video size={16} className="text-rose-600" /> Link Video Panduan Pembelajaran (YouTube / Drive / MP4)
            </label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Contoh: https://www.youtube.com/watch?v=xyz123 atau link Google Drive video"
              className="w-full px-3 py-2 border border-rose-200 rounded-xl focus:border-rose-500 text-xs bg-white font-medium"
            />
            <p className="text-[10px] text-slate-500">Siswa dapat langsung menekan tombol "Tonton Video Panduan" pada halaman materi.</p>
          </div>

          {/* Upload File PDF Modular */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-slate-800">
                Dokumen / Modul Pembelajaran PDF
              </label>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">
                Supabase / Direct File
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className={`px-4 py-2 rounded-xl font-bold cursor-pointer flex items-center gap-2 shadow-2xs border transition-all ${
                isUploadingPdf
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}>
                {isUploadingPdf ? <Loader2 size={16} className="animate-spin text-emerald-600" /> : <UploadCloud size={16} className="text-emerald-600" />}
                {isUploadingPdf ? 'Mengunggah PDF...' : 'Unggah File PDF Baru'}
                <input type="file" accept="application/pdf" onChange={handleFileUpload} disabled={isUploadingPdf} className="hidden" />
              </label>

              {(pdfFileName || pdfUrl) && (
                <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                  <span className="text-xs font-semibold text-emerald-800 truncate max-w-[200px] sm:max-w-xs">
                    ✓ {pdfFileName || 'File_Materi.pdf'}
                  </span>
                  <button
                    type="button"
                    onClick={handleRemovePdf}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                    title="Hapus PDF Ini"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Optional Direct URL Fallback */}
            <div className="pt-1">
              <details className="text-xs text-slate-500">
                <summary className="font-semibold text-slate-600 cursor-pointer hover:text-emerald-700 select-none">
                  Atau masukkan URL/Link PDF langsung (Opsional)
                </summary>
                <input
                  type="text"
                  value={pdfUrl}
                  onChange={(e) => {
                    setPdfUrl(e.target.value);
                    if (!pdfFileName && e.target.value) {
                      setPdfFileName('Dokumen_Link.pdf');
                    }
                  }}
                  placeholder="https://... (URL PDF atau Google Drive Embed PDF)"
                  className="w-full mt-2 px-3 py-1.5 border border-slate-300 rounded-xl bg-white text-xs text-slate-800 font-medium"
                />
              </details>
            </div>
          </div>

            </div>

            {/* Actions - Fixed Bottom */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Save size={16} /> Simpan Materi Qowaid
              </button>
            </div>
          </form>

      </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
