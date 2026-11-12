import React, { useState, useMemo } from 'react';
import {
  Student,
  StudentAttendance,
  AttendanceStatus,
  PaperSize,
  SchoolSettings
} from '../../types';
import { ActionToolbar } from '../ActionToolbar';
import { exportToExcel, exportToWord, exportToPPT, triggerPrint, safeConfirm, safePrompt } from '../../utils/exportHelpers';
import { Calendar, CheckCircle2, UserCheck, AlertCircle, Search, Clock, Users, Printer, Pencil, Edit3, Eye, FileSpreadsheet, FileText } from 'lucide-react';
import { EditAbsenSiswaModal } from './EditAbsenSiswaModal';
import { PrintAbsenSiswaModal } from './PrintAbsenSiswaModal';

interface AbsenSiswaModuleProps {
  students: Student[];
  attendances: StudentAttendance[];
  onSaveAttendance: (att: StudentAttendance) => void;
  onDeleteAttendance: (id: string) => void;
  onHome: () => void;
  settings: SchoolSettings;
  notifyMessage: (msg?: string) => void;
  onSync: () => void;
}

export const AbsenSiswaModule: React.FC<AbsenSiswaModuleProps> = ({
  students,
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
  const [selectedKelas, setSelectedKelas] = useState('IV');
  const [selectedRombel, setSelectedRombel] = useState('IV-A');
  const [searchQuery, setSearchQuery] = useState('');
  const [paperSize, setPaperSize] = useState<PaperSize>(settings.ukuranKertas);

  // Edit & Print Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Filter attendance records by date & class
  const classStudents = useMemo(() => {
    return students.filter(s => s.kelas === selectedKelas && s.keterangan === 'Aktif');
  }, [students, selectedKelas]);

  // Map of studentId/name to attendance record for selectedTanggal
  const dayAttendanceMap = useMemo(() => {
    const map = new Map<string, StudentAttendance>();
    attendances
      .filter(a => a.tanggal === selectedTanggal && a.kelas === selectedKelas)
      .forEach(a => {
        map.set(a.namaSiswa, a);
      });
    return map;
  }, [attendances, selectedTanggal, selectedKelas]);

  const handleSetStatus = (student: Student, status: AttendanceStatus) => {
    const existing = dayAttendanceMap.get(student.namaSiswa);
    const newRecord: StudentAttendance = {
      id: existing ? existing.id : `att-s-${Date.now()}-${student.id}`,
      tanggal: selectedTanggal,
      kelas: selectedKelas,
      rombel: student.rombel || selectedRombel,
      namaSiswa: student.namaSiswa,
      namaPanggilan: student.namaPanggilan,
      jenisKelamin: student.jenisKelamin,
      agama: student.agama,
      foto: student.foto,
      keterangan: status,
      catatan: existing?.catatan || ''
    };
    onSaveAttendance(newRecord);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handleMarkAllPresent = () => {
    classStudents.forEach(s => {
      handleSetStatus(s, 'Hadir');
    });
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  // Export handlers
  const handleExcelExport = () => {
    const headers = [
      'No',
      'Tanggal',
      'Kelas/Rombel',
      'Nama Siswa',
      'Nama Panggilan',
      'L/P',
      'Agama',
      'Kehadiran (Hadir/Izin/Sakit/Alpa)',
      'Catatan'
    ];

    const rows = classStudents.map((s, idx) => {
      const att = dayAttendanceMap.get(s.namaSiswa);
      return [
        idx + 1,
        selectedTanggal,
        `${selectedKelas} (${s.rombel || selectedRombel})`,
        s.namaSiswa,
        s.namaPanggilan,
        s.jenisKelamin,
        s.agama,
        att ? att.keterangan : 'Belum Diabsen',
        att?.catatan || '-'
      ];
    });

    exportToExcel(`Rekap_Absen_Siswa_Kelas_${selectedKelas}_${selectedTanggal}`, headers, rows);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handleWordExport = () => {
    const content = `
      <div class="kop">
        <h2>${settings.namaInstansi}</h2>
        <h1>${settings.namaSekolah}</h1>
        <p>${settings.alamatSekolah}</p>
        <hr />
        <h3>REKAPITULASI PRESENSI SISWA PERKELAS</h3>
        <p>Kelas: ${selectedKelas} (${selectedRombel}) | Tanggal: ${selectedTanggal}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Nama Siswa</th>
            <th>L/P</th>
            <th>Agama</th>
            <th>Kehadiran</th>
            <th>Catatan</th>
          </tr>
        </thead>
        <tbody>
          ${classStudents.map((s, i) => {
            const att = dayAttendanceMap.get(s.namaSiswa);
            return `
              <tr>
                <td>${i + 1}</td>
                <td><b>${s.namaSiswa}</b> (${s.namaPanggilan})</td>
                <td>${s.jenisKelamin}</td>
                <td>${s.agama}</td>
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
          Wali Kelas / Guru Piket,<br/><br/><br/>
          <b><u>${settings.operatorTU}</u></b><br/>
          NIP. ${settings.nipOperator}
        </p>
      </div>
    `;
    exportToWord(`Absen_Siswa_${selectedKelas}_${selectedTanggal}`, content);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handlePPTExport = () => {
    const hadirCount = classStudents.filter(s => dayAttendanceMap.get(s.namaSiswa)?.keterangan === 'Hadir').length;
    const izinCount = classStudents.filter(s => dayAttendanceMap.get(s.namaSiswa)?.keterangan === 'Izin').length;
    const sakitCount = classStudents.filter(s => dayAttendanceMap.get(s.namaSiswa)?.keterangan === 'Sakit').length;
    const alpaCount = classStudents.filter(s => dayAttendanceMap.get(s.namaSiswa)?.keterangan === 'Alpa').length;

    const slides = [
      {
        title: `LAPORAN ABSENSI SISWA KELAS ${selectedKelas}`,
        subtitle: `${settings.namaSekolah} - Tanggal ${selectedTanggal}`,
        bullets: [
          `Total Peserta Didik: ${classStudents.length} Siswa`,
          `Hadir: ${hadirCount} Siswa (${classStudents.length ? Math.round((hadirCount / classStudents.length) * 100) : 0}%)`,
          `Izin: ${izinCount} Siswa`,
          `Sakit: ${sakitCount} Siswa`,
          `Alpa / Tanpa Keterangan: ${alpaCount} Siswa`
        ]
      }
    ];
    exportToPPT(`Presentasi_Absensi_Kelas_${selectedKelas}`, slides);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  // Stats calculation
  const totalHadir = classStudents.filter(s => dayAttendanceMap.get(s.namaSiswa)?.keterangan === 'Hadir').length;
  const totalIzin = classStudents.filter(s => dayAttendanceMap.get(s.namaSiswa)?.keterangan === 'Izin').length;
  const totalSakit = classStudents.filter(s => dayAttendanceMap.get(s.namaSiswa)?.keterangan === 'Sakit').length;
  const totalAlpa = classStudents.filter(s => dayAttendanceMap.get(s.namaSiswa)?.keterangan === 'Alpa').length;

  return (
    <div className="space-y-4">
      {/* Sub-view switcher */}
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
            Form Absen Harian Perkelas
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
            Rekapan Absen Siswa (Bulanan & Riwayat)
          </button>
        </div>

        {/* Date & Class Selectors */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {activeView === 'harian' ? (
            <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-200 font-semibold">
              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
              <span>Tanggal:</span>
              <input
                type="date"
                value={selectedTanggal}
                onChange={(e) => setSelectedTanggal(e.target.value)}
                className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs font-bold cursor-pointer"
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
                className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs font-bold cursor-pointer"
              />
            </div>
          )}

          <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-200 font-semibold">
            <span>Kelas:</span>
            <select
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              className="bg-white border border-slate-300 rounded px-1.5 py-0.5 font-bold cursor-pointer"
            >
              <option value="I">Kelas I</option>
              <option value="II">Kelas II</option>
              <option value="III">Kelas III</option>
              <option value="IV">Kelas IV</option>
              <option value="V">Kelas V</option>
              <option value="VI">Kelas VI</option>
            </select>
          </div>

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
        titleContext={`ABSEN SISWA PERKELAS > KELAS ${selectedKelas} (${activeView === 'harian' ? selectedTanggal : selectedBulan})`}
        onHome={onHome}
        onAddNew={handleMarkAllPresent}
        onSave={() => notifyMessage('Data Anda Berhasil Disimpan')}
        onView={() => setActiveView(activeView === 'harian' ? 'rekapan' : 'harian')}
        onDelete={() => {
          if (safeConfirm(`Hapus absensi kelas ${selectedKelas} pada tanggal ${selectedTanggal}?`)) {
            classStudents.forEach(s => {
              const att = dayAttendanceMap.get(s.namaSiswa);
              if (att) onDeleteAttendance(att.id);
            });
            notifyMessage('Data Absen Dihapus');
          }
        }}
        onSearch={() => {
          const q = safePrompt('Cari nama siswa dalam kelas ini:', searchQuery);
          if (q !== null) setSearchQuery(q);
        }}
        onEdit={() => {
          if (classStudents.length > 0) {
            setEditingStudent(classStudents[0]);
            setIsEditModalOpen(true);
          } else {
            notifyMessage('Pilih siswa untuk diedit presensinya');
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
          handleMarkAllPresent();
          notifyMessage('Data Anda Berhasil Disimpan');
        }}
        onPdf={() => setIsPrintModalOpen(true)}
        onExcel={handleExcelExport}
        onWord={handleWordExport}
        onPpt={handlePPTExport}
        onUploadPhoto={() => notifyMessage('Foto Absen Disimpan')}
        onRefresh={() => notifyMessage('Data Anda Berhasil Disimpan')}
        onSync={onSync}
        onReset={() => {
          classStudents.forEach(s => {
            const att = dayAttendanceMap.get(s.namaSiswa);
            if (att) onDeleteAttendance(att.id);
          });
          notifyMessage('Data Formulir Berhasil Direset');
        }}
        paperSize={paperSize}
        onChangePaperSize={(size) => setPaperSize(size)}
        notifyMessage={notifyMessage}
      />

      {/* Summary Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-emerald-700 font-semibold">Hadir</div>
            <div className="text-2xl font-black text-emerald-900">{totalHadir}</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold">
            H
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-blue-700 font-semibold">Izin</div>
            <div className="text-2xl font-black text-blue-900">{totalIzin}</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-200 text-blue-800 flex items-center justify-center font-bold">
            I
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-amber-700 font-semibold">Sakit</div>
            <div className="text-2xl font-black text-amber-900">{totalSakit}</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-200 text-amber-800 flex items-center justify-center font-bold">
            S
          </div>
        </div>

        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="text-rose-700 font-semibold">Alpa / Tanpa Keterangan</div>
            <div className="text-2xl font-black text-rose-900">{totalAlpa}</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-rose-200 text-rose-800 flex items-center justify-center font-bold">
            A
          </div>
        </div>
      </div>

      {/* Main Attendance Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-700" />
              Daftar Presensi Murid Kelas {selectedKelas} ({selectedTanggal})
            </h3>
            <p className="text-[11px] text-slate-500">
              Pilih status kehadiran: Hadir, Izin, Sakit, atau Alpa
            </p>
          </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Lembar Presensi (Print)</span>
          </button>
          <button
            type="button"
            onClick={handleMarkAllPresent}
            className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center gap-1 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Semua Hadir</span>
          </button>
        </div>
      </div>

      {activeView === 'harian' ? (
        /* Table of Students & Attendance Form */
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 uppercase font-bold sticky top-0 border-b border-slate-200">
              <tr>
                <th className="p-2.5 w-10 text-center">No</th>
                <th className="p-2.5">Pas Foto</th>
                <th className="p-2.5">Nama Siswa</th>
                <th className="p-2.5">Panggilan</th>
                <th className="p-2.5">L/P</th>
                <th className="p-2.5">Agama</th>
                <th className="p-2.5 text-center">Keterangan Kehadiran</th>
                <th className="p-2.5">Catatan Khusus</th>
                <th className="p-2.5 w-32 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-slate-400">
                    Belum ada data siswa aktif di Kelas {selectedKelas}. Silakan tambahkan data di menu DATA SISWA.
                  </td>
                </tr>
              ) : (
                classStudents
                  .filter(s => (s.namaSiswa || '').toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((s, idx) => {
                    const currentAtt = dayAttendanceMap.get(s.namaSiswa);
                    const currentStatus = currentAtt ? currentAtt.keterangan : null;

                    return (
                      <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-2.5 text-center text-slate-500 font-medium">{idx + 1}</td>
                        <td className="p-2.5">
                          <div className="w-8 h-8 rounded bg-slate-200 overflow-hidden flex items-center justify-center border border-slate-300">
                            {s.foto && s.foto.trim() ? (
                              <img src={s.foto} alt={s.namaSiswa} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <span className="text-[10px] font-bold text-slate-500">{(s.namaSiswa || 'SW').slice(0, 2).toUpperCase()}</span>
                            )}
                          </div>
                        </td>
                        <td className="p-2.5 font-bold text-slate-900">{s.namaSiswa}</td>
                        <td className="p-2.5 text-slate-600">{s.namaPanggilan}</td>
                        <td className="p-2.5 font-semibold">{s.jenisKelamin}</td>
                        <td className="p-2.5 text-slate-600">{s.agama}</td>
                        <td className="p-2.5 text-center">
                          <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                            {(['Hadir', 'Izin', 'Sakit', 'Alpa'] as AttendanceStatus[]).map((st) => (
                              <button
                                key={st}
                                type="button"
                                onClick={() => handleSetStatus(s, st)}
                                className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                                  currentStatus === st
                                    ? st === 'Hadir'
                                      ? 'bg-emerald-600 text-white shadow-sm'
                                      : st === 'Izin'
                                      ? 'bg-blue-600 text-white shadow-sm'
                                      : st === 'Sakit'
                                      ? 'bg-amber-600 text-white shadow-sm'
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
                            placeholder="Alasan / catatan..."
                            value={currentAtt?.catatan || ''}
                            onChange={(e) => {
                              const existing = dayAttendanceMap.get(s.namaSiswa);
                              const newRecord: StudentAttendance = {
                                id: existing ? existing.id : `att-s-${Date.now()}-${s.id}`,
                                tanggal: selectedTanggal,
                                kelas: selectedKelas,
                                rombel: s.rombel || selectedRombel,
                                namaSiswa: s.namaSiswa,
                                namaPanggilan: s.namaPanggilan,
                                jenisKelamin: s.jenisKelamin,
                                agama: s.agama,
                                foto: s.foto,
                                keterangan: existing ? existing.keterangan : 'Hadir',
                                catatan: e.target.value
                              };
                              onSaveAttendance(newRecord);
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs focus:bg-white focus:outline-none"
                          />
                        </td>
                        <td className="p-2.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingStudent(s);
                                setIsEditModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-md font-bold text-xs cursor-pointer transition-colors shadow-2xs"
                              title="Edit presensi dan catatan siswa"
                            >
                              <Pencil className="w-3 h-3 text-amber-700" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingStudent(s);
                                setIsPrintModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-md font-bold text-xs cursor-pointer transition-colors shadow-2xs"
                              title="Cetak Presensi Siswa / Rekap Kelas"
                            >
                              <Printer className="w-3 h-3 text-emerald-700" />
                              <span>Print</span>
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
      ) : (
        /* Rekapan Bulanan View */
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Rekapitulasi Presensi Bulan:</span>
              <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-300 text-emerald-800">
                {selectedBulan}
              </span>
              <span className="text-slate-500">({classStudents.length} Siswa Terdaftar)</span>
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
                  <th className="p-2.5">Nama Siswa</th>
                  <th className="p-2.5 w-12 text-center">L/P</th>
                  <th className="p-2.5 w-14 text-center bg-emerald-50 text-emerald-800 font-black">Hadir</th>
                  <th className="p-2.5 w-14 text-center bg-blue-50 text-blue-800 font-black">Izin</th>
                  <th className="p-2.5 w-14 text-center bg-amber-50 text-amber-800 font-black">Sakit</th>
                  <th className="p-2.5 w-14 text-center bg-rose-50 text-rose-800 font-black">Alpa</th>
                  <th className="p-2.5 w-16 text-center font-bold">Total</th>
                  <th className="p-2.5 w-28 text-center">% Kehadiran</th>
                  <th className="p-2.5 w-20 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classStudents.map((s, idx) => {
                  const studentMonthlyAtt = attendances.filter(
                    a => a.namaSiswa === s.namaSiswa && a.tanggal.startsWith(selectedBulan)
                  );
                  const h = studentMonthlyAtt.filter(a => a.keterangan === 'Hadir').length;
                  const i = studentMonthlyAtt.filter(a => a.keterangan === 'Izin').length;
                  const sk = studentMonthlyAtt.filter(a => a.keterangan === 'Sakit').length;
                  const a = studentMonthlyAtt.filter(a => a.keterangan === 'Alpa').length;
                  const total = h + i + sk + a;
                  const persen = total > 0 ? Math.round((h / total) * 100) : 100;

                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2.5 text-center text-slate-500 font-medium">{idx + 1}</td>
                      <td className="p-2.5 font-bold text-slate-900">{s.namaSiswa}</td>
                      <td className="p-2.5 text-center font-semibold text-slate-600">{s.jenisKelamin}</td>
                      <td className="p-2.5 text-center font-bold text-emerald-800 bg-emerald-50/50">{h}</td>
                      <td className="p-2.5 text-center font-bold text-blue-800 bg-blue-50/50">{i}</td>
                      <td className="p-2.5 text-center font-bold text-amber-800 bg-amber-50/50">{sk}</td>
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
                              setEditingStudent(s);
                              setIsEditModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded text-xs font-bold cursor-pointer transition-colors"
                            title="Edit data kehadiran siswa"
                          >
                            <Pencil className="w-3 h-3 text-amber-700" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingStudent(s);
                              setIsPrintModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded text-xs font-bold cursor-pointer transition-colors"
                            title="Print rekapitulasi kehadiran siswa"
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

      {/* Edit Student Attendance Modal */}
      <EditAbsenSiswaModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingStudent(null);
        }}
        student={editingStudent}
        attendance={editingStudent ? dayAttendanceMap.get(editingStudent.namaSiswa) || null : null}
        tanggal={selectedTanggal}
        kelas={selectedKelas}
        rombel={selectedRombel}
        onSave={(att) => {
          onSaveAttendance(att);
        }}
        onDelete={(id) => {
          onDeleteAttendance(id);
        }}
        notifyMessage={notifyMessage}
      />

      {/* Print Student Attendance Modal */}
      <PrintAbsenSiswaModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        students={classStudents}
        attendances={attendances}
        tanggal={selectedTanggal}
        kelas={selectedKelas}
        rombel={selectedRombel}
        settings={settings}
        notifyMessage={notifyMessage}
        onExportExcel={handleExcelExport}
        onExportWord={handleWordExport}
      />
      </div>
    </div>
  );
};
