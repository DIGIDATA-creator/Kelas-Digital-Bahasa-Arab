import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Materi } from '../../../types';
import { storageService } from '../../../services/storage';
import { X, Save, Quote, FileSpreadsheet, Download, Upload, CheckCircle2, Trash2, AlertCircle, FileText, Sparkles, RefreshCw, Eye } from 'lucide-react';
import * as XLSX from 'xlsx';

interface MahfudzotFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingMateri: Materi | null;
  existingMateriList: Materi[];
  onSave: (materi: Partial<Materi> | Partial<Materi>[], isBulkMode?: 'append' | 'overwrite') => void;
  defaultTab?: 'single' | 'sheet';
}

interface ParsedMahfudzotRow {
  number: number;
  arabic: string;
  translation: string;
}

export const MahfudzotFormModal: React.FC<MahfudzotFormModalProps> = ({
  isOpen,
  onClose,
  editingMateri,
  existingMateriList,
  onSave,
  defaultTab = 'single',
}) => {
  const [activeTab, setActiveTab] = useState<'single' | 'sheet'>(defaultTab);

  // Single Item State
  const countMahfudzot = existingMateriList.filter(m => m.category === 'mahfudzot').length;
  const autoNumber = editingMateri?.babNumber || countMahfudzot + 1;

  const [mahfudzotNumber, setMahfudzotNumber] = useState<number>(autoNumber);
  const [arabic, setArabic] = useState(editingMateri?.mahfudzot?.arabic || editingMateri?.content || '');
  const [translation, setTranslation] = useState(editingMateri?.mahfudzot?.translation || editingMateri?.description || '');
  const [categoryTag, setCategoryTag] = useState(editingMateri?.mahfudzot?.categoryTag || editingMateri?.mahfudzotCategory || 'Akhlak');

  useEffect(() => {
    if (isOpen) {
      if (editingMateri) {
        setMahfudzotNumber(editingMateri.babNumber || countMahfudzot + 1);
        setArabic(editingMateri.mahfudzot?.arabic || editingMateri.content || '');
        setTranslation(editingMateri.mahfudzot?.translation || editingMateri.description || '');
        setCategoryTag(editingMateri.mahfudzot?.categoryTag || editingMateri.mahfudzotCategory || 'Akhlak');
      } else {
        setMahfudzotNumber(countMahfudzot + 1);
        setArabic('');
        setTranslation('');
        setCategoryTag('Akhlak');
      }
    }
  }, [isOpen, editingMateri]);

  // Sheet / Massal Upload State
  const [fileName, setFileName] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<ParsedMahfudzotRow[]>([]);
  const [importMode, setImportMode] = useState<'append' | 'overwrite'>('append');
  const [, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Single Submit
  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!arabic.trim() || !translation.trim()) {
      alert('Harap isi Teks Arab dan Terjemahan Mahfudzot.');
      return;
    }

    onSave({
      category: 'mahfudzot',
      mahfudzotCategory: categoryTag,
      babNumber: mahfudzotNumber,
      title: `Mahfudzot No. ${mahfudzotNumber}`,
      arabicTitle: arabic.slice(0, 20),
      description: translation.trim(),
      content: arabic.trim(),
      mahfudzot: {
        number: mahfudzotNumber,
        arabic: arabic.trim(),
        translation: translation.trim(),
        categoryTag: categoryTag,
      },
      authorName: storageService.getGuruProfile()?.name || 'Ahmad Yusron',
    });

    onClose();
  };

  // Download Sheet Template (.xlsx)
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Nomor': 1,
        'Teks Arab': 'مَنْ سَارَ عَلَى الدَّرْبِ وَصَلَ',
        'Terjemahan': 'Siapa berjalan pada jalannya, akan sampai.',
      },
      {
        'Nomor': 2,
        'Teks Arab': 'مَنْ جَدَّ وَجَدَ',
        'Terjemahan': 'Siapa bersungguh-sungguh, akan mendapat.',
      },
      {
        'Nomor': 3,
        'Teks Arab': 'لَنْ تَرْجِعَ الأَيَّامُ الَّتِي مَضَتْ',
        'Terjemahan': 'Hari-hari yang telah berlalu tidak akan kembali.',
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Set Column Widths
    worksheet['!cols'] = [
      { wch: 10 }, // Nomor
      { wch: 45 }, // Teks Arab
      { wch: 55 }, // Terjemahan
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Format_Mahfudzot');
    XLSX.writeFile(workbook, 'Template_Format_Input_Mahfudzot.xlsx');
  };

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage('');
    setFileName(file.name);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

        if (!jsonData || jsonData.length === 0) {
          setErrorMessage('File spreadsheet kosong atau tidak berisi baris data.');
          setParsedRows([]);
          setIsProcessing(false);
          return;
        }

        const items: ParsedMahfudzotRow[] = jsonData.map((row, idx) => {
          const num = Number(row['Nomor'] || row['nomor'] || row['No'] || row['no'] || idx + 1);
          const arab = String(row['Teks Arab'] || row['Arab'] || row['arab'] || row['arabic'] || '').trim();
          const trans = String(row['Terjemahan'] || row['terjemahan'] || row['Arti'] || row['arti'] || '').trim();

          return {
            number: isNaN(num) ? idx + 1 : num,
            arabic: arab,
            translation: trans,
          };
        }).filter(item => item.arabic || item.translation);

        if (items.length === 0) {
          setErrorMessage('Tidak ditemukan baris Teks Arab atau Terjemahan yang valid dalam file sheet ini.');
        }

        setParsedRows(items);
      } catch (err) {
        console.error('Error parsing sheet file:', err);
        setErrorMessage('Gagal membaca file spreadsheet. Pastikan format file adalah .xlsx, .xls, atau .csv');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setErrorMessage('Terjadi kesalahan saat membaca file.');
      setIsProcessing(false);
    };

    reader.readAsBinaryString(file);
  };

  // Delete row from preview table
  const handleDeleteParsedRow = (index: number) => {
    setParsedRows(prev => prev.filter((_, i) => i !== index));
  };

  // Submit Massal / Bulk Import
  const handleBulkSubmit = () => {
    if (parsedRows.length === 0) {
      alert('Belum ada data Mahfudzot dari spreadsheet yang siap diimpor.');
      return;
    }

    const partialItems: Partial<Materi>[] = parsedRows.map(row => ({
      category: 'mahfudzot' as const,
      babNumber: row.number,
      title: `Mahfudzot No. ${row.number}`,
      arabicTitle: row.arabic.slice(0, 20),
      description: row.translation,
      content: row.arabic,
      mahfudzot: {
        number: row.number,
        arabic: row.arabic,
        translation: row.translation,
      },
      authorName: storageService.getGuruProfile()?.name || 'Ahmad Yusron',
    }));

    onSave(partialItems, importMode);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-5 overflow-hidden"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-5 my-auto max-h-[92vh] flex flex-col justify-between"
          >
            {/* Header & Mode Selector */}
            <div className="space-y-4 shrink-0">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-purple-50 text-purple-700 rounded-2xl border border-purple-200 shrink-0">
                    <Quote size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full">
                      Materi Mahfudzot (Kata Mutiara)
                    </span>
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
                      {editingMateri ? `Edit Mahfudzot ${mahfudzotNumber}` : `Input & Import Mahfudzot`}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Tab Selector */}
              {!editingMateri && (
                <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setActiveTab('single')}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      activeTab === 'single'
                        ? 'bg-purple-700 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileText size={15} /> Input Manual (1 Mahfudzot)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('sheet')}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      activeTab === 'sheet'
                        ? 'bg-purple-700 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileSpreadsheet size={15} /> Upload Sheet / Excel (Massal)
                  </button>
                </div>
              )}
            </div>

            {/* TAB 1: SINGLE INPUT MANUAL */}
            {activeTab === 'single' && (
              <form onSubmit={handleSingleSubmit} className="space-y-4 text-xs overflow-y-auto pr-1">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nomor Urut Mahfudzot
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={mahfudzotNumber}
                    onChange={(e) => setMahfudzotNumber(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-extrabold text-purple-800 focus:border-purple-500 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Teks Arab Mahfudzot <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="مَنْ جَدَّ وَجَدَ"
                    value={arabic}
                    onChange={(e) => setArabic(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-arabic text-2xl text-right focus:border-purple-500 dir-rtl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Terjemahan Bahasa Indonesia <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Barangsiapa bersungguh-sungguh ia akan mendapat."
                    value={translation}
                    onChange={(e) => setTranslation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium text-slate-800 focus:border-purple-500"
                  />
                </div>

                {/* Category / Tag Selection */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kategori / Tag Mahfudzot
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {['Akhlak', 'Ilmu', 'Persahabatan', 'Kesungguhan', 'Waktu & Disiplin', 'Kebijaksanaan'].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setCategoryTag(tag)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          categoryTag === tag
                            ? 'bg-purple-700 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Preview Card */}
                <div className="p-4 bg-gradient-to-br from-purple-50/80 to-indigo-50/80 rounded-2xl border border-purple-200/80 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-purple-900 flex items-center gap-1.5">
                      <Eye size={15} className="text-purple-600" /> Pratinjau Tampilan (Live Preview)
                    </span>
                    <span className="px-2.5 py-0.5 bg-purple-200/80 text-purple-800 text-[11px] font-extrabold rounded-full border border-purple-300/60">
                      No. {mahfudzotNumber || 1}
                    </span>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-purple-100 shadow-2xs space-y-3">
                    {/* Arabic Preview */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                        Teks Arab:
                      </span>
                      {arabic.trim() ? (
                        <p className="font-arabic text-2xl sm:text-3xl font-extrabold text-slate-900 leading-relaxed text-right dir-rtl">
                          {arabic}
                        </p>
                      ) : (
                        <p className="text-slate-300 italic text-right font-arabic text-xl dir-rtl">
                          (Ketik teks Arab di atas...)
                        </p>
                      )}
                    </div>

                    {/* Translation Preview */}
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-purple-700 tracking-wider block mb-0.5">
                        Terjemahan:
                      </span>
                      {translation.trim() ? (
                        <p className="font-bold text-slate-800 text-xs sm:text-sm">
                          "{translation}"
                        </p>
                      ) : (
                        <p className="text-slate-300 italic text-xs">
                          (Ketik terjemahan di atas...)
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="pt-3 border-t flex justify-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold flex items-center gap-2 shadow-md cursor-pointer"
                  >
                    <Save size={16} /> Simpan Mahfudzot
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: UPLOAD SPREADSHEET / SHEET (MASSAL) */}
            {activeTab === 'sheet' && (
              <div className="space-y-4 text-xs overflow-y-auto pr-1 flex-1">
                {/* Download Template Banner */}
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-purple-900 text-xs sm:text-sm flex items-center gap-1.5">
                      <Sparkles size={16} className="text-purple-600" /> Template Sheet Mahfudzot
                    </h4>
                    <p className="text-[11px] text-purple-700 leading-relaxed">
                      Gunakan template Excel resmi agar struktur kolom (Nomor, Teks Arab, Terjemahan) sesuai.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl shadow-xs flex items-center gap-2 shrink-0 transition-all cursor-pointer"
                  >
                    <Download size={15} /> Download Template (.xlsx)
                  </button>
                </div>

                {/* Upload File Box */}
                <div className="border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-2xl p-5 text-center space-y-2 bg-slate-50 hover:bg-purple-50/40 transition-all">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <div className="w-12 h-12 mx-auto bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center">
                    <Upload size={24} />
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl shadow-xs inline-flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <FileSpreadsheet size={16} /> Pilih File Spreadsheet (.xlsx / .csv)
                    </button>
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      Mendukung format Microsoft Excel (.xlsx, .xls) dan CSV
                    </p>
                  </div>

                  {fileName && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl font-bold text-xs mt-2">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      <span>{fileName}</span>
                    </div>
                  )}
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2 font-medium">
                    <AlertCircle size={16} className="shrink-0 text-rose-500" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Import Mode Options & Status */}
                {parsedRows.length > 0 && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                        <CheckCircle2 size={15} className="text-emerald-600" />
                        Terdeteksi {parsedRows.length} Data Mahfudzot Siap Diimpor
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          setParsedRows([]);
                          setFileName('');
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="text-rose-600 hover:text-rose-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw size={12} /> Reset File
                      </button>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-4">
                      <span className="font-bold text-slate-700 text-xs">Mode Impor:</span>

                      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 cursor-pointer">
                        <input
                          type="radio"
                          name="importMode"
                          value="append"
                          checked={importMode === 'append'}
                          onChange={() => setImportMode('append')}
                          className="accent-purple-700"
                        />
                        <span>Tambahkan ke Data yang Ada (Append)</span>
                      </label>

                      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 cursor-pointer">
                        <input
                          type="radio"
                          name="importMode"
                          value="overwrite"
                          checked={importMode === 'overwrite'}
                          onChange={() => setImportMode('overwrite')}
                          className="accent-purple-700"
                        />
                        <span className="text-rose-700">Gantikan Seluruh Data Mahfudzot (Overwrite)</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Preview Table */}
                {parsedRows.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="font-bold text-slate-800 text-xs flex items-center justify-between">
                      <span>Pratinjau Data ({parsedRows.length} Mahfudzot)</span>
                      <span className="text-[10px] text-slate-500 font-normal">Periksa kembali sebelum impor</span>
                    </h5>

                    <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-2xl">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b border-slate-200">
                          <tr>
                            <th className="p-2.5 w-12 text-center">No</th>
                            <th className="p-2.5 text-right font-arabic">Teks Arab</th>
                            <th className="p-2.5">Terjemahan</th>
                            <th className="p-2.5 w-10 text-center">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {parsedRows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-purple-50/50 transition-colors">
                              <td className="p-2.5 text-center font-black text-purple-800">{row.number}</td>
                              <td className="p-2.5 text-right font-arabic text-base font-bold text-slate-900 dir-rtl">
                                {row.arabic}
                              </td>
                              <td className="p-2.5 font-medium text-slate-800">
                                {row.translation}
                              </td>
                              <td className="p-2.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteParsedRow(idx)}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                  title="Hapus Baris Ini"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Submit Massal Footer */}
                <div className="pt-3 border-t flex justify-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={parsedRows.length === 0}
                    onClick={handleBulkSubmit}
                    className={`px-5 py-2 rounded-xl font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer ${
                      parsedRows.length > 0
                        ? 'bg-purple-700 hover:bg-purple-800 text-white'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    }`}
                  >
                    <Save size={16} /> Impor {parsedRows.length} Mahfudzot Massal
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

