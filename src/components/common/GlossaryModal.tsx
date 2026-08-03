import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Materi, VocabularyItem } from '../../types';
import { AudioPlayerButton } from './AudioPlayerButton';
import { Search, X, BookOpen, Layers, Sparkles, Filter, Volume2, ArrowRight } from 'lucide-react';

export interface GlossaryEntry {
  id: string;
  word: string;
  meaning: string;
  category: string; // 'اسم' | 'فعل' | 'حرف' | 'hiwar' | 'mahfudzot'
  fiilMadhi?: string;
  fiilMudhari?: string;
  fiilAmr?: string;
  rootWord?: string; // Isytiqaq / Akar kata (e.g. "ك-ت-ب")
  materiTitle: string;
  babNumber: number;
  materiId: string;
  exampleArabic?: string;
  exampleTranslation?: string;
}

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  materiList: Materi[];
  onSelectMateri?: (materiId: string) => void;
  initialSearchQuery?: string;
}

// Helper to deduce root word (isytiqaq) for common Arabic forms
function deriveArabicRoot(word: string): string {
  if (!word) return '';
  const clean = word.replace(/[\u064B-\u0652]/g, '').trim(); // strip harakat
  // Common prefixes strip
  let root = clean.replace(/^(ال|الم|المس|است|ت|ي|م)/, '');
  if (root.length > 3) {
    root = root.substring(0, 3);
  }
  if (root.length === 3) {
    return root.split('').join(' - ');
  }
  return '';
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({
  isOpen,
  onClose,
  materiList,
  onSelectMateri,
  initialSearchQuery = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedEntry, setSelectedEntry] = useState<GlossaryEntry | null>(null);

  // Extract all vocabulary terms from materiList
  const allEntries = useMemo(() => {
    const list: GlossaryEntry[] = [];

    materiList.forEach((m) => {
      // 1. Kosakata
      if (m.vocabularies && m.vocabularies.length > 0) {
        m.vocabularies.forEach((v, vIdx) => {
          const root = deriveArabicRoot(v.fiilMadhi || v.word);
          list.push({
            id: `gloss-${m.id}-${v.id || 'vocab'}-${vIdx}`,
            word: v.word,
            meaning: v.meaning,
            category: v.category || m.vocabCategory || 'اسْم',
            fiilMadhi: v.fiilMadhi,
            fiilMudhari: v.fiilMudhari,
            fiilAmr: v.fiilAmr,
            rootWord: root,
            materiTitle: m.title,
            babNumber: m.babNumber || 1,
            materiId: m.id,
            exampleArabic: v.exampleArabic,
            exampleTranslation: v.exampleTranslation,
          });
        });
      }

      // 2. Hiwar dialogues
      if (m.dialoguePairs && m.dialoguePairs.length > 0) {
        m.dialoguePairs.forEach((dp) => {
          if (dp.arabic1) {
            list.push({
              id: `hiwar-1-${dp.id}`,
              word: dp.arabic1,
              meaning: dp.translation1,
              category: 'Percakapan',
              materiTitle: m.title,
              babNumber: m.babNumber || 1,
              materiId: m.id,
            });
          }
          if (dp.arabic2) {
            list.push({
              id: `hiwar-2-${dp.id}`,
              word: dp.arabic2,
              meaning: dp.translation2,
              category: 'Percakapan',
              materiTitle: m.title,
              babNumber: m.babNumber || 1,
              materiId: m.id,
            });
          }
        });
      }

      // 3. Mahfudzot quotes
      if (m.mahfudzot && m.mahfudzot.arabic) {
        list.push({
          id: `mahf-${m.id}`,
          word: m.mahfudzot.arabic,
          meaning: m.mahfudzot.translation,
          category: 'Mahfudzot',
          materiTitle: m.title,
          babNumber: m.babNumber || 1,
          materiId: m.id,
        });
      }
    });

    return list;
  }, [materiList]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return allEntries.filter((e) => {
      // Category tab filter
      if (activeTab === 'isim' && !e.category.includes('اسْم') && e.category !== 'Isim') return false;
      if (activeTab === 'fiil' && !e.category.includes('فِعل') && e.category !== 'Fiil' && !e.fiilMadhi) return false;
      if (activeTab === 'harf' && !e.category.includes('حَرْف') && e.category !== 'Harf') return false;
      if (activeTab === 'hiwar' && e.category !== 'Percakapan') return false;
      if (activeTab === 'mahfudzot' && e.category !== 'Mahfudzot') return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        e.word.toLowerCase().includes(q) ||
        e.meaning.toLowerCase().includes(q) ||
        (e.rootWord && e.rootWord.toLowerCase().includes(q)) ||
        (e.fiilMadhi && e.fiilMadhi.toLowerCase().includes(q)) ||
        (e.fiilMudhari && e.fiilMudhari.toLowerCase().includes(q)) ||
        (e.fiilAmr && e.fiilAmr.toLowerCase().includes(q)) ||
        e.materiTitle.toLowerCase().includes(q)
      );
    });
  }, [allEntries, searchQuery, activeTab]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-5 overflow-hidden"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/20 border border-emerald-400/30 rounded-2xl text-emerald-300">
                  <BookOpen size={24} />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] font-extrabold uppercase border border-emerald-500/30">
                    <Sparkles size={11} /> Kamus Interaktif & Glosarium LMS
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white">
                    Glosarium Mufrodat & Akar Kata (Isytiqaq)
                  </h3>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search Bar & Filters */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3 shrink-0">
              <div className="relative">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari kata Arab, terjemahan, atau akar kata (misal: كتب, meja, percakapan)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-2xl text-xs sm:text-sm font-medium focus:border-teal-500 focus:outline-none shadow-2xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                    activeTab === 'all'
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Semua ({allEntries.length})
                </button>
                <button
                  onClick={() => setActiveTab('isim')}
                  className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                    activeTab === 'isim'
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  اسْم (Isim / Kata Benda)
                </button>
                <button
                  onClick={() => setActiveTab('fiil')}
                  className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                    activeTab === 'fiil'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  فِعْل (Fi'il / Kata Kerja)
                </button>
                <button
                  onClick={() => setActiveTab('harf')}
                  className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                    activeTab === 'harf'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  حَرْف (Harf / Kata Tugas)
                </button>
                <button
                  onClick={() => setActiveTab('hiwar')}
                  className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                    activeTab === 'hiwar'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Percakapan (Hiwar)
                </button>
                <button
                  onClick={() => setActiveTab('mahfudzot')}
                  className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                    activeTab === 'mahfudzot'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Mahfudzot
                </button>
              </div>
            </div>

            {/* List Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
              {filteredEntries.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <Search size={36} className="mx-auto text-slate-300" />
                  <p className="text-slate-600 font-bold text-sm">Tidak menemukan kosa kata yang dicari.</p>
                  <p className="text-slate-400 text-xs">Coba gunakan kata kunci pencarian yang lain.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredEntries.map((entry, idx) => (
                    <div
                      key={`${entry.id}-${idx}`}
                      onClick={() => setSelectedEntry(entry)}
                      className="p-3.5 bg-white border border-slate-200 rounded-2xl hover:border-teal-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-2 group"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-arabic text-[11px] font-bold rounded-md">
                            {entry.category}
                          </span>
                          <span className="text-[11px] font-bold text-slate-400">
                            Bab {entry.babNumber}
                          </span>
                        </div>

                        {/* Fi'il 3-part layout or single word */}
                        {entry.fiilMadhi || entry.fiilMudhari || entry.fiilAmr ? (
                          <div className="p-2 bg-amber-50/60 rounded-xl border border-amber-200 space-y-1">
                            <div className="flex items-center justify-between gap-2 text-xs font-arabic font-extrabold dir-rtl">
                              {entry.fiilMadhi && <span className="text-amber-950"><span className="text-[10px] text-amber-700 font-sans font-normal ml-1">(ماضٍ)</span>{entry.fiilMadhi}</span>}
                              {entry.fiilMudhari && <span className="text-teal-950"><span className="text-[10px] text-teal-700 font-sans font-normal ml-1">(مضارع)</span>{entry.fiilMudhari}</span>}
                              {entry.fiilAmr && <span className="text-indigo-950"><span className="text-[10px] text-indigo-700 font-sans font-normal ml-1">(أمر)</span>{entry.fiilAmr}</span>}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between dir-rtl">
                            <span className="font-arabic text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                              {entry.word}
                            </span>
                            <AudioPlayerButton arabicText={entry.word} size="sm" />
                          </div>
                        )}

                        <p className="text-xs font-semibold text-slate-700 line-clamp-2">
                          {entry.meaning}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                        {entry.rootWord ? (
                          <span className="font-arabic text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-100 font-bold">
                            الجذر: {entry.rootWord}
                          </span>
                        ) : (
                          <span>Sumber: {entry.materiTitle}</span>
                        )}
                        <span className="text-teal-600 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          Detail <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Total Glosarium: {allEntries.length} entri kata terdaftar.</span>
              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold cursor-pointer transition-colors"
              >
                Tutup Glosarium
              </button>
            </div>
          </motion.div>

          {/* Selected Word Detail Popup */}
          {selectedEntry && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/80 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200"
              >
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="px-3 py-1 bg-teal-100 text-teal-900 font-arabic font-extrabold text-xs rounded-full">
                    {selectedEntry.category}
                  </span>
                  <button onClick={() => setSelectedEntry(null)} className="p-1 text-slate-400 hover:text-slate-600">
                    <X size={20} />
                  </button>
                </div>

                <div className="text-center space-y-2 py-2">
                  <p className="font-arabic text-3xl font-extrabold text-slate-900 dir-rtl">
                    {selectedEntry.word}
                  </p>
                  <div className="flex justify-center">
                    <AudioPlayerButton arabicText={selectedEntry.word} size="md" />
                  </div>
                  <p className="text-base font-extrabold text-teal-900">
                    {selectedEntry.meaning}
                  </p>
                </div>

                {selectedEntry.fiilMadhi && (
                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 space-y-2 text-xs">
                    <span className="font-bold text-amber-900 block">Tasyrif Kata Kerja (Fi'il):</span>
                    <div className="grid grid-cols-3 gap-2 text-center font-arabic text-sm">
                      <div className="bg-white p-2 rounded-xl border border-amber-200">
                        <span className="text-[10px] text-amber-700 font-sans block">الماضي</span>
                        <span className="font-bold text-amber-950">{selectedEntry.fiilMadhi}</span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-amber-200">
                        <span className="text-[10px] text-teal-700 font-sans block">المضارع</span>
                        <span className="font-bold text-teal-950">{selectedEntry.fiilMudhari || '-'}</span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-amber-200">
                        <span className="text-[10px] text-indigo-700 font-sans block">الأمر</span>
                        <span className="font-bold text-indigo-950">{selectedEntry.fiilAmr || '-'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedEntry.rootWord && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600">Akar Kata (Isytiqaq / الجذر):</span>
                    <span className="font-arabic font-extrabold text-teal-800 text-sm">
                      {selectedEntry.rootWord}
                    </span>
                  </div>
                )}

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
                  <span className="font-semibold text-slate-500">Materi Asal:</span>
                  <p className="font-bold text-slate-800">
                    Bab {selectedEntry.babNumber}: {selectedEntry.materiTitle}
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  {onSelectMateri && (
                    <button
                      onClick={() => {
                        const mId = selectedEntry.materiId;
                        setSelectedEntry(null);
                        onClose();
                        onSelectMateri(mId);
                      }}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      Buka Modul Materi <ArrowRight size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedEntry(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
