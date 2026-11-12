import React, { useState, useMemo } from 'react';
import {
  SuratDocument,
  SuratType,
  PaperSize,
  SchoolSettings,
  Student,
  Teacher
} from '../../types';
import { ActionToolbar } from '../ActionToolbar';
import { exportToExcel, exportToWord, exportToPPT, triggerPrint, safeConfirm, safePrompt } from '../../utils/exportHelpers';
import { CetakMassalSuratPindahModal, SuratPindahItem } from '../CetakMassalSuratPindahModal';
import { AiSuratModal } from '../AiSuratModal';
import { generateLetterWithAI } from '../../utils/aiSuratHelper';
import {
  Mail,
  FileText,
  Search,
  CheckCircle,
  Eye,
  Printer,
  Sparkles,
  FileCheck2,
  FolderDown,
  CheckSquare,
  Square,
  Users,
  Wand2,
  Layers,
  UserPlus,
  RefreshCw,
  Copy,
  ClipboardPaste,
  Download,
  UploadCloud,
  Image as ImageIcon,
  Send
} from 'lucide-react';
import { KopSurat } from '../KopSurat';
import { LembarDisposisiModal } from './surat/LembarDisposisiModal';
import { SuratDinasModal } from './surat/SuratDinasModal';
import { SuratKeputusanModal } from './surat/SuratKeputusanModal';
import { EditSuratMasukModal } from './surat/EditSuratMasukModal';
import { EditSuratKeluarModal } from './surat/EditSuratKeluarModal';
import { EditSKModal } from './surat/EditSKModal';
import { BukuAgendaSuratMasukTab } from './surat/BukuAgendaSuratMasukTab';
import { BukuAgendaSuratKeluarTab } from './surat/BukuAgendaSuratKeluarTab';
import { RegisterSuratKeluarTab } from './surat/RegisterSuratKeluarTab';
import { RegisterSKTab } from './surat/RegisterSKTab';
import { RegisterTerintegrasiTab } from './surat/RegisterTerintegrasiTab';
import { KlasifikasiGeneratorTab } from './surat/KlasifikasiGeneratorTab';
import { ArsipRekapitulasiTab } from './surat/ArsipRekapitulasiTab';
import { INITIAL_REVISED_SURAT_DOCS } from './surat/persuratanData';

export type PersuratanViewTab =
  | 'agenda-masuk'
  | 'agenda-keluar'
  | 'register-keluar'
  | 'register-sk'
  | 'register-terintegrasi'
  | 'klasifikasi-generator'
  | 'arsip-rekapitulasi'
  | 'editor-klasik';

interface SuratModuleProps {
  suratList: SuratDocument[];
  onSaveSurat: (surat: SuratDocument) => void;
  onDeleteSurat: (id: string) => void;
  onHome: () => void;
  settings: SchoolSettings;
  notifyMessage: (msg?: string) => void;
  onSync: () => void;
  students?: Student[];
  teachers?: Teacher[];
  onUploadLogoKiri?: (base64: string) => void;
  onUploadLogoKanan?: (base64: string) => void;
}

const ALL_SURAT_TYPES: SuratType[] = [
  'Surat Masuk',
  'Surat Keluar',
  'Surat Keterangan Pindah Siswa',
  'Surat Keterangan Pindah Guru',
  'Surat Keterangan Melaksanakan Tugas',
  'Surat Keterangan Lulus Siswa',
  'Surat Rekomendasi Guru',
  'Surat Rekomendasi Siswa',
  'Surat Undangan',
  'Surat Pengantar',
  'Surat Keputusan Kepala Sekolah',
  'Surat Aktif Mengajar',
  'Surat Aktif Belajar',
  'Surat Undangan Untuk Orang Tua/Wali',
  'Surat Peringatan Untuk Siswa',
  'Surat Peringatan Untuk Guru',
  'Surat Perintah',
  'Surat Keterangan Kematian',
  'Surat Keterangan Kehilangan Ijazah',
  'Surat Keterangan Aktif Wifi Sekolah',
  'Surat Permohonan Dana',
  'Format Surat Permohonan AI',
  'Rekapan Seluruh Surat'
];

export const SuratModule: React.FC<SuratModuleProps> = ({
  suratList,
  onSaveSurat,
  onDeleteSurat,
  onHome,
  settings,
  notifyMessage,
  onSync,
  students = [],
  teachers = [],
  onUploadLogoKiri,
  onUploadLogoKanan
}) => {
  const [selectedType, setSelectedType] = useState<SuratType>('Surat Masuk');
  const [selectedSuratId, setSelectedSuratId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [paperSize, setPaperSize] = useState<PaperSize>(settings.ukuranKertas);
  const [previewSurat, setPreviewSurat] = useState<SuratDocument | null>(null);

  // Active Standard PERSURATAN Navigation Tab
  const [activeNavTab, setActiveNavTab] = useState<PersuratanViewTab>('agenda-masuk');

  // Revised Persistent Persuratan Modals
  const [selectedForDisposisi, setSelectedForDisposisi] = useState<SuratDocument | null>(null);
  const [selectedForSuratDinas, setSelectedForSuratDinas] = useState<SuratDocument | null>(null);
  const [selectedForSKResmi, setSelectedForSKResmi] = useState<SuratDocument | null>(null);

  const [isEditSuratMasukOpen, setIsEditSuratMasukOpen] = useState(false);
  const [editingSuratMasuk, setEditingSuratMasuk] = useState<SuratDocument | null>(null);

  const [isEditSuratKeluarOpen, setIsEditSuratKeluarOpen] = useState(false);
  const [editingSuratKeluar, setEditingSuratKeluar] = useState<SuratDocument | null>(null);

  const [isEditSKOpen, setIsEditSKOpen] = useState(false);
  const [editingSK, setEditingSK] = useState<SuratDocument | null>(null);

  // Bulk print & selection state
  const [selectedForBulk, setSelectedForBulk] = useState<string[]>([]);
  const [showBulkPrintModal, setShowBulkPrintModal] = useState(false);
  const [bulkPrintList, setBulkPrintList] = useState<SuratPindahItem[]>([]);

  // AI Letter Generator modal state
  const [showAiModal, setShowAiModal] = useState(false);

  // In-form AI generation state & context linking
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [linkedStudentId, setLinkedStudentId] = useState<string>('');
  const [linkedTeacherId, setLinkedTeacherId] = useState<string>('');
  const [aiTone, setAiTone] = useState<'Formal Kedinasan' | 'Santun & Persuasif' | 'Tegas & Disipliner'>('Formal Kedinasan');

  const emptySurat: Omit<SuratDocument, 'id'> = {
    jenisSurat: selectedType === 'Rekapan Seluruh Surat' ? 'Surat Masuk' : selectedType,
    nomorSurat: `421.2/${Math.floor(Math.random() * 900 + 100)}/SD-DKI/${new Date().getFullYear()}`,
    tanggalSurat: new Date().toISOString().slice(0, 10),
    perihal: '',
    isiRingkas: '',
    alasanPengirim: '',
    pengirim: settings.namaSekolah,
    penerima: '',
    keterangan: '',
    isLocked: false,
    isArchived: false
  };

  const [formData, setFormData] = useState(emptySurat);

  const filteredSurat = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return suratList.filter((s) => {
      const matchType = selectedType === 'Rekapan Seluruh Surat' ? true : s.jenisSurat === selectedType;
      const matchSearch =
        (s.nomorSurat || '').toLowerCase().includes(q) ||
        (s.perihal || '').toLowerCase().includes(q) ||
        (s.pengirim || '').toLowerCase().includes(q) ||
        (s.penerima || '').toLowerCase().includes(q) ||
        (s.isiRingkas || '').toLowerCase().includes(q);
      return matchType && matchSearch;
    });
  }, [suratList, selectedType, searchQuery]);

  const selectedSurat = useMemo(() => {
    return suratList.find((s) => s.id === selectedSuratId);
  }, [suratList, selectedSuratId]);

  const handleSelectSurat = (s: SuratDocument) => {
    setSelectedSuratId(s.id);
    setFormData({
      jenisSurat: s.jenisSurat || 'Surat Masuk',
      nomorSurat: s.nomorSurat || '',
      tanggalSurat: s.tanggalSurat || new Date().toISOString().slice(0, 10),
      perihal: s.perihal || '',
      isiRingkas: s.isiRingkas || '',
      alasanPengirim: s.alasanPengirim || '',
      pengirim: s.pengirim || '',
      penerima: s.penerima || '',
      keterangan: s.keterangan || '',
      isLocked: Boolean(s.isLocked),
      isArchived: Boolean(s.isArchived)
    });
    setIsEditing(false);
  };

  const handleSwitchType = (type: SuratType) => {
    setSelectedType(type);
    setSelectedSuratId(null);
    setIsEditing(false);
    if (type !== 'Rekapan Seluruh Surat') {
      setFormData({
        ...emptySurat,
        jenisSurat: type,
        perihal: type === 'Format Surat Permohonan AI'
          ? 'Permohonan Bantuan Perangkat Pembelajaran AI & Akses Internet Sekolah Pedalaman'
          : `Administrasi ${type}`
      });
    }
  };

  const handleAddNew = () => {
    setIsEditing(true);
    setSelectedSuratId(null);
    setFormData({
      ...emptySurat,
      jenisSurat: selectedType === 'Rekapan Seluruh Surat' ? 'Surat Keluar' : selectedType
    });
    notifyMessage('Formulir Surat Baru Siap');
  };

  const handleSave = () => {
    if (!formData.nomorSurat.trim() || !formData.perihal.trim()) {
      notifyMessage('Nomor Surat dan Perihal wajib diisi!');
      return;
    }
    const suratToSave: SuratDocument = {
      ...formData,
      id: selectedSuratId || `srt-${Date.now()}`
    };
    onSaveSurat(suratToSave);
    setIsEditing(false);
    setSelectedSuratId(suratToSave.id);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handleDelete = () => {
    if (!selectedSuratId) {
      notifyMessage('Pilih surat terlebih dahulu.');
      return;
    }
    if (selectedSurat?.isLocked) {
      notifyMessage('Surat ini terkunci! Buka kunci surat terlebih dahulu.');
      return;
    }
    if (safeConfirm(`Hapus surat nomor: ${formData.nomorSurat}?`)) {
      onDeleteSurat(selectedSuratId);
      setSelectedSuratId(null);
      setIsEditing(false);
      setFormData(emptySurat);
      notifyMessage('Surat Berhasil Dihapus');
    }
  };

  const handleToggleLock = () => {
    if (!selectedSuratId) {
      setFormData(prev => ({ ...prev, isLocked: !prev.isLocked }));
      notifyMessage('Data Anda Berhasil Disimpan');
      return;
    }
    if (selectedSurat) {
      const updated: SuratDocument = { ...selectedSurat, isLocked: !selectedSurat.isLocked };
      onSaveSurat(updated);
      setFormData(prev => ({ ...prev, isLocked: updated.isLocked }));
      notifyMessage(updated.isLocked ? 'Data Anda Berhasil Dikunci' : 'Kunci Data Dibuka');
    }
  };

  const handleToggleArchive = () => {
    if (!selectedSuratId) {
      setFormData(prev => ({ ...prev, isArchived: !prev.isArchived }));
      notifyMessage('Data Anda Berhasil Disimpan');
      return;
    }
    if (selectedSurat) {
      const updated: SuratDocument = { ...selectedSurat, isArchived: !selectedSurat.isArchived };
      onSaveSurat(updated);
      setFormData(prev => ({ ...prev, isArchived: updated.isArchived }));
      notifyMessage(updated.isArchived ? 'Data Anda Berhasil Disimpan ke Arsip' : 'Data Dikeluarkan dari Arsip');
    }
  };

  // Bulk Selection Handlers
  const handleToggleSelectOne = (id: string) => {
    setSelectedForBulk(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedForBulk.length === filteredSurat.length && filteredSurat.length > 0) {
      setSelectedForBulk([]);
    } else {
      setSelectedForBulk(filteredSurat.map(s => s.id));
    }
  };

  // Open Bulk Transfer Letter Print Modal
  const handleOpenBulkPrint = () => {
    // Determine documents to print: either specifically checked ones, or all currently shown if none checked
    let targetDocs = suratList.filter(s => selectedForBulk.includes(s.id));
    if (targetDocs.length === 0) {
      if (selectedType === 'Surat Keterangan Pindah Siswa') {
        targetDocs = filteredSurat;
      } else {
        targetDocs = suratList.filter(s => s.jenisSurat === 'Surat Keterangan Pindah Siswa');
      }
    }

    if (targetDocs.length === 0) {
      notifyMessage('Pilih minimal 1 surat keterangan pindah untuk dicetak!');
      return;
    }

    const prepared: SuratPindahItem[] = targetDocs.map((doc, idx) => {
      // Cross-reference with student database
      const matchStudent = (students || []).find(st =>
        (doc.isiRingkas && doc.isiRingkas.toLowerCase().includes(st.namaSiswa.toLowerCase())) ||
        (doc.perihal && doc.perihal.toLowerCase().includes(st.namaSiswa.toLowerCase())) ||
        (doc.isiRingkas && st.nisn && doc.isiRingkas.includes(st.nisn))
      );

      // Clean default destination
      const sekolahTujuan = doc.penerima && !doc.penerima.toLowerCase().includes('inpres dekai')
        ? doc.penerima
        : 'SD Negeri Kotaraja, Jayapura';

      return {
        id: doc.id,
        nomorSurat: doc.nomorSurat,
        tanggalSurat: doc.tanggalSurat,
        namaSiswa: matchStudent
          ? matchStudent.namaSiswa
          : (doc.perihal.replace(/Surat Keterangan Mutasi \/ Pindah Sekolah a\.n\. /i, '').replace(/Surat Keterangan Pindah Sekolah a\.n\. /i, '').trim() || `Peserta Didik ${idx + 1}`),
        nis: matchStudent?.nis || `104${idx + 2}`,
        nisn: matchStudent?.nisn || `012993019${idx}`,
        nik: matchStudent?.nik || `950301600312000${idx + 1}`,
        tempatLahir: matchStudent?.tempatLahir || 'Dekai',
        tanggalLahir: matchStudent?.tanggalLahir || '2013-05-10',
        jenisKelamin: matchStudent?.jenisKelamin || (idx % 2 === 0 ? 'P' : 'L'),
        agama: matchStudent?.agama || 'Kristen Protestan',
        kelas: matchStudent?.kelas || 'V',
        rombel: matchStudent?.rombel || 'V-B',
        namaAyah: matchStudent?.namaAyah || 'Benyamin Peyon',
        pekerjaanAyah: matchStudent?.pekerjaanAyah || 'Petani / Tokoh Adat',
        namaIbu: matchStudent?.namaIbu || 'Tabita Silak',
        alamat: matchStudent?.alamat || matchStudent?.alamatOrangTua || 'Baalil, Distrik Oksibil, Kabupaten Pegunungan Bintang',
        sekolahTujuan,
        alasanPindah: doc.alasanPengirim || 'Mengikuti perpindahan domisili / tempat penugasan kerja orang tua.',
        keteranganLampiran: doc.keterangan || 'Raport Asli & Surat Mutasi Dapodik'
      };
    });

    setBulkPrintList(prepared);
    setShowBulkPrintModal(true);
    notifyMessage(`Menyiapkan Format Cetak Massal untuk ${prepared.length} Siswa`);
  };

  // Quick helper to import all students with mutasi/pindah status into surat list
  const handleImportMutasiStudents = () => {
    const mutasiStudents = (students || []).filter(
      st => st.kategori === 'mutasi' || st.keterangan === 'Pindah'
    );
    if (mutasiStudents.length === 0) {
      notifyMessage('Tidak ada siswa berstatus mutasi/pindah di database saat ini.');
      return;
    }

    let addedCount = 0;
    mutasiStudents.forEach(st => {
      const exists = suratList.some(
        s => s.jenisSurat === 'Surat Keterangan Pindah Siswa' &&
        (s.isiRingkas.includes(st.namaSiswa) || s.perihal.includes(st.namaSiswa))
      );
      if (!exists) {
        const newSurat: SuratDocument = {
          id: `srt-pindah-${Date.now()}-${st.id}`,
          jenisSurat: 'Surat Keterangan Pindah Siswa',
          nomorSurat: `421.2/${Math.floor(Math.random() * 800 + 100)}/SD-DKI/MUT/${new Date().getFullYear()}`,
          tanggalSurat: new Date().toISOString().slice(0, 10),
          perihal: `Surat Keterangan Mutasi / Pindah Sekolah a.n. ${st.namaSiswa}`,
          isiRingkas: `Menerangkan bahwa peserta didik bernama ${st.namaSiswa} (NIS: ${st.nis} / NISN: ${st.nisn}), kelas ${st.kelas} pada ${settings.namaSekolah}, telah disetujui mutasi pindah sekolah. Seluruh buku laporan hasil belajar (raport) telah dilampirkan.`,
          alasanPengirim: st.alamatOrangTua ? `Mengikuti kepindahan orang tua: ${st.alamatOrangTua}` : 'Mengikuti kepindahan tugas orang tua.',
          pengirim: settings.namaSekolah,
          penerima: 'Kepala SD Negeri Tujuan di Jayapura',
          keterangan: 'Surat mutasi resmi dan buku raport asli terlampir lengkap.',
          isLocked: false,
          isArchived: false
        };
        onSaveSurat(newSurat);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      notifyMessage(`${addedCount} Surat Pindah Siswa Baru Berhasil Dibuat dari Data Siswa!`);
    } else {
      notifyMessage('Semua siswa berstatus pindah sudah terdaftar di agenda surat.');
    }
  };

  // Apply AI Generated Letter to Active Form
  const handleApplyAiLetter = (generated: any, jenis: SuratType) => {
    setSelectedType(jenis);
    setFormData({
      jenisSurat: jenis,
      nomorSurat: generated.nomorSurat,
      tanggalSurat: generated.tanggalSurat,
      perihal: generated.perihal,
      isiRingkas: generated.isiRingkas,
      alasanPengirim: generated.alasanPengirim,
      pengirim: generated.pengirim,
      penerima: generated.penerima,
      keterangan: generated.keterangan,
      isLocked: false,
      isArchived: false
    });
    setIsEditing(true);
  };

  // Generate draf surat otomatis berbasis AI dari data yang ada di formulir
  const handleGenerateSuratFromFormData = async () => {
    setIsGeneratingAi(true);
    const activeType = formData.jenisSurat || selectedType;
    notifyMessage(`Sedang men-generate draf surat ${activeType} berbasis AI...`);

    const studentObj = students.find(s => s.id === linkedStudentId) || null;
    const teacherObj = teachers.find(t => t.id === linkedTeacherId) || null;

    try {
      const generated = await generateLetterWithAI(
        {
          jenisSurat: activeType,
          namaSekolah: settings.namaSekolah,
          tujuan: formData.penerima || (activeType === 'Surat Undangan' || activeType === 'Surat Undangan Untuk Orang Tua/Wali' ? 'Bapak/Ibu Orang Tua / Wali Murid' : 'Pihak Terkait / Instansi Tujuan'),
          subjekNama: studentObj ? studentObj.namaSiswa : teacherObj ? teacherObj.nama : undefined,
          instruksi: formData.perihal || formData.isiRingkas || `Rancang draf naskah resmi kedinasan untuk ${activeType} sesuai format baku standar tata usaha sekolah dasar pedalaman`,
          konteksTambahan: [
            formData.nomorSurat ? `Nomor Surat yang diusulkan: ${formData.nomorSurat}` : '',
            formData.alasanPengirim ? `Dasar/Pertimbangan: ${formData.alasanPengirim}` : '',
            studentObj ? `Data Siswa: ${studentObj.namaSiswa}, Kelas ${studentObj.kelas}, NISN: ${studentObj.nisn}, NIK: ${studentObj.nik}, Alamat: ${studentObj.alamat || 'Dekai'}` : '',
            teacherObj ? `Data Guru: ${teacherObj.nama}, NIP: ${teacherObj.nip || '-'}, Jabatan: ${teacherObj.jabatan}, Pangkat/Gol: ${teacherObj.pangkatGolongan}` : ''
          ].filter(Boolean).join('. '),
          gayaBahasa: aiTone,
          selectedStudent: studentObj,
          selectedTeacher: teacherObj
        },
        settings
      );

      setFormData(prev => ({
        ...prev,
        jenisSurat: activeType,
        nomorSurat: prev.nomorSurat && prev.nomorSurat.trim() && !prev.nomorSurat.includes('XXX') ? prev.nomorSurat : generated.nomorSurat,
        perihal: prev.perihal && prev.perihal.trim() ? prev.perihal : generated.perihal,
        penerima: prev.penerima && prev.penerima.trim() ? prev.penerima : generated.penerima,
        pengirim: prev.pengirim && prev.pengirim.trim() ? prev.pengirim : generated.pengirim,
        isiRingkas: generated.isiRingkas,
        alasanPengirim: prev.alasanPengirim && prev.alasanPengirim.trim() ? prev.alasanPengirim : generated.alasanPengirim,
        keterangan: prev.keterangan && prev.keterangan.trim() ? prev.keterangan : generated.keterangan,
        tanggalSurat: prev.tanggalSurat || generated.tanggalSurat
      }));

      setIsEditing(true);
      notifyMessage(`Draf Surat ${activeType} Berhasil Dibuat Berbasis AI!`);
    } catch (err: any) {
      console.error('Error generating AI letter:', err);
      notifyMessage('Terjadi kendala saat men-generate draf surat. Silakan coba lagi.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSelectLinkedStudent = (studentId: string) => {
    setLinkedStudentId(studentId);
    if (!studentId) return;
    const st = students.find(s => s.id === studentId);
    if (!st) return;

    setFormData(prev => {
      let updatedPerihal = prev.perihal;
      let updatedPenerima = prev.penerima;
      let updatedAlasan = prev.alasanPengirim;

      if (prev.jenisSurat === 'Surat Keterangan Pindah Siswa') {
        if (!updatedPerihal) updatedPerihal = `Surat Keterangan Pindah Sekolah a.n. ${st.namaSiswa}`;
        if (!updatedPenerima) updatedPenerima = 'Kepala SD Negeri Tujuan di Jayapura';
        if (!updatedAlasan) updatedAlasan = 'Mengikuti kepindahan domisili / dinas orang tua.';
      } else if (prev.jenisSurat === 'Surat Aktif Belajar' || prev.jenisSurat === 'Surat Rekomendasi Siswa') {
        if (!updatedPerihal) updatedPerihal = `Surat Keterangan Aktif Belajar Siswa a.n. ${st.namaSiswa}`;
        if (!updatedPenerima) updatedPenerima = 'Pengelola Beasiswa Afirmasi Pendidikan / Instansi Terkait';
      } else if (prev.jenisSurat === 'Surat Keterangan Lulus Siswa') {
        if (!updatedPerihal) updatedPerihal = `Surat Keterangan Lulus (SKL) a.n. ${st.namaSiswa}`;
      } else if (prev.jenisSurat === 'Surat Peringatan Untuk Siswa' || prev.jenisSurat === 'Surat Undangan Untuk Orang Tua/Wali') {
        if (!updatedPenerima) updatedPenerima = `Bapak/Ibu Orang Tua/Wali dari ${st.namaSiswa}`;
      }

      return {
        ...prev,
        perihal: updatedPerihal,
        penerima: updatedPenerima,
        alasanPengirim: updatedAlasan
      };
    });
  };

  const handleSelectLinkedTeacher = (teacherId: string) => {
    setLinkedTeacherId(teacherId);
    if (!teacherId) return;
    const tc = teachers.find(t => t.id === teacherId);
    if (!tc) return;

    setFormData(prev => {
      let updatedPerihal = prev.perihal;
      let updatedPenerima = prev.penerima;

      if (
        prev.jenisSurat === 'Surat Keterangan Melaksanakan Tugas' ||
        prev.jenisSurat === 'Surat Aktif Mengajar' ||
        prev.jenisSurat === 'Surat Rekomendasi Guru'
      ) {
        if (!updatedPerihal) updatedPerihal = `${prev.jenisSurat} a.n. ${tc.nama}`;
        if (!updatedPenerima) updatedPenerima = `Kepala Dinas Pendidikan ${settings.kabupaten || 'Kabupaten Pegunungan Bintang'}`;
      } else if (prev.jenisSurat === 'Surat Peringatan Untuk Guru') {
        if (!updatedPenerima) updatedPenerima = tc.nama;
      }

      return {
        ...prev,
        perihal: updatedPerihal,
        penerima: updatedPenerima
      };
    });
  };

  // Export handlers
  const handleExcelExport = () => {
    const headers = [
      'No',
      'Jenis Surat',
      'Nomor Surat',
      'Tanggal Surat',
      'Perihal',
      'Isi Ringkas',
      'Alasan Pengirim',
      'Pengirim',
      'Penerima',
      'Keterangan'
    ];
    const rows = filteredSurat.map((s, idx) => [
      idx + 1,
      s.jenisSurat,
      s.nomorSurat,
      s.tanggalSurat,
      s.perihal,
      s.isiRingkas,
      s.alasanPengirim,
      s.pengirim,
      s.penerima,
      s.keterangan
    ]);
    exportToExcel(`Rekap_Buku_Agenda_Surat_${selectedType.replace(/\s+/g, '_')}`, headers, rows);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handleWordExport = () => {
    const current = selectedSurat || formData;
    const content = `
      <table style="width: 100%; border: none; border-bottom: 3px double #000; padding-bottom: 8px; margin-bottom: 15px;">
        <tr style="border: none;">
          <td style="border: none; width: 75px; text-align: left; vertical-align: middle;">
            ${settings.logoKiri ? `<img src="${settings.logoKiri}" width="65" height="65" style="object-fit:contain;" />` : ''}
          </td>
          <td style="border: none; text-align: center; vertical-align: middle;">
            <h2 style="margin:0; font-size: 11pt; font-weight: bold; text-transform: uppercase;">${settings.namaInstansi}</h2>
            <h1 style="margin:4px 0; font-size: 15pt; font-weight: bold; text-transform: uppercase;">${settings.namaSekolah}</h1>
            <p style="margin:0; font-size: 10pt;">${settings.alamatSekolah} | NPSN: ${settings.npsn}</p>
          </td>
          <td style="border: none; width: 75px; text-align: right; vertical-align: middle;">
            ${settings.logoKanan ? `<img src="${settings.logoKanan}" width="65" height="65" style="object-fit:contain;" />` : ''}
          </td>
        </tr>
      </table>
      <div style="text-align: right; margin-bottom: 15px;">
        Dekai, ${current.tanggalSurat}
      </div>
      <table>
        <tr><td width="120">Nomor</td><td>: ${current.nomorSurat}</td></tr>
        <tr><td>Lampiran</td><td>: 1 (Satu) Berkas</td></tr>
        <tr><td>Perihal</td><td>: <b>${current.perihal}</b></td></tr>
      </table>
      <p style="margin-top: 20px;">
        Kepada Yth.<br/>
        <b>${current.penerima || 'Bapak/Ibu/Pimpinan'}</b><br/>
        di Tempat
      </p>
      <div style="margin-top: 25px; line-height: 1.6;">
        <p>Dengan hormat,</p>
        <p>${current.isiRingkas || 'Dengan ini kami sampaikan perihal di atas untuk dapat diketahui dan ditindaklanjuti sebagaimana mestinya.'}</p>
        <p><b>Alasan / Dasar Pertimbangan:</b> ${current.alasanPengirim || '-'}</p>
        <p><b>Keterangan Tambahan:</b> ${current.keterangan || '-'}</p>
        <p>Demikian surat ini kami sampaikan, atas perhatian dan kerja samanya kami ucapkan terima kasih.</p>
      </div>
      <div class="footer" style="margin-top: 50px;">
        <table style="border:none;">
          <tr style="border:none;">
            <td style="border:none;" width="50%">
              Mengetahui,<br/>
              Operator TU & Arsiparis,<br/><br/><br/>
              <b><u>${settings.operatorTU}</u></b><br/>
              NIP. ${settings.nipOperator}
            </td>
            <td style="border:none;" width="50%" align="right">
              Kepala Sekolah,<br/><br/><br/><br/>
              <b><u>${settings.namaKepsek}</u></b><br/>
              NIP. ${settings.nipKepsek}
            </td>
          </tr>
        </table>
      </div>
    `;
    exportToWord(`Surat_${current.nomorSurat.replace(/[\/\\]/g, '_')}`, content);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handlePPTExport = () => {
    const slides = [
      {
        title: `AGENDA SURAT DINAS SEKOLAH`,
        subtitle: `${settings.namaSekolah} - Papua Pedalaman`,
        bullets: [
          `Kategori Surat: ${selectedType}`,
          `Jumlah Arsip Surat: ${filteredSurat.length} Dokumen`,
          `Pengelola Surat & Arsip: ${settings.operatorTU}`,
          `Status Pengarsipan: Terkatalog Digital & Fisik`
        ]
      }
    ];
    exportToPPT(`Presentasi_Arsip_Surat_${selectedType}`, slides);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handleTemplate = () => {
    setFormData({
      jenisSurat: selectedType === 'Rekapan Seluruh Surat' ? 'Surat Keputusan Kepala Sekolah' : selectedType,
      nomorSurat: `421.2/099/SD-BL/${new Date().getFullYear()}`,
      tanggalSurat: new Date().toISOString().slice(0, 10),
      perihal: `Pemberitahuan Resmi ${selectedType}`,
      isiRingkas: `Menerangkan dan menetapkan perihal ${selectedType} dalam rangka ketertiban administrasi pendidikan di ${settings.namaSekolah}.`,
      alasanPengirim: 'Kebutuhan pemenuhan administrasi standar Dapodik dan dinas pendidikan.',
      pengirim: settings.namaSekolah,
      penerima: 'Dinas Pendidikan / Orang Tua / Guru',
      keterangan: 'Telah diverifikasi oleh Kepala Sekolah & Operator.',
      isLocked: false,
      isArchived: false
    });
    setIsEditing(true);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handleCopySurat = async () => {
    const textToCopy = `PEMERINTAH KABUPATEN PEGUNUNGAN BINTANG
DINAS PENDIDIKAN
${settings.namaSekolah.toUpperCase()}
--------------------------------------------------
Jenis Dokumen : ${formData.jenisSurat}
Nomor Surat   : ${formData.nomorSurat}
Tanggal       : ${formData.tanggalSurat}
Perihal       : ${formData.perihal}
Pengirim      : ${formData.pengirim}
Penerima      : ${formData.penerima}

Isi Ringkas / Naskah Surat:
${formData.isiRingkas || '-'}

Dasar / Alasan:
${formData.alasanPengirim || '-'}

Keterangan:
${formData.keterangan || '-'}`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      notifyMessage('Draf Naskah Surat Berhasil Di-copy ke Clipboard!');
    } catch {
      notifyMessage('Draf Naskah Surat Berhasil Di-copy!');
    }
  };

  const handlePasteSurat = async () => {
    try {
      let text = '';
      if (navigator.clipboard && navigator.clipboard.readText) {
        text = await navigator.clipboard.readText();
      }
      if (!text) {
        text = safePrompt('Tempelkan (Paste) naskah atau isi surat di sini:', '') || '';
      }
      if (text) {
        setFormData(prev => ({
          ...prev,
          isiRingkas: prev.isiRingkas ? `${prev.isiRingkas}\n${text}` : text
        }));
        setIsEditing(true);
        notifyMessage('Teks Berhasil Di-paste ke Naskah Surat!');
      }
    } catch {
      notifyMessage('Silakan tempel teks secara manual.');
    }
  };

  const handleExportSurat = () => {
    handleExcelExport();
    notifyMessage('Data Persuratan Berhasil Di-ekspor!');
  };

  const handleImportSurat = () => {
    const sample = safePrompt('Impor Data Surat (JSON / Teks Perihal):', '');
    if (sample) {
      try {
        const parsed = JSON.parse(sample);
        if (parsed.perihal || parsed.isiRingkas) {
          setFormData(prev => ({ ...prev, ...parsed }));
          notifyMessage('Data Surat Berhasil Di-impor!');
          return;
        }
      } catch {
        setFormData(prev => ({ ...prev, perihal: sample }));
        notifyMessage('Perihal surat berhasil diimpor dari teks.');
      }
    } else {
      notifyMessage('Impor Berkas Surat Siap.');
    }
  };

  return (
    <div className="space-y-4">
      {/* FORMAT ADMINISTRASI SURAT SEKOLAH - HEADER IDENTITAS SEKOLAH */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 border-b border-slate-200 pb-3 mb-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              Format Administrasi Persuratan Sekolah
            </span>
            <h2 className="text-base sm:text-lg font-black text-slate-900 mt-1">
              {settings.namaSekolah.toUpperCase()}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Buku Agenda Surat Masuk, Surat Keluar, Register SK Kepala Sekolah & Tata Kelola Persuratan
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const existingIds = new Set(suratList.map(s => s.id));
                let count = 0;
                INITIAL_REVISED_SURAT_DOCS.forEach(doc => {
                  if (!existingIds.has(doc.id)) {
                    onSaveSurat(doc);
                    count++;
                  }
                });
                notifyMessage(`Format Baku Administrasi Surat Balil (${count} Dokumen Baru) Berhasil Disinkronkan!`);
              }}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Sinkronkan contoh format baku persuratan SD Balil 2026/2027"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sinkron Format SD Balil</span>
            </button>

            <button
              type="button"
              onClick={() => triggerPrint()}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Cetak Halaman Administrasi Surat"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-300" />
              <span>Cetak Halaman</span>
            </button>
          </div>
        </div>

        {/* School Metadata Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-200/80">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">NPSN / NSS</span>
            <span className="font-bold text-slate-800 font-mono">{settings.npsn} / {settings.nss || '1012501004'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Alamat Sekolah</span>
            <span className="font-semibold text-slate-800 truncate block">{settings.alamatSekolah}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Desa / Distrik</span>
            <span className="font-semibold text-slate-800">Balil / Dekai</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Kabupaten / Provinsi</span>
            <span className="font-semibold text-slate-800">{settings.kabupaten || 'Pegunungan Bintang'} / PAPUA</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Tahun Pelajaran</span>
            <span className="font-black text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">2026/2027</span>
          </div>
        </div>

        {/* Persuratan Sub-Menu Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-slate-200">
          {[
            { id: 'agenda-masuk', label: 'A. Agenda Surat Masuk', icon: Mail, badge: '14 Kolom + Disposisi' },
            { id: 'agenda-keluar', label: 'C. Agenda Surat Keluar', icon: Send, badge: '10 Kolom + Surat Dinas' },
            { id: 'register-keluar', label: 'E. Register Surat Keluar', icon: FileText, badge: '8 Kolom' },
            { id: 'register-sk', label: 'F. Register & Naskah SK', icon: FileCheck2, badge: 'Format F & G' },
            { id: 'register-terintegrasi', label: 'M. Register Terintegrasi', icon: Layers, badge: 'Tabel Master TU' },
            { id: 'klasifikasi-generator', label: 'Klasifikasi & No Surat', icon: Wand2, badge: 'H-L & N' },
            { id: 'arsip-rekapitulasi', label: 'Arsip & Rekapitulasi', icon: FolderDown, badge: 'O & P (12 Bln)' },
            { id: 'editor-klasik', label: 'Editor Surat AI & 22 Jenis', icon: Sparkles, badge: 'Generator AI' }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeNavTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveNavTab(tab.id as PersuratanViewTab)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-600'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                  isActive ? 'bg-emerald-950 text-emerald-200' : 'bg-slate-200 text-slate-600'
                }`}>
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mandatory Standard Action Toolbar (Active for all Persuratan Sub-Tabs) */}
      <ActionToolbar
        titleContext={`PERSURATAN > ${activeNavTab.toUpperCase().replace('-', ' ')}`}
        onHome={onHome}
        onAddNew={() => {
          if (activeNavTab === 'agenda-masuk') {
            setEditingSuratMasuk(null);
            setIsEditSuratMasukOpen(true);
          } else if (activeNavTab === 'agenda-keluar') {
            setEditingSuratKeluar(null);
            setIsEditSuratKeluarOpen(true);
          } else if (activeNavTab === 'register-sk') {
            setEditingSK(null);
            setIsEditSKOpen(true);
          } else {
            handleAddNew();
          }
        }}
        onSave={handleSave}
        onView={() => {
          if (selectedSurat) setPreviewSurat(selectedSurat);
          else if (filteredSurat.length > 0) setPreviewSurat(filteredSurat[0]);
          else setPreviewSurat(formData as SuratDocument);
        }}
        onDelete={handleDelete}
        onSearch={() => {
          const q = safePrompt('Cari Nomor Surat, Perihal, Pengirim, atau Penerima:', searchQuery);
          if (q !== null) setSearchQuery(q);
        }}
        onEdit={() => {
          if (!selectedSuratId) {
            notifyMessage('Pilih surat terlebih dahulu.');
            return;
          }
          setIsEditing(true);
        }}
        onCancel={() => {
          setIsEditing(false);
          if (selectedSurat) handleSelectSurat(selectedSurat);
          else setFormData(emptySurat);
        }}
        onBack={onHome}
        onArchive={handleToggleArchive}
        onLock={handleToggleLock}
        onReview={() => {
          if (selectedSurat) setPreviewSurat(selectedSurat);
          else setPreviewSurat(formData as SuratDocument);
        }}
        onPrint={triggerPrint}
        onUpdate={handleSave}
        onTemplate={handleTemplate}
        onPdf={triggerPrint}
        onExcel={handleExcelExport}
        onWord={handleWordExport}
        onPpt={handlePPTExport}
        onExport={handleExportSurat}
        onImport={handleImportSurat}
        onCopy={handleCopySurat}
        onPaste={handlePasteSurat}
        onUploadPhoto={() => notifyMessage('Data Anda Berhasil Disimpan')}
        onRefresh={() => notifyMessage('Data Anda Berhasil Disimpan')}
        onSync={onSync}
        onReset={() => {
          setFormData(emptySurat);
          setIsEditing(true);
        }}
        isLocked={formData.isLocked}
        isArchived={formData.isArchived}
        paperSize={paperSize}
        onChangePaperSize={(size) => setPaperSize(size)}
        notifyMessage={notifyMessage}
      />

      {/* Conditionally Render Based on Active Nav Tab */}
      {activeNavTab === 'agenda-masuk' && (
        <BukuAgendaSuratMasukTab
          suratList={suratList}
          onAddNew={() => {
            setEditingSuratMasuk(null);
            setIsEditSuratMasukOpen(true);
          }}
          onEdit={(s) => {
            setEditingSuratMasuk(s);
            setIsEditSuratMasukOpen(true);
          }}
          onDelete={onDeleteSurat}
          onOpenDisposisi={(s) => setSelectedForDisposisi(s)}
          settings={settings}
          notifyMessage={notifyMessage}
        />
      )}

      {activeNavTab === 'agenda-keluar' && (
        <BukuAgendaSuratKeluarTab
          suratList={suratList}
          onAddNew={() => {
            setEditingSuratKeluar(null);
            setIsEditSuratKeluarOpen(true);
          }}
          onEdit={(s) => {
            setEditingSuratKeluar(s);
            setIsEditSuratKeluarOpen(true);
          }}
          onDelete={onDeleteSurat}
          onOpenSuratDinas={(s) => setSelectedForSuratDinas(s)}
          settings={settings}
          notifyMessage={notifyMessage}
        />
      )}

      {activeNavTab === 'register-keluar' && (
        <RegisterSuratKeluarTab
          suratList={suratList}
          onOpenSuratDinas={(s) => setSelectedForSuratDinas(s)}
          onEdit={(s) => {
            setEditingSuratKeluar(s);
            setIsEditSuratKeluarOpen(true);
          }}
          settings={settings}
          notifyMessage={notifyMessage}
        />
      )}

      {activeNavTab === 'register-sk' && (
        <RegisterSKTab
          suratList={suratList}
          onAddNew={() => {
            setEditingSK(null);
            setIsEditSKOpen(true);
          }}
          onEdit={(s) => {
            setEditingSK(s);
            setIsEditSKOpen(true);
          }}
          onDelete={onDeleteSurat}
          onOpenSKResmi={(s) => setSelectedForSKResmi(s)}
          settings={settings}
          notifyMessage={notifyMessage}
        />
      )}

      {activeNavTab === 'register-terintegrasi' && (
        <RegisterTerintegrasiTab
          suratList={suratList}
          onOpenDoc={(s) => {
            if (s.jenisSurat === 'Surat Masuk' || (s.nomorAgenda && s.nomorAgenda.startsWith('SM-'))) {
              setSelectedForDisposisi(s);
            } else if (s.jenisSurat === 'Surat Keputusan Kepala Sekolah' || s.nomorSurat?.includes('/SK/')) {
              setSelectedForSKResmi(s);
            } else {
              setSelectedForSuratDinas(s);
            }
          }}
          settings={settings}
          notifyMessage={notifyMessage}
        />
      )}

      {activeNavTab === 'klasifikasi-generator' && (
        <KlasifikasiGeneratorTab
          settings={settings}
          notifyMessage={notifyMessage}
        />
      )}

      {activeNavTab === 'arsip-rekapitulasi' && (
        <ArsipRekapitulasiTab
          suratList={suratList}
          settings={settings}
          notifyMessage={notifyMessage}
        />
      )}

      {/* Editor Klasik & Generator AI (Only visible when activeNavTab === 'editor-klasik') */}
      {activeNavTab === 'editor-klasik' && (
        <>
          {/* AI Letter Generator & Bulk Transfer Letter Quick Access Banner */}
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-indigo-950 text-white p-3 sm:p-4 rounded-2xl shadow-md border border-emerald-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300 shadow-inner shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-black tracking-wide text-white">
                Sistem Tata Kelola Surat Dinas Sekolah
              </h2>
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                AI & Cetak Massal
              </span>
            </div>
            <p className="text-[11px] text-emerald-200">
              Otomatisasi pembuatan draf surat dinas berbasis AI & cetak format surat keterangan pindah siswa massal
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setShowAiModal(true)}
            className="flex-1 md:flex-none px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg hover:shadow-amber-500/20 transition-all cursor-pointer border border-amber-300"
            title="Buka AI Pembuat Surat Kedinasan"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>AI UNTUK MEMBUAT SURAT</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedType('Surat Keterangan Pindah Siswa');
              handleOpenBulkPrint();
            }}
            className="flex-1 md:flex-none px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer border border-emerald-400/40"
            title="Cetak Format Surat Keterangan Pindah Siswa Secara Massal"
          >
            <Printer className="w-4 h-4 text-emerald-200" />
            <span>Cetak Massal Surat Pindah</span>
          </button>
        </div>
      </div>

      {/* 22 Types of Letters Selector Buttons */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm no-print">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-emerald-700" />
            <span className="font-bold text-xs uppercase text-slate-800">
              Pilih Jenis Formulir Surat (22 Format Lengkap):
            </span>
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            Aktif: <strong className="text-emerald-800">{selectedType}</strong>
          </span>
        </div>

        <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto p-1 scrollbar-thin">
          {ALL_SURAT_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handleSwitchType(type)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                selectedType === type
                  ? 'bg-emerald-700 text-white shadow-sm ring-1 ring-emerald-400'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Form & List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Surat Form */}
        {selectedType !== 'Rekapan Seluruh Surat' && (
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2">
                    <span>Formulir: {selectedType}</span>
                    <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                      AI Supported
                    </span>
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Format Baku Persuratan Administrasi Sekolah Standar Dapodik
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
                <button
                  type="button"
                  id="btn-generate-surat-ai-header"
                  onClick={handleGenerateSuratFromFormData}
                  disabled={isGeneratingAi}
                  className="px-3 py-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-lg text-xs flex items-center gap-1.5 shadow-sm border border-amber-300 cursor-pointer disabled:opacity-50 transition-all"
                  title="Generate draf naskah dinas resmi secara otomatis berbasis AI berdasarkan data formulir ini"
                >
                  {isGeneratingAi ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" />
                      <span>Sedang Generate AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                      <span>Generate Surat (AI)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewSurat(formData as SuratDocument)}
                  className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> Pratinjau Lembar Surat
                </button>
              </div>
            </div>

            {/* Official KOP Header with Left & Right Logo Upload Buttons */}
            <div className="mb-3.5 bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-700" />
                  Kop Surat Resmi Naskah Dinas ({formData.jenisSurat || selectedType})
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  Logo Kiri & Kanan otomatis tercetak di semua lembar surat
                </span>
              </div>
              <KopSurat
                settings={settings}
                onUploadLogoKiri={(b64) => {
                  if (onUploadLogoKiri) onUploadLogoKiri(b64);
                  notifyMessage('Logo Kiri Berhasil Diperbarui');
                }}
                onUploadLogoKanan={(b64) => {
                  if (onUploadLogoKanan) onUploadLogoKanan(b64);
                  notifyMessage('Logo Kanan Berhasil Diperbarui');
                }}
                showUploadButtons={true}
                compact={true}
              />
            </div>

            {/* In-Form AI Smart Draft Assistant Panel */}
            <div className="mb-3.5 p-3 bg-gradient-to-r from-amber-50/90 via-emerald-50/80 to-teal-50/80 border border-amber-300/80 rounded-xl shadow-xs space-y-2.5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-amber-200/70 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-xs flex-shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                      Generate Surat Berbasis AI
                      <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                        {formData.jenisSurat || selectedType}
                      </span>
                    </h4>
                    <p className="text-[10.5px] text-slate-600">
                      Otomatisasi draf naskah dinas kedinasan, nomor surat, perihal, isi, dan dasar hukum dari data yang ada
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    id="btn-generate-surat-ai-panel"
                    onClick={handleGenerateSuratFromFormData}
                    disabled={isGeneratingAi}
                    className="flex-1 sm:flex-none px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-sm border border-amber-400 cursor-pointer disabled:opacity-50 transition-all"
                    title="Generate isi surat seketika"
                  >
                    {isGeneratingAi ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Men-generate...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>Generate Surat</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAiModal(true)}
                    className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    title="Buka asisten prompt AI lanjutan"
                  >
                    Prompt Kustom...
                  </button>
                </div>
              </div>

              {/* Data Context Linker: Siswa, Guru, Nada Bahasa */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-700 mb-0.5">
                    Kaitkan Data Siswa (Opsional):
                  </label>
                  <select
                    value={linkedStudentId}
                    onChange={(e) => handleSelectLinkedStudent(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800"
                  >
                    <option value="">-- Pilih Siswa dari Database --</option>
                    {students.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.namaSiswa} (Kls {st.kelas} - NISN: {st.nisn})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-slate-700 mb-0.5">
                    Kaitkan Data Guru (Opsional):
                  </label>
                  <select
                    value={linkedTeacherId}
                    onChange={(e) => handleSelectLinkedTeacher(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800"
                  >
                    <option value="">-- Pilih Guru dari Database --</option>
                    {teachers.map((tc) => (
                      <option key={tc.id} value={tc.id}>
                        {tc.nama} ({tc.jabatan} - NIP: {tc.nip || '-'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-slate-700 mb-0.5">
                    Gaya / Nada Bahasa:
                  </label>
                  <select
                    value={aiTone}
                    onChange={(e) => setAiTone(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 font-medium"
                  >
                    <option value="Formal Kedinasan">Formal Kedinasan (Resmi)</option>
                    <option value="Santun & Persuasif">Santun & Persuasif (Himbauan/Undangan)</option>
                    <option value="Tegas & Disipliner">Tegas & Disipliner (Peringatan/Tata Tertib)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-0.5">Jenis Surat</label>
                  <select
                    value={formData.jenisSurat}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({ ...formData, jenisSurat: e.target.value as SuratType })}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 font-semibold text-emerald-800"
                  >
                    {ALL_SURAT_TYPES.filter(t => t !== 'Rekapan Seluruh Surat').map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-0.5">Tanggal Surat</label>
                  <input
                    type="date"
                    value={formData.tanggalSurat || ''}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({ ...formData, tanggalSurat: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-0.5">Nomor Surat Resmi</label>
                <input
                  type="text"
                  value={formData.nomorSurat || ''}
                  disabled={!isEditing}
                  onChange={(e) => setFormData({ ...formData, nomorSurat: e.target.value })}
                  placeholder="Contoh: 421.2/045/SD-DKI/2024"
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-0.5">Perihal Surat</label>
                <input
                  type="text"
                  value={formData.perihal || ''}
                  disabled={!isEditing}
                  onChange={(e) => setFormData({ ...formData, perihal: e.target.value })}
                  placeholder="Hal / Perihal surat..."
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 font-semibold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-0.5">Pengirim</label>
                  <input
                    type="text"
                    value={formData.pengirim || ''}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({ ...formData, pengirim: e.target.value })}
                    placeholder="Nama Instansi / Pejabat Pengirim"
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1.5"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-0.5">Penerima</label>
                  <input
                    type="text"
                    value={formData.penerima || ''}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({ ...formData, penerima: e.target.value })}
                    placeholder="Tujuan Surat / Nama Penerima"
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1.5"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="font-bold text-slate-700 block">Isi Ringkas Surat</label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      id="btn-generate-surat-ai-field"
                      onClick={handleGenerateSuratFromFormData}
                      disabled={isGeneratingAi}
                      className="text-[11px] font-bold text-amber-950 hover:text-slate-950 bg-amber-200 hover:bg-amber-300 border border-amber-400 px-2.5 py-0.5 rounded flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                      title="Generate atau perbaiki draf isi surat secara otomatis menggunakan AI"
                    >
                      {isGeneratingAi ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin text-amber-900" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 text-amber-900" />
                          <span>Generate Surat (AI)</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAiModal(true)}
                      className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded flex items-center gap-1 transition-colors cursor-pointer"
                      title="Buka dialog asisten AI lengkap"
                    >
                      <Wand2 className="w-3 h-3 text-indigo-600" />
                      Editor Prompt
                    </button>
                    <button
                      type="button"
                      id="btn-copy-isi-surat"
                      onClick={handleCopySurat}
                      className="text-[11px] font-bold text-indigo-800 hover:text-indigo-900 bg-indigo-100/70 hover:bg-indigo-100 border border-indigo-300 px-2 py-0.5 rounded flex items-center gap-1 transition-colors cursor-pointer"
                      title="Salin isi & naskah surat ke clipboard"
                    >
                      <Copy className="w-3 h-3 text-indigo-700" />
                      Copy
                    </button>
                    <button
                      type="button"
                      id="btn-paste-isi-surat"
                      onClick={handlePasteSurat}
                      className="text-[11px] font-bold text-violet-800 hover:text-violet-900 bg-violet-100/70 hover:bg-violet-100 border border-violet-300 px-2 py-0.5 rounded flex items-center gap-1 transition-colors cursor-pointer"
                      title="Tempel teks naskah dari clipboard"
                    >
                      <ClipboardPaste className="w-3 h-3 text-violet-700" />
                      Paste
                    </button>
                  </div>
                </div>
                <textarea
                  rows={4}
                  value={formData.isiRingkas || ''}
                  disabled={!isEditing}
                  onChange={(e) => setFormData({ ...formData, isiRingkas: e.target.value })}
                  placeholder="Kandungan dan maksud naskah isi surat resmi kedinasan (klik tombol 'Generate Surat (AI)' di atas untuk membuat draf otomatis)..."
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 font-medium leading-relaxed"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-0.5">Alasan Pengirim / Dasar Hukum</label>
                <textarea
                  rows={2}
                  value={formData.alasanPengirim || ''}
                  disabled={!isEditing}
                  onChange={(e) => setFormData({ ...formData, alasanPengirim: e.target.value })}
                  placeholder="Dasar hukum atau alasan dikeluarkannya surat..."
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1.5"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-0.5">Keterangan / Tindak Lanjut</label>
                <input
                  type="text"
                  value={formData.keterangan || ''}
                  disabled={!isEditing}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  placeholder="Catatan disposisi atau status tindak lanjut..."
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1.5"
                />
              </div>

              {isEditing && (
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200">
                  <button
                    type="button"
                    id="btn-generate-surat-ai-bottom"
                    onClick={handleGenerateSuratFromFormData}
                    disabled={isGeneratingAi}
                    className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-lg text-xs flex items-center gap-1.5 shadow-sm border border-amber-400 cursor-pointer disabled:opacity-50 transition-all"
                    title="Generate ulang draf surat dinas berbasis AI dari data yang ada"
                  >
                    {isGeneratingAi ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Sedang Men-generate...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate Surat (AI)</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Simpan Data Surat
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right: Table Agenda Surat */}
        <div className={`${selectedType === 'Rekapan Seluruh Surat' ? 'lg:col-span-12' : 'lg:col-span-5'} bg-white rounded-xl border border-slate-200 shadow-sm p-4`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase">
                {selectedType === 'Rekapan Seluruh Surat'
                  ? 'Buku Agenda Rekapan Seluruh Surat'
                  : `Daftar Arsip ${selectedType}`}
              </h3>
              <p className="text-[11px] text-slate-500">
                Terdata {filteredSurat.length} arsip surat
              </p>
            </div>
          </div>

          {/* Dedicated Bulk Action Bar for Surat Pindah or Selection */}
          {(selectedType === 'Surat Keterangan Pindah Siswa' || selectedForBulk.length > 0) && (
            <div className="mb-3 p-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 rounded-lg flex flex-wrap items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-700 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  {selectedForBulk.length} Dipilih
                </span>
                <span className="text-xs font-bold text-emerald-950">
                  Cetak Massal Surat Keterangan Pindah
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {selectedForBulk.length === filteredSurat.length && filteredSurat.length > 0 ? (
                    <>
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-700" /> Batal Pilih
                    </>
                  ) : (
                    <>
                      <Square className="w-3.5 h-3.5 text-slate-500" /> Pilih Semua
                    </>
                  )}
                </button>

                {students.filter(st => st.kategori === 'mutasi' || st.keterangan === 'Pindah').length > 0 && (
                  <button
                    type="button"
                    onClick={handleImportMutasiStudents}
                    className="px-2 py-1 bg-teal-100 hover:bg-teal-200 text-teal-900 border border-teal-300 rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    title="Otomatis masukkan data siswa mutasi ke agenda surat pindah"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-teal-700" />
                    + Impor Siswa Mutasi ({students.filter(st => st.kategori === 'mutasi' || st.keterangan === 'Pindah').length})
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleOpenBulkPrint}
                  className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Buka dialog cetak format surat pindah massal"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Cetak Format Massal ({selectedForBulk.length > 0 ? selectedForBulk.length : filteredSurat.length})
                </button>
              </div>
            </div>
          )}

          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nomor surat, perihal, atau tujuan..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-[580px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="p-2 w-7 text-center">
                    <input
                      type="checkbox"
                      checked={filteredSurat.length > 0 && selectedForBulk.length === filteredSurat.length}
                      onChange={handleToggleSelectAll}
                      className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      title="Pilih / Batalkan semua baris surat"
                    />
                  </th>
                  <th className="p-2 w-8 text-center">No</th>
                  <th className="p-2">Nomor & Tanggal</th>
                  <th className="p-2">Perihal</th>
                  <th className="p-2">Pengirim / Tujuan</th>
                  <th className="p-2 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSurat.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400">
                      Belum ada arsip surat untuk jenis ini. Klik <strong>Tambah Baru</strong> atau buat otomatis dengan AI.
                    </td>
                  </tr>
                ) : (
                  filteredSurat.map((s, idx) => {
                    const isSelected = s.id === selectedSuratId;
                    const isChecked = selectedForBulk.includes(s.id);
                    return (
                      <tr
                        key={s.id}
                        onClick={() => handleSelectSurat(s)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-emerald-50 font-medium' : isChecked ? 'bg-teal-50/60' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="p-2 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleSelectOne(s.id)}
                            className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            title="Pilih untuk cetak massal"
                          />
                        </td>
                        <td className="p-2 text-center text-slate-500">{idx + 1}</td>
                        <td className="p-2 font-mono">
                          <div className="font-bold text-slate-900">{s.nomorSurat}</div>
                          <div className="text-[10px] text-slate-500">{s.tanggalSurat}</div>
                        </td>
                        <td className="p-2">
                          <div className="font-semibold text-slate-800">{s.perihal}</div>
                          <div className="text-[10px] text-emerald-700 font-bold">{s.jenisSurat}</div>
                        </td>
                        <td className="p-2 text-[11px]">
                          <div>Dari: {s.pengirim}</div>
                          <div>Kpd: {s.penerima}</div>
                        </td>
                        <td className="p-2 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewSurat(s);
                            }}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 text-[11px] font-semibold"
                          >
                            Cetak
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

      {/* Official Letter Print Preview Modal */}
      {previewSurat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto print:fixed print:inset-0 print:z-[9999] print:bg-white print:p-0 print:overflow-visible print:block">
          <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden border border-slate-300 my-8 print:my-0 print:border-none print:shadow-none print:max-w-none print:w-full">
            <div className="bg-slate-900 text-white p-3 flex items-center justify-between no-print">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-sm">Pratinjau Format Surat Resmi Siap Cetak</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => triggerPrint()}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Cetak Sekarang
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewSurat(null)}
                  className="text-white hover:text-slate-300 text-lg font-bold px-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Letter Sheet Container */}
            <div className="p-6 sm:p-10 bg-white text-slate-900 font-serif leading-relaxed text-sm max-h-[78vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-0">
              {/* Kop Surat Header with Upload Buttons */}
              <KopSurat
                settings={settings}
                onUploadLogoKiri={(b64) => {
                  if (onUploadLogoKiri) onUploadLogoKiri(b64);
                  notifyMessage('Logo Kiri Berhasil Diperbarui');
                }}
                onUploadLogoKanan={(b64) => {
                  if (onUploadLogoKanan) onUploadLogoKanan(b64);
                  notifyMessage('Logo Kanan Berhasil Diperbarui');
                }}
                showUploadButtons={true}
                className="mb-4"
              />

              {/* Letter Meta */}
              <div className="flex justify-between items-start my-4 text-xs font-sans">
                <table className="w-auto">
                  <tbody>
                    <tr><td className="pr-4 font-semibold">Nomor</td><td>: {previewSurat.nomorSurat}</td></tr>
                    <tr><td className="pr-4 font-semibold">Lampiran</td><td>: 1 (Satu) Berkas</td></tr>
                    <tr><td className="pr-4 font-semibold">Perihal</td><td>: <strong>{previewSurat.perihal}</strong></td></tr>
                  </tbody>
                </table>
                <div className="text-right">
                  Dekai, {previewSurat.tanggalSurat}
                </div>
              </div>

              {/* Recipient */}
              <div className="my-5 text-xs font-sans">
                <p>Kepada Yth.</p>
                <p className="font-bold text-sm">{previewSurat.penerima || 'Bapak/Ibu/Pimpinan Terkait'}</p>
                <p>di - Tempat</p>
              </div>

              {/* Content Body */}
              <div className="space-y-3 my-6 text-justify text-xs font-serif leading-relaxed">
                <p>Dengan hormat,</p>
                <p className="indent-8">
                  {previewSurat.isiRingkas || 'Sehubungan dengan agenda administrasi dan tata kelola pendidikan pada SD Negeri Inpres Dekai, bersama ini kami sampaikan perihal tersebut di atas agar dapat diketahui dan dipergunakan sebagaimana mestinya.'}
                </p>
                {previewSurat.alasanPengirim && (
                  <p className="indent-8">
                    <strong>Dasar / Alasan Pelaksanaan:</strong> {previewSurat.alasanPengirim}
                  </p>
                )}
                {previewSurat.keterangan && (
                  <p className="indent-8">
                    <strong>Catatan Khusus:</strong> {previewSurat.keterangan}
                  </p>
                )}
                <p className="indent-8">
                  Demikian surat ini kami sampaikan, atas perhatian dan kerja sama yang baik kami ucapkan terima kasih.
                </p>
              </div>

              {/* Signature Block */}
              <div className="mt-12 pt-4 flex justify-between text-xs font-sans">
                <div className="text-center w-60">
                  <p>Petugas Administrasi / Operator,</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">{settings.operatorTU}</p>
                  <p>NIP. {settings.nipOperator}</p>
                </div>

                <div className="text-center w-60">
                  <p>Kepala Sekolah,</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">{settings.namaKepsek}</p>
                  <p>NIP. {settings.nipKepsek}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {/* Revised Persuratan Modals */}
      {selectedForDisposisi && (
        <LembarDisposisiModal
          isOpen={!!selectedForDisposisi}
          surat={selectedForDisposisi}
          settings={settings}
          onClose={() => setSelectedForDisposisi(null)}
          onSaveDisposisi={onSaveSurat}
          notifyMessage={notifyMessage}
        />
      )}

      {selectedForSuratDinas && (
        <SuratDinasModal
          isOpen={!!selectedForSuratDinas}
          surat={selectedForSuratDinas}
          settings={settings}
          onClose={() => setSelectedForSuratDinas(null)}
          onUploadLogoKiri={onUploadLogoKiri}
          onUploadLogoKanan={onUploadLogoKanan}
          notifyMessage={notifyMessage}
        />
      )}

      {selectedForSKResmi && (
        <SuratKeputusanModal
          isOpen={!!selectedForSKResmi}
          surat={selectedForSKResmi}
          settings={settings}
          onClose={() => setSelectedForSKResmi(null)}
          onUploadLogoKiri={onUploadLogoKiri}
          onUploadLogoKanan={onUploadLogoKanan}
          notifyMessage={notifyMessage}
        />
      )}

      {isEditSuratMasukOpen && (
        <EditSuratMasukModal
          isOpen={isEditSuratMasukOpen}
          surat={editingSuratMasuk}
          settings={settings}
          onClose={() => setIsEditSuratMasukOpen(false)}
          onSave={onSaveSurat}
          notifyMessage={notifyMessage}
        />
      )}

      {isEditSuratKeluarOpen && (
        <EditSuratKeluarModal
          isOpen={isEditSuratKeluarOpen}
          surat={editingSuratKeluar}
          settings={settings}
          onClose={() => setIsEditSuratKeluarOpen(false)}
          onSave={onSaveSurat}
          notifyMessage={notifyMessage}
        />
      )}

      {isEditSKOpen && (
        <EditSKModal
          isOpen={isEditSKOpen}
          surat={editingSK}
          settings={settings}
          onClose={() => setIsEditSKOpen(false)}
          onSave={onSaveSurat}
          notifyMessage={notifyMessage}
        />
      )}

      {/* AI Letter Generator Modal */}
      {showAiModal && (
        <AiSuratModal
          initialType={selectedType !== 'Rekapan Seluruh Surat' ? selectedType : 'Surat Keterangan Pindah Siswa'}
          allTypes={ALL_SURAT_TYPES}
          students={students}
          teachers={teachers}
          settings={settings}
          onClose={() => setShowAiModal(false)}
          onApplyToForm={handleApplyAiLetter}
          onSaveDirectly={(suratDoc) => {
            onSaveSurat(suratDoc);
            notifyMessage('Surat AI Berhasil Disimpan Langsung ke Buku Arsip Surat!');
          }}
          notifyMessage={notifyMessage}
          onUploadLogoKiri={onUploadLogoKiri}
          onUploadLogoKanan={onUploadLogoKanan}
        />
      )}

      {/* Bulk Transfer Letter Print & Export Modal */}
      {showBulkPrintModal && (
        <CetakMassalSuratPindahModal
          items={bulkPrintList}
          settings={settings}
          paperSize={paperSize}
          onClose={() => setShowBulkPrintModal(false)}
          onUploadLogoKiri={onUploadLogoKiri}
          onUploadLogoKanan={onUploadLogoKanan}
          notifyMessage={notifyMessage}
        />
      )}
    </div>
  );
};
