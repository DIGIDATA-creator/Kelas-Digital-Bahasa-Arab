import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Role, Materi, Penilaian, Student, ActivityLog, QuizAttempt, ForumPost } from './types';
import { storageService, UserSession } from './services/storage';
import { Navbar } from './components/Navbar';
import { LoginView } from './components/auth/LoginView';
import { auth, db } from './firebase/config';
import { onAuthStateChanged, logoutUser } from './lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import './utils/firebaseDiagnostics';

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
import { GlossaryModal } from './components/common/GlossaryModal';
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

  // Global Glossary Modal state
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('lms_dark_mode') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('lms_dark_mode', String(isDarkMode));
    } catch {
      // ignore
    }
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

  // Firebase Auth Built-in State Management & Persistence Listener with Firestore Status Validation
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && !firebaseUser.isAnonymous) {
        console.log('🔒 [FIREBASE AUTH SESSION] User authenticated:', firebaseUser.email || firebaseUser.uid);
        const userEmail = (firebaseUser.email || '').toLowerCase().trim();

        try {
          const freshGuru = { profile: storageService.getGuruProfile(), credentials: storageService.getGuruCredentials() };
          const guruEmail = (freshGuru.profile?.email || 'ruangk106@gmail.com').toLowerCase().trim();

          const isGuru = userEmail === guruEmail || userEmail === 'ruangk106@gmail.com' || userEmail.includes('guru') || userEmail.includes('admin');

          if (isGuru) {
            const newSession: UserSession = {
              role: 'guru',
              userName: firebaseUser.displayName || freshGuru.profile?.name || 'Ahmad Yusron',
              userEmail: firebaseUser.email || guruEmail,
              avatar: firebaseUser.photoURL || freshGuru.profile?.avatar,
              loggedInAt: new Date().toISOString(),
              firebaseUid: firebaseUser.uid,
            };
            storageService.setUserSession(newSession);
            setUserSession(newSession);
            setCurrentRole('guru');
          } else {
            // Explicitly query the students collection in Firestore to validate the status field ('aktif' vs 'nonaktif')
            let matchedStudentRecord: Student | null = null;

            if (db) {
              try {
                // 1. Check individual student records collection in Firestore
                const studentRecordsSnap = await getDocs(collection(db, 'students_records'));
                studentRecordsSnap.forEach((docSnap) => {
                  if (docSnap.exists()) {
                    const data = docSnap.data() as Student;
                    if (data.email && data.email.toLowerCase().trim() === userEmail) {
                      matchedStudentRecord = data;
                    }
                  }
                });

                // 2. Check master students collection document in Firestore if not found yet
                if (!matchedStudentRecord) {
                  const masterStudentsDoc = await getDoc(doc(db, 'app_collections', 'students'));
                  if (masterStudentsDoc.exists() && masterStudentsDoc.data()?.items) {
                    const items = masterStudentsDoc.data().items as Student[];
                    const found = items.find(s => s.email && s.email.toLowerCase().trim() === userEmail);
                    if (found) matchedStudentRecord = found;
                  }
                }
              } catch (fsErr) {
                console.warn('⚠️ [FIREBASE AUTH SESSION] Firestore direct query error, checking local store:', fsErr);
              }
            }

            // Fallback to local cached students if offline/error
            if (!matchedStudentRecord) {
              const freshStudents = storageService.getStudents();
              matchedStudentRecord = freshStudents.find(s => s.email && s.email.toLowerCase().trim() === userEmail) || null;
            }

            if (matchedStudentRecord) {
              const student = matchedStudentRecord as Student;
              const isAccountActive = student.status === 'aktif' || student.status === 'disetujui';

              if (isAccountActive) {
                const newSession: UserSession = {
                  role: 'siswa',
                  studentId: student.id,
                  userName: student.name,
                  userEmail: student.email,
                  avatar: student.avatar,
                  loggedInAt: new Date().toISOString(),
                  firebaseUid: firebaseUser.uid,
                };
                storageService.setUserSession(newSession);
                setUserSession(newSession);
                setCurrentRole('siswa');
                setCurrentStudentId(student.id);
              } else {
                // Deactivated or pending account -> IMMEDIATELY terminate session and log out
                console.warn(`⛔ [FIREBASE AUTH SESSION] Account ${student.email} status is "${student.status}". Logging out immediately.`);
                storageService.clearUserSession();
                setUserSession(null);
                await logoutUser().catch(() => {});
                addToast({
                  type: 'info',
                  title: 'Akses Ditolak',
                  message: student.status === 'nonaktif'
                    ? `Akun "${student.name}" sedang DINONAKTIFKAN oleh Guru. Silakan hubungi Guru Anda.`
                    : `Akun "${student.name}" belum disetujui (Status: ${student.status}).`,
                });
              }
            } else {
              // No student record found matching this email -> Logout immediately
              console.warn('⛔ [FIREBASE AUTH SESSION] No matching student record found for:', userEmail);
              storageService.clearUserSession();
              setUserSession(null);
              await logoutUser().catch(() => {});
            }
          }
        } catch (err) {
          console.warn('⚠️ [FIREBASE AUTH SESSION] Error resolving user session:', err);
        }
      } else {
        const cached = storageService.getUserSession();
        if (cached && cached.firebaseUid) {
          storageService.clearUserSession();
          setUserSession(null);
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Real-time Session Guard: Validate student account status whenever student data updates or after reload
  useEffect(() => {
    if (userSession && userSession.role === 'siswa') {
      const activeStudentId = userSession.studentId;
      const activeEmail = userSession.userEmail?.toLowerCase().trim();

      const matched = students.find(s => 
        (activeStudentId && s.id === activeStudentId) ||
        (activeEmail && s.email && s.email.toLowerCase().trim() === activeEmail)
      );

      if (matched && matched.status !== 'aktif' && matched.status !== 'disetujui') {
        console.warn(`⛔ [SESSION GUARD] Student ${matched.name} status is "${matched.status}". Terminating session immediately.`);
        storageService.clearUserSession();
        setUserSession(null);
        logoutUser().catch(() => {});
        addToast({
          type: 'info',
          title: 'Sesi Berakhir',
          message: matched.status === 'nonaktif'
            ? `Akun Anda telah dinonaktifkan oleh Guru. Sesi Anda dihentikan.`
            : `Status akun Anda tidak lagi aktif (Status: ${matched.status}).`,
        });
      }
    }
  }, [students, userSession]);

  // Auto open onboarding tour for student first-time login
  useEffect(() => {
    if (userSession && userSession.role === 'siswa') {
      const studentId = userSession.studentId || currentStudentId;
      const tourKey = 'lms_tour_seen_' + studentId;
      try {
        if (!localStorage.getItem(tourKey)) {
          setIsTourOpen(true);
          localStorage.setItem(tourKey, 'true');
        }
      } catch (err) {
        // ignore
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

  // Logout Handler with Firebase Auth SDK SignOut
  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.warn('Firebase Auth logout note:', err);
    }
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
    const freshStudents = storageService.getStudents();
    const updatedList = freshStudents.map(s => s.id === updatedStudent.id ? updatedStudent : s);
    if (!updatedList.some(s => s.id === updatedStudent.id)) {
      updatedList.push(updatedStudent);
    }
    handleSaveStudents(updatedList);

    if (userSession && userSession.studentId === updatedStudent.id) {
      const updatedSession: UserSession = {
        ...userSession,
        userName: updatedStudent.name,
        userEmail: updatedStudent.email,
        avatar: updatedStudent.avatar,
      };
      setUserSession(updatedSession);
      localStorage.setItem('lms_user_session', JSON.stringify(updatedSession));
      storageService.setUserSession(updatedSession);
    }
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
        onOpenGlossary={() => setIsGlossaryOpen(true)}
        isSyncing={isLoadingData}
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
                      students={students}
                      onSaveMateri={handleSaveMateri}
                    />
                  )}

                  {activeTab === 'penilaian' && (
                    <PenilaianManagement
                      penilaianList={penilaianList}
                      students={students}
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

      {/* Global Glossary Modal */}
      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
        materiList={materiList}
        onSelectMateri={(materiId) => {
          setSelectedMateriIdForSiswa(materiId);
          setActiveTab('materi');
        }}
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
