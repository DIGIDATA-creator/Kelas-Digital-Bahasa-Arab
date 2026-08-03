import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  limit,
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { generateDuelQuestions } from '../data/duelVocabulary';
import { Student } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface DuelQuestion {
  id: string;
  arabicWord: string;
  harakat: string;
  questionText: string;
  options: string[];
  correctIndex: number;
  category: string;
}

export interface PlayerAnswer {
  questionIndex: number;
  selectedOptionIndex: number;
  isCorrect: boolean;
  scoreGained: number;
  answeredAt: number; // timestamp in ms
}

export interface DuelPlayer {
  studentId: string;
  name: string;
  avatar: string;
  className: string;
  score: number;
  streak: number;
  currentQuestionIndex: number;
  answers: { [questionIndex: number]: PlayerAnswer };
  ready: boolean;
  isBot?: boolean;
}

export interface DuelRoom {
  id: string;
  roomCode: string;
  status: 'waiting' | 'starting' | 'playing' | 'finished';
  createdAt: string;
  hostPlayer: DuelPlayer;
  challengerPlayer: DuelPlayer | null;
  questions: DuelQuestion[];
  currentRound: number; // 0 to questions.length - 1
  totalRounds: number;
  roundStartTime?: number; // timestamp in ms when current round started
  winnerStudentId?: string | null; // studentId or "DRAW"
  isPublic: boolean;
}

export const duelService = {
  // Generate 4-digit numeric room code
  generateRoomCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  },

  // Create a new Duel Room in Firestore
  async createRoom(hostStudent: Student, totalQuestions = 5, isPublic = true): Promise<DuelRoom> {
    const roomId = `duel-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const roomCode = this.generateRoomCode();
    const path = `duels/${roomId}`;

    const hostPlayer: DuelPlayer = {
      studentId: hostStudent.id,
      name: hostStudent.name,
      avatar: hostStudent.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      className: hostStudent.className || 'Kelas 10',
      score: 0,
      streak: 0,
      currentQuestionIndex: 0,
      answers: {},
      ready: true,
    };

    const questions = generateDuelQuestions(totalQuestions);

    const roomData: DuelRoom = {
      id: roomId,
      roomCode,
      status: 'waiting',
      createdAt: new Date().toISOString(),
      hostPlayer,
      challengerPlayer: null,
      questions,
      currentRound: 0,
      totalRounds: totalQuestions,
      isPublic,
    };

    try {
      await setDoc(doc(db, 'duels', roomId), roomData);
      return roomData;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      throw error;
    }
  },

  // Join existing room by Room Code or Room ID
  async joinRoom(roomCodeOrId: string, challengerStudent: Student): Promise<DuelRoom> {
    const trimmed = roomCodeOrId.trim();
    let targetDocRef = doc(db, 'duels', trimmed);
    let path = `duels/${trimmed}`;

    try {
      let docSnap = await getDoc(targetDocRef);

      if (!docSnap.exists()) {
        // Query by roomCode
        const q = query(
          collection(db, 'duels'),
          where('roomCode', '==', trimmed),
          where('status', '==', 'waiting'),
          limit(1)
        );
        const querySnap = await getDocs(q);
        if (querySnap.empty) {
          throw new Error(`Room dengan kode "${trimmed}" tidak ditemukan atau pertandingan sudah dimulai.`);
        }
        docSnap = querySnap.docs[0];
        targetDocRef = docSnap.ref;
        path = targetDocRef.path;
      }

      const roomData = docSnap.data() as DuelRoom;

      if (roomData.status !== 'waiting') {
        throw new Error('Room sudah tidak menerima lawan baru.');
      }

      if (roomData.hostPlayer.studentId === challengerStudent.id) {
        return roomData; // Rejoining as host
      }

      const challengerPlayer: DuelPlayer = {
        studentId: challengerStudent.id,
        name: challengerStudent.name,
        avatar: challengerStudent.avatar || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
        className: challengerStudent.className || 'Kelas 10',
        score: 0,
        streak: 0,
        currentQuestionIndex: 0,
        answers: {},
        ready: true,
      };

      const updatedFields = {
        challengerPlayer,
        status: 'starting' as const,
        roundStartTime: Date.now(),
      };

      await updateDoc(targetDocRef, updatedFields);

      return {
        ...roomData,
        ...updatedFields,
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      throw error;
    }
  },

  // Add a Bot Opponent (for practicing alone / instant preview)
  async addBotOpponent(roomId: string, botName = 'Ustaz AI Bot'): Promise<void> {
    const path = `duels/${roomId}`;
    const botPlayer: DuelPlayer = {
      studentId: `bot-${Date.now()}`,
      name: botName,
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
      className: 'AI Virtuil',
      score: 0,
      streak: 0,
      currentQuestionIndex: 0,
      answers: {},
      ready: true,
      isBot: true,
    };

    try {
      await updateDoc(doc(db, 'duels', roomId), {
        challengerPlayer: botPlayer,
        status: 'starting',
        roundStartTime: Date.now(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  // Submit Answer for a Player
  async submitAnswer(
    roomId: string,
    isHost: boolean,
    questionIndex: number,
    optionIndex: number,
    isCorrect: boolean,
    timeTakenSeconds: number,
    currentRoom: DuelRoom
  ): Promise<void> {
    const path = `duels/${roomId}`;
    const targetPlayer = isHost ? currentRoom.hostPlayer : currentRoom.challengerPlayer;
    if (!targetPlayer) return;

    // Calculate score: 100 for correct + speed bonus (max 50 pts)
    const speedBonus = isCorrect ? Math.max(0, Math.floor((12 - timeTakenSeconds) * 4)) : 0;
    const streakBonus = isCorrect ? targetPlayer.streak * 10 : 0;
    const scoreGained = isCorrect ? 100 + speedBonus + streakBonus : 0;

    const answerObj: PlayerAnswer = {
      questionIndex,
      selectedOptionIndex: optionIndex,
      isCorrect,
      scoreGained,
      answeredAt: Date.now(),
    };

    const newScore = targetPlayer.score + scoreGained;
    const newStreak = isCorrect ? targetPlayer.streak + 1 : 0;
    const newAnswers = { ...targetPlayer.answers, [questionIndex]: answerObj };
    const nextQuestionIndex = questionIndex + 1;

    const updatedPlayer: DuelPlayer = {
      ...targetPlayer,
      score: newScore,
      streak: newStreak,
      currentQuestionIndex: nextQuestionIndex,
      answers: newAnswers,
    };

    const playerKey = isHost ? 'hostPlayer' : 'challengerPlayer';

    // Check if both players answered current question
    const otherPlayer = isHost ? currentRoom.challengerPlayer : currentRoom.hostPlayer;
    const otherPlayerAnswered = otherPlayer && otherPlayer.answers[questionIndex] !== undefined;

    let newRound = currentRoom.currentRound;
    let newStatus = currentRoom.status;
    let winnerId = currentRoom.winnerStudentId;

    if (otherPlayerAnswered || otherPlayer?.isBot) {
      if (currentRoom.currentRound < currentRoom.totalRounds - 1) {
        newRound = currentRoom.currentRound + 1;
      } else {
        // Game Finished - Determine winner
        newStatus = 'finished';
        const hostFinalScore = isHost ? newScore : currentRoom.hostPlayer.score;
        const challengerFinalScore = !isHost ? newScore : (currentRoom.challengerPlayer?.score || 0);

        if (hostFinalScore > challengerFinalScore) {
          winnerId = currentRoom.hostPlayer.studentId;
        } else if (challengerFinalScore > hostFinalScore) {
          winnerId = currentRoom.challengerPlayer?.studentId || null;
        } else {
          winnerId = 'DRAW';
        }
      }
    }

    try {
      await updateDoc(doc(db, 'duels', roomId), {
        [playerKey]: updatedPlayer,
        currentRound: newRound,
        status: newStatus,
        winnerId: winnerId || null,
        roundStartTime: Date.now(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  // Bot Auto Answer Logic
  simulateBotTurn(roomId: string, currentRoom: DuelRoom, questionIndex: number) {
    if (!currentRoom.challengerPlayer || !currentRoom.challengerPlayer.isBot) return;

    const question = currentRoom.questions[questionIndex];
    if (!question) return;

    // Simulate 2-4 seconds thinking delay
    const delayMs = 2000 + Math.random() * 2500;

    setTimeout(async () => {
      // 80% accuracy for Bot
      const isCorrect = Math.random() < 0.8;
      const optionIndex = isCorrect
        ? question.correctIndex
        : (question.correctIndex + 1) % question.options.length;

      try {
        await this.submitAnswer(roomId, false, questionIndex, optionIndex, isCorrect, 3, currentRoom);
      } catch (e) {
        console.warn('Bot turn execution error:', e);
      }
    }, delayMs);
  },

  // Listen to Duel Room in Real-Time via Firestore onSnapshot
  subscribeRoom(roomId: string, onUpdate: (room: DuelRoom | null) => void): () => void {
    const path = `duels/${roomId}`;
    return onSnapshot(
      doc(db, 'duels', roomId),
      (docSnap) => {
        if (docSnap.exists()) {
          onUpdate(docSnap.data() as DuelRoom);
        } else {
          onUpdate(null);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  },

  // Get active public waiting rooms
  async getPublicWaitingRooms(): Promise<DuelRoom[]> {
    const path = 'duels';
    try {
      const q = query(
        collection(db, 'duels'),
        where('status', '==', 'waiting'),
        where('isPublic', '==', true),
        limit(10)
      );
      const snap = await getDocs(q);
      return snap.docs.map(doc => doc.data() as DuelRoom);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  // Reset / Rematch Room
  async rematchRoom(roomId: string, currentRoom: DuelRoom): Promise<void> {
    const path = `duels/${roomId}`;
    const newQuestions = generateDuelQuestions(currentRoom.totalRounds);

    const resetHost: DuelPlayer = {
      ...currentRoom.hostPlayer,
      score: 0,
      streak: 0,
      currentQuestionIndex: 0,
      answers: {},
    };

    const resetChallenger: DuelPlayer | null = currentRoom.challengerPlayer
      ? {
          ...currentRoom.challengerPlayer,
          score: 0,
          streak: 0,
          currentQuestionIndex: 0,
          answers: {},
        }
      : null;

    try {
      await updateDoc(doc(db, 'duels', roomId), {
        status: resetChallenger ? 'playing' : 'waiting',
        currentRound: 0,
        hostPlayer: resetHost,
        challengerPlayer: resetChallenger,
        questions: newQuestions,
        winnerId: null,
        roundStartTime: Date.now(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },
};
