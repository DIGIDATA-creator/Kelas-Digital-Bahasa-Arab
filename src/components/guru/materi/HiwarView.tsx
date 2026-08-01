import React, { useState } from 'react';
import { Materi, DialogueTurnPair } from '../../../types';
import { toArabicNumber } from '../../common/ArabicUtils';
import { AudioPlayerButton } from '../../common/AudioPlayerButton';
import { MessageSquare, Edit3, Trash2, Plus, Volume2, Sparkles, Layers, ChevronDown, ChevronUp } from 'lucide-react';

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

              {isEditable && (
                <div className="flex items-center gap-2">
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
                </div>
              )}
            </div>

            {/* Content List of Dialogue Turns with Automatic Numbering */}
            <div className="p-5 bg-slate-50 space-y-4">
              {pairs.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs font-medium">
                  Belum ada dialog dalam percakapan ini.
                </div>
              ) : (
                pairs.map((pair, idx) => {
                  const turnNum = pair.turnNumber || idx + 1;
                  const arabicTurnNum = toArabicNumber(turnNum);

                  return (
                    <div
                      key={pair.id || idx}
                      className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3 hover:border-sky-300 transition-all"
                    >
                      {/* Dialogue Number Badge */}
                      <div className="flex items-center justify-between border-b pb-2">
                        <span className="px-3 py-1 bg-sky-100 text-sky-900 font-extrabold text-xs rounded-xl flex items-center gap-1.5">
                          <MessageSquare size={13} className="text-sky-700" /> Percakapan #{turnNum} ({arabicTurnNum})
                        </span>
                      </div>

                      {/* Dialogue Exchange Pair (Speaker 1 & Speaker 2) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Speaker 1 / Soal */}
                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-arabic font-extrabold text-sky-800 text-sm">
                              {pair.speaker1}
                            </span>
                            <AudioPlayerButton arabicText={pair.arabic1} size="sm" />
                          </div>
                          <p className="font-arabic font-extrabold text-lg sm:text-xl text-slate-900 text-right leading-relaxed">
                            {pair.arabic1}
                          </p>
                          <p className="text-xs text-slate-600 font-medium italic border-t pt-1.5">
                            "{pair.translation1}"
                          </p>
                        </div>

                        {/* Speaker 2 / Jawaban */}
                        <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-arabic font-extrabold text-emerald-800 text-sm">
                              {pair.speaker2}
                            </span>
                            <AudioPlayerButton arabicText={pair.arabic2} size="sm" />
                          </div>
                          <p className="font-arabic font-extrabold text-lg sm:text-xl text-slate-900 text-right leading-relaxed">
                            {pair.arabic2}
                          </p>
                          <p className="text-xs text-slate-600 font-medium italic border-t pt-1.5 border-emerald-200">
                            "{pair.translation2}"
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
