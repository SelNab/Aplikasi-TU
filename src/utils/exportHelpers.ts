// Utility functions for exporting data to Excel, Word, PPT, PDF/Print, and USB Flashdisk Backup

export function exportToExcel(title: string, headers: string[], rows: (string | number)[][]) {
  let tableHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>${title.slice(0, 30)}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
      <style>
        th { background-color: #047857; color: #ffffff; font-weight: bold; border: 1px solid #000; padding: 6px; }
        td { border: 1px solid #ccc; padding: 5px; }
        .title { font-size: 16pt; font-weight: bold; text-align: center; color: #064e3b; }
      </style>
    </head>
    <body>
      <table>
        <tr><td colspan="${headers.length}" class="title">${title.toUpperCase()}</td></tr>
        <tr><td colspan="${headers.length}">Dicetak pada: ${new Date().toLocaleString('id-ID')} | Operator TU: Selpius Nabyal, S.Pd.Gr.</td></tr>
        <tr></tr>
        <thead>
          <tr>
            ${headers.map(h => `<th>${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map(row => `<tr>${row.map(cell => `<td>${cell !== undefined && cell !== null ? String(cell) : ''}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeTitle = (title || 'dokumen').toLowerCase().replace(/\s+/g, '_');
  a.download = `${safeTitle}_${Date.now()}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToWord(title: string, contentHtml: string) {
  const wordHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${title}</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.4; color: #000; }
        h1, h2, h3 { text-align: center; font-family: Arial, sans-serif; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 15px; }
        th, td { border: 1px solid black; padding: 6px 8px; font-size: 10pt; }
        th { background-color: #f2f2f2; }
        .kop { text-align: center; border-bottom: 3px double #000; padding-bottom: 10px; margin-bottom: 20px; }
        .footer { margin-top: 30px; }
      </style>
    </head>
    <body>
      ${contentHtml}
    </body>
    </html>
  `;

  const blob = new Blob([wordHtml], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeTitle = (title || 'dokumen').toLowerCase().replace(/\s+/g, '_');
  a.download = `${safeTitle}_${Date.now()}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToPPT(title: string, slides: { title: string; bullets: string[]; subtitle?: string }[]) {
  const slidesHtml = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="utf-8">
      <title>${title} - Presentasi Slides</title>
      <style>
        body { margin: 0; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #1e293b; color: #f8fafc; }
        .slide { background: #0f172a; border: 2px solid #334155; border-radius: 12px; padding: 40px; margin-bottom: 30px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); min-height: 400px; display: flex; flex-direction: column; justify-content: space-between; page-break-after: always; }
        .slide-header { border-bottom: 2px solid #059669; padding-bottom: 15px; }
        .slide-title { font-size: 28px; font-weight: bold; color: #34d399; margin: 0; }
        .slide-subtitle { font-size: 16px; color: #94a3b8; margin-top: 5px; }
        .slide-body { font-size: 20px; line-height: 1.8; margin-top: 25px; flex-grow: 1; }
        .slide-body ul { padding-left: 30px; }
        .slide-body li { margin-bottom: 12px; }
        .slide-footer { display: flex; justify-content: space-between; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; padding-top: 15px; }
        @media print {
          body { background: white; color: black; padding: 0; }
          .slide { background: white; color: black; border: 1px solid #ccc; box-shadow: none; min-height: 90vh; }
          .slide-title { color: #064e3b; }
        }
      </style>
    </head>
    <body>
      <div style="text-align: center; margin-bottom: 20px;" class="no-print">
        <button onclick="window.print()" style="padding: 10px 20px; background: #059669; color: white; border: none; border-radius: 6px; font-size: 16px; cursor: pointer; font-weight: bold;">Cetak / Simpan ke PDF PPT</button>
      </div>
      ${slides.map((s, idx) => `
        <div class="slide">
          <div class="slide-header">
            <h1 class="slide-title">${s.title}</h1>
            ${s.subtitle ? `<div class="slide-subtitle">${s.subtitle}</div>` : ''}
          </div>
          <div class="slide-body">
            <ul>
              ${s.bullets.map(b => `<li>${b}</li>`).join('')}
            </ul>
          </div>
          <div class="slide-footer">
            <span>Aplikasi Administrasi TU Sekolah Papua Pedalaman</span>
            <span>Slide ${idx + 1} dari ${slides.length}</span>
            <span>Pengembang: Selpius Nabyal, S.Pd.Gr.</span>
          </div>
        </div>
      `).join('')}
    </body>
    </html>
  `;

  const blob = new Blob([slidesHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeTitle = (title || 'presentasi').toLowerCase().replace(/\s+/g, '_');
  a.download = `${safeTitle}_slides.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function triggerPrint() {
  window.print();
}

// Backup all application data into a single downloadable JSON for flashdisk transfer
export function backupToFlashdisk(allData: Record<string, unknown>, schoolName: string) {
  exportDatabaseToUSB(allData, schoolName);
}

export function exportDatabaseToUSB(allData: Record<string, unknown>, schoolName: string) {
  const exportPayload = {
    app: 'Aplikasi Administrasi Tata Usaha Sekolah',
    version: '1.0.0',
    developer: 'Selpius Nabyal, S.Pd.Gr. Guru SD',
    targetRegion: 'Papua Pedalaman',
    exportedAt: new Date().toISOString(),
    school: schoolName,
    data: allData
  };

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `BACKUP_TU_PAPUA_${schoolName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importDatabaseFromUSB(
  file: File,
  onSuccess?: (data: any) => void,
  onError?: (error: string) => void
) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result as string);
      if (parsed && parsed.data) {
        onSuccess?.(parsed.data);
      } else if (parsed) {
        onSuccess?.(parsed);
      } else {
        onError?.('Format file backup tidak valid');
      }
    } catch (e: any) {
      onError?.('Gagal membaca berkas JSON: ' + e.message);
    }
  };
  reader.onerror = () => {
    onError?.('Gagal membuka berkas backup');
  };
  reader.readAsText(file);
}

export function safeConfirm(message: string): boolean {
  try {
    if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
      return window.confirm(message);
    }
    return true;
  } catch (err) {
    console.warn('Konfirmasi dialog dilewati karena batasan iframe sandbox:', err);
    return true;
  }
}

export function safeAlert(message: string) {
  try {
    if (typeof window !== 'undefined' && typeof window.alert === 'function') {
      window.alert(message);
    }
  } catch (err) {
    console.warn('Pemberitahuan dialog dilewati karena batasan iframe sandbox:', message, err);
  }
}

export function safePrompt(message: string, defaultValue: string = ''): string | null {
  try {
    if (typeof window !== 'undefined' && typeof window.prompt === 'function') {
      return window.prompt(message, defaultValue);
    }
    return defaultValue;
  } catch (err) {
    console.warn('Prompt dialog dilewati karena batasan iframe sandbox:', err);
    return defaultValue;
  }
}

