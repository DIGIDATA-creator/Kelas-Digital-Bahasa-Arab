import React, { useState } from 'react';
import { Student, Materi, TingkatType } from '../../types';
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
  ListFilter
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
  const [statusTab, setStatusTab] = useState<'semua' | 'aktif' | 'pending'>('semua');
  const [viewMode, setViewMode] = useState<'grouped' | 'flat'>('grouped');

  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Accordion collapsed state for grouped view
  const [collapsedSchools, setCollapsedSchools] = useState<Record<string, boolean>>({});

  const toggleSchoolCollapse = (schoolKey: string) => {
    setCollapsedSchools(prev => ({ ...prev, [schoolKey]: !prev[schoolKey] }));
  };

  // Counts
  const pendingStudents = students.filter(s => s.status === 'pending');
  const activeStudents = students.filter(s => s.status === 'aktif');

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
      (statusTab === 'pending' ? s.status === 'pending' : s.status === 'aktif');

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

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data siswa ini?')) {
      const updated = students.filter(s => s.id !== id);
      onSaveStudents(updated);
    }
  };

  const handleApproveStudent = (id: string) => {
    const updated = students.map(s => {
      if (s.id === id) {
        return { ...s, status: 'aktif' as const };
      }
      return s;
    });
    onSaveStudents(updated);
  };

  const handleApproveAllPending = () => {
    if (confirm(`Setujui (ACC) seluruh ${pendingStudents.length} siswa pendaftar baru?`)) {
      const updated = students.map(s => ({
        ...s,
        status: 'aktif' as const
      }));
      onSaveStudents(updated);
    }
  };

  const handleToggleStatus = (id: string) => {
    const updated = students.map(s => {
      if (s.id === id) {
        const nextStatus = s.status === 'aktif' ? 'nonaktif' as const : 'aktif' as const;
        return { ...s, status: nextStatus };
      }
      return s;
    });
    onSaveStudents(updated);
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

      {/* Tabs & View Switcher Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setStatusTab('semua')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusTab === 'semua'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Semua ({students.length})
            </button>
            <button
              onClick={() => setStatusTab('aktif')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                statusTab === 'aktif'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <CheckCircle2 size={13} /> Terkonfirmasi ACC ({activeStudents.length})
            </button>
            <button
              onClick={() => setStatusTab('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                statusTab === 'pending'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Clock size={13} /> Menunggu ACC ({pendingStudents.length})
            </button>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setViewMode('grouped')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'grouped'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers size={14} /> Berkelompok (Sekolah → Tingkat → Kelas)
            </button>
            <button
              onClick={() => setViewMode('flat')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
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
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value="semua">🏢 Semua Asal Sekolah ({allSchoolNames.length})</option>
              {allSchoolNames.map(sch => (
                <option key={sch} value={sch}>{sch}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value="semua">📚 Semua Kelas Utama ({allClasses.length})</option>
              {allClasses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

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
                  <div className="p-4 bg-gradient-to-r from-slate-900 to-emerald-950 text-white flex items-center justify-between gap-3">
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

                    <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-extrabold rounded-xl">
                      {totalInSchool} Siswa
                    </span>
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
                                  {listSiswa.map(std => (
                                    <div
                                      key={std.id}
                                      className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-2 hover:bg-emerald-50/50 transition-colors"
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0">
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
                                        {std.status === 'pending' ? (
                                          <button
                                            onClick={() => handleApproveStudent(std.id)}
                                            className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 text-[10px] font-extrabold rounded-lg shadow-xs flex items-center gap-1 cursor-pointer"
                                            title="ACC Siswa Ini"
                                          >
                                            <Check size={12} /> ACC
                                          </button>
                                        ) : (
                                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md flex items-center gap-1">
                                            <CheckCircle2 size={10} /> ACC
                                          </span>
                                        )}

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
                                          onClick={() => handleDelete(std.id)}
                                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                                          title="Hapus"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
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
                  <th className="py-3.5 px-4">Siswa</th>
                  <th className="py-3.5 px-4">Asal Sekolah</th>
                  <th className="py-3.5 px-4">Tingkat / Kelas / Rombel</th>
                  <th className="py-3.5 px-4 text-center">XP</th>
                  <th className="py-3.5 px-4 text-center">Status ACC</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                      Tidak ada siswa ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map(std => {
                    return (
                      <tr key={std.id} className="hover:bg-slate-50/80 transition-colors">
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
                          {std.status === 'pending' ? (
                            <button
                              onClick={() => handleApproveStudent(std.id)}
                              className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-full shadow-xs inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Clock size={12} /> ACC Sekarang
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleStatus(std.id)}
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer ${
                                std.status === 'aktif'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {std.status === 'aktif' ? (
                                <><CheckCircle2 size={12} /> Terkonfirmasi (ACC)</>
                              ) : (
                                <><XCircle size={12} /> Non-aktif</>
                              )}
                            </button>
                          )}
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
                              onClick={() => handleDelete(std.id)}
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
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 my-auto">
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
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: DETAIL PROGRES SISWA */}
      {selectedStudentForDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-100 my-auto max-h-[90vh] flex flex-col">
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
          </div>
        </div>
      )}
    </div>
  );
};
