import React, { useState } from 'react';
import { VocabularyItem } from '../../../types';
import { toArabicNumber } from '../../common/ArabicUtils';
import { AudioPlayerButton } from '../../common/AudioPlayerButton';
import { Eye, EyeOff, Layers, ChevronDown, ChevronUp, Edit3, Trash2, Plus, FileSpreadsheet, Play } from 'lucide-react';

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
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [displayMode, setDisplayMode] = useState<'all' | 'arabic_only' | 'translation_only'>('all');

  const total = vocabularies.length;

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
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-extrabold rounded-md">
                Bab {babNumber || 1}
              </span>
              <h3 className="font-bold text-base text-white">{title}</h3>
              {arabicTitle && (
                <span className="font-arabic text-lg font-bold text-emerald-400">
                  ({arabicTitle})
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Total {total} Kosakata (Diurutkan nomor ١ - {toArabicNumber(total)})
            </p>
          </div>
        </div>

        {/* Header Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Display Mode Switcher */}
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

          {/* Flashcard Button */}
          {onLaunchFlashcard && (
            <button
              onClick={onLaunchFlashcard}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all"
            >
              <Play size={14} className="fill-slate-950" /> Flashcards
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
                          {isEditable && <th className="py-2.5 px-2 w-14 text-center border-r border-emerald-700/50">Aksi</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {chunk.map((item, idx) => {
                          const globalNum = globalOffset + idx + 1;
                          const arabicNum = toArabicNumber(globalNum);

                          return (
                            <tr key={item.id || idx} className="hover:bg-emerald-50/50 transition-colors">
                              {/* Arabic Number Column (Positioned Rightmost in Arab Flow) */}
                              <td className="py-2 px-3 text-center font-arabic font-extrabold text-sm text-emerald-800 bg-emerald-50/40 border-r border-slate-100">
                                {arabicNum}
                              </td>

                              {/* Arabic Word Column */}
                              <td className="py-2 px-3 text-right font-arabic font-bold text-base text-slate-900">
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
                              <td className="py-2 px-3 font-medium text-slate-700">
                                {displayMode === 'arabic_only' ? (
                                  <span className="text-slate-300 tracking-widest text-xs select-none">••••••</span>
                                ) : (
                                  item.meaning
                                )}
                              </td>

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
