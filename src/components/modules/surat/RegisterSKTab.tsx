import React, { useState } from 'react';
import { SuratDocument, SchoolSettings } from '../../../types';
import { Plus, Search, FileCheck, Printer, Edit2, Trash2, Download } from 'lucide-react';
import { exportToExcel, exportToWord, triggerPrint, safeConfirm } from '../../../utils/exportHelpers';

interface RegisterSKTabProps {
  suratList: SuratDocument[];
  onAddNew: () => void;
  onEdit: (surat: SuratDocument) => void;
  onDelete: (id: string) => void;
  onOpenSKResmi: (surat: SuratDocument) => void;
  settings: SchoolSettings;
  notifyMessage: (msg?: string) => void;
}

export const RegisterSKTab: React.FC<RegisterSKTabProps> = ({
  suratList,
  onAddNew,
  onEdit,
  onDelete,
  onOpenSKResmi,
  settings,
  notifyMessage
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');

  // Filter SK documents
  const skDocs = suratList.filter(
    s =>
      s.jenisSurat === 'Surat Keputusan Kepala Sekolah' ||
      (s.nomorSurat && s.nomorSurat.includes('/SK/')) ||
      (s.perihal && s.perihal.toLowerCase().startsWith('sk ')) ||
      (s.perihal && s.perihal.toLowerCase().includes('surat keputusan'))
  );

  const filtered = skDocs.filter(s => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      (s.nomorSurat || '').toLowerCase().includes(q) ||
      (s.perihal || '').toLowerCase().includes(q) ||
      (s.skTentang || '').toLowerCase().includes(q) ||
      (s.sasaranSk || '').toLowerCase().includes(q) ||
      (s.pejabatPenetap || '').toLowerCase().includes(q);

    const matchStatus = statusFilter === 'Semua' || (s.statusSurat || s.keterangan || 'Berlaku') === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleExportExcel = () => {
    const headers = [
      'No',
      'Nomor SK',
      'Tanggal SK',
      'Tentang / Perihal SK',
      'Pejabat Penetap',
      'Sasaran SK',
      'Masa Berlaku',
      'Keterangan / Status'
    ];

    const rows = filtered.map((s, idx) => [
      idx + 1,
      s.nomorSurat,
      s.tanggalSurat,
      s.skTentang || s.perihal,
      s.pejabatPenetap || 'Kepala Sekolah',
      s.sasaranSk || 'Warga Sekolah',
      s.masaBerlakuSk || '2026/2027',
      s.statusSurat || s.keterangan || 'Berlaku'
    ]);

    exportToExcel(`Register_Surat_Keputusan_SK_${settings.namaSekolah.replace(/\s+/g, '_')}`, headers, rows);
    notifyMessage('Register SK Diekspor ke Excel');
  };

  const handleExportWord = () => {
    const tableRows = filtered
      .map(
        (s, idx) => `<tr>
          <td align="center">${idx + 1}</td>
          <td><b>${s.nomorSurat}</b></td>
          <td align="center">${s.tanggalSurat}</td>
          <td>${s.skTentang || s.perihal}</td>
          <td>${s.pejabatPenetap || 'Kepala Sekolah'}</td>
          <td>${s.sasaranSk || 'Warga Sekolah'}</td>
          <td align="center">${s.masaBerlakuSk || '2026/2027'}</td>
          <td align="center">${s.statusSurat || s.keterangan || 'Berlaku'}</td>
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
        <h3 style="margin:0; text-decoration: underline;">BUKU REGISTER SURAT KEPUTUSAN (SK) KEPALA SEKOLAH</h3>
        <p style="margin:2px 0; font-size:10pt;">Tahun Pelajaran 2026/2027</p>
      </div>
      <table border="1" cellpadding="5" cellspacing="0" style="width:100%; border-collapse:collapse; font-size:9pt;">
        <thead style="background:#f0f0f0;">
          <tr>
            <th>No</th>
            <th>Nomor SK</th>
            <th>Tanggal SK</th>
            <th>Tentang</th>
            <th>Pejabat Penetap</th>
            <th>Sasaran SK</th>
            <th>Masa Berlaku</th>
            <th>Keterangan</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    `;

    exportToWord(`Register_SK_${settings.namaSekolah.replace(/\s+/g, '_')}`, content);
    notifyMessage('Register SK Diekspor ke Word');
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
              placeholder="Cari nomor SK, perihal tentang, atau sasaran SK..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 cursor-pointer focus:border-indigo-600 focus:outline-none"
          >
            <option value="Semua">Semua Status</option>
            <option value="Berlaku">Berlaku</option>
            <option value="Selesai">Selesai</option>
            <option value="Diperpanjang">Diperpanjang</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onAddNew}
            className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah SK Baru</span>
          </button>

          <button
            type="button"
            onClick={() => triggerPrint()}
            className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-700" />
            <span>Print Register</span>
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-indigo-700" />
            <span>Excel</span>
          </button>

          <button
            type="button"
            onClick={handleExportWord}
            className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <FileCheck className="w-3.5 h-3.5 text-blue-700" />
            <span>Word</span>
          </button>
        </div>
      </div>

      {/* Table Register SK (F) */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-3 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="font-bold text-xs uppercase text-slate-800">
              F. Format Register Surat Keputusan (SK) Kepala Sekolah
            </h4>
            <p className="text-[11px] text-slate-500">
              Koleksi SK Penetapan Tugas, Tim BOS, Kurikulum, dan PPDB ({filtered.length} SK Ditetapkan)
            </p>
          </div>
          <span className="text-[11px] font-bold text-indigo-800 bg-indigo-100 px-2.5 py-0.5 rounded-full">
            Format F & G Surat Keputusan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold uppercase text-[11px]">
              <tr>
                <th className="p-2.5 w-10 text-center">No</th>
                <th className="p-2.5">Nomor SK</th>
                <th className="p-2.5 w-24 text-center">Tanggal SK</th>
                <th className="p-2.5">Tentang</th>
                <th className="p-2.5 w-32">Pejabat Penetap</th>
                <th className="p-2.5">Sasaran SK</th>
                <th className="p-2.5 w-24 text-center">Masa Berlaku</th>
                <th className="p-2.5 w-24 text-center">Keterangan</th>
                <th className="p-2.5 w-36 text-center no-print">Aksi & Format Resmi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    Belum ada data Surat Keputusan (SK) yang terdaftar.
                  </td>
                </tr>
              ) : (
                filtered.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-2.5 text-center font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-2.5 font-bold font-mono text-indigo-950">{s.nomorSurat}</td>
                    <td className="p-2.5 text-center text-slate-700 whitespace-nowrap">{s.tanggalSurat}</td>
                    <td className="p-2.5 font-bold text-slate-900 max-w-sm">
                      {s.skTentang || s.perihal}
                    </td>
                    <td className="p-2.5 text-slate-700 font-medium">{s.pejabatPenetap || 'Kepala Sekolah'}</td>
                    <td className="p-2.5 text-slate-800">{s.sasaranSk || 'Guru & Tenaga Kependidikan'}</td>
                    <td className="p-2.5 text-center text-slate-700 font-medium">{s.masaBerlakuSk || '2026/2027'}</td>
                    <td className="p-2.5 text-center">
                      <span className="text-[10px] font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                        {s.statusSurat || s.keterangan || 'Berlaku'}
                      </span>
                    </td>
                    <td className="p-2.5 text-center no-print">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onOpenSKResmi(s)}
                          className="px-2 py-1 bg-indigo-700 hover:bg-indigo-800 text-white rounded font-bold text-[11px] flex items-center gap-1 cursor-pointer shadow-2xs transition-colors"
                          title="Cetak Format G: Naskah SK Resmi & Lampiran"
                        >
                          <FileCheck className="w-3 h-3 text-indigo-200" />
                          <span>Cetak SK</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onEdit(s)}
                          className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 cursor-pointer"
                          title="Edit SK"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (safeConfirm(`Hapus SK nomor ${s.nomorSurat}?`)) {
                              onDelete(s.id);
                            }
                          }}
                          className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded border border-rose-200 cursor-pointer"
                          title="Hapus SK"
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
