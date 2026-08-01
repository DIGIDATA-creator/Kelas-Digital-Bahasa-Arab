import React, { useState, useEffect } from 'react';
import { Role, Materi, Penilaian, Student, ActivityLog, QuizAttempt, ForumPost } from './types';
import { storageService } from './services/storage';
import { Navbar } from './components/Navbar';

// Guru Components
import { GuruDashboard } from './components/guru/GuruDashboard';
import { SiswaManagement } from './components/guru/SiswaManagement';
import { MateriManagement } from './components/guru/MateriManagement';
import { PenilaianManagement } from './components/guru/PenilaianManagement';
import { GuruProfile } from './components/guru/GuruProfile';

// Siswa Components
import { SiswaDashboard } from './components/siswa/SiswaDashboard';
import { MateriSiswaView } from './components/siswa/MateriSiswaView';
import { PenilaianSiswaView } from './components/siswa/PenilaianSiswaView';
import { ProgresBelajarView } from './components/siswa/ProgresBelajarView';
import { LeaderboardView } from './components/siswa/LeaderboardView';
import { SiswaProfile } from './components/siswa/SiswaProfile';

// Forum Component
import { ForumDiskusi } from './components/forum/ForumDiskusi';

export default function App() {
  const [currentRole, setCurrentRole] = useState<Role>(() => storageService.getRole());
  const [activeTab, setActiveTab] = useState<string>('dashboard');

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
  const [currentStudentId, setCurrentStudentId] = useState<string>(() => storageService.getCurrentStudentId());

  const [selectedMateriIdForSiswa, setSelectedMateriIdForSiswa] = useState<string | undefined>(undefined);

  // Real-time synchronization with Firebase Firestore across all devices
  useEffect(() => {
    const unsubscribe = storageService.initFirestoreSync(({ materiList, penilaianList, students, logs, forumPosts }) => {
      setMateriList(materiList);
      setPenilaianList(penilaianList);
      setStudents(students);
      setLogs(logs);
      setForumPosts(forumPosts);
    });
    return () => unsubscribe();
  }, []);

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
  };

  const handleFinishQuiz = (attempt: Omit<QuizAttempt, 'id' | 'completedAt'>) => {
    storageService.saveQuizAttempt(attempt);
    setStudents(storageService.getStudents());
    setLogs(storageService.getLogs());
  };

  const handleResetData = () => {
    storageService.resetData();
    setMateriList(storageService.getMateri());
    setPenilaianList(storageService.getPenilaian());
    setStudents(storageService.getStudents());
    setLogs(storageService.getLogs());
    setCurrentStudentId(storageService.getCurrentStudentId());
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
        onResetData={handleResetData}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div key={`${currentRole}-${activeTab}`} className="animate-fade-in">
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
                  />
                )}

                {activeTab === 'siswa' && (
                  <SiswaManagement
                    students={students}
                    materiList={materiList}
                    onSaveStudents={handleSaveStudents}
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
                  />
                )}

                {activeTab === 'penilaian' && (
                  <PenilaianSiswaView
                    penilaianList={penilaianList}
                    currentStudent={currentStudent}
                    onFinishQuiz={handleFinishQuiz}
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
        </div>
      </main>

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
