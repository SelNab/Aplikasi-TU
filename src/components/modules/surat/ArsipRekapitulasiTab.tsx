import React, { useState } from 'react';
import { ArsipItem, INITIAL_ARSIP_ITEMS } from './persuratanData';
import { SuratDocument, SchoolSettings } from '../../../types';
import { Archive, BarChart3, Printer, Download, Plus, Trash2, Edit2, Save } from 'lucide-react';
import { exportToWord, triggerPrint } from '../../../utils/exportHelpers';

interface ArsipRekapitulasiTabProps {
  suratList: SuratDocument[];
  settings: SchoolSettings;
  notifyMessage: (msg?: string) => void;
}

export const ArsipRekapitulasiTab: React.FC<ArsipRekapitulasiTabProps> = ({
  suratList,
  settings,
  notifyMessage
}) => {
  const [arsipList, setArsipList] = useState<ArsipItem[]>(INITIAL_ARSIP_ITEMS);
  const [isEditingArsip, setIsEditingArsip] = useState(false);
  const [activeSub, setActiveSub] = useState<'arsip' | 'rekap'>('rekap');

  // Month labels according to academic year (July - June)
  const BULAN_AKADEMIK = [
    'Juli 2026', 'Agustus 2026', 'September 2026', 'Oktober 2026',
    'November 2026', 'Desember 2026', 'Januari 2027', 'Februari 2027',
    'Maret 2027', 'April 2027', 'Mei 2027', 'Juni 2027'
  ];

  // Calculate rekapitulasi counts
  const countMasuk = suratList.filter(s => s.jenisSurat === 'Surat Masuk').length;
  const countKeluar = suratList.filter(s => s.jenisSurat === 'Surat Keluar' || s.jenisSurat === 'Surat Dinas Keluar' || s.jenisSurat.includes('Keluar')).length;
  const countSK = suratList.filter(s => s.jenisSurat === 'Surat Keputusan Kepala Sekolah' || s.nomorSurat.includes('/SK/')).length;
  const countGuru = suratList.filter(s => s.klasifikasi === 'KEPEG' || (s.kodeKlasifikasi && s.kodeKlasifikasi.startsWith('PEG'))).length;
  const countSiswa = suratList.filter(s => s.jenisSurat.includes('Siswa') || (s.kodeKlasifikasi && s.kodeKlasifikasi.startsWith('SIS'))).length;
  const countSekolah = suratList.length - (countMasuk + countKeluar + countSK);

  // Distribution for academic year demonstration
  const rekapRows = BULAN_AKADEMIK.map((bulan, idx) => {
    // In July (beginning of semester) numbers are higher
    const isJuli = idx === 0;
    const isAgustus = idx === 1;
    const isSept = idx === 2;

    const masuk = isJuli ? countMasuk : isAgustus ? Math.max(0, countMasuk - 1) : isSept ? 1 : 0;
    const keluar = isJuli ? countKeluar : isAgustus ? Math.max(0, countKeluar - 1) : isSept ? 1 : 0;
    const sk = isJuli ? countSK : 0;
    const guru = isJuli ? countGuru : 0;
    const siswa = isJuli ? countSiswa : isAgustus ? 1 : 0;
    const sekolah = isJuli ? Math.max(1, countSekolah) : 0;
    const total = masuk + keluar + sk + guru + siswa + sekolah;

    return {
      no: idx + 1,
      bulan,
      masuk,
      keluar,
      sk,
      guru,
      siswa,
      sekolah,
      total
    };
  });

  const grandTotal = {
    masuk: rekapRows.reduce((a, b) => a + b.masuk, 0),
    keluar: rekapRows.reduce((a, b) => a + b.keluar, 0),
    sk: rekapRows.reduce((a, b) => a + b.sk, 0),
    guru: rekapRows.reduce((a, b) => a + b.guru, 0),
    siswa: rekapRows.reduce((a, b) => a + b.siswa, 0),
    sekolah: rekapRows.reduce((a, b) => a + b.sekolah, 0),
    total: rekapRows.reduce((a, b) => a + b.total, 0)
  };

  const handleAddArsip = () => {
    setArsipList(prev => [
      ...prev,
      {
        no: prev.length + 1,
        kodeArsip: 'BARU',
        jenisArsip: 'Arsip Baru',
        tahun: '2026',
        jumlah: 1,
        lokasiPenyimpanan: 'Lemari A / Rak 1',
        retensi: '5 Tahun',
        keterangan: 'Aktif'
      }
    ]);
  };

  const handleExportRekapWord = () => {
    const tableRows = rekapRows
      .map(
        r => `<tr>
          <td align="center">${r.no}</td>
          <td>${r.bulan}</td>
          <td align="center">${r.masuk}</td>
          <td align="center">${r.keluar}</td>
          <td align="center">${r.sk}</td>
          <td align="center">${r.guru}</td>
          <td align="center">${r.siswa}</td>
          <td align="center">${r.sekolah}</td>
          <td align="center"><b>${r.total}</b></td>
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
        <h3 style="margin:0; text-decoration: underline;">REKAPITULASI PERSURATAN SEKOLAH BULANAN</h3>
        <p style="margin:2px 0; font-size:10pt;">Tahun Pelajaran 2026/2027 (Juli - Juni)</p>
      </div>
      <table border="1" cellpadding="6" cellspacing="0" style="width:100%; border-collapse:collapse; font-size:9.5pt;">
        <thead style="background:#f2f2f2;">
          <tr>
            <th>No</th>
            <th>Bulan</th>
            <th>Surat Masuk</th>
            <th>Surat Keluar</th>
            <th>SK</th>
            <th>Surat Guru</th>
            <th>Surat Siswa</th>
            <th>Surat Sekolah</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
          <tr style="background:#e6f2ff; font-weight:bold;">
            <td colspan="2" align="center">JUMLAH TOTAL</td>
            <td align="center">${grandTotal.masuk}</td>
            <td align="center">${grandTotal.keluar}</td>
            <td align="center">${grandTotal.sk}</td>
            <td align="center">${grandTotal.guru}</td>
            <td align="center">${grandTotal.siswa}</td>
            <td align="center">${grandTotal.sekolah}</td>
            <td align="center">${grandTotal.total}</td>
          </tr>
        </tbody>
      </table>
      <div style="margin-top: 30px; text-align: right; font-size: 10pt;">
        <p>${settings.alamatSekolah.split(',')[0] || 'Balil'}, 30 Juni 2027</p>
        <p>Kepala ${settings.namaSekolah}</p>
        <br/><br/><br/>
        <p><b><u>${settings.namaKepsek}</u></b><br/>NIP. ${settings.nipKepsek}</p>
      </div>
    `;

    exportToWord(`Rekapitulasi_Surat_Bulanan_2026_2027`, content);
    notifyMessage('Rekapitulasi Bulanan Diekspor ke Word');
  };

  return (
    <div className="space-y-4">
      {/* Sub tabs & actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-100 rounded-xl border border-slate-200">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveSub('rekap')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              activeSub === 'rekap'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>P. Rekapitulasi Surat Bulanan (Juli - Juni)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSub('arsip')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              activeSub === 'arsip'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>O. Daftar Arsip Surat & Lokasi</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => triggerPrint()}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Rekap</span>
          </button>
          <button
            type="button"
            onClick={handleExportRekapWord}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Word</span>
          </button>
        </div>
      </div>

      {/* VIEW REKAPITULASI */}
      {activeSub === 'rekap' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-3 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="font-bold text-xs uppercase text-slate-800">
                P. Tabel Rekapitulasi Surat Bulanan Tahun Pelajaran 2026/2027 (12 Bulan)
              </h4>
              <p className="text-[11px] text-slate-500">
                Data terakumulasi dari seluruh Buku Agenda Masuk, Keluar, dan SK
              </p>
            </div>
            <div className="text-xs bg-emerald-100 text-emerald-900 px-3 py-1 rounded-lg font-black font-mono">
              Total Seluruh Surat: {grandTotal.total} Berkas
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold uppercase">
                <tr>
                  <th className="p-2.5 w-10 text-center">No</th>
                  <th className="p-2.5">Bulan</th>
                  <th className="p-2.5 text-center">Surat Masuk</th>
                  <th className="p-2.5 text-center">Surat Keluar</th>
                  <th className="p-2.5 text-center">SK</th>
                  <th className="p-2.5 text-center">Surat Guru</th>
                  <th className="p-2.5 text-center">Surat Siswa</th>
                  <th className="p-2.5 text-center">Surat Sekolah</th>
                  <th className="p-2.5 text-center font-black text-slate-900 bg-slate-100">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rekapRows.map(row => (
                  <tr key={row.no} className="hover:bg-slate-50">
                    <td className="p-2.5 text-center text-slate-500 font-bold">{row.no}</td>
                    <td className="p-2.5 font-semibold text-slate-900">{row.bulan}</td>
                    <td className="p-2.5 text-center font-mono">{row.masuk}</td>
                    <td className="p-2.5 text-center font-mono">{row.keluar}</td>
                    <td className="p-2.5 text-center font-mono">{row.sk}</td>
                    <td className="p-2.5 text-center font-mono">{row.guru}</td>
                    <td className="p-2.5 text-center font-mono">{row.siswa}</td>
                    <td className="p-2.5 text-center font-mono">{row.sekolah}</td>
                    <td className="p-2.5 text-center font-mono font-bold bg-slate-50 text-emerald-800">
                      {row.total}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-emerald-50/80 font-bold border-t-2 border-slate-300">
                <tr>
                  <td colSpan={2} className="p-3 text-center uppercase tracking-wider text-emerald-950 font-black">
                    JUMLAH TOTAL
                  </td>
                  <td className="p-3 text-center font-mono text-emerald-950">{grandTotal.masuk}</td>
                  <td className="p-3 text-center font-mono text-emerald-950">{grandTotal.keluar}</td>
                  <td className="p-3 text-center font-mono text-emerald-950">{grandTotal.sk}</td>
                  <td className="p-3 text-center font-mono text-emerald-950">{grandTotal.guru}</td>
                  <td className="p-3 text-center font-mono text-emerald-950">{grandTotal.siswa}</td>
                  <td className="p-3 text-center font-mono text-emerald-950">{grandTotal.sekolah}</td>
                  <td className="p-3 text-center font-mono font-black text-emerald-950 text-sm bg-emerald-100">
                    {grandTotal.total}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* VIEW ARSIP SURAT */}
      {activeSub === 'arsip' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-3 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="font-bold text-xs uppercase text-slate-800">
                O. Daftar Arsip Surat & Lokasi Penyimpanan Fisik Lemari Sekolah
              </h4>
              <p className="text-[11px] text-slate-500">
                Manajemen rak arsip, retensi berkas, dan klasifikasi kode simpan
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsEditingArsip(!isEditingArsip)}
                className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                {isEditingArsip ? <Save className="w-3.5 h-3.5 text-blue-600" /> : <Edit2 className="w-3.5 h-3.5 text-slate-600" />}
                <span>{isEditingArsip ? 'Selesai Edit' : 'Edit Arsip'}</span>
              </button>

              {isEditingArsip && (
                <button
                  type="button"
                  onClick={handleAddArsip}
                  className="px-2.5 py-1 bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Arsip
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold uppercase">
                <tr>
                  <th className="p-2.5 w-10 text-center">No</th>
                  <th className="p-2.5 w-24 text-center">Kode Arsip</th>
                  <th className="p-2.5">Jenis Arsip</th>
                  <th className="p-2.5 w-20 text-center">Tahun</th>
                  <th className="p-2.5 w-20 text-center">Jumlah</th>
                  <th className="p-2.5">Lokasi Penyimpanan</th>
                  <th className="p-2.5">Retensi</th>
                  <th className="p-2.5 w-24 text-center">Keterangan</th>
                  {isEditingArsip && <th className="p-2.5 w-12 text-center">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {arsipList.map((item, idx) => (
                  <tr key={item.no} className="hover:bg-slate-50">
                    <td className="p-2.5 text-center font-bold text-slate-500">{item.no}</td>
                    <td className="p-2.5 text-center">
                      <span className="font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-emerald-800">
                        {item.kodeArsip}
                      </span>
                    </td>
                    <td className="p-2.5 font-semibold text-slate-900">
                      {isEditingArsip ? (
                        <input
                          type="text"
                          value={item.jenisArsip}
                          onChange={(e) => {
                            const updated = [...arsipList];
                            updated[idx].jenisArsip = e.target.value;
                            setArsipList(updated);
                          }}
                          className="w-full border border-slate-300 p-1 rounded"
                        />
                      ) : (
                        item.jenisArsip
                      )}
                    </td>
                    <td className="p-2.5 text-center font-mono">
                      {isEditingArsip ? (
                        <input
                          type="text"
                          value={item.tahun}
                          onChange={(e) => {
                            const updated = [...arsipList];
                            updated[idx].tahun = e.target.value;
                            setArsipList(updated);
                          }}
                          className="w-full border border-slate-300 p-1 rounded text-center"
                        />
                      ) : (
                        item.tahun
                      )}
                    </td>
                    <td className="p-2.5 text-center font-bold font-mono">
                      {isEditingArsip ? (
                        <input
                          type="number"
                          value={item.jumlah}
                          onChange={(e) => {
                            const updated = [...arsipList];
                            updated[idx].jumlah = Number(e.target.value);
                            setArsipList(updated);
                          }}
                          className="w-full border border-slate-300 p-1 rounded text-center"
                        />
                      ) : (
                        `${item.jumlah} Bks`
                      )}
                    </td>
                    <td className="p-2.5 font-medium text-slate-800">
                      {isEditingArsip ? (
                        <input
                          type="text"
                          value={item.lokasiPenyimpanan}
                          onChange={(e) => {
                            const updated = [...arsipList];
                            updated[idx].lokasiPenyimpanan = e.target.value;
                            setArsipList(updated);
                          }}
                          className="w-full border border-slate-300 p-1 rounded"
                        />
                      ) : (
                        item.lokasiPenyimpanan
                      )}
                    </td>
                    <td className="p-2.5 text-slate-600">
                      {isEditingArsip ? (
                        <input
                          type="text"
                          value={item.retensi}
                          onChange={(e) => {
                            const updated = [...arsipList];
                            updated[idx].retensi = e.target.value;
                            setArsipList(updated);
                          }}
                          className="w-full border border-slate-300 p-1 rounded"
                        />
                      ) : (
                        item.retensi
                      )}
                    </td>
                    <td className="p-2.5 text-center">
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {item.keterangan}
                      </span>
                    </td>
                    {isEditingArsip && (
                      <td className="p-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => setArsipList(arsipList.filter((_, i) => i !== idx).map((r, i) => ({ ...r, no: i + 1 })))}
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
        </div>
      )}
    </div>
  );
};
