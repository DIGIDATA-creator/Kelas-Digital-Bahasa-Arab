import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, FileText, Printer, Eye } from 'lucide-react';

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  pdfUrl?: string;
  pdfFileName?: string;
  pdfPageCount?: number;
  textContent?: string;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  isOpen,
  onClose,
  title,
  pdfUrl,
  pdfFileName = 'Dokumen_Materi.pdf',
  pdfPageCount = 5,
  textContent,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = pdfFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('Dokumen PDF disimulasikan dan siap diunduh.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <FileText size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold truncate max-w-md">{title}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>{pdfFileName}</span> • <span>{pdfPageCount} Halaman</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Unduh PDF"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Unduh</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* PDF Toolbar */}
        <div className="flex flex-wrap items-center justify-between px-6 py-2.5 bg-slate-100 border-b border-slate-200 text-slate-700 text-sm gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-transparent"
              title="Halaman Sebelumnya"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="font-medium text-xs sm:text-sm">
              Halaman <span className="font-bold text-emerald-700">{currentPage}</span> dari {pdfPageCount}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(pdfPageCount, p + 1))}
              disabled={currentPage === pdfPageCount}
              className="p-1.5 rounded-md hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-transparent"
              title="Halaman Selanjutnya"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(z => Math.max(50, z - 25))}
              className="p-1.5 rounded-md hover:bg-slate-200"
              title="Zoom Out"
            >
              <ZoomOut size={18} />
            </button>
            <span className="text-xs font-medium w-12 text-center">{zoom}%</span>
            <button
              onClick={() => setZoom(z => Math.min(200, z + 25))}
              className="p-1.5 rounded-md hover:bg-slate-200"
              title="Zoom In"
            >
              <ZoomIn size={18} />
            </button>
          </div>
        </div>

        {/* PDF Document Canvas View */}
        <div className="flex-1 bg-slate-200 p-4 sm:p-8 overflow-auto flex justify-center items-start min-h-[450px]">
          <div
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
            className="transition-transform duration-200 w-full max-w-2xl bg-white shadow-xl rounded-lg border border-slate-300 p-8 sm:p-12 min-h-[650px] relative text-slate-800 flex flex-col justify-between"
          >
            {/* Document Header watermark */}
            <div>
              <div className="flex justify-between items-center border-b pb-4 mb-6 text-slate-400 text-xs uppercase tracking-widest font-semibold">
                <span>Modul Pembelajaran Digital Bahasa Arab</span>
                <span>Halaman {currentPage} / {pdfPageCount}</span>
              </div>

              {/* Render Embedded Object / Data PDF if URL exists or fallback document renderer */}
              {pdfUrl && pdfUrl.startsWith('data:application/pdf') ? (
                <div className="mb-6 border border-slate-200 rounded-lg overflow-hidden h-[400px]">
                  <object data={pdfUrl} type="application/pdf" className="w-full h-full">
                    <p className="p-4 text-center text-slate-500">
                      Tampilan PDF langsung. <a href={pdfUrl} target="_blank" rel="noreferrer" className="text-emerald-600 underline">Klik di sini untuk mengunduh</a>.
                    </p>
                  </object>
                </div>
              ) : null}

              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900 border-b pb-2">{title}</h2>
                <div className="prose prose-emerald max-w-none text-slate-700 leading-relaxed space-y-4 text-sm sm:text-base">
                  {textContent ? (
                    <div className="whitespace-pre-line">{textContent}</div>
                  ) : (
                    <>
                      <p>
                        Dokumen digital ini merupakan bahan ajar materi resmi pada kelas Bahasa Arab. Materi dirancang agar siswa dapat mempelajari tata bahasa (Qowaid), dialog (Hiwar), kosakata (Mufradat), serta kata mutiara (Mahfudzot) secara terstruktur.
                      </p>
                      <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg my-4 font-arabic text-xl text-right text-emerald-900 leading-loose">
                        بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ <br />
                        تَعَلَّمُوا العَرَبِيَّةَ فَإِنَّهَا مِنْ دِينِكُمْ
                      </div>
                      <p className="text-slate-600 italic text-xs">
                        "Pelajarilah Bahasa Arab, karena sesungguhnya Bahasa Arab adalah bagian dari agamamu."
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Document Footer */}
            <div className="pt-8 border-t text-center text-xs text-slate-400 flex justify-between items-center mt-12">
              <span>Kelas Digital Bahasa Arab © 2026</span>
              <span>Kementerian Agama & Sekolah Digital</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>Gunakan tombol panah untuk berpindah halaman</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 font-medium transition-colors"
          >
            Tutup Pratinjau
          </button>
        </div>

      </div>
    </div>
  );
};
