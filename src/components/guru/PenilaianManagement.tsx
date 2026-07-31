import React, { useState } from 'react';
import { Penilaian, Question, AssessmentType, CategoryType } from '../../types';
import { Plus, Edit3, Trash2, Clock, Award, FileCheck2, CheckCircle2, HelpCircle, X, Sparkles, AlertCircle } from 'lucide-react';

interface PenilaianManagementProps {
  penilaianList: Penilaian[];
  onSavePenilaian: (updated: Penilaian[]) => void;
}

export const PenilaianManagement: React.FC<PenilaianManagementProps> = ({
  penilaianList,
  onSavePenilaian,
}) => {
  const [activeType, setActiveType] = useState<AssessmentType>('kuis');

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPenilaian, setEditingPenilaian] = useState<Penilaian | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    type: 'kuis' as AssessmentType,
    category: 'umum' as CategoryType | 'umum',
    durationMinutes: 15,
    passingGrade: 75,
    questions: [] as Question[],
  });

  const filteredList = penilaianList.filter(p => p.type === activeType);

  const handleOpenAddModal = () => {
    setEditingPenilaian(null);
    setFormData({
      title: '',
      type: activeType,
      category: 'umum',
      durationMinutes: 15,
      passingGrade: 75,
      questions: [
        {
          id: 'q1',
          type: 'multiple_choice',
          questionText: 'Manakah di bawah ini yang merupakan contoh Isim?',
          questionArabic: 'أَيُّ كَلِمَةٍ اسْمٌ؟',
          options: ['كَتَبَ', 'الْمَسْجِدُ', 'عَلَى', 'يَكْتُبُ'],
          correctAnswer: 1,
          explanation: 'الْمَسْجِدُ adalah Isim (kata benda).',
          points: 25,
        }
      ],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Penilaian) => {
    setEditingPenilaian(p);
    setFormData({
      title: p.title,
      type: p.type,
      category: p.category,
      durationMinutes: p.durationMinutes,
      passingGrade: p.passingGrade,
      questions: p.questions || [],
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus paket soal penilaian ini?')) {
      const updated = penilaianList.filter(p => p.id !== id);
      onSavePenilaian(updated);
    }
  };

  const handleAddQuestion = () => {
    const newQ: Question = {
      id: `q-${Date.now()}`,
      type: 'multiple_choice',
      questionText: 'Soal baru...',
      options: ['Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D'],
      correctAnswer: 0,
      explanation: 'Penjelasan jawaban benar.',
      points: 25,
    };
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQ],
    }));
  };

  const handleRemoveQuestion = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || formData.questions.length === 0) {
      alert('Judul dan minimal 1 soal harus diisi.');
      return;
    }

    const totalPts = formData.questions.reduce((acc, q) => acc + (q.points || 25), 0);

    if (editingPenilaian) {
      const updated = penilaianList.map(p => {
        if (p.id === editingPenilaian.id) {
          return {
            ...p,
            title: formData.title,
            type: formData.type,
            category: formData.category,
            durationMinutes: formData.durationMinutes,
            passingGrade: formData.passingGrade,
            questions: formData.questions,
            totalPoints: totalPts,
          };
        }
        return p;
      });
      onSavePenilaian(updated);
    } else {
      const newPen: Penilaian = {
        id: `pen-${Date.now()}`,
        title: formData.title,
        type: formData.type,
        category: formData.category,
        durationMinutes: formData.durationMinutes,
        passingGrade: formData.passingGrade,
        questions: formData.questions,
        totalPoints: totalPts,
        createdAt: new Date().toISOString(),
      };
      onSavePenilaian([...penilaianList, newPen]);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Kelola Latihan, Kuis & Ujian</h2>
          <p className="text-xs text-slate-500">
            Sesuai sheet modul Guru: Buat paket soal evaluasi interaktif, atur timer pengerjaan, dan KKM kelulusan.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md flex items-center gap-2"
        >
          <Plus size={18} /> Buat Paket Soal Baru
        </button>
      </div>

      {/* Assessment Type Switcher Tabs */}
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

      {/* Assessment List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredList.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <FileCheck2 size={36} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-500">Belum ada paket penilaian untuk kategori ini.</p>
            <p className="text-xs text-slate-400 mt-1">Klik "Buat Paket Soal Baru" untuk mulai menyusun kuis.</p>
          </div>
        ) : (
          filteredList.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
            >
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                    {p.type}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <Clock size={14} className="text-amber-500" /> {p.durationMinutes} Menit
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {p.title}
                </h3>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <span>Total Soal: <strong className="text-slate-900">{p.questions.length} Butir</strong></span>
                  <span>KKM: <strong className="text-emerald-700">{p.passingGrade} / 100</strong></span>
                </div>
              </div>

              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Dibuat {new Date(p.createdAt).toLocaleDateString('id-ID')}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(p)}
                    className="p-1.5 text-slate-600 hover:bg-slate-200/60 rounded-lg"
                    title="Edit Paket Soal"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-100/60 rounded-lg"
                    title="Hapus Paket Soal"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Form Modal Buat / Edit Kuis */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <form
            onSubmit={handleSubmitForm}
            className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 my-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {editingPenilaian ? 'Edit Paket Penilaian' : 'Buat Paket Penilaian Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul Evaluasi / Kuis</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Kuis 1 Bahasa Arab Qowaid"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tipe Evaluasi</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as AssessmentType })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-emerald-500"
                >
                  <option value="latihan">Latihan Soal</option>
                  <option value="kuis">Kuis Interaktif</option>
                  <option value="ujian">Ujian Evaluasi</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Durasi Timer (Menit)</label>
                <input
                  type="number"
                  min={1}
                  max={180}
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 10 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nilai KKM (Passing Grade)</label>
                <input
                  type="number"
                  min={10}
                  max={100}
                  value={formData.passingGrade}
                  onChange={(e) => setFormData({ ...formData, passingGrade: parseInt(e.target.value) || 75 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Questions Builder */}
            <div className="space-y-4 pt-2 border-t">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm">
                  Daftar Soal ({formData.questions.length} Butir Soal)
                </h4>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-bold text-xs hover:bg-emerald-100 flex items-center gap-1"
                >
                  <Plus size={14} /> Tambah Soal
                </button>
              </div>

              <div className="space-y-4">
                {formData.questions.map((q, idx) => (
                  <div key={q.id || idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(idx)}
                      className="absolute top-3 right-3 text-rose-500 hover:text-rose-700 text-xs font-bold"
                      title="Hapus Soal ini"
                    >
                      Hapus
                    </button>

                    <div className="font-bold text-slate-700 text-xs">Soal No. {idx + 1}</div>

                    <div className="space-y-2 text-xs">
                      <input
                        type="text"
                        required
                        value={q.questionText}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            questions: prev.questions.map((item, i) => i === idx ? { ...item, questionText: val } : item)
                          }));
                        }}
                        placeholder="Teks pertanyaan (Indonesia)..."
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                      />

                      <input
                        type="text"
                        dir="rtl"
                        value={q.questionArabic || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            questions: prev.questions.map((item, i) => i === idx ? { ...item, questionArabic: val } : item)
                          }));
                        }}
                        placeholder="Pertanyaan Bahasa Arab (Opsional)..."
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-arabic text-base"
                      />

                      {/* Options for Multiple Choice */}
                      {q.options && (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`correct-${idx}`}
                                checked={q.correctAnswer === optIdx}
                                onChange={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    questions: prev.questions.map((item, i) => i === idx ? { ...item, correctAnswer: optIdx } : item)
                                  }));
                                }}
                              />
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const newOpts = [...q.options!];
                                  newOpts[optIdx] = val;
                                  setFormData(prev => ({
                                    ...prev,
                                    questions: prev.questions.map((item, i) => i === idx ? { ...item, options: newOpts } : item)
                                  }));
                                }}
                                placeholder={`Pilihan ${optIdx + 1}`}
                                className="w-full px-2.5 py-1 border border-slate-300 rounded-md text-xs bg-white"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      <input
                        type="text"
                        value={q.explanation || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            questions: prev.questions.map((item, i) => i === idx ? { ...item, explanation: val } : item)
                          }));
                        }}
                        placeholder="Penjelasan pembahasan jawaban..."
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white italic text-slate-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-xs"
              >
                Simpan Paket Soal
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
