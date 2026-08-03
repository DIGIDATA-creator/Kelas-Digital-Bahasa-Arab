import React from 'react';
import { Role, Student } from '../types';
import { UserSession } from '../services/storage';
import { NotificationDropdown } from './common/NotificationDropdown';
import {
  GraduationCap,
  Shield,
  Sun,
  Moon,
  LogOut,
  Lock,
  UserCheck,
  Compass,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface NavbarProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  students: Student[];
  currentStudentId: string;
  onStudentChange: (studentId: string) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  userSession: UserSession | null;
  onLogout: () => void;
  onSwitchToStudentSession?: (student: Student) => void;
  onOpenTour?: () => void;
  onOpenGlossary?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  activeTab,
  onTabChange,
  students,
  currentStudentId,
  isDarkMode = false,
  onToggleDarkMode,
  userSession,
  onLogout,
  onSwitchToStudentSession,
  onOpenTour,
  onOpenGlossary,
}) => {
  const currentStudent = students.find(s => s.id === currentStudentId) || students[0];

  const guruTabs = [
    { id: 'dashboard', label: 'Beranda' },
    { id: 'siswa', label: 'Data Siswa' },
    { id: 'materi', label: 'Kelola Materi' },
    { id: 'penilaian', label: 'Kelola Penilaian' },
    { id: 'forum', label: 'Forum Diskusi' },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'profil', label: 'Profil Guru' },
  ];

  const siswaTabs = [
    { id: 'dashboard', label: 'Beranda' },
    { id: 'materi', label: 'Materi Belajar' },
    { id: 'penilaian', label: 'Latihan & Kuis' },
    { id: 'duel', label: '⚔️ Mode Duel' },
    { id: 'forum', label: 'Forum Diskusi' },
    { id: 'progres', label: 'Progres Saya' },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'profil', label: 'Profil Saya' },
  ];

  const activeNavTabs = currentRole === 'guru' ? guruTabs : siswaTabs;

  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-40 border-b border-slate-800">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 sm:py-3 border-b border-slate-800/80 gap-2 sm:gap-3">
          
          {/* Logo & App Title */}
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <div className="flex items-center gap-2.5">
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
            </div>
          </div>

          {/* Controls Area: Logged In Account Info OR Locked Badge */}
          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 flex-wrap">
            
            {userSession ? (
              <>
                {/* Active Session Identity Badge (NO direct switching allowed) */}
                <div className="flex items-center gap-2 bg-slate-800/90 border border-emerald-500/40 rounded-xl px-2.5 py-1 sm:px-3 sm:py-1.5 shadow-xs">
                  {userSession.role === 'guru' ? (
                    <>
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Shield size={13} />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[9px] text-emerald-400 font-black uppercase tracking-wider leading-tight">
                          Guru / Admin
                        </span>
                        <span className="font-bold text-white text-xs truncate max-w-[120px] sm:max-w-[180px]">
                          {userSession.userName}
                        </span>
                      </div>

                      {/* Quick Admin Student Testing Dropdown */}
                      {onSwitchToStudentSession && students.length > 0 && (
                        <div className="hidden lg:flex items-center ml-2 pl-2 border-l border-slate-700">
                          <div className="relative flex items-center">
                            <select
                              value=""
                              onChange={(e) => {
                                const found = students.find(s => s.id === e.target.value);
                                if (found) onSwitchToStudentSession(found);
                              }}
                              className="bg-slate-900 text-amber-300 border border-amber-500/40 hover:border-amber-400 text-[11px] font-bold rounded-lg px-2 py-1 pr-6 cursor-pointer focus:outline-none"
                              title="Uji Akses Akun Siswa (Demo)"
                            >
                              <option value="" disabled>🧪 Simulasi Akun Siswa...</option>
                              {students.map(s => (
                                <option key={s.id} value={s.id}>
                                  {s.gender === 'Perempuan' ? '👩' : '👨'} {s.name} ({s.className})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <img
                        src={currentStudent?.avatar || userSession.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                        alt="Student"
                        className="w-6 h-6 rounded-full object-cover border border-emerald-400 shrink-0"
                      />
                      <div className="flex flex-col text-left">
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] text-emerald-400 font-black uppercase tracking-wider leading-tight">
                            {currentStudent?.gender === 'Perempuan' ? 'طَالِبَةٌ' : 'طَالِبٌ'}
                          </span>
                          <span className="text-[10px] text-amber-300 font-extrabold bg-amber-400/20 px-1 rounded">
                            {currentStudent?.totalXP || 0} XP
                          </span>
                        </div>
                        <span className="font-bold text-white text-xs truncate max-w-[110px] sm:max-w-[160px]">
                          {currentStudent?.name || userSession.userName}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Notification Dropdown for Siswa */}
                {userSession.role === 'siswa' && currentStudent && (
                  <NotificationDropdown
                    studentId={currentStudent.id}
                    onNavigateToSection={(type) => {
                      if (type === 'kuis') onTabChange('penilaian');
                      else if (type === 'materi' || type === 'hafalan') onTabChange('materi');
                      else if (type === 'duel') onTabChange('duel');
                      else onTabChange('dashboard');
                    }}
                  />
                )}

                {/* Global Glossary Button */}
                {onOpenGlossary && (
                  <button
                    type="button"
                    onClick={onOpenGlossary}
                    className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 bg-emerald-800/80 hover:bg-emerald-700 text-emerald-200 border border-emerald-600/50 rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer shrink-0"
                    title="Buka Kamus Mufrodat & Glosarium LMS"
                  >
                    <BookOpen size={14} className="text-emerald-300" />
                    <span className="hidden sm:inline">Glosarium</span>
                  </button>
                )}

                {/* Guided Tour Button for Siswa */}
                {userSession.role === 'siswa' && onOpenTour && (
                  <button
                    type="button"
                    onClick={onOpenTour}
                    className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer border border-amber-300 shrink-0"
                    title="Mulai Panduan Tur Fitur LMS"
                  >
                    <Sparkles size={14} className="fill-slate-950" />
                    <span className="hidden sm:inline">Tur Panduan</span>
                  </button>
                )}

                {/* Logout Button */}
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 bg-rose-900/40 hover:bg-rose-900/70 text-rose-300 border border-rose-700/60 hover:border-rose-500 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-2xs"
                  title="Keluar dari Sesi LMS (Log Out)"
                >
                  <LogOut size={14} className="shrink-0" />
                  <span>Keluar</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/90 border border-amber-500/30 rounded-xl text-xs text-amber-300 font-bold">
                <Lock size={14} className="text-amber-400 shrink-0" />
                <span>Akses Terkunci • Silakan Log In</span>
              </div>
            )}

            {/* Desktop Dark Mode Button */}
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
            </div>

          </div>

        </div>

        {/* Navigation Tabs Bar (Visible ONLY when logged in) */}
        {userSession && (
          <nav className="flex items-center gap-1 overflow-x-auto py-1 sm:py-2 no-scrollbar">
            {activeNavTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
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
        )}
      </div>
    </header>
  );
};
