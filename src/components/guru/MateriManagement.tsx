import React, { useState } from 'react';
import { Materi, CategoryType, DialogueItem, VocabularyItem } from '../../types';
import { FileUp, Plus, Edit3, Trash2, Eye, FileText, Sparkles, BookOpen, MessageSquare, List, Quote, X, UploadCloud, Check, Loader2, Database } from 'lucide-react';
import { PdfViewerModal } from '../common/PdfViewerModal';
import { SAMPLE_PDF_BASE64 } from '../../data/initialData';
import { uploadToSupabaseStorage, BUCKET_NAME } from '../../lib/supabase';

interface MateriManagementProps {
  materiList: Materi[];
  onSaveMateri: (updated: Materi[]) => void;
}

export const MateriManagement: React.FC<MateriManagementProps> = ({
  materiList,
  onSaveMateri,
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('qowaid');
  const [searchTerm, setSearchTerm] = useState('');
  
  // PDF Viewer Modal State
  const [previewPdfMateri, setPreviewPdfMateri] = useState<Materi | null>(null);

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMateri, setEditingMateri] = useState<Materi | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    arabicTitle: '',
    category: 'qowaid' as CategoryType,
    level: 'Dasar' as 'Dasar' | 'Menengah' | 'Lanjut',
    description: '',
    content: '',
    pdfFileName: '',
    pdfUrl: '',
    authorName: 'Ust. Ahmad Dahlan, M.Pd.',
    // Category specific
    dialogues: [] as DialogueItem[],
    vocabularies: [] as VocabularyItem[],
    mahfudzotArabic: '',
    mahfudzotLatin: '',
    mahfudzotTranslation: '',
    mahfudzotExplanation: '',
  });

  const categoryFiltered = materiList.filter(m => m.category === activeCategory);
  const searchFiltered = categoryFiltered.filter(m =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.arabicTitle && m.arabicTitle.includes(searchTerm))
  );

  const handleOpenAddModal = () => {
    setEditingMateri(null);
    setFormData({
      title: '',
      arabicTitle: '',
      category: activeCategory,
      level: 'Dasar',
      description: '',
      content: '',
      pdfFileName: '',
      pdfUrl: '',
      authorName: 'Ust. Ahmad Dahlan, M.Pd.',
      dialogues: [
        { id: 'd1', speaker: 'أَحْمَدُ', arabic: 'السَّلاَمُ عَلَيْكُمْ', latin: 'Assalamu\'alaikum', translation: 'Keselamatan untukmu' },
        { id: 'd2', speaker: 'عَلِيٌّ', arabic: 'وَعَلَيْكُمُ السَّلاَمُ', latin: 'Wa\'alaikumussalam', translation: 'Dan keselamatan untukmu juga' }
      ],
      vocabularies: [
        { id: 'v1', word: 'كِتَابٌ', latin: 'Kitaabun', meaning: 'Buku', category: 'Umum' }
      ],
      mahfudzotArabic: 'مَنْ جَدَّ وَجَدَ',
      mahfudzotLatin: 'Man jadda wajada',
      mahfudzotTranslation: 'Barangsiapa bersungguh-sungguh ia akan berhasil',
      mahfudzotExplanation: 'Pentingnya ketekunan dalam belajar.',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (m: Materi) => {
    setEditingMateri(m);
    setFormData({
      title: m.title,
      arabicTitle: m.arabicTitle || '',
      category: m.category,
      level: m.level,
      description: m.description,
      content: m.content,
      pdfFileName: m.pdfFileName || '',
      pdfUrl: m.pdfUrl || '',
      authorName: m.authorName,
      dialogues: m.dialogues || [],
      vocabularies: m.vocabularies || [],
      mahfudzotArabic: m.mahfudzot?.arabic || '',
      mahfudzotLatin: m.mahfudzot?.latin || '',
      mahfudzotTranslation: m.mahfudzot?.translation || '',
      mahfudzotExplanation: m.mahfudzot?.explanation || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus materi ini?')) {
      const updated = materiList.filter(m => m.id !== id);
      onSaveMateri(updated);
    }
  };

  // PDF File Upload Handler with Supabase Storage integration
  const [isUploadingToSupabase, setIsUploadingToSupabase] = useState(false);
  const [supabaseUploadMsg, setSupabaseUploadMsg] = useState('');

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('File harus berformat PDF');
      return;
    }

    setIsUploadingToSupabase(true);
    setSupabaseUploadMsg('Mengunggah ke Supabase Storage...');

    // First create a fallback Data URL for local preview
    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({
        ...prev,
        pdfFileName: file.name,
        pdfUrl: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);

    try {
      // Upload to Supabase Storage bucket 'LMS Bahasa Arab'
      const { publicUrl } = await uploadToSupabaseStorage(file, file.name, 'modul-pdf');
      setFormData(prev => ({
        ...prev,
        pdfFileName: file.name,
        pdfUrl: publicUrl,
      }));
      setSupabaseUploadMsg(`Berhasil diunggah ke Supabase Storage (${BUCKET_NAME})!`);
    } catch (err: any) {
      console.warn('Supabase upload fallback to local preview:', err);
      setSupabaseUploadMsg('Tersimpan di preview lokal.');
    } finally {
      setIsUploadingToSupabase(false);
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const pdfFinalUrl = formData.pdfUrl || SAMPLE_PDF_BASE64;
    const pdfFinalName = formData.pdfFileName || `${formData.title.replace(/\s+/g, '_')}.pdf`;

    if (editingMateri) {
      const updated = materiList.map(m => {
        if (m.id === editingMateri.id) {
          return {
            ...m,
            title: formData.title,
            arabicTitle: formData.arabicTitle,
            category: formData.category,
            level: formData.level,
            description: formData.description,
            content: formData.content,
            pdfFileName: pdfFinalName,
            pdfUrl: pdfFinalUrl,
            authorName: formData.authorName,
            dialogues: formData.category === 'hiwar' ? formData.dialogues : undefined,
            vocabularies: formData.category === 'kosakata' ? formData.vocabularies : undefined,
            mahfudzot: formData.category === 'mahfudzot' ? {
              arabic: formData.mahfudzotArabic,
              latin: formData.mahfudzotLatin,
              translation: formData.mahfudzotTranslation,
              explanation: formData.mahfudzotExplanation,
            } : undefined,
            updatedAt: new Date().toISOString(),
          };
        }
        return m;
      });
      onSaveMateri(updated);
    } else {
      const newMateri: Materi = {
        id: `mat-${formData.category}-${Date.now()}`,
        title: formData.title,
        arabicTitle: formData.arabicTitle,
        category: formData.category,
        level: formData.level,
        description: formData.description,
        content: formData.content || 'Penjelasan materi pembelajaran digital Bahasa Arab.',
        pdfFileName: pdfFinalName,
        pdfUrl: pdfFinalUrl,
        pdfPageCount: Math.floor(2 + Math.random() * 6),
        authorName: formData.authorName,
        dialogues: formData.category === 'hiwar' ? formData.dialogues : undefined,
        vocabularies: formData.category === 'kosakata' ? formData.vocabularies : undefined,
        mahfudzot: formData.category === 'mahfudzot' ? {
          arabic: formData.mahfudzotArabic,
          latin: formData.mahfudzotLatin,
          translation: formData.mahfudzotTranslation,
          explanation: formData.mahfudzotExplanation,
        } : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onSaveMateri([...materiList, newMateri]);
    }

    setIsModalOpen(false);
  };

  const categoryInfo = {
    qowaid: { label: 'Qowaid (Tata Bahasa)', icon: BookOpen, arabic: 'الْقَوَاعِدُ' },
    hiwar: { label: 'Hiwar (Percakapan)', icon: MessageSquare, arabic: 'الْحِوَارُ' },
    kosakata: { label: 'Kosakata (Mufradat)', icon: List, arabic: 'الْمُفْرَدَاتُ' },
    mahfudzot: { label: 'Mahfudzot (Mutiara)', icon: Quote, arabic: 'الْمَحْفُوظَاتُ' },
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Kelola Materi Pembelajaran Digital</h2>
          <p className="text-xs text-slate-500">
            Sesuai sheet modul Guru/Admin: Unggah file PDF, tata bahasa Qowaid, Percakapan Hiwar, Mufradat Kosakata, dan Mahfudzot.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md flex items-center gap-2"
        >
          <Plus size={18} /> Tambah Materi Baru
        </button>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {(Object.keys(categoryInfo) as CategoryType[]).map((cat) => {
            const info = categoryInfo[cat];
            const Icon = info.icon;
            const count = materiList.filter(m => m.category === cat).length;
            const isActive = activeCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon size={16} />
                <span>{info.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <input
          type="text"
          placeholder="Cari materi..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 w-full sm:w-64"
        />
      </div>

      {/* Material Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {searchFiltered.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <BookOpen size={36} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-500">Belum ada materi untuk kategori ini.</p>
            <p className="text-xs text-slate-400 mt-1">Klik "Tambah Materi Baru" untuk mengunggah PDF atau menambah bacaan.</p>
          </div>
        ) : (
          searchFiltered.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Tingkat {m.level}
                  </span>
                  {m.pdfFileName && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                      <FileText size={12} /> PDF Attached
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {m.title}
                  </h3>
                  {m.arabicTitle && (
                    <p className="font-arabic text-xl text-emerald-800 mt-1">{m.arabicTitle}</p>
                  )}
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {m.description}
                </p>

                {/* Info Pills */}
                <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-100">
                  <span>Penyusun: {m.authorName}</span>
                  <span>{new Date(m.createdAt).toLocaleDateString('id-ID')}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setPreviewPdfMateri(m)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                >
                  <Eye size={15} /> Pratinjau PDF / Dokumen
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(m)}
                    className="p-1.5 text-slate-600 hover:bg-slate-200/60 rounded-lg"
                    title="Edit Materi"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-100/60 rounded-lg"
                    title="Hapus Materi"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* PDF Pratinjau Modal */}
      {previewPdfMateri && (
        <PdfViewerModal
          isOpen={!!previewPdfMateri}
          onClose={() => setPreviewPdfMateri(null)}
          title={previewPdfMateri.title}
          pdfUrl={previewPdfMateri.pdfUrl}
          pdfFileName={previewPdfMateri.pdfFileName}
          pdfPageCount={previewPdfMateri.pdfPageCount || 5}
          textContent={previewPdfMateri.content}
        />
      )}

      {/* Modal Form Tambah / Edit Materi */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <form
            onSubmit={handleSubmitForm}
            className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {editingMateri ? 'Edit Materi Pembelajaran' : 'Tambah Materi Pembelajaran Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Judul Materi (Bahasa Indonesia)</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Contoh: Pengenalan Isim, Fi'il, dan Harf"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Judul Bahasa Arab (Opsional)</label>
                  <input
                    type="text"
                    value={formData.arabicTitle}
                    onChange={(e) => setFormData({ ...formData, arabicTitle: e.target.value })}
                    placeholder="الاسم والفعل والحرف"
                    dir="rtl"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-arabic text-base focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori Modul</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as CategoryType })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-emerald-500"
                  >
                    <option value="qowaid">Qowaid (Tata Bahasa)</option>
                    <option value="hiwar">Hiwar (Percakapan)</option>
                    <option value="kosakata">Kosakata (Mufradat)</option>
                    <option value="mahfudzot">Mahfudzot (Kata Mutiara)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tingkat Kesulitan</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-emerald-500"
                  >
                    <option value="Dasar">Dasar (Mubtadi')</option>
                    <option value="Menengah">Menengah (Mutawassith)</option>
                    <option value="Lanjut">Lanjut (Mutaqaddim)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ringkasan / Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Penjelasan singkat materi ini..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              {/* PDF File Upload Field with Supabase Storage Status */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-semibold text-slate-800 flex items-center gap-1.5">
                    <FileUp size={16} className="text-emerald-600" /> Unggah File PDF Modul Pembelajaran
                  </label>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md border border-emerald-300">
                    <Database size={12} /> Supabase Storage ({BUCKET_NAME})
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="file"
                    accept="application/pdf"
                    disabled={isUploadingToSupabase}
                    onChange={handlePdfUpload}
                    className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer disabled:opacity-50"
                  />
                  {isUploadingToSupabase && (
                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1.5 animate-pulse">
                      <Loader2 size={14} className="animate-spin" /> Mengunggah ke Supabase...
                    </span>
                  )}
                  {formData.pdfFileName && !isUploadingToSupabase && (
                    <span className="text-xs text-emerald-700 font-medium flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <Check size={14} /> {formData.pdfFileName}
                    </span>
                  )}
                </div>
                {supabaseUploadMsg && (
                  <p className="text-[11px] text-emerald-700 font-medium">{supabaseUploadMsg}</p>
                )}
                <p className="text-[11px] text-slate-400">Format file .PDF (maks. 10MB). Tersimpan aman di Supabase Storage bucket "{BUCKET_NAME}".</p>
              </div>

              {/* Text / Markdown Content */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Teks Penjelasan Lengkap (Qowaid / Teori)</label>
                <textarea
                  rows={5}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Tuliskan kaidah, contoh kalimat, dan penjelasan materi di sini..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-emerald-500 font-mono text-xs"
                />
              </div>

              {/* Extra Category Builders */}
              {formData.category === 'mahfudzot' && (
                <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-3">
                  <h4 className="font-bold text-amber-900 text-xs uppercase tracking-wider">Input Mahfudzot</h4>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Teks Arab Kaligrafi / Kata Mutiara</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={formData.mahfudzotArabic}
                      onChange={(e) => setFormData({ ...formData, mahfudzotArabic: e.target.value })}
                      placeholder="مَنْ جَدَّ وَجَدَ"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-arabic text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Transliterasi Latin & Terjemahan</label>
                    <input
                      type="text"
                      value={formData.mahfudzotLatin}
                      onChange={(e) => setFormData({ ...formData, mahfudzotLatin: e.target.value })}
                      placeholder="Man jadda wajada"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl mb-2"
                    />
                    <input
                      type="text"
                      value={formData.mahfudzotTranslation}
                      onChange={(e) => setFormData({ ...formData, mahfudzotTranslation: e.target.value })}
                      placeholder="Barangsiapa bersungguh-sungguh ia akan berhasil"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>
              )}
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
                Simpan Materi
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
