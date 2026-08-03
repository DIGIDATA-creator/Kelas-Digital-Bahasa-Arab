import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Flame, Award, Calendar, Sparkles, CheckCircle2, Zap } from 'lucide-react';
import { Student } from '../../types';
import { storageService } from '../../services/storage';

interface LearningStreakWidgetProps {
  currentStudent: Student;
  onSimulateExpGain?: (amount: number, reason: string) => void;
}

export const LearningStreakWidget: React.FC<LearningStreakWidgetProps> = ({
  currentStudent,
  onSimulateExpGain,
}) => {
  const [streakResult, setStreakResult] = useState<{
    streakCount: number;
    bonusXP: number;
    isNewDay: boolean;
  }>({
    streakCount: currentStudent.streakCount || 1,
    bonusXP: 0,
    isNewDay: false,
  });

  useEffect(() => {
    if (currentStudent?.id) {
      const res = storageService.checkAndUpdateStreak(currentStudent.id);
      setStreakResult(res);
      if (res.isNewDay && res.bonusXP > 0 && onSimulateExpGain) {
        onSimulateExpGain(res.bonusXP, `Daily Streak ${res.streakCount} Hari Berturut-turut! 🔥`);
      }
    }
  }, [currentStudent?.id]);

  const streak = streakResult.streakCount || currentStudent.streakCount || 1;
  const daysOfWeek = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  
  // Calculate index of today (0 = Mon, 6 = Sun)
  const todayIndex = (new Date().getDay() + 6) % 7;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 rounded-2xl p-5 text-white shadow-lg border border-amber-400/40 space-y-4 relative overflow-hidden"
    >
      {/* Background Flame Watermark */}
      <div className="absolute -right-4 -bottom-6 opacity-15 pointer-events-none select-none">
        <Flame size={180} className="fill-white text-white" />
      </div>

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/20 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 text-amber-100 shadow-inner">
            <Flame size={28} className="fill-amber-300 text-amber-200 animate-bounce" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/20 rounded-full text-[11px] font-extrabold text-amber-100 border border-white/20">
              <Sparkles size={12} /> Konsistensi Belajar
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2 mt-0.5">
              Streak Belajar: <span className="text-amber-200">{streak} Hari Berturut-turut!</span> 🔥
            </h3>
          </div>
        </div>

        {streakResult.isNewDay && streakResult.bonusXP > 0 ? (
          <span className="px-3 py-1.5 bg-white text-amber-900 rounded-xl font-black text-xs shadow-md flex items-center gap-1.5">
            <Zap size={14} className="fill-amber-500 text-amber-500" /> +{streakResult.bonusXP} Bonus EXP
          </span>
        ) : (
          <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white rounded-xl font-bold text-xs border border-white/20 flex items-center gap-1.5">
            <Award size={14} className="text-amber-300" /> +{15 + Math.min(streak * 2, 50)} EXP Besok
          </span>
        )}
      </div>

      {/* 7-Day Activity Indicators */}
      <div className="relative z-10 space-y-2">
        <div className="flex items-center justify-between text-xs font-extrabold text-amber-100">
          <span className="flex items-center gap-1">
            <Calendar size={14} /> Aktivitas Pekan Ini
          </span>
          <span className="text-[11px] font-medium bg-black/20 px-2 py-0.5 rounded-md">
            Hari ini: {daysOfWeek[todayIndex]}
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {daysOfWeek.map((day, idx) => {
            const isToday = idx === todayIndex;
            const isPastActive = idx <= todayIndex;

            return (
              <div
                key={day}
                className={`p-2 rounded-xl flex flex-col items-center justify-center text-center transition-all ${
                  isToday
                    ? 'bg-white text-amber-950 font-black shadow-md scale-105 border-2 border-amber-200'
                    : isPastActive
                    ? 'bg-white/20 text-white font-bold border border-white/20'
                    : 'bg-black/20 text-white/50 font-medium border border-transparent'
                }`}
              >
                <span className="text-[10px] uppercase font-bold tracking-wider">{day}</span>
                <div className="mt-1">
                  {isPastActive ? (
                    <Flame size={16} className={`fill-current ${isToday ? 'text-amber-500' : 'text-amber-200'}`} />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-white/30 my-1" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Encouragement note */}
      <div className="relative z-10 bg-black/20 rounded-xl p-2.5 text-[11px] text-amber-100 font-medium flex items-center justify-between gap-2 border border-white/10">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 size={15} className="text-amber-300 shrink-0" />
          {streak >= 7
            ? 'Luar biasa! Anda berhasil mempertahankan streak lebih dari seminggu. Teruskan kebiasaan hebat ini!'
            : 'Selesaikan 1 kuis atau baca 1 materi setiap hari untuk mempertahankan api streak Anda!'}
        </span>
      </div>
    </motion.div>
  );
};
