import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Materi, Student, CategoryType } from '../../../types';
import { CheckCircle2, Search, Filter, BookOpen, MessageSquare, List, Quote, Users, ChevronDown, ChevronUp, Info, Crown, Award, Target, Sparkles, Check, HelpCircle } from 'lucide-react';

interface MonitoringPemahamanViewProps {
  materiList: Materi[];
  students: Student[];
}

export const MonitoringPemahamanView: React.FC<MonitoringPemahamanViewProps> = ({
  materiList,
  students,
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('qowaid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('semua');
  const [expandedMateriId, setExpandedMateriId] = useState<string | null>(null);

  // Extract unique class names
  const classOptions = Array.from(new Set(students.map(s => s.className).filter(Boolean)));

  // Filter students based on class selection
  const activeStudents = students.filter(s => {
    if (s.status === 'ditolak' || s.status === 'nonaktif') return false;
    if (selectedClassFilter !== 'semua' && s.className !== selectedClassFilter) return false;
    return true;
  });

  const totalActiveStudents = activeStudents.length;

  // Filter materi list by active category & search term
  const categoryMateriList = materiList.filter(m => m.category === activeCategory);
  const filteredMateriList = categoryMateriList.filter(m =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.arabicTitle && m.arabicTitle.includes(searchTerm)) ||
    (m.description && m.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleExpand = (id: string) => {
    setExpandedMateriId(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
              <Sparkles size={14} /> Monitoring Pemahaman &amp; Capaian Hafalan Siswa
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Rekap Pemahaman &amp; Hafalan Per Materi
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              Pantau persentase siswa yang telah memahami target materi Qowaid &amp; Hiwar (tanda mandiri) serta progress hafalan Kosakata dan Mahfudzot (tanda mandiri &amp; verifikasi guru).
            </p>
          </div>

          <div className="p-3 bg-white/10 rounded-xl border border-white/20 text-right shrink-0">
            <span className="text-[10px] text-emerald-200 uppercase font-bold block">Siswa Dipantau</span>
            <span className="text-xl font-black font-mono text-amber-300">{totalActiveStudents} Siswa</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari judul materi / topik..."
              className="w-full pl-9 pr-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:bg-white/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-slate-300 font-bold shrink-0">Filter Kelas:</label>
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:bg-slate-800"
            >
              <option value="semua" className="text-slate-900">Semua Kelas ({classOptions.length})</option>
              {classOptions.map((cls, idx) => (
                <option key={idx} value={cls} className="text-slate-900">{cls}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200">
        <button
          onClick={() => setActiveCategory('qowaid')}
          className={`py-3 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeCategory === 'qowaid'
              ? 'bg-emerald-700 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen size={16} /> Qowaid
        </button>

        <button
          onClick={() => setActiveCategory('hiwar')}
          className={`py-3 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeCategory === 'hiwar'
              ? 'bg-sky-700 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessageSquare size={16} /> Hiwar
        </button>

        <button
          onClick={() => setActiveCategory('kosakata')}
          className={`py-3 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeCategory === 'kosakata'
              ? 'bg-teal-700 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <List size={16} /> Kosakata
        </button>

        <button
          onClick={() => setActiveCategory('mahfudzot')}
          className={`py-3 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeCategory === 'mahfudzot'
              ? 'bg-purple-700 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Quote size={16} /> Mahfudzot
        </button>
      </div>

      {/* Notice Banner for Qowaid */}
      {activeCategory === 'qowaid' && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-amber-950 text-xs flex items-start gap-3 shadow-2xs">
          <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-extrabold block">Catatan Pemahaman Materi Qowaid:</span>
            <p className="leading-relaxed">
              Data pemahaman Qowaid di bawah ini dihitung berdasarkan tanda <strong>"Sudah Dipahami"</strong> yang diklik siswa secara mandiri pada modul. Verifikasi resmi bahwa target materi Qowaid telah tuntas sepenuhnya adalah melalui pengerjaan <strong>latihan dan kuis Qowaid</strong> (dilengkapi pada update mendatang).
            </p>
          </div>
        </div>
      )}

      {/* Notice Banner for Hiwar */}
      {activeCategory === 'hiwar' && (
        <div className="p-4 bg-sky-50 border border-sky-300 rounded-2xl text-sky-950 text-xs flex items-start gap-3 shadow-2xs">
          <Info size={18} className="text-sky-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-extrabold block">Catatan Pembelajaran Hiwar:</span>
            <p className="leading-relaxed">
              Persentase pemahaman percakapan Hiwar dihitung berdasarkan konfirmasi dipelajari oleh siswa. Siswa juga dapat melatih artikulasi melalui simulasi percakapan Ustaz AI.
            </p>
          </div>
        </div>
      )}

      {/* Material List Cards */}
      {filteredMateriList.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
          Belum ada data materi untuk kategori <strong>{activeCategory.toUpperCase()}</strong>.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMateriList.map((materi) => {
            const isExpanded = expandedMateriId === materi.id;

            // 1. Compute Qowaid stats
            if (activeCategory === 'qowaid') {
              const studentsUnderstood = activeStudents.filter(s => !!s.hafalanProgress?.selfQowaidIds?.[materi.id]);
              const understoodCount = studentsUnderstood.length;
              const understoodPct = totalActiveStudents > 0 ? Math.round((understoodCount / totalActiveStudents) * 100) : 0;

              return (
                <div key={materi.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 uppercase">
                          Bab {materi.babNumber || 1}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">Tingkat {materi.level || 'Dasar'}</span>
                      </div>
                      <h3 className="font-extrabold text-base text-slate-900">{materi.title}</h3>
                      {materi.arabicTitle && (
                        <p className="font-arabic text-lg text-emerald-800">{materi.arabicTitle}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Gauge Bar */}
                      <div className="text-right space-y-1 min-w-[140px]">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-600">Dipahami Siswa:</span>
                          <span className="text-emerald-700 font-extrabold">{understoodCount}/{totalActiveStudents} ({understoodPct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                          <div
                            className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${understoodPct}%` }}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleExpand(materi.id)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
                        title="Lihat Daftar Siswa"
                      >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Student List */}
                  {isExpanded && (
                    <div className="p-5 bg-slate-50 border-t border-slate-200 space-y-4 text-xs">
                      {/* Targets Breakdown if available */}
                      {materi.learningTargets && materi.learningTargets.length > 0 && (
                        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                          <span className="font-extrabold text-slate-800 flex items-center gap-1.5 text-xs">
                            <Target size={14} className="text-emerald-600" /> Target Pembelajaran Bab Ini:
                          </span>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {materi.learningTargets.map((tgt, i) => (
                              <li key={`${materi.id}-tgt-${i}`} className="flex items-center gap-1.5 text-[11px] text-slate-700">
                                <span className="text-emerald-600 font-bold">•</span>
                                <span>{tgt}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Students who marked understood */}
                        <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2">
                          <span className="font-extrabold text-emerald-900 block text-xs">
                            ✅ Sudah Menandai Dipahami ({understoodCount} Siswa):
                          </span>
                          {studentsUnderstood.length === 0 ? (
                            <p className="text-[11px] text-slate-400 italic">Belum ada siswa yang menandai.</p>
                          ) : (
                            <div className="space-y-1.5 max-h-48 overflow-y-auto">
                              {studentsUnderstood.map((s, sIdx) => (
                                <div key={`${materi.id}-qowaid-done-${s.id}-${sIdx}`} className="p-2 bg-white rounded-lg border border-emerald-100 flex items-center justify-between text-[11px]">
                                  <span className="font-extrabold text-slate-900">{s.name}</span>
                                  <span className="text-slate-500">{s.className} • {s.rombelName || 'Umum'}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Students who haven't marked understood */}
                        <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl space-y-2">
                          <span className="font-extrabold text-slate-700 block text-xs">
                            ⏳ Belum Menandai ({totalActiveStudents - understoodCount} Siswa):
                          </span>
                          {activeStudents.filter(s => !s.hafalanProgress?.selfQowaidIds?.[materi.id]).length === 0 ? (
                            <p className="text-[11px] text-emerald-700 font-bold">Seluruh siswa sudah menandai dipahami!</p>
                          ) : (
                            <div className="space-y-1.5 max-h-48 overflow-y-auto">
                              {activeStudents.filter(s => !s.hafalanProgress?.selfQowaidIds?.[materi.id]).map((s, sIdx) => (
                                <div key={`${materi.id}-qowaid-pending-${s.id}-${sIdx}`} className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-[11px]">
                                  <span className="font-bold text-slate-700">{s.name}</span>
                                  <span className="text-slate-400">{s.className}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            // 2. Compute Hiwar stats
            if (activeCategory === 'hiwar') {
              const studentsUnderstood = activeStudents.filter(s => !!s.hafalanProgress?.selfHiwarIds?.[materi.id]);
              const understoodCount = studentsUnderstood.length;
              const understoodPct = totalActiveStudents > 0 ? Math.round((understoodCount / totalActiveStudents) * 100) : 0;

              return (
                <div key={materi.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-100 text-sky-800 uppercase">
                          Hiwar Bab {materi.babNumber || 1}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-base text-slate-900">{materi.title}</h3>
                      {materi.arabicTitle && (
                        <p className="font-arabic text-lg text-sky-800">{materi.arabicTitle}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right space-y-1 min-w-[140px]">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-600">Dipahami:</span>
                          <span className="text-sky-700 font-extrabold">{understoodCount}/{totalActiveStudents} ({understoodPct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                          <div
                            className="bg-sky-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${understoodPct}%` }}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleExpand(materi.id)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
                      >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-5 bg-slate-50 border-t border-slate-200 text-xs">
                      <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl space-y-2">
                        <span className="font-extrabold text-sky-900 block">Daftar Siswa Sudah Menandai Hiwar Dipahami:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {studentsUnderstood.map((s, sIdx) => (
                            <div key={`${materi.id}-hiwar-student-${s.id}-${sIdx}`} className="p-2 bg-white rounded-lg border border-sky-100 font-bold text-slate-800">
                              {s.name} ({s.className})
                            </div>
                          ))}
                          {studentsUnderstood.length === 0 && (
                            <p className="text-slate-400 italic">Belum ada siswa.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            // 3. Compute Kosakata stats (per Bab)
            if (activeCategory === 'kosakata') {
              const vocabs = materi.vocabularies || [];
              const totalVocabCount = vocabs.length;

              // Calculate average self-marked & average verified per student for this bab
              let totalSelfMarkedInBab = 0;
              let totalVerifiedInBab = 0;

              activeStudents.forEach(s => {
                const selfCount = vocabs.filter(v => !!s.hafalanProgress?.selfKosakataIds?.[v.id]).length;
                const verifiedCount = vocabs.filter(v => !!s.hafalanProgress?.kosakataIds?.[v.id] || !!s.hafalanProgress?.quizVerifiedKosakataIds?.[v.id]).length;
                totalSelfMarkedInBab += selfCount;
                totalVerifiedInBab += verifiedCount;
              });

              const maxPossible = totalVocabCount * totalActiveStudents;
              const selfPct = maxPossible > 0 ? Math.round((totalSelfMarkedInBab / maxPossible) * 100) : 0;
              const verifiedPct = maxPossible > 0 ? Math.round((totalVerifiedInBab / maxPossible) * 100) : 0;

              return (
                <div key={materi.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 text-teal-800 uppercase">
                          Kosakata Bab {materi.babNumber || 1} • {totalVocabCount} Mufrodat
                        </span>
                      </div>
                      <h3 className="font-extrabold text-base text-slate-900">{materi.title}</h3>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Self Marked Stat */}
                      <div className="text-right space-y-1">
                        <span className="text-[10px] font-bold text-sky-700 block">Tanda Siswa (Mandiri)</span>
                        <span className="px-2.5 py-1 bg-sky-100 text-sky-900 font-extrabold text-xs rounded-lg border border-sky-300 inline-block">
                          {selfPct}% Dihafal
                        </span>
                      </div>

                      {/* Verified Stat */}
                      <div className="text-right space-y-1">
                        <span className="text-[10px] font-bold text-emerald-700 block">Verifikasi Guru/Kuis</span>
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 font-extrabold text-xs rounded-lg border border-emerald-300 inline-block">
                          {verifiedPct}% Terverifikasi
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleExpand(materi.id)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
                      >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-5 bg-slate-50 border-t border-slate-200 space-y-3 text-xs">
                      <span className="font-extrabold text-slate-800 block">Rincian Progress Siswa per Kata ({totalVocabCount} Kata):</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                        {vocabs.map((v, vIdx) => {
                          const selfCount = activeStudents.filter(s => !!s.hafalanProgress?.selfKosakataIds?.[v.id]).length;
                          const verifiedCount = activeStudents.filter(s => !!s.hafalanProgress?.kosakataIds?.[v.id] || !!s.hafalanProgress?.quizVerifiedKosakataIds?.[v.id]).length;
                          return (
                            <div key={`${materi.id}-vocab-stat-${v.id || vIdx}-${vIdx}`} className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                              <div>
                                <span className="font-arabic font-extrabold text-slate-900 text-sm block dir-rtl">{v.word}</span>
                                <span className="text-[11px] text-slate-500 font-medium">{v.meaning}</span>
                              </div>
                              <div className="text-right text-[10px] space-y-0.5">
                                <span className="text-sky-700 font-bold block">🔖 Siswa: {selfCount}/{totalActiveStudents}</span>
                                <span className="text-emerald-700 font-bold block">👑 Verified: {verifiedCount}/{totalActiveStudents}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            // 4. Compute Mahfudzot stats
            if (activeCategory === 'mahfudzot') {
              const selfMarkedStudents = activeStudents.filter(s => !!s.hafalanProgress?.selfMahfudzotIds?.[materi.id]);
              const verifiedStudents = activeStudents.filter(s => {
                const chk = s.hafalanProgress?.mahfudzotChecklist?.[materi.id];
                return chk && (chk.hafalanArab || chk.hafalanTerjemah || chk.pengetahuanKosakata || chk.pemahamanMateri);
              });

              const selfCount = selfMarkedStudents.length;
              const verifiedCount = verifiedStudents.length;

              const selfPct = totalActiveStudents > 0 ? Math.round((selfCount / totalActiveStudents) * 100) : 0;
              const verifiedPct = totalActiveStudents > 0 ? Math.round((verifiedCount / totalActiveStudents) * 100) : 0;

              return (
                <div key={materi.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 uppercase">
                          Mahfudzot No. {materi.mahfudzot?.number || materi.babNumber || 1}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-base text-slate-900">{materi.title}</h3>
                      {materi.mahfudzot?.arabic && (
                        <p className="font-arabic text-lg text-purple-900 dir-rtl">{materi.mahfudzot.arabic}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right space-y-1">
                        <span className="text-[10px] font-bold text-indigo-700 block">Tanda Siswa (Mandiri)</span>
                        <span className="px-2.5 py-1 bg-indigo-100 text-indigo-900 font-extrabold text-xs rounded-lg border border-indigo-300 inline-block">
                          {selfCount}/{totalActiveStudents} ({selfPct}%)
                        </span>
                      </div>

                      <div className="text-right space-y-1">
                        <span className="text-[10px] font-bold text-purple-700 block">Ceklis Guru</span>
                        <span className="px-2.5 py-1 bg-purple-100 text-purple-900 font-extrabold text-xs rounded-lg border border-purple-300 inline-block">
                          {verifiedCount}/{totalActiveStudents} ({verifiedPct}%)
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleExpand(materi.id)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
                      >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-5 bg-slate-50 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2">
                        <span className="font-extrabold text-indigo-900 block">Ditandai Hafal oleh Siswa ({selfCount} Siswa):</span>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {selfMarkedStudents.map((s, sIdx) => (
                            <div key={`${materi.id}-mahfudzot-self-${s.id}-${sIdx}`} className="p-2 bg-white rounded-lg border border-indigo-100 font-bold text-slate-800">
                              {s.name} ({s.className})
                            </div>
                          ))}
                          {selfCount === 0 && <p className="text-slate-400 italic">Belum ada siswa.</p>}
                        </div>
                      </div>

                      <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-2">
                        <span className="font-extrabold text-purple-900 block">Diceklis oleh Guru ({verifiedCount} Siswa):</span>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {verifiedStudents.map((s, sIdx) => {
                            const chk = s.hafalanProgress?.mahfudzotChecklist?.[materi.id];
                            return (
                              <div key={`${materi.id}-mahfudzot-vfd-${s.id}-${sIdx}`} className="p-2 bg-white rounded-lg border border-purple-100 flex items-center justify-between text-[11px]">
                                <span className="font-bold text-slate-800">{s.name}</span>
                                <span className="text-[10px] text-purple-800 font-mono">
                                  {[chk?.hafalanArab && 'Arab', chk?.hafalanTerjemah && 'Terjemah', chk?.pengetahuanKosakata && 'Vocab', chk?.pemahamanMateri && 'Hikmah'].filter(Boolean).join(', ')}
                                </span>
                              </div>
                            );
                          })}
                          {verifiedCount === 0 && <p className="text-slate-400 italic">Belum ada siswa verified.</p>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return null;
          })}
        </div>
      )}
    </div>
  );
};
