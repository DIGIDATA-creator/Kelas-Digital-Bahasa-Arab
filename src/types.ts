export type Role = 'guru' | 'siswa';

export type CategoryType = 'qowaid' | 'hiwar' | 'kosakata' | 'mahfudzot';

export type AssessmentType = 'latihan' | 'kuis' | 'ujian';

export interface DialogueItem {
  id: string;
  speaker: string;
  arabic: string;
  latin: string;
  translation: string;
}

export interface DialogueTurnPair {
  id: string;
  turnNumber: number; // Automatic sequential numbering (1, 2, 3...)
  speaker1: string; // Pembicara 1 (e.g. "أَحْمَدُ" atau "سُؤَالٌ")
  arabic1: string; // Teks Arab Pembicara 1
  translation1: string; // Terjemahan Pembicara 1
  speaker2: string; // Pembicara 2 (e.g. "عَلِيٌّ" atau "جَوَابٌ")
  arabic2: string; // Teks Arab Pembicara 2
  translation2: string; // Terjemahan Pembicara 2
}

export interface VocabularyItem {
  id: string;
  word: string; // Arabic
  latin: string;
  meaning: string;
  category: string;
  exampleArabic?: string;
  exampleTranslation?: string;
}

export interface MahfudzotQuote {
  number?: number;
  arabic: string;
  latin: string;
  translation: string;
  categoryTag?: string; // e.g. 'Akhlak', 'Ilmu', 'Persahabatan', 'Kesungguhan', 'Waktu & Disiplin', 'Kebijaksanaan'
  explanation?: string;
}

export interface Materi {
  id: string;
  title: string;
  arabicTitle?: string;
  category: CategoryType;
  qowaidCategory?: 'قواعد' | 'النحو' | 'الصرف' | string;
  mahfudzotCategory?: string; // e.g. 'Akhlak', 'Ilmu', 'Persahabatan', 'Kesungguhan', 'Waktu & Disiplin', 'Kebijaksanaan'
  babNumber?: number;
  learningTargets?: string[];
  level?: 'Dasar' | 'Menengah' | 'Lanjut';
  description?: string;
  content: string; // Detailed text / HTML explanation
  pdfUrl?: string; // Data URL or external link to PDF
  pdfFileName?: string;
  pdfPageCount?: number;
  audioUrl?: string;
  dialogues?: DialogueItem[];
  dialoguePairs?: DialogueTurnPair[];
  hiwarLevelNumber?: number;
  vocabularies?: VocabularyItem[];
  mahfudzot?: MahfudzotQuote;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  type: 'multiple_choice' | 'fill_in_blank' | 'true_false' | 'essay';
  questionText: string;
  questionArabic?: string;
  options?: string[];
  correctAnswer: string | number; // index or text
  explanation: string;
  points: number;
  code?: string; // F.1.6 Kode Soal Unik (e.g. QW-BAB1-T1-102)
}

export interface Penilaian {
  id: string;
  code?: string; // F.1.6 Kode Paket Soal Unik (e.g. TMR-QOW-BAB1)
  title: string;
  type: AssessmentType; // 'latihan' | 'kuis' | 'ujian'
  category: CategoryType | 'umum';
  babNumber?: number; // F.1.1 Bab number
  learningTarget?: string; // F.1.10 Target materi dari bab
  displayQuestionCount?: number; // F.1.4 Jumlah soal yang muncul di akun siswa
  questionsToShow?: number; // F.1.4 Total questions shown to student
  randomizeQuestions?: boolean; // F.1.5 Acak urutan soal
  prioritizeUnseen?: boolean; // F.1.7 Prioritaskan soal belum pernah dikerjakan
  durationMinutes: number;
  passingGrade: number; // e.g. 75
  questions: Question[]; // F.1.3 Bank soal sebanyak-banyaknya
  totalPoints: number;
  gradingMethod?: 'digital' | 'manual'; // F.1.8 / F.1.9 Manual vs Digital
  createdAt: string;
}

export interface QuizAttempt {
  id: string;
  penilaianId: string;
  penilaianTitle: string;
  penilaianType: AssessmentType;
  studentId: string;
  studentName: string;
  score: number;
  passed: boolean;
  answers: Record<string, string | number>;
  timeSpentSeconds: number;
  completedAt: string;
  accessedAt?: string; // F.1.6 Tanggal & Waktu Akses
  questionCodes?: string[]; // F.1.6 Kode Soal Unik yang diakses
  seenQuestionIds?: string[]; // F.1.7 Tracking untuk rotasi soal belum pernah muncul
  manualSubmissionUrl?: string; // F.1.8 Jawaban manual siswa
  manualTextSubmission?: string; // F.1.8 Jawaban teks manual siswa
  teacherFeedback?: string; // F.1.9 Catatan/Umpan balik guru
  isGradedByTeacher?: boolean; // F.1.9 Status penilaian oleh guru
}

export type TingkatType = 'Dasar' | 'Menengah Pertama' | 'Menengah Akhir' | 'Umum';

export type StudentStatus = 'pending' | 'disetujui' | 'ditolak' | 'aktif' | 'nonaktif';

export interface MahfudzotChecklist {
  hafalanArab: boolean;
  hafalanTerjemah: boolean;
  pengetahuanKosakata: boolean;
  pemahamanMateri: boolean;
}

export interface StudentHafalanProgress {
  kosakataIds?: Record<string, boolean>; // vocabId -> boolean
  mahfudzotChecklist?: Record<string, MahfudzotChecklist>; // mahfudzotId -> MahfudzotChecklist
}

export interface Student {
  id: string;
  name: string;
  nisn: string;
  email: string;
  password?: string;
  gender?: 'Laki-laki' | 'Perempuan';
  tingkat?: TingkatType;
  schoolName?: string; // Asal Sekolah
  className: string; // Kelas utama (e.g., Kelas 8, Kelas 1)
  rombelName?: string; // Nama Rombel spesifik (e.g. 8A, 9 Abu Bakar)
  avatar: string;
  totalXP: number;
  completedMaterials: string[]; // Materi IDs
  attempts: QuizAttempt[];
  status: StudentStatus;
  lastActive: string;
  registeredAt?: string;
  hafalanProgress?: StudentHafalanProgress;
}

export interface ActivityLog {
  id: string;
  userName: string;
  userRole: Role;
  action: string;
  details: string;
  timestamp: string;
}

export interface ForumReply {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  likes?: number;
  likedBy?: string[];
  isVerifiedAnswer?: boolean;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  materiId?: string;
  materiTitle?: string;
  category?: CategoryType | 'umum';
  babNumber?: number;
  authorId: string;
  authorName: string;
  authorRole: Role;
  authorAvatar?: string;
  createdAt: string;
  updatedAt: string;
  replies: ForumReply[];
  likes?: number;
  likedBy?: string[];
  isPinned?: boolean;
  status?: 'terbuka' | 'terjawab' | 'ditutup';
}
