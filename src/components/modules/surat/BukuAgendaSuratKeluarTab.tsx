import React, { useState } from 'react';
import { SuratDocument, SchoolSettings } from '../../../types';
import { Plus, Search, FileText, Printer, Edit2, Trash2, Download, Send } from 'lucide-react';
import { exportToExcel, exportToWord, triggerPrint, safeConfirm } from '../../../utils/exportHelpers';

interface BukuAgendaSuratKeluarTabProps {
  suratList: SuratDocument[];
  onAddNew: () => void;
  onEdit: (surat: SuratDocument) => void;
  onDelete: (id: string) => void;
  onOpenSuratDinas: (surat: SuratDocument) => void;
  settings: SchoolSettings;
  notifyMessage: (msg?: string) => void;
}

export const BukuAgendaSuratKeluarTab: React.FC<BukuAgendaSuratKeluarTabProps> = ({
  suratList,
  onAddNew,
  onEdit,
  onDelete,
  onOpenSuratDinas,
  settings,
  notifyMessage
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKlasifikasi, setFilterKlasifikasi] = useState('Semua');

  // Filter outgoing letters only
  const keluarDocs = suratList.filter(
    s =>
      s.jenisSurat === 'Surat Keluar' ||
      s.jenisSurat === 'Surat Dinas Keluar' ||
      (s.nomorAgenda && s.nomorAgenda.startsWith('SK-')) ||
      (s.pengirim && s.pengirim.toLowerCase().includes('sd negeri'))
  );

  const filtered = keluarDocs.filter(s => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      (s.nomorAgenda || '').toLowerCase().includes(q) ||
      (s.nomorSurat || '').toLowerCase().includes(q) ||
      (s.penerima || '').toLowerCase().includes(q) ||
      (s.perihal || '').toLowerCase().includes(q) ||
      (s.isiRingkas || '').toLowerCase().includes(q);

    const matchKlas = filterKlasifikasi === 'Semua' || s.klasifikasi === filterKlasifikasi;
    return matchSearch && matchKlas;
  });

  const handleExportExcel = () => {
    const headers = [
      'No',
      'Nomor Agenda',
      'Nomor Surat',
      'Tanggal Surat',
      'Tujuan Surat',
      'Perihal',
      'Klasifikasi',
      'Lampiran',
      'Penandatangan',
      'Keterangan / Status'
    ];

    const rows = filtered.map((s, idx) => [
      idx + 1,
      s.nomorAgenda || `SK-00${idx + 1}`,
      s.nomorSurat,
      s.tanggalSurat,
      s.penerima,
      s.perihal,
      s.klasifikasi || 'ADM',
      s.lampiran || '-',
      s.penandatangan || 'Kepala Sekolah',
      s.keterangan || s.statusSurat || 'Terkirim'
    ]);

    exportToExcel(`Buku_Agenda_Surat_Keluar_${settings.namaSekolah.replace(/\s+/g, '_')}`, headers, rows);
    notifyMessage('Buku Agenda Surat Keluar Diekspor ke Excel');
  };

  const handleExportWord = () => {
    const tableRows = filtered
      .map(
        (s, idx) => `<tr>
          <td align="center">${idx + 1}</td>
          <td align="center"><b>${s.nomorAgenda || `SK-00${idx + 1}`}</b></td>
          <td><b>${s.nomorSurat}</b></td>
          <td align="center">${s.tanggalSurat}</td>
          <td>${s.penerima}</td>
          <td>${s.perihal}</td>
          <td align="center">${s.klasifikasi || 'ADM'}</td>
          <td align="center">${s.lampiran || '-'}</td>
          <td>${s.penandatangan || 'Kepala Sekolah'}</td>
          <td>${s.keterangan || s.statusSurat || 'Terkirim'}</td>
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
        <h3 style="margin:0; text-decoration: underline;">BUKU AGENDA SURAT KELUAR</h3>
        <p style="margin:2px 0; font-size:10pt;">Tahun Pelajaran 2026/2027</p>
      </div>
      <table border="1" cellpadding="5" cellspacing="0" style="width:100%; border-collapse:collapse; font-size:9pt;">
        <thead style="background:#f0f0f0;">
          <tr>
            <th>No</th>
            <th>No. Agenda</th>
            <th>Nomor Surat</th>
            <th>Tgl Surat</th>
            <th>Tujuan Surat</th>
            <th>Perihal</th>
            <th>Klasifikasi</th>
            <th>Lampiran</th>
            <th>Penandatangan</th>
            <th>Keterangan</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    `;

    exportToWord(`Buku_Agenda_Surat_Keluar_${settings.namaSekolah.replace(/\s+/g, '_')}`, content);
    notifyMessage('Buku Agenda Surat Keluar Diekspor ke Word');
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
              placeholder="Cari nomor agenda, nomor surat, tujuan, atau perihal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:border-teal-600 focus:outline-none"
            />
          </div>

          <select
            value={filterKlasifikasi}
            onChange={(e) => setFilterKlasifikasi(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 cursor-pointer focus:border-teal-600 focus:outline-none"
          >
            <option value="Semua">Semua Klasifikasi</option>
            <option value="ADM">ADM (Administrasi)</option>
            <option value="UND">UND (Undangan)</option>
            <option value="KUR">KUR (Kurikulum)</option>
            <option value="KEPEG">KEPEG (Kepegawaian)</option>
            <option value="SIS">SIS (Kesiswaan)</option>
            <option value="BOS">BOS (Keuangan)</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onAddNew}
            className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Surat Keluar</span>
          </button>

          <button
            type="button"
            onClick={() => triggerPrint()}
            className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            title="Cetak Buku Agenda Surat Keluar"
          >
            <Printer className="w-3.5 h-3.5 text-teal-700" />
            <span>Print</span>
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            title="Ekspor ke Excel"
          >
            <Download className="w-3.5 h-3.5 text-teal-700" />
            <span>Excel</span>
          </button>

          <button
            type="button"
            onClick={handleExportWord}
            className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            title="Ekspor ke Word"
          >
            <FileText className="w-3.5 h-3.5 text-blue-700" />
            <span>Word</span>
          </button>
        </div>
      </div>

      {/* Table Agenda Surat Keluar (C) */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-3 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="font-bold text-xs uppercase text-slate-800">
              C. Tabel Agenda Surat Keluar Sekolah
            </h4>
            <p className="text-[11px] text-slate-500">
              Pencatatan Seluruh Surat Dinas Resmi yang Diterbitkan ({filtered.length} Berkas Keluar)
            </p>
          </div>
          <span className="text-[11px] font-bold text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-full">
            Format Resmi Tata Naskah
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold uppercase text-[11px]">
              <tr>
                <th className="p-2.5 w-10 text-center">No</th>
                <th className="p-2.5 w-24 text-center">Nomor Agenda</th>
                <th className="p-2.5">Nomor Surat</th>
                <th className="p-2.5 w-24 text-center">Tgl Surat</th>
                <th className="p-2.5">Tujuan Surat</th>
                <th className="p-2.5">Perihal</th>
                <th className="p-2.5 w-20 text-center">Klasifikasi</th>
                <th className="p-2.5 w-20 text-center">Lampiran</th>
                <th className="p-2.5">Penandatangan</th>
                <th className="p-2.5 w-24 text-center">Keterangan</th>
                <th className="p-2.5 w-36 text-center no-print">Aksi & Surat Resmi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-slate-400">
                    Tidak ada data surat keluar yang sesuai filter atau pencarian.
                  </td>
                </tr>
              ) : (
                filtered.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-2.5 text-center font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-2.5 text-center">
                      <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {s.nomorAgenda || `SK-${String(idx + 1).padStart(3, '0')}`}
                      </span>
                    </td>
                    <td className="p-2.5 font-bold font-mono text-slate-900">{s.nomorSurat}</td>
                    <td className="p-2.5 text-center text-slate-600 whitespace-nowrap">{s.tanggalSurat}</td>
                    <td className="p-2.5 font-semibold text-slate-800">{s.penerima}</td>
                    <td className="p-2.5 font-medium text-slate-900 max-w-xs">{s.perihal}</td>
                    <td className="p-2.5 text-center">
                      <span className="font-bold text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-300">
                        {s.klasifikasi || 'ADM'}
                      </span>
                    </td>
                    <td className="p-2.5 text-center text-slate-600">{s.lampiran || '-'}</td>
                    <td className="p-2.5 text-slate-700 font-medium">{s.penandatangan || 'Kepala Sekolah'}</td>
                    <td className="p-2.5 text-center">
                      <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                        {s.keterangan || s.statusSurat || 'Terkirim'}
                      </span>
                    </td>
                    <td className="p-2.5 text-center no-print">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onOpenSuratDinas(s)}
                          className="px-2 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded font-bold text-[11px] flex items-center gap-1 cursor-pointer shadow-2xs transition-colors"
                          title="Cetak Format D: Surat Keluar Resmi Sekolah"
                        >
                          <Send className="w-3 h-3 text-teal-200" />
                          <span>Cetak Resmi</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onEdit(s)}
                          className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 cursor-pointer"
                          title="Edit Surat Keluar"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (safeConfirm(`Hapus surat keluar nomor ${s.nomorSurat}?`)) {
                              onDelete(s.id);
                            }
                          }}
                          className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded border border-rose-200 cursor-pointer"
                          title="Hapus Surat"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
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
