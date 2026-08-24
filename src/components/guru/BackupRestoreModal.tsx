import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  BookOpen,
  Users,
  Award,
  Layers,
  Clock,
  HardDrive
} from 'lucide-react';
import { storageService } from '../../services/storage';
import { offlineCacheService, FullDataSnapshot } from '../../services/offlineCacheService';
import { Materi, Student, Penilaian } from '../../types';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored?: () => void;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isOpen,
  onClose,
  onDataRestored,
}) => {
  const [activeTab, setActiveTab] = useState<'indexeddb' | 'export' | 'import'>('indexeddb');
  const [latestSnapshot, setLatestSnapshot] = useState<FullDataSnapshot | null>(null);
  const [isLoadingSnapshot, setIsLoadingSnapshot] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Import state
  const [importedJson, setImportedJson] = useState<string | null>(null);
  const [importFileName, setImportFileName] = useState<string>('');
  const [importPreview, setImportPreview] = useState<{
    materiCount: number;
    studentsCount: number;
    penilaianCount: number;
    exportedAt?: string;
    app?: string;
  } | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load latest snapshot from IndexedDB on open
  useEffect(() => {
    if (isOpen) {
      loadSnapshotInfo();
      setNotice(null);
    }
  }, [isOpen]);

  const loadSnapshotInfo = async () => {
    setIsLoadingSnapshot(true);
    try {
      const snap = await offlineCacheService.getLatestSnapshot();
      setLatestSnapshot(snap);
    } catch (e) {
      console.warn('Error loading snapshot:', e);
    } finally {
      setIsLoadingSnapshot(false);
    }
  };

  if (!isOpen) return null;

  // 1. Action: Restore from IndexedDB
  const handleRestoreFromIndexedDB = async () => {
    if (!latestSnapshot) {
      setNotice({ type: 'error', text: 'Tidak ada cadangan IndexedDB yang ditemukan untuk dipulihkan.' });
      return;
    }

    const confirmRestore = window.confirm(
      `Apakah Anda yakin ingin memulihkan data dari cadangan IndexedDB (${new Date(latestSnapshot.timestamp).toLocaleString('id-ID')})?\n\n` +
      `Data yang akan dipulihkan:\n• ${latestSnapshot.materiCount} Materi Pembelajaran\n• ${latestSnapshot.studentsCount} Data Siswa\n• ${latestSnapshot.penilaianCount} Kuis & Penilaian`
    );

    if (!confirmRestore) return;

    setIsProcessing(true);
    setNotice(null);
    try {
      const res = await storageService.restoreFromIndexedDBBackup();
      if (res.success) {
        setNotice({
          type: 'success',
          text: `✅ ${res.message} Data telah berhasil dipulihkan dan disinkronkan ke Firestore.`,
        });
        if (onDataRestored) onDataRestored();
        loadSnapshotInfo();
      } else {
        setNotice({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setNotice({ type: 'error', text: `Gagal memulihkan cadangan: ${err?.message || 'Kesalahan sistem'}` });
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Action: Create manual snapshot to IndexedDB
  const handleCreateManualSnapshot = async () => {
    setIsProcessing(true);
    try {
      const materi = storageService.getMateri();
      const students = storageService.getStudents();
      const penilaian = storageService.getPenilaian();
      const logs = storageService.getLogs();
      const forum = storageService.getForumPosts();
      const profile = storageService.getGuruProfile();

      await offlineCacheService.saveFullSnapshot({
        materiList: materi,
        students,
        penilaianList: penilaian,
        logs,
        forumPosts: forum,
        guruProfile: profile,
      });

      await loadSnapshotInfo();
      setNotice({
        type: 'success',
        text: `✅ Berhasil membuat snapshot cadangan IndexedDB baru (${materi.length} materi, ${students.length} siswa) pada ${new Date().toLocaleTimeString('id-ID')}.`,
      });
    } catch (err: any) {
      setNotice({ type: 'error', text: `Gagal membuat snapshot: ${err?.message || 'Error'}` });
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. Action: Export JSON Downloads
  const downloadJSON = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportFullJSON = () => {
    const jsonStr = storageService.exportFullBackupJSON();
    const dateStr = new Date().toISOString().split('T')[0];
    downloadJSON(jsonStr, `backup_lms_lengkap_${dateStr}.json`);
    setNotice({
      type: 'success',
      text: '✅ Berkas cadangan lengkap JSON berhasil diunduh. Simpan berkas ini di perangkat Anda untuk keamanan data.',
    });
  };

  const handleExportMateriJSON = () => {
    const jsonStr = storageService.exportMateriJSON();
    const dateStr = new Date().toISOString().split('T')[0];
    downloadJSON(jsonStr, `backup_materi_bahasa_arab_${dateStr}.json`);
    setNotice({
      type: 'success',
      text: '✅ Berkas cadangan materi JSON berhasil diunduh.',
    });
  };

  const handleExportStudentsJSON = () => {
    const jsonStr = storageService.exportStudentsJSON();
    const dateStr = new Date().toISOString().split('T')[0];
    downloadJSON(jsonStr, `backup_siswa_bahasa_arab_${dateStr}.json`);
    setNotice({
      type: 'success',
      text: '✅ Berkas cadangan data siswa JSON berhasil diunduh.',
    });
  };

  // 4. Action: Parse & Preview uploaded JSON
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    setNotice(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        let materiCount = 0;
        let studentsCount = 0;
        let penilaianCount = 0;

        if (Array.isArray(parsed.materiList)) materiCount = parsed.materiList.length;
        else if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].category) materiCount = parsed.length;

        if (Array.isArray(parsed.students)) studentsCount = parsed.students.length;
        else if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].nisn) studentsCount = parsed.length;

        if (Array.isArray(parsed.penilaianList)) penilaianCount = parsed.penilaianList.length;

        if (materiCount === 0 && studentsCount === 0 && penilaianCount === 0) {
          setNotice({
            type: 'error',
            text: 'Berkas JSON tidak mengandung struktur data Materi atau Siswa LMS yang sesuai.',
          });
          setImportedJson(null);
          setImportPreview(null);
          return;
        }

        setImportedJson(text);
        setImportPreview({
          materiCount,
          studentsCount,
          penilaianCount,
          exportedAt: parsed.exportedAt,
          app: parsed.app,
        });

        setNotice({
          type: 'info',
          text: `Berkas "${file.name}" berhasil dibaca: ${materiCount} materi, ${studentsCount} siswa, ${penilaianCount} penilaian terdeteksi.`,
        });
      } catch (err: any) {
        setNotice({ type: 'error', text: `Berkas bukan format JSON yang valid: ${err?.message || ''}` });
        setImportedJson(null);
        setImportPreview(null);
      }
    };
    reader.readAsText(file);
  };

  // 5. Action: Execute JSON Import
  const handleExecuteImportJSON = async () => {
    if (!importedJson) return;

    const confirmText = importMode === 'replace'
      ? 'PERINGATAN: Mode Timpa Penuh akan mengganti data saat ini dengan data dari berkas JSON. Lanjutkan?'
      : 'Mode Gabung akan menambahkan data dari berkas JSON tanpa menghapus data yang sudah ada. Lanjutkan?';

    if (!window.confirm(confirmText)) return;

    setIsProcessing(true);
    setNotice(null);
    try {
      const res = await storageService.importBackupJSON(importedJson, importMode);
      if (res.success) {
        setNotice({ type: 'success', text: `✅ ${res.message}` });
        if (onDataRestored) onDataRestored();
        loadSnapshotInfo();
        setImportedJson(null);
        setImportPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        setNotice({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setNotice({ type: 'error', text: `Gagal memproses impor: ${err?.message || 'Error'}` });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div
        id="backup-restore-modal"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col my-auto"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-950 text-white p-5 sm:p-6 flex items-center justify-between border-b border-emerald-700/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <Database size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Pusat Cadangan & Pemulihan Data
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950">
                  Keamanan Data
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Cadangan otomatis di IndexedDB browser dan ekspor/impor berkas JSON lokal.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-4 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('indexeddb')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border-t border-x ${
              activeTab === 'indexeddb'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border-slate-200 dark:border-slate-800 -mb-px'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white border-transparent'
            }`}
          >
            <HardDrive size={16} />
            <span>Cadangan IndexedDB</span>
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border-t border-x ${
              activeTab === 'export'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border-slate-200 dark:border-slate-800 -mb-px'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white border-transparent'
            }`}
          >
            <Download size={16} />
            <span>Ekspor JSON (Backup)</span>
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border-t border-x ${
              activeTab === 'import'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border-slate-200 dark:border-slate-800 -mb-px'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white border-transparent'
            }`}
          >
            <Upload size={16} />
            <span>Impor JSON (Pulihkan)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          
          {/* Notification / Notice banner */}
          <AnimatePresence>
            {notice && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className={`p-3.5 rounded-2xl text-xs font-semibold flex items-start gap-2.5 border ${
                  notice.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/50'
                    : notice.type === 'error'
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700/50'
                    : 'bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-700/50'
                }`}
              >
                {notice.type === 'success' ? (
                  <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : notice.type === 'error' ? (
                  <AlertTriangle size={16} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                ) : (
                  <Sparkles size={16} className="text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">{notice.text}</div>
                <button
                  type="button"
                  onClick={() => setNotice(null)}
                  className="p-0.5 hover:opacity-75 cursor-pointer shrink-0"
                >
                  <X size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* TAB 1: CADANGAN INDEXEDDB */}
          {activeTab === 'indexeddb' && (
            <div className="space-y-5">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400" />
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Status Cadangan Otomatis IndexedDB
                    </h3>
                  </div>
                  <button
                    onClick={loadSnapshotInfo}
                    disabled={isLoadingSnapshot}
                    className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                    title="Perbarui info snapshot"
                  >
                    <RefreshCw size={14} className={isLoadingSnapshot ? 'animate-spin' : ''} />
                  </button>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Aplikasi secara otomatis mencadangkan seluruh data (materi, kosa kata, data siswa, kuis, dan log) ke dalam basis data lokal IndexedDB browser setiap kali terjadi perubahan. Cadangan ini tetap tersimpan bahkan jika data cloud ter-reset.
                </p>

                {/* Snapshot Details Card */}
                {latestSnapshot ? (
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Clock size={13} className="text-emerald-500" /> Waktu Snapshot Terakhir:
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {new Date(latestSnapshot.timestamp).toLocaleString('id-ID', {
                          dateStyle: 'medium',
                          timeStyle: 'medium',
                        })}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800/40">
                        <div className="flex items-center justify-center gap-1 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold">
                          <BookOpen size={14} /> Materi
                        </div>
                        <div className="text-base font-black text-slate-900 dark:text-white mt-1">
                          {latestSnapshot.materiCount}
                        </div>
                      </div>

                      <div className="p-2.5 bg-teal-50 dark:bg-teal-950/30 rounded-lg border border-teal-200 dark:border-teal-800/40">
                        <div className="flex items-center justify-center gap-1 text-teal-700 dark:text-teal-300 text-xs font-extrabold">
                          <Users size={14} /> Siswa
                        </div>
                        <div className="text-base font-black text-slate-900 dark:text-white mt-1">
                          {latestSnapshot.studentsCount}
                        </div>
                      </div>

                      <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800/40">
                        <div className="flex items-center justify-center gap-1 text-amber-700 dark:text-amber-300 text-xs font-extrabold">
                          <Award size={14} /> Kuis/Nilai
                        </div>
                        <div className="text-base font-black text-slate-900 dark:text-white mt-1">
                          {latestSnapshot.penilaianCount}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                    <AlertTriangle size={16} className="shrink-0" />
                    <span>Belum ada snapshot yang tersimpan di IndexedDB browser saat ini.</span>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2.5 pt-2">
                  <button
                    onClick={handleRestoreFromIndexedDB}
                    disabled={!latestSnapshot || isProcessing}
                    className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-black shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <RotateCcw size={16} className={isProcessing ? 'animate-spin' : ''} />
                    <span>Pulihkan Data Terakhir Sekarang</span>
                  </button>

                  <button
                    onClick={handleCreateManualSnapshot}
                    disabled={isProcessing}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles size={14} className="text-amber-400" />
                    <span>Simpan Snapshot Baru</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EKSPOR JSON */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Unduh berkas JSON sebagai cadangan lokal di komputer/laptop Anda. Berkas ini dapat dipulihkan kapan saja melalui tab "Impor JSON".
              </p>

              <div className="grid grid-cols-1 gap-3">
                {/* 1. Full Backup */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-emerald-400 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Layers size={20} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        Cadangan Lengkap (Semua Data LMS)
                      </h4>
                      <p className="text-xs text-slate-500">
                        Termasuk {storageService.getMateri().length} materi, {storageService.getStudents().length} siswa, kuis, dan log aktivitas.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleExportFullJSON}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
                  >
                    <Download size={14} /> Unduh (.json)
                  </button>
                </div>

                {/* 2. Materi Backup Only */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-teal-400 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        Cadangan Materi Pembelajaran Saja
                      </h4>
                      <p className="text-xs text-slate-500">
                        {storageService.getMateri().length} modul bab (Qowaid, Hiwar, Kosakata, Mahfudzot).
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleExportMateriJSON}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-black shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
                  >
                    <Download size={14} /> Unduh (.json)
                  </button>
                </div>

                {/* 3. Students Backup Only */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-amber-400 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Users size={20} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        Cadangan Data Akun Siswa & Nilai
                      </h4>
                      <p className="text-xs text-slate-500">
                        {storageService.getStudents().length} akun siswa beserta riwayat nilai kuis dan progres EXP.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleExportStudentsJSON}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-black shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
                  >
                    <Download size={14} /> Unduh (.json)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: IMPOR / PULIHKAN DARI BERKAS JSON */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Pilih atau seret berkas cadangan JSON yang telah Anda unduh sebelumnya untuk memulihkan data ke sistem LMS.
              </p>

              {/* Upload Input Area */}
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-emerald-500 transition-all bg-slate-50/50 dark:bg-slate-800/30">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="json-file-input"
                />
                <label
                  htmlFor="json-file-input"
                  className="flex flex-col items-center justify-center gap-2 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <FileJson size={24} />
                  </div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">
                    {importFileName || 'Klik untuk Memilih Berkas Cadangan (.json)'}
                  </div>
                  <p className="text-xs text-slate-400">
                    Mendukung berkas cadangan lengkap, materi, maupun data siswa
                  </p>
                </label>
              </div>

              {/* Import Preview Card */}
              {importPreview && (
                <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-extrabold text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                      <CheckCircle2 size={15} className="text-emerald-600" />
                      Pratinjau Data Terdeteksi:
                    </div>
                    {importPreview.exportedAt && (
                      <span className="text-[10px] text-slate-500">
                        Dibuat: {new Date(importPreview.exportedAt).toLocaleDateString('id-ID')}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-emerald-100 dark:border-slate-700">
                      <span className="text-slate-500 block text-[10px]">Materi</span>
                      <span className="font-black text-sm text-slate-900 dark:text-white">{importPreview.materiCount}</span>
                    </div>
                    <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-emerald-100 dark:border-slate-700">
                      <span className="text-slate-500 block text-[10px]">Siswa</span>
                      <span className="font-black text-sm text-slate-900 dark:text-white">{importPreview.studentsCount}</span>
                    </div>
                    <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-emerald-100 dark:border-slate-700">
                      <span className="text-slate-500 block text-[10px]">Penilaian</span>
                      <span className="font-black text-sm text-slate-900 dark:text-white">{importPreview.penilaianCount}</span>
                    </div>
                  </div>

                  {/* Mode selector */}
                  <div className="space-y-1.5 pt-2 border-t border-emerald-200/60 dark:border-emerald-800/40">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Metode Pemulihan Data:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setImportMode('merge')}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          importMode === 'merge'
                            ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div className="text-xs font-extrabold">⚡ Gabungkan (Merge)</div>
                        <div className={`text-[10px] mt-0.5 ${importMode === 'merge' ? 'text-emerald-100' : 'text-slate-400'}`}>
                          Aman, menambahkan data baru tanpa menghapus data saat ini.
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setImportMode('replace')}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          importMode === 'replace'
                            ? 'bg-rose-600 text-white border-rose-600 font-bold'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div className="text-xs font-extrabold">🔄 Timpa Penuh (Replace)</div>
                        <div className={`text-[10px] mt-0.5 ${importMode === 'replace' ? 'text-rose-100' : 'text-slate-400'}`}>
                          Menggantikan data di sistem sepenuhnya dengan isi file.
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Execute Button */}
                  <button
                    onClick={handleExecuteImportJSON}
                    disabled={isProcessing}
                    className="w-full mt-3 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-black shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <RotateCcw size={16} className={isProcessing ? 'animate-spin' : ''} />
                    <span>Terapkan & Pulihkan Data Sekarang</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
