import { Student, Penilaian, QuizAttempt } from '../types';

export interface ExportFilterOptions {
  schoolName?: string;
  className?: string;
  rombelName?: string;
  assessmentType?: string;
}

/**
 * Escapes fields for CSV compliance according to RFC 4180.
 * Wraps fields in quotes if they contain commas, double quotes, or newlines.
 */
function escapeCsvCell(cell: string | number | boolean | null | undefined): string {
  if (cell === null || cell === undefined) return '""';
  const str = String(cell);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Helper to generate downloadable CSV file with UTF-8 BOM so Excel opens it correctly.
 */
function downloadCsvFile(csvContent: string, filename: string) {
  // UTF-8 BOM prefix (\uFEFF)
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports complete student grades & understanding progress as CSV/Excel.
 */
export function exportStudentGradesToCsv(
  students: Student[],
  penilaianList: Penilaian[],
  filters: ExportFilterOptions = {}
) {
  // 1. Filter students
  const filteredStudents = students.filter(s => {
    if (filters.schoolName && filters.schoolName !== 'semua' && (s.schoolName || 'Tanpa Sekolah') !== filters.schoolName) {
      return false;
    }
    if (filters.className && filters.className !== 'semua' && s.className !== filters.className) {
      return false;
    }
    if (filters.rombelName && filters.rombelName !== 'semua' && (s.rombelName || 'Tanpa Rombel') !== filters.rombelName) {
      return false;
    }
    return true;
  });

  // 2. Prepare Headers for CSV
  const headers = [
    'No',
    'NISN',
    'Nama Siswa',
    'Jenis Kelamin',
    'Asal Sekolah',
    'Kelas',
    'Rombel',
    'Status Akun',
    'Total XP',
    'Jumlah Kuis Dikerjakan',
    'Rata-rata Nilai Kuis (%)',
    'Total Kuis Lulus',
    'Qowaid Dipahami (Mandiri)',
    'Hiwar Dipahami (Mandiri)',
    'Kosakata Dihafal (Mandiri)',
    'Kosakata Verified (Guru/Kuis)',
    'Mahfudzot Dihafal (Mandiri)',
    'Mahfudzot Verified (Guru)',
    'Rincian Nilai Kuis',
    'Terakhir Aktif',
  ];

  const rows: string[][] = [];

  filteredStudents.forEach((student, index) => {
    // Calculate assessment attempts metrics
    const attempts = student.attempts || [];
    const filteredAttempts = filters.assessmentType && filters.assessmentType !== 'semua'
      ? attempts.filter(a => a.penilaianType === filters.assessmentType)
      : attempts;

    const totalAttempts = filteredAttempts.length;
    const avgScore = totalAttempts > 0
      ? Math.round(filteredAttempts.reduce((acc, a) => acc + a.score, 0) / totalAttempts)
      : 0;
    const passedCount = filteredAttempts.filter(a => a.passed).length;

    // Detailed attempts string format: "Kuis Bab 1: 85 (Lulus); UTS: 90 (Lulus)"
    const attemptsDetailStr = filteredAttempts
      .map(a => `${a.penilaianTitle || a.penilaianId}: ${a.score} (${a.passed ? 'Lulus' : 'Mengulang'})`)
      .join(' | ');

    // Understanding & Memorization progress
    const hafalan = student.hafalanProgress || {};
    const qowaidCount = Object.values(hafalan.selfQowaidIds || {}).filter(Boolean).length;
    const hiwarCount = Object.values(hafalan.selfHiwarIds || {}).filter(Boolean).length;
    const vocabSelfCount = Object.values(hafalan.selfKosakataIds || {}).filter(Boolean).length;
    
    // Verified Kosakata (Teacher or Quiz)
    const vocabVerifiedTeacher = Object.values(hafalan.kosakataIds || {}).filter(Boolean).length;
    const vocabVerifiedQuiz = Object.values(hafalan.quizVerifiedKosakataIds || {}).filter(Boolean).length;
    const vocabVerifiedTotal = Math.max(vocabVerifiedTeacher, vocabVerifiedQuiz);

    const mahfudzotSelfCount = Object.values(hafalan.selfMahfudzotIds || {}).filter(Boolean).length;
    const mahfudzotVerifiedCount = Object.values(hafalan.mahfudzotChecklist || {}).filter(chk => 
      chk.hafalanArab || chk.hafalanTerjemah || chk.pengetahuanKosakata || chk.pemahamanMateri
    ).length;

    const formattedLastActive = student.lastActive
      ? new Date(student.lastActive).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '-';

    rows.push([
      String(index + 1),
      student.nisn || '-',
      student.name,
      student.gender || '-',
      student.schoolName || 'Tanpa Sekolah',
      student.className || '-',
      student.rombelName || '-',
      student.status || 'aktif',
      String(student.totalXP || 0),
      String(totalAttempts),
      `${avgScore}%`,
      String(passedCount),
      `${qowaidCount} Materi`,
      `${hiwarCount} Materi`,
      `${vocabSelfCount} Mufrodat`,
      `${vocabVerifiedTotal} Mufrodat`,
      `${mahfudzotSelfCount} Item`,
      `${mahfudzotVerifiedCount} Item`,
      attemptsDetailStr || 'Belum ada pengerjaan',
      formattedLastActive,
    ]);
  });

  // Construct CSV String
  const csvLines = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map(row => row.map(escapeCsvCell).join(',')),
  ];

  const csvString = csvLines.join('\n');
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `Laporan_Nilai_dan_Capaian_Siswa_${timestamp}.csv`;

  downloadCsvFile(csvString, filename);
}

/**
 * Exports detailed raw assessment attempt records as CSV.
 */
export function exportDetailedQuizAttemptsToCsv(
  students: Student[],
  filters: ExportFilterOptions = {}
) {
  const headers = [
    'No',
    'ID Attempt',
    'NISN',
    'Nama Siswa',
    'Sekolah',
    'Kelas',
    'Rombel',
    'Kode Kuis',
    'Judul Kuis / Penilaian',
    'Tipe Penilaian',
    'Kategori Materi',
    'Nilai Akhir (0-100)',
    'Status Kelulusan',
    'Durasi Pengerjaan (Detik)',
    'Waktu Selesai',
  ];

  const rows: string[][] = [];
  let counter = 1;

  students.forEach(student => {
    if (filters.schoolName && filters.schoolName !== 'semua' && (student.schoolName || 'Tanpa Sekolah') !== filters.schoolName) {
      return;
    }
    if (filters.className && filters.className !== 'semua' && student.className !== filters.className) {
      return;
    }
    if (filters.rombelName && filters.rombelName !== 'semua' && (student.rombelName || 'Tanpa Rombel') !== filters.rombelName) {
      return;
    }

    const attempts = student.attempts || [];
    attempts.forEach(attempt => {
      if (filters.assessmentType && filters.assessmentType !== 'semua' && attempt.penilaianType !== filters.assessmentType) {
        return;
      }

      const formattedDate = attempt.completedAt
        ? new Date(attempt.completedAt).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : '-';

      rows.push([
        String(counter++),
        attempt.id,
        student.nisn || '-',
        student.name,
        student.schoolName || 'Tanpa Sekolah',
        student.className || '-',
        student.rombelName || '-',
        attempt.penilaianId || '-',
        attempt.penilaianTitle || '-',
        attempt.penilaianType || '-',
        attempt.category || '-',
        String(attempt.score),
        attempt.passed ? 'Lulus' : 'Mengulang',
        String(attempt.timeSpentSeconds || 0),
        formattedDate,
      ]);
    });
  });

  const csvLines = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map(row => row.map(escapeCsvCell).join(',')),
  ];

  const csvString = csvLines.join('\n');
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `Detail_Log_Pengerjaan_Kuis_${timestamp}.csv`;

  downloadCsvFile(csvString, filename);
}
