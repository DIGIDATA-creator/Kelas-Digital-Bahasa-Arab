import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, Materi, MahfudzotChecklist } from '../../types';
import {
  X,
  Search,
  BookOpen,
  Award,
  CheckCircle2,
  Quote,
  Save,
  ChevronDown,
  ChevronRight,
  Maximize2,
  Minimize2,
  Layers,
  Sparkles,
  Zap,
  Tag
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

// Helper to calculate XP earned from Hafalan
export function calculateHafalanXP(
  mahfudzotState: Record<string, MahfudzotChecklist>,
  kosakataState: Record<string, boolean>
): { totalHafalanXP: number; kosakataXP: number; mahfudzotXP: number } {
  // 4.2a Kosakata: +5 EXP per item
  const kosakataCount = Object.values(kosakataState).filter(Boolean).length;
  const kosakataXP = kosakataCount * 5;

  // 4.2b Mahfudzot: Point 1 & 2 = +5 EXP each, Point 3 & 4 = +10 EXP each
  let mahfudzotXP = 0;
  Object.values(mahfudzotState).forEach((chk) => {
    if (!chk) return;
    if (chk.hafalanArab) mahfudzotXP += 5;        // Point 1: +5 EXP
    if (chk.hafalanTerjemah) mahfudzotXP += 5;   // Point 2: +5 EXP
    if (chk.pengetahuanKosakata) mahfudzotXP += 10; // Point 3: +10 EXP
    if (chk.pemahamanMateri) mahfudzotXP += 10;     // Point 4: +10 EXP
  });

  return {
    totalHafalanXP: kosakataXP + mahfudzotXP,
    kosakataXP,
    mahfudzotXP,
  };
}

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

  // 3.1b.1 Minimization state for Mahfudzot
  const [expandedMahfudzotItems, setExpandedMahfudzotItems] = useState<Record<string, boolean>>({});
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // 3.1b.2 Minimization state for Kosakata Bab
  const [collapsedKosakataBabs, setCollapsedKosakataBabs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (student) {
      setMahfudzotState(student.hafalanProgress?.mahfudzotChecklist || {});
      setKosakataState(student.hafalanProgress?.kosakataIds || {});
      setSavedSuccessMsg(false);

      // Default all Kosakata Babs to collapsed state for clean list preview first
      const initKosakataCollapsed: Record<string, boolean> = {};
      materiList.filter(m => m.category === 'kosakata').forEach(m => {
        initKosakataCollapsed[m.id] = true;
      });
      setCollapsedKosakataBabs(initKosakataCollapsed);
    }
  }, [student, isOpen, materiList]);

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

  // Group Mahfudzot into chunks of max 5 items (No. 1-5, No. 6-10, etc.)
  const mahfudzotGroups = useMemo(() => {
    const CHUNK_SIZE = 5;
    const groups: { groupIndex: number; title: string; startNum: number; endNum: number; items: Materi[] }[] = [];

    for (let i = 0; i < filteredMahfudzot.length; i += CHUNK_SIZE) {
      const chunk = filteredMahfudzot.slice(i, i + CHUNK_SIZE);
      const startNum = i + 1;
      const endNum = i + chunk.length;
      groups.push({
        groupIndex: Math.floor(i / CHUNK_SIZE) + 1,
        title: `Kelompok ${Math.floor(i / CHUNK_SIZE) + 1} (No. ${startNum} - ${endNum})`,
        startNum,
        endNum,
        items: chunk,
      });
    }
    return groups;
  }, [filteredMahfudzot]);

  if (!isOpen || !student) return null;

  // Filter Kosakata Bab
  const kosakataMateri = materiList.filter(m => m.category === 'kosakata');

  // Toggle single Mahfudzot item minimize/expand
  const toggleMahfudzotItemExpand = (materiId: string) => {
    setExpandedMahfudzotItems(prev => ({ ...prev, [materiId]: !prev[materiId] }));
  };

  // Toggle group minimize/expand
  const toggleGroupCollapse = (groupTitle: string) => {
    setCollapsedGroups(prev => ({ ...prev, [groupTitle]: !prev[groupTitle] }));
  };

  // Expand / Minimize all Mahfudzot items
  const setAllMahfudzotExpanded = (expand: boolean) => {
    const next: Record<string, boolean> = {};
    filteredMahfudzot.forEach(m => {
      next[m.id] = expand;
    });
    setExpandedMahfudzotItems(next);
  };

  // Toggle Kosakata Bab collapse
  const toggleKosakataBabCollapse = (materiId: string) => {
    setCollapsedKosakataBabs(prev => ({ ...prev, [materiId]: !prev[materiId] }));
  };

  // Collapse / Expand all Kosakata Bab
  const setAllKosakataBabsCollapsed = (collapse: boolean) => {
    const next: Record<string, boolean> = {};
    kosakataMateri.forEach(m => {
      next[m.id] = collapse;
    });
    setCollapsedKosakataBabs(next);
  };

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

  // Calculate statistics & XP
  const totalMahfudzotItems = mahfudzotMateri.length;
  const completedMahfudzotCount = Object.values(mahfudzotState).filter(
    (c: MahfudzotChecklist) => c && c.hafalanArab && c.hafalanTerjemah && c.pengetahuanKosakata && c.pemahamanMateri
  ).length;

  const totalVocabCount = kosakataMateri.reduce(
    (acc, m) => acc + (m.vocabularies?.length || 0),
    0
  );
  const completedVocabCount = Object.values(kosakataState).filter(Boolean).length;

  const xpCalculation = calculateHafalanXP(mahfudzotState, kosakataState);

  // Save handler with XP update
  const handleSave = () => {
    // Calculate new total XP: Base XP from non-hafalan + new Hafalan XP
    const prevHafalanXP = calculateHafalanXP(
      student.hafalanProgress?.mahfudzotChecklist || {},
      student.hafalanProgress?.kosakataIds || {}
    ).totalHafalanXP;

    const baseXP = Math.max(0, (student.totalXP || 0) - prevHafalanXP);
    const newTotalXP = baseXP + xpCalculation.totalHafalanXP;

    const updatedStudent: Student = {
      ...student,
      totalXP: newTotalXP,
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
      <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-200 my-auto max-h-[94vh] flex flex-col"
        >
          {/* Modal Header */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <img
                src={student.avatar}
                alt={student.name}
                className="w-11 h-11 rounded-2xl object-cover border-2 border-purple-400 bg-slate-800 shrink-0"
              />
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                  <span>Ceklis Setoran Hafalan: {student.name}</span>
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-purple-200 font-medium pt-0.5">
                  <span>{student.schoolName || 'Tanpa Sekolah'} • {student.className}</span>
                  <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 rounded-md font-bold text-[11px] border border-amber-400/30 flex items-center gap-1">
                    <Award size={12} /> {xpCalculation.totalHafalanXP} XP Hafalan
                  </span>
                </div>
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
          <div className="bg-slate-100 p-2 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('mahfudzot')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'mahfudzot'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <Quote size={15} />
                <span>Mahfudzot</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                  activeTab === 'mahfudzot' ? 'bg-purple-900 text-purple-100' : 'bg-slate-200 text-slate-700'
                }`}>
                  {completedMahfudzotCount}/{totalMahfudzotItems} Tuntas
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('kosakata')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'kosakata'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <BookOpen size={15} />
                <span>Kosakata</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                  activeTab === 'kosakata' ? 'bg-emerald-900 text-emerald-100' : 'bg-slate-200 text-slate-700'
                }`}>
                  {completedVocabCount}/{totalVocabCount} Hafal
                </span>
              </button>
            </div>

            {savedSuccessMsg && (
              <span className="text-xs font-bold text-emerald-700 px-3 py-1 bg-emerald-100 rounded-lg animate-pulse flex items-center gap-1">
                <CheckCircle2 size={14} /> Berhasil Disimpan! (+{xpCalculation.totalHafalanXP} XP)
              </span>
            )}
          </div>

          {/* Modal Content Body */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
            
            {/* TAB 1: MAHFUDZOT CHECKLIST (Grouped max 5 + Minimizable cards) */}
            {activeTab === 'mahfudzot' && (
              <div className="space-y-4">
                
                {/* Search, Category & Minimization Toolbar */}
                <div className="flex flex-col gap-3 bg-purple-50/70 p-3.5 rounded-2xl border border-purple-200">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="relative flex-1">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                      <input
                        type="text"
                        placeholder="Cari nomor, kata kunci Arab atau terjemahan..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 bg-white border border-purple-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    {/* Minimize / Expand All Controls */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setAllMahfudzotExpanded(false)}
                        className="px-2.5 py-1.5 bg-white border border-purple-200 hover:bg-purple-100 text-purple-800 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        title="Minimize semua tampilan ke nomor Mahfudzot"
                      >
                        <Minimize2 size={13} /> Minimize Semua
                      </button>
                      <button
                        type="button"
                        onClick={() => setAllMahfudzotExpanded(true)}
                        className="px-2.5 py-1.5 bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-purple-800 cursor-pointer transition-colors shadow-2xs"
                        title="Buka detail semua Mahfudzot"
                      >
                        <Maximize2 size={13} /> Buka Semua
                      </button>
                    </div>
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-1">
                    <span className="text-[11px] font-bold text-purple-900 shrink-0 mr-1">Kategori:</span>
                    {MAHFUDZOT_CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all ${
                          selectedCategory === cat
                            ? 'bg-purple-700 text-white shadow-2xs'
                            : 'bg-white text-slate-600 border border-purple-200 hover:bg-purple-100'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-slate-500 font-semibold flex flex-wrap items-center justify-between gap-2">
                  <span>
                    Menampilkan <strong>{filteredMahfudzot.length}</strong> Mahfudzot dikelompokkan <strong>maksimal per 5 nomor</strong>
                  </span>
                  <span className="text-purple-700 font-bold flex items-center gap-1">
                    <Zap size={13} className="text-amber-500" />
                    Point 1&2: +5 XP • Point 3&4: +10 XP
                  </span>
                </div>

                {filteredMahfudzot.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 font-medium text-xs bg-slate-50 rounded-2xl border">
                    Tidak ada materi Mahfudzot yang ditemukan.
                  </div>
                ) : (
                  /* Render Groups (Max 5 items per group) */
                  <div className="space-y-4">
                    {mahfudzotGroups.map((group) => {
                      const isGroupCollapsed = !!collapsedGroups[group.title];

                      return (
                        <div
                          key={group.title}
                          className="bg-white rounded-2xl border border-purple-200 overflow-hidden shadow-2xs"
                        >
                          {/* Group Header (per 5 nomor) */}
                          <button
                            type="button"
                            onClick={() => toggleGroupCollapse(group.title)}
                            className="w-full p-3 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100 flex items-center justify-between text-left cursor-pointer hover:bg-purple-100/50 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <span className="p-1 bg-purple-200 text-purple-900 rounded-lg">
                                {isGroupCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                              </span>
                              <span className="font-extrabold text-xs sm:text-sm text-purple-950">
                                {group.title}
                              </span>
                              <span className="px-2 py-0.5 bg-purple-200 text-purple-800 text-[10px] font-bold rounded-full">
                                {group.items.length} Item
                              </span>
                            </div>

                            <span className="text-[11px] text-purple-700 font-bold hover:underline">
                              {isGroupCollapsed ? 'Buka Kelompok ➔' : 'Ciutkan Kelompok ▲'}
                            </span>
                          </button>

                          {/* Group Items List */}
                          {!isGroupCollapsed && (
                            <div className="p-3 space-y-3 bg-slate-50/50 divide-y divide-slate-100">
                              {group.items.map((materi, idx) => {
                                const globalNum = materi.mahfudzot?.number || materi.babNumber || (group.startNum + idx);
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
                                const isExpanded = !!expandedMahfudzotItems[materi.id];

                                return (
                                  <div
                                    key={materi.id}
                                    className={`pt-3 first:pt-0 transition-all ${
                                      isFull
                                        ? 'bg-purple-50/60 p-3 rounded-2xl border border-purple-300'
                                        : checkedCount > 0
                                        ? 'bg-amber-50/30 p-3 rounded-2xl border border-amber-200'
                                        : 'p-2'
                                    }`}
                                  >
                                    {/* MINIMIZED VIEW: Summarized down to Mahfudzot Number */}
                                    {!isExpanded ? (
                                      <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                          <span className="px-2.5 py-1 bg-purple-700 text-white text-xs font-black rounded-xl shrink-0 shadow-2xs">
                                            No. {globalNum}
                                          </span>
                                          <span className="px-2 py-0.5 bg-purple-100 text-purple-900 text-[10px] font-bold rounded-lg shrink-0 border border-purple-200">
                                            {catTag}
                                          </span>
                                          <p className="font-arabic font-bold text-sm text-slate-800 dir-rtl truncate shrink max-w-[280px] hidden sm:block">
                                            {arabicText}
                                          </p>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                          <span className={`px-2.5 py-0.5 text-[11px] font-black rounded-lg ${
                                            isFull
                                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                              : checkedCount > 0
                                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                              : 'bg-slate-200 text-slate-600'
                                          }`}>
                                            {checkedCount}/4 Ceklis
                                          </span>

                                          <button
                                            type="button"
                                            onClick={() => toggleMahfudzotItemExpand(materi.id)}
                                            className="px-2.5 py-1 bg-white border border-purple-200 hover:bg-purple-100 text-purple-900 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1 transition-all"
                                          >
                                            <span>Detail Teks & Centang</span>
                                            <ChevronDown size={14} />
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      /* EXPANDED VIEW: Full Arabic, Translation & 4 Checkboxes */
                                      <div className="space-y-3">
                                        <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                                          <div className="flex items-center gap-2">
                                            <span className="px-3 py-1 bg-purple-800 text-white text-xs font-black rounded-xl">
                                              No. {globalNum}
                                            </span>
                                            <span className="px-2.5 py-0.5 bg-purple-100 text-purple-900 text-xs font-bold rounded-lg border border-purple-200">
                                              {catTag}
                                            </span>
                                          </div>

                                          <div className="flex items-center gap-2">
                                            <button
                                              type="button"
                                              onClick={() => toggleAllMahfudzotCriteria(materi.id)}
                                              className="text-xs font-extrabold text-purple-700 hover:text-purple-900 underline cursor-pointer"
                                            >
                                              {isFull ? 'Reset Semua' : 'Ceklis Semua (4/4)'}
                                            </button>

                                            <button
                                              type="button"
                                              onClick={() => toggleMahfudzotItemExpand(materi.id)}
                                              className="p-1 text-slate-400 hover:text-purple-800 rounded-lg"
                                              title="Minimize ke nomor"
                                            >
                                              <Minimize2 size={16} />
                                            </button>
                                          </div>
                                        </div>

                                        {/* Text Display */}
                                        <div className="space-y-1 bg-white p-3 rounded-xl border border-purple-100">
                                          <p className="font-arabic text-xl font-bold text-slate-900 leading-snug text-right dir-rtl">
                                            {arabicText}
                                          </p>
                                          <p className="text-xs text-slate-600 font-medium italic">
                                            "{transText}"
                                          </p>
                                        </div>

                                        {/* 4 Checkbox Criteria */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                          {/* 1. Hafalan Arab (+5 XP) */}
                                          <label
                                            onClick={() => toggleMahfudzotCriterion(materi.id, 'hafalanArab')}
                                            className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all select-none ${
                                              checkObj.hafalanArab
                                                ? 'bg-purple-100 border-purple-400 font-bold text-purple-900 shadow-2xs'
                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-purple-50'
                                            }`}
                                          >
                                            <div className="flex items-center gap-2">
                                              <input
                                                type="checkbox"
                                                checked={!!checkObj.hafalanArab}
                                                onChange={() => {}}
                                                className="w-4 h-4 text-purple-700 rounded accent-purple-700 cursor-pointer"
                                              />
                                              <span>1. Hafalan Teks Arab</span>
                                            </div>
                                            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-purple-200 text-purple-900">
                                              +5 XP
                                            </span>
                                          </label>

                                          {/* 2. Hafalan Terjemah (+5 XP) */}
                                          <label
                                            onClick={() => toggleMahfudzotCriterion(materi.id, 'hafalanTerjemah')}
                                            className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all select-none ${
                                              checkObj.hafalanTerjemah
                                                ? 'bg-purple-100 border-purple-400 font-bold text-purple-900 shadow-2xs'
                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-purple-50'
                                            }`}
                                          >
                                            <div className="flex items-center gap-2">
                                              <input
                                                type="checkbox"
                                                checked={!!checkObj.hafalanTerjemah}
                                                onChange={() => {}}
                                                className="w-4 h-4 text-purple-700 rounded accent-purple-700 cursor-pointer"
                                              />
                                              <span>2. Hafalan Terjemah</span>
                                            </div>
                                            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-purple-200 text-purple-900">
                                              +5 XP
                                            </span>
                                          </label>

                                          {/* 3. Pengetahuan Kosakata (+10 XP) */}
                                          <label
                                            onClick={() => toggleMahfudzotCriterion(materi.id, 'pengetahuanKosakata')}
                                            className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all select-none ${
                                              checkObj.pengetahuanKosakata
                                                ? 'bg-purple-100 border-purple-400 font-bold text-purple-900 shadow-2xs'
                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-purple-50'
                                            }`}
                                          >
                                            <div className="flex items-center gap-2">
                                              <input
                                                type="checkbox"
                                                checked={!!checkObj.pengetahuanKosakata}
                                                onChange={() => {}}
                                                className="w-4 h-4 text-purple-700 rounded accent-purple-700 cursor-pointer"
                                              />
                                              <span>3. Pengetahuan Kosakata</span>
                                            </div>
                                            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">
                                              +10 XP
                                            </span>
                                          </label>

                                          {/* 4. Pemahaman Materi (+10 XP) */}
                                          <label
                                            onClick={() => toggleMahfudzotCriterion(materi.id, 'pemahamanMateri')}
                                            className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all select-none ${
                                              checkObj.pemahamanMateri
                                                ? 'bg-purple-100 border-purple-400 font-bold text-purple-900 shadow-2xs'
                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-purple-50'
                                            }`}
                                          >
                                            <div className="flex items-center gap-2">
                                              <input
                                                type="checkbox"
                                                checked={!!checkObj.pemahamanMateri}
                                                onChange={() => {}}
                                                className="w-4 h-4 text-purple-700 rounded accent-purple-700 cursor-pointer"
                                              />
                                              <span>4. Pemahaman Hikmah</span>
                                            </div>
                                            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">
                                              +10 XP
                                            </span>
                                          </label>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: KOSAKATA CHECKLIST (Numbered + Minimizable Bab) */}
            {activeTab === 'kosakata' && (
              <div className="space-y-4">
                
                {/* Header Toolbar */}
                <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-emerald-950 font-medium">
                    💡 Beri centang pada setiap kosakata (+5 XP per mufrodat). Bab/judul materi dapat di-minimize/dikembangkan.
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAllKosakataBabsCollapsed(true)}
                      className="px-2.5 py-1 bg-white border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl hover:bg-emerald-100 cursor-pointer transition-all"
                    >
                      <Minimize2 size={13} className="inline mr-1" /> Minimize Semua Bab
                    </button>
                    <button
                      type="button"
                      onClick={() => setAllKosakataBabsCollapsed(false)}
                      className="px-2.5 py-1 bg-emerald-700 text-white text-xs font-bold rounded-xl hover:bg-emerald-800 cursor-pointer transition-all shadow-2xs"
                    >
                      <Maximize2 size={13} className="inline mr-1" /> Buka Semua Bab
                    </button>
                  </div>
                </div>

                {/* List of Kosakata Bab */}
                {kosakataMateri.map((materi, babIdx) => {
                  const vocabs = materi.vocabularies || [];
                  if (vocabs.length === 0) return null;

                  const babCompletedCount = vocabs.filter(v => kosakataState[v.id]).length;
                  const isBabAllDone = babCompletedCount === vocabs.length;
                  const isBabCollapsed = !!collapsedKosakataBabs[materi.id];

                  return (
                    <div
                      key={materi.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-0"
                    >
                      {/* Bab Title Collapsible Header */}
                      <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => toggleKosakataBabCollapse(materi.id)}
                          className="flex items-center gap-2.5 text-left font-bold text-xs sm:text-sm text-slate-900 hover:text-emerald-800 cursor-pointer flex-1"
                        >
                          <span className="p-1 bg-emerald-100 text-emerald-800 rounded-lg">
                            {isBabCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                          </span>
                          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-black text-xs rounded-full border border-emerald-200">
                            Bab {materi.babNumber || (babIdx + 1)}
                          </span>
                          <span className="truncate">{materi.title}</span>
                          <span className="text-xs text-slate-400 font-normal shrink-0">
                            ({vocabs.length} Kosakata)
                          </span>
                        </button>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                            {babCompletedCount}/{vocabs.length} Hafal (+{babCompletedCount * 5} XP)
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleAllVocabInBab(materi)}
                            className="px-2.5 py-1 bg-white border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 text-xs font-bold rounded-lg cursor-pointer transition-all"
                          >
                            {isBabAllDone ? 'Batalkan' : 'Ceklis Bab Ini'}
                          </button>
                        </div>
                      </div>

                      {/* Vocabulary Grid with Items Numbered */}
                      {!isBabCollapsed && (
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 bg-slate-50/30">
                          {vocabs.map((vocab, vIdx) => {
                            const isChecked = !!kosakataState[vocab.id];
                            const vocabNum = vIdx + 1; // 3.1b.2 Kosakata Numbering

                            return (
                              <label
                                key={vocab.id}
                                onClick={() => toggleKosakataItem(vocab.id)}
                                className={`p-3 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all select-none ${
                                  isChecked
                                    ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold shadow-2xs ring-1 ring-emerald-300'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-mono font-extrabold rounded-md border border-slate-200 shrink-0">
                                    #{vocabNum}
                                  </span>
                                  <div className="space-y-0.5 min-w-0">
                                    <p className="font-arabic font-extrabold text-base text-slate-900 dir-rtl truncate">
                                      {vocab.word}
                                    </p>
                                    <p className="text-[11px] text-slate-600 font-semibold truncate">
                                      {vocab.meaning} {vocab.latin && `(${vocab.latin})`}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded">
                                    +5 XP
                                  </span>
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {}}
                                    className="w-4 h-4 text-emerald-600 rounded accent-emerald-600 cursor-pointer"
                                  />
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

          </div>

          {/* Footer Save Action */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="text-xs text-slate-600 font-semibold flex items-center gap-2">
              <span>Siswa: <strong className="text-slate-900">{student.name}</strong></span>
              <span className="px-2 py-0.5 bg-purple-100 text-purple-900 rounded-md font-bold text-[11px] border border-purple-200">
                Bonus Total Hafalan: +{xpCalculation.totalHafalanXP} XP
              </span>
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
                <span>Simpan Ceklis Hafalan (+{xpCalculation.totalHafalanXP} XP)</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
