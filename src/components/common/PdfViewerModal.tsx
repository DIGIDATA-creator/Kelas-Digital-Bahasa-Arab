import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, FileText, Printer, Eye, ExternalLink, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker to unpkg/cdnjs CDN matching installed version
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.10.38'}/build/pdf.worker.min.mjs`;
} catch (e) {
  console.warn('pdfjs workerSrc assignment warning:', e);
}

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  pdfUrl?: string;
  pdfFileName?: string;
  pdfPageCount?: number;
  textContent?: string;
}

// Utility to convert data URL to Blob
function dataUrlToBlob(dataUrl: string): Blob | null {
  try {
    const arr = dataUrl.split(',');
    if (arr.length < 2) return null;
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch (e) {
    console.error('Failed to convert dataUrl to Blob:', e);
    return null;
  }
}

// Sub-component: Canvas Renderer for PDF
const PdfCanvasViewer: React.FC<{
  pdfUrl: string;
  currentPage: number;
  zoom: number;
  onPageCountChange?: (count: number) => void;
  onOpenNewTab: () => void;
  onSwitchToTextMode: () => void;
}> = ({ pdfUrl, currentPage, zoom, onPageCountChange, onOpenNewTab, onSwitchToTextMode }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);

    async function loadPdf() {
      try {
        let pdfData: Uint8Array | string = pdfUrl;

        if (pdfUrl.startsWith('data:application/pdf')) {
          const base64Index = pdfUrl.indexOf('base64,');
          if (base64Index !== -1) {
            const base64 = pdfUrl.substring(base64Index + 7);
            const binaryString = atob(base64);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            pdfData = bytes;
          }
        }

        const loadingTask = pdfjsLib.getDocument(
          typeof pdfData === 'string' ? { url: pdfData } : { data: pdfData }
        );

        const doc = await loadingTask.promise;
        if (isCancelled) return;

        setPdfDoc(doc);
        if (onPageCountChange && doc.numPages) {
          onPageCountChange(doc.numPages);
        }
        setLoading(false);
      } catch (err: any) {
        console.error('Error loading PDF with PDF.js:', err);
        if (!isCancelled) {
          setError(err.message || 'Gagal memuat render canvas PDF.');
          setLoading(false);
        }
      }
    }

    loadPdf();

    return () => {
      isCancelled = true;
    };
  }, [pdfUrl]);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let isCancelled = false;

    async function renderPage() {
      try {
        const pageNum = Math.min(Math.max(1, currentPage), pdfDoc.numPages);
        const page = await pdfDoc.getPage(pageNum);
        if (isCancelled) return;

        const scale = (zoom / 100) * 1.5;
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
      } catch (err) {
        console.error('Error rendering page canvas:', err);
      }
    }

    renderPage();

    return () => {
      isCancelled = true;
    };
  }, [pdfDoc, currentPage, zoom]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3 bg-white rounded-xl shadow-md border border-slate-300 min-h-[400px] w-full my-auto">
        <Loader2 className="animate-spin text-emerald-600" size={36} />
        <p className="text-xs font-bold text-slate-600">Memuat dan merender halaman PDF ke Canvas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4 bg-white rounded-xl shadow-md border border-slate-300 min-h-[400px] text-center max-w-lg mx-auto my-auto">
        <FileText size={48} className="text-amber-500" />
        <h4 className="font-bold text-slate-800 text-base">Pratinjau PDF Tidak Dapat Di-render</h4>
        <p className="text-xs text-slate-500">
          File PDF tidak didukung untuk pratinjau langsung. Anda dapat membuka file di tab baru atau membaca versi teks digital.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={onOpenNewTab}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink size={15} /> Buka PDF di Tab Baru
          </button>
          <button
            onClick={onSwitchToTextMode}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold border border-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <FileText size={15} /> Tampilkan Teks Dokumen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center items-center py-4 overflow-auto my-auto">
      <div className="shadow-2xl rounded-lg overflow-hidden border border-slate-300 bg-white">
        <canvas ref={canvasRef} className="max-w-full h-auto block" />
      </div>
    </div>
  );
};

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  isOpen,
  onClose,
  title,
  pdfUrl,
  pdfFileName = 'Dokumen_Materi.pdf',
  pdfPageCount: initialPageCount = 5,
  textContent,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [totalPages, setTotalPages] = useState(initialPageCount);
  const [viewMode, setViewMode] = useState<'embed' | 'document'>(pdfUrl ? 'embed' : 'document');

  // Convert dataUrl to safe Blob URL for browser open/download
  const objectBlobUrl = useMemo(() => {
    if (!pdfUrl) return null;
    if (pdfUrl.startsWith('data:application/pdf')) {
      const blob = dataUrlToBlob(pdfUrl);
      if (blob) {
        return URL.createObjectURL(blob);
      }
    }
    return pdfUrl;
  }, [pdfUrl]);

  // Clean up Blob URL when unmounted
  useEffect(() => {
    return () => {
      if (objectBlobUrl && objectBlobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(objectBlobUrl);
      }
    };
  }, [objectBlobUrl]);

  // (Rendered using AnimatePresence below)
  const handleOpenNewTab = () => {
    const targetUrl = objectBlobUrl || pdfUrl;
    if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } else {
      alert('File PDF tidak tersedia untuk dibuka di tab baru.');
    }
  };

  const handlePrint = () => {
    const targetUrl = objectBlobUrl || pdfUrl;
    if (targetUrl) {
      const printWindow = window.open(targetUrl, '_blank');
      if (printWindow) {
        printWindow.focus();
        setTimeout(() => printWindow.print(), 500);
      }
    } else {
      window.print();
    }
  };

  const handleDownload = () => {
    const targetUrl = objectBlobUrl || pdfUrl;
    if (targetUrl) {
      const link = document.createElement('a');
      link.href = targetUrl;
      link.download = pdfFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('Dokumen PDF disimulasikan dan siap diunduh.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-2 sm:p-6 overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl flex flex-col h-[92vh] overflow-hidden border border-slate-200"
          >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <FileText size={22} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold truncate max-w-md">{title}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>{pdfFileName}</span> • <span>{totalPages} Halaman</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {pdfUrl && (
              <div className="flex bg-slate-800 p-1 rounded-xl text-xs font-bold mr-2">
                <button
                  onClick={() => setViewMode('embed')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    viewMode === 'embed' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Pratinjau PDF
                </button>
                <button
                  onClick={() => setViewMode('document')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    viewMode === 'document' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Teks Dokumen
                </button>
              </div>
            )}

            <button
              onClick={handleOpenNewTab}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Buka PDF di Tab Baru"
            >
              <ExternalLink size={18} />
              <span className="hidden sm:inline">Tab Baru</span>
            </button>

            <button
              onClick={handlePrint}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Cetak Dokumen"
            >
              <Printer size={18} />
              <span className="hidden sm:inline">Cetak</span>
            </button>

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
        <div className="flex flex-wrap items-center justify-between px-6 py-2 bg-slate-100 border-b border-slate-200 text-slate-700 text-sm gap-3">
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
              Halaman <span className="font-bold text-emerald-700">{currentPage}</span> dari {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
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

        {/* PDF Content Area */}
        <div className="flex-1 bg-slate-200 p-2 sm:p-6 overflow-auto flex flex-col justify-start items-center">
          {viewMode === 'embed' && pdfUrl ? (
            <PdfCanvasViewer
              pdfUrl={pdfUrl}
              currentPage={currentPage}
              zoom={zoom}
              onPageCountChange={(cnt) => setTotalPages(cnt)}
              onOpenNewTab={handleOpenNewTab}
              onSwitchToTextMode={() => setViewMode('document')}
            />
          ) : (
            <div
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
              className="transition-transform duration-200 w-full max-w-3xl bg-white shadow-xl rounded-xl border border-slate-300 p-6 sm:p-12 min-h-[600px] relative text-slate-800 flex flex-col justify-between my-auto"
            >
              <div>
                <div className="flex justify-between items-center border-b pb-3 mb-6 text-slate-400 text-xs uppercase tracking-widest font-semibold">
                  <span>Modul Pembelajaran Bahasa Arab</span>
                  <span>Halaman {currentPage} / {totalPages}</span>
                </div>

                <div className="space-y-4">
                  <h2 className="text-2xl font-extrabold text-slate-900 border-b pb-2">{title}</h2>
                  <div className="prose prose-emerald max-w-none text-slate-700 leading-relaxed space-y-4 text-sm sm:text-base">
                    {textContent ? (
                      <div className="whitespace-pre-line font-medium text-slate-800">{textContent}</div>
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

              <div className="pt-8 border-t text-center text-xs text-slate-400 flex justify-between items-center mt-12">
                <span>LMS Bahasa Arab Digital © 2026</span>
                <span>Modul Pembelajaran Resmi</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>Pratinjau PDF Canvas Interaktif</span>
          <div className="flex items-center gap-2">
            {pdfUrl && (
              <button
                onClick={handleOpenNewTab}
                className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg font-bold flex items-center gap-1 transition-colors"
              >
                <ExternalLink size={14} /> Buka Tab Baru
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 font-medium transition-colors"
            >
              Tutup Pratinjau
            </button>
          </div>
        </div>

      </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


