import React, { useState, useEffect } from 'react';
import { Materi } from '../../types';
import { Sparkles, Volume2, Shuffle, ArrowRight, Quote, Clock } from 'lucide-react';

interface MahfudzotOfTheDayCardProps {
  materiList: Materi[];
  onNavigate?: (tab: string) => void;
  title?: string;
}

export const MahfudzotOfTheDayCard: React.FC<MahfudzotOfTheDayCardProps> = ({
  materiList,
  onNavigate,
  title = "Mahfudzot Hari Ini",
}) => {
  const mahfudzotItems = materiList.filter(m => m.category === 'mahfudzot');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isCustomShuffled, setIsCustomShuffled] = useState<boolean>(false);

  // Compute daily deterministic index based on YYYY-MM-DD
  useEffect(() => {
    if (mahfudzotItems.length === 0) return;

    if (!isCustomShuffled) {
      const today = new Date();
      const dateKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
      
      let hash = 0;
      for (let i = 0; i < dateKey.length; i++) {
        hash = (hash << 5) - hash + dateKey.charCodeAt(i);
        hash |= 0;
      }
      const dailyIdx = Math.abs(hash) % mahfudzotItems.length;
      setSelectedIndex(dailyIdx);
    }
  }, [mahfudzotItems.length, isCustomShuffled]);

  if (mahfudzotItems.length === 0) {
    return null;
  }

  const currentItem = mahfudzotItems[selectedIndex] || mahfudzotItems[0];
  const arabicText = currentItem.mahfudzot?.arabic || currentItem.content;
  const translationText = currentItem.mahfudzot?.translation || currentItem.description;
  const itemNumber = currentItem.mahfudzot?.number || currentItem.babNumber || (selectedIndex + 1);

  const handleShuffleNext = () => {
    setIsCustomShuffled(true);
    const nextIdx = (selectedIndex + 1) % mahfudzotItems.length;
    setSelectedIndex(nextIdx);
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window && arabicText) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(arabicText);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-lg border border-purple-700/50 relative overflow-hidden space-y-4">
      {/* Background Watermark */}
      <div className="absolute -right-6 -bottom-8 opacity-10 font-arabic text-[140px] pointer-events-none select-none text-white leading-none">
        مَحْفُوظَات
      </div>

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 relative z-10 border-b border-purple-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl">
            <Quote size={18} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
              <span>{title}</span>
              <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold rounded-full flex items-center gap-1">
                <Clock size={10} /> Rotasi 24 Jam
              </span>
            </h3>
            <p className="text-[11px] text-purple-200">
              Kata mutiara hikmah terpilih hari ini
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-purple-800/80 text-purple-200 border border-purple-700 rounded-lg text-xs font-black">
            No. {itemNumber}
          </span>
          <button
            onClick={handleShuffleNext}
            className="p-1.5 bg-purple-800/60 hover:bg-purple-700 text-purple-200 hover:text-white rounded-lg border border-purple-700 transition-all cursor-pointer"
            title="Acak Kata Mutiara Lainnya"
          >
            <Shuffle size={14} />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative z-10 space-y-3 py-1">
        <div className="flex items-start justify-between gap-3">
          <p className="font-arabic text-2xl sm:text-3xl font-extrabold text-amber-200 leading-relaxed text-right dir-rtl flex-1">
            {arabicText}
          </p>
          <button
            onClick={handleSpeak}
            className="p-2.5 bg-purple-500/20 hover:bg-purple-500/40 text-purple-200 hover:text-white rounded-xl border border-purple-400/30 transition-all cursor-pointer shrink-0 mt-1"
            title="Dengarkan Audio Pengucapan Arab"
          >
            <Volume2 size={18} />
          </button>
        </div>

        <div className="p-3 bg-purple-950/60 rounded-xl border border-purple-800/60">
          <p className="text-xs sm:text-sm text-slate-200 font-medium italic leading-relaxed">
            "{translationText}"
          </p>
        </div>
      </div>

      {/* Footer Action */}
      {onNavigate && (
        <div className="relative z-10 pt-1 flex justify-end">
          <button
            onClick={() => onNavigate('materi')}
            className="text-xs font-bold text-purple-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Pelajari Lebih Banyak Mahfudzot ({mahfudzotItems.length})</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};
