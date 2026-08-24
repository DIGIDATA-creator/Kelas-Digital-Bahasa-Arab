import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, GraduationCap, Mail, ArrowRight, UserPlus, CheckCircle2, AlertCircle, X, ExternalLink, KeyRound, Sparkles, UserCheck } from 'lucide-react';
import { Student } from '../../types';
import { storageService } from '../../services/storage';

interface GoogleAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onSelectGoogleAccount: (email: string, displayName?: string, passwordInput?: string) => Promise<{ success: boolean; message?: string }>;
  onNavigateToRegister: (email: string) => void;
}

export const GoogleAccountModal: React.FC<GoogleAccountModalProps> = ({
  isOpen,
  onClose,
  students,
  onSelectGoogleAccount,
  onNavigateToRegister,
}) => {
  const [customEmail, setCustomEmail] = useState('');
  const [guruPassword, setGuruPassword] = useState('');
  const [selectedRoleType, setSelectedRoleType] = useState<'pilih' | 'guru_verify' | 'custom_email'>('pilih');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState('');

  const freshGuru = { profile: storageService.getGuruProfile(), credentials: storageService.getGuruCredentials() };
  const guruEmail = (freshGuru.profile?.email || 'ruangk106@gmail.com').toLowerCase().trim();
  const guruName = freshGuru.profile?.name || 'Ahmad Yusron';

  const handleSelectGuru = () => {
    setSelectedRoleType('guru_verify');
    setFeedbackError('');
    setFeedbackSuccess('');
  };

  const handleConfirmGuruLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackError('');
    setFeedbackSuccess('');
    setIsSubmitting(true);

    try {
      const res = await onSelectGoogleAccount(guruEmail, guruName, guruPassword);
      if (res.success) {
        setFeedbackSuccess('Verifikasi berhasil! Mengalihkan ke Dashboard Guru...');
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setFeedbackError(res.message || 'Kata sandi Guru salah.');
      }
    } catch (err: any) {
      setFeedbackError(err?.message || 'Gagal memverifikasi akun Guru.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectStudentAccount = async (student: Student) => {
    setFeedbackError('');
    setFeedbackSuccess('');
    setIsSubmitting(true);

    try {
      const res = await onSelectGoogleAccount(student.email, student.name);
      if (res.success) {
        setFeedbackSuccess(`Berhasil masuk sebagai ${student.name}!`);
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setFeedbackError(res.message || 'Gagal masuk akun siswa.');
      }
    } catch (err: any) {
      setFeedbackError(err?.message || 'Gagal masuk akun siswa.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = customEmail.toLowerCase().trim();
    if (!cleanEmail) {
      setFeedbackError('Silakan masukkan alamat email Google Anda.');
      return;
    }

    setFeedbackError('');
    setFeedbackSuccess('');
    setIsSubmitting(true);

    try {
      // Check if matches guru
      if (cleanEmail === guruEmail || cleanEmail === 'ruangk106@gmail.com' || cleanEmail.includes('guru') || cleanEmail.includes('admin')) {
        setSelectedRoleType('guru_verify');
        setIsSubmitting(false);
        return;
      }

      // Check if student
      const matched = students.find(s => s.email && s.email.toLowerCase().trim() === cleanEmail);
      if (matched) {
        const res = await onSelectGoogleAccount(matched.email, matched.name);
        if (res.success) {
          setFeedbackSuccess(`Berhasil masuk sebagai ${matched.name}!`);
          setTimeout(() => onClose(), 800);
        } else {
          setFeedbackError(res.message || 'Status akun belum aktif.');
        }
      } else {
        setFeedbackError(`Email Google "${cleanEmail}" belum terdaftar sebagai siswa.`);
      }
    } catch (err: any) {
      setFeedbackError(err?.message || 'Gagal memeriksa email Google.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const approvedStudents = students.filter(s => s.status === 'aktif' || s.status === 'disetujui');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-900 p-5 text-white relative shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 text-emerald-200 hover:text-white bg-emerald-900/50 rounded-full w-8 h-8 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg">Masuk dengan Akun Google</h3>
                  <p className="text-xs text-emerald-100/90">Pilih akun Google terdaftar untuk masuk langsung</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              
              {/* Feedback messages */}
              {feedbackError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-xl space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={16} className="shrink-0 text-rose-500 mt-0.5" />
                    <span className="leading-relaxed font-semibold">{feedbackError}</span>
                  </div>
                  {feedbackError.includes('belum terdaftar') && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigateToRegister(customEmail);
                      }}
                      className="w-full mt-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <UserPlus size={14} />
                      <span>Daftarkan Akun Siswa Baru dengan Email Ini</span>
                      <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              )}

              {feedbackSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl flex items-center gap-2 font-bold">
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{feedbackSuccess}</span>
                </div>
              )}

              {/* VIEW: Guru Password Confirmation */}
              {selectedRoleType === 'guru_verify' && (
                <form onSubmit={handleConfirmGuruLogin} className="space-y-4">
                  <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-600 text-white rounded-xl">
                      <Shield size={20} />
                    </div>
                    <div>
                      <div className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                        {guruName} (Guru / Admin)
                      </div>
                      <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
                        {guruEmail}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Masukkan Kata Sandi Guru untuk Keamanan:
                    </label>
                    <div className="relative">
                      <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={guruPassword}
                        onChange={(e) => setGuruPassword(e.target.value)}
                        placeholder="Kata Sandi Guru (Default: @Cirebon1996)"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => { setSelectedRoleType('pilih'); setFeedbackError(''); }}
                      className="flex-1 py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Kembali
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <UserCheck size={14} />
                      <span>{isSubmitting ? 'Memverifikasi...' : 'Masuk Sebagai Guru'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* VIEW: Account Picker */}
              {selectedRoleType === 'pilih' && (
                <div className="space-y-4">
                  {/* Option 1: Teacher Account */}
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Akun Guru Pengampu
                    </div>
                    <button
                      type="button"
                      onClick={handleSelectGuru}
                      className="w-full p-3 bg-white dark:bg-slate-800 hover:bg-emerald-50/70 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 rounded-2xl flex items-center justify-between gap-3 text-left transition-all cursor-pointer group shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">
                          <Shield size={20} />
                        </div>
                        <div>
                          <div className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                            {guruName}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                            {guruEmail}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2.5 py-1 rounded-lg font-bold group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        Pilih Guru
                      </span>
                    </button>
                  </div>

                  {/* Option 2: Registered Student Accounts */}
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                      <span>Akun Siswa Terdaftar</span>
                      <span className="text-[10px] text-emerald-600 font-semibold">{approvedStudents.length} Aktif</span>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {approvedStudents.length > 0 ? (
                        approvedStudents.map((std) => (
                          <button
                            key={std.id}
                            type="button"
                            onClick={() => handleSelectStudentAccount(std)}
                            disabled={isSubmitting}
                            className="w-full p-2.5 bg-white dark:bg-slate-800 hover:bg-emerald-50/70 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 rounded-xl flex items-center justify-between gap-2 text-left transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <img
                                src={std.avatar}
                                alt={std.name}
                                className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <div className="truncate">
                                <div className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
                                  {std.name}
                                </div>
                                <div className="text-[10px] text-slate-400 truncate font-mono">
                                  {std.email}
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md font-bold shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                              Masuk
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="p-3 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                          Belum ada akun siswa yang disetujui
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Option 3: Enter Custom Google Email */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Gunakan Alamat Email Google Lainnya
                    </div>
                    <form onSubmit={handleCustomEmailSubmit} className="space-y-2">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="email"
                            required
                            value={customEmail}
                            onChange={(e) => setCustomEmail(e.target.value)}
                            placeholder="nama.anda@gmail.com"
                            className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer shrink-0 disabled:opacity-50"
                        >
                          <span>Cek</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Help & Info */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                <div className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                  <Sparkles size={12} className="text-amber-500" />
                  <span>Informasi Integrasi Google & Firebase:</span>
                </div>
                <p className="leading-relaxed">
                  Akun Guru & Siswa terhubung aman dengan sistem LMS. Bila pop-up Google OAuth eksternal belum diaktifkan di Firebase Console, verifikasi identitas di atas langsung menghubungkan sesi Anda.
                </p>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                Belum mendaftar?
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToRegister(customEmail);
                }}
                className="text-emerald-600 dark:text-emerald-400 font-extrabold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <UserPlus size={14} />
                <span>Daftar Siswa Baru</span>
              </button>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
