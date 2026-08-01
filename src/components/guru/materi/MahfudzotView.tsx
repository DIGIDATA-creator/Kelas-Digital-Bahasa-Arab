import React, { useState } from 'react';
import { Materi, MahfudzotQuote } from '../../../types';
import { Quote, Play, Eye, Edit3, Trash2, Volume2, Sparkles } from 'lucide-react';

interface MahfudzotViewProps {
  materiList: Materi[];
  onEditMateri: (materi: Materi) => void;
  onDeleteMateri: (id: string) => void;
  onLaunchFlashcards: () => void;
  isEditable?: boolean;
}

export const MahfudzotView: React.FC<MahfudzotViewProps> = ({
  materiList,
  onEditMateri,
  onDeleteMateri,
  onLaunchFlashcards,
  isEditable = true,
}) => {
  const [displayMode, setDisplayMode] = useState<'all' | 'arabic_only' | 'translation_only'>('all');

  const mahfudzotMateri = materiList.filter(m => m.category === 'mahfudzot');

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
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-50 text-purple-700 rounded-xl border border-purple-200">
            <Quote size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Kumpulan Kata Mutiara (Mahfudzot)</h3>
            <p className="text-xs text-slate-500">Total {mahfudzotMateri.length} Mahfudzot terdaftar</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Display Mode Selector */}
          <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center text-xs font-bold">
            <button
              onClick={() => setDisplayMode('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                displayMode === 'all'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tampilkan Seluruhnya
            </button>
            <button
              onClick={() => setDisplayMode('arabic_only')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                displayMode === 'arabic_only'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hanya Teks Arab
            </button>
            <button
              onClick={() => setDisplayMode('translation_only')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                displayMode === 'translation_only'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hanya Terjemahan
            </button>
          </div>

          {/* Flashcard Button */}
          <button
            onClick={onLaunchFlashcards}
            className="px-4 py-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all"
          >
            <Play size={14} className="fill-white" /> Flashcard Mahfudzot
          </button>
        </div>
      </div>

      {/* Mahfudzot Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mahfudzotMateri.map((materi, index) => {
          const number = materi.babNumber || (index + 1);
          const arabicText = materi.mahfudzot?.arabic || materi.content;
          const translationText = materi.mahfudzot?.translation || materi.description;

          return (
            <div
              key={materi.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-purple-300 transition-all p-5 flex flex-col justify-between relative space-y-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 text-xs font-black rounded-full">
                  Mahfudzot {number}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleSpeak(arabicText)}
                    className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Dengarkan Suara"
                  >
                    <Volume2 size={16} />
                  </button>

                  {isEditable && (
                    <>
                      <button
                        onClick={() => onEditMateri(materi)}
                        className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-slate-50 rounded-lg transition-colors"
                        title="Edit Mahfudzot"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => onDeleteMateri(materi.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded-lg transition-colors"
                        title="Hapus Mahfudzot"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Body Content */}
              <div className="space-y-3 my-auto py-2">
                {/* Arabic Text */}
                {displayMode !== 'translation_only' ? (
                  <p className="font-arabic text-2xl sm:text-3xl font-extrabold text-slate-900 leading-relaxed text-right">
                    {arabicText}
                  </p>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl text-center text-slate-400 italic text-xs">
                    (Teks Arab Disembunyikan)
                  </div>
                )}

                {/* Translation Text */}
                {displayMode !== 'arabic_only' ? (
                  <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-xs font-medium text-purple-900 leading-relaxed">
                    <span className="font-bold text-purple-700 block mb-0.5">Terjemahan:</span>
                    "{translationText}"
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
