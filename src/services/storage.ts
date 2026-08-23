import { Materi, Penilaian, Student, StudentStatus, ActivityLog, Role, QuizAttempt, ForumPost, ForumReply, DetailedActivityLog } from '../types';
import { INITIAL_MATERI, INITIAL_PENILAIAN, INITIAL_STUDENTS, INITIAL_LOGS, INITIAL_FORUM_POSTS } from '../data/initialData';
import { db } from '../firebase/config';
import { doc, collection, onSnapshot, setDoc, getDoc, getDocs, getDocFromServer, deleteDoc } from 'firebase/firestore';
import { offlineCacheService } from './offlineCacheService';

// Helper function to merge materi lists across devices without data loss
function mergeMateriLists(...lists: Materi[][]): Materi[] {
  const map = new Map<string, Materi>();

  for (const list of lists) {
    if (!Array.isArray(list)) continue;
    for (const item of list) {
      if (!item || !item.id) continue;
      const existing = map.get(item.id);
      if (!existing) {
        map.set(item.id, { ...item });
      } else {
        const existingTime = existing.updatedAt ? new Date(existing.updatedAt).getTime() : 0;
        const itemTime = item.updatedAt ? new Date(item.updatedAt).getTime() : 0;
        if (itemTime >= existingTime) {
          map.set(item.id, { ...existing, ...item });
        } else {
          map.set(item.id, { ...item, ...existing });
        }
      }
    }
  }

  return Array.from(map.values());
}

// Helper function to merge student lists across devices without data loss or status regression
function mergeStudentLists(...lists: Student[][]): Student[] {
  const map = new Map<string, Student>();

  for (const list of lists) {
    if (!Array.isArray(list)) continue;
    for (const student of list) {
      if (!student || !student.id) continue;
      const key = student.id;
      const existing = map.get(key);

      if (!existing) {
        map.set(key, { ...student });
      } else {
        // Determine status precedence based on timestamps and definitive status
        const existingTime = existing.updatedAt
          ? new Date(existing.updatedAt).getTime()
          : (existing.registeredAt ? new Date(existing.registeredAt).getTime() : 0);
        const incomingTime = student.updatedAt
          ? new Date(student.updatedAt).getTime()
          : (student.registeredAt ? new Date(student.registeredAt).getTime() : 0);

        let finalStatus: StudentStatus = existing.status || 'pending';

        if (incomingTime > existingTime && student.status) {
          finalStatus = student.status;
        } else if (existingTime > incomingTime && existing.status) {
          finalStatus = existing.status;
        } else {
          // If timestamps are identical or absent:
          // A definitive non-pending status ('disetujui' | 'aktif' | 'ditolak' | 'nonaktif') takes precedence over 'pending'
          if (student.status && student.status !== 'pending') {
            finalStatus = student.status;
          } else if (existing.status && existing.status !== 'pending') {
            finalStatus = existing.status;
          } else {
            finalStatus = student.status || existing.status || 'pending';
          }
        }

        const newerObj = incomingTime >= existingTime ? student : existing;
        const olderObj = incomingTime >= existingTime ? existing : student;

        const merged: Student = {
          ...olderObj,
          ...newerObj,
          status: finalStatus,
          password: newerObj.password || olderObj.password || '123456',
          hafalanProgress: {
            ...olderObj.hafalanProgress,
            ...newerObj.hafalanProgress,
            kosakataIds: {
              ...(olderObj.hafalanProgress?.kosakataIds || {}),
              ...(newerObj.hafalanProgress?.kosakataIds || {}),
            },
            selfKosakataIds: {
              ...(olderObj.hafalanProgress?.selfKosakataIds || {}),
              ...(newerObj.hafalanProgress?.selfKosakataIds || {}),
            },
            selfMahfudzotIds: {
              ...(olderObj.hafalanProgress?.selfMahfudzotIds || {}),
              ...(newerObj.hafalanProgress?.selfMahfudzotIds || {}),
            },
            selfQowaidIds: {
              ...(olderObj.hafalanProgress?.selfQowaidIds || {}),
              ...(newerObj.hafalanProgress?.selfQowaidIds || {}),
            },
            selfHiwarIds: {
              ...(olderObj.hafalanProgress?.selfHiwarIds || {}),
              ...(newerObj.hafalanProgress?.selfHiwarIds || {}),
            },
            mahfudzotChecklist: {
              ...(olderObj.hafalanProgress?.mahfudzotChecklist || {}),
              ...(newerObj.hafalanProgress?.mahfudzotChecklist || {}),
            },
          },
          totalXP: Math.max(existing.totalXP || 0, student.totalXP || 0),
          completedMaterials: Array.from(new Set([...(existing.completedMaterials || []), ...(student.completedMaterials || [])])),
          attempts: [...(existing.attempts || []), ...(student.attempts || [])].filter(
            (att, index, self) => self.findIndex(a => a.id === att.id) === index
          ),
          registeredAt: olderObj.registeredAt || newerObj.registeredAt,
          updatedAt: newerObj.updatedAt || olderObj.updatedAt || new Date().toISOString(),
          lastActive: newerObj.lastActive || olderObj.lastActive || new Date().toISOString(),
        };
        map.set(key, merged);
      }
    }
  }

  return Array.from(map.values());
}

export interface UserSession {
  role: Role;
  studentId?: string;
  userName: string;
  userEmail: string;
  avatar?: string;
  loggedInAt: string;
  firebaseUid?: string;
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

// Firestore collection document getters (safe lazy getters)
const getDocMateri = () => db ? doc(db, 'app_collections', 'materi') : null;
const getDocPenilaian = () => db ? doc(db, 'app_collections', 'penilaian') : null;
const getDocStudents = () => db ? doc(db, 'app_collections', 'students') : null;
const getDocLogs = () => db ? doc(db, 'app_collections', 'logs') : null;
const getDocForum = () => db ? doc(db, 'app_collections', 'forum') : null;
const getDocGuruProfile = () => db ? doc(db, 'app_collections', 'guru_profile') : null;

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
  try {
    const data = localStorage.getItem(key);
    if (!data) return fallback;
    return JSON.parse(data) as T;
  } catch {
    return fallback;
  }
}

const SYSTEM_SAMPLE_QUIZ_IDS = ['pen-1', 'pen-2', 'pen-3'];

// Cached Guru Profile & Credentials (Default: Ahmad Yusron)
let cachedGuruProfile = getLocal('lms_guru_profile', {
  name: 'Ahmad Yusron',
  title: 'Pengampu Bahasa Arab & Admin Kurikulum Digital',
  email: 'ruangk106@gmail.com',
  phone: '+62 812-3456-7890',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
});

let cachedGuruCredentials = getLocal('lms_guru_credentials', {
  username: 'Ahmad Yusron',
  password: '@Cirebon1996',
});

// Auto-migrate legacy "Ust. Ahmad Dahlan" cache to "Ahmad Yusron"
if (!cachedGuruProfile.name || cachedGuruProfile.name.includes('Ahmad Dahlan') || cachedGuruProfile.email === 'ahmad.dahlan@sekolah.sch.id') {
  cachedGuruProfile = {
    name: 'Ahmad Yusron',
    title: 'Pengampu Bahasa Arab & Admin Kurikulum Digital',
    email: 'ruangk106@gmail.com',
    phone: '+62 812-3456-7890',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
  };
  saveLocal('lms_guru_profile', cachedGuruProfile);
}

if (!cachedGuruCredentials || !cachedGuruCredentials.username || !cachedGuruCredentials.password) {
  cachedGuruCredentials = {
    username: 'Ahmad Yusron',
    password: '@Cirebon1996',
  };
  saveLocal('lms_guru_credentials', cachedGuruCredentials);
}

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

    if (!db) {
      console.warn('⚠️ [STORAGE] Firestore db is not available. Sync running in local mode.');
      return () => {
        syncListeners = syncListeners.filter(cb => cb !== onUpdate);
      };
    }

    const unsubs: Array<() => void> = [];

    // 1. Listen to Materi
    try {
      const dMateri = getDocMateri();
      if (dMateri) {
        unsubs.push(onSnapshot(dMateri, (docSnap) => {
          if (docSnap.exists() && docSnap.data().items) {
            const remoteItems = docSnap.data().items as Materi[];
            cachedMateri = remoteItems;
            saveLocal(KEYS.MATERI, remoteItems);
            offlineCacheService.cacheAllMateriAndKosakata(remoteItems).catch(console.warn);
            notifyListeners();
          } else if (!docSnap.exists() && cachedMateri.length > 0) {
            setDoc(dMateri, sanitizeForFirestore({ items: cachedMateri })).catch(console.error);
          }
        }, (err) => console.warn('Materi snapshot warning:', err)));
      }
    } catch (err) {
      console.warn('Materi snapshot init warning:', err);
    }

    // 2. Listen to Penilaian
    try {
      const dPenilaian = getDocPenilaian();
      if (dPenilaian) {
        unsubs.push(onSnapshot(dPenilaian, (docSnap) => {
          if (docSnap.exists() && docSnap.data().items) {
            const rawItems = docSnap.data().items as Penilaian[];
            const filtered = rawItems.filter(p => !SYSTEM_SAMPLE_QUIZ_IDS.includes(p.id));
            cachedPenilaian = filtered;
            saveLocal(KEYS.PENILAIAN, cachedPenilaian);
            notifyListeners();

            if (rawItems.length !== filtered.length) {
              setDoc(dPenilaian, sanitizeForFirestore({ items: filtered })).catch(console.error);
            }
          } else {
            setDoc(dPenilaian, sanitizeForFirestore({ items: cachedPenilaian })).catch(console.error);
          }
        }, (err) => console.warn('Penilaian snapshot warning:', err)));
      }
    } catch (err) {
      console.warn('Penilaian snapshot init warning:', err);
    }

    // 3. (Legacy) Listen to Students master document was removed to prevent race conditions with students_records
    
    // 3b. Listen to individual student registration records collection
    try {
      if (db) {
        unsubs.push(onSnapshot(collection(db, 'students_records'), (snap) => {
          const colItems: Student[] = [];
          snap.forEach(d => {
            if (d.exists()) colItems.push(d.data() as Student);
          });
          if (colItems.length > 0 || snap.size === 0) {
            cachedStudents = colItems;
            saveLocal(KEYS.STUDENTS, colItems);
            notifyListeners();
          }
        }, (err) => console.warn('Students collection snapshot warning:', err)));
      }
    } catch (err) {
      console.warn('Students collection snapshot init warning:', err);
    }

    // 4. Listen to Logs
    try {
      const dLogs = getDocLogs();
      if (dLogs) {
        unsubs.push(onSnapshot(dLogs, (docSnap) => {
          if (docSnap.exists() && docSnap.data().items) {
            cachedLogs = docSnap.data().items;
            saveLocal(KEYS.LOGS, cachedLogs);
            notifyListeners();
          } else {
            setDoc(dLogs, sanitizeForFirestore({ items: cachedLogs })).catch(console.error);
          }
        }, (err) => console.warn('Logs snapshot warning:', err)));
      }
    } catch (err) {
      console.warn('Logs snapshot init warning:', err);
    }

    // 5. Listen to Forum Diskusi
    try {
      const dForum = getDocForum();
      if (dForum) {
        unsubs.push(onSnapshot(dForum, (docSnap) => {
          if (docSnap.exists() && docSnap.data().items) {
            cachedForum = docSnap.data().items;
            saveLocal(KEYS.FORUM, cachedForum);
            notifyListeners();
          } else {
            setDoc(dForum, sanitizeForFirestore({ items: cachedForum })).catch(console.error);
          }
        }, (err) => console.warn('Forum snapshot warning:', err)));
      }
    } catch (err) {
      console.warn('Forum snapshot init warning:', err);
    }

    // 6. Listen to Guru Profile & Credentials
    try {
      const dGuruProfile = getDocGuruProfile();
      if (dGuruProfile) {
        unsubs.push(onSnapshot(dGuruProfile, (docSnap) => {
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
            setDoc(dGuruProfile, sanitizeForFirestore({ profile: cachedGuruProfile, credentials: cachedGuruCredentials })).catch(console.error);
          }
        }, (err) => console.warn('Guru profile snapshot warning:', err)));
      }
    } catch (err) {
      console.warn('Guru profile snapshot init warning:', err);
    }

    return () => {
      syncListeners = syncListeners.filter(cb => cb !== onUpdate);
      unsubs.forEach(u => u());
    };
  },

  async fetchLatestGuruData() {
    if (!db) return { profile: cachedGuruProfile, credentials: cachedGuruCredentials };
    try {
      const dGuruProfile = getDocGuruProfile();
      if (dGuruProfile) {
        const docSnap = await getDoc(dGuruProfile);
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
      }
    } catch (err) {
      console.warn('[AUTH DEBUG] Error fetching latest Guru data from Firestore:', err);
    }
    return { profile: cachedGuruProfile, credentials: cachedGuruCredentials };
  },

  async fetchLatestStudentsData(): Promise<Student[]> {
    let indStudents: Student[] = [];

    if (db) {
      // 1. Fetch individual student records from Firestore
      try {
        const indSnap = await getDocs(collection(db, 'students_records'));
        indSnap.forEach((d) => {
          if (d.exists()) {
            indStudents.push(d.data() as Student);
          }
        });
      } catch (err) {
        console.warn('[FIRESTORE] Querying students_records warning:', err);
      }
    }

    if (indStudents.length > 0) {
      cachedStudents = indStudents;
      saveLocal(KEYS.STUDENTS, indStudents);
      const dStudents = getDocStudents();
      if (dStudents && db) {
        setDoc(dStudents, sanitizeForFirestore({ items: indStudents })).catch(console.error);
      }
      notifyListeners();
      return indStudents;
    }

    return cachedStudents;
  },

  async addStudent(newStudent: Student): Promise<{ success: boolean; student?: Student; message?: string }> {
    try {
      // 1. Use cached real-time student data
      const latestStudents = this.getStudents();
      const normalizedEmail = newStudent.email ? newStudent.email.toLowerCase().trim() : '';

      // Check for duplicate active email (only active or approved accounts block registration)
      const activeDuplicate = latestStudents.find(
        s => s.email && s.email.toLowerCase().trim() === normalizedEmail && (s.status === 'aktif' || s.status === 'disetujui')
      );

      if (activeDuplicate) {
        return {
          success: false,
          message: `Email "${newStudent.email}" sudah aktif terdaftar sebagai siswa (${activeDuplicate.name}). Silakan masuk langsung dengan akun Anda.`
        };
      }

      // If there were old records with this email (e.g. status was 'ditolak', 'nonaktif', or previous 'pending'), clean them up
      const oldRecords = latestStudents.filter(
        s => s.email && s.email.toLowerCase().trim() === normalizedEmail
      );

      if (db && oldRecords.length > 0) {
        oldRecords.forEach(oldS => {
          if (oldS && oldS.id && oldS.id !== newStudent.id) {
            deleteDoc(doc(db, 'students_records', oldS.id)).catch(console.error);
          }
        });
      }

      // Filter out old records with same email so the new registration replaces them cleanly without stale conflicts
      const cleanList = latestStudents.filter(
        s => !(s.email && s.email.toLowerCase().trim() === normalizedEmail)
      );

      const timestamp = new Date().toISOString();
      const studentToSave: Student = {
        ...newStudent,
        registeredAt: newStudent.registeredAt || timestamp,
        updatedAt: timestamp,
        lastActive: newStudent.lastActive || timestamp,
        status: newStudent.status || 'pending',
      };

      const updatedList = [studentToSave, ...cleanList];
      cachedStudents = updatedList;
      saveLocal(KEYS.STUDENTS, updatedList);
      notifyListeners();

      // 3. Sync to Firestore in background with timeout protection
      if (db) {
        const studentDocRef = doc(db, 'students_records', studentToSave.id);
        const syncDocRecord = setDoc(studentDocRef, sanitizeForFirestore(studentToSave)).catch(err => console.error('Error syncing student_record:', err));
        const dStudents = getDocStudents();
        const syncDocMaster = dStudents ? setDoc(dStudents, sanitizeForFirestore({ items: updatedList })).catch(err => console.error('Error syncing docStudents:', err)) : Promise.resolve();

        // Wait up to 2 seconds for cloud sync, proceed anyway if network is slow/offline
        await Promise.race([
          Promise.all([syncDocRecord, syncDocMaster]),
          new Promise(resolve => setTimeout(resolve, 2000))
        ]);
      }

      this.addLog({
        userName: studentToSave.name,
        userRole: 'siswa',
        action: 'Pendaftaran Siswa Baru',
        details: `Mengirimkan berkas pendaftaran akun siswa (${studentToSave.schoolName || 'Umum'} - ${studentToSave.className || 'Umum'}) - Status: MENUNGGU ACC`,
      });

      return { success: true, student: studentToSave };
    } catch (err: any) {
      console.error('Error in addStudent:', err);
      return {
        success: false,
        message: err.message || 'Gagal menyimpan pendaftaran ke server database.'
      };
    }
  },

  async bulkAddStudents(newStudents: Student[]): Promise<{ success: boolean; count: number; updatedList: Student[] }> {
    try {
      const timestamp = new Date().toISOString();
      const currentStudents = this.getStudents();
      const existingEmailSet = new Set(currentStudents.map(s => s.email?.toLowerCase().trim()));

      const validNew: Student[] = [];
      newStudents.forEach(s => {
        const email = s.email?.toLowerCase().trim();
        if (email && !existingEmailSet.has(email)) {
          existingEmailSet.add(email);
          validNew.push({
            ...s,
            registeredAt: s.registeredAt || timestamp,
            updatedAt: timestamp,
            lastActive: timestamp,
          });
        }
      });

      if (validNew.length === 0) {
        return { success: true, count: 0, updatedList: currentStudents };
      }

      const updatedList = [...validNew, ...currentStudents];
      this.saveStudents(updatedList);

      this.addLog({
        userName: 'Guru Admin',
        userRole: 'guru',
        action: 'Import Massal Siswa Excel',
        details: `Berhasil mengimpor ${validNew.length} akun siswa baru dari file Excel/Spreadsheet.`,
      });

      return { success: true, count: validNew.length, updatedList };
    } catch (err: any) {
      console.error('Error in bulkAddStudents:', err);
      return { success: false, count: 0, updatedList: this.getStudents() };
    }
  },

  async setStudentStatus(studentId: string, newStatus: StudentStatus): Promise<Student[]> {
    const timestamp = new Date().toISOString();
    const currentStudents = this.getStudents();
    const updated = currentStudents.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          status: newStatus,
          updatedAt: timestamp,
        };
      }
      return s;
    });

    this.saveStudents(updated);

    const target = updated.find(s => s.id === studentId);
    if (target) {
      this.addLog({
        userName: 'Guru Admin',
        userRole: 'guru',
        action: 'Perubahan Status Akun Siswa',
        details: `Mengubah status akun siswa ${target.name} (${target.email}) menjadi "${newStatus.toUpperCase()}".`,
      });
    }

    return updated;
  },

  async bulkSetStudentStatus(studentIds: string[], newStatus: StudentStatus): Promise<Student[]> {
    const timestamp = new Date().toISOString();
    const idSet = new Set(studentIds);
    const currentStudents = this.getStudents();
    const updated = currentStudents.map(s => {
      if (idSet.has(s.id)) {
        return {
          ...s,
          status: newStatus,
          updatedAt: timestamp,
        };
      }
      return s;
    });

    this.saveStudents(updated);

    this.addLog({
      userName: 'Guru Admin',
      userRole: 'guru',
      action: 'Aksi Massal Status Siswa',
      details: `Mengubah status ${studentIds.length} akun siswa menjadi "${newStatus.toUpperCase()}".`,
    });

    return updated;
  },

  async approveAllPendingStudents(): Promise<Student[]> {
    const timestamp = new Date().toISOString();
    const currentStudents = this.getStudents();
    let approvedCount = 0;
    const updated = currentStudents.map(s => {
      if (s.status === 'pending') {
        approvedCount++;
        return {
          ...s,
          status: 'disetujui' as StudentStatus,
          updatedAt: timestamp,
        };
      }
      return s;
    });

    this.saveStudents(updated);

    if (approvedCount > 0) {
      this.addLog({
        userName: 'Guru Admin',
        userRole: 'guru',
        action: 'ACC Seluruh Pendaftaran Siswa',
        details: `Menyetujui (ACC) ${approvedCount} berkas pendaftaran akun siswa baru sekaligus.`,
      });
    }

    return updated;
  },

  async syncAndSaveStudents(updater: (currentRemoteList: Student[]) => Student[]): Promise<Student[]> {
    try {
      const latestStudents = this.getStudents();
      const updatedList = updater(latestStudents);
      const previousStudents = [...cachedStudents];
      cachedStudents = updatedList;
      saveLocal(KEYS.STUDENTS, updatedList);
      
      const dStudents = getDocStudents();
      if (dStudents) {
        await setDoc(dStudents, sanitizeForFirestore({ items: updatedList }));
      }

      // Also persist individual student updates to students_records collection
      if (db) {
        const newIds = new Set(updatedList.map(s => s.id));
        previousStudents.forEach(oldS => {
          if (oldS && oldS.id && !newIds.has(oldS.id)) {
            deleteDoc(doc(db, 'students_records', oldS.id)).catch(console.error);
          }
        });

        updatedList.forEach(s => {
          if (s && s.id) {
            setDoc(doc(db, 'students_records', s.id), sanitizeForFirestore(s), { merge: true }).catch(console.error);
          }
        });
      }

      notifyListeners();
      return updatedList;
    } catch (err) {
      console.error('Error in syncAndSaveStudents:', err);
      this.saveStudents(cachedStudents);
      return cachedStudents;
    }
  },

  async deleteStudent(studentId: string): Promise<Student[]> {
    const targetStudent = cachedStudents.find(s => s.id === studentId);
    const updated = cachedStudents.filter(s => s.id !== studentId);
    this.saveStudents(updated);
    if (db) {
      try {
        await deleteDoc(doc(db, 'students_records', studentId));
      } catch (err) {
        console.warn('Error deleting student document from Firestore:', err);
      }
    }
    if (targetStudent) {
      this.addLog({
        userName: 'Guru Admin',
        userRole: 'guru',
        action: 'Hapus Data Siswa',
        details: `Menghapus akun siswa (${targetStudent.name} - ${targetStudent.email}) dan membebaskan email untuk pendaftaran ulang.`,
      });
    }
    notifyListeners();
    return updated;
  },

  async bulkDeleteStudents(studentIds: string[]): Promise<Student[]> {
    if (!studentIds || studentIds.length === 0) return cachedStudents;

    const idsToDelete = new Set(studentIds);
    const targetStudents = cachedStudents.filter(s => idsToDelete.has(s.id));
    const updated = cachedStudents.filter(s => !idsToDelete.has(s.id));

    this.saveStudents(updated);

    if (db) {
      const deletePromises = studentIds.map(id =>
        deleteDoc(doc(db, 'students_records', id)).catch(err => {
          console.warn(`[STORAGE] Error deleting doc for student ${id}:`, err);
        })
      );
      await Promise.all(deletePromises);
    }

    const names = targetStudents.map(s => s.name).slice(0, 5).join(', ');
    const extraCount = targetStudents.length > 5 ? ` dan ${targetStudents.length - 5} siswa lainnya` : '';
    this.addLog({
      userName: 'Guru Admin',
      userRole: 'guru',
      action: 'Hapus Massal Siswa',
      details: `Menghapus massal ${targetStudents.length} data akun siswa (${names}${extraCount}) dan membebaskan email untuk pendaftaran ulang.`,
    });

    notifyListeners();
    return updated;
  },

  /**
   * Utility to force clean/remove student records by email or ID, releasing the email so it can be reused for new registration attempts.
   */
  async forceCleanStudentEmail(emailOrStudentId: string): Promise<{ success: boolean; removedCount: number; studentNames: string[] }> {
    const target = emailOrStudentId.toLowerCase().trim();
    const studentsToRemove = cachedStudents.filter(
      s => s.id === emailOrStudentId || (s.email && s.email.toLowerCase().trim() === target)
    );

    if (studentsToRemove.length === 0) {
      return { success: true, removedCount: 0, studentNames: [] };
    }

    const removedIds = new Set(studentsToRemove.map(s => s.id));
    const studentNames = studentsToRemove.map(s => s.name);

    // Filter out removed students from local cache & Firestore master list
    const updated = cachedStudents.filter(s => !removedIds.has(s.id));
    this.saveStudents(updated);

    // Explicitly delete each individual student document from students_records collection
    if (db) {
      for (const std of studentsToRemove) {
        try {
          await deleteDoc(doc(db, 'students_records', std.id));
        } catch (err) {
          console.warn(`[STORAGE] Error deleting doc for student ${std.id}:`, err);
        }
      }
    }

    this.addLog({
      userName: 'Guru Admin',
      userRole: 'guru',
      action: 'Pembersihan Akun Siswa (Force Clean)',
      details: `Menghapus dan membebaskan email akun (${studentNames.join(', ')}) agar dapat digunakan kembali untuk pendaftaran.`,
    });

    notifyListeners();
    return { success: true, removedCount: studentsToRemove.length, studentNames };
  },

  /**
   * Utility to clean all rejected or inactive accounts at once and release their emails.
   */
  async cleanRejectedOrInactiveStudents(statusType: 'ditolak' | 'nonaktif' | 'all'): Promise<{ success: boolean; count: number }> {
    const targets = cachedStudents.filter(s => {
      if (statusType === 'all') return s.status === 'ditolak' || s.status === 'nonaktif';
      return s.status === statusType;
    });

    if (targets.length === 0) return { success: true, count: 0 };

    const targetIds = new Set(targets.map(t => t.id));
    const updated = cachedStudents.filter(s => !targetIds.has(s.id));
    this.saveStudents(updated);

    if (db) {
      for (const std of targets) {
        try {
          await deleteDoc(doc(db, 'students_records', std.id));
        } catch (err) {
          console.warn(`[STORAGE] Error cleaning doc for student ${std.id}:`, err);
        }
      }
    }

    notifyListeners();
    return { success: true, count: targets.length };
  },

  /**
   * Directly updates a student's credentials (password, email, or username) from the admin panel.
   */
  async updateStudentCredentials(
    studentId: string,
    newPassword?: string,
    newEmail?: string,
    newUsername?: string
  ): Promise<{ success: boolean; student?: Student; message?: string }> {
    const freshStudents = this.getStudents();
    const targetStudent = freshStudents.find(s => s.id === studentId);
    if (!targetStudent) {
      return { success: false, message: 'Data siswa tidak ditemukan.' };
    }

    const updatedStudent: Student = {
      ...targetStudent,
      password: newPassword !== undefined && newPassword.trim() ? newPassword.trim() : (targetStudent.password || '123456'),
      email: newEmail !== undefined && newEmail.trim() ? newEmail.trim().toLowerCase() : targetStudent.email,
      ...(newUsername ? { username: newUsername.trim() } : {}),
    };

    const updatedList = freshStudents.map(s => s.id === studentId ? updatedStudent : s);
    this.saveStudents(updatedList);

    if (db) {
      try {
        await setDoc(doc(db, 'students_records', studentId), sanitizeForFirestore(updatedStudent), { merge: true });
      } catch (err) {
        console.warn('[STORAGE] Error updating student credentials doc in Firestore:', err);
      }
    }

    this.addLog({
      userName: 'Guru Admin',
      userRole: 'guru',
      action: 'Akses & Ubah Password Siswa',
      details: `Admin memperbarui kredensial/kata sandi akun siswa (${targetStudent.name} - ${targetStudent.email}) menjadi "${updatedStudent.password}".`,
    });

    notifyListeners();
    return { success: true, student: updatedStudent };
  },

  getGuruProfile() {
    const local = getLocal('lms_guru_profile', null);
    if (local && local.name) {
      cachedGuruProfile = { ...cachedGuruProfile, ...local };
    }
    return cachedGuruProfile;
  },
  getGuruCredentials() {
    const local = getLocal('lms_guru_credentials', null);
    if (local && (local.username || local.password)) {
      cachedGuruCredentials = { ...cachedGuruCredentials, ...local };
    }
    return cachedGuruCredentials;
  },
  saveGuruProfile(profile: any) {
    cachedGuruProfile = { ...cachedGuruProfile, ...profile };
    saveLocal('lms_guru_profile', cachedGuruProfile);
    const dGuruProfile = getDocGuruProfile();
    if (dGuruProfile) {
      setDoc(dGuruProfile, sanitizeForFirestore({ profile: cachedGuruProfile, credentials: cachedGuruCredentials }), { merge: true }).catch(console.error);
    }

    // Synchronize session if logged in as guru
    const savedSession = localStorage.getItem('lms_user_session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        if (session.role === 'guru') {
          const updatedSession = {
            ...session,
            userName: cachedGuruProfile.name || session.userName,
            userEmail: cachedGuruProfile.email || session.userEmail,
            avatar: cachedGuruProfile.avatar || session.avatar,
          };
          localStorage.setItem('lms_user_session', JSON.stringify(updatedSession));
        }
      } catch (e) {
        console.warn('Error updating session on guru profile save:', e);
      }
    }

    notifyListeners();
  },
  saveGuruCredentials(creds: any) {
    cachedGuruCredentials = { ...cachedGuruCredentials, ...creds };
    saveLocal('lms_guru_credentials', cachedGuruCredentials);
    const dGuruProfile = getDocGuruProfile();
    if (dGuruProfile) {
      setDoc(dGuruProfile, sanitizeForFirestore({ profile: cachedGuruProfile, credentials: cachedGuruCredentials }), { merge: true }).catch(console.error);
    }
    notifyListeners();
  },

  getMateri(): Materi[] {
    return cachedMateri;
  },

  saveMateri(list: Materi[]): void {
    cachedMateri = list;
    saveLocal(KEYS.MATERI, list);
    offlineCacheService.cacheAllMateriAndKosakata(list).catch(console.warn);
    const dMateri = getDocMateri();
    if (dMateri) {
      setDoc(dMateri, sanitizeForFirestore({ items: list })).catch(err => console.error('Error syncing Materi to Firestore:', err));
    }
    notifyListeners();
  },

  getPenilaian(): Penilaian[] {
    return cachedPenilaian;
  },

  savePenilaian(list: Penilaian[]): void {
    cachedPenilaian = list;
    saveLocal(KEYS.PENILAIAN, list);
    const dPenilaian = getDocPenilaian();
    if (dPenilaian) {
      setDoc(dPenilaian, sanitizeForFirestore({ items: list })).catch(err => console.error('Error syncing Penilaian to Firestore:', err));
    }
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
    const previousStudents = [...cachedStudents];
    cachedStudents = list;
    saveLocal(KEYS.STUDENTS, list);
    const dStudents = getDocStudents();
    if (dStudents) {
      setDoc(dStudents, sanitizeForFirestore({ items: list })).catch(err => console.error('Error syncing Students to Firestore:', err));
    }

    // Also sync to students_records collection
    if (db) {
      const newIds = new Set(list.map(s => s.id));
      previousStudents.forEach(oldS => {
        if (oldS && oldS.id && !newIds.has(oldS.id)) {
          deleteDoc(doc(db, 'students_records', oldS.id)).catch(console.error);
        }
      });

      list.forEach(s => {
        if (s && s.id) {
          setDoc(doc(db, 'students_records', s.id), sanitizeForFirestore(s), { merge: true }).catch(console.error);
        }
      });
    }

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
      const dForum = getDocForum();
      if (dForum) {
        setDoc(dForum, sanitizeForFirestore({ items: updatedForum })).catch(err => console.error('Error syncing updated Forum avatars to Firestore:', err));
      }
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
    const dLogs = getDocLogs();
    if (dLogs) {
      setDoc(dLogs, sanitizeForFirestore({ items: updated })).catch(err => console.error('Error syncing Logs to Firestore:', err));
    }
    notifyListeners();
  },

  // Forum Diskusi Methods
  getForumPosts(): ForumPost[] {
    return cachedForum;
  },

  saveForumPosts(list: ForumPost[]): void {
    cachedForum = list;
    saveLocal(KEYS.FORUM, list);
    const dForum = getDocForum();
    if (dForum) {
      setDoc(dForum, sanitizeForFirestore({ items: list })).catch(err => console.error('Error syncing Forum to Firestore:', err));
    }
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
    const session = getLocal<UserSession | null>(KEYS.USER_SESSION, null);
    if (!session) return null;
    // If it is a student session, verify that the account is active in local/synced storage
    if (session.role === 'siswa' && (session.studentId || session.userEmail)) {
      const students = this.getStudents();
      const current = students.find(s => 
        (session.studentId && s.id === session.studentId) ||
        (session.userEmail && s.email && s.email.toLowerCase().trim() === session.userEmail.toLowerCase().trim())
      );
      if (current && current.status !== 'aktif' && current.status !== 'disetujui') {
        console.warn(`⛔ [STORAGE SESSION] Student ${current.name} status is "${current.status}". Invalidating cached session.`);
        this.clearUserSession();
        return null;
      }
    }
    return session;
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

  markMaterialComplete(studentId: string, materiId: string, sessionDurationSecs?: number): void {
    const students = JSON.parse(JSON.stringify(this.getStudents())) as Student[];
    const student = students.find(s => s.id === studentId);
    if (student) {
      if (!student.completedMaterials.includes(materiId)) {
        student.completedMaterials.push(materiId);
        student.totalXP += 50;
        const nowIso = new Date().toISOString();
        student.lastActive = nowIso;
        student.updatedAt = nowIso;

        const materi = this.getMateri().find(m => m.id === materiId);
        const completedAt = nowIso;
        const durationSeconds = sessionDurationSecs || (student.materialReadingTimeSeconds?.[materiId] || 60);
        const startedAt = new Date(new Date(completedAt).getTime() - durationSeconds * 1000).toISOString();

        student.detailedActivityLogs = student.detailedActivityLogs || [];
        student.detailedActivityLogs.unshift({
          id: `act-mat-${Date.now()}`,
          studentId: student.id,
          type: 'materi',
          title: materi?.title || `Materi ID: ${materiId}`,
          category: materi?.category,
          startedAt,
          completedAt,
          durationSeconds,
          earnedExp: 50,
          details: `Menyelesaikan baca materi (${materi?.category || ''})`,
        });

        this.saveStudents(students);

        // Explicit direct force sync to student's Firestore document
        if (db && student.id) {
          setDoc(doc(db, 'students_records', student.id), sanitizeForFirestore(student), { merge: true }).catch(err =>
            console.error('Error force syncing completed material to Firestore students_records:', err)
          );
        }

        this.addLog({
          userName: student.name,
          userRole: 'siswa',
          action: 'Selesai Membaca Materi',
          details: `Menyelesaikan materi: ${materi?.title || materiId} (+50 XP)`,
        });
      }
    }
  },

  forceSyncCompletedMaterials(studentId: string, completedMaterials: string[]): void {
    if (!studentId) return;
    const students = JSON.parse(JSON.stringify(this.getStudents())) as Student[];
    const student = students.find(s => s.id === studentId);
    if (student) {
      student.completedMaterials = Array.from(new Set(completedMaterials));
      student.updatedAt = new Date().toISOString();
      student.lastActive = new Date().toISOString();
      this.saveStudents(students);

      if (db) {
        setDoc(doc(db, 'students_records', studentId), sanitizeForFirestore({
          completedMaterials: student.completedMaterials,
          updatedAt: student.updatedAt,
          lastActive: student.lastActive,
        }), { merge: true }).catch(err => console.error('Error force syncing completedMaterials array to Firestore:', err));
      }
    }
  },

  forceSyncStudentHafalanProgress(studentId: string, hafalanProgress: any): void {
    if (!studentId) return;
    const students = JSON.parse(JSON.stringify(this.getStudents())) as Student[];
    const student = students.find(s => s.id === studentId);
    if (student) {
      student.hafalanProgress = {
        ...student.hafalanProgress,
        ...hafalanProgress,
      };
      student.updatedAt = new Date().toISOString();
      student.lastActive = new Date().toISOString();
      this.saveStudents(students);

      if (db) {
        setDoc(doc(db, 'students_records', studentId), sanitizeForFirestore({
          hafalanProgress: student.hafalanProgress,
          updatedAt: student.updatedAt,
          lastActive: student.lastActive,
        }), { merge: true }).catch(err => console.error('Error force syncing hafalanProgress to Firestore:', err));
      }
    }
  },

  forceSyncStudentProgress(studentId: string, updates: Partial<Student>): void {
    if (!studentId) return;
    const students = JSON.parse(JSON.stringify(this.getStudents())) as Student[];
    const student = students.find(s => s.id === studentId);
    if (student) {
      const updatedStudent: Student = {
        ...student,
        ...updates,
        updatedAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      };
      const updatedList = students.map(s => s.id === studentId ? updatedStudent : s);
      this.saveStudents(updatedList);

      if (db) {
        setDoc(doc(db, 'students_records', studentId), sanitizeForFirestore(updatedStudent), { merge: true }).catch(err =>
          console.error('Error force syncing student progress to Firestore:', err)
        );
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

  logMaterialReadingSession(studentId: string, materiId: string, durationSeconds: number, startedAtISO?: string): void {
    if (!studentId || !materiId || durationSeconds <= 0) return;
    const students = JSON.parse(JSON.stringify(this.getStudents())) as Student[];
    const student = students.find(s => s.id === studentId);
    if (student) {
      const materi = this.getMateri().find(m => m.id === materiId);
      const completedAt = new Date().toISOString();
      const startedAt = startedAtISO || new Date(new Date(completedAt).getTime() - durationSeconds * 1000).toISOString();

      student.detailedActivityLogs = student.detailedActivityLogs || [];
      student.detailedActivityLogs.unshift({
        id: `act-read-${Date.now()}`,
        studentId: student.id,
        type: 'materi',
        title: materi?.title || `Materi ID: ${materiId}`,
        category: materi?.category,
        startedAt,
        completedAt,
        durationSeconds: Math.round(durationSeconds),
        details: `Sesi Membaca Materi (${Math.round(durationSeconds)} detik)`,
      });
      student.lastActive = completedAt;
      this.saveStudents(students);
    }
  },

  saveQuizAttempt(attempt: Omit<QuizAttempt, 'id' | 'completedAt'>): QuizAttempt {
    const students = JSON.parse(JSON.stringify(this.getStudents())) as Student[];
    const student = students.find(s => s.id === attempt.studentId);
    
    const completedAt = new Date().toISOString();
    const durationSecs = attempt.timeSpentSeconds || 0;
    const startedAt = attempt.startedAt || attempt.accessedAt || new Date(new Date(completedAt).getTime() - durationSecs * 1000).toISOString();

    const newAttempt: QuizAttempt = {
      ...attempt,
      id: `att-${Date.now()}`,
      startedAt,
      completedAt,
    };

    if (student) {
      student.attempts = student.attempts || [];
      student.attempts.push(newAttempt);

      const expChange = attempt.earnedExp !== undefined ? attempt.earnedExp : (attempt.passed ? attempt.score : 0);
      student.totalXP = Math.max(0, student.totalXP + expChange);

      // Save detailed activity log
      student.detailedActivityLogs = student.detailedActivityLogs || [];
      student.detailedActivityLogs.unshift({
        id: `act-quiz-${Date.now()}`,
        studentId: student.id,
        type: attempt.penilaianType === 'latihan' ? 'latihan' : 'kuis',
        title: attempt.penilaianTitle,
        category: attempt.category,
        startedAt,
        completedAt,
        durationSeconds: durationSecs,
        score: attempt.score,
        passed: attempt.passed,
        earnedExp: expChange,
        details: `Meraih nilai ${attempt.score}/100 (${attempt.passed ? 'Lulus' : 'Belum Lulus'})`,
      });

      student.lastActive = completedAt;
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

    const dMateri = getDocMateri();
    const dPenilaian = getDocPenilaian();
    const dStudents = getDocStudents();
    const dLogs = getDocLogs();
    const dForum = getDocForum();

    if (dMateri) setDoc(dMateri, sanitizeForFirestore({ items: INITIAL_MATERI })).catch(console.error);
    if (dPenilaian) setDoc(dPenilaian, sanitizeForFirestore({ items: INITIAL_PENILAIAN })).catch(console.error);
    if (dStudents) setDoc(dStudents, sanitizeForFirestore({ items: INITIAL_STUDENTS })).catch(console.error);
    if (dLogs) setDoc(dLogs, sanitizeForFirestore({ items: INITIAL_LOGS })).catch(console.error);
    if (dForum) setDoc(dForum, sanitizeForFirestore({ items: INITIAL_FORUM_POSTS })).catch(console.error);

    notifyListeners();
  }
};
