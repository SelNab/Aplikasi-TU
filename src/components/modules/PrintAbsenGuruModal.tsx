import React, { useState } from 'react';
import { Teacher, TeacherAttendance, SchoolSettings, PaperSize } from '../../types';
import { triggerPrint } from '../../utils/exportHelpers';
import {
  Printer,
  FileSpreadsheet,
  FileText,
  X,
  School,
  Sparkles,
  Calendar,
  CheckCircle2,
  Users
} from 'lucide-react';

interface PrintAbsenGuruModalProps {
  isOpen: boolean;
  onClose: () => void;
  teachers: Teacher[];
  attendances: TeacherAttendance[];
  tanggal: string;
  settings: SchoolSettings;
  notifyMessage: (msg?: string) => void;
  onExportExcel: () => void;
  onExportWord: () => void;
}

export const PrintAbsenGuruModal: React.FC<PrintAbsenGuruModalProps> = ({
  isOpen,
  onClose,
  teachers,
  attendances,
  tanggal,
  settings,
  notifyMessage,
  onExportExcel,
  onExportWord
}) => {
  const [formatType, setFormatType] = useState<'harian' | 'bulanan' | 'blanko'>('harian');
  const [paperSize, setPaperSize] = useState<PaperSize>(settings.ukuranKertas || 'F4');
  const [selectedBulan, setSelectedBulan] = useState(tanggal.slice(0, 7)); // YYYY-MM

  if (!isOpen) return null;

  // Day attendance map
  const dayMap = new Map<string, TeacherAttendance>();
  attendances
    .filter(a => a.tanggal === tanggal)
    .forEach(a => {
      dayMap.set(a.nama, a);
    });

  // Calculate monthly stats per teacher if bulanan
  const monthlyStats = teachers.map((t) => {
    const teacherMonthlyAtt = attendances.filter(
      a => a.nama === t.nama && a.tanggal.startsWith(selectedBulan)
    );
    const hadir = teacherMonthlyAtt.filter(a => a.keterangan === 'Hadir').length;
    const izin = teacherMonthlyAtt.filter(a => a.keterangan === 'Izin').length;
    const sakit = teacherMonthlyAtt.filter(a => a.keterangan === 'Sakit').length;
    const cuti = teacherMonthlyAtt.filter(a => a.keterangan === 'Cuti').length;
    const alpa = teacherMonthlyAtt.filter(a => a.keterangan === 'Alpa').length;
    const total = hadir + izin + sakit + cuti + alpa;
    const persen = total > 0 ? Math.round((hadir / total) * 100) : 100;
    return { teacher: t, hadir, izin, sakit, cuti, alpa, total, persen };
  });

  const totalHadir = teachers.filter(t => dayMap.get(t.nama)?.keterangan === 'Hadir').length;
  const totalIzin = teachers.filter(t => dayMap.get(t.nama)?.keterangan === 'Izin').length;
  const totalSakit = teachers.filter(t => dayMap.get(t.nama)?.keterangan === 'Sakit').length;
  const totalCuti = teachers.filter(t => dayMap.get(t.nama)?.keterangan === 'Cuti').length;
  const totalAlpa = teachers.filter(t => dayMap.get(t.nama)?.keterangan === 'Alpa').length;
  const persenKehadiran = teachers.length > 0 ? Math.round((totalHadir / teachers.length) * 100) : 0;

  const handlePrint = () => {
    triggerPrint();
    notifyMessage('Perintah Cetak Berhasil Dikirim ke Printer');
  };

  const formattedDate = new Date(tanggal).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50 no-print animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Top Control Bar */}
        <div className="p-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Pratinjau & Cetak Lembar Presensi Guru & GTK</h3>
              <p className="text-[10px] text-slate-300">
                SD Negeri Dekai • Dewan Guru & Tenaga Kependidikan • Kertas {paperSize.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Quick Format & Paper Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex bg-slate-800 p-0.5 rounded-lg text-xs font-semibold border border-slate-700">
              <button
                type="button"
                onClick={() => setFormatType('harian')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  formatType === 'harian' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Harian ({tanggal})
              </button>
              <button
                type="button"
                onClick={() => setFormatType('bulanan')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  formatType === 'bulanan' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Rekap Bulanan
              </button>
              <button
                type="button"
                onClick={() => setFormatType('blanko')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  formatType === 'blanko' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Blanko Meja Piket
              </button>
            </div>

            <select
              value={paperSize}
              onChange={(e) => setPaperSize(e.target.value as PaperSize)}
              className="bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-lg px-2 py-1 cursor-pointer"
            >
              <option value="F4">F4 / Folio</option>
              <option value="A4">A4</option>
              <option value="Letter">Letter</option>
            </select>

            <button
              type="button"
              id="btn-print-presensi-guru-now"
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak (Print)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action sub-bar for Exports */}
        <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
          <div className="flex items-center gap-2">
            <span>Format Cetak: <strong>{formatType === 'harian' ? 'Daftar Hadir Harian GTK' : formatType === 'bulanan' ? 'Rekapitulasi Bulanan GTK' : 'Blanko Meja Piket'}</strong></span>
            {formatType === 'bulanan' && (
              <input
                type="month"
                value={selectedBulan}
                onChange={(e) => setSelectedBulan(e.target.value)}
                className="bg-white border border-slate-300 rounded px-2 py-0.5 text-xs font-bold"
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onExportExcel}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-300 rounded text-slate-700 font-semibold cursor-pointer shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Unduh Excel</span>
            </button>
            <button
              type="button"
              onClick={onExportWord}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-300 rounded text-slate-700 font-semibold cursor-pointer shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Unduh Word</span>
            </button>
          </div>
        </div>

        {/* Preview Container */}
        <div className="p-4 sm:p-6 overflow-y-auto bg-slate-200/80 flex justify-center items-start flex-1">
          <div className="bg-white p-6 sm:p-8 shadow-xl border border-slate-300 max-w-4xl w-full text-black rounded-lg printable-content">
            {/* Kop Surat Resmi */}
            <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
              <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
                {settings.logoKiri && settings.logoKiri.trim() ? (
                  <img
                    src={settings.logoKiri}
                    alt="Logo Sekolah"
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <School className="w-10 h-10 text-slate-800" />
                )}
              </div>
              <div className="text-center flex-1 px-3">
                <h2 className="text-xs font-bold uppercase tracking-wider">{settings.namaInstansi}</h2>
                <h1 className="text-base sm:text-lg font-black uppercase">{settings.namaSekolah}</h1>
                <p className="text-[10px] leading-tight font-medium">
                  {settings.alamatSekolah} • NPSN: {settings.npsn}
                </p>
                <p className="text-[9.5px] italic text-slate-700">
                  Baalil, Distrik Oksibil, Kabupaten Pegunungan Bintang, Provinsi Papua Pegunungan
                </p>
              </div>
              <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
                {settings.logoKanan && settings.logoKanan.trim() ? (
                  <img
                    src={settings.logoKanan}
                    alt="Logo Tut Wuri"
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Sparkles className="w-9 h-9 text-slate-800" />
                )}
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center mb-3">
              <h3 className="text-xs sm:text-sm font-black uppercase underline tracking-wide">
                {formatType === 'harian'
                  ? 'DAFTAR HADIR GURU DAN TENAGA KEPENDIDIKAN (GTK)'
                  : formatType === 'bulanan'
                  ? 'REKAPITULASI PRESENSI GURU & GTK BULANAN'
                  : 'BLANKO DAFTAR HADIR HARIAN DEWAN GURU & GTK'}
              </h3>
              <div className="flex justify-center items-center gap-4 text-[10.5px] font-bold text-slate-800 mt-1">
                <span>
                  {formatType === 'harian'
                    ? `Hari/Tanggal: ${formattedDate}`
                    : formatType === 'bulanan'
                    ? `Bulan: ${selectedBulan}`
                    : `Tahun Pelajaran: 2024/2025`}
                </span>
                <span>•</span>
                <span>Tahun Ajaran: 2024/2025</span>
                <span>•</span>
                <span>Semester: Ganjil (I)</span>
              </div>
            </div>

            {/* Content Table based on formatType */}
            {formatType === 'harian' && (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-[10.5px] border-collapse border border-black mb-3">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border border-black p-1 text-center w-7">No</th>
                        <th className="border border-black p-1 text-left">Nama Guru & Pegawai</th>
                        <th className="border border-black p-1 text-center w-24">NIP</th>
                        <th className="border border-black p-1 text-left w-36">Jabatan / Tugas</th>
                        <th className="border border-black p-1 text-center w-20">Status</th>
                        <th className="border border-black p-1 text-center w-24">Paraf / TTD</th>
                        <th className="border border-black p-1 text-left">Catatan Tugas / Materi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teachers.map((t, idx) => {
                        const att = dayMap.get(t.nama);
                        const status = att ? att.keterangan : 'Belum';
                        return (
                          <tr key={t.id}>
                            <td className="border border-black p-1 text-center">{idx + 1}</td>
                            <td className="border border-black p-1 font-bold">
                              {t.nama}
                              <span className="block text-[9px] font-normal text-slate-600">
                                {t.statusKepegawaian}
                              </span>
                            </td>
                            <td className="border border-black p-1 text-center font-mono text-[9.5px]">
                              {t.nip || '-'}
                            </td>
                            <td className="border border-black p-1">{t.jabatan}</td>
                            <td className="border border-black p-1 text-center font-bold">
                              <span
                                className={`px-2 py-0.5 rounded text-[9.5px] ${
                                  status === 'Hadir'
                                    ? 'text-emerald-800'
                                    : status === 'Izin'
                                    ? 'text-blue-800'
                                    : status === 'Sakit'
                                    ? 'text-amber-800'
                                    : status === 'Cuti'
                                    ? 'text-purple-800'
                                    : status === 'Alpa'
                                    ? 'text-rose-800'
                                    : 'text-slate-500'
                                }`}
                              >
                                {status}
                              </span>
                            </td>
                            <td className="border border-black p-1 text-center text-slate-400">
                              {status === 'Hadir' ? '✓' : '-'}
                            </td>
                            <td className="border border-black p-1 text-[10px]">{att?.catatan || '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Summary Box */}
                <div className="grid grid-cols-6 border border-black text-[10px] text-center mb-4 bg-slate-50">
                  <div className="border-r border-black p-1">
                    Total GTK: <strong>{teachers.length}</strong>
                  </div>
                  <div className="border-r border-black p-1 text-emerald-800 font-bold">
                    Hadir: {totalHadir}
                  </div>
                  <div className="border-r border-black p-1 text-blue-800 font-bold">
                    Izin: {totalIzin}
                  </div>
                  <div className="border-r border-black p-1 text-amber-800 font-bold">
                    Sakit: {totalSakit}
                  </div>
                  <div className="border-r border-black p-1 text-purple-800 font-bold">
                    Cuti: {totalCuti}
                  </div>
                  <div className="p-1 text-rose-800 font-bold">
                    Alpa: {totalAlpa} ({persenKehadiran}%)
                  </div>
                </div>
              </>
            )}

            {formatType === 'bulanan' && (
              <div className="overflow-x-auto">
                <table className="w-full text-[10.5px] border-collapse border border-black mb-4">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-black p-1 text-center w-7">No</th>
                      <th className="border border-black p-1 text-left">Nama Guru & Pegawai</th>
                      <th className="border border-black p-1 text-center w-24">NIP</th>
                      <th className="border border-black p-1 text-left w-36">Jabatan</th>
                      <th className="border border-black p-1 text-center w-12 bg-emerald-50">Hadir</th>
                      <th className="border border-black p-1 text-center w-12 bg-blue-50">Izin</th>
                      <th className="border border-black p-1 text-center w-12 bg-amber-50">Sakit</th>
                      <th className="border border-black p-1 text-center w-12 bg-purple-50">Cuti</th>
                      <th className="border border-black p-1 text-center w-12 bg-rose-50">Alpa</th>
                      <th className="border border-black p-1 text-center w-16">Total Hari</th>
                      <th className="border border-black p-1 text-center w-16">% Hadir</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyStats.map((item, idx) => (
                      <tr key={item.teacher.id}>
                        <td className="border border-black p-1 text-center">{idx + 1}</td>
                        <td className="border border-black p-1 font-bold">{item.teacher.nama}</td>
                        <td className="border border-black p-1 text-center font-mono text-[9.5px]">
                          {item.teacher.nip || '-'}
                        </td>
                        <td className="border border-black p-1">{item.teacher.jabatan}</td>
                        <td className="border border-black p-1 text-center font-bold text-emerald-800">
                          {item.hadir}
                        </td>
                        <td className="border border-black p-1 text-center font-bold text-blue-800">
                          {item.izin}
                        </td>
                        <td className="border border-black p-1 text-center font-bold text-amber-800">
                          {item.sakit}
                        </td>
                        <td className="border border-black p-1 text-center font-bold text-purple-800">
                          {item.cuti}
                        </td>
                        <td className="border border-black p-1 text-center font-bold text-rose-800">
                          {item.alpa}
                        </td>
                        <td className="border border-black p-1 text-center">{item.total}</td>
                        <td className="border border-black p-1 text-center font-bold">{item.persen}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {formatType === 'blanko' && (
              <div className="overflow-x-auto">
                <table className="w-full text-[10.5px] border-collapse border border-black mb-4">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-black p-1 text-center w-7">No</th>
                      <th className="border border-black p-1 text-left">Nama Guru & Pegawai</th>
                      <th className="border border-black p-1 text-center w-24">NIP</th>
                      <th className="border border-black p-1 text-left w-36">Jabatan</th>
                      <th className="border border-black p-1 text-center w-20">Jam Datang</th>
                      <th className="border border-black p-1 text-center w-20">Jam Pulang</th>
                      <th className="border border-black p-1 text-center w-24">Tanda Tangan</th>
                      <th className="border border-black p-1 text-left">Catatan / Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map((t, idx) => (
                      <tr key={t.id} className="h-8">
                        <td className="border border-black p-1 text-center">{idx + 1}</td>
                        <td className="border border-black p-1 font-bold">{t.nama}</td>
                        <td className="border border-black p-1 text-center font-mono text-[9.5px]">
                          {t.nip || '-'}
                        </td>
                        <td className="border border-black p-1">{t.jabatan}</td>
                        <td className="border border-black p-1"></td>
                        <td className="border border-black p-1"></td>
                        <td className="border border-black p-1"></td>
                        <td className="border border-black p-1"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Official Signatures */}
            <div className="flex justify-between items-start pt-4 text-[11px] print-break-inside-avoid">
              <div className="text-center w-56">
                <p>Mengetahui,</p>
                <p className="font-bold">Kepala Sekolah</p>
                <div className="h-14"></div>
                <p className="font-bold underline">{settings.namaKepsek}</p>
                <p className="text-[10px]">NIP. {settings.nipKepsek || '-'}</p>
              </div>

              <div className="text-center w-56">
                <p>
                  Dekai,{' '}
                  {new Date(tanggal).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
                <p className="font-bold">Pengelola Absensi & TU</p>
                <div className="h-14"></div>
                <p className="font-bold underline">{settings.operatorTU}</p>
                <p className="text-[10px]">NIP. {settings.nipOperator || '-'}</p>
              </div>
            </div>

            {/* Footnote */}
            <div className="mt-5 pt-2 border-t border-slate-300 text-[9px] text-slate-500 flex justify-between items-center print-break-inside-avoid">
              <span>Administrasi Kepegawaian GTK • SD Negeri Baalil, Kab. Pegunungan Bintang</span>
              <span>Dicetak: {new Date().toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Total <strong>{teachers.length} Guru & Tendik</strong> terdaftar
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg font-semibold transition-colors cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Lembar Presensi (Print)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
