import React from 'react';
import { Student, Materi, Penilaian } from '../../types';
import { BookOpen, Award, CheckCircle2, Play, Flame, ArrowRight, Sparkles, FileCheck, Trophy, Quote, CheckSquare, Bell, Zap, BellRing, Swords } from 'lucide-react';
import { calculateHafalanXP } from '../guru/CeklisHafalanModal';
import { SiswaDashboardSkeleton } from '../common/Skeleton';
import { MahfudzotOfTheDayCard } from '../common/MahfudzotOfTheDayCard';
import { ToastNotificationContainer, ToastItem } from '../common/ToastNotification';
import { LearningStreakWidget } from './LearningStreakWidget';
import { OfflineCacheStatusWidget } from '../common/OfflineCacheStatusWidget';

interface SiswaDashboardProps {
  currentStudent: Student;
  materiList: Materi[];
  penilaianList: Penilaian[];
  onNavigate: (tab: string) => void;
  onSelectMateri: (materiId: string) => void;
  onStartPenilaian: (penilaianId: string) => void;
  isLoading?: boolean;
  toasts?: ToastItem[];
  onDismissToast?: (id: string) => void;
  onSimulateExpGain?: (amount: number, reason: string) => void;
}

export const SiswaDashboard: React.FC<SiswaDashboardProps> = ({
  currentStudent,
  materiList,
  penilaianList,
  onNavigate,
  onSelectMateri,
  onStartPenilaian,
  isLoading = false,
  toasts = [],
  onDismissToast,
  onSimulateExpGain,
}) => {
  if (isLoading) {
    return <SiswaDashboardSkeleton />;
  }

  const completedCount = currentStudent.completedMaterials?.length || 0;
  const totalMateri = materiList.length || 1;
  const overallProgressPct = Math.round((completedCount / totalMateri) * 100);

  // 4.3 Hafalan Statistics & Self-Marked Calculations
  const mahfudzotState = currentStudent.hafalanProgress?.mahfudzotChecklist || {};
  const kosakataState = currentStudent.hafalanProgress?.kosakataIds || {};
  const selfKosakataState = currentStudent.hafalanProgress?.selfKosakataIds || {};
  const selfMahfudzotState = currentStudent.hafalanProgress?.selfMahfudzotIds || {};
  const selfQowaidState = currentStudent.hafalanProgress?.selfQowaidIds || {};
  const selfHiwarState = currentStudent.hafalanProgress?.selfHiwarIds || {};

  const markedHafalMateriCount = materiList.filter(m => {
    if (m.category === 'kosakata') {
      return (m.vocabularies && m.vocabularies.some(v => selfKosakataState[v.id] || kosakataState[v.id])) || selfKosakataState[m.id];
    }
    if (m.category === 'mahfudzot') {
      return !!selfMahfudzotState[m.id] || !!mahfudzotState[m.id]?.hafalanArab;
    }
    if (m.category === 'qowaid') {
      return !!selfQowaidState[m.id];
    }
    if (m.category === 'hiwar') {
      return !!selfHiwarState[m.id];
    }
    return false;
  }).length;

  const hafalProgressPct = Math.min(100, Math.round((markedHafalMateriCount / totalMateri) * 100));

  const memorizedVocabCount = Object.values(kosakataState).filter(Boolean).length;
  
  // Calculate unique Bab Kosakata with at least 1 memorized word
  const memorizedBabCount = new Set(
    materiList
      .filter(m => m.category === 'kosakata' && m.vocabularies?.some(v => kosakataState[v.id]))
      .map(m => m.babNumber || m.id)
  ).size;

  const memorizedMahfudzotCount = Object.values(mahfudzotState).filter(
    (c: any) => c && c.hafalanArab && c.hafalanTerjemah && c.pengetahuanKosakata && c.pemahamanMateri
  ).length;

  const hafalanXPData = calculateHafalanXP(mahfudzotState, kosakataState);

  // Find next uncompleted material
  const nextMaterial = materiList.find(m => !currentStudent.completedMaterials.includes(m.id)) || materiList[0];

  // Available Quizzes
  const availableQuizzes = penilaianList.slice(0, 3);

  return (
    <div className="space-y-6">
      
      {/* Student Greeting Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-600/50">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold uppercase tracking-wider">
            <Sparkles size={14} /> Modul Siswa Digital
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Selamat Belajar, {currentStudent.name}!
          </h2>
          <p className="text-slate-200 text-sm leading-relaxed">
            Tingkatkan pemahaman Bahasa Arab melalui materi interaktif Qowaid, Percakapan Hiwar, Mufradat Kosakata, dan Mahfudzot. Kerjakan kuis untuk mengumpulkan poin XP dan piala kelas!
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-xl backdrop-blur-xs text-xs font-bold border border-white/10">
              <Award size={16} className="text-amber-400" />
              <span>{currentStudent.totalXP} Total XP</span>
            </div>
            <button
              onClick={() => onNavigate('duel')}
              className="flex items-center gap-2 px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black text-xs transition-all cursor-pointer shadow-md"
            >
              <Swords size={16} /> Mode Duel Real-Time ⚔️
            </button>
          </div>
        </div>

        <div className="absolute -right-6 -bottom-6 opacity-10 font-arabic text-[160px] pointer-events-none select-none text-white">
          {currentStudent.gender === 'Perempuan' ? 'طَالِبَةٌ' : 'طَالِبٌ'}
        </div>
      </div>

      {/* Learning Streak Counter Widget */}
      <LearningStreakWidget
        currentStudent={currentStudent}
        onSimulateExpGain={onSimulateExpGain}
      />

      {/* 4.3 Data Hafalan Setoran Siswa (Kosakata & Mahfudzot) */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-2xl p-5 text-white shadow-lg border border-purple-700/60 space-y-4">
        <div className="flex items-center justify-between border-b border-purple-700/50 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-500/20 rounded-xl text-purple-300 border border-purple-400/30">
              <CheckSquare size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                Capaian Setoran & Hafalan Siswa
              </h3>
              <p className="text-xs text-purple-200">
                Data real-time hafalan Mufrodat Kosakata dan Kata Mutiara Mahfudzot yang telah disetorkan ke Guru
              </p>
            </div>
          </div>

          <span className="px-3 py-1 bg-amber-400/20 text-amber-300 text-xs font-black rounded-xl border border-amber-400/30 hidden sm:flex items-center gap-1">
            <Award size={14} /> +{hafalanXPData.totalHafalanXP} XP Hafalan
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Card 1: Kosakata & Bab Dihafal */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-purple-200 text-xs font-semibold">
              <span className="flex items-center gap-1"><BookOpen size={14} /> Kosakata Dihafal</span>
              <span className="text-amber-300 font-bold">+{hafalanXPData.kosakataXP} XP</span>
            </div>
            <p className="text-2xl font-black text-white">
              {memorizedVocabCount} <span className="text-xs font-normal text-purple-200">Mufrodat</span>
            </p>
            <p className="text-[11px] text-purple-200 font-medium">
              Tersebar di <strong>{memorizedBabCount} Bab Kosakata</strong>
            </p>
          </div>

          {/* Card 2: Mahfudzot Dihafal */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-purple-200 text-xs font-semibold">
              <span className="flex items-center gap-1"><Quote size={14} /> Mahfudzot Tuntas</span>
              <span className="text-amber-300 font-bold">+{hafalanXPData.mahfudzotXP} XP</span>
            </div>
            <p className="text-2xl font-black text-white">
              {memorizedMahfudzotCount} <span className="text-xs font-normal text-purple-200">Kata Mutiara</span>
            </p>
            <p className="text-[11px] text-purple-200 font-medium">
              Selesai 4 Kriteria (Arab, Terjemah, Vocab, Hikmah)
            </p>
          </div>

          {/* Card 3: Total Point XP Hafalan */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 space-y-1">
            <div className="text-purple-200 text-xs font-semibold">
              Total Point Bonus XP Hafalan
            </div>
            <p className="text-2xl font-black text-amber-300 flex items-center gap-1.5">
              <Award size={22} /> {hafalanXPData.totalHafalanXP} <span className="text-xs text-purple-200 font-normal">XP</span>
            </p>
            <p className="text-[11px] text-purple-200 font-medium">
              Otomatis menambah peringkat klasemen kelas
            </p>
          </div>
        </div>
      </div>

      {/* Offline PWA & Materi Caching Quick Widget */}
      <OfflineCacheStatusWidget materiList={materiList} compact={true} />

      {/* Progress & Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Progress Bar 1: Modul Selesai */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
            <span>Capaian Modul Dipelajari</span>
            <span className="text-emerald-700 font-bold">{overallProgressPct}%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              style={{ width: `${overallProgressPct}%` }}
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            />
          </div>
          <p className="text-xs text-slate-500">
            {completedCount} dari {totalMateri} modul telah diselesaikan.
          </p>
        </div>

        {/* Progress Bar 2: Persentase Ditandai Hafal / Paham */}
        <div className="bg-white p-5 rounded-2xl border border-purple-200 bg-purple-50/20 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-purple-900">
            <span className="flex items-center gap-1 font-extrabold"><CheckCircle2 size={14} className="text-purple-600" /> Progres Hafalan / Paham</span>
            <span className="text-purple-700 font-black">{hafalProgressPct}%</span>
          </div>
          <div className="w-full h-3 bg-purple-100 rounded-full overflow-hidden">
            <div
              style={{ width: `${hafalProgressPct}%` }}
              className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-all duration-500 shadow-2xs"
            />
          </div>
          <p className="text-xs text-purple-700 font-medium">
            <strong>{markedHafalMateriCount}</strong> dari {totalMateri} materi ditandai hafal/paham.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500">Kuis & Ujian Selesai</span>
          <p className="text-2xl font-extrabold text-slate-900">{currentStudent.attempts.length} <span className="text-xs text-slate-400 font-normal">Kuis</span></p>
          <p className="text-xs text-emerald-600 font-medium">
            Rata-rata Skor: {
              currentStudent.attempts.length > 0
                ? Math.round(currentStudent.attempts.reduce((a, b) => a + b.score, 0) / currentStudent.attempts.length)
                : 0
            } / 100
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500">Peringkat Klasemen</span>
          <p className="text-2xl font-extrabold text-amber-600 flex items-center gap-1.5">
            <Trophy size={22} /> Juara 2
          </p>
          <p className="text-xs text-slate-400">Kelas X Bahasa</p>
        </div>

      </div>

      {/* Floating Toast Notification Container */}
      {onDismissToast && (
        <ToastNotificationContainer toasts={toasts} onDismiss={onDismissToast} />
      )}

      {/* Real-time Notification & EXP Activity Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 rounded-xl text-amber-700 border border-amber-200 shrink-0">
              <BellRing size={20} className="animate-bounce" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                Sistem Notifikasi Capaian & Penambahan EXP
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                  Live
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Pemberitahuan otomatis (toast notification) setiap kali menyelesaikan materi baru atau memperoleh poin EXP.
              </p>
            </div>
          </div>

          {/* Quick Demo Trigger Buttons */}
          {onSimulateExpGain && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onSimulateExpGain(25, 'Uji Poin Bonus Membaca')}
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                title="Uji coba penambahan EXP +25"
              >
                <Zap size={13} className="text-amber-600" /> +25 EXP
              </button>
              <button
                onClick={() => onSimulateExpGain(50, 'Menyelesaikan Modul Baru')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                title="Uji coba penambahan EXP +50"
              >
                <Sparkles size={13} /> +50 EXP
              </button>
            </div>
          )}
        </div>

        {/* Live Active Toast Feed Items */}
        {toasts && toasts.length > 0 ? (
          <div className="space-y-2">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Notifikasi Capaian Terkini Sesi Ini ({toasts.length})
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {toasts.map((t, idx) => (
                <div
                  key={`${t.id || 'toast'}-${idx}`}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5 text-xs relative group"
                >
                  <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg shrink-0">
                    <Sparkles size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-extrabold text-slate-900 truncate">{t.title}</span>
                      {t.expGained !== undefined && t.expGained > 0 && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-black rounded-md shrink-0 border border-amber-200">
                          +{t.expGained} EXP
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{t.message}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block font-mono">{t.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between gap-2">
            <span className="font-semibold">
              ✨ Buka menu <strong>Materi Siswa</strong> & klik <strong>"Tandai Selesai (+50 EXP)"</strong>, atau kerjakan <strong>Kuis</strong> untuk memicu notifikasi toast secara langsung!
            </span>
            <span className="text-emerald-800 font-extrabold hidden md:inline shrink-0">Sistem Aktif</span>
          </div>
        )}
      </div>

      {/* Mahfudzot Hari Ini Card (Rotasi 24 Jam) */}
      <MahfudzotOfTheDayCard materiList={materiList} onNavigate={onNavigate} />

      {/* Next Lesson Recommendation Card */}
      {nextMaterial && (
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-200/60 px-2.5 py-0.5 rounded-full">
              Rekomendasi Pelajaran Selanjutnya
            </span>
            <h3 className="text-lg font-bold text-slate-900">{nextMaterial.title}</h3>
            {nextMaterial.arabicTitle && (
              <p className="font-arabic text-xl text-emerald-800">{nextMaterial.arabicTitle}</p>
            )}
            <p className="text-xs text-slate-600">{nextMaterial.description}</p>
          </div>

          <button
            onClick={() => {
              onNavigate('materi');
              onSelectMateri(nextMaterial.id);
            }}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 whitespace-nowrap"
          >
            <Play size={16} /> Lanjutkan Belajar
          </button>
        </div>
      )}

      {/* Available Quizzes & Exercises Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Latihan & Kuis Interaktif Siap Dikerjakan</h3>
            <p className="text-xs text-slate-500">Uji kemampuan bahasa arab dan kumpulkan poin XP</p>
          </div>
          <button
            onClick={() => onNavigate('penilaian')}
            className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
          >
            Lihat Semua →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {availableQuizzes.map((q) => {
            const hasAttempted = currentStudent.attempts.some(a => a.penilaianId === q.id);
            const lastAttempt = currentStudent.attempts.find(a => a.penilaianId === q.id);

            return (
              <div
                key={q.id}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-100 text-purple-700">
                      {q.type}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {q.durationMinutes} m
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm leading-snug">{q.title}</h4>
                </div>

                {hasAttempted ? (
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 size={14} /> Nilai: {lastAttempt?.score}/100
                    </span>
                    <button
                      onClick={() => onStartPenilaian(q.id)}
                      className="text-xs text-slate-600 underline hover:text-emerald-700"
                    >
                      Ulangi
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => onStartPenilaian(q.id)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Play size={14} /> Kerjakan Sekarang
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
