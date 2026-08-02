import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, RotateCw, Volume2, Sparkles, Layers, Eye } from 'lucide-react';
import { playArabicAudio } from '../../utils/audioSpeech';

export interface FlashcardItem {
  id: string;
  frontArabic: string;
  backTranslation: string;
  latin?: string;
  detail?: string;
  number?: number;
  speaker1Name?: string;
  speaker2Name?: string;
  frontSubtext?: string;
  backArabic?: string;
}

interface FlashcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: FlashcardItem[];
}

export const FlashcardModal: React.FC<FlashcardModalProps> = ({
  isOpen,
  onClose,
  title,
  items,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardList, setCardList] = useState<FlashcardItem[]>(items);
  const [memorizedIds, setMemorizedIds] = useState<Set<string>>(new Set());
  const [unmemorizedIds, setUnmemorizedIds] = useState<Set<string>>(new Set());
  const [isCompleted, setIsCompleted] = useState(false);

  // Shuffle modal range selection state
  const [showShuffleModal, setShowShuffleModal] = useState(false);
  const [shuffleType, setShuffleType] = useState<'all' | 'range'>('all');
  const [startNum, setStartNum] = useState<number>(1);
  const [endNum, setEndNum] = useState<number>(items.length || 1);
  const [activeShuffleLabel, setActiveShuffleLabel] = useState<string | null>(null);

  useEffect(() => {
    setCardList(items);
    setCurrentIndex(0);
    setIsFlipped(false);
    setMemorizedIds(new Set());
    setUnmemorizedIds(new Set());
    setIsCompleted(false);
    setStartNum(1);
    setEndNum(items.length || 1);
    setActiveShuffleLabel(null);
  }, [items]);

  if (!isOpen || cardList.length === 0) return null;

  const currentCard = cardList[currentIndex] || cardList[0];

  const handleMarkHafal = () => {
    const nextMem = new Set(memorizedIds);
    nextMem.add(currentCard.id);
    setMemorizedIds(nextMem);

    const nextUnmem = new Set(unmemorizedIds);
    nextUnmem.delete(currentCard.id);
    setUnmemorizedIds(nextUnmem);

    goToNextCard();
  };

  const handleMarkBelumHafal = () => {
    const nextUnmem = new Set(unmemorizedIds);
    nextUnmem.add(currentCard.id);
    setUnmemorizedIds(nextUnmem);

    const nextMem = new Set(memorizedIds);
    nextMem.delete(currentCard.id);
    setMemorizedIds(nextMem);

    goToNextCard();
  };

  const goToNextCard = () => {
    setIsFlipped(false);
    if (currentIndex + 1 >= cardList.length) {
      setIsCompleted(true);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cardList.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cardList.length) % cardList.length);
  };

  const handleDirectShuffleAll = () => {
    setIsFlipped(false);
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    setCardList(shuffled);
    setCurrentIndex(0);
    setIsCompleted(false);
    setActiveShuffleLabel('Mengacak Semua Kartu');
  };

  const handleExecuteShuffle = () => {
    setIsFlipped(false);
    if (shuffleType === 'all') {
      const shuffled = [...items].sort(() => Math.random() - 0.5);
      setCardList(shuffled);
      setCurrentIndex(0);
      setIsCompleted(false);
      setActiveShuffleLabel('Mengacak Semua Nomor');
    } else {
      const min = Math.min(startNum, endNum);
      const max = Math.max(startNum, endNum);
      const filtered = items.filter((item, index) => {
        const itemNum = item.number || (index + 1);
        return itemNum >= min && itemNum <= max;
      });

      if (filtered.length === 0) {
        alert(`Tidak ditemukan kartu dalam rentang nomor ${min} sampai ${max}.`);
        return;
      }

      const shuffled = [...filtered].sort(() => Math.random() - 0.5);
      setCardList(shuffled);
      setCurrentIndex(0);
      setIsCompleted(false);
      setActiveShuffleLabel(`Rentang No. ${min} - ${max} (${shuffled.length} Kartu)`);
    }
    setShowShuffleModal(false);
  };

  const handleRestartAll = () => {
    setCardList(items);
    setCurrentIndex(0);
    setIsFlipped(false);
    setMemorizedIds(new Set());
    setUnmemorizedIds(new Set());
    setIsCompleted(false);
    setActiveShuffleLabel(null);
  };

  const handleRetryUnmemorized = () => {
    const unmemList = items.filter(i => unmemorizedIds.has(i.id));
    if (unmemList.length === 0) {
      alert('Selamat! Semua kosakata telah berhasil dihafal!');
      handleRestartAll();
      return;
    }
    setCardList(unmemList);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsCompleted(false);
  };

  const handleSpeak = (text: string) => {
    if (text) {
      playArabicAudio(text);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-white">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl">
              <Layers size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">{title}</h3>
              <p className="text-xs text-slate-300">
                Kartu {currentIndex + 1} dari {cardList.length}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5">
          <div
            className="bg-emerald-500 h-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / cardList.length) * 100}%` }}
          />
        </div>

        {/* Card Arena or Completion Summary */}
        {isCompleted ? (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-6 min-h-[360px] animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-2xl font-black shadow-lg">
              <Sparkles size={32} />
            </div>
            
            <div>
              <h4 className="text-2xl font-black text-white">Sesi Latihan Flashcard Selesai!</h4>
              <p className="text-xs text-slate-300 mt-1">
                Hasil evaluasi hafalan mandiri Anda untuk set mufrodat ini:
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
                <span className="text-3xl font-black block">{memorizedIds.size}</span>
                <span className="text-xs font-semibold text-emerald-400">Sudah Hafal (حَفِظْتُ)</span>
              </div>
              <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300">
                <span className="text-3xl font-black block">{unmemorizedIds.size}</span>
                <span className="text-xs font-semibold text-rose-400">Perlu Diulangi (لَمْ أَحْفَظْ)</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-sm pt-2">
              {unmemorizedIds.size > 0 && (
                <button
                  onClick={handleRetryUnmemorized}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <RotateCw size={16} /> Ulangi {unmemorizedIds.size} Kata Yang Belum Hafal
                </button>
              )}
              <button
                onClick={handleRestartAll}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Layers size={16} /> Pelajari Ulang Seluruh Flashcard ({items.length} Kata)
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="p-6 flex-1 flex flex-col items-center justify-center min-h-[300px]">
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full max-w-md h-64 cursor-pointer perspective-1000 select-none group"
              >
                <div
                  className={`relative w-full h-full rounded-3xl p-6 transition-all duration-500 transform-gpu flex flex-col items-center justify-center text-center shadow-xl border ${
                    isFlipped
                      ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-emerald-500/50 shadow-emerald-950/40'
                      : 'bg-gradient-to-br from-emerald-950 to-slate-900 border-emerald-600/40 hover:border-emerald-500'
                  }`}
                >
                  <div className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-800/80 text-emerald-400 border border-slate-700">
                    {isFlipped
                      ? currentCard.speaker2Name
                        ? `Jawaban (${currentCard.speaker2Name})`
                        : 'Jawaban / Terjemahan'
                      : currentCard.speaker1Name
                      ? `Soal (${currentCard.speaker1Name})`
                      : 'Soal / Bahasa Arab'}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSpeak(isFlipped ? currentCard.backArabic || currentCard.frontArabic : currentCard.frontArabic);
                    }}
                    className="absolute top-4 right-4 p-2 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 rounded-full transition-all cursor-pointer"
                    title="Dengarkan Pelafalan"
                  >
                    <Volume2 size={18} />
                  </button>

                  {/* Card Face Content */}
                  {!isFlipped ? (
                    <div className="space-y-3.5 my-auto w-full px-2">
                      <p className="font-arabic text-3xl sm:text-4xl font-extrabold text-emerald-200 leading-relaxed drop-shadow-md">
                        {currentCard.frontArabic}
                      </p>

                      {currentCard.latin && (
                        <p className="text-xs text-slate-400 italic font-medium">
                          "{currentCard.latin}"
                        </p>
                      )}

                      {/* Terjemah Jawaban di Bawah Soal */}
                      {currentCard.frontSubtext && (
                        <div className="p-2.5 bg-sky-950/80 rounded-xl border border-sky-500/40 text-xs text-sky-200 shadow-inner">
                          <span className="text-[10px] text-sky-400 font-extrabold block uppercase tracking-wider">
                            Terjemah Jawaban:
                          </span>
                          <p className="font-semibold text-sky-100 text-xs sm:text-sm mt-0.5">
                            "{currentCard.frontSubtext}"
                          </p>
                        </div>
                      )}

                      <p className="text-[11px] text-slate-500 font-semibold flex items-center justify-center gap-1 pt-1">
                        <Eye size={12} /> Klik kartu untuk melihat jawaban lengkap
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 my-auto animate-fadeIn w-full px-2">
                      <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 block">
                        {currentCard.backArabic ? 'Jawaban (Bahasa Arab):' : 'Terjemahan / Arti:'}
                      </span>

                      {currentCard.backArabic && (
                        <p className="font-arabic text-3xl sm:text-4xl font-extrabold text-emerald-300 leading-relaxed drop-shadow-md my-1">
                          {currentCard.backArabic}
                        </p>
                      )}

                      <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Terjemahan Jawaban:</span>
                        <p className="text-base sm:text-lg font-black text-white tracking-tight mt-0.5">
                          "{currentCard.backTranslation}"
                        </p>
                      </div>

                      {currentCard.detail && (
                        <p className="text-xs text-slate-300 max-w-xs mx-auto mt-1">
                          {currentCard.detail}
                        </p>
                      )}

                      <p className="text-[11px] text-slate-400 font-semibold flex items-center justify-center gap-1 pt-1">
                        <RotateCw size={12} /> Klik kartu untuk kembali ke Soal
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Self Assessment Controls */}
            <div className="px-6 py-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleMarkBelumHafal}
                className="flex-1 py-2.5 px-4 bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-200 rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                ❌ Belum Hafal (لَمْ أَحْفَظْ)
              </button>
              <button
                type="button"
                onClick={handleMarkHafal}
                className="flex-1 py-2.5 px-4 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-200 rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                ✅ Sudah Hafal (حَفِظْتُ)
              </button>
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleDirectShuffleAll}
                  className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                  title="Klik untuk langsung mengacak seluruh kartu"
                >
                  <RotateCw size={14} /> Acak Kartu
                </button>

                <button
                  type="button"
                  onClick={() => setShowShuffleModal(true)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 hover:border-purple-500/50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  title="Buka pengaturan rentang nomor spesifik"
                >
                  <Sparkles size={14} className="text-purple-400" /> Rentang Nomor
                </button>

                {activeShuffleLabel && (
                  <div className="flex items-center gap-1 bg-purple-950/80 border border-purple-500/50 text-purple-200 px-2.5 py-1 rounded-lg text-[11px] font-bold">
                    <span>🔀 {activeShuffleLabel}</span>
                    <button
                      type="button"
                      onClick={handleRestartAll}
                      className="text-purple-300 hover:text-white p-0.5 cursor-pointer"
                      title="Reset Ke Semua Kartu Urut"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="p-2.5 bg-slate-800 hover:bg-emerald-600 text-white rounded-xl transition-all shadow-md cursor-pointer"
                  title="Sebelumnya"
                >
                  <ChevronLeft size={18} />
                </button>

                <span className="text-xs font-mono text-slate-300 px-2 font-bold">
                  {currentIndex + 1} / {cardList.length}
                </span>

                <button
                  type="button"
                  onClick={handleNext}
                  className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all shadow-md cursor-pointer"
                  title="Selanjutnya"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </>
        )}

        {/* Modal Options Shuffle Rentang Nomor */}
        {showShuffleModal && (
          <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-6 flex items-center justify-center animate-fadeIn">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full space-y-5 shadow-2xl text-left">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <RotateCw size={18} className="text-purple-400" />
                  <span>Pengaturan Acak Kartu</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setShowShuffleModal(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <label
                  onClick={() => setShuffleType('all')}
                  className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                    shuffleType === 'all'
                      ? 'bg-purple-950/80 border-purple-500 text-white shadow-md'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <input
                    type="radio"
                    name="shuffleType"
                    checked={shuffleType === 'all'}
                    onChange={() => setShuffleType('all')}
                    className="w-4 h-4 text-purple-600 accent-purple-600"
                  />
                  <div>
                    <div className="font-bold text-xs">Acak Semua Kartu</div>
                    <div className="text-[11px] text-slate-400">
                      Mengacak seluruh {items.length} kartu yang tersedia
                    </div>
                  </div>
                </label>

                <label
                  onClick={() => setShuffleType('range')}
                  className={`p-3.5 rounded-2xl border flex items-col gap-3 cursor-pointer transition-all ${
                    shuffleType === 'range'
                      ? 'bg-purple-950/80 border-purple-500 text-white shadow-md'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <input
                    type="radio"
                    name="shuffleType"
                    checked={shuffleType === 'range'}
                    onChange={() => setShuffleType('range')}
                    className="w-4 h-4 text-purple-600 accent-purple-600 mt-0.5 shrink-0"
                  />
                  <div className="space-y-2 w-full">
                    <div className="font-bold text-xs">Acak Rentang Nomor Spesifik</div>
                    <div className="text-[11px] text-slate-400">
                      Pilih nomor kartu dari sampai nomor tertentu
                    </div>

                    {shuffleType === 'range' && (
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-purple-800/50" onClick={e => e.stopPropagation()}>
                        <div>
                          <span className="text-[10px] font-bold text-purple-300 block mb-1">
                            Dari Nomor:
                          </span>
                          <input
                            type="number"
                            min={1}
                            max={items.length}
                            value={startNum}
                            onChange={e => setStartNum(parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-purple-400 font-bold"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-purple-300 block mb-1">
                            Sampai Nomor:
                          </span>
                          <input
                            type="number"
                            min={1}
                            max={items.length}
                            value={endNum}
                            onChange={e => setEndNum(parseInt(e.target.value) || items.length)}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-purple-400 font-bold"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowShuffleModal(false)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleExecuteShuffle}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCw size={14} /> Terapkan & Acak
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
