import React, { useState, useEffect } from 'react';
import { Materi, CategoryType, Student } from '../../types';
import { BookOpen, MessageSquare, List, Quote, FileText, CheckCircle2, Play, Volume2, Search, Sparkles, RefreshCw, ChevronRight, HardDriveDownload, WifiOff, Check, Maximize2, Minimize2, Eye, X, ZoomIn, ZoomOut } from 'lucide-react';
import { AudioPlayerButton } from '../common/AudioPlayerButton';
import { PdfViewerModal } from '../common/PdfViewerModal';
import { HiwarView } from '../guru/materi/HiwarView';
import { KosakataTableView } from '../guru/materi/KosakataTableView';
import { FlashcardModal, FlashcardItem } from '../common/FlashcardModal';
import { storageService } from '../../services/storage';

interface MateriSiswaViewProps {
  materiList: Materi[];
  currentStudent: Student;
  selectedMateriId?: string;
  onMarkComplete: (materiId: string) => void;
}

export const MateriSiswaView: React.FC<MateriSiswaViewProps> = ({
  materiList,
  currentStudent,
  selectedMateriId,
  onMarkComplete,
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('qowaid');
  const [activeMateriId, setActiveMateriId] = useState<string>(
    selectedMateriId || materiList[0]?.id || ''
  );
  
  // PDF Viewer Modal state
  const [previewPdfMateri, setPreviewPdfMateri] = useState<Materi | null>(null);

  // Offline Cache Notification
  const [offlineToast, setOfflineToast] = useState<string | null>(null);
  const [cachedIds, setCachedIds] = useState<string[]>([]);

  // Focus Mode State
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [readerFontSize, setReaderFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFocusMode) {
        setIsFocusMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode]);

  useEffect(() => {
    setCachedIds(storageService.getOfflineCachedMateriIds());
  }, [activeMateriId]);

  // Flashcard Modal State
  const [flashcardModalState, setFlashcardModalState] = useState<{
    isOpen: boolean;
    title: string;
    items: FlashcardItem[];
  }>({
    isOpen: false,
    title: '',
    items: [],
  });

  const categoryFiltered = materiList.filter(m => m.category === activeCategory);
  const currentMateri = materiList.find(m => m.id === activeMateriId) || categoryFiltered[0] || materiList[0];

  const isCompleted = currentMateri ? currentStudent.completedMaterials.includes(currentMateri.id) : false;
  const isCached = currentMateri ? cachedIds.includes(currentMateri.id) : false;

  const handleToggleOfflineCache = (materi: Materi) => {
    if (isCached) {
      storageService.removeOfflineCache(materi.id);
      setCachedIds(storageService.getOfflineCachedMateriIds());
      setOfflineToast(`Materi "${materi.title}" dihapus dari simpanan offline.`);
    } else {
      storageService.cacheMaterialOffline(materi);
      setCachedIds(storageService.getOfflineCachedMateriIds());
      setOfflineToast(`Materi "${materi.title}" berhasil disimpan ke LocalStorage! Dapat dibaca saat offline.`);
    }
    setTimeout(() => setOfflineToast(null), 4000);
  };

  const categoryInfo = {
    qowaid: { label: 'Qowaid (Tata Bahasa)', icon: BookOpen, arabic: 'الْقَوَاعِدُ' },
    hiwar: { label: 'Hiwar (Percakapan)', icon: MessageSquare, arabic: 'الْحِوَارُ' },
    kosakata: { label: 'Kosakata (Mufradat)', icon: List, arabic: 'الْمُفْرَدَاتُ' },
    mahfudzot: { label: 'Mahfudzot (Mutiara)', icon: Quote, arabic: 'الْمَحْفُوظَاتُ' },
  };

  return (
    <div className="space-y-6">
      
      {/* Category Tabs Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {(Object.keys(categoryInfo) as CategoryType[]).map((cat) => {
            const info = categoryInfo[cat];
            const Icon = info.icon;
            const isActive = activeCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  const firstInCat = materiList.find(m => m.category === cat);
                  if (firstInCat) setActiveMateriId(firstInCat.id);
                }}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon size={16} />
                <span>{info.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Two Column Layout: Material Selector Sidebar + Reading Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sidebar Topic List (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3 h-fit">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-bold text-slate-900 text-sm">Daftar Modul</h3>
            <span className="text-xs text-slate-400 font-semibold">{categoryFiltered.length} Topik</span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {categoryFiltered.map((m) => {
              const isSelected = m.id === currentMateri?.id;
              const isDone = currentStudent.completedMaterials.includes(m.id);

              return (
                <button
                  key={m.id}
                  onClick={() => setActiveMateriId(m.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all border flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-500 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className={`font-bold text-xs sm:text-sm truncate ${isSelected ? 'text-emerald-900' : 'text-slate-800'}`}>
                      {m.title}
                    </div>
                    {m.arabicTitle && (
                      <div className="font-arabic text-base text-emerald-700 truncate">{m.arabicTitle}</div>
                    )}
                  </div>

                  {isDone ? (
                    <span className="p-1 bg-emerald-100 text-emerald-700 rounded-full shrink-0">
                      <CheckCircle2 size={16} />
                    </span>
                  ) : (
                    <ChevronRight size={16} className="text-slate-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Workspace (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
          
          {!currentMateri ? (
            <p className="text-slate-400 text-center py-12">Pilih materi untuk mulai belajar.</p>
          ) : (
            <>
              {/* Workspace Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-5">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                      Tingkat {currentMateri.level}
                    </span>
                    <span className="text-xs text-slate-400">
                      Penyusun: {currentMateri.authorName}
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900">{currentMateri.title}</h2>
                  {currentMateri.arabicTitle && (
                    <h3 className="font-arabic text-2xl text-emerald-800">{currentMateri.arabicTitle}</h3>
                  )}
                  <p className="text-xs text-slate-600 pt-1 leading-relaxed">{currentMateri.description}</p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Mode Fokus Button */}
                    <button
                      onClick={() => setIsFocusMode(true)}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                      title="Baca materi tanpa distraksi navigasi atau sidebar"
                    >
                      <Maximize2 size={14} /> Mode Fokus
                    </button>

                    {/* Offline Cache Button */}
                    <button
                      onClick={() => currentMateri && handleToggleOfflineCache(currentMateri)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                        isCached
                          ? 'bg-teal-50 text-teal-800 border-teal-300'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                      }`}
                      title="Simpan teks materi ke LocalStorage agar tetap dapat dibaca tanpa internet"
                    >
                      <HardDriveDownload size={14} className={isCached ? 'text-teal-600' : 'text-slate-500'} />
                      <span>{isCached ? 'Tersimpan Offline' : 'Simpan Offline'}</span>
                    </button>

                    {currentMateri.pdfUrl && (
                      <button
                        onClick={() => setPreviewPdfMateri(currentMateri)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <FileText size={14} /> Modul PDF
                      </button>
                    )}
                  </div>

                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-xl font-bold text-xs">
                      <CheckCircle2 size={16} /> Sudah Diselesaikan (+50 XP)
                    </span>
                  ) : (
                    <button
                      onClick={() => onMarkComplete(currentMateri.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all shadow-md flex items-center gap-1.5"
                    >
                      <CheckCircle2 size={16} /> Tandai Selesai Membaca (+50 XP)
                    </button>
                  )}
                </div>
              </div>

              {/* Toast Notification for Offline Caching */}
              {offlineToast && (
                <div className="p-3 bg-teal-600 text-white rounded-xl text-xs font-bold flex items-center justify-between shadow-md transition-all">
                  <div className="flex items-center gap-2">
                    <WifiOff size={16} />
                    <span>{offlineToast}</span>
                  </div>
                  <button onClick={() => setOfflineToast(null)} className="hover:opacity-80">✕</button>
                </div>
              )}

              {/* CATEGORY 1: QOWAID / THEORETICAL EXPLANATION */}
              {currentMateri.category === 'qowaid' && (
                <div className="prose prose-emerald max-w-none space-y-4 text-slate-700 leading-relaxed text-sm">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 whitespace-pre-line text-slate-800 font-sans leading-relaxed">
                    {currentMateri.content}
                  </div>
                </div>
              )}

              {/* CATEGORY 2: HIWAR / DIALOGUE PLAYER */}
              {currentMateri.category === 'hiwar' && (
                <div className="space-y-4">
                  <HiwarView
                    materiList={[currentMateri]}
                    isEditable={false}
                  />
                </div>
              )}

              {/* CATEGORY 3: KOSAKATA / TABLE & FLASHCARDS */}
              {currentMateri.category === 'kosakata' && (
                <div className="space-y-4">
                  <KosakataTableView
                    title={currentMateri.title}
                    arabicTitle={currentMateri.arabicTitle}
                    babNumber={currentMateri.babNumber}
                    vocabularies={currentMateri.vocabularies || []}
                    onLaunchFlashcard={() => {
                      const vocabs = currentMateri.vocabularies || [];
                      const items: FlashcardItem[] = vocabs.map(v => ({
                        id: v.id,
                        frontArabic: v.word,
                        backTranslation: v.meaning,
                        latin: v.latin,
                      }));
                      setFlashcardModalState({
                        isOpen: true,
                        title: `Flashcard Kosakata - ${currentMateri.title}`,
                        items,
                      });
                    }}
                    isEditable={false}
                  />
                </div>
              )}

              {/* CATEGORY 4: MAHFUDZOT GALLERY */}
              {currentMateri.category === 'mahfudzot' && currentMateri.mahfudzot && (
                <div className="space-y-6">
                  <div className="p-8 bg-gradient-to-br from-amber-500/10 via-amber-100/30 to-orange-50 rounded-2xl border-2 border-amber-300 text-center space-y-4 shadow-xs">
                    <Quote size={32} className="mx-auto text-amber-600" />

                    <div className="space-y-2">
                      <p className="font-arabic text-3xl sm:text-4xl text-slate-900 leading-loose font-bold">
                        {currentMateri.mahfudzot.arabic}
                      </p>
                      <AudioPlayerButton arabicText={currentMateri.mahfudzot.arabic} size="md" className="mx-auto" />
                    </div>

                    <div className="pt-4 border-t border-amber-200 max-w-xl mx-auto space-y-2">
                      <p className="text-sm font-bold text-amber-900 font-mono italic">
                        "{currentMateri.mahfudzot.latin}"
                      </p>
                      <p className="text-base font-bold text-slate-800">
                        {currentMateri.mahfudzot.translation}
                      </p>
                    </div>
                  </div>

                  {currentMateri.mahfudzot.explanation && (
                    <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <h4 className="font-bold text-xs uppercase text-slate-500 tracking-wider">Kandungan Hikmah & Penjelasan</h4>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        {currentMateri.mahfudzot.explanation}
                      </p>
                    </div>
                  )}
                </div>
              )}

            </>
          )}

        </div>

      </div>

      {/* PDF Pratinjau Modal */}
      {previewPdfMateri && (
        <PdfViewerModal
          isOpen={!!previewPdfMateri}
          onClose={() => setPreviewPdfMateri(null)}
          title={previewPdfMateri.title}
          pdfUrl={previewPdfMateri.pdfUrl}
          pdfFileName={previewPdfMateri.pdfFileName}
          pdfPageCount={previewPdfMateri.pdfPageCount || 5}
          textContent={previewPdfMateri.content}
        />
      )}

      {/* Flashcard Modal */}
      <FlashcardModal
        isOpen={flashcardModalState.isOpen}
        onClose={() => setFlashcardModalState(prev => ({ ...prev, isOpen: false }))}
        title={flashcardModalState.title}
        items={flashcardModalState.items}
      />

      {/* Mode Fokus Distraction-Free Reader Overlay */}
      {isFocusMode && currentMateri && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 text-slate-100 overflow-y-auto backdrop-blur-md flex flex-col p-4 sm:p-8 animate-fade-in">
          {/* Focus Mode Sticky Toolbar */}
          <div className="max-w-5xl w-full mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6 shadow-2xl flex flex-wrap items-center justify-between gap-4 sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                Mode Fokus
              </span>
              <div className="hidden sm:block">
                <h4 className="font-bold text-sm text-slate-200">{currentMateri.title}</h4>
                {currentMateri.arabicTitle && (
                  <span className="font-arabic text-emerald-400 text-sm">{currentMateri.arabicTitle}</span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Font Size Adjuster */}
              <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 gap-1 text-xs">
                <span className="text-slate-400 px-2 font-semibold">Teks:</span>
                <button
                  onClick={() => setReaderFontSize('normal')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    readerFontSize === 'normal' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  A
                </button>
                <button
                  onClick={() => setReaderFontSize('large')}
                  className={`px-2.5 py-1 rounded-lg font-extrabold text-sm transition-all ${
                    readerFontSize === 'large' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  A+
                </button>
                <button
                  onClick={() => setReaderFontSize('xlarge')}
                  className={`px-2.5 py-1 rounded-lg font-black text-base transition-all ${
                    readerFontSize === 'xlarge' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  A++
                </button>
              </div>

              {/* Completion Action */}
              {isCompleted ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-xl font-bold text-xs">
                  <CheckCircle2 size={16} /> Selesai (+50 XP)
                </span>
              ) : (
                <button
                  onClick={() => onMarkComplete(currentMateri.id)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <CheckCircle2 size={16} /> Tandai Selesai (+50 XP)
                </button>
              )}

              {/* Exit Focus Mode Button */}
              <button
                onClick={() => setIsFocusMode(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                title="Keluar dari Mode Fokus (Tekan Esc)"
              >
                <Minimize2 size={16} />
                <span>Keluar (Esc)</span>
              </button>
            </div>
          </div>

          {/* Focus Mode Main Reading Container */}
          <div className="max-w-4xl w-full mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-12 shadow-2xl space-y-8 my-auto">
            {/* Header */}
            <div className="border-b border-slate-800 pb-6 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Modul {categoryInfo[currentMateri.category]?.label || currentMateri.category}</span>
                <span>Tingkat {currentMateri.level} • Oleh {currentMateri.authorName}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {currentMateri.title}
              </h1>
              {currentMateri.arabicTitle && (
                <h2 className="font-arabic text-3xl sm:text-4xl text-emerald-400 font-bold pt-2 leading-relaxed">
                  {currentMateri.arabicTitle}
                </h2>
              )}
              {currentMateri.description && (
                <p className="text-sm text-slate-400 leading-relaxed pt-2">
                  {currentMateri.description}
                </p>
              )}
            </div>

            {/* Reading Content Area with Dynamic Font Size */}
            <div className={`space-y-6 ${
              readerFontSize === 'normal' ? 'text-base leading-relaxed' :
              readerFontSize === 'large' ? 'text-lg leading-loose' :
              'text-xl leading-loose'
            }`}>
              {/* Category 1: QOWAID */}
              {currentMateri.category === 'qowaid' && (
                <div className="bg-slate-950/80 p-6 sm:p-8 rounded-2xl border border-slate-800 text-slate-200 whitespace-pre-line font-sans tracking-wide">
                  {currentMateri.content}
                </div>
              )}

              {/* Category 2: HIWAR */}
              {currentMateri.category === 'hiwar' && (
                <div className="space-y-4">
                  <HiwarView
                    materiList={[currentMateri]}
                    isEditable={false}
                  />
                </div>
              )}

              {/* Category 3: KOSAKATA */}
              {currentMateri.category === 'kosakata' && (
                <div className="space-y-4">
                  <KosakataTableView
                    title={currentMateri.title}
                    arabicTitle={currentMateri.arabicTitle}
                    babNumber={currentMateri.babNumber}
                    vocabularies={currentMateri.vocabularies || []}
                    onLaunchFlashcard={() => {
                      const vocabs = currentMateri.vocabularies || [];
                      const items: FlashcardItem[] = vocabs.map(v => ({
                        id: v.id,
                        frontArabic: v.word,
                        backTranslation: v.meaning,
                        latin: v.latin,
                      }));
                      setFlashcardModalState({
                        isOpen: true,
                        title: `Flashcard Kosakata - ${currentMateri.title}`,
                        items,
                      });
                    }}
                    isEditable={false}
                  />
                </div>
              )}

              {/* Category 4: MAHFUDZOT */}
              {currentMateri.category === 'mahfudzot' && currentMateri.mahfudzot && (
                <div className="space-y-6">
                  <div className="p-8 sm:p-12 bg-gradient-to-br from-amber-950/30 via-amber-900/10 to-slate-950 rounded-3xl border-2 border-amber-800/50 text-center space-y-6 shadow-xl">
                    <Quote size={40} className="mx-auto text-amber-500" />
                    <div className="space-y-3">
                      <p className="font-arabic text-3xl sm:text-5xl text-amber-100 leading-loose font-bold">
                        {currentMateri.mahfudzot.arabic}
                      </p>
                      <AudioPlayerButton arabicText={currentMateri.mahfudzot.arabic} size="lg" className="mx-auto" />
                    </div>

                    <div className="pt-6 border-t border-amber-900/50 max-w-xl mx-auto space-y-2">
                      <p className="text-base font-bold text-amber-400 font-mono italic">
                        "{currentMateri.mahfudzot.latin}"
                      </p>
                      <p className="text-lg font-bold text-slate-200">
                        {currentMateri.mahfudzot.translation}
                      </p>
                    </div>
                  </div>

                  {currentMateri.mahfudzot.explanation && (
                    <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                      <h4 className="font-bold text-xs uppercase text-amber-500 tracking-wider">Kandungan Hikmah & Penjelasan</h4>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {currentMateri.mahfudzot.explanation}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Next/Prev Topic Navigation inside Focus Mode */}
            <div className="pt-8 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-slate-400">
              <button
                disabled={categoryFiltered.findIndex(m => m.id === currentMateri.id) <= 0}
                onClick={() => {
                  const idx = categoryFiltered.findIndex(m => m.id === currentMateri.id);
                  if (idx > 0) setActiveMateriId(categoryFiltered[idx - 1].id);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none rounded-xl text-slate-200 flex items-center gap-1 transition-all cursor-pointer"
              >
                ← Topik Sebelumnya
              </button>

              <span className="text-slate-500">
                Topik {categoryFiltered.findIndex(m => m.id === currentMateri.id) + 1} dari {categoryFiltered.length}
              </span>

              <button
                disabled={categoryFiltered.findIndex(m => m.id === currentMateri.id) >= categoryFiltered.length - 1}
                onClick={() => {
                  const idx = categoryFiltered.findIndex(m => m.id === currentMateri.id);
                  if (idx < categoryFiltered.length - 1) setActiveMateriId(categoryFiltered[idx + 1].id);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none rounded-xl text-slate-200 flex items-center gap-1 transition-all cursor-pointer"
              >
                Topik Selanjutnya →
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
