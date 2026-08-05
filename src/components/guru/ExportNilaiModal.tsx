import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, Penilaian } from '../../types';
import { FileSpreadsheet, Download, Filter, X, Check, Copy, Award, Users, BookOpen, Sparkles, FileText, CheckCircle2 } from 'lucide-react';
import { exportStudentGradesToCsv, exportDetailedQuizAttemptsToCsv, ExportFilterOptions } from '../../utils/gradeExporter';

interface ExportNilaiModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  penilaianList: Penilaian[];
}

export const ExportNilaiModal: React.FC<ExportNilaiModalProps> = ({
  isOpen,
  onClose,
  students,
  penilaianList,
}) => {
  const [selectedSchool, setSelectedSchool] = useState<string>('semua');
  const [selectedClass, setSelectedClass] = useState<string>('semua');
  const [selectedRombel, setSelectedRombel] = useState<string>('semua');
  const [selectedType, setSelectedType] = useState<string>('semua');
  const [isCopied, setIsCopied] = useState(false);

  // Extract unique filter options
  const schoolOptions = Array.from(new Set(students.map(s => s.schoolName || 'Tanpa Sekolah').filter(Boolean)));
  const classOptions = Array.from(new Set(students.map(s => s.className).filter(Boolean)));
  const rombelOptions = Array.from(new Set(students.map(s => s.rombelName || 'Tanpa Rombel').filter(Boolean)));

  // Calculate filtered students count
  const filters: ExportFilterOptions = {
    schoolName: selectedSchool,
    className: selectedClass,
    rombelName: selectedRombel,
    assessmentType: selectedType,
  };

  const filteredStudents = students.filter(s => {
    if (selectedSchool !== 'semua' && (s.schoolName || 'Tanpa Sekolah') !== selectedSchool) return false;
    if (selectedClass !== 'semua' && s.className !== selectedClass) return false;
    if (selectedRombel !== 'semua' && (s.rombelName || 'Tanpa Rombel') !== selectedRombel) return false;
    return true;
  });

  const totalAttemptsCount = filteredStudents.reduce((acc, s) => {
    const atts = s.attempts || [];
    return acc + (selectedType === 'semua' ? atts.length : atts.filter(a => a.penilaianType === selectedType).length);
  }, 0);

  const handleExportSummaryCsv = () => {
    exportStudentGradesToCsv(students, penilaianList, filters);
  };

  const handleExportDetailCsv = () => {
    exportDetailedQuizAttemptsToCsv(students, filters);
  };

  const handleCopyTextSummary = () => {
    let summaryText = `*REKAPITULASI LAPORAN NILAI SISWA (LMS BAHASA ARAB)*\n`;
    summaryText += `Tanggal Akses: ${new Date().toLocaleDateString('id-ID')}\n`;
    summaryText += `Filter: Sekolah (${selectedSchool}), Kelas (${selectedClass}), Rombel (${selectedRombel})\n`;
    summaryText += `Total Siswa: ${filteredStudents.length} Siswa\n`;
    summaryText += `----------------------------------------\n\n`;

    filteredStudents.forEach((s, idx) => {
      const atts = s.attempts || [];
      const totalAtts = atts.length;
      const avg = totalAtts > 0 ? Math.round(atts.reduce((a, b) => a + b.score, 0) / totalAtts) : 0;
      summaryText += `${idx + 1}. ${s.name} (${s.nisn || 'No NISN'}) - Kelas: ${s.className}\n`;
      summaryText += `   - Rerata Nilai Kuis: ${avg}% (${totalAtts} kuis dikerjakan)\n`;
      summaryText += `   - Total XP: ${s.totalXP || 0} XP\n\n`;
    });

    navigator.clipboard.writeText(summaryText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Modal Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 border border-emerald-400/30 rounded-xl text-emerald-300">
                <FileSpreadsheet size={22} />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-white">Ekspor Nilai &amp; Laporan Administrasi</h3>
                <p className="text-xs text-emerald-200">Format Microsoft Excel / CSV untuk Laporan Sekolah</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 space-y-5 overflow-y-auto">
            {/* Filter Section */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 border-b border-slate-200 pb-2">
                <Filter size={14} className="text-emerald-600" />
                <span>Filter Data yang Akan Diekspor:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {/* School Filter */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Asal Sekolah:</label>
                  <select
                    value={selectedSchool}
                    onChange={(e) => setSelectedSchool(e.target.value)}
                    className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg font-medium text-slate-800 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="semua">Semua Sekolah ({schoolOptions.length})</option>
                    {schoolOptions.map((sch, i) => (
                      <option key={i} value={sch}>{sch}</option>
                    ))}
                  </select>
                </div>

                {/* Class Filter */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Tingkat Kelas:</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg font-medium text-slate-800 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="semua">Semua Kelas ({classOptions.length})</option>
                    {classOptions.map((cls, i) => (
                      <option key={i} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                {/* Rombel Filter */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Rombel:</label>
                  <select
                    value={selectedRombel}
                    onChange={(e) => setSelectedRombel(e.target.value)}
                    className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg font-medium text-slate-800 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="semua">Semua Rombel ({rombelOptions.length})</option>
                    {rombelOptions.map((rmb, i) => (
                      <option key={i} value={rmb}>{rmb}</option>
                    ))}
                  </select>
                </div>

                {/* Assessment Type Filter */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Tipe Penilaian:</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg font-medium text-slate-800 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="semua">Semua (Latihan &amp; Kuis)</option>
                    <option value="latihan">Tamrin / Latihan</option>
                    <option value="kuis">Kuis / Ujian</option>
                    <option value="uts">UTS / PTS</option>
                    <option value="uas">UAS / PAS</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Export Scope Preview */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                <Users size={20} className="text-emerald-600 shrink-0" />
                <div>
                  <span className="text-[11px] text-slate-500 font-medium block">Total Siswa Terpilih:</span>
                  <span className="text-base font-extrabold text-emerald-950">{filteredStudents.length} Siswa</span>
                </div>
              </div>

              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center gap-3">
                <Award size={20} className="text-teal-600 shrink-0" />
                <div>
                  <span className="text-[11px] text-slate-500 font-medium block">Total Hasil Pengerjaan:</span>
                  <span className="text-base font-extrabold text-teal-950">{totalAttemptsCount} Attempt</span>
                </div>
              </div>
            </div>

            {/* Export Format Actions */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-extrabold text-slate-800 block">Pilihan Format Unduhan Excel / CSV:</span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Summary CSV Button */}
                <button
                  type="button"
                  onClick={handleExportSummaryCsv}
                  className="p-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-md transition-all flex flex-col items-start gap-1 cursor-pointer group text-left"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-extrabold flex items-center gap-1.5">
                      <Download size={16} /> Unduh Rekap Nilai Siswa (.CSV)
                    </span>
                    <span className="bg-emerald-600 px-2 py-0.5 rounded text-[10px] font-mono">Excel Compatible</span>
                  </div>
                  <p className="text-[11px] text-emerald-100/90 leading-tight">
                    Rekapitulasi lengkap NISN, nama, total XP, rata-rata nilai kuis, status lulus, dan rekap pemahaman materi.
                  </p>
                </button>

                {/* Detailed Attempts CSV Button */}
                <button
                  type="button"
                  onClick={handleExportDetailCsv}
                  className="p-4 bg-teal-700 hover:bg-teal-800 text-white rounded-xl shadow-md transition-all flex flex-col items-start gap-1 cursor-pointer group text-left"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-extrabold flex items-center gap-1.5">
                      <FileSpreadsheet size={16} /> Unduh Log Detail Kuis (.CSV)
                    </span>
                    <span className="bg-teal-600 px-2 py-0.5 rounded text-[10px] font-mono">Raw Attempt Data</span>
                  </div>
                  <p className="text-[11px] text-teal-100/90 leading-tight">
                    Rincian setiap attempt pengerjaan kuis siswa per baris beserta skor, durasi pengerjaan, dan tanggal.
                  </p>
                </button>
              </div>

              {/* Quick Copy Button */}
              <button
                type="button"
                onClick={handleCopyTextSummary}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl border border-slate-300 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isCopied ? (
                  <>
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span className="text-emerald-700">Teks Ringkasan Laporan Berhasil Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} className="text-slate-600" />
                    <span>Salin Ringkasan Teks Laporan (Format Pesan / WhatsApp / Administrasi)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
