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
  arabic: string;
  latin: string;
  translation: string;
  explanation?: string;
}

export interface Materi {
  id: string;
  title: string;
  arabicTitle?: string;
  category: CategoryType;
  level: 'Dasar' | 'Menengah' | 'Lanjut';
  description: string;
  content: string; // Detailed text / HTML explanation
  pdfUrl?: string; // Data URL or external link to PDF
  pdfFileName?: string;
  pdfPageCount?: number;
  audioUrl?: string;
  dialogues?: DialogueItem[];
  vocabularies?: VocabularyItem[];
  mahfudzot?: MahfudzotQuote;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  type: 'multiple_choice' | 'fill_in_blank' | 'true_false';
  questionText: string;
  questionArabic?: string;
  options?: string[];
  correctAnswer: string | number; // index or text
  explanation: string;
  points: number;
}

export interface Penilaian {
  id: string;
  title: string;
  type: AssessmentType;
  category: CategoryType | 'umum';
  durationMinutes: number;
  passingGrade: number; // e.g. 75
  questions: Question[];
  totalPoints: number;
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
}

export interface Student {
  id: string;
  name: string;
  nisn: string;
  email: string;
  className: string;
  avatar: string;
  totalXP: number;
  completedMaterials: string[]; // Materi IDs
  attempts: QuizAttempt[];
  status: 'aktif' | 'nonaktif';
  lastActive: string;
}

export interface ActivityLog {
  id: string;
  userName: string;
  userRole: Role;
  action: string;
  details: string;
  timestamp: string;
}
