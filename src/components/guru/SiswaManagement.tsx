import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, StudentStatus, Materi, TingkatType, ActivityLog } from '../../types';
import {
  UserPlus,
  Search,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Award,
  Eye,
  X,
  BookOpen,
  Building2,
  GraduationCap,
  Users,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Check,
  ListFilter,
  AlertTriangle,
  UserCheck,
  ChevronRight,
  CheckSquare,
  LayoutGrid,
  Quote,
  Activity,
  RefreshCw,
  FileSpreadsheet,
  KeyRound
} from 'lucide-react';
import { PendaftaranSiswaForm } from '../auth/PendaftaranSiswaForm';
import { CeklisHafalanModal } from './CeklisHafalanModal';
import { SiswaActivityVisitsView } from './SiswaActivityVisitsView';
import { ExportNilaiModal } from './ExportNilaiModal';
import { SiswaCredentialsModal } from './SiswaCredentialsModal';
import { storageService } from '../../services/storage';

export const getTingkatColorTheme = (tingkat?: TingkatType | string, className?: string) => {
  const t = (tingkat || '').toLowerCase();
  const c = (className || '').toLowerCase();

  if (t.includes('dasar') || c.includes('sd') || c.includes('mi') || c.includes('dasar')) {
    return {
      key: 'dasar',
      label: '🎒 SD / MI / Dasar',
      headerBg: 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-700',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      cardBorder: 'border-amber-200 hover:border-amber-400',
      avatarRing: 'ring-4 ring-amber-400/50 border-white shadow-lg',
      xpBadge: 'bg-amber-50 text-amber-900 border-amber-200',
      accentText: 'text-amber-700',
      bgAccent: 'bg-amber-50/70',
    };
  }
  if (t.includes('menengah pertama') || c.includes('smp') || c.includes('mts') || c.includes('7') || c.includes('8') || c.includes('9')) {
    return {
      key: 'smp',
      label: '🏫 SMP / MTs',
      headerBg: 'bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-700',
      badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
      cardBorder: 'border-blue-200 hover:border-blue-400',
      avatarRing: 'ring-4 ring-blue-400/50 border-white shadow-lg',
      xpBadge: 'bg-blue-50 text-blue-900 border-blue-200',
      accentText: 'text-blue-700',
      bgAccent: 'bg-blue-50/70',
    };
  }
  if (t.includes('menengah akhir') || c.includes('sma') || c.includes('ma') || c.includes('smk') || c.includes('10') || c.includes('11') || c.includes('12')) {
    return {
      key: 'sma',
      label: '🎓 SMA / MA / SMK',
      headerBg: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-700',
      badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
      cardBorder: 'border-purple-200 hover:border-purple-400',
      avatarRing: 'ring-4 ring-purple-400/50 border-white shadow-lg',
      xpBadge: 'bg-purple-50 text-purple-900 border-purple-200',
      accentText: 'text-purple-700',
      bgAccent: 'bg-purple-50/70',
    };
  }

  return {
    key: 'umum',
    label: '🌟 Tingkat Umum',
    headerBg: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-800',
    badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    cardBorder: 'border-emerald-200 hover:border-emerald-400',
    avatarRing: 'ring-4 ring-emerald-400/50 border-white shadow-lg',
    xpBadge: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    accentText: 'text-emerald-700',
    bgAccent: 'bg-emerald-50/70',
  };
};

interface SiswaManagementProps {
  students: Student[];
  materiList: Materi[];
  logs?: ActivityLog[];
  onSaveStudents: (updated: Student[]) => void;
  onSwitchToStudentSession?: (student: Student) => void;
  onForceCleanStudent?: (emailOrId: string) => void;
  initialSelectedStudentId?: string;
  onClearInitialSelectedStudentId?: () => void;
}

export const SiswaManagement: React.FC<SiswaManagementProps> = ({
  students,
  materiList,
  logs,
  onSaveStudents,
  onSwitchToStudentSession,
  onForceCleanStudent,
  initialSelectedStudentId,
  onClearInitialSelectedStudentId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showPredictions, setShowPredictions] = useState(false);
  const [selectedClass, setSelectedClass] = useState('semua');
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState('semua');
  const [activeMainSection, setActiveMainSection] = useState<'acc' | 'aktif' | 'semua'>('acc');
  const [statusTab, setStatusTab] = useState<'semua' | 'pending' | 'disetujui' | 'ditolak' | 'nonaktif'>('pending');
  const [viewMode, setViewMode] = useState<'cards' | 'grouped' | 'flat'>('cards');
  const [showLogsVisitsModal, setShowLogsVisitsModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [selectedStudentForCredentialsId, setSelectedStudentForCredentialsId] = useState<string | undefined>(undefined);

  const activeLogs = logs || storageService.getLogs();

  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);

  // Automatically open student detail modal when navigated with initialSelectedStudentId
  React.useEffect(() => {
    if (initialSelectedStudentId) {
      const target = students.find(s => s.id === initialSelectedStudentId);
      if (target) {
        setSelectedStudentForDetail(target);
      }
    }
  }, [initialSelectedStudentId, students]);
  const [studentForHafalanChecklist, setStudentForHafalanChecklist] = useState<Student | null>(null);

  // Predictive search calculation
  const studentPredictions = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q || q.length < 1) return [];
    return students.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.nisn.includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.schoolName || '').toLowerCase().includes(q) ||
      (s.rombelName || '').toLowerCase().includes(q)
    ).slice(0, 6);
  }, [students, searchTerm]);

  // Bulk selection state
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Accordion collapsed state for grouped view
  const [collapsedSchools, setCollapsedSchools] = useState<Record<string, boolean>>({});

  const toggleSchoolCollapse = (schoolKey: string) => {
    setCollapsedSchools(prev => ({ ...prev, [schoolKey]: !prev[schoolKey] }));
  };

  // Counts based on Status
  const pendingStudents = students.filter(s => s.status === 'pending');
  const approvedStudents = students.filter(s => s.status === 'disetujui' || s.status === 'aktif');
  const rejectedStudents = students.filter(s => s.status === 'ditolak');
  const deactivatedStudents = students.filter(s => s.status === 'nonaktif');

  // Extract unique schools & classes for filters
  const allSchoolNames = Array.from(
    new Set(students.map(s => s.schoolName || 'Tanpa Sekolah').filter(Boolean))
  );
  const allClasses = Array.from(new Set(students.map(s => s.className)));

  // Filtered Students List
  const filteredStudents = students.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nisn.includes(searchTerm) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.schoolName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.rombelName || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass = selectedClass === 'semua' || s.className === selectedClass;
    const matchesSchool =
      selectedSchoolFilter === 'semua' ||
      (s.schoolName || 'Tanpa Sekolah') === selectedSchoolFilter;

    const matchesStatus =
      statusTab === 'semua' ||
      (statusTab === 'pending' && s.status === 'pending') ||
      (statusTab === 'disetujui' && (s.status === 'disetujui' || s.status === 'aktif')) ||
      (statusTab === 'ditolak' && s.status === 'ditolak') ||
      (statusTab === 'nonaktif' && s.status === 'nonaktif');

    return matchesSearch && matchesClass && matchesSchool && matchesStatus;
  });

  // Handlers
  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (std: Student) => {
    setEditingStudent(std);
    setIsModalOpen(true);
  };

  // Delete student modal state
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    studentId?: string;
    studentName?: string;
  }>({
    isOpen: false,
  });

  const requestDeleteStudent = (student: Student) => {
    setDeleteConfirmation({
      isOpen: true,
      studentId: student.id,
      studentName: student.name,
    });
  };

  const handleConfirmDeleteStudent = () => {
    if (deleteConfirmation.studentId) {
      const updated = students.filter(s => s.id !== deleteConfirmation.studentId);
      onSaveStudents(updated);
    }
    setDeleteConfirmation({ isOpen: false });
  };

  const handleSetStudentStatus = (id: string, newStatus: StudentStatus) => {
    const updated = students.map(s => {
      if (s.id === id) {
        return { ...s, status: newStatus };
      }
      return s;
    });
    onSaveStudents(updated);
  };

  // Bulk selection handlers
  const handleToggleSelectStudent = (id: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allFilteredIds = filteredStudents.map(s => s.id);
      setSelectedStudentIds(allFilteredIds);
    } else {
      setSelectedStudentIds([]);
    }
  };

  const isAllFilteredSelected =
    filteredStudents.length > 0 &&
    filteredStudents.every(s => selectedStudentIds.includes(s.id));

  const isSomeFilteredSelected =
    filteredStudents.some(s => selectedStudentIds.includes(s.id)) &&
    !isAllFilteredSelected;

  const handleBulkUpdateStatus = (newStatus: StudentStatus) => {
    if (selectedStudentIds.length === 0) return;
    const updated = students.map(s => {
      if (selectedStudentIds.includes(s.id)) {
        return { ...s, status: newStatus };
      }
      return s;
    });
    onSaveStudents(updated);
    setSelectedStudentIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedStudentIds.length === 0) return;
    if (confirm(`Hapus ${selectedStudentIds.length} data siswa terpilih dan bebaskan email mereka untuk pendaftaran baru?`)) {
      const updated = students.filter(s => !selectedStudentIds.includes(s.id));
      onSaveStudents(updated);
      setSelectedStudentIds([]);
    }
  };

  const handleForceCleanSingle = (std: Student) => {
    if (confirm(`Bersihkan berkas dan bebaskan email "${std.email}" milik siswa "${std.name}" agar dapat digunakan kembali untuk mendaftar?`)) {
      if (onForceCleanStudent) {
        onForceCleanStudent(std.id);
      } else {
        const updated = students.filter(s => s.id !== std.id);
        onSaveStudents(updated);
      }
    }
  };

  const handleCleanAllRejected = async () => {
    if (confirm(`Bersihkan seluruh ${rejectedStudents.length} berkas siswa yang ditolak dan bebaskan email mereka?`)) {
      setIsSyncing(true);
      try {
        await storageService.cleanRejectedOrInactiveStudents('ditolak');
        const fresh = storageService.getStudents();
        onSaveStudents(fresh);
        setSyncNotice(`✅ Seluruh ${rejectedStudents.length} berkas siswa ditolak telah dibersihkan.`);
        setTimeout(() => setSyncNotice(null), 3000);
      } catch (err) {
        console.error('Error cleaning rejected students:', err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleCleanAllDeactivated = async () => {
    if (confirm(`Bersihkan seluruh ${deactivatedStudents.length} berkas siswa yang dinonaktifkan?`)) {
      setIsSyncing(true);
      try {
        await storageService.cleanRejectedOrInactiveStudents('nonaktif');
        const fresh = storageService.getStudents();
        onSaveStudents(fresh);
        setSyncNotice(`✅ Seluruh berkas siswa nonaktif telah dibersihkan.`);
        setTimeout(() => setSyncNotice(null), 3000);
      } catch (err) {
        console.error('Error cleaning deactivated students:', err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleSelectAllInSchool = (schoolName: string) => {
    const schoolStudentIds = filteredStudents
      .filter(s => (s.schoolName || 'Tanpa Sekolah / Umum') === schoolName)
      .map(s => s.id);

    const allAlreadySelected = schoolStudentIds.every(id => selectedStudentIds.includes(id));

    if (allAlreadySelected) {
      setSelectedStudentIds(prev => prev.filter(id => !schoolStudentIds.includes(id)));
    } else {
      setSelectedStudentIds(prev => Array.from(new Set([...prev, ...schoolStudentIds])));
    }
  };

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncNotice(null);
    try {
      const fresh = await storageService.fetchLatestStudentsData();
      onSaveStudents(fresh);
      const pendingCount = fresh.filter(s => s.status === 'pending').length;
      setSyncNotice(`✅ Data berhasil disinkronkan dari server Firestore! (${fresh.length} siswa, ${pendingCount} pendaftaran pending)`);
      setTimeout(() => setSyncNotice(null), 4000);
    } catch (err: any) {
      console.error('Error syncing student data:', err);
      setSyncNotice('❌ Gagal menyinkronkan data dari server.');
      setTimeout(() => setSyncNotice(null), 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleApproveAllPending = async () => {
    if (confirm(`Setujui (ACC) seluruh ${pendingStudents.length} siswa pendaftar baru?`)) {
      setIsSyncing(true);
      try {
        const updated = await storageService.syncAndSaveStudents((currentRemote) => {
          return currentRemote.map(s => {
            if (s.status === 'pending') {
              return { ...s, status: 'disetujui' as const };
            }
            return s;
          });
        });
        onSaveStudents(updated);
        setSyncNotice(`✅ Seluruh pendaftaran berhasil disetujui!`);
        setTimeout(() => setSyncNotice(null), 3000);
      } catch (err) {
        console.error('Error approving students:', err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleSaveStudentFromForm = async (data: {
    name: string;
    email: string;
    password?: string;
    gender: 'Laki-laki' | 'Perempuan';
    tingkat: TingkatType;
    schoolName: string;
    className: string;
    rombelName: string;
  }) => {
    setIsSyncing(true);
    try {
      if (editingStudent) {
        // Edit student with remote sync
        const updated = await storageService.syncAndSaveStudents((currentRemote) => {
          return currentRemote.map(s => {
            if (s.id === editingStudent.id) {
              return {
                ...s,
                name: data.name,
                email: data.email,
                password: data.password || s.password,
                gender: data.gender,
                tingkat: data.tingkat,
                schoolName: data.schoolName,
                className: data.className,
                rombelName: data.rombelName,
              };
            }
            return s;
          });
        });
        onSaveStudents(updated);
      } else {
        // Add new student (directly active since added by Guru)
        const newStudent: Student = {
          id: `std-${Date.now()}`,
          name: data.name,
          email: data.email,
          password: data.password || '123456',
          nisn: `2026${Math.floor(1000 + Math.random() * 9000)}`,
          gender: data.gender,
          tingkat: data.tingkat,
          schoolName: data.schoolName,
          className: data.className,
          rombelName: data.rombelName,
          avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
          totalXP: 0,
          completedMaterials: [],
          attempts: [],
          status: 'aktif',
          lastActive: new Date().toISOString(),
        };
        const res = await storageService.addStudent(newStudent);
        if (res.success) {
          const fresh = storageService.getStudents();
          onSaveStudents(fresh);
        }
      }
    } catch (err) {
      console.error('Error saving student from form:', err);
    } finally {
      setIsSyncing(false);
      setIsModalOpen(false);
    }
  };

  // Build Hierarchy for Grouped View (Sekolah -> Tingkat -> Kelas/Rombel)
  const groupedData: Record<
    string,
    Record<string, Record<string, Student[]>>
  > = {};

  filteredStudents.forEach(std => {
    const school = std.schoolName || 'Tanpa Sekolah / Umum';
    const tingkat = std.tingkat || 'Lainnya';
    const rombel = std.rombelName || std.className || 'Umum';

    if (!groupedData[school]) groupedData[school] = {};
    if (!groupedData[school][tingkat]) groupedData[school][tingkat] = {};
    if (!groupedData[school][tingkat][rombel]) groupedData[school][tingkat][rombel] = [];

    groupedData[school][tingkat][rombel].push(std);
  });

  return (
    <div className="space-y-6">
      {/* Header & Main Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Data & Pengelompokan Siswa
            </h2>
            {pendingStudents.length > 0 && (
              <span className="px-2.5 py-0.5 bg-amber-500 text-white font-extrabold text-[11px] rounded-full animate-pulse">
                {pendingStudents.length} Menunggu ACC
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manajemen pendaftaran siswa, konfirmasi ACC, serta pengelompokan berdasarkan asal sekolah, tingkat, dan kelas.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowExportModal(true)}
            className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FileSpreadsheet size={16} className="text-emerald-700" /> Ekspor Nilai (CSV/Excel)
          </button>

          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            title="Sinkronkan data siswa terbaru dari server Firestore"
          >
            <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} /> {isSyncing ? 'Menyinkronkan...' : 'Sync Realtime'}
          </button>

          <button
            onClick={() => setShowLogsVisitsModal(true)}
            className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Activity size={16} className="text-amber-400" /> Tinjau Log & Kunjungan
          </button>

          {pendingStudents.length > 0 && (
            <button
              onClick={handleApproveAllPending}
              className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <CheckCircle2 size={16} /> Setujui ({pendingStudents.length}) Pending
            </button>
          )}

          <button
            onClick={() => setShowCredentialsModal(true)}
            className="px-3.5 py-2.5 bg-slate-950 hover:bg-slate-900 text-emerald-300 border border-emerald-500/40 rounded-xl font-extrabold text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <KeyRound size={16} className="text-emerald-400" /> Akses Akun & Password Siswa
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-900/10 flex items-center gap-2 transition-all cursor-pointer"
          >
            <UserPlus size={18} /> Tambah Siswa Baru
          </button>
        </div>
      </div>

      {syncNotice && (
        <div className="p-3.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 rounded-2xl text-blue-900 dark:text-blue-200 text-xs font-bold flex items-center justify-between">
          <span>{syncNotice}</span>
          <button onClick={() => setSyncNotice(null)} className="text-blue-500 hover:text-blue-700 font-bold ml-2">✕</button>
        </div>
      )}

      {/* Primary Column Menu Navigation: ACC Siswa vs Siswa Aktif vs Semua vs Akses Akun */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* MENU 1: ACC SISWA */}
        <button
          type="button"
          onClick={() => {
            setActiveMainSection('acc');
            setStatusTab('pending');
          }}
          className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer relative overflow-hidden flex items-center justify-between gap-3 ${
            activeMainSection === 'acc'
              ? 'bg-gradient-to-r from-amber-500/15 via-amber-50 to-white border-amber-500 shadow-md ring-2 ring-amber-500/20'
              : 'bg-white border-slate-200 hover:border-amber-300 hover:bg-slate-50 shadow-xs'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-3 rounded-2xl shrink-0 ${
              activeMainSection === 'acc' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'bg-slate-100 text-slate-600'
            }`}>
              <UserCheck size={22} />
            </div>
            <div className="min-w-0">
              <div className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5 flex-wrap">
                <span>Menu ACC Siswa</span>
                {pendingStudents.length > 0 ? (
                  <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full animate-pulse">
                    {pendingStudents.length} ACC
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-500 font-bold text-[10px] rounded-full">
                    0
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                Persetujuan pendaftaran siswa baru
              </p>
            </div>
          </div>
          <ChevronRight size={18} className={`shrink-0 ${activeMainSection === 'acc' ? 'text-amber-600' : 'text-slate-300'}`} />
        </button>

        {/* MENU 2: SISWA AKTIF */}
        <button
          type="button"
          onClick={() => {
            setActiveMainSection('aktif');
            setStatusTab('disetujui');
          }}
          className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer relative overflow-hidden flex items-center justify-between gap-3 ${
            activeMainSection === 'aktif'
              ? 'bg-gradient-to-r from-emerald-600/15 via-emerald-50 to-white border-emerald-600 shadow-md ring-2 ring-emerald-600/20'
              : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-slate-50 shadow-xs'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-3 rounded-2xl shrink-0 ${
              activeMainSection === 'aktif' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
            }`}>
              <Users size={22} />
            </div>
            <div className="min-w-0">
              <div className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5 flex-wrap">
                <span>Menu Siswa Aktif</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] rounded-full">
                  {approvedStudents.length} Aktif
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                Daftar & progres siswa terkonfirmasi
              </p>
            </div>
          </div>
          <ChevronRight size={18} className={`shrink-0 ${activeMainSection === 'aktif' ? 'text-emerald-600' : 'text-slate-300'}`} />
        </button>

        {/* MENU 3: SEMUA DATA SISWA */}
        <button
          type="button"
          onClick={() => {
            setActiveMainSection('semua');
            setStatusTab('semua');
          }}
          className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer relative overflow-hidden flex items-center justify-between gap-3 ${
            activeMainSection === 'semua'
              ? 'bg-gradient-to-r from-slate-900/10 via-slate-50 to-white border-slate-800 shadow-md ring-2 ring-slate-800/20'
              : 'bg-white border-slate-200 hover:border-slate-400 hover:bg-slate-50 shadow-xs'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-3 rounded-2xl shrink-0 ${
              activeMainSection === 'semua' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
            }`}>
              <GraduationCap size={22} />
            </div>
            <div className="min-w-0">
              <div className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5 flex-wrap">
                <span>Semua Data Siswa</span>
                <span className="px-2 py-0.5 bg-slate-200 text-slate-700 font-bold text-[10px] rounded-full">
                  {students.length} Total
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                Arsip lengkap (ACC, Aktif, Ditolak)
              </p>
            </div>
          </div>
          <ChevronRight size={18} className={`shrink-0 ${activeMainSection === 'semua' ? 'text-slate-800' : 'text-slate-300'}`} />
        </button>

        {/* MENU 4: AKSES AKUN & RESET PASSWORD */}
        <button
          type="button"
          onClick={() => setShowCredentialsModal(true)}
          className="p-4 rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-left transition-all cursor-pointer relative overflow-hidden flex items-center justify-between gap-3 shadow-md hover:border-emerald-400 hover:shadow-lg group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-3 rounded-2xl shrink-0 bg-emerald-500 text-slate-950 shadow-sm group-hover:scale-105 transition-transform">
              <KeyRound size={22} />
            </div>
            <div className="min-w-0">
              <div className="font-extrabold text-sm text-white flex items-center gap-1.5 flex-wrap">
                <span>Akses Akun & Sandi</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black text-[10px] rounded-full">
                  Admin
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium truncate mt-0.5">
                Lihat username & reset password
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="shrink-0 text-emerald-400" />
        </button>
      </div>

      {/* Contextual Banner Header based on active menu */}
      {activeMainSection === 'acc' && (
        <div className="p-4 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 rounded-2xl shadow-md border border-amber-400 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-950 text-amber-400 rounded-xl shadow-xs shrink-0">
              <UserCheck size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-950 flex items-center gap-2">
                📋 Menu ACC Siswa (Persetujuan Pendaftaran)
              </h3>
              <p className="text-xs text-amber-950 font-medium">
                Pilih sekolah asal untuk memproses pendaftaran, atau gunakan centang (checkbox) untuk ACC / Tolak massal.
              </p>
            </div>
          </div>
          {pendingStudents.length > 0 && (
            <button
              onClick={handleApproveAllPending}
              className="px-3.5 py-2 bg-slate-950 hover:bg-slate-900 text-amber-300 font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              <CheckCircle2 size={16} /> ACC Seluruh ({pendingStudents.length}) Pending
            </button>
          )}
        </div>
      )}

      {activeMainSection === 'aktif' && (
        <div className="p-4 bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white rounded-2xl shadow-md border border-emerald-700/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500 text-slate-950 rounded-xl shadow-xs shrink-0">
              <Users size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                🎓 Menu Daftar Siswa Aktif
              </h3>
              <p className="text-xs text-slate-300 font-medium">
                Menampilkan daftar seluruh siswa yang terkonfirmasi aktif, dikelompokkan per Asal Sekolah, Tingkat, & Rombel.
              </p>
            </div>
          </div>
          <div className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black rounded-xl shrink-0">
            {approvedStudents.length} Siswa Aktif
          </div>
        </div>
      )}

      {/* Tabs & View Switcher Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setStatusTab('semua')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusTab === 'semua'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Semua ({students.length})
            </button>
            <button
              onClick={() => setStatusTab('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                statusTab === 'pending'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Clock size={13} /> Pending ({pendingStudents.length})
            </button>
            <button
              onClick={() => setStatusTab('disetujui')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                statusTab === 'disetujui'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <CheckCircle2 size={13} /> Disetujui ({approvedStudents.length})
            </button>
            <button
              onClick={() => setStatusTab('ditolak')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                statusTab === 'ditolak'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <XCircle size={13} /> Ditolak ({rejectedStudents.length})
            </button>
            <button
              onClick={() => setStatusTab('nonaktif')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                statusTab === 'nonaktif'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <AlertTriangle size={13} /> Nonaktif ({deactivatedStudents.length})
            </button>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                viewMode === 'cards'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid size={14} /> Kartu Siswa (Dekstop Grid)
            </button>
            <button
              onClick={() => setViewMode('grouped')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                viewMode === 'grouped'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers size={14} /> Berkelompok (Sekolah → Tingkat → Kelas)
            </button>
            <button
              onClick={() => setViewMode('flat')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                viewMode === 'flat'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ListFilter size={14} /> Tabel Semua Siswa
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative col-span-1 sm:col-span-1">
            <Search size={16} className="absolute left-3.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, email, sekolah, rombel..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setShowPredictions(true);
              }}
              onFocus={() => setShowPredictions(true)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-emerald-500 shadow-2xs"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setShowPredictions(false);
                }}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
              >
                <X size={14} />
              </button>
            )}

            {/* PREDICTIVE AUTOCOMPLETE DROPDOWN */}
            {showPredictions && studentPredictions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-100 animate-fadeIn">
                <div className="px-3 py-1.5 bg-slate-100/90 text-[10px] font-extrabold uppercase tracking-wider text-slate-600 flex items-center justify-between">
                  <span>✨ Prediksi Nama Siswa ({studentPredictions.length})</span>
                  <span className="text-[9px] text-slate-400 font-normal">Klik untuk memilih</span>
                </div>
                {studentPredictions.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      setSearchTerm(st.name);
                      setShowPredictions(false);
                    }}
                    className="w-full p-2.5 text-left hover:bg-emerald-50/80 transition-colors flex items-center justify-between gap-2 group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={st.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={st.name}
                        className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200 shadow-2xs"
                      />
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 truncate">
                          {st.name}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          Kelas {st.className} • {st.schoolName || 'Tanpa Sekolah'}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border shrink-0 ${
                      st.status === 'pending'
                        ? 'bg-amber-50 text-amber-700 border-amber-300'
                        : st.status === 'ditolak'
                        ? 'bg-rose-50 text-rose-700 border-rose-300'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    }`}>
                      {st.status === 'pending' ? 'Pending' : st.status === 'ditolak' ? 'Ditolak' : 'Aktif'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <select
              value={selectedSchoolFilter}
              onChange={e => setSelectedSchoolFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:border-emerald-500"
            >
              <option value="semua">🏢 Filter Sekolah: Semua ({allSchoolNames.length} Sekolah)</option>
              {allSchoolNames.map(sch => (
                <option key={sch} value={sch}>🏫 {sch}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:border-emerald-500"
            >
              <option value="semua">📚 Filter Kelas: Semua ({allClasses.length} Kelas)</option>
              {allClasses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* BULK ACTION BANNER */}
      <AnimatePresence>
        {selectedStudentIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -5 }}
            transition={{ duration: 0.2 }}
            className="p-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl shadow-lg border border-emerald-700/60 flex flex-wrap items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl shadow-xs">
                {selectedStudentIds.length} Dipilih
              </span>
              <div>
                <div className="font-extrabold text-xs text-white flex items-center gap-1.5">
                  <Sparkles size={14} className="text-emerald-400" />
                  Aksi Massal (Bulk Action) Terpilih
                </div>
                <div className="text-[11px] text-slate-300">
                  Perbarui status pendaftaran untuk {selectedStudentIds.length} siswa sekaligus
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleBulkUpdateStatus('disetujui')}
                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <CheckCircle2 size={16} /> Setujui ({selectedStudentIds.length}) Siswa
              </button>
              <button
                type="button"
                onClick={() => handleBulkUpdateStatus('ditolak')}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <XCircle size={16} /> Tolak ({selectedStudentIds.length}) Siswa
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                className="px-3.5 py-2 bg-rose-800 hover:bg-rose-900 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                title="Hapus akun terpilih dan bebaskan email untuk pendaftaran baru"
              >
                <Trash2 size={15} /> Hapus & Bebaskan Email ({selectedStudentIds.length})
              </button>
              <button
                type="button"
                onClick={() => handleBulkUpdateStatus('pending')}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl transition-all cursor-pointer border border-slate-700"
              >
                Set Ke Pending
              </button>
              <button
                type="button"
                onClick={() => setSelectedStudentIds([])}
                className="px-3 py-2 text-slate-300 hover:text-white hover:bg-white/10 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Batal
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pending Registrations Notice */}
      {statusTab === 'pending' && pendingStudents.length === 0 && (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs font-semibold">
          Tidak ada pendaftaran siswa yang sedang menunggu ACC.
        </div>
      )}

      {/* Rejected Accounts Notice & Quick Clean */}
      {statusTab === 'ditolak' && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-rose-900 font-semibold">
            <XCircle size={18} className="text-rose-600 shrink-0" />
            <span>
              Terdapat <strong>{rejectedStudents.length} akun ditolak</strong>. Siswa dengan status ditolak dapat langsung mendaftar ulang kapan saja menggunakan email yang sama.
            </span>
          </div>
          {rejectedStudents.length > 0 && (
            <button
              type="button"
              onClick={handleCleanAllRejected}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5 text-xs"
            >
              <Trash2 size={13} /> Bersihkan Seluruh Berkas Ditolak ({rejectedStudents.length})
            </button>
          )}
        </div>
      )}

      {/* Deactivated Accounts Notice & Quick Clean */}
      {statusTab === 'nonaktif' && (
        <div className="p-4 bg-slate-100 border border-slate-300 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-slate-800 font-semibold">
            <AlertTriangle size={18} className="text-slate-600 shrink-0" />
            <span>
              Terdapat <strong>{deactivatedStudents.length} akun dinonaktifkan</strong>. Akun nonaktif tidak dapat masuk ke sistem sampai diaktifkan kembali atau didaftarkan ulang.
            </span>
          </div>
          {deactivatedStudents.length > 0 && (
            <button
              type="button"
              onClick={handleCleanAllDeactivated}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5 text-xs"
            >
              <Trash2 size={13} /> Bersihkan Akun Nonaktif ({deactivatedStudents.length})
            </button>
          )}
        </div>
      )}

      {/* VIEW MODE 0: DEKSTOP CARDS GRID (Kartu Siswa Portrait Mode) */}
      {viewMode === 'cards' && (
        <div className="space-y-4">
          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs font-semibold">
              Tidak ada data siswa ditemukan.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredStudents.map((std) => {
                const isSelected = selectedStudentIds.includes(std.id);
                const vocabCount = Object.values(std.hafalanProgress?.kosakataIds || {}).filter(Boolean).length;
                const mahfudzotCount = Object.values(std.hafalanProgress?.mahfudzotChecklist || {}).filter(
                  (c: any) => c && c.hafalanArab && c.hafalanTerjemah && c.pengetahuanKosakata && c.pemahamanMateri
                ).length;

                const theme = getTingkatColorTheme(std.tingkat, std.className);

                return (
                  <div
                    key={std.id}
                    className={`bg-white rounded-3xl border transition-all duration-300 shadow-xs hover:shadow-xl flex flex-col justify-between relative overflow-hidden group ${
                      isSelected
                        ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-50/20'
                        : theme.cardBorder
                    }`}
                  >
                    {/* Portrait Card Header Banner */}
                    <div>
                      <div className={`h-22 ${theme.headerBg} p-3.5 flex items-start justify-between relative overflow-hidden`}>
                        {/* Subtle background pattern */}
                        <div className="absolute right-0 top-0 opacity-15 font-arabic text-6xl select-none pointer-events-none text-white pr-2 pt-1">
                          طَالِب
                        </div>

                        {/* Top Left: Selection Checkbox */}
                        <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/20 z-10">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectStudent(std.id)}
                            className="w-4 h-4 text-emerald-600 rounded-md border-slate-300 focus:ring-emerald-500 cursor-pointer accent-emerald-600 shrink-0"
                          />
                          <span className="text-[10px] font-extrabold text-white">
                            {isSelected ? 'Terpilih' : 'Pilih'}
                          </span>
                        </div>

                        {/* Top Right: Status Badge Selector */}
                        <select
                          value={std.status}
                          onChange={e => handleSetStudentStatus(std.id, e.target.value as StudentStatus)}
                          className={`text-[11px] font-extrabold py-1 px-2.5 rounded-xl border cursor-pointer focus:outline-hidden transition-all shadow-md z-10 ${
                            std.status === 'aktif' || std.status === 'disetujui'
                              ? 'bg-emerald-500 text-white border-emerald-400'
                              : std.status === 'pending'
                              ? 'bg-amber-500 text-white border-amber-400'
                              : std.status === 'ditolak'
                              ? 'bg-rose-500 text-white border-rose-400'
                              : 'bg-slate-700 text-slate-200 border-slate-600'
                          }`}
                        >
                          <option value="pending">⏳ Pending</option>
                          <option value="disetujui">✅ ACC (Aktif)</option>
                          <option value="ditolak">❌ Tolak</option>
                          <option value="nonaktif">🚫 Nonaktif</option>
                        </select>
                      </div>

                      {/* Enlarged Centered Profile Picture (Portrait Card Feature) */}
                      <div className="relative -mt-11 mx-auto z-10 flex flex-col items-center">
                        <div className="relative group-hover:scale-105 transition-transform duration-300">
                          <img
                            src={std.avatar}
                            alt={std.name}
                            className={`w-22 h-22 sm:w-24 sm:h-24 rounded-2xl object-cover bg-white shadow-md ${theme.avatarRing}`}
                          />
                          {/* Gender Overlay Badge */}
                          {std.gender && (
                            <span className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded-lg text-[10px] font-black shadow-xs border bg-white ${
                              std.gender === 'Perempuan' ? 'text-pink-600 border-pink-200' : 'text-blue-600 border-blue-200'
                            }`}>
                              {std.gender === 'Perempuan' ? '👩 Per' : '👨 Lak'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Student Main Info Stack */}
                      <div className="p-5 pt-3 text-center space-y-3">
                        <div>
                          <h4 className="font-black text-slate-900 text-base sm:text-lg leading-snug line-clamp-1 group-hover:text-emerald-700 transition-colors">
                            {std.name}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            NISN: <span className="font-mono text-slate-800 font-bold">{std.nisn}</span>
                          </p>
                        </div>

                        {/* Tingkat & Class Badges */}
                        <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs">
                          <span className={`px-2.5 py-1 text-[11px] font-black rounded-xl border shadow-2xs ${theme.badgeBg}`}>
                            {theme.label}
                          </span>
                          <span className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                            <GraduationCap size={13} className="text-slate-500" />
                            {std.className} ({std.rombelName || 'Rombel A'})
                          </span>
                        </div>

                        {/* School Name */}
                        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600 font-semibold px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100 truncate">
                          <Building2 size={14} className="text-emerald-600 shrink-0" />
                          <span className="truncate">{std.schoolName || 'Tanpa Sekolah'}</span>
                        </div>

                        {/* Stats Summary Box: EXP & Hafalan */}
                        <div className="space-y-2 pt-1">
                          <div className={`p-2.5 rounded-2xl border flex items-center justify-between text-xs font-bold ${theme.xpBadge}`}>
                            <span className="flex items-center gap-1.5">
                              <Award size={15} className="text-amber-500" /> Total Poin EXP
                            </span>
                            <span className="text-amber-900 font-black text-sm">
                              +{std.totalXP} XP
                            </span>
                          </div>

                          <div className={`p-2.5 rounded-2xl border text-[11px] flex items-center justify-between font-semibold ${theme.bgAccent} border-slate-200/60`}>
                            <span className="flex items-center gap-1 text-slate-700">
                              <Quote size={13} className="text-purple-600" /> Setoran Hafalan
                            </span>
                            <span className="text-purple-900 font-black">
                              {vocabCount} Vocab • {mahfudzotCount} Mfz
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Toolbar */}
                    <div className="p-4 pt-2 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-1.5">
                      <button
                        type="button"
                        onClick={() => setStudentForHafalanChecklist(std)}
                        className="px-3 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                        title="Buka Ceklis Hafalan Kosakata & Mahfudzot"
                      >
                        <CheckSquare size={14} />
                        <span>Ceklis Hafalan</span>
                      </button>

                      <div className="flex items-center gap-1">
                        {(std.status === 'ditolak' || std.status === 'nonaktif') && (
                          <button
                            type="button"
                            onClick={() => handleForceCleanSingle(std)}
                            className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer shadow-2xs flex items-center gap-1"
                            title="Bersihkan berkas dan bebaskan email agar siswa dapat mendaftar ulang"
                          >
                            <Trash2 size={13} className="text-amber-700" />
                            <span className="hidden sm:inline">Bebaskan Email</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStudentForCredentialsId(std.id);
                            setShowCredentialsModal(true);
                          }}
                          className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-xl transition-all cursor-pointer border border-emerald-200 dark:border-emerald-800 shadow-2xs"
                          title="Akses Akun & Ubah Password Siswa ini"
                        >
                          <KeyRound size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onSwitchToStudentSession?.(std)}
                          className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
                          title="Uji Log In sebagai Siswa ini"
                        >
                          <UserCheck size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedStudentForDetail(std)}
                          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
                          title="Lihat Detail Siswa"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(std)}
                          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
                          title="Edit Data Siswa"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => requestDeleteStudent(std)}
                          className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all cursor-pointer"
                          title="Hapus Siswa"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 1: GROUPED BY SCHOOL -> TINGKAT -> KELAS / ROMBEL */}
      {viewMode === 'grouped' && (
        <div className="space-y-6">
          {Object.keys(groupedData).length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs font-semibold">
              Tidak ada data siswa yang cocok dengan filter.
            </div>
          ) : (
            Object.entries(groupedData).map(([schoolName, tingkatMap]) => {
              const totalInSchool = Object.values(tingkatMap).reduce(
                (sum, rMap) => sum + Object.values(rMap).reduce((s2, list) => s2 + list.length, 0),
                0
              );

              const isCollapsed = collapsedSchools[schoolName];

              return (
                <div
                  key={schoolName}
                  className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden transition-all"
                >
                  {/* Outer Group: Sekolah Header */}
                  <div className="p-4 bg-gradient-to-r from-slate-900 to-emerald-950 text-white flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleSchoolCollapse(schoolName)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
                      >
                        {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <Building2 size={18} className="text-emerald-400 shrink-0" />
                          <h3 className="font-extrabold text-base text-white">{schoolName}</h3>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium">
                          Total {totalInSchool} Siswa Terdaftar
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectAllInSchool(schoolName)}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Check size={14} className="text-emerald-400" />
                        Pilih Semua Siswa Sekolah Ini
                      </button>

                      <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-extrabold rounded-xl">
                        {totalInSchool} Siswa
                      </span>
                    </div>
                  </div>

                  {/* Inner Group Content */}
                  {!isCollapsed && (
                    <div className="p-5 space-y-6 bg-slate-50/60">
                      {Object.entries(tingkatMap).map(([tingkatName, rombelMap]) => (
                        <div key={tingkatName} className="space-y-4">
                          {/* Sub Group Header: Tingkat */}
                          <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                            <GraduationCap size={16} className="text-emerald-600" />
                            <span className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                              Tingkat: {tingkatName}
                            </span>
                          </div>

                          {/* Inner Sub Group: Rombel / Kelas */}
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {Object.entries(rombelMap).map(([rombelName, listSiswa]) => (
                              <div
                                key={rombelName}
                                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3"
                              >
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                                    <Users size={14} className="text-emerald-600" />
                                    <span>Kelas / Rombel: {rombelName}</span>
                                  </div>
                                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-extrabold rounded-md">
                                    {listSiswa.length} Siswa
                                  </span>
                                </div>

                                {/* Student List Items in Rombel */}
                                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                                  {listSiswa.map(std => {
                                    const isSelected = selectedStudentIds.includes(std.id);
                                    return (
                                      <div
                                        key={std.id}
                                        className={`p-2.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors ${
                                          isSelected
                                            ? 'bg-emerald-50/90 border-emerald-300'
                                            : 'bg-slate-50 border-slate-100 hover:bg-emerald-50/50'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                          <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => handleToggleSelectStudent(std.id)}
                                            className="w-4 h-4 text-emerald-600 rounded-md border-slate-300 focus:ring-emerald-500 cursor-pointer accent-emerald-600 shrink-0"
                                            title="Pilih Siswa"
                                          />
                                          <img
                                            src={std.avatar}
                                            alt={std.name}
                                            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                                          />
                                          <div className="min-w-0">
                                            <div className="font-bold text-slate-900 text-xs truncate">
                                              {std.name}
                                            </div>
                                            <div className="text-[10px] text-slate-400 truncate">
                                              {std.email}
                                            </div>
                                          </div>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-1 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                                          <select
                                            value={std.status === 'aktif' ? 'disetujui' : (std.status || 'pending')}
                                            onChange={(e) => handleSetStudentStatus(std.id, e.target.value as StudentStatus)}
                                            className={`px-2 py-1 text-[11px] font-bold rounded-lg border cursor-pointer focus:outline-hidden transition-all ${
                                              std.status === 'disetujui' || std.status === 'aktif'
                                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                                : std.status === 'ditolak'
                                                ? 'bg-rose-50 text-rose-800 border-rose-300'
                                                : 'bg-amber-50 text-amber-900 border-amber-300'
                                            }`}
                                          >
                                            <option value="pending">⏳ Pending</option>
                                            <option value="disetujui">✓ Disetujui</option>
                                            <option value="ditolak">✕ Ditolak</option>
                                          </select>

                                          <div className="flex items-center gap-1">
                                            <button
                                              onClick={() => {
                                                setSelectedStudentForCredentialsId(std.id);
                                                setShowCredentialsModal(true);
                                              }}
                                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[11px] font-extrabold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                                              title="Akses Akun & Ubah Password Siswa"
                                            >
                                              <KeyRound size={13} className="text-emerald-700" />
                                              <span>Sandi</span>
                                            </button>
                                            {onSwitchToStudentSession && (
                                              <button
                                                onClick={() => onSwitchToStudentSession(std)}
                                                className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[11px] font-extrabold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                                                title="Uji Akses / Simulasi Log In Sebagai Siswa Ini"
                                              >
                                                <UserCheck size={13} className="text-amber-600" />
                                                <span>Uji Log In</span>
                                              </button>
                                            )}
                                            <button
                                              onClick={() => setStudentForHafalanChecklist(std)}
                                              className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg text-[11px] font-extrabold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                                              title="Ceklis Setoran Hafalan Kosakata & Mahfudzot"
                                            >
                                              <CheckSquare size={13} className="text-purple-600" />
                                              <span>Ceklis</span>
                                            </button>
                                            <button
                                              onClick={() => setSelectedStudentForDetail(std)}
                                              className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                                              title="Detail Progres"
                                            >
                                              <Eye size={14} />
                                            </button>
                                            <button
                                              onClick={() => handleOpenEditModal(std)}
                                              className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
                                              title="Edit"
                                            >
                                              <Edit3 size={14} />
                                            </button>
                                            <button
                                              onClick={() => requestDeleteStudent(std)}
                                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                                              title="Hapus"
                                            >
                                              <Trash2 size={14} />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW MODE 2: FLAT TABLE */}
      {viewMode === 'flat' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Mobile Scroll Hint Bar */}
          <div className="sm:hidden px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
            <span className="flex items-center gap-1 text-emerald-700 font-bold">
              <Sparkles size={12} /> Tabel Responsif Seluler
            </span>
            <span className="text-slate-400">Geser ↔ untuk detail</span>
          </div>

          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
            <table className="w-full text-left text-xs sm:text-sm text-slate-600 min-w-[340px]">
              <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-3 sm:px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllFilteredSelected}
                      ref={el => {
                        if (el) el.indeterminate = isSomeFilteredSelected;
                      }}
                      onChange={handleSelectAllFiltered}
                      className="w-4 h-4 text-emerald-600 rounded-md border-slate-300 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                      title="Pilih Semua Siswa yang Tampil"
                    />
                  </th>
                  <th className="py-3.5 px-3 sm:px-4 min-w-[140px]">Siswa</th>
                  <th className="hidden md:table-cell py-3.5 px-4">Asal Sekolah</th>
                  <th className="hidden sm:table-cell py-3.5 px-4">Tingkat / Kelas / Rombel</th>
                  <th className="hidden lg:table-cell py-3.5 px-4 text-center">XP</th>
                  <th className="py-3.5 px-3 sm:px-4 text-center">Status</th>
                  <th className="py-3.5 px-3 sm:px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                      Tidak ada siswa ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map(std => {
                    const isSelected = selectedStudentIds.includes(std.id);
                    return (
                      <tr
                        key={std.id}
                        className={`transition-colors ${
                          isSelected ? 'bg-emerald-50/70' : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <td className="py-3.5 px-3 sm:px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectStudent(std.id)}
                            className="w-4 h-4 text-emerald-600 rounded-md border-slate-300 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                          />
                        </td>
                        <td className="py-3.5 px-3 sm:px-4">
                          <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
                            <img
                              src={std.avatar}
                              alt={std.name}
                              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-slate-200 shrink-0 mt-0.5 sm:mt-0"
                            />
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                                <span>{std.name}</span>
                                {std.gender && (
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                                    std.gender === 'Laki-laki'
                                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                      : 'bg-pink-50 text-pink-700 border border-pink-200'
                                  }`}>
                                    {std.gender === 'Laki-laki' ? '👨 L (طَالِبٌ)' : '👩 P (طَالِبَةٌ)'}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-400 truncate">{std.email}</div>

                              {/* Mobile Subtitle Badges for hidden table columns on small screens */}
                              <div className="mt-1 flex flex-wrap items-center gap-1 md:hidden">
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold border border-slate-200">
                                  🏫 {std.schoolName || 'Umum'}
                                </span>
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 text-emerald-800 rounded text-[10px] font-bold border border-emerald-200 sm:hidden">
                                  📚 {std.tingkat || 'Umum'} - {std.className} {std.rombelName ? `(${std.rombelName})` : ''}
                                </span>
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 text-amber-800 rounded text-[10px] font-bold border border-amber-200 lg:hidden">
                                  <Award size={10} /> {std.totalXP} XP
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="hidden md:table-cell py-3.5 px-4">
                          <div className="font-semibold text-slate-800">
                            {std.schoolName || 'Tanpa Sekolah / Umum'}
                          </div>
                        </td>
                        <td className="hidden sm:table-cell py-3.5 px-4">
                          <div className="text-xs font-bold text-emerald-800">
                            {std.tingkat || 'Umum'} - {std.className}
                          </div>
                          {std.rombelName && (
                            <div className="text-[11px] text-slate-500 font-medium">
                              Rombel: {std.rombelName}
                            </div>
                          )}
                        </td>
                        <td className="hidden lg:table-cell py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full text-xs border border-amber-200">
                            <Award size={14} /> {std.totalXP} XP
                          </span>
                        </td>
                        <td className="py-3.5 px-3 sm:px-4 text-center">
                          <select
                            value={std.status === 'aktif' ? 'disetujui' : (std.status || 'pending')}
                            onChange={(e) => handleSetStudentStatus(std.id, e.target.value as StudentStatus)}
                            className={`px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-bold rounded-xl border cursor-pointer focus:outline-hidden transition-all ${
                              std.status === 'disetujui' || std.status === 'aktif'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : std.status === 'ditolak'
                                ? 'bg-rose-50 text-rose-800 border-rose-300'
                                : std.status === 'nonaktif'
                                ? 'bg-slate-100 text-slate-800 border-slate-300'
                                : 'bg-amber-50 text-amber-900 border-amber-300'
                            }`}
                          >
                            <option value="pending">⏳ Pending</option>
                            <option value="disetujui">✓ Disetujui</option>
                            <option value="ditolak">✕ Ditolak</option>
                            <option value="nonaktif">🚫 Nonaktif</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-3 sm:px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {(std.status === 'ditolak' || std.status === 'nonaktif') && (
                              <button
                                onClick={() => handleForceCleanSingle(std)}
                                className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-extrabold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                                title="Bersihkan berkas dan bebaskan email agar siswa dapat mendaftar ulang"
                              >
                                <Trash2 size={13} className="text-amber-700" />
                                <span className="hidden sm:inline">Bebaskan Email</span>
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setSelectedStudentForCredentialsId(std.id);
                                setShowCredentialsModal(true);
                              }}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-extrabold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                              title="Akses Akun & Ubah Password Siswa"
                            >
                              <KeyRound size={13} className="text-emerald-700" />
                              <span>Sandi</span>
                            </button>
                            {onSwitchToStudentSession && (
                              <button
                                onClick={() => onSwitchToStudentSession(std)}
                                className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-extrabold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                                title="Uji Akses / Simulasi Log In Sebagai Siswa Ini"
                              >
                                <UserCheck size={14} className="text-amber-600" />
                                <span>Uji Log In</span>
                              </button>
                            )}
                            <button
                              onClick={() => setStudentForHafalanChecklist(std)}
                              className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg text-xs font-extrabold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                              title="Ceklis Setoran Hafalan Kosakata & Mahfudzot"
                            >
                              <CheckSquare size={14} className="text-purple-600" />
                              <span>Ceklis</span>
                            </button>
                            <button
                              onClick={() => setSelectedStudentForDetail(std)}
                              className="p-1 sm:p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Detail Progres"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(std)}
                              className="p-1 sm:p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Edit Data"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => requestDeleteStudent(std)}
                              className="p-1 sm:p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: EDIT / TAMBAH SISWA FORM */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 my-auto"
            >
              <div className="p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
                <h3 className="font-extrabold text-base">
                  {editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-200 hover:text-white p-1 rounded-lg cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-5">
                <PendaftaranSiswaForm
                  existingStudents={students}
                  initialStudent={editingStudent || undefined}
                  onRegisterSubmit={handleSaveStudentFromForm}
                  isGuruAdminMode={true}
                  editingStudentId={editingStudent?.id}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 2: DETAIL PROGRES SISWA */}
      <AnimatePresence>
        {selectedStudentForDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-100 my-auto max-h-[90vh] flex flex-col"
            >
              <div className="p-5 bg-gradient-to-r from-slate-900 to-emerald-950 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedStudentForDetail.avatar}
                    alt={selectedStudentForDetail.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400"
                  />
                  <div>
                    <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                      <span>{selectedStudentForDetail.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-white/20 text-white font-bold">
                        {selectedStudentForDetail.gender === 'Perempuan' ? '👩 Perempuan (طَالِبَةٌ)' : '👨 Laki-laki (طَالِبٌ)'}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-300">
                      {selectedStudentForDetail.schoolName || 'Tanpa Sekolah'} • {selectedStudentForDetail.className} ({selectedStudentForDetail.rombelName || '-'})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudentForDetail(null)}
                  className="text-slate-300 hover:text-white p-1 rounded-lg cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-5 overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="text-[11px] text-slate-500 font-semibold">Tingkat & Status</div>
                    <div className="font-extrabold text-xs text-slate-900 mt-1">
                      {selectedStudentForDetail.tingkat || 'Umum'} • Status {selectedStudentForDetail.status.toUpperCase()}
                    </div>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
                    <div className="text-[11px] text-amber-700 font-semibold">Total Capaian XP</div>
                    <div className="font-extrabold text-xs text-amber-900 mt-1 flex items-center gap-1">
                      <Award size={14} /> {selectedStudentForDetail.totalXP} XP
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BookOpen size={14} className="text-emerald-600" /> Modul Materi Selesai ({selectedStudentForDetail.completedMaterials.length})
                  </h4>
                  {selectedStudentForDetail.completedMaterials.length === 0 ? (
                    <p className="text-xs text-slate-400 font-medium">Belum ada materi yang diselesaikan.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedStudentForDetail.completedMaterials.map(matId => {
                        const matObj = materiList.find(m => m.id === matId);
                        return (
                          <span key={matId} className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-lg">
                            ✓ {matObj ? matObj.title : matId}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Credentials / Password Block */}
                <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div>
                    <div className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                      <KeyRound size={14} className="text-emerald-700" /> Kredensial Akun & Kata Sandi
                    </div>
                    <div className="text-xs text-slate-700 font-medium mt-1">
                      Username / Email: <span className="font-mono font-bold text-slate-900">{selectedStudentForDetail.email}</span>
                    </div>
                    <div className="text-xs text-slate-700 font-medium">
                      Kata Sandi: <span className="font-mono font-bold text-emerald-800">{selectedStudentForDetail.password || '123456'}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const sid = selectedStudentForDetail.id;
                      setSelectedStudentForDetail(null);
                      setSelectedStudentForCredentialsId(sid);
                      setShowCredentialsModal(true);
                    }}
                    className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-all"
                  >
                    <KeyRound size={13} /> Ubah / Reset Sandi
                  </button>
                </div>

                {onSwitchToStudentSession && (
                  <div className="pt-3 border-t border-slate-200">
                    <button
                      onClick={() => {
                        const std = selectedStudentForDetail;
                        setSelectedStudentForDetail(null);
                        onSwitchToStudentSession(std);
                      }}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      <UserCheck size={16} />
                      <span>Uji Akses / Simulasi Log In Sebagai Siswa Ini</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 3: DELETE CONFIRMATION SISWA */}
      <AnimatePresence>
        {deleteConfirmation.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 my-auto space-y-0"
            >
              <div className="p-4 bg-rose-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={20} className="text-rose-100" />
                  <h3 className="font-extrabold text-sm">Konfirmasi Hapus Siswa</h3>
                </div>
                <button
                  onClick={() => setDeleteConfirmation({ isOpen: false })}
                  className="p-1 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-3">
                <p className="text-xs text-slate-700 font-medium">
                  Apakah Anda yakin ingin menghapus data siswa <strong className="text-slate-900 font-bold">{deleteConfirmation.studentName}</strong>?
                </p>
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-semibold">
                  ⚠️ Perhatian: Data progres dan riwayat siswa ini akan terhapus.
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmation({ isOpen: false })}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteStudent}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 size={14} /> Ya, Hapus Siswa
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {/* Modal Ceklis Hafalan Setoran Offline */}
        <CeklisHafalanModal
          isOpen={!!studentForHafalanChecklist}
          onClose={() => setStudentForHafalanChecklist(null)}
          student={studentForHafalanChecklist}
          materiList={materiList}
          onSaveStudent={(updatedStudent) => {
            const nextList = students.map(s => s.id === updatedStudent.id ? updatedStudent : s);
            onSaveStudents(nextList);
            if (selectedStudentForDetail?.id === updatedStudent.id) {
              setSelectedStudentForDetail(updatedStudent);
            }
          }}
        />

        {/* Modal Overlay Siswa Activity Logs & Visit Analytics */}
        {showLogsVisitsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
            <div className="w-full my-auto">
              <SiswaActivityVisitsView
                students={students}
                logs={activeLogs}
                onClose={() => setShowLogsVisitsModal(false)}
              />
            </div>
          </div>
        )}

        {/* MODAL OVERLAY: Export Nilai Siswa */}
        <ExportNilaiModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          students={students}
        />

        {/* MODAL OVERLAY: Akses Akun & Reset Kata Sandi Siswa */}
        <SiswaCredentialsModal
          isOpen={showCredentialsModal}
          onClose={() => {
            setShowCredentialsModal(false);
            setSelectedStudentForCredentialsId(undefined);
          }}
          students={students}
          onSaveStudents={onSaveStudents}
          initialSelectedStudentId={selectedStudentForCredentialsId}
          onSwitchToStudentSession={onSwitchToStudentSession}
        />
      </AnimatePresence>
    </div>
  );
};
