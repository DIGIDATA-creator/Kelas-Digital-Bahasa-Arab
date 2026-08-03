import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Swords,
  Users,
  Plus,
  Key,
  Bot,
  Sparkles,
  ArrowRight,
  Shield,
  Trophy,
  Globe,
  RefreshCw,
  Search,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Student } from '../../types';
import { duelService, DuelRoom } from '../../services/duelService';

interface DuelLobbyProps {
  currentStudent: Student;
  students: Student[];
  onCreateRoom: (questionsCount: number, isPublic: boolean) => void;
  onJoinRoom: (codeOrId: string) => void;
  onChallengeStudent: (student: Student) => void;
  isLoading?: boolean;
}

export const DuelLobby: React.FC<DuelLobbyProps> = ({
  currentStudent,
  students,
  onCreateRoom,
  onJoinRoom,
  onChallengeStudent,
  isLoading = false,
}) => {
  const [inputCode, setInputCode] = useState('');
  const [selectedQuestionsCount, setSelectedQuestionsCount] = useState(5);
  const [isPublic, setIsPublic] = useState(true);
  const [publicRooms, setPublicRooms] = useState<DuelRoom[]>([]);
  const [isFetchingRooms, setIsFetchingRooms] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchWaitingRooms = async () => {
    setIsFetchingRooms(true);
    try {
      const rooms = await duelService.getPublicWaitingRooms();
      setPublicRooms(rooms);
    } catch (e) {
      console.warn('Failed to fetch public waiting rooms:', e);
    } finally {
      setIsFetchingRooms(false);
    }
  };

  useEffect(() => {
    fetchWaitingRooms();
    const interval = setInterval(fetchWaitingRooms, 5000);
    return () => clearInterval(interval);
  }, []);

  const availableStudents = students.filter(
    (s) => s.id !== currentStudent.id &&
    (s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     s.className?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-rose-600 to-purple-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden border border-amber-400/30">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 opacity-15 pointer-events-none">
          <Swords size={280} />
        </div>

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30 text-xs font-semibold uppercase tracking-wider">
            <Sparkles size={14} /> Mode Kuis Real-Time Firestore
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight flex items-center gap-3">
            <Swords className="text-amber-300 animate-pulse" size={32} />
            Mode Duel Kosakata ⚔️
          </h2>
          <p className="text-amber-100/90 text-sm sm:text-base leading-relaxed">
            Tantang teman sekelasmu dalam adu cepat & ketepatan kuis kosakata (mufrodat) Bahasa Arab secara <span className="font-bold underline decoration-amber-300">Real-Time</span>! Setiap jawaban benar menambah poin dan berhadiah <span className="text-amber-300 font-bold">+100 EXP</span>.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-xs font-medium border border-white/10">
              <Trophy size={14} className="text-amber-300" /> Winner: +100 EXP
            </div>
            <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-xs font-medium border border-white/10">
              <Shield size={14} className="text-emerald-300" /> Partisipasi: +25 EXP
            </div>
          </div>
        </div>
      </div>

      {/* Main Lobby Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Create Room & Join via Code */}
        <div className="space-y-6">
          
          {/* Create Room Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
                <Plus size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Buat Room Duel Baru</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Pilih jumlah soal dan terbitkan arena pertandingan</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Jumlah Soal Mufrodat:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[5, 10, 15].map((cnt) => (
                  <button
                    key={cnt}
                    onClick={() => setSelectedQuestionsCount(cnt)}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                      selectedQuestionsCount === cnt
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {cnt} Soal
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Globe size={14} /> Terbuka di Lobby Publik
                </span>
                <button
                  type="button"
                  onClick={() => setIsPublic(!isPublic)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    isPublic ? 'bg-amber-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      isPublic ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <button
                onClick={() => onCreateRoom(selectedQuestionsCount, isPublic)}
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Swords size={18} />
                {isLoading ? 'Mempersiapkan Arena...' : 'Mulai Buat Room Pertandingan'}
              </button>
            </div>
          </div>

          {/* Join via Code Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
                <Key size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Gabung dengan Kode Room</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Masukkan 4 digit kode unik yang dibagikan temanmu</p>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Contoh: 5921"
                maxLength={10}
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-center tracking-widest text-base focus:ring-2 focus:ring-purple-500 outline-none"
              />
              <button
                onClick={() => inputCode.trim() && onJoinRoom(inputCode.trim())}
                disabled={!inputCode.trim() || isLoading}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-bold text-sm rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                Masuk <ArrowRight size={16} />
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Public Waiting Rooms & Direct Challenges */}
        <div className="space-y-6">
          
          {/* Active Waiting Rooms */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="text-amber-500" size={20} />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Room Terbuka (Menunggu Lawan)</h3>
              </div>
              <button
                onClick={fetchWaitingRooms}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
                title="Refresh Daftar"
              >
                <RefreshCw size={16} className={isFetchingRooms ? 'animate-spin' : ''} />
              </button>
            </div>

            {publicRooms.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2 border border-dashed border-slate-200 dark:border-slate-700">
                <Users size={32} className="mx-auto text-slate-400" />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Belum ada room publik aktif saat ini. Buat room pertamamu di sebelah kiri!
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {publicRooms.map((rm) => (
                  <div
                    key={rm.id}
                    className="p-3.5 bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={rm.hostPlayer.avatar}
                        alt={rm.hostPlayer.name}
                        className="w-10 h-10 rounded-full object-cover border border-amber-400"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          {rm.hostPlayer.name}
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-mono">
                            #{rm.roomCode}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {rm.totalRounds} Soal Mufrodat • {rm.hostPlayer.className}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onJoinRoom(rm.id)}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      Tantang <Swords size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Student Roster for Direct Challenges */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="text-rose-500" size={20} /> Direct Challenge Siswa
              </h3>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Cari nama siswa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {availableStudents.slice(0, 5).map((std) => (
                <div
                  key={std.id}
                  className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={std.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={std.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-300 dark:border-slate-600"
                    />
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white">{std.name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">{std.className} • {std.totalXP} XP</div>
                    </div>
                  </div>

                  <button
                    onClick={() => onChallengeStudent(std)}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    Ajak Duel
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
