import React, { useState } from 'react';
import { Student, Materi } from '../../types';
import { UserPlus, Search, Edit3, Trash2, CheckCircle2, XCircle, Award, Eye, X, BookOpen, FileCheck } from 'lucide-react';

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
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    nisn: '',
    email: '',
    className: 'Kelas X Bahasa',
    avatar: '',
  });

  const classes = Array.from(new Set(students.map(s => s.className)));

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.nisn.includes(searchTerm) ||
                          s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'semua' || s.className === selectedClass;
    return matchesSearch && matchesClass;
  });

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      nisn: `2026${Math.floor(1000 + Math.random() * 9000)}`,
      email: '',
      className: 'Kelas X Bahasa',
      avatar: `https://images.unsplash.com/photo-${1530000000000 + Math.floor(Math.random() * 1000000)}?w=150&auto=format&fit=crop&q=80`,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (std: Student) => {
    setEditingStudent(std);
    setFormData({
      name: std.name,
      nisn: std.nisn,
      email: std.email,
      className: std.className,
      avatar: std.avatar,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data siswa ini?')) {
      const updated = students.filter(s => s.id !== id);
      onSaveStudents(updated);
    }
  };

  const handleToggleStatus = (id: string) => {
    const updated = students.map(s => {
      if (s.id === id) {
        return { ...s, status: s.status === 'aktif' ? 'nonaktif' as const : 'aktif' as const };
      }
      return s;
    });
    onSaveStudents(updated);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingStudent) {
      // Edit existing
      const updated = students.map(s => {
        if (s.id === editingStudent.id) {
          return {
            ...s,
            name: formData.name,
            nisn: formData.nisn,
            email: formData.email,
            className: formData.className,
            avatar: formData.avatar || s.avatar,
          };
        }
        return s;
      });
      onSaveStudents(updated);
    } else {
      // Add new student
      const newStudent: Student = {
        id: `std-${Date.now()}`,
        name: formData.name,
        nisn: formData.nisn,
        email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '')}@siswa.belajar.id`,
        className: formData.className,
        avatar: formData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        totalXP: 0,
        completedMaterials: [],
        attempts: [],
        status: 'aktif',
        lastActive: new Date().toISOString(),
      };
      onSaveStudents([...students, newStudent]);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Data & Progres Siswa</h2>
          <p className="text-xs text-slate-500">Kelola akun siswa, pantau capaian pembelajaran, dan riwayat kuis</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md flex items-center gap-2"
        >
          <UserPlus size={18} /> Tambah Siswa Baru
        </button>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama, NISN, atau email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Kelas:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-hidden"
          >
            <option value="semua">Semua Kelas ({students.length})</option>
            {classes.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Siswa</th>
                <th className="py-3.5 px-4">NISN / Kelas</th>
                <th className="py-3.5 px-4 text-center">Progres Materi</th>
                <th className="py-3.5 px-4 text-center">XP & Peringkat</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-sm">
                    Tidak ada siswa ditemukan.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std) => {
                  const completedCount = std.completedMaterials.length;
                  const totalMat = materiList.length || 1;
                  const progressPct = Math.round((completedCount / totalMat) * 100);

                  return (
                    <tr key={std.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={std.avatar}
                            alt={std.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="font-bold text-slate-900">{std.name}</div>
                            <div className="text-xs text-slate-400">{std.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-xs text-slate-700">{std.nisn}</div>
                        <div className="text-xs font-medium text-emerald-700">{std.className}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="w-32 mx-auto space-y-1">
                          <div className="flex justify-between text-[10px] font-semibold text-slate-600">
                            <span>{completedCount}/{totalMat} Modul</span>
                            <span>{progressPct}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${progressPct}%` }}
                              className="h-full bg-emerald-500 rounded-full"
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full text-xs border border-amber-200">
                          <Award size={14} /> {std.totalXP} XP
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(std.id)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                            std.status === 'aktif'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {std.status === 'aktif' ? (
                            <><CheckCircle2 size={12} /> Aktif</>
                          ) : (
                            <><XCircle size={12} /> Non-aktif</>
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedStudentForDetail(std)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Detail Progres"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(std)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Data"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(std.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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

      {/* Detail Progress Modal */}
      {selectedStudentForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedStudentForDetail.avatar}
                  alt={selectedStudentForDetail.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500"
                />
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedStudentForDetail.name}</h3>
                  <p className="text-xs text-slate-500">
                    NISN: {selectedStudentForDetail.nisn} • {selectedStudentForDetail.className}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentForDetail(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Total Stats summary */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="text-xs text-slate-500">Total XP</span>
                <p className="text-xl font-bold text-emerald-700">{selectedStudentForDetail.totalXP}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <span className="text-xs text-slate-500">Materi Selesai</span>
                <p className="text-xl font-bold text-blue-700">
                  {selectedStudentForDetail.completedMaterials.length} / {materiList.length}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                <span className="text-xs text-slate-500">Kuis Dikerjakan</span>
                <p className="text-xl font-bold text-purple-700">
                  {selectedStudentForDetail.attempts.length}
                </p>
              </div>
            </div>

            {/* Completed Materials Checklist */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <BookOpen size={16} className="text-emerald-600" /> Status Membaca Materi
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {materiList.map(m => {
                  const isDone = selectedStudentForDetail.completedMaterials.includes(m.id);
                  return (
                    <div
                      key={m.id}
                      className={`p-2.5 rounded-lg border flex items-center justify-between ${
                        isDone ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}
                    >
                      <span className="font-medium truncate max-w-[180px]">{m.title}</span>
                      {isDone ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 size={14} /> Selesai
                        </span>
                      ) : (
                        <span className="text-slate-400">Belum</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quiz Attempts History */}
            <div className="space-y-2 pt-2 border-t">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <FileCheck size={16} className="text-purple-600" /> Riwayat Nilai Kuis & Ujian
              </h4>
              {selectedStudentForDetail.attempts.length === 0 ? (
                <p className="text-xs text-slate-400">Siswa belum melakukan pengerjaan kuis.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedStudentForDetail.attempts.map((att) => (
                    <div
                      key={att.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-800">{att.penilaianTitle}</div>
                        <div className="text-slate-400 text-[10px]">
                          {new Date(att.completedAt).toLocaleDateString('id-ID')} • Waktu: {Math.floor(att.timeSpentSeconds / 60)} m {att.timeSpentSeconds % 60} s
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-base font-extrabold ${att.score >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {att.score} / 100
                        </span>
                        <div>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${att.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {att.passed ? 'LULUS' : 'REMEDIAL'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t text-right">
              <button
                onClick={() => setSelectedStudentForDetail(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Student Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSubmitForm}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Ahmad Fauzi"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">NISN Siswa</label>
                <input
                  type="text"
                  required
                  value={formData.nisn}
                  onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                  placeholder="2026xxxx"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Siswa</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="siswa@sekolah.id"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rombongan Belajar / Kelas</label>
                <select
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-emerald-500"
                >
                  <option value="Kelas X Bahasa">Kelas X Bahasa</option>
                  <option value="Kelas X IPA 1">Kelas X IPA 1</option>
                  <option value="Kelas X IPS 1">Kelas X IPS 1</option>
                  <option value="Kelas XI Bahasa">Kelas XI Bahasa</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs"
              >
                Simpan Siswa
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
