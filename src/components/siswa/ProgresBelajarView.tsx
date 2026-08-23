import React from 'react';
import { Student, Materi, Penilaian, MahfudzotChecklist } from '../../types';
import { BookOpen, CheckCircle2, BarChart3, Clock } from 'lucide-react';
import { DetailedActivityLogView } from '../common/DetailedActivityLogView';

interface ProgresBelajarViewProps {
  currentStudent: Student;
  materiList: Materi[];
  penilaianList: Penilaian[];
}

export const ProgresBelajarView: React.FC<ProgresBelajarViewProps> = ({
  currentStudent,
  materiList,
}) => {
  // Category progress calculation
  const categories = ['qowaid', 'hiwar', 'kosakata', 'mahfudzot'] as const;
  const categoryNames = {
    qowaid: 'Qowaid (Tata Bahasa)',
    hiwar: 'Hiwar (Percakapan)',
    kosakata: 'Kosakata (Mufradat)',
    mahfudzot: 'Mahfudzot (Kata Mutiara)',
  };

  const categoryShortNames = {
    qowaid: 'Qowaid',
    hiwar: 'Hiwar',
    kosakata: 'Kosakata',
    mahfudzot: 'Mahfudzot',
  };

  const chartData = categories.map(cat => {
    const totalInCat = materiList.filter(m => m.category === cat).length || 1;
    const completedInCat = materiList.filter(
      m => m.category === cat && currentStudent.completedMaterials.includes(m.id)
    ).length;
    const pct = Math.round((completedInCat / totalInCat) * 100);

    return {
      category: categoryNames[cat],
      shortName: categoryShortNames[cat],
      catKey: cat,
      Selesai: completedInCat,
      Total: totalInCat,
      Persentase: pct,
    };
  });

  const totalMaterials = materiList.length || 1;
  const totalCompleted = currentStudent.completedMaterials.length;
  const overallPct = Math.round((totalCompleted / totalMaterials) * 100);

  // Reading time calculations
  const readingTimeRecords = currentStudent.materialReadingTimeSeconds || {};
  const totalReadingSeconds = (Object.values(readingTimeRecords) as number[]).reduce((sum, sec) => sum + (sec || 0), 0);
  const totalReadingMinutes = Math.floor(totalReadingSeconds / 60);

  const catColors: Record<string, { bar: string; badge: string; text: string }> = {
    qowaid: { bar: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-600' },
    hiwar: { bar: 'bg-sky-500', badge: 'bg-sky-50 text-sky-700 border-sky-200', text: 'text-sky-600' },
    kosakata: { bar: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200', text: 'text-amber-600' },
    mahfudzot: { bar: 'bg-purple-500', badge: 'bg-purple-50 text-purple-700 border-purple-200', text: 'text-purple-600' },
  };

  return (
    <div className="space-y-6">
      
      {/* Overview Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Pelacakan Progres Belajar Digital</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Statistik lengkap capaian modul, durasi baca, dan hasil ujian Bahasa Arab</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs text-slate-400 font-semibold">Total Capaian</span>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{overallPct}%</p>
          </div>
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border-4 border-emerald-500 flex items-center justify-center font-bold text-emerald-800 dark:text-emerald-300 text-sm">
            {totalCompleted}/{totalMaterials}
          </div>
        </div>
      </div>

      {/* Reading Time Tracking Card */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-6 rounded-2xl border border-amber-200 dark:border-amber-900/50 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
            <Clock size={18} className="text-amber-600 dark:text-amber-400" /> Statistik Durasi Belajar & Membaca Materi
          </h3>
          <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 rounded-full text-xs font-black">
            Total Waktu: {totalReadingMinutes} Menit ({totalReadingSeconds} Detik)
          </span>
        </div>

        {Object.keys(readingTimeRecords).length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 py-2">
            Belum ada durasi baca tercatat. Buka dan pelajari modul materi di menu "Materi" untuk mulai melacak durasi belajar Anda secara otomatis.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
            {materiList
              .filter(m => (readingTimeRecords[m.id] || 0) > 0)
              .map(materi => {
                const secs = readingTimeRecords[materi.id] || 0;
                const mins = Math.floor(secs / 60);
                const remSecs = secs % 60;
                return (
                  <div key={materi.id} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-900/50 shadow-2xs space-y-1">
                    <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider block truncate">
                      {materi.category}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate" title={materi.title}>
                      {materi.title}
                    </h4>
                    <p className="text-sm font-extrabold text-amber-700 dark:text-amber-400 font-mono">
                      ⏱️ {mins > 0 ? `${mins}m ` : ''}{remSecs}s
                    </p>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Progress per Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Category Cards */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
            <BookOpen size={18} className="text-emerald-600 dark:text-emerald-400" /> Progres Per Kategori Modul
          </h3>

          <div className="space-y-4">
            {chartData.map((item) => (
              <div key={item.category} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>{item.category}</span>
                  <span>{item.Selesai}/{item.Total} Topik ({item.Persentase}%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${item.Persentase}%` }}
                    className={`h-full ${catColors[item.catKey]?.bar || 'bg-emerald-500'} rounded-full transition-all duration-500`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart Visualizer */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 flex flex-col justify-between">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
            <BarChart3 size={18} className="text-purple-600 dark:text-purple-400" /> Grafik Capaian Pembelajaran
          </h3>

          <div className="h-48 w-full flex items-end justify-between gap-3 px-3 pt-6 pb-2 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800 relative">
            {chartData.map((item) => {
              const heightPct = Math.max(8, item.Persentase);
              return (
                <div key={item.category} className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer">
                  <div className="w-full max-w-[42px] relative flex flex-col items-center justify-end h-full">
                    <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                      {item.Persentase}%
                    </span>
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${catColors[item.catKey]?.bar || 'bg-emerald-500'} group-hover:brightness-110`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="mt-2 text-[11px] font-bold text-slate-600 dark:text-slate-400 truncate max-w-full text-center">
                    {item.shortName}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Qowaid</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> Hiwar</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Kosakata</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Mahfudzot</span>
          </div>
        </div>

      </div>

      {/* Offline Setoran Hafalan Status (Diverifikasi Guru) */}
      <div className="bg-gradient-to-r from-purple-900 to-slate-900 p-6 rounded-2xl border border-purple-800 text-white shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm flex items-center gap-2 text-purple-200">
            <CheckCircle2 size={18} className="text-purple-400" /> Status Setoran Hafalan Offline (Verifikasi Guru)
          </h3>
          <span className="px-2.5 py-0.5 bg-purple-950 text-purple-300 border border-purple-700 text-[11px] font-bold rounded-full">
            Sistem Setoran Direct
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-900/80 border border-purple-800/60 rounded-xl space-y-1">
            <div className="text-xs text-purple-300 font-semibold">Setoran Mahfudzot Tuntas</div>
            <div className="text-2xl font-black text-white">
              {Object.values(currentStudent.hafalanProgress?.mahfudzotChecklist || {}).filter(
                (c: MahfudzotChecklist) => c && c.hafalanArab && c.hafalanTerjemah && c.pengetahuanKosakata && c.pemahamanMateri
              ).length} <span className="text-xs font-normal text-purple-400">Kata Mutiara (4/4 Kriteria)</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Lafal Arab, Terjemahan, Kosakata, dan Pemahaman telah diverifikasi oleh guru.
            </p>
          </div>

          <div className="p-4 bg-slate-900/80 border border-purple-800/60 rounded-xl space-y-1">
            <div className="text-xs text-emerald-300 font-semibold">Setoran Kosakata (Mufrodat)</div>
            <div className="text-2xl font-black text-white">
              {Object.values(currentStudent.hafalanProgress?.kosakataIds || {}).filter(Boolean).length}{' '}
              <span className="text-xs font-normal text-emerald-400">Mufrodat Hafal</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Hafalan mufrodat bahasa Arab disetorkan secara tatap muka dengan guru.
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Activity & Duration Log Section */}
      <DetailedActivityLogView student={currentStudent} materiList={materiList} />

    </div>
  );
};
