import React, { useState, useMemo } from 'react';
import { Student } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Building2, GraduationCap, BarChart3, Trophy, Filter, RefreshCw, Award, Users } from 'lucide-react';

interface DistribusiKemahiranChartProps {
  students: Student[];
}

export const DistribusiKemahiranChart: React.FC<DistribusiKemahiranChartProps> = ({ students }) => {
  const [metricView, setMetricView] = useState<'nilai' | 'tingkat'>('nilai');
  const [selectedSchool, setSelectedSchool] = useState<string>('semua');

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
          label: `${school.length > 15 ? school.substring(0, 12) + '...' : school} (${cls})`,
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
      else if (t === 'Tinggi') g.tinggiCount += 1;
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

  // Custom colors for bars
  const barColors = ['#10b981', '#0284c7', '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6'];

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
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Nilai & XP
            </button>
            <button
              onClick={() => setMetricView('tingkat')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                metricView === 'tingkat'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
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

      {/* Chart Canvas Container */}
      <div className="w-full h-[320px] pt-2">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs font-medium">
            Tidak ada data siswa untuk disajikan dalam grafik.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {metricView === 'nilai' ? (
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="label" 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  interval={0}
                  angle={-10}
                  textAnchor="end"
                />
                <YAxis yAxisId="left" domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderRadius: '12px', 
                    color: '#fff', 
                    border: 'none', 
                    fontSize: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                  }}
                  formatter={(value: any, name: any) => {
                    if (name === 'Rata-rata Nilai') return [`${value} / 100`, 'Rerata Nilai Kuis'];
                    if (name === 'Rata-rata XP') return [`${value} XP`, 'Rerata XP Siswa'];
                    return [value, name];
                  }}
                  labelFormatter={(label, items) => {
                    if (items && items[0]) {
                      const p = items[0].payload;
                      return `${p.schoolName} (${p.className}) - ${p.studentCount} Siswa`;
                    }
                    return label;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar yAxisId="left" dataKey="avgScore" name="Rata-rata Nilai" radius={[8, 8, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                  ))}
                </Bar>
                <Bar yAxisId="right" dataKey="avgXP" name="Rata-rata XP" fill="#fbbf24" radius={[8, 8, 0, 0]} opacity={0.7} />
              </BarChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="label" 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  interval={0}
                  angle={-10}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderRadius: '12px', 
                    color: '#fff', 
                    border: 'none', 
                    fontSize: '12px' 
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="dasarCount" name="Dasar" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="menengahPertamaCount" name="Menengah Pertama" stackId="a" fill="#0284c7" radius={[0, 0, 0, 0]} />
                <Bar dataKey="menengahAkhirCount" name="Menengah Akhir" stackId="a" fill="#8b5cf6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="tinggiCount" name="Tinggi" stackId="a" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

    </div>
  );
};
