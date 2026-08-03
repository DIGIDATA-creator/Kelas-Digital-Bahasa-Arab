import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Penilaian, Student, QuizAttempt, Question } from '../../types';
import { Clock, CheckCircle2, XCircle, Award, ArrowRight, ArrowLeft, RefreshCw, Sparkles, AlertTriangle, Hash, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizRunnerProps {
  penilaian: Penilaian;
  student: Student;
  onFinishQuiz: (attempt: Omit<QuizAttempt, 'id' | 'completedAt'>) => void;
  onClose: () => void;
}

export const QuizRunner: React.FC<QuizRunnerProps> = ({
  penilaian,
  student,
  onFinishQuiz,
  onClose,
}) => {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string | number>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(penilaian.durationMinutes * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [isPassed, setIsPassed] = useState(false);

  // F.1.6 Accessed At Timestamp
  const [accessedAt] = useState<string>(new Date().toISOString());

  // F.1.4, F.1.5, F.1.7 Prepare Active Question Set from Bank ONCE on mount so option indices remain stable
  const [questions] = useState<Question[]>(() => {
    let pool = [...(penilaian.questions || [])];

    // Prioritize unseen questions if requested
    if (penilaian.prioritizeUnseen && student.seenQuestionIds && student.seenQuestionIds.length > 0) {
      const seenSet = new Set(student.seenQuestionIds);
      const unseen = pool.filter(q => !seenSet.has(q.id));
      const seen = pool.filter(q => seenSet.has(q.id));
      pool = [...unseen, ...seen];
    }

    // Randomize questions (enabled by default or if randomizeQuestions !== false)
    const shouldRandomizeQuestions = penilaian.randomizeQuestions !== false;
    if (shouldRandomizeQuestions) {
      pool.sort(() => Math.random() - 0.5);
    }

    // Slice to questionsToShow limit
    const limit = penilaian.questionsToShow || pool.length;
    const selectedPool = pool.slice(0, limit);

    // Randomize answer options order per question (enabled by default or if randomizeOptions !== false)
    const shouldRandomizeOptions = penilaian.randomizeOptions !== false;

    return selectedPool.map((q) => {
      if (!q.options || q.options.length <= 1 || !shouldRandomizeOptions) {
        return q;
      }

      // Determine original correct answer text
      let correctText = '';
      if (typeof q.correctAnswer === 'number' && q.options[q.correctAnswer] !== undefined) {
        correctText = q.options[q.correctAnswer];
      } else if (typeof q.correctAnswer === 'string') {
        const numIdx = parseInt(q.correctAnswer, 10);
        if (!isNaN(numIdx) && q.options[numIdx] !== undefined && !q.options.includes(q.correctAnswer)) {
          correctText = q.options[numIdx];
        } else {
          correctText = q.correctAnswer;
        }
      }

      // Create shuffled copy of options using Fisher-Yates
      const shuffledOptions = [...q.options];
      for (let i = shuffledOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
      }

      // Find new index of the correct text in shuffled options
      let newCorrectIndex = shuffledOptions.indexOf(correctText);
      if (newCorrectIndex === -1) {
        newCorrectIndex = typeof q.correctAnswer === 'number' ? q.correctAnswer : 0;
      }

      return {
        ...q,
        options: shuffledOptions,
        correctAnswer: newCorrectIndex,
      };
    });
  });

  // Confetti Celebration Effect on score >= 80
  useEffect(() => {
    if (isSubmitted && finalScore >= 80 && penilaian.gradingMethod !== 'manual') {
      const duration = 3.5 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 7,
          angle: 60,
          spread: 60,
          origin: { x: 0, y: 0.7 },
          colors: ['#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#3b82f6', '#fbbf24']
        });
        confetti({
          particleCount: 7,
          angle: 120,
          spread: 60,
          origin: { x: 1, y: 0.7 },
          colors: ['#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#3b82f6', '#fbbf24']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isSubmitted, finalScore, penilaian.gradingMethod]);

  // Timer Countdown Effect
  useEffect(() => {
    if (isSubmitted) return;

    if (timeLeftSeconds <= 0) {
      handleSubmitQuiz();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeftSeconds(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeftSeconds, isSubmitted]);

  const currentQ = questions[currentQuestionIdx];

  const handleSelectAnswer = (ans: string | number) => {
    if (isSubmitted) return;
    setUserAnswers(prev => ({
      ...prev,
      [currentQ.id]: ans,
    }));
  };

  // Helper for normalizing Arabic & Indonesian text
  const normalizeText = (str: any): string => {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/[\u064B-\u065F\u0670]/g, '') // strip Arabic diacritics
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
  };

  const getAnswerAnalysis = (q: Question, uAns: any) => {
    let selectedText = '';
    if (uAns !== undefined && uAns !== null) {
      if (q.options && typeof uAns === 'number' && q.options[uAns] !== undefined) {
        selectedText = q.options[uAns];
      } else {
        selectedText = String(uAns);
      }
    }

    let correctText = '';
    if (q.options && typeof q.correctAnswer === 'number' && q.options[q.correctAnswer] !== undefined) {
      correctText = q.options[q.correctAnswer];
    } else {
      correctText = String(q.correctAnswer ?? '');
    }

    let isCorrect = false;
    if (uAns !== undefined && uAns !== null && uAns !== '') {
      const normUser = normalizeText(uAns);
      const normCorrect = normalizeText(q.correctAnswer);
      const normSelectedText = normalizeText(selectedText);
      const normCorrectText = normalizeText(correctText);

      if (uAns === q.correctAnswer || normUser === normCorrect) {
        isCorrect = true;
      } else if (normSelectedText && normCorrectText && normSelectedText === normCorrectText) {
        isCorrect = true;
      } else if (q.options && typeof uAns === 'number' && normSelectedText === normCorrect) {
        isCorrect = true;
      } else if (q.options && typeof q.correctAnswer === 'string') {
        const matchOptIdx = q.options.findIndex(opt => normalizeText(opt) === normCorrect);
        if (matchOptIdx !== -1 && matchOptIdx === uAns) {
          isCorrect = true;
        }
      }
    }

    return { selectedText, correctText, isCorrect };
  };

  const handleSubmitQuiz = () => {
    if (isSubmitted) return;

    // Calculate score for digital questions
    let totalScorePoints = 0;
    let maxPoints = 0;

    questions.forEach(q => {
      const qPoints = q.points || (100 / (questions.length || 1));
      maxPoints += qPoints;
      const userAns = userAnswers[q.id];
      const { isCorrect } = getAnswerAnalysis(q, userAns);

      if (isCorrect) {
        totalScorePoints += qPoints;
      }
    });

    const calculatedScore = maxPoints > 0 ? Math.round((totalScorePoints / maxPoints) * 100) : 0;
    const passed = calculatedScore >= penilaian.passingGrade;
    const isManualGrading = penilaian.gradingMethod === 'manual';

    setFinalScore(calculatedScore);
    setIsPassed(passed);
    setIsSubmitted(true);

    const timeSpent = (penilaian.durationMinutes * 60) - timeLeftSeconds;

    onFinishQuiz({
      penilaianId: penilaian.id,
      penilaianTitle: penilaian.title,
      penilaianType: penilaian.type,
      studentId: student.id,
      studentName: student.name,
      score: isManualGrading ? 0 : calculatedScore,
      passed: isManualGrading ? false : passed,
      answers: userAnswers,
      timeSpentSeconds: Math.max(10, timeSpent),
      accessedAt,
      seenQuestionIds: questions.map(q => q.id),
      pendingManualGrading: isManualGrading,
    });

    if (passed && !isManualGrading) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
        
        {/* Top Timer & Metadata Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {penilaian.type} - Bab {penilaian.babNumber || 1}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Kode: {penilaian.code || 'TAMRIN-01'}
              </span>
            </div>
            <h3 className="text-base font-bold truncate max-w-md mt-1">{penilaian.title}</h3>
          </div>

          {!isSubmitted && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold ${
              timeLeftSeconds < 120 ? 'bg-rose-500/20 text-rose-300 animate-pulse border border-rose-500/30' : 'bg-slate-800 text-slate-200'
            }`}>
              <Clock size={16} />
              <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
            </div>
          )}
        </div>

        {/* Quiz Body */}
        {!isSubmitted ? (
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Anti-Cheat & Progress Navigation Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">
                    Soal <span className="text-slate-900 font-extrabold">{currentQuestionIdx + 1}</span> dari {questions.length}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                    🎲 Soal & Opsi Diacak
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono block">
                  Kode Soal: {currentQ?.code || `Q-${currentQuestionIdx + 1}`}
                </span>
              </div>

              <div className="flex gap-1.5 overflow-x-auto max-w-xs">
                {questions.map((q, idx) => {
                  const isAnswered = userAnswers[q.id] !== undefined;
                  const isCurrent = idx === currentQuestionIdx;

                  return (
                    <button
                      key={q.id || idx}
                      onClick={() => setCurrentQuestionIdx(idx)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-purple-600 text-white ring-2 ring-purple-300'
                          : isAnswered
                          ? 'bg-purple-100 text-purple-800 border border-purple-300'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Current Question Display */}
            {currentQ && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {currentQ.questionText}
                  </h4>
                  {currentQ.questionArabic && (
                    <p className="font-arabic text-2xl text-purple-900 leading-relaxed text-right p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                      {currentQ.questionArabic}
                    </p>
                  )}
                </div>

                {/* Multiple Choice Options */}
                {currentQ.options && currentQ.options.length > 0 && (
                  <div className="space-y-2.5 pt-2">
                    {currentQ.options.map((opt, optIdx) => {
                      const isSelected = userAnswers[currentQ.id] === optIdx;
                      const optionLetter = String.fromCharCode(65 + optIdx); // A, B, C, D

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectAnswer(optIdx)}
                          className={`w-full text-left p-3.5 sm:p-4 rounded-xl border-2 transition-all text-xs sm:text-sm font-medium flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-purple-50 border-purple-600 text-purple-900 font-bold shadow-xs'
                              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {optionLetter}
                            </span>
                            <span>{opt}</span>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${
                            isSelected ? 'border-purple-600 bg-purple-600 text-white' : 'border-slate-300'
                          }`}>
                            {isSelected && '✓'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Essay / Fill in Blank Input */}
                {(!currentQ.options || currentQ.options.length === 0 || currentQ.type === 'essay' || currentQ.type === 'fill_in_blank') && (
                  <div className="pt-2 space-y-2">
                    <label className="block text-xs font-semibold text-slate-600">
                      Tuliskan Jawaban Isian / Essay Anda:
                    </label>
                    <textarea
                      rows={4}
                      value={String(userAnswers[currentQ.id] || '')}
                      onChange={(e) => handleSelectAnswer(e.target.value)}
                      placeholder="Tuliskan jawaban Anda secara lengkap di sini..."
                      className="w-full p-4 border-2 border-slate-300 rounded-xl font-sans text-sm focus:border-purple-500 focus:outline-hidden"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Question Footer Navigation Controls */}
            <div className="flex items-center justify-between pt-4 border-t">
              <button
                onClick={() => setCurrentQuestionIdx(p => Math.max(0, p - 1))}
                disabled={currentQuestionIdx === 0}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl disabled:opacity-40 flex items-center gap-1"
              >
                <ArrowLeft size={16} /> Sebelumnya
              </button>

              {currentQuestionIdx < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestionIdx(p => Math.min(questions.length - 1, p + 1))}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
                >
                  Selanjutnya <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleSubmitQuiz}
                  className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 size={16} /> Selesaikan & Kirim Jawaban
                </button>
              )}
            </div>

          </div>
        ) : (
          /* Quiz Results View */
          <div className="p-8 text-center space-y-6">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center shadow-lg ${
              penilaian.gradingMethod === 'manual'
                ? 'bg-amber-100 text-amber-600 border-4 border-amber-300'
                : isPassed ? 'bg-emerald-100 text-emerald-600 border-4 border-emerald-300' : 'bg-rose-100 text-rose-600 border-4 border-rose-300'
            }`}>
              {penilaian.gradingMethod === 'manual' ? <Clock size={40} /> : isPassed ? <Award size={40} /> : <AlertTriangle size={40} />}
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-extrabold text-slate-900">
                {penilaian.gradingMethod === 'manual'
                  ? 'Jawaban Berhasil Dikirim!'
                  : isPassed ? 'Selamat, Anda Lulus!' : 'Hasil Latihan Belum Memenuhi KKM'}
              </h3>
              <p className="text-xs text-slate-500">
                {penilaian.gradingMethod === 'manual'
                  ? 'Jawaban isian Anda telah tersimpan dan menunggu pemeriksaan koreksi manual dari Guru.'
                  : `KKM Kelulusan: ${penilaian.passingGrade} / 100`}
              </p>
            </div>

            {penilaian.gradingMethod !== 'manual' && (
              <div className="space-y-3">
                <div className="inline-block px-8 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nilai Akhir Anda</span>
                  <p className={`text-5xl font-black ${isPassed ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {finalScore}
                  </p>
                </div>

                {/* Framer-Motion Celebration Banner for Score > 80 */}
                {finalScore > 80 && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    className="p-4 bg-gradient-to-r from-amber-400 via-emerald-500 to-teal-500 text-white rounded-2xl shadow-lg border-2 border-amber-300 space-y-1.5 my-2"
                  >
                    <motion.div
                      animate={{ rotate: [0, -12, 12, -12, 0], scale: [1, 1.15, 1] }}
                      transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
                      className="text-3xl"
                    >
                      🎉 🏆 🌟
                    </motion.div>
                    <h4 className="text-base font-black tracking-tight drop-shadow-xs">
                      SANGAT PRESTASI & LUAR BIASA!
                    </h4>
                    <p className="text-xs font-semibold text-emerald-50">
                      Selamat! Anda meraih nilai istimewa <strong>{finalScore}</strong> (di atas 80). Pertahankan semangat belajarmu!
                    </p>
                  </motion.div>
                )}
              </div>
            )}

            {/* Answer Summary List */}
            <div className="text-left space-y-3 pt-4 border-t max-h-72 overflow-y-auto pr-1">
              <h4 className="font-bold text-xs uppercase text-slate-500 tracking-wider">Ringkasan Pengerjaan & Analisis Jawaban:</h4>
              {questions.map((q, idx) => {
                const uAns = userAnswers[q.id];
                const { selectedText, correctText, isCorrect } = getAnswerAnalysis(q, uAns);

                return (
                  <div key={q.id || idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                    <div className="flex items-start justify-between gap-2 font-bold">
                      <span className="text-slate-800 leading-snug">{idx + 1}. {q.questionText} ({q.code || `Q-${idx+1}`})</span>
                      {penilaian.gradingMethod === 'manual' ? (
                        <span className="text-amber-600 font-bold shrink-0 flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-[11px]"><Clock size={13} /> Menunggu Koreksi</span>
                      ) : isCorrect ? (
                        <span className="text-emerald-700 font-extrabold shrink-0 flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-300 text-[11px]"><CheckCircle2 size={13} /> Benar</span>
                      ) : (
                        <span className="text-rose-700 font-extrabold shrink-0 flex items-center gap-1 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-300 text-[11px]"><XCircle size={13} /> Salah</span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-0.5">
                      <div className={`p-2.5 rounded-xl border ${uAns === undefined || uAns === null || uAns === '' ? 'bg-slate-100 border-slate-300 text-slate-600' : isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-rose-50 border-rose-200 text-rose-950'}`}>
                        <span className="font-extrabold uppercase block text-[10px] text-slate-500 mb-0.5">Jawaban Anda:</span>
                        <p className="font-bold text-xs">{selectedText ? selectedText : '(Tidak Dijawab)'}</p>
                      </div>

                      <div className="p-2.5 bg-slate-100 border border-slate-200 text-slate-800 rounded-xl">
                        <span className="font-extrabold uppercase block text-[10px] text-slate-500 mb-0.5">Jawaban Benar:</span>
                        <p className="font-bold text-xs text-emerald-700">{correctText || '-'}</p>
                      </div>
                    </div>

                    {q.explanation && (
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 text-slate-600 italic text-[11px] leading-relaxed">
                        💡 <strong className="not-italic text-slate-800">Pembahasan:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t flex justify-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-all"
              >
                Kembali ke Beranda Siswa
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
