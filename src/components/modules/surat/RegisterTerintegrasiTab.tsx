import React, { useState } from 'react';
import { SuratDocument, SchoolSettings } from '../../../types';
import { Search, Printer, Download, FileText, Filter, Eye } from 'lucide-react';
import { exportToExcel, exportToWord, triggerPrint } from '../../../utils/exportHelpers';

interface RegisterTerintegrasiTabProps {
  suratList: SuratDocument[];
  onOpenDoc: (surat: SuratDocument) => void;
  settings: SchoolSettings;
  notifyMessage: (msg?: string) => void;
}

export const RegisterTerintegrasiTab: React.FC<RegisterTerintegrasiTabProps> = ({
  suratList,
  onOpenDoc,
  settings,
  notifyMessage
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [jenisFilter, setJenisFilter] = useState('Semua');
  const [klasFilter, setKlasFilter] = useState('Semua');

  const filtered = suratList.filter(s => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      (s.nomorSurat || '').toLowerCase().includes(q) ||
      (s.pengirim || '').toLowerCase().includes(q) ||
      (s.penerima || '').toLowerCase().includes(q) ||
      (s.perihal || '').toLowerCase().includes(q) ||
      (s.nomorAgenda || '').toLowerCase().includes(q) ||
      (s.petugasPencatat || '').toLowerCase().includes(q);

    let matchJenis = true;
    if (jenisFilter === 'Masuk') matchJenis = s.jenisSurat === 'Surat Masuk' || (s.nomorAgenda && s.nomorAgenda.startsWith('SM-'));
    else if (jenisFilter === 'Keluar') matchJenis = s.jenisSurat === 'Surat Keluar' || s.jenisSurat === 'Surat Dinas Keluar' || (s.nomorAgenda && s.nomorAgenda.startsWith('SK-'));
    else if (jenisFilter === 'SK') matchJenis = s.jenisSurat === 'Surat Keputusan Kepala Sekolah' || s.nomorSurat.includes('/SK/');

    const matchKlas = klasFilter === 'Semua' || s.klasifikasi === klasFilter;
    return matchSearch && matchJenis && matchKlas;
  });

  const handleExportExcel = () => {
    const headers = [
      'No',
      'Tanggal',
      'Jenis Surat',
      'Nomor Surat',
      'Klasifikasi',
      'Dari (Pengirim)',
      'Kepada (Penerima)',
      'Perihal',
      'Lampiran',
      'Petugas',
      'Status',
      'Keterangan'
    ];

    const rows = filtered.map((s, idx) => [
      idx + 1,
      s.tanggalSurat,
      s.jenisSurat,
      s.nomorSurat,
      s.klasifikasi || 'UM',
      s.pengirim,
      s.penerima,
      s.perihal,
      s.lampiran || '-',
      s.petugasPencatat || s.penanggungJawab || settings.operatorTU,
      s.statusSurat || 'Aktif',
      s.keterangan || '-'
    ]);

    exportToExcel(`Buku_Register_Surat_Terintegrasi_${settings.namaSekolah.replace(/\s+/g, '_')}`, headers, rows);
    notifyMessage('Register Terintegrasi Diekspor ke Excel');
  };

  const handleExportWord = () => {
    const tableRows = filtered
      .map(
        (s, idx) => `<tr>
          <td align="center">${idx + 1}</td>
          <td align="center">${s.tanggalSurat}</td>
          <td>${s.jenisSurat}</td>
          <td><b>${s.nomorSurat}</b></td>
          <td align="center">${s.klasifikasi || 'UM'}</td>
          <td>${s.pengirim}</td>
          <td>${s.penerima}</td>
          <td>${s.perihal}</td>
          <td align="center">${s.lampiran || '-'}</td>
          <td>${s.petugasPencatat || s.penanggungJawab || settings.operatorTU}</td>
          <td align="center">${s.statusSurat || 'Aktif'}</td>
          <td>${s.keterangan || '-'}</td>
        </tr>`
      )
      .join('');

    const content = `
      <div style="font-family: Arial, sans-serif; text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px;">
        <h3 style="margin:0; text-transform:uppercase;">${settings.namaInstansi}</h3>
        <h2 style="margin:2px 0; text-transform:uppercase;">${settings.namaSekolah}</h2>
        <p style="margin:0; font-size:9pt;">${settings.alamatSekolah} | NPSN: ${settings.npsn}</p>
      </div>
      <div style="text-align: center; margin: 15px 0;">
        <h3 style="margin:0; text-decoration: underline;">BUKU REGISTER PERSURATAN TERINTEGRASI SEKOLAH</h3>
        <p style="margin:2px 0; font-size:10pt;">Tahun Pelajaran 2026/2027</p>
      </div>
      <table border="1" cellpadding="5" cellspacing="0" style="width:100%; border-collapse:collapse; font-size:8.5pt;">
        <thead style="background:#f0f0f0;">
          <tr>
            <th>No</th>
            <th>Tanggal</th>
            <th>Jenis Surat</th>
            <th>Nomor Surat</th>
            <th>Klas</th>
            <th>Dari</th>
            <th>Kepada</th>
            <th>Perihal</th>
            <th>Lamp</th>
            <th>Petugas</th>
            <th>Status</th>
            <th>Keterangan</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    `;

    exportToWord(`Register_Terintegrasi_${settings.namaSekolah.replace(/\s+/g, '_')}`, content);
    notifyMessage('Register Terintegrasi Diekspor ke Word');
  };

  return (
    <div className="space-y-3">
      {/* Search & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari dalam master register terpadu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:border-slate-800 focus:outline-none"
            />
          </div>

          <select
            value={jenisFilter}
            onChange={(e) => setJenisFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-700 cursor-pointer"
          >
            <option value="Semua">Semua Jenis</option>
            <option value="Masuk">Surat Masuk</option>
            <option value="Keluar">Surat Keluar</option>
            <option value="SK">Surat Keputusan (SK)</option>
          </select>

          <select
            value={klasFilter}
            onChange={(e) => setKlasFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-700 cursor-pointer"
          >
            <option value="Semua">Semua Klas</option>
            <option value="ADM">ADM</option>
            <option value="KEPEG">KEPEG</option>
            <option value="KUR">KUR</option>
            <option value="SIS">SIS</option>
            <option value="BOS">BOS</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => triggerPrint()}
            className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-700" />
            <span>Print Master</span>
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>Excel</span>
          </button>

          <button
            type="button"
            onClick={handleExportWord}
            className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-blue-700" />
            <span>Word</span>
          </button>
        </div>
      </div>

      {/* Table Master Register Terintegrasi (M) */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-3 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="font-bold text-xs uppercase text-slate-800">
              M. Format Buku Register Surat Terintegrasi (Tabel Utama Tata Usaha Sekolah)
            </h4>
            <p className="text-[11px] text-slate-500">
              Pusat Monitoring Seluruh Aliran Dokumen Sekolah ({filtered.length} Berkas Aktif)
            </p>
          </div>
          <span className="text-[11px] font-bold text-slate-800 bg-slate-200 px-2.5 py-0.5 rounded-full">
            Master Register Sekolah
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold uppercase text-[10.5px]">
              <tr>
                <th className="p-2 w-8 text-center">No</th>
                <th className="p-2 w-20 text-center">Tanggal</th>
                <th className="p-2 w-24 text-center">Jenis</th>
                <th className="p-2">Nomor Surat</th>
                <th className="p-2 w-16 text-center">Klas</th>
                <th className="p-2">Dari (Pengirim)</th>
                <th className="p-2">Kepada (Penerima)</th>
                <th className="p-2">Perihal</th>
                <th className="p-2 w-16 text-center">Lamp</th>
                <th className="p-2 w-24">Petugas</th>
                <th className="p-2 w-20 text-center">Status</th>
                <th className="p-2 w-16 text-center no-print">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={12} className="p-8 text-center text-slate-400">
                    Tidak ada berkas yang sesuai kriteria filter.
                  </td>
                </tr>
              ) : (
                filtered.map((s, idx) => {
                  const isMasuk = s.jenisSurat === 'Surat Masuk' || (s.nomorAgenda && s.nomorAgenda.startsWith('SM-'));
                  const isSK = s.jenisSurat === 'Surat Keputusan Kepala Sekolah' || s.nomorSurat.includes('/SK/');

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-2 text-center font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-2 text-center text-slate-600 whitespace-nowrap">{s.tanggalSurat}</td>
                      <td className="p-2 text-center">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            isMasuk
                              ? 'bg-emerald-100 text-emerald-800'
                              : isSK
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-teal-100 text-teal-800'
                          }`}
                        >
                          {isMasuk ? 'Masuk' : isSK ? 'SK' : 'Keluar'}
                        </span>
                      </td>
                      <td className="p-2 font-bold font-mono text-slate-900">{s.nomorSurat}</td>
                      <td className="p-2 text-center">
                        <span className="font-bold text-[10px] bg-slate-100 text-slate-700 px-1 py-0.5 rounded">
                          {s.klasifikasi || 'UM'}
                        </span>
                      </td>
                      <td className="p-2 font-medium text-slate-800">{s.pengirim}</td>
                      <td className="p-2 font-medium text-slate-800">{s.penerima}</td>
                      <td className="p-2 font-semibold text-slate-900 max-w-xs">{s.perihal}</td>
                      <td className="p-2 text-center text-slate-600">{s.lampiran || '-'}</td>
                      <td className="p-2 text-slate-700 font-medium">{s.petugasPencatat || s.penanggungJawab || settings.operatorTU}</td>
                      <td className="p-2 text-center">
                        <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                          {s.statusSurat || 'Aktif'}
                        </span>
                      </td>
                      <td className="p-2 text-center no-print">
                        <button
                          type="button"
                          onClick={() => onOpenDoc(s)}
                          className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 cursor-pointer"
                          title="Lihat Dokumen"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
