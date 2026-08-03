import React, { useState, useMemo } from 'react';
import { Materi, Penilaian, Student, ActivityLog } from '../../types';
import { Users, BookOpen, FileCheck2, Award, Plus, FileUp, Sparkles, TrendingUp, Clock, CheckCircle2, UserCheck, GraduationCap, ArrowRight, Search, X, Eye, Activity } from 'lucide-react';
import { DistribusiKemahiranChart } from './DistribusiKemahiranChart';
import { GuruDashboardSkeleton } from '../common/Skeleton';
import { MahfudzotOfTheDayCard } from '../common/MahfudzotOfTheDayCard';
import { SiswaActivityVisitsView } from './SiswaActivityVisitsView';

interface GuruDashboardProps {
  materiList: Materi[];
  penilaianList: Penilaian[];
  students: Student[];
  logs: ActivityLog[];
  onNavigate: (tab: string) => void;
  isLoading?: boolean;
  onSwitchToStudentSession?: (student: Student) => void;
  onSelectStudentForDetail?: (studentId: string) => void;
}

export const GuruDashboard: React.FC<GuruDashboardProps> = ({
  materiList,
  penilaianList,
  students,
  logs,
  onNavigate,
  isLoading = false,
  onSwitchToStudentSession,
  onSelectStudentForDetail,
}) => {
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [showPredictions, setShowPredictions] = useState(false);
  const [showLogsVisitsModal, setShowLogsVisitsModal] = useState(false);

  // Predictive student lookup
  const studentPredictions = useMemo(() => {
    const q = studentSearchTerm.trim().toLowerCase();
    if (!q) return [];
    return students.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.nisn.includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.schoolName || '').toLowerCase().includes(q) ||
      (s.rombelName || '').toLowerCase().includes(q)
    ).slice(0, 8);
  }, [students, studentSearchTerm]);

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
            <button
              onClick={() => setShowLogsVisitsModal(true)}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl text-xs sm:text-sm font-black transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Activity size={16} className="text-slate-950" /> Log Aktivitas & Kunjungan Siswa
            </button>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 opacity-10 font-arabic text-[180px] pointer-events-none select-none text-white">
          عربي
        </div>
      </div>

      {/* Quick Predictive Student Search Bar on Beranda Guru */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-2 relative">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl font-bold">
              <Search size={18} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                Pencarian Cepat Siswa (Prediksi Otomatis)
              </h3>
              <p className="text-xs text-slate-500">
                Ketik nama, NISN, rombel, atau sekolah siswa untuk menemukan profil & data siswa secara instan.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('siswa')}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline shrink-0 hidden sm:flex items-center gap-1"
          >
            Lihat Semua Data Siswa <ArrowRight size={13} />
          </button>
        </div>

        {/* Search Input Box */}
        <div className="relative mt-2">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari nama siswa, NISN, kelas, atau nama sekolah..."
            value={studentSearchTerm}
            onChange={(e) => {
              setStudentSearchTerm(e.target.value);
              setShowPredictions(true);
            }}
            onFocus={() => setShowPredictions(true)}
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:bg-white shadow-2xs transition-all"
          />
          {studentSearchTerm && (
            <button
              type="button"
              onClick={() => {
                setStudentSearchTerm('');
                setShowPredictions(false);
              }}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
            >
              <X size={16} />
            </button>
          )}

          {/* PREDICTIVE AUTOCOMPLETE RESULTS DROPDOWN */}
          {showPredictions && studentPredictions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-100 animate-fadeIn">
              <div className="px-3.5 py-2 bg-slate-100/90 text-[10px] font-extrabold uppercase tracking-wider text-slate-600 flex items-center justify-between">
                <span>✨ Prediksi Profil Siswa ({studentPredictions.length} Ditemukan)</span>
                <span className="text-[9px] text-slate-400 font-normal">Klik siswa untuk aksi cepat</span>
              </div>

              {studentPredictions.map((st) => (
                <div
                  key={st.id}
                  className="p-3 hover:bg-emerald-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={st.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={st.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0 shadow-2xs"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 truncate">
                          {st.name}
                        </p>
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border ${
                          st.status === 'pending'
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : st.status === 'ditolak'
                            ? 'bg-rose-50 text-rose-700 border-rose-300'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        }`}>
                          {st.status === 'pending' ? 'Pending' : st.status === 'ditolak' ? 'Ditolak' : 'Aktif'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        NISN: <span className="font-mono font-medium text-slate-700">{st.nisn}</span> • Kelas {st.className} ({st.rombelName || 'Umum'}) • {st.schoolName || 'Tanpa Sekolah'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => {
                        if (onSelectStudentForDetail) {
                          onSelectStudentForDetail(st.id);
                        } else {
                          onNavigate('siswa');
                        }
                        setShowPredictions(false);
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer border border-slate-200"
                    >
                      <Eye size={12} /> Detail Siswa
                    </button>
                    {onSwitchToStudentSession && (
                      <button
                        type="button"
                        onClick={() => {
                          onSwitchToStudentSession(st);
                          setShowPredictions(false);
                        }}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all shadow-2xs cursor-pointer"
                      >
                        <UserCheck size={12} /> Simulasi Log In
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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

      {/* Widget Pengujian Demo Cepat Akun Siswa untuk Admin/Guru */}
      {onSwitchToStudentSession && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-emerald-500/10 dark:from-amber-950/40 dark:to-emerald-950/40 rounded-2xl p-5 border border-amber-300/60 dark:border-amber-800/60 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 dark:border-amber-800/40 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-500 text-amber-950 font-black rounded-xl shadow-xs">
                <UserCheck size={18} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  Pengujian Akses Akun Siswa (Demo / Simulasi)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Fitur Admin: Pilih akun siswa dummy di bawah untuk mensimulasikan tampilan portal LMS dari sudut pandang siswa (طَالِبٌ / طَالِبَةٌ).
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('siswa')}
              className="text-xs font-bold text-amber-800 dark:text-amber-300 hover:underline flex items-center gap-1 self-start sm:self-auto shrink-0"
            >
              Kelola Semua Siswa <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {students.slice(0, 4).map((std) => (
              <div
                key={std.id}
                className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between space-y-2 hover:border-amber-400 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={std.avatar}
                    alt={std.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-slate-100 truncate">
                      {std.name}
                    </h4>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        std.gender === 'Perempuan'
                          ? 'bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300'
                          : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      }`}>
                        {std.gender === 'Perempuan' ? '👩 طَالِبَةٌ' : '👨 طَالِبٌ'}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {std.className}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onSwitchToStudentSession(std)}
                  className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                >
                  <UserCheck size={13} />
                  <span>Simulasi Log In</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {/* MODAL OVERLAY: Siswa Activity Logs & Visit Analytics */}
      {showLogsVisitsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
          <div className="w-full my-auto">
            <SiswaActivityVisitsView
              students={students}
              logs={logs}
              onClose={() => setShowLogsVisitsModal(false)}
            />
          </div>
        </div>
      )}

    </div>
  );
};
