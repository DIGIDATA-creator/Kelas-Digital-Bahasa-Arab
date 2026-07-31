import React from 'react';
import { Student, Materi } from '../../types';
import { GraduationCap, Award, BookOpen, CheckCircle2, Mail, Hash, Sparkles } from 'lucide-react';

interface SiswaProfileProps {
  currentStudent: Student;
  materiList: Materi[];
}

export const SiswaProfile: React.FC<SiswaProfileProps> = ({
  currentStudent,
  materiList,
}) => {
  const completedCount = currentStudent.completedMaterials.length;
  const totalMateri = materiList.length || 1;
  const progressPct = Math.round((completedCount / totalMateri) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 relative">
          <div className="absolute right-4 top-4 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold flex items-center gap-1.5">
            <GraduationCap size={16} /> Siswa Terdaftar Digital
          </div>
        </div>

        <div className="px-6 pb-6 relative pt-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-16 mb-4 gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <img
                src={currentStudent.avatar}
                alt={currentStudent.name}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-md bg-slate-100"
              />
              <div>
                <h2 className="text-xl font-bold text-slate-900">{currentStudent.name}</h2>
                <p className="text-xs text-slate-500 font-medium">{currentStudent.className} • NISN: {currentStudent.nisn}</p>
                <div className="flex items-center gap-2 mt-1 justify-center sm:justify-start">
                  <span className="font-arabic text-base text-emerald-700 font-bold">طَالِبُ اللُّغَةِ الْعَرَبِيَّةِ</span>
                </div>
              </div>
            </div>

            <div className="px-4 py-2 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
              <Award size={18} className="text-amber-600" /> {currentStudent.totalXP} Poin XP
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-slate-400" />
              <span>{currentStudent.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Hash size={16} className="text-slate-400" />
              <span>NISN: {currentStudent.nisn}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Badges / Achievements */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Sparkles size={18} className="text-amber-500" /> Lencana Prestasi & Pencapaian
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
            <div className="w-10 h-10 mx-auto rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
              📚
            </div>
            <p className="font-bold text-emerald-900">Pembaca Tekun</p>
            <p className="text-[10px] text-slate-500">{completedCount} Modul Selesai</p>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-1">
            <div className="w-10 h-10 mx-auto rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-lg">
              🏆
            </div>
            <p className="font-bold text-amber-900">Juara Kuis</p>
            <p className="text-[10px] text-slate-500">{currentStudent.attempts.length} Kuis Dikerjakan</p>
          </div>

          <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 space-y-1">
            <div className="w-10 h-10 mx-auto rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-lg">
              ✨
            </div>
            <p className="font-bold text-purple-900">Master Qowaid</p>
            <p className="text-[10px] text-slate-500">Nilai Sempurna</p>
          </div>

          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 space-y-1">
            <div className="w-10 h-10 mx-auto rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
              🔥
            </div>
            <p className="font-bold text-blue-900">Streak 5 Hari</p>
            <p className="text-[10px] text-slate-500">Aktif Rutin</p>
          </div>
        </div>
      </div>

    </div>
  );
};
