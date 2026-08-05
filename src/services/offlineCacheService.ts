import { Materi } from '../types';

const DB_NAME = 'LmsArabicOfflineDB';
const DB_VERSION = 1;
const STORE_MATERI = 'materi_store';
const STORE_SYNC_QUEUE = 'sync_queue_store';

const LOCAL_STORAGE_MATERI_KEY = 'lms_arabic_materi_offline_backup';
const LOCAL_STORAGE_CACHE_META_KEY = 'lms_arabic_offline_cache_meta';
const LOCAL_STORAGE_SYNC_QUEUE_KEY = 'lms_arabic_offline_pending_actions';

export interface OfflineCacheMeta {
  totalMateriCount: number;
  totalVocabCount: number;
  totalHiwarCount: number;
  totalMahfudzotCount: number;
  lastSyncTimestamp: string;
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
    const meta: OfflineCacheMeta = {
      totalMateriCount: materiList.length,
      totalVocabCount,
      totalHiwarCount,
      totalMahfudzotCount,
      lastSyncTimestamp: new Date().toISOString(),
      isOffline: !this.isOnlineStatus,
      storageSizeBytes: new Blob([jsonString]).size,
    };

    try {
      localStorage.setItem(LOCAL_STORAGE_CACHE_META_KEY, JSON.stringify(meta));
    } catch (e) {}

    this.notifyCacheMeta();
    return meta;
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
      lastSyncTimestamp: '',
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
