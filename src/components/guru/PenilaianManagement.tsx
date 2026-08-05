import React, { useState } from 'react';
import { Penilaian, Question, AssessmentType, CategoryType, Student } from '../../types';
import { Plus, Edit3, Trash2, Clock, Award, FileCheck2, CheckCircle2, HelpCircle, X, Sparkles, AlertCircle, FileSpreadsheet, Upload, Shuffle, Eye, Calendar, Layers, Hash } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { ExportNilaiModal } from './ExportNilaiModal';

interface PenilaianManagementProps {
  penilaianList: Penilaian[];
  students?: Student[];
  onSavePenilaian: (updated: Penilaian[]) => void;
}

export const PenilaianManagement: React.FC<PenilaianManagementProps> = ({
  penilaianList,
  students = [],
  onSavePenilaian,
}) => {
  const [activeType, setActiveType] = useState<AssessmentType>('latihan');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [selectedBabFilter, setSelectedBabFilter] = useState<number | 'all'>('all');
  const [showExportModal, setShowExportModal] = useState(false);

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPenilaian, setEditingPenilaian] = useState<Penilaian | null>(null);

  // Bulk Sheet Upload Modal State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkSheetText, setBulkSheetText] = useState('');

  const [formData, setFormData] = useState({
    code: '',
    title: '',
    type: 'latihan' as AssessmentType,
    category: 'qowaid' as CategoryType | 'umum',
    babNumber: 1,
    gradingMethod: 'digital' as 'digital' | 'manual',
    durationMinutes: 15,
    passingGrade: 75,
    questionsToShow: 5,
    randomizeQuestions: true,
    randomizeOptions: true,
    prioritizeUnseen: true,
    questions: [] as Question[],
  });

  const filteredList = penilaianList.filter(p => {
    if (p.type !== activeType) return false;
    if (activeCategoryFilter !== 'all' && p.category !== activeCategoryFilter) return false;
    if (selectedBabFilter !== 'all' && (p.babNumber || 1) !== selectedBabFilter) return false;
    return true;
  });

  // Extract unique bab numbers available
  const availableBabs = Array.from(
    new Set(penilaianList.map(p => p.babNumber || 1))
  ).sort((a, b) => Number(a) - Number(b));

  const handleOpenAddModal = (defaultBab?: number, defaultCategory?: CategoryType) => {
    setEditingPenilaian(null);
    const newBab = defaultBab || 1;
    const newCat = defaultCategory || 'qowaid';
    setFormData({
      code: `TMR-${newCat.toUpperCase()}-BAB${newBab}-${Math.floor(100 + Math.random() * 900)}`,
      title: `Tamrin / Latihan Bab ${newBab}`,
      type: activeType,
      category: newCat,
      babNumber: newBab,
      gradingMethod: 'digital',
      durationMinutes: 15,
      passingGrade: 75,
      questionsToShow: 5,
      randomizeQuestions: true,
      randomizeOptions: true,
      prioritizeUnseen: true,
      questions: [
        {
          id: `q-${Date.now()}-1`,
          code: `Q-BAB${newBab}-1`,
          type: 'multiple_choice',
          questionText: 'Pilihlah jawaban yang paling tepat dari pertanyaan di bawah ini:',
          questionArabic: 'اخْتَرْ الإِجَابَةَ الصَّحِيْحَةَ:',
          options: ['Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D'],
          correctAnswer: 0,
          explanation: 'Pembahasan jawaban benar.',
          points: 20,
        }
      ],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Penilaian) => {
    setEditingPenilaian(p);
    setFormData({
      code: p.code || `TMR-${(p.category || 'qowaid').toUpperCase()}-BAB${p.babNumber || 1}`,
      title: p.title,
      type: p.type,
      category: p.category,
      babNumber: p.babNumber || 1,
      gradingMethod: p.gradingMethod || 'digital',
      durationMinutes: p.durationMinutes,
      passingGrade: p.passingGrade,
      questionsToShow: p.questionsToShow || p.questions.length,
      randomizeQuestions: p.randomizeQuestions ?? true,
      randomizeOptions: p.randomizeOptions ?? true,
      prioritizeUnseen: p.prioritizeUnseen ?? true,
      questions: p.questions || [],
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus paket latihan/penilaian ini?')) {
      const updated = penilaianList.filter(p => p.id !== id);
      onSavePenilaian(updated);
    }
  };

  const handleAddQuestion = () => {
    const qCount = formData.questions.length + 1;
    const newQ: Question = {
      id: `q-${Date.now()}`,
      code: `Q-BAB${formData.babNumber}-${qCount}`,
      type: formData.gradingMethod === 'manual' ? 'essay' : 'multiple_choice',
      questionText: 'Tuliskan teks pertanyaan di sini...',
      questionArabic: '',
      options: formData.gradingMethod === 'manual' ? undefined : ['Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D'],
      correctAnswer: 0,
      explanation: 'Pembahasan...',
      points: 20,
    };
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQ],
      questionsToShow: prev.questionsToShow + 1,
    }));
  };

  const handleRemoveQuestion = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== idx),
    }));
  };

  // Bulk sheet parser
  const handleProcessBulkSheet = () => {
    if (!bulkSheetText.trim()) {
      alert('Teks sheet tidak boleh kosong.');
      return;
    }

    const lines = bulkSheetText.trim().split('\n');
    const importedQuestions: Question[] = [];

    lines.forEach((line, idx) => {
      const parts = line.split('\t').length > 1 ? line.split('\t') : line.split('|');
      if (parts.length >= 2) {
        const textIndo = parts[0]?.trim() || '';
        const textArab = parts[1]?.trim() || '';
        const optA = parts[2]?.trim() || 'Pilihan A';
        const optB = parts[3]?.trim() || 'Pilihan B';
        const optC = parts[4]?.trim() || 'Pilihan C';
        const optD = parts[5]?.trim() || 'Pilihan D';
        const correctIdx = parseInt(parts[6]?.trim() || '0') || 0;
        const expl = parts[7]?.trim() || '';

        importedQuestions.push({
          id: `q-bulk-${Date.now()}-${idx}`,
          code: `Q-BULK-${idx + 1}`,
          type: 'multiple_choice',
          questionText: textIndo,
          questionArabic: textArab,
          options: [optA, optB, optC, optD],
          correctAnswer: correctIdx,
          explanation: expl,
          points: 20,
        });
      }
    });

    if (importedQuestions.length === 0) {
      alert('Format sheet tidak valid. Pastikan menggunakan pemisah tab (Excel/Google Sheet) atau simbol pipe (|).');
      return;
    }

    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, ...importedQuestions],
      questionsToShow: Math.max(prev.questionsToShow, prev.questions.length + importedQuestions.length),
    }));

    setIsBulkModalOpen(false);
    setBulkSheetText('');
    alert(`Berhasil mengimpor ${importedQuestions.length} soal ke bank soal!`);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || formData.questions.length === 0) {
      alert('Judul dan minimal 1 soal harus diisi.');
      return;
    }

    const totalPts = formData.questions.reduce((acc, q) => acc + (q.points || 20), 0);

    if (editingPenilaian) {
      const updated = penilaianList.map(p => {
        if (p.id === editingPenilaian.id) {
          return {
            ...p,
            code: formData.code,
            title: formData.title,
            type: formData.type,
            category: formData.category,
            babNumber: formData.babNumber,
            gradingMethod: formData.gradingMethod,
            durationMinutes: formData.durationMinutes,
            passingGrade: formData.passingGrade,
            questionsToShow: formData.questionsToShow,
            randomizeQuestions: formData.randomizeQuestions,
            randomizeOptions: formData.randomizeOptions,
            prioritizeUnseen: formData.prioritizeUnseen,
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
        code: formData.code,
        title: formData.title,
        type: formData.type,
        category: formData.category,
        babNumber: formData.babNumber,
        gradingMethod: formData.gradingMethod,
        durationMinutes: formData.durationMinutes,
        passingGrade: formData.passingGrade,
        questionsToShow: formData.questionsToShow,
        randomizeQuestions: formData.randomizeQuestions,
        randomizeOptions: formData.randomizeOptions,
        prioritizeUnseen: formData.prioritizeUnseen,
        questions: formData.questions,
        totalPoints: totalPts,
        createdAt: new Date().toISOString(),
      };
      onSavePenilaian([...penilaianList, newPen]);

      // Alert all students about new kuis/latihan
      notificationService.addNotificationToAllStudents({
        title: `🎯 ${newPen.type === 'kuis' ? 'Kuis Baru Dibuka' : newPen.type === 'ujian' ? 'Ujian Evaluasi Dibuka' : 'Tamrin / Latihan Baru'}: ${newPen.title}`,
        message: `Paket ${newPen.type} Bab ${newPen.babNumber || 1} (${newPen.category.toUpperCase()}) telah diterbitkan. Kerjakan sekarang!`,
        type: 'kuis',
        targetId: newPen.id,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Kelola Latihan, Kuis & Bank Soal</h2>
          <p className="text-xs text-slate-500 mt-1">
            Buat tamrin per bab, unggah bank soal secara massal dari sheet, dan atur alur penilaian (Digital / Manual).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet size={18} className="text-emerald-700" /> Ekspor Nilai Siswa (CSV/Excel)
          </button>
          <button
            onClick={() => handleOpenAddModal()}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Plus size={18} /> Tambah Tamrin Baru
          </button>
        </div>
      </div>

      {/* Type Switcher Tabs + Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
          <div className="flex items-center gap-2">
            {(['latihan', 'kuis', 'ujian'] as AssessmentType[]).map((t) => {
              const count = penilaianList.filter(p => p.type === t).length;
              const isActive = activeType === t;
              const labels = { latihan: 'Latihan / Tamrin', kuis: 'Kuis Interaktif', ujian: 'Ujian Evaluasi' };

              return (
                <button
                  key={t}
                  onClick={() => setActiveType(t)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs capitalize transition-all flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-purple-700 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{labels[t]}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-500">Filter Bab:</span>
            <select
              value={selectedBabFilter}
              onChange={(e) => setSelectedBabFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="px-3 py-1.5 border border-slate-300 rounded-xl bg-slate-50 font-bold text-slate-700"
            >
              <option value="all">Semua Bab</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(b => (
                <option key={b} value={b}>Bab {b}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 4 Sub-Menu Categories Bar (Qowaid, Hiwar, Kosakata, Mahfudzot) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-1">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap mr-1">Sub Menu Kuis:</span>
          {[
            { id: 'all', label: 'Semua Sub Menu' },
            { id: 'qowaid', label: 'Qowaid (Tata Bahasa)' },
            { id: 'hiwar', label: 'Hiwar (Percakapan)' },
            { id: 'kosakata', label: 'Kosakata (Mufradat)' },
            { id: 'mahfudzot', label: 'Mahfudzot' },
          ].map((cat) => {
            const isActive = activeCategoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Quick Bab Action Cards */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-xs font-bold text-slate-400 whitespace-nowrap">Akses Cepat Bab:</span>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((bab) => (
            <button
              key={bab}
              onClick={() => handleOpenAddModal(bab, activeCategoryFilter !== 'all' ? activeCategoryFilter as CategoryType : 'qowaid')}
              className="px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1 transition-colors"
            >
              <Plus size={12} /> Tamrin Bab {bab}
            </button>
          ))}
        </div>
      </div>

      {/* Assessment List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredList.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <FileCheck2 size={36} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-500">Belum ada paket latihan untuk bab/kategori ini.</p>
            <p className="text-xs text-slate-400 mt-1">Klik "+ Tambah Tamrin Baru" untuk menyusun bank soal latihan.</p>
          </div>
        ) : (
          filteredList.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
            >
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-100 text-purple-800 border border-purple-200">
                      Bab {p.babNumber || 1}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-sky-100 text-sky-800 border border-sky-200">
                      {p.category}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${p.gradingMethod === 'manual' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'}`}>
                      {p.gradingMethod === 'manual' ? 'Koreksi Manual' : 'Koreksi Digital'}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <Clock size={14} className="text-amber-500" /> {p.durationMinutes}m
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono font-extrabold text-slate-400 block uppercase">
                    Kode: {p.code || 'TAMRIN-DEF'}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                    {p.title}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100 bg-slate-50 p-2.5 rounded-xl">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Bank Soal:</span>
                    <strong className="text-slate-900">{p.questions.length} Soal</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Tampil di Siswa:</span>
                    <strong className="text-purple-700">{p.questionsToShow || p.questions.length} Soal (Acak)</strong>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                  <Calendar size={13} className="text-slate-400" /> {new Date(p.createdAt).toLocaleDateString('id-ID')}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(p)}
                    className="p-1.5 text-slate-600 hover:bg-slate-200/60 rounded-lg"
                    title="Edit Paket & Bank Soal"
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

      {/* Form Modal Buat / Edit Tamrin & Bank Soal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <form
            onSubmit={handleSubmitForm}
            className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 my-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingPenilaian ? 'Edit Paket Tamrin & Bank Soal' : 'Buat Paket Tamrin & Bank Soal Baru'}
                </h3>
                <p className="text-xs text-slate-500">Atur nomor bab, jumlah soal yang diacak ke siswa, dan alur penilaian.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Bab</label>
                <select
                  value={formData.babNumber}
                  onChange={(e) => setFormData({ ...formData, babNumber: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-purple-500 font-bold"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(b => (
                    <option key={b} value={b}>Bab {b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Materi</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as CategoryType })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-purple-500 font-bold"
                >
                  <option value="qowaid">Tata Bahasa (Qowaid)</option>
                  <option value="hiwar">Percakapan (Hiwar)</option>
                  <option value="kosakata">Kosakata (Mufradat)</option>
                  <option value="mahfudzot">Mahfudzot</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alur Penilaian</label>
                <select
                  value={formData.gradingMethod}
                  onChange={(e) => setFormData({ ...formData, gradingMethod: e.target.value as 'digital' | 'manual' })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-purple-500 font-bold"
                >
                  <option value="digital">Digital (Pilihan Ganda - Auto Periksa)</option>
                  <option value="manual">Manual (Isian / Essay - Periksa Guru)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kode Paket Soal</label>
                <input
                  type="text"
                  required
                  value={formData.code || ''}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Kode unik (e.g. TMR-QOW-BAB1)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul Tamrin / Latihan</label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Judul latihan (e.g. Tamrin Qowaid Bab 1)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Durasi Timer (Menit)</label>
                <input
                  type="number"
                  min={1}
                  max={180}
                  value={formData.durationMinutes ?? 15}
                  onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 15 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jumlah Soal Tampil di Siswa</label>
                <input
                  type="number"
                  min={1}
                  max={formData.questions.length || 100}
                  value={formData.questionsToShow ?? 5}
                  onChange={(e) => setFormData({ ...formData, questionsToShow: parseInt(e.target.value) || 5 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-purple-700 font-extrabold"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Diambil secara acak dari total bank soal</span>
              </div>

              <div className="sm:col-span-2 flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.randomizeQuestions}
                    onChange={(e) => setFormData({ ...formData, randomizeQuestions: e.target.checked })}
                    className="w-4 h-4 text-purple-600 rounded-md"
                  />
                  <span>Acak Urutan Soal</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.randomizeOptions}
                    onChange={(e) => setFormData({ ...formData, randomizeOptions: e.target.checked })}
                    className="w-4 h-4 text-purple-600 rounded-md"
                  />
                  <span>Acak Urutan Pilihan Jawaban (A, B, C, D)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.prioritizeUnseen}
                    onChange={(e) => setFormData({ ...formData, prioritizeUnseen: e.target.checked })}
                    className="w-4 h-4 text-purple-600 rounded-md"
                  />
                  <span>Prioritaskan Soal Belum Pernah Dikerjakan</span>
                </label>
              </div>
            </div>

            {/* Questions Bank Section */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Bank Soal ({formData.questions.length} Butir Soal Tersimpan)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Siswa akan menerima {formData.questionsToShow} soal acak dari {formData.questions.length} soal di atas.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsBulkModalOpen(true)}
                    className="px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl font-bold text-xs hover:bg-purple-100 flex items-center gap-1.5"
                  >
                    <FileSpreadsheet size={15} /> Upload Massal dari Sheet
                  </button>

                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 flex items-center gap-1"
                  >
                    <Plus size={15} /> Tambah Soal Manual
                  </button>
                </div>
              </div>

              {/* Questions Item List */}
              <div className="space-y-4">
                {formData.questions.map((q, idx) => (
                  <div key={q.id || idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(idx)}
                      className="absolute top-3 right-3 text-rose-500 hover:text-rose-700 text-xs font-bold"
                      title="Hapus Soal ini"
                    >
                      Hapus Soal
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-800 text-xs bg-slate-200 px-2 py-0.5 rounded-md">
                        Soal #{idx + 1}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Kode Soal: {q.code || `Q-BAB${formData.babNumber}-${idx + 1}`}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <input
                        type="text"
                        required
                        value={q.questionText || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            questions: prev.questions.map((item, i) => i === idx ? { ...item, questionText: val } : item)
                          }));
                        }}
                        placeholder="Teks pertanyaan (Bahasa Indonesia)..."
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

                      {/* Options for Digital / Multiple Choice */}
                      {formData.gradingMethod === 'digital' && q.options && (
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
                        placeholder="Pembahasan / kunci jawaban untuk koreksi..."
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
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-xs shadow-md"
              >
                Simpan Paket Tamrin
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bulk Sheet Import Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-purple-700 font-extrabold text-base">
                <FileSpreadsheet size={20} /> Upload Soal Massal Dari Sheet
              </div>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Copy kolom dari Google Sheets / Excel dan paste di bawah ini.
              <br />
              <strong className="text-slate-800">Format Kolom per baris:</strong>
              <br />
              <code>Teks Soal Indo | Teks Soal Arab | Pilihan A | Pilihan B | Pilihan C | Pilihan D | Indeks Benar (0-3) | Pembahasan</code>
            </p>

            <textarea
              rows={8}
              value={bulkSheetText}
              onChange={(e) => setBulkSheetText(e.target.value)}
              placeholder="Contoh format per baris:
Arti kata masjid | مَا مَعْنَى الْمَسْجِدِ؟ | Rumah | Masjid | Sekolah | Pasar | 1 | Masjid adalah tempat ibadah."
              className="w-full p-3 text-xs font-mono border border-slate-300 rounded-xl focus:outline-hidden focus:border-purple-500 bg-slate-50"
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={handleProcessBulkSheet}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Upload size={15} /> Impor Soal Massal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Nilai Modal */}
      <ExportNilaiModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        students={students}
        penilaianList={penilaianList}
      />

    </div>
  );
};
