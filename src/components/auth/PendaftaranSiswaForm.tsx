import React, { useState } from 'react';
import { Student, TingkatType } from '../../types';
import { User, Mail, Lock, Building2, GraduationCap, Users, Sparkles, CheckCircle2 } from 'lucide-react';

interface PendaftaranSiswaFormProps {
  existingStudents: Student[];
  onRegisterSubmit: (studentData: {
    name: string;
    email: string;
    password?: string;
    tingkat: TingkatType;
    schoolName: string;
    className: string;
    rombelName: string;
  }) => void;
  isLoading?: boolean;
  isGuruAdminMode?: boolean; // If true, sets status to 'aktif' immediately
}

export const PendaftaranSiswaForm: React.FC<PendaftaranSiswaFormProps> = ({
  existingStudents,
  onRegisterSubmit,
  isLoading = false,
  isGuruAdminMode = false,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tingkat, setTingkat] = useState<TingkatType>('Dasar');
  const [schoolName, setSchoolName] = useState('');
  const [className, setClassName] = useState('Kelas 1');
  const [rombelName, setRombelName] = useState('');

  // Auto-prediction lists from existing student data
  const existingSchoolNames = Array.from(
    new Set(existingStudents.map(s => s.schoolName).filter((s): s is string => !!s && s.trim() !== ''))
  );

  const existingRombelNames = Array.from(
    new Set(existingStudents.map(s => s.rombelName || s.className).filter((r): r is string => !!r && r.trim() !== ''))
  );

  // Dynamic Grade Options based on selected Tingkat
  const getGradeOptions = (t: TingkatType): string[] => {
    switch (t) {
      case 'Dasar':
        return ['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'];
      case 'Menengah Pertama':
        return ['Kelas 7', 'Kelas 8', 'Kelas 9'];
      case 'Menengah Akhir':
        return ['Kelas 10', 'Kelas 11', 'Kelas 12'];
      case 'Umum':
      default:
        return ['Umum'];
    }
  };

  const handleTingkatChange = (newTingkat: TingkatType) => {
    setTingkat(newTingkat);
    const options = getGradeOptions(newTingkat);
    setClassName(options[0] || 'Umum');
    if (newTingkat === 'Umum') {
      setRombelName('Umum');
    } else {
      setRombelName('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || (!password && !isGuruAdminMode)) return;

    onRegisterSubmit({
      name: name.trim(),
      email: email.trim(),
      password,
      tingkat,
      schoolName: tingkat === 'Umum' ? (schoolName.trim() || 'Masyarakat Umum') : (schoolName.trim() || 'Tanpa Sekolah'),
      className,
      rombelName: rombelName.trim() || className,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
      {/* 1. Nama Lengkap */}
      <div>
        <label className="block font-bold text-slate-700 mb-1">
          Nama Lengkap <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <User size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Muhammad Fauzi"
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium"
          />
        </div>
      </div>

      {/* 2. Alamat Email */}
      <div>
        <label className="block font-bold text-slate-700 mb-1">
          Alamat Email <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <Mail size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="fauzi@siswa.belajar.id"
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium"
          />
        </div>
      </div>

      {/* 3. Password */}
      <div>
        <label className="block font-bold text-slate-700 mb-1">
          Kata Sandi (Password) <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <Lock size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="password"
            required={!isGuruAdminMode}
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimal 6 Karakter"
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium"
          />
        </div>
      </div>

      {/* 4. Tingkat */}
      <div>
        <label className="block font-bold text-slate-700 mb-1">
          Tingkat Pendidikan <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <GraduationCap size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <select
            value={tingkat}
            onChange={(e) => handleTingkatChange(e.target.value as TingkatType)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-emerald-500 font-bold text-slate-800"
          >
            <option value="Dasar">Dasar (SD/MI)</option>
            <option value="Menengah Pertama">Menengah Pertama (SMP/MTs)</option>
            <option value="Menengah Akhir">Menengah Akhir (SMA/MA/SMK)</option>
            <option value="Umum">Umum</option>
          </select>
        </div>
      </div>

      {/* 5. Sekolah (dengan Prediksi Autocomplete) */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block font-bold text-slate-700">
            Asal Sekolah {tingkat !== 'Umum' && <span className="text-rose-500">*</span>}
          </label>
          {tingkat === 'Umum' && (
            <span className="text-[10px] text-slate-400 font-normal">(Dapat dikosongkan untuk tingkat Umum)</span>
          )}
        </div>
        <div className="relative">
          <Building2 size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            required={tingkat !== 'Umum'}
            list="school-predictions"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            placeholder={tingkat === 'Umum' ? 'Kosongkan atau isi nama instansi / umum' : 'Ketik nama sekolah (misal: MA Negeri 1 Jakarta)'}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium"
          />
          <datalist id="school-predictions">
            {existingSchoolNames.map((s, idx) => (
              <option key={idx} value={s} />
            ))}
          </datalist>
        </div>
        {existingSchoolNames.length > 0 && (
          <p className="text-[10px] text-slate-400 mt-1">
            💡 Pilih atau ketik nama sekolah. Prediksi otomatis membantu menyamakan nama sekolah.
          </p>
        )}
      </div>

      {/* 6. Kelas & Rombel (dengan Prediksi) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block font-bold text-slate-700 mb-1">
            Kelas Utama <span className="text-rose-500">*</span>
          </label>
          <select
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-emerald-500 font-semibold text-emerald-800"
          >
            {getGradeOptions(tingkat).map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">
            Rombel / Sub-Kelas <span className="text-slate-400 font-normal">(opsional)</span>
          </label>
          <div className="relative">
            <input
              type="text"
              list="rombel-predictions"
              value={rombelName}
              onChange={(e) => setRombelName(e.target.value)}
              placeholder="Contoh: 8A, 9 Abu Bakar, 10 MIPA 1"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-emerald-500 font-medium"
            />
            <datalist id="rombel-predictions">
              {existingRombelNames.map((r, idx) => (
                <option key={idx} value={r} />
              ))}
            </datalist>
          </div>
        </div>
      </div>

      {/* Approval note */}
      {!isGuruAdminMode && (
        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
          <Sparkles size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Info Pendaftaran:</span> Setelah mendaftar, akun Anda akan masuk ke status <b>Menunggu ACC</b> dari Guru/Pengajar sebelum dikelompokkan dalam kelas.
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
      >
        {isLoading ? (
          'Memproses...'
        ) : isGuruAdminMode ? (
          <><CheckCircle2 size={16} /> Tambah & Langsung ACC Siswa</>
        ) : (
          <><User size={16} /> Kirim Pendaftaran Siswa Baru</>
        )}
      </button>
    </form>
  );
};
