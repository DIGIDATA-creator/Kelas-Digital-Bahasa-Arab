import React, { useState, useEffect } from 'react';
import { Materi, CategoryType, Student } from '../../types';
import { BookOpen, MessageSquare, List, Quote, FileText, CheckCircle2, Play, Volume2, Search, Sparkles, RefreshCw, ChevronRight, HardDriveDownload, WifiOff, Check, Maximize2, Minimize2, Eye, X, ZoomIn, ZoomOut, Video, Award, Crown, Target, Clock, Mic, Bookmark } from 'lucide-react';
import { AudioPlayerButton } from '../common/AudioPlayerButton';
import { PdfViewerModal } from '../common/PdfViewerModal';
import { HiwarView } from '../guru/materi/HiwarView';
import { KosakataTableView } from '../guru/materi/KosakataTableView';
import { KosakataView } from '../guru/materi/KosakataView';
import { MahfudzotView } from '../guru/materi/MahfudzotView';
import { FlashcardModal, FlashcardItem } from '../common/FlashcardModal';
import { LatihanBicaraHiwarModal } from './LatihanBicaraHiwarModal';
import { OfflineCacheStatusWidget } from '../common/OfflineCacheStatusWidget';
import { storageService } from '../../services/storage';
import { calculateStudentVocabStreaks } from '../../utils/vocabStreakUtils';

interface MateriSiswaViewProps {
  materiList: Materi[];
  currentStudent: Student;
  selectedMateriId?: string;
  onMarkComplete: (materiId: string) => void;
  onUpdateStudent?: (updatedStudent: Student) => void;
}

export const MateriSiswaView: React.FC<MateriSiswaViewProps> = ({
  materiList,
  currentStudent,
  selectedMateriId,
  onMarkComplete,
  onUpdateStudent,
}) => {
  const getInitialCategoryAndId = () => {
    if (selectedMateriId) {
      const found = materiList.find(m => m.id === selectedMateriId);
      if (found) {
        return { category: found.category, materiId: found.id };
      }
    }
    const defaultCat: CategoryType = 'qowaid';
    const firstInCat = materiList.find(m => m.category === defaultCat) || materiList[0];
    return { category: defaultCat, materiId: firstInCat?.id || '' };
  };

  const initialValues = getInitialCategoryAndId();
  const [activeCategory, setActiveCategory] = useState<CategoryType>(initialValues.category);
  const [activeMateriId, setActiveMateriId] = useState<string>(initialValues.materiId);

  useEffect(() => {
    if (selectedMateriId) {
      const found = materiList.find(m => m.id === selectedMateriId);
      if (found) {
        setActiveCategory(found.category);
        setActiveMateriId(found.id);
      }
    }
  }, [selectedMateriId, materiList]);

  // Compute vocabulary verification streaks from student's quiz attempts
  const penilaianList = storageService.getPenilaian();
  const vocabStreakResult = calculateStudentVocabStreaks(currentStudent, materiList, penilaianList);

  const handleToggleSelfQowaidTarget = (materiId: string, targetIdx: number) => {
    const key = `${materiId}_target_${targetIdx}`;
    const currentSelf = currentStudent.hafalanProgress?.selfQowaidIds || {};
    const updatedSelf = { ...currentSelf, [key]: !currentSelf[key] };
    const nowIso = new Date().toISOString();

    const updatedStudent: Student = {
      ...currentStudent,
      updatedAt: nowIso,
      lastActive: nowIso,
      hafalanProgress: {
        ...currentStudent.hafalanProgress,
        selfQowaidIds: updatedSelf,
      },
    };

    // Update in memory and storage immediately
    const allStudents = storageService.getStudents();
    const updatedList = allStudents.map(s => s.id === updatedStudent.id ? updatedStudent : s);
    if (!updatedList.some(s => s.id === updatedStudent.id)) {
      updatedList.push(updatedStudent);
    }
    storageService.saveStudents(updatedList);

    if (onUpdateStudent) {
      onUpdateStudent(updatedStudent);
    }
  };

  // Self-marking handlers for Kosakata and Mahfudzot (0 XP)
  const handleToggleSelfKosakata = (vocabId: string) => {
    const currentSelf = currentStudent.hafalanProgress?.selfKosakataIds || {};
    const updatedSelf = { ...currentSelf, [vocabId]: !currentSelf[vocabId] };
    const nowIso = new Date().toISOString();

    const updatedStudent: Student = {
      ...currentStudent,
      updatedAt: nowIso,
      lastActive: nowIso,
      hafalanProgress: {
        ...currentStudent.hafalanProgress,
        selfKosakataIds: updatedSelf,
      },
    };

    const allStudents = storageService.getStudents();
    const updatedList = allStudents.map(s => s.id === updatedStudent.id ? updatedStudent : s);
    if (!updatedList.some(s => s.id === updatedStudent.id)) {
      updatedList.push(updatedStudent);
    }
    storageService.saveStudents(updatedList);

    if (onUpdateStudent) {
      onUpdateStudent(updatedStudent);
    }
  };

  const handleToggleSelfMahfudzot = (materiId: string) => {
    const currentSelf = currentStudent.hafalanProgress?.selfMahfudzotIds || {};
    const updatedSelf = { ...currentSelf, [materiId]: !currentSelf[materiId] };
    const nowIso = new Date().toISOString();

    const updatedStudent: Student = {
      ...currentStudent,
      updatedAt: nowIso,
      lastActive: nowIso,
      hafalanProgress: {
        ...currentStudent.hafalanProgress,
        selfMahfudzotIds: updatedSelf,
      },
    };

    const allStudents = storageService.getStudents();
    const updatedList = allStudents.map(s => s.id === updatedStudent.id ? updatedStudent : s);
    if (!updatedList.some(s => s.id === updatedStudent.id)) {
      updatedList.push(updatedStudent);
    }
    storageService.saveStudents(updatedList);

    if (onUpdateStudent) {
      onUpdateStudent(updatedStudent);
    }
  };

  const handleToggleSelfQowaid = (materiId: string) => {
    const currentSelf = currentStudent.hafalanProgress?.selfQowaidIds || {};
    const updatedSelf = { ...currentSelf, [materiId]: !currentSelf[materiId] };
    const nowIso = new Date().toISOString();

    const updatedStudent: Student = {
      ...currentStudent,
      updatedAt: nowIso,
      lastActive: nowIso,
      hafalanProgress: {
        ...currentStudent.hafalanProgress,
        selfQowaidIds: updatedSelf,
      },
    };

    const allStudents = storageService.getStudents();
    const updatedList = allStudents.map(s => s.id === updatedStudent.id ? updatedStudent : s);
    if (!updatedList.some(s => s.id === updatedStudent.id)) {
      updatedList.push(updatedStudent);
    }
    storageService.saveStudents(updatedList);

    if (onUpdateStudent) {
      onUpdateStudent(updatedStudent);
    }
  };

  const handleToggleSelfHiwar = (materiId: string) => {
    const currentSelf = currentStudent.hafalanProgress?.selfHiwarIds || {};
    const updatedSelf = { ...currentSelf, [materiId]: !currentSelf[materiId] };
    const nowIso = new Date().toISOString();

    const updatedStudent: Student = {
      ...currentStudent,
      updatedAt: nowIso,
      lastActive: nowIso,
      hafalanProgress: {
        ...currentStudent.hafalanProgress,
        selfHiwarIds: updatedSelf,
      },
    };

    const allStudents = storageService.getStudents();
    const updatedList = allStudents.map(s => s.id === updatedStudent.id ? updatedStudent : s);
    if (!updatedList.some(s => s.id === updatedStudent.id)) {
      updatedList.push(updatedStudent);
    }
    storageService.saveStudents(updatedList);

    if (onUpdateStudent) {
      onUpdateStudent(updatedStudent);
    }
  };
  
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

  // AI Speech Practice Modal State
  const [isLatihanBicaraOpen, setIsLatihanBicaraOpen] = useState(false);

  // Material Reading Timer State
  const [readingTimeSecs, setReadingTimeSecs] = useState<number>(0);
  const [sessionStartTime, setSessionStartTime] = useState<string>(new Date().toISOString());

  // Start reading timer when a material is open
  useEffect(() => {
    if (!activeMateriId) return;
    setReadingTimeSecs(0);
    const nowIso = new Date().toISOString();
    setSessionStartTime(nowIso);

    const interval = setInterval(() => {
      setReadingTimeSecs(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [activeMateriId]);

  // Sync reading duration to storage every 10 seconds
  useEffect(() => {
    if (!activeMateriId || readingTimeSecs <= 0 || readingTimeSecs % 10 !== 0) return;
    storageService.updateMaterialReadingTime(currentStudent.id, activeMateriId, 10);
  }, [readingTimeSecs, activeMateriId, currentStudent.id]);

  // Log material activity session on material switch or unmount
  useEffect(() => {
    return () => {
      if (activeMateriId && readingTimeSecs >= 10) {
        storageService.logMaterialReadingSession(currentStudent.id, activeMateriId, readingTimeSecs, sessionStartTime);
      }
    };
  }, [activeMateriId, readingTimeSecs, sessionStartTime, currentStudent.id]);

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
      
      {/* Offline Caching & PWA Status Widget */}
      <OfflineCacheStatusWidget materiList={materiList} />

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

              // Verification status calculations for Kosakata & Mahfudzot
              const isKosakata = m.category === 'kosakata';
              const totalVocab = m.vocabularies?.length || 0;
              const verifiedVocab = isKosakata && totalVocab > 0
                ? (m.vocabularies || []).filter(v => currentStudent.hafalanProgress?.kosakataIds?.[v.id]).length
                : 0;
              const isKosakata100Percent = isKosakata && totalVocab > 0 && verifiedVocab === totalVocab;

              const isMahfudzot = m.category === 'mahfudzot';
              const mahfudzotChk = currentStudent.hafalanProgress?.mahfudzotChecklist?.[m.id];
              const isMahfudzot100Percent = isMahfudzot && !!(mahfudzotChk && mahfudzotChk.hafalanArab && mahfudzotChk.hafalanTerjemah && mahfudzotChk.pengetahuanKosakata && mahfudzotChk.pemahamanMateri);
              const isMahfudzotPartiallyVerified = isMahfudzot && !isMahfudzot100Percent && !!(mahfudzotChk && (mahfudzotChk.hafalanArab || mahfudzotChk.hafalanTerjemah || mahfudzotChk.pengetahuanKosakata || mahfudzotChk.pemahamanMateri));

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
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <div className={`font-bold text-xs sm:text-sm truncate ${isSelected ? 'text-emerald-900' : 'text-slate-800'}`}>
                        {m.title}
                      </div>

                      {/* 100% Verified Badge for Kosakata Bab */}
                      {isKosakata100Percent && (
                        <span className="px-1.5 py-0.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-[9px] rounded flex items-center gap-0.5 shrink-0 shadow-2xs border border-amber-200" title="100% Kosakata Bab Ini Diverifikasi Guru">
                          <Crown size={10} className="fill-slate-950 text-slate-950" /> 100% Verified
                        </span>
                      )}
                      {isKosakata && !isKosakata100Percent && verifiedVocab > 0 && (
                        <span className="px-1.5 py-0.5 bg-amber-500 text-slate-950 font-black text-[9px] rounded flex items-center gap-0.5 shrink-0 shadow-2xs" title={`${verifiedVocab} dari ${totalVocab} kosakata diverifikasi guru`}>
                          <Crown size={10} className="fill-slate-950 text-slate-950" /> {verifiedVocab}/{totalVocab} Verified
                        </span>
                      )}

                      {/* Verified Badge for Mahfudzot */}
                      {isMahfudzot100Percent && (
                        <span className="px-1.5 py-0.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-[9px] rounded flex items-center gap-0.5 shrink-0 shadow-2xs border border-amber-200" title="100% Mahfudzot Diverifikasi Guru (4/4 Kriteria)">
                          <Crown size={10} className="fill-slate-950 text-slate-950" /> 100% Verified
                        </span>
                      )}
                      {isMahfudzotPartiallyVerified && (
                        <span className="px-1.5 py-0.5 bg-amber-500 text-slate-950 font-black text-[9px] rounded flex items-center gap-0.5 shrink-0 shadow-2xs" title="Mahfudzot ini sudah diverifikasi guru">
                          <Crown size={10} className="fill-slate-950 text-slate-950" /> Verified Guru
                        </span>
                      )}
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
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                      Tingkat {currentMateri.level}
                    </span>
                    {currentMateri.category === 'kosakata' && (() => {
                      const totalInBab = currentMateri.vocabularies?.length || 0;
                      const verifiedInBab = (currentMateri.vocabularies || []).filter(
                        v => currentStudent.hafalanProgress?.kosakataIds?.[v.id]
                      ).length;
                      if (totalInBab > 0 && verifiedInBab === totalInBab) {
                        return (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 shadow-xs flex items-center gap-1 border border-amber-200">
                            <Crown size={12} className="fill-slate-950 text-slate-950" /> 100% Diverifikasi Guru
                          </span>
                        );
                      } else if (verifiedInBab > 0) {
                        return (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500 text-slate-950 flex items-center gap-1 border border-amber-300 shadow-xs">
                            <Crown size={11} className="fill-slate-950 text-slate-950" /> {verifiedInBab}/{totalInBab} Verified Guru
                          </span>
                        );
                      }
                      return null;
                    })()}
                    {currentMateri.category === 'mahfudzot' && (() => {
                      const chk = currentStudent.hafalanProgress?.mahfudzotChecklist?.[currentMateri.id];
                      const isFull = !!(chk && chk.hafalanArab && chk.hafalanTerjemah && chk.pengetahuanKosakata && chk.pemahamanMateri);
                      const isPartial = !isFull && !!(chk && (chk.hafalanArab || chk.hafalanTerjemah || chk.pengetahuanKosakata || chk.pemahamanMateri));
                      if (isFull) {
                        return (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 shadow-xs flex items-center gap-1 border border-amber-200">
                            <Crown size={12} className="fill-slate-950 text-slate-950" /> 100% Diverifikasi Guru
                          </span>
                        );
                      } else if (isPartial) {
                        return (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500 text-slate-950 flex items-center gap-1 border border-amber-300 shadow-xs">
                            <Crown size={11} className="fill-slate-950 text-slate-950" /> Verified Guru
                          </span>
                        );
                      }
                      return null;
                    })()}
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
                    {/* Live Reading Timer Badge */}
                    <div className="px-3 py-1.5 bg-amber-50 text-amber-900 border border-amber-300 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-2xs">
                      <Clock size={14} className="text-amber-600 animate-spin" />
                      <span>Durasi Baca: {Math.floor(readingTimeSecs / 60)}m {readingTimeSecs % 60}s</span>
                    </div>

                    {/* AI Speaking Practice Button */}
                    <button
                      onClick={() => setIsLatihanBicaraOpen(true)}
                      className="px-3 py-1.5 bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95"
                      title="Mulai Praktik Percakapan Bahasa Arab Interaktif dengan Ustaz AI"
                    >
                      <Mic size={14} className="text-amber-300 animate-pulse" />
                      <span>Latihan Bicara AI</span>
                    </button>

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

                    {currentMateri.videoUrl && (
                      <a
                        href={currentMateri.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                        title="Buka Video Panduan Pembelajaran"
                      >
                        <Video size={14} /> Video Panduan
                      </a>
                    )}

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

              {/* Status Banner for Kosakata */}
              {currentMateri.category === 'kosakata' && (() => {
                const totalInBab = currentMateri.vocabularies?.length || 0;
                const checkedInBab = (currentMateri.vocabularies || []).filter(
                  v => currentStudent.hafalanProgress?.kosakataIds?.[v.id]
                ).length;
                const selfMarkedInBab = (currentMateri.vocabularies || []).filter(
                  v => currentStudent.hafalanProgress?.selfKosakataIds?.[v.id]
                ).length;
                const isAllChecked = totalInBab > 0 && checkedInBab === totalInBab;

                return (
                  <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 shadow-2xs ${
                    checkedInBab > 0
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : selfMarkedInBab > 0
                      ? 'bg-sky-50 border-sky-300 text-sky-950'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${
                        checkedInBab > 0
                          ? 'bg-emerald-600 text-white'
                          : selfMarkedInBab > 0
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}>
                        <CheckCircle2 size={18} />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs sm:text-sm">
                          {isAllChecked
                            ? '✅ Seluruh Kosakata Bab Ini Telah Disetorkan & Diceklis Guru'
                            : checkedInBab > 0
                            ? `✓ ${checkedInBab} dari ${totalInBab} Kosakata Disetorkan ke Guru (+${checkedInBab * 5} XP)`
                            : selfMarkedInBab > 0
                            ? `🔖 ${selfMarkedInBab} dari ${totalInBab} Kosakata Ditandai Hafal oleh Anda (Mandiri)`
                            : 'Belum Ada Kosakata Bab Ini yang Ditandai / Disetorkan'}
                        </h4>
                        <p className="text-[11px] opacity-80">
                          {checkedInBab > 0
                            ? `Diperoleh +${checkedInBab * 5} XP dari verifikasi guru.`
                            : 'Anda dapat menandai kosakata yang sudah dihafal secara mandiri (0 XP), atau setorkan ke Guru (+5 XP per mufrodat).'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-sky-700 text-white font-extrabold text-[11px] rounded-xl shadow-2xs">
                        {selfMarkedInBab}/{totalInBab} Hafal Siswa
                      </span>
                      <span className="px-2.5 py-1 bg-emerald-700 text-white font-extrabold text-[11px] rounded-xl shadow-2xs">
                        {checkedInBab}/{totalInBab} Verified Guru
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Status Banner for Mahfudzot */}
              {currentMateri.category === 'mahfudzot' && (() => {
                const chk = currentStudent.hafalanProgress?.mahfudzotChecklist?.[currentMateri.id];
                const checkedCount = chk ? [chk.hafalanArab, chk.hafalanTerjemah, chk.pengetahuanKosakata, chk.pemahamanMateri].filter(Boolean).length : 0;
                const isSelfMarked = !!currentStudent.hafalanProgress?.selfMahfudzotIds?.[currentMateri.id];
                const isFull = checkedCount === 4;

                return (
                  <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 shadow-2xs ${
                    checkedCount > 0
                      ? 'bg-purple-50 border-purple-300 text-purple-950'
                      : isSelfMarked
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-950'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${
                        checkedCount > 0
                          ? 'bg-purple-700 text-white'
                          : isSelfMarked
                          ? 'bg-indigo-700 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}>
                        <CheckCircle2 size={18} />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs sm:text-sm">
                          {isFull
                            ? '✅ Mahfudzot Tuntas Disetorkan & Diceklis Guru'
                            : checkedCount > 0
                            ? `✓ Setoran Mahfudzot Terverifikasi Guru (${checkedCount}/4 Kriteria)`
                            : isSelfMarked
                            ? '🔖 Mahfudzot Ini Ditandai Sudah Hafal oleh Anda (Mandiri - 0 XP)'
                            : 'Belum Disetorkan ke Guru'}
                        </h4>
                        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                          <span className={`px-2 py-0.5 rounded-md font-bold ${chk?.hafalanArab ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-200 text-slate-500'}`}>
                            {chk?.hafalanArab ? '✓ Teks Arab (+5 XP)' : '✕ Teks Arab'}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md font-bold ${chk?.hafalanTerjemah ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-200 text-slate-500'}`}>
                            {chk?.hafalanTerjemah ? '✓ Terjemah (+5 XP)' : '✕ Terjemah'}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md font-bold ${chk?.pengetahuanKosakata ? 'bg-amber-200 text-amber-900' : 'bg-slate-200 text-slate-500'}`}>
                            {chk?.pengetahuanKosakata ? '✓ Kosakata (+10 XP)' : '✕ Kosakata'}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md font-bold ${chk?.pemahamanMateri ? 'bg-amber-200 text-amber-900' : 'bg-slate-200 text-slate-500'}`}>
                            {chk?.pemahamanMateri ? '✓ Hikmah (+10 XP)' : '✕ Hikmah'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleSelfMahfudzot(currentMateri.id)}
                        className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs border ${
                          isSelfMarked
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-500'
                            : 'bg-indigo-500 hover:bg-indigo-600 text-white border-indigo-400'
                        }`}
                        title="Tandai Sudah Hafal (Siswa)"
                      >
                        <Bookmark size={14} className={isSelfMarked ? 'fill-white' : ''} />
                        <span>{isSelfMarked ? '✓ Hafal (Batal)' : 'Tandai Hafal'}</span>
                      </button>
                      <span className="px-2.5 py-1.5 bg-purple-700 text-white font-extrabold text-[11px] rounded-xl shadow-2xs">
                        {checkedCount}/4 Diceklis Guru
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* CATEGORY 1: QOWAID / THEORETICAL EXPLANATION */}
              {currentMateri.category === 'qowaid' && (
                <div className="space-y-4">
                  {/* Status Pemahaman Self-Marking Control for Student */}
                  {(() => {
                    const isQowaidUnderstood = !!currentStudent.hafalanProgress?.selfQowaidIds?.[currentMateri.id];
                    return (
                      <div className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs ${
                        isQowaidUnderstood
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                          : 'bg-amber-50/80 border-amber-200 text-amber-950'
                      }`}>
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                            isQowaidUnderstood ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                          }`}>
                            <BookOpen size={18} />
                          </div>
                          <div className="space-y-0.5">
                            <span className="font-extrabold text-xs block">
                              {isQowaidUnderstood
                                ? '🔖 Status: Telah Anda Tandai "Sudah Dipahami"'
                                : '⏳ Tandai Pemahaman Materi Qowaid Ini'}
                            </span>
                            <p className="text-[11px] opacity-90 leading-relaxed">
                              {isQowaidUnderstood
                                ? 'Anda telah menandai materi Qowaid ini sebagai sudah dipahami. *Catatan: Verifikasi resmi ketuntasan materi adalah melalui latihan dan kuis Qowaid.'
                                : 'Klik tombol di samping jika Anda telah membaca & memahami teori tata bahasa Qowaid ini.'}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleSelfQowaid(currentMateri.id)}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs ${
                            isQowaidUnderstood
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black'
                          }`}
                        >
                          {isQowaidUnderstood ? (
                            <>
                              <CheckCircle2 size={16} />
                              <span>Sudah Dipahami</span>
                            </>
                          ) : (
                            <>
                              <BookOpen size={16} />
                              <span>Tandai Sudah Dipahami</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })()}

                  {/* Target Pembelajaran / Capaian Qowaid */}
                  {currentMateri.learningTargets && currentMateri.learningTargets.length > 0 && (
                    <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-2xl border border-emerald-200/80 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between text-emerald-900 font-extrabold text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-emerald-600 text-white rounded-lg shadow-2xs">
                            <Target size={16} />
                          </div>
                          <span>Target Pembelajaran & Capaian Materi Qowaid</span>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          Klik target untuk menceklis
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-emerald-950 font-medium">
                        {currentMateri.learningTargets.map((target, idx) => {
                          const isTargetChecked = !!currentStudent.hafalanProgress?.selfQowaidIds?.[`${currentMateri.id}_target_${idx}`];
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleToggleSelfQowaidTarget(currentMateri.id, idx)}
                              className={`w-full text-left flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer shadow-2xs ${
                                isTargetChecked
                                  ? 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold'
                                  : 'bg-white/90 hover:bg-white border-emerald-100 hover:border-emerald-300 text-emerald-950'
                              }`}
                            >
                              <div className={`p-1 rounded-md shrink-0 mt-0.5 transition-colors ${
                                isTargetChecked ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'
                              }`}>
                                <Check size={13} className="stroke-[3]" />
                              </div>
                              <span className="leading-snug text-xs">{target}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {currentMateri.videoUrl && (
                    <div className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-2.5">
                        <Video size={20} className="text-rose-600 shrink-0" />
                        <div>
                          <h4 className="font-bold text-xs text-rose-950">Video Panduan Pembelajaran Qowaid</h4>
                          <p className="text-[11px] text-rose-700">Tonton penjelasan video interaktif untuk materi bab ini.</p>
                        </div>
                      </div>
                      <a
                        href={currentMateri.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs shrink-0 flex items-center gap-1.5"
                      >
                        <Video size={14} /> Tonton Video Panduan ➔
                      </a>
                    </div>
                  )}
                  <div className="prose prose-emerald max-w-none text-slate-700 leading-relaxed text-sm">
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 whitespace-pre-line text-slate-800 font-sans leading-relaxed">
                      {currentMateri.content}
                    </div>
                  </div>
                </div>
              )}

              {/* CATEGORY 2: HIWAR / DIALOGUE PLAYER */}
              {currentMateri.category === 'hiwar' && (
                <div className="space-y-4">
                  {/* Status Pemahaman Self-Marking Control for Hiwar */}
                  {(() => {
                    const isHiwarUnderstood = !!currentStudent.hafalanProgress?.selfHiwarIds?.[currentMateri.id];
                    return (
                      <div className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs ${
                        isHiwarUnderstood
                          ? 'bg-sky-50 border-sky-300 text-sky-950'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}>
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                            isHiwarUnderstood ? 'bg-sky-600 text-white' : 'bg-slate-400 text-white'
                          }`}>
                            <MessageSquare size={18} />
                          </div>
                          <div className="space-y-0.5">
                            <span className="font-extrabold text-xs block">
                              {isHiwarUnderstood
                                ? '🔖 Status: Telah Anda Tandai "Sudah Dipahami / Dipelajari"'
                                : '⏳ Tandai Percakapan Hiwar Ini'}
                            </span>
                            <p className="text-[11px] opacity-90 leading-relaxed">
                              Tandai jika Anda telah mempraktikkan dialog percakapan dan memahami struktur kalimatnya.
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleSelfHiwar(currentMateri.id)}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs ${
                            isHiwarUnderstood
                              ? 'bg-sky-600 hover:bg-sky-700 text-white'
                              : 'bg-sky-500 hover:bg-sky-600 text-white font-bold'
                          }`}
                        >
                          {isHiwarUnderstood ? (
                            <>
                              <CheckCircle2 size={16} />
                              <span>Sudah Dipahami</span>
                            </>
                          ) : (
                            <>
                              <MessageSquare size={16} />
                              <span>Tandai Sudah Dipahami</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })()}

                  <HiwarView
                    materiList={materiList}
                    isEditable={false}
                  />
                </div>
              )}

              {/* CATEGORY 3: KOSAKATA / TABLE & FLASHCARDS */}
              {currentMateri.category === 'kosakata' && (
                <div className="space-y-4">
                  <KosakataView
                    materiList={materiList}
                    selectedMateriId={currentMateri.id}
                    isEditable={false}
                    teacherKosakataState={currentStudent.hafalanProgress?.kosakataIds || {}}
                    selfKosakataState={currentStudent.hafalanProgress?.selfKosakataIds || {}}
                    quizKosakataState={vocabStreakResult.quizVerifiedKosakata}
                    voiceKosakataState={vocabStreakResult.voiceVerifiedKosakata}
                    quizKosakataStreaks={vocabStreakResult.quizKosakataStreaks}
                    onToggleSelfKosakata={handleToggleSelfKosakata}
                  />
                </div>
              )}

              {/* CATEGORY 4: MAHFUDZOT GALLERY */}
              {currentMateri.category === 'mahfudzot' && (
                <div className="space-y-6">
                  {currentMateri.mahfudzot && (
                    <div className="p-6 bg-gradient-to-br from-purple-500/10 via-indigo-100/30 to-purple-50 rounded-2xl border-2 border-purple-200 text-center space-y-4 shadow-xs">
                      <Quote size={28} className="mx-auto text-purple-600" />

                      <div className="space-y-2">
                        <p className="font-arabic text-3xl sm:text-4xl text-slate-900 leading-loose font-bold dir-rtl">
                          {currentMateri.mahfudzot.arabic}
                        </p>
                        <AudioPlayerButton arabicText={currentMateri.mahfudzot.arabic} size="md" className="mx-auto" />
                      </div>

                      <div className="pt-3 border-t border-purple-200 max-w-xl mx-auto space-y-1">
                        <p className="text-sm font-bold text-slate-800">
                          "{currentMateri.mahfudzot.translation}"
                        </p>
                      </div>
                    </div>
                  )}

                  <MahfudzotView
                    materiList={materiList}
                    onEditMateri={() => {}}
                    onDeleteMateri={() => {}}
                    onLaunchFlashcards={(filteredList) => {
                      const listToUse = filteredList || materiList.filter(m => m.category === 'mahfudzot');
                      const items: FlashcardItem[] = listToUse.map((m, idx) => ({
                        id: m.id,
                        frontArabic: m.mahfudzot?.arabic || m.content,
                        backTranslation: m.mahfudzot?.translation || m.description,
                        latin: m.mahfudzot?.latin,
                        detail: `Mahfudzot No. ${m.mahfudzot?.number || m.babNumber || idx + 1}`,
                        number: m.mahfudzot?.number || m.babNumber || idx + 1,
                      }));
                      setFlashcardModalState({
                        isOpen: true,
                        title: `Flashcard Kumpulan Mahfudzot (${items.length} Kata Mutiara)`,
                        items,
                      });
                    }}
                    isEditable={false}
                    teacherMahfudzotState={currentStudent.hafalanProgress?.mahfudzotChecklist || {}}
                    selfMahfudzotState={currentStudent.hafalanProgress?.selfMahfudzotIds || {}}
                    onToggleSelfMahfudzot={handleToggleSelfMahfudzot}
                  />
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
          learningTargets={previewPdfMateri.learningTargets}
          checkedTargetIndices={(previewPdfMateri.learningTargets || [])
            .map((_, idx) => idx)
            .filter(idx => !!currentStudent.hafalanProgress?.selfQowaidIds?.[`${previewPdfMateri.id}_target_${idx}`])
          }
          onToggleTargetIndex={(idx) => handleToggleSelfQowaidTarget(previewPdfMateri.id, idx)}
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
                <div className="space-y-4">
                  {currentMateri.learningTargets && currentMateri.learningTargets.length > 0 && (
                    <div className="p-5 bg-emerald-950/60 rounded-2xl border border-emerald-800/80 space-y-3">
                      <div className="flex items-center gap-2 text-emerald-300 font-extrabold text-xs sm:text-sm">
                        <div className="p-1.5 bg-emerald-600 text-white rounded-lg">
                          <Target size={16} />
                        </div>
                        <span>Target Pembelajaran (Capaian Qowaid):</span>
                      </div>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-emerald-100 font-medium">
                        {currentMateri.learningTargets.map((target, idx) => (
                          <li key={idx} className="flex items-start gap-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                            <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                            <span className="leading-snug">{target}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="bg-slate-950/80 p-6 sm:p-8 rounded-2xl border border-slate-800 text-slate-200 whitespace-pre-line font-sans tracking-wide">
                    {currentMateri.content}
                  </div>
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
                    teacherKosakataState={currentStudent.hafalanProgress?.kosakataIds}
                    selfKosakataState={currentStudent.hafalanProgress?.selfKosakataIds}
                    quizKosakataState={vocabStreakResult.quizVerifiedKosakata}
                    voiceKosakataState={vocabStreakResult.voiceVerifiedKosakata}
                    quizKosakataStreaks={vocabStreakResult.quizKosakataStreaks}
                    onToggleSelfKosakata={handleToggleSelfKosakata}
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

    {/* Modal Latihan Bicara Percakapan Hiwar AI */}
      <LatihanBicaraHiwarModal
        isOpen={isLatihanBicaraOpen}
        onClose={() => setIsLatihanBicaraOpen(false)}
        currentStudent={currentStudent}
        materiList={materiList}
      />
    </div>
  );
};
