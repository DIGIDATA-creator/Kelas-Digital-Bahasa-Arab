import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, HardDriveDownload, CheckCircle2, RefreshCw, Database, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { offlineCacheService, OfflineCacheMeta } from '../../services/offlineCacheService';
import { syncServiceWorkerMateriCache } from '../../utils/registerServiceWorker';
import { Materi } from '../../types';

interface OfflineCacheStatusWidgetProps {
  materiList: Materi[];
  compact?: boolean;
}

export const OfflineCacheStatusWidget: React.FC<OfflineCacheStatusWidgetProps> = ({
  materiList,
  compact = false,
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(offlineCacheService.getIsOnline());
  const [cacheMeta, setCacheMeta] = useState<OfflineCacheMeta>(offlineCacheService.getCacheMeta());
  const [isCaching, setIsCaching] = useState<boolean>(false);
  const [justCached, setJustCached] = useState<boolean>(false);

  useEffect(() => {
    const unsubNet = offlineCacheService.onNetworkStatusChange((online) => {
      setIsOnline(online);
    });

    const unsubMeta = offlineCacheService.onCacheMetaChange((meta) => {
      setCacheMeta(meta);
    });

    // Initial cache sync if not yet cached or metadata empty
    if (materiList.length > 0 && cacheMeta.totalMateriCount === 0) {
      offlineCacheService.cacheAllMateriAndKosakata(materiList);
    }

    return () => {
      unsubNet();
      unsubMeta();
    };
  }, [materiList]);

  const handleManualCache = async () => {
    setIsCaching(true);
    setJustCached(false);

    try {
      syncServiceWorkerMateriCache(materiList);
      const updatedMeta = await offlineCacheService.cacheAllMateriAndKosakata(materiList);
      setCacheMeta(updatedMeta);
      setJustCached(true);
      setTimeout(() => setJustCached(false), 4000);
    } catch (err) {
      console.warn('Manual cache error:', err);
    } finally {
      setIsCaching(false);
    }
  };

  const formattedSize = (cacheMeta.storageSizeBytes / 1024).toFixed(1);

  if (compact) {
    return (
      <div className={`flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl border text-xs transition-all ${
        !isOnline
          ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-2xs'
          : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
      }`}>
        <div className="flex items-center gap-2 font-semibold">
          {!isOnline ? (
            <>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              <WifiOff size={15} className="text-amber-600 shrink-0" />
              <span>Mode Offline: Materi & Kosakata Tersimpan</span>
            </>
          ) : (
            <>
              <span className="inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              <Wifi size={15} className="text-emerald-600 shrink-0" />
              <span>Online • Ready Offline ({cacheMeta.totalMateriCount || materiList.length} Modul)</span>
            </>
          )}
        </div>

        <button
          onClick={handleManualCache}
          disabled={isCaching}
          type="button"
          className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 hover:border-purple-300 text-slate-700 hover:text-purple-700 font-bold rounded-lg shadow-2xs hover:shadow-xs transition-all text-[11px] disabled:opacity-50 cursor-pointer"
          title="Simpan atau Perbarui Seluruh Materi Teks & Kosakata Offline"
        >
          {isCaching ? (
            <RefreshCw size={13} className="animate-spin text-purple-600" />
          ) : justCached ? (
            <CheckCircle2 size={13} className="text-emerald-600" />
          ) : (
            <HardDriveDownload size={13} className="text-purple-600" />
          )}
          <span>{isCaching ? 'Menyimpan...' : justCached ? 'Tersimpan!' : 'Sync Offline'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-2xl border transition-all ${
      !isOnline
        ? 'bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-amber-200/90 text-amber-950 shadow-xs'
        : 'bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 border-purple-800/50 text-white shadow-md'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Status & Details */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {!isOnline ? (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-900 text-[11px] font-extrabold border border-amber-300">
                <WifiOff size={13} className="text-amber-700" />
                <span>Mode Offline Aktif</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-extrabold border border-emerald-500/30">
                <ShieldCheck size={13} className="text-emerald-400" />
                <span>Sistem Caching Offline Siap</span>
              </span>
            )}

            <span className={`text-xs font-medium ${!isOnline ? 'text-amber-800' : 'text-slate-300'}`}>
              IndexedDB & Service Worker
            </span>
          </div>

          <p className={`text-xs leading-relaxed font-medium ${!isOnline ? 'text-amber-900' : 'text-slate-200'}`}>
            {!isOnline ? (
              <>Koneksi internet tidak stabil. Seluruh materi teks, kaidah Qowaid, dialog Hiwar, & mufrodat kosakata tetap <strong>100% dapat dibuka & dipelajari</strong>.</>
            ) : (
              <>Materi teks & kosakata otomatis dicache di browser siswa. Anda dapat mengunduh ulang versi terbaru kapan saja untuk kenyamanan saat offline.</>
            )}
          </p>

          <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] pt-1 ${!isOnline ? 'text-amber-800 font-semibold' : 'text-slate-300'}`}>
            <span className="flex items-center gap-1">
              <Database size={12} className={!isOnline ? 'text-amber-700' : 'text-purple-300'} />
              <strong>{cacheMeta.totalMateriCount || materiList.length}</strong> Modul Materi
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Sparkles size={12} className={!isOnline ? 'text-amber-700' : 'text-amber-300'} />
              <strong>{cacheMeta.totalVocabCount}</strong> Mufrodat Kosakata
            </span>
            <span>•</span>
            <span>Ukuran Cache: <strong>{formattedSize} KB</strong></span>
          </div>
        </div>

        {/* Right: Manual Action Button */}
        <div className="shrink-0 pt-2 sm:pt-0">
          <button
            onClick={handleManualCache}
            disabled={isCaching}
            type="button"
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 ${
              !isOnline
                ? 'bg-amber-600 hover:bg-amber-700 text-white border border-amber-700 shadow-2xs'
                : 'bg-purple-600 hover:bg-purple-500 text-white border border-purple-400/30 hover:shadow-purple-900/30'
            }`}
          >
            {isCaching ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Memperbarui Cache...</span>
              </>
            ) : justCached ? (
              <>
                <CheckCircle2 size={14} className="text-emerald-300" />
                <span>100% Tersimpan Offline!</span>
              </>
            ) : (
              <>
                <HardDriveDownload size={14} />
                <span>Perbarui Cache Offline</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
