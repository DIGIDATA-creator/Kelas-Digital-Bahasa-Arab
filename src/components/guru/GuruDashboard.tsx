import React from 'react';
import { Materi, Penilaian, Student, ActivityLog } from '../../types';
import { Users, BookOpen, FileCheck2, Award, Plus, FileUp, Sparkles, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import { DistribusiKemahiranChart } from './DistribusiKemahiranChart';
import { GuruDashboardSkeleton } from '../common/Skeleton';
import { MahfudzotOfTheDayCard } from '../common/MahfudzotOfTheDayCard';

interface GuruDashboardProps {
  materiList: Materi[];
  penilaianList: Penilaian[];
  students: Student[];
  logs: ActivityLog[];
  onNavigate: (tab: string) => void;
  isLoading?: boolean;
}

export const GuruDashboard: React.FC<GuruDashboardProps> = ({
  materiList,
  penilaianList,
  students,
  logs,
  onNavigate,
  isLoading = false,
}) => {
  if (isLoading) {
    return <GuruDashboardSkeleton />;
  }

  // Compute overall stats
  const totalStudents = students.length;
  const totalMateri = materiList.length;
  const totalPenilaian = penilaianList.length;

  // Flatten all attempts across all students
  const allAttempts = students.flatMap(s => s.attempts);
  const totalSubmissions = allAttempts.length;
  const avgClassScore = totalSubmissions > 0
    ? Math.round(allAttempts.reduce((acc, a) => acc + a.score, 0) / totalSubmissions)
    : 0;

  // Category counts
  const qowaidCount = materiList.filter(m => m.category === 'qowaid').length;
  const hiwarCount = materiList.filter(m => m.category === 'hiwar').length;
  const kosakataCount = materiList.filter(m => m.category === 'kosakata').length;
  const mahfudzotCount = materiList.filter(m => m.category === 'mahfudzot').length;

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-700/50">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold uppercase tracking-wider">
            <Sparkles size={14} /> Panel Guru & Administrator
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ahlan wa Sahlan, Ustaz / Admin!
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Selamat datang di Sistem Manajemen Pembelajaran Digital Bahasa Arab. Kelola materi pembelajaran, unggah file PDF modul, terbitkan kuis interaktif, dan pantau progres belajar siswa secara akurat.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => onNavigate('materi')}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-lg flex items-center gap-2"
            >
              <FileUp size={16} /> Unggah Materi PDF / Baru
            </button>
            <button
              onClick={() => onNavigate('penilaian')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs sm:text-sm font-bold transition-all backdrop-blur-xs flex items-center gap-2 border border-white/20"
            >
              <Plus size={16} /> Buat Kuis / Ujian
            </button>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 opacity-10 font-arabic text-[180px] pointer-events-none select-none text-white">
          عربي
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
            <Users size={26} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Siswa Aktif</p>
            <h3 className="text-2xl font-bold text-slate-800">{totalStudents} <span className="text-xs text-slate-400 font-normal">Siswa</span></h3>
            <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
              <TrendingUp size={12} /> 100% Terdaftar
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <BookOpen size={26} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Materi Terpublikasi</p>
            <h3 className="text-2xl font-bold text-slate-800">{totalMateri} <span className="text-xs text-slate-400 font-normal">Modul</span></h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Qowaid, Hiwar, Kosakata, Mahfudzot
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-purple-50 text-purple-600 rounded-xl">
            <FileCheck2 size={26} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Kuis & Penilaian</p>
            <h3 className="text-2xl font-bold text-slate-800">{totalPenilaian} <span className="text-xs text-slate-400 font-normal">Paket Soal</span></h3>
            <p className="text-[11px] text-purple-600 font-medium mt-0.5">
              {totalSubmissions} kali dikerjakan
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl">
            <Award size={26} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Rata-rata Nilai Kelas</p>
            <h3 className="text-2xl font-bold text-amber-600">{avgClassScore} <span className="text-xs text-slate-400 font-normal">/ 100</span></h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
              Tingkat Kelulusan Tinggi
            </p>
          </div>
        </div>

      </div>

      {/* Bar Chart: Student Proficiency Distribution by School & Class */}
      <DistribusiKemahiranChart students={students} />

      {/* Mahfudzot Hari Ini Card (Rotasi 24 Jam) */}
      <MahfudzotOfTheDayCard materiList={materiList} onNavigate={onNavigate} />

      {/* Main Grid: Category Distribution & Recent Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 cols): Submissions & Student Activity */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recent Quiz Submissions Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Hasil Pengerjaan Kuis Terbaru</h3>
                <p className="text-xs text-slate-500">Daftar siswa yang telah menyelesaikan kuis & ujian</p>
              </div>
              <button
                onClick={() => onNavigate('siswa')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                Lihat Semua Siswa →
              </button>
            </div>

            {allAttempts.length === 0 ? (
              <p className="text-center py-8 text-slate-400 text-sm">Belum ada hasil pengerjaan kuis dari siswa.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3">Siswa</th>
                      <th className="py-3 px-3">Judul Kuis / Ujian</th>
                      <th className="py-3 px-3">Tipe</th>
                      <th className="py-3 px-3 text-center">Nilai</th>
                      <th className="py-3 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allAttempts.slice(-5).reverse().map((att) => (
                      <tr key={att.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-900">
                          {att.studentName}
                        </td>
                        <td className="py-3 px-3 max-w-[200px] truncate">
                          {att.penilaianTitle}
                        </td>
                        <td className="py-3 px-3 uppercase text-[10px] font-bold">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            {att.penilaianType}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-sm">
                          <span className={att.score >= 75 ? 'text-emerald-600' : 'text-rose-600'}>
                            {att.score}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {att.passed ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold text-[10px]">
                              <CheckCircle2 size={12} /> Lulus
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full font-bold text-[10px]">
                              Mengulang
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Category Modules Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl text-center space-y-1">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Qowaid</span>
              <p className="font-arabic text-xl text-emerald-900">الْقَوَاعِدُ</p>
              <p className="text-xs text-slate-600 font-bold">{qowaidCount} Modul</p>
            </div>
            <div className="p-4 bg-teal-50/80 border border-teal-200/80 rounded-2xl text-center space-y-1">
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Hiwar</span>
              <p className="font-arabic text-xl text-teal-900">الْحِوَارُ</p>
              <p className="text-xs text-slate-600 font-bold">{hiwarCount} Percakapan</p>
            </div>
            <div className="p-4 bg-blue-50/80 border border-blue-200/80 rounded-2xl text-center space-y-1">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Kosakata</span>
              <p className="font-arabic text-xl text-blue-900">الْمُفْرَدَاتُ</p>
              <p className="text-xs text-slate-600 font-bold">{kosakataCount} Kartu</p>
            </div>
            <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-center space-y-1">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Mahfudzot</span>
              <p className="font-arabic text-xl text-amber-900">الْمَحْفُوظَاتُ</p>
              <p className="text-xs text-slate-600 font-bold">{mahfudzotCount} Mutiara</p>
            </div>
          </div>

        </div>

        {/* Right Column (1 col): Recent System Logs */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Clock size={18} className="text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Log Aktivitas Terbaru</h3>
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[420px] pr-1">
            {logs.length === 0 ? (
              <p className="text-xs text-slate-400">Belum ada riwayat aktivitas.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <div className="flex justify-between items-center text-slate-500">
                    <span className="font-semibold text-slate-800">{log.userName}</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="font-bold text-emerald-700">{log.action}</p>
                  <p className="text-slate-600 leading-snug">{log.details}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
