import React from 'react';
import { Student, Materi, Penilaian } from '../../types';
import { BookOpen, Award, CheckCircle2, Play, Flame, ArrowRight, Sparkles, FileCheck, Trophy } from 'lucide-react';
import { SiswaDashboardSkeleton } from '../common/Skeleton';
import { MahfudzotOfTheDayCard } from '../common/MahfudzotOfTheDayCard';

interface SiswaDashboardProps {
  currentStudent: Student;
  materiList: Materi[];
  penilaianList: Penilaian[];
  onNavigate: (tab: string) => void;
  onSelectMateri: (materiId: string) => void;
  onStartPenilaian: (penilaianId: string) => void;
  isLoading?: boolean;
}

export const SiswaDashboard: React.FC<SiswaDashboardProps> = ({
  currentStudent,
  materiList,
  penilaianList,
  onNavigate,
  onSelectMateri,
  onStartPenilaian,
  isLoading = false,
}) => {
  if (isLoading) {
    return <SiswaDashboardSkeleton />;
  }

  const completedCount = currentStudent.completedMaterials?.length || 0;
  const totalMateri = materiList.length || 1;
  const overallProgressPct = Math.round((completedCount / totalMateri) * 100);

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
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-xl backdrop-blur-xs text-xs font-bold border border-white/10">
              <Flame size={16} className="text-rose-400" />
              <span>Streak Belajar: 5 Hari</span>
            </div>
          </div>
        </div>

        <div className="absolute -right-6 -bottom-6 opacity-10 font-arabic text-[160px] pointer-events-none select-none text-white">
          طَالِبٌ
        </div>
      </div>

      {/* Progress & Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
            <span>Capaian Materi Belajar</span>
            <span className="text-emerald-700 font-bold">{overallProgressPct}%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              style={{ width: `${overallProgressPct}%` }}
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            />
          </div>
          <p className="text-xs text-slate-500">
            {completedCount} dari {totalMateri} modul materi telah diselesaikan.
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
