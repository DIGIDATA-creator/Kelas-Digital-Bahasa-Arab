import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Materi, DialogueTurnPair } from '../../../types';
import { toArabicNumber } from '../../common/ArabicUtils';
import { AudioPlayerButton } from '../../common/AudioPlayerButton';
import { storageService } from '../../../services/storage';
import { X, Plus, Trash2, FileSpreadsheet, Save, MessageSquare, Layers, HelpCircle, Video } from 'lucide-react';

interface HiwarFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingMateri: Materi | null;
  existingMateriList: Materi[];
  onSave: (materi: Partial<Materi>) => void;
}

export const HiwarFormModal: React.FC<HiwarFormModalProps> = ({
  isOpen,
  onClose,
  editingMateri,
  existingMateriList,
  onSave,
}) => {
  // (Rendered using AnimatePresence below)
  // Initialize state from editingMateri or defaults
  const [babNumber, setBabNumber] = useState<number>(editingMateri?.babNumber || 1);
  const [title, setTitle] = useState<string>(editingMateri?.title || '');
  const [arabicTitle, setArabicTitle] = useState<string>(editingMateri?.arabicTitle || '');
  const [videoUrl, setVideoUrl] = useState<string>(editingMateri?.videoUrl || '');
  const [hiwarLevelNumber, setHiwarLevelNumber] = useState<number>(editingMateri?.hiwarLevelNumber || 1);

  // Convert existing dialogues into dialoguePairs if needed
  const initialPairs: DialogueTurnPair[] = (() => {
    if (editingMateri?.dialoguePairs && editingMateri.dialoguePairs.length > 0) {
      return editingMateri.dialoguePairs;
    }
    if (editingMateri?.dialogues && editingMateri.dialogues.length > 0) {
      const pairs: DialogueTurnPair[] = [];
      for (let i = 0; i < editingMateri.dialogues.length; i += 2) {
        const d1 = editingMateri.dialogues[i];
        const d2 = editingMateri.dialogues[i + 1];
        pairs.push({
          id: `pair-${Date.now()}-${i}`,
          turnNumber: pairs.length + 1,
          speaker1: d1 ? d1.speaker : 'سُؤَالٌ',
          arabic1: d1 ? d1.arabic : '',
          translation1: d1 ? d1.translation : '',
          speaker2: d2 ? d2.speaker : 'جَوَابٌ',
          arabic2: d2 ? d2.arabic : '',
          translation2: d2 ? d2.translation : '',
        });
      }
      return pairs;
    }
    return [
      {
        id: 'p1',
        turnNumber: 1,
        speaker1: 'أَحْمَدُ',
        arabic1: 'السَّلاَمُ عَلَيْكُمْ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ',
        translation1: 'Semoga keselamatan dan rahmat Allah tercurah kepadamu.',
        speaker2: 'عَلِيٌّ',
        arabic2: 'وَعَلَيْكُمُ السَّلاَمُ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ',
        translation2: 'Dan semoga keselamatan dan rahmat Allah tercurah kepadamu juga.',
      },
    ];
  })();

  const [dialoguePairs, setDialoguePairs] = useState<DialogueTurnPair[]>(initialPairs);

  // Form states for adding new turn pair manually
  const [speaker1, setSpeaker1] = useState('سُؤَالٌ');
  const [arabic1, setArabic1] = useState('');
  const [translation1, setTranslation1] = useState('');

  const [speaker2, setSpeaker2] = useState('جَوَابٌ');
  const [arabic2, setArabic2] = useState('');
  const [translation2, setTranslation2] = useState('');

  // Sheet Modal State
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);
  const [sheetText, setSheetText] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const modalScrollRef = useRef<HTMLDivElement>(null);

  // Synchronize modal fields whenever isOpen or editingMateri changes
  useEffect(() => {
    if (isOpen) {
      if (editingMateri) {
        setBabNumber(editingMateri.babNumber || 1);
        setTitle(editingMateri.title || '');
        setArabicTitle(editingMateri.arabicTitle || '');
        setVideoUrl(editingMateri.videoUrl || '');
        setHiwarLevelNumber(editingMateri.hiwarLevelNumber || 1);

        if (editingMateri.dialoguePairs && editingMateri.dialoguePairs.length > 0) {
          setDialoguePairs(editingMateri.dialoguePairs);
        } else if (editingMateri.dialogues && editingMateri.dialogues.length > 0) {
          const pairs: DialogueTurnPair[] = [];
          for (let i = 0; i < editingMateri.dialogues.length; i += 2) {
            const d1 = editingMateri.dialogues[i];
            const d2 = editingMateri.dialogues[i + 1];
            pairs.push({
              id: `pair-${Date.now()}-${i}`,
              turnNumber: pairs.length + 1,
              speaker1: d1 ? d1.speaker : 'سُؤَالٌ',
              arabic1: d1 ? d1.arabic : '',
              translation1: d1 ? d1.translation : '',
              speaker2: d2 ? d2.speaker : 'جَوَابٌ',
              arabic2: d2 ? d2.arabic : '',
              translation2: d2 ? d2.translation : '',
            });
          }
          setDialoguePairs(pairs);
        } else {
          setDialoguePairs([]);
        }
      } else {
        // New materi mode: calculate default next Bab
        const hiwarList = existingMateriList.filter(m => m.category === 'hiwar');
        const maxBab = hiwarList.length > 0 ? Math.max(...hiwarList.map(m => m.babNumber || 1)) : 0;
        setBabNumber(maxBab + 1 || 1);
        setTitle('');
        setArabicTitle('');
        setVideoUrl('');
        setHiwarLevelNumber(1);
        setDialoguePairs([
          {
            id: 'p1',
            turnNumber: 1,
            speaker1: 'أَحْمَدُ',
            arabic1: 'السَّلاَمُ عَلَيْكُمْ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ',
            translation1: 'Semoga keselamatan dan rahmat Allah tercurah kepadamu.',
            speaker2: 'عَلِيٌّ',
            arabic2: 'وَعَلَيْكُمُ السَّلاَمُ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ',
            translation2: 'Dan semoga keselamatan dan rahmat Allah tercurah kepadamu juga.',
          },
        ]);
      }
      setArabic1('');
      setTranslation1('');
      setArabic2('');
      setTranslation2('');
      setSheetText('');
    }
  }, [isOpen, editingMateri]);

  const handleAddPair = () => {
    if (!arabic1.trim() && !arabic2.trim()) {
      alert('Harap isi minimal teks Arab Pembicara 1 atau Pembicara 2.');
      return;
    }

    const newPair: DialogueTurnPair = {
      id: `pair-${Date.now()}-${Math.random()}`,
      turnNumber: dialoguePairs.length + 1,
      speaker1: speaker1.trim() || 'Pembicara 1',
      arabic1: arabic1.trim(),
      translation1: translation1.trim(),
      speaker2: speaker2.trim() || 'Pembicara 2',
      arabic2: arabic2.trim(),
      translation2: translation2.trim(),
    };

    setDialoguePairs([...dialoguePairs, newPair]);

    // Reset inputs
    setArabic1('');
    setTranslation1('');
    setArabic2('');
    setTranslation2('');
  };

  const handleRemovePair = (id: string) => {
    const updated = dialoguePairs.filter(p => p.id !== id);
    // Recalculate automatic turn numbering
    const renumbered = updated.map((pair, idx) => ({
      ...pair,
      turnNumber: idx + 1,
    }));
    setDialoguePairs(renumbered);
  };

  const handleImportSheetText = () => {
    if (!sheetText.trim()) return;

    const lines = sheetText.split('\n').filter(line => line.trim().length > 0);
    const parsedPairs: DialogueTurnPair[] = [];

    const tokenizeLine = (rawLine: string): string[] => {
      let sep = '\t';
      if (rawLine.includes('\t')) sep = '\t';
      else if (rawLine.includes(';')) sep = ';';
      else if (rawLine.includes('|')) sep = '|';
      else if (rawLine.includes(',')) sep = ',';

      return rawLine.split(sep).map(col => col.trim().replace(/^["']|["']$/g, '').trim());
    };

    // Temporary storage for single-turn accumulation (if user pastes 2 or 3 cols per row)
    const singleTurns: { speaker: string; arabic: string; translation: string }[] = [];

    lines.forEach((line) => {
      const cleaned = tokenizeLine(line);

      if (cleaned.length >= 6) {
        // Format 6 kolom (Pembicara1, Arab1, Terjemah1, Pembicara2, Arab2, Terjemah2)
        parsedPairs.push({
          id: `sheet-pair-${Date.now()}-${Math.random()}`,
          turnNumber: dialoguePairs.length + parsedPairs.length + 1,
          speaker1: cleaned[0] || 'سُؤَالٌ',
          arabic1: cleaned[1] || '',
          translation1: cleaned[2] || '',
          speaker2: cleaned[3] || 'جَوَابٌ',
          arabic2: cleaned[4] || '',
          translation2: cleaned[5] || '',
        });
      } else if (cleaned.length >= 4) {
        // Format 4 kolom (Arab1, Terjemah1, Arab2, Terjemah2)
        parsedPairs.push({
          id: `sheet-pair-${Date.now()}-${Math.random()}`,
          turnNumber: dialoguePairs.length + parsedPairs.length + 1,
          speaker1: 'سُؤَالٌ',
          arabic1: cleaned[0] || '',
          translation1: cleaned[1] || '',
          speaker2: 'جَوَابٌ',
          arabic2: cleaned[2] || '',
          translation2: cleaned[3] || '',
        });
      } else if (cleaned.length === 3) {
        // Format 3 kolom (Pembicara, Arab, Terjemah) per baris single turn
        singleTurns.push({
          speaker: cleaned[0] || 'مُتَكَلِّمٌ',
          arabic: cleaned[1] || '',
          translation: cleaned[2] || '',
        });
      } else if (cleaned.length === 2) {
        // Format 2 kolom (Arab, Terjemah) per baris single turn
        const isAnswer = singleTurns.length % 2 === 1;
        singleTurns.push({
          speaker: isAnswer ? 'جَوَابٌ' : 'سُؤَالٌ',
          arabic: cleaned[0] || '',
          translation: cleaned[1] || '',
        });
      }
    });

    // Pair up accumulated single turns (if any)
    for (let i = 0; i < singleTurns.length; i += 2) {
      const t1 = singleTurns[i];
      const t2 = singleTurns[i + 1];
      parsedPairs.push({
        id: `sheet-pair-${Date.now()}-${Math.random()}`,
        turnNumber: dialoguePairs.length + parsedPairs.length + 1,
        speaker1: t1.speaker || 'سُؤَالٌ',
        arabic1: t1.arabic,
        translation1: t1.translation,
        speaker2: t2 ? t2.speaker : 'جَوَابٌ',
        arabic2: t2 ? t2.arabic : '',
        translation2: t2 ? t2.translation : '',
      });
    }

    if (parsedPairs.length === 0) {
      alert('Tidak dapat mengurai data sheet. Pastikan format mengandung minimal 2 kolom per baris:\n- 6 kolom: Pembicara1, Arab1, Terjemah1, Pembicara2, Arab2, Terjemah2\n- 4 kolom: Arab1, Terjemah1, Arab2, Terjemah2\n- 3 kolom per baris: Pembicara, Arab, Terjemah\n- 2 kolom per baris: Arab, Terjemah');
      return;
    }

    setDialoguePairs([...dialoguePairs, ...parsedPairs]);
    setSheetText('');
    setIsSheetModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setFormError('Harap isi Judul Utama Materi Hiwar (Langkah 1) terlebih dahulu!');
      if (modalScrollRef.current) {
        modalScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    if (!babNumber || babNumber < 1) {
      setFormError('Harap isi Nomor Bab yang valid (Langkah 1) terlebih dahulu!');
      if (modalScrollRef.current) {
        modalScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    setFormError(null);

    // Flatten dialoguePairs to dialogues array for compatibility
    const flatDialogues = dialoguePairs.flatMap((pair) => [
      {
        id: `${pair.id}-1`,
        speaker: pair.speaker1,
        arabic: pair.arabic1,
        latin: '',
        translation: pair.translation1,
      },
      {
        id: `${pair.id}-2`,
        speaker: pair.speaker2,
        arabic: pair.arabic2,
        latin: '',
        translation: pair.translation2,
      },
    ]);

    onSave({
      category: 'hiwar',
      babNumber,
      hiwarLevelNumber,
      level: `Level ${hiwarLevelNumber}` as any,
      title: title.trim() || `Hiwar Bab ${babNumber}: Level ${hiwarLevelNumber}`,
      arabicTitle: arabicTitle.trim(),
      videoUrl: videoUrl.trim(),
      dialoguePairs,
      dialogues: flatDialogues,
      content: `Materi Hiwar Percakapan Bab ${babNumber} - Level ${hiwarLevelNumber}: ${title}`,
      description: `Modul Percakapan Bahasa Arab Bab ${babNumber} Level ${hiwarLevelNumber} berisi ${dialoguePairs.length} percakapan.`,
      authorName: storageService.getGuruProfile()?.name || 'Ahmad Yusron',
    });

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
            className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
          >
            {/* Header - Fixed Top */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
              <div>
                <span className="px-2.5 py-0.5 bg-sky-100 text-sky-800 text-[11px] font-extrabold rounded-full">
                  Formulir Modul Hiwar (Percakapan)
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-1">
                  {editingMateri ? `Edit Hiwar - ${editingMateri.title}` : 'Tambah Modul Hiwar Baru'}
                </h3>
              </div>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden text-xs">
              {/* Scrollable Form Body */}
              <div ref={modalScrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {formError && (
                  <div className="p-3 bg-rose-50 border-2 border-rose-400 text-rose-800 rounded-xl font-bold flex items-center justify-between shadow-xs">
                    <span className="flex items-center gap-2">⚠️ {formError}</span>
                    <button type="button" onClick={() => setFormError(null)} className="text-rose-600 hover:text-rose-900 font-bold text-sm">✕</button>
                  </div>
                )}
                
                {/* Langkah 1: Input Data Bab, Judul & Video */}
                <div className="p-4 bg-gradient-to-r from-sky-50 via-sky-50/80 to-blue-50 border-2 border-sky-400 rounded-2xl space-y-3 shadow-2xs">
                  <div className="font-extrabold text-slate-900 text-xs flex items-center justify-between border-b border-sky-200 pb-2">
                    <span className="flex items-center gap-2 text-sky-900">
                      <span className="w-6 h-6 rounded-full bg-sky-700 text-white text-xs font-black flex items-center justify-center shadow-xs">1</span>
                      <span className="text-sm">Langkah 1: Input Data Bab, Judul Utama & Link Video Panduan</span>
                    </span>
                    <span className="text-[11px] font-bold text-sky-700 bg-sky-100/80 px-2.5 py-0.5 rounded-md">Wajib Diisi</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        Nomor Bab <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={babNumber}
                        onChange={(e) => {
                          setBabNumber(Number(e.target.value));
                          if (formError) setFormError(null);
                        }}
                        className={`w-full px-3 py-2 border rounded-xl font-extrabold bg-white ${
                          !babNumber ? 'border-rose-500 bg-rose-50/30' : 'border-sky-300 focus:border-sky-500 text-sky-900'
                        }`}
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block font-bold text-slate-800 mb-1">
                        Judul Materi Hiwar (Indonesia) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Perkenalan Diri di Sekolah"
                        value={title}
                        onChange={(e) => {
                          setTitle(e.target.value);
                          if (formError) setFormError(null);
                        }}
                        className={`w-full px-3 py-2 border rounded-xl font-bold bg-white ${
                          formError && !title.trim()
                            ? 'border-rose-500 bg-rose-50/50 ring-2 ring-rose-200 text-rose-900'
                            : 'border-sky-300 focus:border-sky-500 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Judul Materi Bahasa Arab (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="التَّعَارُفُ فِي المَدْرَسَةِ"
                  value={arabicTitle}
                  onChange={(e) => setArabicTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-sky-200 rounded-xl focus:border-sky-500 font-arabic text-base text-right bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Video size={15} className="text-rose-600" /> Link Video Panduan / Pembelajaran (Opsional)
                </label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=... atau Drive"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-rose-200 rounded-xl focus:border-rose-500 text-xs bg-white font-medium"
                />
              </div>
            </div>
          </div>

          {/* Langkah 2: Input / Pilih Level */}
          <div className="p-3.5 bg-sky-50/60 border border-sky-200 rounded-2xl space-y-2">
            <div className="font-extrabold text-sky-900 text-xs flex items-center justify-between border-b border-sky-200/80 pb-1.5">
              <span className="flex items-center gap-1.5 text-sky-900">
                <span className="w-5 h-5 rounded-full bg-sky-700 text-white text-[11px] font-black flex items-center justify-center">2</span>
                <span>Langkah 2: Pilih Level Pada Materi Ini</span>
              </span>
              <span className="text-[11px] font-semibold text-sky-700">Percakapan Diinput Per Level</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Tentukan Level Hiwar:
              </label>
              <select
                value={hiwarLevelNumber}
                onChange={(e) => setHiwarLevelNumber(Number(e.target.value))}
                className="w-full px-3 py-2 border border-sky-300 rounded-xl focus:border-sky-500 font-extrabold text-sky-900 bg-white shadow-2xs"
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map((lvl) => (
                  <option key={lvl} value={lvl}>
                    Level {lvl} (Materi Bab {babNumber})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Langkah 3: Input Dialogue Pairs per Level */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b pb-2">
              <span className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-sky-700 text-white text-[11px] font-black flex items-center justify-center">3</span>
                <span>Langkah 3: Input Percakapan Hiwar di Level {hiwarLevelNumber}</span>
              </span>

              <button
                type="button"
                onClick={() => setIsSheetModalOpen(true)}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl font-bold flex items-center gap-1.5 text-xs shadow-2xs"
              >
                <FileSpreadsheet size={15} /> Input Sheet / Massal CSV
              </button>
            </div>

            {/* Input Form Pair */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-slate-700 font-bold text-xs border-b pb-1">
                <span>Tambah Dialog Percakapan Baru (Nomor Otomatis: #{dialoguePairs.length + 1})</span>
                <span className="text-[10px] text-slate-400 font-normal">Isi nama pembicara, teks Arab, dan terjemahan</span>
              </div>

              {/* Speaker 1 (Soal / Pertanyaan) */}
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-2 bg-white p-3 rounded-xl border border-slate-200">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Pembicara 1 (Orang / "سُؤَالٌ")
                  </label>
                  <input
                    type="text"
                    value={speaker1}
                    onChange={(e) => setSpeaker1(e.target.value)}
                    placeholder='Manual: "أَحْمَدُ" atau "سُؤَالٌ"'
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold font-arabic"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Teks Soal / Arab Pembicara 1
                  </label>
                  <input
                    type="text"
                    value={arabic1}
                    onChange={(e) => setArabic1(e.target.value)}
                    placeholder="السَّلاَمُ عَلَيْكُمْ"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-arabic font-bold text-right text-slate-900"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Terjemahan Pembicara 1
                  </label>
                  <input
                    type="text"
                    value={translation1}
                    onChange={(e) => setTranslation1(e.target.value)}
                    placeholder="Semoga keselamatan bagimu..."
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Speaker 2 (Jawaban / Respon) */}
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-2 bg-white p-3 rounded-xl border border-slate-200">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Pembicara 2 (Orang / "جَوَابٌ")
                  </label>
                  <input
                    type="text"
                    value={speaker2}
                    onChange={(e) => setSpeaker2(e.target.value)}
                    placeholder='Manual: "عَلِيٌّ" atau "جَوَابٌ"'
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold font-arabic"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Teks Jawaban / Arab Pembicara 2
                  </label>
                  <input
                    type="text"
                    value={arabic2}
                    onChange={(e) => setArabic2(e.target.value)}
                    placeholder="وَعَلَيْكُمُ السَّلاَمُ"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-arabic font-bold text-right text-slate-900"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Terjemahan Pembicara 2
                  </label>
                  <input
                    type="text"
                    value={translation2}
                    onChange={(e) => setTranslation2(e.target.value)}
                    placeholder="Dan semoga keselamatan bagimu juga..."
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddPair}
                className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl flex items-center justify-center gap-1 text-xs shadow-xs"
              >
                <Plus size={16} /> Tambah Dialog Ke-#{dialoguePairs.length + 1}
              </button>
            </div>

            {/* List of Dialogue Pairs with Automatic Numbering */}
            <div className="max-h-72 overflow-y-auto space-y-3 border border-slate-200 rounded-2xl p-3 bg-slate-50/50">
              {dialoguePairs.length === 0 ? (
                <p className="text-center py-6 text-slate-400 font-medium">
                  Belum ada dialog percakapan. Gunakan form di atas untuk menambahkan.
                </p>
              ) : (
                dialoguePairs.map((pair, idx) => (
                  <div key={pair.id || idx} className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs space-y-2">
                    {/* Header line with Automatic Numbering */}
                    <div className="flex items-center justify-between border-b pb-1.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-sky-700 text-white font-bold rounded-lg text-xs">
                          Percakapan #{pair.turnNumber || idx + 1} ({toArabicNumber(pair.turnNumber || idx + 1)})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePair(pair.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        title="Hapus Dialog"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Content Display */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {/* Turn 1 */}
                      <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-arabic font-extrabold text-sky-800 text-xs block">
                            {pair.speaker1}
                          </span>
                          {pair.arabic1 && <AudioPlayerButton arabicText={pair.arabic1} size="sm" />}
                        </div>
                        <p className="font-arabic font-bold text-base text-slate-900 text-right">
                          {pair.arabic1}
                        </p>
                        <p className="text-[11px] text-slate-600 italic">
                          "{pair.translation1}"
                        </p>
                      </div>

                      {/* Turn 2 */}
                      <div className="p-2.5 bg-emerald-50/60 border border-emerald-100 rounded-xl space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-arabic font-extrabold text-emerald-800 text-xs block">
                            {pair.speaker2}
                          </span>
                          {pair.arabic2 && <AudioPlayerButton arabicText={pair.arabic2} size="sm" />}
                        </div>
                        <p className="font-arabic font-bold text-base text-slate-900 text-right">
                          {pair.arabic2}
                        </p>
                        <p className="text-[11px] text-slate-600 italic">
                          "{pair.translation2}"
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

              </div>

              {/* Error notice before submit */}
              {formError && (
                <div className="px-5 py-2.5 bg-rose-50 border-t border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between shrink-0">
                  <span className="flex items-center gap-2">⚠️ {formError}</span>
                  <button type="button" onClick={() => setFormError(null)} className="text-rose-600 hover:text-rose-900 font-bold text-sm">✕</button>
                </div>
              )}

              {/* Submit Footer - Fixed Bottom */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Save size={16} /> Simpan Modul Hiwar
                </button>
              </div>
            </form>

        {/* Spreadsheet CSV Modal */}
        {isSheetModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full p-5 space-y-4 shadow-2xl border">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <FileSpreadsheet size={18} className="text-emerald-600" /> Import Dialog Hiwar Masal (Sheet/CSV)
                </h4>
                <button onClick={() => setIsSheetModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Paste percakapan dari Google Sheets/Excel dengan 6 kolom per baris:<br />
                <code className="bg-slate-100 px-2 py-0.5 rounded text-sky-800 font-mono text-[11px] block mt-1">
                  Pembicara1, Arab1, Terjemah1, Pembicara2, Arab2, Terjemah2
                </code>
              </p>

              <textarea
                rows={8}
                value={sheetText}
                onChange={(e) => setSheetText(e.target.value)}
                placeholder={`أَحْمَدُ, السَّلاَمُ عَلَيْكُمْ, Semoga keselamatan bagimu, عَلِيٌّ, وَعَلَيْكُمُ السَّلاَمُ, Dan bagimu juga keselamatan\nسُؤَالٌ, مَا اسْمُكَ؟, Siapa namamu?, جَوَابٌ, اسْمِي عَلِيٌّ, Namaku Ali`}
                className="w-full p-3 border border-slate-300 rounded-xl font-mono text-xs focus:border-sky-500"
              />

              <div className="flex justify-end gap-2 pt-2 border-t text-xs">
                <button
                  type="button"
                  onClick={() => setIsSheetModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleImportSheetText}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
                >
                  Import Dialog
                </button>
              </div>
            </div>
          </div>
        )}

      </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
