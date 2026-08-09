import React, { useState } from 'react';
import { Materi, MahfudzotChecklist } from '../../../types';
import { AudioPlayerButton } from '../../common/AudioPlayerButton';
import {
  Quote,
  Play,
  Edit3,
  Trash2,
  Volume2,
  Search,
  BookOpen,
  FileSpreadsheet,
  CheckSquare,
  Square,
  Download,
  Filter,
  Tag,
  X,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Layers,
  CheckCircle2,
  Bookmark,
  Award,
  Crown
} from 'lucide-react';
import { exportMahfudzotToPdf } from '../../../utils/mahfudzotPdfExport';
import { resolveMahfudzotCategory } from '../../../data/mahfudzotData';
import { playArabicAudio } from '../../../utils/audioSpeech';

interface MahfudzotViewProps {
  materiList: Materi[];
  onEditMateri: (materi: Materi) => void;
  onDeleteMateri: (id: string) => void;
  onDeleteMultipleMateri?: (ids: string[]) => void;
  onLaunchFlashcards: (filteredList?: Materi[]) => void;
  onOpenSheetModal?: () => void;
  isEditable?: boolean;
  teacherMahfudzotState?: Record<string, MahfudzotChecklist>;
  selfMahfudzotState?: Record<string, boolean>;
  onToggleSelfMahfudzot?: (materiId: string) => void;
}

const CATEGORY_OPTIONS = [
  'Semua',
  'Akhlak',
  'Ilmu',
  'Persahabatan',
  'Kesungguhan',
  'Waktu & Disiplin',
  'Kebijaksanaan',
];

export const MahfudzotView: React.FC<MahfudzotViewProps> = ({
  materiList,
  onEditMateri,
  onDeleteMateri,
  onDeleteMultipleMateri,
  onLaunchFlashcards,
  onOpenSheetModal,
  isEditable = true,
  teacherMahfudzotState,
  selfMahfudzotState,
  onToggleSelfMahfudzot,
}) => {
  const [viewType, setViewType] = useState<'tabel' | 'flashcard'>('tabel');
  const [displayMode, setDisplayMode] = useState<'all' | 'arabic_only' | 'translation_only'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<number>>(new Set());
  const [mahfudzotCardIndex, setMahfudzotCardIndex] = useState(0);
  const [isMahfudzotFlipped, setIsMahfudzotFlipped] = useState(false);
  const [initialFacing, setInitialFacing] = useState<'arabic' | 'indonesia'>('arabic');
  const [isDeckShuffled, setIsDeckShuffled] = useState(false);
  const [shuffledDeck, setShuffledDeck] = useState<Materi[] | null>(null);

  // Flashcard Scope: 'all' | 'selected'
  const [flashcardScope, setFlashcardScope] = useState<'all' | 'selected'>('selected');

  const toggleGroupCollapse = (groupIndex: number) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupIndex)) next.delete(groupIndex);
      else next.add(groupIndex);
      return next;
    });
  };

  const mahfudzotMateri = materiList.filter(m => m.category === 'mahfudzot');

  // Helper to get item category tag
  const getItemCategory = (m: Materi) => {
    if (m.mahfudzot?.categoryTag) return m.mahfudzot.categoryTag;
    if (m.mahfudzotCategory) return m.mahfudzotCategory;
    const arabic = m.mahfudzot?.arabic || m.content || '';
    const trans = m.mahfudzot?.translation || m.description || '';
    return resolveMahfudzotCategory(arabic, trans, '');
  };

  // Helper to get category badge color style
  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Akhlak':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Ilmu':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Persahabatan':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Kesungguhan':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Waktu & Disiplin':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Kebijaksanaan':
      default:
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    }
  };

  // Filter by Category Tag & Search Query
  const filteredMahfudzot = mahfudzotMateri.filter(m => {
    const itemCat = getItemCategory(m);
    if (selectedCategory !== 'Semua' && itemCat !== selectedCategory) {
      return false;
    }

    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;

    const numStr = (m.babNumber || '').toString();
    const title = m.title.toLowerCase();
    const arabic = (m.mahfudzot?.arabic || m.content || '').toLowerCase();
    const translation = (m.mahfudzot?.translation || m.description || '').toLowerCase();

    return (
      numStr === q ||
      title.includes(q) ||
      arabic.includes(q) ||
      translation.includes(q) ||
      itemCat.toLowerCase().includes(q)
    );
  });

  const totalGroups = Math.ceil(filteredMahfudzot.length / 10);
  const isAllCollapsed = totalGroups > 0 && Array.from({ length: totalGroups }, (_, i) => i).every(i => collapsedGroups.has(i));

  const toggleCollapseAllPer10 = () => {
    if (isAllCollapsed) {
      setCollapsedGroups(new Set());
    } else {
      const all = new Set<number>();
      for (let i = 0; i < totalGroups; i++) all.add(i);
      setCollapsedGroups(all);
    }
  };

  const isAllSelected =
    filteredMahfudzot.length > 0 &&
    filteredMahfudzot.every(m => selectedIds.includes(m.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMahfudzot.map(m => m.id));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (onDeleteMultipleMateri) {
      onDeleteMultipleMateri(selectedIds);
    } else {
      selectedIds.forEach(id => onDeleteMateri(id));
    }
    setSelectedIds([]);
  };

  const handleExportPdf = () => {
    exportMahfudzotToPdf(
      filteredMahfudzot,
      `Kumpulan Kata Mutiara (Mahfudzot)`,
      selectedCategory
    );
  };

  const handleSpeak = (text: string) => {
    playArabicAudio(text);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar Controls */}
      <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {/* Header Title & Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 text-purple-700 rounded-xl border border-purple-200 shrink-0">
              <Quote size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <span>Kumpulan Kata Mutiara (Mahfudzot)</span>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-black rounded-full">
                  Total: {mahfudzotMateri.length}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Menampilkan {filteredMahfudzot.length} Mahfudzot {selectedCategory !== 'Semua' && `(Kategori: ${selectedCategory})`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Mode Switcher: Daftar vs Flashcard */}
            <div className="bg-purple-100 p-1 rounded-xl border border-purple-200 flex items-center text-xs font-bold gap-1 shadow-inner">
              <button
                type="button"
                onClick={() => setViewType('tabel')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  viewType === 'tabel'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'text-purple-800 hover:bg-purple-200/80'
                }`}
              >
                <BookOpen size={14} /> Daftar
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewType('flashcard');
                  setMahfudzotCardIndex(0);
                  setIsMahfudzotFlipped(false);
                }}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  viewType === 'flashcard'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'text-purple-800 hover:bg-purple-200/80'
                }`}
              >
                <Play size={14} /> Flashcard
              </button>
            </div>

            {/* Minimize Per 10 Button */}
            {filteredMahfudzot.length > 0 && viewType === 'tabel' && (
              <button
                onClick={toggleCollapseAllPer10}
                className="px-3.5 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-300 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                title="Minimize atau Buka Seluruh Mahfudzot per 10 Item"
              >
                <Layers size={16} className="text-purple-700" />
                <span>{isAllCollapsed ? 'Buka Semua (per 10)' : 'Minimize Semua (per 10)'}</span>
              </button>
            )}

            {/* Download PDF Button */}
            <button
              onClick={handleExportPdf}
              disabled={filteredMahfudzot.length === 0}
              className="px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 disabled:opacity-50 text-amber-900 border border-amber-300 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              title="Unduh daftar materi Mahfudzot dalam format PDF"
            >
              <Download size={16} className="text-amber-700" />
              <span>Unduh PDF ({filteredMahfudzot.length})</span>
            </button>

            {isEditable && onOpenSheetModal && (
              <button
                onClick={onOpenSheetModal}
                className="px-3.5 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-300 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <FileSpreadsheet size={16} className="text-purple-700" />
                <span>Upload Sheet</span>
              </button>
            )}

            {/* Flashcard Button */}
            <button
              onClick={() => onLaunchFlashcards(filteredMahfudzot)}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Play size={15} className="fill-white" /> Flashcard ({filteredMahfudzot.length})
            </button>
          </div>
        </div>

        {/* Category Tag Chips Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
            <Tag size={13} /> Kategori:
          </span>
          {CATEGORY_OPTIONS.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Quick Search & Display Mode Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Quick Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kata kunci Arab, terjemahan, atau nomor..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-md"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Display Mode Controls */}
          <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center text-xs font-bold shrink-0">
            <button
              onClick={() => setDisplayMode('all')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                displayMode === 'all'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setDisplayMode('arabic_only')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                displayMode === 'arabic_only'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Teks Arab
            </button>
            <button
              onClick={() => setDisplayMode('translation_only')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                displayMode === 'translation_only'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Terjemahan
            </button>
          </div>
        </div>

        {/* Checkbox Mass Action Toolbar */}
        {isEditable && filteredMahfudzot.length > 0 && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs bg-purple-50/50 p-2.5 rounded-xl border border-purple-100">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleSelectAll}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:border-purple-300 rounded-lg font-bold text-slate-700 transition-all cursor-pointer shadow-2xs"
              >
                {isAllSelected ? (
                  <CheckSquare size={16} className="text-purple-700" />
                ) : (
                  <Square size={16} className="text-slate-400" />
                )}
                <span>{isAllSelected ? 'Batalkan Semua' : 'Pilih Semua'} ({filteredMahfudzot.length})</span>
              </button>

              {selectedIds.length > 0 && (
                <span className="font-extrabold text-purple-900 px-2.5 py-1 bg-purple-100 rounded-lg">
                  {selectedIds.length} Mahfudzot Terpilih
                </span>
              )}
            </div>

            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={handleBulkDelete}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Trash2 size={15} />
                <span>Hapus Terpilih ({selectedIds.length})</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredMahfudzot.length === 0 && (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <BookOpen size={36} className="mx-auto text-slate-300" />
          <p className="font-bold text-slate-700 text-sm">Tidak ada Mahfudzot yang cocok</p>
          <p className="text-xs text-slate-400">
            Coba ubah kata kunci pencarian atau pilih kategori tag yang lain.
          </p>
        </div>
      )}

      {/* Flashcard View Mode */}
      {viewType === 'flashcard' && (
        <div className="p-6 bg-white rounded-3xl border-2 border-purple-200 shadow-md space-y-5">
          {/* Top Option: "Semua Materi" vs "Materi yang Dipilih Saja" */}
          <div className="p-3.5 bg-purple-50/80 rounded-2xl border border-purple-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-extrabold text-purple-950 flex items-center gap-1.5">
                <Sparkles size={15} className="text-purple-600" /> Sumber Flashcard Mahfudzot:
              </span>
              <div className="flex items-center bg-white p-1 rounded-xl border border-purple-300 text-xs font-bold gap-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => {
                    setFlashcardScope('all');
                    setMahfudzotCardIndex(0);
                    setIsMahfudzotFlipped(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    flashcardScope === 'all'
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'text-purple-900 hover:bg-purple-100'
                  }`}
                >
                  Semua Materi ({mahfudzotMateri.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFlashcardScope('selected');
                    setMahfudzotCardIndex(0);
                    setIsMahfudzotFlipped(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    flashcardScope === 'selected'
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'text-purple-900 hover:bg-purple-100'
                  }`}
                >
                  Materi yang Dipilih Saja ({selectedIds.length > 0 ? selectedIds.length : filteredMahfudzot.length})
                </button>
              </div>
            </div>

            {flashcardScope === 'selected' && (
              <span className="text-xs font-semibold text-purple-800">
                Kategori: <strong>{selectedCategory}</strong> {searchQuery && `• Pencarian: "${searchQuery}"`}
              </span>
            )}
          </div>

          {(() => {
            const rawDeck = flashcardScope === 'all'
              ? mahfudzotMateri
              : (selectedIds.length > 0 ? mahfudzotMateri.filter(m => selectedIds.includes(m.id)) : filteredMahfudzot);

            const activeDeck = isDeckShuffled && shuffledDeck ? shuffledDeck : rawDeck;

            if (activeDeck.length === 0) {
              return (
                <div className="p-8 text-center text-slate-400 font-medium text-xs">
                  Tidak ada data Mahfudzot untuk ditampilkan dalam Flashcard.
                </div>
              );
            }

            const safeIndex = mahfudzotCardIndex % activeDeck.length;

            return (
              <div className="max-w-xl mx-auto space-y-4">
                {/* Side Toggle & Shuffle Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-[11px]">
                    <button
                      type="button"
                      onClick={() => { setInitialFacing('arabic'); setIsMahfudzotFlipped(false); }}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        initialFacing === 'arabic' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Awal: Arab
                    </button>
                    <button
                      type="button"
                      onClick={() => { setInitialFacing('indonesia'); setIsMahfudzotFlipped(false); }}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        initialFacing === 'indonesia' ? 'bg-purple-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Awal: Indonesia
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setShuffledDeck([...rawDeck].sort(() => Math.random() - 0.5));
                        setIsDeckShuffled(true);
                        setMahfudzotCardIndex(0);
                        setIsMahfudzotFlipped(false);
                      }}
                      className="px-2.5 py-1 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-xl border border-purple-200 text-[11px] font-bold cursor-pointer"
                      title="Acak urutan kartu"
                    >
                      🔀 Acak Kartu
                    </button>
                    {isDeckShuffled && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsDeckShuffled(false);
                          setShuffledDeck(null);
                          setMahfudzotCardIndex(0);
                          setIsMahfudzotFlipped(false);
                        }}
                        className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-[11px] font-bold cursor-pointer"
                        title="Reset ke urutan asli"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Controls & Counter */}
                <div className="flex items-center justify-between text-xs font-bold text-purple-900">
                  <span className="bg-purple-100 text-purple-900 px-3 py-1 rounded-xl border border-purple-200">
                    Kartu {safeIndex + 1} dari {activeDeck.length} {isDeckShuffled ? '(Diacak)' : flashcardScope === 'all' ? '(Semua)' : '(Dipilih)'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMahfudzotFlipped(false);
                        setMahfudzotCardIndex((prev) => (prev - 1 + activeDeck.length) % activeDeck.length);
                      }}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl border shadow-2xs font-bold text-xs cursor-pointer"
                    >
                      ← Prev
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMahfudzotFlipped(false);
                        setMahfudzotCardIndex((prev) => (prev + 1) % activeDeck.length);
                      }}
                      className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl shadow-2xs font-bold text-xs cursor-pointer"
                    >
                      Next →
                    </button>
                  </div>
                </div>

                {/* Interactive Card */}
                {(() => {
                  const item = activeDeck[safeIndex];
                  const arabic = item?.mahfudzot?.arabic || item?.content || '';
                  const translation = item?.mahfudzot?.translation || item?.description || '';
                  const categoryTag = getItemCategory(item);

                  const showArabicFirst = initialFacing === 'arabic';
                  const isShowingArabic = showArabicFirst ? !isMahfudzotFlipped : isMahfudzotFlipped;

                  return (
                    <div
                      onClick={() => setIsMahfudzotFlipped(!isMahfudzotFlipped)}
                      className={`relative w-full min-h-[280px] rounded-3xl border-2 p-8 flex flex-col items-center justify-center text-center space-y-4 cursor-pointer transition-all duration-300 shadow-2xl overflow-hidden ${
                        isMahfudzotFlipped
                          ? 'bg-gradient-to-br from-slate-950 via-fuchsia-950 to-purple-950 border-purple-400/60 shadow-purple-950/60'
                          : 'bg-gradient-to-br from-purple-900 via-violet-950 to-slate-950 border-purple-300/60 shadow-purple-950/60 hover:scale-[1.01]'
                      }`}
                    >
                      {/* Decorative ambient background light */}
                      <div className={`absolute -top-16 -right-16 w-40 h-40 rounded-full blur-2xl pointer-events-none ${isMahfudzotFlipped ? 'bg-fuchsia-500/20' : 'bg-purple-400/20'}`} />
                      <div className={`absolute -bottom-16 -left-16 w-40 h-40 rounded-full blur-2xl pointer-events-none ${isMahfudzotFlipped ? 'bg-purple-500/20' : 'bg-violet-400/20'}`} />

                      <div className="absolute top-4 right-4 z-10 text-[10px] font-extrabold text-purple-200 bg-slate-950/70 border border-purple-500/40 px-3 py-1 rounded-full backdrop-blur-md">
                        Klik Kartu untuk Membalik 🔄
                      </div>

                      <div className="absolute top-4 left-4 z-10">
                        <span className={`px-3 py-1 border text-[11px] font-extrabold rounded-full backdrop-blur-md shadow-sm ${getCategoryBadgeClass(categoryTag)}`}>
                          {categoryTag}
                        </span>
                      </div>

                      {isShowingArabic ? (
                        <div className="space-y-4 pt-6 my-auto z-10">
                          <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-purple-300 bg-purple-950/80 px-3.5 py-1 rounded-full border border-purple-500/40">
                            Bahasa Arab & Pelafalan
                          </span>
                          <p className="font-arabic text-3xl sm:text-4xl font-extrabold text-amber-200 leading-relaxed dir-rtl drop-shadow-xl my-2">
                            {arabic}
                          </p>
                          <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                            <AudioPlayerButton arabicText={arabic} size="md" />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4 pt-6 my-auto z-10 animate-fadeIn">
                          <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-purple-300 bg-purple-950/80 px-3.5 py-1 rounded-full border border-purple-500/40">
                            Arti / Terjemahan Mahfudzot
                          </span>
                          <p className="text-xl sm:text-2xl font-extrabold text-white max-w-lg leading-relaxed drop-shadow-md">
                            "{translation}"
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            );
          })()}
        </div>
      )}

      {/* Mahfudzot Cards Grouped per 10 Items */}
      {viewType === 'tabel' && filteredMahfudzot.length > 0 && (
        <div className="space-y-6">
          {Array.from({ length: totalGroups }).map((_, groupIdx) => {
            const startIdx = groupIdx * 10;
            const groupItems = filteredMahfudzot.slice(startIdx, startIdx + 10);
            const isGroupCollapsed = collapsedGroups.has(groupIdx);
            const startNum = startIdx + 1;
            const endNum = startIdx + groupItems.length;

            return (
              <div key={groupIdx} className="space-y-3">
                {/* Group Header Banner */}
                <div className="p-3.5 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-2xl border border-purple-700/60 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-black rounded-xl">
                      Kelompok #{groupIdx + 1}
                    </span>
                    <h4 className="font-extrabold text-xs sm:text-sm text-white">
                      Mahfudzot No. {startNum} - {endNum} ({groupItems.length} Kata Mutiara)
                    </h4>
                  </div>

                  <button
                    onClick={() => toggleGroupCollapse(groupIdx)}
                    className="px-3 py-1.5 bg-purple-950/80 hover:bg-purple-800/80 text-purple-200 border border-purple-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    {isGroupCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                    <span>{isGroupCollapsed ? 'Buka Kelompok' : 'Minimize (10 Item)'}</span>
                  </button>
                </div>

                {/* Collapsible Grid of Cards */}
                {!isGroupCollapsed && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                    {groupItems.map((materi, index) => {
                      const absoluteIndex = startIdx + index;
                      const number = materi.mahfudzot?.number || materi.babNumber || (absoluteIndex + 1);
                      const arabicText = materi.mahfudzot?.arabic || materi.content;
                      const translationText = materi.mahfudzot?.translation || materi.description;
                      const categoryTag = getItemCategory(materi);
                      const badgeClass = getCategoryBadgeClass(categoryTag);
                      const isSelected = selectedIds.includes(materi.id);

                      const chk = teacherMahfudzotState?.[materi.id];
                      const isTeacherVerified = !!(chk && (chk.hafalanArab || chk.hafalanTerjemah || chk.pengetahuanKosakata || chk.pemahamanMateri || chk.kelancaran || chk.tajwid));
                      const isFullyVerified = !!(chk && chk.hafalanArab && chk.hafalanTerjemah && chk.pengetahuanKosakata && chk.pemahamanMateri);
                      const isSelfMarked = !!selfMahfudzotState?.[materi.id];

                      let cardStyleClass = 'bg-white border-slate-200 shadow-xs hover:border-purple-300 hover:shadow-md';
                      if (isSelected) {
                        cardStyleClass = 'bg-purple-50/50 border-purple-500 ring-2 ring-purple-500/30 shadow-md';
                      } else if (isTeacherVerified) {
                        cardStyleClass = 'bg-purple-100/90 border-purple-400 shadow-md text-purple-950 font-medium';
                      } else if (isSelfMarked) {
                        cardStyleClass = 'bg-indigo-100/90 border-indigo-300 shadow-md text-indigo-950 font-medium';
                      }

                      return (
                        <div
                          key={materi.id}
                          className={`rounded-2xl border transition-all p-5 flex flex-col justify-between relative space-y-4 ${cardStyleClass}`}
                        >
                          {/* Card Header */}
                          <div className="flex items-center justify-between border-b border-slate-100/80 pb-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              {isEditable && (
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelectItem(materi.id)}
                                  className="w-4 h-4 text-purple-700 bg-slate-100 border-slate-300 rounded focus:ring-purple-500 cursor-pointer"
                                  title="Pilih Mahfudzot untuk hapus massal"
                                />
                              )}
                              <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 border border-purple-200 text-xs font-black rounded-full">
                                No. {number}
                              </span>
                              <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-lg border ${badgeClass}`}>
                                {categoryTag}
                              </span>
                              {isFullyVerified ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black text-[10px] rounded-lg shadow-2xs border border-amber-200" title="Tuntas Diverifikasi Guru (4/4 Kriteria)">
                                  <Crown size={12} className="fill-slate-950 text-slate-950" /> 100% Diverifikasi
                                </span>
                              ) : isTeacherVerified ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded-lg shadow-2xs border border-amber-300" title="Diverifikasi Guru">
                                  <Crown size={11} className="fill-slate-950 text-slate-950" /> Verified Guru
                                </span>
                              ) : null}
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleSpeak(arabicText)}
                                className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                                title="Dengarkan Pengucapan Arab"
                              >
                                <Volume2 size={16} />
                              </button>

                              {isEditable && (
                                <>
                                  <button
                                    onClick={() => onEditMateri(materi)}
                                    className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                                    title="Edit Mahfudzot"
                                  >
                                    <Edit3 size={16} />
                                  </button>
                                  <button
                                    onClick={() => onDeleteMateri(materi.id)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                                    title="Hapus Mahfudzot"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Body Content */}
                          <div className="space-y-3.5 my-auto py-1">
                            {/* Arabic Text */}
                            {displayMode !== 'translation_only' ? (
                              <p className="font-arabic text-2xl sm:text-3xl font-extrabold text-slate-900 leading-relaxed text-right dir-rtl">
                                {arabicText}
                              </p>
                            ) : (
                              <div className="p-2.5 bg-slate-50 rounded-xl text-center text-slate-400 italic text-xs">
                                (Teks Arab Disembunyikan)
                              </div>
                            )}

                            {/* Translation Text */}
                            {displayMode !== 'arabic_only' ? (
                              <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-100/80 text-xs font-medium text-slate-800 leading-relaxed space-y-1">
                                <span className="font-bold text-purple-800 text-[11px] block uppercase tracking-wide">
                                  Terjemahan:
                                </span>
                                <p className="font-semibold text-slate-900 text-xs sm:text-sm">"{translationText}"</p>
                              </div>
                            ) : (
                              <div className="p-2 text-center text-slate-300 italic text-xs">
                                (Terjemahan Disembunyikan)
                              </div>
                            )}
                          </div>

                          {/* Card Footer Status / Student Toggle */}
                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                            <div>
                              {isTeacherVerified ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-2xs border border-amber-300">
                                  <Crown size={14} className="fill-slate-950 text-slate-950" /> Diceklis Guru
                                </span>
                              ) : isSelfMarked ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-2xs">
                                  <Bookmark size={13} /> Hafal (Siswa)
                                </span>
                              ) : (
                                <span className="text-slate-400 font-medium text-xs">Belum Dihafal</span>
                              )}
                            </div>

                            {onToggleSelfMahfudzot && !isTeacherVerified && (
                              <button
                                type="button"
                                onClick={() => onToggleSelfMahfudzot(materi.id)}
                                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                                  isSelfMarked
                                    ? 'bg-indigo-200 hover:bg-indigo-300 text-indigo-950 border border-indigo-300'
                                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200'
                                }`}
                                title="Tandai Sudah Hafal (Siswa - 0 XP)"
                              >
                                <Bookmark size={13} className="text-indigo-600" />
                                <span>{isSelfMarked ? 'Batalkan Tanda' : 'Tandai Hafal'}</span>
                              </button>
                            )}
                          </div>
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
  );
};
