import React, { useState } from 'react';
import { Materi, DialogueTurnPair } from '../../../types';
import { toArabicNumber } from '../../common/ArabicUtils';
import { AudioPlayerButton } from '../../common/AudioPlayerButton';
import { FlashcardModal, FlashcardItem } from '../../common/FlashcardModal';
import { MessageSquare, Edit3, Trash2, Plus, Volume2, Sparkles, Layers, ChevronDown, ChevronUp, Download, Eye, EyeOff, FileText, Printer, Focus, HelpCircle, Play, Video } from 'lucide-react';

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

  // B.2 Minimize state per materi ID
  const [minimizedMateriIds, setMinimizedMateriIds] = useState<Set<string>>(new Set());

  // B.4 Display filter mode: 'semua' | 'arab' | 'terjemah'
  const [displayMode, setDisplayMode] = useState<'semua' | 'arab' | 'terjemah'>('semua');

  // Mode Fokus: Sembunyikan terjemahan sementara untuk latihan mandiri
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [revealedTurnIds, setRevealedTurnIds] = useState<Set<string>>(new Set());

  // Flashcard state
  const [flashcardOpen, setFlashcardOpen] = useState(false);
  const [flashcardTitle, setFlashcardTitle] = useState('');
  const [flashcardItems, setFlashcardItems] = useState<FlashcardItem[]>([]);

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

      {/* B.4 Display Mode & Focus Mode Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setIsFocusMode(!isFocusMode)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer ${
              isFocusMode
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-500/30'
                : 'bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
            }`}
          >
            {isFocusMode ? <EyeOff size={16} /> : <Focus size={16} />}
            <span>{isFocusMode ? '🎯 Mode Fokus Aktif' : '🎯 Mode Fokus (Sembunyikan Terjemahan)'}</span>
          </button>
          <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5 hidden sm:inline-flex">
            <Eye size={16} className="text-sky-600" /> Mode Tampilan:
          </span>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold gap-1">
          <button
            onClick={() => { setDisplayMode('semua'); setIsFocusMode(false); }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              displayMode === 'semua' && !isFocusMode
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Tampilkan Seluruh Percakapan
          </button>
          <button
            onClick={() => { setDisplayMode('arab'); setIsFocusMode(true); }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              (displayMode === 'arab' || isFocusMode)
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Hanya Teks Arab (Fokus)
          </button>
          <button
            onClick={() => { setDisplayMode('terjemah'); setIsFocusMode(false); }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              displayMode === 'terjemah' && !isFocusMode
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Hanya Terjemah
          </button>
        </div>
      </div>

      {/* Focus Mode Explanation Toast / Banner */}
      {isFocusMode && (
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

      {hiwarMateri.map((materi) => {
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
                        key={pair.id || idx}
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
      })}

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
