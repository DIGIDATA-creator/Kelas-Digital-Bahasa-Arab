import { Materi, Student, Penilaian, ActivityLog, ForumPost } from '../types';

const DB_NAME = 'LmsArabicOfflineDB';
const DB_VERSION = 2;
const STORE_MATERI = 'materi_store';
const STORE_STUDENTS = 'students_store';
const STORE_SNAPSHOTS = 'snapshots_store';
const STORE_SYNC_QUEUE = 'sync_queue_store';

const LOCAL_STORAGE_MATERI_KEY = 'lms_arabic_materi_offline_backup';
const LOCAL_STORAGE_STUDENTS_KEY = 'lms_arabic_students_offline_backup';
const LOCAL_STORAGE_SNAPSHOT_KEY = 'lms_arabic_full_snapshot_backup';
const LOCAL_STORAGE_CACHE_META_KEY = 'lms_arabic_offline_cache_meta';
const LOCAL_STORAGE_SYNC_QUEUE_KEY = 'lms_arabic_offline_pending_actions';

export interface FullDataSnapshot {
  id: string;
  timestamp: string;
  materiList: Materi[];
  students: Student[];
  penilaianList: Penilaian[];
  logs: ActivityLog[];
  forumPosts: ForumPost[];
  guruProfile?: any;
  materiCount: number;
  studentsCount: number;
  penilaianCount: number;
}

export interface OfflineCacheMeta {
  totalMateriCount: number;
  totalStudentsCount: number;
  totalVocabCount: number;
  totalHiwarCount: number;
  totalMahfudzotCount: number;
  lastSyncTimestamp: string;
  lastBackupTimestamp: string;
  isOffline: boolean;
  storageSizeBytes: number;
}

export interface QueuedOfflineAction {
  id: string;
  type: 'MARK_COMPLETE' | 'TOGGLE_SELF_KOSAKATA' | 'TOGGLE_SELF_MAHFUDZOT' | 'TOGGLE_SELF_QOWAID' | 'TOGGLE_SELF_HIWAR';
  payload: any;
  studentId: string;
  timestamp: string;
}

type NetworkListener = (isOnline: boolean) => void;
type CacheSyncListener = (meta: OfflineCacheMeta) => void;

class OfflineCacheService {
  private networkListeners: NetworkListener[] = [];
  private cacheSyncListeners: CacheSyncListener[] = [];
  private dbPromise: Promise<IDBDatabase | null> | null = null;
  private isOnlineStatus: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
      this.initIndexedDB();
    }
  }

  // Initialize IndexedDB
  private initIndexedDB(): Promise<IDBDatabase | null> {
    if (this.dbPromise) return this.dbPromise;

    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      console.warn('[OfflineCache] IndexedDB not available, falling back to LocalStorage.');
      this.dbPromise = Promise.resolve(null);
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve) => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_MATERI)) {
            db.createObjectStore(STORE_MATERI, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORE_STUDENTS)) {
            db.createObjectStore(STORE_STUDENTS, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORE_SNAPSHOTS)) {
            db.createObjectStore(STORE_SNAPSHOTS, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORE_SYNC_QUEUE)) {
            db.createObjectStore(STORE_SYNC_QUEUE, { keyPath: 'id' });
          }
        };

        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          resolve(db);
        };

        request.onerror = (err) => {
          console.warn('[OfflineCache] IndexedDB open error, falling back to LocalStorage:', err);
          resolve(null);
        };
      } catch (e) {
        console.warn('[OfflineCache] IndexedDB exception:', e);
        resolve(null);
      }
    });

    return this.dbPromise;
  }

  private async handleNetworkChange(online: boolean) {
    this.isOnlineStatus = online;
    console.log(`[OfflineCache] Connection state changed: ${online ? 'ONLINE' : 'OFFLINE'}`);

    this.networkListeners.forEach(fn => fn(online));

    if (online) {
      await this.processOfflineSyncQueue();
    }

    this.notifyCacheMeta();
  }

  // Subscribe to online/offline changes
  public onNetworkStatusChange(listener: NetworkListener): () => void {
    this.networkListeners.push(listener);
    // Call immediately with current state
    listener(this.isOnlineStatus);
    return () => {
      this.networkListeners = this.networkListeners.filter(l => l !== listener);
    };
  }

  // Subscribe to cache metadata changes
  public onCacheMetaChange(listener: CacheSyncListener): () => void {
    this.cacheSyncListeners.push(listener);
    listener(this.getCacheMeta());
    return () => {
      this.cacheSyncListeners = this.cacheSyncListeners.filter(l => l !== listener);
    };
  }

  public getIsOnline(): boolean {
    return this.isOnlineStatus;
  }

  // Cache all Materi & Kosakata into IndexedDB & LocalStorage
  public async cacheAllMateriAndKosakata(materiList: Materi[]): Promise<OfflineCacheMeta> {
    if (!materiList || materiList.length === 0) {
      return this.getCacheMeta();
    }

    let totalVocabCount = 0;
    let totalHiwarCount = 0;
    let totalMahfudzotCount = 0;

    materiList.forEach(m => {
      if (m.vocabularies && Array.isArray(m.vocabularies)) {
        totalVocabCount += m.vocabularies.length;
      }
      if (m.category === 'hiwar') {
        if (m.dialoguePairs) totalHiwarCount += m.dialoguePairs.length;
        else if (m.dialogues) totalHiwarCount += m.dialogues.length;
      }
      if (m.category === 'mahfudzot') {
        totalMahfudzotCount += 1;
      }
    });

    // 1. Save to LocalStorage Backup
    const jsonString = JSON.stringify(materiList);
    try {
      localStorage.setItem(LOCAL_STORAGE_MATERI_KEY, jsonString);
    } catch (e) {
      console.warn('[OfflineCache] LocalStorage save warning:', e);
    }

    // 2. Save to IndexedDB
    const db = await this.initIndexedDB();
    if (db) {
      try {
        const tx = db.transaction(STORE_MATERI, 'readwrite');
        const store = tx.objectStore(STORE_MATERI);
        await new Promise<void>((resolve, reject) => {
          const clearReq = store.clear();
          clearReq.onsuccess = () => {
            let pending = materiList.length;
            if (pending === 0) resolve();
            materiList.forEach(item => {
              const req = store.put(item);
              req.onsuccess = () => {
                pending--;
                if (pending === 0) resolve();
              };
              req.onerror = () => reject(req.error);
            });
          };
          clearReq.onerror = () => reject(clearReq.error);
        });
      } catch (e) {
        console.warn('[OfflineCache] IndexedDB save exception:', e);
      }
    }

    // 3. Post to Service Worker if active
    if (typeof navigator !== 'undefined' && navigator.serviceWorker && navigator.serviceWorker.controller) {
      try {
        navigator.serviceWorker.controller.postMessage({
          type: 'CACHE_MATERI_DATA',
          materiList,
        });
      } catch (err) {
        console.warn('[OfflineCache] SW postMessage warning:', err);
      }
    }

    // 4. Update Meta
    const prevMeta = this.getCacheMeta();
    const meta: OfflineCacheMeta = {
      totalMateriCount: materiList.length,
      totalStudentsCount: prevMeta.totalStudentsCount || 0,
      totalVocabCount,
      totalHiwarCount,
      totalMahfudzotCount,
      lastSyncTimestamp: new Date().toISOString(),
      lastBackupTimestamp: prevMeta.lastBackupTimestamp || new Date().toISOString(),
      isOffline: !this.isOnlineStatus,
      storageSizeBytes: new Blob([jsonString]).size,
    };

    try {
      localStorage.setItem(LOCAL_STORAGE_CACHE_META_KEY, JSON.stringify(meta));
    } catch (e) {}

    this.notifyCacheMeta();
    return meta;
  }

  // Cache Students List to IndexedDB & LocalStorage
  public async cacheAllStudents(students: Student[]): Promise<void> {
    if (!students || students.length === 0) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_STUDENTS_KEY, JSON.stringify(students));
    } catch (e) {
      console.warn('[OfflineCache] Students LocalStorage save warning:', e);
    }

    const db = await this.initIndexedDB();
    if (db) {
      try {
        const tx = db.transaction(STORE_STUDENTS, 'readwrite');
        const store = tx.objectStore(STORE_STUDENTS);
        await new Promise<void>((resolve, reject) => {
          const clearReq = store.clear();
          clearReq.onsuccess = () => {
            let pending = students.length;
            if (pending === 0) resolve();
            students.forEach(s => {
              const req = store.put(s);
              req.onsuccess = () => {
                pending--;
                if (pending === 0) resolve();
              };
              req.onerror = () => reject(req.error);
            });
          };
          clearReq.onerror = () => reject(clearReq.error);
        });
      } catch (e) {
        console.warn('[OfflineCache] Students IndexedDB save error:', e);
      }
    }

    const meta = this.getCacheMeta();
    meta.totalStudentsCount = students.length;
    meta.lastBackupTimestamp = new Date().toISOString();
    try {
      localStorage.setItem(LOCAL_STORAGE_CACHE_META_KEY, JSON.stringify(meta));
    } catch (e) {}
    this.notifyCacheMeta();
  }

  // Save a full application snapshot to IndexedDB and LocalStorage
  public async saveFullSnapshot(data: {
    materiList: Materi[];
    students: Student[];
    penilaianList: Penilaian[];
    logs: ActivityLog[];
    forumPosts: ForumPost[];
    guruProfile?: any;
  }): Promise<FullDataSnapshot> {
    const timestamp = new Date().toISOString();
    const snapshot: FullDataSnapshot = {
      id: `snapshot-${Date.now()}`,
      timestamp,
      materiList: data.materiList || [],
      students: data.students || [],
      penilaianList: data.penilaianList || [],
      logs: data.logs || [],
      forumPosts: data.forumPosts || [],
      guruProfile: data.guruProfile,
      materiCount: (data.materiList || []).length,
      studentsCount: (data.students || []).length,
      penilaianCount: (data.penilaianList || []).length,
    };

    // Save latest snapshot to LocalStorage
    try {
      localStorage.setItem(LOCAL_STORAGE_SNAPSHOT_KEY, JSON.stringify(snapshot));
    } catch (e) {
      console.warn('[OfflineCache] LocalStorage full snapshot save warning:', e);
    }

    // Save to IndexedDB
    const db = await this.initIndexedDB();
    if (db) {
      try {
        const tx = db.transaction(STORE_SNAPSHOTS, 'readwrite');
        const store = tx.objectStore(STORE_SNAPSHOTS);
        await new Promise<void>((resolve, reject) => {
          const req = store.put(snapshot);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
      } catch (e) {
        console.warn('[OfflineCache] IndexedDB full snapshot save error:', e);
      }
    }

    // Also mirror to individual caches
    if (data.materiList && data.materiList.length > 0) {
      this.cacheAllMateriAndKosakata(data.materiList).catch(console.warn);
    }
    if (data.students && data.students.length > 0) {
      this.cacheAllStudents(data.students).catch(console.warn);
    }

    return snapshot;
  }

  // Retrieve the latest full data snapshot from IndexedDB or LocalStorage
  public async getLatestSnapshot(): Promise<FullDataSnapshot | null> {
    // 1. Try IndexedDB
    const db = await this.initIndexedDB();
    if (db) {
      try {
        const snapshots = await new Promise<FullDataSnapshot[]>((resolve, reject) => {
          const tx = db.transaction(STORE_SNAPSHOTS, 'readonly');
          const store = tx.objectStore(STORE_SNAPSHOTS);
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result as FullDataSnapshot[]);
          req.onerror = () => reject(req.error);
        });

        if (snapshots && snapshots.length > 0) {
          // Sort by timestamp desc
          snapshots.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          return snapshots[0];
        }
      } catch (e) {
        console.warn('[OfflineCache] Error reading snapshots from IndexedDB:', e);
      }
    }

    // 2. Fallback to LocalStorage
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_SNAPSHOT_KEY);
      if (raw) {
        return JSON.parse(raw) as FullDataSnapshot;
      }
    } catch (e) {
      console.warn('[OfflineCache] Error reading snapshot from LocalStorage:', e);
    }

    // 3. Construct synthetic snapshot from individual offline caches if available
    const [offlineMateri, offlineStudents] = await Promise.all([
      this.getOfflineMateriList(),
      this.getOfflineStudentsList(),
    ]);

    if (offlineMateri.length > 0 || offlineStudents.length > 0) {
      return {
        id: 'synthetic-latest-cache',
        timestamp: new Date().toISOString(),
        materiList: offlineMateri,
        students: offlineStudents,
        penilaianList: [],
        logs: [],
        forumPosts: [],
        materiCount: offlineMateri.length,
        studentsCount: offlineStudents.length,
        penilaianCount: 0,
      };
    }

    return null;
  }

  // Retrieve all saved snapshots from IndexedDB
  public async getAllSnapshots(): Promise<FullDataSnapshot[]> {
    const db = await this.initIndexedDB();
    if (db) {
      try {
        const list = await new Promise<FullDataSnapshot[]>((resolve, reject) => {
          const tx = db.transaction(STORE_SNAPSHOTS, 'readonly');
          const store = tx.objectStore(STORE_SNAPSHOTS);
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result as FullDataSnapshot[]);
          req.onerror = () => reject(req.error);
        });

        if (list && list.length > 0) {
          list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          return list;
        }
      } catch (e) {
        console.warn('[OfflineCache] getAllSnapshots error:', e);
      }
    }

    const latest = await this.getLatestSnapshot();
    return latest ? [latest] : [];
  }

  // Retrieve Students List from Offline Cache
  public async getOfflineStudentsList(): Promise<Student[]> {
    const db = await this.initIndexedDB();
    if (db) {
      try {
        const items = await new Promise<Student[]>((resolve, reject) => {
          const tx = db.transaction(STORE_STUDENTS, 'readonly');
          const store = tx.objectStore(STORE_STUDENTS);
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result as Student[]);
          req.onerror = () => reject(req.error);
        });

        if (items && items.length > 0) return items;
      } catch (e) {
        console.warn('[OfflineCache] Failed reading students from IndexedDB:', e);
      }
    }

    try {
      const data = localStorage.getItem(LOCAL_STORAGE_STUDENTS_KEY);
      if (data) return JSON.parse(data) as Student[];
    } catch (e) {}

    return [];
  }

  // Retrieve Materi List from Offline Cache
  public async getOfflineMateriList(): Promise<Materi[]> {
    // Try IndexedDB first
    const db = await this.initIndexedDB();
    if (db) {
      try {
        const items = await new Promise<Materi[]>((resolve, reject) => {
          const tx = db.transaction(STORE_MATERI, 'readonly');
          const store = tx.objectStore(STORE_MATERI);
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result as Materi[]);
          req.onerror = () => reject(req.error);
        });

        if (items && items.length > 0) {
          return items;
        }
      } catch (e) {
        console.warn('[OfflineCache] Failed reading from IndexedDB:', e);
      }
    }

    // Fallback to LocalStorage
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_MATERI_KEY);
      if (data) {
        return JSON.parse(data) as Materi[];
      }
    } catch (e) {
      console.warn('[OfflineCache] Failed reading from LocalStorage backup:', e);
    }

    return [];
  }

  public getCacheMeta(): OfflineCacheMeta {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_CACHE_META_KEY);
      if (data) {
        const meta = JSON.parse(data) as OfflineCacheMeta;
        return {
          ...meta,
          isOffline: !this.isOnlineStatus,
        };
      }
    } catch (e) {}

    return {
      totalMateriCount: 0,
      totalVocabCount: 0,
      totalHiwarCount: 0,
      totalMahfudzotCount: 0,
      totalStudentsCount: 0,
      lastSyncTimestamp: '',
      lastBackupTimestamp: '',
      isOffline: !this.isOnlineStatus,
      storageSizeBytes: 0,
    };
  }

  private notifyCacheMeta() {
    const meta = this.getCacheMeta();
    this.cacheSyncListeners.forEach(fn => fn(meta));
  }

  // Queue offline actions (e.g. student marking vocab/materi when offline)
  public async queueOfflineAction(action: Omit<QueuedOfflineAction, 'id' | 'timestamp'>) {
    const item: QueuedOfflineAction = {
      ...action,
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };

    // Save to LocalStorage Queue
    try {
      const currentQueue = this.getQueuedActions();
      currentQueue.push(item);
      localStorage.setItem(LOCAL_STORAGE_SYNC_QUEUE_KEY, JSON.stringify(currentQueue));
      console.log('[OfflineCache] Queued offline action:', item);
    } catch (e) {
      console.warn('[OfflineCache] Queue error:', e);
    }

    // If online, immediately process queue
    if (this.isOnlineStatus) {
      await this.processOfflineSyncQueue();
    }
  }

  public getQueuedActions(): QueuedOfflineAction[] {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_SYNC_QUEUE_KEY);
      if (data) return JSON.parse(data) as QueuedOfflineAction[];
    } catch (e) {}
    return [];
  }

  public async processOfflineSyncQueue(): Promise<number> {
    const queue = this.getQueuedActions();
    if (queue.length === 0) return 0;

    console.log(`[OfflineCache] Processing ${queue.length} pending offline actions...`);

    // Clear queue after retrieval
    try {
      localStorage.removeItem(LOCAL_STORAGE_SYNC_QUEUE_KEY);
    } catch (e) {}

    return queue.length;
  }
}

export const offlineCacheService = new OfflineCacheService();
