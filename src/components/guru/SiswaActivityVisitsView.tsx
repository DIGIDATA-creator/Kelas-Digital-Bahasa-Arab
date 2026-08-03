import React, { useState } from 'react';
import { ActivityLog, Student } from '../../types';
import {
  Activity,
  Calendar,
  Search,
  Filter,
  Clock,
  UserCheck,
  Users,
  BarChart2,
  X,
  FileText,
  Eye,
  CheckCircle2,
  LogIn,
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface SiswaActivityVisitsViewProps {
  students: Student[];
  logs: ActivityLog[];
  onClose?: () => void;
}

export const SiswaActivityVisitsView: React.FC<SiswaActivityVisitsViewProps> = ({
  students,
  logs,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'logs' | 'visits'>('visits');

  // Logs Filter State
  const [logSearch, setLogSearch] = useState('');
  const [logFilterRole, setLogFilterRole] = useState<'all' | 'siswa' | 'guru'>('siswa');
  const [logCategory, setLogCategory] = useState<string>('all');

  // Visits Filter State
  const [visitSearch, setVisitSearch] = useState('');
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<Student | null>(null);

  // Filter logs
  const filteredLogs = logs.filter(log => {
    if (logFilterRole !== 'all' && log.userRole !== logFilterRole) return false;

    if (logCategory !== 'all') {
      const act = log.action.toLowerCase();
      if (logCategory === 'kuis' && !act.includes('kuis') && !act.includes('ujian') && !act.includes('pengerjaan')) return false;
      if (logCategory === 'hafalan' && !act.includes('hafalan') && !act.includes('mufrodat') && !act.includes('mahfudzot')) return false;
      if (logCategory === 'materi' && !act.includes('materi') && !act.includes('membaca')) return false;
      if (logCategory === 'forum' && !act.includes('forum') && !act.includes('diskusi')) return false;
      if (logCategory === 'visit' && !act.includes('kunjungan') && !act.includes('login')) return false;
    }

    if (logSearch.trim()) {
      const q = logSearch.toLowerCase();
      return (
        log.userName.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q)
      );
    }

    return true;
  });

  // Calculate visits range metrics for a student
  const now = new Date().getTime();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const SEVEN_DAYS_MS = 7 * ONE_DAY_MS;
  const THIRTY_DAYS_MS = 30 * ONE_DAY_MS;

  const getStudentVisitStats = (std: Student) => {
    const history = std.visitHistory || [];
    // If no explicit visitHistory array, synthesize fallback count from lastActive
    let totalVisits = history.length > 0 ? history.length : (std.visitCount || 1);
    let visits1Week = 0;
    let visits1Month = 0;

    if (history.length > 0) {
      history.forEach(ts => {
        const time = new Date(ts).getTime();
        const diff = now - time;
        if (diff <= SEVEN_DAYS_MS) visits1Week++;
        if (diff <= THIRTY_DAYS_MS) visits1Month++;
      });
    } else {
      // Fallback calculation if lastActive exists
      if (std.lastActive) {
        const diff = now - new Date(std.lastActive).getTime();
        if (diff <= SEVEN_DAYS_MS) visits1Week = Math.max(1, totalVisits);
        if (diff <= THIRTY_DAYS_MS) visits1Month = Math.max(1, totalVisits);
      }
    }

    return {
      totalVisits,
      visits1Week,
      visits1Month,
      history,
    };
  };

  // Overall system metrics
  let totalAllVisits = 0;
  let total1WeekVisits = 0;
  let total1MonthVisits = 0;

  students.forEach(s => {
    const st = getStudentVisitStats(s);
    totalAllVisits += st.totalVisits;
    total1WeekVisits += st.visits1Week;
    total1MonthVisits += st.visits1Month;
  });

  const filteredStudents = students.filter(std => {
    if (!visitSearch.trim()) return true;
    const q = visitSearch.toLowerCase();
    return (
      std.name.toLowerCase().includes(q) ||
      std.nisn.toLowerCase().includes(q) ||
      std.className.toLowerCase().includes(q) ||
      (std.rombelName && std.rombelName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden max-w-6xl mx-auto my-4">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] uppercase font-black tracking-wider border border-emerald-500/30">
                Menu Peninjauan Guru
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Activity className="text-emerald-400 shrink-0" size={24} />
              <span>Log Aktivitas & Kunjungan Siswa</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Pantau rekam jejak aktivitas belajar, penyelesaian materi, pengerjaan kuis, serta statistik frekuensi kunjungan siswa dalam rentang 1 pekan & 1 bulan.
            </p>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all cursor-pointer shrink-0"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('visits')}
            className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'visits'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <BarChart2 size={16} />
            <span>2. Data Kunjungan Siswa</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-900/40 text-[10px] font-extrabold">
              {students.length} Siswa
            </span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Activity size={16} />
            <span>1. Log Aktivitas Siswa</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-900/40 text-[10px] font-extrabold">
              {logs.length} Log
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: LOG AKTIVITAS SISWA */}
      {activeTab === 'logs' && (
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Cari nama siswa atau tindakan..."
                value={logSearch}
                onChange={e => setLogSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end text-xs">
              <span className="text-slate-500 font-bold flex items-center gap-1">
                <Filter size={14} /> Filter:
              </span>

              <select
                value={logFilterRole}
                onChange={e => setLogFilterRole(e.target.value as any)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 cursor-pointer"
              >
                <option value="siswa">Hanya Siswa</option>
                <option value="guru">Hanya Guru</option>
                <option value="all">Semua Peran</option>
              </select>

              <select
                value={logCategory}
                onChange={e => setLogCategory(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 cursor-pointer"
              >
                <option value="all">Semua Kategori</option>
                <option value="kuis">Kuis & Ujian</option>
                <option value="hafalan">Hafalan</option>
                <option value="materi">Materi</option>
                <option value="forum">Forum Diskusi</option>
                <option value="visit">Kunjungan</option>
              </select>
            </div>
          </div>

          {/* Logs List Timeline */}
          <div className="space-y-3">
            {filteredLogs.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-300 text-slate-400 space-y-2">
                <Activity size={36} className="mx-auto text-slate-300" />
                <p className="font-bold text-sm text-slate-600">Tidak ada data log aktivitas yang sesuai filter.</p>
              </div>
            ) : (
              filteredLogs.map(log => (
                <div
                  key={log.id}
                  className="p-4 bg-white hover:bg-slate-50/80 rounded-2xl border border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs ${
                      log.userRole === 'guru' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}>
                      {log.userRole === 'guru' ? 'GURU' : 'SISWA'}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-slate-900 text-xs sm:text-sm">{log.userName}</span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-black rounded-md uppercase">
                          {log.action}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">{log.details}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold shrink-0 self-end sm:self-center bg-slate-100/80 px-2.5 py-1 rounded-lg">
                    <Clock size={12} className="text-slate-400" />
                    <span>{new Date(log.timestamp).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* TAB 2: DATA KUNJUNGAN SISWA */}
      {activeTab === 'visits' && (
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Top KPI Cards for Visits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="p-5 bg-gradient-to-br from-emerald-500 to-teal-700 text-white rounded-3xl shadow-md space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-black tracking-wider text-emerald-100">Total Kunjungan Aplikasi</span>
                <LogIn size={20} className="text-emerald-200" />
              </div>
              <p className="text-3xl font-black">{totalAllVisits} <span className="text-xs font-semibold text-emerald-100">kali</span></p>
              <p className="text-[11px] text-emerald-100/90 font-medium pt-1 border-t border-emerald-400/40">
                Akumulasi seluruh riwayat akses siswa ke platform.
              </p>
            </div>

            <div className="p-5 bg-gradient-to-br from-sky-600 to-indigo-800 text-white rounded-3xl shadow-md space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-black tracking-wider text-sky-100">Kunjungan 1 Pekan Terakhir</span>
                <Calendar size={20} className="text-sky-200" />
              </div>
              <p className="text-3xl font-black">{total1WeekVisits} <span className="text-xs font-semibold text-sky-100">akses</span></p>
              <p className="text-[11px] text-sky-100/90 font-medium pt-1 border-t border-sky-400/40">
                Rentang 7 hari terakhir secara real-time.
              </p>
            </div>

            <div className="p-5 bg-gradient-to-br from-purple-600 to-purple-900 text-white rounded-3xl shadow-md space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-black tracking-wider text-purple-100">Kunjungan 1 Bulan Terakhir</span>
                <Clock size={20} className="text-purple-200" />
              </div>
              <p className="text-3xl font-black">{total1MonthVisits} <span className="text-xs font-semibold text-purple-100">akses</span></p>
              <p className="text-[11px] text-purple-100/90 font-medium pt-1 border-t border-purple-400/40">
                Rentang 30 hari terakhir.
              </p>
            </div>

          </div>

          {/* Search Table Filter */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Cari nama siswa atau kelas..."
                value={visitSearch}
                onChange={e => setVisitSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <span className="text-xs font-bold text-slate-500 hidden sm:inline-block">
              Menampilkan {filteredStudents.length} Data Siswa
            </span>
          </div>

          {/* Student Visits Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider">
                    <th className="py-3.5 px-4">Profil Siswa</th>
                    <th className="py-3.5 px-4">Kelas & Rombel</th>
                    <th className="py-3.5 px-4 text-center">Total Kunjungan</th>
                    <th className="py-3.5 px-4 text-center">1 Pekan (7 Hari)</th>
                    <th className="py-3.5 px-4 text-center">1 Bulan (30 Hari)</th>
                    <th className="py-3.5 px-4">Terakhir Aktif</th>
                    <th className="py-3.5 px-4 text-right">Rincian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 font-bold">
                        Tidak ada data siswa ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map(std => {
                      const stats = getStudentVisitStats(std);

                      return (
                        <tr key={std.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={std.avatar}
                                alt={std.name}
                                className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                              />
                              <div>
                                <span className="font-extrabold text-slate-900 block truncate">{std.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono">NISN: {std.nisn}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-700 block">{std.className}</span>
                            <span className="text-[10px] text-slate-400">{std.rombelName || 'Umum'}</span>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 font-black rounded-lg text-xs">
                              {stats.totalVisits}x
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <span className="px-2.5 py-1 bg-sky-100 text-sky-900 border border-sky-300 font-extrabold rounded-lg text-xs">
                              {stats.visits1Week}x
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <span className="px-2.5 py-1 bg-purple-100 text-purple-900 border border-purple-300 font-extrabold rounded-lg text-xs">
                              {stats.visits1Month}x
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <span className="text-slate-600 font-medium block">
                              {std.lastActive ? new Date(std.lastActive).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setSelectedStudentDetail(std)}
                              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ml-auto cursor-pointer"
                            >
                              <Eye size={13} className="text-emerald-400" />
                              <span>Log Akses</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* SUB-MODAL: Detail Log Akses / Kunjungan Siswa Spesifik */}
      {selectedStudentDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto p-6 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={selectedStudentDetail.avatar}
                  alt={selectedStudentDetail.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400"
                />
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Riwayat Kunjungan: {selectedStudentDetail.name}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Kelas {selectedStudentDetail.className} ({selectedStudentDetail.rombelName || 'Umum'})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudentDetail(null)}
                className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Visit stats cards */}
            {(() => {
              const st = getStudentVisitStats(selectedStudentDetail);
              return (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
                      <span className="text-[10px] text-emerald-700 font-bold block uppercase">Total Kunjungan</span>
                      <span className="text-lg font-black text-emerald-900">{st.totalVisits} kali</span>
                    </div>

                    <div className="p-3 bg-sky-50 rounded-2xl border border-sky-200 text-center">
                      <span className="text-[10px] text-sky-700 font-bold block uppercase">7 Hari Terakhir</span>
                      <span className="text-lg font-black text-sky-900">{st.visits1Week} kali</span>
                    </div>

                    <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 text-center">
                      <span className="text-[10px] text-purple-700 font-bold block uppercase">30 Hari Terakhir</span>
                      <span className="text-lg font-black text-purple-900">{st.visits1Month} kali</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                      Timestamp Sesi Kunjungan Terbaru:
                    </h4>

                    <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                      {st.history.length === 0 ? (
                        <div className="p-3 bg-slate-50 rounded-xl text-slate-400 text-center">
                          Terakhir aktif recorded: {selectedStudentDetail.lastActive ? new Date(selectedStudentDetail.lastActive).toLocaleString('id-ID') : 'Belum ada data login.'}
                        </div>
                      ) : (
                        [...st.history].reverse().map((ts, idx) => (
                          <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                            <span className="font-mono text-slate-700 font-semibold">
                              Sesi Kunjungan #{st.history.length - idx}
                            </span>
                            <span className="text-slate-500 font-medium">
                              {new Date(ts).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="pt-2 text-right border-t border-slate-100">
              <button
                onClick={() => setSelectedStudentDetail(null)}
                className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
