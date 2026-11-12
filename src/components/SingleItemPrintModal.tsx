import React, { useState, useEffect } from 'react';
import { SchoolSettings, PaperSize } from '../types';
import { triggerPrint, exportToWord } from '../utils/exportHelpers';
import { Printer, X, Download, FileText, CheckCircle2, User, Sparkles, Building2, Package, DollarSign, BookOpen, ShieldCheck, Mail, FolderArchive } from 'lucide-react';
import { KopSurat } from './KopSurat';

export type SinglePrintItemType =
  | 'siswa'
  | 'guru'
  | 'surat'
  | 'atk'
  | 'perpus_buku'
  | 'perpus_pinjam'
  | 'sarpras'
  | 'keuangan'
  | 'arsip'
  | 'jadwal_piket'
  | 'jadwal_pelajaran'
  | 'kurikulum'
  | 'kalender'
  | 'absen_siswa'
  | 'absen_guru';

export interface SinglePrintModalData {
  type: SinglePrintItemType;
  title: string;
  data: any;
  customNumber?: string;
  customDate?: string;
}

interface SingleItemPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  printData: SinglePrintModalData | null;
  settings: SchoolSettings;
  notifyMessage?: (msg?: string) => void;
}

export const SingleItemPrintModal: React.FC<SingleItemPrintModalProps> = ({
  isOpen,
  onClose,
  printData,
  settings,
  notifyMessage
}) => {
  const [paperSize, setPaperSize] = useState<PaperSize>(settings.ukuranKertas || 'F4');
  const [tanggalDokumen, setTanggalDokumen] = useState<string>(() => {
    return new Date().toISOString().slice(0, 10);
  });

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('printing-single');
    } else {
      document.body.classList.remove('printing-single');
    }
    return () => {
      document.body.classList.remove('printing-single');
    };
  }, [isOpen]);

  if (!isOpen || !printData) return null;

  const { type, data, title } = printData;

  const handlePrint = () => {
    document.body.classList.add('printing-single');
    triggerPrint();
    if (notifyMessage) {
      notifyMessage('Mencetak data tunggal (satu per satu)...');
    }
  };

  const handleExportWord = () => {
    const el = document.getElementById('printable-single-document');
    if (el) {
      exportToWord(`${printData.title.replace(/\s+/g, '_')}_${Date.now()}`, el.innerHTML);
      if (notifyMessage) {
        notifyMessage('Dokumen berhasil diekspor ke Word (.doc)');
      }
    }
  };

  const formattedDate = new Date(tanggalDokumen).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/80 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto single-print-modal-container animate-in fade-in duration-150">
      {/* Top Action Bar (Controls) - Hidden during Print */}
      <div className="no-print max-w-4xl mx-auto w-full bg-slate-900 border border-slate-700 text-white rounded-t-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
            <Printer className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-300">
                Cetak Data Satu per Satu (Dokumen Tunggal)
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-500">
                1 Lembar Saja
              </span>
            </div>
            <p className="text-[11px] text-slate-400">{title}</p>
          </div>
        </div>

        {/* Paper Size & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Paper Size Selector */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
            <span className="text-[10px] text-slate-400 px-1 font-semibold">Kertas:</span>
            {(['F4', 'A4', 'Legal', 'Letter'] as PaperSize[]).map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setPaperSize(sz)}
                className={`px-2 py-0.5 rounded text-[10.5px] font-bold cursor-pointer transition-all ${
                  paperSize === sz
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleExportWord}
            className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Ekspor ke Microsoft Word"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Word</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md transition-transform active:scale-95 cursor-pointer ring-2 ring-emerald-400"
            title="Kirim ke Printer atau Simpan ke PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Sekarang (Print)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Tutup Pratinjau"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sheet Container */}
      <div className="flex-1 max-w-4xl mx-auto w-full bg-slate-200 p-2 sm:p-6 overflow-y-auto rounded-b-xl border-x border-b border-slate-700/60 single-print-modal-container">
        <div
          id="printable-single-document"
          className={`mx-auto bg-white text-black p-6 sm:p-10 rounded-sm shadow-md font-serif text-[11pt] leading-normal single-print-paper paper-${paperSize.toLowerCase()} border border-slate-300 print:border-none print:shadow-none print:p-0 print:m-0`}
        >
          {/* Header Kop Surat */}
          <KopSurat settings={settings} />

          {/* Render content based on type */}
          {type === 'siswa' && renderSiswaContent(data, settings, formattedDate)}
          {type === 'guru' && renderGuruContent(data, settings, formattedDate)}
          {type === 'surat' && renderSuratContent(data, settings, formattedDate)}
          {type === 'atk' && renderAtkContent(data, settings, formattedDate)}
          {type === 'perpus_buku' && renderPerpusBukuContent(data, settings, formattedDate)}
          {type === 'perpus_pinjam' && renderPerpusPinjamContent(data, settings, formattedDate)}
          {type === 'sarpras' && renderSarprasContent(data, settings, formattedDate)}
          {type === 'keuangan' && renderKeuanganContent(data, settings, formattedDate)}
          {type === 'arsip' && renderArsipContent(data, settings, formattedDate)}
          {type === 'jadwal_piket' && renderPiketContent(data, settings, formattedDate)}
          {type === 'jadwal_pelajaran' && renderJadwalPelajaranContent(data, settings, formattedDate)}
          {type === 'kurikulum' && renderKurikulumContent(data, settings, formattedDate)}
          {type === 'kalender' && renderKalenderContent(data, settings, formattedDate)}
          {type === 'absen_siswa' && renderAbsenSiswaContent(data, settings, formattedDate)}
          {type === 'absen_guru' && renderAbsenGuruContent(data, settings, formattedDate)}
        </div>
      </div>
    </div>
  );
};

// 1. SISWA BIODATA
function renderSiswaContent(s: any, settings: SchoolSettings, formattedDate: string) {
  return (
    <div className="space-y-4">
      <div className="text-center my-3">
        <h3 className="text-base font-bold uppercase underline tracking-wide font-sans">
          LEMBAR BUKU INDUK / BIODATA PESERTA DIDIK
        </h3>
        <p className="text-xs font-sans text-slate-700 mt-0.5">
          STANDAR DATA POKOK PENDIDIKAN (DAPODIK) KEMENDIKBUDRISTEK
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-5 items-start">
        {/* Photo Box */}
        <div className="w-32 h-40 border-2 border-slate-700 bg-slate-50 flex flex-col items-center justify-center p-1 flex-shrink-0 text-center mx-auto sm:mx-0">
          {s.foto ? (
            <img src={s.foto} alt={s.namaSiswa} className="w-full h-full object-cover" />
          ) : (
            <div className="text-center text-slate-400 p-2">
              <User className="w-10 h-10 mx-auto text-slate-300 mb-1" />
              <span className="text-[10px] font-sans font-bold">Pasfoto 3 x 4</span>
            </div>
          )}
        </div>

        {/* Primary Data */}
        <div className="flex-1 w-full">
          <table className="w-full text-xs font-sans border-collapse">
            <tbody>
              <tr>
                <td className="py-1 w-36 font-semibold">1. Nama Lengkap</td>
                <td className="py-1 w-3">:</td>
                <td className="py-1 font-bold text-sm uppercase">{s.namaSiswa || '-'}</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold">2. Nama Panggilan</td>
                <td className="py-1">:</td>
                <td className="py-1">{s.namaPanggilan || '-'}</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold">3. NIS / NISN</td>
                <td className="py-1">:</td>
                <td className="py-1 font-mono font-bold">{s.nis || '-'} / {s.nisn || '-'}</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold">4. NIK (Kependudukan)</td>
                <td className="py-1">:</td>
                <td className="py-1 font-mono">{s.nik || '-'}</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold">5. Tempat, Tgl Lahir</td>
                <td className="py-1">:</td>
                <td className="py-1">{s.tempatLahir || '-'}, {s.tanggalLahir || '-'}</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold">6. Jenis Kelamin</td>
                <td className="py-1">:</td>
                <td className="py-1">{s.jenisKelamin === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold">7. Agama</td>
                <td className="py-1">:</td>
                <td className="py-1">{s.agama || 'Kristen Protestan'}</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold">8. Kelas / Rombel</td>
                <td className="py-1">:</td>
                <td className="py-1 font-bold">Kelas {s.kelas} ({s.rombel})</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold">9. Status Keaktifan</td>
                <td className="py-1">:</td>
                <td className="py-1 font-bold">{s.keterangan || 'Aktif'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Parents & Address Information */}
      <div className="border-t border-slate-300 pt-3">
        <h4 className="font-bold text-xs uppercase font-sans mb-2 text-slate-800 bg-slate-100 p-1 px-2 border-l-4 border-emerald-700">
          Data Orang Tua / Wali & Domisili
        </h4>
        <table className="w-full text-xs font-sans border-collapse">
          <tbody>
            <tr>
              <td className="py-1 w-44 font-semibold">10. Nama Ayah Kandung</td>
              <td className="py-1 w-3">:</td>
              <td className="py-1 font-semibold">{s.namaAyah || '-'}</td>
              <td className="py-1 w-32 font-semibold">Pekerjaan:</td>
              <td className="py-1">{s.pekerjaanAyah || '-'}</td>
            </tr>
            <tr>
              <td className="py-1 font-semibold">11. Nama Ibu Kandung</td>
              <td className="py-1">:</td>
              <td className="py-1 font-semibold">{s.namaIbu || '-'}</td>
              <td className="py-1 font-semibold">Pekerjaan:</td>
              <td className="py-1">{s.pekerjaanIbu || '-'}</td>
            </tr>
            <tr>
              <td className="py-1 font-semibold">12. Alamat Tempat Tinggal</td>
              <td className="py-1">:</td>
              <td className="py-1" colSpan={3}>{s.alamat || s.alamatOrangTua || '-'}</td>
            </tr>
            <tr>
              <td className="py-1 font-semibold">13. Distrik / Kabupaten</td>
              <td className="py-1">:</td>
              <td className="py-1" colSpan={3}>{s.kecamatan || 'Dekai'}, {s.kabupaten || 'Pegunungan Bintang'} - {s.provinsi || 'Papua Pegunungan'}</td>
            </tr>
            <tr>
              <td className="py-1 font-semibold">14. No. HP / Kontak Wali</td>
              <td className="py-1">:</td>
              <td className="py-1 font-mono" colSpan={3}>{s.noHp || '-'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Signatures */}
      <div className="mt-8 pt-4 flex justify-between font-sans text-xs">
        <div className="text-center w-52">
          <p>Orang Tua / Wali Murid,</p>
          <div className="h-16"></div>
          <p className="font-bold underline uppercase">( {s.namaAyah || s.namaIbu || '........................'} )</p>
        </div>

        <div className="text-center w-60">
          <p>Dekai, {formattedDate}</p>
          <p className="font-bold">Kepala Sekolah,</p>
          <div className="h-16"></div>
          <p className="font-bold underline uppercase">{settings.namaKepsek}</p>
          <p className="font-mono text-[10px]">NIP. {settings.nipKepsek}</p>
        </div>
      </div>
    </div>
  );
}

// 2. GURU BIODATA
function renderGuruContent(g: any, settings: SchoolSettings, formattedDate: string) {
  return (
    <div className="space-y-4">
      <div className="text-center my-3">
        <h3 className="text-base font-bold uppercase underline tracking-wide font-sans">
          BIODATA LENGKAP PENDIDIK & TENAGA KEPENDIDIKAN (GTK)
        </h3>
        <p className="text-xs font-sans text-slate-700 mt-0.5">
          ADMINISTRASI KEPEGAWAIAN SEKOLAH PEDALAMAN PAPUA
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-5 items-start">
        {/* Photo Box */}
        <div className="w-32 h-40 border-2 border-slate-700 bg-slate-50 flex flex-col items-center justify-center p-1 flex-shrink-0 text-center mx-auto sm:mx-0">
          {g.foto ? (
            <img src={g.foto} alt={g.nama} className="w-full h-full object-cover" />
          ) : (
            <div className="text-center text-slate-400 p-2">
              <User className="w-10 h-10 mx-auto text-slate-300 mb-1" />
              <span className="text-[10px] font-sans font-bold">Pasfoto 3 x 4</span>
            </div>
          )}
        </div>

        {/* Data Table */}
        <div className="flex-1 w-full">
          <table className="w-full text-xs font-sans border-collapse">
            <tbody>
              <tr>
                <td className="py-1 w-40 font-semibold">1. Nama Lengkap & Gelar</td>
                <td className="py-1 w-3">:</td>
                <td className="py-1 font-bold text-sm uppercase">{g.nama || '-'}</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold">2. NIP / NUPTK</td>
                <td className="py-1">:</td>
                <td className="py-1 font-mono font-bold">{g.nip || '-'} / {g.nuptk || '-'}</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold">3. NIK (Kependudukan)</td>
                <td className="py-1">:</td>
                <td className="py-1 font-mono">{g.nik || '-'}</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold">4. Tempat, Tgl Lahir / Umur</td>
                <td className="py-1">:</td>
                <td className="py-1">{g.tempatLahir || '-'}, {g.tanggalLahir || '-'} ({g.umur ?? '-'} Tahun)</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold">5. Jabatan / Tugas Utama</td>
                <td className="py-1">:</td>
                <td className="py-1 font-bold">{g.jabatan || 'Guru Kelas'}</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold">6. Pangkat / Golongan</td>
                <td className="py-1">:</td>
                <td className="py-1">{g.pangkatGolongan || '-'}</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold">7. Status Kepegawaian</td>
                <td className="py-1">:</td>
                <td className="py-1 font-bold">{g.statusKepegawaian || 'PNS'}</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold">8. Pendidikan Terakhir</td>
                <td className="py-1">:</td>
                <td className="py-1">{g.pendidikanTerakhir || 'S1'} - {g.jurusan || 'PGSD'}</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold">9. Status Sertifikasi</td>
                <td className="py-1">:</td>
                <td className="py-1 font-bold">{g.sertifikasi || 'Belum'} Sertifikasi</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold">10. Masa Kerja & Status</td>
                <td className="py-1">:</td>
                <td className="py-1">{g.masaKerja || '-'} ({g.keterangan || 'Aktif'})</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="border-t border-slate-300 pt-3">
        <h4 className="font-bold text-xs uppercase font-sans mb-1 text-slate-800 bg-slate-100 p-1 px-2 border-l-4 border-emerald-700">
          Riwayat Penugasan & Pembagian Tugas Tambahan
        </h4>
        <p className="text-xs font-sans p-2 bg-slate-50 border border-slate-200 rounded">
          {g.riwayatTugas || 'Melaksanakan tugas pokok pengajaran dan pembinaan kesiswaan di lingkungan SD Negeri Inpres Dekai.'}
        </p>
      </div>

      {/* Signatures */}
      <div className="mt-8 pt-4 flex justify-between font-sans text-xs">
        <div className="text-center w-56">
          <p>Guru / Pegawai yang Bersangkutan,</p>
          <div className="h-16"></div>
          <p className="font-bold underline uppercase">{g.nama}</p>
          <p className="font-mono text-[10px]">NIP. {g.nip || '-'}</p>
        </div>

        <div className="text-center w-60">
          <p>Dekai, {formattedDate}</p>
          <p className="font-bold">Kepala Sekolah,</p>
          <div className="h-16"></div>
          <p className="font-bold underline uppercase">{settings.namaKepsek}</p>
          <p className="font-mono text-[10px]">NIP. {settings.nipKepsek}</p>
        </div>
      </div>
    </div>
  );
}

// 3. SURAT TUNGGAL
function renderSuratContent(s: any, settings: SchoolSettings, formattedDate: string) {
  return (
    <div className="space-y-4 font-serif">
      <div className="text-center my-3">
        <h3 className="text-base font-bold uppercase underline tracking-wide">
          {s.jenisSurat || 'SURAT DINAS RESMI'}
        </h3>
        <p className="text-xs font-sans text-slate-800 mt-0.5">
          Nomor: <span className="font-mono font-bold">{s.nomorSurat || '421.2/012/SD-DKI/2026'}</span>
        </p>
      </div>

      <div className="my-4 text-xs font-sans">
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className="w-24 font-semibold py-0.5">Lampiran</td>
              <td className="w-3 py-0.5">:</td>
              <td className="py-0.5">{s.lampiran || '-'}</td>
              <td className="text-right py-0.5 font-serif" colSpan={2}>Dekai, {s.tanggalSurat || formattedDate}</td>
            </tr>
            <tr>
              <td className="font-semibold py-0.5">Perihal</td>
              <td className="py-0.5">:</td>
              <td className="font-bold py-0.5 underline uppercase" colSpan={3}>{s.perihal || 'Pemberitahuan Kegiatan Sekolah'}</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-4">
          <p className="font-semibold">Kepada Yth,</p>
          <p className="font-bold text-sm">{s.tujuan || s.penerima || 'Bapak/Ibu Orang Tua / Wali Murid'}</p>
          <p className="text-slate-700">di Tempat</p>
        </div>
      </div>

      <div className="text-xs font-serif leading-relaxed space-y-3 pt-2">
        <p className="indent-8 text-justify">
          Dengan hormat,
        </p>
        <p className="indent-8 text-justify">
          {s.isiRingkas || s.isiSurat || 'Sehubungan dengan agenda kegiatan administrasi pembelajaran dan peningkatan mutu pendidikan di lingkungan sekolah, bersama surat ini kami sampaikan hal-hal penting sebagai berikut:'}
        </p>
        {s.keterangan && (
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded font-sans text-xs my-2">
            <strong>Catatan Tambahan:</strong> {s.keterangan}
          </div>
        )}
        <p className="indent-8 text-justify">
          Demikian surat ini kami sampaikan untuk diketahui dan dipergunakan sebagaimana mestinya. Atas perhatian, dukungan, dan kerja sama yang baik, kami ucapkan terima kasih.
        </p>
      </div>

      {/* Signatures */}
      <div className="mt-10 pt-4 flex justify-end font-sans text-xs">
        <div className="text-center w-64">
          <p>Dekai, {s.tanggalSurat || formattedDate}</p>
          <p className="font-bold">Kepala Sekolah,</p>
          <div className="h-16"></div>
          <p className="font-bold underline uppercase">{settings.namaKepsek}</p>
          <p className="font-mono text-[10px]">NIP. {settings.nipKepsek}</p>
        </div>
      </div>
    </div>
  );
}

// 4. ATK TUNGGAL
function renderAtkContent(it: any, settings: SchoolSettings, formattedDate: string) {
  const total = it.totalHarga ?? ((it.jumlah || 0) * (it.hargaSatuan || 0));
  return (
    <div className="space-y-4">
      <div className="text-center my-3">
        <h3 className="text-base font-bold uppercase underline tracking-wide font-sans">
          BUKTI PENGELUARAN / MUTASI BARANG ATK (TUNGGAL)
        </h3>
        <p className="text-xs font-sans text-slate-700 mt-0.5">
          Nomor Bukti: <span className="font-mono font-bold">ATK/{it.no || 1}/{new Date().getFullYear()}</span>
        </p>
      </div>

      <div className="border border-slate-300 p-4 rounded bg-slate-50/50 space-y-3 font-sans text-xs">
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className="w-44 font-semibold py-1.5 border-b border-slate-200">Nama Barang ATK</td>
              <td className="w-3 py-1.5 border-b border-slate-200">:</td>
              <td className="font-bold text-sm py-1.5 border-b border-slate-200 text-slate-900">{it.namaBarang}</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5 border-b border-slate-200">Kategori Barang</td>
              <td className="py-1.5 border-b border-slate-200">:</td>
              <td className="py-1.5 border-b border-slate-200">{it.kategori || 'Perlengkapan Kantor'}</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5 border-b border-slate-200">Jumlah / Satuan</td>
              <td className="py-1.5 border-b border-slate-200">:</td>
              <td className="font-bold py-1.5 border-b border-slate-200">{it.jumlah} {it.satuan}</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5 border-b border-slate-200">Kondisi Barang</td>
              <td className="py-1.5 border-b border-slate-200">:</td>
              <td className="py-1.5 border-b border-slate-200 font-semibold">{it.kondisi || 'Baik'}</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5 border-b border-slate-200">Harga Satuan</td>
              <td className="py-1.5 border-b border-slate-200">:</td>
              <td className="py-1.5 border-b border-slate-200 font-mono">Rp {(it.hargaSatuan || 0).toLocaleString('id-ID')}</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5 border-b border-slate-200">Total Nilai Anggaran</td>
              <td className="py-1.5 border-b border-slate-200">:</td>
              <td className="py-1.5 border-b border-slate-200 font-mono font-bold text-emerald-800 text-sm">
                Rp {total.toLocaleString('id-ID')}
              </td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5 border-b border-slate-200">Tanggal Masuk / Stok</td>
              <td className="py-1.5 border-b border-slate-200">:</td>
              <td className="py-1.5 border-b border-slate-200">{it.tanggalMasuk || '-'}</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5 border-b border-slate-200">Tanggal Pengeluaran / Pakai</td>
              <td className="py-1.5 border-b border-slate-200">:</td>
              <td className="py-1.5 border-b border-slate-200 font-medium">{it.tanggalKeluar || '-'}</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5">Penerima / Pengguna</td>
              <td className="py-1.5">:</td>
              <td className="py-1.5 font-bold text-blue-900">{it.penerima || 'Stok Tersedia di Ruang TU'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Signatures 3 parties */}
      <div className="mt-8 pt-4 grid grid-cols-3 gap-3 font-sans text-xs text-center">
        <div>
          <p>Petugas Pengelola ATK,</p>
          <div className="h-16"></div>
          <p className="font-bold underline uppercase">{settings.operatorTU}</p>
          <p className="font-mono text-[10px]">Staf Tata Usaha</p>
        </div>

        <div>
          <p>Penerima Barang,</p>
          <div className="h-16"></div>
          <p className="font-bold underline uppercase">{it.penerima || '( .......................... )'}</p>
          <p className="text-[10px]">Pendidik / Tenaga Kependidikan</p>
        </div>

        <div>
          <p>Dekai, {formattedDate}</p>
          <p className="font-bold">Mengetahui Kepala Sekolah,</p>
          <div className="h-16"></div>
          <p className="font-bold underline uppercase">{settings.namaKepsek}</p>
          <p className="font-mono text-[10px]">NIP. {settings.nipKepsek}</p>
        </div>
      </div>
    </div>
  );
}

// 5. PERPUSTAKAAN BUKU TUNGGAL
function renderPerpusBukuContent(b: any, settings: SchoolSettings, formattedDate: string) {
  return (
    <div className="space-y-4">
      <div className="text-center my-3">
        <h3 className="text-base font-bold uppercase underline tracking-wide font-sans">
          KARTU INVENTARIS BUKU PERPUSTAKAAN SEKOLAH
        </h3>
        <p className="text-xs font-sans text-slate-700 mt-0.5">
          KODE BUKU: <span className="font-mono font-bold">{b.kodeBuku || b.isbn || 'PERP-SD-001'}</span>
        </p>
      </div>

      <div className="border border-slate-300 p-4 rounded bg-slate-50/50 space-y-3 font-sans text-xs">
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className="w-40 font-semibold py-1.5 border-b border-slate-200">Judul Buku</td>
              <td className="w-3 py-1.5 border-b border-slate-200">:</td>
              <td className="font-bold text-sm py-1.5 border-b border-slate-200 text-slate-900">{b.judul}</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5 border-b border-slate-200">Pengarang / Penulis</td>
              <td className="py-1.5 border-b border-slate-200">:</td>
              <td className="py-1.5 border-b border-slate-200 font-semibold">{b.pengarang || '-'}</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5 border-b border-slate-200">Penerbit & Tahun</td>
              <td className="py-1.5 border-b border-slate-200">:</td>
              <td className="py-1.5 border-b border-slate-200">{b.penerbit || '-'} ({b.tahunTerbit || '-'})</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5 border-b border-slate-200">Kategori / Klasifikasi</td>
              <td className="py-1.5 border-b border-slate-200">:</td>
              <td className="py-1.5 border-b border-slate-200">{b.kategori || 'Buku Paket Pembelajaran'}</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5 border-b border-slate-200">Jumlah Eksemplar</td>
              <td className="py-1.5 border-b border-slate-200">:</td>
              <td className="py-1.5 border-b border-slate-200 font-bold">{b.jumlah} Eksemplar</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5 border-b border-slate-200">Lokasi / Nomor Rak</td>
              <td className="py-1.5 border-b border-slate-200">:</td>
              <td className="py-1.5 border-b border-slate-200 font-semibold">{b.lokasiRak || 'Rak A-1'}</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5">Kondisi Fisik Buku</td>
              <td className="py-1.5">:</td>
              <td className="py-1.5 font-bold text-emerald-800">{b.kondisi || 'Baik'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-8 pt-4 flex justify-between font-sans text-xs">
        <div className="text-center w-52">
          <p>Pengelola Perpustakaan,</p>
          <div className="h-16"></div>
          <p className="font-bold underline uppercase">{settings.operatorTU}</p>
          <p className="text-[10px]">Staf Pengelola</p>
        </div>

        <div className="text-center w-60">
          <p>Dekai, {formattedDate}</p>
          <p className="font-bold">Mengetahui Kepala Sekolah,</p>
          <div className="h-16"></div>
          <p className="font-bold underline uppercase">{settings.namaKepsek}</p>
          <p className="font-mono text-[10px]">NIP. {settings.nipKepsek}</p>
        </div>
      </div>
    </div>
  );
}

// 6. PERPUSTAKAAN PEMINJAMAN TUNGGAL
function renderPerpusPinjamContent(p: any, settings: SchoolSettings, formattedDate: string) {
  return (
    <div className="space-y-4">
      <div className="text-center my-3">
        <h3 className="text-base font-bold uppercase underline tracking-wide font-sans">
          BUKTI PEMINJAMAN & PENGEMBALIAN BUKU PERPUSTAKAAN
        </h3>
        <p className="text-xs font-sans text-slate-700 mt-0.5">
          NO. TRANSAKSI: <span className="font-mono font-bold">PINJAM/{p.id || '001'}</span>
        </p>
      </div>

      <div className="border border-slate-300 p-4 rounded bg-slate-50/50 space-y-3 font-sans text-xs">
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className="w-40 font-semibold py-1.5 border-b border-slate-200">Nama Peminjam</td>
              <td className="w-3 py-1.5 border-b border-slate-200">:</td>
              <td className="font-bold text-sm py-1.5 border-b border-slate-200 text-slate-900">{p.namaPeminjam}</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5 border-b border-slate-200">Peran / Kelas</td>
              <td className="py-1.5 border-b border-slate-200">:</td>
              <td className="py-1.5 border-b border-slate-200 font-semibold">{p.peran} {p.kelas ? `(Kelas ${p.kelas})` : ''}</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5 border-b border-slate-200">Judul Buku yang Dipinjam</td>
              <td className="py-1.5 border-b border-slate-200">:</td>
              <td className="font-bold py-1.5 border-b border-slate-200 text-blue-900">{p.judulBuku}</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5 border-b border-slate-200">Tanggal Peminjaman</td>
              <td className="py-1.5 border-b border-slate-200">:</td>
              <td className="py-1.5 border-b border-slate-200">{p.tanggalPinjam}</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5 border-b border-slate-200">Batas Waktu Pengembalian</td>
              <td className="py-1.5 border-b border-slate-200">:</td>
              <td className="py-1.5 border-b border-slate-200 font-bold">{p.tanggalKembali}</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5">Status Sirkulasi</td>
              <td className="py-1.5">:</td>
              <td className="py-1.5 font-bold text-emerald-800">{p.status}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-8 pt-4 flex justify-between font-sans text-xs">
        <div className="text-center w-52">
          <p>Peminjam Buku,</p>
          <div className="h-16"></div>
          <p className="font-bold underline uppercase">{p.namaPeminjam}</p>
        </div>

        <div className="text-center w-52">
          <p>Dekai, {formattedDate}</p>
          <p className="font-bold">Pengelola Perpustakaan,</p>
          <div className="h-16"></div>
          <p className="font-bold underline uppercase">{settings.operatorTU}</p>
        </div>
      </div>
    </div>
  );
}

// 7. SARPRAS TUNGGAL (KIR)
function renderSarprasContent(item: any, settings: SchoolSettings, formattedDate: string) {
  return (
    <div className="space-y-4">
      <div className="text-center my-3">
        <h3 className="text-base font-bold uppercase underline tracking-wide font-sans">
          KARTU INVENTARIS BARANG / RUANGAN (KIR) SARPRAS
        </h3>
        <p className="text-xs font-sans text-slate-700 mt-0.5">
          KODE BARANG / INVENTARIS: <span className="font-mono font-bold">{item.kodeBarang || 'SPR-01'}</span>
        </p>
      </div>

      <div className="border border-slate-300 p-4 rounded bg-slate-50/50 space-y-3 font-sans text-xs">
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className="w-44 font-semibold py-1.5 border-b border-slate-200">Nama Barang / Fasilitas</td>
              <td className="w-3 py-1.5 border-b border-slate-200">:</td>
              <td className="font-bold text-sm py-1.5 border-b border-slate-200 text-slate-900">{item.namaBarang}</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5 border-b border-slate-200">Ruangan / Lokasi Penempatan</td>
              <td className="py-1.5 border-b border-slate-200">:</td>
              <td className="font-bold py-1.5 border-b border-slate-200 text-blue-900">{item.ruangan || '-'}</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5 border-b border-slate-200">Jumlah / Kuantitas</td>
              <td className="py-1.5 border-b border-slate-200">:</td>
              <td className="font-bold py-1.5 border-b border-slate-200">{item.jumlah} {item.satuan || 'Unit'}</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5 border-b border-slate-200">Kondisi Fisik Saat Ini</td>
              <td className="py-1.5 border-b border-slate-200">:</td>
              <td className="py-1.5 border-b border-slate-200 font-bold">{item.kondisi}</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5 border-b border-slate-200">Tahun Perolehan / Pengadaan</td>
              <td className="py-1.5 border-b border-slate-200">:</td>
              <td className="py-1.5 border-b border-slate-200">{item.tahunPengadaan || '-'}</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5 border-b border-slate-200">Sumber Dana Pengadaan</td>
              <td className="py-1.5 border-b border-slate-200">:</td>
              <td className="py-1.5 border-b border-slate-200">{item.sumberDana || 'Dana BOS Reguler'}</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5">Keterangan Tambahan</td>
              <td className="py-1.5">:</td>
              <td className="py-1.5">{item.keterangan || 'Barang terdata dalam buku inventaris aset sekolah.'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-8 pt-4 flex justify-between font-sans text-xs">
        <div className="text-center w-52">
          <p>Pengurus Barang / Sarpras,</p>
          <div className="h-16"></div>
          <p className="font-bold underline uppercase">{settings.operatorTU}</p>
        </div>

        <div className="text-center w-60">
          <p>Dekai, {formattedDate}</p>
          <p className="font-bold">Kepala Sekolah,</p>
          <div className="h-16"></div>
          <p className="font-bold underline uppercase">{settings.namaKepsek}</p>
          <p className="font-mono text-[10px]">NIP. {settings.nipKepsek}</p>
        </div>
      </div>
    </div>
  );
}

// 8. KEUANGAN KUITANSI KAS BOS TUNGGAL
function renderKeuanganContent(f: any, settings: SchoolSettings, formattedDate: string) {
  return (
    <div className="space-y-4">
      <div className="text-center my-3">
        <h3 className="text-base font-bold uppercase underline tracking-wide font-sans">
          BUKTI TRANSAKSI KAS / KUITANSI KEUANGAN
        </h3>
        <p className="text-xs font-sans text-slate-700 mt-0.5">
          NOMOR BUKTI: <span className="font-mono font-bold">{f.nomorBukti || 'BOS/2026/01'}</span>
        </p>
      </div>

      <div className="border-2 border-slate-800 p-5 rounded-sm bg-white space-y-3 font-sans text-xs">
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className="w-40 font-semibold py-1.5">Telah Terima Dari</td>
              <td className="w-3 py-1.5">:</td>
              <td className="font-bold py-1.5 text-sm">{f.tipe === 'Masuk' ? (f.kategori || 'Pemerintah / Dana BOS') : `Bendahara BOS ${settings.namaSekolah}`}</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5">Kepada / Penerima</td>
              <td className="py-1.5">:</td>
              <td className="font-bold py-1.5 text-sm">{f.tipe === 'Keluar' ? (f.kategori || 'Pihak Ketiga / Rekanan') : `Bendahara ${settings.namaSekolah}`}</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5">Uang Sejumlah (Rp)</td>
              <td className="py-1.5">:</td>
              <td className="font-mono font-black text-emerald-900 text-base py-1.5">
                Rp {(f.jumlah || 0).toLocaleString('id-ID')} ,-
              </td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5">Untuk Keperluan</td>
              <td className="py-1.5">:</td>
              <td className="py-1.5 font-medium leading-relaxed" colSpan={3}>
                {f.uraian || 'Pembayaran belanja operasional dan administrasi sekolah pedalaman.'}
              </td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5">Kategori Anggaran</td>
              <td className="py-1.5">:</td>
              <td className="py-1.5 font-semibold text-slate-700">{f.kategori || 'BOS Reguler'} ({f.tipe === 'Masuk' ? 'Penerimaan Kas' : 'Pengeluaran Kas'})</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5">Tanggal Transaksi</td>
              <td className="py-1.5">:</td>
              <td className="py-1.5 font-medium">{f.tanggal || formattedDate}</td>
            </tr>
          </tbody>
        </table>

        {/* Large Amount Badge */}
        <div className="p-3 bg-slate-100 border border-slate-300 rounded flex items-center justify-between mt-3">
          <span className="font-bold text-slate-700">Terbilang Jumlah:</span>
          <span className="font-bold italic text-slate-900 text-xs">
            *** Rp {(f.jumlah || 0).toLocaleString('id-ID')} Rupiah ***
          </span>
        </div>
      </div>

      {/* Signatures 3 parties */}
      <div className="mt-8 pt-4 grid grid-cols-3 gap-2 font-sans text-xs text-center">
        <div>
          <p>Setuju Dibayar,</p>
          <p className="font-bold">Kepala Sekolah</p>
          <div className="h-16"></div>
          <p className="font-bold underline uppercase">{settings.namaKepsek}</p>
          <p className="font-mono text-[10px]">NIP. {settings.nipKepsek}</p>
        </div>

        <div>
          <p>Lunas Dibayar,</p>
          <p className="font-bold">Bendahara BOS</p>
          <div className="h-16"></div>
          <p className="font-bold underline uppercase">{settings.operatorTU}</p>
          <p className="font-mono text-[10px]">NIP. {settings.nipOperator || '-'}</p>
        </div>

        <div>
          <p>Dekai, {f.tanggal || formattedDate}</p>
          <p className="font-bold">Penerima Uang,</p>
          <div className="h-16"></div>
          <p className="font-bold underline uppercase">( .................................. )</p>
          <p className="text-[10px]">Tanda Tangan & Nama Terang</p>
        </div>
      </div>
    </div>
  );
}

// 9. ARSIP TUNGGAL
function renderArsipContent(a: any, settings: SchoolSettings, formattedDate: string) {
  return (
    <div className="space-y-4">
      <div className="text-center my-3">
        <h3 className="text-base font-bold uppercase underline tracking-wide font-sans">
          LEMBAR KARTU KENDALI ARSIP DOKUMEN SEKOLAH
        </h3>
        <p className="text-xs font-sans text-slate-700 mt-0.5">
          KODE ARSIP: <span className="font-mono font-bold">{a.kodeKlasifikasi || a.nomorBerkas || 'ARS-01'}</span>
        </p>
      </div>

      <div className="border border-slate-300 p-4 rounded bg-slate-50/50 space-y-3 font-sans text-xs">
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className="w-40 font-semibold py-1.5 border-b border-slate-200">Judul / Perihal Berkas</td>
              <td className="w-3 py-1.5 border-b border-slate-200">:</td>
              <td className="font-bold text-sm py-1.5 border-b border-slate-200 text-slate-900">{a.judul || a.perihal}</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5 border-b border-slate-200">Kategori Dokumen</td>
              <td className="py-1.5 border-b border-slate-200">:</td>
              <td className="py-1.5 border-b border-slate-200 font-semibold">{a.kategori || 'Arsip Kedinasan'}</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5 border-b border-slate-200">Nomor Dokumen Asli</td>
              <td className="py-1.5 border-b border-slate-200">:</td>
              <td className="font-mono font-bold py-1.5 border-b border-slate-200">{a.nomorDokumen || a.nomorSurat || '-'}</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5 border-b border-slate-200">Tanggal Dokumen / Berkas</td>
              <td className="py-1.5 border-b border-slate-200">:</td>
              <td className="py-1.5 border-b border-slate-200">{a.tanggal || a.tanggalDokumen || '-'}</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5 border-b border-slate-200">Lokasi Lemari / Boks Simpan</td>
              <td className="py-1.5 border-b border-slate-200">:</td>
              <td className="py-1.5 border-b border-slate-200 font-bold text-blue-900">{a.lokasiSimpan || 'Boks Arsip TU'}</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5">Ringkasan Isi Berkas</td>
              <td className="py-1.5">:</td>
              <td className="py-1.5 leading-relaxed">{a.isiRingkas || a.keterangan || 'Dokumen resmi tersimpan dalam arsip aktif sekolah.'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-8 pt-4 flex justify-between font-sans text-xs">
        <div className="text-center w-52">
          <p>Petugas Penata Arsip,</p>
          <div className="h-16"></div>
          <p className="font-bold underline uppercase">{settings.operatorTU}</p>
        </div>

        <div className="text-center w-60">
          <p>Dekai, {formattedDate}</p>
          <p className="font-bold">Mengetahui Kepala Sekolah,</p>
          <div className="h-16"></div>
          <p className="font-bold underline uppercase">{settings.namaKepsek}</p>
          <p className="font-mono text-[10px]">NIP. {settings.nipKepsek}</p>
        </div>
      </div>
    </div>
  );
}

// 10. JADWAL PIKET TUNGGAL
function renderPiketContent(p: any, settings: SchoolSettings, formattedDate: string) {
  return (
    <div className="space-y-4">
      <div className="text-center my-3">
        <h3 className="text-base font-bold uppercase underline tracking-wide font-sans">
          JADWAL PIKET HARIAN SEKOLAH ({p.hari ? p.hari.toUpperCase() : 'HARI PIKET'})
        </h3>
        <p className="text-xs font-sans text-slate-700 mt-0.5">
          SEMESTER AKTIF TAHUN PELAJARAN {new Date().getFullYear()}/{new Date().getFullYear() + 1}
        </p>
      </div>

      <div className="border border-slate-300 p-4 rounded bg-slate-50/50 space-y-3 font-sans text-xs">
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className="w-40 font-semibold py-1.5 border-b border-slate-200">Hari Piket</td>
              <td className="w-3 py-1.5 border-b border-slate-200">:</td>
              <td className="font-bold text-sm py-1.5 border-b border-slate-200 text-emerald-900">{p.hari}</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5 border-b border-slate-200">Guru Koordinator Piket</td>
              <td className="py-1.5 border-b border-slate-200">:</td>
              <td className="font-bold py-1.5 border-b border-slate-200 text-slate-900">{p.guruPiket || p.namaGuru}</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5 border-b border-slate-200">Tugas Pokok Piket</td>
              <td className="py-1.5 border-b border-slate-200">:</td>
              <td className="py-1.5 border-b border-slate-200">{p.tugas || 'Pengawasan apel pagi, ketertiban kelas, presensi dan penanganan kesiswaan'}</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5">Catatan Khusus</td>
              <td className="py-1.5">:</td>
              <td className="py-1.5">{p.catatan || 'Hadir minimal 15 menit sebelum bel masuk berbunyi.'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-8 pt-4 flex justify-between font-sans text-xs">
        <div className="text-center w-52">
          <p>Guru Piket Bersangkutan,</p>
          <div className="h-16"></div>
          <p className="font-bold underline uppercase">{p.guruPiket || p.namaGuru}</p>
        </div>

        <div className="text-center w-60">
          <p>Dekai, {formattedDate}</p>
          <p className="font-bold">Kepala Sekolah,</p>
          <div className="h-16"></div>
          <p className="font-bold underline uppercase">{settings.namaKepsek}</p>
          <p className="font-mono text-[10px]">NIP. {settings.nipKepsek}</p>
        </div>
      </div>
    </div>
  );
}

// 11. JADWAL PELAJARAN TUNGGAL (PER KELAS)
function renderJadwalPelajaranContent(j: any, settings: SchoolSettings, formattedDate: string) {
  return (
    <div className="space-y-4">
      <div className="text-center my-3">
        <h3 className="text-base font-bold uppercase underline tracking-wide font-sans">
          JADWAL PELAJARAN {j.kelas ? `KELAS ${j.kelas}` : 'KELAS'} (KURIKULUM MERDEKA)
        </h3>
        <p className="text-xs font-sans text-slate-700 mt-0.5">
          TAHUN AJARAN {new Date().getFullYear()}/{new Date().getFullYear() + 1}
        </p>
      </div>

      <div className="border border-slate-300 p-4 rounded bg-slate-50/50 space-y-3 font-sans text-xs">
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className="w-40 font-semibold py-1.5 border-b border-slate-200">Hari & Jam</td>
              <td className="w-3 py-1.5 border-b border-slate-200">:</td>
              <td className="font-bold text-sm py-1.5 border-b border-slate-200 text-slate-900">{j.hari}, {j.jamKe || j.jamMulai}</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5 border-b border-slate-200">Kelas / Rombel</td>
              <td className="py-1.5 border-b border-slate-200">:</td>
              <td className="font-bold py-1.5 border-b border-slate-200">Kelas {j.kelas} ({j.rombel || 'A'})</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5 border-b border-slate-200">Mata Pelajaran</td>
              <td className="py-1.5 border-b border-slate-200">:</td>
              <td className="font-bold py-1.5 border-b border-slate-200 text-emerald-900">{j.mataPelajaran}</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5 border-b border-slate-200">Guru Pengampu</td>
              <td className="py-1.5 border-b border-slate-200">:</td>
              <td className="py-1.5 border-b border-slate-200 font-semibold">{j.namaGuru}</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5">Alokasi Waktu</td>
              <td className="py-1.5">:</td>
              <td className="py-1.5">{j.alokasiWaktu || '2 JP (2 x 35 Menit)'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-8 pt-4 flex justify-between font-sans text-xs">
        <div className="text-center w-52">
          <p>Guru Pengampu,</p>
          <div className="h-16"></div>
          <p className="font-bold underline uppercase">{j.namaGuru}</p>
        </div>

        <div className="text-center w-60">
          <p>Dekai, {formattedDate}</p>
          <p className="font-bold">Kepala Sekolah,</p>
          <div className="h-16"></div>
          <p className="font-bold underline uppercase">{settings.namaKepsek}</p>
          <p className="font-mono text-[10px]">NIP. {settings.nipKepsek}</p>
        </div>
      </div>
    </div>
  );
}

// 12. KURIKULUM TUNGGAL
function renderKurikulumContent(k: any, settings: SchoolSettings, formattedDate: string) {
  return (
    <div className="space-y-4">
      <div className="text-center my-3">
        <h3 className="text-base font-bold uppercase underline tracking-wide font-sans">
          PERANGKAT PEMBELAJARAN KURIKULUM MERDEKA
        </h3>
        <p className="text-xs font-sans text-slate-700 mt-0.5">
          {k.kategori || 'MODUL AJAR & CAPAIAN PEMBELAJARAN'}
        </p>
      </div>

      <div className="border border-slate-300 p-4 rounded bg-slate-50/50 space-y-3 font-sans text-xs">
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className="w-40 font-semibold py-1.5 border-b border-slate-200">Judul Dokumen</td>
              <td className="w-3 py-1.5 border-b border-slate-200">:</td>
              <td className="font-bold text-sm py-1.5 border-b border-slate-200 text-slate-900">{k.judul}</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5 border-b border-slate-200">Mata Pelajaran</td>
              <td className="py-1.5 border-b border-slate-200">:</td>
              <td className="font-bold py-1.5 border-b border-slate-200">{k.mataPelajaran || '-'}</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5 border-b border-slate-200">Fase / Kelas</td>
              <td className="py-1.5 border-b border-slate-200">:</td>
              <td className="py-1.5 border-b border-slate-200 font-semibold">Fase {k.fase || 'A/B/C'} (Kelas {k.kelas || '-'})</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5 border-b border-slate-200">Penyusun / Guru</td>
              <td className="py-1.5 border-b border-slate-200">:</td>
              <td className="py-1.5 border-b border-slate-200 font-semibold">{k.penyusun || k.namaGuru || settings.namaKepsek}</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5">Deskripsi / Ringkasan</td>
              <td className="py-1.5">:</td>
              <td className="py-1.5 leading-relaxed">{k.deskripsi || 'Perangkat terintegrasi muatan lokal kearifan Papua dan penguatan profil pelajar Pancasila.'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-8 pt-4 flex justify-between font-sans text-xs">
        <div className="text-center w-52">
          <p>Guru Penyusun,</p>
          <div className="h-16"></div>
          <p className="font-bold underline uppercase">{k.penyusun || k.namaGuru || 'Guru Kelas'}</p>
        </div>

        <div className="text-center w-60">
          <p>Dekai, {formattedDate}</p>
          <p className="font-bold">Kepala Sekolah,</p>
          <div className="h-16"></div>
          <p className="font-bold underline uppercase">{settings.namaKepsek}</p>
          <p className="font-mono text-[10px]">NIP. {settings.nipKepsek}</p>
        </div>
      </div>
    </div>
  );
}

// 13. KALENDER TUNGGAL
function renderKalenderContent(k: any, settings: SchoolSettings, formattedDate: string) {
  return (
    <div className="space-y-4">
      <div className="text-center my-3">
        <h3 className="text-base font-bold uppercase underline tracking-wide font-sans">
          LEMBAR AGENDA KEGIATAN AKADEMIK SEKOLAH
        </h3>
        <p className="text-xs font-sans text-slate-700 mt-0.5">
          TAHUN PELAJARAN {new Date().getFullYear()}/{new Date().getFullYear() + 1}
        </p>
      </div>

      <div className="border border-slate-300 p-4 rounded bg-slate-50/50 space-y-3 font-sans text-xs">
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className="w-40 font-semibold py-1.5 border-b border-slate-200">Nama Kegiatan / Agenda</td>
              <td className="w-3 py-1.5 border-b border-slate-200">:</td>
              <td className="font-bold text-sm py-1.5 border-b border-slate-200 text-slate-900">{k.kegiatan}</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5 border-b border-slate-200">Tanggal Pelaksanaan</td>
              <td className="py-1.5 border-b border-slate-200">:</td>
              <td className="font-bold py-1.5 border-b border-slate-200 text-emerald-900">{k.tanggalMulai} {k.tanggalSelesai ? `s/d ${k.tanggalSelesai}` : ''}</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5 border-b border-slate-200">Kategori Kegiatan</td>
              <td className="py-1.5 border-b border-slate-200">:</td>
              <td className="py-1.5 border-b border-slate-200 font-semibold">{k.kategori || 'Kegiatan Pembelajaran'}</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5">Keterangan / Sasaran</td>
              <td className="py-1.5">:</td>
              <td className="py-1.5 leading-relaxed">{k.keterangan || 'Seluruh warga sekolah SD Negeri Inpres Dekai.'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-8 pt-4 flex justify-end font-sans text-xs">
        <div className="text-center w-60">
          <p>Dekai, {formattedDate}</p>
          <p className="font-bold">Kepala Sekolah,</p>
          <div className="h-16"></div>
          <p className="font-bold underline uppercase">{settings.namaKepsek}</p>
          <p className="font-mono text-[10px]">NIP. {settings.nipKepsek}</p>
        </div>
      </div>
    </div>
  );
}

// 14. ABSEN SISWA TUNGGAL
function renderAbsenSiswaContent(att: any, settings: SchoolSettings, formattedDate: string) {
  return (
    <div className="space-y-4">
      <div className="text-center my-3">
        <h3 className="text-base font-bold uppercase underline tracking-wide font-sans">
          KARTU KEHADIRAN / PRESENSI SISWA TUNGGAL
        </h3>
        <p className="text-xs font-sans text-slate-700 mt-0.5">
          TANGGAL PRESENSI: <span className="font-bold">{att.tanggal || formattedDate}</span>
        </p>
      </div>

      <div className="border border-slate-300 p-4 rounded bg-slate-50/50 space-y-3 font-sans text-xs">
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className="w-40 font-semibold py-1.5 border-b border-slate-200">Nama Siswa</td>
              <td className="w-3 py-1.5 border-b border-slate-200">:</td>
              <td className="font-bold text-sm py-1.5 border-b border-slate-200 text-slate-900">{att.namaSiswa}</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5 border-b border-slate-200">Kelas / Rombel</td>
              <td className="py-1.5 border-b border-slate-200">:</td>
              <td className="font-bold py-1.5 border-b border-slate-200">Kelas {att.kelas} ({att.rombel || 'A'})</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5 border-b border-slate-200">Status Kehadiran</td>
              <td className="py-1.5 border-b border-slate-200">:</td>
              <td className="font-bold text-sm py-1.5 border-b border-slate-200 text-emerald-800">{att.keterangan || 'Hadir'}</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5">Alasan / Catatan Guru</td>
              <td className="py-1.5">:</td>
              <td className="py-1.5">{att.alasan || 'Mengikuti kegiatan belajar dengan tertib dan aktif.'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-8 pt-4 flex justify-between font-sans text-xs">
        <div className="text-center w-52">
          <p>Guru Kelas / Wali Kelas,</p>
          <div className="h-16"></div>
          <p className="font-bold underline uppercase">{settings.operatorTU}</p>
        </div>

        <div className="text-center w-60">
          <p>Dekai, {formattedDate}</p>
          <p className="font-bold">Kepala Sekolah,</p>
          <div className="h-16"></div>
          <p className="font-bold underline uppercase">{settings.namaKepsek}</p>
          <p className="font-mono text-[10px]">NIP. {settings.nipKepsek}</p>
        </div>
      </div>
    </div>
  );
}

// 15. ABSEN GURU TUNGGAL
function renderAbsenGuruContent(att: any, settings: SchoolSettings, formattedDate: string) {
  return (
    <div className="space-y-4">
      <div className="text-center my-3">
        <h3 className="text-base font-bold uppercase underline tracking-wide font-sans">
          BUKTI REKAP KEHADIRAN GURU / GTK TUNGGAL
        </h3>
        <p className="text-xs font-sans text-slate-700 mt-0.5">
          TANGGAL PRESENSI: <span className="font-bold">{att.tanggal || formattedDate}</span>
        </p>
      </div>

      <div className="border border-slate-300 p-4 rounded bg-slate-50/50 space-y-3 font-sans text-xs">
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className="w-40 font-semibold py-1.5 border-b border-slate-200">Nama Pendidik / GTK</td>
              <td className="w-3 py-1.5 border-b border-slate-200">:</td>
              <td className="font-bold text-sm py-1.5 border-b border-slate-200 text-slate-900">{att.namaGuru || att.nama}</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5 border-b border-slate-200">Jabatan / Status</td>
              <td className="py-1.5 border-b border-slate-200">:</td>
              <td className="font-semibold py-1.5 border-b border-slate-200">{att.jabatan || 'Guru Kelas'}</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5 border-b border-slate-200">Status Kehadiran</td>
              <td className="py-1.5 border-b border-slate-200">:</td>
              <td className="font-bold text-sm py-1.5 border-b border-slate-200 text-emerald-800">{att.keterangan || 'Hadir'}</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5 border-b border-slate-200">Waktu Masuk & Pulang</td>
              <td className="py-1.5 border-b border-slate-200">:</td>
              <td className="py-1.5 border-b border-slate-200 font-mono">{att.jamMasuk || '07:15 WIT'} - {att.jamPulang || '12:30 WIT'}</td>
            </tr>
            <tr>
              <td className="font-semibold py-1.5">Keterangan / Kegiatan</td>
              <td className="py-1.5">:</td>
              <td className="py-1.5">{att.kegiatan || 'Mengajar tatap muka dan membimbing siswa di sekolah.'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-8 pt-4 flex justify-between font-sans text-xs">
        <div className="text-center w-52">
          <p>Guru yang Bersangkutan,</p>
          <div className="h-16"></div>
          <p className="font-bold underline uppercase">{att.namaGuru || att.nama}</p>
        </div>

        <div className="text-center w-60">
          <p>Dekai, {formattedDate}</p>
          <p className="font-bold">Kepala Sekolah,</p>
          <div className="h-16"></div>
          <p className="font-bold underline uppercase">{settings.namaKepsek}</p>
          <p className="font-mono text-[10px]">NIP. {settings.nipKepsek}</p>
        </div>
      </div>
    </div>
  );
}
