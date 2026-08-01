import { Materi } from '../types';

export function exportMahfudzotToPdf(
  items: Materi[],
  title: string = 'Kumpulan Kata Mutiara (Mahfudzot) Bahasa Arab',
  filterCategory: string = 'Semua'
) {
  if (items.length === 0) {
    alert('Tidak ada materi Mahfudzot untuk diunduh.');
    return;
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Gagal membuka jendela cetak. Mohon izinkan popup di browser Anda.');
    return;
  }

  const dateStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const rowsHtml = items.map((item, index) => {
    const number = item.mahfudzot?.number || item.babNumber || (index + 1);
    const arabic = item.mahfudzot?.arabic || item.content;
    const translation = item.mahfudzot?.translation || item.description;
    const category = item.mahfudzot?.categoryTag || item.mahfudzotCategory || 'Kebijaksanaan';

    return `
      <tr class="item-row">
        <td class="num-col">${number}</td>
        <td class="arabic-col font-arabic" dir="rtl">${arabic}</td>
        <td class="trans-col">
          <div class="translation-text">"${translation}"</div>
          <div class="category-badge">${category}</div>
        </td>
      </tr>
    `;
  }).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>${title} - ${dateStr}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          color: #1e293b;
          background: #f8fafc;
          padding: 24px;
          line-height: 1.5;
        }

        .font-arabic {
          font-family: 'Amiri', 'Traditional Arabic', serif;
        }

        .no-print-bar {
          background: #581c87;
          color: white;
          padding: 12px 20px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          box-shadow: 0 4px 12px rgba(88, 28, 135, 0.15);
        }

        .no-print-bar h2 {
          font-size: 15px;
          font-weight: 700;
        }

        .btn-print {
          background: #f59e0b;
          color: #1e1b4b;
          border: none;
          padding: 8px 18px;
          border-radius: 8px;
          font-weight: 800;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-print:hover {
          background: #d97706;
          color: white;
        }

        .document-card {
          background: white;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          border: 1px solid #e2e8f0;
          max-width: 900px;
          margin: 0 auto;
        }

        .doc-header {
          border-bottom: 2px solid #6b21a8;
          padding-bottom: 16px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .doc-header-title {
          font-size: 20px;
          font-weight: 800;
          color: #4c1d95;
        }

        .doc-header-sub {
          font-size: 12px;
          color: #64748b;
          margin-top: 4px;
        }

        .doc-meta {
          text-align: right;
          font-size: 11px;
          color: #64748b;
        }

        .doc-meta strong {
          color: #334155;
        }

        .stats-summary {
          background: #faf5ff;
          border: 1px solid #e9d5ff;
          border-radius: 10px;
          padding: 10px 16px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          color: #581c87;
          font-weight: 600;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }

        th {
          background: #f3e8ff;
          color: #581c87;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 10px 12px;
          text-align: left;
          border-bottom: 2px solid #d8b4fe;
        }

        td {
          padding: 12px;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
        }

        .num-col {
          width: 50px;
          text-align: center;
          font-weight: 800;
          color: #6b21a8;
          font-size: 13px;
        }

        .arabic-col {
          font-size: 22px;
          font-weight: 700;
          color: #0f172a;
          text-align: right;
          padding-left: 16px;
          padding-right: 16px;
          width: 50%;
          line-height: 1.8;
        }

        .trans-col {
          width: 42%;
        }

        .translation-text {
          font-size: 13px;
          font-weight: 600;
          color: #334155;
          margin-bottom: 4px;
        }

        .category-badge {
          display: inline-block;
          font-size: 10px;
          font-weight: 700;
          background: #f1f5f9;
          color: #64748b;
          padding: 2px 8px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
        }

        .doc-footer {
          margin-top: 32px;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 10px;
          color: #94a3b8;
        }

        @media print {
          body {
            background: white;
            padding: 0;
          }

          .no-print-bar {
            display: none !important;
          }

          .document-card {
            border: none;
            box-shadow: none;
            padding: 0;
            max-width: 100%;
          }

          th {
            background: #f3e8ff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .category-badge {
            background: #f1f5f9 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .item-row {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="no-print-bar">
        <h2>📄 Modul Cetak PDF Mahfudzot</h2>
        <button class="btn-print" onclick="window.print()">
          🖨️ Cetak / Simpan PDF
        </button>
      </div>

      <div class="document-card">
        <div class="doc-header">
          <div>
            <div class="doc-header-title">کِتَابُ المَحْفُوظَاتِ - Dokumen Materi Mahfudzot</div>
            <div class="doc-header-sub">Kumpulan Kata Mutiara Hikmah Bahasa Arab - Kelas Digital Bahasa Arab</div>
          </div>
          <div class="doc-meta">
            <div>Tanggal Cetak: <strong>${dateStr}</strong></div>
            <div>Kategori: <strong>${filterCategory}</strong></div>
          </div>
        </div>

        <div class="stats-summary">
          <span>Total Materi Mahfudzot: ${items.length} Kutipan</span>
          <span>Siap Dicetak & Dipelajari Secara Offline</span>
        </div>

        <table>
          <thead>
            <tr>
              <th style="text-align: center;">No.</th>
              <th style="text-align: right;">Teks Arab</th>
              <th>Terjemahan & Kategori</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="doc-footer">
          <span>Dicetak dari Kelas Digital Bahasa Arab</span>
          <span>Halaman 1</span>
        </div>
      </div>

      <script>
        // Auto trigger print when ready
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 600);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
