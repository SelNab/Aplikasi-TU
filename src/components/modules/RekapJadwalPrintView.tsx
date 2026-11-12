import React, { useState, useMemo } from 'react';
import {
  JadwalPelajaranItem,
  HariSekolah,
  Teacher,
  PaperSize,
  SchoolSettings
} from '../../types';
import { exportToExcel, exportToWord, triggerPrint } from '../../utils/exportHelpers';
import {
  Printer,
  FileSpreadsheet,
  FileText,
  LayoutGrid,
  Calendar,
  Users,
  Clock,
  Layers,
  Sparkles,
  School,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  BookOpenCheck,
  ChevronDown,
  Info
} from 'lucide-react';

export type RekapType = 'matriks_kelas' | 'master_sekolah' | 'beban_guru' | 'agenda_rinci';

interface RekapJadwalPrintViewProps {
  jadwalList: JadwalPelajaranItem[];
  teachers: Teacher[];
  settings: SchoolSettings;
  initialKelas?: string;
  onClose?: () => void;
  notifyMessage: (msg?: string) => void;
  isEmbedded?: boolean;
}

const HARI_LIST: HariSekolah[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const KELAS_LIST = ['I', 'II', 'III', 'IV', 'V', 'VI'];

export const RekapJadwalPrintView: React.FC<RekapJadwalPrintViewProps> = ({
  jadwalList,
  teachers,
  settings,
  initialKelas = 'IV',
  onClose,
  notifyMessage,
  isEmbedded = false
}) => {
  const [rekapType, setRekapType] = useState<RekapType>('matriks_kelas');
  const [selectedKelas, setSelectedKelas] = useState<string>(initialKelas || 'IV');
  const [paperSize, setPaperSize] = useState<PaperSize>(settings.ukuranKertas || 'F4');
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [semester, setSemester] = useState<string>('Semester 1 (Ganjil)');
  const [tahunAjaran, setTahunAjaran] = useState<string>('2024/2025');
  const [showSignatures, setShowSignatures] = useState<boolean>(true);

  // Time slot standard
  const standardTimeSlots = [
    { jamKe: 1, waktu: '07.30 - 08.15' },
    { jamKe: 2, waktu: '08.15 - 09.00' },
    { jamKe: 3, waktu: '09.30 - 10.15' },
    { jamKe: 4, waktu: '10.15 - 11.00' },
    { jamKe: 5, waktu: '11.15 - 12.00' },
    { jamKe: 6, waktu: '12.00 - 12.45' }
  ];

  // Helper to find schedule item for class, day, jam
  const getScheduleItem = (kelas: string, hari: HariSekolah, jamKe: number) => {
    return jadwalList.find(
      (j) => j.kelas === kelas && j.hari === hari && Number(j.jamKe) === Number(jamKe)
    );
  };

  // Aggregated data: Teacher Workload (Distribusi Jam Guru)
  const teacherWorkload = useMemo(() => {
    // Map by teacher name
    const map = new Map<
      string,
      {
        nama: string;
        nip: string;
        status: string;
        mapelSet: Set<string>;
        kelasSet: Set<string>;
        hariCount: Record<HariSekolah, number>;
        totalJP: number;
        catatan: string;
      }
    >();

    // Seed with official teachers
    teachers.forEach((t) => {
      map.set(t.nama, {
        nama: t.nama,
        nip: t.nip || '-',
        status: t.statusKepegawaian || 'PNS',
        mapelSet: new Set<string>(),
        kelasSet: new Set<string>(),
        hariCount: {
          Senin: 0,
          Selasa: 0,
          Rabu: 0,
          Kamis: 0,
          Jumat: 0,
          Sabtu: 0
        },
        totalJP: 0,
        catatan: t.jabatan || 'Guru Kelas'
      });
    });

    // Populate from schedule items
    jadwalList.forEach((j) => {
      const guruName = j.guruPengampu?.trim() || 'Guru Belum Ditentukan';
      if (!map.has(guruName)) {
        map.set(guruName, {
          nama: guruName,
          nip: '-',
          status: 'Guru Mapel / Honor',
          mapelSet: new Set<string>(),
          kelasSet: new Set<string>(),
          hariCount: {
            Senin: 0,
            Selasa: 0,
            Rabu: 0,
            Kamis: 0,
            Jumat: 0,
            Sabtu: 0
          },
          totalJP: 0,
          catatan: 'Pengampu Mata Pelajaran'
        });
      }

      const rec = map.get(guruName)!;
      if (j.mataPelajaran) rec.mapelSet.add(j.mataPelajaran);
      if (j.kelas) rec.kelasSet.add(`Kls ${j.kelas}`);
      if (j.hari && rec.hariCount[j.hari] !== undefined) {
        rec.hariCount[j.hari] += 1;
      }
      rec.totalJP += 1;
    });

    return Array.from(map.values()).sort((a, b) => b.totalJP - a.totalJP);
  }, [jadwalList, teachers]);

  // Total school JP
  const totalSchoolJP = useMemo(() => {
    return jadwalList.length;
  }, [jadwalList]);

  // Filtered classes to print for 'matriks_kelas'
  const classesToPrint = useMemo(() => {
    if (selectedKelas === 'Semua') {
      return KELAS_LIST;
    }
    return [selectedKelas];
  }, [selectedKelas]);

  // Export to Excel
  const handleExportExcel = () => {
    if (rekapType === 'matriks_kelas') {
      const targetClass = selectedKelas === 'Semua' ? 'SELURUH_KELAS' : `KELAS_${selectedKelas}`;
      const headers = ['Jam Ke', 'Waktu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const rows: (string | number)[][] = [];

      classesToPrint.forEach((kls) => {
        rows.push([`=== JADWAL PELAJARAN KELAS ${kls} ===`, '', '', '', '', '', '', '']);
        standardTimeSlots.forEach((slot) => {
          const rowData: (string | number)[] = [slot.jamKe, slot.waktu];
          HARI_LIST.forEach((hari) => {
            const it = getScheduleItem(kls, hari, slot.jamKe);
            if (it) {
              rowData.push(`${it.mataPelajaran} (${it.guruPengampu})`);
            } else {
              rowData.push('-');
            }
          });
          rows.push(rowData);
        });
        rows.push(['', '', '', '', '', '', '', '']);
      });

      exportToExcel(`REKAP_JADWAL_${targetClass}_${settings.namaSekolah}`, headers, rows);
    } else if (rekapType === 'master_sekolah') {
      const headers = ['Hari', 'Jam Ke', 'Waktu', 'Kelas I', 'Kelas II', 'Kelas III', 'Kelas IV', 'Kelas V', 'Kelas VI'];
      const rows: (string | number)[][] = [];

      HARI_LIST.forEach((hari) => {
        standardTimeSlots.forEach((slot) => {
          const rowData: (string | number)[] = [hari, slot.jamKe, slot.waktu];
          KELAS_LIST.forEach((kls) => {
            const it = getScheduleItem(kls, hari, slot.jamKe);
            if (it) {
              rowData.push(`${it.mataPelajaran} [${it.guruPengampu}]`);
            } else {
              rowData.push('-');
            }
          });
          rows.push(rowData);
        });
      });

      exportToExcel(`MASTER_JADWAL_PELAJARAN_${settings.namaSekolah}`, headers, rows);
    } else if (rekapType === 'beban_guru') {
      const headers = [
        'No',
        'Nama Guru & Gelar',
        'NIP',
        'Status Kepegawaian',
        'Mata Pelajaran',
        'Kelas Diampu',
        'Senin',
        'Selasa',
        'Rabu',
        'Kamis',
        'Jumat',
        'Sabtu',
        'Total JP / Minggu',
        'Beban Kerja'
      ];
      const rows = teacherWorkload.map((t, idx) => [
        idx + 1,
        t.nama,
        t.nip,
        t.status,
        Array.from(t.mapelSet).join(', ') || '-',
        Array.from(t.kelasSet).join(', ') || '-',
        t.hariCount.Senin,
        t.hariCount.Selasa,
        t.hariCount.Rabu,
        t.hariCount.Kamis,
        t.hariCount.Jumat,
        t.hariCount.Sabtu,
        t.totalJP,
        t.totalJP >= 24 ? 'Memenuhi Beban Sertifikasi (>=24 JP)' : `${t.totalJP} JP`
      ]);

      exportToExcel(`REKAP_BEBAN_MENGAJAR_GURU_${settings.namaSekolah}`, headers, rows);
    } else {
      const headers = ['No', 'Kelas', 'Hari', 'Jam Ke', 'Waktu', 'Mata Pelajaran', 'Guru Pengampu', 'Ruangan', 'Catatan'];
      const rows = jadwalList
        .slice()
        .sort((a, b) => a.kelas.localeCompare(b.kelas) || a.jamKe - b.jamKe)
        .map((j, idx) => [
          idx + 1,
          j.kelas,
          j.hari,
          j.jamKe,
          `${j.waktuMulai} - ${j.waktuSelesai}`,
          j.mataPelajaran,
          j.guruPengampu,
          j.ruangan || '-',
          j.keterangan || '-'
        ]);
      exportToExcel(`AGENDA_RINCI_JADWAL_${settings.namaSekolah}`, headers, rows);
    }

    notifyMessage('Data Rekapan Jadwal Berhasil Diekspor ke Excel');
  };

  // Export to Word
  const handleExportWord = () => {
    let htmlTable = '';

    if (rekapType === 'matriks_kelas') {
      classesToPrint.forEach((kls) => {
        htmlTable += `
          <h3 style="text-align:center; margin-top:20px;">JADWAL PELAJARAN KELAS ${kls}</h3>
          <p style="text-align:center; font-size:10pt;">${semester} • Tahun Pelajaran ${tahunAjaran} • Kurikulum Merdeka</p>
          <table border="1" cellpadding="6" cellspacing="0" style="width:100%; border-collapse:collapse; text-align:center; font-size:10pt;">
            <tr style="background-color:#e2e8f0; font-weight:bold;">
              <th width="8%">Jam</th>
              <th width="14%">Waktu</th>
              <th>Senin</th>
              <th>Selasa</th>
              <th>Rabu</th>
              <th>Kamis</th>
              <th>Jumat</th>
              <th>Sabtu</th>
            </tr>
            ${standardTimeSlots
              .map((slot) => {
                const cells = HARI_LIST.map((h) => {
                  const it = getScheduleItem(kls, h, slot.jamKe);
                  if (it) {
                    return `<td><b>${it.mataPelajaran}</b><br/><small style="color:#333;">${it.guruPengampu}</small></td>`;
                  }
                  return `<td>-</td>`;
                }).join('');
                return `<tr><td>${slot.jamKe}</td><td>${slot.waktu}</td>${cells}</tr>`;
              })
              .join('')}
          </table>
          <br/>
        `;
      });
    } else if (rekapType === 'master_sekolah') {
      htmlTable += `
        <h3 style="text-align:center;">MASTER JADWAL PELAJARAN SELURUH KELAS (I - VI)</h3>
        <p style="text-align:center; font-size:10pt;">${semester} • Tahun Pelajaran ${tahunAjaran}</p>
        <table border="1" cellpadding="5" cellspacing="0" style="width:100%; border-collapse:collapse; font-size:9pt;">
          <tr style="background-color:#0f766e; color:#fff;">
            <th>Hari</th>
            <th>Jam</th>
            <th>Waktu</th>
            <th>Kelas I</th>
            <th>Kelas II</th>
            <th>Kelas III</th>
            <th>Kelas IV</th>
            <th>Kelas V</th>
            <th>Kelas VI</th>
          </tr>
          ${HARI_LIST.map((hari) =>
            standardTimeSlots
              .map((slot, sIdx) => {
                const kelasCells = KELAS_LIST.map((kls) => {
                  const it = getScheduleItem(kls, hari, slot.jamKe);
                  if (it) {
                    return `<td><b>${it.mataPelajaran}</b><br/><span style="font-size:8pt; color:#444;">${it.guruPengampu}</span></td>`;
                  }
                  return `<td align="center">-</td>`;
                }).join('');

                const hariCell =
                  sIdx === 0
                    ? `<td rowspan="${standardTimeSlots.length}" align="center" style="font-weight:bold; background:#f8fafc;">${hari}</td>`
                    : '';

                return `<tr>${hariCell}<td align="center">${slot.jamKe}</td><td align="center">${slot.waktu}</td>${kelasCells}</tr>`;
              })
              .join('')
          ).join('')}
        </table>
      `;
    } else if (rekapType === 'beban_guru') {
      htmlTable += `
        <h3 style="text-align:center;">REKAPITULASI DISTRIBUSI BEBAN MENGAJAR GURU (JTM)</h3>
        <p style="text-align:center; font-size:10pt;">${semester} • Tahun Pelajaran ${tahunAjaran}</p>
        <table border="1" cellpadding="5" cellspacing="0" style="width:100%; border-collapse:collapse; font-size:10pt;">
          <tr style="background-color:#0f766e; color:#fff;">
            <th>No</th>
            <th>Nama Guru & Gelar</th>
            <th>NIP</th>
            <th>Mata Pelajaran yang Diampu</th>
            <th>Kelas</th>
            <th>Total JP/Mgg</th>
            <th>Status Beban</th>
          </tr>
          ${teacherWorkload
            .map(
              (t, i) => `
            <tr>
              <td align="center">${i + 1}</td>
              <td><b>${t.nama}</b></td>
              <td>${t.nip}</td>
              <td>${Array.from(t.mapelSet).join(', ') || '-'}</td>
              <td>${Array.from(t.kelasSet).join(', ') || '-'}</td>
              <td align="center"><b>${t.totalJP} JP</b></td>
              <td>${t.totalJP >= 24 ? 'Memenuhi Standar Sertifikasi (>=24 JP)' : 'Sesuai Penugasan'}</td>
            </tr>
          `
            )
            .join('')}
        </table>
      `;
    }

    const fullDoc = `
      <div class="kop" style="text-align:center; border-bottom:3px double #000; padding-bottom:8px; margin-bottom:15px;">
        <h3 style="margin:0; font-size:11pt; text-transform:uppercase;">${settings.namaInstansi}</h3>
        <h1 style="margin:2px 0; font-size:16pt; text-transform:uppercase;">${settings.namaSekolah}</h1>
        <p style="margin:0; font-size:9.5pt;">${settings.alamatSekolah} • NPSN: ${settings.npsn}</p>
        <p style="margin:0; font-size:8.5pt; font-style:italic;">${settings.alamatSekolah}, Kabupaten Pegunungan Bintang, Provinsi Papua Pegunungan</p>
      </div>
      ${htmlTable}
      <div style="margin-top:35px; width:100%;">
        <table style="width:100%; border:none;">
          <tr style="border:none;">
            <td style="border:none; text-align:center; width:45%;">
              Mengetahui,<br/>
              <b>Kepala Sekolah</b><br/><br/><br/><br/>
              <b><u>${settings.namaKepsek}</u></b><br/>
              NIP. ${settings.nipKepsek || '-'}
            </td>
            <td style="border:none; width:10%;"></td>
            <td style="border:none; text-align:center; width:45%;">
              Dekai, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br/>
              <b>Guru Pengembang Kurikulum & TU</b><br/><br/><br/><br/>
              <b><u>${settings.operatorTU}</u></b><br/>
              NIP. ${settings.nipOperator || '-'}
            </td>
          </tr>
        </table>
      </div>
    `;

    exportToWord(`Rekap_Jadwal_Pelajaran_${settings.namaSekolah.replace(/\s+/g, '_')}`, fullDoc);
    notifyMessage('Dokumen Rekap Jadwal Berhasil Diekspor ke Word');
  };

  const handlePrint = () => {
    triggerPrint();
    notifyMessage('Perintah Cetak Rekapan Dikirim ke Printer');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col max-w-full">
      {/* Top Header & Control Toolbar (no-print) */}
      <div className="bg-slate-900 text-white p-4 no-print border-b border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 flex-shrink-0">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-wide text-white">
                  Rekapitulasi Jadwal Pelajaran (Siap Cetak)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Resmi Kurikulum Merdeka
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Pilih format rekapan, sesuaikan kelas/ukuran kertas, lalu cetak langsung atau simpan ke PDF/Excel/Word
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              id="btn-print-rekap-jadwal"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-slate-950 rounded-xl text-xs font-black shadow-lg shadow-teal-500/20 transition-all cursor-pointer transform active:scale-95"
              title="Cetak Langsung ke Printer Fisik atau Simpan PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Rekapan (Print / PDF)</span>
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              title="Ekspor Format Spreadsheet Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>

            <button
              type="button"
              onClick={handleExportWord}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              title="Ekspor Dokumen Microsoft Word"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Word</span>
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer ml-1"
                title="Tutup Pratinjau Cetak"
              >
                Tutup
              </button>
            )}
          </div>
        </div>

        {/* Filter & Options Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Format Rekapan Tabs */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => {
                setRekapType('matriks_kelas');
                setOrientation('landscape');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                rekapType === 'matriks_kelas'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Jadwal Mingguan Per Kelas</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRekapType('master_sekolah');
                setOrientation('landscape');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                rekapType === 'master_sekolah'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Master Semua Kelas (I - VI)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRekapType('beban_guru');
                setOrientation('portrait');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                rekapType === 'beban_guru'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Beban Mengajar Guru (JTM)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRekapType('agenda_rinci');
                setOrientation('portrait');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                rekapType === 'agenda_rinci'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Agenda Rinci</span>
            </button>
          </div>

          {/* Sub-Filters: Kelas, Kertas, Orientasi */}
          <div className="flex flex-wrap items-center gap-2.5">
            {rekapType === 'matriks_kelas' && (
              <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
                <span className="text-[11px] text-slate-400 font-bold mr-1">Kelas:</span>
                <button
                  type="button"
                  onClick={() => setSelectedKelas('Semua')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                    selectedKelas === 'Semua' ? 'bg-teal-500 text-slate-950' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Semua (I-VI)
                </button>
                {KELAS_LIST.map((kls) => (
                  <button
                    key={kls}
                    type="button"
                    onClick={() => setSelectedKelas(kls)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                      selectedKelas === kls ? 'bg-teal-500 text-slate-950' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Kls {kls}
                  </button>
                ))}
              </div>
            )}

            {/* Paper Size selector */}
            <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
              <span className="text-[11px] text-slate-400 font-bold mr-1">Kertas:</span>
              {(['F4', 'A4', 'Legal'] as PaperSize[]).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setPaperSize(sz)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                    paperSize === sz ? 'bg-teal-500 text-slate-950' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>

            {/* Orientation selector */}
            <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
              <span className="text-[11px] text-slate-400 font-bold mr-1">Orientasi:</span>
              <button
                type="button"
                onClick={() => setOrientation('landscape')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                  orientation === 'landscape' ? 'bg-teal-500 text-slate-950' : 'text-slate-300 hover:text-white'
                }`}
              >
                Landscape
              </button>
              <button
                type="button"
                onClick={() => setOrientation('portrait')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                  orientation === 'portrait' ? 'bg-teal-500 text-slate-950' : 'text-slate-300 hover:text-white'
                }`}
              >
                Portrait
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-slate-800 px-1.5 py-1 rounded-lg border border-slate-700">
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.max(0.7, prev - 0.1))}
                className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white"
                title="Perkecil Pratinjau"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-bold px-1 text-teal-300">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.min(1.3, prev + 0.1))}
                className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white"
                title="Perbesar Pratinjau"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Preview Container (Scrollable viewport for screen, clean full sheet for print) */}
      <div className="p-4 sm:p-6 bg-slate-200/90 overflow-x-auto min-h-[600px] flex justify-center items-start">
        {/* Printable Document Paper (Target for Print) */}
        <div
          id="rekap-jadwal-printable-area"
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease'
          }}
          className={`bg-white text-black p-8 sm:p-10 shadow-2xl rounded-xl border border-slate-300 print:shadow-none print:border-none print:p-0 print:m-0 print:transform-none ${
            orientation === 'landscape'
              ? paperSize === 'F4'
                ? 'paper-f4-landscape max-w-5xl w-full'
                : 'paper-a4-landscape max-w-5xl w-full'
              : paperSize === 'F4'
              ? 'paper-f4 max-w-4xl w-full'
              : 'paper-a4 max-w-4xl w-full'
          }`}
        >
          {/* FORMAT 1: JADWAL MINGGUAN PER KELAS */}
          {rekapType === 'matriks_kelas' && (
            <div className="space-y-8">
              {classesToPrint.map((kls, kIdx) => (
                <div
                  key={kls}
                  className={`rekap-kelas-sheet ${
                    kIdx > 0 ? 'pt-8 border-t-2 border-dashed border-slate-400 print:border-none print:pt-0 print-break-after-page' : ''
                  }`}
                >
                  {/* Kop Surat Resmi Kedinasan */}
                  <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-3">
                    <div className="w-16 h-16 flex items-center justify-center flex-shrink-0">
                      {settings.logoKiri && settings.logoKiri.trim() ? (
                        <img
                          src={settings.logoKiri}
                          alt="Logo Kiri"
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <School className="w-12 h-12 text-black" />
                      )}
                    </div>
                    <div className="text-center flex-1 px-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider leading-tight">
                        {settings.namaInstansi}
                      </h3>
                      <h1 className="text-base sm:text-lg font-black uppercase tracking-wide leading-tight">
                        {settings.namaSekolah}
                      </h1>
                      <p className="text-[10px] leading-tight">
                        {settings.alamatSekolah} • NPSN: {settings.npsn}
                      </p>
                      <p className="text-[9px] italic text-slate-700 leading-tight">
                        {settings.alamatSekolah}, Kabupaten Pegunungan Bintang, Provinsi Papua Pegunungan
                      </p>
                    </div>
                    <div className="w-16 h-16 flex items-center justify-center flex-shrink-0">
                      {settings.logoKanan && settings.logoKanan.trim() ? (
                        <img
                          src={settings.logoKanan}
                          alt="Logo Kanan"
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <Sparkles className="w-12 h-12 text-black" />
                      )}
                    </div>
                  </div>

                  {/* Title & Metadata */}
                  <div className="text-center mb-4">
                    <h2 className="text-sm sm:text-base font-black uppercase underline tracking-wide">
                      JADWAL PELAJARAN MINGGUAN KELAS {kls}
                    </h2>
                    <p className="text-[11px] font-bold text-slate-800">
                      Kurikulum Merdeka • {semester} • Tahun Ajaran {tahunAjaran}
                    </p>
                  </div>

                  {/* Table Matriks: Jam x Hari (Senin - Sabtu) */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-[10.5px] border-collapse border-2 border-black">
                      <thead>
                        <tr className="bg-slate-100 text-black">
                          <th className="border border-black p-2 text-center w-10">Jam</th>
                          <th className="border border-black p-2 text-center w-24">Waktu</th>
                          {HARI_LIST.map((h) => (
                            <th key={h} className="border border-black p-2 text-center font-bold">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {standardTimeSlots.map((slot, sIdx) => {
                          return (
                            <React.Fragment key={slot.jamKe}>
                              <tr>
                                <td className="border border-black p-2 text-center font-bold bg-slate-50">
                                  {slot.jamKe}
                                </td>
                                <td className="border border-black p-2 text-center text-[10px] font-semibold bg-slate-50">
                                  {slot.waktu}
                                </td>
                                {HARI_LIST.map((hari) => {
                                  const item = getScheduleItem(kls, hari, slot.jamKe);
                                  return (
                                    <td
                                      key={hari}
                                      className={`border border-black p-2 align-top transition-colors ${
                                        item ? 'bg-white' : 'bg-slate-50/50 text-slate-400 text-center'
                                      }`}
                                    >
                                      {item ? (
                                        <div>
                                          <div className="font-bold text-[11px] text-slate-900 leading-tight">
                                            {item.mataPelajaran}
                                          </div>
                                          <div className="text-[9.5px] text-slate-700 italic mt-0.5 font-medium leading-tight">
                                            {item.guruPengampu}
                                          </div>
                                          {item.ruangan && (
                                            <div className="text-[8.5px] text-slate-500 mt-0.5">
                                              📍 {item.ruangan}
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <span className="text-xs text-slate-300">-</span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>

                              {/* Istirahat slot after Jam 2 & Jam 4 */}
                              {slot.jamKe === 2 && (
                                <tr className="bg-slate-200/80 font-bold text-center text-[10px]">
                                  <td className="border border-black p-1 text-center" colSpan={2}>
                                    09.00 - 09.30
                                  </td>
                                  <td className="border border-black p-1 uppercase tracking-wider text-slate-700" colSpan={6}>
                                    ☕ ISTIRAHAT I & PUDING GIZI SISWA
                                  </td>
                                </tr>
                              )}
                              {slot.jamKe === 4 && (
                                <tr className="bg-slate-200/80 font-bold text-center text-[10px]">
                                  <td className="border border-black p-1 text-center" colSpan={2}>
                                    11.00 - 11.15
                                  </td>
                                  <td className="border border-black p-1 uppercase tracking-wider text-slate-700" colSpan={6}>
                                    🥤 ISTIRAHAT II & LITERASI SANTAI
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pengesahan Tanda Tangan */}
                  {showSignatures && (
                    <div className="flex justify-between items-start mt-6 pt-2 text-[11px] print-break-inside-avoid">
                      <div className="text-center w-64">
                        <p>Mengetahui,</p>
                        <p className="font-bold">Kepala Sekolah</p>
                        <div className="h-16"></div>
                        <p className="font-bold underline">{settings.namaKepsek}</p>
                        <p className="text-[10px]">NIP. {settings.nipKepsek || '-'}</p>
                      </div>

                      <div className="text-center w-64">
                        <p>
                          Dekai,{' '}
                          {new Date().toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                        <p className="font-bold">Guru Pengembang Kurikulum & TU</p>
                        <div className="h-16"></div>
                        <p className="font-bold underline">{settings.operatorTU}</p>
                        <p className="text-[10px]">NIP. {settings.nipOperator || '-'}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* FORMAT 2: MASTER JADWAL SELURUH KELAS (I - VI) */}
          {rekapType === 'master_sekolah' && (
            <div className="space-y-4">
              {/* Kop Surat */}
              <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-2">
                <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
                  {settings.logoKiri && settings.logoKiri.trim() ? (
                    <img
                      src={settings.logoKiri}
                      alt="Logo"
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <School className="w-10 h-10 text-black" />
                  )}
                </div>
                <div className="text-center flex-1 px-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider leading-tight">
                    {settings.namaInstansi}
                  </h3>
                  <h1 className="text-base sm:text-lg font-black uppercase tracking-wide leading-tight">
                    {settings.namaSekolah}
                  </h1>
                  <p className="text-[10px] leading-tight">
                    {settings.alamatSekolah} • NPSN: {settings.npsn}
                  </p>
                  <p className="text-[9px] italic text-slate-700 leading-tight">
                    {settings.alamatSekolah}, Kabupaten Pegunungan Bintang, Provinsi Papua Pegunungan
                  </p>
                </div>
                <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
                  {settings.logoKanan && settings.logoKanan.trim() ? (
                    <img
                      src={settings.logoKanan}
                      alt="Logo"
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Sparkles className="w-10 h-10 text-black" />
                  )}
                </div>
              </div>

              {/* Title */}
              <div className="text-center mb-3">
                <h2 className="text-sm sm:text-base font-black uppercase underline tracking-wide">
                  MASTER JADWAL PELAJARAN INDUK (KELAS I - VI)
                </h2>
                <p className="text-[11px] font-bold text-slate-800">
                  Kurikulum Merdeka • {semester} • Tahun Ajaran {tahunAjaran}
                </p>
              </div>

              {/* Master Matrix Table: Hari x Jam x Rombel (Kelas I - VI) */}
              <div className="overflow-x-auto">
                <table className="w-full text-[10px] border-collapse border-2 border-black">
                  <thead>
                    <tr className="bg-slate-200 text-black">
                      <th className="border border-black p-1.5 text-center w-16">Hari</th>
                      <th className="border border-black p-1.5 text-center w-10">Jam</th>
                      <th className="border border-black p-1.5 text-center w-20">Waktu</th>
                      <th className="border border-black p-1.5 text-center w-1/6 font-bold bg-teal-50">Kelas I</th>
                      <th className="border border-black p-1.5 text-center w-1/6 font-bold bg-teal-50">Kelas II</th>
                      <th className="border border-black p-1.5 text-center w-1/6 font-bold bg-teal-50">Kelas III</th>
                      <th className="border border-black p-1.5 text-center w-1/6 font-bold bg-teal-50">Kelas IV</th>
                      <th className="border border-black p-1.5 text-center w-1/6 font-bold bg-teal-50">Kelas V</th>
                      <th className="border border-black p-1.5 text-center w-1/6 font-bold bg-teal-50">Kelas VI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {HARI_LIST.map((hari) =>
                      standardTimeSlots.map((slot, sIdx) => (
                        <tr key={`${hari}-${slot.jamKe}`}>
                          {sIdx === 0 && (
                            <td
                              rowSpan={standardTimeSlots.length}
                              className="border border-black p-1.5 text-center font-black bg-slate-100 align-middle text-[11px]"
                            >
                              {hari}
                            </td>
                          )}
                          <td className="border border-black p-1.5 text-center font-bold bg-slate-50">
                            {slot.jamKe}
                          </td>
                          <td className="border border-black p-1.5 text-center text-[9px] font-medium bg-slate-50">
                            {slot.waktu}
                          </td>

                          {KELAS_LIST.map((kls) => {
                            const item = getScheduleItem(kls, hari, slot.jamKe);
                            return (
                              <td
                                key={kls}
                                className={`border border-black p-1.5 align-top ${
                                  item ? 'bg-white' : 'bg-slate-50/40 text-center text-slate-300'
                                }`}
                              >
                                {item ? (
                                  <div>
                                    <div className="font-bold text-[10px] text-slate-900 leading-tight">
                                      {item.mataPelajaran}
                                    </div>
                                    <div className="text-[8.5px] text-slate-600 italic font-medium leading-tight">
                                      {item.guruPengampu}
                                    </div>
                                  </div>
                                ) : (
                                  <span>-</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Signatures */}
              {showSignatures && (
                <div className="flex justify-between items-start mt-6 pt-2 text-[11px] print-break-inside-avoid">
                  <div className="text-center w-64">
                    <p>Mengetahui,</p>
                    <p className="font-bold">Kepala Sekolah</p>
                    <div className="h-16"></div>
                    <p className="font-bold underline">{settings.namaKepsek}</p>
                    <p className="text-[10px]">NIP. {settings.nipKepsek || '-'}</p>
                  </div>

                  <div className="text-center w-64">
                    <p>
                      Dekai,{' '}
                      {new Date().toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="font-bold">Guru Pengembang Kurikulum & TU</p>
                    <div className="h-16"></div>
                    <p className="font-bold underline">{settings.operatorTU}</p>
                    <p className="text-[10px]">NIP. {settings.nipOperator || '-'}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* FORMAT 3: REKAP BEBAN MENGAJAR GURU (JTM) */}
          {rekapType === 'beban_guru' && (
            <div className="space-y-4">
              {/* Kop Surat */}
              <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-2">
                <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
                  {settings.logoKiri && settings.logoKiri.trim() ? (
                    <img
                      src={settings.logoKiri}
                      alt="Logo"
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <School className="w-10 h-10 text-black" />
                  )}
                </div>
                <div className="text-center flex-1 px-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider leading-tight">
                    {settings.namaInstansi}
                  </h3>
                  <h1 className="text-base sm:text-lg font-black uppercase tracking-wide leading-tight">
                    {settings.namaSekolah}
                  </h1>
                  <p className="text-[10px] leading-tight">
                    {settings.alamatSekolah} • NPSN: {settings.npsn}
                  </p>
                  <p className="text-[9px] italic text-slate-700 leading-tight">
                    {settings.alamatSekolah}, Kabupaten Pegunungan Bintang, Provinsi Papua Pegunungan
                  </p>
                </div>
                <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
                  {settings.logoKanan && settings.logoKanan.trim() ? (
                    <img
                      src={settings.logoKanan}
                      alt="Logo"
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Sparkles className="w-10 h-10 text-black" />
                  )}
                </div>
              </div>

              <div className="text-center mb-3">
                <h2 className="text-sm sm:text-base font-black uppercase underline tracking-wide">
                  REKAPITULASI DISTRIBUSI BEBAN MENGAJAR GURU (JTM)
                </h2>
                <p className="text-[11px] font-bold text-slate-800">
                  Pembagian Jam Tatap Muka (JTM) • {semester} • Tahun Ajaran {tahunAjaran}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-[10.5px] border-collapse border-2 border-black">
                  <thead>
                    <tr className="bg-slate-100 text-black">
                      <th className="border border-black p-2 text-center w-8">No</th>
                      <th className="border border-black p-2 text-left">Nama Pendidik & Gelar</th>
                      <th className="border border-black p-2 text-center w-28">NIP / NUPTK</th>
                      <th className="border border-black p-2 text-center w-20">Status</th>
                      <th className="border border-black p-2 text-left">Mata Pelajaran yang Diampu</th>
                      <th className="border border-black p-2 text-center w-20">Kelas</th>
                      <th className="border border-black p-2 text-center w-14">Total JP</th>
                      <th className="border border-black p-2 text-left w-36">Keterangan Beban</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teacherWorkload.map((t, idx) => (
                      <tr key={t.nama}>
                        <td className="border border-black p-2 text-center">{idx + 1}</td>
                        <td className="border border-black p-2 font-bold text-slate-900">{t.nama}</td>
                        <td className="border border-black p-2 text-center text-[9.5px]">{t.nip}</td>
                        <td className="border border-black p-2 text-center">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              t.status === 'PNS'
                                ? 'bg-teal-100 text-teal-900 border border-teal-300'
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td className="border border-black p-2 text-[10px]">
                          {Array.from(t.mapelSet).join(', ') || '-'}
                        </td>
                        <td className="border border-black p-2 text-center font-semibold text-[10px]">
                          {Array.from(t.kelasSet).join(', ') || '-'}
                        </td>
                        <td className="border border-black p-2 text-center font-black text-xs text-teal-950 bg-teal-50">
                          {t.totalJP} JP
                        </td>
                        <td className="border border-black p-2 text-[9.5px]">
                          {t.totalJP >= 24 ? (
                            <span className="font-bold text-emerald-800">
                              ✓ Beban Standar Sertifikasi (≥24 JP)
                            </span>
                          ) : (
                            <span className="text-slate-600">
                              {t.totalJP > 0 ? `${t.totalJP} JP Terjadwal` : 'Penugasan Khusus TU'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {/* Total Row */}
                    <tr className="bg-slate-200 font-bold">
                      <td colSpan={6} className="border border-black p-2 text-right uppercase">
                        Total Alokasi Jam Tatap Muka Seluruh Sekolah:
                      </td>
                      <td className="border border-black p-2 text-center font-black text-sm bg-teal-200">
                        {totalSchoolJP} JP
                      </td>
                      <td className="border border-black p-2 text-xs">Mingguan</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Signatures */}
              {showSignatures && (
                <div className="flex justify-between items-start mt-6 pt-2 text-[11px] print-break-inside-avoid">
                  <div className="text-center w-64">
                    <p>Mengetahui,</p>
                    <p className="font-bold">Kepala Sekolah</p>
                    <div className="h-16"></div>
                    <p className="font-bold underline">{settings.namaKepsek}</p>
                    <p className="text-[10px]">NIP. {settings.nipKepsek || '-'}</p>
                  </div>

                  <div className="text-center w-64">
                    <p>
                      Dekai,{' '}
                      {new Date().toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="font-bold">Guru Pengembang Kurikulum & TU</p>
                    <div className="h-16"></div>
                    <p className="font-bold underline">{settings.operatorTU}</p>
                    <p className="text-[10px]">NIP. {settings.nipOperator || '-'}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* FORMAT 4: AGENDA RINCI */}
          {rekapType === 'agenda_rinci' && (
            <div className="space-y-4">
              {/* Kop Surat */}
              <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-2">
                <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
                  {settings.logoKiri && settings.logoKiri.trim() ? (
                    <img
                      src={settings.logoKiri}
                      alt="Logo"
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <School className="w-10 h-10 text-black" />
                  )}
                </div>
                <div className="text-center flex-1 px-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider leading-tight">
                    {settings.namaInstansi}
                  </h3>
                  <h1 className="text-base sm:text-lg font-black uppercase tracking-wide leading-tight">
                    {settings.namaSekolah}
                  </h1>
                  <p className="text-[10px] leading-tight">
                    {settings.alamatSekolah} • NPSN: {settings.npsn}
                  </p>
                  <p className="text-[9px] italic text-slate-700 leading-tight">
                    {settings.alamatSekolah}, Kabupaten Pegunungan Bintang, Provinsi Papua Pegunungan
                  </p>
                </div>
                <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
                  {settings.logoKanan && settings.logoKanan.trim() ? (
                    <img
                      src={settings.logoKanan}
                      alt="Logo"
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Sparkles className="w-10 h-10 text-black" />
                  )}
                </div>
              </div>

              <div className="text-center mb-3">
                <h2 className="text-sm sm:text-base font-black uppercase underline tracking-wide">
                  AGENDA RINCI JADWAL PELAJARAN SEKOLAH
                </h2>
                <p className="text-[11px] font-bold text-slate-800">
                  Kurikulum Merdeka • {semester} • Tahun Ajaran {tahunAjaran}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-[10px] border-collapse border-2 border-black">
                  <thead>
                    <tr className="bg-slate-100 text-black">
                      <th className="border border-black p-1.5 text-center w-7">No</th>
                      <th className="border border-black p-1.5 text-center w-12">Kelas</th>
                      <th className="border border-black p-1.5 text-center w-14">Hari</th>
                      <th className="border border-black p-1.5 text-center w-10">Jam</th>
                      <th className="border border-black p-1.5 text-center w-20">Waktu</th>
                      <th className="border border-black p-1.5 text-left">Mata Pelajaran</th>
                      <th className="border border-black p-1.5 text-left">Guru Pengampu</th>
                      <th className="border border-black p-1.5 text-left">Ruangan</th>
                      <th className="border border-black p-1.5 text-left">Catatan / Silabus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jadwalList
                      .slice()
                      .sort(
                        (a, b) =>
                          a.kelas.localeCompare(b.kelas) ||
                          HARI_LIST.indexOf(a.hari) - HARI_LIST.indexOf(b.hari) ||
                          a.jamKe - b.jamKe
                      )
                      .map((j, idx) => (
                        <tr key={j.id}>
                          <td className="border border-black p-1.5 text-center">{idx + 1}</td>
                          <td className="border border-black p-1.5 text-center font-bold">Kls {j.kelas}</td>
                          <td className="border border-black p-1.5 text-center font-bold">{j.hari}</td>
                          <td className="border border-black p-1.5 text-center">{j.jamKe}</td>
                          <td className="border border-black p-1.5 text-center">{j.waktuMulai} - {j.waktuSelesai}</td>
                          <td className="border border-black p-1.5 font-bold">{j.mataPelajaran}</td>
                          <td className="border border-black p-1.5">{j.guruPengampu}</td>
                          <td className="border border-black p-1.5">{j.ruangan || '-'}</td>
                          <td className="border border-black p-1.5">{j.keterangan || '-'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Signatures */}
              {showSignatures && (
                <div className="flex justify-between items-start mt-6 pt-2 text-[11px] print-break-inside-avoid">
                  <div className="text-center w-64">
                    <p>Mengetahui,</p>
                    <p className="font-bold">Kepala Sekolah</p>
                    <div className="h-16"></div>
                    <p className="font-bold underline">{settings.namaKepsek}</p>
                    <p className="text-[10px]">NIP. {settings.nipKepsek || '-'}</p>
                  </div>

                  <div className="text-center w-64">
                    <p>
                      Dekai,{' '}
                      {new Date().toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="font-bold">Guru Pengembang Kurikulum & TU</p>
                    <div className="h-16"></div>
                    <p className="font-bold underline">{settings.operatorTU}</p>
                    <p className="text-[10px]">NIP. {settings.nipOperator || '-'}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Official Footnote */}
          <div className="mt-8 pt-3 border-t border-slate-300 text-[9px] text-slate-500 flex justify-between items-center print-break-inside-avoid">
            <span>
              Dokumen Administrasi Tata Usaha • Standar Kurikulum Merdeka & Dapodik SD Pedalaman Papua
            </span>
            <span>
              Dicetak: {new Date().toLocaleString('id-ID')} • Operator: {settings.operatorTU}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
