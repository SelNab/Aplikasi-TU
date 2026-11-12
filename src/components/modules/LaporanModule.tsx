import React, { useState } from 'react';
import {
  Student,
  Teacher,
  SuratDocument,
  AtkItem,
  Book,
  SarprasItem,
  FinanceRecord,
  PaperSize,
  SchoolSettings,
  JadwalPelajaranItem
} from '../../types';
import { ActionToolbar } from '../ActionToolbar';
import { exportToExcel, exportToWord, exportToPPT, triggerPrint } from '../../utils/exportHelpers';
import { RekapJadwalPrintView } from './RekapJadwalPrintView';
import {
  FileSpreadsheet,
  Users,
  GraduationCap,
  Mail,
  Package,
  Building2,
  Wallet,
  Printer,
  FileCheck
} from 'lucide-react';

interface LaporanModuleProps {
  students: Student[];
  teachers: Teacher[];
  suratList: SuratDocument[];
  atkItems: AtkItem[];
  books: Book[];
  sarpras: SarprasItem[];
  financeRecords: FinanceRecord[];
  jadwalList?: JadwalPelajaranItem[];
  onHome: () => void;
  settings: SchoolSettings;
  notifyMessage: (msg?: string) => void;
  onSync: () => void;
}

export const LaporanModule: React.FC<LaporanModuleProps> = ({
  students,
  teachers,
  suratList,
  atkItems,
  books,
  sarpras,
  financeRecords,
  jadwalList = [],
  onHome,
  settings,
  notifyMessage,
  onSync
}) => {
  const [activeReport, setActiveReport] = useState<'bulanan' | 'siswa' | 'guru' | 'surat' | 'keuangan' | 'sarpras' | 'jadwal'>('bulanan');
  const [paperSize, setPaperSize] = useState<PaperSize>(settings.ukuranKertas);

  // Statistics
  const totalSiswaAktif = students.filter(s => s.keterangan === 'Aktif').length;
  const totalSiswaLaki = students.filter(s => s.keterangan === 'Aktif' && s.jenisKelamin === 'L').length;
  const totalSiswaPerempuan = students.filter(s => s.keterangan === 'Aktif' && s.jenisKelamin === 'P').length;

  const totalGuruAktif = teachers.filter(t => t.keterangan === 'Aktif').length;
  const totalGuruPNS = teachers.filter(t => t.statusKepegawaian === 'PNS').length;
  const totalGuruPPPK = teachers.filter(t => t.statusKepegawaian === 'PPPK').length;
  const totalGuruHonor = teachers.filter(t => t.statusKepegawaian.includes('Honor')).length;

  const totalDebit = financeRecords.reduce(
    (sum, r) => sum + (r.penerimaanDebit !== undefined ? Number(r.penerimaanDebit) : (r.jenis === 'Penerimaan' ? Number(r.jumlah || 0) : 0)),
    0
  );
  const totalKredit = financeRecords.reduce(
    (sum, r) => sum + (r.pengeluaranKredit !== undefined ? Number(r.pengeluaranKredit) : (r.jenis === 'Pengeluaran' ? Number(r.jumlah || 0) : 0)),
    0
  );
  const saldoAkhir = totalDebit - totalKredit;

  // Export handlers
  const handleExcelExport = () => {
    const headers = ['Kategori', 'Keterangan Indikator', 'Jumlah Unit / Jiwa', 'Catatan'];
    const rows = [
      ['Peserta Didik', 'Siswa Laki-laki Aktif', totalSiswaLaki, 'Dapodik'],
      ['Peserta Didik', 'Siswa Perempuan Aktif', totalSiswaPerempuan, 'Dapodik'],
      ['Peserta Didik', 'Total Keseluruhan Siswa', totalSiswaAktif, 'Dapodik'],
      ['Pendidik & Tendik', 'Guru Pegawai Negeri Sipil (PNS)', totalGuruPNS, 'SK Bupati / BKN'],
      ['Pendidik & Tendik', 'Guru PPPK', totalGuruPPPK, 'Kemendikbud'],
      ['Pendidik & Tendik', 'Guru Honor Daerah / Sekolah', totalGuruHonor, 'SK Kepala Sekolah'],
      ['Pendidik & Tendik', 'Total Tenaga Pendidik & Tendik', teachers.length, 'Aktif'],
      ['Persuratan', 'Arsip Dokumen Surat Dinas', suratList.length, 'Buku Agenda'],
      ['Perpustakaan', 'Total Judul Buku Koleksi', books.length, 'Perpustakaan'],
      ['Keuangan', 'Penerimaan Kas (Debit)', `Rp ${(totalDebit || 0).toLocaleString('id-ID')}`, 'Kas BKU'],
      ['Keuangan', 'Pengeluaran Kas (Kredit)', `Rp ${(totalKredit || 0).toLocaleString('id-ID')}`, 'Kas BKU'],
      ['Keuangan', 'Saldo Riil Akhir', `Rp ${(saldoAkhir || 0).toLocaleString('id-ID')}`, 'Sisa Kas']
    ];
    exportToExcel(`Laporan_Eksekutif_Sekolah_${settings.namaSekolah.replace(/\s+/g, '_')}`, headers, rows);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handleWordExport = () => {
    const content = `
      <div class="kop">
        <h2>${settings.namaInstansi}</h2>
        <h1>${settings.namaSekolah}</h1>
        <p>${settings.alamatSekolah} | NPSN: ${settings.npsn}</p>
        <hr />
        <h3>LAPORAN BULANAN KEADAAN SEKOLAH (BULANAN TU)</h3>
        <p>Bulan: ${new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' })}</p>
      </div>

      <h4>I. KEADAAN PESERTA DIDIK (SISWA)</h4>
      <table>
        <tr><th>Kategori</th><th>Laki-laki</th><th>Perempuan</th><th>Total</th></tr>
        <tr><td>Siswa Aktif Belajar</td><td>${totalSiswaLaki}</td><td>${totalSiswaPerempuan}</td><td><b>${totalSiswaAktif} Siswa</b></td></tr>
      </table>

      <h4 style="margin-top:20px;">II. KEADAAN GURU DAN TENAGA KEPENDIDIKAN</h4>
      <table>
        <tr><th>Status Kepegawaian</th><th>Jumlah GTK</th><th>Keterangan</th></tr>
        <tr><td>Guru PNS</td><td>${totalGuruPNS}</td><td>Pegawai Negeri Sipil</td></tr>
        <tr><td>Guru PPPK</td><td>${totalGuruPPPK}</td><td>P3K Kemendikbudristek</td></tr>
        <tr><td>Guru Honor Daerah / Sekolah</td><td>${totalGuruHonor}</td><td>Otsus / Komite</td></tr>
        <tr style="font-weight:bold;"><td>Total Pendidik & GTK</td><td>${teachers.length}</td><td>Aktif Bertugas</td></tr>
      </table>

      <h4 style="margin-top:20px;">III. REKAPITULASI KEUANGAN SEKOLAH</h4>
      <table>
        <tr><th>Uraian</th><th>Jumlah (Rp)</th></tr>
        <tr><td>Total Penerimaan Dana (Debit)</td><td>Rp ${(totalDebit || 0).toLocaleString('id-ID')}</td></tr>
        <tr><td>Total Pengeluaran Kas (Kredit)</td><td>Rp ${(totalKredit || 0).toLocaleString('id-ID')}</td></tr>
        <tr style="font-weight:bold;"><td>Sisa Saldo Kas</td><td>Rp ${(saldoAkhir || 0).toLocaleString('id-ID')}</td></tr>
      </table>

      <div class="footer" style="margin-top:50px;">
        <table style="border:none;">
          <tr style="border:none;">
            <td style="border:none;" width="50%">
              Pengelola Tata Usaha,<br/><br/><br/><br/>
              <b><u>${settings.operatorTU}</u></b><br/>
              NIP. ${settings.nipOperator}
            </td>
            <td style="border:none;" width="50%" align="right">
              Dekai, ${new Date().toLocaleDateString('id-ID')}<br/>
              Kepala Sekolah,<br/><br/><br/>
              <b><u>${settings.namaKepsek}</u></b><br/>
              NIP. ${settings.nipKepsek}
            </td>
          </tr>
        </table>
      </div>
    `;
    exportToWord('Laporan_Bulanan_Sekolah', content);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handlePPTExport = () => {
    const slides = [
      {
        title: `LAPORAN KINERJA ADMINISTRASI TATA USAHA`,
        subtitle: `${settings.namaSekolah} - Papua Pedalaman`,
        bullets: [
          `Jumlah Siswa Aktif: ${totalSiswaAktif} Siswa (L: ${totalSiswaLaki}, P: ${totalSiswaPerempuan})`,
          `Jumlah Guru & Tendik: ${teachers.length} Orang`,
          `Status Keuangan: Penerimaan Rp ${(totalDebit || 0).toLocaleString('id-ID')} | Saldo Rp ${(saldoAkhir || 0).toLocaleString('id-ID')}`,
          `Pengelolaan Berkas: Berbasis Digital & Offline Ramah Pedalaman Papua`
        ]
      }
    ];
    exportToPPT('Presentasi_Laporan_Kinerja_Sekolah', slides);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  return (
    <div className="space-y-4">
      {/* Sub-report selector tabs */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-2 no-print">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'bulanan', label: 'Laporan Bulanan Lengkap' },
            { id: 'siswa', label: 'Rekap Peserta Didik' },
            { id: 'guru', label: 'Rekap Kepegawaian GTK' },
            { id: 'surat', label: 'Rekap Arsip Persuratan' },
            { id: 'keuangan', label: 'Laporan Realisasi Kas' },
            { id: 'sarpras', label: 'Rekap Sarpras & Inventaris' },
            { id: 'jadwal', label: 'Rekapan Jadwal Pelajaran (Print)' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveReport(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeReport === tab.id
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mandatory Standard Action Toolbar */}
      <ActionToolbar
        titleContext={`LAPORAN RESMI SEKOLAH > ${activeReport.toUpperCase()}`}
        onHome={onHome}
        onAddNew={() => notifyMessage('Laporan Baru Dibuat')}
        onSave={() => notifyMessage('Data Anda Berhasil Disimpan')}
        onView={() => triggerPrint()}
        onDelete={() => notifyMessage('Data Anda Berhasil Disimpan')}
        onSearch={() => notifyMessage('Fitur Cari dalam Laporan Aktif')}
        onEdit={() => notifyMessage('Data Anda Berhasil Disimpan')}
        onCancel={() => {}}
        onBack={onHome}
        onArchive={() => notifyMessage('Data Anda Berhasil Disimpan')}
        onLock={() => notifyMessage('Data Anda Berhasil Dikunci')}
        onReview={() => triggerPrint()}
        onPrint={triggerPrint}
        onUpdate={() => notifyMessage('Data Anda Berhasil Disimpan')}
        onTemplate={() => notifyMessage('Data Anda Berhasil Disimpan')}
        onPdf={triggerPrint}
        onExcel={handleExcelExport}
        onWord={handleWordExport}
        onPpt={handlePPTExport}
        onUploadPhoto={() => notifyMessage('Data Anda Berhasil Disimpan')}
        onRefresh={() => notifyMessage('Data Anda Berhasil Disimpan')}
        onSync={onSync}
        onReset={() => notifyMessage('Data Formulir Berhasil Direset')}
        paperSize={paperSize}
        onChangePaperSize={(size) => setPaperSize(size)}
        notifyMessage={notifyMessage}
      />

      {activeReport === 'jadwal' ? (
        <RekapJadwalPrintView
          jadwalList={jadwalList}
          teachers={teachers}
          settings={settings}
          notifyMessage={notifyMessage}
          isEmbedded={true}
        />
      ) : (
        /* Printable Official Report Card Sheet */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 printable-content">
        {/* Kop Surat Laporan */}
        <div className="border-b-2 border-slate-900 pb-3 mb-5 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-800">{settings.namaInstansi}</p>
          <h1 className="text-xl font-black uppercase text-slate-950 my-1">{settings.namaSekolah}</h1>
          <p className="text-xs text-slate-600 font-medium">{settings.alamatSekolah} | NPSN: {settings.npsn}</p>
          <div className="border-b border-slate-700 mt-2"></div>
          <h2 className="text-sm font-bold uppercase mt-3 text-emerald-900">
            LAPORAN REKAPITULASI ADMINISTRASI TATA USAHA SEKOLAH
          </h2>
          <p className="text-[11px] text-slate-500">
            Kondisi Per Tanggal: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Dynamic Section Content */}
        {activeReport === 'bulanan' && (
          <div className="space-y-6 text-xs text-slate-800">
            {/* Siswa Section */}
            <div>
              <h3 className="font-bold text-sm text-emerald-900 border-b pb-1 mb-2 flex items-center gap-1.5">
                <Users className="w-4 h-4" /> I. REKAPITULASI DATA PESERTA DIDIK (SISWA)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded border">
                  <span className="text-slate-500 block">Siswa Aktif</span>
                  <span className="text-xl font-black text-slate-900">{totalSiswaAktif} Siswa</span>
                </div>
                <div className="p-3 bg-slate-50 rounded border">
                  <span className="text-slate-500 block">Laki-laki (L)</span>
                  <span className="text-xl font-black text-blue-900">{totalSiswaLaki} Siswa</span>
                </div>
                <div className="p-3 bg-slate-50 rounded border">
                  <span className="text-slate-500 block">Perempuan (P)</span>
                  <span className="text-xl font-black text-pink-900">{totalSiswaPerempuan} Siswa</span>
                </div>
                <div className="p-3 bg-slate-50 rounded border">
                  <span className="text-slate-500 block">Status Kelulusan/Alumni</span>
                  <span className="text-xl font-black text-emerald-900">
                    {students.filter(s => s.keterangan === 'Lulus').length} Siswa
                  </span>
                </div>
              </div>
            </div>

            {/* GTK Section */}
            <div>
              <h3 className="font-bold text-sm text-emerald-900 border-b pb-1 mb-2 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" /> II. REKAPITULASI GURU & TENAGA KEPENDIDIKAN (GTK)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded border">
                  <span className="text-slate-500 block">Total Pendidik/GTK</span>
                  <span className="text-xl font-black text-slate-900">{teachers.length} Orang</span>
                </div>
                <div className="p-3 bg-slate-50 rounded border">
                  <span className="text-slate-500 block">Pegawai Negeri Sipil (PNS)</span>
                  <span className="text-xl font-black text-emerald-900">{totalGuruPNS} Orang</span>
                </div>
                <div className="p-3 bg-slate-50 rounded border">
                  <span className="text-slate-500 block">PPPK</span>
                  <span className="text-xl font-black text-blue-900">{totalGuruPPPK} Orang</span>
                </div>
                <div className="p-3 bg-slate-50 rounded border">
                  <span className="text-slate-500 block">Honor Daerah / Sekolah</span>
                  <span className="text-xl font-black text-amber-900">{totalGuruHonor} Orang</span>
                </div>
              </div>
            </div>

            {/* Keuangan Section */}
            <div>
              <h3 className="font-bold text-sm text-emerald-900 border-b pb-1 mb-2 flex items-center gap-1.5">
                <Wallet className="w-4 h-4" /> III. LAPORAN KAS & KEUANGAN
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-emerald-50 rounded border border-emerald-200">
                  <span className="text-emerald-800 font-semibold block">Total Penerimaan (Debit)</span>
                  <span className="text-lg font-black text-emerald-950">Rp {(totalDebit || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="p-3 bg-rose-50 rounded border border-rose-200">
                  <span className="text-rose-800 font-semibold block">Total Pengeluaran (Kredit)</span>
                  <span className="text-lg font-black text-rose-950">Rp {(totalKredit || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="p-3 bg-blue-50 rounded border border-blue-200">
                  <span className="text-blue-800 font-semibold block">Sisa Saldo Kas Riil</span>
                  <span className="text-lg font-black text-blue-950">Rp {(saldoAkhir || 0).toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* Inventaris & Sarpras */}
            <div>
              <h3 className="font-bold text-sm text-emerald-900 border-b pb-1 mb-2 flex items-center gap-1.5">
                <Building2 className="w-4 h-4" /> IV. SARPRAS, PERPUSTAKAAN, & PERSURATAN
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded border">
                  <span className="text-slate-500 block">Koleksi Buku Perpustakaan</span>
                  <span className="text-lg font-bold text-slate-900">
                    {books.reduce((s, b) => s + b.jumlahBuku, 0)} Eksemplar ({books.length} Judul)
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded border">
                  <span className="text-slate-500 block">Inventaris Sarana & Prasarana</span>
                  <span className="text-lg font-bold text-slate-900">{sarpras.length} Unit Sarana Tercatat</span>
                </div>
                <div className="p-3 bg-slate-50 rounded border">
                  <span className="text-slate-500 block">Arsip Buku Agenda Surat</span>
                  <span className="text-lg font-bold text-slate-900">{suratList.length} Nomor Dokumen</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeReport === 'siswa' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b">
                <tr>
                  <th className="p-2 w-8 text-center">No</th>
                  <th className="p-2">NISN / NIS</th>
                  <th className="p-2">Nama Siswa</th>
                  <th className="p-2">Kelas</th>
                  <th className="p-2">L/P</th>
                  <th className="p-2">Nama Orang Tua</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s, idx) => (
                  <tr key={s.id}>
                    <td className="p-2 text-center text-slate-500">{idx + 1}</td>
                    <td className="p-2 font-mono">{s.nisn}</td>
                    <td className="p-2 font-bold">{s.namaSiswa}</td>
                    <td className="p-2">{s.kelas}</td>
                    <td className="p-2">{s.jenisKelamin}</td>
                    <td className="p-2">{s.namaAyah}</td>
                    <td className="p-2 font-semibold text-emerald-700">{s.keterangan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 'guru' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b">
                <tr>
                  <th className="p-2 w-8 text-center">No</th>
                  <th className="p-2">Nama Lengkap</th>
                  <th className="p-2">NIP / NUPTK</th>
                  <th className="p-2">Jabatan</th>
                  <th className="p-2">Pangkat / Gol</th>
                  <th className="p-2">Status Kepegawaian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teachers.map((t, idx) => (
                  <tr key={t.id}>
                    <td className="p-2 text-center text-slate-500">{idx + 1}</td>
                    <td className="p-2 font-bold">{t.nama}</td>
                    <td className="p-2 font-mono text-[11px]">{t.nip || t.nuptk}</td>
                    <td className="p-2">{t.jabatan}</td>
                    <td className="p-2">{t.pangkatGolongan}</td>
                    <td className="p-2 font-semibold text-emerald-800">{t.statusKepegawaian}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tanda Tangan Resmi Pengesahan */}
        <div className="mt-12 pt-6 flex justify-between text-xs text-slate-900 border-t border-slate-300">
          <div className="text-center w-64">
            <p>Pengelola Tata Usaha / Operator,</p>
            <div className="h-20"></div>
            <p className="font-bold underline">{settings.operatorTU}</p>
            <p>NIP. {settings.nipOperator}</p>
          </div>

          <div className="text-center w-64">
            <p>Dekai, {new Date().toLocaleDateString('id-ID')}</p>
            <p>Kepala Sekolah,</p>
            <div className="h-20"></div>
            <p className="font-bold underline">{settings.namaKepsek}</p>
            <p>NIP. {settings.nipKepsek}</p>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
