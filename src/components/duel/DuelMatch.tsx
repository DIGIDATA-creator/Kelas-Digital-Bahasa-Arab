import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Swords,
  Trophy,
  Clock,
  Zap,
  CheckCircle2,
  XCircle,
  Sparkles,
  Bot,
  AlertCircle,
  Copy,
  Check,
  UserCheck,
} from 'lucide-react';
import { DuelRoom, duelService } from '../../services/duelService';
import { Student } from '../../types';

interface DuelMatchProps {
  room: DuelRoom;
  currentStudent: Student;
  onLeaveMatch: () => void;
}

export const DuelMatch: React.FC<DuelMatchProps> = ({
  room,
  currentStudent,
  onLeaveMatch,
}) => {
  const isHost = room.hostPlayer.studentId === currentStudent.id;
  const myPlayer = isHost ? room.hostPlayer : room.challengerPlayer;
  const opponentPlayer = isHost ? room.challengerPlayer : room.hostPlayer;

  const currentQuestionIndex = room.currentRound;
  const question = room.questions[currentQuestionIndex];

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(12);

  const hasMyAnswer = myPlayer?.answers[currentQuestionIndex] !== undefined;
  const hasOpponentAnswer = opponentPlayer?.answers[currentQuestionIndex] !== undefined;

  // Question Timer Effect
  useEffect(() => {
    if (room.status !== 'playing' || hasMyAnswer) return;

    setTimeLeft(12);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Auto submit wrong answer on timeout
          if (!hasMyAnswer && !isSubmitting && question) {
            handleOptionClick(-1);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentQuestionIndex, room.status, hasMyAnswer]);

  // Bot Turn Triggering Effect
  useEffect(() => {
    if (
      room.status === 'playing' &&
      opponentPlayer &&
      opponentPlayer.isBot &&
      !hasOpponentAnswer
    ) {
      duelService.simulateBotTurn(room.id, room, currentQuestionIndex);
    }
  }, [currentQuestionIndex, room.status, hasOpponentAnswer, opponentPlayer?.isBot]);

  // Handle Option Click
  const handleOptionClick = async (optionIdx: number) => {
    if (hasMyAnswer || isSubmitting || !question) return;

    setSelectedOption(optionIdx);
    setIsSubmitting(true);

    const isCorrect = optionIdx === question.correctIndex;
    const timeTaken = 12 - timeLeft;

    try {
      await duelService.submitAnswer(
        room.id,
        isHost,
        currentQuestionIndex,
        optionIdx,
        isCorrect,
        timeTaken,
        room
      );
    } catch (err) {
      console.error('Error submitting answer:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Waiting for Challenger Lobby State
  if (room.status === 'waiting' || !room.challengerPlayer) {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6">
          <div className="relative inline-block">
            <div className="w-20 h-20 bg-amber-500/10 text-amber-600 rounded-3xl flex items-center justify-center mx-auto animate-bounce">
              <Swords size={40} />
            </div>
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Menunggu Lawan Duel...
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Bagikan kode room di bawah ke teman sekelasmu atau lawan AI Bot untuk latihan instan!
            </p>
          </div>

          {/* Room Code Badge */}
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800/60 inline-flex flex-col items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400 tracking-wider">
              KODE ROOM PERTANDINGAN
            </span>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-mono font-black text-amber-600 dark:text-amber-300 tracking-widest">
                {room.roomCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1"
              >
                {copiedCode ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          {/* Quick AI Bot Fallback Button */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <p className="text-xs text-slate-400">Tidak ada teman online? Cobalah bertanding dengan AI Bot!</p>
            <button
              onClick={() => duelService.addBotOpponent(room.id, 'Ustaz AI Bot')}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 border border-amber-500/30 cursor-pointer shadow-sm"
            >
              <Bot size={18} /> Mainkan Sekarang Lawan AI Bot
            </button>
          </div>

          <button
            onClick={onLeaveMatch}
            className="text-xs text-slate-400 hover:text-rose-500 transition-colors underline pt-2 cursor-pointer"
          >
            Batal & Keluar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Players Header Comparison Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
        <div className="grid grid-cols-2 gap-4 items-center">
          
          {/* Player 1 (Left) */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={myPlayer?.avatar}
                alt={myPlayer?.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm"
              />
              {myPlayer?.streak ? (
                <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  <Zap size={10} /> {myPlayer.streak}x
                </span>
              ) : null}
            </div>

            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                {myPlayer?.name} <span className="text-[10px] text-emerald-500">(Kamu)</span>
              </div>
              <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {myPlayer?.score || 0} <span className="text-[10px] font-sans font-normal text-slate-400">PTS</span>
              </div>
            </div>
          </div>

          {/* Player 2 (Right) */}
          <div className="flex items-center gap-3 justify-end text-right">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-end gap-1">
                {opponentPlayer?.isBot && <Bot size={12} className="text-purple-400" />}
                {opponentPlayer?.name}
              </div>
              <div className="text-lg font-black text-rose-600 dark:text-rose-400 font-mono">
                {opponentPlayer?.score || 0} <span className="text-[10px] font-sans font-normal text-slate-400">PTS</span>
              </div>
            </div>

            <div className="relative">
              <img
                src={opponentPlayer?.avatar}
                alt={opponentPlayer?.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-rose-500 shadow-sm"
              />
              {opponentPlayer?.streak ? (
                <span className="absolute -bottom-1 -left-1 bg-amber-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  <Zap size={10} /> {opponentPlayer.streak}x
                </span>
              ) : null}
            </div>
          </div>

        </div>

        {/* Live Score Tug-of-War Progress Bar */}
        <div className="relative h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
            style={{
              width: `${
                ((myPlayer?.score || 0) + (opponentPlayer?.score || 0)) === 0
                  ? 50
                  : Math.max(10, Math.min(90, ((myPlayer?.score || 0) / ((myPlayer?.score || 0) + (opponentPlayer?.score || 0))) * 100))
              }%`,
            }}
          />
          <div className="h-full bg-gradient-to-r from-rose-500 to-amber-500 flex-1 transition-all duration-500" />
        </div>

        {/* Round Counter & Speed Timer */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Ronde {currentQuestionIndex + 1} dari {room.totalRounds}
          </span>

          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-mono font-bold">
            <Clock size={14} className="animate-spin" />
            00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft} Detik
          </div>
        </div>
      </div>

      {/* Main Question Box */}
      {question && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          
          {/* Question Arabic Display Card */}
          <div className="bg-gradient-to-b from-amber-50/80 to-amber-100/50 dark:from-slate-800/80 dark:to-slate-950/80 rounded-2xl p-8 text-center border border-amber-200/60 dark:border-slate-700 shadow-inner space-y-2">
            <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-widest">
              {question.category}
            </div>
            <div className="text-4xl sm:text-5xl font-bold font-arabic text-slate-900 dark:text-white py-2 leading-relaxed">
              {question.arabicWord}
            </div>
            <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
              ({question.harakat})
            </div>
          </div>

          {/* Real-time Opponent Action Toast */}
          <div className="flex items-center justify-between px-1 text-xs">
            <span className="text-slate-500">Pilih terjemahan yang tepat:</span>
            {hasOpponentAnswer ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 animate-pulse">
                <CheckCircle2 size={14} /> {opponentPlayer?.name} sudah menjawab!
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 italic flex items-center gap-1">
                <Clock size={12} /> {opponentPlayer?.name} sedang berpikir...
              </span>
            )}
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {question.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrectAnswer = idx === question.correctIndex;
              const myAnswer = myPlayer?.answers[currentQuestionIndex];

              let buttonStyle = 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-amber-400 hover:bg-amber-50/50';

              if (hasMyAnswer) {
                if (isCorrectAnswer) {
                  buttonStyle = 'bg-emerald-500 text-white border-emerald-600 shadow-lg';
                } else if (isSelected && !isCorrectAnswer) {
                  buttonStyle = 'bg-rose-500 text-white border-rose-600 shadow-lg';
                } else {
                  buttonStyle = 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 border-slate-200 dark:border-slate-800 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={hasMyAnswer || isSubmitting}
                  onClick={() => handleOptionClick(idx)}
                  className={`p-4 text-left font-semibold text-sm rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-2 ${buttonStyle}`}
                >
                  <span>{opt}</span>
                  {hasMyAnswer && isCorrectAnswer && (
                    <CheckCircle2 size={20} className="text-white shrink-0" />
                  )}
                  {hasMyAnswer && isSelected && !isCorrectAnswer && (
                    <XCircle size={20} className="text-white shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Answer Waiting Footer */}
          {hasMyAnswer && !hasOpponentAnswer && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/50 text-center text-xs text-emerald-800 dark:text-emerald-300 font-medium flex items-center justify-center gap-2">
              <Clock size={16} className="animate-spin text-emerald-600" />
              Jawaban dikirim! Menunggu {opponentPlayer?.name} menyelesaikan ronde...
            </div>
          )}

        </div>
      )}

    </div>
  );
};
