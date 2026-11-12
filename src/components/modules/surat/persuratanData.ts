import { SuratDocument } from '../../../types';

export interface KlasifikasiItem {
  kode: string;
  klasifikasi: string;
  contoh: string;
}

export interface SubjekKlasifikasiItem {
  kode: string;
  nama: string;
  subjek: 'PEG' | 'SIS' | 'KUR' | 'SAR' | 'KEU';
}

export interface JenisSuratItem {
  no: number;
  nama: string;
  kode: string;
  kategori: 'Guru' | 'Siswa' | 'Sekolah';
}

export interface ArsipItem {
  no: number;
  kodeArsip: string;
  jenisArsip: string;
  tahun: string;
  jumlah: number;
  lokasiPenyimpanan: string;
  retensi: string;
  keterangan: string;
}

export interface RekapBulananItem {
  no: number;
  bulan: string;
  suratMasuk: number;
  suratKeluar: number;
  sk: number;
  suratGuru: number;
  suratSiswa: number;
  suratSekolah: number;
}

// 1. KLASIFIKASI SURAT SEKOLAH 000 - 030
export const KLASIFIKASI_SURAT_000_030: KlasifikasiItem[] = [
  { kode: '000', klasifikasi: 'Umum', contoh: 'Administrasi umum, tata naskah' },
  { kode: '001', klasifikasi: 'Ketatausahaan', contoh: 'Administrasi TU, buku agenda' },
  { kode: '002', klasifikasi: 'Kearsipan', contoh: 'Arsip dan penataan dokumen' },
  { kode: '003', klasifikasi: 'Rapat', contoh: 'Undangan rapat dinas / notulen' },
  { kode: '004', klasifikasi: 'Kepegawaian', contoh: 'Data dan administrasi guru/GTK' },
  { kode: '005', klasifikasi: 'Kedisiplinan', contoh: 'Disiplin guru/siswa' },
  { kode: '006', klasifikasi: 'Kenaikan Pangkat', contoh: 'Dokumen kenaikan pangkat/golongan' },
  { kode: '007', klasifikasi: 'Cuti', contoh: 'Cuti guru, cuti bersalin, cuti tahunan' },
  { kode: '008', klasifikasi: 'Penugasan', contoh: 'Surat tugas dinas luar, diklat' },
  { kode: '009', klasifikasi: 'Evaluasi Pegawai', contoh: 'Penilaian kinerja guru (PKG/SKP)' },
  { kode: '010', klasifikasi: 'Kurikulum', contoh: 'Administrasi kurikulum merdeka' },
  { kode: '011', klasifikasi: 'Pembelajaran', contoh: 'Kegiatan pembelajaran, RPP/Modul' },
  { kode: '012', klasifikasi: 'Penilaian', contoh: 'PH, PTS, PAS, asesmen sumatif' },
  { kode: '013', klasifikasi: 'Kesiswaan', contoh: 'Administrasi data siswa & OSIS' },
  { kode: '014', klasifikasi: 'Mutasi Siswa', contoh: 'Surat pindah masuk/keluar siswa' },
  { kode: '015', klasifikasi: 'Kelulusan', contoh: 'Administrasi kelulusan & SKL' },
  { kode: '016', klasifikasi: 'Ekstrakurikuler', contoh: 'Pramuka, seni, olahraga siswa' },
  { kode: '017', klasifikasi: 'Perpustakaan', contoh: 'Inventaris & peminjaman buku' },
  { kode: '018', klasifikasi: 'Sarana Prasarana', contoh: 'Inventaris & fasilitas gedung' },
  { kode: '019', klasifikasi: 'Keuangan', contoh: 'Administrasi keuangan sekolah' },
  { kode: '020', klasifikasi: 'BOS', contoh: 'Administrasi Dana BOS Reguler/Afirmasi' },
  { kode: '021', klasifikasi: 'Hubungan Masyarakat', contoh: 'Komunikasi komite & masyarakat' },
  { kode: '022', klasifikasi: 'Orang Tua/Wali', contoh: 'Pemberitahuan & pertemuan wali murid' },
  { kode: '023', klasifikasi: 'Kerja Sama', contoh: 'MoU instansi, puskesmas, kepolisian' },
  { kode: '024', klasifikasi: 'Kegiatan Sekolah', contoh: 'Upacara, PHBN, pentas seni' },
  { kode: '025', klasifikasi: 'Ujian/Asesmen', contoh: 'ANBK, asesmen nasional' },
  { kode: '026', klasifikasi: 'Pengawasan', contoh: 'Supervisi pengawas & monev dinas' },
  { kode: '027', klasifikasi: 'Data Sekolah', contoh: 'Dapodik, profil sekolah' },
  { kode: '028', klasifikasi: 'Laporan', contoh: 'Laporan bulanan / semester' },
  { kode: '029', klasifikasi: 'Surat Keterangan', contoh: 'Berbagai surat keterangan resmi' },
  { kode: '030', klasifikasi: 'Surat Keputusan', contoh: 'SK Kepala Sekolah' }
];

// 2. KLASIFIKASI KHUSUS BERDASARKAN SUBJEK
export const KLASIFIKASI_SUBJEK: SubjekKlasifikasiItem[] = [
  // A. GURU/PEGAWAI (PEG)
  { kode: 'PEG-01', nama: 'Data Guru & Pegawai', subjek: 'PEG' },
  { kode: 'PEG-02', nama: 'Surat Tugas Guru', subjek: 'PEG' },
  { kode: 'PEG-03', nama: 'Pembagian Tugas Mengajar', subjek: 'PEG' },
  { kode: 'PEG-04', nama: 'Wali Kelas & Pembina', subjek: 'PEG' },
  { kode: 'PEG-05', nama: 'Cuti Guru & Pegawai', subjek: 'PEG' },
  { kode: 'PEG-06', nama: 'Izin Tugas Kedinasan', subjek: 'PEG' },
  { kode: 'PEG-07', nama: 'Disiplin & Tata Tertib GTK', subjek: 'PEG' },
  { kode: 'PEG-08', nama: 'Penilaian Kinerja GTK', subjek: 'PEG' },
  { kode: 'PEG-09', nama: 'Pengembangan Kompetensi / Diklat', subjek: 'PEG' },
  { kode: 'PEG-10', nama: 'Kepegawaian Lainnya', subjek: 'PEG' },

  // B. SISWA (SIS)
  { kode: 'SIS-01', nama: 'Penerimaan Siswa Baru (PPDB)', subjek: 'SIS' },
  { kode: 'SIS-02', nama: 'Data Pokok Siswa', subjek: 'SIS' },
  { kode: 'SIS-03', nama: 'Siswa Aktif Belajar', subjek: 'SIS' },
  { kode: 'SIS-04', nama: 'Mutasi Masuk Siswa', subjek: 'SIS' },
  { kode: 'SIS-05', nama: 'Mutasi Keluar / Pindah Siswa', subjek: 'SIS' },
  { kode: 'SIS-06', nama: 'Panggilan Orang Tua / Wali', subjek: 'SIS' },
  { kode: 'SIS-07', nama: 'Prestasi & Penghargaan Siswa', subjek: 'SIS' },
  { kode: 'SIS-08', nama: 'Kelulusan Siswa (SKL)', subjek: 'SIS' },
  { kode: 'SIS-09', nama: 'Surat Keterangan Kesiswaan', subjek: 'SIS' },
  { kode: 'SIS-10', nama: 'Kegiatan Siswa & Ekstrakurikuler', subjek: 'SIS' },

  // C. KURIKULUM (KUR)
  { kode: 'KUR-01', nama: 'Kurikulum Operasional Sekolah (KSP)', subjek: 'KUR' },
  { kode: 'KUR-02', nama: 'Jadwal Pelajaran', subjek: 'KUR' },
  { kode: 'KUR-03', nama: 'Pelaksanaan Pembelajaran', subjek: 'KUR' },
  { kode: 'KUR-04', nama: 'Asesmen & Ujian Sekolah', subjek: 'KUR' },
  { kode: 'KUR-05', nama: 'Nilai & Rekapitulasi Akademik', subjek: 'KUR' },
  { kode: 'KUR-06', nama: 'Rapor Siswa', subjek: 'KUR' },
  { kode: 'KUR-07', nama: 'Supervisi Akademik Pembelajaran', subjek: 'KUR' },
  { kode: 'KUR-08', nama: 'Kegiatan Akademik Lainnya', subjek: 'KUR' },

  // D. SARANA PRASARANA (SAR)
  { kode: 'SAR-01', nama: 'Inventaris Sarana Prasarana', subjek: 'SAR' },
  { kode: 'SAR-02', nama: 'Pengadaan Barang & Fasilitas', subjek: 'SAR' },
  { kode: 'SAR-03', nama: 'Pemeliharaan Gedung & Ruang', subjek: 'SAR' },
  { kode: 'SAR-04', nama: 'Penghapusan Aset / Barang Rusak', subjek: 'SAR' },
  { kode: 'SAR-05', nama: 'Alat Tulis Kantor (ATK)', subjek: 'SAR' },
  { kode: 'SAR-06', nama: 'Gedung & Lahan Sekolah', subjek: 'SAR' },
  { kode: 'SAR-07', nama: 'Peralatan Pembelajaran & Media', subjek: 'SAR' },

  // E. KEUANGAN (KEU)
  { kode: 'KEU-01', nama: 'Dana BOS (Bantuan Operasional Sekolah)', subjek: 'KEU' },
  { kode: 'KEU-02', nama: 'Rencana Kegiatan & Anggaran (ARKAS)', subjek: 'KEU' },
  { kode: 'KEU-03', nama: 'Buku Pengeluaran & SPJ', subjek: 'KEU' },
  { kode: 'KEU-04', nama: 'Buku Penerimaan Dana', subjek: 'KEU' },
  { kode: 'KEU-05', nama: 'Laporan Keuangan & Audit', subjek: 'KEU' }
];

// 3. DAFTAR JENIS SURAT GURU (17)
export const DAFTAR_SURAT_GURU: JenisSuratItem[] = [
  { no: 1, nama: 'Surat Tugas Guru', kode: 'STG', kategori: 'Guru' },
  { no: 2, nama: 'Surat Pembagian Tugas', kode: 'PTG', kategori: 'Guru' },
  { no: 3, nama: 'Surat Undangan Rapat Guru', kode: 'URG', kategori: 'Guru' },
  { no: 4, nama: 'Surat Panggilan Guru', kode: 'SPG', kategori: 'Guru' },
  { no: 5, nama: 'Surat Keterangan Aktif Mengajar', kode: 'SKAM', kategori: 'Guru' },
  { no: 6, nama: 'Surat Keterangan Melaksanakan Tugas', kode: 'SKMT', kategori: 'Guru' },
  { no: 7, nama: 'Surat Izin Guru', kode: 'SIG', kategori: 'Guru' },
  { no: 8, nama: 'Surat Cuti Guru', kode: 'SCG', kategori: 'Guru' },
  { no: 9, nama: 'Surat Rekomendasi Guru', kode: 'SRG', kategori: 'Guru' },
  { no: 10, nama: 'Surat Pengantar Guru', kode: 'SPG', kategori: 'Guru' },
  { no: 11, nama: 'Surat Pernyataan Guru', kode: 'SPTG', kategori: 'Guru' },
  { no: 12, nama: 'Surat Penugasan Tambahan', kode: 'SPT', kategori: 'Guru' },
  { no: 13, nama: 'Surat Pembinaan Guru', kode: 'SBG', kategori: 'Guru' },
  { no: 14, nama: 'Surat Keterangan Pengalaman Kerja', kode: 'SKPK', kategori: 'Guru' },
  { no: 15, nama: 'Surat Keputusan Pembagian Tugas', kode: 'SK-PT', kategori: 'Guru' },
  { no: 16, nama: 'SK Wali Kelas', kode: 'SK-WK', kategori: 'Guru' },
  { no: 17, nama: 'SK Panitia Kegiatan', kode: 'SK-PK', kategori: 'Guru' }
];

// 4. DAFTAR JENIS SURAT SISWA (17)
export const DAFTAR_SURAT_SISWA: JenisSuratItem[] = [
  { no: 1, nama: 'Surat Keterangan Siswa Aktif', kode: 'SKSA', kategori: 'Siswa' },
  { no: 2, nama: 'Surat Keterangan Bersekolah', kode: 'SKB', kategori: 'Siswa' },
  { no: 3, nama: 'Surat Keterangan Lulus', kode: 'SKL', kategori: 'Siswa' },
  { no: 4, nama: 'Surat Keterangan Tidak Lulus', kode: 'SKTL', kategori: 'Siswa' },
  { no: 5, nama: 'Surat Pindah Sekolah', kode: 'SPS', kategori: 'Siswa' },
  { no: 6, nama: 'Surat Mutasi Siswa', kode: 'SMS', kategori: 'Siswa' },
  { no: 7, nama: 'Surat Rekomendasi Siswa', kode: 'SRS', kategori: 'Siswa' },
  { no: 8, nama: 'Surat Panggilan Orang Tua', kode: 'SPOT', kategori: 'Siswa' },
  { no: 9, nama: 'Surat Undangan Orang Tua', kode: 'SUOT', kategori: 'Siswa' },
  { no: 10, nama: 'Surat Izin Siswa', kode: 'SIS', kategori: 'Siswa' },
  { no: 11, nama: 'Surat Keterangan Kehadiran', kode: 'SKH', kategori: 'Siswa' },
  { no: 12, nama: 'Surat Keterangan Prestasi', kode: 'SKP', kategori: 'Siswa' },
  { no: 13, nama: 'Surat Keterangan Mengikuti Kegiatan', kode: 'SKMK', kategori: 'Siswa' },
  { no: 14, nama: 'Surat Pernyataan Orang Tua', kode: 'SPOT', kategori: 'Siswa' },
  { no: 15, nama: 'Surat Pengantar Siswa', kode: 'SPS', kategori: 'Siswa' },
  { no: 16, nama: 'Surat Keterangan Kehilangan Dokumen', kode: 'SKKD', kategori: 'Siswa' },
  { no: 17, nama: 'Surat Rekomendasi Melanjutkan Sekolah', kode: 'SRMS', kategori: 'Siswa' }
];

// 5. DAFTAR JENIS SURAT KEPENTINGAN SEKOLAH (20)
export const DAFTAR_SURAT_SEKOLAH: JenisSuratItem[] = [
  { no: 1, nama: 'Surat Undangan', kode: 'UND', kategori: 'Sekolah' },
  { no: 2, nama: 'Surat Tugas', kode: 'ST', kategori: 'Sekolah' },
  { no: 3, nama: 'Surat Edaran', kode: 'SE', kategori: 'Sekolah' },
  { no: 4, nama: 'Surat Pemberitahuan', kode: 'SPB', kategori: 'Sekolah' },
  { no: 5, nama: 'Surat Permohonan', kode: 'SPM', kategori: 'Sekolah' },
  { no: 6, nama: 'Surat Pengantar', kode: 'SPT', kategori: 'Sekolah' },
  { no: 7, nama: 'Surat Keterangan', kode: 'SKET', kategori: 'Sekolah' },
  { no: 8, nama: 'Surat Pernyataan', kode: 'SPTN', kategori: 'Sekolah' },
  { no: 9, nama: 'Surat Rekomendasi', kode: 'SR', kategori: 'Sekolah' },
  { no: 10, nama: 'Surat Permintaan Data', kode: 'SPD', kategori: 'Sekolah' },
  { no: 11, nama: 'Surat Balasan', kode: 'SBL', kategori: 'Sekolah' },
  { no: 12, nama: 'Surat Panggilan', kode: 'SPG', kategori: 'Sekolah' },
  { no: 13, nama: 'Surat Kuasa', kode: 'SKU', kategori: 'Sekolah' },
  { no: 14, nama: 'Surat Perintah', kode: 'SPP', kategori: 'Sekolah' },
  { no: 15, nama: 'Surat Kerja Sama', kode: 'SKS', kategori: 'Sekolah' },
  { no: 16, nama: 'Surat Penawaran', kode: 'SPN', kategori: 'Sekolah' },
  { no: 17, nama: 'Surat Laporan', kode: 'SLP', kategori: 'Sekolah' },
  { no: 18, nama: 'Surat Pengajuan', kode: 'SPJ', kategori: 'Sekolah' },
  { no: 19, nama: 'Surat Izin', kode: 'SIZ', kategori: 'Sekolah' },
  { no: 20, nama: 'Surat Keputusan', kode: 'SK', kategori: 'Sekolah' }
];

// Checkbox Options for Disposisi
export const DISPOSISI_DITERUSKAN_OPTIONS = [
  'Kepala Sekolah',
  'Wakil Kepala Sekolah',
  'Guru',
  'Operator Sekolah',
  'Bendahara',
  'Tata Usaha',
  'Tim/Koordinator',
  'Lainnya'
];

export const DISPOSISI_PETUNJUK_OPTIONS = [
  'Untuk diketahui',
  'Untuk dilaksanakan',
  'Untuk ditindaklanjuti',
  'Untuk dipelajari',
  'Untuk dibuatkan surat balasan',
  'Untuk diarsipkan',
  'Segera dilaksanakan',
  'Lainnya'
];

// INITIAL SAMPLE ARSIP DATA
export const INITIAL_ARSIP_ITEMS: ArsipItem[] = [
  { no: 1, kodeArsip: 'PEG', jenisArsip: 'Kepegawaian & Kinerja GTK', tahun: '2026', jumlah: 25, lokasiPenyimpanan: 'Lemari A / Rak 1', retensi: 'Sesuai ketentuan dinas (5 Th)', keterangan: 'Aktif' },
  { no: 2, kodeArsip: 'SIS', jenisArsip: 'Kesiswaan & Mutasi Murid', tahun: '2026', jumlah: 40, lokasiPenyimpanan: 'Lemari B / Rak 2', retensi: 'Sesuai ketentuan dinas (10 Th)', keterangan: 'Aktif' },
  { no: 3, kodeArsip: 'KUR', jenisArsip: 'Kurikulum, Rapor & Supervisi', tahun: '2026', jumlah: 30, lokasiPenyimpanan: 'Lemari C / Rak 1', retensi: 'Sesuai ketentuan dinas (5 Th)', keterangan: 'Aktif' },
  { no: 4, kodeArsip: 'SAR', jenisArsip: 'Sarpras & Buku Inventaris Aset', tahun: '2026', jumlah: 20, lokasiPenyimpanan: 'Lemari D / Rak 3', retensi: 'Sesuai ketentuan dinas (Permanen)', keterangan: 'Aktif' },
  { no: 5, kodeArsip: 'KEU', jenisArsip: 'Keuangan & Pertanggungjawaban BOS', tahun: '2026', jumlah: 35, lokasiPenyimpanan: 'Lemari E / Rak 2', retensi: 'Sesuai ketentuan dinas (10 Th)', keterangan: 'Aktif' }
];

// INITIAL SAMPLE DATA FOR REVISI ADMINISTRASI SURAT (matching prompt precisely)
export const INITIAL_REVISED_SURAT_DOCS: SuratDocument[] = [
  // A. Surat Masuk
  {
    id: 'sm-001',
    jenisSurat: 'Surat Masuk',
    nomorAgenda: 'SM-001',
    tanggalTerima: '2026-07-02',
    nomorSurat: '800/125/DISDIK',
    tanggalSurat: '2026-07-01',
    pengirim: 'Dinas Pendidikan',
    alamatPengirim: 'Jalan Pendidikan No. 1, Kabupaten',
    penerima: 'Kepala SD Negeri Balil',
    perihal: 'Undangan Rapat Koordinasi Kurikulum',
    klasifikasi: 'UND',
    kodeKlasifikasi: '003',
    lampiran: '1 Berkas',
    diteruskanKepada: 'Kepala Sekolah',
    petunjukDisposisi: 'Untuk dilaksanakan',
    isiDisposisi: 'Kepala Sekolah menghadiri rapat sesuai jadwal di dinas.',
    tanggalDisposisi: '2026-07-02',
    catatanKepsek: 'Siapkan berkas laporan pelaksanaan semester lalu.',
    tindakLanjut: 'Kepala Sekolah menghadiri rapat',
    keterangan: 'Selesai',
    isiRingkas: 'Undangan rapat dinas evaluasi dan koordinasi pelaksanaan kalender pendidikan tahun pelajaran 2026/2027.',
    alasanPengirim: 'Program rutin dinas pendidikan',
    statusSurat: 'Selesai',
    penanggungJawab: 'Kepala Sekolah',
    kodeArsip: 'A-001'
  },
  {
    id: 'sm-002',
    jenisSurat: 'Surat Masuk',
    nomorAgenda: 'SM-002',
    tanggalTerima: '2026-07-04',
    nomorSurat: '421.2/15/SD',
    tanggalSurat: '2026-07-03',
    pengirim: 'SD Negeri ABC',
    alamatPengirim: 'Kampung Tetangga, Distrik',
    penerima: 'Kepala SD Negeri Balil',
    perihal: 'Permohonan Data Siswa Pindahan',
    klasifikasi: 'ADM',
    kodeKlasifikasi: '014',
    lampiran: '2 Lembar',
    diteruskanKepada: 'Tata Usaha',
    petunjukDisposisi: 'Untuk ditindaklanjuti',
    isiDisposisi: 'TU menyiapkan data mutasi dan buku raport asli siswa.',
    tanggalDisposisi: '2026-07-04',
    catatanKepsek: 'Pastikan status Dapodik siswa telah diupdate keluar.',
    tindakLanjut: 'Operator TU menyiapkan surat keterangan mutasi',
    keterangan: 'Diproses',
    isiRingkas: 'Permohonan validasi data peserta didik pindahan atas nama Markus Nabyal.',
    alasanPengirim: 'Kelengkapan berkas mutasi siswa masuk di sekolah penerima',
    statusSurat: 'Diproses',
    penanggungJawab: 'TU',
    kodeArsip: 'A-002'
  },
  {
    id: 'sm-003',
    jenisSurat: 'Surat Masuk',
    nomorAgenda: 'SM-003',
    tanggalTerima: '2026-07-08',
    nomorSurat: '005/07/2026',
    tanggalSurat: '2026-07-07',
    pengirim: 'Pengawas Sekolah',
    alamatPengirim: 'Kantor Pengawas Distrik, Wilayah 3',
    penerima: 'Kepala SD Negeri Balil',
    perihal: 'Jadwal Supervisi Akademik & Manajerial',
    klasifikasi: 'SUP',
    kodeKlasifikasi: '026',
    lampiran: '1 Lembar',
    diteruskanKepada: 'Kepala Sekolah',
    petunjukDisposisi: 'Untuk diketahui',
    isiDisposisi: 'Jadwalkan dewan guru untuk menyiapkan perangkat ajar dan RPP.',
    tanggalDisposisi: '2026-07-08',
    catatanKepsek: 'Informasikan dalam rapat dewan guru tanggal 10 Juli.',
    tindakLanjut: 'Dijadwalkan dalam agenda sekolah',
    keterangan: 'Dijadwalkan',
    isiRingkas: 'Pemberitahuan rencana monitoring dan supervisi akademik pembelajaran semester ganjil.',
    alasanPengirim: 'Tugas pengawasan berkala pengawas sekolah',
    statusSurat: 'Dijadwalkan',
    penanggungJawab: 'Kepala Sekolah',
    kodeArsip: 'A-003'
  },

  // C & E. Surat Keluar & Register Keluar
  {
    id: 'sk-001',
    jenisSurat: 'Surat Keluar',
    nomorAgenda: 'SK-001',
    nomorSurat: '421.2/001/SD-BL/2026',
    tanggalSurat: '2026-07-05',
    penerima: 'Dinas Pendidikan',
    perihal: 'Pengiriman Data Sekolah & Rekapitulasi Dapodik',
    klasifikasi: 'ADM',
    kodeKlasifikasi: 'PEG-01',
    lampiran: '1 Berkas',
    penandatangan: 'Kepala Sekolah',
    penanggungJawab: 'TU',
    pengirim: 'SD Negeri Balil',
    alasanPengirim: 'Kewajiban pelaporan data pokok pendidikan awal tahun ajaran',
    keterangan: 'Terkirim',
    statusSurat: 'Terkirim',
    isiRingkas: 'Penyampaian berkas rekap data kepegawaian guru dan rombel siswa tahun ajaran 2026/2027.',
    kodeArsip: 'A-004'
  },
  {
    id: 'sk-002',
    jenisSurat: 'Surat Keluar',
    nomorAgenda: 'SK-002',
    nomorSurat: '421.2/002/SD-BL/2026',
    tanggalSurat: '2026-07-07',
    penerima: 'Orang Tua Siswa',
    perihal: 'Undangan Pertemuan Awal Tahun Pelajaran',
    klasifikasi: 'UND',
    kodeKlasifikasi: 'SIS-06',
    lampiran: '1 Lembar',
    penandatangan: 'Kepala Sekolah',
    penanggungJawab: 'Guru Kelas',
    pengirim: 'SD Negeri Balil',
    alasanPengirim: 'Sosialisasi program kerja dan kalender akademik sekolah',
    keterangan: 'Terkirim',
    statusSurat: 'Terkirim',
    isiRingkas: 'Undangan kepada seluruh orang tua/wali siswa kelas I s.d VI untuk musyawarah sekolah.',
    kodeArsip: 'A-005'
  },
  {
    id: 'sk-003',
    jenisSurat: 'Surat Keluar',
    nomorAgenda: 'SK-003',
    nomorSurat: '800/003/SD-BL/2026',
    tanggalSurat: '2026-07-10',
    penerima: 'Dewan Guru',
    perihal: 'Pembagian Tugas Mengajar & Bimbingan',
    klasifikasi: 'KEPEG',
    kodeKlasifikasi: 'PEG-03',
    lampiran: '1 Berkas',
    penandatangan: 'Kepala Sekolah',
    penanggungJawab: 'Kepala Sekolah',
    pengirim: 'SD Negeri Balil',
    alasanPengirim: 'Kelancaran proses belajar mengajar tahun ajaran 2026/2027',
    keterangan: 'Selesai',
    statusSurat: 'Selesai',
    isiRingkas: 'Surat resmi penetapan beban mengajar dan tugas tambahan dewan guru SD Negeri Balil.',
    kodeArsip: 'A-006'
  },

  // F & G. Surat Keputusan (SK)
  {
    id: 'sk-kep-001',
    jenisSurat: 'Surat Keputusan Kepala Sekolah',
    nomorAgenda: 'SK-001/SK',
    nomorSurat: '421.2/001/SK/2026',
    tanggalSurat: '2026-07-01',
    perihal: 'Pembagian Tugas Guru Dalam Proses Belajar Mengajar',
    pejabatPenetap: 'Kepala Sekolah',
    sasaran: 'Guru',
    masaBerlaku: '2026/2027',
    keterangan: 'Aktif',
    statusSurat: 'Aktif',
    pengirim: 'SD Negeri Balil',
    penerima: 'Dewan Guru & GTK',
    isiRingkas: 'Surat Keputusan Kepala SD Negeri Balil tentang pembagian tugas guru dalam proses belajar mengajar dan tugas bimbingan tahun pelajaran 2026/2027.',
    alasanPengirim: 'Menjamin kelancaran dan ketertiban proses pembelajaran di SD Negeri Balil.',
    kodeArsip: 'PEG',
    skMenimbang: [
      'Bahwa dalam rangka memperlancar proses belajar mengajar di SD Negeri Balil perlu menetapkan pembagian tugas guru;',
      'Bahwa guru yang namanya tercantum dalam lampiran keputusan ini dipandang cakap dan mampu melaksanakan tugas tersebut;',
      'Bahwa berdasarkan pertimbangan sebagaimana dimaksud pada huruf a dan b, perlu menetapkan Surat Keputusan tentang Pembagian Tugas Guru.'
    ],
    skMengingat: [
      'Undang-Undang Nomor 20 Tahun 2003 tentang Sistem Pendidikan Nasional;',
      'Undang-Undang Nomor 14 Tahun 2005 tentang Guru dan Dosen;',
      'Peraturan Pemerintah Nomor 19 Tahun 2017 tentang Perubahan atas PP 74 Tahun 2008 tentang Guru;',
      'Program Kerja SD Negeri Balil Tahun Pelajaran 2026/2027.'
    ],
    skMemutuskan: [
      'Menetapkan Pembagian Tugas Guru dalam Kegiatan Belajar Mengajar dan Bimbingan pada SD Negeri Balil Tahun Pelajaran 2026/2027 sebagaimana tercantum dalam lampiran keputusan ini.',
      'Masing-masing guru melaporkan pelaksanaan tugasnya secara tertulis dan berkala kepada Kepala Sekolah.',
      'Segala biaya yang timbul akibat pelaksanaan keputusan ini dibebankan pada anggaran yang sesuai.',
      'Keputusan ini mulai berlaku sejak tanggal ditetapkan dengan ketentuan apabila terdapat kekeliruan akan diperbaiki sebagaimana mestinya.'
    ],
    skLampiran: [
      { no: 1, nama: 'Selpius Nabyal, S.Pd.Gr.', nipNisn: '19920415 201903 1 007', jabatanKelas: 'Guru Kelas IV', tugas: 'Wali Kelas & Operator Dapodik', keterangan: 'Aktif' },
      { no: 2, nama: 'Dorkas Sambom, S.Pd.', nipNisn: '19891212 201702 2 004', jabatanKelas: 'Guru Mapel Agama', tugas: 'Guru Mapel PAK & Pembina Pramuka', keterangan: 'Aktif' },
      { no: 3, nama: 'Petrus Matuan, S.Pd.', nipNisn: '19950620 202201 1 003', jabatanKelas: 'Guru Kelas V', tugas: 'Wali Kelas & Pengelola Inventaris', keterangan: 'Aktif' }
    ]
  },
  {
    id: 'sk-kep-002',
    jenisSurat: 'Surat Keputusan Kepala Sekolah',
    nomorAgenda: 'SK-002/SK',
    nomorSurat: '421.2/002/SK/2026',
    tanggalSurat: '2026-07-01',
    perihal: 'Pengangkatan Wali Kelas Tahun Pelajaran 2026/2027',
    pejabatPenetap: 'Kepala Sekolah',
    sasaran: 'Guru',
    masaBerlaku: '2026/2027',
    keterangan: 'Aktif',
    statusSurat: 'Aktif',
    pengirim: 'SD Negeri Balil',
    penerima: 'Guru Wali Kelas I s.d VI',
    isiRingkas: 'Penetapan guru sebagai wali kelas untuk mendampingi dan mengelola administrasi kelas.',
    alasanPengirim: 'Ketertiban pembinaan kesiswaan dan pelaporan rapor',
    kodeArsip: 'PEG'
  },
  {
    id: 'sk-kep-003',
    jenisSurat: 'Surat Keputusan Kepala Sekolah',
    nomorAgenda: 'SK-003/SK',
    nomorSurat: '421.2/003/SK/2026',
    tanggalSurat: '2026-07-02',
    perihal: 'Pembentukan Panitia Kegiatan MPLS & PHBN',
    pejabatPenetap: 'Kepala Sekolah',
    sasaran: 'Guru/TU',
    masaBerlaku: 'Kegiatan',
    keterangan: 'Aktif',
    statusSurat: 'Aktif',
    pengirim: 'SD Negeri Balil',
    penerima: 'Panitia Terpilih',
    isiRingkas: 'Pembentukan susunan kepanitiaan masa pengenalan lingkungan sekolah bagi siswa baru.',
    alasanPengirim: 'Menyambut siswa baru tahun pelajaran 2026/2027',
    kodeArsip: 'SIS'
  },
  {
    id: 'sk-kep-004',
    jenisSurat: 'Surat Keputusan Kepala Sekolah',
    nomorAgenda: 'SK-004/SK',
    nomorSurat: '421.2/004/SK/2026',
    tanggalSurat: '2026-07-05',
    perihal: 'Penetapan Siswa Penerima Bantuan Perlengkapan Sekolah',
    pejabatPenetap: 'Kepala Sekolah',
    sasaran: 'Siswa',
    masaBerlaku: '2026/2027',
    keterangan: 'Aktif',
    statusSurat: 'Aktif',
    pengirim: 'SD Negeri Balil',
    penerima: 'Siswa Penerima Bantuan',
    isiRingkas: 'Penetapan daftar peserta didik yang berhak menerima paket seragam dan alat tulis afirmasi.',
    alasanPengirim: 'Dukungan perlengkapan belajar bagi siswa kurang mampu',
    kodeArsip: 'SIS'
  }
];
