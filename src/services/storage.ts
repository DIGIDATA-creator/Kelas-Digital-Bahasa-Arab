import { Materi, Penilaian, Student, ActivityLog, Role, QuizAttempt, ForumPost, ForumReply } from '../types';
import { INITIAL_MATERI, INITIAL_PENILAIAN, INITIAL_STUDENTS, INITIAL_LOGS, INITIAL_FORUM_POSTS } from '../data/initialData';
import { db } from '../firebase/config';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';

export interface UserSession {
  role: Role;
  studentId?: string;
  userName: string;
  userEmail: string;
  avatar?: string;
  loggedInAt: string;
}

const KEYS = {
  MATERI: 'lms_arabic_materi',
  PENILAIAN: 'lms_arabic_penilaian',
  STUDENTS: 'lms_arabic_students',
  LOGS: 'lms_arabic_logs',
  FORUM: 'lms_arabic_forum',
  OFFLINE_MATERI_IDS: 'lms_arabic_offline_materi_ids',
  ROLE: 'lms_arabic_role',
  CURRENT_STUDENT_ID: 'lms_arabic_current_student_id',
  GURU_PROFILE: 'lms_guru_profile',
  GURU_CREDENTIALS: 'lms_guru_credentials',
  USER_SESSION: 'lms_user_session',
};

// Cache in memory for immediate sync reads
let cachedMateri: Materi[] = [];
let cachedPenilaian: Penilaian[] = [];
let cachedStudents: Student[] = [];
let cachedLogs: ActivityLog[] = [];
let cachedForum: ForumPost[] = [];

type SyncCallback = (data: {
  materiList: Materi[];
  penilaianList: Penilaian[];
  students: Student[];
  logs: ActivityLog[];
  forumPosts: ForumPost[];
}) => void;

let syncListeners: SyncCallback[] = [];

function notifyListeners() {
  const data = {
    materiList: cachedMateri,
    penilaianList: cachedPenilaian,
    students: cachedStudents,
    logs: cachedLogs,
    forumPosts: cachedForum,
  };
  syncListeners.forEach(cb => cb(data));
}

// Firestore collection documents
const docMateri = doc(db, 'app_collections', 'materi');
const docPenilaian = doc(db, 'app_collections', 'penilaian');
const docStudents = doc(db, 'app_collections', 'students');
const docLogs = doc(db, 'app_collections', 'logs');
const docForum = doc(db, 'app_collections', 'forum');
const docGuruProfile = doc(db, 'app_collections', 'guru_profile');

// Helper to strip undefined values before sending to Firestore
function sanitizeForFirestore<T>(data: T): T {
  if (data === undefined) return null as unknown as T;
  return JSON.parse(
    JSON.stringify(data, (_key, value) => (value === undefined ? null : value))
  );
}

// Helpers for LocalStorage fallback/cache
function saveLocal(key: string, data: any) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }
}

function getLocal<T>(key: string, fallback: T): T {
  const data = localStorage.getItem(key);
  if (!data) return fallback;
  try {
    return JSON.parse(data) as T;
  } catch {
    return fallback;
  }
}

const SYSTEM_SAMPLE_QUIZ_IDS = ['pen-1', 'pen-2', 'pen-3'];

// Cached Guru Profile & Credentials
let cachedGuruProfile = getLocal('lms_guru_profile', {
  name: 'Ust. Ahmad Dahlan, M.Pd.',
  title: 'Pengampu Bahasa Arab & Kepala Kurikulum Digital',
  email: 'ahmad.dahlan@sekolah.sch.id',
  phone: '+62 812-3456-7890',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
});

let cachedGuruCredentials = getLocal('lms_guru_credentials', {
  username: 'admin_guru',
  password: '',
});

// Initialize cached data from LocalStorage first
cachedMateri = getLocal(KEYS.MATERI, INITIAL_MATERI);
cachedPenilaian = getLocal(KEYS.PENILAIAN, INITIAL_PENILAIAN).filter(p => !SYSTEM_SAMPLE_QUIZ_IDS.includes(p.id));
cachedStudents = getLocal(KEYS.STUDENTS, INITIAL_STUDENTS);
cachedLogs = getLocal(KEYS.LOGS, INITIAL_LOGS);
cachedForum = getLocal(KEYS.FORUM, INITIAL_FORUM_POSTS);

export const storageService = {
  // Subscribe to real-time Firestore updates across all devices
  initFirestoreSync(onUpdate: SyncCallback) {
    syncListeners.push(onUpdate);

    // Provide immediate cached data
    onUpdate({
      materiList: cachedMateri,
      penilaianList: cachedPenilaian,
      students: cachedStudents,
      logs: cachedLogs,
      forumPosts: cachedForum,
    });

    // 1. Listen to Materi
    const unsubMateri = onSnapshot(docMateri, (docSnap) => {
      if (docSnap.exists() && docSnap.data().items) {
        cachedMateri = docSnap.data().items;
        saveLocal(KEYS.MATERI, cachedMateri);
        notifyListeners();
      } else {
        setDoc(docMateri, sanitizeForFirestore({ items: cachedMateri })).catch(console.error);
      }
    }, (err) => console.warn('Materi snapshot warning:', err));

    // 2. Listen to Penilaian
    const unsubPenilaian = onSnapshot(docPenilaian, (docSnap) => {
      if (docSnap.exists() && docSnap.data().items) {
        const rawItems = docSnap.data().items as Penilaian[];
        const filtered = rawItems.filter(p => !SYSTEM_SAMPLE_QUIZ_IDS.includes(p.id));
        cachedPenilaian = filtered;
        saveLocal(KEYS.PENILAIAN, cachedPenilaian);
        notifyListeners();

        // If database contained system sample quizzes, update database to remove them permanently
        if (rawItems.length !== filtered.length) {
          setDoc(docPenilaian, sanitizeForFirestore({ items: filtered })).catch(console.error);
        }
      } else {
        setDoc(docPenilaian, sanitizeForFirestore({ items: cachedPenilaian })).catch(console.error);
      }
    }, (err) => console.warn('Penilaian snapshot warning:', err));

    // 3. Listen to Students
    const unsubStudents = onSnapshot(docStudents, (docSnap) => {
      if (docSnap.exists() && docSnap.data().items) {
        cachedStudents = docSnap.data().items;
        saveLocal(KEYS.STUDENTS, cachedStudents);
        notifyListeners();
      } else {
        setDoc(docStudents, sanitizeForFirestore({ items: cachedStudents })).catch(console.error);
      }
    }, (err) => console.warn('Students snapshot warning:', err));

    // 4. Listen to Logs
    const unsubLogs = onSnapshot(docLogs, (docSnap) => {
      if (docSnap.exists() && docSnap.data().items) {
        cachedLogs = docSnap.data().items;
        saveLocal(KEYS.LOGS, cachedLogs);
        notifyListeners();
      } else {
        setDoc(docLogs, sanitizeForFirestore({ items: cachedLogs })).catch(console.error);
      }
    }, (err) => console.warn('Logs snapshot warning:', err));

    // 5. Listen to Forum Diskusi
    const unsubForum = onSnapshot(docForum, (docSnap) => {
      if (docSnap.exists() && docSnap.data().items) {
        cachedForum = docSnap.data().items;
        saveLocal(KEYS.FORUM, cachedForum);
        notifyListeners();
      } else {
        setDoc(docForum, sanitizeForFirestore({ items: cachedForum })).catch(console.error);
      }
    }, (err) => console.warn('Forum snapshot warning:', err));

    // 6. Listen to Guru Profile & Credentials
    const unsubGuruProfile = onSnapshot(docGuruProfile, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.profile) {
          cachedGuruProfile = data.profile;
          saveLocal('lms_guru_profile', data.profile);
        }
        if (data.credentials) {
          cachedGuruCredentials = data.credentials;
          saveLocal('lms_guru_credentials', data.credentials);
        }
        notifyListeners();
      } else {
        setDoc(docGuruProfile, sanitizeForFirestore({ profile: cachedGuruProfile, credentials: cachedGuruCredentials })).catch(console.error);
      }
    }, (err) => console.warn('Guru profile snapshot warning:', err));

    return () => {
      syncListeners = syncListeners.filter(cb => cb !== onUpdate);
      unsubMateri();
      unsubPenilaian();
      unsubStudents();
      unsubLogs();
      unsubForum();
      unsubGuruProfile();
    };
  },

  async fetchLatestGuruData() {
    try {
      const docSnap = await getDoc(docGuruProfile);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.profile) {
          cachedGuruProfile = { ...cachedGuruProfile, ...data.profile };
          saveLocal('lms_guru_profile', cachedGuruProfile);
        }
        if (data.credentials) {
          cachedGuruCredentials = { ...cachedGuruCredentials, ...data.credentials };
          saveLocal('lms_guru_credentials', cachedGuruCredentials);
        }
      }
    } catch (err) {
      console.warn('[AUTH DEBUG] Error fetching latest Guru data from Firestore:', err);
    }
    return { profile: cachedGuruProfile, credentials: cachedGuruCredentials };
  },

  async fetchLatestStudentsData() {
    try {
      const docSnap = await getDoc(docStudents);
      if (docSnap.exists() && docSnap.data().items) {
        cachedStudents = docSnap.data().items;
        saveLocal(KEYS.STUDENTS, cachedStudents);
      }
    } catch (err) {
      console.warn('[AUTH DEBUG] Error fetching latest Students data from Firestore:', err);
    }
    return cachedStudents;
  },

  async addStudent(newStudent: Student): Promise<{ success: boolean; student?: Student; message?: string }> {
    try {
      // Fetch latest student data directly from Firestore first
      const latestStudents = await this.fetchLatestStudentsData();

      // Check for duplicate email (case insensitive)
      const isDuplicate = latestStudents.some(
        s => s.email && s.email.toLowerCase().trim() === newStudent.email.toLowerCase().trim()
      );

      if (isDuplicate) {
        return {
          success: false,
          message: `Email "${newStudent.email}" sudah terdaftar. Silakan gunakan email lain atau masuk dengan akun Anda.`
        };
      }

      // Merge new student with latest list from Firestore
      const updatedList = [newStudent, ...latestStudents.filter(s => s.id !== newStudent.id)];

      cachedStudents = updatedList;
      saveLocal(KEYS.STUDENTS, updatedList);
      await setDoc(docStudents, sanitizeForFirestore({ items: updatedList }));

      notifyListeners();

      this.addLog({
        userName: newStudent.name,
        userRole: 'siswa',
        action: 'Pendaftaran Siswa Baru',
        details: `Mengirimkan berkas pendaftaran akun siswa (${newStudent.schoolName || 'Umum'} - ${newStudent.className || 'Umum'}) - Status: MENUNGGU ACC`,
      });

      return { success: true, student: newStudent };
    } catch (err: any) {
      console.error('Error in addStudent:', err);
      return {
        success: false,
        message: err.message || 'Gagal menyimpan pendaftaran ke server database.'
      };
    }
  },

  async syncAndSaveStudents(updater: (currentRemoteList: Student[]) => Student[]): Promise<Student[]> {
    try {
      const latestStudents = await this.fetchLatestStudentsData();
      const updatedList = updater(latestStudents);
      cachedStudents = updatedList;
      saveLocal(KEYS.STUDENTS, updatedList);
      await setDoc(docStudents, sanitizeForFirestore({ items: updatedList }));
      notifyListeners();
      return updatedList;
    } catch (err) {
      console.error('Error in syncAndSaveStudents:', err);
      this.saveStudents(cachedStudents);
      return cachedStudents;
    }
  },

  getGuruProfile() {
    return cachedGuruProfile;
  },
  getGuruCredentials() {
    return cachedGuruCredentials;
  },
  saveGuruProfile(profile: any) {
    cachedGuruProfile = { ...cachedGuruProfile, ...profile };
    saveLocal('lms_guru_profile', cachedGuruProfile);
    setDoc(docGuruProfile, sanitizeForFirestore({ profile: cachedGuruProfile, credentials: cachedGuruCredentials }), { merge: true }).catch(console.error);
    notifyListeners();
  },
  saveGuruCredentials(creds: any) {
    cachedGuruCredentials = { ...cachedGuruCredentials, ...creds };
    saveLocal('lms_guru_credentials', cachedGuruCredentials);
    setDoc(docGuruProfile, sanitizeForFirestore({ profile: cachedGuruProfile, credentials: cachedGuruCredentials }), { merge: true }).catch(console.error);
    notifyListeners();
  },

  getMateri(): Materi[] {
    return cachedMateri;
  },

  saveMateri(list: Materi[]): void {
    cachedMateri = list;
    saveLocal(KEYS.MATERI, list);
    setDoc(docMateri, sanitizeForFirestore({ items: list })).catch(err => console.error('Error syncing Materi to Firestore:', err));
    notifyListeners();
  },

  getPenilaian(): Penilaian[] {
    return cachedPenilaian;
  },

  savePenilaian(list: Penilaian[]): void {
    cachedPenilaian = list;
    saveLocal(KEYS.PENILAIAN, list);
    setDoc(docPenilaian, sanitizeForFirestore({ items: list })).catch(err => console.error('Error syncing Penilaian to Firestore:', err));
    notifyListeners();
  },

  getStudents(): Student[] {
    return cachedStudents;
  },

  checkAndUpdateStreak(studentId: string): { streakCount: number; bonusXP: number; isNewDay: boolean } {
    const students = this.getStudents();
    const student = students.find(s => s.id === studentId);
    if (!student) return { streakCount: 0, bonusXP: 0, isNewDay: false };

    const todayStr = new Date().toISOString().split('T')[0];
    const lastDateStr = student.lastStreakDate || '';

    if (lastDateStr === todayStr) {
      return { streakCount: student.streakCount || 1, bonusXP: 0, isNewDay: false };
    }

    let currentStreak = student.streakCount || 0;
    let bonusXP = 0;

    if (lastDateStr) {
      const lastDate = new Date(lastDateStr);
      const todayDate = new Date(todayStr);
      const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak += 1;
        bonusXP = 15 + Math.min(currentStreak * 2, 50);
      } else {
        currentStreak = 1;
        bonusXP = 10;
      }
    } else {
      currentStreak = 1;
      bonusXP = 10;
    }

    const updatedStudent: Student = {
      ...student,
      streakCount: currentStreak,
      lastStreakDate: todayStr,
      totalXP: (student.totalXP || 0) + bonusXP,
    };

    const updatedList = students.map(s => s.id === studentId ? updatedStudent : s);
    this.saveStudents(updatedList);

    return { streakCount: currentStreak, bonusXP, isNewDay: true };
  },

  saveStudents(list: Student[]): void {
    // Merge list with cachedStudents so newly registered students are never accidentally deleted by stale local state
    const existingIds = new Set(list.map(s => s.id));
    const merged = [...list];
    if (cachedStudents && Array.isArray(cachedStudents)) {
      for (const cached of cachedStudents) {
        if (!existingIds.has(cached.id)) {
          merged.push(cached);
          existingIds.add(cached.id);
        }
      }
    }
    cachedStudents = merged;
    saveLocal(KEYS.STUDENTS, merged);
    setDoc(docStudents, sanitizeForFirestore({ items: merged })).catch(err => console.error('Error syncing Students to Firestore:', err));

    // Also update cached forum posts authorAvatar and authorName if any student profile changed
    let forumUpdated = false;
    const updatedForum = cachedForum.map(post => {
      let postChanged = false;
      const authorStudent = list.find(s => s.id === post.authorId);
      let newAuthorAvatar = post.authorAvatar;
      let newAuthorName = post.authorName;

      if (authorStudent) {
        if (authorStudent.avatar && post.authorAvatar !== authorStudent.avatar) {
          newAuthorAvatar = authorStudent.avatar;
          postChanged = true;
        }
        if (authorStudent.name && post.authorName !== authorStudent.name) {
          newAuthorName = authorStudent.name;
          postChanged = true;
        }
      }

      const updatedReplies = post.replies.map(r => {
        const replyStudent = list.find(s => s.id === r.authorId);
        if (replyStudent) {
          let replyChanged = false;
          let rAvatar = r.authorAvatar;
          let rName = r.authorName;
          if (replyStudent.avatar && r.authorAvatar !== replyStudent.avatar) {
            rAvatar = replyStudent.avatar;
            replyChanged = true;
          }
          if (replyStudent.name && r.authorName !== replyStudent.name) {
            rName = replyStudent.name;
            replyChanged = true;
          }
          if (replyChanged) {
            postChanged = true;
            return { ...r, authorAvatar: rAvatar, authorName: rName };
          }
        }
        return r;
      });

      if (postChanged) {
        forumUpdated = true;
        return {
          ...post,
          authorAvatar: newAuthorAvatar,
          authorName: newAuthorName,
          replies: updatedReplies,
        };
      }
      return post;
    });

    if (forumUpdated) {
      cachedForum = updatedForum;
      saveLocal(KEYS.FORUM, updatedForum);
      setDoc(docForum, sanitizeForFirestore({ items: updatedForum })).catch(err => console.error('Error syncing updated Forum avatars to Firestore:', err));
    }

    notifyListeners();
  },

  getLogs(): ActivityLog[] {
    return cachedLogs;
  },

  addLog(log: Omit<ActivityLog, 'id' | 'timestamp'>): void {
    const newLog: ActivityLog = {
      ...log,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [newLog, ...cachedLogs].slice(0, 50);
    cachedLogs = updated;
    saveLocal(KEYS.LOGS, updated);
    setDoc(docLogs, sanitizeForFirestore({ items: updated })).catch(err => console.error('Error syncing Logs to Firestore:', err));
    notifyListeners();
  },

  // Forum Diskusi Methods
  getForumPosts(): ForumPost[] {
    return cachedForum;
  },

  saveForumPosts(list: ForumPost[]): void {
    cachedForum = list;
    saveLocal(KEYS.FORUM, list);
    setDoc(docForum, sanitizeForFirestore({ items: list })).catch(err => console.error('Error syncing Forum to Firestore:', err));
    notifyListeners();
  },

  addForumPost(post: Omit<ForumPost, 'id' | 'createdAt' | 'updatedAt' | 'replies' | 'likes' | 'likedBy'>): ForumPost {
    const newPost: ForumPost = {
      ...post,
      id: `forum-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      replies: [],
      likes: 0,
      likedBy: [],
      status: 'terbuka',
    };
    const updated = [newPost, ...cachedForum];
    this.saveForumPosts(updated);

    this.addLog({
      userName: post.authorName,
      userRole: post.authorRole,
      action: 'Posting Diskusi Baru',
      details: `Membuat diskusi: "${post.title.substring(0, 30)}..."`,
    });

    return newPost;
  },

  addForumReply(postId: string, reply: Omit<ForumReply, 'id' | 'createdAt' | 'likes' | 'likedBy'>): void {
    const posts = JSON.parse(JSON.stringify(cachedForum)) as ForumPost[];
    const post = posts.find(p => p.id === postId);
    if (post) {
      const newReply: ForumReply = {
        ...reply,
        id: `reply-${Date.now()}`,
        createdAt: new Date().toISOString(),
        likes: 0,
        likedBy: [],
        isVerifiedAnswer: reply.authorRole === 'guru',
      };
      post.replies.push(newReply);
      post.updatedAt = new Date().toISOString();
      if (reply.authorRole === 'guru') {
        post.status = 'terjawab';
      }
      this.saveForumPosts(posts);

      this.addLog({
        userName: reply.authorName,
        userRole: reply.authorRole,
        action: 'Menjawab Diskusi Forum',
        details: `Menjawab pada postingan "${post.title.substring(0, 25)}..."`,
      });
    }
  },

  toggleLikePost(postId: string, userId: string): void {
    const posts = JSON.parse(JSON.stringify(cachedForum)) as ForumPost[];
    const post = posts.find(p => p.id === postId);
    if (post) {
      post.likedBy = post.likedBy || [];
      const index = post.likedBy.indexOf(userId);
      if (index >= 0) {
        post.likedBy.splice(index, 1);
        post.likes = Math.max(0, (post.likes || 1) - 1);
      } else {
        post.likedBy.push(userId);
        post.likes = (post.likes || 0) + 1;
      }
      this.saveForumPosts(posts);
    }
  },

  togglePinPost(postId: string): void {
    const posts = JSON.parse(JSON.stringify(cachedForum)) as ForumPost[];
    const post = posts.find(p => p.id === postId);
    if (post) {
      post.isPinned = !post.isPinned;
      this.saveForumPosts(posts);
    }
  },

  toggleVerifiedReply(postId: string, replyId: string): void {
    const posts = JSON.parse(JSON.stringify(cachedForum)) as ForumPost[];
    const post = posts.find(p => p.id === postId);
    if (post) {
      const reply = post.replies.find(r => r.id === replyId);
      if (reply) {
        reply.isVerifiedAnswer = !reply.isVerifiedAnswer;
        this.saveForumPosts(posts);
      }
    }
  },

  deleteForumPost(postId: string): void {
    const updated = cachedForum.filter(p => p.id !== postId);
    this.saveForumPosts(updated);
  },

  // OFFLINE LOCALSTORAGE CACHING FOR HIWAR & QOWAID
  getOfflineCachedMateriIds(): string[] {
    return getLocal<string[]>(KEYS.OFFLINE_MATERI_IDS, []);
  },

  isMateriCachedOffline(materiId: string): boolean {
    const ids = this.getOfflineCachedMateriIds();
    return ids.includes(materiId);
  },

  cacheMaterialOffline(materi: Materi): void {
    const ids = this.getOfflineCachedMateriIds();
    if (!ids.includes(materi.id)) {
      ids.push(materi.id);
      saveLocal(KEYS.OFFLINE_MATERI_IDS, ids);
    }
    // Save full material text & dialogues into separate key for reliable offline retrieval
    saveLocal(`lms_offline_item_${materi.id}`, materi);
  },

  removeOfflineCache(materiId: string): void {
    const ids = this.getOfflineCachedMateriIds().filter(id => id !== materiId);
    saveLocal(KEYS.OFFLINE_MATERI_IDS, ids);
    localStorage.removeItem(`lms_offline_item_${materiId}`);
  },

  getOfflineCachedMateriList(): Materi[] {
    const ids = this.getOfflineCachedMateriIds();
    const result: Materi[] = [];
    ids.forEach(id => {
      const item = getLocal<Materi | null>(`lms_offline_item_${id}`, null);
      if (item) {
        result.push(item);
      } else {
        // Fallback from current materi list
        const found = cachedMateri.find(m => m.id === id);
        if (found) result.push(found);
      }
    });
    return result;
  },

  getUserSession(): UserSession | null {
    return getLocal<UserSession | null>(KEYS.USER_SESSION, null);
  },

  setUserSession(session: UserSession): void {
    saveLocal(KEYS.USER_SESSION, session);
    this.setRole(session.role);
    if (session.studentId) {
      this.setCurrentStudentId(session.studentId);
    }
  },

  clearUserSession(): void {
    localStorage.removeItem(KEYS.USER_SESSION);
  },

  getRole(): Role {
    return (localStorage.getItem(KEYS.ROLE) as Role) || 'siswa';
  },

  setRole(role: Role): void {
    localStorage.setItem(KEYS.ROLE, role);
  },

  getCurrentStudentId(): string {
    const students = this.getStudents();
    const saved = localStorage.getItem(KEYS.CURRENT_STUDENT_ID);
    if (saved && students.some(s => s.id === saved)) {
      return saved;
    }
    return students[0]?.id || 'std-1';
  },

  setCurrentStudentId(id: string): void {
    localStorage.setItem(KEYS.CURRENT_STUDENT_ID, id);
  },

  markMaterialComplete(studentId: string, materiId: string): void {
    const students = JSON.parse(JSON.stringify(this.getStudents())) as Student[];
    const student = students.find(s => s.id === studentId);
    if (student) {
      if (!student.completedMaterials.includes(materiId)) {
        student.completedMaterials.push(materiId);
        student.totalXP += 50;
        student.lastActive = new Date().toISOString();
        this.saveStudents(students);

        const materi = this.getMateri().find(m => m.id === materiId);
        this.addLog({
          userName: student.name,
          userRole: 'siswa',
          action: 'Selesai Membaca Materi',
          details: `Menyelesaikan materi: ${materi?.title || materiId} (+50 XP)`,
        });
      }
    }
  },

  updateMaterialReadingTime(studentId: string, materiId: string, elapsedSeconds: number): void {
    if (!studentId || !materiId || elapsedSeconds <= 0) return;
    const students = JSON.parse(JSON.stringify(this.getStudents())) as Student[];
    const student = students.find(s => s.id === studentId);
    if (student) {
      student.materialReadingTimeSeconds = student.materialReadingTimeSeconds || {};
      const currentSecs = student.materialReadingTimeSeconds[materiId] || 0;
      student.materialReadingTimeSeconds[materiId] = currentSecs + Math.round(elapsedSeconds);
      student.lastActive = new Date().toISOString();
      this.saveStudents(students);
    }
  },

  saveQuizAttempt(attempt: Omit<QuizAttempt, 'id' | 'completedAt'>): QuizAttempt {
    const students = JSON.parse(JSON.stringify(this.getStudents())) as Student[];
    const student = students.find(s => s.id === attempt.studentId);
    
    const newAttempt: QuizAttempt = {
      ...attempt,
      id: `att-${Date.now()}`,
      completedAt: new Date().toISOString(),
    };

    if (student) {
      student.attempts = student.attempts || [];
      student.attempts.push(newAttempt);

      const expChange = attempt.earnedExp !== undefined ? attempt.earnedExp : (attempt.passed ? attempt.score : 0);
      student.totalXP = Math.max(0, student.totalXP + expChange);

      student.lastActive = new Date().toISOString();
      this.saveStudents(students);

      this.addLog({
        userName: student.name,
        userRole: 'siswa',
        action: `Menyelesaikan ${attempt.penilaianType}`,
        details: `Meraih nilai ${attempt.score}/100 (${expChange >= 0 ? '+' : ''}${expChange} XP) pada ${attempt.penilaianTitle} (${attempt.passed ? 'Lulus' : 'Belum Lulus'})`,
      });
    }

    return newAttempt;
  },

  resetData(): void {
    cachedMateri = INITIAL_MATERI;
    cachedPenilaian = INITIAL_PENILAIAN;
    cachedStudents = INITIAL_STUDENTS;
    cachedLogs = INITIAL_LOGS;
    cachedForum = INITIAL_FORUM_POSTS;

    saveLocal(KEYS.MATERI, INITIAL_MATERI);
    saveLocal(KEYS.PENILAIAN, INITIAL_PENILAIAN);
    saveLocal(KEYS.STUDENTS, INITIAL_STUDENTS);
    saveLocal(KEYS.LOGS, INITIAL_LOGS);
    saveLocal(KEYS.FORUM, INITIAL_FORUM_POSTS);

    setDoc(docMateri, sanitizeForFirestore({ items: INITIAL_MATERI })).catch(console.error);
    setDoc(docPenilaian, sanitizeForFirestore({ items: INITIAL_PENILAIAN })).catch(console.error);
    setDoc(docStudents, sanitizeForFirestore({ items: INITIAL_STUDENTS })).catch(console.error);
    setDoc(docLogs, sanitizeForFirestore({ items: INITIAL_LOGS })).catch(console.error);
    setDoc(docForum, sanitizeForFirestore({ items: INITIAL_FORUM_POSTS })).catch(console.error);

    notifyListeners();
  }
};
