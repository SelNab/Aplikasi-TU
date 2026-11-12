export type PaperSize = 'A4' | 'F4' | 'Legal' | 'Letter';

export type ThemeColor = 'emerald' | 'blue' | 'indigo' | 'amber' | 'rose' | 'teal' | 'purple' | 'slate';

export type AppDisplaySize = 'kecil' | 'sedang' | 'besar' | 'full';

export interface SchoolSettings {
  namaInstansi: string;
  namaSekolah: string;
  npsn: string;
  nss?: string;
  namaKepsek: string;
  nipKepsek: string;
  operatorTU: string;
  nipOperator: string;
  alamatSekolah: string;
  kecamatan?: string;
  kabupaten?: string;
  provinsi?: string;
  visiMisiSekolah: string;
  visiMisiTU: string;
  tujuanTU: string;
  logoKiri: string; // Base64 or URL
  logoKanan: string; // Base64 or URL
  temaWarna: ThemeColor;
  ukuranKertas: PaperSize;
  ukuranAplikasi?: AppDisplaySize;
  modeKoneksi?: 'Offline' | 'Online';
  googleDriveSyncEnabled?: boolean;
  googleDriveAutoSync?: boolean;
  googleDriveLastSync?: string;
  googleDriveUserEmail?: string;
}

export type StudentStatus = 
  | 'Aktif'
  | 'Lulus' 
  | 'Tidak Lulus' 
  | 'Tahan Kelas' 
  | 'Naik Kelas' 
  | 'Pindah' 
  | 'Meninggal';

export type StudentCategory = 'identitas' | 'baru' | 'mutasi' | 'alumni';

export interface Student {
  id: string;
  nis: string;
  nisn: string;
  nik: string;
  namaSiswa: string;
  namaPanggilan: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: 'L' | 'P';
  agama: 'Kristen Protestan' | 'Katolik' | 'Islam' | 'Hindu' | 'Buddha' | 'Konghucu' | 'Lainnya';
  alamat: string;
  namaAyah: string;
  pekerjaanAyah: string;
  namaIbu: string;
  pekerjaanIbu: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  alamatOrangTua: string;
  noHp: string;
  keterangan: StudentStatus;
  kategori: StudentCategory;
  kelas: string;
  rombel: string;
  foto: string;
  isLocked?: boolean;
  isArchived?: boolean;
  createdAt: string;
}

export type AttendanceStatus = 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';

export interface StudentAttendance {
  id: string;
  tanggal: string;
  kelas: string;
  rombel: string;
  namaSiswa: string;
  namaPanggilan: string;
  jenisKelamin: 'L' | 'P';
  agama: string;
  foto: string;
  keterangan: AttendanceStatus;
  catatan?: string;
  isLocked?: boolean;
}

export type TeacherStatus = 'PNS' | 'PPPK' | 'Honor Daerah' | 'Honor Sekolah';
export type TeacherCondition = 'Aktif' | 'Pensiun' | 'Pindah' | 'Mutasi' | 'Meninggal';

export interface Teacher {
  id: string;
  foto: string;
  nik: string;
  nip: string;
  nuptk: string;
  nama: string;
  tempatLahir: string;
  tanggalLahir: string;
  umur: number;
  pangkatGolongan: string;
  jabatan: 'Kepala Sekolah' | 'Guru Kelas' | 'Guru Mapel' | 'Tendik' | 'Administrasi';
  pendidikanTerakhir: string;
  jurusan: string;
  sertifikasi: 'Belum' | 'Sudah';
  masaKerja: string;
  statusKepegawaian: TeacherStatus;
  riwayatTugas: string;
  keterangan: TeacherCondition;
  isLocked?: boolean;
  isArchived?: boolean;
}

export type TeacherAttendanceStatus = 'Hadir' | 'Izin' | 'Sakit' | 'Cuti' | 'Alpa';

export interface TeacherAttendance {
  id: string;
  no: number;
  tanggal: string;
  nama: string;
  guruKelas: string;
  keterangan: TeacherAttendanceStatus;
  catatan?: string;
  isLocked?: boolean;
}

export type SuratType = 
  | 'Surat Masuk'
  | 'Surat Keluar'
  | 'Surat Dinas Keluar'
  | 'Surat Keterangan Pindah Siswa'
  | 'Surat Keterangan Pindah Guru'
  | 'Surat Keterangan Melaksanakan Tugas'
  | 'Surat Keterangan Lulus Siswa'
  | 'Surat Rekomendasi Guru'
  | 'Surat Rekomendasi Siswa'
  | 'Surat Undangan'
  | 'Surat Pengantar'
  | 'Surat Keputusan Kepala Sekolah'
  | 'Surat Aktif Mengajar'
  | 'Surat Aktif Belajar'
  | 'Surat Undangan Untuk Orang Tua/Wali'
  | 'Surat Peringatan Untuk Siswa'
  | 'Surat Peringatan Untuk Guru'
  | 'Surat Perintah'
  | 'Surat Keterangan Kematian'
  | 'Surat Keterangan Kehilangan Ijazah'
  | 'Surat Keterangan Aktif Wifi Sekolah'
  | 'Surat Permohonan Dana'
  | 'Format Surat Permohonan AI'
  | 'Rekapan Seluruh Surat';

export interface SKLampiranItem {
  no: number;
  nama: string;
  nipNisn: string;
  jabatanKelas: string;
  tugas: string;
  keterangan: string;
}

export interface SuratDocument {
  id: string;
  jenisSurat: SuratType;
  nomorSurat: string;
  tanggalSurat: string;
  perihal: string;
  isiRingkas: string;
  alasanPengirim: string;
  pengirim: string;
  penerima: string;
  keterangan: string;
  fileLampiran?: string;
  isLocked?: boolean;
  isArchived?: boolean;
  // Fields for standard school correspondence administration
  nomorAgenda?: string;
  tanggalTerima?: string;
  alamatPengirim?: string;
  klasifikasi?: string;
  kodeKlasifikasi?: string;
  lampiran?: string;
  diteruskanKepada?: string;
  petunjukDisposisi?: string;
  isiDisposisi?: string;
  catatanDisposisi?: string;
  tanggalDisposisi?: string;
  catatanKepsek?: string;
  tindakLanjut?: string;
  statusSurat?: string;
  penandatangan?: string;
  penanggungJawab?: string;
  petugasPencatat?: string;
  kodeArsip?: string;
  lokasiArsip?: string;
  masaBerlaku?: string;
  sasaran?: string;
  pejabatPenetap?: string;
  skTentang?: string;
  sasaranSk?: string;
  masaBerlakuSk?: string;
  skKesatu?: string;
  skKedua?: string;
  skKetiga?: string;
  skKeempat?: string;
  skMenimbang?: string[] | string;
  skMengingat?: string[] | string;
  skMemutuskan?: string[] | string;
  skLampiran?: SKLampiranItem[];
}

export interface ATKTransaction {
  id: string;
  no?: number;
  kodeBarang?: string;
  tanggal?: string;
  tanggalMasuk?: string;
  tanggalKeluar?: string;
  nama?: string;
  penerima?: string;
  kelas?: string;
  namaBarang: string;
  satuan?: string;
  kategori?: string;
  kondisi?: string;
  jumlah: number;
  hargaSatuan?: number;
  totalHarga?: number;
  paraf?: boolean;
  keterangan?: string;
  isLocked?: boolean;
  isArchived?: boolean;
}

export type AtkItem = ATKTransaction;

export interface LibraryBook {
  id: string;
  no?: number;
  kodeBuku?: string;
  judulBuku: string;
  pengarang: string;
  penerbit: string;
  tahunTerbit: string | number;
  kategori?: string;
  kategoriBuku?: string;
  stok?: number;
  jumlahBuku?: number;
  sumberBuku?: string;
  dipinjam?: number;
  rak?: string;
  nomorRak?: string;
  isLocked?: boolean;
  isArchived?: boolean;
}

export type Book = LibraryBook;

export interface LibraryMember {
  id: string;
  noAnggota: string;
  nama: string;
  jenis: 'Siswa' | 'Guru' | 'Tendik';
  kelas: string;
  tanggalDaftar: string;
  foto: string;
}

export interface LibraryLoan {
  id: string;
  no?: number;
  noAnggota?: string;
  namaPeminjam: string;
  kodeBuku?: string;
  judulBuku: string;
  tglPinjam?: string;
  tanggalPeminjaman?: string;
  tglKembaliRencana?: string;
  tanggalPengembalian?: string;
  tglKembaliAktual?: string;
  kelasUmum?: string;
  jumlah?: number;
  denda?: number;
  status?: 'Dipinjam' | 'Kembali' | 'Terlambat';
  keterangan?: string;
  isLocked?: boolean;
  isArchived?: boolean;
}

export type BookBorrowing = LibraryLoan;

export interface SarprasItem {
  id: string;
  no?: number;
  kodeBarang?: string;
  namaBarang?: string;
  kondisiBarang?: 'Baik' | 'Rusak Ringan' | 'Rusak Berat';
  lokasiBarang?: string;
  barangMasuk?: number;
  barangKeluar?: number;
  barangRusak?: number;
  penghapusanBarang?: number;
  jumlah?: number;
  foto?: string;
  keterangan?: string;
  isLocked?: boolean;
  isArchived?: boolean;
  tanggalPembelianPenerimaan?: string;
  jenisBarangBangunan?: string;
  kondisi?: string;
  ruanganLokasi?: string;
  sumberDana?: string;
}

export interface FinanceRecord {
  id: string;
  no?: number;
  tanggal: string;
  jenis?: 'Penerimaan' | 'Pengeluaran';
  kategoriDana: string;
  uraian: string;
  jumlah?: number;
  penerimaanDebit?: number;
  pengeluaranKredit?: number;
  saldo?: number;
  buktiTransaksi: string;
  pihakTerkait?: string;
  penanggungJawab?: string;
  keterangan?: string;
  isLocked?: boolean;
  isArchived?: boolean;
}

export interface ArchiveDocument {
  id: string;
  judul: string;
  nomorBerkas: string;
  kategori: string;
  tahun: string;
  lokasiFisik: string;
  fileLampiran?: string;
  keterangan: string;
  isLocked?: boolean;
  tanggalUpload: string;
}

export type HariSekolah = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';

export interface JadwalPiketItem {
  id: string;
  hari: HariSekolah;
  koordinatorGuru: string;
  anggotaGuru: string[];
  tugasKhusus: string;
  areaPiket: string;
  petugasKebersihanSiswa: string;
  waktuPiket?: string;
  catatan?: string;
  isLocked?: boolean;
}

export interface JadwalPelajaranItem {
  id: string;
  kelas: string; // 'I', 'II', 'III', 'IV', 'V', 'VI'
  rombel: string; // 'A', 'B'
  hari: HariSekolah;
  jamKe: number;
  waktuMulai: string;
  waktuSelesai: string;
  mataPelajaran: string;
  guruPengampu: string;
  ruangan?: string;
  keterangan?: string;
  isLocked?: boolean;
}

export type KurikulumJenis = 
  | 'Struktur Kurikulum'
  | 'Capaian Pembelajaran (CP)'
  | 'Tujuan Pembelajaran (TP)'
  | 'Modul Ajar'
  | 'Alur Tujuan Pembelajaran (ATP)'
  | 'Program Tahunan (Prota)'
  | 'Program Semester (Prosem)'
  | 'Kalender Pendidikan'
  | 'Modul Projek P5';

export type KelompokMapel = 
  | 'Kelompok A (Wajib/Umum)'
  | 'Kelompok B (Seni & Olahraga)'
  | 'Muatan Lokal'
  | 'Projek Penguatan Profil Pelajar Pancasila (P5)'
  | 'Pilihan / Pendukung';

export interface MataPelajaran {
  id: string;
  kode: string;
  nama: string;
  kelompok: KelompokMapel;
  fase: 'Fase Fondasi (PAUD)' | 'Fase A (Kelas 1-2)' | 'Fase B (Kelas 3-4)' | 'Fase C (Kelas 5-6)' | 'Semua Fase';
  kelasTarget: string;
  alokasiJpPerMinggu: number;
  alokasiJpPerTahun: number;
  kktp: number;
  guruPengampu: string;
  ruangLingkup: string;
  kurikulum: 'Kurikulum Merdeka' | 'Kurikulum 2013' | 'Kombinasi';
  status: 'Aktif' | 'Non-Aktif';
  isLocked?: boolean;
}

export interface KurikulumDocument {
  id: string;
  judul: string;
  jenis: KurikulumJenis;
  fase: 'Fase Fondasi (PAUD)' | 'Fase A (Kelas 1-2)' | 'Fase B (Kelas 3-4)' | 'Fase C (Kelas 5-6)' | 'Semua Fase';
  mataPelajaran: string;
  kelas: string;
  semester: 'Ganjil' | 'Genap' | '1 Tahun Penuh';
  tahunAjaran: string;
  penyusun: string;
  status: 'Draft' | 'Divalidasi' | 'Ditetapkan Kepala Sekolah';
  ringkasan: string;
  alokasiWaktu?: string;
  fileLampiran?: string;
  isLocked?: boolean;
}

export type KalenderKategori =
  | 'Tanggal Penting'
  | 'Hari Libur'
  | 'Jadwal Ujian'
  | 'Rapat & Evaluasi';

export type SemesterAkademik = 'Semester 1 (Ganjil)' | 'Semester 2 (Genap)' | '1 Tahun Penuh';

export interface KalenderAkademikItem {
  id: string;
  tanggalMulai: string; // YYYY-MM-DD
  tanggalSelesai?: string; // YYYY-MM-DD
  kegiatan: string;
  kategori: KalenderKategori;
  semester: SemesterAkademik;
  tahunAjaran: string;
  sasaran: string; // Misal: 'Seluruh Siswa', 'Dewan Guru', 'Kelas VI', 'Kelas I-V'
  keterangan?: string;
  tempat?: string;
  isLibur?: boolean;
  isUjian?: boolean;
  isLocked?: boolean;
}

export type StrukturKategori =
  | 'Kepala Sekolah'
  | 'Komite Sekolah'
  | 'Tata Usaha'
  | 'Urusan / Koordinator'
  | 'Dewan Guru'
  | 'Staf Pendukung';

export interface StrukturOrganisasiItem {
  id: string;
  jabatan: string;
  nama: string;
  nip?: string;
  kategori: StrukturKategori;
  urutan: number;
  tugasUtama: string;
  kontak?: string;
  foto?: string;
  isLocked?: boolean;
}

export interface ProfilSekolahData {
  akreditasi: string;
  kurikulum: string;
  tahunBerdiri: string;
  skPendirian: string;
  emailSekolah: string;
  website?: string;
  telepon: string;
  mottoSekolah: string;
  visiSekolah: string;
  indikatorVisi: string[];
  misiSekolahList: string[];
  tujuanSekolahList: {
    kategori: 'Jangka Pendek (1 Tahun)' | 'Jangka Menengah (4 Tahun)' | 'Jangka Panjang';
    butir: string;
  }[];
  visiTU: string;
  misiTUList: string[];
  tujuanTUList: string[];
  maklumatPelayananTU: string;
  strukturOrganisasi: StrukturOrganisasiItem[];
}
