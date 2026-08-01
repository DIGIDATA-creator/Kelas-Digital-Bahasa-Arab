import React, { useState } from 'react';
import { Student, Materi } from '../../types';
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
  AlertCircle
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

  // Handle avatar image file upload
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setMsg({ type: 'error', text: 'Ukuran foto maksimal 3MB' });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
    setMsg({ type: 'success', text: 'Data profil berhasil diperbarui!' });
    setTimeout(() => setMsg(null), 3000);
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

        <div className="px-6 pb-6 relative pt-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-16 mb-4 gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="relative group">
                <img
                  src={currentStudent.avatar}
                  alt={currentStudent.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white dark:border-slate-900 shadow-md bg-slate-100 dark:bg-slate-800"
                />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center justify-center sm:justify-start gap-2">
                  <span>{currentStudent.name}</span>
                  {currentStudent.gender && (
                    <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${
                      currentStudent.gender === 'Laki-laki'
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        : 'bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border border-pink-200 dark:border-pink-800'
                    }`}>
                      {currentStudent.gender === 'Laki-laki' ? '👨 Laki-laki' : '👩 Perempuan'}
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  {currentStudent.schoolName || 'Tanpa Sekolah'} • {currentStudent.className} ({currentStudent.rombelName || 'Rombel General'})
                </p>
                
                {/* Arabic Title Badge with proper spacing to prevent collisions */}
                <div className="mt-2.5 flex items-center justify-center sm:justify-start">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 rounded-xl font-arabic font-bold text-sm sm:text-base leading-relaxed tracking-wide shadow-2xs">
                    🎓 طَالِبُ اللُّغَةِ الْعَرَبِيَّةِ
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-3.5 py-2 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-xl text-xs font-bold flex items-center gap-1.5">
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
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Edit3 size={15} /> {isEditing ? 'Batal Edit' : 'Edit Profil'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <Mail size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 font-medium">Alamat Email</div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">{currentStudent.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <Hash size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 font-medium">NISN Siswa</div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">{currentStudent.nisn}</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <Building2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 font-medium">Asal Sekolah</div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">{currentStudent.schoolName || 'Tanpa Sekolah'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form Mode */}
      {isEditing && (
        <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
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
                  value={name}
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
                  👨 Laki-laki
                </button>
                <button
                  type="button"
                  onClick={() => setGender('Perempuan')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    gender === 'Perempuan'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500/20'
                      : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  👩 Perempuan
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
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl focus:border-emerald-500 font-medium"
                placeholder="Contoh: MA Negeri 1 Jakarta"
              />
            </div>

            {/* Kelas & Rombel */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Kelas
                </label>
                <input
                  type="text"
                  value={className}
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
                  value={rombelName}
                  onChange={(e) => setRombelName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl focus:border-emerald-500 font-medium"
                  placeholder="Contoh: 10 Bahasa"
                />
              </div>
            </div>
          </div>

          {/* Foto Profil / Avatar Selection & File Upload */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              Foto Profil / Avatar
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <img
                src={avatar || currentStudent.avatar}
                alt="Preview Avatar"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-xs shrink-0"
              />
              
              <div className="flex-grow space-y-2 w-full">
                <div className="flex items-center gap-2">
                  <label className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-emerald-100 transition-colors">
                    <Camera size={14} /> Unggah Foto Baru
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-slate-400">Pilih berkas foto dari HP/Laptop (Maks 3MB)</span>
                </div>

                {/* Preset Avatar Fast Selectors */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-400 font-medium">Atau pilih avatar:</span>
                  {presetAvatars.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatar(url)}
                      className={`w-7 h-7 rounded-full overflow-hidden border-2 cursor-pointer transition-transform hover:scale-110 ${
                        avatar === url ? 'border-emerald-600 scale-110 shadow-xs' : 'border-transparent opacity-70'
                      }`}
                    >
                      <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
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

    </div>
  );
};
