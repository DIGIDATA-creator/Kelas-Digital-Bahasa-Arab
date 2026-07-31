import React, { useState } from 'react';
import { Penilaian, Student, QuizAttempt, AssessmentType } from '../../types';
import { Clock, Play, CheckCircle2, Award, FileCheck2, AlertCircle } from 'lucide-react';
import { QuizRunner } from './QuizRunner';

interface PenilaianSiswaViewProps {
  penilaianList: Penilaian[];
  currentStudent: Student;
  onFinishQuiz: (attempt: Omit<QuizAttempt, 'id' | 'completedAt'>) => void;
}

export const PenilaianSiswaView: React.FC<PenilaianSiswaViewProps> = ({
  penilaianList,
  currentStudent,
  onFinishQuiz,
}) => {
  const [activeType, setActiveType] = useState<AssessmentType>('kuis');
  const [activeQuizForRun, setActiveQuizForRun] = useState<Penilaian | null>(null);

  const filteredList = penilaianList.filter(p => p.type === activeType);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-1">
        <h2 className="text-xl font-bold text-slate-900">Latihan, Kuis & Ujian Interaktif</h2>
        <p className="text-xs text-slate-500">
          Uji pemahaman bahasa arab Anda secara berkala. Dapatkan umpan balik langsung dan nilai KKM.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-3 border-b pb-4">
        {(['latihan', 'kuis', 'ujian'] as AssessmentType[]).map((t) => {
          const count = penilaianList.filter(p => p.type === t).length;
          const isActive = activeType === t;
          const labels = { latihan: 'Latihan Soal', kuis: 'Kuis Interaktif', ujian: 'Ujian Evaluasi' };

          return (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm capitalize transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-purple-700 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{labels[t]}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Assessment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredList.map((p) => {
          const attempts = currentStudent.attempts.filter(a => a.penilaianId === p.id);
          const lastAttempt = attempts[attempts.length - 1];
          const hasPassed = attempts.some(a => a.passed);

          return (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-50 text-purple-700 border border-purple-200">
                    {p.type}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                    <Clock size={14} className="text-amber-500" /> {p.durationMinutes} Menit
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {p.title}
                </h3>

                <p className="text-xs text-slate-500">
                  {p.questions.length} Butir Soal • KKM {p.passingGrade}/100
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-3">
                {lastAttempt ? (
                  <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-500">Nilai Terakhir:</span>
                      <p className={`font-extrabold text-sm ${lastAttempt.score >= p.passingGrade ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {lastAttempt.score} / 100
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${lastAttempt.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {lastAttempt.passed ? 'LULUS' : 'REMEDIAL'}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Belum pernah mengerjakan</p>
                )}

                <button
                  onClick={() => setActiveQuizForRun(p)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs ${
                    hasPassed
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                  }`}
                >
                  <Play size={15} /> {hasPassed ? 'Kerjakan Ulang' : 'Mulai Kerjakan'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quiz Runner Modal Component */}
      {activeQuizForRun && (
        <QuizRunner
          penilaian={activeQuizForRun}
          student={currentStudent}
          onFinishQuiz={(attempt) => {
            onFinishQuiz(attempt);
          }}
          onClose={() => setActiveQuizForRun(null)}
        />
      )}

    </div>
  );
};
