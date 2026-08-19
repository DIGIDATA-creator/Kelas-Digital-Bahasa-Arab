import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Materi, VocabularyItem } from '../../../types';
import { parseSpreadsheetText } from '../../common/ArabicUtils';
import { storageService } from '../../../services/storage';
import { X, Plus, Trash2, FileSpreadsheet, Save, Layers } from 'lucide-react';

interface KosakataFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingMateri: Materi | null;
  existingMateriList: Materi[];
  onSave: (materi: Partial<Materi>) => void;
}

export const KosakataFormModal: React.FC<KosakataFormModalProps> = ({
  isOpen,
  onClose,
  editingMateri,
  existingMateriList,
  onSave,
}) => {
  // (Rendered using AnimatePresence below)
  const [babNumber, setBabNumber] = useState<number>(editingMateri?.babNumber || 1);
  const [title, setTitle] = useState(editingMateri?.title || '');
  const [arabicTitle, setArabicTitle] = useState(editingMateri?.arabicTitle || '');
  const [vocabCategory, setVocabCategory] = useState<'اسْم' | 'فِعل' | 'حَرْف' | string>(
    editingMateri?.vocabCategory || 'اسْم'
  );

  const [vocabularies, setVocabularies] = useState<VocabularyItem[]>(
    editingMateri?.vocabularies && editingMateri.vocabularies.length > 0
      ? editingMateri.vocabularies
      : []
  );

  const [newWord, setNewWord] = useState('');
  const [newMeaning, setNewMeaning] = useState('');
  const [fiilMadhi, setFiilMadhi] = useState('');
  const [fiilMudhari, setFiilMudhari] = useState('');
  const [fiilAmr, setFiilAmr] = useState('');

  // Synchronize modal state whenever isOpen or editingMateri changes
  useEffect(() => {
    if (isOpen) {
      if (editingMateri) {
        setBabNumber(editingMateri.babNumber || 1);
        setTitle(editingMateri.title || '');
        setArabicTitle(editingMateri.arabicTitle || '');
        setVocabCategory(editingMateri.vocabCategory || 'اسْم');
        setVocabularies(
          editingMateri.vocabularies && editingMateri.vocabularies.length > 0
            ? [...editingMateri.vocabularies]
            : []
        );
      } else {
        const nextBab = (existingMateriList.filter(m => m.category === 'kosakata').length || 0) + 1;
        setBabNumber(nextBab);
        setTitle('');
        setArabicTitle('');
        setVocabCategory('اسْم');
        setVocabularies([]);
      }
      setNewWord('');
      setNewMeaning('');
      setFiilMadhi('');
      setFiilMudhari('');
      setFiilAmr('');
    }
  }, [isOpen, editingMateri, existingMateriList]);

  // Mass upload / spreadsheet modal
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);
  const [sheetText, setSheetText] = useState('');

  const handleAddWord = () => {
    if (vocabCategory === 'فِعل') {
      if ((fiilMadhi.trim() || fiilMudhari.trim() || fiilAmr.trim()) && newMeaning.trim()) {
        const combinedWord = [fiilMadhi.trim(), fiilMudhari.trim(), fiilAmr.trim()]
          .filter(Boolean)
          .join(' - ');
        const newItem: VocabularyItem = {
          id: `vocab-${Date.now()}-${Math.random()}`,
          word: combinedWord,
          meaning: newMeaning.trim(),
          latin: '',
          category: vocabCategory,
          fiilMadhi: fiilMadhi.trim(),
          fiilMudhari: fiilMudhari.trim(),
          fiilAmr: fiilAmr.trim(),
        };
        setVocabularies([...vocabularies, newItem]);
        setFiilMadhi('');
        setFiilMudhari('');
        setFiilAmr('');
        setNewMeaning('');
      }
    } else {
      if (newWord.trim() && newMeaning.trim()) {
        const newItem: VocabularyItem = {
          id: `vocab-${Date.now()}-${Math.random()}`,
          word: newWord.trim(),
          meaning: newMeaning.trim(),
          latin: '',
          category: vocabCategory,
        };
        setVocabularies([...vocabularies, newItem]);
        setNewWord('');
        setNewMeaning('');
      }
    }
  };

  const handleRemoveWord = (id: string) => {
    setVocabularies(vocabularies.filter(v => v.id !== id));
  };

  const handleImportSheetText = () => {
    const parsed = parseSpreadsheetText(sheetText);
    if (parsed.length === 0) {
      alert('Tidak dapat membaca data. Format yang didukung: "Teks Arab, Terjemahan" per baris.');
      return;
    }

    const newItems: VocabularyItem[] = parsed.map((item, index) => ({
      id: `sheet-${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${index}`,
      word: item.word,
      meaning: item.meaning,
      latin: '',
      category: 'Umum',
    }));

    setVocabularies([...vocabularies, ...newItems]);
    setSheetText('');
    setIsSheetModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedVocabs = vocabularies.map(v => ({
      ...v,
      category: vocabCategory,
    }));

    onSave({
      category: 'kosakata',
      babNumber,
      vocabCategory,
      title: title || `Kosakata Bab ${babNumber}`,
      arabicTitle,
      vocabularies: updatedVocabs,
      content: `Kumpulan Kosakata Bab ${babNumber}: ${title}`,
      description: `Materi Kosakata Bahasa Arab Bab ${babNumber} (${vocabCategory}) berisi ${vocabularies.length} kata.`,
      authorName: storageService.getGuruProfile()?.name || 'Ahmad Yusron',
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
                <span className="px-2.5 py-0.5 bg-teal-100 text-teal-800 text-[11px] font-extrabold rounded-full">
                  Formulir Materi Kosakata
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-1">
                  {editingMateri ? `Edit Kosakata - ${editingMateri.title}` : 'Tambah Paket Kosakata Baru'}
                </h3>
              </div>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden text-xs">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* Bab Number, Judul, & Kategori Kosakata */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nomor Bab
              </label>
              <input
                type="number"
                min={1}
                max={50}
                required
                value={babNumber}
                onChange={(e) => setBabNumber(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-teal-500 font-extrabold text-teal-800 bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Kategori Kosakata Bab
              </label>
              <select
                value={vocabCategory}
                onChange={(e) => setVocabCategory(e.target.value)}
                className="w-full px-3 py-2 border border-teal-300 bg-teal-50/50 rounded-xl focus:border-teal-500 font-extrabold text-teal-900 font-arabic text-sm cursor-pointer"
                title="Pilihan kategori jenis kosakata dalam 1 bab (digunakan untuk integrasi kuis)"
              >
                <option value="اسْم">اسْم (Isim / Kata Benda)</option>
                <option value="فِعل">فِعل (Fi'il / Kata Kerja)</option>
                <option value="حَرْف">حَرْف (Harf / Kata Tugas)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Judul Bahasa Indonesia
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Peralatan Sekolah"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-teal-500 font-medium bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Judul Bahasa Arab (Opsional)
              </label>
              <input
                type="text"
                placeholder="الأَدَوَاتُ المَدْرَسِيَّةُ"
                value={arabicTitle}
                onChange={(e) => setArabicTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-teal-500 font-arabic text-base bg-white"
              />
            </div>
          </div>

          {/* Vocabulary Items Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Layers size={16} className="text-teal-600" /> Daftar Kosakata (Total {vocabularies.length} Kata)
              </span>

              <button
                type="button"
                onClick={() => setIsSheetModalOpen(true)}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl font-bold flex items-center gap-1.5 text-xs shadow-2xs"
              >
                <FileSpreadsheet size={15} /> Upload / Paste Spreadsheet CSV
              </button>
            </div>

            {/* Input Row for Individual Word */}
            {vocabCategory === 'فِعل' ? (
              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between border-b border-amber-200 pb-1.5">
                  <span className="font-extrabold text-amber-900 text-xs flex items-center gap-1.5">
                    <span className="px-2 py-0.5 bg-amber-200 text-amber-950 font-arabic rounded text-xs">فِعْل</span>
                    Format Input Kata Kerja (Fi'il) - 3 Bagian Tasyrif
                  </span>
                  <span className="text-[11px] text-amber-800 font-medium">الماضي - المضارع - الأمر</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
                  <div>
                    <label className="block font-bold text-slate-700 text-[11px] mb-1">
                      1. Fi'il Madhi (الماضي)
                    </label>
                    <input
                      type="text"
                      placeholder="كَتَبَ"
                      value={fiilMadhi}
                      onChange={(e) => setFiilMadhi(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl font-arabic text-base text-right focus:border-amber-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 text-[11px] mb-1">
                      2. Fi'il Mudhori' (المضارع)
                    </label>
                    <input
                      type="text"
                      placeholder="يَكْتُبُ"
                      value={fiilMudhari}
                      onChange={(e) => setFiilMudhari(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl font-arabic text-base text-right focus:border-amber-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 text-[11px] mb-1">
                      3. Fi'il Amr (الأمر)
                    </label>
                    <input
                      type="text"
                      placeholder="اُكْتُبْ"
                      value={fiilAmr}
                      onChange={(e) => setFiilAmr(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl font-arabic text-base text-right focus:border-amber-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 text-[11px] mb-1">
                      Terjemahan (Arti)
                    </label>
                    <input
                      type="text"
                      placeholder="Menulis"
                      value={newMeaning}
                      onChange={(e) => setNewMeaning(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl font-medium focus:border-amber-500 bg-white"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddWord();
                        }
                      }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddWord}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 text-xs shadow-xs cursor-pointer"
                >
                  <Plus size={16} /> Tambah Fi'il (3 Bagian)
                </button>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-5 gap-2 items-end">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-600 mb-1">Input Mufrodat (Teks Arab)</label>
                  <input
                    type="text"
                    placeholder="مَكْتَبٌ"
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl font-arabic text-lg text-right focus:border-teal-500 bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-600 mb-1">Terjemahan</label>
                  <input
                    type="text"
                    placeholder="Meja"
                    value={newMeaning}
                    onChange={(e) => setNewMeaning(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl font-medium focus:border-teal-500 bg-white"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddWord();
                      }
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddWord}
                  className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl flex items-center justify-center gap-1 text-xs cursor-pointer"
                >
                  <Plus size={16} /> Tambah
                </button>
              </div>
            )}

            {/* List of current vocabularies */}
            <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-200 rounded-2xl p-2 bg-white">
              {vocabularies.length === 0 ? (
                <p className="text-center py-4 text-slate-400 font-medium">Belum ada item kosakata. Gunakan form di atas untuk menambah.</p>
              ) : (
                vocabularies.map((v, i) => (
                  <div key={`${v.id || 'vocab'}-${i}`} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-extrabold text-teal-800 w-6 text-center">{i + 1}.</span>
                    <span className="font-arabic text-lg font-bold text-slate-900 px-2">{v.word}</span>
                    <span className="text-slate-600 font-medium flex-1 px-2 border-l border-slate-200">{v.meaning}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveWord(v.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

              </div>

              {/* Submit Footer - Fixed Bottom */}
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
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Save size={16} /> Simpan Paket Kosakata
                </button>
              </div>
            </form>

        {/* Spreadsheet Modal */}
        {isSheetModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl border">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <FileSpreadsheet size={18} className="text-emerald-600" /> Import Kosakata Masal
                </h4>
                <button onClick={() => setIsSheetModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Paste data kosakata dari Excel / Google Sheet. Format per baris:<br />
                <code className="bg-slate-100 px-2 py-0.5 rounded text-emerald-800 font-mono text-[11px]">Teks Arab, Terjemahan</code> atau dipisahkan dengan tombol TAB/Koma.
              </p>

              <textarea
                rows={8}
                value={sheetText}
                onChange={(e) => setSheetText(e.target.value)}
                placeholder={`مَكْتَبٌ, Meja\nكِتَابٌ, Buku\nقَلَمٌ, Pulpen`}
                className="w-full p-3 border border-slate-300 rounded-xl font-mono text-xs focus:border-emerald-500"
              />

              <div className="flex justify-end gap-2 pt-2 border-t text-xs">
                <button
                  type="button"
                  onClick={() => setIsSheetModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleImportSheetText}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
                >
                  Import Kosakata
                </button>
              </div>
            </div>
          </div>
        )}

      </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
