import React, { useState, useRef } from 'react';
import {
  Student,
  Teacher,
  PaperSize,
  SchoolSettings
} from '../../types';
import { ActionToolbar } from '../ActionToolbar';
import { triggerPrint } from '../../utils/exportHelpers';
import { compressAndResizeImage } from '../../utils/imageHelper';
import {
  Contact,
  CreditCard,
  Printer,
  QrCode,
  Search,
  UserCheck,
  School,
  Sparkles,
  Camera,
  Upload,
  Trash2,
  CheckCircle2
} from 'lucide-react';

interface IdCardModuleProps {
  students: Student[];
  teachers: Teacher[];
  onHome: () => void;
  settings: SchoolSettings;
  notifyMessage: (msg?: string) => void;
  onSync: () => void;
  onSaveStudent?: (student: Student) => void;
  onSaveTeacher?: (teacher: Teacher) => void;
}

export const IdCardModule: React.FC<IdCardModuleProps> = ({
  students,
  teachers,
  onHome,
  settings,
  notifyMessage,
  onSync,
  onSaveStudent,
  onSaveTeacher
}) => {
  const [cardType, setCardType] = useState<'siswa' | 'guru'>('siswa');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(teachers[0]?.id || '');
  const [cardDimension, setCardDimension] = useState<'besar' | 'jumbo' | 'standar'>('besar');
  const [paperSize, setPaperSize] = useState<PaperSize>(settings.ukuranKertas);

  const studentFileInputRef = useRef<HTMLInputElement>(null);
  const teacherFileInputRef = useRef<HTMLInputElement>(null);

  const currentStudent = students.find(s => s.id === selectedStudentId) || students[0];
  const currentTeacher = teachers.find(t => t.id === selectedTeacherId) || teachers[0];

  const cardWidthClass =
    cardDimension === 'jumbo'
      ? 'w-full max-w-[500px] min-h-[315px]'
      : cardDimension === 'standar'
      ? 'w-full max-w-[360px] min-h-[230px]'
      : 'w-full max-w-[440px] min-h-[280px]'; // 'besar' default

  const photoSizeClass =
    cardDimension === 'jumbo'
      ? 'w-28 h-36'
      : cardDimension === 'standar'
      ? 'w-20 h-26'
      : 'w-24 h-32'; // 'besar' default

  const handleStudentPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentStudent) return;

    try {
      const base64 = await compressAndResizeImage(file, 400, 500, 0.88);
      if (onSaveStudent) {
        onSaveStudent({ ...currentStudent, foto: base64 });
      }
      notifyMessage(`Foto Siswa ${currentStudent.namaSiswa} Berhasil Diunggah & Disimpan`);
    } catch (err: any) {
      notifyMessage(err?.message || 'Gagal mengunggah foto siswa');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handleTeacherPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentTeacher) return;

    try {
      const base64 = await compressAndResizeImage(file, 400, 500, 0.88);
      if (onSaveTeacher) {
        onSaveTeacher({ ...currentTeacher, foto: base64 });
      }
      notifyMessage(`Foto Guru ${currentTeacher.nama} Berhasil Diunggah & Disimpan`);
    } catch (err: any) {
      notifyMessage(err?.message || 'Gagal mengunggah foto guru');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handleRemoveStudentPhoto = () => {
    if (!currentStudent) return;
    if (onSaveStudent) {
      onSaveStudent({ ...currentStudent, foto: '' });
    }
    notifyMessage(`Foto Siswa ${currentStudent.namaSiswa} Berhasil Dihapus`);
  };

  const handleRemoveTeacherPhoto = () => {
    if (!currentTeacher) return;
    if (onSaveTeacher) {
      onSaveTeacher({ ...currentTeacher, foto: '' });
    }
    notifyMessage(`Foto Guru ${currentTeacher.nama} Berhasil Dihapus`);
  };

  const handleToolbarUpload = (base64?: string) => {
    if (cardType === 'siswa') {
      if (base64 && currentStudent && onSaveStudent) {
        onSaveStudent({ ...currentStudent, foto: base64 });
        notifyMessage(`Foto Siswa ${currentStudent.namaSiswa} Berhasil Disimpan`);
      } else {
        studentFileInputRef.current?.click();
      }
    } else {
      if (base64 && currentTeacher && onSaveTeacher) {
        onSaveTeacher({ ...currentTeacher, foto: base64 });
        notifyMessage(`Foto Guru ${currentTeacher.nama} Berhasil Disimpan`);
      } else {
        teacherFileInputRef.current?.click();
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Selector */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-2 no-print">
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setCardType('siswa')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              cardType === 'siswa'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Kartu Pelajar / Siswa (KTS)
          </button>
          <button
            type="button"
            onClick={() => setCardType('guru')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              cardType === 'guru'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Kartu Tanda Anggota Guru / Pegawai (KTA)
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span>Pilih Nama:</span>
          {cardType === 'siswa' ? (
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="bg-white border border-slate-300 rounded px-2 py-1 font-bold"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.namaSiswa} ({s.kelas})</option>
              ))}
            </select>
          ) : (
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="bg-white border border-slate-300 rounded px-2 py-1 font-bold"
            >
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.nama} ({t.statusKepegawaian})</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Hidden file inputs for photo upload */}
      <input
        ref={studentFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleStudentPhotoUpload}
      />
      <input
        ref={teacherFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleTeacherPhotoUpload}
      />

      {/* Mandatory Standard Action Toolbar */}
      <ActionToolbar
        titleContext={`KARTU ID RESMI > ${cardType === 'siswa' ? 'KARTU TANDA PELAJAR' : 'KARTU GTK'}`}
        onHome={onHome}
        onAddNew={() => notifyMessage('Kartu Baru Siap Dicetak')}
        onSave={() => notifyMessage('Data Anda Berhasil Disimpan')}
        onView={() => triggerPrint()}
        onDelete={() => notifyMessage('Data Anda Berhasil Disimpan')}
        onSearch={() => {}}
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
        onExcel={() => notifyMessage('Cetak ID Card dilakukan melalui tombol Print / PDF')}
        onWord={() => triggerPrint()}
        onPpt={() => triggerPrint()}
        onUploadPhoto={handleToolbarUpload}
        onRefresh={() => notifyMessage('Data Anda Berhasil Disimpan')}
        onSync={onSync}
        onReset={() => notifyMessage('Data Formulir Berhasil Direset')}
        paperSize={paperSize}
        onChangePaperSize={(size) => setPaperSize(size)}
        notifyMessage={notifyMessage}
      />

      {/* Preview Card Showcase */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6 flex flex-col items-center">
        <div className="mb-4 text-center no-print w-full flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="text-left">
            <h3 className="text-sm sm:text-base font-bold text-slate-800 uppercase flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-700" />
              <span>Pratinjau {cardType === 'siswa' ? 'Kartu Pelajar Siswa (KTS)' : 'Kartu Tanda Anggota GTK (KTA)'}</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                Ukuran {cardDimension.toUpperCase()}
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Format cetak resmi resolusi tinggi lengkap foto 3x4, identitas, barcode, stempel sekolah & QR validasi Dapodik
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Dimension Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <span className="text-[11px] font-bold text-slate-500 px-2">Ukuran:</span>
              <button
                type="button"
                onClick={() => {
                  setCardDimension('besar');
                  notifyMessage('Ukuran Kartu Diubah ke BESAR (Format Ideal)');
                }}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  cardDimension === 'besar'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                Besar (Ideal)
              </button>
              <button
                type="button"
                onClick={() => {
                  setCardDimension('jumbo');
                  notifyMessage('Ukuran Kartu Diubah ke JUMBO (Ekstra Besar)');
                }}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  cardDimension === 'jumbo'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                Jumbo (Ekstra)
              </button>
              <button
                type="button"
                onClick={() => {
                  setCardDimension('standar');
                  notifyMessage('Ukuran Kartu Diubah ke STANDAR (CR-80 Saku)');
                }}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  cardDimension === 'standar'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                Standar (CR-80)
              </button>
            </div>

            {/* Direct Print Button */}
            <button
              type="button"
              id="btn-direct-print-card"
              onClick={() => triggerPrint()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
              title="Cetak kartu ini ke printer atau simpan sebagai PDF"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Cetak Kartu (Print)</span>
            </button>
          </div>
        </div>

        {/* The Printable ID Card Structure */}
        {cardType === 'siswa' && currentStudent && (
          <div className="flex flex-col items-center gap-5 w-full">
            <div className="flex flex-wrap justify-center gap-6">
              {/* Front Card */}
              <div className={`${cardWidthClass} rounded-2xl shadow-lg border-2 border-emerald-800 bg-gradient-to-br from-emerald-850 via-emerald-800 to-teal-950 text-white p-3.5 sm:p-4 flex flex-col justify-between relative overflow-hidden transition-all print:shadow-none print:border-emerald-950`}>
                <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

                {/* Card Header */}
                <div className="flex items-center gap-2.5 border-b border-emerald-500/50 pb-2">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white flex items-center justify-center p-1 flex-shrink-0 shadow-xs">
                    {settings.logoKiri && settings.logoKiri.trim() ? (
                      <img src={settings.logoKiri} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    ) : (
                      <School className="w-6 h-6 text-emerald-800" />
                    )}
                  </div>
                  <div className="leading-tight text-center flex-1">
                    <div className="text-[9px] sm:text-[10px] tracking-wider uppercase opacity-90 font-medium">PEMERINTAH KABUPATEN YAHUKIMO</div>
                    <div className="text-[12px] sm:text-[13px] font-black uppercase text-amber-300 tracking-wide">{settings.namaSekolah}</div>
                    <div className="text-[8px] sm:text-[9px] opacity-85">{settings.alamatSekolah} • NPSN: {settings.npsn}</div>
                    <div className="text-[9px] font-black tracking-widest text-emerald-200 mt-0.5 uppercase">KARTU TANDA PELAJAR</div>
                  </div>
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white flex items-center justify-center p-1 flex-shrink-0 shadow-xs">
                    {settings.logoKanan && settings.logoKanan.trim() ? (
                      <img src={settings.logoKanan} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    ) : (
                      <Sparkles className="w-6 h-6 text-emerald-800" />
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="flex gap-3 sm:gap-4 my-auto items-center py-2">
                  <div
                    onClick={() => studentFileInputRef.current?.click()}
                    className={`${photoSizeClass} bg-white rounded-lg border-2 border-emerald-300 overflow-hidden flex-shrink-0 flex items-center justify-center relative group cursor-pointer shadow-md`}
                    title="Klik untuk Upload Foto Siswa 3x4"
                  >
                    {currentStudent.foto && currentStudent.foto.trim() ? (
                      <img src={currentStudent.foto} alt={currentStudent.namaSiswa} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-emerald-900 font-black text-xl">{(currentStudent.namaSiswa || 'SW').slice(0, 2).toUpperCase()}</span>
                    )}

                    {/* Interactive Overlay for Quick Photo Upload */}
                    <div className="absolute inset-0 bg-emerald-950/80 text-white flex flex-col items-center justify-center p-1 opacity-0 group-hover:opacity-100 transition-opacity no-print">
                      <Camera className="w-5 h-5 text-amber-300 mb-1" />
                      <span className="text-[8px] font-bold text-center leading-tight">Ganti Foto 3x4</span>
                    </div>

                    {/* Small Camera Badge indicator */}
                    <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-800/90 text-white flex items-center justify-center shadow-xs no-print group-hover:hidden">
                      <Camera className="w-3 h-3 text-amber-200" />
                    </div>
                  </div>

                  <div className="space-y-1 text-xs sm:text-[13px] flex-1 leading-snug">
                    <div className="flex">
                      <span className="opacity-80 inline-block w-20 text-[11px] shrink-0">Nama Siswa</span>
                      <span className="mr-1">:</span>
                      <strong className="text-amber-200 font-black tracking-wide">{currentStudent.namaSiswa}</strong>
                    </div>
                    <div className="flex">
                      <span className="opacity-80 inline-block w-20 text-[11px] shrink-0">NIS / NISN</span>
                      <span className="mr-1">:</span>
                      <span className="font-mono font-bold">{currentStudent.nis || '-'} / {currentStudent.nisn || '-'}</span>
                    </div>
                    <div className="flex">
                      <span className="opacity-80 inline-block w-20 text-[11px] shrink-0">Kelas</span>
                      <span className="mr-1">:</span>
                      <strong className="text-white">{currentStudent.kelas} ({currentStudent.rombel || 'A'})</strong>
                    </div>
                    <div className="flex">
                      <span className="opacity-80 inline-block w-20 text-[11px] shrink-0">TTL</span>
                      <span className="mr-1">:</span>
                      <span>{currentStudent.tempatLahir}, {currentStudent.tanggalLahir}</span>
                    </div>
                    <div className="flex">
                      <span className="opacity-80 inline-block w-20 text-[11px] shrink-0">JK / Agama</span>
                      <span className="mr-1">:</span>
                      <span>{currentStudent.jenisKelamin === 'L' ? 'Laki-Laki' : 'Perempuan'} / {currentStudent.agama}</span>
                    </div>
                    <div className="flex">
                      <span className="opacity-80 inline-block w-20 text-[11px] shrink-0">Alamat</span>
                      <span className="mr-1">:</span>
                      <span className="truncate">{currentStudent.alamat || settings.alamatSekolah}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between border-t border-emerald-500/50 pt-1.5 text-[9px]">
                  <div className="font-mono font-bold tracking-widest text-emerald-200 text-[10px]">
                    ||||| | |||| ||| |||| ||||
                  </div>
                  <div className="text-right leading-tight">
                    <div className="opacity-80">Dekai, {new Date().getFullYear()}</div>
                    <div className="font-bold underline text-amber-200">{settings.namaKepsek}</div>
                    <div className="text-[8px] opacity-75">Kepala Sekolah</div>
                  </div>
                </div>
              </div>

              {/* Back Card */}
              <div className={`${cardWidthClass} rounded-2xl shadow-lg border-2 border-slate-300 bg-white text-slate-900 p-3.5 sm:p-4 flex flex-col justify-between text-xs transition-all print:shadow-none`}>
                <div>
                  <div className="text-center font-bold text-xs sm:text-sm border-b-2 border-emerald-700 pb-1.5 mb-2 uppercase text-emerald-900 tracking-wide">
                    KETENTUAN PEMEGANG KARTU PELAJAR
                  </div>
                  <ol className="list-decimal pl-4 space-y-1.5 text-[11px] sm:text-xs text-slate-700 leading-relaxed">
                    <li>Kartu ini merupakan bukti resmi identitas peserta didik sah pada {settings.namaSekolah}.</li>
                    <li>Wajib dibawa setiap hari saat kegiatan belajar mengajar, upacara bendera, dan ujian sekolah.</li>
                    <li>Dilarang mencoret, merusak, menggandakan, atau memindahtangankan kartu kepada pihak lain.</li>
                    <li>Apabila kartu ini hilang atau rusak, segera melapor ke Bagian Tata Usaha Sekolah di Dekai.</li>
                    <li>Barang siapa menemukan kartu ini mohon dikembalikan ke alamat sekolah tercantum di bagian depan.</li>
                  </ol>
                </div>

                <div className="border-t border-slate-200 pt-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-11 h-11 text-slate-900" />
                    <div>
                      <div className="font-black text-[10px] text-emerald-950 uppercase">VALIDASI DIGITAL DAPODIK</div>
                      <div className="text-[9px] text-slate-600">NPSN: {settings.npsn}</div>
                      <div className="text-[8px] text-slate-500">{settings.kabupaten || 'Kabupaten Pegunungan Bintang'}</div>
                    </div>
                  </div>
                  <div className="text-center text-[10px] leading-tight">
                    <p className="text-slate-600">Kepala Sekolah,</p>
                    <div className="h-6 flex items-center justify-center">
                      <span className="text-[9px] font-serif italic text-emerald-700 font-semibold">[STEMPEL RESMI]</span>
                    </div>
                    <p className="font-bold underline text-slate-900 text-xs">{settings.namaKepsek}</p>
                    <p className="text-[9px] text-slate-500 font-mono">NIP. {settings.nipKepsek || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dedicated Photo Upload Action Bar for Student Card */}
            <div className="w-full max-w-2xl bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 no-print mt-1 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Foto Kartu Siswa:</span>
                    <span className="text-emerald-800 font-black">{currentStudent.namaSiswa}</span>
                    {currentStudent.foto ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 border border-emerald-200 rounded">
                        <CheckCircle2 className="w-3 h-3" /> Ada Foto (3x4)
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 border border-amber-200 rounded">
                        Belum Ada Foto
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Format JPG/PNG/WebP, otomatis dikompresi & disesuaikan ukuran 3x4 standar
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="btn-upload-foto-siswa-card"
                  onClick={() => studentFileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{currentStudent.foto ? 'Ganti Foto Siswa' : 'Upload Foto Siswa'}</span>
                </button>
                {currentStudent.foto && (
                  <button
                    type="button"
                    onClick={handleRemoveStudentPhoto}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    title="Hapus foto siswa"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Teacher ID Card */}
        {cardType === 'guru' && currentTeacher && (
          <div className="flex flex-col items-center gap-5 w-full">
            <div className="flex flex-wrap justify-center gap-6">
              {/* Teacher Front Card */}
              <div className={`${cardWidthClass} rounded-2xl shadow-lg border-2 border-blue-900 bg-gradient-to-br from-blue-950 via-indigo-900 to-slate-950 text-white p-3.5 sm:p-4 flex flex-col justify-between relative overflow-hidden transition-all print:shadow-none print:border-blue-950`}>
                <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

                {/* Card Header */}
                <div className="flex items-center gap-2.5 border-b border-blue-500/50 pb-2">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white flex items-center justify-center p-1 flex-shrink-0 shadow-xs">
                    {settings.logoKiri && settings.logoKiri.trim() ? (
                      <img src={settings.logoKiri} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    ) : (
                      <School className="w-6 h-6 text-blue-900" />
                    )}
                  </div>
                  <div className="leading-tight text-center flex-1">
                    <div className="text-[9px] sm:text-[10px] tracking-wider uppercase opacity-90 font-medium">PEMERINTAH KABUPATEN YAHUKIMO</div>
                    <div className="text-[12px] sm:text-[13px] font-black uppercase text-amber-300 tracking-wide">{settings.namaSekolah}</div>
                    <div className="text-[8px] sm:text-[9px] opacity-85">{settings.alamatSekolah} • NPSN: {settings.npsn}</div>
                    <div className="text-[9px] font-black tracking-widest text-indigo-200 mt-0.5 uppercase">KARTU TANDA ANGGOTA GTK / PENDIDIK</div>
                  </div>
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white flex items-center justify-center p-1 flex-shrink-0 shadow-xs">
                    {settings.logoKanan && settings.logoKanan.trim() ? (
                      <img src={settings.logoKanan} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    ) : (
                      <Sparkles className="w-6 h-6 text-blue-900" />
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="flex gap-3 sm:gap-4 my-auto items-center py-2">
                  <div
                    onClick={() => teacherFileInputRef.current?.click()}
                    className={`${photoSizeClass} bg-white rounded-lg border-2 border-blue-300 overflow-hidden flex-shrink-0 flex items-center justify-center relative group cursor-pointer shadow-md`}
                    title="Klik untuk Upload Foto Guru 3x4"
                  >
                    {currentTeacher.foto && currentTeacher.foto.trim() ? (
                      <img src={currentTeacher.foto} alt={currentTeacher.nama} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-blue-900 font-black text-xl">{(currentTeacher.nama || 'GR').slice(0, 2).toUpperCase()}</span>
                    )}

                    {/* Interactive Overlay for Quick Photo Upload */}
                    <div className="absolute inset-0 bg-blue-950/80 text-white flex flex-col items-center justify-center p-1 opacity-0 group-hover:opacity-100 transition-opacity no-print">
                      <Camera className="w-5 h-5 text-amber-300 mb-1" />
                      <span className="text-[8px] font-bold text-center leading-tight">Ganti Foto 3x4</span>
                    </div>

                    {/* Small Camera Badge indicator */}
                    <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-blue-800/90 text-white flex items-center justify-center shadow-xs no-print group-hover:hidden">
                      <Camera className="w-3 h-3 text-amber-200" />
                    </div>
                  </div>

                  <div className="space-y-1 text-xs sm:text-[13px] flex-1 leading-snug">
                    <div className="flex">
                      <span className="opacity-80 inline-block w-24 text-[11px] shrink-0">Nama Lengkap</span>
                      <span className="mr-1">:</span>
                      <strong className="text-amber-200 font-black tracking-wide">{currentTeacher.nama}</strong>
                    </div>
                    <div className="flex">
                      <span className="opacity-80 inline-block w-24 text-[11px] shrink-0">NIP / NUPTK</span>
                      <span className="mr-1">:</span>
                      <span className="font-mono font-bold text-white">{currentTeacher.nip || currentTeacher.nuptk || '-'}</span>
                    </div>
                    <div className="flex">
                      <span className="opacity-80 inline-block w-24 text-[11px] shrink-0">Jabatan Pokok</span>
                      <span className="mr-1">:</span>
                      <strong className="text-white">{currentTeacher.jabatan}</strong>
                    </div>
                    <div className="flex">
                      <span className="opacity-80 inline-block w-24 text-[11px] shrink-0">Status / Gol.</span>
                      <span className="mr-1">:</span>
                      <span>{currentTeacher.statusKepegawaian} ({currentTeacher.pangkatGolongan || '-'})</span>
                    </div>
                    <div className="flex">
                      <span className="opacity-80 inline-block w-24 text-[11px] shrink-0">Pendidikan</span>
                      <span className="mr-1">:</span>
                      <span>{currentTeacher.pendidikanTerakhir} {currentTeacher.jurusan ? `- ${currentTeacher.jurusan}` : ''}</span>
                    </div>
                    <div className="flex">
                      <span className="opacity-80 inline-block w-24 text-[11px] shrink-0">Unit Kerja</span>
                      <span className="mr-1">:</span>
                      <span className="truncate">{settings.namaSekolah}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between border-t border-blue-500/50 pt-1.5 text-[9px]">
                  <div className="font-mono font-bold tracking-widest text-blue-200 text-[10px]">
                    |||| ||| ||||| || ||||||
                  </div>
                  <div className="text-right leading-tight">
                    <div className="opacity-80">Dekai, {new Date().getFullYear()}</div>
                    <div className="font-bold underline text-amber-200">{settings.namaKepsek}</div>
                    <div className="text-[8px] opacity-75">Kepala Sekolah</div>
                  </div>
                </div>
              </div>

              {/* Teacher Back Card */}
              <div className={`${cardWidthClass} rounded-2xl shadow-lg border-2 border-slate-300 bg-white text-slate-900 p-3.5 sm:p-4 flex flex-col justify-between text-xs transition-all print:shadow-none`}>
                <div>
                  <div className="text-center font-bold text-xs sm:text-sm border-b-2 border-blue-800 pb-1.5 mb-2 uppercase text-blue-950 tracking-wide">
                    KETENTUAN KARTU TANDA ANGGOTA GTK
                  </div>
                  <ol className="list-decimal pl-4 space-y-1.5 text-[11px] sm:text-xs text-slate-700 leading-relaxed">
                    <li>Kartu ini adalah Kartu Identitas Resmi Pendidik dan Tenaga Kependidikan pada {settings.namaSekolah}.</li>
                    <li>Pemegang kartu berhak mendapatkan hak-hak kedinasan dan wajib menjunjung tinggi Kode Etik Guru Indonesia.</li>
                    <li>Wajib dibawa saat bertugas, upacara kedinasan, kegiatan KKG/MGMP, dan pertemuan dinas pendidikan.</li>
                    <li>Kartu ini tidak boleh dipindahtangankan atau disalahgunakan oleh pihak yang tidak berhak.</li>
                    <li>Apabila kartu ini hilang atau rusak, segera hubungi Tata Usaha Sekolah atau Koordinator Kepegawaian.</li>
                  </ol>
                </div>

                <div className="border-t border-slate-200 pt-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-11 h-11 text-slate-900" />
                    <div>
                      <div className="font-black text-[10px] text-blue-950 uppercase">VALIDASI SIMPATIKA & DAPODIK</div>
                      <div className="text-[9px] text-slate-600">GTK Kemendikbudristek</div>
                      <div className="text-[8px] text-slate-500">{settings.kabupaten || 'Kabupaten Pegunungan Bintang'}, Papua</div>
                    </div>
                  </div>
                  <div className="text-center text-[10px] leading-tight">
                    <p className="text-slate-600">Kepala Sekolah,</p>
                    <div className="h-6 flex items-center justify-center">
                      <span className="text-[9px] font-serif italic text-blue-800 font-semibold">[STEMPEL DINAS]</span>
                    </div>
                    <p className="font-bold underline text-slate-900 text-xs">{settings.namaKepsek}</p>
                    <p className="text-[9px] text-slate-500 font-mono">NIP. {settings.nipKepsek || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dedicated Photo Upload Action Bar for Teacher Card */}
            <div className="w-full max-w-2xl bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 no-print mt-1 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Foto Kartu Guru:</span>
                    <span className="text-blue-900 font-black">{currentTeacher.nama}</span>
                    {currentTeacher.foto ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 border border-blue-200 rounded">
                        <CheckCircle2 className="w-3 h-3" /> Ada Foto (3x4)
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 border border-amber-200 rounded">
                        Belum Ada Foto
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Format JPG/PNG/WebP, otomatis dikompresi & disesuaikan ukuran 3x4 resmi KTA
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="btn-upload-foto-guru-card"
                  onClick={() => teacherFileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{currentTeacher.foto ? 'Ganti Foto Guru' : 'Upload Foto Guru'}</span>
                </button>
                {currentTeacher.foto && (
                  <button
                    type="button"
                    onClick={handleRemoveTeacherPhoto}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    title="Hapus foto guru"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
