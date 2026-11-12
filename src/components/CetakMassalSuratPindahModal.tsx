import React, { useState } from 'react';
import { SchoolSettings, PaperSize, Student } from '../types';
import { Printer, X, Download, FileText, ChevronLeft, ChevronRight, School, Check, Edit3, Settings2 } from 'lucide-react';
import { triggerPrint, exportToWord } from '../utils/exportHelpers';
import { KopSurat } from './KopSurat';

export interface SuratPindahItem {
  id: string;
  nomorSurat: string;
  tanggalSurat: string;
  namaSiswa: string;
  nis: string;
  nisn: string;
  nik?: string;
  tempatLahir?: string;
  tanggalLahir?: string;
  jenisKelamin?: string;
  agama?: string;
  kelas: string;
  rombel?: string;
  namaAyah?: string;
  pekerjaanAyah?: string;
  namaIbu?: string;
  alamat?: string;
  sekolahTujuan: string;
  alasanPindah: string;
  keteranganLampiran?: string;
}

interface CetakMassalSuratPindahModalProps {
  items: SuratPindahItem[];
  settings: SchoolSettings;
  paperSize?: PaperSize;
  isOpen?: boolean;
  onClose: () => void;
  onUpdateItem?: (updated: SuratPindahItem) => void;
  onUploadLogoKiri?: (base64: string) => void;
  onUploadLogoKanan?: (base64: string) => void;
  notifyMessage?: (msg?: string) => void;
}

export const CetakMassalSuratPindahModal: React.FC<CetakMassalSuratPindahModalProps> = ({
  items,
  settings,
  paperSize = settings.ukuranKertas,
  onClose,
  onUpdateItem,
  onUploadLogoKiri,
  onUploadLogoKanan,
  notifyMessage
}) => {
  const [dataList, setDataList] = useState<SuratPindahItem[]>(items);
  const [viewMode, setViewMode] = useState<'all' | 'single'>('all');
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [batchSekolahTujuan, setBatchSekolahTujuan] = useState('');
  const [batchAlasan, setBatchAlasan] = useState('');
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Apply batch edits to all items
  const handleApplyBatch = () => {
    if (!batchSekolahTujuan.trim() && !batchAlasan.trim()) return;
    setDataList(prev =>
      prev.map(item => ({
        ...item,
        sekolahTujuan: batchSekolahTujuan.trim() || item.sekolahTujuan,
        alasanPindah: batchAlasan.trim() || item.alasanPindah
      }))
    );
    setShowBatchForm(false);
  };

  const handleUpdateSingleField = (id: string, field: keyof SuratPindahItem, val: string) => {
    setDataList(prev =>
      prev.map(it => (it.id === id ? { ...it, [field]: val } : it))
    );
  };

  const handleExportAllWord = () => {
    let fullHtml = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>Kumpulan Surat Keterangan Pindah Siswa</title>
          <style>
            body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; color: #000; }
            .page-break { page-break-after: always; }
            .kop { text-align: center; border-bottom: 3px double #000; padding-bottom: 8px; margin-bottom: 16px; }
            .kop h2 { margin: 0; font-size: 11pt; font-weight: bold; text-transform: uppercase; }
            .kop h1 { margin: 4px 0; font-size: 15pt; font-weight: bold; text-transform: uppercase; }
            .kop p { margin: 0; font-size: 10pt; }
            .title { text-align: center; margin: 18px 0; }
            .title h3 { margin: 0; font-size: 13pt; font-weight: bold; text-decoration: underline; }
            .title p { margin: 2px 0 0; font-size: 11pt; }
            table { width: 100%; border-collapse: collapse; margin: 8px 0; }
            td { vertical-align: top; padding: 2px 4px; font-size: 11pt; }
            .ttd-table { width: 100%; margin-top: 35px; border: none; }
            .ttd-table td { border: none; padding: 0; text-align: center; }
          </style>
        </head>
        <body>
    `;

    dataList.forEach((it, idx) => {
      fullHtml += `
        <div class="${idx < dataList.length - 1 ? 'page-break' : ''}">
          <table style="width: 100%; border: none; border-bottom: 3px double #000; padding-bottom: 8px; margin-bottom: 16px;">
            <tr style="border: none;">
              <td style="border: none; width: 75px; text-align: left; vertical-align: middle;">
                ${settings.logoKiri ? `<img src="${settings.logoKiri}" width="65" height="65" style="object-fit:contain;" />` : ''}
              </td>
              <td style="border: none; text-align: center; vertical-align: middle;">
                <h2 style="margin: 0; font-size: 11pt; font-weight: bold; text-transform: uppercase;">${settings.namaInstansi}</h2>
                <h1 style="margin: 4px 0; font-size: 15pt; font-weight: bold; text-transform: uppercase;">${settings.namaSekolah}</h1>
                <p style="margin: 0; font-size: 10pt;">${settings.alamatSekolah} | NPSN: ${settings.npsn}</p>
              </td>
              <td style="border: none; width: 75px; text-align: right; vertical-align: middle;">
                ${settings.logoKanan ? `<img src="${settings.logoKanan}" width="65" height="65" style="object-fit:contain;" />` : ''}
              </td>
            </tr>
          </table>

          <div class="title">
            <h3>SURAT KETERANGAN PINDAH SEKOLAH</h3>
            <p>Nomor: ${it.nomorSurat}</p>
          </div>

          <p style="text-align: justify; margin-bottom: 12px;">
            Yang bertanda tangan di bawah ini Kepala ${settings.namaSekolah}, menerangkan dengan sesungguhnya bahwa:
          </p>

          <table>
            <tr><td width="25">1.</td><td width="190">Nama Peserta Didik</td><td width="10">:</td><td><b>${it.namaSiswa}</b></td></tr>
            <tr><td>2.</td><td>Nomor Induk Siswa (NIS)</td><td>:</td><td>${it.nis || '-'}</td></tr>
            <tr><td>3.</td><td>Nomor Induk Siswa Nasional (NISN)</td><td>:</td><td>${it.nisn || '-'}</td></tr>
            <tr><td>4.</td><td>Tempat, Tanggal Lahir</td><td>:</td><td>${it.tempatLahir || '-'}, ${it.tanggalLahir || '-'}</td></tr>
            <tr><td>5.</td><td>Jenis Kelamin</td><td>:</td><td>${it.jenisKelamin === 'L' ? 'Laki-laki' : it.jenisKelamin === 'P' ? 'Perempuan' : (it.jenisKelamin || '-')}</td></tr>
            <tr><td>6.</td><td>Tingkat / Kelas Asal</td><td>:</td><td>Kelas ${it.kelas} (${it.rombel || 'A'})</td></tr>
            <tr><td>7.</td><td>Nama Orang Tua / Wali</td><td>:</td><td>${it.namaAyah || it.namaIbu || '-'}</td></tr>
            <tr><td>8.</td><td>Alamat Siswa Asal</td><td>:</td><td>${it.alamat || 'Baalil, Distrik Oksibil, Kabupaten Pegunungan Bintang'}</td></tr>
          </table>

          <p style="margin-top: 14px; margin-bottom: 8px;">
            Sesuai permohonan kepindahan oleh orang tua/wali siswa, peserta didik tersebut di atas mengajukan mutasi pindah ke:
          </p>

          <table>
            <tr><td width="25">a.</td><td width="190">Nama Sekolah Tujuan</td><td width="10">:</td><td><b>${it.sekolahTujuan}</b></td></tr>
            <tr><td>b.</td><td>Tingkat / Masuk di Kelas</td><td>:</td><td>Kelas ${it.kelas}</td></tr>
            <tr><td>c.</td><td>Alasan Kepindahan</td><td>:</td><td>${it.alasanPindah}</td></tr>
            <tr><td>d.</td><td>Catatan Berkas</td><td>:</td><td>Buku Raport Asli dan Surat Mutasi Dapodik telah dilampirkan lengkap.</td></tr>
          </table>

          <p style="text-align: justify; margin-top: 14px; text-indent: 30px;">
            Demikian surat keterangan pindah sekolah ini kami buat dengan sebenarnya dan menurut keadaan yang sesungguhnya untuk dapat dipergunakan sebagaimana mestinya di sekolah tujuan.
          </p>

          <table class="ttd-table">
            <tr>
              <td width="45%">
                Mengetahui:<br/>
                Orang Tua / Wali Siswa,<br/><br/><br/><br/>
                <b><u>( ${it.namaAyah || it.namaIbu || '.................................'} )</u></b>
              </td>
              <td width="10%"></td>
              <td width="45%">
                Dekai, ${it.tanggalSurat}<br/>
                Kepala Sekolah,<br/><br/><br/><br/>
                <b><u>${settings.namaKepsek}</u></b><br/>
                NIP. ${settings.nipKepsek}
              </td>
            </tr>
          </table>
        </div>
      `;
    });

    fullHtml += `</body></html>`;
    exportToWord(`Surat_Keterangan_Pindah_Massal_${dataList.length}_Siswa`, fullHtml);
  };

  const currentItem = dataList[activePageIndex] || dataList[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto print:fixed print:inset-0 print:z-[9999] print:bg-white print:p-0 print:overflow-visible print:block">
      <div className="bg-slate-100 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden border border-slate-300 flex flex-col max-h-[94vh] my-auto print:my-0 print:border-none print:shadow-none print:max-w-none print:w-full print:bg-white">
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-emerald-800 no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide flex items-center gap-2">
                Cetak Format Surat Keterangan Pindah Siswa Secara Massal
                <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full">
                  {dataList.length} Siswa Terpilih
                </span>
              </h2>
              <p className="text-[11px] text-emerald-200">
                Format Standar Resmi Kedinasan SD - Siap Dicetak Lembar Per Lembar (Kertas {paperSize})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => triggerPrint()}
              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-black flex items-center gap-1.5 shadow transition-colors cursor-pointer"
              title="Cetak Seluruh Lembar Surat Siswa"
            >
              <Printer className="w-4 h-4" /> Cetak Massal Sekarang
            </button>
            <button
              type="button"
              onClick={handleExportAllWord}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition-colors cursor-pointer"
              title="Download format Word .doc"
            >
              <Download className="w-3.5 h-3.5" /> Word (.doc)
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Controls & Batch Setting Ribbon */}
        <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-semibold">Tampilan:</span>
            <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-slate-50">
              <button
                type="button"
                onClick={() => setViewMode('all')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  viewMode === 'all'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua Lembar ({dataList.length})
              </button>
              <button
                type="button"
                onClick={() => setViewMode('single')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  viewMode === 'single'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Lembar Per Siswa
              </button>
            </div>

            {viewMode === 'single' && (
              <div className="flex items-center gap-1 ml-2">
                <button
                  type="button"
                  disabled={activePageIndex <= 0}
                  onClick={() => setActivePageIndex(p => Math.max(0, p - 1))}
                  className="p-1 rounded border border-slate-300 hover:bg-slate-100 disabled:opacity-30"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="font-semibold text-slate-700 text-xs px-2">
                  {activePageIndex + 1} / {dataList.length} ({currentItem?.namaSiswa})
                </span>
                <button
                  type="button"
                  disabled={activePageIndex >= dataList.length - 1}
                  onClick={() => setActivePageIndex(p => Math.min(dataList.length - 1, p + 1))}
                  className="p-1 rounded border border-slate-300 hover:bg-slate-100 disabled:opacity-30"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowBatchForm(!showBatchForm)}
              className="px-2.5 py-1 rounded border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1.5"
            >
              <Settings2 className="w-3.5 h-3.5 text-emerald-700" />
              Atur Tujuan & Alasan Serentak
            </button>
          </div>
        </div>

        {/* Batch Configuration Expandable Box */}
        {showBatchForm && (
          <div className="bg-emerald-50/70 border-b border-emerald-200 px-4 py-3 grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs items-end animate-fadeIn">
            <div className="sm:col-span-5">
              <label className="block font-bold text-slate-700 mb-1">
                Samakan Sekolah Tujuan untuk Semua ({dataList.length} Siswa):
              </label>
              <input
                type="text"
                placeholder="Contoh: SD Negeri Kotaraja, Jayapura"
                value={batchSekolahTujuan}
                onChange={(e) => setBatchSekolahTujuan(e.target.value)}
                className="w-full bg-white border border-emerald-300 rounded px-2.5 py-1.5 text-slate-900"
              />
            </div>
            <div className="sm:col-span-5">
              <label className="block font-bold text-slate-700 mb-1">
                Samakan Alasan Kepindahan:
              </label>
              <input
                type="text"
                placeholder="Contoh: Mengikuti perpindahan domisili orang tua / penugasan kerja"
                value={batchAlasan}
                onChange={(e) => setBatchAlasan(e.target.value)}
                className="w-full bg-white border border-emerald-300 rounded px-2.5 py-1.5 text-slate-900"
              />
            </div>
            <div className="sm:col-span-2 flex gap-1.5">
              <button
                type="button"
                onClick={handleApplyBatch}
                className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded shadow-xs text-xs flex items-center justify-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> Terapkan
              </button>
            </div>
          </div>
        )}

        {/* Sheets Container (Scrollable Preview) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-200/70 space-y-6">
          {(viewMode === 'all' ? dataList : [currentItem]).map((item, idx) => {
            const actualIndex = viewMode === 'all' ? idx : activePageIndex;
            const isEditingThis = editingItemId === item.id;

            return (
              <div
                key={item.id || actualIndex}
                className="surat-pindah-print-sheet bg-white max-w-3xl mx-auto p-8 sm:p-12 rounded-xl shadow-md border border-slate-300 text-slate-950 font-serif leading-relaxed text-xs relative"
                style={{
                  pageBreakAfter: 'always',
                  breakAfter: 'page'
                }}
              >
                {/* Visual Label Tag (no print) */}
                <div className="no-print absolute top-3 right-3 flex items-center gap-2">
                  <span className="bg-slate-100 text-slate-600 font-sans font-bold px-2 py-0.5 rounded text-[10px] border border-slate-200">
                    Lembar {actualIndex + 1} dari {dataList.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingItemId(isEditingThis ? null : item.id)}
                    className="px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-sans text-[10px] font-bold flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" /> {isEditingThis ? 'Selesai Edit' : 'Edit Lembar Ini'}
                  </button>
                </div>

                {/* Kop Surat Header with Logo Upload Buttons */}
                <KopSurat
                  settings={settings}
                  onUploadLogoKiri={(b64) => {
                    if (onUploadLogoKiri) onUploadLogoKiri(b64);
                    if (notifyMessage) notifyMessage('Logo Kiri Berhasil Diperbarui');
                  }}
                  onUploadLogoKanan={(b64) => {
                    if (onUploadLogoKanan) onUploadLogoKanan(b64);
                    if (notifyMessage) notifyMessage('Logo Kanan Berhasil Diperbarui');
                  }}
                  showUploadButtons={true}
                  className="mb-4"
                />

                {/* Judul Surat & Nomor */}
                <div className="text-center my-4">
                  <h2 className="text-sm font-black uppercase tracking-wide underline font-sans">
                    SURAT KETERANGAN PINDAH SEKOLAH
                  </h2>
                  <p className="text-[11px] font-mono mt-0.5">
                    Nomor: {item.nomorSurat}
                  </p>
                </div>

                {/* Paragraf Pembuka */}
                <p className="text-justify my-3 indent-6 leading-relaxed">
                  Yang bertanda tangan di bawah ini, Kepala {settings.namaSekolah}, Baalil, Kabupaten Pegunungan Bintang, Provinsi Papua Pegunungan, menerangkan dengan sesungguhnya bahwa:
                </p>

                {/* Data Peserta Didik Table */}
                <div className="my-3 pl-2 sm:pl-4">
                  <table className="w-full border-collapse">
                    <tbody className="space-y-1">
                      <tr>
                        <td className="w-6 py-0.5">1.</td>
                        <td className="w-48 py-0.5 font-sans font-medium text-slate-700">Nama Lengkap Peserta Didik</td>
                        <td className="w-3 py-0.5">:</td>
                        <td className="py-0.5 font-bold uppercase tracking-wide text-slate-950">{item.namaSiswa}</td>
                      </tr>
                      <tr>
                        <td className="py-0.5">2.</td>
                        <td className="py-0.5 font-sans font-medium text-slate-700">Nomor Induk Siswa (NIS)</td>
                        <td className="py-0.5">:</td>
                        <td className="py-0.5 font-mono">{item.nis || '-'}</td>
                      </tr>
                      <tr>
                        <td className="py-0.5">3.</td>
                        <td className="py-0.5 font-sans font-medium text-slate-700">Nomor Induk Siswa Nasional (NISN)</td>
                        <td className="py-0.5">:</td>
                        <td className="py-0.5 font-mono font-bold text-emerald-950">{item.nisn || '-'}</td>
                      </tr>
                      {item.nik && (
                        <tr>
                          <td className="py-0.5">4.</td>
                          <td className="py-0.5 font-sans font-medium text-slate-700">NIK Siswa</td>
                          <td className="py-0.5">:</td>
                          <td className="py-0.5 font-mono">{item.nik}</td>
                        </tr>
                      )}
                      <tr>
                        <td className="py-0.5">{item.nik ? '5.' : '4.'}</td>
                        <td className="py-0.5 font-sans font-medium text-slate-700">Tempat, Tanggal Lahir</td>
                        <td className="py-0.5">:</td>
                        <td className="py-0.5">{item.tempatLahir || 'Dekai'}, {item.tanggalLahir || '-'}</td>
                      </tr>
                      <tr>
                        <td className="py-0.5">{item.nik ? '6.' : '5.'}</td>
                        <td className="py-0.5 font-sans font-medium text-slate-700">Jenis Kelamin</td>
                        <td className="py-0.5">:</td>
                        <td className="py-0.5">{item.jenisKelamin === 'L' ? 'Laki-laki' : item.jenisKelamin === 'P' ? 'Perempuan' : item.jenisKelamin || '-'}</td>
                      </tr>
                      <tr>
                        <td className="py-0.5">{item.nik ? '7.' : '6.'}</td>
                        <td className="py-0.5 font-sans font-medium text-slate-700">Tingkat / Kelas Asal</td>
                        <td className="py-0.5">:</td>
                        <td className="py-0.5 font-semibold">Kelas {item.kelas} ({item.rombel || 'A'})</td>
                      </tr>
                      <tr>
                        <td className="py-0.5">{item.nik ? '8.' : '7.'}</td>
                        <td className="py-0.5 font-sans font-medium text-slate-700">Nama Orang Tua / Wali</td>
                        <td className="py-0.5">:</td>
                        <td className="py-0.5">{item.namaAyah || item.namaIbu || '-'}</td>
                      </tr>
                      <tr>
                        <td className="py-0.5">{item.nik ? '9.' : '8.'}</td>
                        <td className="py-0.5 font-sans font-medium text-slate-700">Alamat Tempat Tinggal Asal</td>
                        <td className="py-0.5">:</td>
                        <td className="py-0.5">{item.alamat || 'Baalil, Distrik Oksibil, Kabupaten Pegunungan Bintang'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Paragraf Keterangan Pindah */}
                <p className="my-2 leading-relaxed">
                  Sesuai surat permohonan mutasi pindah sekolah dari orang tua/wali siswa bersangkutan, peserta didik tersebut di atas mengajukan permohonan pindah sekolah ke:
                </p>

                {/* Data Mutasi Sekolah Tujuan */}
                <div className="my-3 pl-2 sm:pl-4 bg-slate-50/50 p-2.5 rounded border border-slate-200">
                  <table className="w-full border-collapse">
                    <tbody className="space-y-1">
                      <tr>
                        <td className="w-6 py-0.5">a.</td>
                        <td className="w-48 py-0.5 font-sans font-medium text-slate-700">Nama Sekolah Tujuan</td>
                        <td className="w-3 py-0.5">:</td>
                        <td className="py-0.5">
                          {isEditingThis ? (
                            <input
                              type="text"
                              value={item.sekolahTujuan}
                              onChange={(e) => handleUpdateSingleField(item.id, 'sekolahTujuan', e.target.value)}
                              className="w-full border border-emerald-400 bg-white rounded px-2 py-1 font-bold text-xs"
                            />
                          ) : (
                            <strong className="text-slate-950 font-bold">{item.sekolahTujuan}</strong>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-0.5">b.</td>
                        <td className="py-0.5 font-sans font-medium text-slate-700">Tingkat / Masuk di Kelas</td>
                        <td className="py-0.5">:</td>
                        <td className="py-0.5 font-semibold">Kelas {item.kelas}</td>
                      </tr>
                      <tr>
                        <td className="py-0.5">c.</td>
                        <td className="py-0.5 font-sans font-medium text-slate-700">Alasan Kepindahan</td>
                        <td className="py-0.5">:</td>
                        <td className="py-0.5">
                          {isEditingThis ? (
                            <input
                              type="text"
                              value={item.alasanPindah}
                              onChange={(e) => handleUpdateSingleField(item.id, 'alasanPindah', e.target.value)}
                              className="w-full border border-emerald-400 bg-white rounded px-2 py-1 text-xs"
                            />
                          ) : (
                            <span>{item.alasanPindah}</span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-0.5">d.</td>
                        <td className="py-0.5 font-sans font-medium text-slate-700">Kelengkapan Berkas Diserahkan</td>
                        <td className="py-0.5">:</td>
                        <td className="py-0.5 text-[11px] text-slate-700">
                          1. Buku Laporan Hasil Belajar (Raport) Asli<br />
                          2. Surat Permohonan Mutasi dari Orang Tua/Wali<br />
                          3. Surat Keterangan Validasi Mutasi Dapodik
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Paragraf Penutup */}
                <p className="text-justify my-3 indent-6 leading-relaxed">
                  Demikian surat keterangan pindah sekolah ini kami buat dengan sebenarnya dan menurut keadaan yang sesungguhnya untuk dapat dipergunakan sebagaimana mestinya di sekolah tujuan.
                </p>

                {/* Tanda Tangan Block */}
                <div className="mt-8 pt-2 flex justify-between font-sans text-xs">
                  <div className="text-center w-52">
                    <p>Mengetahui,</p>
                    <p className="text-slate-700">Orang Tua / Wali Murid</p>
                    <div className="h-16"></div>
                    <p className="font-bold underline uppercase">
                      ( {item.namaAyah || item.namaIbu || '...........................'} )
                    </p>
                  </div>

                  <div className="text-center w-60">
                    <p>Dekai, {item.tanggalSurat}</p>
                    <p className="font-semibold text-slate-800">Kepala Sekolah,</p>
                    <div className="h-16"></div>
                    <p className="font-bold underline text-slate-950 uppercase">
                      {settings.namaKepsek}
                    </p>
                    <p className="font-mono text-[11px] text-slate-700">
                      NIP. {settings.nipKepsek}
                    </p>
                  </div>
                </div>

                {/* Note Footer */}
                <div className="mt-6 pt-2 border-t border-slate-200 text-[9px] text-slate-500 font-sans flex justify-between">
                  <span>Arsip Tata Usaha & Dapodik {settings.namaSekolah}</span>
                  <span>Dokumen Sah Administrasi Mutasi Peserta Didik</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Bottom Status Bar */}
        <div className="bg-white border-t border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs">
          <div className="text-slate-600">
            Total Dokumen: <strong className="text-emerald-800 font-bold">{dataList.length} Lembar Surat Pindah</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={() => triggerPrint()}
              className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-1.5 shadow"
            >
              <Printer className="w-4 h-4" /> Cetak Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
