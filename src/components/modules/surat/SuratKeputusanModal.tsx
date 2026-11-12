import React, { useState } from 'react';
import { SuratDocument, SchoolSettings, SKLampiranItem } from '../../../types';
import { Printer, Download, X, Award, Plus, Trash2, Edit3 } from 'lucide-react';
import { KopSurat } from '../../KopSurat';
import { exportToWord, triggerPrint } from '../../../utils/exportHelpers';

interface SuratKeputusanModalProps {
  isOpen: boolean;
  onClose: () => void;
  surat: SuratDocument | null;
  settings: SchoolSettings;
  notifyMessage: (msg?: string) => void;
  onUploadLogoKiri?: (base64: string) => void;
  onUploadLogoKanan?: (base64: string) => void;
  onUpdateSurat?: (updated: SuratDocument) => void;
}

export const SuratKeputusanModal: React.FC<SuratKeputusanModalProps> = ({
  isOpen,
  onClose,
  surat,
  settings,
  notifyMessage,
  onUploadLogoKiri,
  onUploadLogoKanan,
  onUpdateSurat
}) => {
  if (!isOpen || !surat) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [menimbang, setMenimbang] = useState<string[]>(
    Array.isArray(surat.skMenimbang) && surat.skMenimbang.length > 0
      ? surat.skMenimbang
      : typeof surat.skMenimbang === 'string' && surat.skMenimbang.trim()
      ? [surat.skMenimbang]
      : [
          `Bahwa dalam rangka memperlancar proses belajar mengajar di ${settings.namaSekolah} perlu menetapkan pembagian tugas guru;`,
          'Bahwa guru yang namanya tercantum dalam lampiran keputusan ini dipandang cakap dan mampu melaksanakan tugas tersebut;',
          'Bahwa berdasarkan pertimbangan sebagaimana dimaksud pada huruf a dan b, perlu menetapkan Surat Keputusan tentang Pembagian Tugas Guru.'
        ]
  );

  const [mengingat, setMengingat] = useState<string[]>(
    Array.isArray(surat.skMengingat) && surat.skMengingat.length > 0
      ? surat.skMengingat
      : typeof surat.skMengingat === 'string' && surat.skMengingat.trim()
      ? [surat.skMengingat]
      : [
          'Undang-Undang Nomor 20 Tahun 2003 tentang Sistem Pendidikan Nasional;',
          'Undang-Undang Nomor 14 Tahun 2005 tentang Guru dan Dosen;',
          'Peraturan Pemerintah Nomor 19 Tahun 2017 tentang Perubahan atas PP 74 Tahun 2008 tentang Guru;',
          `Program Kerja ${settings.namaSekolah} Tahun Pelajaran 2026/2027.`
        ]
  );

  const [memutuskan, setMemutuskan] = useState<string[]>(
    Array.isArray(surat.skMemutuskan) && surat.skMemutuskan.length > 0
      ? surat.skMemutuskan
      : typeof surat.skMemutuskan === 'string' && surat.skMemutuskan.trim()
      ? [surat.skMemutuskan]
      : [
          `Pembagian Tugas Guru dalam Kegiatan Belajar Mengajar dan Bimbingan pada ${settings.namaSekolah} Tahun Pelajaran 2026/2027 sebagaimana tercantum dalam lampiran keputusan ini.`,
          'Masing-masing guru melaporkan pelaksanaan tugasnya secara tertulis dan berkala kepada Kepala Sekolah.',
          'Segala biaya yang timbul akibat pelaksanaan keputusan ini dibebankan pada anggaran yang sesuai.',
          'Keputusan ini mulai berlaku sejak tanggal ditetapkan dengan ketentuan apabila terdapat kekeliruan akan diperbaiki sebagaimana mestinya.'
        ]
  );

  const [lampiranList, setLampiranList] = useState<SKLampiranItem[]>(
    surat.skLampiran && surat.skLampiran.length > 0
      ? surat.skLampiran
      : [
          { no: 1, nama: 'Selpius Nabyal, S.Pd.Gr.', nipNisn: '19920415 201903 1 007', jabatanKelas: 'Guru Kelas IV', tugas: 'Wali Kelas & Operator Dapodik', keterangan: 'Aktif' },
          { no: 2, nama: 'Dorkas Sambom, S.Pd.', nipNisn: '19891212 201702 2 004', jabatanKelas: 'Guru Mapel Agama', tugas: 'Guru Mapel PAK & Pembina Pramuka', keterangan: 'Aktif' },
          { no: 3, nama: 'Petrus Matuan, S.Pd.', nipNisn: '19950620 202201 1 003', jabatanKelas: 'Guru Kelas V', tugas: 'Wali Kelas & Pengelola Inventaris', keterangan: 'Aktif' }
        ]
  );

  const handleSaveEdits = () => {
    if (onUpdateSurat) {
      const updated: SuratDocument = {
        ...surat,
        skMenimbang: menimbang,
        skMengingat: mengingat,
        skMemutuskan: memutuskan,
        skLampiran: lampiranList
      };
      onUpdateSurat(updated);
      notifyMessage('Isi Format SK Berhasil Diperbarui');
    }
    setIsEditing(false);
  };

  const handleAddLampiranRow = () => {
    setLampiranList(prev => [
      ...prev,
      {
        no: prev.length + 1,
        nama: '',
        nipNisn: '-',
        jabatanKelas: 'Guru Kelas',
        tugas: 'Mengajar & Administrasi',
        keterangan: 'Aktif'
      }
    ]);
  };

  const handleRemoveLampiranRow = (idx: number) => {
    setLampiranList(prev => prev.filter((_, i) => i !== idx).map((row, i) => ({ ...row, no: i + 1 })));
  };

  const handleExportWord = () => {
    const menimbangHtml = menimbang
      .map((item, idx) => `<tr><td width="3%" valign="top">${String.fromCharCode(97 + idx)}.</td><td valign="top">${item}</td></tr>`)
      .join('');

    const mengingatHtml = mengingat
      .map((item, idx) => `<tr><td width="3%" valign="top">${idx + 1}.</td><td valign="top">${item}</td></tr>`)
      .join('');

    const diktumLabels = ['KESATU', 'KEDUA', 'KETIGA', 'KEEMPAT', 'KELIMA'];
    const memutuskanHtml = memutuskan
      .map((item, idx) => `<tr><td width="15%" valign="top"><b>${diktumLabels[idx] || 'SELANJUTNYA'}</b></td><td width="2%">:</td><td valign="top">${item}</td></tr>`)
      .join('');

    const lampiranTableRows = lampiranList
      .map(
        row => `<tr>
          <td align="center">${row.no}</td>
          <td>${row.nama}</td>
          <td>${row.nipNisn}</td>
          <td>${row.jabatanKelas}</td>
          <td>${row.tugas}</td>
          <td align="center">${row.keterangan}</td>
        </tr>`
      )
      .join('');

    const content = `
      <div style="font-family: 'Times New Roman', Times, serif; text-align: center; border-bottom: 3px double #000; padding-bottom: 8px;">
        <h3 style="margin:0; font-size:12pt; text-transform:uppercase;">${settings.namaInstansi}</h3>
        <h2 style="margin:2px 0; font-size:14pt; text-transform:uppercase;">${settings.namaSekolah}</h2>
        <p style="margin:0; font-size:9pt;">${settings.alamatSekolah} | NPSN: ${settings.npsn}</p>
      </div>

      <div style="text-align: center; margin: 20px 0 15px 0;">
        <h3 style="margin:0; text-transform:uppercase; font-size: 13pt;">SURAT KEPUTUSAN KEPALA SEKOLAH</h3>
        <h3 style="margin:2px 0; text-transform:uppercase; font-size: 13pt;">${settings.namaSekolah}</h3>
        <p style="margin:2px 0; font-size: 11pt;">NOMOR : ${surat.nomorSurat}</p>
        <p style="margin:8px 0 2px 0; font-size: 10pt; font-weight:bold;">TENTANG</p>
        <h4 style="margin:2px 0; text-transform:uppercase; font-size: 12pt;">${surat.perihal}</h4>
        <p style="margin:2px 0; font-size: 11pt;">TAHUN PELAJARAN ${surat.masaBerlaku || '2026/2027'}</p>
      </div>

      <div style="text-align: center; margin: 15px 0 10px 0; font-weight:bold; font-size: 11pt;">
        KEPALA ${settings.namaSekolah}
      </div>

      <table style="width: 100%; font-size: 10.5pt; line-height: 1.5; margin-bottom: 10px;">
        <tr>
          <td width="15%" valign="top"><b>Menimbang</b></td>
          <td width="2%" valign="top">:</td>
          <td><table style="width:100%; font-size: 10.5pt;">${menimbangHtml}</table></td>
        </tr>
        <tr>
          <td valign="top"><b>Mengingat</b></td>
          <td valign="top">:</td>
          <td><table style="width:100%; font-size: 10.5pt;">${mengingatHtml}</table></td>
        </tr>
      </table>

      <div style="text-align: center; margin: 15px 0 5px 0; font-weight:bold; font-size: 11pt;">
        MEMUTUSKAN
      </div>
      <p style="margin:0 0 10px 0; font-weight:bold; font-size: 10.5pt;">Menetapkan :</p>
      <table style="width: 100%; font-size: 10.5pt; line-height: 1.6; margin-bottom: 20px;">
        ${memutuskanHtml}
      </table>

      <div style="margin-top: 30px; text-align: right; font-size: 10.5pt;">
        <table style="margin-left: auto; width: 40%;">
          <tr><td>Ditetapkan di</td><td>: ${settings.alamatSekolah.split(',')[0] || 'Balil'}</td></tr>
          <tr><td>Pada tanggal</td><td>: ${surat.tanggalSurat}</td></tr>
        </table>
        <br/>
        <p style="margin:0;">Kepala ${settings.namaSekolah}</p>
        <br/><br/><br/>
        <p style="margin:0;"><b><u>${settings.namaKepsek}</u></b></p>
        <p style="margin:0;">NIP. ${settings.nipKepsek}</p>
      </div>

      <div style="page-break-before: always; margin-top: 40px;">
        <p style="font-size: 10pt; margin: 0;"><b>Lampiran Surat Keputusan Kepala ${settings.namaSekolah}</b></p>
        <p style="font-size: 10pt; margin: 2px 0;">Nomor : ${surat.nomorSurat}</p>
        <p style="font-size: 10pt; margin: 2px 0 15px 0;">Tentang : ${surat.perihal}</p>

        <table border="1" cellpadding="6" cellspacing="0" style="width:100%; border-collapse:collapse; font-size:10pt;">
          <thead style="background:#eee;">
            <tr>
              <th width="5%">No</th>
              <th>Nama Lengkap</th>
              <th>NIP / NUPTK / NISN</th>
              <th>Jabatan / Kelas</th>
              <th>Uraian Tugas</th>
              <th>Keterangan</th>
            </tr>
          </thead>
          <tbody>
            ${lampiranTableRows}
          </tbody>
        </table>

        <div style="margin-top: 30px; text-align: right; font-size: 10pt;">
          <p>Kepala ${settings.namaSekolah}</p>
          <br/><br/><br/>
          <p><b><u>${settings.namaKepsek}</u></b><br/>NIP. ${settings.nipKepsek}</p>
        </div>
      </div>
    `;

    exportToWord(`SK_${surat.nomorSurat.replace(/[\/\\]/g, '_')}`, content);
    notifyMessage('Surat Keputusan (SK) Diekspor ke Word');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4 print:my-0 print:border-none print:shadow-none print:max-w-none print:w-full">
        {/* Toolbar (no-print) */}
        <div className="bg-slate-900 text-white p-3 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-sm">Format G: Format Surat Keputusan (SK) Kepala Sekolah</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                isEditing ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Selesai Edit' : 'Edit Butir SK'}</span>
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={handleSaveEdits}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Simpan Perubahan
              </button>
            )}
            <button
              type="button"
              onClick={() => triggerPrint()}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak (Print)</span>
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

          {/* Judul SK */}
          <div className="text-center my-4 font-sans">
            <h3 className="text-sm sm:text-base font-black tracking-wider uppercase">
              SURAT KEPUTUSAN KEPALA SEKOLAH
            </h3>
            <h3 className="text-sm sm:text-base font-black tracking-wider uppercase">
              {settings.namaSekolah}
            </h3>
            <p className="font-mono text-xs mt-1">
              NOMOR : <strong>{surat.nomorSurat}</strong>
            </p>
            <p className="font-bold text-xs mt-2 uppercase tracking-wide">TENTANG</p>
            <h4 className="font-bold text-xs sm:text-sm uppercase text-slate-900 mt-1 max-w-xl mx-auto">
              {surat.perihal}
            </h4>
            <p className="text-xs font-semibold text-slate-600 mt-1">
              TAHUN PELAJARAN {surat.masaBerlaku || '2026/2027'}
            </p>
          </div>

          <div className="text-center my-4 font-sans font-bold text-xs uppercase tracking-wide">
            KEPALA {settings.namaSekolah}
          </div>

          {/* Menimbang */}
          <div className="my-3 space-y-1">
            <div className="flex items-start">
              <span className="w-24 font-bold font-sans">Menimbang</span>
              <span className="w-4 font-bold">:</span>
              <div className="flex-1 space-y-1.5 text-justify">
                {menimbang.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="font-bold font-sans">{String.fromCharCode(97 + idx)}.</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={point}
                        onChange={(e) => {
                          const updated = [...menimbang];
                          updated[idx] = e.target.value;
                          setMenimbang(updated);
                        }}
                        className="w-full border border-slate-300 rounded p-1 text-xs"
                      />
                    ) : (
                      <span className="flex-1">{point}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mengingat */}
          <div className="my-3 space-y-1">
            <div className="flex items-start">
              <span className="w-24 font-bold font-sans">Mengingat</span>
              <span className="w-4 font-bold">:</span>
              <div className="flex-1 space-y-1.5 text-justify">
                {mengingat.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="font-bold font-sans">{idx + 1}.</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={point}
                        onChange={(e) => {
                          const updated = [...mengingat];
                          updated[idx] = e.target.value;
                          setMengingat(updated);
                        }}
                        className="w-full border border-slate-300 rounded p-1 text-xs"
                      />
                    ) : (
                      <span className="flex-1">{point}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* MEMUTUSKAN */}
          <div className="text-center my-5 font-sans font-black tracking-widest text-xs uppercase">
            MEMUTUSKAN
          </div>

          <div className="my-3 space-y-2">
            <div className="font-sans font-bold text-xs mb-2">Menetapkan :</div>
            {memutuskan.map((diktum, idx) => {
              const diktumLabels = ['KESATU', 'KEDUA', 'KETIGA', 'KEEMPAT', 'KELIMA'];
              return (
                <div key={idx} className="flex items-start gap-2">
                  <span className="w-20 font-bold font-sans">{diktumLabels[idx] || 'SELANJUTNYA'}</span>
                  <span className="w-4 font-bold">:</span>
                  {isEditing ? (
                    <textarea
                      rows={2}
                      value={diktum}
                      onChange={(e) => {
                        const updated = [...memutuskan];
                        updated[idx] = e.target.value;
                        setMemutuskan(updated);
                      }}
                      className="w-full border border-slate-300 rounded p-1 text-xs"
                    />
                  ) : (
                    <span className="flex-1 text-justify">{diktum}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Titimangsa Penetapan */}
          <div className="mt-8 flex justify-end font-sans text-xs">
            <div className="w-72">
              <table className="w-full mb-2">
                <tbody>
                  <tr>
                    <td className="w-28 text-slate-600">Ditetapkan di</td>
                    <td>: {settings.alamatSekolah.split(',')[0] || 'Balil'}</td>
                  </tr>
                  <tr>
                    <td className="text-slate-600">Pada tanggal</td>
                    <td>: {surat.tanggalSurat}</td>
                  </tr>
                </tbody>
              </table>
              <p className="font-semibold">Kepala {settings.namaSekolah},</p>
              <div className="h-16 flex items-center justify-center text-slate-400 italic text-[11px]">
                ( tanda tangan & stempel )
              </div>
              <p className="font-bold underline text-sm">{settings.namaKepsek}</p>
              <p className="font-mono text-[11px]">NIP. {settings.nipKepsek}</p>
            </div>
          </div>

          {/* Lampiran SK (Table) */}
          <div className="mt-12 pt-8 border-t-2 border-slate-800 break-before-page">
            <div className="flex justify-between items-start mb-3 font-sans text-xs">
              <div>
                <p className="font-bold">Lampiran Surat Keputusan Kepala {settings.namaSekolah}</p>
                <p>Nomor : {surat.nomorSurat}</p>
                <p>Tentang : {surat.perihal}</p>
              </div>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleAddLampiranRow}
                  className="px-2.5 py-1 bg-emerald-600 text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Baris
                </button>
              )}
            </div>

            <div className="overflow-x-auto border border-slate-800">
              <table className="w-full border-collapse text-xs font-sans">
                <thead className="bg-slate-100 font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-2 border-r border-slate-800 w-8 text-center">No</th>
                    <th className="p-2 border-r border-slate-800 text-left">Nama Lengkap</th>
                    <th className="p-2 border-r border-slate-800 text-left">NIP / NISN</th>
                    <th className="p-2 border-r border-slate-800 text-left">Jabatan / Kelas</th>
                    <th className="p-2 border-r border-slate-800 text-left">Uraian Tugas</th>
                    <th className="p-2 border-r border-slate-800 text-center w-20">Keterangan</th>
                    {isEditing && <th className="p-2 text-center w-12">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {lampiranList.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2 border-r border-slate-800 text-center font-bold">{row.no}</td>
                      <td className="p-2 border-r border-slate-800 font-semibold">
                        {isEditing ? (
                          <input
                            type="text"
                            value={row.nama}
                            onChange={(e) => {
                              const updated = [...lampiranList];
                              updated[idx].nama = e.target.value;
                              setLampiranList(updated);
                            }}
                            className="w-full border border-slate-300 p-1 rounded"
                          />
                        ) : (
                          row.nama
                        )}
                      </td>
                      <td className="p-2 border-r border-slate-800 font-mono text-[11px]">
                        {isEditing ? (
                          <input
                            type="text"
                            value={row.nipNisn}
                            onChange={(e) => {
                              const updated = [...lampiranList];
                              updated[idx].nipNisn = e.target.value;
                              setLampiranList(updated);
                            }}
                            className="w-full border border-slate-300 p-1 rounded font-mono"
                          />
                        ) : (
                          row.nipNisn
                        )}
                      </td>
                      <td className="p-2 border-r border-slate-800">
                        {isEditing ? (
                          <input
                            type="text"
                            value={row.jabatanKelas}
                            onChange={(e) => {
                              const updated = [...lampiranList];
                              updated[idx].jabatanKelas = e.target.value;
                              setLampiranList(updated);
                            }}
                            className="w-full border border-slate-300 p-1 rounded"
                          />
                        ) : (
                          row.jabatanKelas
                        )}
                      </td>
                      <td className="p-2 border-r border-slate-800">
                        {isEditing ? (
                          <input
                            type="text"
                            value={row.tugas}
                            onChange={(e) => {
                              const updated = [...lampiranList];
                              updated[idx].tugas = e.target.value;
                              setLampiranList(updated);
                            }}
                            className="w-full border border-slate-300 p-1 rounded"
                          />
                        ) : (
                          row.tugas
                        )}
                      </td>
                      <td className="p-2 border-r border-slate-800 text-center">
                        <span className="font-semibold text-emerald-700">{row.keterangan}</span>
                      </td>
                      {isEditing && (
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveLampiranRow(idx)}
                            className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 flex justify-end font-sans text-xs">
              <div className="w-64 text-center">
                <p>Kepala {settings.namaSekolah}</p>
                <div className="h-14 flex items-center justify-center text-slate-400 italic text-[11px]">
                  ( tanda tangan & stempel )
                </div>
                <p className="font-bold underline">{settings.namaKepsek}</p>
                <p className="font-mono text-[11px]">NIP. {settings.nipKepsek}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
