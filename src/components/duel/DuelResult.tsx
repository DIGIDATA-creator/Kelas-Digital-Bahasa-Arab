import React from 'react';
import { motion } from 'motion/react';
import {
  Trophy,
  Award,
  RotateCcw,
  LogOut,
  Sparkles,
  CheckCircle2,
  XCircle,
  Swords,
  Zap,
  Clock,
} from 'lucide-react';
import { DuelRoom, duelService } from '../../services/duelService';
import { Student } from '../../types';

interface DuelResultProps {
  room: DuelRoom;
  currentStudent: Student;
  onRematch: () => void;
  onLeave: () => void;
}

export const DuelResult: React.FC<DuelResultProps> = ({
  room,
  currentStudent,
  onRematch,
  onLeave,
}) => {
  const isHost = room.hostPlayer.studentId === currentStudent.id;
  const myPlayer = isHost ? room.hostPlayer : room.challengerPlayer;
  const opponentPlayer = isHost ? room.challengerPlayer : room.hostPlayer;

  const winnerId = room.winnerStudentId || (room as any).winnerId;
  const isWinner = winnerId === currentStudent.id;
  const isDraw = winnerId === 'DRAW';

  const isScoreTied = (myPlayer?.score || 0) === (opponentPlayer?.score || 0) && (myPlayer?.score || 0) > 0;

  const expGained = isWinner ? 100 : 25;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Winner Header Banner */}
      <div
        className={`rounded-3xl p-8 text-white text-center shadow-2xl relative overflow-hidden border ${
          isWinner
            ? 'bg-gradient-to-r from-amber-500 via-emerald-600 to-teal-700 border-amber-300'
            : isDraw
            ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-800 border-blue-300'
            : 'bg-gradient-to-r from-slate-800 via-purple-900 to-slate-900 border-purple-500/30'
        }`}
      >
        <div className="relative z-10 space-y-4">
          <div className="inline-flex p-4 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner mx-auto">
            <Trophy size={56} className={isWinner ? 'text-amber-300 animate-bounce' : 'text-slate-300'} />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} /> {isWinner ? 'Kemenangan Mutlak! 🏆' : isDraw ? 'Hasil Seri / Imbang 🤝' : 'Pertandingan Selesai ⚔️'}
            </div>

            {isScoreTied && !isDraw && (
              <div className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black shadow-md border border-amber-200">
                <Clock size={14} className="stroke-[2.5]" />
                {isWinner
                  ? `Pemenang Waktu Tercepat! (Skor Sama: ${myPlayer?.score} PTS)`
                  : `Kalah Kecepatan Waktu (Skor Sama: ${myPlayer?.score} PTS)`}
              </div>
            )}

            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              {isWinner
                ? isScoreTied
                  ? 'Menang Cepat & Tepat!'
                  : 'Selamat, Anda Menang!'
                : isDraw
                ? 'Pertandingan Berimbang!'
                : 'Tetap Semangat!'}
            </h2>
            <p className="text-xs sm:text-sm text-white/80 max-w-md mx-auto">
              {isWinner
                ? isScoreTied
                  ? 'Skor akhir sama! Kamu unggul karena menyelesaikan seluruh soal lebih cepat.'
                  : 'Luar biasa! Penguasaan mufrodat Bahasa Arab milikmu sangat mengesankan.'
                : isScoreTied
                ? 'Skor akhir sama! Lawan unggul tipis karena menyelesaikan seluruh soal lebih cepat.'
                : 'Latihan terus untuk mengasah hafalan kosakata Bahasa Arab!'}
            </p>
          </div>

          {/* EXP Reward Badge */}
          <div className="inline-flex items-center gap-2 bg-black/30 backdrop-blur-md px-5 py-2 rounded-2xl border border-white/20 font-bold text-sm text-amber-300">
            <Zap size={18} className="text-amber-400 fill-amber-400" />
            + {expGained} EXP Berhasil Ditambahkan Ke Profil LMS
          </div>
        </div>
      </div>

      {/* Players Score Comparison Cards */}
      <div className="grid grid-cols-2 gap-4">
        
        {/* My Player Card */}
        <div className={`p-5 rounded-2xl border ${isWinner ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'} text-center space-y-2`}>
          <img
            src={myPlayer?.avatar}
            alt={myPlayer?.name}
            className="w-14 h-14 rounded-2xl object-cover mx-auto border-2 border-emerald-500 shadow-sm"
          />
          <div className="text-sm font-bold text-slate-900 dark:text-white">{myPlayer?.name} (Kamu)</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {myPlayer?.score || 0} <span className="text-xs font-normal text-slate-400">PTS</span>
          </div>
        </div>

        {/* Opponent Player Card */}
        <div className={`p-5 rounded-2xl border ${!isWinner && !isDraw ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'} text-center space-y-2`}>
          <img
            src={opponentPlayer?.avatar}
            alt={opponentPlayer?.name}
            className="w-14 h-14 rounded-2xl object-cover mx-auto border-2 border-rose-500 shadow-sm"
          />
          <div className="text-sm font-bold text-slate-900 dark:text-white">{opponentPlayer?.name}</div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
            {opponentPlayer?.score || 0} <span className="text-xs font-normal text-slate-400">PTS</span>
          </div>
        </div>

      </div>

      {/* Detailed Question Review Breakdown */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Swords size={20} className="text-amber-500" /> Evaluasi Soal Mufrodat Ronde demi Ronde
        </h3>

        <div className="space-y-3">
          {room.questions.map((q, idx) => {
            const myAns = myPlayer?.answers[idx];
            const oppAns = opponentPlayer?.answers[idx];

            return (
              <div
                key={q.id}
                className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/70 space-y-2"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-amber-600 dark:text-amber-400">Ronde {idx + 1}</span>
                  <span className="text-slate-500 dark:text-slate-400">{q.category}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold font-arabic text-slate-900 dark:text-white">{q.arabicWord}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">({q.harakat})</span>
                  </div>
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Artinya: {q.options[q.correctIndex]}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    {myAns?.isCorrect ? (
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle size={14} className="text-rose-500 shrink-0" />
                    )}
                    <span className="text-slate-600 dark:text-slate-400 truncate">
                      Kamu: {myAns ? q.options[myAns.selectedOptionIndex] || 'Waktu Habis' : 'Tidak Dijawab'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 justify-end">
                    <span className="text-slate-600 dark:text-slate-400 truncate">
                      Lawan: {oppAns ? q.options[oppAns.selectedOptionIndex] || 'Waktu Habis' : 'Tidak Dijawab'}
                    </span>
                    {oppAns?.isCorrect ? (
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle size={14} className="text-rose-500 shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={onRematch}
          className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          <RotateCcw size={18} /> Rematch (Tanding Ulang)
        </button>

        <button
          onClick={onLeave}
          className="px-6 py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut size={18} /> Kembali ke LMS
        </button>
      </div>

    </div>
  );
};
