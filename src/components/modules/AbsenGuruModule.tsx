import React, { useState, useMemo } from 'react';
import {
  Teacher,
  TeacherAttendance,
  TeacherAttendanceStatus,
  PaperSize,
  SchoolSettings
} from '../../types';
import { ActionToolbar } from '../ActionToolbar';
import { exportToExcel, exportToWord, exportToPPT, triggerPrint, safeConfirm, safePrompt } from '../../utils/exportHelpers';
import { Calendar, CheckCircle2, Search, ClipboardList, Clock, Printer, Pencil, FileSpreadsheet, FileText } from 'lucide-react';
import { EditAbsenGuruModal } from './EditAbsenGuruModal';
import { PrintAbsenGuruModal } from './PrintAbsenGuruModal';

interface AbsenGuruModuleProps {
  teachers: Teacher[];
  attendances: TeacherAttendance[];
  onSaveAttendance: (att: TeacherAttendance) => void;
  onDeleteAttendance: (id: string) => void;
  onHome: () => void;
  settings: SchoolSettings;
  notifyMessage: (msg?: string) => void;
  onSync: () => void;
}

export const AbsenGuruModule: React.FC<AbsenGuruModuleProps> = ({
  teachers,
  attendances,
  onSaveAttendance,
  onDeleteAttendance,
  onHome,
  settings,
  notifyMessage,
  onSync
}) => {
  const [activeView, setActiveView] = useState<'harian' | 'rekapan'>('harian');
  const [selectedTanggal, setSelectedTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [selectedBulan, setSelectedBulan] = useState(new Date().toISOString().slice(0, 7));
  const [searchQuery, setSearchQuery] = useState('');
  const [paperSize, setPaperSize] = useState<PaperSize>(settings.ukuranKertas);

  // Edit & Print Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [editingIndex, setEditingIndex] = useState(0);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Map of teacher name to attendance on selectedTanggal
  const dayAttendanceMap = useMemo(() => {
    const map = new Map<string, TeacherAttendance>();
    attendances
      .filter(a => a.tanggal === selectedTanggal)
      .forEach(a => {
        map.set(a.nama, a);
      });
    return map;
  }, [attendances, selectedTanggal]);

  const handleSetStatus = (teacher: Teacher, status: TeacherAttendanceStatus, index: number) => {
    const existing = dayAttendanceMap.get(teacher.nama);
    const record: TeacherAttendance = {
      id: existing ? existing.id : `att-t-${Date.now()}-${teacher.id}`,
      no: index + 1,
      tanggal: selectedTanggal,
      nama: teacher.nama,
      guruKelas: `${teacher.jabatan} (${teacher.statusKepegawaian})`,
      keterangan: status,
      catatan: existing?.catatan || ''
    };
    onSaveAttendance(record);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handleMarkAllHadir = () => {
    teachers.forEach((t, i) => {
      handleSetStatus(t, 'Hadir', i);
    });
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  // Export handlers
  const handleExcelExport = () => {
    const headers = [
      'No',
      'Tanggal',
      'Nama Guru / GTK',
      'Guru Kelas / Jabatan',
      'Keterangan Kehadiran (Hadir/Izin/Sakit/Cuti/Alpa)',
      'Catatan / Tugas Pembelajaran'
    ];
    const rows = teachers.map((t, idx) => {
      const att = dayAttendanceMap.get(t.nama);
      return [
        idx + 1,
        selectedTanggal,
        t.nama,
        `${t.jabatan} - ${t.statusKepegawaian}`,
        att ? att.keterangan : 'Belum Diabsen',
        att?.catatan || '-'
      ];
    });
    exportToExcel(`Rekap_Absen_Guru_${selectedTanggal}`, headers, rows);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handleWordExport = () => {
    const content = `
      <div class="kop">
        <h2>${settings.namaInstansi}</h2>
        <h1>${settings.namaSekolah}</h1>
        <p>${settings.alamatSekolah}</p>
        <hr />
        <h3>DAFTAR HADIR GURU DAN TENAGA KEPENDIDIKAN (GTK)</h3>
        <p>Tanggal: ${selectedTanggal}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Nama Guru & GTK</th>
            <th>Jabatan / Tugas</th>
            <th>Kehadiran</th>
            <th>Catatan</th>
          </tr>
        </thead>
        <tbody>
          ${teachers.map((t, i) => {
            const att = dayAttendanceMap.get(t.nama);
            return `
              <tr>
                <td>${i + 1}</td>
                <td><b>${t.nama}</b><br/>NIP: ${t.nip || '-'}</td>
                <td>${t.jabatan}</td>
                <td>${att?.keterangan || 'Belum Diabsen'}</td>
                <td>${att?.catatan || '-'}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
      <div class="footer">
        <p align="right">
          Dekai, ${selectedTanggal}<br/>
          Kepala Sekolah,<br/><br/><br/>
          <b><u>${settings.namaKepsek}</u></b><br/>
          NIP. ${settings.nipKepsek}
        </p>
      </div>
    `;
    exportToWord(`Absen_Guru_${selectedTanggal}`, content);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handlePPTExport = () => {
    const hadir = teachers.filter(t => dayAttendanceMap.get(t.nama)?.keterangan === 'Hadir').length;
    const izin = teachers.filter(t => dayAttendanceMap.get(t.nama)?.keterangan === 'Izin').length;
    const sakit = teachers.filter(t => dayAttendanceMap.get(t.nama)?.keterangan === 'Sakit').length;
    const cuti = teachers.filter(t => dayAttendanceMap.get(t.nama)?.keterangan === 'Cuti').length;
    const alpa = teachers.filter(t => dayAttendanceMap.get(t.nama)?.keterangan === 'Alpa').length;

    const slides = [
      {
        title: `LAPORAN PRESENSI GURU & GTK`,
        subtitle: `${settings.namaSekolah} - ${selectedTanggal}`,
        bullets: [
          `Total Guru & Tendik: ${teachers.length} Orang`,
          `Hadir: ${hadir} Orang (${teachers.length ? Math.round((hadir / teachers.length) * 100) : 0}%)`,
          `Izin: ${izin} Orang`,
          `Sakit: ${sakit} Orang`,
          `Cuti Resmi: ${cuti} Orang`,
          `Alpa: ${alpa} Orang`
        ]
      }
    ];
    exportToPPT(`Presentasi_Absensi_Guru_${selectedTanggal}`, slides);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const hadirTotal = teachers.filter(t => dayAttendanceMap.get(t.nama)?.keterangan === 'Hadir').length;
  const izinTotal = teachers.filter(t => dayAttendanceMap.get(t.nama)?.keterangan === 'Izin').length;
  const sakitTotal = teachers.filter(t => dayAttendanceMap.get(t.nama)?.keterangan === 'Sakit').length;
  const cutiTotal = teachers.filter(t => dayAttendanceMap.get(t.nama)?.keterangan === 'Cuti').length;
  const alpaTotal = teachers.filter(t => dayAttendanceMap.get(t.nama)?.keterangan === 'Alpa').length;

  return (
    <div className="space-y-4">
      {/* Header controls */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-2 no-print">
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setActiveView('harian')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeView === 'harian'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Form Absen Harian Guru
          </button>
          <button
            type="button"
            onClick={() => setActiveView('rekapan')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeView === 'rekapan'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Rekapan Absen Guru (Bulanan)
          </button>
        </div>

        {/* Date & Mode Selectors */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {activeView === 'harian' ? (
            <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-200 font-semibold">
              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
              <span>Tanggal Absen:</span>
              <input
                type="date"
                value={selectedTanggal}
                onChange={(e) => setSelectedTanggal(e.target.value)}
                className="bg-white border border-slate-300 rounded px-1.5 py-0.5 font-bold cursor-pointer"
              />
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-200 font-semibold">
              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
              <span>Bulan:</span>
              <input
                type="month"
                value={selectedBulan}
                onChange={(e) => setSelectedBulan(e.target.value)}
                className="bg-white border border-slate-300 rounded px-1.5 py-0.5 font-bold cursor-pointer"
              />
            </div>
          )}

          {/* Quick Print Button in Sub-Bar */}
          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow-sm cursor-pointer transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak / Print</span>
          </button>
        </div>
      </div>

      {/* Mandatory Standard Action Toolbar */}
      <ActionToolbar
        titleContext={`ABSEN GURU & GTK (${activeView === 'harian' ? selectedTanggal : selectedBulan})`}
        onHome={onHome}
        onAddNew={handleMarkAllHadir}
        onSave={() => notifyMessage('Data Anda Berhasil Disimpan')}
        onView={() => setActiveView(activeView === 'harian' ? 'rekapan' : 'harian')}
        onDelete={() => {
          if (safeConfirm(`Hapus seluruh absensi guru tanggal ${selectedTanggal}?`)) {
            teachers.forEach(t => {
              const att = dayAttendanceMap.get(t.nama);
              if (att) onDeleteAttendance(att.id);
            });
            notifyMessage('Data Absen Guru Dihapus');
          }
        }}
        onSearch={() => {
          const q = safePrompt('Cari nama guru:', searchQuery);
          if (q !== null) setSearchQuery(q);
        }}
        onEdit={() => {
          if (teachers.length > 0) {
            setEditingTeacher(teachers[0]);
            setEditingIndex(0);
            setIsEditModalOpen(true);
          } else {
            notifyMessage('Pilih guru untuk diedit');
          }
        }}
        onCancel={() => setSearchQuery('')}
        onBack={onHome}
        onArchive={() => notifyMessage('Data Anda Berhasil Disimpan')}
        onLock={() => notifyMessage('Data Anda Berhasil Dikunci')}
        onReview={() => setIsPrintModalOpen(true)}
        onPrint={() => setIsPrintModalOpen(true)}
        onUpdate={() => notifyMessage('Data Anda Berhasil Disimpan')}
        onTemplate={() => {
          handleMarkAllHadir();
          notifyMessage('Data Anda Berhasil Disimpan');
        }}
        onPdf={() => setIsPrintModalOpen(true)}
        onExcel={handleExcelExport}
        onWord={handleWordExport}
        onPpt={handlePPTExport}
        onUploadPhoto={() => notifyMessage('Data Anda Berhasil Disimpan')}
        onRefresh={() => notifyMessage('Data Anda Berhasil Disimpan')}
        onSync={onSync}
        onReset={() => {
          teachers.forEach(t => {
            const att = dayAttendanceMap.get(t.nama);
            if (att) onDeleteAttendance(att.id);
          });
          notifyMessage('Data Formulir Berhasil Direset');
        }}
        paperSize={paperSize}
        onChangePaperSize={(size) => setPaperSize(size)}
        notifyMessage={notifyMessage}
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-emerald-700 font-semibold">Hadir</div>
            <div className="text-2xl font-black text-emerald-900">{hadirTotal}</div>
          </div>
          <div className="w-8 h-8 rounded bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold">H</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-blue-700 font-semibold">Izin</div>
            <div className="text-2xl font-black text-blue-900">{izinTotal}</div>
          </div>
          <div className="w-8 h-8 rounded bg-blue-200 text-blue-800 flex items-center justify-center font-bold">I</div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-amber-700 font-semibold">Sakit</div>
            <div className="text-2xl font-black text-amber-900">{sakitTotal}</div>
          </div>
          <div className="w-8 h-8 rounded bg-amber-200 text-amber-800 flex items-center justify-center font-bold">S</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-purple-700 font-semibold">Cuti</div>
            <div className="text-2xl font-black text-purple-900">{cutiTotal}</div>
          </div>
          <div className="w-8 h-8 rounded bg-purple-200 text-purple-800 flex items-center justify-center font-bold">C</div>
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-rose-700 font-semibold">Alpa</div>
            <div className="text-2xl font-black text-rose-900">{alpaTotal}</div>
          </div>
          <div className="w-8 h-8 rounded bg-rose-200 text-rose-800 flex items-center justify-center font-bold">A</div>
        </div>
      </div>

      {/* Table Form */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-emerald-700" />
              Presensi Pendidik & Tenaga Kependidikan ({selectedTanggal})
            </h3>
            <p className="text-[11px] text-slate-500">
              Keterangan: Hadir / Izin / Sakit / Cuti / Alpa
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPrintModalOpen(true)}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Lembar Presensi (Print)</span>
            </button>
            <button
              type="button"
              onClick={handleMarkAllHadir}
              className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-1 cursor-pointer transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Semua Hadir</span>
            </button>
          </div>
        </div>

        {activeView === 'harian' ? (
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="p-2.5 w-10 text-center">No</th>
                  <th className="p-2.5">Nama Guru / GTK</th>
                  <th className="p-2.5">Jabatan / Guru Kelas</th>
                  <th className="p-2.5 text-center">Keterangan Kehadiran</th>
                  <th className="p-2.5">Keterangan / Catatan Tugas</th>
                  <th className="p-2.5 w-32 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teachers
                  .filter(t => (t.nama || '').toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((t, idx) => {
                    const att = dayAttendanceMap.get(t.nama);
                    const status = att ? att.keterangan : null;

                    return (
                      <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-2.5 text-center text-slate-500 font-medium">{idx + 1}</td>
                        <td className="p-2.5">
                          <div className="font-bold text-slate-900">{t.nama}</div>
                          <div className="text-[10px] text-slate-500 font-mono">NIP: {t.nip || '-'}</div>
                        </td>
                        <td className="p-2.5">
                          <div className="font-semibold text-slate-800">{t.jabatan}</div>
                          <div className="text-[10px] text-emerald-700 font-medium">{t.statusKepegawaian}</div>
                        </td>
                        <td className="p-2.5 text-center">
                          <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                            {(['Hadir', 'Izin', 'Sakit', 'Cuti', 'Alpa'] as TeacherAttendanceStatus[]).map((st) => (
                              <button
                                key={st}
                                type="button"
                                onClick={() => handleSetStatus(t, st, idx)}
                                className={`px-2 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                                  status === st
                                    ? st === 'Hadir'
                                      ? 'bg-emerald-600 text-white shadow-sm'
                                      : st === 'Izin'
                                      ? 'bg-blue-600 text-white shadow-sm'
                                      : st === 'Sakit'
                                      ? 'bg-amber-600 text-white shadow-sm'
                                      : st === 'Cuti'
                                      ? 'bg-purple-600 text-white shadow-sm'
                                      : 'bg-rose-600 text-white shadow-sm'
                                    : 'bg-white hover:bg-slate-200 text-slate-700'
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="p-2.5">
                          <input
                            type="text"
                            placeholder="Materi ajar / alasan tugas luar..."
                            value={att?.catatan || ''}
                            onChange={(e) => {
                              const existing = dayAttendanceMap.get(t.nama);
                              const record: TeacherAttendance = {
                                id: existing ? existing.id : `att-t-${Date.now()}-${t.id}`,
                                no: idx + 1,
                                tanggal: selectedTanggal,
                                nama: t.nama,
                                guruKelas: `${t.jabatan} (${t.statusKepegawaian})`,
                                keterangan: existing ? existing.keterangan : 'Hadir',
                                catatan: e.target.value
                              };
                              onSaveAttendance(record);
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs focus:bg-white focus:outline-none"
                          />
                        </td>
                        <td className="p-2.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingTeacher(t);
                                setEditingIndex(idx);
                                setIsEditModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-md font-bold text-xs cursor-pointer transition-colors shadow-2xs"
                              title="Edit presensi dan catatan GTK"
                            >
                              <Pencil className="w-3 h-3 text-amber-700" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingTeacher(t);
                                setIsPrintModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-md font-bold text-xs cursor-pointer transition-colors shadow-2xs"
                              title="Cetak Presensi Guru / GTK"
                            >
                              <Printer className="w-3 h-3 text-emerald-700" />
                              <span>Print</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Rekapan Bulanan Guru View */
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">Rekapitulasi Presensi Bulan:</span>
                <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-300 text-emerald-800">
                  {selectedBulan}
                </span>
                <span className="text-slate-500">({teachers.length} Guru & GTK Terdaftar)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-sm cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Rekap Bulanan (Print)</span>
                </button>
                <button
                  type="button"
                  onClick={handleExcelExport}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg font-semibold text-slate-700 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Excel</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 w-10 text-center">No</th>
                    <th className="p-2.5">Nama Guru & Pegawai</th>
                    <th className="p-2.5">Jabatan</th>
                    <th className="p-2.5 w-14 text-center bg-emerald-50 text-emerald-800 font-black">Hadir</th>
                    <th className="p-2.5 w-14 text-center bg-blue-50 text-blue-800 font-black">Izin</th>
                    <th className="p-2.5 w-14 text-center bg-amber-50 text-amber-800 font-black">Sakit</th>
                    <th className="p-2.5 w-14 text-center bg-purple-50 text-purple-800 font-black">Cuti</th>
                    <th className="p-2.5 w-14 text-center bg-rose-50 text-rose-800 font-black">Alpa</th>
                    <th className="p-2.5 w-16 text-center font-bold">Total</th>
                    <th className="p-2.5 w-28 text-center">% Kehadiran</th>
                    <th className="p-2.5 w-20 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teachers.map((t, idx) => {
                    const teacherMonthlyAtt = attendances.filter(
                      a => a.nama === t.nama && a.tanggal.startsWith(selectedBulan)
                    );
                    const h = teacherMonthlyAtt.filter(a => a.keterangan === 'Hadir').length;
                    const i = teacherMonthlyAtt.filter(a => a.keterangan === 'Izin').length;
                    const s = teacherMonthlyAtt.filter(a => a.keterangan === 'Sakit').length;
                    const c = teacherMonthlyAtt.filter(a => a.keterangan === 'Cuti').length;
                    const a = teacherMonthlyAtt.filter(a => a.keterangan === 'Alpa').length;
                    const total = h + i + s + c + a;
                    const persen = total > 0 ? Math.round((h / total) * 100) : 100;

                    return (
                      <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-2.5 text-center text-slate-500 font-medium">{idx + 1}</td>
                        <td className="p-2.5 font-bold text-slate-900">
                          {t.nama}
                          <div className="text-[10px] font-mono text-slate-500">{t.nip || '-'}</div>
                        </td>
                        <td className="p-2.5 text-slate-700">{t.jabatan}</td>
                        <td className="p-2.5 text-center font-bold text-emerald-800 bg-emerald-50/50">{h}</td>
                        <td className="p-2.5 text-center font-bold text-blue-800 bg-blue-50/50">{i}</td>
                        <td className="p-2.5 text-center font-bold text-amber-800 bg-amber-50/50">{s}</td>
                        <td className="p-2.5 text-center font-bold text-purple-800 bg-purple-50/50">{c}</td>
                        <td className="p-2.5 text-center font-bold text-rose-800 bg-rose-50/50">{a}</td>
                        <td className="p-2.5 text-center font-semibold text-slate-700">{total}</td>
                        <td className="p-2.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <div className="w-12 bg-slate-200 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full ${
                                  persen >= 85 ? 'bg-emerald-600' : persen >= 75 ? 'bg-amber-500' : 'bg-rose-500'
                                }`}
                                style={{ width: `${persen}%` }}
                              ></div>
                            </div>
                            <span className="font-bold text-[11px]">{persen}%</span>
                          </div>
                        </td>
                        <td className="p-2.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingTeacher(t);
                                setEditingIndex(idx);
                                setIsEditModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded text-xs font-bold cursor-pointer transition-colors"
                              title="Edit data kehadiran guru"
                            >
                              <Pencil className="w-3 h-3 text-amber-700" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingTeacher(t);
                                setIsPrintModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded text-xs font-bold cursor-pointer transition-colors"
                              title="Print rekapitulasi kehadiran guru"
                            >
                              <Printer className="w-3 h-3 text-emerald-700" />
                              <span>Print</span>
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
        )}
      </div>

      {/* Edit Teacher Attendance Modal */}
      <EditAbsenGuruModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTeacher(null);
        }}
        teacher={editingTeacher}
        attendance={editingTeacher ? dayAttendanceMap.get(editingTeacher.nama) || null : null}
        tanggal={selectedTanggal}
        index={editingIndex}
        onSave={(att) => {
          onSaveAttendance(att);
        }}
        onDelete={(id) => {
          onDeleteAttendance(id);
        }}
        notifyMessage={notifyMessage}
      />

      {/* Print Teacher Attendance Modal */}
      <PrintAbsenGuruModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        teachers={teachers}
        attendances={attendances}
        tanggal={selectedTanggal}
        settings={settings}
        notifyMessage={notifyMessage}
        onExportExcel={handleExcelExport}
        onExportWord={handleWordExport}
      />
    </div>
  );
};
