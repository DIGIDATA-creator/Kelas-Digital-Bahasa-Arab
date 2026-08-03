import React, { useState, useEffect, useRef } from 'react';
import { AppNotification } from '../../types';
import { notificationService } from '../../services/notificationService';
import {
  Bell,
  CheckCheck,
  Trash2,
  BookOpen,
  Target,
  Crown,
  Swords,
  Info,
  X,
  ChevronRight
} from 'lucide-react';

interface NotificationDropdownProps {
  studentId: string;
  onNavigateToSection?: (type: string, targetId?: string, targetCategory?: string) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  studentId,
  onNavigateToSection,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (studentId) {
      const list = notificationService.getNotifications(studentId);
      setNotifications(list);
    }
  }, [studentId]);

  // Request browser Web Notification permission on mount
  useEffect(() => {
    notificationService.requestNotificationPermission();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (notifId: string) => {
    const updated = notificationService.markAsRead(studentId, notifId);
    setNotifications(updated);
  };

  const handleMarkAllAsRead = () => {
    const updated = notificationService.markAllAsRead(studentId);
    setNotifications(updated);
  };

  const handleClearAll = () => {
    const updated = notificationService.clearAll(studentId);
    setNotifications(updated);
  };

  const handleSelectNotif = (notif: AppNotification) => {
    handleMarkAsRead(notif.id);
    if (onNavigateToSection) {
      onNavigateToSection(notif.type, notif.targetId, notif.targetCategory);
    }
    setIsOpen(false);
  };

  const filteredList = notifications.filter(n => (filter === 'unread' ? !n.read : true));

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'materi':
        return <BookOpen size={16} className="text-emerald-500" />;
      case 'kuis':
        return <Target size={16} className="text-sky-500" />;
      case 'hafalan':
        return <Crown size={16} className="text-amber-500 fill-amber-400" />;
      case 'duel':
        return <Swords size={16} className="text-rose-500" />;
      default:
        return <Info size={16} className="text-indigo-500" />;
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 5) return 'Baru saja';
      if (diffMins < 60) return `${diffMins}m lalu`;
      if (diffHours < 24) return `${diffHours}j lalu`;
      if (diffDays < 7) return `${diffDays} hari lalu`;
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    } catch {
      return 'Baru saja';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all border border-slate-700/80 cursor-pointer shadow-xs"
        title="Pusat Notifikasi LMS"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-rose-500 text-white font-black text-[10px] rounded-full min-w-[18px] text-center shadow-md animate-pulse border border-slate-900">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl z-50 overflow-hidden text-slate-100 animate-fadeIn">
          {/* Header */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-amber-400" />
              <h3 className="font-extrabold text-sm text-white">Pemberitahuan</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 font-extrabold text-[10px] rounded-full">
                  {unreadCount} Belum Dibaca
                </span>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
            >
              <X size={16} />
            </button>
          </div>

          {/* Sub Header / Filters */}
          <div className="p-2 bg-slate-900 border-b border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 font-bold">
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filter === 'all'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Semua ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filter === 'unread'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Belum Dibaca ({unreadCount})
              </button>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Tandai Semua Dibaca"
                >
                  <CheckCheck size={16} />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Hapus Semua"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60 custom-scrollbar">
            {filteredList.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-medium space-y-2">
                <Bell size={24} className="mx-auto text-slate-600" />
                <p>Tidak ada pemberitahuan {filter === 'unread' ? 'belum dibaca' : ''}.</p>
              </div>
            ) : (
              filteredList.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => handleSelectNotif(notif)}
                  className={`p-3.5 transition-all cursor-pointer flex items-start gap-3 relative group ${
                    notif.read
                      ? 'bg-slate-900/60 hover:bg-slate-800/50 text-slate-300'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-white font-medium border-l-4 border-amber-400'
                  }`}
                >
                  <div className="p-2 bg-slate-950 border border-slate-800 rounded-xl shrink-0 mt-0.5">
                    {getNotifIcon(notif.type)}
                  </div>

                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-xs font-extrabold truncate ${notif.read ? 'text-slate-300' : 'text-amber-300'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                        {formatTime(notif.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>

                  <ChevronRight size={14} className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 self-center" />
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-950 border-t border-slate-800 text-center text-[11px] font-bold text-slate-400">
            Pusat Notifikasi Real-time LMS Bahasa Arab
          </div>
        </div>
      )}
    </div>
  );
};
