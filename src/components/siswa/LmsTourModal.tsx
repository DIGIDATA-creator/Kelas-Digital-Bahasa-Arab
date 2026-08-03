import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Crown,
  Target,
  Swords,
  Bell,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  Award,
  Zap
} from 'lucide-react';

interface LmsTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName?: string;
}

interface TourStep {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  badge: string;
  badgeBg: string;
  highlights: string[];
  gradient: string;
}

export const LmsTourModal: React.FC<LmsTourModalProps> = ({
  isOpen,
  onClose,
  studentName = 'Siswa',
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps: TourStep[] = [
    {
      title: `Ahlan wa Sahlan, ${studentName}! 👋`,
      subtitle: 'Selamat Datang di LMS Kelas Digital Bahasa Arab',
      description: 'Mari kita telusuri fitur-fitur utama platform pembelajaran digital interaktif untuk memaksimalkan pengalaman belajar Anda!',
      icon: <Sparkles size={36} className="text-amber-400" />,
      badge: 'LMS Intro',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      highlights: [
        'Lacak XP, Level Santri, dan Daily Streak otomatis',
        'Tampilan modern, responsif, dan ramah pengguna',
        'Pusat aktivitas pembelajaran bahasa Arab terpadu'
      ],
      gradient: 'from-emerald-900 via-slate-900 to-teal-950',
    },
    {
      title: 'Modul & Materi Belajar Interaktif 📚',
      subtitle: 'Qawaid, Mufrodat Kosakata, Mahfudzot, & Hiwar',
      description: 'Akses seluruh materi pembelajaran lengkap dengan audio pelafalan native penutur Arab, mode flashcard interaktif, dan ekspor PDF.',
      icon: <BookOpen size={36} className="text-emerald-400" />,
      badge: 'Materi Pembelajaran',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      highlights: [
        'Dengarkan audio pengucapan kata & kalimat bahasa Arab',
        'Latihan ingatan mufrodat dengan mode Flashcard interaktif',
        'Unduh rangkuman materi berbentuk file PDF'
      ],
      gradient: 'from-emerald-950 via-teal-900 to-slate-900',
    },
    {
      title: 'Verifikasi Hafalan & Mahkota Emas 👑',
      subtitle: 'Setorkan Hafalan ke Ustadz / Ustadzah',
      description: 'Tandai hafalan secara mandiri atau setorkan langsung kepada Guru untuk mendapatkan verifikasi resmi dan badge Mahkota Emas!',
      icon: <Crown size={36} className="text-amber-300 fill-amber-400" />,
      badge: 'Hafalan & Verification',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      highlights: [
        'Tandai kosakata yang telah dihafal mandiri (0 XP)',
        'Dapatkan +5 XP per mufrodat saat verified oleh Guru',
        'Dapatkan badge Mahkota Emas 👑 untuk bab yang tuntas'
      ],
      gradient: 'from-slate-900 via-amber-950 to-slate-900',
    },
    {
      title: 'Latihan Soal & Evaluasi Kuis 🎯',
      subtitle: 'Uji Pemahaman Bahasa Arab Anda',
      description: 'Selesaikan kuis pilihan ganda, Isian Arab, dan Jodohkan Kata untuk menguji kemampuan serta mengumpulkan XP tambahan.',
      icon: <Target size={36} className="text-sky-400" />,
      badge: 'Kuis & Latihan',
      badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      highlights: [
        'Skor otomatis & analisis jawaban langsung',
        'Pembahasan lengkap setiap nomor soal',
        'Sistem peringkat (Leaderboard) kelas real-time'
      ],
      gradient: 'from-slate-900 via-sky-950 to-indigo-950',
    },
    {
      title: 'Mode Duel Mufrodat ⚔️',
      subtitle: 'Tantang Teman Sekelas Real-Time 1v1',
      description: 'Asah kecepatan mengingat kosakata bahasa Arab dalam pertarungan kuis interaktif seru dengan sistem nyawa dan kombo XP!',
      icon: <Swords size={36} className="text-rose-400" />,
      badge: 'Mode Duel 1v1',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      highlights: [
        'Pilih lawan tanding atau main lawan AI Bot',
        'Waktu menjawab terbatas & efek efek visual seru',
        'Raih gelar Juara Duel Mufrodat di kelas'
      ],
      gradient: 'from-slate-900 via-rose-950 to-purple-950',
    },
    {
      title: 'Pusat Notifikasi Real-time 🔔',
      subtitle: 'Selalu Update dengan Materi & Kuis Baru',
      description: 'Ikon lonceng notifikasi di bagian atas akan selalu memberi tahu Anda saat Guru merilis materi baru, kuis evaluasi, atau hasil verifikasi hafalan.',
      icon: <Bell size={36} className="text-amber-300" />,
      badge: 'Pemberitahuan Realtime',
      badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      highlights: [
        'Notifikasi materi & kuis baru dari Guru',
        'Tanda lonceng dengan indikator pesan belum dibaca',
        'Siap belajar bahasa Arab dengan menyenangkan!'
      ],
      gradient: 'from-purple-950 via-slate-900 to-emerald-950',
    }
  ];

  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-white">
        
        {/* Top Header Bar */}
        <div className={`p-6 sm:p-8 bg-gradient-to-br ${step.gradient} border-b border-slate-800 relative transition-all duration-300`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-900 rounded-full transition-all cursor-pointer"
            title="Tutup Panduan"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase border tracking-wider ${step.badgeBg}`}>
              {step.badge}
            </span>
            <span className="text-xs font-bold text-slate-400">
              Langkah {currentStep + 1} dari {steps.length}
            </span>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-slate-900/80 border border-slate-700/60 rounded-2xl shadow-lg shrink-0">
              {step.icon}
            </div>
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {step.title}
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-emerald-400">
                {step.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 bg-slate-900/90 text-slate-200">
          <p className="text-sm font-medium leading-relaxed text-slate-300">
            {step.description}
          </p>

          <div className="space-y-2.5 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Zap size={14} className="text-amber-400" />
              Keunggulan Fitur Ini:
            </h4>
            <div className="space-y-2">
              {step.highlights.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200 font-medium">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-6 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          {/* Step Dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${
                  i === currentStep
                    ? 'w-7 bg-emerald-400 shadow-sm'
                    : 'w-2.5 bg-slate-700 hover:bg-slate-600'
                }`}
                title={`Ke langkah ${i + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700"
              >
                <ChevronLeft size={16} />
                Kembali
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <span>{currentStep === steps.length - 1 ? 'Mulai Belajar 🚀' : 'Lanjut'}</span>
              {currentStep < steps.length - 1 && <ChevronRight size={16} />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
