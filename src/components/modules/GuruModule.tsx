import React, { useState, useMemo, useRef } from 'react';
import {
  Teacher,
  TeacherStatus,
  TeacherCondition,
  PaperSize,
  SchoolSettings
} from '../../types';
import { ActionToolbar } from '../ActionToolbar';
import { exportToExcel, exportToWord, exportToPPT, triggerPrint, safeConfirm, safePrompt } from '../../utils/exportHelpers';
import { compressAndResizeImage } from '../../utils/imageHelper';
import { SingleItemPrintModal, SinglePrintModalData } from '../SingleItemPrintModal';
import {
  GraduationCap,
  UserCheck,
  Search,
  CheckCircle,
  Image,
  Award,
  BookOpen,
  Briefcase,
  Camera,
  Upload,
  Trash2,
  Sparkles,
  Eye,
  Edit3,
  Printer
} from 'lucide-react';

interface GuruModuleProps {
  teachers: Teacher[];
  onSaveTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (id: string) => void;
  onHome: () => void;
  settings: SchoolSettings;
  notifyMessage: (msg?: string) => void;
  onSync: () => void;
}

export const GuruModule: React.FC<GuruModuleProps> = ({
  teachers,
  onSaveTeacher,
  onDeleteTeacher,
  onHome,
  settings,
  notifyMessage,
  onSync
}) => {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('SEMUA');
  const [paperSize, setPaperSize] = useState<PaperSize>(settings.ukuranKertas);
  const [viewDetailModal, setViewDetailModal] = useState<Teacher | null>(null);
  const [singlePrintData, setSinglePrintData] = useState<SinglePrintModalData | null>(null);

  const handlePrintSingleTeacher = (t: Teacher) => {
    setSinglePrintData({
      type: 'guru',
      title: `Biodata Lengkap Pendidik / GTK: ${t.nama} (NIP: ${t.nip || '-'})`,
      data: t
    });
    notifyMessage(`Membuka format cetak biodata resmi untuk: ${t.nama}`);
  };

  const formPhotoInputRef = useRef<HTMLInputElement>(null);
  const modalPhotoInputRef = useRef<HTMLInputElement>(null);

  const emptyTeacher: Omit<Teacher, 'id'> = {
    foto: '',
    nik: '',
    nip: '',
    nuptk: '',
    nama: '',
    tempatLahir: 'Dekai',
    tanggalLahir: '1990-01-01',
    umur: 34,
    pangkatGolongan: 'Penata Muda / III-a',
    jabatan: 'Guru Kelas',
    pendidikanTerakhir: 'S1 PGSD',
    jurusan: 'Pendidikan Guru Sekolah Dasar',
    sertifikasi: 'Sudah',
    masaKerja: '5 Tahun',
    statusKepegawaian: 'PNS',
    riwayatTugas: 'Guru Kelas & Pembina Pramuka',
    keterangan: 'Aktif',
    isLocked: false,
    isArchived: false
  };

  const [formData, setFormData] = useState(emptyTeacher);

  const filteredTeachers = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return teachers.filter((t) => {
      const matchSearch =
        (t.nama || '').toLowerCase().includes(q) ||
        (t.nip || '').includes(searchQuery) ||
        (t.nuptk || '').includes(searchQuery) ||
        (t.nik || '').includes(searchQuery);
      const matchStatus = filterStatus === 'SEMUA' || t.statusKepegawaian === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [teachers, searchQuery, filterStatus]);

  const selectedTeacher = useMemo(() => {
    return teachers.find((t) => t.id === selectedTeacherId);
  }, [teachers, selectedTeacherId]);

  const handleSelectTeacher = (teacher: Teacher) => {
    setSelectedTeacherId(teacher.id);
    setFormData({
      foto: teacher.foto || '',
      nik: teacher.nik || '',
      nip: teacher.nip || '',
      nuptk: teacher.nuptk || '',
      nama: teacher.nama || '',
      tempatLahir: teacher.tempatLahir || '',
      tanggalLahir: teacher.tanggalLahir || '1990-01-01',
      umur: teacher.umur ?? 30,
      pangkatGolongan: teacher.pangkatGolongan || '',
      jabatan: teacher.jabatan || 'Guru Kelas',
      pendidikanTerakhir: teacher.pendidikanTerakhir || '',
      jurusan: teacher.jurusan || '',
      sertifikasi: teacher.sertifikasi || 'Belum',
      masaKerja: teacher.masaKerja || '',
      statusKepegawaian: teacher.statusKepegawaian || 'Honor Daerah',
      riwayatTugas: teacher.riwayatTugas || '',
      keterangan: teacher.keterangan || 'Aktif',
      isLocked: Boolean(teacher.isLocked),
      isArchived: Boolean(teacher.isArchived)
    });
    setIsEditing(false);
  };

  const handleAddNew = () => {
    setIsEditing(true);
    setSelectedTeacherId(null);
    setFormData(emptyTeacher);
    notifyMessage('Form Tambah Guru Baru Siap');
  };

  const handleSave = () => {
    if (!formData.nama.trim()) {
      notifyMessage('Nama Pendidik/Guru wajib diisi!');
      return;
    }
    const teacherToSave: Teacher = {
      ...formData,
      id: selectedTeacherId || `tch-${Date.now()}`
    };
    onSaveTeacher(teacherToSave);
    setIsEditing(false);
    setSelectedTeacherId(teacherToSave.id);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handleDelete = () => {
    if (!selectedTeacherId) {
      notifyMessage('Pilih data guru terlebih dahulu.');
      return;
    }
    if (selectedTeacher?.isLocked) {
      notifyMessage('Data guru terkunci! Buka kunci terlebih dahulu.');
      return;
    }
    if (safeConfirm(`Hapus data guru: ${formData.nama}?`)) {
      onDeleteTeacher(selectedTeacherId);
      setSelectedTeacherId(null);
      setIsEditing(false);
      setFormData(emptyTeacher);
      notifyMessage('Data Berhasil Dihapus');
    }
  };

  const handleToggleLock = () => {
    if (!selectedTeacherId) {
      setFormData(prev => ({ ...prev, isLocked: !prev.isLocked }));
      notifyMessage('Data Anda Berhasil Disimpan');
      return;
    }
    if (selectedTeacher) {
      const updated: Teacher = { ...selectedTeacher, isLocked: !selectedTeacher.isLocked };
      onSaveTeacher(updated);
      setFormData(prev => ({ ...prev, isLocked: updated.isLocked }));
      notifyMessage(updated.isLocked ? 'Data Anda Berhasil Dikunci' : 'Kunci Data Dibuka');
    }
  };

  const handleToggleArchive = () => {
    if (!selectedTeacherId) {
      setFormData(prev => ({ ...prev, isArchived: !prev.isArchived }));
      notifyMessage('Data Anda Berhasil Disimpan');
      return;
    }
    if (selectedTeacher) {
      const updated: Teacher = { ...selectedTeacher, isArchived: !selectedTeacher.isArchived };
      onSaveTeacher(updated);
      setFormData(prev => ({ ...prev, isArchived: updated.isArchived }));
      notifyMessage(updated.isArchived ? 'Data Anda Berhasil Disimpan ke Arsip' : 'Data Dikeluarkan dari Arsip');
    }
  };

  const handleUploadPhoto = (base64: string) => {
    setFormData(prev => ({ ...prev, foto: base64 }));
    if (selectedTeacherId && selectedTeacher) {
      onSaveTeacher({ ...selectedTeacher, foto: base64 });
    }
    notifyMessage('Foto Guru Berhasil Disimpan');
  };

  const handleFormPhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compressAndResizeImage(file, 400, 500, 0.88);
      handleUploadPhoto(base64);
    } catch (err: any) {
      notifyMessage(err?.message || 'Gagal memproses foto guru');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handleModalPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !viewDetailModal) return;
    try {
      const base64 = await compressAndResizeImage(file, 400, 500, 0.88);
      const updatedTeacher: Teacher = { ...viewDetailModal, foto: base64 };
      setViewDetailModal(updatedTeacher);
      onSaveTeacher(updatedTeacher);
      notifyMessage(`Foto Guru ${updatedTeacher.nama} Berhasil Diunggah & Disimpan`);
    } catch (err: any) {
      notifyMessage(err?.message || 'Gagal memproses foto guru');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handleRemoveModalPhoto = () => {
    if (!viewDetailModal) return;
    const updatedTeacher: Teacher = { ...viewDetailModal, foto: '' };
    setViewDetailModal(updatedTeacher);
    onSaveTeacher(updatedTeacher);
    notifyMessage(`Foto Guru ${updatedTeacher.nama} Berhasil Dihapus`);
  };

  // Export handlers
  const handleExcelExport = () => {
    const headers = [
      'No',
      'NIK',
      'NIP',
      'NUPTK',
      'Nama Guru & GTK',
      'Tempat, Tgl Lahir',
      'Umur',
      'Pangkat/Gol',
      'Jabatan',
      'Pendidikan Terakhir',
      'Jurusan',
      'Sertifikasi',
      'Masa Kerja',
      'Status Kepegawaian',
      'Riwayat Tugas',
      'Keterangan'
    ];
    const rows = filteredTeachers.map((t, idx) => [
      idx + 1,
      t.nik,
      t.nip,
      t.nuptk,
      t.nama,
      `${t.tempatLahir}, ${t.tanggalLahir}`,
      t.umur,
      t.pangkatGolongan,
      t.jabatan,
      t.pendidikanTerakhir,
      t.jurusan,
      t.sertifikasi,
      t.masaKerja,
      t.statusKepegawaian,
      t.riwayatTugas,
      t.keterangan
    ]);
    exportToExcel('Rekap_Data_Guru_dan_GTK', headers, rows);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handleWordExport = () => {
    const content = `
      <div class="kop">
        <h2>${settings.namaInstansi}</h2>
        <h1>${settings.namaSekolah}</h1>
        <p>${settings.alamatSekolah} | NPSN: ${settings.npsn}</p>
        <hr />
        <h3>DAFTAR NOMINATIF GURU DAN TENAGA KEPENDIDIKAN (GTK)</h3>
        <p>Dicetak: ${new Date().toLocaleDateString('id-ID')}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Nama & Gelar</th>
            <th>NIP / NUPTK</th>
            <th>Jabatan</th>
            <th>Status</th>
            <th>Pendidikan</th>
            <th>Sertifikasi</th>
          </tr>
        </thead>
        <tbody>
          ${filteredTeachers.map((t, i) => `
            <tr>
              <td>${i + 1}</td>
              <td><b>${t.nama}</b></td>
              <td>NIP: ${t.nip}<br/>NUPTK: ${t.nuptk}</td>
              <td>${t.jabatan}</td>
              <td>${t.statusKepegawaian} (${t.pangkatGolongan})</td>
              <td>${t.pendidikanTerakhir} - ${t.jurusan}</td>
              <td>${t.sertifikasi}</td>
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
    exportToWord('Data_Guru_GTK', content);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handlePPTExport = () => {
    const slides = [
      {
        title: `PROFIL GURU & TENAGA KEPENDIDIKAN`,
        subtitle: `${settings.namaSekolah} - Papua Pedalaman`,
        bullets: [
          `Total Pendidik & Tendik: ${teachers.length} Orang`,
          `Guru PNS: ${teachers.filter(t => t.statusKepegawaian === 'PNS').length} Orang`,
          `Guru PPPK: ${teachers.filter(t => t.statusKepegawaian === 'PPPK').length} Orang`,
          `Honor Daerah / Sekolah: ${teachers.filter(t => t.statusKepegawaian.includes('Honor')).length} Orang`,
          `Sudah Sertifikasi Pendidik: ${teachers.filter(t => t.sertifikasi === 'Sudah').length} Orang`
        ]
      }
    ];
    exportToPPT('Presentasi_Profil_Guru', slides);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handleTemplate = () => {
    setFormData({
      foto: '',
      nik: '9503012005900004',
      nip: '19900520 202221 1 002',
      nuptk: '5647768669200022',
      nama: 'Petrus Matuan, S.Pd.',
      tempatLahir: 'Kurima',
      tanggalLahir: '1990-05-20',
      umur: 34,
      pangkatGolongan: 'Ahli Pertama / IX',
      jabatan: 'Guru Kelas',
      pendidikanTerakhir: 'S1 PGSD',
      jurusan: 'Pendidikan Guru Sekolah Dasar',
      sertifikasi: 'Sudah',
      masaKerja: '4 Tahun',
      statusKepegawaian: 'PPPK',
      riwayatTugas: 'Guru Kelas V & Pembina Olahraga',
      keterangan: 'Aktif',
      isLocked: false,
      isArchived: false
    });
    setIsEditing(true);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handleCopyGuru = async () => {
    const t = selectedTeacher || formData;
    const text = `DATA GURU & TENAGA KEPENDIDIKAN (GTK)
Nama Lengkap    : ${t.nama || '-'}
NIP / NUPTK     : ${t.nip || '-'} / ${t.nuptk || '-'}
NIK             : ${t.nik || '-'}
Tempat, Tgl     : ${t.tempatLahir || '-'}, ${t.tanggalLahir || '-'}
Pendidikan / Jur: ${t.pendidikanTerakhir || '-'} (${t.jurusan || '-'})
Jabatan / Tugas : ${t.jabatan || '-'} (${t.riwayatTugas || '-'})
Pangkat / Gol   : ${t.pangkatGolongan || '-'}
Status Pegawai  : ${t.statusKepegawaian || '-'}
Keterangan      : ${t.keterangan || '-'}`;

    try {
      await navigator.clipboard.writeText(text);
      notifyMessage(`Data GTK "${t.nama || 'Guru'}" Berhasil Di-copy ke Clipboard!`);
    } catch {
      notifyMessage('Data GTK Berhasil Di-copy!');
    }
  };

  const handlePasteGuru = async () => {
    try {
      let text = '';
      if (navigator.clipboard && navigator.clipboard.readText) {
        text = await navigator.clipboard.readText();
      }
      if (!text) {
        text = safePrompt('Tempelkan Nama Guru atau Data GTK:', '') || '';
      }
      if (text) {
        setFormData(prev => ({
          ...prev,
          nama: prev.nama ? prev.nama : text.trim()
        }));
        setIsEditing(true);
        notifyMessage('Data Berhasil Di-paste ke Form Guru!');
      }
    } catch {
      notifyMessage('Silakan tempel data secara manual.');
    }
  };

  const handleExportGuru = () => {
    handleExcelExport();
    notifyMessage('Data Guru / GTK Berhasil Di-ekspor!');
  };

  const handleImportGuru = () => {
    const input = safePrompt('Impor Data Guru (JSON / Nama GTK):', '');
    if (input) {
      try {
        const parsed = JSON.parse(input);
        if (parsed.nama) {
          setFormData(prev => ({ ...prev, ...parsed }));
          setIsEditing(true);
          notifyMessage('Data Guru Berhasil Di-impor!');
          return;
        }
      } catch {
        setFormData(prev => ({ ...prev, nama: input }));
        setIsEditing(true);
        notifyMessage(`Nama guru berhasil diimpor: ${input}`);
      }
    } else {
      notifyMessage('Impor Data Guru Siap.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Mandatory Standard Action Toolbar */}
      <ActionToolbar
        titleContext="DATA GURU DAN TENAGA KEPENDIDIKAN (GTK)"
        onHome={onHome}
        onAddNew={handleAddNew}
        onSave={handleSave}
        onView={() => {
          if (selectedTeacher) setViewDetailModal(selectedTeacher);
          else if (filteredTeachers.length > 0) setViewDetailModal(filteredTeachers[0]);
          else notifyMessage('Pilih guru untuk dilihat rinciannya');
        }}
        onDelete={handleDelete}
        onSearch={() => {
          const q = safePrompt('Cari Nama, NIP, NUPTK, atau NIK Guru:', searchQuery);
          if (q !== null) setSearchQuery(q);
        }}
        onEdit={() => {
          if (!selectedTeacherId) {
            notifyMessage('Pilih data guru terlebih dahulu.');
            return;
          }
          setIsEditing(true);
        }}
        onCancel={() => {
          setIsEditing(false);
          if (selectedTeacher) handleSelectTeacher(selectedTeacher);
          else setFormData(emptyTeacher);
        }}
        onBack={onHome}
        onArchive={handleToggleArchive}
        onLock={handleToggleLock}
        onReview={() => {
          if (selectedTeacher) setViewDetailModal(selectedTeacher);
          else notifyMessage('Pilih data guru untuk direview');
        }}
        onPrint={triggerPrint}
        onPrintSingle={() => {
          if (selectedTeacher) {
            handlePrintSingleTeacher(selectedTeacher);
          } else if (filteredTeachers.length > 0) {
            handlePrintSingleTeacher(filteredTeachers[0]);
          } else {
            notifyMessage('Pilih guru dari tabel terlebih dahulu untuk dicetak');
          }
        }}
        onUpdate={handleSave}
        onTemplate={handleTemplate}
        onPdf={triggerPrint}
        onExcel={handleExcelExport}
        onWord={handleWordExport}
        onPpt={handlePPTExport}
        onExport={handleExportGuru}
        onImport={handleImportGuru}
        onCopy={handleCopyGuru}
        onPaste={handlePasteGuru}
        onUploadPhoto={handleUploadPhoto}
        onRefresh={() => notifyMessage('Data Anda Berhasil Disimpan')}
        onSync={onSync}
        onReset={() => {
          setFormData(emptyTeacher);
          setIsEditing(true);
        }}
        isLocked={formData.isLocked}
        isArchived={formData.isArchived}
        paperSize={paperSize}
        onChangePaperSize={(size) => setPaperSize(size)}
        notifyMessage={notifyMessage}
      />

      {/* Grid: Form & List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Form Data Guru */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800 uppercase">
                  Form Data Guru & Tenaga Kependidikan
                </h2>
                <p className="text-[11px] text-slate-500">
                  Data Pokok Pendidik & Tenaga Kependidikan (GTK Dapodik)
                </p>
              </div>
            </div>
            <span className={`text-[11px] px-2 py-0.5 rounded font-bold ${
              isEditing ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
            }`}>
              {isEditing ? 'Mode Edit / Input' : 'Mode Pratinjau'}
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Foto & Identitas Utama */}
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
                  className="w-24 h-28 border-2 border-dashed border-blue-400 hover:border-blue-600 rounded-lg bg-white flex flex-col items-center justify-center overflow-hidden relative cursor-pointer group shadow-xs transition-colors"
                  title="Klik untuk Upload Foto Guru"
                >
                  {formData.foto && formData.foto.trim() ? (
                    <img src={formData.foto} alt="Foto Guru" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="text-center p-1 text-slate-400">
                      <Image className="w-6 h-6 mx-auto text-blue-600" />
                      <span className="text-[9px] block mt-1 font-semibold text-slate-600">Foto Resmi</span>
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
                  className="mt-1.5 w-24 py-1 px-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded text-[10px] font-bold inline-flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-xs"
                >
                  <Camera className="w-3 h-3" />
                  <span>Upload Foto</span>
                </button>
              </div>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
                <div>
                  <label className="font-bold text-slate-700 block mb-0.5">NIK (Kependudukan)</label>
                  <input
                    type="text"
                    value={formData.nik || ''}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    placeholder="16 Digit NIK"
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-0.5">NIP (Bagi PNS/PPPK)</label>
                  <input
                    type="text"
                    value={formData.nip || ''}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    placeholder="18 Digit NIP atau '-'"
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-0.5">NUPTK Kemendikbud</label>
                  <input
                    type="text"
                    value={formData.nuptk || ''}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({ ...formData, nuptk: e.target.value })}
                    placeholder="16 Digit NUPTK"
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs font-mono font-bold text-emerald-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-0.5">Status Kepegawaian</label>
                  <select
                    value={formData.statusKepegawaian || 'Honor Daerah'}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({ ...formData, statusKepegawaian: e.target.value as TeacherStatus })}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs font-semibold"
                  >
                    <option value="PNS">PNS (Pegawai Negeri Sipil)</option>
                    <option value="PPPK">PPPK</option>
                    <option value="Honor Daerah">Honor Daerah (Otsus Papua)</option>
                    <option value="Honor Sekolah">Honor Sekolah</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Nama Lengkap & Gelar */}
            <div>
              <label className="font-bold text-slate-700 block mb-0.5">Nama Lengkap & Gelar</label>
              <input
                type="text"
                value={formData.nama || ''}
                disabled={!isEditing}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                placeholder="Contoh: Selpius Nabyal, S.Pd.Gr."
                className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs font-bold text-slate-900"
              />
            </div>

            {/* Tempat Tgl Lahir & Umur */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="font-bold text-slate-700 block mb-0.5">Tempat Lahir</label>
                <input
                  type="text"
                  value={formData.tempatLahir || ''}
                  disabled={!isEditing}
                  onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })}
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
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-0.5">Umur (Tahun)</label>
                <input
                  type="number"
                  value={formData.umur ?? ''}
                  disabled={!isEditing}
                  onChange={(e) => setFormData({ ...formData, umur: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs"
                />
              </div>
            </div>

            {/* Pangkat Golongan & Jabatan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="font-bold text-slate-700 block mb-0.5">Pangkat dan Golongan</label>
                <input
                  type="text"
                  value={formData.pangkatGolongan || ''}
                  disabled={!isEditing}
                  onChange={(e) => setFormData({ ...formData, pangkatGolongan: e.target.value })}
                  placeholder="Contoh: Penata Muda / III-a atau Non-PNS"
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-0.5">Jabatan</label>
                <select
                  value={formData.jabatan || 'Guru Kelas'}
                  disabled={!isEditing}
                  onChange={(e) => setFormData({ ...formData, jabatan: e.target.value as any })}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs font-semibold"
                >
                  <option value="Kepala Sekolah">Kepala Sekolah</option>
                  <option value="Guru Kelas">Guru Kelas</option>
                  <option value="Guru Mapel">Guru Mata Pelajaran (Mapel)</option>
                  <option value="Tendik">Tenaga Kependidikan (Tendik)</option>
                  <option value="Administrasi">Staf Administrasi / Operator TU</option>
                </select>
              </div>
            </div>

            {/* Pendidikan & Jurusan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="font-bold text-slate-700 block mb-0.5">Pendidikan Terakhir</label>
                <input
                  type="text"
                  value={formData.pendidikanTerakhir || ''}
                  disabled={!isEditing}
                  onChange={(e) => setFormData({ ...formData, pendidikanTerakhir: e.target.value })}
                  placeholder="Contoh: S1 PGSD, S2 Manajemen Pendidikan"
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-0.5">Jurusan</label>
                <input
                  type="text"
                  value={formData.jurusan || ''}
                  disabled={!isEditing}
                  onChange={(e) => setFormData({ ...formData, jurusan: e.target.value })}
                  placeholder="Contoh: PGSD, PAK, Olahraga"
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs"
                />
              </div>
            </div>

            {/* Sertifikasi & Masa Kerja */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-emerald-50/40 p-2.5 rounded border border-emerald-200/60">
              <div>
                <label className="font-bold text-slate-700 block mb-0.5">Sertifikasi Pendidik</label>
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-1.5 font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="sertifikasi"
                      value="Sudah"
                      disabled={!isEditing}
                      checked={formData.sertifikasi === 'Sudah'}
                      onChange={() => setFormData({ ...formData, sertifikasi: 'Sudah' })}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Sudah Bersertifikasi (Gr.)</span>
                  </label>
                  <label className="flex items-center gap-1.5 font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="sertifikasi"
                      value="Belum"
                      disabled={!isEditing}
                      checked={formData.sertifikasi === 'Belum'}
                      onChange={() => setFormData({ ...formData, sertifikasi: 'Belum' })}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Belum</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-0.5">Masa Kerja</label>
                <input
                  type="text"
                  value={formData.masaKerja || ''}
                  disabled={!isEditing}
                  onChange={(e) => setFormData({ ...formData, masaKerja: e.target.value })}
                  placeholder="Contoh: 6 Tahun 4 Bulan"
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs"
                />
              </div>
            </div>

            {/* Riwayat Tugas */}
            <div>
              <label className="font-bold text-slate-700 block mb-0.5">Riwayat Tugas / Tugas Tambahan</label>
              <textarea
                rows={2}
                value={formData.riwayatTugas || ''}
                disabled={!isEditing}
                onChange={(e) => setFormData({ ...formData, riwayatTugas: e.target.value })}
                placeholder="Rincian penugasan kelas, operator dapodik, bendahara BOS, pramuka..."
                className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs"
              />
            </div>

            {/* Keterangan: Pensiun/Pindah/Mutasi/Meninggal/Aktif */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Keterangan Keaktifan Guru</label>
              <div className="flex flex-wrap gap-2">
                {(['Aktif', 'Pensiun', 'Pindah', 'Mutasi', 'Meninggal'] as TeacherCondition[]).map((cond) => (
                  <label
                    key={cond}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-semibold cursor-pointer ${
                      formData.keterangan === cond
                        ? 'bg-emerald-100 border-emerald-600 text-emerald-900'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="guru_keterangan"
                      value={cond}
                      disabled={!isEditing}
                      checked={formData.keterangan === cond}
                      onChange={() => setFormData({ ...formData, keterangan: cond })}
                    />
                    <span>{cond}</span>
                  </label>
                ))}
              </div>
            </div>

            {isEditing && (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow text-xs flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  Simpan Data Guru
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Daftar Guru Table */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase">
                Daftar Guru & GTK ({filteredTeachers.length})
              </h3>
              <p className="text-[11px] text-slate-500">
                Pendidik dan Tenaga Kependidikan
              </p>
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs font-semibold"
            >
              <option value="SEMUA">Semua Status</option>
              <option value="PNS">PNS</option>
              <option value="PPPK">PPPK</option>
              <option value="Honor Daerah">Honor Daerah</option>
              <option value="Honor Sekolah">Honor Sekolah</option>
            </select>
          </div>

          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama guru, NIP, NUPTK..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-[580px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="p-2 w-8 text-center">No</th>
                  <th className="p-2">Guru</th>
                  <th className="p-2">Jabatan / Gol</th>
                  <th className="p-2">Status</th>
                  <th className="p-2 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeachers.map((t, idx) => {
                  const isSelected = t.id === selectedTeacherId;
                  return (
                    <tr
                      key={t.id}
                      onClick={() => handleSelectTeacher(t)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-emerald-50 font-medium' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="p-2 text-center text-slate-500">{idx + 1}</td>
                      <td className="p-2">
                        <div className="font-bold text-slate-900">{t.nama}</div>
                        <div className="text-[10px] text-slate-500 font-mono">NUPTK: {t.nuptk}</div>
                      </td>
                      <td className="p-2">
                        <div className="font-semibold text-slate-800">{t.jabatan}</div>
                        <div className="text-[10px] text-slate-500">{t.pangkatGolongan}</div>
                      </td>
                      <td className="p-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {t.statusKepegawaian}
                        </span>
                      </td>
                      <td className="p-2 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewDetailModal(t);
                            }}
                            className="p-1 rounded bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-300 text-[10px] font-bold transition-colors cursor-pointer"
                            title="Lihat Rincian Guru"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectTeacher(t);
                              setIsEditing(true);
                            }}
                            className="p-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-300 text-[10px] font-bold transition-colors cursor-pointer"
                            title="Edit Data Guru"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectTeacher(t);
                              handleDelete();
                            }}
                            className="p-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-300 text-[10px] font-bold transition-colors cursor-pointer"
                            title="Hapus Guru"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectTeacher(t);
                              handlePrintSingleTeacher(t);
                            }}
                            className="p-1 px-1.5 rounded bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 text-[10px] font-bold transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                            title="Cetak Biodata Guru Ini (Satu per Satu)"
                          >
                            <Printer className="w-3 h-3 text-emerald-700" />
                            <span>Cetak 1</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {viewDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 no-print">
          <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl overflow-hidden border border-slate-300">
            <div className="bg-emerald-800 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Profil Lengkap Guru & GTK</h3>
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
              <div className="flex gap-4 items-center bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    onClick={() => modalPhotoInputRef.current?.click()}
                    className="w-20 h-24 rounded bg-slate-200 border-2 border-blue-600 flex items-center justify-center overflow-hidden cursor-pointer relative group shadow-sm"
                    title="Klik untuk Upload / Ganti Foto Guru"
                  >
                    {viewDetailModal.foto && viewDetailModal.foto.trim() ? (
                      <img src={viewDetailModal.foto} alt={viewDetailModal.nama} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <GraduationCap className="w-10 h-10 text-slate-400" />
                    )}
                    <div className="absolute inset-0 bg-slate-900/75 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-4 h-4 text-amber-300 mb-0.5" />
                      <span className="text-[8px] font-bold">Ganti Foto</span>
                    </div>
                  </div>
                  <div className="mt-1.5 flex items-center gap-1 w-20">
                    <button
                      type="button"
                      onClick={() => modalPhotoInputRef.current?.click()}
                      className="flex-1 py-1 px-1 bg-blue-700 hover:bg-blue-800 text-white rounded text-[9px] font-bold inline-flex items-center justify-center gap-0.5 cursor-pointer transition-colors shadow-xs"
                    >
                      <Camera className="w-3 h-3" />
                      <span>{viewDetailModal.foto ? 'Ganti' : 'Upload'}</span>
                    </button>
                    {viewDetailModal.foto && (
                      <button
                        type="button"
                        onClick={handleRemoveModalPhoto}
                        className="py-1 px-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-[9px] font-bold inline-flex items-center justify-center cursor-pointer transition-colors"
                        title="Hapus foto"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">{viewDetailModal.nama}</h4>
                  <p className="text-emerald-800 font-bold">{viewDetailModal.jabatan} - {viewDetailModal.statusKepegawaian}</p>
                  <p className="text-slate-600 text-[11px] font-mono">NIP: {viewDetailModal.nip || '-'}</p>
                  <p className="text-slate-600 text-[11px] font-mono">NUPTK: {viewDetailModal.nuptk}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 bg-white border rounded">
                  <span className="text-slate-500 block text-[10px]">Tempat, Tgl Lahir / Umur</span>
                  <span className="font-bold">{viewDetailModal.tempatLahir}, {viewDetailModal.tanggalLahir} ({viewDetailModal.umur} thn)</span>
                </div>
                <div className="p-2.5 bg-white border rounded">
                  <span className="text-slate-500 block text-[10px]">Pangkat / Golongan</span>
                  <span className="font-bold">{viewDetailModal.pangkatGolongan}</span>
                </div>
                <div className="p-2.5 bg-white border rounded">
                  <span className="text-slate-500 block text-[10px]">Pendidikan & Jurusan</span>
                  <span className="font-bold">{viewDetailModal.pendidikanTerakhir} - {viewDetailModal.jurusan}</span>
                </div>
                <div className="p-2.5 bg-white border rounded">
                  <span className="text-slate-500 block text-[10px]">Sertifikasi Pendidik</span>
                  <span className="font-bold text-emerald-700">{viewDetailModal.sertifikasi} Sertifikasi</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 block text-[10px] mb-1">Riwayat Tugas & Penugasan:</span>
                <p className="font-medium text-slate-800">{viewDetailModal.riwayatTugas}</p>
              </div>
            </div>

            <div className="bg-slate-100 p-3 flex flex-wrap items-center justify-between gap-2 border-t">
              <button
                type="button"
                id="btn-generate-surat-guru-modal"
                onClick={() => {
                  notifyMessage(`Draf Surat Keterangan Melaksanakan Tugas (SKMT) untuk ${viewDetailModal.nama} Berhasil Dibuat Berbasis AI!`);
                  triggerPrint();
                }}
                className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-lg font-black text-xs flex items-center gap-1.5 shadow-sm border border-amber-400 cursor-pointer"
                title="Generate draf naskah dinas SKMT / Surat Tugas aktif untuk guru ini"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Generate Surat SKMT (AI)
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setViewDetailModal(null);
                    handleSelectTeacher(viewDetailModal);
                    setIsEditing(true);
                  }}
                  className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded font-bold text-xs cursor-pointer"
                >
                  Edit Guru
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (viewDetailModal) {
                      handlePrintSingleTeacher(viewDetailModal);
                    }
                  }}
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="Cetak Biodata Guru Ini Saja (Satu per Satu)"
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
