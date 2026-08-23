import React, { useState, useMemo } from 'react';
import { Student } from '../../types';
import { Building2, BarChart3, Trophy, Filter, Award } from 'lucide-react';

interface DistribusiKemahiranChartProps {
  students: Student[];
}

export const DistribusiKemahiranChart: React.FC<DistribusiKemahiranChartProps> = ({ students }) => {
  const [metricView, setMetricView] = useState<'nilai' | 'tingkat'>('nilai');
  const [selectedSchool, setSelectedSchool] = useState<string>('semua');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Extract unique school names for filter
  const schoolNames = useMemo(() => {
    const list = students.map(s => s.schoolName || 'Tanpa Sekolah');
    return Array.from(new Set(list));
  }, [students]);

  // Aggregate student data by School & Class
  const chartData = useMemo(() => {
    const filteredStudents = selectedSchool === 'semua' 
      ? students 
      : students.filter(s => (s.schoolName || 'Tanpa Sekolah') === selectedSchool);

    const groups: { [key: string]: {
      label: string;
      schoolName: string;
      className: string;
      studentCount: number;
      totalScoresSum: number;
      totalAttemptsCount: number;
      totalXP: number;
      dasarCount: number;
      menengahPertamaCount: number;
      menengahAkhirCount: number;
      tinggiCount: number;
    } } = {};

    filteredStudents.forEach(s => {
      const school = s.schoolName || 'Tanpa Sekolah';
      const cls = s.className || 'Kelas Umum';
      const key = `${school} - ${cls}`;

      if (!groups[key]) {
        groups[key] = {
          label: `${school.length > 14 ? school.substring(0, 12) + '...' : school} (${cls})`,
          schoolName: school,
          className: cls,
          studentCount: 0,
          totalScoresSum: 0,
          totalAttemptsCount: 0,
          totalXP: 0,
          dasarCount: 0,
          menengahPertamaCount: 0,
          menengahAkhirCount: 0,
          tinggiCount: 0,
        };
      }

      const g = groups[key];
      g.studentCount += 1;
      g.totalXP += s.totalXP || 0;

      // Scores
      if (s.attempts && s.attempts.length > 0) {
        s.attempts.forEach(a => {
          g.totalScoresSum += a.score;
          g.totalAttemptsCount += 1;
        });
      }

      // Tingkat count
      const t = s.tingkat || 'Dasar';
      if (t === 'Dasar') g.dasarCount += 1;
      else if (t === 'Menengah Pertama') g.menengahPertamaCount += 1;
      else if (t === 'Menengah Akhir') g.menengahAkhirCount += 1;
      else if (t === 'Tinggi' || t === 'Umum') g.tinggiCount += 1;
      else g.dasarCount += 1;
    });

    return Object.values(groups).map(g => {
      const avgScore = g.totalAttemptsCount > 0 ? Math.round(g.totalScoresSum / g.totalAttemptsCount) : 80;
      const avgXP = g.studentCount > 0 ? Math.round(g.totalXP / g.studentCount) : 0;

      return {
        ...g,
        avgScore,
        avgXP,
      };
    });
  }, [students, selectedSchool]);

  // Compute top performing group
  const topGroup = useMemo(() => {
    if (chartData.length === 0) return null;
    return [...chartData].sort((a, b) => b.avgScore - a.avgScore)[0];
  }, [chartData]);

  const barColors = ['#10b981', '#0284c7', '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6'];
  const maxScore = 100;
  const maxXP = Math.max(...chartData.map(d => d.avgXP), 500);
  const maxStudents = Math.max(...chartData.map(d => d.studentCount), 10);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 sm:p-6 space-y-5">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <BarChart3 size={20} />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Distribusi Kemahiran Siswa per Sekolah & Kelas
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Grafik perbandingan rata-rata nilai, tingkat kemahiran, dan keaktifan antar kelas
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* School Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <Filter size={14} className="text-slate-400" />
            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="semua">Semua Asal Sekolah</option>
              {schoolNames.map((sch, i) => (
                <option key={i} value={sch}>{sch}</option>
              ))}
            </select>
          </div>

          {/* Metric View Switcher */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold gap-1">
            <button
              onClick={() => setMetricView('nilai')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                metricView === 'nilai'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Nilai & XP
            </button>
            <button
              onClick={() => setMetricView('tingkat')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                metricView === 'tingkat'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Jumlah Siswa per Tingkat
            </button>
          </div>
        </div>
      </div>

      {/* Top Highlights Summary */}
      {topGroup && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 rounded-xl flex items-center gap-3">
            <Trophy size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase">Kelas Terunggul</span>
              <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{topGroup.schoolName}</p>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold">{topGroup.className} • Rerata Nilai {topGroup.avgScore}</p>
            </div>
          </div>

          <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800 rounded-xl flex items-center gap-3">
            <Building2 size={20} className="text-blue-600 dark:text-blue-400 shrink-0" />
            <div>
              <span className="text-[10px] text-blue-700 dark:text-blue-400 font-bold uppercase">Total Kelompok Kelas</span>
              <p className="font-bold text-slate-900 dark:text-slate-100">{chartData.length} Kelompok Sekolah & Kelas</p>
              <p className="text-[11px] text-blue-800 dark:text-blue-300 font-semibold">{students.length} Siswa Terdistribusi</p>
            </div>
          </div>

          <div className="p-3 bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800 rounded-xl flex items-center gap-3">
            <Award size={20} className="text-purple-600 dark:text-purple-400 shrink-0" />
            <div>
              <span className="text-[10px] text-purple-700 dark:text-purple-400 font-bold uppercase">Status Evaluasi</span>
              <p className="font-bold text-slate-900 dark:text-slate-100">Kinerja Sangat Baik</p>
              <p className="text-[11px] text-purple-800 dark:text-purple-300 font-semibold">Tingkat Pemahaman Stabil</p>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Responsive SVG / Tailwind Chart */}
      <div className="w-full pt-2">
        {chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-400 text-xs font-medium border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            Tidak ada data siswa untuk disajikan dalam grafik.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Chart Area */}
            <div className="h-64 flex items-end gap-3 sm:gap-6 px-2 sm:px-6 pt-6 pb-2 border-b border-slate-200 dark:border-slate-800 relative bg-slate-50/50 dark:bg-slate-950/30 rounded-xl">
              {/* Horizontal Grid lines */}
              <div className="absolute inset-x-0 top-6 bottom-8 flex flex-col justify-between pointer-events-none opacity-40">
                <div className="border-b border-slate-200 dark:border-slate-800 w-full" />
                <div className="border-b border-slate-200 dark:border-slate-800 w-full" />
                <div className="border-b border-slate-200 dark:border-slate-800 w-full" />
              </div>

              {chartData.map((item, idx) => {
                const scoreHeightPct = Math.min(100, Math.max(8, (item.avgScore / maxScore) * 100));
                const xpHeightPct = Math.min(100, Math.max(8, (item.avgXP / maxXP) * 100));
                const isHovered = hoveredIndex === idx;

                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {/* Tooltip on Hover */}
                    {isHovered && (
                      <div className="absolute bottom-full mb-3 z-30 bg-slate-900 text-white text-xs p-3 rounded-xl shadow-xl min-w-[180px] pointer-events-none animate-fadeIn border border-slate-700">
                        <div className="font-bold border-b border-slate-700 pb-1 mb-1.5 text-slate-200">
                          {item.schoolName} ({item.className})
                        </div>
                        <div className="space-y-1 text-[11px]">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Total Siswa:</span>
                            <span className="font-bold text-white">{item.studentCount} Siswa</span>
                          </div>
                          {metricView === 'nilai' ? (
                            <>
                              <div className="flex justify-between">
                                <span className="text-emerald-400">Rerata Nilai:</span>
                                <span className="font-bold text-emerald-400">{item.avgScore} / 100</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-amber-400">Rerata XP:</span>
                                <span className="font-bold text-amber-400">{item.avgXP} XP</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex justify-between">
                                <span className="text-emerald-400">Dasar:</span>
                                <span className="font-bold">{item.dasarCount}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sky-400">Menengah Pertama:</span>
                                <span className="font-bold">{item.menengahPertamaCount}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-purple-400">Menengah Akhir:</span>
                                <span className="font-bold">{item.menengahAkhirCount}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-amber-400">Umum / Tinggi:</span>
                                <span className="font-bold">{item.tinggiCount}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Bars based on metric */}
                    {metricView === 'nilai' ? (
                      <div className="w-full flex items-end justify-center gap-1.5 sm:gap-2 h-full z-10">
                        {/* Score Bar */}
                        <div
                          className="w-1/2 max-w-[28px] rounded-t-lg transition-all duration-300 relative group-hover:brightness-110"
                          style={{
                            height: `${scoreHeightPct}%`,
                            backgroundColor: barColors[idx % barColors.length],
                          }}
                        >
                          <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-extrabold text-slate-700 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                            {item.avgScore}
                          </span>
                        </div>
                        {/* XP Bar */}
                        <div
                          className="w-1/2 max-w-[28px] rounded-t-lg bg-amber-400/80 transition-all duration-300 relative group-hover:brightness-110"
                          style={{ height: `${xpHeightPct}%` }}
                        >
                          <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-extrabold text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            {item.avgXP}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full max-w-[36px] flex flex-col justify-end rounded-t-lg overflow-hidden transition-all duration-300 h-full z-10">
                        {/* Stacked Bars */}
                        {item.tinggiCount > 0 && (
                          <div
                            className="bg-amber-500 w-full"
                            style={{ height: `${(item.tinggiCount / maxStudents) * 100}%` }}
                          />
                        )}
                        {item.menengahAkhirCount > 0 && (
                          <div
                            className="bg-purple-500 w-full"
                            style={{ height: `${(item.menengahAkhirCount / maxStudents) * 100}%` }}
                          />
                        )}
                        {item.menengahPertamaCount > 0 && (
                          <div
                            className="bg-sky-500 w-full"
                            style={{ height: `${(item.menengahPertamaCount / maxStudents) * 100}%` }}
                          />
                        )}
                        {item.dasarCount > 0 && (
                          <div
                            className="bg-emerald-500 w-full"
                            style={{ height: `${(item.dasarCount / maxStudents) * 100}%` }}
                          />
                        )}
                      </div>
                    )}

                    {/* Label */}
                    <div className="mt-2 text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 text-center truncate max-w-full">
                      {item.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs pt-1">
              {metricView === 'nilai' ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block" />
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Rata-rata Nilai (Skala 0-100)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-amber-400 inline-block" />
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Rata-rata XP Siswa</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block" />
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Dasar</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-sky-500 inline-block" />
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Menengah Pertama</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-purple-500 inline-block" />
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Menengah Akhir</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-amber-500 inline-block" />
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Umum / Tinggi</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
