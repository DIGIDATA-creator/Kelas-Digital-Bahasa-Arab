import React from 'react';
import { Student, Materi, Penilaian, MahfudzotChecklist } from '../../types';
import { BookOpen, Award, CheckCircle2, TrendingUp, BarChart3, Clock } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { DetailedActivityLogView } from '../common/DetailedActivityLogView';

interface ProgresBelajarViewProps {
  currentStudent: Student;
  materiList: Materi[];
  penilaianList: Penilaian[];
}

export const ProgresBelajarView: React.FC<ProgresBelajarViewProps> = ({
  currentStudent,
  materiList,
  penilaianList,
}) => {
  // Category progress calculation
  const categories = ['qowaid', 'hiwar', 'kosakata', 'mahfudzot'] as const;
  const categoryNames = {
    qowaid: 'Qowaid (Tata Bahasa)',
    hiwar: 'Hiwar (Percakapan)',
    kosakata: 'Kosakata (Mufradat)',
    mahfudzot: 'Mahfudzot (Kata Mutiara)',
  };

  const chartData = categories.map(cat => {
    const totalInCat = materiList.filter(m => m.category === cat).length || 1;
    const completedInCat = materiList.filter(
      m => m.category === cat && currentStudent.completedMaterials.includes(m.id)
    ).length;
    const pct = Math.round((completedInCat / totalInCat) * 100);

    return {
      category: categoryNames[cat],
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

  return (
    <div className="space-y-6">
      
      {/* Overview Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Pelacakan Progres Belajar Digital</h2>
          <p className="text-xs text-slate-500">Statistik lengkap capaian modul, durasi baca, dan hasil ujian Bahasa Arab</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs text-slate-400 font-semibold">Total Capaian</span>
            <p className="text-2xl font-extrabold text-emerald-600">{overallPct}%</p>
          </div>
          <div className="w-16 h-16 rounded-full bg-emerald-50 border-4 border-emerald-500 flex items-center justify-center font-bold text-emerald-800 text-sm">
            {totalCompleted}/{totalMaterials}
          </div>
        </div>
      </div>

      {/* Reading Time Tracking Card */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-6 rounded-2xl border border-amber-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Clock size={18} className="text-amber-600" /> Statistik Durasi Belajar & Membaca Materi
          </h3>
          <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-black">
            Total Waktu: {totalReadingMinutes} Menit ({totalReadingSeconds} Detik)
          </span>
        </div>

        {Object.keys(readingTimeRecords).length === 0 ? (
          <p className="text-xs text-slate-500 py-2">
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
                  <div key={materi.id} className="p-3 bg-white rounded-xl border border-amber-200 shadow-2xs space-y-1">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block truncate">
                      {materi.category}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 truncate" title={materi.title}>
                      {materi.title}
                    </h4>
                    <p className="text-sm font-extrabold text-amber-700 font-mono">
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
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <BookOpen size={18} className="text-emerald-600" /> Progres Per Kategori Modul
          </h3>

          <div className="space-y-4">
            {chartData.map((item) => (
              <div key={item.category} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>{item.category}</span>
                  <span>{item.Selesai}/{item.Total} Topik ({item.Persentase}%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${item.Persentase}%` }}
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart Visualizer */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <BarChart3 size={18} className="text-purple-600" /> Grafik Capaian Pembelajaran
          </h3>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="category" tick={{ fontSize: 10 }} interval={0} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="Persentase" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
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
