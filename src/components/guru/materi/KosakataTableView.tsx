import React, { useState } from 'react';
import { VocabularyItem } from '../../../types';
import { toArabicNumber } from '../../common/ArabicUtils';
import { AudioPlayerButton } from '../../common/AudioPlayerButton';
import { Eye, EyeOff, Layers, ChevronDown, ChevronUp, Edit3, Trash2, Plus, FileSpreadsheet, Play, LayoutGrid, CheckCircle2, Bookmark, Check, Award, Crown } from 'lucide-react';

interface KosakataTableViewProps {
  title: string;
  arabicTitle?: string;
  babNumber?: number;
  vocabularies: VocabularyItem[];
  onEditItem?: (item: VocabularyItem) => void;
  onDeleteItem?: (id: string) => void;
  onDeleteMateri?: () => void;
  onAddItem?: () => void;
  onLaunchFlashcard?: () => void;
  isEditable?: boolean;
  teacherKosakataState?: Record<string, boolean>;
  selfKosakataState?: Record<string, boolean>;
  onToggleSelfKosakata?: (vocabId: string) => void;
}

export const KosakataTableView: React.FC<KosakataTableViewProps> = ({
  title,
  arabicTitle,
  babNumber,
  vocabularies,
  onEditItem,
  onDeleteItem,
  onDeleteMateri,
  onAddItem,
  onLaunchFlashcard,
  isEditable = true,
  teacherKosakataState,
  selfKosakataState,
  onToggleSelfKosakata,
}) => {
  const [isMinimized, setIsMinimized] = useState(true);
  const [viewType, setViewType] = useState<'tabel' | 'flashcard'>('tabel');
  const [displayMode, setDisplayMode] = useState<'all' | 'arabic_only' | 'translation_only'>('all');
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const total = vocabularies.length;
  const verifiedCount = teacherKosakataState ? vocabularies.filter(v => teacherKosakataState[v.id]).length : 0;
  const isFullyVerifiedByTeacher = total > 0 && verifiedCount === total;

  // Split into columns based on count: <= 20 split into 2 cols, > 20 split into 3 cols
  const numCols = total > 20 ? 3 : 2;
  const itemsPerCol = Math.ceil(total / numCols);

  const columnChunks: VocabularyItem[][] = [];
  for (let i = 0; i < numCols; i++) {
    const start = i * itemsPerCol;
    const end = start + itemsPerCol;
    const chunk = vocabularies.slice(start, end);
    if (chunk.length > 0) {
      columnChunks.push(chunk);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden mb-6 transition-all">
      {/* Header Bar */}
      <div className="p-4 bg-gradient-to-r from-slate-900 to-emerald-950 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
            title={isMinimized ? 'Buka Kosakata' : 'Minimize Kosakata'}
          >
            {isMinimized ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-extrabold rounded-md">
                Bab {babNumber || 1}
              </span>
              <h3 className="font-bold text-base text-white">{title}</h3>
              {arabicTitle && (
                <span className="font-arabic text-lg font-bold text-emerald-400">
                  ({arabicTitle})
                </span>
              )}
              {isFullyVerifiedByTeacher ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-400 text-slate-950 font-extrabold text-[10px] rounded-md border border-amber-300 shadow-2xs">
                  <Crown size={12} className="fill-slate-950 text-slate-950" /> 100% Verified
                </span>
              ) : verifiedCount > 0 ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-900 font-extrabold text-[10px] rounded-md border border-amber-300 shadow-2xs">
                  <Crown size={11} className="fill-amber-600 text-amber-600" /> {verifiedCount}/{total} Verified
                </span>
              ) : null}
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Total {total} Kosakata (Diurutkan nomor ١ - {toArabicNumber(total)})
            </p>
          </div>
        </div>

        {/* Header Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Tampilan Switcher (Tabel vs Flashcard) */}
          <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 flex items-center text-xs font-bold gap-1 shadow-inner">
            <button
              onClick={() => setViewType('tabel')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                viewType === 'tabel'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid size={13} /> Tabel
            </button>
            <button
              onClick={() => {
                setViewType('flashcard');
                setCardIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                viewType === 'flashcard'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Play size={13} /> Flashcard
            </button>
          </div>

          {/* Display Mode Switcher (For Table) */}
          {viewType === 'tabel' && (
            <div className="bg-slate-800/90 p-1 rounded-xl border border-slate-700 flex items-center text-[11px] font-bold">
              <button
                onClick={() => setDisplayMode('all')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  displayMode === 'all'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setDisplayMode('arabic_only')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  displayMode === 'arabic_only'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Hanya Arab
              </button>
              <button
                onClick={() => setDisplayMode('translation_only')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  displayMode === 'translation_only'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Hanya Terjemahan
              </button>
            </div>
          )}

          {/* Fullscreen Flashcard Modal Launch Button */}
          {onLaunchFlashcard && (
            <button
              onClick={onLaunchFlashcard}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all"
              title="Buka Flashcard Fullscreen Modal"
            >
              <Play size={14} className="fill-slate-950" /> Modal
            </button>
          )}

          {isEditable && onEditItem && (
            <button
              onClick={onEditItem}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              title="Edit Modul / Bab Kosakata Ini"
            >
              <Edit3 size={14} /> Edit Bab
            </button>
          )}

          {isEditable && onAddItem && (
            <button
              onClick={onAddItem}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs rounded-xl flex items-center gap-1 border border-slate-700 cursor-pointer"
            >
              <Plus size={14} /> Input Mufrodat
            </button>
          )}

          {isEditable && (onDeleteMateri || onDeleteItem) && (
            <button
              onClick={() => {
                if (onDeleteMateri) onDeleteMateri();
                else if (onDeleteItem) onDeleteItem('');
              }}
              className="p-1.5 bg-slate-800 hover:bg-rose-900/60 text-rose-300 font-bold text-xs rounded-xl flex items-center gap-1 border border-slate-700 transition-colors cursor-pointer"
              title="Hapus Modul Kosakata Ini"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Accordion Body */}
      {!isMinimized && (
        <div className="p-4 bg-slate-50">
          {vocabularies.length === 0 ? (
            <div className="p-8 text-center text-slate-400 font-medium text-xs">
              Belum ada data kosakata untuk bab ini.
            </div>
          ) : viewType === 'flashcard' ? (
            /* Inline Flashcard View Mode */
            <div className="p-6 bg-slate-100 rounded-2xl border border-slate-200 space-y-4">
              <div className="max-w-md mx-auto space-y-4">
                {/* Progress & Card Controls */}
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="bg-emerald-100 text-emerald-900 px-3 py-1 rounded-xl border border-emerald-200 shadow-2xs">
                    Kartu {cardIndex + 1} dari {vocabularies.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setIsFlipped(false);
                        setCardIndex((prev) => (prev - 1 + vocabularies.length) % vocabularies.length);
                      }}
                      className="px-3 py-1.5 bg-white hover:bg-slate-200 text-slate-700 rounded-xl border shadow-2xs font-bold text-xs transition-colors"
                    >
                      ← Prev
                    </button>
                    <button
                      onClick={() => {
                        setIsFlipped(false);
                        setCardIndex((prev) => (prev + 1) % vocabularies.length);
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-2xs font-bold text-xs transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                </div>

                {/* Flip Card Container */}
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="relative w-full h-64 bg-white rounded-2xl border-2 border-emerald-300 shadow-md cursor-pointer transition-all hover:border-emerald-500 hover:shadow-lg p-6 flex flex-col items-center justify-center text-center space-y-3"
                >
                  <div className="absolute top-3 right-3 text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    Klik Kartu untuk Membalik 🔄
                  </div>

                  {!isFlipped ? (
                    <div className="space-y-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                        Bahasa Arab
                      </span>
                      <p className="font-arabic text-3xl sm:text-4xl font-bold text-slate-900 dir-rtl my-2">
                        {vocabularies[cardIndex]?.word}
                      </p>
                      <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                        <AudioPlayerButton arabicText={vocabularies[cardIndex]?.word || ''} size="md" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-100">
                        Terjemahan Indonesia
                      </span>
                      <p className="text-xl sm:text-2xl font-extrabold text-slate-800 my-2">
                        {vocabularies[cardIndex]?.meaning}
                      </p>
                      {vocabularies[cardIndex]?.latin && (
                        <p className="text-xs text-slate-500 italic font-medium">
                          ({vocabularies[cardIndex]?.latin})
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className={`grid grid-cols-1 ${numCols === 2 ? 'md:grid-cols-2' : 'lg:grid-cols-3'} gap-4`} dir="rtl">
              {columnChunks.map((chunk, colIndex) => {
                const globalOffset = colIndex * itemsPerCol;

                return (
                  <div key={colIndex} className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden" dir="rtl">
                    <table className="w-full text-xs text-right border-collapse">
                      <thead>
                        <tr className="bg-emerald-800 text-white font-bold border-b border-emerald-900">
                          <th className="py-2.5 px-3 w-14 text-center font-arabic text-sm border-l border-emerald-700/50">
                            الرقم
                          </th>
                          <th className="py-2.5 px-3 font-arabic text-right text-sm">
                            الكلمة / المفرردات
                          </th>
                          <th className="py-2.5 px-3 text-right text-xs">
                            الترجمة (Terjemahan)
                          </th>
                          {(onToggleSelfKosakata || teacherKosakataState || selfKosakataState) && (
                            <th className="py-2.5 px-2 text-center text-[11px] border-r border-emerald-700/50">
                              Status / Tandai
                            </th>
                          )}
                          {isEditable && <th className="py-2.5 px-2 w-14 text-center border-r border-emerald-700/50">Aksi</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {chunk.map((item, idx) => {
                          const globalNum = globalOffset + idx + 1;
                          const arabicNum = toArabicNumber(globalNum);
                          const isTeacherVerified = !!teacherKosakataState?.[item.id];
                          const isSelfMarked = !!selfKosakataState?.[item.id];

                          // Row style based on verification and self-marking status
                          const rowBgClass = isTeacherVerified
                            ? 'bg-amber-50/50 hover:bg-amber-50 text-slate-900 font-medium'
                            : isSelfMarked
                            ? 'bg-sky-50/50 hover:bg-sky-50 text-slate-900 font-medium'
                            : 'hover:bg-slate-50 transition-colors';

                          return (
                            <tr key={item.id || idx} className={`${rowBgClass} transition-all`}>
                              {/* Arabic Number Column (Positioned Rightmost in Arab Flow) */}
                              <td className={`py-1.5 px-2.5 text-center font-arabic font-bold text-xs border-r border-slate-100 ${
                                isTeacherVerified
                                  ? 'bg-amber-100/60 text-amber-900'
                                  : isSelfMarked
                                  ? 'bg-sky-100/60 text-sky-900'
                                  : 'bg-slate-50 text-slate-600'
                              }`}>
                                {arabicNum}
                              </td>

                              {/* Arabic Word Column */}
                              <td className="py-2 px-3 text-right font-arabic font-bold text-base">
                                {displayMode === 'translation_only' ? (
                                  <span className="text-slate-300 tracking-widest text-xs select-none">••••••</span>
                                ) : (
                                  <div className="flex items-center gap-1.5 justify-start dir-rtl">
                                    <span>{item.word}</span>
                                    <AudioPlayerButton arabicText={item.word} size="sm" />
                                  </div>
                                )}
                              </td>

                              {/* Translation Column */}
                              <td className="py-2 px-3 font-medium">
                                {displayMode === 'arabic_only' ? (
                                  <span className="text-slate-300 tracking-widest text-xs select-none">••••••</span>
                                ) : (
                                  item.meaning
                                )}
                              </td>

                              {/* Status / Self-Marking Column */}
                              {(onToggleSelfKosakata || teacherKosakataState || selfKosakataState) && (
                                <td className="py-1.5 px-2 text-center border-l border-slate-100">
                                  <div className="flex items-center justify-center gap-1 dir-ltr">
                                    {isTeacherVerified ? (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-100 text-amber-900 font-extrabold text-[10px] rounded border border-amber-300" title="Diverifikasi Guru (+5 XP)">
                                        <Crown size={11} className="fill-amber-500 text-amber-600" /> Verified
                                      </span>
                                    ) : isSelfMarked ? (
                                      <div className="flex items-center gap-1">
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-sky-100 text-sky-900 font-extrabold text-[10px] rounded border border-sky-300" title="Tanda Hafal Mandiri">
                                          <Check size={11} className="text-sky-600 stroke-[3]" /> Hafal
                                        </span>
                                        {onToggleSelfKosakata && (
                                          <button
                                            type="button"
                                            onClick={() => onToggleSelfKosakata(item.id)}
                                            className="px-1 py-0.5 text-[9px] text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded font-semibold cursor-pointer transition-colors"
                                            title="Batalkan Tanda Hafal"
                                          >
                                            Batal
                                          </button>
                                        )}
                                      </div>
                                    ) : onToggleSelfKosakata ? (
                                      <button
                                        type="button"
                                        onClick={() => onToggleSelfKosakata(item.id)}
                                        className="px-1.5 py-0.5 bg-white hover:bg-sky-50 text-slate-600 hover:text-sky-700 border border-slate-200 hover:border-sky-300 font-semibold text-[10px] rounded cursor-pointer transition-all flex items-center gap-1"
                                        title="Tandai Sudah Hafal (Siswa)"
                                      >
                                        <Bookmark size={10} className="text-slate-400" /> + Hafal
                                      </button>
                                    ) : (
                                      <span className="text-[10px] text-slate-400 font-medium">-</span>
                                    )}
                                  </div>
                                </td>
                              )}

                              {/* Actions Column */}
                              {isEditable && (
                                <td className="py-2 px-2 text-center border-l border-slate-100">
                                  <div className="flex items-center justify-center gap-1">
                                    {onEditItem && (
                                      <button
                                        onClick={() => onEditItem(item)}
                                        className="p-1 text-slate-400 hover:text-emerald-600 rounded-md"
                                        title="Edit Kosakata"
                                      >
                                        <Edit3 size={13} />
                                      </button>
                                    )}
                                    {onDeleteItem && (
                                      <button
                                        onClick={() => onDeleteItem(item.id)}
                                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md"
                                        title="Hapus Kosakata"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
