import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Materi, CategoryType, VocabularyItem, Student } from '../../types';
import { Plus, Edit3, Trash2, Eye, FileText, BookOpen, Quote, List, Sparkles, Play, Search, CheckCircle, MessageSquare, AlertTriangle, X, FileSpreadsheet, BarChart3, Target, ListOrdered, SlidersHorizontal, Download } from 'lucide-react';
import { PdfViewerModal } from '../common/PdfViewerModal';
import { notificationService } from '../../services/notificationService';
import { storageService } from '../../services/storage';
import { QowaidFormModal } from './materi/QowaidFormModal';
import { HiwarFormModal } from './materi/HiwarFormModal';
import { KosakataFormModal } from './materi/KosakataFormModal';
import { MahfudzotFormModal } from './materi/MahfudzotFormModal';
import { ManageTargetsModal } from './materi/ManageTargetsModal';
import { HiwarView } from './materi/HiwarView';
import { KosakataTableView } from './materi/KosakataTableView';
import { KosakataView } from './materi/KosakataView';
import { MahfudzotView } from './materi/MahfudzotView';
import { FlashcardModal, FlashcardItem } from '../common/FlashcardModal';
import { MonitoringPemahamanView } from './materi/MonitoringPemahamanView';
import { ConfirmationModal } from '../common/ConfirmationModal';

interface MateriManagementProps {
  materiList: Materi[];
  students?: Student[];
  onSaveMateri: (updated: Materi[]) => void;
}

export const MateriManagement: React.FC<MateriManagementProps> = ({
  materiList,
  students = [],
  onSaveMateri,
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('qowaid');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewSubMode, setViewSubMode] = useState<'materi' | 'monitoring'>('materi');

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

  // Manage Targets Modal State
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [targetModalMateri, setTargetModalMateri] = useState<Materi | null>(null);

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

  // Delete confirmation modal state
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    type: 'materi' | 'vocab' | 'clear_all' | 'multiple_materi';
    materiId?: string;
    materiIds?: string[];
    vocabId?: string;
    title: string;
    message: string;
    itemName?: string;
    itemDetails?: string[];
  }>({
    isOpen: false,
    type: 'materi',
    title: '',
    message: '',
  });

  // Proactively fetch latest materi from Firestore on mount
  useEffect(() => {
    storageService.fetchLatestMateriData().then(fresh => {
      if (fresh && fresh.length > 0) {
        onSaveMateri(fresh);
      }
    }).catch(console.warn);
  }, []);

  // Filtered by category and search
  const categoryFiltered = materiList.filter(m => m.category === activeCategory);
  const searchFiltered = categoryFiltered.filter(m =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.arabicTitle && m.arabicTitle.includes(searchTerm)) ||
    (m.description && m.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  /**
   * Explicit filter function that correctly identifies the materi object by ID
   * and removes it before updating the state and storage.
   */
  const filterMateriByIdAndRemove = (targetId: string, currentList: Materi[] = materiList): Materi[] => {
    const cleanTargetId = String(targetId).trim();
    if (!cleanTargetId) return currentList;
    return currentList.filter(item => String(item.id).trim() !== cleanTargetId);
  };

  /**
   * Explicit bulk filter function for multiple materi IDs.
   */
  const filterMateriByMultipleIdsAndRemove = (targetIds: string[], currentList: Materi[] = materiList): Materi[] => {
    const idSet = new Set(targetIds.map(id => String(id).trim()));
    return currentList.filter(item => !idSet.has(String(item.id).trim()));
  };

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

  const requestDeleteMateri = (materi: Materi) => {
    setDeleteConfirmation({
      isOpen: true,
      type: 'materi',
      materiId: materi.id,
      itemName: `${materi.title} (Bab ${materi.babNumber || 1} - ${materi.category.toUpperCase()})`,
      title: `Hapus Materi ${materi.category.toUpperCase()}`,
      message: `Apakah Anda yakin ingin menghapus materi Bab ${materi.babNumber || 1} "${materi.title}"? Data target pembelajaran dan lampiran PDF pada materi ini akan dihapus secara permanen.`,
    });
  };

  const requestDeleteMultipleMateri = (ids: string[]) => {
    const targetItems = materiList.filter(m => ids.includes(m.id));
    const itemNames = targetItems.map(m => `Bab ${m.babNumber || 1}: ${m.title}`);
    setDeleteConfirmation({
      isOpen: true,
      type: 'multiple_materi',
      materiIds: ids,
      title: `Hapus ${ids.length} Materi Terpilih`,
      message: `Apakah Anda yakin ingin menghapus ${ids.length} materi terpilih secara massal? Tindakan ini tidak dapat dibatalkan.`,
      itemDetails: itemNames.slice(0, 10),
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
      itemName: `${vocab?.word || ''} - ${vocab?.meaning || ''}`,
      title: `Hapus Kosakata`,
      message: `Apakah Anda yakin ingin menghapus kosakata "${vocab?.word || ''}" dari modul Bab ${materi?.babNumber || 1}?`,
    });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmation.type === 'clear_all') {
      onSaveMateri([]);
    } else if (deleteConfirmation.type === 'materi' && deleteConfirmation.materiId) {
      const updated = filterMateriByIdAndRemove(deleteConfirmation.materiId, materiList);
      onSaveMateri(updated);
    } else if (deleteConfirmation.type === 'multiple_materi' && deleteConfirmation.materiIds) {
      const updated = filterMateriByMultipleIdsAndRemove(deleteConfirmation.materiIds, materiList);
      onSaveMateri(updated);
    } else if (deleteConfirmation.type === 'vocab' && deleteConfirmation.materiId && deleteConfirmation.vocabId) {
      const cleanMateriId = String(deleteConfirmation.materiId).trim();
      const cleanVocabId = String(deleteConfirmation.vocabId).trim();
      const updated = materiList.map(m => {
        if (String(m.id).trim() === cleanMateriId) {
          return {
            ...m,
            vocabularies: (m.vocabularies || []).filter(v => String(v.id).trim() !== cleanVocabId),
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
        authorName: storageService.getGuruProfile()?.name || 'Ahmad Yusron',
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
        authorName: storageService.getGuruProfile()?.name || 'Ahmad Yusron',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...partial,
      };
      onSaveMateri([...materiList, newMateri]);

      // Alert all students about newly published materi
      notificationService.addNotificationToAllStudents({
        title: `📚 Materi Baru Dipublikasikan: ${newMateri.title}`,
        message: `Guru telah mempublikasikan materi baru Bab ${newMateri.babNumber || 1} (${newMateri.category.toUpperCase()}). Yuk pelajari sekarang!`,
        type: 'materi',
        targetId: newMateri.id,
        targetCategory: newMateri.category,
      });
    }
  };

  // Open Manage Targets Modal for a Materi
  const handleOpenManageTargets = (materi: Materi) => {
    setTargetModalMateri(materi);
    setIsTargetModalOpen(true);
  };

  // Save updated targets directly from ManageTargetsModal
  const handleSaveTargets = (materiId: string, updatedTargets: string[]) => {
    const updated = materiList.map((m) => {
      if (m.id === materiId) {
        return {
          ...m,
          learningTargets: updatedTargets,
          updatedAt: new Date().toISOString(),
        };
      }
      return m;
    });
    onSaveMateri(updated);
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
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Kelola &amp; Monitoring Materi Pembelajaran</h2>
            <p className="text-xs text-slate-500 font-medium">
              Manajemen modul Qowaid, Hiwar, Kosakata, Mahfudzot &amp; Rekapitulasi Pemahaman Siswa
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setViewSubMode(prev => prev === 'materi' ? 'monitoring' : 'materi')}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                viewSubMode === 'monitoring'
                  ? 'bg-amber-500 text-slate-950 font-black ring-2 ring-amber-400'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200'
              }`}
            >
              <BarChart3 size={16} className={viewSubMode === 'monitoring' ? 'text-slate-950' : 'text-indigo-700'} />
              <span>{viewSubMode === 'monitoring' ? '📚 Kembali ke Kelola Modul' : '📊 Monitoring Pemahaman Siswa'}</span>
            </button>

            {viewSubMode === 'materi' && activeCategory === 'mahfudzot' && (
              <button
                onClick={handleOpenSheetModal}
                className="px-3.5 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <FileSpreadsheet size={16} className="text-purple-700" /> Upload Sheet Massal
              </button>
            )}

            {viewSubMode === 'materi' && (
              <button
                onClick={() => {
                  const jsonStr = storageService.exportMateriJSON();
                  const dateStr = new Date().toISOString().split('T')[0];
                  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `backup_materi_bahasa_arab_${dateStr}.json`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                }}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                title="Ekspor seluruh materi pembelajaran ke format JSON cadangan"
              >
                <Download size={15} className="text-slate-700" /> Ekspor Materi (JSON)
              </button>
            )}

            {viewSubMode === 'materi' && (
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/10 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Plus size={16} /> Tambah Materi {activeCategory.toUpperCase()}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mode 1: Monitoring View */}
      {viewSubMode === 'monitoring' ? (
        <MonitoringPemahamanView
          materiList={materiList}
          students={students}
        />
      ) : (
        /* Mode 2: Standard Materi Management */
        <div className="space-y-6">
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

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenManageTargets(materi)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Kelola & Atur Urutan Target Pembelajaran"
                        >
                          <Target size={13} className="text-emerald-600" />
                          <span>Target ({materi.learningTargets?.length || 0})</span>
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(materi)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                          title="Edit Materi Lengkap"
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

                    {/* Judul & Deskripsi Materi Qowaid */}
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                        {materi.title}
                      </h3>
                      {materi.arabicTitle && (
                        <p className="text-sm font-arabic text-emerald-800 font-bold dir-rtl">
                          {materi.arabicTitle}
                        </p>
                      )}
                      {materi.description && (
                        <p className="text-xs text-slate-500 font-medium">
                          {materi.description}
                        </p>
                      )}
                    </div>

                    {/* Target Pembelajaran / Capaian Materi */}
                    <div className="p-3.5 bg-gradient-to-br from-slate-50 to-emerald-50/40 rounded-2xl border border-emerald-100/80 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
                          <Target size={14} className="text-emerald-700" />
                          <span>Target Pembelajaran</span>
                          <span className="px-1.5 py-0.2 bg-emerald-200/80 text-emerald-900 text-[10px] rounded-md font-bold">
                            {materi.learningTargets?.length || 0}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenManageTargets(materi)}
                          className="text-[11px] font-extrabold text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1 cursor-pointer bg-white px-2 py-0.5 rounded-lg border border-emerald-200 shadow-2xs"
                        >
                          <SlidersHorizontal size={11} /> Atur & Urutkan Target
                        </button>
                      </div>

                      {materi.learningTargets && materi.learningTargets.length > 0 ? (
                        <div className="space-y-1 pt-1">
                          {materi.learningTargets.map((t, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-white/80 px-2 py-1.5 rounded-xl border border-slate-100">
                              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <span className="font-medium leading-tight">{t}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-2">
                          <p className="text-[11px] text-slate-400 mb-1.5">Belum ada poin target pembelajaran</p>
                          <button
                            type="button"
                            onClick={() => handleOpenManageTargets(materi)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                          >
                            <Plus size={12} /> Buat Target Baru
                          </button>
                        </div>
                      )}
                    </div>

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

      {/* Manage Targets & Reorder Modal */}
      <ManageTargetsModal
        isOpen={isTargetModalOpen}
        onClose={() => {
          setIsTargetModalOpen(false);
          setTargetModalMateri(null);
        }}
        materi={targetModalMateri}
        onSaveTargets={handleSaveTargets}
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
      )}

      {/* Universal Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmDelete}
        title={deleteConfirmation.title}
        message={deleteConfirmation.message}
        itemName={deleteConfirmation.itemName}
        itemDetails={deleteConfirmation.itemDetails}
        confirmText="Ya, Hapus Sekarang"
        cancelText="Batal"
        variant="danger"
      />

    </div>
  );
};
