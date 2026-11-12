import React, { useState, useMemo } from 'react';
import {
  JadwalPelajaranItem,
  HariSekolah,
  Teacher,
  PaperSize,
  SchoolSettings
} from '../../types';
import { ActionToolbar } from '../ActionToolbar';
import { exportToExcel, exportToWord, exportToPPT, triggerPrint, safeConfirm } from '../../utils/exportHelpers';
import {
  BookOpenCheck,
  Calendar,
  Clock,
  MapPin,
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  Layers,
  Search,
  Filter,
  School,
  Table as TableIcon,
  LayoutGrid,
  Printer,
  Eye,
  Sparkles
} from 'lucide-react';
import { RekapJadwalPrintView } from './RekapJadwalPrintView';

interface JadwalPelajaranModuleProps {
  jadwalList: JadwalPelajaranItem[];
  teachers: Teacher[];
  onSaveJadwal: (item: JadwalPelajaranItem) => void;
  onDeleteJadwal: (id: string) => void;
  onHome: () => void;
  settings: SchoolSettings;
  notifyMessage: (msg?: string) => void;
  onSync: () => void;
}

const HARI_LIST: HariSekolah[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const KELAS_LIST = ['I', 'II', 'III', 'IV', 'V', 'VI'];

const MATA_PELAJARAN_DEFAULTS = [
  'Pendidikan Pancasila',
  'Bahasa Indonesia',
  'Matematika',
  'IPAS (Ilmu Pengetahuan Alam & Sosial)',
  'Pendidikan Agama Kristen & Budi Pekerti',
  'PJOK (Pendidikan Jasmani & Kesehatan)',
  'Seni Rupa & Seni Musik',
  'Bahasa Inggris Dasar',
  'Muatan Lokal Papua (Bahasa Daerah & Budaya)',
  'Projek Penguatan Profil Pelajar Pancasila (P5)',
  'Pramuka & Literasi Membaca',
  'Upacara Bendera',
  'Senam Pagi & Kebersihan'
];

export const JadwalPelajaranModule: React.FC<JadwalPelajaranModuleProps> = ({
  jadwalList,
  teachers,
  onSaveJadwal,
  onDeleteJadwal,
  onHome,
  settings,
  notifyMessage,
  onSync
}) => {
  const [selectedKelas, setSelectedKelas] = useState<string>('IV');
  const [selectedHari, setSelectedHari] = useState<HariSekolah | 'Semua'>('Semua');
  const [viewMode, setViewMode] = useState<'matrix' | 'list' | 'rekap'>('matrix');
  const [searchQuery, setSearchQuery] = useState('');
  const [paperSize, setPaperSize] = useState<PaperSize>(settings.ukuranKertas);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewPrintOpen, setIsPreviewPrintOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<JadwalPelajaranItem | null>(null);

  const [formKelas, setFormKelas] = useState('IV');
  const [formRombel, setFormRombel] = useState('IV-A');
  const [formHari, setFormHari] = useState<HariSekolah>('Senin');
  const [formJamKe, setFormJamKe] = useState<number>(1);
  const [formWaktuMulai, setFormWaktuMulai] = useState('07.30');
  const [formWaktuSelesai, setFormWaktuSelesai] = useState('08.15');
  const [formMataPelajaran, setFormMataPelajaran] = useState('');
  const [formGuru, setFormGuru] = useState('');
  const [formRuangan, setFormRuangan] = useState('Ruang Kelas IV');
  const [formKeterangan, setFormKeterangan] = useState('');

  // Filtered List
  const filteredList = useMemo(() => {
    return jadwalList.filter((item) => {
      const matchKelas = selectedKelas === 'Semua' || item.kelas === selectedKelas;
      const matchHari = selectedHari === 'Semua' || item.hari === selectedHari;
      const matchSearch =
        item.mataPelajaran.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.guruPengampu.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.ruangan && item.ruangan.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.keterangan && item.keterangan.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchKelas && matchHari && matchSearch;
    });
  }, [jadwalList, selectedKelas, selectedHari, searchQuery]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormKelas(selectedKelas === 'Semua' ? 'IV' : selectedKelas);
    setFormRombel(`${selectedKelas === 'Semua' ? 'IV' : selectedKelas}-A`);
    setFormHari(selectedHari === 'Semua' ? 'Senin' : selectedHari);
    setFormJamKe(1);
    setFormWaktuMulai('07.30');
    setFormWaktuSelesai('08.15');
    setFormMataPelajaran(MATA_PELAJARAN_DEFAULTS[1]);
    setFormGuru(teachers[0]?.nama || 'Selpius Nabyal, S.Pd.Gr.');
    setFormRuangan(`Ruang Kelas ${selectedKelas === 'Semua' ? 'IV' : selectedKelas}`);
    setFormKeterangan('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: JadwalPelajaranItem) => {
    if (item.isLocked) {
      notifyMessage('Jadwal pelajaran ini dikunci');
      return;
    }
    setEditingItem(item);
    setFormKelas(item.kelas);
    setFormRombel(item.rombel);
    setFormHari(item.hari);
    setFormJamKe(item.jamKe);
    setFormWaktuMulai(item.waktuMulai);
    setFormWaktuSelesai(item.waktuSelesai);
    setFormMataPelajaran(item.mataPelajaran);
    setFormGuru(item.guruPengampu);
    setFormRuangan(item.ruangan || '');
    setFormKeterangan(item.keterangan || '');
    setIsModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMataPelajaran.trim() || !formGuru.trim()) {
      notifyMessage('Mata pelajaran dan guru pengampu wajib diisi');
      return;
    }

    const savedRecord: JadwalPelajaranItem = {
      id: editingItem ? editingItem.id : `jp-${Date.now()}`,
      kelas: formKelas,
      rombel: formRombel,
      hari: formHari,
      jamKe: Number(formJamKe),
      waktuMulai: formWaktuMulai,
      waktuSelesai: formWaktuSelesai,
      mataPelajaran: formMataPelajaran.trim(),
      guruPengampu: formGuru.trim(),
      ruangan: formRuangan.trim(),
      keterangan: formKeterangan.trim(),
      isLocked: editingItem?.isLocked || false
    };

    onSaveJadwal(savedRecord);
    setIsModalOpen(false);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handleDelete = (id: string, isLocked?: boolean) => {
    if (isLocked) {
      notifyMessage('Jadwal terkunci, tidak dapat dihapus');
      return;
    }
    if (safeConfirm('Hapus jadwal pelajaran ini?')) {
      onDeleteJadwal(id);
      notifyMessage('Jadwal pelajaran berhasil dihapus');
    }
  };

  const handleToggleLock = (item: JadwalPelajaranItem) => {
    const updated: JadwalPelajaranItem = {
      ...item,
      isLocked: !item.isLocked
    };
    onSaveJadwal(updated);
    notifyMessage(item.isLocked ? 'Kunci jadwal dibuka' : 'Jadwal pelajaran dikunci');
  };

  // Export handlers
  const handleExportExcel = () => {
    const headers = [
      'No',
      'Kelas',
      'Rombel',
      'Hari',
      'Jam Ke',
      'Waktu',
      'Mata Pelajaran',
      'Guru Pengampu',
      'Ruangan',
      'Keterangan'
    ];
    const rows = filteredList.map((j, idx) => [
      idx + 1,
      j.kelas,
      j.rombel,
      j.hari,
      j.jamKe,
      `${j.waktuMulai} - ${j.waktuSelesai}`,
      j.mataPelajaran,
      j.guruPengampu,
      j.ruangan || '-',
      j.keterangan || '-'
    ]);
    exportToExcel(`JADWAL_PELAJARAN_${settings.namaSekolah}_KELAS_${selectedKelas}`, headers, rows);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handleExportWord = () => {
    const content = `
      <div class="kop">
        <h3>${settings.namaInstansi}</h3>
        <h2>${settings.namaSekolah}</h2>
        <p>${settings.alamatSekolah} | NPSN: ${settings.npsn}</p>
        <hr/>
        <h3>JADWAL PELAJARAN SEKOLAH (KURIKULUM MERDEKA)</h3>
        <p>Kelas: <b>${selectedKelas}</b> | Tahun Ajaran 2024/2025</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Hari</th>
            <th>Jam</th>
            <th>Waktu</th>
            <th>Mata Pelajaran</th>
            <th>Guru Pengampu</th>
            <th>Ruangan</th>
            <th>Catatan Pembelajaran</th>
          </tr>
        </thead>
        <tbody>
          ${filteredList
            .map(
              (j, i) => `
            <tr>
              <td align="center">${i + 1}</td>
              <td><b>${j.hari}</b></td>
              <td align="center">${j.jamKe}</td>
              <td align="center">${j.waktuMulai} - ${j.waktuSelesai}</td>
              <td><b>${j.mataPelajaran}</b></td>
              <td>${j.guruPengampu}</td>
              <td>${j.ruangan || '-'}</td>
              <td>${j.keterangan || '-'}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
      <div style="margin-top: 30px; display: flex; justify-content: space-between;">
        <div>
          <p>Mengetahui,</p>
          <p>Kepala Sekolah,</p>
          <br/><br/><br/>
          <p><b>${settings.namaKepsek}</b><br/>NIP. ${settings.nipKepsek}</p>
        </div>
        <div>
          <p>Dekai, ${new Date().toLocaleDateString('id-ID')}</p>
          <p>Guru Kelas / Kurikulum,</p>
          <br/><br/><br/>
          <p><b>${settings.operatorTU}</b><br/>NIP. ${settings.nipOperator}</p>
        </div>
      </div>
    `;
    exportToWord(`Jadwal_Pelajaran_${settings.namaSekolah}_Kelas_${selectedKelas}`, content);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handleExportPPT = () => {
    const slides = [
      {
        title: 'Jadwal Pelajaran Sekolah',
        subtitle: `${settings.namaSekolah} - Kelas ${selectedKelas}`,
        bullets: [
          'Struktur Kurikulum Merdeka & Muatan Lokal Papua',
          'Alokasi Waktu Intrakurikuler & Kokurikuler P5',
          'Tahun Pelajaran 2024/2025',
          `Disusun oleh: ${settings.operatorTU}`
        ]
      },
      ...HARI_LIST.map((h) => {
        const items = filteredList.filter((j) => j.hari === h);
        return {
          title: `Jadwal Hari ${h} - Kelas ${selectedKelas}`,
          subtitle: `${items.length} Mata Pelajaran`,
          bullets: items.map(
            (it) =>
              `Jam ${it.jamKe} (${it.waktuMulai}-${it.waktuSelesai}): ${it.mataPelajaran} - Guru: ${it.guruPengampu}`
          )
        };
      })
    ];
    exportToPPT(`Presentasi_Jadwal_Kelas_${selectedKelas}`, slides);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  return (
    <div id="module-jadwal-pelajaran" className="space-y-4">
      {/* Interactive UI Container - Hidden during Print */}
      <div className="no-print space-y-4">
        {/* Standard Action Toolbar */}
        <ActionToolbar
          onHome={onHome}
          onSave={() => notifyMessage('Data Anda Berhasil Disimpan')}
          onDelete={() => {}}
          onPrint={() => setIsPreviewPrintOpen(true)}
          onExcel={handleExportExcel}
          onWord={handleExportWord}
          onPpt={handleExportPPT}
          paperSize={paperSize}
          onChangePaperSize={setPaperSize}
          onSync={onSync}
          notifyMessage={notifyMessage}
        />

        {/* Module Title Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-600/10 border border-teal-500/20 text-teal-700 flex items-center justify-center flex-shrink-0">
                <BookOpenCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Jadwal Pelajaran Sekolah</h2>
                <p className="text-xs text-slate-500">
                  Jadwal Mata Pelajaran Kelas I - VI Kurikulum Merdeka, Muatan Lokal Papua & Pembagian Jam Guru
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* View Mode Switcher */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setViewMode('matrix')}
                  className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    viewMode === 'matrix' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Tampilan Matriks Mingguan"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Matriks Hari</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Tampilan Tabel Rinci"
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tabel Rinci</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('rekap')}
                  className={`p-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                    viewMode === 'rekap' ? 'bg-teal-700 text-white shadow-xs' : 'text-teal-800 hover:text-teal-950 hover:bg-teal-50'
                  }`}
                  title="Tampilan Rekapitulasi Jadwal Siap Cetak"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Rekapan Cetak</span>
                </button>
              </div>

              <button
                type="button"
                id="btn-print-jadwal-pelajaran"
                onClick={() => setIsPreviewPrintOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-700 to-emerald-800 hover:from-teal-800 hover:to-emerald-900 text-white rounded-lg text-xs font-black shadow-sm transition-all cursor-pointer"
                title="Buka Lembar Rekapan & Cetak Jadwal Pelajaran"
              >
                <Printer className="w-4 h-4 text-amber-300" />
                <span>Rekap & Cetak Jadwal</span>
              </button>

              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Jadwal</span>
              </button>
            </div>
          </div>

        {/* Filters: Kelas Buttons & Hari Filter & Search */}
        <div className="mt-3 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Kelas Badges */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Kelas:</span>
            <button
              type="button"
              onClick={() => setSelectedKelas('Semua')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                selectedKelas === 'Semua'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua Kelas
            </button>
            {KELAS_LIST.map((kls) => {
              const count = jadwalList.filter((j) => j.kelas === kls).length;
              return (
                <button
                  key={kls}
                  type="button"
                  onClick={() => setSelectedKelas(kls)}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                    selectedKelas === kls
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Kelas {kls} ({count})
                </button>
              );
            })}
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari mapel, guru, ruangan..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      {/* REKAP / PRINTS VIEW */}
      {viewMode === 'rekap' ? (
        <div className="space-y-4">
          <RekapJadwalPrintView
            jadwalList={jadwalList}
            teachers={teachers}
            settings={settings}
            initialKelas={selectedKelas === 'Semua' ? 'IV' : selectedKelas}
            notifyMessage={notifyMessage}
            isEmbedded={true}
          />
        </div>
      ) : viewMode === 'matrix' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {HARI_LIST.map((hari) => {
            const itemsInHari = filteredList
              .filter((item) => item.hari === hari)
              .sort((a, b) => a.jamKe - b.jamKe);

            return (
              <div
                key={hari}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col"
              >
                {/* Day Column Header */}
                <div className="px-3.5 py-2.5 bg-gradient-to-r from-teal-800 to-emerald-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-teal-200" />
                    <span className="font-extrabold text-xs tracking-wider uppercase">{hari}</span>
                  </div>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                    {itemsInHari.length} Jam Mapel
                  </span>
                </div>

                {/* Day Items List */}
                <div className="p-2 space-y-2 flex-1 bg-slate-50/50">
                  {itemsInHari.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      Tidak ada jam pelajaran
                    </div>
                  ) : (
                    itemsInHari.map((item) => (
                      <div
                        key={item.id}
                        className={`bg-white border rounded-lg p-2.5 shadow-xs text-xs relative transition-all ${
                          item.isLocked
                            ? 'border-amber-200 bg-amber-50/30'
                            : 'border-slate-200 hover:border-teal-400'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="w-5 h-5 rounded-md bg-teal-100 text-teal-800 font-black text-[10px] flex items-center justify-center">
                              {item.jamKe}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500">
                              {item.waktuMulai} - {item.waktuSelesai}
                            </span>
                            <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                              Kls {item.kelas}
                            </span>
                          </div>

                          <div className="flex items-center gap-0.5 no-print">
                            <button
                              type="button"
                              onClick={() => handleToggleLock(item)}
                              className="p-1 text-slate-400 hover:text-slate-600"
                              title={item.isLocked ? 'Buka Kunci' : 'Kunci'}
                            >
                              {item.isLocked ? (
                                <Lock className="w-3 h-3 text-amber-600" />
                              ) : (
                                <Unlock className="w-3 h-3" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(item)}
                              disabled={item.isLocked}
                              className="p-1 text-slate-400 hover:text-teal-700 disabled:opacity-40"
                              title="Edit"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id, item.isLocked)}
                              disabled={item.isLocked}
                              className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-40"
                              title="Hapus"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Mata Pelajaran */}
                        <h4 className="font-bold text-slate-900 mt-1.5 text-xs">
                          {item.mataPelajaran}
                        </h4>

                        {/* Guru & Ruangan */}
                        <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                          <GraduationCap className="w-3 h-3 text-teal-600 flex-shrink-0" />
                          <span className="truncate">{item.guruPengampu}</span>
                        </div>

                        {item.ruangan && (
                          <div className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-500">
                            <MapPin className="w-2.5 h-2.5 text-slate-400 flex-shrink-0" />
                            <span>{item.ruangan}</span>
                          </div>
                        )}

                        {item.keterangan && (
                          <p className="mt-1 text-[10px] text-slate-500 bg-slate-50 p-1 rounded border border-slate-100">
                            {item.keterangan}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST / TABLE VIEW */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-2.5 px-3 text-center w-10">No</th>
                  <th className="py-2.5 px-3">Kelas</th>
                  <th className="py-2.5 px-3">Hari</th>
                  <th className="py-2.5 px-3 text-center">Jam Ke</th>
                  <th className="py-2.5 px-3">Waktu</th>
                  <th className="py-2.5 px-3">Mata Pelajaran</th>
                  <th className="py-2.5 px-3">Guru Pengampu</th>
                  <th className="py-2.5 px-3">Ruangan</th>
                  <th className="py-2.5 px-3">Materi / Keterangan</th>
                  <th className="py-2.5 px-3 text-center w-20 no-print">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-3 text-center font-bold text-slate-400">{idx + 1}</td>
                    <td className="py-2 px-3 font-bold text-slate-700">
                      <span className="px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 text-[10.5px]">
                        Kelas {item.kelas} ({item.rombel})
                      </span>
                    </td>
                    <td className="py-2 px-3 font-semibold text-slate-800">{item.hari}</td>
                    <td className="py-2 px-3 text-center">
                      <span className="w-5 h-5 rounded-full bg-slate-100 font-bold inline-flex items-center justify-center text-[10.5px]">
                        {item.jamKe}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-600 font-medium">
                      {item.waktuMulai} - {item.waktuSelesai}
                    </td>
                    <td className="py-2 px-3 font-bold text-teal-900">{item.mataPelajaran}</td>
                    <td className="py-2 px-3 text-slate-700 font-medium">{item.guruPengampu}</td>
                    <td className="py-2 px-3 text-slate-500">{item.ruangan || '-'}</td>
                    <td className="py-2 px-3 text-slate-500 max-w-xs truncate">{item.keterangan || '-'}</td>
                    <td className="py-2 px-3 text-center no-print">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleLock(item)}
                          className="p-1 text-slate-400 hover:text-slate-600"
                        >
                          {item.isLocked ? <Lock className="w-3 h-3 text-amber-600" /> : <Unlock className="w-3 h-3" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          disabled={item.isLocked}
                          className="p-1 text-slate-500 hover:text-teal-700 disabled:opacity-40"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.isLocked)}
                          disabled={item.isLocked}
                          className="p-1 text-slate-500 hover:text-rose-700 disabled:opacity-40"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      </div>
      {/* End of interactive no-print container */}

      {/* Printable Sheet View - Dedicated Print Output */}
      <div id="print-jadwal-pelajaran-sheet" className="hidden print:block bg-white p-6 text-black print-only">
        {/* Kop Surat Sekolah */}
        <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
          <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
            {settings.logoKiri && settings.logoKiri.trim() ? (
              <img src={settings.logoKiri} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            ) : (
              <School className="w-10 h-10 text-black" />
            )}
          </div>
          <div className="text-center flex-1 px-4">
            <h2 className="text-xs font-bold uppercase tracking-wider">{settings.namaInstansi}</h2>
            <h1 className="text-base font-black uppercase tracking-wide">{settings.namaSekolah}</h1>
            <p className="text-[10px]">{settings.alamatSekolah} • NPSN: {settings.npsn}</p>
            <p className="text-[9px] italic text-slate-700">Baalil, Distrik Oksibil, Kabupaten Pegunungan Bintang, Provinsi Papua Pegunungan</p>
          </div>
          <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
            {settings.logoKanan && settings.logoKanan.trim() ? (
              <img src={settings.logoKanan} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            ) : (
              <Sparkles className="w-10 h-10 text-black" />
            )}
          </div>
        </div>

        <div className="text-center mb-4">
          <h3 className="text-sm font-black uppercase underline">
            JADWAL PELAJARAN SEKOLAH (KURIKULUM MERDEKA)
          </h3>
          <p className="text-[10.5px] font-bold">
            Kelas: {selectedKelas === 'Semua' ? 'Kelas I - VI' : `Kelas ${selectedKelas}`} • Tahun Ajaran 2024/2025
          </p>
        </div>

        <table className="w-full text-[11px] border-collapse border border-black mb-6">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-black p-1.5 text-center w-8">No</th>
              <th className="border border-black p-1.5 text-center w-14">Kelas</th>
              <th className="border border-black p-1.5 text-center w-16">Hari</th>
              <th className="border border-black p-1.5 text-center w-12">Jam</th>
              <th className="border border-black p-1.5 text-center w-24">Waktu</th>
              <th className="border border-black p-1.5 text-left">Mata Pelajaran</th>
              <th className="border border-black p-1.5 text-left">Guru Pengampu</th>
              <th className="border border-black p-1.5 text-left">Ruangan</th>
              <th className="border border-black p-1.5 text-left">Materi / Catatan</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((j, idx) => (
              <tr key={j.id}>
                <td className="border border-black p-1.5 text-center">{idx + 1}</td>
                <td className="border border-black p-1.5 text-center font-bold">{j.kelas}</td>
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

        {/* Signatures */}
        <div className="flex justify-between items-start mt-8 pt-4 text-xs">
          <div className="text-center w-64">
            <p>Mengetahui,</p>
            <p className="font-bold">Kepala Sekolah</p>
            <div className="h-16"></div>
            <p className="font-bold underline">{settings.namaKepsek}</p>
            <p>NIP. {settings.nipKepsek || '-'}</p>
          </div>
          <div className="text-center w-64">
            <p>Dekai, {new Date().toLocaleDateString('id-ID')}</p>
            <p className="font-bold">Guru Pengembang Kurikulum & TU</p>
            <div className="h-16"></div>
            <p className="font-bold underline">{settings.operatorTU}</p>
            <p>NIP. {settings.nipOperator || '-'}</p>
          </div>
        </div>
      </div>

      {/* Modal Pratinjau & Rekapan Cetak Jadwal Pelajaran */}
      {isPreviewPrintOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50 no-print animate-in fade-in">
          <div className="w-full max-w-6xl max-h-[94vh] overflow-y-auto rounded-2xl shadow-2xl">
            <RekapJadwalPrintView
              jadwalList={jadwalList}
              teachers={teachers}
              settings={settings}
              initialKelas={selectedKelas === 'Semua' ? 'IV' : selectedKelas}
              onClose={() => setIsPreviewPrintOpen(false)}
              notifyMessage={notifyMessage}
              isEmbedded={false}
            />
          </div>
        </div>
      )}

      {/* Modal Dialog Form Tambah / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="p-4 bg-gradient-to-r from-teal-750 to-emerald-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpenCheck className="w-5 h-5 text-teal-200" />
                <h3 className="font-bold text-sm">
                  {editingItem ? 'Edit Jadwal Pelajaran' : 'Tambah Jadwal Pelajaran'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-4 space-y-3 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kelas</label>
                  <select
                    value={formKelas}
                    onChange={(e) => {
                      setFormKelas(e.target.value);
                      setFormRombel(`${e.target.value}-A`);
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-teal-500"
                  >
                    {KELAS_LIST.map((k) => (
                      <option key={k} value={k}>
                        Kelas {k}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rombel</label>
                  <input
                    type="text"
                    value={formRombel}
                    onChange={(e) => setFormRombel(e.target.value)}
                    placeholder="Contoh: IV-A"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hari</label>
                  <select
                    value={formHari}
                    onChange={(e) => setFormHari(e.target.value as HariSekolah)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-teal-500"
                  >
                    {HARI_LIST.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jam Ke-</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={formJamKe}
                    onChange={(e) => setFormJamKe(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-bold focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Waktu Mulai</label>
                  <input
                    type="text"
                    value={formWaktuMulai}
                    onChange={(e) => setFormWaktuMulai(e.target.value)}
                    placeholder="07.30"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Waktu Selesai</label>
                  <input
                    type="text"
                    value={formWaktuSelesai}
                    onChange={(e) => setFormWaktuSelesai(e.target.value)}
                    placeholder="08.15"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mata Pelajaran</label>
                <input
                  type="text"
                  list="mapel-options"
                  value={formMataPelajaran}
                  onChange={(e) => setFormMataPelajaran(e.target.value)}
                  placeholder="Ketik atau pilih mata pelajaran..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-bold focus:ring-1 focus:ring-teal-500"
                  required
                />
                <datalist id="mapel-options">
                  {MATA_PELAJARAN_DEFAULTS.map((mp) => (
                    <option key={mp} value={mp} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Guru Pengampu</label>
                <input
                  type="text"
                  list="teacher-mapel-list"
                  value={formGuru}
                  onChange={(e) => setFormGuru(e.target.value)}
                  placeholder="Pilih atau ketik nama guru..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:ring-1 focus:ring-teal-500"
                  required
                />
                <datalist id="teacher-mapel-list">
                  {teachers.map((t) => (
                    <option key={t.id} value={t.nama} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ruangan / Tempat</label>
                <input
                  type="text"
                  value={formRuangan}
                  onChange={(e) => setFormRuangan(e.target.value)}
                  placeholder="Contoh: Ruang Kelas IV, Lapangan, Perpustakaan"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Materi Pokok / Catatan Pembelajaran
                </label>
                <textarea
                  rows={2}
                  value={formKeterangan}
                  onChange={(e) => setFormKeterangan(e.target.value)}
                  placeholder="Contoh: Bab 2 - Perkalian Bilangan Cacah / Diskusi Kelompok"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
