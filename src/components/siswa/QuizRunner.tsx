import React, { useState, useEffect } from 'react';
import { Penilaian, Student, QuizAttempt } from '../../types';
import { Clock, CheckCircle2, XCircle, Award, ArrowRight, ArrowLeft, RefreshCw, Sparkles, AlertTriangle } from 'lucide-react';
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

  const questions = penilaian.questions || [];
  const currentQ = questions[currentQuestionIdx];

  const handleSelectAnswer = (ans: string | number) => {
    if (isSubmitted) return;
    setUserAnswers(prev => ({
      ...prev,
      [currentQ.id]: ans,
    }));
  };

  const handleSubmitQuiz = () => {
    if (isSubmitted) return;

    // Calculate score
    let totalScorePoints = 0;
    let maxPoints = 0;

    questions.forEach(q => {
      const qPoints = q.points || 25;
      maxPoints += qPoints;
      const userAns = userAnswers[q.id];

      if (q.type === 'multiple_choice' || q.type === 'true_false') {
        if (userAns === q.correctAnswer) {
          totalScorePoints += qPoints;
        }
      } else if (q.type === 'fill_in_blank') {
        if (
          typeof userAns === 'string' &&
          userAns.trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase()
        ) {
          totalScorePoints += qPoints;
        }
      }
    });

    const calculatedScore = maxPoints > 0 ? Math.round((totalScorePoints / maxPoints) * 100) : 0;
    const passed = calculatedScore >= penilaian.passingGrade;

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
      score: calculatedScore,
      passed,
      answers: userAnswers,
      timeSpentSeconds: Math.max(10, timeSpent),
    });

    if (passed) {
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
        
        {/* Top Timer Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {penilaian.type}
            </span>
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
            
            {/* Progress & Question Navigation Pills */}
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-xs font-bold text-slate-500">
                Soal <span className="text-slate-900 font-extrabold">{currentQuestionIdx + 1}</span> dari {questions.length}
              </span>

              <div className="flex gap-1.5 overflow-x-auto max-w-xs">
                {questions.map((q, idx) => {
                  const isAnswered = userAnswers[q.id] !== undefined;
                  const isCurrent = idx === currentQuestionIdx;

                  return (
                    <button
                      key={q.id || idx}
                      onClick={() => setCurrentQuestionIdx(idx)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-emerald-600 text-white ring-2 ring-emerald-300'
                          : isAnswered
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
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
                    <p className="font-arabic text-2xl text-emerald-800 leading-relaxed text-right p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                      {currentQ.questionArabic}
                    </p>
                  )}
                </div>

                {/* Multiple Choice Options */}
                {currentQ.options && (
                  <div className="space-y-2.5 pt-2">
                    {currentQ.options.map((opt, optIdx) => {
                      const isSelected = userAnswers[currentQ.id] === optIdx;

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectAnswer(optIdx)}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all text-xs sm:text-sm font-medium flex items-center justify-between ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold shadow-xs'
                              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        >
                          <span>{opt}</span>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                            isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
                          }`}>
                            {isSelected && '✓'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Fill in Blank Option */}
                {currentQ.type === 'fill_in_blank' && (
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Ketikkan Jawaban Bahasa Arab/Indonesia:</label>
                    <input
                      type="text"
                      value={String(userAnswers[currentQ.id] || '')}
                      onChange={(e) => handleSelectAnswer(e.target.value)}
                      placeholder="Tuliskan jawaban Anda di sini..."
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl font-arabic text-lg focus:border-emerald-500 focus:outline-hidden"
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
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 size={16} /> Selesaikan & Kirim Kuis
                </button>
              )}
            </div>

          </div>
        ) : (
          /* Quiz Results View */
          <div className="p-8 text-center space-y-6">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center shadow-lg ${
              isPassed ? 'bg-emerald-100 text-emerald-600 border-4 border-emerald-300' : 'bg-rose-100 text-rose-600 border-4 border-rose-300'
            }`}>
              {isPassed ? <Award size={40} /> : <AlertTriangle size={40} />}
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-extrabold text-slate-900">
                {isPassed ? 'Selamat, Anda Lulus!' : 'Hasil Kuis Belum Memenuhi KKM'}
              </h3>
              <p className="text-xs text-slate-500">
                KKM Kelulusan: {penilaian.passingGrade} / 100
              </p>
            </div>

            <div className="inline-block px-8 py-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nilai Akhir Anda</span>
              <p className={`text-5xl font-black ${isPassed ? 'text-emerald-600' : 'text-rose-600'}`}>
                {finalScore}
              </p>
            </div>

            {/* Answer Explanations List */}
            <div className="text-left space-y-3 pt-4 border-t max-h-60 overflow-y-auto pr-1">
              <h4 className="font-bold text-xs uppercase text-slate-500">Pembahasan Jawaban:</h4>
              {questions.map((q, idx) => {
                const uAns = userAnswers[q.id];
                const isCorrect = uAns === q.correctAnswer || (q.type === 'fill_in_blank' && String(uAns).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase());

                return (
                  <div key={q.id || idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-slate-800">{idx + 1}. {q.questionText}</span>
                      {isCorrect ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 size={14} /> Benar</span>
                      ) : (
                        <span className="text-rose-600 font-bold flex items-center gap-1"><XCircle size={14} /> Salah</span>
                      )}
                    </div>
                    {q.explanation && (
                      <p className="text-slate-500 italic bg-white p-2 rounded-lg border border-slate-100">
                        Penjelasan: {q.explanation}
                      </p>
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
                Kembali ke Menu Utama
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
