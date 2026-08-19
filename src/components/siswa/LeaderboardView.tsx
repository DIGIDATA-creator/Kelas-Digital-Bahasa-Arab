import React, { useState } from 'react';
import { Student, QuizAttempt } from '../../types';
import { Crown, Trophy, BookOpen, Layers, Quote, FileText, CheckCircle2, Clock, X, Eye, Award, Sparkles, AlertCircle } from 'lucide-react';

interface LeaderboardViewProps {
  students: Student[];
  currentStudentId: string;
}

type MainLeaderboardCategory = 'total_xp' | 'hafalan' | 'kuis_mufrodat' | 'kuis_mahfudzot';

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  students,
  currentStudentId,
}) => {
  const [activeCategory, setActiveCategory] = useState<MainLeaderboardCategory>('total_xp');

  // Sub-tabs states
  const [hafalanSubTab, setHafalanSubTab] = useState<'all' | 'kosakata' | 'mahfudzot'>('all');
  const [mufrodatSubTab, setMufrodatSubTab] = useState<'all' | 'arab_indo' | 'indo_arab'>('all');
  const [mahfudzotSubTab, setMahfudzotSubTab] = useState<'all' | 'arab_indo' | 'indo_arab' | 'fill_blank'>('all');

  // Modal for viewing student's EXP breakdown
  const [expDetailModalStudent, setExpDetailModalStudent] = useState<Student | null>(null);

  // Modal for viewing student's quiz logs
  const [quizLogModalData, setQuizLogModalData] = useState<{
    student: Student;
    categoryTitle: string;
    attempts: QuizAttempt[];
  } | null>(null);

  // Helper functions to calculate leaderboard rankings

  // 1. Total XP ranking
  const getSortedByTotalXP = () => {
    return [...students].map(s => ({
      student: s,
      primaryScore: s.totalXP,
      displayLabel: `${s.totalXP} XP`,
      subDetail: `${s.completedMaterials?.length || 0} Modul Selesai`,
      attempts: s.attempts || [],
    })).sort((a, b) => b.primaryScore - a.primaryScore);
  };

  // 2. Hafalan ranking
  const getSortedByHafalan = () => {
    return [...students].map(s => {
      // Kosakata memorized count
      const vocabCount = Object.values(s.hafalanProgress?.kosakataIds || {}).filter(Boolean).length;

      // Mahfudzot memorized count (count checked items in mahfudzotChecklist)
      let mahfudzotCount = 0;
      Object.values(s.hafalanProgress?.mahfudzotChecklist || {}).forEach((chk) => {
        const item = chk as { hafalanArab?: boolean; hafalanTerjemah?: boolean; pengetahuanKosakata?: boolean; pemahamanMateri?: boolean } | undefined;
        if (item) {
          if (item.hafalanArab) mahfudzotCount++;
          if (item.hafalanTerjemah) mahfudzotCount++;
          if (item.pengetahuanKosakata) mahfudzotCount++;
          if (item.pemahamanMateri) mahfudzotCount++;
        }
      });

      let score = 0;
      let label = '';
      let detail = '';

      if (hafalanSubTab === 'kosakata') {
        score = vocabCount;
        label = `${vocabCount} Kosakata`;
        detail = `Dihafal & Diceklis Ust./Ustz.`;
      } else if (hafalanSubTab === 'mahfudzot') {
        score = mahfudzotCount;
        label = `${mahfudzotCount} Poin Mahfudzot`;
        detail = `Dihafal & Diceklis Ust./Ustz.`;
      } else {
        // 'all'
        score = vocabCount + mahfudzotCount;
        label = `${score} Total Hafalan`;
        detail = `${vocabCount} Kosakata + ${mahfudzotCount} Mahfudzot`;
      }

      return {
        student: s,
        primaryScore: score,
        displayLabel: label,
        subDetail: detail,
        attempts: s.attempts || [],
      };
    }).sort((a, b) => b.primaryScore - a.primaryScore);
  };

  // 3. Kuis Mufrodat ranking
  const getSortedByKuisMufrodat = () => {
    return [...students].map(s => {
      const attempts = (s.attempts || []).filter(a => {
        const title = (a.penilaianTitle || '').toLowerCase();
        const cat = (a.penilaianType || '').toLowerCase();
        const isKosakata = title.includes('kosakata') || title.includes('mufrodat') || a.penilaianId.includes('kosakata');
        if (!isKosakata) return false;

        if (mufrodatSubTab === 'arab_indo') {
          return title.includes('arab ➔ indonesia') || title.includes('arab -> indonesia');
        } else if (mufrodatSubTab === 'indo_arab') {
          return title.includes('indonesia ➔ arab') || title.includes('indonesia -> arab');
        }
        return true;
      });

      const maxScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.score)) : 0;
      const passCount = attempts.filter(a => a.passed).length;

      return {
        student: s,
        primaryScore: maxScore,
        displayLabel: attempts.length > 0 ? `Skor Tertinggi: ${maxScore}/100` : 'Belum Ada Kuis',
        subDetail: attempts.length > 0 ? `${attempts.length}x Akses (${passCount}x Lulus)` : '0 Kuis Diakses',
        attempts,
      };
    }).sort((a, b) => b.primaryScore - a.primaryScore);
  };

  // 4. Kuis Mahfudzot ranking
  const getSortedByKuisMahfudzot = () => {
    return [...students].map(s => {
      const attempts = (s.attempts || []).filter(a => {
        const title = (a.penilaianTitle || '').toLowerCase();
        const isMahfudzot = title.includes('mahfudzot') || a.penilaianId.includes('mahfudzot');
        if (!isMahfudzot) return false;

        if (mahfudzotSubTab === 'arab_indo') {
          return title.includes('arab ➔ indonesia') || title.includes('arab -> indonesia');
        } else if (mahfudzotSubTab === 'indo_arab') {
          return title.includes('indonesia ➔ arab') || title.includes('indonesia -> arab');
        } else if (mahfudzotSubTab === 'fill_blank') {
          return title.includes('melengkapi') || title.includes('kata hilang');
        }
        return true;
      });

      const maxScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.score)) : 0;
      const passCount = attempts.filter(a => a.passed).length;

      return {
        student: s,
        primaryScore: maxScore,
        displayLabel: attempts.length > 0 ? `Skor Tertinggi: ${maxScore}/100` : 'Belum Ada Kuis',
        subDetail: attempts.length > 0 ? `${attempts.length}x Akses (${passCount}x Lulus)` : '0 Kuis Diakses',
        attempts,
      };
    }).sort((a, b) => b.primaryScore - a.primaryScore);
  };

  const getActiveLeaderboardList = () => {
    if (activeCategory === 'hafalan') return getSortedByHafalan();
    if (activeCategory === 'kuis_mufrodat') return getSortedByKuisMufrodat();
    if (activeCategory === 'kuis_mahfudzot') return getSortedByKuisMahfudzot();
    return getSortedByTotalXP();
  };

  const currentList = getActiveLeaderboardList();
  const top3 = currentList.slice(0, 3);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 rounded-3xl p-6 text-white shadow-xl space-y-2 relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/20 rounded-full text-xs font-bold uppercase tracking-wider text-amber-100 backdrop-blur-xs">
          <Crown size={16} /> Leaderboard & Top Rangking Digital
        </div>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Klasemen Prestasi Siswa</h2>
        <p className="text-amber-100 text-xs sm:text-sm max-w-xl">
          Pantau peringkat siswa teratas berdasarkan total perolehan XP, statistik jumlah hafalan, dan skor kuis tertinggi.
        </p>
      </div>

      {/* Main Category Tabs Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-900 p-2 rounded-2xl border border-slate-800 shadow-md">
        
        {/* Tab 1: Total XP */}
        <button
          onClick={() => setActiveCategory('total_xp')}
          className={`p-3 rounded-xl text-xs font-extrabold flex items-center gap-2.5 transition-all cursor-pointer ${
            activeCategory === 'total_xp'
              ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-300'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <Trophy size={18} className={activeCategory === 'total_xp' ? 'text-slate-950' : 'text-amber-400'} />
          <div className="text-left">
            <span className="block truncate font-black">1. Total Skor (XP)</span>
            <span className="text-[10px] font-medium opacity-80 block truncate">Seluruh Poin XP</span>
          </div>
        </button>

        {/* Tab 2: Skor Hafalan Terbanyak */}
        <button
          onClick={() => setActiveCategory('hafalan')}
          className={`p-3 rounded-xl text-xs font-extrabold flex items-center gap-2.5 transition-all cursor-pointer ${
            activeCategory === 'hafalan'
              ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <BookOpen size={18} className={activeCategory === 'hafalan' ? 'text-white' : 'text-emerald-400'} />
          <div className="text-left">
            <span className="block truncate font-black">2. Hafalan Terbanyak</span>
            <span className="text-[10px] font-medium opacity-80 block truncate">Ceklis Ust./Ustz.</span>
          </div>
        </button>

        {/* Tab 3: Kuis Mufrodat */}
        <button
          onClick={() => setActiveCategory('kuis_mufrodat')}
          className={`p-3 rounded-xl text-xs font-extrabold flex items-center gap-2.5 transition-all cursor-pointer ${
            activeCategory === 'kuis_mufrodat'
              ? 'bg-sky-600 text-white shadow-md ring-2 ring-sky-400'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <Layers size={18} className={activeCategory === 'kuis_mufrodat' ? 'text-white' : 'text-sky-400'} />
          <div className="text-left">
            <span className="block truncate font-black">3. Kuis Mufrodat</span>
            <span className="text-[10px] font-medium opacity-80 block truncate">Nilai Kosakata</span>
          </div>
        </button>

        {/* Tab 4: Kuis Mahfudzot */}
        <button
          onClick={() => setActiveCategory('kuis_mahfudzot')}
          className={`p-3 rounded-xl text-xs font-extrabold flex items-center gap-2.5 transition-all cursor-pointer ${
            activeCategory === 'kuis_mahfudzot'
              ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-400'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <Quote size={18} className={activeCategory === 'kuis_mahfudzot' ? 'text-white' : 'text-purple-400'} />
          <div className="text-left">
            <span className="block truncate font-black">4. Kuis Mahfudzot</span>
            <span className="text-[10px] font-medium opacity-80 block truncate">Nilai Kata Mutiara</span>
          </div>
        </button>

      </div>

      {/* Sub-Tabs Selector based on active main category */}
      {activeCategory === 'hafalan' && (
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-2">
          <span className="text-xs font-black text-slate-700 uppercase tracking-wider px-2">
            Kategori Sub Hafalan:
          </span>
          <button
            onClick={() => setHafalanSubTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              hafalanSubTab === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            3.2.1 Seluruh Hafalan
          </button>
          <button
            onClick={() => setHafalanSubTab('kosakata')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              hafalanSubTab === 'kosakata'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            3.2.2 Hafalan Kosakata
          </button>
          <button
            onClick={() => setHafalanSubTab('mahfudzot')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              hafalanSubTab === 'mahfudzot'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            3.2.3 Hafalan Mahfudzot
          </button>
        </div>
      )}

      {activeCategory === 'kuis_mufrodat' && (
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-2">
          <span className="text-xs font-black text-slate-700 uppercase tracking-wider px-2">
            Sub Jenis Soal Kosakata:
          </span>
          <button
            onClick={() => setMufrodatSubTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mufrodatSubTab === 'all'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Sub Soal Kosakata
          </button>
          <button
            onClick={() => setMufrodatSubTab('arab_indo')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mufrodatSubTab === 'arab_indo'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Arab ➔ Indonesia
          </button>
          <button
            onClick={() => setMufrodatSubTab('indo_arab')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mufrodatSubTab === 'indo_arab'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Indonesia ➔ Arab
          </button>
        </div>
      )}

      {activeCategory === 'kuis_mahfudzot' && (
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-2">
          <span className="text-xs font-black text-slate-700 uppercase tracking-wider px-2">
            Sub Jenis Soal Mahfudzot:
          </span>
          <button
            onClick={() => setMahfudzotSubTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mahfudzotSubTab === 'all'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Sub Soal Mahfudzot
          </button>
          <button
            onClick={() => setMahfudzotSubTab('arab_indo')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mahfudzotSubTab === 'arab_indo'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Arab ➔ Indonesia
          </button>
          <button
            onClick={() => setMahfudzotSubTab('indo_arab')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mahfudzotSubTab === 'indo_arab'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Indonesia ➔ Arab
          </button>
          <button
            onClick={() => setMahfudzotSubTab('fill_blank')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mahfudzotSubTab === 'fill_blank'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Melengkapi Kata Hilang
          </button>
        </div>
      )}

      {/* Top 3 Winners Podium */}
      <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-4 items-end">
        
        {/* Silver - Rank 2 */}
        {top3[1] && (
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-4 sm:p-6 text-center space-y-2 shadow-xs relative order-1 sm:order-1">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-300 text-slate-800 font-black text-sm flex items-center justify-center border-2 border-white shadow-md">
              2
            </div>
            <img
              src={top3[1].student.avatar}
              alt={top3[1].student.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover mx-auto border-4 border-slate-200 shadow-md"
            />
            <div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm truncate">{top3[1].student.name}</h3>
              <p className="text-[10px] text-slate-400 font-medium">{top3[1].student.className}</p>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <span className="font-black text-slate-800 text-xs sm:text-sm block">{top3[1].displayLabel}</span>
              <span className="text-[10px] text-slate-400 block">{top3[1].subDetail}</span>
            </div>
          </div>
        )}

        {/* Gold - Rank 1 (Center) */}
        {top3[0] && (
          <div className="bg-gradient-to-b from-amber-50 to-white rounded-3xl border-2 border-amber-400 p-5 sm:p-8 text-center space-y-3 shadow-md relative order-2 sm:order-2 -mt-4">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-amber-400 text-amber-950 font-black text-base flex items-center justify-center border-2 border-white shadow-lg">
              <Crown size={20} />
            </div>
            <img
              src={top3[0].student.avatar}
              alt={top3[0].student.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover mx-auto border-4 border-amber-400 shadow-xl"
            />
            <div>
              <span className="text-[10px] uppercase font-extrabold text-amber-800 bg-amber-200/60 px-2.5 py-0.5 rounded-full">Juara Utama</span>
              <h3 className="font-black text-slate-900 text-sm sm:text-base truncate mt-1">{top3[0].student.name}</h3>
              <p className="text-xs text-slate-500 font-medium">{top3[0].student.className}</p>
            </div>
            <div className="pt-2 border-t border-amber-200">
              <span className="font-black text-amber-600 text-sm sm:text-lg block">{top3[0].displayLabel}</span>
              <span className="text-[11px] text-amber-700 font-semibold block">{top3[0].subDetail}</span>
            </div>
          </div>
        )}

        {/* Bronze - Rank 3 */}
        {top3[2] && (
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-4 sm:p-6 text-center space-y-2 shadow-xs relative order-3 sm:order-3">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-amber-700 text-white font-black text-sm flex items-center justify-center border-2 border-white shadow-md">
              3
            </div>
            <img
              src={top3[2].student.avatar}
              alt={top3[2].student.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover mx-auto border-4 border-amber-700/30 shadow-md"
            />
            <div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm truncate">{top3[2].student.name}</h3>
              <p className="text-[10px] text-slate-400 font-medium">{top3[2].student.className}</p>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <span className="font-black text-amber-800 text-xs sm:text-sm block">{top3[2].displayLabel}</span>
              <span className="text-[10px] text-slate-400 block">{top3[2].subDetail}</span>
            </div>
          </div>
        )}

      </div>

      {/* Complete Rankings List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 font-extrabold text-xs text-slate-600 uppercase tracking-wider flex justify-between items-center">
          <span>Peringkat Siswa</span>
          <span>Perolehan / Skor Klasemen</span>
        </div>

        <div className="divide-y divide-slate-100">
          {currentList.map((item, idx) => {
            const std = item.student;
            const isCurrent = std.id === currentStudentId;
            const hasAttempts = item.attempts && item.attempts.length > 0;

            return (
              <div
                key={`${std.id || 'std'}-${idx}`}
                className={`px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  isCurrent ? 'bg-amber-50/80 border-l-4 border-amber-500 font-bold' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className={`w-8 h-8 rounded-xl text-xs font-black flex items-center justify-center shrink-0 ${
                    idx === 0 ? 'bg-amber-400 text-amber-950 shadow-sm' :
                    idx === 1 ? 'bg-slate-300 text-slate-800 shadow-sm' :
                    idx === 2 ? 'bg-amber-700 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {idx + 1}
                  </span>

                  <img
                    src={std.avatar}
                    alt={std.name}
                    className="w-11 h-11 rounded-full object-cover border-2 border-slate-200 shrink-0"
                  />

                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2 flex-wrap">
                      <span className="truncate">{std.name}</span>
                      {isCurrent && (
                        <span className="px-2 py-0.5 bg-emerald-600 text-white text-[9px] font-black rounded-full shrink-0">Saya</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      NISN: {std.nisn} • Kelas {std.className} ({std.rombelName || 'Umum'})
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 self-end sm:self-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 w-full sm:w-auto">
                  <div className="text-left sm:text-right">
                    <span className="text-sm font-black text-amber-600 block">{item.displayLabel}</span>
                    <span className="text-[11px] text-slate-400 font-semibold block">{item.subDetail}</span>
                  </div>

                  {/* Button to open Rincian EXP Modal */}
                  <button
                    type="button"
                    onClick={() => setExpDetailModalStudent(std)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
                  >
                    <Sparkles size={13} className="text-slate-950" /> Rincian EXP
                  </button>

                  {/* Button to open Quiz Logs Modal for Kuis Mufrodat or Kuis Mahfudzot */}
                  {(activeCategory === 'kuis_mufrodat' || activeCategory === 'kuis_mahfudzot') && (
                    <button
                      type="button"
                      onClick={() => setQuizLogModalData({
                        student: std,
                        categoryTitle: activeCategory === 'kuis_mufrodat' ? 'Mufrodat (Kosakata)' : 'Mahfudzot',
                        attempts: item.attempts || [],
                      })}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
                    >
                      <Eye size={13} className="text-amber-400" /> Log Kuis
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: Log Kuis Details for Student */}
      {quizLogModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto space-y-4 p-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={quizLogModalData.student.avatar}
                  alt={quizLogModalData.student.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400"
                />
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    Log Kuis {quizLogModalData.categoryTitle}: {quizLogModalData.student.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Kelas {quizLogModalData.student.className} • NISN: {quizLogModalData.student.nisn}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setQuizLogModalData(null)}
                className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Attempts List */}
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {quizLogModalData.attempts.length === 0 ? (
                <div className="p-8 text-center text-slate-500 space-y-2 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <AlertCircle size={32} className="mx-auto text-slate-400" />
                  <p className="text-xs font-bold">Siswa belum memiliki riwayat pengerjakan kuis {quizLogModalData.categoryTitle}.</p>
                </div>
              ) : (
                quizLogModalData.attempts.map((att, idx) => (
                  <div key={`${att.id || 'att'}-${idx}`} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-start justify-between gap-2 font-bold">
                      <div>
                        <span className="text-slate-900 text-sm block font-black">{att.penilaianTitle}</span>
                        <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                          Tgl Pengerjaan: {new Date(att.completedAt || att.accessedAt || Date.now()).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-extrabold shrink-0 border ${
                        att.passed
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border-rose-300'
                      }`}>
                        {att.passed ? 'LULUS' : 'BELUM LULUS'} ({att.score}/100)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200/80 text-[11px]">
                      <div className="p-2 bg-white rounded-xl border border-slate-200/60">
                        <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Waktu Digunakan:</span>
                        <span className="font-extrabold text-slate-800">{Math.floor(att.timeSpentSeconds / 60)} m {att.timeSpentSeconds % 60} s</span>
                      </div>
                      <div className="p-2 bg-white rounded-xl border border-slate-200/60">
                        <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Poin EXP Diraih:</span>
                        <span className="font-extrabold text-amber-600">
                          {att.earnedExp !== undefined ? `${att.earnedExp >= 0 ? '+' : ''}${att.earnedExp} XP` : `${att.passed ? att.score : 0} XP`}
                        </span>
                      </div>
                      <div className="p-2 bg-white rounded-xl border border-slate-200/60 col-span-2 sm:col-span-1">
                        <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Kode Soal Diakses:</span>
                        <span className="font-mono text-[10px] text-slate-700 block truncate">
                          {att.questionCodes && att.questionCodes.length > 0 ? att.questionCodes.join(', ') : 'Diacak Otomatis'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setQuizLogModalData(null)}
                className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: Rincian EXP Siswa */}
      {expDetailModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto space-y-4 p-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={expDetailModalStudent.avatar}
                  alt={expDetailModalStudent.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-amber-400"
                />
                <div>
                  <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                    <span>Rincian Perolehan EXP</span>
                    <span className="px-2.5 py-0.5 bg-amber-400 text-amber-950 text-xs font-black rounded-full">
                      {expDetailModalStudent.totalXP} XP
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Siswa: <span className="font-bold text-slate-800">{expDetailModalStudent.name}</span> • Kelas {expDetailModalStudent.className} ({expDetailModalStudent.rombelName || 'Umum'})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setExpDetailModalStudent(null)}
                className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* EXP Breakdown Content */}
            {(() => {
              const std = expDetailModalStudent;
              const attempts = std.attempts || [];

              // Calculate Quiz EXP
              let quizExpSum = 0;
              attempts.forEach(a => {
                const exp = a.earnedExp !== undefined ? a.earnedExp : (a.passed ? a.score : 0);
                quizExpSum += exp;
              });

              // Hafalan Kosakata EXP
              const vocabCount = Object.values(std.hafalanProgress?.kosakataIds || {}).filter(Boolean).length;
              const vocabExp = vocabCount * 5;

              // Hafalan Mahfudzot EXP
              let mahfudzotItemCount = 0;
              Object.values(std.hafalanProgress?.mahfudzotChecklist || {}).forEach(chk => {
                const item = chk as { hafalanArab?: boolean; hafalanTerjemah?: boolean; pengetahuanKosakata?: boolean; pemahamanMateri?: boolean };
                if (item?.hafalanArab) mahfudzotItemCount++;
                if (item?.hafalanTerjemah) mahfudzotItemCount++;
                if (item?.pengetahuanKosakata) mahfudzotItemCount++;
                if (item?.pemahamanMateri) mahfudzotItemCount++;
              });
              const mahfudzotExp = mahfudzotItemCount * 5;

              // Completed Materials EXP
              const completedCount = std.completedMaterials?.length || 0;
              const completedExp = completedCount * 50;

              return (
                <div className="space-y-4 text-xs">

                  {/* Summary grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 space-y-0.5">
                      <span className="text-[10px] font-extrabold uppercase text-amber-700 block">Kuis & Latihan</span>
                      <span className="text-base font-black text-amber-600 block">+{quizExpSum} XP</span>
                      <span className="text-[10px] text-amber-800 font-semibold block">{attempts.length} Pengerjaan</span>
                    </div>

                    <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 space-y-0.5">
                      <span className="text-[10px] font-extrabold uppercase text-emerald-700 block">Hafalan Mufrodat</span>
                      <span className="text-base font-black text-emerald-600 block">+{vocabExp} XP</span>
                      <span className="text-[10px] text-emerald-800 font-semibold block">{vocabCount} Kata (x5 XP)</span>
                    </div>

                    <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 text-purple-900 space-y-0.5">
                      <span className="text-[10px] font-extrabold uppercase text-purple-700 block">Hafalan Mahfudzot</span>
                      <span className="text-base font-black text-purple-600 block">+{mahfudzotExp} XP</span>
                      <span className="text-[10px] text-purple-800 font-semibold block">{mahfudzotItemCount} Poin (x5 XP)</span>
                    </div>

                    <div className="p-3 bg-sky-50 rounded-2xl border border-sky-200 text-sky-900 space-y-0.5">
                      <span className="text-[10px] font-extrabold uppercase text-sky-700 block">Modul Selesai</span>
                      <span className="text-base font-black text-sky-600 block">+{completedExp} XP</span>
                      <span className="text-[10px] text-sky-800 font-semibold block">{completedCount} Modul (x50 XP)</span>
                    </div>
                  </div>

                  {/* Detailed Log Table of Quiz Attempts */}
                  <div className="space-y-2 pt-2">
                    <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center justify-between">
                      <span>Riwayat Pengerjaan Kuis & Latihan</span>
                      <span className="text-slate-400 font-normal">({attempts.length} Sesi)</span>
                    </h4>

                    <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                      {attempts.length === 0 ? (
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
                          Belum ada riwayat pengerjaan kuis.
                        </div>
                      ) : (
                        attempts.map((att, i) => {
                          const exp = att.earnedExp !== undefined ? att.earnedExp : (att.passed ? att.score : 0);
                          return (
                            <div key={`${att.id || 'att'}-${i}`} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <span className="font-bold text-slate-800 block truncate">{att.penilaianTitle}</span>
                                <span className="text-[10px] text-slate-400 block">
                                  {new Date(att.completedAt || att.accessedAt || Date.now()).toLocaleDateString('id-ID')} • Skor: {att.score}/100
                                </span>
                              </div>
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-black shrink-0 ${
                                exp >= 0 ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                              }`}>
                                {exp >= 0 ? `+${exp}` : exp} XP
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                </div>
              );
            })()}

            <div className="pt-2 text-right border-t border-slate-100">
              <button
                onClick={() => setExpDetailModalStudent(null)}
                className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition-all cursor-pointer"
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
