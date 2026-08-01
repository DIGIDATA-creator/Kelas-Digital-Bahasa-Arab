import React, { useState } from 'react';
import { Materi, CategoryType, VocabularyItem } from '../../types';
import { Plus, Edit3, Trash2, Eye, FileText, BookOpen, Quote, List, Sparkles, Play, Search, CheckCircle, MessageSquare } from 'lucide-react';
import { PdfViewerModal } from '../common/PdfViewerModal';
import { QowaidFormModal } from './materi/QowaidFormModal';
import { HiwarFormModal } from './materi/HiwarFormModal';
import { KosakataFormModal } from './materi/KosakataFormModal';
import { MahfudzotFormModal } from './materi/MahfudzotFormModal';
import { HiwarView } from './materi/HiwarView';
import { KosakataTableView } from './materi/KosakataTableView';
import { MahfudzotView } from './materi/MahfudzotView';
import { FlashcardModal, FlashcardItem } from '../common/FlashcardModal';

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

  // Modals
  const [previewPdfMateri, setPreviewPdfMateri] = useState<Materi | null>(null);

  // Form Modals
  const [isQowaidModalOpen, setIsQowaidModalOpen] = useState(false);
  const [isHiwarModalOpen, setIsHiwarModalOpen] = useState(false);
  const [isKosakataModalOpen, setIsKosakataModalOpen] = useState(false);
  const [isMahfudzotModalOpen, setIsMahfudzotModalOpen] = useState(false);

  // Currently Editing Item
  const [editingMateri, setEditingMateri] = useState<Materi | null>(null);

  // Flashcard Modal State
  const [flashcardModalState, setFlashcardModalState] = useState<{
    isOpen: boolean;
    title: string;
    items: FlashcardItem[];
  }>({
    isOpen: false,
    title: '',
    items: [],
  });

  // Filtered by category and search
  const categoryFiltered = materiList.filter(m => m.category === activeCategory);
  const searchFiltered = categoryFiltered.filter(m =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.arabicTitle && m.arabicTitle.includes(searchTerm)) ||
    (m.description && m.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenAddModal = () => {
    setEditingMateri(null);
    if (activeCategory === 'qowaid') setIsQowaidModalOpen(true);
    else if (activeCategory === 'hiwar') setIsHiwarModalOpen(true);
    else if (activeCategory === 'kosakata') setIsKosakataModalOpen(true);
    else if (activeCategory === 'mahfudzot') setIsMahfudzotModalOpen(true);
  };

  const handleOpenEditModal = (materi: Materi) => {
    setEditingMateri(materi);
    if (materi.category === 'qowaid') setIsQowaidModalOpen(true);
    else if (materi.category === 'hiwar') setIsHiwarModalOpen(true);
    else if (materi.category === 'kosakata') setIsKosakataModalOpen(true);
    else if (materi.category === 'mahfudzot') setIsMahfudzotModalOpen(true);
  };

  const handleDeleteMateri = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus materi ini?')) {
      const updated = materiList.filter(m => m.id !== id);
      onSaveMateri(updated);
    }
  };

  const handleSaveModalMateri = (partial: Partial<Materi>) => {
    if (editingMateri) {
      // Update
      const updated = materiList.map(m => {
        if (m.id === editingMateri.id) {
          return {
            ...m,
            ...partial,
            updatedAt: new Date().toISOString(),
          } as Materi;
        }
        return m;
      });
      onSaveMateri(updated);
    } else {
      // Create new
      const newMateri: Materi = {
        id: `mat-${Date.now()}`,
        title: partial.title || 'Materi Baru',
        arabicTitle: partial.arabicTitle || '',
        category: partial.category || activeCategory,
        qowaidCategory: partial.qowaidCategory || 'قواعد',
        babNumber: partial.babNumber || 1,
        learningTargets: partial.learningTargets || [],
        content: partial.content || '',
        description: partial.description || '',
        pdfUrl: partial.pdfUrl || '',
        pdfFileName: partial.pdfFileName || '',
        vocabularies: partial.vocabularies || [],
        mahfudzot: partial.mahfudzot,
        authorName: 'Ust. Ahmad Dahlan, M.Pd.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onSaveMateri([...materiList, newMateri]);
    }
  };

  // Launch Flashcards for a Kosakata Bab
  const handleLaunchKosakataFlashcards = (materi: Materi) => {
    const vocabs = materi.vocabularies || [];
    if (vocabs.length === 0) {
      alert('Belum ada kosakata pada bab ini untuk dijadikan flashcard.');
      return;
    }
    const items: FlashcardItem[] = vocabs.map(v => ({
      id: v.id,
      frontArabic: v.word,
      backTranslation: v.meaning,
      latin: v.latin,
    }));

    setFlashcardModalState({
      isOpen: true,
      title: `Flashcard Kosakata - ${materi.title}`,
      items,
    });
  };

  // Launch Flashcards for all Mahfudzot
  const handleLaunchMahfudzotFlashcards = () => {
    const mahfudzotMateri = materiList.filter(m => m.category === 'mahfudzot');
    if (mahfudzotMateri.length === 0) {
      alert('Belum ada data Mahfudzot.');
      return;
    }
    const items: FlashcardItem[] = mahfudzotMateri.map((m, idx) => ({
      id: m.id,
      frontArabic: m.mahfudzot?.arabic || m.content,
      backTranslation: m.mahfudzot?.translation || m.description,
      detail: `Mahfudzot ${m.babNumber || idx + 1}`,
    }));

    setFlashcardModalState({
      isOpen: true,
      title: 'Flashcard Kumpulan Mahfudzot (Kata Mutiara)',
      items,
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Category Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Kelola Materi Pembelajaran</h2>
            <p className="text-xs text-slate-500 font-medium">
              Manajemen modul Qowaid, Kosakata, dan Mahfudzot digital
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/10 flex items-center gap-2 transition-all"
          >
            <Plus size={16} /> Tambah Materi {activeCategory.toUpperCase()}
          </button>
        </div>

        {/* Category Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveCategory('qowaid')}
            className={`py-3 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
              activeCategory === 'qowaid'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen size={16} /> Qowaid
          </button>

          <button
            onClick={() => setActiveCategory('hiwar')}
            className={`py-3 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
              activeCategory === 'hiwar'
                ? 'bg-sky-700 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare size={16} /> Hiwar (الحوار)
          </button>

          <button
            onClick={() => setActiveCategory('kosakata')}
            className={`py-3 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
              activeCategory === 'kosakata'
                ? 'bg-teal-700 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List size={16} /> Kosakata (المفردات)
          </button>

          <button
            onClick={() => setActiveCategory('mahfudzot')}
            className={`py-3 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
              activeCategory === 'mahfudzot'
                ? 'bg-purple-700 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Quote size={16} /> Mahfudzot (الـمَحْفُوظَات)
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={`Cari materi ${activeCategory}...`}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-emerald-500 shadow-2xs"
        />
      </div>

      {/* CATEGORY VIEW 1: QOWAID */}
      {activeCategory === 'qowaid' && (
        <div className="space-y-4">
          {searchFiltered.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs font-medium">
              Belum ada materi Qowaid. Klik tombol "Tambah Materi QOWAID" di atas.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchFiltered.map((materi) => (
                <div
                  key={materi.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-emerald-300 transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b pb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-black rounded-lg">
                          Bab {materi.babNumber || 1}
                        </span>
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-800 font-arabic text-sm font-bold rounded-lg">
                          {materi.qowaidCategory || 'قواعد'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(materi)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-50"
                          title="Edit Qowaid"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteMateri(materi.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50"
                          title="Hapus Materi"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Target Pembelajaran */}
                    {materi.learningTargets && materi.learningTargets.length > 0 && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs">
                        <span className="font-bold text-slate-700 block">Target Pembelajaran:</span>
                        <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                          {materi.learningTargets.map((t, idx) => (
                            <li key={idx}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Content Explanation */}
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {materi.content}
                    </p>
                  </div>

                  {/* PDF Document Button */}
                  {materi.pdfUrl && (
                    <div className="pt-3 border-t">
                      <button
                        onClick={() => setPreviewPdfMateri(materi)}
                        className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                      >
                        <FileText size={15} /> Pratinjau Dokumen PDF Modul
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CATEGORY VIEW 2: HIWAR */}
      {activeCategory === 'hiwar' && (
        <HiwarView
          materiList={materiList}
          onEditMateri={handleOpenEditModal}
          onDeleteMateri={handleDeleteMateri}
          onAddMateri={handleOpenAddModal}
          isEditable={true}
        />
      )}

      {/* CATEGORY VIEW 3: KOSAKATA */}
      {activeCategory === 'kosakata' && (
        <div className="space-y-6">
          {searchFiltered.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs font-medium">
              Belum ada materi Kosakata. Klik tombol "Tambah Materi KOSAKATA" di atas.
            </div>
          ) : (
            searchFiltered.map((materi) => (
              <KosakataTableView
                key={materi.id}
                title={materi.title}
                arabicTitle={materi.arabicTitle}
                babNumber={materi.babNumber}
                vocabularies={materi.vocabularies || []}
                onEditItem={() => handleOpenEditModal(materi)}
                onDeleteItem={() => handleDeleteMateri(materi.id)}
                onAddItem={() => handleOpenEditModal(materi)}
                onLaunchFlashcard={() => handleLaunchKosakataFlashcards(materi)}
                isEditable={true}
              />
            ))
          )}
        </div>
      )}

      {/* CATEGORY VIEW 3: MAHFUDZOT */}
      {activeCategory === 'mahfudzot' && (
        <MahfudzotView
          materiList={materiList}
          onEditMateri={handleOpenEditModal}
          onDeleteMateri={handleDeleteMateri}
          onLaunchFlashcards={handleLaunchMahfudzotFlashcards}
          isEditable={true}
        />
      )}

      {/* Form Modals */}
      <QowaidFormModal
        isOpen={isQowaidModalOpen}
        onClose={() => setIsQowaidModalOpen(false)}
        editingMateri={editingMateri}
        existingMateriList={materiList}
        onSave={handleSaveModalMateri}
      />

      <HiwarFormModal
        isOpen={isHiwarModalOpen}
        onClose={() => setIsHiwarModalOpen(false)}
        editingMateri={editingMateri}
        existingMateriList={materiList}
        onSave={handleSaveModalMateri}
      />

      <KosakataFormModal
        isOpen={isKosakataModalOpen}
        onClose={() => setIsKosakataModalOpen(false)}
        editingMateri={editingMateri}
        existingMateriList={materiList}
        onSave={handleSaveModalMateri}
      />

      <MahfudzotFormModal
        isOpen={isMahfudzotModalOpen}
        onClose={() => setIsMahfudzotModalOpen(false)}
        editingMateri={editingMateri}
        existingMateriList={materiList}
        onSave={handleSaveModalMateri}
      />

      {/* Flashcard Player Modal */}
      <FlashcardModal
        isOpen={flashcardModalState.isOpen}
        onClose={() => setFlashcardModalState(prev => ({ ...prev, isOpen: false }))}
        title={flashcardModalState.title}
        items={flashcardModalState.items}
      />

      {/* PDF Viewer Modal */}
      {previewPdfMateri && (
        <PdfViewerModal
          isOpen={!!previewPdfMateri}
          onClose={() => setPreviewPdfMateri(null)}
          pdfUrl={previewPdfMateri.pdfUrl || ''}
          title={`${previewPdfMateri.title} - File PDF`}
        />
      )}

    </div>
  );
};
