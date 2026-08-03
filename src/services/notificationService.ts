import { AppNotification } from '../types';
import { storageService } from './storage';

const NOTIF_STORAGE_PREFIX = 'lms_notifications_';
const BROADCAST_STORAGE_KEY = 'lms_broadcast_notifications';

const INITIAL_DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: '📚 Materi Kosakata Baru Diterbitkan',
    message: 'Ustadz merilis Kosakata Bab 2: Fil Fashli (Atribut Kelas & Belajar). Silakan pelajari mufrodatnya!',
    type: 'materi',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    read: false,
    targetCategory: 'kosakata',
  },
  {
    id: 'notif-2',
    title: '🎯 Kuis Evaluasi Dibuka',
    message: 'Kuis Evaluasi "Qawaid Nahwu Bab 1" telah dibuka! Selesaikan untuk mendapatkan hingga +100 XP.',
    type: 'kuis',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    read: false,
  },
  {
    id: 'notif-3',
    title: '👑 Hafalan Verifikasi Guru (+25 XP)',
    message: 'Selamat! Hafalan Kosakata Bab 1 Anda telah diverifikasi resmi oleh Guru dengan predikat Mahkota Emas.',
    type: 'hafalan',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    read: true,
    targetCategory: 'kosakata',
  },
  {
    id: 'notif-4',
    title: '⚔️ Undangan Mode Duel Mufrodat',
    message: 'Tantang teman sekelas Anda dalam Kuis Duel Mufrodat Real-time 1v1 untuk merebut puncak Peringkat!',
    type: 'duel',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    read: true,
  },
];

export const notificationService = {
  getNotifications(studentId: string): AppNotification[] {
    const key = NOTIF_STORAGE_PREFIX + studentId;
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(INITIAL_DEFAULT_NOTIFICATIONS));
      return INITIAL_DEFAULT_NOTIFICATIONS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_DEFAULT_NOTIFICATIONS;
    }
  },

  saveNotifications(studentId: string, list: AppNotification[]): void {
    const key = NOTIF_STORAGE_PREFIX + studentId;
    localStorage.setItem(key, JSON.stringify(list));
  },

  addNotification(
    studentId: string,
    notif: Omit<AppNotification, 'id' | 'createdAt' | 'read'>
  ): AppNotification {
    const current = this.getNotifications(studentId);
    const newNotif: AppNotification = {
      ...notif,
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
      read: false,
    };
    const updated = [newNotif, ...current];
    this.saveNotifications(studentId, updated);

    // Try triggering Web Notification / Push Toast if permitted
    this.triggerWebNotification(newNotif.title, newNotif.message);

    return newNotif;
  },

  addNotificationToAllStudents(
    notif: Omit<AppNotification, 'id' | 'createdAt' | 'read'>
  ): AppNotification {
    const newNotif: AppNotification = {
      ...notif,
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
      read: false,
    };

    // 1. Get all students from storage
    const students = storageService.getStudents();
    students.forEach((std) => {
      const list = this.getNotifications(std.id);
      const updated = [newNotif, ...list];
      this.saveNotifications(std.id, updated);
    });

    // 2. Also save to global broadcast list
    const broadcastRaw = localStorage.getItem(BROADCAST_STORAGE_KEY);
    let broadcastList: AppNotification[] = [];
    if (broadcastRaw) {
      try {
        broadcastList = JSON.parse(broadcastRaw);
      } catch {
        broadcastList = [];
      }
    }
    broadcastList = [newNotif, ...broadcastList];
    localStorage.setItem(BROADCAST_STORAGE_KEY, JSON.stringify(broadcastList));

    // Trigger web notification
    this.triggerWebNotification(newNotif.title, newNotif.message);

    return newNotif;
  },

  markAsRead(studentId: string, notifId: string): AppNotification[] {
    const current = this.getNotifications(studentId);
    const updated = current.map(n => (n.id === notifId ? { ...n, read: true } : n));
    this.saveNotifications(studentId, updated);
    return updated;
  },

  markAllAsRead(studentId: string): AppNotification[] {
    const current = this.getNotifications(studentId);
    const updated = current.map(n => ({ ...n, read: true }));
    this.saveNotifications(studentId, updated);
    return updated;
  },

  clearAll(studentId: string): AppNotification[] {
    this.saveNotifications(studentId, []);
    return [];
  },

  requestNotificationPermission(): void {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  },

  triggerWebNotification(title: string, body: string): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
        });
      } catch (e) {
        console.log('Web Notification failed', e);
      }
    }
  }
};

