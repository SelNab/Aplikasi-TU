import React, { useState } from 'react';
import { SuratType, Student, Teacher, SchoolSettings, SuratDocument } from '../types';
import { generateLetterWithAI, GeneratedLetterData } from '../utils/aiSuratHelper';
import { Sparkles, X, Check, RefreshCw, Wand2, FileText, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';
import { KopSurat } from './KopSurat';

interface AiSuratModalProps {
  initialType?: SuratType;
  allTypes: SuratType[];
  students: Student[];
  teachers: Teacher[];
  settings: SchoolSettings;
  onClose: () => void;
  onApplyToForm: (data: GeneratedLetterData, jenisSurat: SuratType) => void;
  onSaveDirectly?: (surat: SuratDocument) => void;
  notifyMessage: (msg?: string) => void;
  onUploadLogoKiri?: (base64: string) => void;
  onUploadLogoKanan?: (base64: string) => void;
}

const QUICK_PROMPT_CHIPS: { label: string; jenis: SuratType; prompt: string; tujuan: string }[] = [
  {
    label: 'Surat Pindah (Ikut Orang Tua)',
    jenis: 'Surat Keterangan Pindah Siswa',
    prompt: 'Menerangkan bahwa siswa pindah sekolah karena mengikuti perpindahan dinas/domisili orang tua ke Jayapura.',
    tujuan: 'Kepala SD Negeri Kotaraja, Jayapura'
  },
  {
    label: 'Undangan Rapat Orang Tua / Raport',
    jenis: 'Surat Undangan Untuk Orang Tua/Wali',
    prompt: 'Undangan musyawarah pembagian laporan hasil belajar (raport) semester ganjil dan evaluasi program sekolah pedalaman.',
    tujuan: 'Bapak/Ibu Orang Tua / Wali Siswa'
  },
  {
    label: 'Keterangan Aktif Belajar (Beasiswa)',
    jenis: 'Surat Aktif Belajar',
    prompt: 'Menerangkan bahwa siswa adalah peserta didik aktif dan berprestasi, diajukan untuk persyaratan beasiswa afirmasi 3T.',
    tujuan: 'Panitia Seleksi Beasiswa Pendidikan Papua'
  },
  {
    label: 'Rekomendasi / Tugas Guru',
    jenis: 'Surat Keterangan Melaksanakan Tugas',
    prompt: 'Menerangkan bahwa guru telah melaksanakan tugas mengajar dan pengabdian secara penuh di wilayah 3T pedalaman Pegunungan Bintang.',
    tujuan: 'Kepala Dinas Pendidikan Kabupaten Pegunungan Bintang'
  },
  {
    label: 'Permohonan Bantuan AI & Fasilitas',
    jenis: 'Format Surat Permohonan AI',
    prompt: 'Permohonan bantuan paket perangkat tablet pembelajaran cerdas AI offline dan solar panel energi surya untuk SD pedalaman.',
    tujuan: 'Direktorat Sekolah Dasar Kemendikbudristek RI'
  },
  {
    label: 'Surat Peringatan Kedisiplinan',
    jenis: 'Surat Peringatan Untuk Siswa',
    prompt: 'Pemberitahuan kepada orang tua atas ketidakhadiran siswa berturut-turut tanpa izin dan permohonan koordinasi bersama.',
    tujuan: 'Orang Tua / Wali Siswa'
  }
];

export const AiSuratModal: React.FC<AiSuratModalProps> = ({
  initialType = 'Surat Keluar',
  allTypes,
  students,
  teachers,
  settings,
  onClose,
  onApplyToForm,
  onSaveDirectly,
  notifyMessage,
  onUploadLogoKiri,
  onUploadLogoKanan
}) => {
  const [jenisSurat, setJenisSurat] = useState<SuratType>(
    initialType === 'Rekapan Seluruh Surat' ? 'Surat Keluar' : initialType
  );
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [manualSubjek, setManualSubjek] = useState<string>('');
  const [tujuan, setTujuan] = useState<string>('');
  const [instruksi, setInstruksi] = useState<string>('');
  const [konteksTambahan, setKonteksTambahan] = useState<string>('');
  const [gayaBahasa, setGayaBahasa] = useState<'Formal Kedinasan' | 'Santun & Persuasif' | 'Tegas & Disipliner'>('Formal Kedinasan');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resultData, setResultData] = useState<GeneratedLetterData | null>(null);

  const selectedStudent = students.find(s => s.id === selectedStudentId) || null;
  const selectedTeacher = teachers.find(t => t.id === selectedTeacherId) || null;

  const handleApplyChip = (chip: typeof QUICK_PROMPT_CHIPS[0]) => {
    setJenisSurat(chip.jenis);
    setInstruksi(chip.prompt);
    setTujuan(chip.tujuan);
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const generated = await generateLetterWithAI(
        {
          jenisSurat,
          namaSekolah: settings.namaSekolah,
          tujuan: tujuan.trim() || 'Pihak Terkait',
          subjekNama: manualSubjek.trim() || (selectedStudent ? selectedStudent.namaSiswa : selectedTeacher ? selectedTeacher.nama : ''),
          instruksi: instruksi.trim() || `Membuat surat resmi perihal ${jenisSurat}`,
          konteksTambahan: konteksTambahan.trim(),
          gayaBahasa,
          selectedStudent,
          selectedTeacher
        },
        settings
      );
      setResultData(generated);
      notifyMessage('Draf Surat AI Berhasil Dibuat!');
    } catch (err: any) {
      console.error(err);
      notifyMessage('Gagal membuat surat, mencoba template lokal.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyToActiveForm = () => {
    if (!resultData) return;
    onApplyToForm(resultData, jenisSurat);
    onClose();
    notifyMessage('Data Surat AI Diterapkan ke Formulir');
  };

  const handleSaveImmediately = () => {
    if (!resultData) return;
    if (onSaveDirectly) {
      const doc: SuratDocument = {
        id: `srt-ai-${Date.now()}`,
        jenisSurat,
        nomorSurat: resultData.nomorSurat,
        tanggalSurat: resultData.tanggalSurat,
        perihal: resultData.perihal,
        isiRingkas: resultData.isiRingkas,
        alasanPengirim: resultData.alasanPengirim,
        pengirim: resultData.pengirim,
        penerima: resultData.penerima,
        keterangan: resultData.keterangan,
        isLocked: false,
        isArchived: false
      };
      onSaveDirectly(doc);
      onClose();
      notifyMessage('Surat Hasil AI Berhasil Disimpan ke Agenda!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto no-print">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden border border-slate-300 flex flex-col max-h-[92vh] my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-indigo-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300 shadow-inner">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-wide flex items-center gap-2">
                Asisten AI Pembuat Surat Kedinasan Sekolah
                <span className="bg-amber-400 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase">
                  Gemini & Smart Generator
                </span>
              </h2>
              <p className="text-[11px] text-emerald-200">
                Otomatisasi perancangan naskah dinas persuratan sekolah dengan standar tata bahasa formal
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Split 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto flex-1 p-5 gap-5 bg-slate-50 text-xs">
          {/* Left Column: Form AI Parameters */}
          <div className="lg:col-span-6 space-y-3.5 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <Wand2 className="w-4 h-4 text-emerald-700" />
                Parameter Pembuatan Surat
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Lengkapi rincian di bawah</span>
            </div>

            {/* Quick Chips */}
            <div>
              <label className="font-semibold text-slate-600 block mb-1 text-[11px]">
                Template Cepat Populer:
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {QUICK_PROMPT_CHIPS.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyChip(chip)}
                    className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-semibold text-[10px] text-left transition-colors"
                  >
                    ⚡ {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Jenis Surat */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Jenis Format Surat</label>
              <select
                value={jenisSurat}
                onChange={(e) => setJenisSurat(e.target.value as SuratType)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-emerald-900 focus:ring-1 focus:ring-emerald-500 text-xs"
              >
                {allTypes.filter(t => t !== 'Rekapan Seluruh Surat').map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Subjek Selection (Student / Teacher or Manual) */}
            <div>
              <label className="font-bold text-slate-700 block mb-1 flex items-center justify-between">
                <span>Pilih Siswa / Guru Terkait (Opsional):</span>
                <span className="text-[10px] font-normal text-emerald-700">Data otomatis diintegrasikan</span>
              </label>

              {jenisSurat.toLowerCase().includes('guru') || jenisSurat.toLowerCase().includes('tugas') ? (
                <select
                  value={selectedTeacherId}
                  onChange={(e) => {
                    setSelectedTeacherId(e.target.value);
                    setSelectedStudentId('');
                  }}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs mb-1"
                >
                  <option value="">-- Pilih Guru / Tendik dari Database --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.nama} (NIP: {t.nip || '-'}, {t.jabatan})
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={selectedStudentId}
                  onChange={(e) => {
                    setSelectedStudentId(e.target.value);
                    setSelectedTeacherId('');
                  }}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs mb-1"
                >
                  <option value="">-- Pilih Siswa dari Database Dapodik --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.namaSiswa} (NISN: {s.nisn}, Kelas {s.kelas}, Status: {s.keterangan})
                    </option>
                  ))}
                </select>
              )}

              <input
                type="text"
                placeholder="Atau ketik nama subjek manual bila tidak ada di daftar..."
                value={manualSubjek}
                onChange={(e) => setManualSubjek(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-slate-700 text-[11px]"
              />
            </div>

            {/* Tujuan / Penerima */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Ditujukan Kepada (Penerima Surat)</label>
              <input
                type="text"
                value={tujuan}
                onChange={(e) => setTujuan(e.target.value)}
                placeholder="Contoh: Kepala SD Negeri Kotaraja / Orang Tua Murid / Dinas Pendidikan"
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-medium text-xs"
              />
            </div>

            {/* Instruksi / Pokok Permasalahan */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Konteks / Pokok Maksud Surat (Bahasa Bebas Anda):
              </label>
              <textarea
                rows={3}
                value={instruksi}
                onChange={(e) => setInstruksi(e.target.value)}
                placeholder="Tuliskan inti dari apa yang ingin disampaikan pada surat, misalnya: Siswa bernama Markus ingin pindah ke Jayapura karena ayah pindah dinas kerja..."
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 text-xs"
              />
            </div>

            {/* Gaya Bahasa */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Gaya Bahasa Naskah</label>
                <select
                  value={gayaBahasa}
                  onChange={(e) => setGayaBahasa(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                >
                  <option value="Formal Kedinasan">Formal Kedinasan Baku</option>
                  <option value="Santun & Persuasif">Santun & Persuasif</option>
                  <option value="Tegas & Disipliner">Tegas & Disipliner</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Keterangan Lampiran</label>
                <input
                  type="text"
                  value={konteksTambahan}
                  onChange={(e) => setKonteksTambahan(e.target.value)}
                  placeholder="Contoh: 1 Berkas Raport & Permohonan"
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                />
              </div>
            </div>

            {/* Tombol Buat Surat */}
            <div className="pt-2">
              <button
                type="button"
                disabled={isLoading}
                onClick={handleGenerate}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-700 via-teal-700 to-indigo-800 hover:from-emerald-800 hover:to-indigo-900 text-white font-bold rounded-xl shadow flex items-center justify-center gap-2 text-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                    <span>AI Sedang Menyusun Draf Surat Resmi...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Buat Draf Surat Resmi dengan AI</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: AI Generated Output & Preview */}
          <div className="lg:col-span-6 flex flex-col bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
              <span className="font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-700" />
                Hasil Draf Surat Naskah Dinas AI
              </span>
              {resultData && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Siap Digunakan
                </span>
              )}
            </div>

            {resultData ? (
              <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                {/* Official Letterhead (KOP) with Left & Right Logo Upload */}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
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

                {/* Meta Details */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block">Nomor Surat:</span>
                      <input
                        type="text"
                        value={resultData.nomorSurat}
                        onChange={(e) => setResultData({ ...resultData, nomorSurat: e.target.value })}
                        className="font-mono font-bold text-emerald-950 bg-white border border-slate-300 px-2 py-0.5 rounded text-xs w-64"
                      />
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 font-semibold block">Tanggal:</span>
                      <span className="font-bold text-slate-800">{resultData.tanggalSurat}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block">Perihal:</span>
                    <input
                      type="text"
                      value={resultData.perihal}
                      onChange={(e) => setResultData({ ...resultData, perihal: e.target.value })}
                      className="font-bold text-slate-900 bg-white border border-slate-300 px-2 py-0.5 rounded text-xs w-full"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block">Pengirim:</span>
                      <input
                        type="text"
                        value={resultData.pengirim}
                        onChange={(e) => setResultData({ ...resultData, pengirim: e.target.value })}
                        className="bg-white border border-slate-300 px-2 py-0.5 rounded text-xs w-full"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block">Penerima:</span>
                      <input
                        type="text"
                        value={resultData.penerima}
                        onChange={(e) => setResultData({ ...resultData, penerima: e.target.value })}
                        className="bg-white border border-slate-300 px-2 py-0.5 rounded text-xs w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Main Content Body */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Isi Lengkap Naskah Surat (Dapat Diedit):
                  </label>
                  <textarea
                    rows={7}
                    value={resultData.isiRingkas}
                    onChange={(e) => setResultData({ ...resultData, isiRingkas: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-serif text-slate-900 leading-relaxed text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Reason & Notes */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-0.5">Dasar Hukum / Alasan:</label>
                    <textarea
                      rows={2}
                      value={resultData.alasanPengirim}
                      onChange={(e) => setResultData({ ...resultData, alasanPengirim: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded p-1.5 text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-0.5">Catatan / Kelengkapan:</label>
                    <textarea
                      rows={2}
                      value={resultData.keterangan}
                      onChange={(e) => setResultData({ ...resultData, keterangan: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded p-1.5 text-[11px]"
                    />
                  </div>
                </div>

                {/* Apply Actions */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={handleApplyToActiveForm}
                    className="flex-1 py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5 text-xs transition-colors cursor-pointer"
                  >
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Terapkan ke Formulir Surat</span>
                  </button>
                  {onSaveDirectly && (
                    <button
                      type="button"
                      onClick={handleSaveImmediately}
                      className="py-2 px-3 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5 text-xs transition-colors cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-indigo-200" />
                      <span>Simpan Langsung ke Arsip</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <Wand2 className="w-6 h-6 text-slate-400" />
                </div>
                <h4 className="font-bold text-slate-700 text-sm mb-1">
                  Belum Ada Draf yang Dibuat
                </h4>
                <p className="text-[11px] max-w-xs text-slate-500 mb-4">
                  Pilih jenis surat dan masukkan instruksi pokok di sebelah kiri, lalu klik tombol <strong>"Buat Draf Surat Resmi dengan AI"</strong>.
                </p>
                <div className="bg-amber-50 text-amber-900 border border-amber-200 p-2.5 rounded-lg text-left text-[11px] flex gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                  <span>
                    Fitur ini bekerja secara otomatis baik saat <strong>Online (Gemini AI)</strong> maupun <strong>Offline (Generator Naskah Resmi Mandiri)</strong> untuk Papua pedalaman.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-5 py-2.5 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            Pengembang: Selpius Nabyal, S.Pd.Gr. &bull; SD Negeri Inpres Dekai
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-200 text-slate-700 font-bold"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
