import React, { useState, useMemo, useRef } from 'react';
import {
  Student,
  StudentCategory,
  StudentStatus,
  PaperSize,
  SchoolSettings
} from '../../types';
import { ActionToolbar } from '../ActionToolbar';
import { exportToExcel, exportToWord, exportToPPT, triggerPrint, safeConfirm, safePrompt } from '../../utils/exportHelpers';
import { compressAndResizeImage } from '../../utils/imageHelper';
import { CetakMassalSuratPindahModal, SuratPindahItem } from '../CetakMassalSuratPindahModal';
import { SingleItemPrintModal, SinglePrintModalData } from '../SingleItemPrintModal';
import {
  User,
  Users,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  FileSpreadsheet,
  Lock,
  Archive,
  Image,
  UploadCloud,
  Camera,
  Upload,
  Trash2,
  Printer,
  CheckSquare,
  Square,
  Sparkles,
  Copy,
  ClipboardPaste,
  Download,
  Eye,
  Edit3
} from 'lucide-react';

interface SiswaModuleProps {
  students: Student[];
  onSaveStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onHome: () => void;
  settings: SchoolSettings;
  notifyMessage: (msg?: string) => void;
  onSync: () => void;
}

export const SiswaModule: React.FC<SiswaModuleProps> = ({
  students,
  onSaveStudent,
  onDeleteStudent,
  onHome,
  settings,
  notifyMessage,
  onSync
}) => {
  // Sub-tabs as requested
  const [subTab, setSubTab] = useState<StudentCategory | 'rekapan'>('identitas');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKelas, setFilterKelas] = useState('SEMUA');
  const [viewDetailModal, setViewDetailModal] = useState<Student | null>(null);
  const [paperSize, setPaperSize] = useState<PaperSize>(settings.ukuranKertas);

  const [selectedMutasiIds, setSelectedMutasiIds] = useState<string[]>([]);
  const [showBulkPrintMutasi, setShowBulkPrintMutasi] = useState(false);
  const [bulkPrintMutasiList, setBulkPrintMutasiList] = useState<SuratPindahItem[]>([]);
  const [singlePrintData, setSinglePrintData] = useState<SinglePrintModalData | null>(null);

  const handlePrintSingleStudent = (s: Student) => {
    setSinglePrintData({
      type: 'siswa',
      title: `Buku Induk & Biodata Siswa: ${s.namaSiswa} (NISN: ${s.nisn || '-'})`,
      data: s
    });
    notifyMessage(`Membuka format cetak biodata resmi untuk: ${s.namaSiswa}`);
  };

  const formPhotoInputRef = useRef<HTMLInputElement>(null);
  const modalPhotoInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const emptyForm: Omit<Student, 'id' | 'createdAt'> = {
    nis: '',
    nisn: '',
    nik: '',
    namaSiswa: '',
    namaPanggilan: '',
    tempatLahir: 'Dekai',
    tanggalLahir: '2015-01-01',
    jenisKelamin: 'L',
    agama: 'Kristen Protestan',
    alamat: '',
    namaAyah: '',
    pekerjaanAyah: 'Petani',
    namaIbu: '',
    pekerjaanIbu: 'Ibu Rumah Tangga',
    kecamatan: 'Oksibil',
    kabupaten: 'Pegunungan Bintang',
    provinsi: 'Papua Pegunungan',
    alamatOrangTua: '',
    noHp: '0821',
    keterangan: 'Aktif',
    kategori: 'identitas',
    kelas: 'I',
    rombel: 'I-A',
    foto: '',
    isLocked: false,
    isArchived: false
  };

  const [formData, setFormData] = useState(emptyForm);

  // Filter students based on subTab & search
  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return students.filter((s) => {
      const matchCategory = subTab === 'rekapan' ? true : s.kategori === subTab;
      const matchSearch =
        (s.namaSiswa || '').toLowerCase().includes(q) ||
        (s.nisn || '').includes(searchQuery) ||
        (s.nis || '').includes(searchQuery) ||
        (s.nik || '').includes(searchQuery) ||
        (s.namaPanggilan || '').toLowerCase().includes(q);
      const matchKelas = filterKelas === 'SEMUA' || s.kelas === filterKelas;
      return matchCategory && matchSearch && matchKelas;
    });
  }, [students, subTab, searchQuery, filterKelas]);

  const selectedStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId);
  }, [students, selectedStudentId]);

  // Handle Tab Switch
  const handleSwitchTab = (tab: StudentCategory | 'rekapan') => {
    setSubTab(tab);
    setIsEditing(false);
    setSelectedStudentId(null);
    if (tab !== 'rekapan') {
      let defaultKeterangan: StudentStatus = 'Aktif';
      if (tab === 'mutasi') defaultKeterangan = 'Pindah';
      if (tab === 'alumni') defaultKeterangan = 'Lulus';
      setFormData({
        ...emptyForm,
        kategori: tab,
        keterangan: defaultKeterangan
      });
    }
  };

  // Actions
  const handleAddNew = () => {
    setIsEditing(true);
    setSelectedStudentId(null);
    let defaultKeterangan: StudentStatus = 'Aktif';
    if (subTab === 'mutasi') defaultKeterangan = 'Pindah';
    if (subTab === 'alumni') defaultKeterangan = 'Lulus';
    setFormData({
      ...emptyForm,
      kategori: subTab === 'rekapan' ? 'identitas' : subTab,
      keterangan: defaultKeterangan
    });
    notifyMessage('Formulir Siswa Baru Siap Diisi');
  };

  const handleSave = () => {
    if (!formData.namaSiswa.trim()) {
      notifyMessage('Nama Siswa wajib diisi sesuai standar Dapodik!');
      return;
    }

    const studentToSave: Student = {
      ...formData,
      id: selectedStudentId || `std-${Date.now()}`,
      createdAt: selectedStudent?.createdAt || new Date().toISOString().slice(0, 10)
    };

    onSaveStudent(studentToSave);
    setIsEditing(false);
    setSelectedStudentId(studentToSave.id);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handleSelectStudent = (student: Student) => {
    setSelectedStudentId(student.id);
    setFormData({
      nis: student.nis || '',
      nisn: student.nisn || '',
      nik: student.nik || '',
      namaSiswa: student.namaSiswa || '',
      namaPanggilan: student.namaPanggilan || '',
      tempatLahir: student.tempatLahir || 'Dekai',
      tanggalLahir: student.tanggalLahir || '2015-01-01',
      jenisKelamin: student.jenisKelamin || 'L',
      agama: student.agama || 'Kristen Protestan',
      alamat: student.alamat || '',
      namaAyah: student.namaAyah || '',
      pekerjaanAyah: student.pekerjaanAyah || '',
      namaIbu: student.namaIbu || '',
      pekerjaanIbu: student.pekerjaanIbu || '',
      kecamatan: student.kecamatan || 'Oksibil',
      kabupaten: student.kabupaten || 'Pegunungan Bintang',
      provinsi: student.provinsi || 'Papua Pegunungan',
      alamatOrangTua: student.alamatOrangTua || '',
      noHp: student.noHp || '',
      keterangan: student.keterangan || 'Aktif',
      kategori: student.kategori || 'identitas',
      kelas: student.kelas || 'I',
      rombel: student.rombel || 'I-A',
      foto: student.foto || '',
      isLocked: Boolean(student.isLocked),
      isArchived: Boolean(student.isArchived)
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!selectedStudentId) {
      notifyMessage('Pilih siswa yang akan dihapus terlebih dahulu.');
      return;
    }
    if (selectedStudent?.isLocked) {
      notifyMessage('Data siswa terkunci! Buka kunci data terlebih dahulu untuk menghapus.');
      return;
    }
    if (safeConfirm(`Yakin ingin menghapus data siswa: ${formData.namaSiswa}?`)) {
      onDeleteStudent(selectedStudentId);
      setSelectedStudentId(null);
      setIsEditing(false);
      setFormData(emptyForm);
      notifyMessage('Data Siswa Berhasil Dihapus');
    }
  };

  const handleToggleLock = () => {
    if (!selectedStudentId) {
      setFormData(prev => ({ ...prev, isLocked: !prev.isLocked }));
      notifyMessage(formData.isLocked ? 'Kunci Data Dibuka' : 'Data Anda Berhasil Dikunci');
      return;
    }
    if (selectedStudent) {
      const updated: Student = { ...selectedStudent, isLocked: !selectedStudent.isLocked };
      onSaveStudent(updated);
      setFormData(prev => ({ ...prev, isLocked: updated.isLocked }));
      notifyMessage(updated.isLocked ? 'Data Anda Berhasil Dikunci' : 'Kunci Data Dibuka');
    }
  };

  const handleToggleArchive = () => {
    if (!selectedStudentId) {
      setFormData(prev => ({ ...prev, isArchived: !prev.isArchived }));
      notifyMessage('Data Anda Berhasil Disimpan');
      return;
    }
    if (selectedStudent) {
      const updated: Student = { ...selectedStudent, isArchived: !selectedStudent.isArchived };
      onSaveStudent(updated);
      setFormData(prev => ({ ...prev, isArchived: updated.isArchived }));
      notifyMessage(updated.isArchived ? 'Data Anda Berhasil Disimpan ke Arsip' : 'Data Dikeluarkan dari Arsip');
    }
  };

  const handleUploadPhoto = (base64: string) => {
    setFormData(prev => ({ ...prev, foto: base64 }));
    if (selectedStudentId && selectedStudent) {
      onSaveStudent({ ...selectedStudent, foto: base64 });
    }
    notifyMessage('Foto Siswa Berhasil Disimpan');
  };

  const handleFormPhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compressAndResizeImage(file, 400, 500, 0.88);
      handleUploadPhoto(base64);
    } catch (err: any) {
      notifyMessage(err?.message || 'Gagal memproses foto siswa');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handleModalPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !viewDetailModal) return;
    try {
      const base64 = await compressAndResizeImage(file, 400, 500, 0.88);
      const updatedStudent: Student = { ...viewDetailModal, foto: base64 };
      setViewDetailModal(updatedStudent);
      onSaveStudent(updatedStudent);
      notifyMessage(`Foto Siswa ${updatedStudent.namaSiswa} Berhasil Diunggah & Disimpan`);
    } catch (err: any) {
      notifyMessage(err?.message || 'Gagal memproses foto siswa');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handleRemoveModalPhoto = () => {
    if (!viewDetailModal) return;
    const updatedStudent: Student = { ...viewDetailModal, foto: '' };
    setViewDetailModal(updatedStudent);
    onSaveStudent(updatedStudent);
    notifyMessage(`Foto Siswa ${updatedStudent.namaSiswa} Berhasil Dihapus`);
  };

  // Bulk mutasi selection & print handlers
  const handleToggleMutasiSelect = (id: string) => {
    setSelectedMutasiIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAllMutasi = () => {
    if (selectedMutasiIds.length === filteredStudents.length && filteredStudents.length > 0) {
      setSelectedMutasiIds([]);
    } else {
      setSelectedMutasiIds(filteredStudents.map(s => s.id));
    }
  };

  const handleOpenBulkPrintMutasi = () => {
    let targetStudents = students.filter(s => selectedMutasiIds.includes(s.id));
    if (targetStudents.length === 0) {
      targetStudents = filteredStudents;
    }

    if (targetStudents.length === 0) {
      notifyMessage('Tidak ada siswa mutasi yang dipilih!');
      return;
    }

    const items: SuratPindahItem[] = targetStudents.map((st) => ({
      id: `mut-${st.id}`,
      nomorSurat: `421.2/${Math.floor(Math.random() * 800 + 100)}/SD-DKI/MUT/${new Date().getFullYear()}`,
      tanggalSurat: new Date().toISOString().slice(0, 10),
      namaSiswa: st.namaSiswa,
      nis: st.nis,
      nisn: st.nisn,
      nik: st.nik,
      tempatLahir: st.tempatLahir,
      tanggalLahir: st.tanggalLahir,
      jenisKelamin: st.jenisKelamin,
      agama: st.agama,
      kelas: st.kelas,
      rombel: st.rombel,
      namaAyah: st.namaAyah,
      pekerjaanAyah: st.pekerjaanAyah,
      namaIbu: st.namaIbu,
      alamat: st.alamat || st.alamatOrangTua || 'Baalil, Kab. Pegunungan Bintang',
      sekolahTujuan: 'SD Negeri Kotaraja, Jayapura',
      alasanPindah: 'Mengikuti orang tua / wali yang pindah domisili atau tugas kerja.',
      keteranganLampiran: 'Buku Raport Asli dan Surat Keterangan Pindah Dapodik'
    }));

    setBulkPrintMutasiList(items);
    setShowBulkPrintMutasi(true);
    notifyMessage(`Menyiapkan Format Cetak Surat Pindah untuk ${items.length} Siswa`);
  };

  // Export handlers
  const handleExcelExport = () => {
    const headers = [
      'No',
      'NIS',
      'NISN',
      'NIK',
      'Nama Siswa',
      'Panggilan',
      'L/P',
      'Kelas',
      'Rombel',
      'Tempat, Tgl Lahir',
      'Agama',
      'Alamat',
      'Nama Ayah',
      'Nama Ibu',
      'No HP',
      'Status / Keterangan',
      'Kategori'
    ];

    const rows = filteredStudents.map((s, idx) => [
      idx + 1,
      s.nis,
      s.nisn,
      s.nik,
      s.namaSiswa,
      s.namaPanggilan,
      s.jenisKelamin,
      s.kelas,
      s.rombel,
      `${s.tempatLahir}, ${s.tanggalLahir}`,
      s.agama,
      s.alamat,
      s.namaAyah,
      s.namaIbu,
      s.noHp,
      s.keterangan,
      s.kategori
    ]);

    exportToExcel(`Rekapan_Data_Siswa_${subTab.toUpperCase()}`, headers, rows);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handleWordExport = () => {
    const content = `
      <div class="kop">
        <h2>${settings.namaInstansi}</h2>
        <h1>${settings.namaSekolah}</h1>
        <p>${settings.alamatSekolah} | NPSN: ${settings.npsn}</p>
        <hr />
        <h3>REKAPITULASI DATA PESERTA DIDIK (STANDAR DAPODIK)</h3>
        <p>Kategori: ${subTab.toUpperCase()} | Dicetak: ${new Date().toLocaleDateString('id-ID')}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>NIS/NISN</th>
            <th>Nama Lengkap</th>
            <th>L/P</th>
            <th>Kelas</th>
            <th>Tempat, Tanggal Lahir</th>
            <th>Orang Tua</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${filteredStudents.map((s, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${s.nis} / ${s.nisn}</td>
              <td><b>${s.namaSiswa}</b></td>
              <td>${s.jenisKelamin}</td>
              <td>${s.kelas} (${s.rombel})</td>
              <td>${s.tempatLahir}, ${s.tanggalLahir}</td>
              <td>Ayah: ${s.namaAyah} | Ibu: ${s.namaIbu}</td>
              <td>${s.keterangan}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="footer">
        <p align="right">
          Dekai, ${new Date().toLocaleDateString('id-ID')}<br/>
          Kepala Sekolah,<br/><br/><br/>
          <b><u>${settings.namaKepsek}</u></b><br/>
          NIP. ${settings.nipKepsek}
        </p>
      </div>
    `;
    exportToWord(`Data_Siswa_${subTab}`, content);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handlePPTExport = () => {
    const slides = [
      {
        title: `LAPORAN DATA SISWA - ${settings.namaSekolah}`,
        subtitle: `Wilayah Pedalaman Papua Pegunungan | Kurikulum Merdeka & Dapodik`,
        bullets: [
          `Total Siswa Terdata: ${filteredStudents.length} Siswa`,
          `Kategori Aktif: ${subTab.toUpperCase()}`,
          `Operator Pendata: ${settings.operatorTU}`,
          `Kepala Sekolah: ${settings.namaKepsek}`,
          `Tanggal Rekap: ${new Date().toLocaleDateString('id-ID')}`
        ]
      },
      {
        title: 'Ringkasan Berdasarkan Rombel & Kategori',
        bullets: [
          `Siswa Laki-laki: ${filteredStudents.filter(s => s.jenisKelamin === 'L').length} Orang`,
          `Siswa Perempuan: ${filteredStudents.filter(s => s.jenisKelamin === 'P').length} Orang`,
          `Siswa Aktif: ${filteredStudents.filter(s => s.keterangan === 'Aktif').length} Orang`,
          `Siswa Lulus / Alumni: ${filteredStudents.filter(s => s.keterangan === 'Lulus').length} Orang`,
          `Siswa Mutasi / Pindah: ${filteredStudents.filter(s => s.keterangan === 'Pindah').length} Orang`
        ]
      }
    ];
    exportToPPT(`Presentasi_Data_Siswa_${subTab}`, slides);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handleLoadTemplate = () => {
    setFormData({
      nis: '1050',
      nisn: '0149928192',
      nik: '9503010101150001',
      namaSiswa: 'Yohanes Nabyal',
      namaPanggilan: 'Yo',
      tempatLahir: 'Dekai',
      tanggalLahir: '2015-06-10',
      jenisKelamin: 'L',
      agama: 'Kristen Protestan',
      alamat: 'Jl. Pemukiman Kampung Kospaki',
      namaAyah: 'Simon Nabyal',
      pekerjaanAyah: 'Petani / Pekebun',
      namaIbu: 'Sara Heluka',
      pekerjaanIbu: 'Ibu Rumah Tangga',
      kecamatan: 'Oksibil',
      kabupaten: 'Pegunungan Bintang',
      provinsi: 'Papua Pegunungan',
      alamatOrangTua: 'Kampung Baalil, Distrik Oksibil',
      noHp: '0821993391',
      keterangan: 'Aktif',
      kategori: subTab === 'rekapan' ? 'identitas' : subTab,
      kelas: 'III',
      rombel: 'III-A',
      foto: '',
      isLocked: false,
      isArchived: false
    });
    setIsEditing(true);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handleCopySiswa = async () => {
    const s = selectedStudent || formData;
    const text = `DATA PESERTA DIDIK (DAPODIK)
Nama Siswa    : ${s.namaSiswa || '-'} (${s.namaPanggilan || '-'})
NISN / NIS    : ${s.nisn || '-'} / ${s.nis || '-'}
Tempat, Tgl   : ${s.tempatLahir || '-'}, ${s.tanggalLahir || '-'}
Jenis Kelamin : ${s.jenisKelamin === 'L' ? 'Laki-Laki' : 'Perempuan'}
Kelas / Rombel: Kelas ${s.kelas} ${s.rombel}
Nama Ayah/Ibu : ${s.namaAyah || '-'} / ${s.namaIbu || '-'}
Alamat        : ${s.alamat || '-'}
Status        : ${s.keterangan || '-'}`;

    try {
      await navigator.clipboard.writeText(text);
      notifyMessage(`Data Siswa "${s.namaSiswa || 'Siswa'}" Berhasil Di-copy ke Clipboard!`);
    } catch {
      notifyMessage('Data Siswa Berhasil Di-copy!');
    }
  };

  const handlePasteSiswa = async () => {
    try {
      let text = '';
      if (navigator.clipboard && navigator.clipboard.readText) {
        text = await navigator.clipboard.readText();
      }
      if (!text) {
        text = safePrompt('Tempelkan Nama Siswa atau Data Siswa:', '') || '';
      }
      if (text) {
        setFormData(prev => ({
          ...prev,
          namaSiswa: prev.namaSiswa ? prev.namaSiswa : text.trim()
        }));
        setIsEditing(true);
        notifyMessage('Data Berhasil Di-paste ke Form Siswa!');
      }
    } catch {
      notifyMessage('Silakan tempel data secara manual.');
    }
  };

  const handleExportSiswa = () => {
    handleExcelExport();
    notifyMessage('Data Siswa Berhasil Di-ekspor!');
  };

  const handleImportSiswa = () => {
    const input = safePrompt('Impor Data Siswa (Tempelkan data JSON / CSV / Nama):', '');
    if (input) {
      try {
        const parsed = JSON.parse(input);
        if (parsed.namaSiswa) {
          setFormData(prev => ({ ...prev, ...parsed }));
          setIsEditing(true);
          notifyMessage('Data Siswa Berhasil Di-impor!');
          return;
        }
      } catch {
        setFormData(prev => ({ ...prev, namaSiswa: input }));
        setIsEditing(true);
        notifyMessage(`Nama siswa berhasil diimpor: ${input}`);
      }
    } else {
      notifyMessage('Impor Data Siswa Siap.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Sub Menu Tabs as explicitly specified */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-2 no-print">
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => handleSwitchTab('identitas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subTab === 'identitas'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Form Data Identitas Siswa
          </button>
          <button
            type="button"
            onClick={() => handleSwitchTab('baru')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subTab === 'baru'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Form Data Siswa Baru
          </button>
          <button
            type="button"
            onClick={() => handleSwitchTab('mutasi')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subTab === 'mutasi'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Form Data Mutasi Siswa
          </button>
          <button
            type="button"
            onClick={() => handleSwitchTab('alumni')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subTab === 'alumni'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Form Data Alumni
          </button>
          <button
            type="button"
            onClick={() => handleSwitchTab('rekapan')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subTab === 'rekapan'
                ? 'bg-emerald-800 text-white ring-2 ring-emerald-400'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300'
            }`}
          >
            Rekapan Data Siswa Seluruhnya (Semua Kelas)
          </button>
        </div>

        <div className="text-xs font-semibold text-slate-600">
          Total Terdata: <span className="text-emerald-700 font-bold">{filteredStudents.length} Siswa</span>
        </div>
      </div>

      {/* Mandatory Standard Action Toolbar */}
      <ActionToolbar
        titleContext={`DATA SISWA > ${subTab.toUpperCase()}`}
        onHome={onHome}
        onAddNew={handleAddNew}
        onSave={handleSave}
        onView={() => {
          if (selectedStudent) setViewDetailModal(selectedStudent);
          else if (filteredStudents.length > 0) setViewDetailModal(filteredStudents[0]);
          else notifyMessage('Belum ada data siswa yang dipilih');
        }}
        onDelete={handleDelete}
        onSearch={() => {
          const q = safePrompt('Masukkan Nama, NIS, NISN, atau NIK Siswa yang dicari:', searchQuery);
          if (q !== null) setSearchQuery(q);
        }}
        onEdit={() => {
          if (!selectedStudentId) {
            notifyMessage('Pilih siswa dari daftar terlebih dahulu untuk diedit.');
            return;
          }
          setIsEditing(true);
        }}
        onCancel={() => {
          setIsEditing(false);
          if (selectedStudent) handleSelectStudent(selectedStudent);
          else setFormData(emptyForm);
        }}
        onBack={onHome}
        onArchive={handleToggleArchive}
        onLock={handleToggleLock}
        onReview={() => {
          if (selectedStudent) setViewDetailModal(selectedStudent);
          else notifyMessage('Pilih siswa untuk direview');
        }}
        onPrint={triggerPrint}
        onPrintSingle={() => {
          if (selectedStudent) {
            handlePrintSingleStudent(selectedStudent);
          } else if (filteredStudents.length > 0) {
            handlePrintSingleStudent(filteredStudents[0]);
          } else {
            notifyMessage('Pilih siswa dari tabel terlebih dahulu untuk dicetak');
          }
        }}
        onUpdate={handleSave}
        onTemplate={handleLoadTemplate}
        onPdf={triggerPrint}
        onExcel={handleExcelExport}
        onWord={handleWordExport}
        onPpt={handlePPTExport}
        onExport={handleExportSiswa}
        onImport={handleImportSiswa}
        onCopy={handleCopySiswa}
        onPaste={handlePasteSiswa}
        onUploadPhoto={handleUploadPhoto}
        onRefresh={() => notifyMessage('Data Anda Berhasil Disimpan')}
        onSync={onSync}
        onReset={() => {
          setFormData(emptyForm);
          setIsEditing(true);
        }}
        isLocked={formData.isLocked}
        isArchived={formData.isArchived}
        paperSize={paperSize}
        onChangePaperSize={(size) => setPaperSize(size)}
        notifyMessage={notifyMessage}
      />

      {/* Main Content Area: Form & List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Side: Form Data Identitas Siswa (Dapodik Standard) */}
        {subTab !== 'rekapan' && (
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800 uppercase">
                    {subTab === 'identitas' && 'Form Data Identitas Siswa (Dapodik)'}
                    {subTab === 'baru' && 'Form Data Siswa Baru'}
                    {subTab === 'mutasi' && 'Form Data Mutasi Siswa (Pindah)'}
                    {subTab === 'alumni' && 'Form Data Alumni Siswa'}
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Sesuai format resmi Data Pokok Pendidikan Kemendikbudristek
                  </p>
                </div>
              </div>
              <span className={`text-[11px] px-2 py-0.5 rounded font-bold ${
                isEditing ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {isEditing ? 'Mode Edit / Input' : 'Mode Pratinjau'}
              </span>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 text-xs">
              {/* Photo & Basic Row */}
              <div className="flex flex-col sm:flex-row gap-4 items-start bg-slate-50 p-3 rounded-lg border border-slate-200">
                <input
                  ref={formPhotoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFormPhotoFileChange}
                />
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    onClick={() => formPhotoInputRef.current?.click()}
                    className="w-24 h-28 border-2 border-dashed border-emerald-400 hover:border-emerald-600 rounded-lg bg-white flex flex-col items-center justify-center overflow-hidden relative cursor-pointer group shadow-xs transition-colors"
                    title="Klik untuk Upload Foto Siswa"
                  >
                    {formData.foto && formData.foto.trim() ? (
                      <img
                        src={formData.foto}
                        alt="Pas Foto Siswa"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="text-center p-1 text-slate-400">
                        <Image className="w-6 h-6 mx-auto text-emerald-600" />
                        <span className="text-[9px] block mt-1 font-semibold text-slate-600">Pas Foto 3x4</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-slate-900/75 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-4 h-4 text-amber-300 mb-0.5" />
                      <span className="text-[8px] font-bold">Ganti Foto</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => formPhotoInputRef.current?.click()}
                    className="mt-1.5 w-24 py-1 px-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[10px] font-bold inline-flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-xs"
                  >
                    <Camera className="w-3 h-3" />
                    <span>Upload Foto</span>
                  </button>
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
                  <div>
                    <label className="font-bold text-slate-700 block mb-0.5">Kelas / Tingkat</label>
                    <select
                      value={formData.kelas}
                      disabled={!isEditing}
                      onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="I">Kelas I (Satu)</option>
                      <option value="II">Kelas II (Dua)</option>
                      <option value="III">Kelas III (Tiga)</option>
                      <option value="IV">Kelas IV (Empat)</option>
                      <option value="V">Kelas V (Lima)</option>
                      <option value="VI">Kelas VI (Enam)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-0.5">Rombongan Belajar (Rombel)</label>
                    <input
                      type="text"
                      value={formData.rombel || ''}
                      disabled={!isEditing}
                      onChange={(e) => setFormData({ ...formData, rombel: e.target.value })}
                      placeholder="Contoh: IV-A"
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-0.5">Nomor Induk Siswa (NIS)</label>
                    <input
                      type="text"
                      value={formData.nis || ''}
                      disabled={!isEditing}
                      onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                      placeholder="Nomor Induk Sekolah"
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-0.5">NISN (10 Digit Dapodik)</label>
                    <input
                      type="text"
                      value={formData.nisn || ''}
                      disabled={!isEditing}
                      onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                      placeholder="Nomor Induk Siswa Nasional"
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs font-mono font-bold text-emerald-800"
                    />
                  </div>
                </div>
              </div>

              {/* Identity Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-0.5">NIK (Kependudukan / KK)</label>
                  <input
                    type="text"
                    value={formData.nik || ''}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    placeholder="16 Digit NIK dari Kartu Keluarga"
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-0.5">Nama Panggilan</label>
                  <input
                    type="text"
                    value={formData.namaPanggilan || ''}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({ ...formData, namaPanggilan: e.target.value })}
                    placeholder="Nama akrab/panggilan"
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-0.5">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  value={formData.namaSiswa || ''}
                  disabled={!isEditing}
                  onChange={(e) => setFormData({ ...formData, namaSiswa: e.target.value })}
                  placeholder="Nama lengkap sesuai akta / Kartu Keluarga"
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-0.5">Tempat Lahir</label>
                  <input
                    type="text"
                    value={formData.tempatLahir || ''}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })}
                    placeholder="Contoh: Dekai, Wamena, Jayapura"
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-0.5">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={formData.tanggalLahir || ''}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-0.5">Jenis Kelamin</label>
                  <select
                    value={formData.jenisKelamin || 'L'}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value as 'L' | 'P' })}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs font-semibold"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-0.5">Agama</label>
                  <select
                    value={formData.agama || 'Kristen Protestan'}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({ ...formData, agama: e.target.value as any })}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs font-medium"
                  >
                    <option value="Kristen Protestan">Kristen Protestan</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Islam">Islam</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Konghucu">Konghucu</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-0.5">No. HP / WhatsApp Orang Tua</label>
                  <input
                    type="text"
                    value={formData.noHp || ''}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                    placeholder="0821..."
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-0.5">Alamat Tempat Tinggal Siswa</label>
                <input
                  type="text"
                  value={formData.alamat || ''}
                  disabled={!isEditing}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  placeholder="Kampung / Jalan / RT-RW"
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs"
                />
              </div>

              {/* Data Orang Tua / Wali */}
              <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-200/80 space-y-2.5">
                <h3 className="font-bold text-emerald-900 text-xs flex items-center gap-1.5 uppercase">
                  <Users className="w-3.5 h-3.5 text-emerald-700" />
                  Data Orang Tua / Wali Peserta Didik
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-0.5">Nama Ayah Kandung</label>
                    <input
                      type="text"
                      value={formData.namaAyah || ''}
                      disabled={!isEditing}
                      onChange={(e) => setFormData({ ...formData, namaAyah: e.target.value })}
                      placeholder="Nama Ayah"
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-0.5">Pekerjaan Ayah</label>
                    <input
                      type="text"
                      value={formData.pekerjaanAyah || ''}
                      disabled={!isEditing}
                      onChange={(e) => setFormData({ ...formData, pekerjaanAyah: e.target.value })}
                      placeholder="Petani / PNS / Wiraswasta"
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-0.5">Nama Ibu Kandung</label>
                    <input
                      type="text"
                      value={formData.namaIbu || ''}
                      disabled={!isEditing}
                      onChange={(e) => setFormData({ ...formData, namaIbu: e.target.value })}
                      placeholder="Nama Ibu"
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-0.5">Pekerjaan Ibu</label>
                    <input
                      type="text"
                      value={formData.pekerjaanIbu || ''}
                      disabled={!isEditing}
                      onChange={(e) => setFormData({ ...formData, pekerjaanIbu: e.target.value })}
                      placeholder="Ibu Rumah Tangga / Petani / Guru"
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-0.5">Kecamatan / Distrik</label>
                    <input
                      type="text"
                      value={formData.kecamatan || ''}
                      disabled={!isEditing}
                      onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
                      placeholder="Dekai"
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-0.5">Kabupaten</label>
                    <input
                      type="text"
                      value={formData.kabupaten || ''}
                      disabled={!isEditing}
                      onChange={(e) => setFormData({ ...formData, kabupaten: e.target.value })}
                      placeholder="Pegunungan Bintang"
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-0.5">Provinsi</label>
                    <input
                      type="text"
                      value={formData.provinsi || ''}
                      disabled={!isEditing}
                      onChange={(e) => setFormData({ ...formData, provinsi: e.target.value })}
                      placeholder="Papua Pegunungan"
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-0.5">Alamat Lengkap Orang Tua</label>
                  <input
                    type="text"
                    value={formData.alamatOrangTua || ''}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({ ...formData, alamatOrangTua: e.target.value })}
                    placeholder="Alamat lengkap domisili orang tua"
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs"
                  />
                </div>
              </div>

              {/* Status / Keterangan as requested: Lulus/Tidak Lulus/tahan kelas/Naik kelas/Pindah/meninggal */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Keterangan Status Siswa
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    'Aktif',
                    'Naik kelas',
                    'tahan kelas',
                    'Lulus',
                    'Tidak Lulus',
                    'Pindah',
                    'meninggal'
                  ].map((status) => (
                    <label
                      key={status}
                      className={`flex items-center gap-1.5 p-2 rounded border cursor-pointer transition-colors ${
                        (formData.keterangan || '').toLowerCase() === (status || '').toLowerCase()
                          ? 'bg-emerald-100 border-emerald-600 text-emerald-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="keterangan_siswa"
                        value={status}
                        disabled={!isEditing}
                        checked={(formData.keterangan || '').toLowerCase() === (status || '').toLowerCase()}
                        onChange={() => setFormData({ ...formData, keterangan: status as any })}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="capitalize">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Bottom Quick Save Button */}
              {isEditing && (
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow transition-colors flex items-center gap-1.5 text-xs"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Simpan Data Siswa
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right Side: Table / Data List / Rekapan */}
        <div className={`${subTab === 'rekapan' ? 'lg:col-span-12' : 'lg:col-span-5'} bg-white rounded-xl border border-slate-200 shadow-sm p-4`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200">
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase">
                {subTab === 'rekapan'
                  ? 'Rekapan Data Siswa Seluruhnya (Semua Kelas)'
                  : `Daftar Data Siswa (${subTab.toUpperCase()})`}
              </h2>
              <p className="text-[11px] text-slate-500">
                Klik pada baris data untuk melihat detail atau memilih
              </p>
            </div>

            {/* Filter Kelas */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600">Filter:</span>
              <select
                value={filterKelas}
                onChange={(e) => setFilterKelas(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs font-semibold"
              >
                <option value="SEMUA">Semua Kelas</option>
                <option value="I">Kelas I</option>
                <option value="II">Kelas II</option>
                <option value="III">Kelas III</option>
                <option value="IV">Kelas IV</option>
                <option value="V">Kelas V</option>
                <option value="VI">Kelas VI</option>
              </select>
            </div>
          </div>

          {/* Action Toolbar khusus Mutasi / Surat Pindah Siswa */}
          {subTab === 'mutasi' && (
            <div className="mb-3 p-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 rounded-lg flex flex-wrap items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-700 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  {selectedMutasiIds.length} Siswa Dipilih
                </span>
                <span className="text-xs font-bold text-emerald-950">
                  Cetak Massal Format Surat Keterangan Pindah
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleToggleSelectAllMutasi}
                  className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {selectedMutasiIds.length === filteredStudents.length && filteredStudents.length > 0 ? (
                    <>
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-700" /> Batal Pilih
                    </>
                  ) : (
                    <>
                      <Square className="w-3.5 h-3.5 text-slate-500" /> Pilih Semua
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleOpenBulkPrintMutasi}
                  className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Cetak format surat keterangan pindah siswa massal"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Cetak Format Massal ({selectedMutasiIds.length > 0 ? selectedMutasiIds.length : filteredStudents.length})
                </button>
              </div>
            </div>
          )}

          {/* Search Box */}
          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama siswa, NIS, NISN, atau NIK..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-[580px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold sticky top-0 z-10 border-b border-slate-200">
                <tr>
                  {subTab === 'mutasi' && (
                    <th className="p-2 w-7 text-center">
                      <input
                        type="checkbox"
                        checked={filteredStudents.length > 0 && selectedMutasiIds.length === filteredStudents.length}
                        onChange={handleToggleSelectAllMutasi}
                        className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        title="Pilih / Batalkan semua siswa mutasi"
                      />
                    </th>
                  )}
                  <th className="p-2 w-8 text-center">No</th>
                  <th className="p-2">Foto</th>
                  <th className="p-2">Nama Siswa</th>
                  <th className="p-2">NIS / NISN</th>
                  <th className="p-2">Kls/Rombel</th>
                  <th className="p-2">L/P</th>
                  <th className="p-2">Status</th>
                  {subTab === 'rekapan' && (
                    <>
                      <th className="p-2">NIK</th>
                      <th className="p-2">Tempat, Tgl Lahir</th>
                      <th className="p-2">Orang Tua</th>
                      <th className="p-2">No. HP</th>
                    </>
                  )}
                  <th className="p-2 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={subTab === 'rekapan' ? 12 : subTab === 'mutasi' ? 9 : 8} className="p-6 text-center text-slate-400">
                      Tidak ada data siswa yang cocok dengan kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s, idx) => {
                    const isSelected = s.id === selectedStudentId;
                    const isMutasiChecked = selectedMutasiIds.includes(s.id);
                    return (
                      <tr
                        key={s.id}
                        onClick={() => handleSelectStudent(s)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-emerald-50 font-medium'
                            : isMutasiChecked && subTab === 'mutasi'
                            ? 'bg-teal-50/60'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        {subTab === 'mutasi' && (
                          <td className="p-2 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isMutasiChecked}
                              onChange={() => handleToggleMutasiSelect(s.id)}
                              className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                              title="Pilih siswa ini untuk cetak massal"
                            />
                          </td>
                        )}
                        <td className="p-2 text-center text-slate-500">{idx + 1}</td>
                        <td className="p-2">
                          <div className="w-7 h-7 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center border border-slate-300">
                            {s.foto && s.foto.trim() ? (
                              <img src={s.foto} alt={s.namaSiswa} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <User className="w-3.5 h-3.5 text-slate-500" />
                            )}
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="font-bold text-slate-900">{s.namaSiswa}</div>
                          <div className="text-[10px] text-slate-500">Panggilan: {s.namaPanggilan}</div>
                        </td>
                        <td className="p-2 font-mono">
                          <div>{s.nis}</div>
                          <div className="text-[10px] text-emerald-700 font-semibold">{s.nisn}</div>
                        </td>
                        <td className="p-2 whitespace-nowrap">
                          <span className="font-semibold">{s.kelas}</span> ({s.rombel})
                        </td>
                        <td className="p-2 font-bold">{s.jenisKelamin}</td>
                        <td className="p-2 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.keterangan === 'Aktif'
                              ? 'bg-emerald-100 text-emerald-800'
                              : s.keterangan === 'Lulus'
                              ? 'bg-blue-100 text-blue-800'
                              : s.keterangan === 'Pindah'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {s.keterangan}
                          </span>
                        </td>
                        {subTab === 'rekapan' && (
                          <>
                            <td className="p-2 font-mono text-[11px]">{s.nik}</td>
                            <td className="p-2 whitespace-nowrap text-[11px]">{s.tempatLahir}, {s.tanggalLahir}</td>
                            <td className="p-2 text-[11px]">
                              <div>A: {s.namaAyah}</div>
                              <div>I: {s.namaIbu}</div>
                            </td>
                            <td className="p-2 font-mono text-[11px]">{s.noHp}</td>
                          </>
                        )}
                        <td className="p-2 text-right whitespace-nowrap">
                          <div className="inline-flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewDetailModal(s);
                              }}
                              className="p-1 rounded bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-300 text-[10px] font-bold transition-colors cursor-pointer"
                              title="Lihat Rincian Siswa"
                            >
                              <Eye className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectStudent(s);
                                setIsEditing(true);
                              }}
                              className="p-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-300 text-[10px] font-bold transition-colors cursor-pointer"
                              title="Edit Data Siswa"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  await navigator.clipboard.writeText(
                                    `Siswa: ${s.namaSiswa} | NIS: ${s.nis} | NISN: ${s.nisn} | Kelas: ${s.kelas} (${s.rombel}) | Status: ${s.keterangan}`
                                  );
                                  notifyMessage('Data siswa berhasil disalin ke clipboard');
                                } catch {
                                  notifyMessage('Data siswa disalin');
                                }
                              }}
                              className="p-1 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-300 text-[10px] font-bold transition-colors cursor-pointer"
                              title="Salin Data Siswa ke Clipboard"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectStudent(s);
                                handleDelete();
                              }}
                              className="p-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-300 text-[10px] font-bold transition-colors cursor-pointer"
                              title="Hapus Siswa"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectStudent(s);
                                handlePrintSingleStudent(s);
                              }}
                              className="p-1 px-1.5 rounded bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 text-[10px] font-bold transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                              title="Cetak Biodata Siswa Ini (Satu per Satu)"
                            >
                              <Printer className="w-3 h-3 text-emerald-700" />
                              <span>Cetak 1</span>
                            </button>
                          </div>
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

      {/* Detail Review Modal */}
      {viewDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 no-print">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden border border-slate-300">
            <div className="bg-emerald-800 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Detail Kartu Data Siswa (Dapodik)</h3>
                <p className="text-xs text-emerald-200">{settings.namaSekolah}</p>
              </div>
              <button
                type="button"
                onClick={() => setViewDetailModal(null)}
                className="text-white hover:text-slate-200 text-xl font-bold px-2"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <input
                ref={modalPhotoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleModalPhotoUpload}
              />
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    onClick={() => modalPhotoInputRef.current?.click()}
                    className="w-24 h-32 rounded-lg bg-slate-200 border-2 border-emerald-600 flex items-center justify-center overflow-hidden shadow-md cursor-pointer relative group"
                    title="Klik untuk Upload / Ganti Foto"
                  >
                    {viewDetailModal.foto && viewDetailModal.foto.trim() ? (
                      <img src={viewDetailModal.foto} alt={viewDetailModal.namaSiswa} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <User className="w-10 h-10 text-slate-400" />
                    )}
                    <div className="absolute inset-0 bg-slate-900/75 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-5 h-5 text-amber-300 mb-1" />
                      <span className="text-[9px] font-bold">Ganti Foto</span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-1 w-24">
                    <button
                      type="button"
                      onClick={() => modalPhotoInputRef.current?.click()}
                      className="flex-1 py-1 px-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[10px] font-bold inline-flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-xs"
                    >
                      <Camera className="w-3 h-3" />
                      <span>{viewDetailModal.foto ? 'Ganti' : 'Upload'}</span>
                    </button>
                    {viewDetailModal.foto && (
                      <button
                        type="button"
                        onClick={handleRemoveModalPhoto}
                        className="py-1 px-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-[10px] font-bold inline-flex items-center justify-center cursor-pointer transition-colors"
                        title="Hapus foto"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex-1 space-y-1 text-slate-800">
                  <h4 className="text-base font-black text-emerald-950 uppercase">{viewDetailModal.namaSiswa}</h4>
                  <p className="text-slate-600 font-medium">Nama Panggilan: <strong>{viewDetailModal.namaPanggilan}</strong></p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1 font-mono">
                    <div>NIS: <strong>{viewDetailModal.nis}</strong></div>
                    <div>NISN: <strong className="text-emerald-800">{viewDetailModal.nisn}</strong></div>
                    <div className="col-span-2">NIK: <strong>{viewDetailModal.nik}</strong></div>
                  </div>
                  <div className="pt-2 flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      Kelas: {viewDetailModal.kelas} ({viewDetailModal.rombel})
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-slate-200 text-slate-800 font-bold">
                      Status: {viewDetailModal.keterangan}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded border border-slate-200 space-y-1">
                  <h5 className="font-bold text-slate-700 border-b pb-1 text-xs">Data Pribadi</h5>
                  <p>Tempat, Tgl Lahir: <strong>{viewDetailModal.tempatLahir}, {viewDetailModal.tanggalLahir}</strong></p>
                  <p>Jenis Kelamin: <strong>{viewDetailModal.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</strong></p>
                  <p>Agama: <strong>{viewDetailModal.agama}</strong></p>
                  <p>Alamat Siswa: <strong>{viewDetailModal.alamat}</strong></p>
                </div>

                <div className="p-3 bg-white rounded border border-slate-200 space-y-1">
                  <h5 className="font-bold text-slate-700 border-b pb-1 text-xs">Data Orang Tua & Domisili</h5>
                  <p>Nama Ayah: <strong>{viewDetailModal.namaAyah}</strong> ({viewDetailModal.pekerjaanAyah})</p>
                  <p>Nama Ibu: <strong>{viewDetailModal.namaIbu}</strong> ({viewDetailModal.pekerjaanIbu})</p>
                  <p>Distrik / Kab: <strong>{viewDetailModal.kecamatan}, {viewDetailModal.kabupaten}</strong></p>
                  <p>Provinsi: <strong>{viewDetailModal.provinsi}</strong></p>
                  <p>No. HP / WA: <strong>{viewDetailModal.noHp}</strong></p>
                </div>
              </div>
            </div>

            <div className="bg-slate-100 p-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200">
              <button
                type="button"
                id="btn-generate-surat-siswa-modal"
                onClick={() => {
                  const currentYear = new Date().getFullYear();
                  const item: SuratPindahItem = {
                    id: viewDetailModal.id || `mut-${Date.now()}`,
                    nomorSurat: `421.2/${Math.floor(Math.random() * 800 + 100)}/SD-DKI/MUT/${currentYear}`,
                    tanggalSurat: new Date().toISOString().slice(0, 10),
                    namaSiswa: viewDetailModal.namaSiswa,
                    nisn: viewDetailModal.nisn,
                    nis: viewDetailModal.nis,
                    nik: viewDetailModal.nik,
                    tempatLahir: viewDetailModal.tempatLahir,
                    tanggalLahir: viewDetailModal.tanggalLahir,
                    jenisKelamin: viewDetailModal.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan',
                    agama: viewDetailModal.agama || 'Kristen Protestan',
                    kelas: viewDetailModal.kelas,
                    namaAyah: viewDetailModal.namaAyah,
                    pekerjaanAyah: viewDetailModal.pekerjaanAyah,
                    namaIbu: viewDetailModal.namaIbu,
                    alamat: viewDetailModal.alamatOrangTua || viewDetailModal.alamat || 'Baalil, Kab. Pegunungan Bintang, Papua Pegunungan',
                    sekolahTujuan: 'SD Negeri Tujuan di Jayapura',
                    alasanPindah: 'Mengikuti orang tua pindah tempat tugas dinas / domisili keluarga.'
                  };
                  setBulkPrintMutasiList([item]);
                  setShowBulkPrintMutasi(true);
                  notifyMessage(`Draf Surat Keterangan Pindah ${viewDetailModal.namaSiswa} Berhasil Dibuat Berbasis AI!`);
                }}
                className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-lg font-black text-xs flex items-center gap-1.5 shadow-sm border border-amber-400 cursor-pointer"
                title="Generate draf surat keterangan pindah siswa otomatis dari data siswa ini"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Generate Surat Pindah (AI)
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setViewDetailModal(null);
                    handleSelectStudent(viewDetailModal);
                    setIsEditing(true);
                  }}
                  className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded font-bold text-xs cursor-pointer"
                >
                  Edit Siswa Ini
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (viewDetailModal) {
                      handlePrintSingleStudent(viewDetailModal);
                    }
                  }}
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="Cetak Biodata Siswa Ini Saja (Satu per Satu)"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Biodata Ini</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewDetailModal(null)}
                  className="px-3 py-1.5 bg-slate-300 hover:bg-slate-400 text-slate-800 rounded font-bold text-xs cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Print Surat Keterangan Pindah Siswa Modal */}
      {showBulkPrintMutasi && (
        <CetakMassalSuratPindahModal
          isOpen={showBulkPrintMutasi}
          onClose={() => setShowBulkPrintMutasi(false)}
          items={bulkPrintMutasiList}
          settings={settings}
        />
      )}

      {/* Single Item Print Modal (Satu per Satu) */}
      {singlePrintData && (
        <SingleItemPrintModal
          isOpen={!!singlePrintData}
          onClose={() => setSinglePrintData(null)}
          printData={singlePrintData}
          settings={settings}
          notifyMessage={notifyMessage}
        />
      )}
    </div>
  );
};
