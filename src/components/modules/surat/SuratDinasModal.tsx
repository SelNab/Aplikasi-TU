import React from 'react';
import { SuratDocument, SchoolSettings } from '../../../types';
import { Printer, Download, X, FileText } from 'lucide-react';
import { KopSurat } from '../../KopSurat';
import { exportToWord, triggerPrint } from '../../../utils/exportHelpers';

interface SuratDinasModalProps {
  isOpen: boolean;
  onClose: () => void;
  surat: SuratDocument | null;
  settings: SchoolSettings;
  notifyMessage: (msg?: string) => void;
  onUploadLogoKiri?: (base64: string) => void;
  onUploadLogoKanan?: (base64: string) => void;
}

export const SuratDinasModal: React.FC<SuratDinasModalProps> = ({
  isOpen,
  onClose,
  surat,
  settings,
  notifyMessage,
  onUploadLogoKiri,
  onUploadLogoKanan
}) => {
  if (!isOpen || !surat) return null;

  const handleExportWord = () => {
    const content = `
      <div style="font-family: 'Times New Roman', Times, serif; text-align: center; border-bottom: 3px double #000; padding-bottom: 8px;">
        <h3 style="margin:0; font-size:12pt; text-transform:uppercase;">${settings.namaInstansi}</h3>
        <h2 style="margin:2px 0; font-size:14pt; text-transform:uppercase;">${settings.namaSekolah}</h2>
        <p style="margin:0; font-size:9pt;">${settings.alamatSekolah} | NPSN: ${settings.npsn}</p>
      </div>
      <div style="text-align: center; margin: 20px 0 10px 0;">
        <h3 style="margin:0; text-decoration: underline; font-size: 13pt;">SURAT DINAS</h3>
        <p style="margin: 2px 0; font-size: 11pt;">Nomor: ${surat.nomorSurat}</p>
      </div>
      <table style="width: 100%; font-size: 11pt; margin-bottom: 15px;">
        <tr><td width="15%">Lampiran</td><td width="2%">:</td><td>${surat.lampiran || '1 (Satu) Berkas'}</td></tr>
        <tr><td>Perihal</td><td>:</td><td><b>${surat.perihal}</b></td></tr>
      </table>
      <div style="font-size: 11pt; margin-bottom: 15px;">
        <p style="margin:0;">Kepada Yth.</p>
        <p style="margin:2px 0; font-weight:bold;">${surat.penerima}</p>
        <p style="margin:0;">di - Tempat</p>
      </div>
      <div style="font-size: 11pt; text-align: justify; line-height: 1.6;">
        <p>Dengan hormat,</p>
        <p style="text-indent: 30px;">
          ${surat.isiRingkas || 'Sehubungan dengan pelaksanaan agenda ketatausahaan dan administrasi pendidikan pada ' + settings.namaSekolah + ', bersama ini kami sampaikan hal-hal terkait sebagaimana perihal di atas.'}
        </p>
        ${surat.alasanPengirim ? `<p style="text-indent: 30px;">Dasar pelaksanaan: ${surat.alasanPengirim}</p>` : ''}
        <p style="text-indent: 30px;">
          Demikian surat ini kami sampaikan, atas perhatian dan kerja samanya kami ucapkan terima kasih.
        </p>
      </div>
      <div style="margin-top: 40px; text-align: right; font-size: 11pt;">
        <p>${settings.alamatSekolah.split(',')[0] || 'Balil'}, ${surat.tanggalSurat}</p>
        <p>Kepala ${settings.namaSekolah}</p>
        <br/><br/><br/>
        <p><b><u>${settings.namaKepsek}</u></b><br/>NIP. ${settings.nipKepsek}</p>
      </div>
    `;
    exportToWord(`Surat_Dinas_${surat.nomorSurat.replace(/[\/\\]/g, '_')}`, content);
    notifyMessage('Surat Dinas Diekspor ke Word');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4 print:my-0 print:border-none print:shadow-none print:max-w-none print:w-full">
        {/* Top bar (no-print) */}
        <div className="bg-slate-900 text-white p-3 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-sm">Format D: Format Surat Keluar Resmi Sekolah</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => triggerPrint()}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Sekarang</span>
            </button>
            <button
              type="button"
              onClick={handleExportWord}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Word</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Sheet Preview */}
        <div className="p-8 sm:p-12 bg-white text-slate-900 font-serif leading-relaxed text-xs sm:text-sm max-h-[82vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-4">
          <KopSurat
            settings={settings}
            onUploadLogoKiri={onUploadLogoKiri}
            onUploadLogoKanan={onUploadLogoKanan}
            showUploadButtons={true}
            className="mb-4"
          />

          {/* Judul Surat Dinas */}
          <div className="text-center my-4 font-sans">
            <h3 className="text-base sm:text-lg font-black tracking-wider uppercase underline decoration-2 underline-offset-4">
              SURAT DINAS
            </h3>
            <p className="font-mono text-xs mt-1">
              Nomor : <strong>{surat.nomorSurat}</strong>
            </p>
          </div>

          {/* Meta Surat */}
          <div className="flex justify-between items-start my-4 text-xs font-sans">
            <table className="w-auto">
              <tbody>
                <tr>
                  <td className="pr-4 font-semibold text-slate-600">Lampiran</td>
                  <td>: {surat.lampiran || '1 (satu) berkas'}</td>
                </tr>
                <tr>
                  <td className="pr-4 font-semibold text-slate-600">Perihal</td>
                  <td>: <strong>{surat.perihal}</strong></td>
                </tr>
              </tbody>
            </table>
            <div className="text-right">
              {settings.alamatSekolah.split(',')[0] || 'Balil'}, {surat.tanggalSurat}
            </div>
          </div>

          {/* Penerima */}
          <div className="my-5 text-xs font-sans">
            <p>Kepada Yth.</p>
            <p className="font-bold text-sm text-slate-900">{surat.penerima}</p>
            <p>di - Tempat</p>
          </div>

          {/* Isi Surat */}
          <div className="space-y-3 my-6 text-justify text-xs sm:text-sm leading-relaxed">
            <p>Dengan hormat,</p>
            <p className="indent-8">
              {surat.isiRingkas || 'Sehubungan dengan kelancaran kegiatan administrasi dan pembelajaran pada ' + settings.namaSekolah + ', bersama ini kami sampaikan hal-hal sebagaimana dimaksud pada pokok perihal surat ini agar dapat dipergunakan sebagaimana mestinya.'}
            </p>
            {surat.alasanPengirim && (
              <p className="indent-8">
                <strong>Dasar / Alasan Pelaksanaan:</strong> {surat.alasanPengirim}
              </p>
            )}
            <p className="indent-8">
              Demikian surat ini kami sampaikan, atas perhatian dan kerja samanya kami ucapkan terima kasih.
            </p>
          </div>

          {/* Tanda Tangan */}
          <div className="mt-12 flex justify-end font-sans text-xs">
            <div className="text-center w-64">
              <p>Kepala {settings.namaSekolah}</p>
              <div className="h-16 flex items-center justify-center text-slate-400 italic text-[11px]">
                ( tanda tangan & stempel )
              </div>
              <p className="font-bold underline text-sm">{settings.namaKepsek}</p>
              <p className="font-mono text-[11px]">NIP. {settings.nipKepsek}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
