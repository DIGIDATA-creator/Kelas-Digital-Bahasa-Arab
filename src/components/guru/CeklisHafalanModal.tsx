import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, Materi, MahfudzotChecklist } from '../../types';
import {
  CheckSquare,
  Square,
  X,
  Search,
  BookOpen,
  Award,
  CheckCircle2,
  Sparkles,
  Quote,
  Save,
  Tag,
  Check,
  RotateCcw
} from 'lucide-react';

interface CeklisHafalanModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  materiList: Materi[];
  onSaveStudent: (updatedStudent: Student) => void;
}

const MAHFUDZOT_CATEGORIES = [
  'Semua',
  'Akhlak',
  'Ilmu',
  'Persahabatan',
  'Kesungguhan',
  'Waktu & Disiplin',
  'Kebijaksanaan',
];

export const CeklisHafalanModal: React.FC<CeklisHafalanModalProps> = ({
  isOpen,
  onClose,
  student,
  materiList,
  onSaveStudent,
}) => {
  const [activeTab, setActiveTab] = useState<'mahfudzot' | 'kosakata'>('mahfudzot');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  // Local state for checkboxes
  const [mahfudzotState, setMahfudzotState] = useState<Record<string, MahfudzotChecklist>>({});
  const [kosakataState, setKosakataState] = useState<Record<string, boolean>>({});
  const [savedSuccessMsg, setSavedSuccessMsg] = useState(false);

  useEffect(() => {
    if (student) {
      setMahfudzotState(student.hafalanProgress?.mahfudzotChecklist || {});
      setKosakataState(student.hafalanProgress?.kosakataIds || {});
      setSavedSuccessMsg(false);
    }
  }, [student, isOpen]);

  if (!isOpen || !student) return null;

  // Filter Mahfudzot List
  const mahfudzotMateri = materiList.filter(m => m.category === 'mahfudzot');

  const filteredMahfudzot = mahfudzotMateri.filter(m => {
    const catTag = m.mahfudzot?.categoryTag || m.mahfudzotCategory || 'Kebijaksanaan';
    if (selectedCategory !== 'Semua' && catTag !== selectedCategory) {
      return false;
    }
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;

    const numStr = (m.babNumber || m.mahfudzot?.number || '').toString();
    const title = m.title.toLowerCase();
    const arabic = (m.mahfudzot?.arabic || m.content || '').toLowerCase();
    const translation = (m.mahfudzot?.translation || m.description || '').toLowerCase();

    return numStr === q || title.includes(q) || arabic.includes(q) || translation.includes(q);
  });

  // Filter Kosakata Bab
  const kosakataMateri = materiList.filter(m => m.category === 'kosakata');

  // Helper for toggling Mahfudzot checklist criteria
  const toggleMahfudzotCriterion = (
    materiId: string,
    field: keyof MahfudzotChecklist
  ) => {
    setMahfudzotState(prev => {
      const existing = prev[materiId] || {
        hafalanArab: false,
        hafalanTerjemah: false,
        pengetahuanKosakata: false,
        pemahamanMateri: false,
      };
      return {
        ...prev,
        [materiId]: {
          ...existing,
          [field]: !existing[field],
        },
      };
    });
  };

  // Toggle all 4 criteria for a Mahfudzot item
  const toggleAllMahfudzotCriteria = (materiId: string) => {
    setMahfudzotState(prev => {
      const existing = prev[materiId];
      const isAllChecked =
        existing &&
        existing.hafalanArab &&
        existing.hafalanTerjemah &&
        existing.pengetahuanKosakata &&
        existing.pemahamanMateri;

      return {
        ...prev,
        [materiId]: {
          hafalanArab: !isAllChecked,
          hafalanTerjemah: !isAllChecked,
          pengetahuanKosakata: !isAllChecked,
          pemahamanMateri: !isAllChecked,
        },
      };
    });
  };

  // Helper for toggling Kosakata item
  const toggleKosakataItem = (vocabId: string) => {
    setKosakataState(prev => ({
      ...prev,
      [vocabId]: !prev[vocabId],
    }));
  };

  // Toggle all vocab in a Bab
  const toggleAllVocabInBab = (materi: Materi) => {
    const vocabs = materi.vocabularies || [];
    const allChecked = vocabs.every(v => kosakataState[v.id]);

    setKosakataState(prev => {
      const next = { ...prev };
      vocabs.forEach(v => {
        next[v.id] = !allChecked;
      });
      return next;
    });
  };

  // Calculate statistics
  const totalMahfudzotItems = mahfudzotMateri.length;
  const completedMahfudzotCount = Object.values(mahfudzotState).filter(
    (c: MahfudzotChecklist) => c && c.hafalanArab && c.hafalanTerjemah && c.pengetahuanKosakata && c.pemahamanMateri
  ).length;

  const totalVocabCount = kosakataMateri.reduce(
    (acc, m) => acc + (m.vocabularies?.length || 0),
    0
  );
  const completedVocabCount = Object.values(kosakataState).filter(Boolean).length;

  // Save handler
  const handleSave = () => {
    const updatedStudent: Student = {
      ...student,
      hafalanProgress: {
        mahfudzotChecklist: mahfudzotState,
        kosakataIds: kosakataState,
      },
    };

    onSaveStudent(updatedStudent);
    setSavedSuccessMsg(true);
    setTimeout(() => {
      setSavedSuccessMsg(false);
      onClose();
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-200 my-auto max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3.5">
              <img
                src={student.avatar}
                alt={student.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-purple-400 bg-slate-800"
              />
              <div>
                <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                  <span>Ceklis Setoran Hafalan: {student.name}</span>
                </h3>
                <p className="text-xs text-purple-200 font-medium">
                  {student.schoolName || 'Tanpa Sekolah'} • {student.className} ({student.rombelName || 'Rombel General'})
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="bg-slate-100 p-2 border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('mahfudzot')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'mahfudzot'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <Quote size={15} />
                <span>Setoran Mahfudzot</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                  activeTab === 'mahfudzot' ? 'bg-purple-900 text-purple-100' : 'bg-slate-200 text-slate-700'
                }`}>
                  {completedMahfudzotCount}/{totalMahfudzotItems} Tuntas
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('kosakata')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'kosakata'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <BookOpen size={15} />
                <span>Setoran Kosakata</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                  activeTab === 'kosakata' ? 'bg-emerald-900 text-emerald-100' : 'bg-slate-200 text-slate-700'
                }`}>
                  {completedVocabCount}/{totalVocabCount} Mufrodat
                </span>
              </button>
            </div>

            {savedSuccessMsg && (
              <span className="text-xs font-bold text-emerald-700 px-3 py-1 bg-emerald-100 rounded-lg animate-pulse flex items-center gap-1">
                <CheckCircle2 size={14} /> Berhasil Disimpan!
              </span>
            )}
          </div>

          {/* Modal Content Body */}
          <div className="p-5 overflow-y-auto space-y-4 flex-1">
            
            {/* TAB 1: MAHFUDZOT CHECKLIST */}
            {activeTab === 'mahfudzot' && (
              <div className="space-y-4">
                {/* Search & Category Filter */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-purple-50/60 p-3 rounded-2xl border border-purple-100">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                    <input
                      type="text"
                      placeholder="Cari kata kunci Arab atau terjemahan..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-white border border-purple-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                    {MAHFUDZOT_CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                          selectedCategory === cat
                            ? 'bg-purple-700 text-white'
                            : 'bg-white text-slate-600 border border-purple-200 hover:bg-purple-100'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-slate-500 font-semibold flex items-center justify-between">
                  <span>Menampilkan {filteredMahfudzot.length} Kata Mutiara Mahfudzot</span>
                  <span className="text-purple-700 font-bold">
                    💡 Guru mencentang 4 kriteria hafalan setelah siswa setor offline
                  </span>
                </div>

                {filteredMahfudzot.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 font-medium text-xs bg-slate-50 rounded-2xl border">
                    Tidak ada materi Mahfudzot yang ditemukan.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredMahfudzot.map((materi, idx) => {
                      const num = materi.mahfudzot?.number || materi.babNumber || (idx + 1);
                      const arabicText = materi.mahfudzot?.arabic || materi.content;
                      const transText = materi.mahfudzot?.translation || materi.description;
                      const catTag = materi.mahfudzot?.categoryTag || materi.mahfudzotCategory || 'Kebijaksanaan';

                      const checkObj: MahfudzotChecklist = mahfudzotState[materi.id] || {
                        hafalanArab: false,
                        hafalanTerjemah: false,
                        pengetahuanKosakata: false,
                        pemahamanMateri: false,
                      };

                      const checkedCount = [
                        checkObj.hafalanArab,
                        checkObj.hafalanTerjemah,
                        checkObj.pengetahuanKosakata,
                        checkObj.pemahamanMateri,
                      ].filter(Boolean).length;

                      const isFull = checkedCount === 4;

                      return (
                        <div
                          key={materi.id}
                          className={`p-4 rounded-2xl border transition-all space-y-3 ${
                            isFull
                              ? 'bg-purple-50/70 border-purple-400 ring-1 ring-purple-300'
                              : checkedCount > 0
                              ? 'bg-amber-50/40 border-amber-300'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          {/* Item Header */}
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 text-xs font-black rounded-full border border-purple-200">
                                No. {num}
                              </span>
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-bold rounded-lg border border-slate-200">
                                {catTag}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 text-[11px] font-black rounded-md ${
                                isFull
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : checkedCount > 0
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : 'bg-slate-100 text-slate-500'
                              }`}>
                                {checkedCount}/4 Kriteria
                              </span>

                              <button
                                type="button"
                                onClick={() => toggleAllMahfudzotCriteria(materi.id)}
                                className="text-[11px] font-extrabold text-purple-700 hover:text-purple-900 underline cursor-pointer"
                              >
                                {isFull ? 'Reset' : 'Ceklis Semua'}
                              </button>
                            </div>
                          </div>

                          {/* Text Display */}
                          <div className="space-y-1">
                            <p className="font-arabic text-xl font-bold text-slate-900 leading-snug text-right dir-rtl">
                              {arabicText}
                            </p>
                            <p className="text-xs text-slate-600 font-medium italic">
                              "{transText}"
                            </p>
                          </div>

                          {/* 4 Checkbox Controls Required by User */}
                          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                            {/* 1. Hafalan Arab */}
                            <label
                              onClick={() => toggleMahfudzotCriterion(materi.id, 'hafalanArab')}
                              className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all select-none ${
                                checkObj.hafalanArab
                                  ? 'bg-purple-100 border-purple-400 font-bold text-purple-900'
                                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={!!checkObj.hafalanArab}
                                onChange={() => {}}
                                className="w-4 h-4 text-purple-700 rounded accent-purple-700 cursor-pointer"
                              />
                              <span>1. Hafalan Arab</span>
                            </label>

                            {/* 2. Hafalan Terjemah */}
                            <label
                              onClick={() => toggleMahfudzotCriterion(materi.id, 'hafalanTerjemah')}
                              className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all select-none ${
                                checkObj.hafalanTerjemah
                                  ? 'bg-purple-100 border-purple-400 font-bold text-purple-900'
                                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={!!checkObj.hafalanTerjemah}
                                onChange={() => {}}
                                className="w-4 h-4 text-purple-700 rounded accent-purple-700 cursor-pointer"
                              />
                              <span>2. Hafalan Terjemah</span>
                            </label>

                            {/* 3. Pengetahuan Kosakata */}
                            <label
                              onClick={() => toggleMahfudzotCriterion(materi.id, 'pengetahuanKosakata')}
                              className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all select-none ${
                                checkObj.pengetahuanKosakata
                                  ? 'bg-purple-100 border-purple-400 font-bold text-purple-900'
                                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={!!checkObj.pengetahuanKosakata}
                                onChange={() => {}}
                                className="w-4 h-4 text-purple-700 rounded accent-purple-700 cursor-pointer"
                              />
                              <span>3. Pengetahuan Kosakata</span>
                            </label>

                            {/* 4. Pemahaman Materi */}
                            <label
                              onClick={() => toggleMahfudzotCriterion(materi.id, 'pemahamanMateri')}
                              className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all select-none ${
                                checkObj.pemahamanMateri
                                  ? 'bg-purple-100 border-purple-400 font-bold text-purple-900'
                                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={!!checkObj.pemahamanMateri}
                                onChange={() => {}}
                                className="w-4 h-4 text-purple-700 rounded accent-purple-700 cursor-pointer"
                              />
                              <span>4. Pemahaman Materi</span>
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: KOSAKATA CHECKLIST */}
            {activeTab === 'kosakata' && (
              <div className="space-y-5">
                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 font-medium">
                  💡 Guru memberikan centang untuk setiap kosakata (mufrodat) yang berhasil disetorkan secara hafalan offline oleh siswa.
                </div>

                {kosakataMateri.map((materi) => {
                  const vocabs = materi.vocabularies || [];
                  if (vocabs.length === 0) return null;

                  const babCompletedCount = vocabs.filter(v => kosakataState[v.id]).length;
                  const isBabAllDone = babCompletedCount === vocabs.length;

                  return (
                    <div
                      key={materi.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-0"
                    >
                      <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-black text-xs rounded-full border border-emerald-200">
                            Bab {materi.babNumber || 1}
                          </span>
                          <span className="font-extrabold text-xs text-slate-900">
                            {materi.title} ({vocabs.length} Kosakata)
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-extrabold text-emerald-700">
                            {babCompletedCount}/{vocabs.length} Hafal
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleAllVocabInBab(materi)}
                            className="px-2.5 py-1 bg-white border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 text-xs font-bold rounded-lg cursor-pointer transition-all"
                          >
                            {isBabAllDone ? 'Batalkan Bab Ini' : 'Ceklis Semua Bab Ini'}
                          </button>
                        </div>
                      </div>

                      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {vocabs.map((vocab) => {
                          const isChecked = !!kosakataState[vocab.id];
                          return (
                            <label
                              key={vocab.id}
                              onClick={() => toggleKosakataItem(vocab.id)}
                              className={`p-3 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all select-none ${
                                isChecked
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold shadow-2xs'
                                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <div className="space-y-0.5 min-w-0">
                                <p className="font-arabic font-extrabold text-base text-slate-900 dir-rtl truncate">
                                  {vocab.word}
                                </p>
                                <p className="text-[11px] text-slate-600 font-semibold truncate">
                                  {vocab.meaning} {vocab.latin && `(${vocab.latin})`}
                                </p>
                              </div>

                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="w-4 h-4 text-emerald-600 rounded accent-emerald-600 cursor-pointer shrink-0"
                              />
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

          {/* Footer Save Action */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
            <div className="text-xs text-slate-500 font-semibold">
              Siswa: <strong className="text-slate-900">{student.name}</strong>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white text-xs font-extrabold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <Save size={15} />
                <span>Simpan Ceklis Hafalan</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
