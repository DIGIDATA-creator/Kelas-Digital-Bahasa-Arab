import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, StudentStatus } from '../../types';
import {
  KeyRound,
  Search,
  Eye,
  EyeOff,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  X,
  Lock,
  UserCheck,
  RefreshCw,
  Building2,
  GraduationCap,
  Mail,
  Send,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { storageService } from '../../services/storage';

interface SiswaCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onSaveStudents: (updated: Student[]) => void;
  initialSelectedStudentId?: string;
  onSwitchToStudentSession?: (student: Student) => void;
}

export const SiswaCredentialsModal: React.FC<SiswaCredentialsModalProps> = ({
  isOpen,
  onClose,
  students,
  onSaveStudents,
  initialSelectedStudentId,
  onSwitchToStudentSession,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'semua' | 'disetujui' | 'pending' | 'nonaktif'>('semua');
  const [showAllPasswords, setShowAllPasswords] = useState(false);
  const [visiblePasswordIds, setVisiblePasswordIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Active student being edited for password change
  const [editingStudent, setEditingStudent] = useState<Student | null>(() => {
    if (initialSelectedStudentId) {
      return students.find(s => s.id === initialSelectedStudentId) || null;
    }
    return null;
  });

  const [inputNewPassword, setInputNewPassword] = useState('');
  const [inputNewEmail, setInputNewEmail] = useState('');
  const [showEditorPassword, setShowEditorPassword] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // When initialSelectedStudentId changes, open that student
  useEffect(() => {
    if (initialSelectedStudentId && isOpen) {
      const target = students.find(s => s.id === initialSelectedStudentId);
      if (target) {
        setEditingStudent(target);
        setInputNewPassword(target.password || '123456');
        setInputNewEmail(target.email || '');
      }
    }
  }, [initialSelectedStudentId, isOpen, students]);

  // Handle open editor for specific student
  const handleSelectStudentForEdit = (std: Student) => {
    setEditingStudent(std);
    setInputNewPassword(std.password || '123456');
    setInputNewEmail(std.email || '');
    setFeedbackMsg(null);
  };

  // Toggle single password visibility
  const togglePasswordVisibility = (studentId: string) => {
    setVisiblePasswordIds(prev => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  // Filter students based on search and status
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.nisn.toLowerCase().includes(q) ||
        (s.email && s.email.toLowerCase().includes(q)) ||
        (s.className && s.className.toLowerCase().includes(q)) ||
        (s.schoolName && s.schoolName.toLowerCase().includes(q)) ||
        (s.rombelName && s.rombelName.toLowerCase().includes(q));

      const matchStatus =
        statusFilter === 'semua' ||
        (statusFilter === 'disetujui' && (s.status === 'disetujui' || s.status === 'aktif')) ||
        (statusFilter === 'pending' && s.status === 'pending') ||
        (statusFilter === 'nonaktif' && s.status === 'nonaktif');

      return matchSearch && matchStatus;
    });
  }, [students, searchTerm, statusFilter]);

  // Copy formatted credentials text to clipboard for sharing
  const handleCopyCredentials = (std: Student, customPw?: string) => {
    const pw = customPw || std.password || '123456';
    const message = `*AKUN LMS BAHASA ARAB*\n━━━━━━━━━━━━━━━━━━━━\n👤 *Nama:* ${std.name}\n🆔 *NISN:* ${std.nisn}\n🏫 *Sekolah:* ${std.schoolName || '-'}\n📚 *Kelas:* ${std.className} (${std.rombelName || 'Rombel A'})\n📧 *Username / Email:* ${std.email}\n🔑 *Kata Sandi (Password):* ${pw}\n━━━━━━━━━━━━━━━━━━━━\nSilakan masuk melalui portal LMS Bahasa Arab. Simpan data login ini dengan baik.`;

    navigator.clipboard.writeText(message);
    setCopiedId(std.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Generate random password helper
  const handleGenerateRandomPassword = () => {
    const prefixes = ['santri', 'arab', 'belajar', 'sukses', 'bintang'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    setInputNewPassword(`${randomPrefix}${randomDigits}`);
  };

  // Save new password and credentials
  const handleSaveCredentials = async () => {
    if (!editingStudent) return;
    if (!inputNewPassword.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Kata sandi tidak boleh kosong.' });
      return;
    }

    setIsSaving(true);
    setFeedbackMsg(null);

    try {
      const result = await storageService.updateStudentCredentials(
        editingStudent.id,
        inputNewPassword.trim(),
        inputNewEmail.trim() ? inputNewEmail.trim() : editingStudent.email
      );

      if (result.success && result.student) {
        const updatedList = students.map(s => s.id === result.student!.id ? result.student! : s);
        onSaveStudents(updatedList);
        setEditingStudent(result.student);
        setFeedbackMsg({
          type: 'success',
          text: `✅ Kata sandi untuk "${result.student.name}" berhasil diubah menjadi "${result.student.password}". Data telah tersinkronisasi ke server.`,
        });
      } else {
        setFeedbackMsg({
          type: 'error',
          text: result.message || 'Gagal menyimpan perubahan kata sandi.',
        });
      }
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.message || 'Terjadi kesalahan sistem saat memperbarui data.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-2 sm:p-4 md:p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto"
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500 text-slate-950 rounded-2xl shadow-md shrink-0">
              <KeyRound size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Akses Akun & Reset Kata Sandi Siswa
                </h2>
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                  Menu Administrator
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Kelola username, email, dan kata sandi siswa. Ubah atau reset password saat siswa lupa sandi tanpa perlu login ke akun siswa.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors cursor-pointer text-slate-300 hover:text-white"
            title="Tutup Menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Top Control & Search Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama siswa, NISN, email, kelas, sekolah..."
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setStatusFilter('semua')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === 'semua'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({students.length})
            </button>
            <button
              onClick={() => setStatusFilter('disetujui')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === 'disetujui'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 hover:text-emerald-900'
              }`}
            >
              Aktif ({students.filter(s => s.status === 'disetujui' || s.status === 'aktif').length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === 'pending'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-amber-700 hover:text-amber-900'
              }`}
            >
              Pending ({students.filter(s => s.status === 'pending').length})
            </button>
          </div>

          {/* Global Visibility Toggle */}
          <button
            onClick={() => setShowAllPasswords(!showAllPasswords)}
            className="px-3.5 py-2 bg-white dark:bg-slate-900 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            {showAllPasswords ? <EyeOff size={14} className="text-slate-500" /> : <Eye size={14} className="text-slate-500" />}
            <span>{showAllPasswords ? 'Sembunyikan Semua Sandi' : 'Tampilkan Semua Sandi'}</span>
          </button>
        </div>

        {/* Main Content Area: Split View (List Table on Left, Password Editor on Right if open) */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left / Main Table View */}
          <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${editingStudent ? 'md:max-w-[58%]' : 'w-full'}`}>
            {filteredStudents.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs font-semibold">
                Tidak ada data akun siswa yang cocok dengan pencarian.
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredStudents.map((std, idx) => {
                  const currentPw = std.password || '123456';
                  const isVisible = showAllPasswords || !!visiblePasswordIds[std.id];
                  const isSelected = editingStudent?.id === std.id;
                  const isCopied = copiedId === std.id;

                  return (
                    <div
                      key={`${std.id || 'std'}-${idx}`}
                      className={`p-3.5 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
                      }`}
                    >
                      {/* Student Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={std.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${std.nisn || std.id}`}
                          alt={std.name}
                          className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                              {std.name}
                            </span>
                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[10px] font-bold rounded-md">
                              NISN: {std.nisn}
                            </span>
                            {std.status === 'pending' && (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold text-[9px] rounded-full">
                                Pending
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2 mt-0.5 truncate">
                            <span className="truncate">{std.schoolName || 'Tanpa Sekolah'}</span>
                            <span>•</span>
                            <span className="truncate">{std.className} ({std.rombelName || 'Rombel A'})</span>
                          </div>
                          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono font-semibold truncate flex items-center gap-1 mt-0.5">
                            <Mail size={11} className="shrink-0" />
                            <span className="truncate">{std.email}</span>
                          </div>
                        </div>
                      </div>

                      {/* Password Info & Action Buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {/* Password Pill */}
                        <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                          <Lock size={12} className="text-slate-400" />
                          <span>{isVisible ? currentPw : '••••••'}</span>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(std.id)}
                            className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 hover:text-slate-800 cursor-pointer ml-1"
                            title={isVisible ? 'Sembunyikan Sandi' : 'Tampilkan Sandi'}
                          >
                            {isVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                        </div>

                        {/* Copy WhatsApp Format */}
                        <button
                          type="button"
                          onClick={() => handleCopyCredentials(std)}
                          className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                            isCopied
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                          title="Salin Kredensial Lengkap (Format WA/Chat)"
                        >
                          {isCopied ? <Check size={14} /> : <Copy size={14} />}
                        </button>

                        {/* Edit / Reset Password Button */}
                        <button
                          type="button"
                          onClick={() => handleSelectStudentForEdit(std)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                            isSelected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                          }`}
                        >
                          <KeyRound size={13} />
                          <span>{isSelected ? 'Sedang Diedit' : 'Ubah PW'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column / Quick Editor Panel */}
          {editingStudent && (
            <div className="md:w-[42%] bg-slate-50 dark:bg-slate-950 p-4 sm:p-5 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 overflow-y-auto space-y-4 flex flex-col justify-between shrink-0">
              <div className="space-y-4">
                {/* Editor Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        Ubah Kata Sandi Siswa
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        Atur ulang password siswa terpilih
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingStudent(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Target Student Identity Card */}
                <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={editingStudent.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${editingStudent.nisn || editingStudent.id}`}
                      alt={editingStudent.name}
                      className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-800 border object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-black text-sm text-slate-900 dark:text-white truncate">
                        {editingStudent.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        NISN: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{editingStudent.nisn}</span>
                      </p>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold truncate">
                        {editingStudent.schoolName || 'Tanpa Sekolah'} • {editingStudent.className}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Password Form Field */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Kata Sandi Baru (Password)
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showEditorPassword ? 'text' : 'password'}
                      value={inputNewPassword}
                      onChange={(e) => setInputNewPassword(e.target.value)}
                      placeholder="Masukkan kata sandi baru..."
                      className="w-full pl-9 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditorPassword(!showEditorPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                    >
                      {showEditorPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  {/* Preset Buttons for Quick Reset */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setInputNewPassword('123456')}
                      className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                    >
                      <RotateCcw size={11} /> 123456 (Default)
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputNewPassword(editingStudent.nisn || '123456')}
                      className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                    >
                      <span>🔢 Gunakan NISN</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleGenerateRandomPassword}
                      className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 border border-amber-200 dark:border-amber-800 rounded-lg text-[11px] font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                    >
                      <Sparkles size={11} /> Password Acak
                    </button>
                  </div>
                </div>

                {/* Email / Username Field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Alamat Email / Akun Siswa
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={inputNewEmail}
                      onChange={(e) => setInputNewEmail(e.target.value)}
                      placeholder="Email akun siswa..."
                      className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Feedback Message */}
                {feedbackMsg && (
                  <div
                    className={`p-3 rounded-xl text-xs font-bold flex items-start gap-2 ${
                      feedbackMsg.type === 'success'
                        ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-rose-50 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
                    }`}
                  >
                    {feedbackMsg.type === 'success' ? (
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <span>{feedbackMsg.text}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <button
                  type="button"
                  onClick={handleSaveCredentials}
                  disabled={isSaving}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      <span>Menyimpan Perubahan...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>Simpan Password Baru</span>
                    </>
                  )}
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyCredentials(editingStudent, inputNewPassword)}
                    className="flex-1 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Copy size={13} />
                    <span>Salin Format WA</span>
                  </button>

                  {onSwitchToStudentSession && (
                    <button
                      type="button"
                      onClick={() => {
                        onSwitchToStudentSession(editingStudent);
                        onClose();
                      }}
                      className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                      title="Uji coba login langsung sebagai siswa ini"
                    >
                      <UserCheck size={14} />
                      <span className="hidden sm:inline">Uji Login</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Info */}
        <div className="p-3.5 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 font-medium shrink-0">
          <div className="flex items-center gap-2">
            <Lock size={14} className="text-emerald-600" />
            <span>
              Perubahan password langsung aktif dan dapat langsung digunakan siswa saat log in.
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all cursor-pointer text-xs ml-auto"
          >
            Selesai
          </button>
        </div>
      </motion.div>
    </div>
  );
};
