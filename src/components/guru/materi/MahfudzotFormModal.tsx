import React, { useState } from 'react';
import { Materi } from '../../../types';
import { X, Save, Quote } from 'lucide-react';

interface MahfudzotFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingMateri: Materi | null;
  existingMateriList: Materi[];
  onSave: (materi: Partial<Materi>) => void;
}

export const MahfudzotFormModal: React.FC<MahfudzotFormModalProps> = ({
  isOpen,
  onClose,
  editingMateri,
  existingMateriList,
  onSave,
}) => {
  if (!isOpen) return null;

  const countMahfudzot = existingMateriList.filter(m => m.category === 'mahfudzot').length;
  const autoNumber = editingMateri?.babNumber || countMahfudzot + 1;

  const [mahfudzotNumber, setMahfudzotNumber] = useState<number>(autoNumber);
  const [arabic, setArabic] = useState(editingMateri?.mahfudzot?.arabic || editingMateri?.content || '');
  const [translation, setTranslation] = useState(editingMateri?.mahfudzot?.translation || editingMateri?.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!arabic.trim() || !translation.trim()) {
      alert('Harap isi Teks Arab dan Terjemahan Mahfudzot.');
      return;
    }

    onSave({
      category: 'mahfudzot',
      babNumber: mahfudzotNumber,
      title: `Mahfudzot ${mahfudzotNumber}`,
      arabicTitle: arabic.slice(0, 20),
      description: translation,
      content: arabic,
      mahfudzot: {
        number: mahfudzotNumber,
        arabic: arabic.trim(),
        latin: '',
        translation: translation.trim(),
      },
      authorName: 'Ust. Ahmad Dahlan, M.Pd.',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-50 text-purple-700 rounded-xl border border-purple-200">
              <Quote size={20} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                Kata Mutiara
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                {editingMateri ? `Edit Mahfudzot ${mahfudzotNumber}` : `Tambah Mahfudzot ${mahfudzotNumber}`}
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
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
            <p className="text-[10px] text-slate-400 mt-1">Nomor otomatis tergenerasi berdasar urutan kata mutiara.</p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Teks Arab Mahfudzot
            </label>
            <textarea
              rows={3}
              required
              placeholder="مَنْ جَدَّ وَجَدَ"
              value={arabic}
              onChange={(e) => setArabic(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-arabic text-2xl text-right focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Terjemahan Bahasa Indonesia
            </label>
            <textarea
              rows={3}
              required
              placeholder="Barangsiapa bersungguh-sungguh ia akan berhasil."
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:border-purple-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold flex items-center gap-2 shadow-md"
            >
              <Save size={16} /> Simpan Mahfudzot
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
