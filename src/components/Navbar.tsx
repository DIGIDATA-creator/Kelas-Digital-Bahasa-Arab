import React, { useState, useEffect } from 'react';
import { Role, Student } from '../types';
import { BookOpen, GraduationCap, UserCheck, Shield, RotateCcw, Award, ChevronDown, User as UserIcon, LogIn, Sun, Moon } from 'lucide-react';
import { auth, onAuthStateChanged, User } from '../lib/firebase';
import { AuthModal } from './auth/AuthModal';

interface NavbarProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  students: Student[];
  currentStudentId: string;
  onStudentChange: (studentId: string) => void;
  onResetData: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  activeTab,
  onTabChange,
  students,
  currentStudentId,
  onStudentChange,
  onResetData,
  isDarkMode = false,
  onToggleDarkMode,
}) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  const currentStudent = students.find(s => s.id === currentStudentId) || students[0];

  const guruTabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'siswa', label: 'Data Siswa' },
    { id: 'materi', label: 'Kelola Materi' },
    { id: 'penilaian', label: 'Kelola Penilaian' },
    { id: 'forum', label: 'Forum Diskusi' },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'profil', label: 'Profil Guru' },
  ];

  const siswaTabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'materi', label: 'Materi Belajar' },
    { id: 'penilaian', label: 'Latihan & Kuis' },
    { id: 'forum', label: 'Forum Diskusi' },
    { id: 'progres', label: 'Progres Saya' },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'profil', label: 'Profil Saya' },
  ];

  const activeNavTabs = currentRole === 'guru' ? guruTabs : siswaTabs;

  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-40 border-b border-slate-800">
      {/* Top Banner & Role Toggle Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 sm:py-3 border-b border-slate-800/80 gap-2 sm:gap-3">
          
          {/* Logo & App Title */}
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-900/30 font-arabic text-xl sm:text-2xl shrink-0">
                ع
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xs sm:text-base font-extrabold tracking-tight text-white leading-tight">
                    KELAS DIGITAL BAHASA ARAB
                  </h1>
                  <span className="text-[9px] sm:text-[10px] uppercase font-black tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                    LMS v2.0
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile inline quick controls (Dark Mode & Reset) */}
            <div className="flex items-center gap-1 sm:hidden">
              {onToggleDarkMode && (
                <button
                  onClick={onToggleDarkMode}
                  title={isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
                  className="p-1.5 bg-slate-800 text-slate-300 rounded-lg border border-slate-700 flex items-center justify-center cursor-pointer"
                >
                  {isDarkMode ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-slate-300" />}
                </button>
              )}
              <button
                onClick={() => {
                  if (confirm('Apakah Anda yakin ingin mereset data LMS ke data awal?')) {
                    onResetData();
                  }
                }}
                title="Reset Data"
                className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-800 rounded-lg border border-slate-700"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>

          {/* Controls: Role Switcher, Student Dropdown & Auth */}
          <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-3 flex-wrap">
            
            {/* Student Switcher when in Siswa Role */}
            {currentRole === 'siswa' && (
              <div className="flex items-center gap-1 bg-slate-800/90 border border-slate-700/80 rounded-lg px-2 py-1 text-[11px] sm:text-xs text-slate-300">
                <GraduationCap size={14} className="text-emerald-400 shrink-0" />
                <select
                  value={currentStudentId}
                  onChange={(e) => onStudentChange(e.target.value)}
                  className="bg-transparent text-emerald-300 font-semibold focus:outline-hidden cursor-pointer max-w-[110px] sm:max-w-none truncate"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                      {s.name} ({s.totalXP} XP)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Role Switcher Pills */}
            <div className="flex items-center bg-slate-800 p-0.5 sm:p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => {
                  onRoleChange('guru');
                  onTabChange('dashboard');
                }}
                className={`flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
                  currentRole === 'guru'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Shield size={12} className="sm:w-3.5 sm:h-3.5" />
                <span>Guru</span>
              </button>
              <button
                onClick={() => {
                  onRoleChange('siswa');
                  onTabChange('dashboard');
                }}
                className={`flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
                  currentRole === 'siswa'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <GraduationCap size={12} className="sm:w-3.5 sm:h-3.5" />
                <span>Siswa</span>
              </button>
            </div>

            {/* Firebase Auth Account Button */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-[11px] sm:text-xs font-semibold transition-all shadow-2xs"
              title="Firebase Authentication"
            >
              {firebaseUser ? (
                <>
                  {firebaseUser.photoURL ? (
                    <img src={firebaseUser.photoURL} alt="User" className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-emerald-400" />
                  ) : (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-600 text-white font-bold text-[9px] sm:text-[10px] flex items-center justify-center">
                      {(firebaseUser.displayName || firebaseUser.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="max-w-[70px] sm:max-w-[100px] truncate text-emerald-300">
                    {firebaseUser.displayName || firebaseUser.email?.split('@')[0]}
                  </span>
                </>
              ) : (
                <>
                  <LogIn size={13} className="text-emerald-400" />
                  <span>Auth</span>
                </>
              )}
            </button>

            {/* Desktop Dark Mode & Reset Buttons */}
            <div className="hidden sm:flex items-center gap-2">
              {onToggleDarkMode && (
                <button
                  onClick={onToggleDarkMode}
                  title={isDarkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 rounded-xl transition-all border border-slate-700 flex items-center justify-center cursor-pointer shadow-2xs"
                >
                  {isDarkMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-slate-300" />}
                </button>
              )}

              <button
                onClick={() => {
                  if (confirm('Apakah Anda yakin ingin mereset data LMS ke data awal?')) {
                    onResetData();
                  }
                }}
                title="Reset Data Demo"
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors border border-transparent hover:border-slate-700"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex items-center gap-1 overflow-x-auto py-1 sm:py-2 no-scrollbar">
          {activeNavTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Firebase Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={firebaseUser}
        existingStudents={students}
        onSelectStudent={onStudentChange}
        onRoleChange={onRoleChange}
      />
    </header>
  );
};
