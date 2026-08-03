import React, { useState, useEffect } from 'react';
import { Student } from '../../types';
import { duelService, DuelRoom } from '../../services/duelService';
import { DuelLobby } from './DuelLobby';
import { DuelMatch } from './DuelMatch';
import { DuelResult } from './DuelResult';
import { ArrowLeft, Swords } from 'lucide-react';

interface DuelViewProps {
  currentStudent: Student;
  students: Student[];
  onBackToLms: () => void;
  onSimulateExpGain: (amount: number, reason: string) => void;
}

export const DuelView: React.FC<DuelViewProps> = ({
  currentStudent,
  students,
  onBackToLms,
  onSimulateExpGain,
}) => {
  const [activeRoom, setActiveRoom] = useState<DuelRoom | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expAwarded, setExpAwarded] = useState(false);

  // Subscribe to real-time updates when an activeRoom exists
  useEffect(() => {
    if (!activeRoom) return;

    const unsubscribe = duelService.subscribeRoom(activeRoom.id, (updatedRoom) => {
      if (updatedRoom) {
        setActiveRoom(updatedRoom);

        // Award EXP automatically when game completes
        if (updatedRoom.status === 'finished' && !expAwarded) {
          const isWinner = updatedRoom.winnerStudentId === currentStudent.id;
          const expAmount = isWinner ? 100 : 25;
          const reason = isWinner
            ? `Menang Duel Mufrodat vs ${
                updatedRoom.hostPlayer.studentId === currentStudent.id
                  ? updatedRoom.challengerPlayer?.name || 'Lawan'
                  : updatedRoom.hostPlayer.name
              }`
            : 'Partisipasi Duel Mufrodat';

          onSimulateExpGain(expAmount, reason);
          setExpAwarded(true);
        }
      }
    });

    return () => unsubscribe();
  }, [activeRoom?.id, expAwarded, currentStudent.id]);

  // Create Room
  const handleCreateRoom = async (questionsCount: number, isPublic: boolean) => {
    setIsLoading(true);
    setErrorMessage(null);
    setExpAwarded(false);

    try {
      const newRoom = await duelService.createRoom(currentStudent, questionsCount, isPublic);
      setActiveRoom(newRoom);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal membuat room pertandingan.');
    } finally {
      setIsLoading(false);
    }
  };

  // Join Room
  const handleJoinRoom = async (codeOrId: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setExpAwarded(false);

    try {
      const room = await duelService.joinRoom(codeOrId, currentStudent);
      setActiveRoom(room);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal bergabung ke room.');
    } finally {
      setIsLoading(false);
    }
  };

  // Direct Challenge Student
  const handleChallengeStudent = async (targetStudent: Student) => {
    setIsLoading(true);
    setErrorMessage(null);
    setExpAwarded(false);

    try {
      const newRoom = await duelService.createRoom(currentStudent, 5, true);
      setActiveRoom(newRoom);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal membuat room tantangan.');
    } finally {
      setIsLoading(false);
    }
  };

  // Rematch Handler
  const handleRematch = async () => {
    if (!activeRoom) return;
    setIsLoading(true);
    setExpAwarded(false);

    try {
      await duelService.rematchRoom(activeRoom.id, activeRoom);
    } catch (e) {
      console.error('Error on rematch:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Leave Match
  const handleLeave = () => {
    setActiveRoom(null);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <button
          onClick={activeRoom ? handleLeave : onBackToLms}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} /> {activeRoom ? 'Keluar Pertandingan' : 'Kembali ke Dashboard LMS'}
        </button>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-white">
          <Swords size={16} className="text-amber-500" /> Mode Duel Kosakata
        </div>
      </div>

      {/* Error Alert Box */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 rounded-xl text-xs font-semibold flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-600 dark:text-rose-400 font-bold ml-2 underline cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Render Active Stage */}
      {!activeRoom ? (
        <DuelLobby
          currentStudent={currentStudent}
          students={students}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onChallengeStudent={handleChallengeStudent}
          isLoading={isLoading}
        />
      ) : activeRoom.status === 'finished' ? (
        <DuelResult
          room={activeRoom}
          currentStudent={currentStudent}
          onRematch={handleRematch}
          onLeave={handleLeave}
        />
      ) : (
        <DuelMatch
          room={activeRoom}
          currentStudent={currentStudent}
          onLeaveMatch={handleLeave}
        />
      )}

    </div>
  );
};
