import React from 'react';
import { Shield, Mail, Phone, MapPin, Award, BookOpen, Users, CheckCircle } from 'lucide-react';

export const GuruProfile: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-emerald-800 to-slate-900 relative">
          <div className="absolute right-4 top-4 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold flex items-center gap-1.5">
            <Shield size={14} /> Pengajar & Administrator LMS
          </div>
        </div>

        <div className="px-6 pb-6 relative pt-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-16 mb-4 gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80"
                alt="Ust. Ahmad Dahlan"
                className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-md bg-slate-100"
              />
              <div>
                <h2 className="text-xl font-bold text-slate-900">Ust. Ahmad Dahlan, M.Pd.</h2>
                <p className="text-xs text-slate-500 font-medium">Pengampu Bahasa Arab & Kepala Kurikulum Digital</p>
                <div className="flex items-center gap-2 mt-1 justify-center sm:justify-start">
                  <span className="font-arabic text-base text-emerald-700 font-bold">مُدَرِّسُ اللُّغَةِ الْعَرَبِيَّةِ</span>
                </div>
              </div>
            </div>

            <div className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1">
              <CheckCircle size={14} /> Akun Terverifikasi
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-slate-400" />
              <span>ahmad.dahlan@sekolah.sch.id</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-slate-400" />
              <span>+62 812-3456-7890</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-slate-400" />
              <span>Gedung Utama / Ruang Guru Bahasa</span>
            </div>
          </div>
        </div>
      </div>

      {/* Teaching Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-semibold">Mata Pelajaran</span>
          <p className="text-base font-bold text-slate-800">Bahasa Arab & Qowaid</p>
          <p className="text-[11px] text-slate-400">Kelas X & XI Digital</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-semibold">Pengalaman Mengajar</span>
          <p className="text-base font-bold text-emerald-700">12 Tahun</p>
          <p className="text-[11px] text-slate-400">Pendidikan Bahasa Arab</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-semibold">Sertifikasi LMS</span>
          <p className="text-base font-bold text-purple-700">Master Teacher 2026</p>
          <p className="text-[11px] text-slate-400">Kemenag Digital Learning</p>
        </div>
      </div>

    </div>
  );
};
