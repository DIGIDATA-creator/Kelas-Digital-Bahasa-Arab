import React, { useState } from 'react';
import { Materi, DialogueTurnPair } from '../../../types';
import { toArabicNumber } from '../../common/ArabicUtils';
import { AudioPlayerButton } from '../../common/AudioPlayerButton';
import { FlashcardModal, FlashcardItem } from '../../common/FlashcardModal';
import { MessageSquare, Edit3, Trash2, Plus, Volume2, Sparkles, Layers, ChevronDown, ChevronUp, Download, Eye, EyeOff, FileText, Printer, Focus, HelpCircle, Play, Video, Search, X, LayoutGrid, Shuffle, ChevronLeft, ChevronRight } from 'lucide-react';

interface HiwarViewProps {
  materiList: Materi[];
  onEditMateri?: (materi: Materi) => void;
  onDeleteMateri?: (id: string) => void;
  onAddMateri?: () => void;
  isEditable?: boolean;
}

export const HiwarView: React.FC<HiwarViewProps> = ({
  materiList,
  onEditMateri,
  onDeleteMateri,
  onAddMateri,
  isEditable = true,
}) => {
  const hiwarMateri = materiList.filter(m => m.category === 'hiwar');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Global View Type: 'tabel' | 'flashcard'
  const [globalViewType, setGlobalViewType] = useState<'tabel' | 'flashcard'>('tabel');

  // Flashcard Scope: 'all' | 'selected'
  const [flashcardScope, setFlashcardScope] = useState<'all' | 'selected'>('selected');
  const [selectedHiwarId, setSelectedHiwarId] = useState<string>(
    hiwarMateri[0]?.id || ''
  );

  // Global Flashcard Player State
  const [globalCardIndex, setGlobalCardIndex] = useState(0);
  const [isGlobalCardFlipped, setIsGlobalCardFlipped] = useState(false);

  // B.2 Minimize state per materi ID
  const [minimizedMateriIds, setMinimizedMateriIds] = useState<Set<string>>(new Set());

  // B.4 Display filter mode: 'semua' | 'arab' | 'terjemah'
  const [displayMode, setDisplayMode] = useState<'semua' | 'arab' | 'terjemah'>('semua');

  // Mode Fokus: Sembunyikan terjemahan sementara untuk latihan mandiri
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [revealedTurnIds, setRevealedTurnIds] = useState<Set<string>>(new Set());

  // Flashcard modal state
  const [flashcardOpen, setFlashcardOpen] = useState(false);
  const [flashcardTitle, setFlashcardTitle] = useState('');
  const [flashcardItems, setFlashcardItems] = useState<FlashcardItem[]>([]);

  // View Mode per materi state ('dialog' | 'flashcard')
  const [viewTypePerMateri, setViewTypePerMateri] = useState<Record<string, 'dialog' | 'flashcard'>>({});
  const [cardIndexPerMateri, setCardIndexPerMateri] = useState<Record<string, number>>({});
  const [isFlippedPerMateri, setIsFlippedPerMateri] = useState<Record<string, boolean>>({});

  // Filter Hiwar materials by search query
  const filteredHiwarMateri = hiwarMateri.filter(m =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.arabicTitle && m.arabicTitle.includes(searchQuery)) ||
    (m.description && m.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleLaunchFlashcard = (materi: Materi, pairs: DialogueTurnPair[]) => {
    const items: FlashcardItem[] = pairs.map((p, idx) => ({
      id: p.id || `pair-${idx}`,
      frontArabic: p.arabic1,
      backTranslation: p.translation2 || p.translation1,
      latin: p.arabic2,
      number: idx + 1,
      speaker1Name: p.speaker1,
      speaker2Name: p.speaker2,
      frontSubtext: p.translation2 || p.translation1,
      backArabic: p.arabic2,
    }));

    setFlashcardTitle(`Flashcard Hiwar: ${materi.title} (Bab ${materi.babNumber || 1} Level ${materi.hiwarLevelNumber || 1})`);
    setFlashcardItems(items);
    setFlashcardOpen(true);
  };

  const togglePeekTurn = (id: string) => {
    setRevealedTurnIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleMinimize = (id: string) => {
    setMinimizedMateriIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // B.3 Download / Print PDF Hiwar
  const handlePrintPdfHiwar = (materi: Materi, pairs: DialogueTurnPair[]) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Gagal membuka jendela cetak. Pastikan pop-up dibolehkan pada browser.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>Modul Hiwar - ${materi.title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');
          body { font-family: 'Plus Jakarta Sans', sans-serif; padding: 30px; color: #1e293b; background: #fff; }
          .header { text-align: center; border-bottom: 2px solid #0284c7; padding-bottom: 15px; margin-bottom: 25px; }
          .title { font-size: 24px; font-weight: bold; color: #0f172a; margin: 0; }
          .arabic-title { font-family: 'Amiri', serif; font-size: 28px; color: #0369a1; margin: 5px 0; }
          .meta { font-size: 12px; color: #64748b; }
          .turn-card { border: 1px solid #cbd5e1; border-radius: 12px; padding: 15px; margin-bottom: 15px; background: #f8fafc; page-break-inside: avoid; }
          .turn-title { font-size: 13px; font-weight: bold; color: #0369a1; margin-bottom: 10px; text-align: right; }
          .pair-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; direction: rtl; }
          .box-right { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 12px; }
          .box-left { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 12px; }
          .speaker-label { font-family: 'Amiri', serif; font-weight: bold; font-size: 16px; margin-bottom: 5px; }
          .arabic-text { font-family: 'Amiri', serif; font-size: 22px; font-weight: bold; line-height: 1.8; margin-bottom: 6px; text-align: right; }
          .trans-text { font-size: 12px; color: #475569; font-style: italic; border-top: 1px solid #e2e8f0; pt: 5px; }
          .footer { text-align: center; margin-top: 40px; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="meta">Modul Pembelajaran Bahasa Arab - Percakapan (الْحِوَارُ)</div>
          <h1 class="title">${materi.title}</h1>
          ${materi.arabicTitle ? `<div class="arabic-title">${materi.arabicTitle}</div>` : ''}
          <div class="meta">Bab ${materi.babNumber || 1} • Level ${materi.hiwarLevelNumber || 1} • Penyusun: ${materi.authorName}</div>
        </div>

        ${pairs.map((p, i) => `
          <div class="turn-card">
            <div class="turn-title">Percakapan #${p.turnNumber || i + 1}</div>
            <div class="pair-grid">
              <div class="box-right">
                <div class="speaker-label" style="color: #0369a1;">${p.speaker1} (سُؤَالٌ)</div>
                <div class="arabic-text">${p.arabic1}</div>
                <div class="trans-text">"${p.translation1}"</div>
              </div>
              <div class="box-left">
                <div class="speaker-label" style="color: #047857;">${p.speaker2} (جَوَابٌ)</div>
                <div class="arabic-text">${p.arabic2}</div>
                <div class="trans-text">"${p.translation2}"</div>
              </div>
            </div>
          </div>
        `).join('')}

        <div class="footer">
          LMS Bahasa Arab Digital • Diunduh pada ${new Date().toLocaleDateString('id-ID')}
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // Build combined or selected dialogue turns for global flashcard deck
  const activeHiwarObj = hiwarMateri.find(m => m.id === selectedHiwarId) || hiwarMateri[0];

  const getPairsForMateri = (m: Materi): DialogueTurnPair[] => {
    if (m.dialoguePairs && m.dialoguePairs.length > 0) return m.dialoguePairs;
    if (m.dialogues && m.dialogues.length > 0) {
      const list: DialogueTurnPair[] = [];
      for (let i = 0; i < m.dialogues.length; i += 2) {
        const d1 = m.dialogues[i];
        const d2 = m.dialogues[i + 1];
        list.push({
          id: `p-${i}`,
          turnNumber: list.length + 1,
          speaker1: d1 ? d1.speaker : 'سُؤَالٌ',
          arabic1: d1 ? d1.arabic : '',
          translation1: d1 ? d1.translation : '',
          speaker2: d2 ? d2.speaker : 'جَوَابٌ',
          arabic2: d2 ? d2.arabic : '',
          translation2: d2 ? d2.translation : '',
        });
      }
      return list;
    }
    return [];
  };

  const globalFlashcardDeck: {
    turnNumber: number;
    speaker1: string;
    arabic1: string;
    translation1: string;
    speaker2: string;
    arabic2: string;
    translation2: string;
    babTitle: string;
    babNum: number;
  }[] = (() => {
    if (flashcardScope === 'all') {
      const all: {
        turnNumber: number;
        speaker1: string;
        arabic1: string;
        translation1: string;
        speaker2: string;
        arabic2: string;
        translation2: string;
        babTitle: string;
        babNum: number;
      }[] = [];
      hiwarMateri.forEach(m => {
        const pairs = getPairsForMateri(m);
        pairs.forEach((p, idx) => {
          all.push({
            turnNumber: p.turnNumber || idx + 1,
            speaker1: p.speaker1,
            arabic1: p.arabic1,
            translation1: p.translation1,
            speaker2: p.speaker2,
            arabic2: p.arabic2,
            translation2: p.translation2 || '',
            babTitle: m.title,
            babNum: m.babNumber || 1,
          });
        });
      });
      return all;
    } else {
      const targetObj = activeHiwarObj;
      if (!targetObj) return [];
      const pairs = getPairsForMateri(targetObj);
      return pairs.map((p, idx) => ({
        turnNumber: p.turnNumber || idx + 1,
        speaker1: p.speaker1,
        arabic1: p.arabic1,
        translation1: p.translation1,
        speaker2: p.speaker2,
        arabic2: p.arabic2,
        translation2: p.translation2 || '',
        babTitle: targetObj.title,
        babNum: targetObj.babNumber || 1,
      }));
    }
  })();

  const currentGlobalCard = globalFlashcardDeck[globalCardIndex];

  if (hiwarMateri.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs font-medium space-y-3">
        <MessageSquare size={32} className="mx-auto text-slate-300" />
        <p>Belum ada materi Hiwar (Percakapan). Klik "Tambah Materi HIWAR" untuk membuat baru.</p>
        {isEditable && onAddMateri && (
          <button
            onClick={onAddMateri}
            className="px-4 py-2 bg-sky-600 text-white font-bold rounded-xl text-xs hover:bg-sky-700 transition-colors"
          >
            Tambah Modul Hiwar
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari kata kunci percakapan Hiwar, judul bab, atau deskripsi..."
          className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-sky-500 shadow-2xs"
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

      {/* 2. Di Atas Materi Di Bawah Pencarian: Tombol Switcher Mode Tampilan (Tabel/Dialog vs Flashcard) */}
      <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            Tampilan Hiwar:
          </span>
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center text-xs font-bold gap-1">
            <button
              type="button"
              onClick={() => setGlobalViewType('tabel')}
              className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                globalViewType === 'tabel'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <LayoutGrid size={14} /> Tabel / Dialog
            </button>
            <button
              type="button"
              onClick={() => {
                setGlobalViewType('flashcard');
                setGlobalCardIndex(0);
                setIsGlobalCardFlipped(false);
              }}
              className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                globalViewType === 'flashcard'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Play size={14} /> Flashcard Interaktif
            </button>
          </div>
        </div>

        {/* Focus & Display mode toggles when in Tabel mode */}
        {globalViewType === 'tabel' && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFocusMode(!isFocusMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                isFocusMode
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              {isFocusMode ? <EyeOff size={14} /> : <Focus size={14} />}
              <span>{isFocusMode ? 'Mode Fokus Aktif' : 'Mode Fokus'}</span>
            </button>

            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold gap-1 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => { setDisplayMode('semua'); setIsFocusMode(false); }}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  displayMode === 'semua' && !isFocusMode ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => { setDisplayMode('arab'); setIsFocusMode(true); }}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  (displayMode === 'arab' || isFocusMode) ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Teks Arab
              </button>
              <button
                onClick={() => { setDisplayMode('terjemah'); setIsFocusMode(false); }}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  displayMode === 'terjemah' && !isFocusMode ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Terjemahan
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Focus Mode Explanation Toast / Banner */}
      {isFocusMode && globalViewType === 'tabel' && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs font-semibold text-emerald-900 dark:text-emerald-300 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Sparkles size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              <strong>Mode Fokus Aktif:</strong> Teks terjemahan Bahasa Indonesia disembunyikan untuk melatih pemahaman bahasa Arab secara mandiri. Gunakan tombol <strong>"Intip Terjemahan"</strong> di tiap percakapan bila memerlukan bantuan arti.
            </span>
          </div>
          <button
            onClick={() => setIsFocusMode(false)}
            className="text-xs text-emerald-700 dark:text-emerald-400 underline font-bold hover:text-emerald-900 shrink-0 cursor-pointer"
          >
            Matikan
          </button>
        </div>
      )}

      {/* 3. FLASHCARD VIEW MODE */}
      {globalViewType === 'flashcard' && (
        <div className="bg-white rounded-2xl border-2 border-sky-200 shadow-sm p-5 space-y-5">
          {/* Top Selection: "Semua Materi" vs "Materi yang Dipilih Saja" */}
          <div className="p-3.5 bg-sky-50/80 rounded-xl border border-sky-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-extrabold text-sky-950 flex items-center gap-1.5">
                <Sparkles size={15} className="text-sky-600" /> Sumber Flashcard Hiwar:
              </span>
              <div className="flex items-center bg-white p-1 rounded-xl border border-sky-300 text-xs font-bold gap-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => {
                    setFlashcardScope('all');
                    setGlobalCardIndex(0);
                    setIsGlobalCardFlipped(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    flashcardScope === 'all'
                      ? 'bg-sky-700 text-white shadow-xs'
                      : 'text-sky-900 hover:bg-sky-100'
                  }`}
                >
                  Semua Materi
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFlashcardScope('selected');
                    setGlobalCardIndex(0);
                    setIsGlobalCardFlipped(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    flashcardScope === 'selected'
                      ? 'bg-sky-700 text-white shadow-xs'
                      : 'text-sky-900 hover:bg-sky-100'
                  }`}
                >
                  Materi yang Dipilih Saja
                </button>
              </div>
            </div>

            {/* Dropdown Bab when 'selected' is active */}
            {flashcardScope === 'selected' && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Pilih Bab Hiwar:</span>
                <select
                  value={selectedHiwarId}
                  onChange={(e) => {
                    setSelectedHiwarId(e.target.value);
                    setGlobalCardIndex(0);
                    setIsGlobalCardFlipped(false);
                  }}
                  className="px-3 py-1.5 bg-white border border-sky-300 rounded-xl text-xs font-bold text-sky-950 focus:outline-hidden focus:ring-2 focus:ring-sky-500 shadow-2xs"
                >
                  {hiwarMateri.map((m) => (
                    <option key={m.id} value={m.id}>
                      Bab {m.babNumber || 1}: {m.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Flashcard Player Body */}
          {globalFlashcardDeck.length === 0 ? (
            <div className="p-8 text-center text-slate-400 font-medium text-xs">
              Belum ada percakapan Hiwar untuk ditampilkan dalam Flashcard.
            </div>
          ) : (
            <div className="max-w-xl mx-auto space-y-4">
              {/* Controls Header */}
              <div className="flex items-center justify-between text-xs font-bold text-sky-950">
                <span className="bg-sky-100 text-sky-900 px-3.5 py-1.5 rounded-xl border border-sky-200 shadow-2xs">
                  Kartu {globalCardIndex + 1} dari {globalFlashcardDeck.length} {flashcardScope === 'all' ? '(Gabungan Semua Bab)' : `(Bab ${currentGlobalCard?.babNum})`}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (globalFlashcardDeck.length <= 1) return;
                      const rand = Math.floor(Math.random() * globalFlashcardDeck.length);
                      setGlobalCardIndex(rand);
                      setIsGlobalCardFlipped(false);
                    }}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 font-bold text-xs flex items-center gap-1 cursor-pointer"
                    title="Acak Urutan Kartu"
                  >
                    <Shuffle size={14} /> Acak
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsGlobalCardFlipped(false);
                      setGlobalCardIndex((prev) => (prev - 1 + globalFlashcardDeck.length) % globalFlashcardDeck.length);
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl border border-slate-200 font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft size={14} /> Prev
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsGlobalCardFlipped(false);
                      setGlobalCardIndex((prev) => (prev + 1) % globalFlashcardDeck.length);
                    }}
                    className="px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Interactive Flip Card */}
              <div
                onClick={() => setIsGlobalCardFlipped(!isGlobalCardFlipped)}
                className={`relative w-full min-h-[300px] rounded-3xl border-2 p-8 flex flex-col items-center justify-center text-center space-y-4 cursor-pointer transition-all duration-300 shadow-2xl overflow-hidden ${
                  isGlobalCardFlipped
                    ? 'bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 border-indigo-400/60 shadow-indigo-950/60'
                    : 'bg-gradient-to-br from-sky-900 via-blue-900 to-indigo-950 border-sky-300/60 shadow-sky-950/60 hover:scale-[1.01]'
                }`}
              >
                {/* Decorative ambient background light */}
                <div className={`absolute -top-16 -right-16 w-40 h-40 rounded-full blur-2xl pointer-events-none ${isGlobalCardFlipped ? 'bg-indigo-500/20' : 'bg-sky-400/20'}`} />
                <div className={`absolute -bottom-16 -left-16 w-40 h-40 rounded-full blur-2xl pointer-events-none ${isGlobalCardFlipped ? 'bg-purple-500/20' : 'bg-blue-400/20'}`} />

                <div className="absolute top-4 right-4 z-10 text-[10px] font-extrabold text-sky-200 bg-slate-950/70 border border-sky-500/40 px-3 py-1 rounded-full backdrop-blur-md">
                  Klik Kartu untuk Membalik 🔄
                </div>

                {!isGlobalCardFlipped ? (
                  <div className="space-y-4 my-auto w-full z-10">
                    <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-sky-300 bg-sky-950/80 px-3.5 py-1 rounded-full border border-sky-500/40">
                      Percakapan #${currentGlobalCard?.turnNumber} • {currentGlobalCard?.speaker1}
                    </span>
                    <p className="font-arabic text-3xl sm:text-5xl font-extrabold text-amber-200 dir-rtl my-3 leading-relaxed drop-shadow-xl">
                      {currentGlobalCard?.arabic1}
                    </p>
                    <div className="flex justify-center pt-1" onClick={(e) => e.stopPropagation()}>
                      <AudioPlayerButton arabicText={currentGlobalCard?.arabic1 || ''} size="md" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 my-auto w-full z-10 animate-fadeIn">
                    <div className="space-y-2 p-3.5 bg-slate-900/90 rounded-2xl border border-sky-500/40 text-left shadow-lg">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-400 block">
                        Arti Pertanyaan / Ungkapan ({currentGlobalCard?.speaker1}):
                      </span>
                      <p className="text-sm sm:text-base font-bold text-white">
                        "{currentGlobalCard?.translation1}"
                      </p>
                    </div>

                    {currentGlobalCard?.arabic2 && (
                      <div className="space-y-2 p-3.5 bg-emerald-950/80 rounded-2xl border border-emerald-500/40 text-right shadow-lg">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 block text-left">
                          Tanggapan / Jawaban ({currentGlobalCard?.speaker2}):
                        </span>
                        <p className="font-arabic text-xl sm:text-3xl font-extrabold text-amber-200 dir-rtl my-1 drop-shadow-md">
                          {currentGlobalCard?.arabic2}
                        </p>
                        {currentGlobalCard?.translation2 && (
                          <p className="text-xs text-emerald-200 font-medium italic pt-1 text-left">
                            "{currentGlobalCard?.translation2}"
                          </p>
                        )}
                      </div>
                    )}

                    <p className="text-xs font-extrabold text-indigo-300 pt-1">
                      {currentGlobalCard?.babTitle}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. TABEL / DIALOG VIEW MODE */}
      {globalViewType === 'tabel' && (
        filteredHiwarMateri.length === 0 ? (
          <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs font-medium">
            Tidak ada materi percakapan Hiwar yang sesuai dengan pencarian "{searchQuery}".
          </div>
        ) : (
          filteredHiwarMateri.map((materi) => {
        // Retrieve or parse dialogue pairs
        const pairs: DialogueTurnPair[] = (() => {
          if (materi.dialoguePairs && materi.dialoguePairs.length > 0) {
            return materi.dialoguePairs;
          }
          if (materi.dialogues && materi.dialogues.length > 0) {
            const list: DialogueTurnPair[] = [];
            for (let i = 0; i < materi.dialogues.length; i += 2) {
              const d1 = materi.dialogues[i];
              const d2 = materi.dialogues[i + 1];
              list.push({
                id: `p-${i}`,
                turnNumber: list.length + 1,
                speaker1: d1 ? d1.speaker : 'سُؤَالٌ',
                arabic1: d1 ? d1.arabic : '',
                translation1: d1 ? d1.translation : '',
                speaker2: d2 ? d2.speaker : 'جَوَابٌ',
                arabic2: d2 ? d2.arabic : '',
                translation2: d2 ? d2.translation : '',
              });
            }
            return list;
          }
          return [];
        })();

        const levelNum = materi.hiwarLevelNumber || 1;
        const isMinimized = minimizedMateriIds.has(materi.id);

        return (
          <div
            key={materi.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all space-y-0"
          >
            {/* Header Banner */}
            <div className="p-5 bg-gradient-to-r from-sky-950 via-slate-900 to-sky-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-sky-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 bg-sky-500/20 text-sky-300 border border-sky-400/30 text-[11px] font-black rounded-md">
                    Bab {materi.babNumber || 1}
                  </span>
                  <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-black rounded-md">
                    Level {levelNum}
                  </span>
                  <h3 className="font-extrabold text-base text-white tracking-tight">
                    {materi.title}
                  </h3>
                  {materi.arabicTitle && (
                    <span className="font-arabic text-lg font-bold text-sky-300">
                      ({materi.arabicTitle})
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300">
                  {materi.description || `Modul percakapan Bahasa Arab dengan ${pairs.length} dialog.`}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Mode Switcher: Dialog vs Flashcard */}
                <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 flex items-center text-xs font-bold gap-1 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setViewTypePerMateri(prev => ({ ...prev, [materi.id]: 'dialog' }))}
                    className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                      (viewTypePerMateri[materi.id] || 'dialog') === 'dialog'
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <MessageSquare size={13} /> Mode Dialog
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setViewTypePerMateri(prev => ({ ...prev, [materi.id]: 'flashcard' }));
                      setCardIndexPerMateri(prev => ({ ...prev, [materi.id]: 0 }));
                      setIsFlippedPerMateri(prev => ({ ...prev, [materi.id]: false }));
                    }}
                    className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                      viewTypePerMateri[materi.id] === 'flashcard'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Play size={13} /> Mode Flashcard
                  </button>
                </div>

                {/* Video Panduan Hiwar */}
                {materi.videoUrl && (
                  <a
                    href={materi.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all"
                    title="Buka Video Panduan Pembelajaran"
                  >
                    <Video size={14} /> Video Panduan
                  </a>
                )}

                {/* Flashcard Hiwar */}
                <button
                  onClick={() => handleLaunchFlashcard(materi, pairs)}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                  title="Mulai Mode Latihan Flashcard Hiwar"
                >
                  <Play size={14} className="fill-slate-950" /> Flashcard Hiwar
                </button>

                {/* B.3 Unduh PDF Hiwar */}
                <button
                  onClick={() => handlePrintPdfHiwar(materi, pairs)}
                  className="px-3 py-1.5 bg-sky-800 hover:bg-sky-700 text-sky-200 rounded-xl text-xs font-bold transition-all border border-sky-700 flex items-center gap-1.5 cursor-pointer"
                  title="Unduh / Cetak PDF Hiwar"
                >
                  <Printer size={15} /> Unduh PDF
                </button>

                {/* B.2 Minimize Toggle Button */}
                <button
                  onClick={() => toggleMinimize(materi.id)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-xl transition-colors border border-slate-700 flex items-center gap-1 text-xs font-bold"
                  title={isMinimized ? 'Buka Percakapan' : 'Minimize Percakapan'}
                >
                  {isMinimized ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                  <span className="hidden sm:inline">{isMinimized ? 'Buka' : 'Minimize'}</span>
                </button>

                {isEditable && (
                  <>
                    {onEditMateri && (
                      <button
                        onClick={() => onEditMateri(materi)}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-xl transition-colors border border-slate-700"
                        title="Edit Hiwar"
                      >
                        <Edit3 size={16} />
                      </button>
                    )}
                    {onDeleteMateri && (
                      <button
                        onClick={() => onDeleteMateri(materi.id)}
                        className="p-2 bg-slate-800 hover:bg-rose-900/50 text-rose-300 rounded-xl transition-colors border border-slate-700"
                        title="Hapus Hiwar"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* B.2 Collapsible Body Content */}
            {!isMinimized && (
              <div className="p-5 bg-slate-50 space-y-4 animate-fadeIn">
                {pairs.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs font-medium">
                    Belum ada dialog dalam percakapan ini.
                  </div>
                ) : viewTypePerMateri[materi.id] === 'flashcard' ? (
                  /* Inline Flashcard Mode for Hiwar */
                  <div className="p-6 bg-slate-100 rounded-2xl border border-slate-200 space-y-4">
                    <div className="max-w-xl mx-auto space-y-4">
                      {(() => {
                        const currentIdx = cardIndexPerMateri[materi.id] || 0;
                        const isFlipped = isFlippedPerMateri[materi.id] || false;
                        const currentPair = pairs[currentIdx] || pairs[0];

                        return (
                          <>
                            {/* Counter & Controls */}
                            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                              <span className="bg-sky-100 text-sky-900 px-3 py-1 rounded-xl border border-sky-200 shadow-2xs">
                                Percakapan #{currentIdx + 1} dari {pairs.length}
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsFlippedPerMateri(prev => ({ ...prev, [materi.id]: false }));
                                    setCardIndexPerMateri(prev => ({
                                      ...prev,
                                      [materi.id]: (currentIdx - 1 + pairs.length) % pairs.length,
                                    }));
                                  }}
                                  className="px-3.5 py-1.5 bg-white hover:bg-slate-200 text-slate-800 rounded-xl border shadow-2xs font-bold text-xs cursor-pointer"
                                >
                                  ← Prev
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsFlippedPerMateri(prev => ({ ...prev, [materi.id]: false }));
                                    setCardIndexPerMateri(prev => ({
                                      ...prev,
                                      [materi.id]: (currentIdx + 1) % pairs.length,
                                    }));
                                  }}
                                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-2xs font-bold text-xs cursor-pointer"
                                >
                                  Next →
                                </button>
                              </div>
                            </div>

                            {/* Flip Card Container */}
                            <div
                              onClick={() => setIsFlippedPerMateri(prev => ({ ...prev, [materi.id]: !isFlipped }))}
                              className="relative w-full min-h-[280px] bg-white rounded-3xl border-2 border-sky-300 shadow-md cursor-pointer transition-all hover:border-sky-500 hover:shadow-lg p-6 flex flex-col justify-center space-y-4"
                            >
                              <div className="absolute top-4 right-4 text-[10px] font-bold text-sky-700 bg-sky-100 px-3 py-1 rounded-full">
                                Klik Kartu untuk Membalik (Pertanyaan ↔ Jawaban) 🔄
                              </div>

                              {!isFlipped ? (
                                /* Front: Speaker 1 (Pertanyaan / Salam) */
                                <div className="space-y-3 pt-2">
                                  <div className="flex items-center justify-between border-b border-sky-100 pb-2">
                                    <span className="px-3 py-1 bg-sky-100 text-sky-900 font-arabic font-bold text-sm rounded-xl">
                                      🗣️ {currentPair.speaker1} (Pembicara 1)
                                    </span>
                                    {currentPair.arabic1 && (
                                      <div onClick={(e) => e.stopPropagation()}>
                                        <AudioPlayerButton arabicText={currentPair.arabic1} size="md" />
                                      </div>
                                    )}
                                  </div>
                                  <p className="font-arabic text-2xl sm:text-3xl font-bold text-slate-900 text-right dir-rtl leading-relaxed">
                                    {currentPair.arabic1}
                                  </p>
                                  {currentPair.translation1 && (
                                    <p className="text-xs text-slate-600 italic border-t border-slate-100 pt-2">
                                      "{currentPair.translation1}"
                                    </p>
                                  )}
                                </div>
                              ) : (
                                /* Back: Speaker 2 (Jawaban / Respon) */
                                <div className="space-y-3 pt-2">
                                  <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-900 font-arabic font-bold text-sm rounded-xl">
                                      💬 {currentPair.speaker2} (Pembicara 2)
                                    </span>
                                    {currentPair.arabic2 && (
                                      <div onClick={(e) => e.stopPropagation()}>
                                        <AudioPlayerButton arabicText={currentPair.arabic2} size="md" />
                                      </div>
                                    )}
                                  </div>
                                  <p className="font-arabic text-2xl sm:text-3xl font-bold text-slate-900 text-right dir-rtl leading-relaxed">
                                    {currentPair.arabic2}
                                  </p>
                                  {currentPair.translation2 && (
                                    <p className="text-xs text-slate-600 italic border-t border-slate-100 pt-2">
                                      "{currentPair.translation2}"
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                ) : (
                  pairs.map((pair, idx) => {
                    const turnNum = pair.turnNumber || idx + 1;
                    const arabicTurnNum = toArabicNumber(turnNum);
                    const turnKey = `${materi.id}-${pair.id || idx}`;
                    const isTurnRevealed = revealedTurnIds.has(turnKey);

                    // Determine whether translations should be visible
                    const showTranslation = isFocusMode || displayMode === 'arab'
                      ? isTurnRevealed
                      : (displayMode === 'semua' || displayMode === 'terjemah');

                    const showArabic = displayMode === 'semua' || displayMode === 'arab' || isFocusMode;

                    return (
                      <div
                        key={`${materi.id}-pair-${pair.id || idx}-${idx}`}
                        className={`bg-white dark:bg-slate-900 rounded-2xl border p-4 shadow-2xs space-y-3 transition-all ${
                          isFocusMode ? 'border-emerald-300 dark:border-emerald-800 ring-1 ring-emerald-500/10' : 'border-slate-200 dark:border-slate-800 hover:border-sky-300'
                        }`}
                      >
                        {/* Dialogue Number Badge & Peek Button */}
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                          <span className="px-3 py-1 bg-sky-100 dark:bg-sky-950/70 text-sky-900 dark:text-sky-300 font-extrabold text-xs rounded-xl flex items-center gap-1.5">
                            <MessageSquare size={13} className="text-sky-700 dark:text-sky-400" /> Percakapan #{turnNum} ({arabicTurnNum})
                          </span>

                          {/* Peek / Intip Terjemahan Toggle Button in Focus Mode */}
                          {(isFocusMode || displayMode === 'arab') && (
                            <button
                              type="button"
                              onClick={() => togglePeekTurn(turnKey)}
                              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
                                isTurnRevealed
                                  ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                              }`}
                              title="Intip terjemahan Bahasa Indonesia untuk kalimat ini"
                            >
                              {isTurnRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
                              <span>{isTurnRevealed ? 'Sembunyikan Terjemahan' : 'Intip Terjemahan 👁️'}</span>
                            </button>
                          )}
                        </div>

                        {/* B.1 Dialogue Exchange Pair with RTL Layout (Right: Pertanyaan / Pembicara 1, Left: Jawaban / Pembicara 2) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3" dir="rtl">
                          {/* Right Column (Pembicara 1 / Pertanyaan / Soal) */}
                          <div className="p-3.5 bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-800 rounded-xl space-y-2 text-right">
                            <div className="flex items-center justify-between" dir="ltr">
                              <span className="font-arabic font-extrabold text-sky-800 dark:text-sky-300 text-sm">
                                {pair.speaker1} <span className="text-[10px] font-normal text-sky-600 dark:text-sky-400">(سُؤَالٌ / Pertanyaan)</span>
                              </span>
                              <AudioPlayerButton arabicText={pair.arabic1} size="sm" />
                            </div>

                            {showArabic && (
                              <p className="font-arabic font-extrabold text-lg sm:text-xl text-slate-900 dark:text-slate-100 text-right leading-relaxed">
                                {pair.arabic1}
                              </p>
                            )}

                            {showTranslation ? (
                              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium italic border-t pt-1.5 border-sky-200/80 dark:border-sky-800/80 animate-fadeIn" dir="ltr">
                                "{pair.translation1}"
                              </p>
                            ) : (
                              isFocusMode && (
                                <p className="text-[11px] text-slate-400 dark:text-slate-500 italic border-t pt-1.5 border-sky-200/40 dark:border-sky-900/40 flex items-center gap-1" dir="ltr">
                                  <span>🔒 Terjemahan disembunyikan (Mode Fokus)</span>
                                </p>
                              )
                            )}
                          </div>

                          {/* Left Column (Pembicara 2 / Jawaban / Respon) */}
                          <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 rounded-xl space-y-2 text-right">
                            <div className="flex items-center justify-between" dir="ltr">
                              <span className="font-arabic font-extrabold text-emerald-800 dark:text-emerald-300 text-sm">
                                {pair.speaker2} <span className="text-[10px] font-normal text-emerald-600 dark:text-emerald-400">(جَوَابٌ / Jawaban)</span>
                              </span>
                              <AudioPlayerButton arabicText={pair.arabic2} size="sm" />
                            </div>

                            {showArabic && (
                              <p className="font-arabic font-extrabold text-lg sm:text-xl text-slate-900 dark:text-slate-100 text-right leading-relaxed">
                                {pair.arabic2}
                              </p>
                            )}

                            {showTranslation ? (
                              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium italic border-t pt-1.5 border-emerald-200/80 dark:border-emerald-800/80 animate-fadeIn" dir="ltr">
                                "{pair.translation2}"
                              </p>
                            ) : (
                              isFocusMode && (
                                <p className="text-[11px] text-slate-400 dark:text-slate-500 italic border-t pt-1.5 border-emerald-200/40 dark:border-emerald-900/40 flex items-center gap-1" dir="ltr">
                                  <span>🔒 Terjemahan disembunyikan (Mode Fokus)</span>
                                </p>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        );
      })
    )
  )}

      {/* Modal Flashcard Hiwar */}
      <FlashcardModal
        isOpen={flashcardOpen}
        onClose={() => setFlashcardOpen(false)}
        title={flashcardTitle}
        items={flashcardItems}
      />
    </div>
  );
};
