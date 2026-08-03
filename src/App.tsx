import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Role, Materi, Penilaian, Student, ActivityLog, QuizAttempt, ForumPost } from './types';
import { storageService, UserSession } from './services/storage';
import { Navbar } from './components/Navbar';
import { LoginView } from './components/auth/LoginView';

// Guru Components
import { GuruDashboard } from './components/guru/GuruDashboard';
import { SiswaManagement } from './components/guru/SiswaManagement';
import { MateriManagement } from './components/guru/MateriManagement';
import { PenilaianManagement } from './components/guru/PenilaianManagement';
import { GuruProfile } from './components/guru/GuruProfile';

// Siswa Components
import { SiswaDashboard } from './components/siswa/SiswaDashboard';
import { ToastItem } from './components/common/ToastNotification';
import { LmsTourModal } from './components/siswa/LmsTourModal';
import { MateriSiswaView } from './components/siswa/MateriSiswaView';
import { PenilaianSiswaView } from './components/siswa/PenilaianSiswaView';
import { ProgresBelajarView } from './components/siswa/ProgresBelajarView';
import { LeaderboardView } from './components/siswa/LeaderboardView';
import { SiswaProfile } from './components/siswa/SiswaProfile';
import { DuelView } from './components/duel/DuelView';

// Forum Component
import { ForumDiskusi } from './components/forum/ForumDiskusi';

export default function App() {
  // Active Authenticated User Session
  const [userSession, setUserSession] = useState<UserSession | null>(() => storageService.getUserSession());

  const [currentRole, setCurrentRole] = useState<Role>(() => {
    const session = storageService.getUserSession();
    return session ? session.role : storageService.getRole();
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // LMS Onboarding Guided Tour state
  const [isTourOpen, setIsTourOpen] = useState(false);

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('lms_dark_mode') === 'true';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('lms_dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  const handleToggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // State loaded from LocalStorage & synchronized with Firestore
  const [materiList, setMateriList] = useState<Materi[]>(() => storageService.getMateri());
  const [penilaianList, setPenilaianList] = useState<Penilaian[]>(() => storageService.getPenilaian());
  const [students, setStudents] = useState<Student[]>(() => storageService.getStudents());
  const [logs, setLogs] = useState<ActivityLog[]>(() => storageService.getLogs());
  const [forumPosts, setForumPosts] = useState<ForumPost[]>(() => storageService.getForumPosts());
  
  const [currentStudentId, setCurrentStudentId] = useState<string>(() => {
    const session = storageService.getUserSession();
    if (session && session.studentId) return session.studentId;
    return storageService.getCurrentStudentId();
  });

  const [selectedMateriIdForSiswa, setSelectedMateriIdForSiswa] = useState<string | undefined>(undefined);
  const [selectedStudentForDetailId, setSelectedStudentForDetailId] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Toast Notification System
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (toast: Omit<ToastItem, 'id' | 'timestamp'>) => {
    const newToast: ToastItem = {
      ...toast,
      id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };
    setToasts(prev => [newToast, ...prev].slice(0, 5));
  };

  const handleDismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleSimulateExpGain = (amount: number, reason: string) => {
    if (!currentStudentId) return;
    const allStudents = JSON.parse(JSON.stringify(storageService.getStudents())) as Student[];
    const student = allStudents.find(s => s.id === currentStudentId);
    if (student) {
      student.totalXP += amount;
      storageService.saveStudents(allStudents);
      setStudents(storageService.getStudents());
      addToast({
        type: 'exp',
        title: '✨ Penambahan EXP Berhasil!',
        message: `${reason} (+${amount} EXP)`,
        expGained: amount,
      });
    }
  };

  // Real-time synchronization with Firebase Firestore across all devices
  useEffect(() => {
    setIsLoadingData(true);
    const unsubscribe = storageService.initFirestoreSync(({ materiList, penilaianList, students, logs, forumPosts }) => {
      setMateriList(materiList);
      setPenilaianList(penilaianList);
      setStudents(students);
      setLogs(logs);
      setForumPosts(forumPosts);
      setIsLoadingData(false);
    });
    // Fallback timer if offline or fast local storage load
    const timer = setTimeout(() => setIsLoadingData(false), 800);
    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  // Auto open onboarding tour for student first-time login
  useEffect(() => {
    if (userSession && userSession.role === 'siswa') {
      const studentId = userSession.studentId || currentStudentId;
      const tourKey = 'lms_tour_seen_' + studentId;
      if (!localStorage.getItem(tourKey)) {
        setIsTourOpen(true);
        localStorage.setItem(tourKey, 'true');
      }
    }
  }, [userSession, currentStudentId]);

  // Sync role changes
  const handleRoleChange = (role: Role) => {
    setCurrentRole(role);
    storageService.setRole(role);
  };

  // Sync student selector
  const handleStudentChange = (stdId: string) => {
    setCurrentStudentId(stdId);
    storageService.setCurrentStudentId(stdId);
  };

  // Login Success Handler
  const handleLoginSuccess = (session: UserSession) => {
    storageService.setUserSession(session);
    setUserSession(session);
    setCurrentRole(session.role);
    if (session.studentId) {
      setCurrentStudentId(session.studentId);
      storageService.setCurrentStudentId(session.studentId);
    }
    setActiveTab('dashboard');
  };

  // Logout Handler
  const handleLogout = () => {
    storageService.clearUserSession();
    setUserSession(null);
    setActiveTab('dashboard');
  };

  const handleSwitchToStudentSession = (student: Student) => {
    const session: UserSession = {
      role: 'siswa',
      userEmail: student.email,
      userName: student.name,
      studentId: student.id,
      avatar: student.avatar,
      loggedInAt: new Date().toISOString(),
    };
    storageService.setUserSession(session);
    setUserSession(session);
    setCurrentRole('siswa');
    setCurrentStudentId(student.id);
    storageService.setCurrentStudentId(student.id);
    setActiveTab('dashboard');
  };

  // Data persistence handlers
  const handleSaveMateri = (updated: Materi[]) => {
    setMateriList(updated);
    storageService.saveMateri(updated);
    setLogs(storageService.getLogs());
  };

  const handleSavePenilaian = (updated: Penilaian[]) => {
    setPenilaianList(updated);
    storageService.savePenilaian(updated);
    setLogs(storageService.getLogs());
  };

  const handleSaveStudents = (updated: Student[]) => {
    setStudents(updated);
    storageService.saveStudents(updated);
    setLogs(storageService.getLogs());
  };

  const handleUpdateStudentProfile = (updatedStudent: Student) => {
    const updatedList = students.map(s => s.id === updatedStudent.id ? updatedStudent : s);
    handleSaveStudents(updatedList);
  };

  const handleMarkMaterialComplete = (materiId: string) => {
    storageService.markMaterialComplete(currentStudentId, materiId);
    setStudents(storageService.getStudents());
    setLogs(storageService.getLogs());

    const completedMateri = materiList.find(m => m.id === materiId);
    addToast({
      type: 'materi',
      title: '🎉 Modul Selesai!',
      message: `Selamat! Anda berhasil menyelesaikan "${completedMateri?.title || 'Materi Bahasa Arab'}". (+50 EXP)`,
      expGained: 50,
    });
  };

  const handleFinishQuiz = (attempt: Omit<QuizAttempt, 'id' | 'completedAt'>) => {
    storageService.saveQuizAttempt(attempt);
    setStudents(storageService.getStudents());
    setLogs(storageService.getLogs());

    addToast({
      type: 'quiz',
      title: attempt.passed ? '🏆 Selamat! Kuis Lulus' : '📝 Kuis Diselesaikan',
      message: `Nilai: ${attempt.score}/100 pada "${attempt.penilaianTitle}". ${attempt.passed ? 'Poin EXP ditambahkan ke akun!' : 'Tetap semangat!'}` ,
      expGained: attempt.passed ? attempt.score : 0,
    });
  };

  const currentStudent = students.find(s => s.id === currentStudentId) || students[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans flex flex-col selection:bg-emerald-200 transition-colors duration-200">
      
      {/* Top Header Navigation */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        students={students}
        currentStudentId={currentStudentId}
        onStudentChange={handleStudentChange}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        userSession={userSession}
        onLogout={handleLogout}
        onSwitchToStudentSession={handleSwitchToStudentSession}
        onOpenTour={() => setIsTourOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* If NOT LOGGED IN -> Show Strict Protected Login Screen */}
        {!userSession ? (
          <LoginView
            students={students}
            onLoginSuccess={handleLoginSuccess}
          />
        ) : (
          /* LOGGED IN MODULE VIEWS WITH MOTION TRANSITIONS */
          <AnimatePresence mode="wait">
            <motion.div
              key={`${userSession.role}-${currentRole}-${activeTab}-${currentStudentId}`}
              initial={{ opacity: 0, y: 12, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.995 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {/* ================= GURU / ADMIN MODULE ================= */}
              {currentRole === 'guru' && (
                <>
                  {activeTab === 'dashboard' && (
                    <GuruDashboard
                      materiList={materiList}
                      penilaianList={penilaianList}
                      students={students}
                      logs={logs}
                      onNavigate={setActiveTab}
                      isLoading={isLoadingData}
                      onSwitchToStudentSession={handleSwitchToStudentSession}
                      onSelectStudentForDetail={(stdId) => {
                        setSelectedStudentForDetailId(stdId);
                        setActiveTab('siswa');
                      }}
                    />
                  )}

                  {activeTab === 'siswa' && (
                    <SiswaManagement
                      students={students}
                      materiList={materiList}
                      onSaveStudents={handleSaveStudents}
                      onSwitchToStudentSession={handleSwitchToStudentSession}
                      initialSelectedStudentId={selectedStudentForDetailId || undefined}
                      onClearInitialSelectedStudentId={() => setSelectedStudentForDetailId(null)}
                    />
                  )}

                  {activeTab === 'materi' && (
                    <MateriManagement
                      materiList={materiList}
                      onSaveMateri={handleSaveMateri}
                    />
                  )}

                  {activeTab === 'penilaian' && (
                    <PenilaianManagement
                      penilaianList={penilaianList}
                      onSavePenilaian={handleSavePenilaian}
                    />
                  )}

                  {activeTab === 'forum' && (
                    <ForumDiskusi
                      currentRole={currentRole}
                      currentStudent={currentStudent}
                      materiList={materiList}
                      forumPosts={forumPosts}
                    />
                  )}

                  {activeTab === 'leaderboard' && (
                    <LeaderboardView
                      students={students}
                      currentStudentId={currentStudentId}
                    />
                  )}

                  {activeTab === 'profil' && (
                    <GuruProfile />
                  )}
                </>
              )}

              {/* ================= SISWA MODULE ================= */}
              {currentRole === 'siswa' && currentStudent && (
                <>
                  {activeTab === 'dashboard' && (
                    <SiswaDashboard
                      currentStudent={currentStudent}
                      materiList={materiList}
                      penilaianList={penilaianList}
                      onNavigate={setActiveTab}
                      isLoading={isLoadingData}
                      toasts={toasts}
                      onDismissToast={handleDismissToast}
                      onSimulateExpGain={handleSimulateExpGain}
                      onSelectMateri={(id) => {
                        setSelectedMateriIdForSiswa(id);
                        setActiveTab('materi');
                      }}
                      onStartPenilaian={(penId) => {
                        setActiveTab('penilaian');
                      }}
                    />
                  )}

                  {activeTab === 'materi' && (
                    <MateriSiswaView
                      materiList={materiList}
                      currentStudent={currentStudent}
                      selectedMateriId={selectedMateriIdForSiswa}
                      onMarkComplete={handleMarkMaterialComplete}
                      onUpdateStudent={handleUpdateStudentProfile}
                    />
                  )}

                  {activeTab === 'penilaian' && (
                    <PenilaianSiswaView
                      penilaianList={penilaianList}
                      materiList={materiList}
                      currentStudent={currentStudent}
                      onFinishQuiz={handleFinishQuiz}
                    />
                  )}

                  {activeTab === 'duel' && (
                    <DuelView
                      currentStudent={currentStudent}
                      students={students}
                      onBackToLms={() => setActiveTab('dashboard')}
                      onSimulateExpGain={handleSimulateExpGain}
                    />
                  )}

                  {activeTab === 'forum' && (
                    <ForumDiskusi
                      currentRole={currentRole}
                      currentStudent={currentStudent}
                      materiList={materiList}
                      forumPosts={forumPosts}
                    />
                  )}

                  {activeTab === 'progres' && (
                    <ProgresBelajarView
                      currentStudent={currentStudent}
                      materiList={materiList}
                      penilaianList={penilaianList}
                    />
                  )}

                  {activeTab === 'leaderboard' && (
                    <LeaderboardView
                      students={students}
                      currentStudentId={currentStudentId}
                    />
                  )}

                  {activeTab === 'profil' && (
                    <SiswaProfile
                      currentStudent={currentStudent}
                      materiList={materiList}
                      onUpdateStudentProfile={handleUpdateStudentProfile}
                    />
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Onboarding Guided Tour Modal */}
      <LmsTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        studentName={currentStudent?.name}
      />

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Kelas Digital Bahasa Arab © 2026 • LMS Pembelajaran Digital Interaktif</span>
          <span className="font-arabic text-sm text-emerald-800 dark:text-emerald-400">تَعَلَّمِ العَرَبِيَّةَ بِسُهُولَةٍ</span>
        </div>
      </footer>

    </div>
  );
}
