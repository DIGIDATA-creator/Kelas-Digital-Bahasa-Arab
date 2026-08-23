import React, { useState, useEffect } from 'react';
import { Student, Materi } from '../../types';
import { uploadToSupabaseStorage } from '../../lib/supabase';
import { DetailedActivityLogView } from '../common/DetailedActivityLogView';
import { storageService } from '../../services/storage';
import {
  GraduationCap,
  Award,
  BookOpen,
  CheckCircle2,
  Mail,
  Hash,
  Sparkles,
  Edit3,
  Camera,
  Save,
  Building2,
  Users,
  User,
  AlertCircle,
  Loader2,
  Lock,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';

interface SiswaProfileProps {
  currentStudent: Student;
  materiList: Materi[];
  onUpdateStudentProfile?: (updatedStudent: Student) => void;
}

export const SiswaProfile: React.FC<SiswaProfileProps> = ({
  currentStudent,
  materiList,
  onUpdateStudentProfile,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentStudent.name || '');
  const [avatar, setAvatar] = useState(currentStudent.avatar || '');
  const [gender, setGender] = useState<'Laki-laki' | 'Perempuan'>(currentStudent.gender || 'Laki-laki');
  const [schoolName, setSchoolName] = useState(currentStudent.schoolName || '');
  const [className, setClassName] = useState(currentStudent.className || '');
  const [rombelName, setRombelName] = useState(currentStudent.rombelName || '');
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Credentials reset states
  const [studentEmail, setStudentEmail] = useState(currentStudent.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [credMsg, setCredMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync state whenever currentStudent changes
  useEffect(() => {
    setName(currentStudent.name || '');
    setAvatar(currentStudent.avatar || '');
    setGender(currentStudent.gender || 'Laki-laki');
    setSchoolName(currentStudent.schoolName || '');
    setClassName(currentStudent.className || '');
    setRombelName(currentStudent.rombelName || '');
    setStudentEmail(currentStudent.email || '');
  }, [currentStudent]);

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setCredMsg(null);

    if (!studentEmail.trim()) {
      setCredMsg({ type: 'error', text: 'Email / Username tidak boleh kosong' });
      return;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        setCredMsg({ type: 'error', text: 'Password baru minimal 6 karakter' });
        return;
      }
      if (newPassword !== confirmPassword) {
        setCredMsg({ type: 'error', text: 'Konfirmasi password baru tidak cocok' });
        return;
      }
      const existingPw = (currentStudent.password || '123456').trim();
      if (currentPassword && currentPassword.trim() !== existingPw) {
        setCredMsg({ type: 'error', text: 'Kata sandi saat ini salah' });
        return;
      }
    }

    const nextPassword = newPassword ? newPassword.trim() : (currentStudent.password || '123456').trim();

    const updatedStudent: Student = {
      ...currentStudent,
      email: studentEmail.trim(),
      password: nextPassword,
    };

    // Ensure immediate sync to local storage & Firestore student credentials
    storageService.updateStudentCredentials(currentStudent.id, newPassword ? nextPassword : undefined, studentEmail.trim());

    if (onUpdateStudentProfile) {
      onUpdateStudentProfile(updatedStudent);
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setCredMsg({ type: 'success', text: 'Email / Username & Password berhasil diperbarui!' });
    setTimeout(() => setCredMsg(null), 3500);
  };

  const completedCount = currentStudent.completedMaterials?.length || 0;
  const totalMateri = materiList.length || 1;
  const progressPct = Math.round((completedCount / totalMateri) * 100);

  // Preset avatar choices
  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  ];

  // Handle avatar image file upload with Supabase CDN or high-efficiency compressed canvas data URL
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setMsg({ type: 'error', text: 'Ukuran foto maksimal 10MB' });
      return;
    }

    setIsUploading(true);
    setMsg(null);

    try {
      // 1. Attempt uploading directly to Supabase storage CDN
      const { publicUrl } = await uploadToSupabaseStorage(
        file,
        `student_${currentStudent.id}_${Date.now()}.jpg`,
        'avatars'
      );

      if (publicUrl && !publicUrl.startsWith('data:')) {
        setAvatar(publicUrl);
        setIsUploading(false);
        setMsg({ type: 'success', text: 'Foto profil berhasil diunggah ke cloud storage!' });
        setTimeout(() => setMsg(null), 3000);
        return;
      }
    } catch (err) {
      console.warn('Supabase storage upload bypassed, using high-compression canvas data URL:', err);
    }

    // 2. High-efficiency Canvas Compression Fallback (<=180px, Jpeg 0.70)
    const reader = new FileReader();
    reader.onload = (event) => {
      const rawUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 180;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round(height * (MAX_SIZE / width));
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round(width * (MAX_SIZE / height));
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.70);
          setAvatar(compressedDataUrl);
        } else {
          setAvatar(rawUrl);
        }
        setIsUploading(false);
        setMsg({ type: 'success', text: 'Foto profil dikompresi dan siap disimpan!' });
        setTimeout(() => setMsg(null), 3000);
      };

      img.onerror = () => {
        setAvatar(rawUrl);
        setIsUploading(false);
      };
      img.src = rawUrl;
    };

    reader.onerror = () => {
      setIsUploading(false);
      setMsg({ type: 'error', text: 'Gagal membaca berkas foto.' });
    };

    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setMsg({ type: 'error', text: 'Nama siswa tidak boleh kosong' });
      return;
    }

    const updated: Student = {
      ...currentStudent,
      name: name.trim(),
      avatar: avatar || currentStudent.avatar,
      gender,
      schoolName: schoolName.trim() || currentStudent.schoolName,
      className: className.trim() || currentStudent.className,
      rombelName: rombelName.trim() || currentStudent.rombelName,
    };

    if (onUpdateStudentProfile) {
      onUpdateStudentProfile(updated);
    }

    setIsEditing(false);
    setMsg({ type: 'success', text: 'Data profil & foto berhasil diperbarui dan tersimpan ke Firestore Cloud!' });
    setTimeout(() => setMsg(null), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Toast message */}
      {msg && (
        <div className={`p-4 rounded-xl border flex items-center gap-2 text-xs font-semibold shadow-xs ${
          msg.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' 
            : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
        }`}>
          {msg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="h-36 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 relative">
          <div className="absolute right-4 top-4 px-3 py-1 bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 rounded-full text-xs font-bold flex items-center gap-1.5 backdrop-blur-xs">
            <GraduationCap size={16} /> Siswa Terdaftar Digital
          </div>
        </div>

        <div className="px-4 sm:px-6 pb-6 relative pt-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-12 sm:-mt-14 mb-4 gap-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left w-full sm:w-auto">
              <div className="relative group shrink-0">
                <img
                  src={currentStudent.avatar}
                  alt={currentStudent.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white dark:border-slate-900 shadow-md bg-slate-100 dark:bg-slate-800"
                />
              </div>
              <div className="w-full sm:w-auto sm:pb-1">
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="break-words">{currentStudent.name}</span>
                  {currentStudent.gender && (
                    <span className={`text-xs px-2 py-0.5 rounded-md font-bold whitespace-nowrap ${
                      currentStudent.gender === 'Laki-laki'
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        : 'bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border border-pink-200 dark:border-pink-800'
                    }`}>
                      {currentStudent.gender === 'Laki-laki' ? '👨 Laki-laki (طَالِبٌ)' : '👩 Perempuan (طَالِبَةٌ)'}
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 break-words">
                  {currentStudent.schoolName || 'Tanpa Sekolah'} • {currentStudent.className} ({currentStudent.rombelName || 'Rombel General'})
                </p>
                
                {/* Arabic Title Badge with proper gender agreement (طَالِبٌ / طَالِبَةٌ) */}
                <div className="mt-2.5 flex items-center justify-center sm:justify-start">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 rounded-xl font-arabic font-bold text-xs sm:text-base leading-relaxed tracking-wide shadow-2xs">
                    {currentStudent.gender === 'Perempuan' ? '🎓 طَالِبَةُ اللُّغَةِ الْعَرَبِيَّةِ' : '🎓 طَالِبُ اللُّغَةِ الْعَرَبِيَّةِ'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
              <div className="px-3.5 py-2 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0">
                <Award size={18} className="text-amber-600 dark:text-amber-400" /> {currentStudent.totalXP} Poin XP
              </div>
              <button
                type="button"
                onClick={() => {
                  setName(currentStudent.name);
                  setAvatar(currentStudent.avatar);
                  setGender(currentStudent.gender || 'Laki-laki');
                  setSchoolName(currentStudent.schoolName || '');
                  setClassName(currentStudent.className || '');
                  setRombelName(currentStudent.rombelName || '');
                  setIsEditing(!isEditing);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
              >
                <Edit3 size={15} /> {isEditing ? 'Batal Edit' : 'Edit Profil'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 min-w-0">
              <Mail size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="min-w-0 truncate">
                <div className="text-[10px] text-slate-400 font-medium">Alamat Email</div>
                <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">{currentStudent.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 min-w-0">
              <Hash size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="min-w-0 truncate">
                <div className="text-[10px] text-slate-400 font-medium">NISN Siswa</div>
                <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">{currentStudent.nisn}</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 min-w-0">
              <Building2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="min-w-0 truncate">
                <div className="text-[10px] text-slate-400 font-medium">Asal Sekolah</div>
                <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">{currentStudent.schoolName || 'Tanpa Sekolah'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form Mode */}
      {isEditing && (
        <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-1">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <Edit3 size={16} className="text-emerald-600 dark:text-emerald-400" /> Edit Data Profil Siswa
            </h3>
            <span className="text-xs text-slate-400">Perbarui informasi diri & foto profil</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nama Lengkap */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Nama Lengkap Siswa <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name || ''}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl focus:border-emerald-500 font-medium"
                  placeholder="Masukkan nama lengkap"
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Jenis Kelamin
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGender('Laki-laki')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    gender === 'Laki-laki'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500/20'
                      : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  👨 Laki-laki (طَالِبٌ)
                </button>
                <button
                  type="button"
                  onClick={() => setGender('Perempuan')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    gender === 'Perempuan'
                      ? 'bg-pink-50 dark:bg-pink-950/60 border-pink-500 text-pink-800 dark:text-pink-300 ring-1 ring-pink-500/20'
                      : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  👩 Perempuan (طَالِبَةٌ)
                </button>
              </div>
            </div>

            {/* Asal Sekolah */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Asal Sekolah
              </label>
              <input
                type="text"
                value={schoolName || ''}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl focus:border-emerald-500 font-medium"
                placeholder="Contoh: MA Negeri 1 Jakarta"
              />
            </div>

            {/* Kelas & Rombel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Kelas
                </label>
                <input
                  type="text"
                  value={className || ''}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl focus:border-emerald-500 font-medium"
                  placeholder="Contoh: Kelas 10"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Rombel / Jurusan
                </label>
                <input
                  type="text"
                  value={rombelName || ''}
                  onChange={(e) => setRombelName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl focus:border-emerald-500 font-medium"
                  placeholder="Contoh: 10 Bahasa"
                />
              </div>
            </div>
          </div>

          {/* Foto Profil / Avatar Selection & File Upload */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              Foto Profil / Avatar
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-slate-50/50 dark:bg-slate-800/30 p-3.5 sm:p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              {/* Photo Preview Column */}
              <div className="sm:col-span-3 lg:col-span-2 flex flex-col items-center justify-center gap-1">
                <img
                  src={avatar || currentStudent.avatar}
                  alt="Preview Avatar"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-xs shrink-0"
                />
                <span className="text-[10px] font-semibold text-slate-400">Pratinjau Foto</span>
              </div>
              
              {/* Controls Column */}
              <div className="sm:col-span-9 lg:col-span-10 space-y-3 w-full">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <label className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-emerald-100 transition-colors shrink-0">
                    {isUploading ? (
                      <>
                        <Loader2 size={14} className="animate-spin text-emerald-600" />
                        <span>Mengompres Foto...</span>
                      </>
                    ) : (
                      <>
                        <Camera size={14} /> Unggah Foto Baru
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploading}
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-slate-400 text-center sm:text-left leading-tight">
                    Pilih berkas foto dari HP/Laptop (Otomatis Ditingkatkan & Disinkronkan)
                  </span>
                </div>

                {/* Preset Avatar Fast Selectors */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[11px] text-slate-400 font-medium shrink-0">Atau pilih avatar:</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {presetAvatars.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatar(url)}
                        className={`w-8 h-8 rounded-full overflow-hidden border-2 cursor-pointer transition-transform hover:scale-110 shrink-0 ${
                          avatar === url ? 'border-emerald-600 scale-110 shadow-xs ring-2 ring-emerald-500/20' : 'border-transparent opacity-70'
                        }`}
                      >
                        <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="w-full sm:w-auto px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer text-center"
            >
              Batal
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Save size={15} /> Simpan Perubahan Profil
            </button>
          </div>
        </form>
      )}

      {/* Badges / Achievements */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
          <Sparkles size={18} className="text-amber-500" /> Lencana Prestasi & Pencapaian
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-1">
            <div className="w-10 h-10 mx-auto rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
              📚
            </div>
            <p className="font-bold text-emerald-900 dark:text-emerald-300">Pembaca Tekun</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">{completedCount} Modul Selesai</p>
          </div>

          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 space-y-1">
            <div className="w-10 h-10 mx-auto rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-lg">
              🏆
            </div>
            <p className="font-bold text-amber-900 dark:text-amber-300">Juara Kuis</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">{currentStudent.attempts?.length || 0} Kuis Dikerjakan</p>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800 space-y-1">
            <div className="w-10 h-10 mx-auto rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-lg">
              ✨
            </div>
            <p className="font-bold text-purple-900 dark:text-purple-300">Master Qowaid</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Nilai Sempurna</p>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800 space-y-1">
            <div className="w-10 h-10 mx-auto rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
              🔥
            </div>
            <p className="font-bold text-blue-900 dark:text-blue-300">Streak 5 Hari</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Aktif Rutin</p>
          </div>
        </div>
      </div>

      {/* Detailed Activity & Session Log View */}
      <DetailedActivityLogView student={currentStudent} materiList={materiList} />

      {/* Student Account Credentials Settings Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-xl">
              <Key size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                Pengaturan Username & Password Akun
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Atur ulang username/email dan kata sandi akses masuk portal siswa
              </p>
            </div>
          </div>
        </div>

        {credMsg && (
          <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
            credMsg.type === 'success' 
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' 
              : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
          }`}>
            {credMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{credMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleSaveCredentials} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email / Username Siswa
              </label>
              <input
                type="email"
                required
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="nama@siswa.sch.id"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-emerald-500 font-bold"
              />
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Digunakan sebagai identitas otentikasi login portal.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password Saat Ini (Opsional)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3 pr-10 py-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password Baru
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Password Baru (Min. 6 Karakter)"
                  className="w-full pl-3 pr-10 py-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Konfirmasi Password Baru
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi Password Baru"
                  className="w-full pl-3 pr-10 py-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Lock size={14} className="text-amber-300" /> Simpan Username & Password
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};
