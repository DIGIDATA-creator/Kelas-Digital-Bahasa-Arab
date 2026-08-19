import React, { useState, useMemo } from 'react';
import { Student, DetailedActivityLog, QuizAttempt, Materi } from '../../types';
import { Clock, Play, CheckCircle2, Award, BookOpen, Calendar, Search, Filter, Timer, Sparkles, AlertCircle, ArrowUpRight } from 'lucide-react';

interface DetailedActivityLogViewProps {
  student: Student;
  materiList?: Materi[];
}

export const DetailedActivityLogView: React.FC<DetailedActivityLogViewProps> = ({
  student,
  materiList = [],
}) => {
  const [activeTab, setActiveTab] = useState<'semua' | 'kuis' | 'materi' | 'latihan'>('semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Combine logs from student.detailedActivityLogs and student.attempts
  const combinedLogs = useMemo(() => {
    const logList: DetailedActivityLog[] = [...(student.detailedActivityLogs || [])];
    const logAttemptIds = new Set(logList.map(l => l.id));

    // Convert attempts that might not be in detailedActivityLogs yet
    (student.attempts || []).forEach((att) => {
      const attLogId = `act-quiz-${att.id}`;
      if (!logAttemptIds.has(attLogId)) {
        const completedAt = att.completedAt || new Date().toISOString();
        const durationSeconds = att.timeSpentSeconds || 60;
        const startedAt = att.startedAt || att.accessedAt || new Date(new Date(completedAt).getTime() - durationSeconds * 1000).toISOString();

        logList.push({
          id: attLogId,
          studentId: student.id,
          type: att.penilaianType === 'latihan' ? 'latihan' : 'kuis',
          title: att.penilaianTitle,
          category: att.category,
          startedAt,
          completedAt,
          durationSeconds,
          score: att.score,
          passed: att.passed,
          earnedExp: att.earnedExp !== undefined ? att.earnedExp : (att.passed ? att.score : 0),
          details: `Nilai: ${att.score}/100 (${att.passed ? 'Lulus' : 'Belum Lulus'})`,
        });
      }
    });

    // If student has reading time for materials, synthesize logs if not present
    if (student.materialReadingTimeSeconds) {
      Object.entries(student.materialReadingTimeSeconds).forEach(([materiId, rawSecs]) => {
        const secs = Number(rawSecs) || 0;
        if (secs > 0) {
          const mat = materiList.find(m => m.id === materiId);
          const hasMatLog = logList.some(l => l.type === 'materi' && (l.title === mat?.title || l.id.includes(materiId)));
          if (!hasMatLog && mat) {
            const completedAt = student.lastActive || new Date().toISOString();
            const startedAt = new Date(new Date(completedAt).getTime() - secs * 1000).toISOString();
            logList.push({
              id: `act-synth-mat-${materiId}`,
              studentId: student.id,
              type: 'materi',
              title: mat.title,
              category: mat.category,
              startedAt,
              completedAt,
              durationSeconds: secs,
              earnedExp: student.completedMaterials?.includes(materiId) ? 50 : 0,
              details: `Membaca & mempelajari modul ${mat.title}`,
            });
          }
        }
      });
    }

    // Sort by startedAt or completedAt descending (newest first)
    return logList.sort((a, b) => {
      const timeA = new Date(a.completedAt || a.startedAt).getTime();
      const timeB = new Date(b.completedAt || b.startedAt).getTime();
      return timeB - timeA;
    });
  }, [student, materiList]);

  // Filter logs based on activeTab and searchQuery
  const filteredLogs = useMemo(() => {
    return combinedLogs.filter((log) => {
      // Category tab filter
      if (activeTab === 'kuis' && log.type !== 'kuis') return false;
      if (activeTab === 'materi' && log.type !== 'materi') return false;
      if (activeTab === 'latihan' && log.type !== 'latihan') return false;

      // Text search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = log.title?.toLowerCase().includes(query);
        const matchDetails = log.details?.toLowerCase().includes(query);
        const matchCat = log.category?.toLowerCase().includes(query);
        return matchTitle || matchDetails || matchCat;
      }

      return true;
    });
  }, [combinedLogs, activeTab, searchQuery]);

  // Calculate stats summary
  const totalDurationSeconds = combinedLogs.reduce((sum, l) => sum + (l.durationSeconds || 0), 0);
  const totalHours = Math.floor(totalDurationSeconds / 3600);
  const totalMins = Math.floor((totalDurationSeconds % 3600) / 60);

  // Helper date formatting function
  const formatDateTime = (isoString?: string) => {
    if (!isoString) return '-';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  // Helper duration formatting function
  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return '0 dtk';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.round(seconds % 60);

    if (hrs > 0) {
      return `${hrs} jam ${mins}m ${secs}s`;
    }
    if (mins > 0) {
      return `${mins} mnt ${secs} dtk`;
    }
    return `${secs} dtk`;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5 p-5">
      
      {/* Header & Stats Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-xl">
              <Clock size={20} />
            </span>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                Log Riwayat Aktivitas Pembelajaran
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Laporan transparan waktu mulai, waktu selesai, dan durasi pengerjaan setiap materi & kuis
              </p>
            </div>
          </div>
        </div>

        {/* Quick Duration & Total Session Summary Cards */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-right">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">Total Aktivitas</span>
            <span className="text-sm font-black text-slate-800 dark:text-slate-100">{combinedLogs.length} Sesi</span>
          </div>

          <div className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-right">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-600 dark:text-emerald-400 block">Total Durasi Belajar</span>
            <span className="text-sm font-black text-emerald-700 dark:text-emerald-300 font-mono">
              {totalHours > 0 ? `${totalHours}j ` : ''}{totalMins} mnt
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl gap-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('semua')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'semua'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Semua ({combinedLogs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('materi')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'materi'
                ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            📚 Materi ({combinedLogs.filter(l => l.type === 'materi').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('kuis')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'kuis'
                ? 'bg-purple-600 text-white shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🏆 Kuis ({combinedLogs.filter(l => l.type === 'kuis').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('latihan')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'latihan'
                ? 'bg-sky-600 text-white shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            📝 Latihan ({combinedLogs.filter(l => l.type === 'latihan').length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari aktivitas atau materi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>
      </div>

      {/* Logs Table / List */}
      {filteredLogs.length === 0 ? (
        <div className="py-12 text-center space-y-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Belum Ada Riwayat Aktivitas</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              {searchQuery ? 'Tidak ada hasil yang sesuai dengan pencarian Anda.' : 'Aktivitas belajar dan pengerjaan kuis akan tercatat secara otomatis di sini.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-extrabold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-3.5">Nama Aktivitas / Modul</th>
                <th className="py-3 px-3.5">Kategori</th>
                <th className="py-3 px-3.5">🕒 Waktu Mulai</th>
                <th className="py-3 px-3.5">🏁 Waktu Selesai</th>
                <th className="py-3 px-3.5 text-center">⏱️ Durasi Pengerjaan</th>
                <th className="py-3 px-3.5 text-center">Hasil & Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredLogs.map((log, idx) => {
                const isQuiz = log.type === 'kuis' || log.type === 'latihan';

                return (
                  <tr key={`${log.id || 'log'}-${idx}`} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    {/* Activity Title & Type Badge */}
                    <td className="py-3 px-3.5">
                      <div className="flex items-start gap-2.5">
                        <span className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                          log.type === 'materi'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                            : log.type === 'kuis'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300'
                            : 'bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300'
                        }`}>
                          {log.type === 'materi' ? <BookOpen size={14} /> : <Award size={14} />}
                        </span>
                        <div>
                          <p className="font-extrabold text-slate-900 dark:text-slate-100 text-xs">
                            {log.title}
                          </p>
                          {log.details && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                              {log.details}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category Tag */}
                    <td className="py-3 px-3.5">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 inline-block">
                        {log.category || log.type}
                      </span>
                    </td>

                    {/* Waktu Mulai */}
                    <td className="py-3 px-3.5 font-mono text-[11px] text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-slate-400" />
                        <span>{formatDateTime(log.startedAt)}</span>
                      </div>
                    </td>

                    {/* Waktu Selesai */}
                    <td className="py-3 px-3.5 font-mono text-[11px] text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={12} className="text-emerald-500" />
                        <span>{formatDateTime(log.completedAt)}</span>
                      </div>
                    </td>

                    {/* Durasi Pengerjaan */}
                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-extrabold font-mono text-xs rounded-lg border border-amber-200 dark:border-amber-800/60 shadow-2xs">
                        <Timer size={12} className="text-amber-600 dark:text-amber-400" />
                        {formatDuration(log.durationSeconds)}
                      </span>
                    </td>

                    {/* Hasil / Score & XP */}
                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      {isQuiz ? (
                        <div className="inline-flex flex-col items-center">
                          <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[11px] ${
                            log.score !== undefined && log.score >= 75
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-700'
                          }`}>
                            Nilai: {log.score ?? 0} {log.passed ? '(Lulus)' : '(Remedial)'}
                          </span>
                          {log.earnedExp !== undefined && log.earnedExp > 0 && (
                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                              +{log.earnedExp} XP
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="inline-flex flex-col items-center">
                          <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-[11px] rounded-full">
                            Selesai Membaca
                          </span>
                          {log.earnedExp !== undefined && log.earnedExp > 0 && (
                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                              +{log.earnedExp} XP
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
