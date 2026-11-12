import React, { useState } from 'react';
import { SuratDocument, SchoolSettings } from '../../../types';
import { Search, Printer, Download, FileText, CheckCircle2, Clock } from 'lucide-react';
import { exportToExcel, exportToWord, triggerPrint } from '../../../utils/exportHelpers';

interface RegisterSuratKeluarTabProps {
  suratList: SuratDocument[];
  onOpenSuratDinas: (surat: SuratDocument) => void;
  onEdit: (surat: SuratDocument) => void;
  settings: SchoolSettings;
  notifyMessage: (msg?: string) => void;
}

export const RegisterSuratKeluarTab: React.FC<RegisterSuratKeluarTabProps> = ({
  suratList,
  onOpenSuratDinas,
  onEdit,
  settings,
  notifyMessage
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');

  // Filter letters that qualify as outgoing registers
  const outgoing = suratList.filter(
    s =>
      s.jenisSurat === 'Surat Keluar' ||
      s.jenisSurat === 'Surat Dinas Keluar' ||
      (s.nomorAgenda && s.nomorAgenda.startsWith('SK-')) ||
      (s.pengirim && s.pengirim.toLowerCase().includes('sd'))
  );

  const filtered = outgoing.filter(s => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      (s.nomorSurat || '').toLowerCase().includes(q) ||
      (s.penerima || '').toLowerCase().includes(q) ||
      (s.perihal || '').toLowerCase().includes(q) ||
      (s.kodeKlasifikasi || '').toLowerCase().includes(q) ||
      (s.penanggungJawab || '').toLowerCase().includes(q);

    const matchStatus = statusFilter === 'Semua' || (s.statusSurat || 'Terkirim') === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleExportExcel = () => {
    const headers = [
      'No',
      'Tanggal Surat',
      'Nomor Surat',
      'Kode Klasifikasi',
      'Tujuan Surat',
      'Perihal',
      'Penanggung Jawab',
      'Status'
    ];

    const rows = filtered.map((s, idx) => [
      idx + 1,
      s.tanggalSurat,
      s.nomorSurat,
      s.kodeKlasifikasi || s.klasifikasi || 'ADM',
      s.penerima,
      s.perihal,
      s.penanggungJawab || 'TU',
      s.statusSurat || 'Terkirim'
    ]);

    exportToExcel(`Register_Surat_Keluar_${settings.namaSekolah.replace(/\s+/g, '_')}`, headers, rows);
    notifyMessage('Register Surat Keluar Diekspor ke Excel');
  };

  const handleExportWord = () => {
    const tableRows = filtered
      .map(
        (s, idx) => `<tr>
          <td align="center">${idx + 1}</td>
          <td align="center">${s.tanggalSurat}</td>
          <td><b>${s.nomorSurat}</b></td>
          <td align="center">${s.kodeKlasifikasi || s.klasifikasi || 'ADM'}</td>
          <td>${s.penerima}</td>
          <td>${s.perihal}</td>
          <td>${s.penanggungJawab || 'TU'}</td>
          <td align="center">${s.statusSurat || 'Terkirim'}</td>
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
        <h3 style="margin:0; text-decoration: underline;">REGISTER SURAT KELUAR RESMI</h3>
        <p style="margin:2px 0; font-size:10pt;">Tahun Pelajaran 2026/2027</p>
      </div>
      <table border="1" cellpadding="5" cellspacing="0" style="width:100%; border-collapse:collapse; font-size:9pt;">
        <thead style="background:#f0f0f0;">
          <tr>
            <th>No</th>
            <th>Tanggal Surat</th>
            <th>Nomor Surat</th>
            <th>Kode Klasifikasi</th>
            <th>Tujuan Surat</th>
            <th>Perihal</th>
            <th>Penanggung Jawab</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    `;

    exportToWord(`Register_Surat_Keluar_${settings.namaSekolah.replace(/\s+/g, '_')}`, content);
    notifyMessage('Register Surat Keluar Diekspor ke Word');
  };

  return (
    <div className="space-y-3">
      {/* Search & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nomor surat, kode, tujuan, atau penanggung jawab..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:border-teal-600 focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 cursor-pointer focus:border-teal-600 focus:outline-none"
          >
            <option value="Semua">Semua Status</option>
            <option value="Terkirim">Terkirim</option>
            <option value="Selesai">Selesai</option>
            <option value="Diproses">Diproses</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => triggerPrint()}
            className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-teal-700" />
            <span>Print Register</span>
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-teal-700" />
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

      {/* Table Register Surat Keluar (E) */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-3 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="font-bold text-xs uppercase text-slate-800">
              E. Tabel Register Surat Keluar Resmi
            </h4>
            <p className="text-[11px] text-slate-500">
              Buku Kendali Nomor Urut dan Penanggung Jawab Distribusi Surat ({filtered.length} Terdaftar)
            </p>
          </div>
          <span className="text-[11px] font-bold text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-full">
            Format Register Buku Kendali
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold uppercase text-[11px]">
              <tr>
                <th className="p-2.5 w-10 text-center">No</th>
                <th className="p-2.5 w-24 text-center">Tanggal Surat</th>
                <th className="p-2.5">Nomor Surat</th>
                <th className="p-2.5 w-28 text-center">Kode Klasifikasi</th>
                <th className="p-2.5">Tujuan Surat</th>
                <th className="p-2.5">Perihal</th>
                <th className="p-2.5 w-32 text-center">Penanggung Jawab</th>
                <th className="p-2.5 w-24 text-center">Status</th>
                <th className="p-2.5 w-24 text-center no-print">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    Tidak ada data register surat keluar yang cocok.
                  </td>
                </tr>
              ) : (
                filtered.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-2.5 text-center font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-2.5 text-center text-slate-700 font-medium whitespace-nowrap">
                      {s.tanggalSurat}
                    </td>
                    <td className="p-2.5 font-bold font-mono text-slate-900">{s.nomorSurat}</td>
                    <td className="p-2.5 text-center">
                      <span className="font-mono font-bold text-[11px] bg-slate-100 text-teal-800 px-2 py-0.5 rounded border border-slate-300">
                        {s.kodeKlasifikasi || s.klasifikasi || 'ADM'}
                      </span>
                    </td>
                    <td className="p-2.5 font-semibold text-slate-800">{s.penerima}</td>
                    <td className="p-2.5 font-medium text-slate-900 max-w-xs">{s.perihal}</td>
                    <td className="p-2.5 text-center font-medium text-slate-700">
                      {s.penanggungJawab || 'TU'}
                    </td>
                    <td className="p-2.5 text-center">
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                        {s.statusSurat || 'Terkirim'}
                      </span>
                    </td>
                    <td className="p-2.5 text-center no-print">
                      <button
                        type="button"
                        onClick={() => onOpenSuratDinas(s)}
                        className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 rounded font-bold text-[11px] cursor-pointer"
                        title="Lihat Naskah Dinas"
                      >
                        Naskah
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
