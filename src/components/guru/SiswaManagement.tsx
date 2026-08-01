import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, StudentStatus, Materi, TingkatType } from '../../types';
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
  ChevronRight
} from 'lucide-react';
import { PendaftaranSiswaForm } from '../auth/PendaftaranSiswaForm';

interface SiswaManagementProps {
  students: Student[];
  materiList: Materi[];
  onSaveStudents: (updated: Student[]) => void;
}

export const SiswaManagement: React.FC<SiswaManagementProps> = ({
  students,
  materiList,
  onSaveStudents,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('semua');
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState('semua');
  const [activeMainSection, setActiveMainSection] = useState<'acc' | 'aktif' | 'semua'>('acc');
  const [statusTab, setStatusTab] = useState<'semua' | 'pending' | 'disetujui' | 'ditolak'>('pending');
  const [viewMode, setViewMode] = useState<'grouped' | 'flat'>('grouped');

  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);

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
      (statusTab === 'ditolak' && s.status === 'ditolak');

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

  const handleApproveAllPending = () => {
    if (confirm(`Setujui (ACC) seluruh ${pendingStudents.length} siswa pendaftar baru?`)) {
      const updated = students.map(s => {
        if (s.status === 'pending') {
          return { ...s, status: 'disetujui' as const };
        }
        return s;
      });
      onSaveStudents(updated);
    }
  };

  const handleSaveStudentFromForm = (data: {
    name: string;
    email: string;
    password?: string;
    tingkat: TingkatType;
    schoolName: string;
    className: string;
    rombelName: string;
  }) => {
    if (editingStudent) {
      // Edit student
      const updated = students.map(s => {
        if (s.id === editingStudent.id) {
          return {
            ...s,
            name: data.name,
            email: data.email,
            password: data.password || s.password,
            tingkat: data.tingkat,
            schoolName: data.schoolName,
            className: data.className,
            rombelName: data.rombelName,
          };
        }
        return s;
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
      onSaveStudents([newStudent, ...students]);
    }
    setIsModalOpen(false);
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

        <div className="flex items-center gap-2">
          {pendingStudents.length > 0 && (
            <button
              onClick={handleApproveAllPending}
              className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <CheckCircle2 size={16} /> Setujui ({pendingStudents.length}) Pending
            </button>
          )}

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-900/10 flex items-center gap-2 transition-all cursor-pointer"
          >
            <UserPlus size={18} /> Tambah Siswa Baru
          </button>
        </div>
      </div>

      {/* Primary Column Menu Navigation: ACC Siswa vs Siswa Aktif */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
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
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setViewMode('grouped')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'grouped'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers size={14} /> Berkelompok (Sekolah → Tingkat → Kelas)
            </button>
            <button
              onClick={() => setViewMode('flat')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
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
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-emerald-500"
            />
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
                                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-colors ${
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

                                        <div className="flex items-center gap-1 shrink-0">
                                          <select
                                            value={std.status === 'aktif' ? 'disetujui' : std.status}
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
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 w-10 text-center">
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
                  <th className="py-3.5 px-4">Siswa</th>
                  <th className="py-3.5 px-4">Asal Sekolah</th>
                  <th className="py-3.5 px-4">Tingkat / Kelas / Rombel</th>
                  <th className="py-3.5 px-4 text-center">XP</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
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
                        <td className="py-3.5 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectStudent(std.id)}
                            className="w-4 h-4 text-emerald-600 rounded-md border-slate-300 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                          />
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={std.avatar}
                              alt={std.name}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <div className="font-bold text-slate-900">{std.name}</div>
                              <div className="text-xs text-slate-400">{std.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">
                            {std.schoolName || 'Tanpa Sekolah / Umum'}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-xs font-bold text-emerald-800">
                            {std.tingkat || 'Umum'} - {std.className}
                          </div>
                          {std.rombelName && (
                            <div className="text-[11px] text-slate-500 font-medium">
                              Rombel: {std.rombelName}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full text-xs border border-amber-200">
                            <Award size={14} /> {std.totalXP} XP
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <select
                            value={std.status === 'aktif' ? 'disetujui' : std.status}
                            onChange={(e) => handleSetStudentStatus(std.id, e.target.value as StudentStatus)}
                            className={`px-2.5 py-1 text-xs font-bold rounded-xl border cursor-pointer focus:outline-hidden transition-all ${
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
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setSelectedStudentForDetail(std)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Detail Progres"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(std)}
                              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Edit Data"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => requestDeleteStudent(std)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
                    <h3 className="font-extrabold text-base text-white">
                      {selectedStudentForDetail.name}
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
      </AnimatePresence>
    </div>
  );
};
