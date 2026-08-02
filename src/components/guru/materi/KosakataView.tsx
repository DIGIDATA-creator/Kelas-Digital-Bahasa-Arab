import React, { useState } from 'react';
import { Materi, VocabularyItem } from '../../../types';
import { KosakataTableView } from './KosakataTableView';
import { AudioPlayerButton } from '../../common/AudioPlayerButton';
import { List, Search, Play, LayoutGrid, X, Sparkles, Volume2, RotateCw, ChevronLeft, ChevronRight, Shuffle } from 'lucide-react';

interface KosakataViewProps {
  materiList: Materi[];
  selectedMateriId?: string;
  onEditMateri?: (materi: Materi) => void;
  onDeleteMateri?: (id: string) => void;
  onDeleteVocabItem?: (materiId: string, vocabId: string) => void;
  onAddMateri?: () => void;
  isEditable?: boolean;
}

export const KosakataView: React.FC<KosakataViewProps> = ({
  materiList,
  selectedMateriId,
  onEditMateri,
  onDeleteMateri,
  onDeleteVocabItem,
  onAddMateri,
  isEditable = true,
}) => {
  const kosakataMateri = materiList.filter(m => m.category === 'kosakata');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Global View Type: 'tabel' | 'flashcard'
  const [viewType, setViewType] = useState<'tabel' | 'flashcard'>('tabel');

  // Flashcard Scope: 'all' | 'selected'
  const [flashcardScope, setFlashcardScope] = useState<'all' | 'selected'>('selected');
  const [activeBabId, setActiveBabId] = useState<string>(
    selectedMateriId || kosakataMateri[0]?.id || ''
  );

  // Flashcard Player State
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Filter materials by search query
  const filteredMateri = kosakataMateri.filter(m =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.arabicTitle && m.arabicTitle.includes(searchQuery)) ||
    (m.vocabularies && m.vocabularies.some(v =>
      v.word.includes(searchQuery) || v.meaning.toLowerCase().includes(searchQuery.toLowerCase())
    ))
  );

  // Derive vocabulary lists for flashcard
  const activeMateriObj = kosakataMateri.find(m => m.id === activeBabId) || kosakataMateri[0];

  const flashcardDeck: { word: string; meaning: string; latin?: string; babTitle: string; babNum: number }[] = (() => {
    if (flashcardScope === 'all') {
      const all: { word: string; meaning: string; latin?: string; babTitle: string; babNum: number }[] = [];
      kosakataMateri.forEach(m => {
        (m.vocabularies || []).forEach(v => {
          all.push({
            word: v.word,
            meaning: v.meaning,
            latin: v.latin,
            babTitle: m.title,
            babNum: m.babNumber || 1,
          });
        });
      });
      return all;
    } else {
      const source = activeMateriObj ? (activeMateriObj.vocabularies || []) : [];
      return source.map(v => ({
        word: v.word,
        meaning: v.meaning,
        latin: v.latin,
        babTitle: activeMateriObj?.title || '',
        babNum: activeMateriObj?.babNumber || 1,
      }));
    }
  })();

  const currentCard = flashcardDeck[cardIndex];

  const handleShuffleDeck = () => {
    if (flashcardDeck.length <= 1) return;
    const randomIndex = Math.floor(Math.random() * flashcardDeck.length);
    setCardIndex(randomIndex);
    setIsFlipped(false);
  };

  if (kosakataMateri.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs font-medium space-y-3">
        <List size={32} className="mx-auto text-slate-300" />
        <p>Belum ada materi Kosakata. Klik "Tambah Materi KOSAKATA" untuk menambahkan.</p>
        {isEditable && onAddMateri && (
          <button
            onClick={onAddMateri}
            className="px-4 py-2 bg-teal-600 text-white font-bold rounded-xl text-xs hover:bg-teal-700 transition-colors"
          >
            Tambah Paket Kosakata
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* 1. Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari kata kunci kosakata (Arab, Indonesia, atau judul bab)..."
          className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-teal-500 shadow-2xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* 2. Di Atas Materi Di Bawah Pencarian: Tombol Switcher Mode Tampilan */}
      <div className="p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
            Mode Tampilan Kosakata:
          </span>
          <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center text-xs font-bold gap-1">
            <button
              type="button"
              onClick={() => setViewType('tabel')}
              className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewType === 'tabel'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid size={14} /> Tabel Kosakata
            </button>
            <button
              type="button"
              onClick={() => {
                setViewType('flashcard');
                setCardIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewType === 'flashcard'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Play size={14} /> Flashcard Interaktif
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Total <strong>{kosakataMateri.length} Bab Kosakata</strong>
        </div>
      </div>

      {/* 3. FLASHCARD VIEW MODE */}
      {viewType === 'flashcard' && (
        <div className="bg-white rounded-2xl border-2 border-teal-200 shadow-sm p-5 space-y-5">
          {/* Top Selection: "Semua Materi" vs "Materi yang Dipilih Saja" */}
          <div className="p-3.5 bg-teal-50/80 rounded-xl border border-teal-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-extrabold text-teal-950 flex items-center gap-1.5">
                <Sparkles size={15} className="text-teal-600" /> Sumber Flashcard Kosakata:
              </span>
              <div className="flex items-center bg-white p-1 rounded-xl border border-teal-300 text-xs font-bold gap-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => {
                    setFlashcardScope('all');
                    setCardIndex(0);
                    setIsFlipped(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    flashcardScope === 'all'
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'text-teal-900 hover:bg-teal-100'
                  }`}
                >
                  Semua Materi
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFlashcardScope('selected');
                    setCardIndex(0);
                    setIsFlipped(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    flashcardScope === 'selected'
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'text-teal-900 hover:bg-teal-100'
                  }`}
                >
                  Materi yang Dipilih Saja
                </button>
              </div>
            </div>

            {/* Dropdown Bab when 'selected' is active */}
            {flashcardScope === 'selected' && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Pilih Bab:</span>
                <select
                  value={activeBabId}
                  onChange={(e) => {
                    setActiveBabId(e.target.value);
                    setCardIndex(0);
                    setIsFlipped(false);
                  }}
                  className="px-3 py-1.5 bg-white border border-teal-300 rounded-xl text-xs font-bold text-teal-950 focus:outline-hidden focus:ring-2 focus:ring-teal-500 shadow-2xs"
                >
                  {kosakataMateri.map((m) => (
                    <option key={m.id} value={m.id}>
                      Bab {m.babNumber || 1}: {m.title} ({m.vocabularies?.length || 0} kata)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Flashcard Body Player */}
          {flashcardDeck.length === 0 ? (
            <div className="p-8 text-center text-slate-400 font-medium text-xs">
              Belum ada data kosakata pada bab ini untuk dijadikan Flashcard.
            </div>
          ) : (
            <div className="max-w-xl mx-auto space-y-4">
              {/* Header Info & Card Controls */}
              <div className="flex items-center justify-between text-xs font-bold text-teal-950">
                <span className="bg-teal-100 text-teal-900 px-3.5 py-1.5 rounded-xl border border-teal-200 shadow-2xs">
                  Kartu {cardIndex + 1} dari {flashcardDeck.length} {flashcardScope === 'all' ? '(Gabungan Semua Bab)' : `(Bab ${currentCard?.babNum})`}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleShuffleDeck}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 font-bold text-xs flex items-center gap-1 cursor-pointer"
                    title="Acak Urutan Kartu"
                  >
                    <Shuffle size={14} /> Acak
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsFlipped(false);
                      setCardIndex((prev) => (prev - 1 + flashcardDeck.length) % flashcardDeck.length);
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl border border-slate-200 font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft size={14} /> Prev
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsFlipped(false);
                      setCardIndex((prev) => (prev + 1) % flashcardDeck.length);
                    }}
                    className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Interactive Flip Card */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className={`relative w-full min-h-[280px] rounded-3xl border-2 p-8 flex flex-col items-center justify-center text-center space-y-4 cursor-pointer transition-all duration-300 shadow-2xl overflow-hidden ${
                  isFlipped
                    ? 'bg-gradient-to-br from-slate-950 via-sky-950 to-cyan-950 border-sky-400/60 shadow-sky-950/60'
                    : 'bg-gradient-to-br from-teal-800 via-teal-900 to-emerald-950 border-teal-300/60 shadow-teal-950/60 hover:scale-[1.01]'
                }`}
              >
                {/* Decorative ambient background light */}
                <div className={`absolute -top-16 -right-16 w-40 h-40 rounded-full blur-2xl pointer-events-none ${isFlipped ? 'bg-sky-500/20' : 'bg-teal-400/20'}`} />
                <div className={`absolute -bottom-16 -left-16 w-40 h-40 rounded-full blur-2xl pointer-events-none ${isFlipped ? 'bg-cyan-500/20' : 'bg-emerald-400/20'}`} />

                <div className="absolute top-4 right-4 z-10 text-[10px] font-extrabold text-teal-200 bg-slate-950/70 border border-teal-500/40 px-3 py-1 rounded-full backdrop-blur-md">
                  Klik Kartu untuk Membalik 🔄
                </div>

                {!isFlipped ? (
                  <div className="space-y-4 my-auto z-10">
                    <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-teal-300 bg-teal-950/80 px-3.5 py-1 rounded-full border border-teal-500/40">
                      Bahasa Arab (Kosakata)
                    </span>
                    <p className="font-arabic text-4xl sm:text-5xl font-extrabold text-amber-200 dir-rtl my-3 leading-relaxed drop-shadow-xl">
                      {currentCard?.word}
                    </p>
                    <div className="flex justify-center pt-1" onClick={(e) => e.stopPropagation()}>
                      <AudioPlayerButton arabicText={currentCard?.word || ''} size="md" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 my-auto z-10 animate-fadeIn">
                    <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-sky-300 bg-sky-950/80 px-3.5 py-1 rounded-full border border-sky-500/40">
                      Terjemahan Indonesia
                    </span>
                    <p className="text-2xl sm:text-3xl font-black text-white my-2 tracking-tight drop-shadow-md">
                      "{currentCard?.meaning}"
                    </p>
                    {currentCard?.latin && (
                      <span className="inline-block px-3 py-1 bg-slate-900/80 border border-sky-500/30 text-sky-300 text-xs italic font-medium rounded-full shadow-inner">
                        Pelafalan Latin: ({currentCard.latin})
                      </span>
                    )}
                    <p className="text-xs font-extrabold text-teal-300 pt-1">
                      {currentCard?.babTitle}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. TABLE VIEW MODE */}
      {viewType === 'tabel' && (
        <div className="space-y-6">
          {filteredMateri.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs font-medium">
              Tidak ada bab kosakata yang sesuai dengan pencarian "{searchQuery}".
            </div>
          ) : (
            filteredMateri.map((materi) => (
              <KosakataTableView
                key={materi.id}
                title={materi.title}
                arabicTitle={materi.arabicTitle}
                babNumber={materi.babNumber}
                vocabularies={materi.vocabularies || []}
                onEditItem={onEditMateri ? () => onEditMateri(materi) : undefined}
                onDeleteMateri={onDeleteMateri ? () => onDeleteMateri(materi.id) : undefined}
                onDeleteItem={onDeleteVocabItem ? (vocabId) => onDeleteVocabItem(materi.id, vocabId) : undefined}
                onAddItem={onEditMateri ? () => onEditMateri(materi) : undefined}
                isEditable={isEditable}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};
