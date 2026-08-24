import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { Student, TingkatType } from '../../types';
import { 
  X, 
  FileSpreadsheet, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Users, 
  Sparkles, 
  Loader2, 
  ClipboardPaste,
  Building2,
  GraduationCap,
  KeyRound,
  RefreshCw
} from 'lucide-react';

interface ImportExcelSiswaModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingStudents: Student[];
  onImportSuccess: (newStudents: Student[]) => void;
}

interface ParsedStudentRow {
  tempId: string;
  name: string;
  gender: 'Laki-laki' | 'Perempuan';
  email: string;
  password?: string;
  tingkat: TingkatType;
  schoolName: string;
  className: string;
  rombelName: string;
  isValid: boolean;
  validationError?: string;
}

export const ImportExcelSiswaModal: React.FC<ImportExcelSiswaModalProps> = ({
  isOpen,
  onClose,
  existingStudents,
  onImportSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [defaultSchool, setDefaultSchool] = useState('');
  const [defaultTingkat, setDefaultTingkat] = useState<TingkatType>('Dasar');
  const [defaultClass, setDefaultClass] = useState('');
  const [defaultRombel, setDefaultRombel] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to generate template Excel
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Nama Lengkap': 'Muhammad Fauzi',
        'Jenis Kelamin (L/P)': 'L',
        'Email / Akun': 'fauzi@sekolah.sch.id',
        'Password (Opsional)': '123456',
        'Tingkat Pendidikan': 'Dasar',
        'Asal Sekolah': 'SD Islam Al-Azhar',
        'Kelas Utama': 'Kelas 5',
        'Rombel / Sub-Kelas': '5A',
      },
      {
        'Nama Lengkap': 'Fathimah Az-Zahra',
        'Jenis Kelamin (L/P)': 'P',
        'Email / Akun': 'fathimah@sekolah.sch.id',
        'Password (Opsional)': '123456',
        'Tingkat Pendidikan': 'Menengah Pertama',
        'Asal Sekolah': 'MTs Negeri 1 Jakarta',
        'Kelas Utama': 'Kelas 7',
        'Rombel / Sub-Kelas': '7B',
      },
      {
        'Nama Lengkap': 'Zaid bin Tsabit',
        'Jenis Kelamin (L/P)': 'L',
        'Email / Akun': 'zaid@sekolah.sch.id',
        'Password (Opsional)': '123456',
        'Tingkat Pendidikan': 'Menengah Akhir',
        'Asal Sekolah': 'MA Negeri 2 Cirebon',
        'Kelas Utama': 'Kelas 10',
        'Rombel / Sub-Kelas': '10 IPA 1',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    
    // Auto column width
    worksheet['!cols'] = [
      { wch: 25 }, // Nama Lengkap
      { wch: 20 }, // Jenis Kelamin
      { wch: 28 }, // Email
      { wch: 20 }, // Password
      { wch: 22 }, // Tingkat Pendidikan
      { wch: 25 }, // Asal Sekolah
      { wch: 16 }, // Kelas Utama
      { wch: 20 }, // Rombel
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Siswa');

    XLSX.writeFile(workbook, 'Template_Import_Siswa_LMS.xlsx');
  };

  // Helper to validate and clean a raw parsed row
  const validateAndMapRow = (raw: any, index: number, seenEmailsInBatch: Set<string>): ParsedStudentRow => {
    // Flexible column key matching
    const findValue = (keys: string[]): string => {
      for (const k of Object.keys(raw)) {
        const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
        for (const target of keys) {
          const cleanTarget = target.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (cleanK === cleanTarget || cleanK.includes(cleanTarget)) {
            return String(raw[k] || '').trim();
          }
        }
      }
      return '';
    };

    const name = findValue(['namalengkap', 'nama', 'namasiswa', 'studentname', 'name']);
    const genderRaw = findValue(['jeniskelamin', 'gender', 'jeniskelaminlp', 'jk', 'sex']);
    const emailRaw = findValue(['email', 'alamatemail', 'username', 'emailakun', 'useremail']);
    const password = findValue(['password', 'katasandi', 'pass', 'sandi']) || '123456';
    const tingkatRaw = findValue(['tingkat', 'tingkatpendidikan', 'level', 'jenjang']);
    const schoolName = findValue(['asalsekolah', 'sekolah', 'namasekolah', 'school', 'schoolname']) || defaultSchool || 'Sekolah Pengguna';
    const className = findValue(['kelasutama', 'kelas', 'class', 'grade']) || defaultClass || 'Kelas 1';
    const rombelName = findValue(['rombel', 'subkelas', 'rombelsubkelas', 'section', 'group']) || defaultRombel || className;

    // Determine gender
    let gender: 'Laki-laki' | 'Perempuan' = 'Laki-laki';
    const gLower = genderRaw.toLowerCase();
    if (gLower.startsWith('p') || gLower.includes('perempuan') || gLower.includes('female') || gLower.includes('wanita') || gLower.includes('tholibah')) {
      gender = 'Perempuan';
    }

    // Determine tingkat
    let tingkat: TingkatType = defaultTingkat || 'Dasar';
    const tLower = tingkatRaw.toLowerCase();
    if (tLower.includes('pertama') || tLower.includes('smp') || tLower.includes('mts')) {
      tingkat = 'Menengah Pertama';
    } else if (tLower.includes('akhir') || tLower.includes('atas') || tLower.includes('sma') || tLower.includes('ma') || tLower.includes('smk')) {
      tingkat = 'Menengah Akhir';
    } else if (tLower.includes('tinggi') || tLower.includes('kuliah') || tLower.includes('universitas') || tLower.includes('institut')) {
      tingkat = 'Perguruan Tinggi' as any;
    } else if (tLower.includes('umum')) {
      tingkat = 'Umum';
    } else if (tLower.includes('dasar') || tLower.includes('sd') || tLower.includes('mi')) {
      tingkat = 'Dasar';
    }

    // Email generation / validation
    let email = emailRaw.toLowerCase().trim();
    if (!email && name) {
      // Auto-generate safe email from student name if left empty
      const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      email = `${cleanName || 'siswa'}${randomSuffix}@lms-arab.sch.id`;
    }

    let isValid = true;
    let validationError = '';

    if (!name) {
      isValid = false;
      validationError = 'Nama siswa wajib diisi.';
    } else if (!email) {
      isValid = false;
      validationError = 'Alamat email / akun wajib ada.';
    } else if (existingStudents.some(s => s.email && s.email.toLowerCase().trim() === email && (s.status === 'aktif' || s.status === 'disetujui'))) {
      isValid = false;
      validationError = `Email "${email}" sudah digunakan akun aktif lain.`;
    } else if (seenEmailsInBatch.has(email)) {
      isValid = false;
      validationError = `Email "${email}" duplikat dalam file impor ini.`;
    } else {
      seenEmailsInBatch.add(email);
    }

    return {
      tempId: `temp-import-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      gender,
      email,
      password: password || '123456',
      tingkat,
      schoolName,
      className,
      rombelName,
      isValid,
      validationError,
    };
  };

  // Process Excel / CSV file
  const handleProcessFile = (file: File) => {
    setIsProcessingFile(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          alert('File Excel kosong atau tidak terbaca format barisnya.');
          setIsProcessingFile(false);
          return;
        }

        const seenEmails = new Set<string>();
        const mapped: ParsedStudentRow[] = rawJson.map((row, idx) => validateAndMapRow(row, idx, seenEmails));
        setParsedRows(mapped);
      } catch (err: any) {
        console.error('Error parsing Excel file:', err);
        alert('Gagal memproses file Excel: ' + (err.message || 'Format tidak didukung'));
      } finally {
        setIsProcessingFile(false);
      }
    };

    reader.onerror = () => {
      alert('Gagal membaca file.');
      setIsProcessingFile(false);
    };

    reader.readAsArrayBuffer(file);
  };

  // Process pasted text from Excel / Google Sheets
  const handleProcessPaste = () => {
    if (!pasteText.trim()) return;

    try {
      const lines = pasteText.trim().split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) return;

      // Check if first row is header
      const delimiter = lines[0].includes('\t') ? '\t' : (lines[0].includes(';') ? ';' : ',');
      const firstRowCols = lines[0].split(delimiter).map(c => c.trim().toLowerCase());
      
      const isHeader = firstRowCols.some(c => 
        c.includes('nama') || c.includes('email') || c.includes('gender') || c.includes('kelamin')
      );

      const startIndex = isHeader ? 1 : 0;
      const seenEmails = new Set<string>();
      const rows: ParsedStudentRow[] = [];

      for (let i = startIndex; i < lines.length; i++) {
        const cols = lines[i].split(delimiter).map(c => c.replace(/^["']|["']$/g, '').trim());
        if (cols.length === 0 || (cols.length === 1 && !cols[0])) continue;

        // Position fallback: [0: Name, 1: Gender, 2: Email, 3: Password, 4: Tingkat, 5: School, 6: Class, 7: Rombel]
        const rawObj: Record<string, any> = {
          'Nama Lengkap': cols[0] || '',
          'Jenis Kelamin': cols[1] || 'Laki-laki',
          'Email': cols[2] || '',
          'Password': cols[3] || '123456',
          'Tingkat': cols[4] || defaultTingkat,
          'Asal Sekolah': cols[5] || defaultSchool,
          'Kelas Utama': cols[6] || defaultClass,
          'Rombel': cols[7] || defaultRombel,
        };

        rows.push(validateAndMapRow(rawObj, i, seenEmails));
      }

      setParsedRows(rows);
    } catch (err: any) {
      console.error('Error parsing pasted table:', err);
      alert('Gagal memproses data tempel: ' + err.message);
    }
  };

  // Remove a row from preview
  const handleRemoveRow = (tempId: string) => {
    setParsedRows(prev => prev.filter(r => r.tempId !== tempId));
  };

  // Save all valid parsed students
  const handleSaveAll = async () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      alert('Tidak ada data siswa yang valid untuk diimpor. Silakan periksa kembali daftar di bawah.');
      return;
    }

    setIsSubmitting(true);
    try {
      const nowISO = new Date().toISOString();
      const newStudents: Student[] = validRows.map((r, idx) => {
        // Safe avatar based on gender
        const avatar = r.gender === 'Perempuan'
          ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

        return {
          id: `std-imp-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
          name: r.name,
          email: r.email,
          password: r.password || '123456',
          gender: r.gender,
          tingkat: r.tingkat,
          schoolName: r.schoolName || 'Sekolah Pengguna',
          className: r.className || 'Kelas 1',
          rombelName: r.rombelName || r.className || 'Umum',
          avatar,
          totalXP: 0,
          completedMaterials: [],
          status: 'aktif', // Directly active without waiting for approval when imported by Teacher / Admin
          registeredAt: nowISO,
          updatedAt: nowISO,
          lastActive: nowISO,
          attempts: [],
          hafalanProgress: {
            kosakataIds: {},
            selfKosakataIds: {},
            selfMahfudzotIds: {},
            selfQowaidIds: {},
            selfHiwarIds: {},
            mahfudzotChecklist: {},
          },
        };
      });

      onImportSuccess(newStudents);
      setParsedRows([]);
      setPasteText('');
      onClose();
    } catch (err: any) {
      console.error('Error importing students:', err);
      alert('Gagal mengimpor data siswa: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validCount = parsedRows.filter(r => r.isValid).length;
  const invalidCount = parsedRows.filter(r => !r.isValid).length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto"
        >
          {/* Header - Fixed Top */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-xs">
                <FileSpreadsheet size={24} className="text-emerald-300" />
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-white flex items-center gap-2">
                  <span>Import Data Siswa Massal (Excel / CSV)</span>
                  <span className="px-2 py-0.5 bg-emerald-500/30 text-emerald-200 text-[11px] font-bold rounded-full border border-emerald-400/30">
                    XLSX / CSV
                  </span>
                </h3>
                <p className="text-xs text-emerald-100/90 mt-0.5">
                  Tambahkan puluhan hingga ratusan siswa sekaligus dengan mengunggah template Excel atau salin-tempel tabel.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-200 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal Body - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs text-slate-700">
            
            {/* Step 1 & Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Template Download Card */}
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex flex-col justify-between gap-3 shadow-2xs">
                <div>
                  <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-xs">
                    <Download size={16} className="text-emerald-700" />
                    <span>Langkah 1: Unduh Template</span>
                  </div>
                  <p className="text-[11px] text-emerald-800/80 mt-1 leading-relaxed">
                    Gunakan format kolom baku agar sistem membaca Nama, Email, Gender, dan Kelas secara akurat.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download size={14} /> Download Template Excel (.xlsx)
                </button>
              </div>

              {/* Mode Selection Tabs */}
              <div className="md:col-span-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between gap-3 shadow-2xs">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-800 text-xs">Langkah 2: Pilih Metode Input</span>
                    <span className="text-[11px] text-slate-500 font-medium">Bisa upload file atau paste langsung</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('upload')}
                      className={`py-2 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        activeTab === 'upload'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Upload size={14} /> Unggah File Excel (.xlsx / .csv)
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('paste')}
                      className={`py-2 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        activeTab === 'paste'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <ClipboardPaste size={14} /> Tempel dari Spreadsheet
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Zone: Upload Mode vs Paste Mode */}
            {activeTab === 'upload' ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleProcessFile(file);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-300 hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleProcessFile(file);
                    e.target.value = '';
                  }}
                />
                <div className="max-w-md mx-auto flex flex-col items-center gap-2">
                  <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl shadow-xs">
                    {isProcessingFile ? (
                      <Loader2 size={28} className="animate-spin text-emerald-600" />
                    ) : (
                      <FileSpreadsheet size={28} className="text-emerald-700" />
                    )}
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 mt-1">
                    {isProcessingFile ? 'Sedang Membaca & Memvalidasi File...' : 'Klik atau Tarik File Excel ke Sini'}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Mendukung format <strong>.xlsx, .xls, .csv</strong>. Sistem otomatis mendeteksi baris data & memvalidasi keunikan email.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                    <ClipboardPaste size={14} className="text-emerald-600" />
                    Salin (Copy) Baris Tabel dari Excel / Google Sheets lalu Tempel (Paste) di Bawah:
                  </label>
                  <button
                    type="button"
                    onClick={() => setPasteText('')}
                    className="text-[11px] text-slate-400 hover:text-slate-600 font-bold"
                  >
                    Bersihkan Teks
                  </button>
                </div>
                <textarea
                  rows={5}
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder={`Contoh:\nMuhammad Fauzi\tL\tfauzi@sekolah.sch.id\t123456\tDasar\tSD Al-Azhar\tKelas 5\t5A\nFathimah Az-Zahra\tP\tfathimah@sekolah.sch.id\t123456\tMenengah Pertama\tMTs 1\tKelas 7\t7B`}
                  className="w-full p-3 font-mono text-xs border border-slate-300 rounded-xl bg-white focus:border-emerald-500"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleProcessPaste}
                    disabled={!pasteText.trim()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles size={14} /> Proses & Tampilkan Pratinjau
                  </button>
                </div>
              </div>
            )}

            {/* PREVIEW TABLE OF PARSED STUDENTS */}
            {parsedRows.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-100 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                      Hasil Pembacaan Data ({parsedRows.length} baris)
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold text-[11px] rounded-full border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 size={12} /> {validCount} Siap Impor
                      </span>
                      {invalidCount > 0 && (
                        <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 font-extrabold text-[11px] rounded-full border border-rose-200 flex items-center gap-1">
                          <AlertCircle size={12} /> {invalidCount} Perlu Dicek
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setParsedRows([])}
                    className="text-[11px] text-slate-500 hover:text-rose-600 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={13} /> Reset Daftar
                  </button>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs max-h-72 overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider sticky top-0 z-10 border-b border-slate-200">
                      <tr>
                        <th className="p-2.5 w-10 text-center">No</th>
                        <th className="p-2.5">Nama Siswa</th>
                        <th className="p-2.5">Gender</th>
                        <th className="p-2.5">Email / Akun</th>
                        <th className="p-2.5">Password</th>
                        <th className="p-2.5">Kelas & Sekolah</th>
                        <th className="p-2.5">Status Validasi</th>
                        <th className="p-2.5 text-center w-12">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {parsedRows.map((row, idx) => (
                        <tr
                          key={row.tempId}
                          className={`hover:bg-slate-50 transition-colors ${
                            !row.isValid ? 'bg-rose-50/40' : ''
                          }`}
                        >
                          <td className="p-2.5 text-center font-bold text-slate-400">{idx + 1}</td>
                          <td className="p-2.5 font-bold text-slate-900">{row.name || <span className="text-rose-500 italic">Kosong</span>}</td>
                          <td className="p-2.5">
                            <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                              row.gender === 'Perempuan' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {row.gender === 'Perempuan' ? '👩 P' : '👨 L'}
                            </span>
                          </td>
                          <td className="p-2.5 font-mono text-[11px] text-slate-800">{row.email}</td>
                          <td className="p-2.5 font-mono text-[11px] text-emerald-800 font-bold">{row.password}</td>
                          <td className="p-2.5 text-slate-600">
                            {row.className} ({row.rombelName}) • <span className="text-slate-400">{row.schoolName}</span>
                          </td>
                          <td className="p-2.5">
                            {row.isValid ? (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-extrabold text-[10px] inline-flex items-center gap-1">
                                <CheckCircle2 size={11} /> Siap Diimpor
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md font-extrabold text-[10px] inline-flex items-center gap-1" title={row.validationError}>
                                <AlertCircle size={11} /> {row.validationError || 'Tidak Valid'}
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveRow(row.tempId)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                              title="Hapus baris ini dari impor"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions - Fixed Bottom */}
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="text-xs text-slate-500 font-medium text-center sm:text-left">
              {parsedRows.length > 0 ? (
                <span>
                  Total siap diimpor: <strong className="text-emerald-700">{validCount} siswa</strong>. Akun langsung disetujui & aktif.
                </span>
              ) : (
                <span>Unggah file Excel atau tempel tabel untuk memulai impor massal.</span>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveAll}
                disabled={validCount === 0 || isSubmitting}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs shadow-md shadow-emerald-900/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Menyimpan Akun Siswa...
                  </>
                ) : (
                  <>
                    <Users size={16} /> Simpan {validCount} Siswa Massal ➔
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
