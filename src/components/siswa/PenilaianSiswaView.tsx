import React, { useState } from 'react';
import { Penilaian, Student, QuizAttempt, AssessmentType, CategoryType, Materi } from '../../types';
import { Clock, Play, CheckCircle2, Award, FileCheck2, AlertCircle, Sparkles, BookOpen, Layers, MessageSquare, Quote, ArrowRight, Zap, RefreshCw, Settings2 } from 'lucide-react';
import { QuizRunner } from './QuizRunner';
import { generateDynamicKosakataQuiz, KosakataQuizConfig } from './KosakataQuizGenerator';

interface PenilaianSiswaViewProps {
  penilaianList: Penilaian[];
  materiList?: Materi[];
  currentStudent: Student;
  onFinishQuiz: (attempt: Omit<QuizAttempt, 'id' | 'completedAt'>) => void;
}

export const PenilaianSiswaView: React.FC<PenilaianSiswaViewProps> = ({
  penilaianList,
  materiList = [],
  currentStudent,
  onFinishQuiz,
}) => {
  const [activeType, setActiveType] = useState<AssessmentType>('kuis');
  const [activeSubCategory, setActiveSubCategory] = useState<CategoryType>('kosakata');
  const [activeQuizForRun, setActiveQuizForRun] = useState<Penilaian | null>(null);

  // Dynamic Kosakata Quiz Config State
  const [kosakataConfig, setKosakataConfig] = useState<KosakataQuizConfig>({
    scopeType: 'all',
    specificBab: 1,
    rangeStartBab: 1,
    rangeEndBab: 5,
    direction: 'arab_indo',
    questionCount: 10,
  });

  // Available Bab Numbers from Vocabulary Materials
  const availableBabs = Array.from(
    new Set(
      materiList
        .filter(m => m.category === 'kosakata')
        .map(m => m.babNumber || 1)
    )
  ).sort((a, b) => a - b);

  const maxBabAvailable = availableBabs.length > 0 ? Math.max(...availableBabs) : 5;

  // Filter list by Assessment Type & Sub-Category
  const filteredList = penilaianList.filter(p => {
    if (p.type !== activeType) return false;
    if (p.category !== activeSubCategory && p.category !== 'umum') return false;
    return true;
  });

  const handleLaunchDynamicKosakataQuiz = () => {
    const generatedQuiz = generateDynamicKosakataQuiz(materiList, kosakataConfig);
    setActiveQuizForRun(generatedQuiz);
  };

  const subMenuCategories: { id: CategoryType; label: string; arabicLabel: string; icon: any }[] = [
    { id: 'qowaid', label: 'Qowaid (Tata Bahasa)', arabicLabel: 'قَوَاعِدُ', icon: BookOpen },
    { id: 'hiwar', label: 'Hiwar (Percakapan)', arabicLabel: 'حِوَارٌ', icon: MessageSquare },
    { id: 'kosakata', label: 'Kosakata (Mufradat)', arabicLabel: 'مُفْرَدَاتٌ', icon: Layers },
    { id: 'mahfudzot', label: 'Mahfudzot (Kata Mutiara)', arabicLabel: 'مَحْفُوظَاتٌ', icon: Quote },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <Award className="text-purple-600" size={24} /> Latihan, Kuis & Ujian Interaktif
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Uji pemahaman bahasa Arab Anda dengan paket kuis terstruktur dan generator kuis kosakata otomatis.
            </p>
          </div>
          <span className="px-3 py-1 bg-purple-100 text-purple-900 border border-purple-200 text-xs font-black rounded-xl self-start sm:self-auto">
            Sistem KKM 75
          </span>
        </div>
      </div>

      {/* Main Assessment Type Tabs (Latihan vs Kuis vs Ujian) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {(['latihan', 'kuis', 'ujian'] as AssessmentType[]).map((t) => {
          const count = penilaianList.filter(p => p.type === t).length;
          const isActive = activeType === t;
          const labels = { latihan: 'Latihan Soal', kuis: 'Kuis Interaktif', ujian: 'Ujian Evaluasi' };

          return (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={`px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm capitalize transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-purple-700 text-white shadow-md ring-2 ring-purple-300'
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

      {/* 4 Sub-Menu Categories Bar (Qowaid, Hiwar, Kosakata, Mahfudzot) */}
      <div className="bg-slate-900 p-2 rounded-2xl border border-slate-800 shadow-md">
        <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider px-3 py-1 mb-1">
          Kategori Sub-Menu {activeType === 'kuis' ? 'Kuis Interaktif' : 'Penilaian'}:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {subMenuCategories.map((sub) => {
            const Icon = sub.icon;
            const isActive = activeSubCategory === sub.id;
            const catCount = penilaianList.filter(p => p.type === activeType && (p.category === sub.id || p.category === 'umum')).length;

            return (
              <button
                key={sub.id}
                onClick={() => setActiveSubCategory(sub.id)}
                className={`p-3 rounded-xl font-bold text-xs transition-all flex items-center justify-between gap-2 cursor-pointer text-left ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 font-extrabold truncate">
                    <Icon size={15} className={isActive ? 'text-white' : 'text-emerald-400'} />
                    <span className="truncate">{sub.label.split(' ')[0]}</span>
                  </div>
                  <span className="text-[11px] font-arabic opacity-80 block truncate mt-0.5">
                    {sub.arabicLabel}
                  </span>
                </div>
                {sub.id === 'kosakata' ? (
                  <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase bg-amber-400 text-slate-950 shrink-0">
                    Otomatis
                  </span>
                ) : (
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black shrink-0 ${isActive ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'}`}>
                    {catCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SPECIAL FEATURE: Dynamic Kosakata Quiz Configurator Card */}
      {activeSubCategory === 'kosakata' && (
        <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-emerald-500/30 space-y-5 relative overflow-hidden">
          {/* Subtle Background Arabic Text */}
          <div className="absolute right-0 top-0 opacity-10 font-arabic text-8xl select-none pointer-events-none text-white pr-4 pt-2">
            المُفْرَدَات
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-400 text-slate-950 rounded-2xl shadow-md shrink-0">
                <Zap size={22} className="fill-slate-950" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-400/30">
                  Fitur Kuis Kosakata Cerdas Interaktif
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
                  Generator Kuis Kosakata Otomatis
                </h3>
                <p className="text-xs text-emerald-100/80">
                  Sistem membuat soal acak dari database mufrodat (1 jawaban benar, 1 salah sama bab, 2 salah bab beda).
                </p>
              </div>
            </div>
          </div>

          {/* Configuration Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs relative z-10">
            
            {/* 1. Lingkup / Cakupan Kosakata */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 space-y-2">
              <label className="font-extrabold text-amber-300 block flex items-center gap-1.5">
                <Layers size={14} /> 1. Cakupan Bab Kosakata
              </label>

              <div className="space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-white/90 hover:text-white">
                  <input
                    type="radio"
                    name="scopeType"
                    checked={kosakataConfig.scopeType === 'all'}
                    onChange={() => setKosakataConfig({ ...kosakataConfig, scopeType: 'all' })}
                    className="accent-amber-400"
                  />
                  <span>Semua Kosakata (Seluruh Bab)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-white/90 hover:text-white">
                  <input
                    type="radio"
                    name="scopeType"
                    checked={kosakataConfig.scopeType === 'specific'}
                    onChange={() => setKosakataConfig({ ...kosakataConfig, scopeType: 'specific' })}
                    className="accent-amber-400"
                  />
                  <span>Pilih Bab Spesifik</span>
                </label>

                {kosakataConfig.scopeType === 'specific' && (
                  <div className="pt-1 pl-6">
                    <select
                      value={kosakataConfig.specificBab}
                      onChange={(e) => setKosakataConfig({ ...kosakataConfig, specificBab: Number(e.target.value) })}
                      className="w-full bg-slate-900 text-white font-bold px-3 py-1.5 rounded-xl border border-emerald-400/40 focus:outline-hidden"
                    >
                      {(availableBabs.length > 0 ? availableBabs : [1, 2, 3, 4, 5]).map(b => (
                        <option key={b} value={b}>Bab {b}</option>
                      ))}
                    </select>
                  </div>
                )}

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-white/90 hover:text-white pt-1">
                  <input
                    type="radio"
                    name="scopeType"
                    checked={kosakataConfig.scopeType === 'range'}
                    onChange={() => setKosakataConfig({ ...kosakataConfig, scopeType: 'range' })}
                    className="accent-amber-400"
                  />
                  <span>Rentang Bab (Range)</span>
                </label>

                {kosakataConfig.scopeType === 'range' && (
                  <div className="pt-1 pl-6 flex items-center gap-2">
                    <select
                      value={kosakataConfig.rangeStartBab}
                      onChange={(e) => setKosakataConfig({ ...kosakataConfig, rangeStartBab: Number(e.target.value) })}
                      className="w-full bg-slate-900 text-white font-bold px-2.5 py-1.5 rounded-xl border border-emerald-400/40"
                    >
                      {(availableBabs.length > 0 ? availableBabs : [1, 2, 3, 4, 5]).map(b => (
                        <option key={b} value={b}>Bab {b}</option>
                      ))}
                    </select>
                    <span className="font-bold text-white/70">s/d</span>
                    <select
                      value={kosakataConfig.rangeEndBab}
                      onChange={(e) => setKosakataConfig({ ...kosakataConfig, rangeEndBab: Number(e.target.value) })}
                      className="w-full bg-slate-900 text-white font-bold px-2.5 py-1.5 rounded-xl border border-emerald-400/40"
                    >
                      {(availableBabs.length > 0 ? availableBabs : [1, 2, 3, 4, 5]).map(b => (
                        <option key={b} value={b}>Bab {b}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Arah Menerjemahkan */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 space-y-2">
              <label className="font-extrabold text-amber-300 block flex items-center gap-1.5">
                <RefreshCw size={14} /> 2. Mode Penerjemahan
              </label>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => setKosakataConfig({ ...kosakataConfig, direction: 'arab_indo' })}
                  className={`w-full p-2.5 rounded-xl font-bold flex items-center justify-between border transition-all cursor-pointer ${
                    kosakataConfig.direction === 'arab_indo'
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md'
                      : 'bg-slate-900/60 text-white border-white/20 hover:bg-slate-900'
                  }`}
                >
                  <span className="font-extrabold">Arab ➔ Indonesia</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-black/20 rounded-md">
                    (Soal Arab)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setKosakataConfig({ ...kosakataConfig, direction: 'indo_arab' })}
                  className={`w-full p-2.5 rounded-xl font-bold flex items-center justify-between border transition-all cursor-pointer ${
                    kosakataConfig.direction === 'indo_arab'
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md'
                      : 'bg-slate-900/60 text-white border-white/20 hover:bg-slate-900'
                  }`}
                >
                  <span className="font-extrabold">Indonesia ➔ Arab</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-black/20 rounded-md">
                    (Soal Indo)
                  </span>
                </button>
              </div>
            </div>

            {/* 3. Jumlah Soal & Timer */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 space-y-2">
              <label className="font-extrabold text-amber-300 block flex items-center gap-1.5">
                <Clock size={14} /> 3. Jumlah Soal & Timer
              </label>

              <div className="grid grid-cols-2 gap-1.5 pt-1">
                {[
                  { count: 10, time: '5 Mnt' },
                  { count: 20, time: '10 Mnt' },
                  { count: 30, time: '15 Mnt' },
                  { count: 40, time: '20 Mnt' },
                  { count: 50, time: '25 Mnt' },
                ].map((item) => (
                  <button
                    key={item.count}
                    type="button"
                    onClick={() => setKosakataConfig({ ...kosakataConfig, questionCount: item.count as any })}
                    className={`p-2 rounded-xl text-center border font-extrabold transition-all cursor-pointer ${
                      kosakataConfig.questionCount === item.count
                        ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-md'
                        : 'bg-slate-900/60 text-slate-200 border-white/15 hover:bg-slate-900'
                    }`}
                  >
                    <div>{item.count} Soal</div>
                    <div className="text-[10px] font-normal opacity-80">⏳ {item.time}</div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Action Trigger Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 relative z-10">
            <div className="text-xs text-emerald-200/90 font-medium">
              ✨ Soal diacak otomatis setiap sesi. Pilihan jawaban benar & salah bervariasi antar siswa.
            </div>

            <button
              type="button"
              onClick={handleLaunchDynamicKosakataQuiz}
              className="w-full sm:w-auto px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              <Play size={18} className="fill-slate-950 group-hover:scale-110 transition-transform" />
              <span>Mulai Kuis Kosakata Interaktif Sekarang</span>
            </button>
          </div>
        </div>
      )}

      {/* Preset Assessment Cards Grid */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-slate-900 text-base flex items-center justify-between">
          <span>Paket {activeType === 'kuis' ? 'Kuis' : 'Soal'} Terstruktur ({filteredList.length})</span>
          <span className="text-xs text-slate-400 font-normal">Sesuai Kategori Sub-Menu</span>
        </h3>

        {filteredList.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs font-medium space-y-2">
            <AlertCircle size={28} className="mx-auto text-slate-300" />
            <p>Belum ada paket {activeType} terstruktur untuk kategori sub-menu ini.</p>
            {activeSubCategory === 'kosakata' && (
              <p className="text-emerald-700 font-bold">
                Gunakan <strong>Generator Kuis Kosakata Otomatis</strong> di atas untuk langsung mengerjakan kuis!
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                        {p.type} • {p.category}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                        <Clock size={14} className="text-amber-500" /> {p.durationMinutes} Menit
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {p.title}
                    </h3>

                    <div className="space-y-1">
                      <p className="text-xs text-slate-500">
                        {p.questions.length} Butir Soal • KKM {p.passingGrade}/100
                      </p>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
                        🎲 Soal & Opsi Diacak Otomatis
                      </span>
                    </div>
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
                      type="button"
                      onClick={() => setActiveQuizForRun(p)}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer ${
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
        )}
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
