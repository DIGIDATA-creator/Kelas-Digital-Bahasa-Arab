import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { signInWithGoogle, loginUser, registerUser, logoutUser, User } from '../../lib/firebase';
import { LogIn, LogOut, UserPlus, Mail, Lock, Shield, CheckCircle2, AlertCircle, Sparkles, Copy, ExternalLink, Globe, Check, ShieldAlert, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { PendaftaranSiswaForm } from './PendaftaranSiswaForm';
import { Student, TingkatType, Role } from '../../types';
import { storageService } from '../../services/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  existingStudents?: Student[];
  onAddNewStudent?: (newStudent: Student) => void;
  onSelectStudent?: (studentId: string) => void;
  onRoleChange?: (role: Role) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  existingStudents = [],
  onAddNewStudent,
  onSelectStudent,
  onRoleChange,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [pendingGoogleUser, setPendingGoogleUser] = useState<{ name: string; email: string } | null>(null);

  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'kelas-digital-bahasa-arab.vercel.app';

  const handleCopyDomain = () => {
    navigator.clipboard.writeText(currentDomain);
    setCopiedDomain(true);
    setTimeout(() => setCopiedDomain(false), 2000);
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setPendingGoogleUser(null);
    setLoading(true);

    try {
      const user = await signInWithGoogle();
      const userEmail = user.email?.toLowerCase().trim() || '';

      // 1. Check if this Google account is Guru / Admin
      const isTeacher = userEmail.includes('guru') || userEmail.includes('admin') || userEmail === 'ruangk106@gmail.com';

      if (isTeacher) {
        if (onRoleChange) onRoleChange('guru');
        setSuccessMsg(`Berhasil masuk dengan Google Account sebagai Guru (${user.displayName || user.email})!`);
        setTimeout(() => onClose(), 1200);
        return;
      }

      // 2. Check student database for registration & approval status
      const allStudents = storageService.getStudents();
      const matchedStudent = allStudents.find(
        s => s.email.toLowerCase().trim() === userEmail
      );

      if (!matchedStudent) {
        // Email is not registered at all!
        await logoutUser(); // Revoke unapproved session
        setPendingGoogleUser({
          name: user.displayName || '',
          email: user.email || '',
        });
        setErrorMsg(
          `Alamat email Google (${user.email}) BELUM TERDAFTAR sebagai siswa. Silakan mendaftar terlebih dahulu pada Formulir Pendaftaran Siswa Baru dan tunggu persetujuan Guru.`
        );
        return;
      }

      // 3. If registered, check approval status
      if (matchedStudent.status === 'pending') {
        await logoutUser();
        setErrorMsg(
          `Akun Google (${user.email}) atas nama "${matchedStudent.name}" telah terdaftar, tetapi masih MENUNGGU ACC (Persetujuan) dari Guru. Silakan hubungi Guru Anda untuk menyetujui akun.`
        );
        return;
      }

      if (matchedStudent.status === 'ditolak') {
        await logoutUser();
        setErrorMsg(
          `Pendaftaran akun Google (${user.email}) atas nama "${matchedStudent.name}" DITOLAK oleh Guru. Silakan hubungi Guru pengampu.`
        );
        return;
      }

      // 4. Status is 'disetujui' or 'aktif' -> Allow login!
      if (onSelectStudent) {
        onSelectStudent(matchedStudent.id);
      }
      if (onRoleChange) {
        onRoleChange('siswa');
      }
      setSuccessMsg(`Berhasil masuk sebagai siswa ${matchedStudent.name}! Akun Google telah terverifikasi dan disetujui Guru.`);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error("Google Auth error:", err);
      setErrorMsg(err.message || 'Gagal masuk dengan Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      // Check local student database status first
      const allStudents = storageService.getStudents();
      const studentMatch = allStudents.find(
        s => s.email.toLowerCase().trim() === email.toLowerCase().trim()
      );

      if (studentMatch) {
        if (studentMatch.status === 'pending') {
          setErrorMsg(`Pendaftaran akun "${studentMatch.name}" masih MENUNGGU ACC (Persetujuan) dari Guru. Silakan tunggu hingga guru menyetujui akun Anda.`);
          setLoading(false);
          return;
        } else if (studentMatch.status === 'ditolak') {
          setErrorMsg(`Pendaftaran akun "${studentMatch.name}" DITOLAK oleh Guru. Silakan hubungi guru pengampu.`);
          setLoading(false);
          return;
        }
      }

      // Try Firebase authentication
      try {
        const user = await loginUser(email, password);
        if (user) {
          if (studentMatch && (studentMatch.status === 'disetujui' || studentMatch.status === 'aktif')) {
            if (onSelectStudent) onSelectStudent(studentMatch.id);
            if (onRoleChange) onRoleChange('siswa');
          }
          setSuccessMsg(`Berhasil masuk sebagai ${user.email}`);
          setTimeout(() => onClose(), 1000);
          return;
        }
      } catch (fbErr: any) {
        console.warn("Firebase login skipped/failed:", fbErr);
      }

      // Fallback: If student exists and is approved, allow login
      if (studentMatch && (studentMatch.status === 'disetujui' || studentMatch.status === 'aktif')) {
        if (onSelectStudent) onSelectStudent(studentMatch.id);
        if (onRoleChange) onRoleChange('siswa');
        setSuccessMsg(`Berhasil masuk sebagai ${studentMatch.name}!`);
        setTimeout(() => onClose(), 1000);
      } else {
        setErrorMsg('Email atau kata sandi tidak ditemukan. Pastikan Anda sudah mendaftar dan akun disetujui Guru.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal login. Periksa kembali email & password Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (data: {
    name: string;
    email: string;
    password?: string;
    gender: 'Laki-laki' | 'Perempuan';
    tingkat: TingkatType;
    schoolName: string;
    className: string;
    rombelName: string;
  }) => {
    setErrorMsg('');
    setSuccessMsg('');

    // Double check duplicate email in database
    const currentStudents = storageService.getStudents();
    const isDuplicate = currentStudents.some(
      s => s.email.toLowerCase().trim() === data.email.toLowerCase().trim()
    );
    if (isDuplicate) {
      setErrorMsg('Email sudah terdaftar. Silakan masuk dengan akun Anda atau gunakan email lain.');
      return;
    }

    setLoading(true);

    try {
      if (data.password) {
        try {
          await registerUser(data.email, data.password, data.name);
        } catch (fbErr: any) {
          console.warn("Firebase register skipped/handled:", fbErr);
        }
      }

      const newStudent: Student = {
        id: `std-${Date.now()}`,
        name: data.name,
        email: data.email,
        nisn: `2026${Math.floor(1000 + Math.random() * 9000)}`,
        gender: data.gender,
        tingkat: data.tingkat,
        schoolName: data.schoolName,
        className: data.className,
        rombelName: data.rombelName,
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
        totalXP: 0,
        completedMaterials: [],
        attempts: [],
        status: 'pending',
        lastActive: new Date().toISOString(),
        registeredAt: new Date().toISOString(),
      };

      const currentList = storageService.getStudents();
      const updatedList = [newStudent, ...currentList];
      storageService.saveStudents(updatedList);
      if (onAddNewStudent) onAddNewStudent(newStudent);

      setSuccessMsg(`Pendaftaran siswa baru berhasil! Status: MENUNGGU ACC (Persetujuan) dari Guru.`);
      setTimeout(() => onClose(), 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mendaftar. Silakan coba beberapa saat lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setSuccessMsg('Berhasil keluar dari Firebase Auth.');
      setTimeout(() => onClose(), 800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal logout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 my-auto max-h-[90vh] flex flex-col"
          >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 p-6 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-200 hover:text-white bg-emerald-900/40 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xs">
              <Shield className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg">
                {currentUser
                  ? 'Status Akun Pengguna'
                  : mode === 'login'
                  ? 'Masuk ke Portal Siswa'
                  : 'Formulir Pendaftaran Siswa Baru'}
              </h3>
              <p className="text-xs text-emerald-100/80">
                {currentUser
                  ? 'Terhubung dengan Firebase Auth'
                  : mode === 'login'
                  ? 'Masuk untuk mengakses materi & latihan'
                  : 'Isi data pendaftaran siswa lengkap'}
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Messages */}
          {errorMsg && (
            (errorMsg.includes('unauthorized-domain') || errorMsg.includes('Authorized Domains')) ? (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs rounded-2xl space-y-3 shadow-xs">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-amber-900 dark:text-amber-100 text-xs">
                      Domain Belum Didaftarkan di Firebase Auth
                    </h4>
                    <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                      Error <code className="bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded font-mono text-[10px]">auth/unauthorized-domain</code> terjadi karena domain web saat ini belum dimasukkan ke dalam daftar <strong>Authorized Domains</strong> Firebase.
                    </p>
                  </div>
                </div>

                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Globe size={14} className="text-amber-600 shrink-0" />
                    <span className="font-mono text-slate-800 dark:text-slate-200 font-bold truncate text-[11px]">
                      {currentDomain}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyDomain}
                    className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900 dark:hover:bg-amber-800 text-amber-900 dark:text-amber-100 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    {copiedDomain ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    <span>{copiedDomain ? 'Tersalin!' : 'Salin Domain'}</span>
                  </button>
                </div>

                <div className="text-[11px] space-y-1 text-slate-700 dark:text-slate-300 border-t border-amber-200/60 dark:border-amber-800/60 pt-2">
                  <p className="font-bold text-amber-900 dark:text-amber-200">Cara Mengatasi (Untuk Admin / Pengembang):</p>
                  <ol className="list-decimal list-inside space-y-0.5 pl-1">
                    <li>Buka <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-amber-700 dark:text-amber-400 font-bold underline inline-flex items-center gap-0.5">Firebase Console <ExternalLink size={10} /></a> & pilih proyek Anda.</li>
                    <li>Ke menu <strong>Authentication</strong> &gt; tab <strong>Settings</strong> &gt; <strong>Authorized domains</strong>.</li>
                    <li>Klik <strong>Add domain</strong>, tempel domain di atas, lalu simpan.</li>
                  </ol>
                </div>

                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-[11px] text-emerald-800 dark:text-emerald-300">
                  <span>💡 <strong>Solusi Cepat Pengguna:</strong> Anda tetap bisa masuk menggunakan <strong>Login Email & Password</strong> di bawah.</span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-xl space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 text-rose-500 mt-0.5" />
                  <span className="leading-relaxed">{errorMsg}</span>
                </div>
                {pendingGoogleUser && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setErrorMsg('');
                    }}
                    className="w-full mt-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus size={14} />
                    <span>Daftarkan Akun Google ({pendingGoogleUser.email})</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            )
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {currentUser ? (
            <div className="space-y-4 text-center">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-xs text-slate-500 font-medium">Masuk Sebagai:</p>
                <p className="font-extrabold text-sm text-slate-900 mt-1">{currentUser.displayName || 'Pengguna'}</p>
                <p className="text-xs text-slate-600 font-mono">{currentUser.email}</p>
              </div>

              <button
                onClick={handleLogout}
                disabled={loading}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut size={16} /> Keluar (Sign Out)
              </button>
            </div>
          ) : (
            <>
              {mode === 'login' ? (
                <>
                  {/* Google Sign-In Button */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full py-2.5 bg-white border-2 border-slate-200 hover:border-emerald-500 text-slate-700 rounded-xl font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    Masuk dengan Google Account
                  </button>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink mx-3 text-[10px] uppercase text-slate-400 font-extrabold tracking-wider">Atau Login Email</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>

                  {/* Login Form */}
                  <form onSubmit={handleLoginSubmit} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">Alamat Email</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="email"
                          required
                          value={email || ''}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="nama@sekolah.sch.id"
                          className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">Kata Sandi (Password)</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={password || ''}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min. 6 Karakter"
                          className="w-full pl-9 pr-10 py-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
                    >
                      {loading ? 'Memproses...' : 'Masuk Ke Akun'}
                    </button>
                  </form>
                </>
              ) : (
                /* Registration Mode */
                <PendaftaranSiswaForm
                  existingStudents={existingStudents}
                  initialStudent={
                    pendingGoogleUser
                      ? ({
                          name: pendingGoogleUser.name,
                          email: pendingGoogleUser.email,
                        } as Student)
                      : undefined
                  }
                  onRegisterSubmit={handleRegisterSubmit}
                  isLoading={loading}
                />
              )}

              {/* Mode Switcher Footer */}
              <div className="text-center pt-2 text-xs text-slate-500 border-t border-slate-100">
                {mode === 'login' ? (
                  <span>
                    Belum mendaftar?{' '}
                    <button
                      onClick={() => setMode('register')}
                      className="text-emerald-600 font-bold hover:underline cursor-pointer"
                    >
                      Formulir Pendaftaran Siswa Baru
                    </button>
                  </span>
                ) : (
                  <span>
                    Sudah memiliki akun?{' '}
                    <button
                      onClick={() => setMode('login')}
                      className="text-emerald-600 font-bold hover:underline cursor-pointer"
                    >
                      Kembali ke Menu Login
                    </button>
                  </span>
                )}
              </div>
            </>
          )}
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
