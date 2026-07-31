import { Materi, Penilaian, Student, ActivityLog, Role, QuizAttempt } from '../types';
import { INITIAL_MATERI, INITIAL_PENILAIAN, INITIAL_STUDENTS, INITIAL_LOGS } from '../data/initialData';

const KEYS = {
  MATERI: 'lms_arabic_materi',
  PENILAIAN: 'lms_arabic_penilaian',
  STUDENTS: 'lms_arabic_students',
  LOGS: 'lms_arabic_logs',
  ROLE: 'lms_arabic_role',
  CURRENT_STUDENT_ID: 'lms_arabic_current_student_id',
};

// LocalStorage helpers
export const storageService = {
  getMateri(): Materi[] {
    const data = localStorage.getItem(KEYS.MATERI);
    if (!data) {
      localStorage.setItem(KEYS.MATERI, JSON.stringify(INITIAL_MATERI));
      return INITIAL_MATERI;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_MATERI;
    }
  },

  saveMateri(list: Materi[]): void {
    localStorage.setItem(KEYS.MATERI, JSON.stringify(list));
  },

  getPenilaian(): Penilaian[] {
    const data = localStorage.getItem(KEYS.PENILAIAN);
    if (!data) {
      localStorage.setItem(KEYS.PENILAIAN, JSON.stringify(INITIAL_PENILAIAN));
      return INITIAL_PENILAIAN;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_PENILAIAN;
    }
  },

  savePenilaian(list: Penilaian[]): void {
    localStorage.setItem(KEYS.PENILAIAN, JSON.stringify(list));
  },

  getStudents(): Student[] {
    const data = localStorage.getItem(KEYS.STUDENTS);
    if (!data) {
      localStorage.setItem(KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
      return INITIAL_STUDENTS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_STUDENTS;
    }
  },

  saveStudents(list: Student[]): void {
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(list));
  },

  getLogs(): ActivityLog[] {
    const data = localStorage.getItem(KEYS.LOGS);
    if (!data) {
      localStorage.setItem(KEYS.LOGS, JSON.stringify(INITIAL_LOGS));
      return INITIAL_LOGS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_LOGS;
    }
  },

  addLog(log: Omit<ActivityLog, 'id' | 'timestamp'>): void {
    const logs = this.getLogs();
    const newLog: ActivityLog = {
      ...log,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [newLog, ...logs].slice(0, 50); // Keep last 50
    localStorage.setItem(KEYS.LOGS, JSON.stringify(updated));
  },

  getRole(): Role {
    return (localStorage.getItem(KEYS.ROLE) as Role) || 'siswa';
  },

  setRole(role: Role): void {
    localStorage.setItem(KEYS.ROLE, role);
  },

  getCurrentStudentId(): string {
    const students = this.getStudents();
    const saved = localStorage.getItem(KEYS.CURRENT_STUDENT_ID);
    if (saved && students.some(s => s.id === saved)) {
      return saved;
    }
    return students[0]?.id || 'std-1';
  },

  setCurrentStudentId(id: string): void {
    localStorage.setItem(KEYS.CURRENT_STUDENT_ID, id);
  },

  // Student specific actions
  markMaterialComplete(studentId: string, materiId: string): void {
    const students = this.getStudents();
    const student = students.find(s => s.id === studentId);
    if (student) {
      if (!student.completedMaterials.includes(materiId)) {
        student.completedMaterials.push(materiId);
        student.totalXP += 50; // Earn 50 XP per material read
        student.lastActive = new Date().toISOString();
        this.saveStudents(students);

        const materi = this.getMateri().find(m => m.id === materiId);
        this.addLog({
          userName: student.name,
          userRole: 'siswa',
          action: 'Selesai Membaca Materi',
          details: `Menyelesaikan materi: ${materi?.title || materiId} (+50 XP)`,
        });
      }
    }
  },

  saveQuizAttempt(attempt: Omit<QuizAttempt, 'id' | 'completedAt'>): QuizAttempt {
    const students = this.getStudents();
    const student = students.find(s => s.id === attempt.studentId);
    
    const newAttempt: QuizAttempt = {
      ...attempt,
      id: `att-${Date.now()}`,
      completedAt: new Date().toISOString(),
    };

    if (student) {
      student.attempts.push(newAttempt);
      if (attempt.passed) {
        student.totalXP += attempt.score; // Add points as XP
      }
      student.lastActive = new Date().toISOString();
      this.saveStudents(students);

      this.addLog({
        userName: student.name,
        userRole: 'siswa',
        action: `Menyelesaikan ${attempt.penilaianType}`,
        details: `Meraih nilai ${attempt.score}/100 pada ${attempt.penilaianTitle} (${attempt.passed ? 'Lulus' : 'Belum Lulus'})`,
      });
    }

    return newAttempt;
  },

  resetData(): void {
    localStorage.setItem(KEYS.MATERI, JSON.stringify(INITIAL_MATERI));
    localStorage.setItem(KEYS.PENILAIAN, JSON.stringify(INITIAL_PENILAIAN));
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
    localStorage.setItem(KEYS.LOGS, JSON.stringify(INITIAL_LOGS));
  }
};
