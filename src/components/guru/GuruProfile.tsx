import React, { useState, useEffect } from 'react';
import { Shield, Mail, Phone, Edit3, Lock, Check, Key, UserCheck, Camera, Save, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { db } from '../../firebase/config';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { uploadToSupabaseStorage } from '../../lib/supabase';
import { storageService } from '../../services/storage';

export const GuruProfile: React.FC = () => {
  // Profile State with LocalStorage & Firestore Sync
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('lms_guru_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name && !parsed.name.includes('Ahmad Dahlan')) {
          return parsed;
        }
      } catch (e) { /* fallback */ }
    }
    return {
      name: 'Ahmad Yusron',
      title: 'Pengampu Bahasa Arab & Admin Kurikulum Digital',
      email: 'ruangk106@gmail.com',
      phone: '+62 812-3456-7890',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    };
  });

  // Account & Credentials State with LocalStorage & Firestore Sync
  const [credentials, setCredentials] = useState<{
    username: string;
    password?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>(() => {
    const saved = localStorage.getItem('lms_guru_credentials');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.username && parsed.username !== 'admin_guru') {
          return {
            username: parsed.username,
            password: parsed.password || '@Cirebon1996',
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          };
        }
      } catch (e) { /* fallback */ }
    }
    return {
      username: 'Ahmad Yusron',
      password: '@Cirebon1996',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
  });

  // Modals / Edit mode states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    name: profile?.name || '',
    title: profile?.title || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    avatar: profile?.avatar || '',
  });

  useEffect(() => {
    setProfileFormData({
      name: profile?.name || '',
      title: profile?.title || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      avatar: profile?.avatar || '',
    });
  }, [profile]);

  const [credMsg, setCredMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Firestore sync for profile & credentials
  useEffect(() => {
    if (!db) {
      console.warn('⚠️ [GURU PROFILE] Firestore db is not available.');
      return;
    }
    try {
      const docGuruProfile = doc(db, 'app_collections', 'guru_profile');
      const unsub = onSnapshot(docGuruProfile, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.profile) {
            setProfile(data.profile);
            localStorage.setItem('lms_guru_profile', JSON.stringify(data.profile));
          }
          if (data.credentials) {
            setCredentials(prev => ({
              ...prev,
              username: data.credentials.username || prev.username,
              password: data.credentials.password || prev.password || '@Cirebon1996',
            }));
            localStorage.setItem('lms_guru_credentials', JSON.stringify({
              username: data.credentials.username,
              password: data.credentials.password || '@Cirebon1996',
            }));
          }
        } else {
          setDoc(docGuruProfile, {
            profile,
            credentials: {
              username: credentials.username,
              password: credentials.password || '@Cirebon1996',
            }
          }).catch(console.error);
        }
      }, (err) => console.warn('Guru profile snapshot error:', err));

      return () => unsub();
    } catch (err) {
      console.warn('⚠️ [GURU PROFILE] Failed to set up snapshot listener:', err);
    }
  }, []);

  // Save profile edits
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileFormData.name.trim()) {
      setProfileMsg({ type: 'error', text: 'Nama lengkap tidak boleh kosong' });
      return;
    }
    setProfile(profileFormData);
    storageService.saveGuruProfile(profileFormData);
    setIsEditingProfile(false);
    setProfileMsg({ type: 'success', text: 'Data profil berhasil diperbarui!' });
    setTimeout(() => setProfileMsg(null), 3000);
  };

  // Profile image file upload handler with canvas compression & Supabase upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { publicUrl } = await uploadToSupabaseStorage(
        file,
        `guru_avatar_${Date.now()}.jpg`,
        'avatars'
      );
      if (publicUrl && !publicUrl.startsWith('data:')) {
        setProfileFormData(prev => ({ ...prev, avatar: publicUrl }));
        return;
      }
    } catch (err) {
      console.warn('Supabase storage upload bypassed for guru profile:', err);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 200;
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
          setProfileFormData(prev => ({ ...prev, avatar: compressedDataUrl }));
        } else {
          setProfileFormData(prev => ({ ...prev, avatar: rawUrl }));
        }
      };
      img.onerror = () => setProfileFormData(prev => ({ ...prev, avatar: rawUrl }));
      img.src = rawUrl;
    };
    reader.readAsDataURL(file);
  };

  // Save username & password edits
  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setCredMsg(null);

    if (!credentials.username.trim()) {
      setCredMsg({ type: 'error', text: 'Username wajib diisi' });
      return;
    }

    if (credentials.newPassword) {
      if (credentials.newPassword.length < 6) {
        setCredMsg({ type: 'error', text: 'Password baru minimal 6 karakter' });
        return;
      }
      if (credentials.newPassword !== credentials.confirmPassword) {
        setCredMsg({ type: 'error', text: 'Konfirmasi password baru tidak cocok' });
        return;
      }
    }

    const activePassword = credentials.newPassword ? credentials.newPassword.trim() : (credentials.password || '@Cirebon1996');

    const updatedCreds = {
      username: credentials.username.trim(),
      password: activePassword,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };

    setCredentials(updatedCreds);

    const storageCreds: Record<string, string> = {
      username: credentials.username.trim(),
      password: activePassword,
    };
    if (credentials.newPassword) {
      storageCreds.newPassword = credentials.newPassword.trim();
    }

    storageService.saveGuruCredentials(storageCreds);
    setCredMsg({ type: 'success', text: 'Username dan Password berhasil diperbarui!' });
    setTimeout(() => setCredMsg(null), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Toast notifications */}
      {profileMsg && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold ${
          profileMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            {profileMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{profileMsg.text}</span>
          </div>
        </div>
      )}

      {/* Main Profile View Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-emerald-800 to-slate-900 relative">
          <div className="absolute right-4 top-4 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold flex items-center gap-1.5">
            <Shield size={14} /> Pengajar & Administrator LMS
          </div>
        </div>

        <div className="px-6 pb-6 relative pt-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-12 sm:-mt-14 mb-4 gap-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              <div className="relative group shrink-0">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-white dark:border-slate-900 shadow-md bg-slate-100 dark:bg-slate-800"
                />
              </div>
              <div className="sm:pb-1">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">{profile.name}</h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">{profile.title}</p>
                <div className="mt-2 flex items-center justify-center sm:justify-start">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 rounded-xl font-arabic font-bold text-sm sm:text-base leading-relaxed tracking-wide shadow-2xs">
                    ✨ مُدَرِّسُ اللُّغَةِ الْعَرَبِيَّةِ
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setProfileFormData({ ...profile });
                setIsEditingProfile(!isEditingProfile);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-700 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all"
            >
              <Edit3 size={16} /> {isEditingProfile ? 'Batal Edit' : 'Edit Profil'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t text-xs text-slate-600">
            <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <Mail size={16} className="text-emerald-600 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 font-medium">Alamat Email</div>
                <div className="font-semibold text-slate-800">{profile.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <Phone size={16} className="text-emerald-600 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 font-medium">Nomor Handphone / WA</div>
                <div className="font-semibold text-slate-800">{profile.phone}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Edit Profile (When Active) */}
      {isEditingProfile && (
        <form onSubmit={handleSaveProfile} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Edit3 size={16} className="text-emerald-600" /> Form Edit Informasi Profil
            </h3>
            <span className="text-xs text-slate-400">Ubah data profil pengajar</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap & Gelar</label>
              <input
                type="text"
                required
                value={profileFormData.name || ''}
                onChange={(e) => setProfileFormData({ ...profileFormData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Jabatan / Deskripsi Singkat</label>
              <input
                type="text"
                value={profileFormData.title || ''}
                onChange={(e) => setProfileFormData({ ...profileFormData, title: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Alamat Email</label>
              <input
                type="email"
                required
                value={profileFormData.email || ''}
                onChange={(e) => setProfileFormData({ ...profileFormData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nomor Handphone / WhatsApp</label>
              <input
                type="text"
                required
                value={profileFormData.phone || ''}
                onChange={(e) => setProfileFormData({ ...profileFormData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Foto Profil (URL Gambar / Upload)</label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={profileFormData.avatar || ''}
                  onChange={(e) => setProfileFormData({ ...profileFormData, avatar: e.target.value })}
                  placeholder="https://..."
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-emerald-500 font-mono text-xs"
                />
                <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer flex items-center gap-1.5 shrink-0 text-xs">
                  <Camera size={14} /> Upload Foto
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t">
            <button
              type="button"
              onClick={() => setIsEditingProfile(false)}
              className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Save size={14} /> Simpan Perubahan Profil
            </button>
          </div>
        </form>
      )}

      {/* Account & Security (Username & Password) Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 text-amber-700 rounded-xl border border-amber-200">
              <Key size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Pengaturan Username & Password Admin</h3>
              <p className="text-xs text-slate-500">Atur kredensial akses masuk portal Guru / Administrator</p>
            </div>
          </div>
        </div>

        {credMsg && (
          <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-medium ${
            credMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            {credMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{credMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleSaveCredentials} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Username Admin / Pengajar</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  placeholder="admin_guru"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-emerald-500 font-bold text-slate-800"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Username digunakan untuk otentikasi login admin.</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Password Saat Ini</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.currentPassword || ''}
                  onChange={(e) => setCredentials({ ...credentials, currentPassword: e.target.value })}
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
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Password Baru</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.newPassword || ''}
                  onChange={(e) => setCredentials({ ...credentials, newPassword: e.target.value })}
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
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Konfirmasi Password Baru</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.confirmPassword || ''}
                  onChange={(e) => setCredentials({ ...credentials, confirmPassword: e.target.value })}
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

          <div className="pt-3 border-t flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <Lock size={14} className="text-amber-400" /> Simpan Username & Password
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};
