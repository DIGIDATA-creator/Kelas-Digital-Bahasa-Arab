import React from 'react';
import { Student } from '../../types';
import { Trophy, Award, Medal, Crown, Sparkles, CheckCircle2 } from 'lucide-react';

interface LeaderboardViewProps {
  students: Student[];
  currentStudentId: string;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  students,
  currentStudentId,
}) => {
  // Sort students descending by totalXP
  const sortedStudents = [...students].sort((a, b) => b.totalXP - a.totalXP);

  const top3 = sortedStudents.slice(0, 3);
  const others = sortedStudents.slice(3);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 rounded-2xl p-6 text-white shadow-xl text-center space-y-2 relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/20 rounded-full text-xs font-bold uppercase tracking-wider text-amber-100 backdrop-blur-xs">
          <Crown size={16} /> Klasemen Prestasi Bahasa Arab
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Leaderboard Kelas Digital</h2>
        <p className="text-amber-100 text-xs sm:text-sm max-w-md mx-auto">
          Peringkat siswa berdasarkan perolehan Poin XP dari penyelesaian modul materi dan nilai kuis.
        </p>
      </div>

      {/* Top 3 Winners Podium */}
      <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-4 items-end">
        
        {/* Silver - Rank 2 */}
        {top3[1] && (
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 sm:p-6 text-center space-y-2 shadow-xs relative order-1 sm:order-1">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-300 text-slate-800 font-extrabold text-sm flex items-center justify-center border-2 border-white shadow-md">
              2
            </div>
            <img
              src={top3[1].avatar}
              alt={top3[1].name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover mx-auto border-4 border-slate-200 shadow-md"
            />
            <div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm truncate">{top3[1].name}</h3>
              <p className="text-[10px] text-slate-400 font-medium">{top3[1].className}</p>
            </div>
            <div className="pt-2 border-t">
              <span className="font-extrabold text-slate-700 text-sm sm:text-base">{top3[1].totalXP} XP</span>
            </div>
          </div>
        )}

        {/* Gold - Rank 1 (Center) */}
        {top3[0] && (
          <div className="bg-gradient-to-b from-amber-50 to-white rounded-2xl border-2 border-amber-400 p-5 sm:p-8 text-center space-y-3 shadow-md relative order-2 sm:order-2 -mt-4">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-amber-400 text-amber-950 font-black text-base flex items-center justify-center border-2 border-white shadow-lg">
              <Crown size={20} />
            </div>
            <img
              src={top3[0].avatar}
              alt={top3[0].name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover mx-auto border-4 border-amber-400 shadow-xl"
            />
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Juara Utama</span>
              <h3 className="font-black text-slate-900 text-sm sm:text-base truncate mt-1">{top3[0].name}</h3>
              <p className="text-xs text-slate-500 font-medium">{top3[0].className}</p>
            </div>
            <div className="pt-2 border-t border-amber-200">
              <span className="font-black text-amber-600 text-base sm:text-xl">{top3[0].totalXP} XP</span>
            </div>
          </div>
        )}

        {/* Bronze - Rank 3 */}
        {top3[2] && (
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 sm:p-6 text-center space-y-2 shadow-xs relative order-3 sm:order-3">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-amber-700 text-white font-extrabold text-sm flex items-center justify-center border-2 border-white shadow-md">
              3
            </div>
            <img
              src={top3[2].avatar}
              alt={top3[2].name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover mx-auto border-4 border-amber-700/30 shadow-md"
            />
            <div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm truncate">{top3[2].name}</h3>
              <p className="text-[10px] text-slate-400 font-medium">{top3[2].className}</p>
            </div>
            <div className="pt-2 border-t">
              <span className="font-extrabold text-amber-800 text-sm sm:text-base">{top3[2].totalXP} XP</span>
            </div>
          </div>
        )}

      </div>

      {/* Complete Rankings List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-600 uppercase tracking-wider flex justify-between">
          <span>Peringkat Siswa</span>
          <span>Perolehan XP</span>
        </div>

        <div className="divide-y divide-slate-100">
          {sortedStudents.map((std, idx) => {
            const isCurrent = std.id === currentStudentId;

            return (
              <div
                key={std.id}
                className={`px-6 py-3.5 flex items-center justify-between transition-colors ${
                  isCurrent ? 'bg-emerald-50/80 border-l-4 border-emerald-500 font-bold' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center ${
                    idx === 0 ? 'bg-amber-400 text-amber-950' :
                    idx === 1 ? 'bg-slate-300 text-slate-800' :
                    idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {idx + 1}
                  </span>

                  <img
                    src={std.avatar}
                    alt={std.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />

                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>{std.name}</span>
                      {isCurrent && (
                        <span className="px-2 py-0.5 bg-emerald-600 text-white text-[9px] font-bold rounded-full">Saya</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">{std.className} • {std.completedMaterials.length} Modul Selesai</div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-extrabold text-amber-600">{std.totalXP} XP</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
