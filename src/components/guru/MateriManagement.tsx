import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Materi, CategoryType, VocabularyItem } from '../../types';
import { Plus, Edit3, Trash2, Eye, FileText, BookOpen, Quote, List, Sparkles, Play, Search, CheckCircle, MessageSquare, AlertTriangle, X, FileSpreadsheet } from 'lucide-react';
import { PdfViewerModal } from '../common/PdfViewerModal';
import { QowaidFormModal } from './materi/QowaidFormModal';
import { HiwarFormModal } from './materi/HiwarFormModal';
import { KosakataFormModal } from './materi/KosakataFormModal';
import { MahfudzotFormModal } from './materi/MahfudzotFormModal';
import { HiwarView } from './materi/HiwarView';
import { KosakataTableView } from './materi/KosakataTableView';
import { KosakataView } from './materi/KosakataView';
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
  const [mahfudzotModalTab, setMahfudzotModalTab] = useState<'single' | 'sheet'>('single');

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
    setMahfudzotModalTab('single');
    if (activeCategory === 'qowaid') setIsQowaidModalOpen(true);
    else if (activeCategory === 'hiwar') setIsHiwarModalOpen(true);
    else if (activeCategory === 'kosakata') setIsKosakataModalOpen(true);
    else if (activeCategory === 'mahfudzot') setIsMahfudzotModalOpen(true);
  };

  const handleOpenSheetModal = () => {
    setEditingMateri(null);
    setMahfudzotModalTab('sheet');
    setIsMahfudzotModalOpen(true);
  };

  const handleOpenEditModal = (materi: Materi) => {
    setEditingMateri(materi);
    setMahfudzotModalTab('single');
    if (materi.category === 'qowaid') setIsQowaidModalOpen(true);
    else if (materi.category === 'hiwar') setIsHiwarModalOpen(true);
    else if (materi.category === 'kosakata') setIsKosakataModalOpen(true);
    else if (materi.category === 'mahfudzot') setIsMahfudzotModalOpen(true);
  };

  // Delete confirmation modal state
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    type: 'materi' | 'vocab' | 'clear_all' | 'multiple_materi';
    materiId?: string;
    materiIds?: string[];
    vocabId?: string;
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'materi',
    title: '',
    message: '',
  });

  const requestDeleteMateri = (materi: Materi) => {
    setDeleteConfirmation({
      isOpen: true,
      type: 'materi',
      materiId: materi.id,
      title: `Hapus Materi "${materi.title}"`,
      message: `Apakah Anda yakin ingin menghapus materi Bab ${materi.babNumber || 1} (${materi.category.toUpperCase()}) ini? Data materi yang dihapus tidak dapat dikembalikan.`,
    });
  };

  const requestDeleteMultipleMateri = (ids: string[]) => {
    setDeleteConfirmation({
      isOpen: true,
      type: 'multiple_materi',
      materiIds: ids,
      title: `Hapus ${ids.length} Materi Terpilih`,
      message: `Apakah Anda yakin ingin menghapus ${ids.length} materi terpilih secara massal? Tindakan ini tidak dapat dibatalkan.`,
    });
  };

  const requestDeleteVocabItem = (materiId: string, vocabId: string) => {
    const materi = materiList.find(m => m.id === materiId);
    const vocab = materi?.vocabularies?.find(v => v.id === vocabId);
    setDeleteConfirmation({
      isOpen: true,
      type: 'vocab',
      materiId,
      vocabId,
      title: `Hapus Kosakata "${vocab?.word || ''}"`,
      message: `Apakah Anda yakin ingin menghapus kata "${vocab?.word || ''}" (${vocab?.meaning || ''}) dari modul bab ini?`,
    });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmation.type === 'clear_all') {
      onSaveMateri([]);
    } else if (deleteConfirmation.type === 'materi' && deleteConfirmation.materiId) {
      const updated = materiList.filter(m => m.id !== deleteConfirmation.materiId);
      onSaveMateri(updated);
    } else if (deleteConfirmation.type === 'multiple_materi' && deleteConfirmation.materiIds) {
      const idsToDelete = new Set(deleteConfirmation.materiIds);
      const updated = materiList.filter(m => !idsToDelete.has(m.id));
      onSaveMateri(updated);
    } else if (deleteConfirmation.type === 'vocab' && deleteConfirmation.materiId && deleteConfirmation.vocabId) {
      const updated = materiList.map(m => {
        if (m.id === deleteConfirmation.materiId) {
          return {
            ...m,
            vocabularies: (m.vocabularies || []).filter(v => v.id !== deleteConfirmation.vocabId),
            updatedAt: new Date().toISOString(),
          };
        }
        return m;
      });
      onSaveMateri(updated);
    }

    setDeleteConfirmation({
      isOpen: false,
      type: 'materi',
      title: '',
      message: '',
    });
  };

  const handleSaveModalMateri = (partial: Partial<Materi> | Partial<Materi>[], isBulkMode?: 'append' | 'overwrite') => {
    if (Array.isArray(partial)) {
      const newItems: Materi[] = partial.map((item, index) => ({
        id: `mat-mahfudzot-${Date.now()}-${index}`,
        title: item.title || `Mahfudzot No. ${item.babNumber || index + 1}`,
        arabicTitle: item.arabicTitle || item.mahfudzot?.arabic || '',
        category: 'mahfudzot',
        babNumber: item.babNumber || index + 1,
        learningTargets: [],
        content: item.content || '',
        description: item.description || '',
        pdfUrl: '',
        pdfFileName: '',
        vocabularies: [],
        mahfudzot: item.mahfudzot,
        authorName: 'Ust. Ahmad Dahlan, M.Pd.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      if (isBulkMode === 'overwrite') {
        const remaining = materiList.filter(m => m.category !== 'mahfudzot');
        onSaveMateri([...remaining, ...newItems]);
      } else {
        onSaveMateri([...materiList, ...newItems]);
      }
      return;
    }

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
        ...partial,
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

  // Launch Flashcards for Mahfudzot (supports filtered list)
  const handleLaunchMahfudzotFlashcards = (filteredList?: Materi[]) => {
    const listToUse = filteredList && filteredList.length > 0
      ? filteredList
      : materiList.filter(m => m.category === 'mahfudzot');

    if (listToUse.length === 0) {
      alert('Belum ada data Mahfudzot untuk ditampilkan.');
      return;
    }
    const items: FlashcardItem[] = listToUse.map((m, idx) => ({
      id: m.id,
      frontArabic: m.mahfudzot?.arabic || m.content,
      backTranslation: m.mahfudzot?.translation || m.description,
      latin: m.mahfudzot?.latin,
      detail: `Mahfudzot No. ${m.mahfudzot?.number || m.babNumber || idx + 1}`,
      number: m.mahfudzot?.number || m.babNumber || idx + 1,
    }));

    setFlashcardModalState({
      isOpen: true,
      title: `Flashcard Mahfudzot (${listToUse.length} Kata Mutiara)`,
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

          <div className="flex flex-wrap items-center gap-2">
            {activeCategory === 'mahfudzot' && (
              <button
                onClick={handleOpenSheetModal}
                className="px-3.5 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <FileSpreadsheet size={16} className="text-purple-700" /> Upload Sheet Massal
              </button>
            )}
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/10 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus size={16} /> Tambah Materi {activeCategory.toUpperCase()}
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveCategory('qowaid')}
            className={`py-3 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeCategory === 'qowaid'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen size={16} /> Qowaid
          </button>

          <button
            onClick={() => setActiveCategory('hiwar')}
            className={`py-3 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeCategory === 'hiwar'
                ? 'bg-sky-700 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare size={16} /> Hiwar (الحوار)
          </button>

          <button
            onClick={() => setActiveCategory('kosakata')}
            className={`py-3 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeCategory === 'kosakata'
                ? 'bg-teal-700 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List size={16} /> Kosakata (المفردات)
          </button>

          <button
            onClick={() => setActiveCategory('mahfudzot')}
            className={`py-3 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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
                          className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                          title="Edit Qowaid"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => requestDeleteMateri(materi)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="Hapus Materi Ini"
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
                        className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
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
          onDeleteMateri={(id) => {
            const mat = materiList.find(m => m.id === id);
            if (mat) requestDeleteMateri(mat);
          }}
          onAddMateri={handleOpenAddModal}
          isEditable={true}
        />
      )}

      {/* CATEGORY VIEW 3: KOSAKATA */}
      {activeCategory === 'kosakata' && (
        <KosakataView
          materiList={materiList}
          onEditMateri={handleOpenEditModal}
          onDeleteMateri={(id) => {
            const mat = materiList.find(m => m.id === id);
            if (mat) requestDeleteMateri(mat);
          }}
          onDeleteVocabItem={(materiId, vocabId) => requestDeleteVocabItem(materiId, vocabId)}
          onAddMateri={handleOpenAddModal}
          isEditable={true}
        />
      )}

      {/* CATEGORY VIEW 4: MAHFUDZOT */}
      {activeCategory === 'mahfudzot' && (
        <MahfudzotView
          materiList={materiList}
          onEditMateri={handleOpenEditModal}
          onDeleteMateri={(id) => {
            const mat = materiList.find(m => m.id === id);
            if (mat) requestDeleteMateri(mat);
          }}
          onDeleteMultipleMateri={requestDeleteMultipleMateri}
          onLaunchFlashcards={handleLaunchMahfudzotFlashcards}
          onOpenSheetModal={handleOpenSheetModal}
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
        defaultTab={mahfudzotModalTab}
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

      {/* Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmation.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden space-y-0"
            >
              {/* Header */}
              <div className="bg-rose-600 p-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-100" />
                  <h3 className="font-extrabold text-sm">{deleteConfirmation.title}</h3>
                </div>
                <button
                  onClick={() => setDeleteConfirmation(prev => ({ ...prev, isOpen: false }))}
                  className="p-1 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {deleteConfirmation.message}
                </p>

                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-800 dark:text-rose-300 font-bold">
                  ⚠️ Perhatian: Tindakan penghapusan ini tidak dapat dibatalkan (permanen).
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmation(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 size={14} /> Ya, Hapus Sekarang
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
