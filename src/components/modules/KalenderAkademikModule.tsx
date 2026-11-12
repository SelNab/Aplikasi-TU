import React, { useState, useMemo } from 'react';
import {
  KalenderAkademikItem,
  KalenderKategori,
  SemesterAkademik,
  SchoolSettings,
  PaperSize
} from '../../types';
import { ActionToolbar } from '../ActionToolbar';
import {
  exportToExcel,
  exportToWord,
  exportToPPT,
  triggerPrint,
  safeConfirm
} from '../../utils/exportHelpers';
import { getThemeConfig } from '../../utils/themeHelper';
import {
  CalendarDays,
  Calendar,
  CalendarCheck,
  Clock,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  AlertCircle,
  Search,
  School,
  Filter,
  CheckCircle2,
  CalendarRange,
  BookOpen,
  Palmtree,
  GraduationCap,
  Users,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Printer,
  Table as TableIcon,
  LayoutGrid,
  FileText
} from 'lucide-react';

interface KalenderAkademikModuleProps {
  kalenderList: KalenderAkademikItem[];
  onSaveKalender: (item: KalenderAkademikItem) => void;
  onDeleteKalender: (id: string) => void;
  onHome: () => void;
  settings: SchoolSettings;
  notifyMessage: (msg?: string) => void;
  onSync: () => void;
}

const KATEGORI_OPTIONS: KalenderKategori[] = [
  'Tanggal Penting',
  'Hari Libur',
  'Jadwal Ujian',
  'Rapat & Evaluasi'
];

const SEMESTER_OPTIONS: SemesterAkademik[] = [
  'Semester 1 (Ganjil)',
  'Semester 2 (Genap)',
  '1 Tahun Penuh'
];

const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const KalenderAkademikModule: React.FC<KalenderAkademikModuleProps> = ({
  kalenderList,
  onSaveKalender,
  onDeleteKalender,
  onHome,
  settings,
  notifyMessage,
  onSync
}) => {
  const theme = getThemeConfig(settings.temaWarna);
  const [paperSize, setPaperSize] = useState<PaperSize>(settings.ukuranKertas || 'F4');

  // Filter States
  const [selectedKategori, setSelectedKategori] = useState<KalenderKategori | 'Semua'>('Semua');
  const [selectedSemester, setSelectedSemester] = useState<SemesterAkademik | 'Semua'>('Semua');
  const [selectedBulan, setSelectedBulan] = useState<number | 'Semua'>('Semua'); // 0-11
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'timeline' | 'grid' | 'table'>('timeline');

  // Interactive Month Grid Navigation (Default to Current date or academic start)
  const [activeGridYear, setActiveGridYear] = useState<number>(2026);
  const [activeGridMonth, setActiveGridMonth] = useState<number>(8); // September 2026 (index 8)
  const [selectedGridDay, setSelectedGridDay] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KalenderAkademikItem | null>(null);

  // Form States
  const [formKegiatan, setFormKegiatan] = useState('');
  const [formKategori, setFormKategori] = useState<KalenderKategori>('Tanggal Penting');
  const [formTanggalMulai, setFormTanggalMulai] = useState('');
  const [formTanggalSelesai, setFormTanggalSelesai] = useState('');
  const [formSemester, setFormSemester] = useState<SemesterAkademik>('Semester 1 (Ganjil)');
  const [formTahunAjaran, setFormTahunAjaran] = useState('2026/2027');
  const [formSasaran, setFormSasaran] = useState('Seluruh Siswa & Dewan Guru');
  const [formTempat, setFormTempat] = useState(settings.namaSekolah || 'SD Negeri Baalil Kab. Pegunungan Bintang');
  const [formKeterangan, setFormKeterangan] = useState('');
  const [formIsLibur, setFormIsLibur] = useState(false);
  const [formIsUjian, setFormIsUjian] = useState(false);

  // Summary counts
  const stats = useMemo(() => {
    const total = kalenderList.length;
    const penting = kalenderList.filter((k) => k.kategori === 'Tanggal Penting').length;
    const libur = kalenderList.filter((k) => k.isLibur || k.kategori === 'Hari Libur').length;
    const ujian = kalenderList.filter((k) => k.isUjian || k.kategori === 'Jadwal Ujian').length;
    const rapat = kalenderList.filter((k) => k.kategori === 'Rapat & Evaluasi').length;
    return { total, penting, libur, ujian, rapat };
  }, [kalenderList]);

  // Filtered List for Timeline & Table
  const filteredList = useMemo(() => {
    return kalenderList
      .filter((item) => {
        const matchKategori =
          selectedKategori === 'Semua' || item.kategori === selectedKategori;
        const matchSemester =
          selectedSemester === 'Semua' || item.semester === selectedSemester;
        
        let matchBulan = true;
        if (selectedBulan !== 'Semua') {
          const itemMonth = new Date(item.tanggalMulai).getMonth();
          matchBulan = itemMonth === selectedBulan;
        }

        const query = searchQuery.toLowerCase();
        const matchSearch =
          !query ||
          item.kegiatan.toLowerCase().includes(query) ||
          item.sasaran.toLowerCase().includes(query) ||
          (item.tempat && item.tempat.toLowerCase().includes(query)) ||
          (item.keterangan && item.keterangan.toLowerCase().includes(query));

        return matchKategori && matchSemester && matchBulan && matchSearch;
      })
      .sort((a, b) => new Date(a.tanggalMulai).getTime() - new Date(b.tanggalMulai).getTime());
  }, [kalenderList, selectedKategori, selectedSemester, selectedBulan, searchQuery]);

  // Group events by Month for the Timeline view
  const groupedByMonth = useMemo(() => {
    const groups: { [key: string]: KalenderAkademikItem[] } = {};
    filteredList.forEach((item) => {
      const d = new Date(item.tanggalMulai);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
    });
    return groups;
  }, [filteredList]);

  // Format Helper for Date Range
  const formatDateRange = (mulai: string, selesai?: string) => {
    if (!mulai) return '-';
    const dMulai = new Date(mulai);
    const optionsDate: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    
    if (!selesai || selesai === mulai) {
      return dMulai.toLocaleDateString('id-ID', optionsDate);
    }
    const dSelesai = new Date(selesai);
    // If same month and year
    if (dMulai.getMonth() === dSelesai.getMonth() && dMulai.getFullYear() === dSelesai.getFullYear()) {
      return `${dMulai.getDate()} - ${dSelesai.getDate()} ${NAMA_BULAN[dMulai.getMonth()]} ${dMulai.getFullYear()}`;
    }
    return `${dMulai.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${dSelesai.toLocaleDateString('id-ID', optionsDate)}`;
  };

  // Badges & Color Helpers
  const getKategoriBadge = (kategori: KalenderKategori, isLibur?: boolean, isUjian?: boolean) => {
    if (isLibur || kategori === 'Hari Libur') {
      return {
        label: 'Hari Libur',
        bg: 'bg-rose-100 text-rose-800 border-rose-300',
        badgeColor: 'bg-rose-500',
        icon: Palmtree
      };
    }
    if (isUjian || kategori === 'Jadwal Ujian') {
      return {
        label: 'Jadwal Ujian',
        bg: 'bg-blue-100 text-blue-800 border-blue-300',
        badgeColor: 'bg-blue-600',
        icon: GraduationCap
      };
    }
    if (kategori === 'Rapat & Evaluasi') {
      return {
        label: 'Rapat & Evaluasi',
        bg: 'bg-purple-100 text-purple-800 border-purple-300',
        badgeColor: 'bg-purple-600',
        icon: Users
      };
    }
    return {
      label: 'Tanggal Penting',
      bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      badgeColor: 'bg-emerald-600',
      icon: CalendarCheck
    };
  };

  // Open Form Modal
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormKegiatan('');
    setFormKategori('Tanggal Penting');
    setFormTanggalMulai(new Date().toISOString().split('T')[0]);
    setFormTanggalSelesai(new Date().toISOString().split('T')[0]);
    setFormSemester('Semester 1 (Ganjil)');
    setFormTahunAjaran('2026/2027');
    setFormSasaran('Seluruh Siswa & Dewan Guru');
    setFormTempat(settings.namaSekolah || 'SD Negeri Baalil Kab. Pegunungan Bintang');
    setFormKeterangan('');
    setFormIsLibur(false);
    setFormIsUjian(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: KalenderAkademikItem) => {
    if (item.isLocked) {
      notifyMessage('Agenda ini berstatus terkunci resmi. Buka kunci terlebih dahulu.');
      return;
    }
    setEditingItem(item);
    setFormKegiatan(item.kegiatan);
    setFormKategori(item.kategori);
    setFormTanggalMulai(item.tanggalMulai);
    setFormTanggalSelesai(item.tanggalSelesai || item.tanggalMulai);
    setFormSemester(item.semester);
    setFormTahunAjaran(item.tahunAjaran);
    setFormSasaran(item.sasaran);
    setFormTempat(item.tempat || settings.namaSekolah || 'SD Negeri Baalil Kab. Pegunungan Bintang');
    setFormKeterangan(item.keterangan || '');
    setFormIsLibur(!!item.isLibur || item.kategori === 'Hari Libur');
    setFormIsUjian(!!item.isUjian || item.kategori === 'Jadwal Ujian');
    setIsModalOpen(true);
  };

  const handleToggleLock = (item: KalenderAkademikItem) => {
    const updated: KalenderAkademikItem = {
      ...item,
      isLocked: !item.isLocked
    };
    onSaveKalender(updated);
    notifyMessage(
      updated.isLocked
        ? `Agenda "${item.kegiatan}" Berhasil Dikunci`
        : `Kunci Agenda "${item.kegiatan}" Berhasil Dibuka`
    );
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKegiatan.trim()) {
      notifyMessage('Nama Kegiatan atau Agenda wajib diisi');
      return;
    }
    if (!formTanggalMulai) {
      notifyMessage('Tanggal Mulai wajib dipilih');
      return;
    }

    const tglSelesai = formTanggalSelesai && formTanggalSelesai >= formTanggalMulai
      ? formTanggalSelesai
      : formTanggalMulai;

    const newItem: KalenderAkademikItem = {
      id: editingItem ? editingItem.id : `kal-${Date.now()}`,
      kegiatan: formKegiatan.trim(),
      kategori: formKategori,
      tanggalMulai: formTanggalMulai,
      tanggalSelesai: tglSelesai,
      semester: formSemester,
      tahunAjaran: formTahunAjaran.trim() || '2026/2027',
      sasaran: formSasaran.trim() || 'Seluruh Siswa & Guru',
      tempat: formTempat.trim() || 'SD Inpres Dekai',
      keterangan: formKeterangan.trim(),
      isLibur: formIsLibur || formKategori === 'Hari Libur',
      isUjian: formIsUjian || formKategori === 'Jadwal Ujian',
      isLocked: editingItem ? editingItem.isLocked : false
    };

    onSaveKalender(newItem);
    setIsModalOpen(false);
    notifyMessage('Data Kalender Akademik Berhasil Disimpan');
  };

  const handleDelete = (id: string, nama: string) => {
    const item = kalenderList.find((k) => k.id === id);
    if (item?.isLocked) {
      notifyMessage('Agenda ini dikunci untuk perlindungan arsip.');
      return;
    }
    if (safeConfirm(`Apakah Anda yakin ingin menghapus agenda "${nama}" dari Kalender Akademik?`)) {
      onDeleteKalender(id);
      notifyMessage('Agenda Berhasil Dihapus');
    }
  };

  // Export handlers
  const handleExportExcel = () => {
    const headers = [
      'No',
      'Tanggal Mulai',
      'Tanggal Selesai',
      'Nama Kegiatan / Agenda',
      'Kategori',
      'Semester',
      'Tahun Ajaran',
      'Sasaran',
      'Tempat Pelaksanaan',
      'Status Libur/Ujian',
      'Keterangan'
    ];

    const rows = filteredList.map((item, index) => [
      index + 1,
      item.tanggalMulai,
      item.tanggalSelesai || item.tanggalMulai,
      item.kegiatan,
      item.kategori,
      item.semester,
      item.tahunAjaran,
      item.sasaran,
      item.tempat || '-',
      item.isLibur ? 'Hari Libur' : item.isUjian ? 'Jadwal Ujian' : 'Hari Efektif',
      item.keterangan || '-'
    ]);

    exportToExcel('Kalender_Akademik_SD_Inpres_Dekai', headers, rows);
    notifyMessage('Kalender Akademik Berhasil Diekspor ke Excel');
  };

  const handleExportWord = () => {
    let tableContent = `
      <table border="1" style="width:100%; border-collapse:collapse; text-align:left; font-size:10pt;">
        <thead>
          <tr style="background-color:#047857; color:white;">
            <th style="padding:6px; text-align:center;">No</th>
            <th style="padding:6px;">Rentang Tanggal</th>
            <th style="padding:6px;">Kegiatan / Agenda Pokok</th>
            <th style="padding:6px;">Kategori</th>
            <th style="padding:6px;">Semester</th>
            <th style="padding:6px;">Sasaran Peserta</th>
            <th style="padding:6px;">Lokasi / Keterangan</th>
          </tr>
        </thead>
        <tbody>
    `;

    filteredList.forEach((item, idx) => {
      tableContent += `
        <tr>
          <td style="padding:5px; text-align:center;">${idx + 1}</td>
          <td style="padding:5px;">${formatDateRange(item.tanggalMulai, item.tanggalSelesai)}</td>
          <td style="padding:5px; font-weight:bold;">${item.kegiatan}</td>
          <td style="padding:5px;">${item.kategori}</td>
          <td style="padding:5px;">${item.semester}</td>
          <td style="padding:5px;">${item.sasaran}</td>
          <td style="padding:5px;">${item.tempat || '-'} ${item.keterangan ? `(${item.keterangan})` : ''}</td>
        </tr>
      `;
    });

    tableContent += `</tbody></table>`;

    const fullDoc = `
      <div class="kop">
        <h3 style="margin:0;">${settings.namaInstansi}</h3>
        <h2 style="margin:2px 0;">${settings.namaSekolah}</h2>
        <p style="margin:0; font-size:10pt;">${settings.alamatSekolah} | NPSN: ${settings.npsn}</p>
      </div>
      <h3 style="text-align:center; text-transform:uppercase; margin-bottom:4px;">
        KALENDER AKADEMIK & JADWAL KEGIATAN POKOK SEKOLAH
      </h3>
      <p style="text-align:center; font-size:11pt; margin-top:0;">Tahun Ajaran 2026/2027 • Baalil, Kabupaten Pegunungan Bintang</p>
      ${tableContent}
      <div style="margin-top:40px; display:flex; justify-content:space-between;">
        <div style="float:left; width:45%; text-align:center;">
          <p>Mengetahui,</p>
          <p><b>Kepala Sekolah</b></p>
          <div style="height:50px;"></div>
          <p><u><b>${settings.namaKepsek}</b></u><br/>NIP. ${settings.nipKepsek}</p>
        </div>
        <div style="float:right; width:45%; text-align:center;">
          <p>Baalil, ${new Date().toLocaleDateString('id-ID')}</p>
          <p><b>Koordinator Tata Usaha & Kurikulum</b></p>
          <div style="height:50px;"></div>
          <p><u><b>${settings.operatorTU}</b></u><br/>NIP. ${settings.nipOperator}</p>
        </div>
      </div>
    `;

    exportToWord(`Kalender_Akademik_${settings.namaSekolah.replace(/\s+/g, '_')}`, fullDoc);
    notifyMessage('Kalender Akademik Berhasil Diekspor ke Dokumen Word');
  };

  const handleExportPPT = () => {
    const slides = [
      {
        title: 'KALENDER AKADEMIK & AGENDA POKOK SEKOLAH',
        subtitle: `${settings.namaSekolah} - Tahun Ajaran 2026/2027 (${settings.kabupaten || 'Pegunungan Bintang'})`,
        bullets: [
          `Total Kegiatan Pokok: ${stats.total} Agenda`,
          `Tanggal Penting & Upacara: ${stats.penting} Agenda`,
          `Hari Libur Resmi & Keagamaan Papua: ${stats.libur} Hari Libur`,
          `Jadwal Ujian & Asesmen (ANBK, STS, SAS, US): ${stats.ujian} Jadwal Asesmen`,
          `Rapat Kerja & Pleno Dewan Guru: ${stats.rapat} Pertemuan Evaluasi`
        ]
      },
      ...Object.keys(groupedByMonth).map((monthKey) => {
        const [yr, mo] = monthKey.split('-');
        const namaBln = NAMA_BULAN[parseInt(mo, 10) - 1];
        const items = groupedByMonth[monthKey];
        return {
          title: `Agenda Bulan ${namaBln} ${yr}`,
          subtitle: `Rencana Pembelajaran & Penilaian Siswa`,
          bullets: items.map(
            (it, i) =>
              `${i + 1}. [${formatDateRange(it.tanggalMulai, it.tanggalSelesai)}] ${it.kegiatan} (${it.kategori}) - Sasaran: ${it.sasaran}`
          )
        };
      })
    ];

    exportToPPT('Kalender_Akademik_SD_Inpres_Dekai', slides);
    notifyMessage('Slide Paparan Kalender Akademik Berhasil Diekspor ke PPT');
  };

  const handlePrint = () => {
    triggerPrint();
  };

  // Interactive Monthly Grid Matrix Calculation
  const daysInGridMonth = new Date(activeGridYear, activeGridMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(activeGridYear, activeGridMonth, 1).getDay(); // 0 = Minggu

  const handlePrevGridMonth = () => {
    if (activeGridMonth === 0) {
      setActiveGridMonth(11);
      setActiveGridYear(activeGridYear - 1);
    } else {
      setActiveGridMonth(activeGridMonth - 1);
    }
    setSelectedGridDay(null);
  };

  const handleNextGridMonth = () => {
    if (activeGridMonth === 11) {
      setActiveGridMonth(0);
      setActiveGridYear(activeGridYear + 1);
    } else {
      setActiveGridMonth(activeGridMonth + 1);
    }
    setSelectedGridDay(null);
  };

  // Find events on a specific day of the active grid month
  const getEventsOnDate = (dayNumber: number) => {
    const yStr = String(activeGridYear);
    const mStr = String(activeGridMonth + 1).padStart(2, '0');
    const dStr = String(dayNumber).padStart(2, '0');
    const fullDate = `${yStr}-${mStr}-${dStr}`;

    return kalenderList.filter((item) => {
      const start = item.tanggalMulai;
      const end = item.tanggalSelesai || item.tanggalMulai;
      return fullDate >= start && fullDate <= end;
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Banner / Module Heading */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 sm:p-5 no-print">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-xs">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-slate-900">
                  Kalender Akademik Sekolah
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Tahun Ajaran 2026/2027
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                  Pedalaman Papua Pegunungan
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl">
                Jadwal resmi tanggal-tanggal penting, hari libur nasional & keagamaan Papua, asesmen ujian sekolah (ANBK, STS, SAS/PAS, US), serta rapat kerja dewan guru {settings.namaSekolah}.
              </p>
            </div>
          </div>

          {/* Quick Paper & Header Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 text-xs">
              <span className="text-slate-500 font-semibold">Kertas Cetak:</span>
              <select
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value as PaperSize)}
                className="bg-white font-bold text-slate-800 px-1.5 py-0.5 rounded border border-slate-300"
              >
                <option value="F4">F4 / Folio</option>
                <option value="A4">A4 Standar</option>
                <option value="Legal">Legal</option>
                <option value="Letter">Letter</option>
              </select>
            </div>

            <button
              type="button"
              id="btn-tambah-agenda-akademik"
              onClick={handleOpenAdd}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer`}
            >
              <Plus className="w-4 h-4" />
              Tambah Agenda / Kegiatan
            </button>
          </div>
        </div>

        {/* 4 Category Summary Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Agenda
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-black text-slate-800">{stats.total}</span>
              <Calendar className="w-5 h-5 text-slate-400" />
            </div>
            <span className="text-[10px] text-slate-500">Semester 1 & 2</span>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
              Tanggal Penting
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-black text-emerald-900">{stats.penting}</span>
              <CalendarCheck className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="text-[10px] text-emerald-700">MPLS, Upacara & Rapor</span>
          </div>

          <div className="bg-rose-50 border border-rose-200 rounded-lg p-2.5">
            <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">
              Hari Libur Resmi
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-black text-rose-900">{stats.libur}</span>
              <Palmtree className="w-5 h-5 text-rose-500" />
            </div>
            <span className="text-[10px] text-rose-700">Nasional & Semester</span>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
              Jadwal Ujian
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-black text-blue-900">{stats.ujian}</span>
              <GraduationCap className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-[10px] text-blue-700">ANBK, STS, SAS & US VI</span>
          </div>
        </div>
      </div>

      {/* Action Toolbar (Export Excel, Word, PPT, Cetak, Sinkron) */}
      <div className="no-print">
        <ActionToolbar
          onAddNew={handleOpenAdd}
          onExcel={handleExportExcel}
          onWord={handleExportWord}
          onPpt={handleExportPPT}
          onPrint={handlePrint}
          onSync={onSync}
          onHome={onHome}
          paperSize={paperSize}
          onChangePaperSize={setPaperSize}
          titleContext="Kalender Akademik"
        />
      </div>

      {/* Filter and View Mode Switcher */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-3.5 space-y-3 no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari kegiatan, asesmen ujian, tanggal atau lokasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:bg-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* View Mode Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 self-start">
            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarRange className="w-3.5 h-3.5" />
              <span>Timeline Bulanan</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid Kalender</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Daftar Tabel</span>
            </button>
          </div>
        </div>

        {/* Dropdown Filters: Kategori, Semester, Bulan */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-bold">
            <Filter className="w-3.5 h-3.5 text-emerald-600" />
            <span>Filter:</span>
          </div>

          {/* Filter Kategori */}
          <select
            value={selectedKategori}
            onChange={(e) => setSelectedKategori(e.target.value as any)}
            className="bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1 text-slate-700 font-medium"
          >
            <option value="Semua">Semua Kategori ({stats.total})</option>
            <option value="Tanggal Penting">Tanggal Penting ({stats.penting})</option>
            <option value="Hari Libur">Hari Libur ({stats.libur})</option>
            <option value="Jadwal Ujian">Jadwal Ujian ({stats.ujian})</option>
            <option value="Rapat & Evaluasi">Rapat & Evaluasi ({stats.rapat})</option>
          </select>

          {/* Filter Semester */}
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value as any)}
            className="bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1 text-slate-700 font-medium"
          >
            <option value="Semua">Semua Semester</option>
            <option value="Semester 1 (Ganjil)">Semester 1 (Ganjil: Juli - Des)</option>
            <option value="Semester 2 (Genap)">Semester 2 (Genap: Jan - Juli)</option>
          </select>

          {/* Filter Bulan */}
          <select
            value={selectedBulan}
            onChange={(e) => {
              const val = e.target.value === 'Semua' ? 'Semua' : parseInt(e.target.value, 10);
              setSelectedBulan(val);
            }}
            className="bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1 text-slate-700 font-medium"
          >
            <option value="Semua">Semua Bulan</option>
            {NAMA_BULAN.map((bln, idx) => (
              <option key={bln} value={idx}>
                {bln}
              </option>
            ))}
          </select>

          {(selectedKategori !== 'Semua' || selectedSemester !== 'Semua' || selectedBulan !== 'Semua' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedKategori('Semua');
                setSelectedSemester('Semua');
                setSelectedBulan('Semua');
                setSearchQuery('');
              }}
              className="text-emerald-700 hover:text-emerald-900 font-bold underline ml-auto text-[11px] cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: TIMELINE BULANAN (Default) */}
      {viewMode === 'timeline' && (
        <div className="space-y-4 no-print">
          {Object.keys(groupedByMonth).length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border border-slate-200">
              <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-700 text-sm">Tidak ada agenda yang cocok dengan filter</p>
              <p className="text-xs text-slate-500 mt-1">
                Silakan sesuaikan filter pencarian atau klik tombol "Tambah Agenda / Kegiatan".
              </p>
            </div>
          ) : (
            Object.keys(groupedByMonth).map((monthKey) => {
              const [yr, mo] = monthKey.split('-');
              const namaBulan = NAMA_BULAN[parseInt(mo, 10) - 1];
              const monthEvents = groupedByMonth[monthKey];

              return (
                <div
                  key={monthKey}
                  className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden"
                >
                  {/* Month Header Banner */}
                  <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-400" />
                      <h3 className="font-black text-sm tracking-wide">
                        {namaBulan.toUpperCase()} {yr}
                      </h3>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white/20 text-white">
                      {monthEvents.length} Agenda
                    </span>
                  </div>

                  {/* List of Cards in this month */}
                  <div className="p-3 sm:p-4 divide-y divide-slate-100 space-y-3">
                    {monthEvents.map((item) => {
                      const badge = getKategoriBadge(item.kategori, item.isLibur, item.isUjian);
                      const BadgeIcon = badge.icon;

                      return (
                        <div
                          key={item.id}
                          className={`pt-3 first:pt-0 flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-lg hover:bg-slate-50/80 transition-colors border ${
                            item.isLibur
                              ? 'border-rose-200 bg-rose-50/30'
                              : item.isUjian
                              ? 'border-blue-200 bg-blue-50/30'
                              : 'border-slate-200/80 bg-white'
                          }`}
                        >
                          <div className="space-y-1.5 flex-1 min-w-0">
                            {/* Tags & Dates */}
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${badge.bg}`}
                              >
                                <BadgeIcon className="w-3 h-3" />
                                {badge.label}
                              </span>

                              <span className="inline-flex items-center gap-1 text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                                <Clock className="w-3 h-3 text-emerald-700" />
                                {formatDateRange(item.tanggalMulai, item.tanggalSelesai)}
                              </span>

                              <span className="text-[11px] font-semibold text-slate-500">
                                • {item.semester} ({item.tahunAjaran})
                              </span>

                              {item.isLocked && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                  <Lock className="w-2.5 h-2.5" /> Terkunci
                                </span>
                              )}
                            </div>

                            {/* Event Title */}
                            <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                              {item.kegiatan}
                            </h4>

                            {/* Event Details: Sasaran, Lokasi, Keterangan */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                              <div className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-slate-400" />
                                <span><b>Sasaran:</b> {item.sasaran}</span>
                              </div>
                              {item.tempat && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                  <span><b>Tempat:</b> {item.tempat}</span>
                                </div>
                              )}
                            </div>

                            {item.keterangan && (
                              <p className="text-xs text-slate-500 italic bg-white/60 p-1.5 rounded border border-slate-200">
                                "{item.keterangan}"
                              </p>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                            <button
                              type="button"
                              onClick={() => handleToggleLock(item)}
                              className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                                item.isLocked
                                  ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                                  : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                              }`}
                              title={item.isLocked ? 'Buka Kunci Agenda' : 'Kunci Agenda Resmi'}
                            >
                              {item.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEdit(item)}
                              disabled={item.isLocked}
                              className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                                item.isLocked
                                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                  : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                              }`}
                              title="Edit Agenda"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(item.id, item.kegiatan)}
                              disabled={item.isLocked}
                              className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                                item.isLocked
                                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                  : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                              }`}
                              title="Hapus Agenda"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW 2: INTERACTIVE MONTH GRID */}
      {viewMode === 'grid' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 space-y-4 no-print">
          {/* Month & Year Switcher Controls */}
          <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={handlePrevGridMonth}
              className="px-2.5 py-1.5 rounded bg-white hover:bg-slate-100 border border-slate-300 text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Bulan Sebelumnya
            </button>

            <div className="text-center">
              <h2 className="text-base font-black text-slate-900">
                {NAMA_BULAN[activeGridMonth]} {activeGridYear}
              </h2>
              <p className="text-[11px] text-slate-500">
                SD Inpres Dekai • Tahun Ajaran 2026/2027
              </p>
            </div>

            <button
              type="button"
              onClick={handleNextGridMonth}
              className="px-2.5 py-1.5 rounded bg-white hover:bg-slate-100 border border-slate-300 text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer"
            >
              Bulan Berikutnya <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Calendar Day Matrix */}
          <div className="overflow-x-auto">
            <div className="min-w-[500px]">
              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 gap-1 text-center font-black text-xs text-slate-700 mb-1">
                <span className="text-rose-600 bg-rose-50 py-1.5 rounded">Minggu</span>
                <span className="bg-slate-100 py-1.5 rounded">Senin</span>
                <span className="bg-slate-100 py-1.5 rounded">Selasa</span>
                <span className="bg-slate-100 py-1.5 rounded">Rabu</span>
                <span className="bg-slate-100 py-1.5 rounded">Kamis</span>
                <span className="bg-slate-100 py-1.5 rounded">Jumat</span>
                <span className="text-blue-700 bg-blue-50 py-1.5 rounded">Sabtu</span>
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-1">
                {/* Blank days before firstDayOfWeek */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div
                    key={`blank-${i}`}
                    className="h-20 bg-slate-50/50 rounded border border-dashed border-slate-200/60 p-1"
                  />
                ))}

                {/* Actual Month Days */}
                {Array.from({ length: daysInGridMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dayEvents = getEventsOnDate(dayNum);
                  const isSunday = (firstDayOfWeek + i) % 7 === 0;
                  const isSaturday = (firstDayOfWeek + i) % 7 === 6;
                  const hasHoliday = dayEvents.some((ev) => ev.isLibur || ev.kategori === 'Hari Libur');
                  const hasExam = dayEvents.some((ev) => ev.isUjian || ev.kategori === 'Jadwal Ujian');
                  const dayKey = `${activeGridYear}-${String(activeGridMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  const isSelected = selectedGridDay === dayKey;

                  return (
                    <div
                      key={`day-${dayNum}`}
                      onClick={() => setSelectedGridDay(isSelected ? null : dayKey)}
                      className={`min-h-[85px] p-1.5 rounded border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500'
                          : hasHoliday
                          ? 'border-rose-300 bg-rose-50/50 hover:bg-rose-100/50'
                          : hasExam
                          ? 'border-blue-300 bg-blue-50/50 hover:bg-blue-100/50'
                          : dayEvents.length > 0
                          ? 'border-emerald-200 bg-emerald-50/30 hover:bg-emerald-100/30'
                          : isSunday
                          ? 'border-slate-200 bg-rose-50/20'
                          : isSaturday
                          ? 'border-slate-200 bg-blue-50/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-black ${
                            isSunday || hasHoliday
                              ? 'text-rose-700'
                              : isSaturday
                              ? 'text-blue-700'
                              : 'text-slate-800'
                          }`}
                        >
                          {dayNum}
                        </span>
                        {dayEvents.length > 0 && (
                          <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        )}
                      </div>

                      {/* Event chips */}
                      <div className="space-y-0.5 mt-1 overflow-hidden">
                        {dayEvents.slice(0, 2).map((ev) => (
                          <div
                            key={ev.id}
                            className={`text-[9.5px] leading-tight font-bold truncate px-1 py-0.5 rounded ${
                              ev.isLibur
                                ? 'bg-rose-600 text-white'
                                : ev.isUjian
                                ? 'bg-blue-600 text-white'
                                : 'bg-emerald-700 text-white'
                            }`}
                            title={ev.kegiatan}
                          >
                            {ev.kegiatan}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-[9px] font-bold text-slate-500 text-center">
                            +{dayEvents.length - 2} lainnya
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Details on Selected Date if any */}
          {selectedGridDay && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-emerald-700" />
                  <h4 className="text-sm font-bold text-emerald-950">
                    Agenda pada Tanggal:{' '}
                    {new Date(selectedGridDay).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedGridDay(null)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-bold"
                >
                  Tutup Detail ✕
                </button>
              </div>

              {getEventsOnDate(new Date(selectedGridDay).getDate()).length === 0 ? (
                <p className="text-xs text-slate-600 italic">
                  Tidak ada agenda khusus pada tanggal ini. Hari efektif pembelajaran normal.
                </p>
              ) : (
                <div className="space-y-2">
                  {getEventsOnDate(new Date(selectedGridDay).getDate()).map((ev) => (
                    <div
                      key={ev.id}
                      className="bg-white p-3 rounded-lg border border-emerald-200 flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ev.isLibur
                                ? 'bg-rose-100 text-rose-800'
                                : ev.isUjian
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {ev.kategori}
                          </span>
                          <span className="text-xs font-bold text-slate-700">
                            {formatDateRange(ev.tanggalMulai, ev.tanggalSelesai)}
                          </span>
                        </div>
                        <p className="font-bold text-sm text-slate-900">{ev.kegiatan}</p>
                        <p className="text-xs text-slate-600 mt-0.5">
                          <b>Sasaran:</b> {ev.sasaran} | <b>Tempat:</b> {ev.tempat || '-'}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(ev)}
                          disabled={ev.isLocked}
                          className="p-1.5 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-xs"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: DAFTAR TABEL LENGKAP */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden no-print">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Rekapitulasi Agenda ({filteredList.length} Item)
            </h3>
            <span className="text-xs text-slate-500">Tahun Ajaran 2026/2027</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="p-2.5 text-center w-10">No</th>
                  <th className="p-2.5 w-44">Rentang Tanggal</th>
                  <th className="p-2.5">Nama Kegiatan / Agenda Pokok</th>
                  <th className="p-2.5 w-32">Kategori</th>
                  <th className="p-2.5 w-28">Semester</th>
                  <th className="p-2.5 w-36">Sasaran</th>
                  <th className="p-2.5 w-36">Lokasi</th>
                  <th className="p-2.5 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((item, idx) => {
                  const badge = getKategoriBadge(item.kategori, item.isLibur, item.isUjian);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-2.5 text-center font-bold text-slate-500">{idx + 1}</td>
                      <td className="p-2.5 font-bold text-slate-900 whitespace-nowrap">
                        {formatDateRange(item.tanggalMulai, item.tanggalSelesai)}
                      </td>
                      <td className="p-2.5 font-semibold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span>{item.kegiatan}</span>
                          {item.isLocked && <Lock className="w-3 h-3 text-amber-600 shrink-0" />}
                        </div>
                        {item.keterangan && (
                          <span className="text-[11px] text-slate-500 font-normal block">
                            {item.keterangan}
                          </span>
                        )}
                      </td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold border ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-600 font-medium">{item.semester}</td>
                      <td className="p-2.5 text-slate-700">{item.sasaran}</td>
                      <td className="p-2.5 text-slate-600">{item.tempat || '-'}</td>
                      <td className="p-2.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleLock(item)}
                            className="p-1 rounded text-slate-600 hover:bg-slate-200"
                            title={item.isLocked ? 'Buka Kunci' : 'Kunci'}
                          >
                            {item.isLocked ? <Lock className="w-3.5 h-3.5 text-amber-600" /> : <Unlock className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            disabled={item.isLocked}
                            className={`p-1 rounded text-indigo-600 hover:bg-indigo-50 ${
                              item.isLocked ? 'opacity-30 cursor-not-allowed' : ''
                            }`}
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id, item.kegiatan)}
                            disabled={item.isLocked}
                            className={`p-1 rounded text-rose-600 hover:bg-rose-50 ${
                              item.isLocked ? 'opacity-30 cursor-not-allowed' : ''
                            }`}
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* PRINTABLE OFFICIAL SHEET VIEW (Disembunyikan di layar, aktif saat cetak) */}
      <div className="hidden print:block bg-white text-black p-6 font-serif">
        {/* Kop Surat Resmi */}
        <div className="text-center border-b-2 border-black pb-3 mb-4">
          <div className="flex items-center justify-between">
            {settings.logoKiri && (
              <img src={settings.logoKiri} alt="Logo" className="w-16 h-16 object-contain" />
            )}
            <div className="flex-1 text-center px-4">
              <h2 className="text-sm font-bold uppercase tracking-wider">{settings.namaInstansi}</h2>
              <h1 className="text-lg font-black uppercase">{settings.namaSekolah}</h1>
              <p className="text-xs italic mt-0.5">
                {settings.alamatSekolah} | NPSN: {settings.npsn}
              </p>
            </div>
            {settings.logoKanan && (
              <img src={settings.logoKanan} alt="Logo 2" className="w-16 h-16 object-contain" />
            )}
          </div>
          <div className="border-b border-black mt-2"></div>
          <h3 className="text-sm font-bold uppercase mt-3 tracking-wide">
            KALENDER AKADEMIK & JADWAL KEGIATAN POKOK SATUAN PENDIDIKAN
          </h3>
          <p className="text-xs">
            Tahun Ajaran 2026/2027 • Standar Kurikulum Merdeka & Dapodik Kemendikbudristek
          </p>
        </div>

        {/* Tabel Agenda Cetak */}
        <table className="w-full text-xs border-collapse border border-black mb-6">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-black p-1.5 text-center w-8">No</th>
              <th className="border border-black p-1.5 text-left w-32">Rentang Tanggal</th>
              <th className="border border-black p-1.5 text-left">Nama Kegiatan / Agenda Pokok</th>
              <th className="border border-black p-1.5 text-center w-24">Kategori</th>
              <th className="border border-black p-1.5 text-center w-24">Semester</th>
              <th className="border border-black p-1.5 text-left w-32">Sasaran</th>
              <th className="border border-black p-1.5 text-left w-28">Lokasi</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((item, idx) => (
              <tr key={item.id}>
                <td className="border border-black p-1.5 text-center">{idx + 1}</td>
                <td className="border border-black p-1.5 font-bold">
                  {formatDateRange(item.tanggalMulai, item.tanggalSelesai)}
                </td>
                <td className="border border-black p-1.5 font-semibold">
                  {item.kegiatan}
                  {item.keterangan && (
                    <span className="block text-[10px] font-normal italic">
                      Keterangan: {item.keterangan}
                    </span>
                  )}
                </td>
                <td className="border border-black p-1.5 text-center">{item.kategori}</td>
                <td className="border border-black p-1.5 text-center">{item.semester}</td>
                <td className="border border-black p-1.5">{item.sasaran}</td>
                <td className="border border-black p-1.5">{item.tempat || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Official Signatures */}
        <div className="flex justify-between items-start mt-8 pt-4 text-xs">
          <div className="text-center w-64">
            <p>Mengetahui,</p>
            <p className="font-bold">Kepala Satuan Pendidikan</p>
            <div className="h-16"></div>
            <p className="font-bold underline">{settings.namaKepsek}</p>
            <p>NIP. {settings.nipKepsek}</p>
          </div>
          <div className="text-center w-64">
            <p>Dekai, {new Date().toLocaleDateString('id-ID')}</p>
            <p className="font-bold">Koordinator Tata Usaha & Akademik</p>
            <div className="h-16"></div>
            <p className="font-bold underline">{settings.operatorTU}</p>
            <p>NIP. {settings.nipOperator}</p>
          </div>
        </div>
      </div>

      {/* MODAL FORM TAMBAH / EDIT AGENDA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-emerald-800 to-emerald-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-sm">
                  {editingItem ? 'Edit Agenda Kalender Akademik' : 'Tambah Agenda Kalender Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-md text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmitForm} className="p-4 space-y-3 max-h-[80vh] overflow-y-auto">
              {/* Nama Kegiatan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Kegiatan / Agenda Pokok <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Penilaian Sumatif Akhir Semester (SAS), MPLS, Libur Hari Raya..."
                  value={formKegiatan}
                  onChange={(e) => setFormKegiatan(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-bold focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              {/* Kategori & Semester */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kategori Agenda
                  </label>
                  <select
                    value={formKategori}
                    onChange={(e) => {
                      const val = e.target.value as KalenderKategori;
                      setFormKategori(val);
                      if (val === 'Hari Libur') setFormIsLibur(true);
                      if (val === 'Jadwal Ujian') setFormIsUjian(true);
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-emerald-500"
                  >
                    {KATEGORI_OPTIONS.map((kat) => (
                      <option key={kat} value={kat}>
                        {kat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Semester Akademik
                  </label>
                  <select
                    value={formSemester}
                    onChange={(e) => setFormSemester(e.target.value as SemesterAkademik)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-emerald-500"
                  >
                    {SEMESTER_OPTIONS.map((sem) => (
                      <option key={sem} value={sem}>
                        {sem}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tanggal Mulai & Tanggal Selesai */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tanggal Mulai <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formTanggalMulai}
                    onChange={(e) => {
                      setFormTanggalMulai(e.target.value);
                      if (!formTanggalSelesai || formTanggalSelesai < e.target.value) {
                        setFormTanggalSelesai(e.target.value);
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium focus:ring-1 focus:ring-emerald-500"
                  >
                  </input>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tanggal Selesai (Opsional)
                  </label>
                  <input
                    type="date"
                    value={formTanggalSelesai}
                    min={formTanggalMulai}
                    onChange={(e) => setFormTanggalSelesai(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium focus:ring-1 focus:ring-emerald-500"
                  >
                  </input>
                </div>
              </div>

              {/* Sasaran Peserta & Tempat */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sasaran Peserta
                  </label>
                  <input
                    type="text"
                    placeholder="Misal: Seluruh Siswa, Kelas VI, Dewan Guru..."
                    value={formSasaran}
                    onChange={(e) => setFormSasaran(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tempat / Lokasi
                  </label>
                  <input
                    type="text"
                    placeholder="Misal: SD Inpres Dekai, Aula, Lapangan..."
                    value={formTempat}
                    onChange={(e) => setFormTempat(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Status Checklist: Hari Libur & Jadwal Ujian */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-800 block">
                  Penanda Khusus Kalender:
                </span>
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 text-xs font-semibold text-rose-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsLibur}
                      onChange={(e) => setFormIsLibur(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                    />
                    <span>Tandai Sebagai Hari Libur Sekolah</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-blue-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsUjian}
                      onChange={(e) => setFormIsUjian(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>Tandai Sebagai Jadwal Ujian / Asesmen</span>
                  </label>
                </div>
              </div>

              {/* Keterangan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Keterangan / Catatan Tambahan (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan petunjuk teknis, pakaian seragam, atau kelengkapan..."
                  value={formKeterangan}
                  onChange={(e) => setFormKeterangan(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Simpan ke Kalender'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
