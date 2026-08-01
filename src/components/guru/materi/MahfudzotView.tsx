import React, { useState } from 'react';
import { Materi } from '../../../types';
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
  X
} from 'lucide-react';
import { exportMahfudzotToPdf } from '../../../utils/mahfudzotPdfExport';
import { resolveMahfudzotCategory } from '../../../data/mahfudzotData';

interface MahfudzotViewProps {
  materiList: Materi[];
  onEditMateri: (materi: Materi) => void;
  onDeleteMateri: (id: string) => void;
  onDeleteMultipleMateri?: (ids: string[]) => void;
  onLaunchFlashcards: (filteredList?: Materi[]) => void;
  onOpenSheetModal?: () => void;
  isEditable?: boolean;
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
}) => {
  const [displayMode, setDisplayMode] = useState<'all' | 'arabic_only' | 'translation_only'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
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

      {/* Mahfudzot Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMahfudzot.map((materi, index) => {
          const number = materi.mahfudzot?.number || materi.babNumber || (index + 1);
          const arabicText = materi.mahfudzot?.arabic || materi.content;
          const translationText = materi.mahfudzot?.translation || materi.description;
          const categoryTag = getItemCategory(materi);
          const badgeClass = getCategoryBadgeClass(categoryTag);
          const isSelected = selectedIds.includes(materi.id);

          return (
            <div
              key={materi.id}
              className={`rounded-2xl border transition-all p-5 flex flex-col justify-between relative space-y-4 ${
                isSelected
                  ? 'bg-purple-50/50 border-purple-500 ring-2 ring-purple-500/30 shadow-md'
                  : 'bg-white border-slate-200 shadow-xs hover:border-purple-300 hover:shadow-md'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
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
            </div>
          );
        })}
      </div>
    </div>
  );
};
