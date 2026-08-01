import React, { useState } from 'react';
import { Materi, CategoryType, Student } from '../../types';
import { BookOpen, MessageSquare, List, Quote, FileText, CheckCircle2, Play, Volume2, Search, Sparkles, RefreshCw, ChevronRight } from 'lucide-react';
import { AudioPlayerButton } from '../common/AudioPlayerButton';
import { PdfViewerModal } from '../common/PdfViewerModal';
import { KosakataTableView } from '../guru/materi/KosakataTableView';
import { FlashcardModal, FlashcardItem } from '../common/FlashcardModal';

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
                  {currentMateri.pdfUrl && (
                    <button
                      onClick={() => setPreviewPdfMateri(currentMateri)}
                      className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <FileText size={16} /> Buka Modul PDF
                    </button>
                  )}

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
                  <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border">
                    <span>Klik tombol pengeras suara untuk mendengarkan pelafalan Bahasa Arab</span>
                    <span className="font-semibold text-sky-800 font-arabic">
                      {currentMateri.dialoguePairs?.length || Math.ceil((currentMateri.dialogues?.length || 0) / 2)} Dialog Percakapan
                    </span>
                  </div>

                  {currentMateri.dialoguePairs && currentMateri.dialoguePairs.length > 0 ? (
                    <div className="space-y-4">
                      {currentMateri.dialoguePairs.map((pair, idx) => (
                        <div key={pair.id || idx} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
                          <div className="flex items-center justify-between border-b pb-2">
                            <span className="px-3 py-1 bg-sky-100 text-sky-900 font-extrabold text-xs rounded-xl flex items-center gap-1.5">
                              <MessageSquare size={13} className="text-sky-700" /> Percakapan #{pair.turnNumber || idx + 1}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-arabic font-extrabold text-sky-800 text-sm">
                                  {pair.speaker1}
                                </span>
                                <AudioPlayerButton arabicText={pair.arabic1} size="sm" />
                              </div>
                              <p className="font-arabic font-extrabold text-xl text-slate-900 text-right leading-relaxed">
                                {pair.arabic1}
                              </p>
                              <p className="text-xs text-slate-600 font-medium italic border-t pt-1.5">
                                "{pair.translation1}"
                              </p>
                            </div>

                            <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-arabic font-extrabold text-emerald-800 text-sm">
                                  {pair.speaker2}
                                </span>
                                <AudioPlayerButton arabicText={pair.arabic2} size="sm" />
                              </div>
                              <p className="font-arabic font-extrabold text-xl text-slate-900 text-right leading-relaxed">
                                {pair.arabic2}
                              </p>
                              <p className="text-xs text-slate-600 font-medium italic border-t pt-1.5 border-emerald-200">
                                "{pair.translation2}"
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {currentMateri.dialogues?.map((d, idx) => (
                        <div
                          key={d.id || idx}
                          className={`p-4 rounded-2xl border transition-all ${
                            idx % 2 === 0
                              ? 'bg-emerald-50/50 border-emerald-200 ml-0 sm:mr-8'
                              : 'bg-teal-50/50 border-teal-200 mr-0 sm:ml-8'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-xs text-slate-700 bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200">
                              {d.speaker}
                            </span>
                            <AudioPlayerButton arabicText={d.arabic} size="sm" />
                          </div>

                          <p className="font-arabic text-2xl text-slate-900 text-right leading-loose my-2 font-bold">
                            {d.arabic}
                          </p>

                          <div className="pt-2 border-t border-slate-200/60 text-xs space-y-0.5">
                            {d.latin && <p className="text-slate-500 italic font-mono">{d.latin}</p>}
                            <p className="text-slate-800 font-medium">{d.translation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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

    </div>
  );
};
