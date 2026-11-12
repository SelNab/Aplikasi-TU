import React, { useState, useMemo } from 'react';
import {
  JadwalPiketItem,
  HariSekolah,
  Teacher,
  PaperSize,
  SchoolSettings
} from '../../types';
import { ActionToolbar } from '../ActionToolbar';
import { exportToExcel, exportToWord, exportToPPT, triggerPrint, safeConfirm } from '../../utils/exportHelpers';
import {
  CalendarDays,
  ShieldCheck,
  Users,
  Clock,
  MapPin,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  CheckCircle,
  FileText,
  AlertCircle,
  Search,
  School,
  Printer,
  Eye
} from 'lucide-react';

interface JadwalPiketModuleProps {
  piketList: JadwalPiketItem[];
  teachers: Teacher[];
  onSavePiket: (item: JadwalPiketItem) => void;
  onDeletePiket: (id: string) => void;
  onHome: () => void;
  settings: SchoolSettings;
  notifyMessage: (msg?: string) => void;
  onSync: () => void;
}

const HARI_LIST: HariSekolah[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const JadwalPiketModule: React.FC<JadwalPiketModuleProps> = ({
  piketList,
  teachers,
  onSavePiket,
  onDeletePiket,
  onHome,
  settings,
  notifyMessage,
  onSync
}) => {
  const [selectedHari, setSelectedHari] = useState<HariSekolah | 'Semua'>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [paperSize, setPaperSize] = useState<PaperSize>(settings.ukuranKertas);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewPrintOpen, setIsPreviewPrintOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<JadwalPiketItem | null>(null);

  // Form State
  const [formHari, setFormHari] = useState<HariSekolah>('Senin');
  const [formKoordinator, setFormKoordinator] = useState('');
  const [formAnggota, setFormAnggota] = useState('');
  const [formTugasKhusus, setFormTugasKhusus] = useState('');
  const [formAreaPiket, setFormAreaPiket] = useState('');
  const [formPetugasSiswa, setFormPetugasSiswa] = useState('');
  const [formWaktuPiket, setFormWaktuPiket] = useState('07.00 - 12.45 WIT');
  const [formCatatan, setFormCatatan] = useState('');

  // Filtered List
  const filteredList = useMemo(() => {
    return piketList.filter((item) => {
      const matchHari = selectedHari === 'Semua' || item.hari === selectedHari;
      const matchSearch =
        item.koordinatorGuru.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.anggotaGuru.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.tugasKhusus.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.areaPiket.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.petugasKebersihanSiswa.toLowerCase().includes(searchQuery.toLowerCase());
      return matchHari && matchSearch;
    });
  }, [piketList, selectedHari, searchQuery]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormHari(selectedHari === 'Semua' ? 'Senin' : selectedHari);
    setFormKoordinator(teachers[0]?.nama || 'Selpius Nabyal, S.Pd.Gr.');
    setFormAnggota(teachers[1]?.nama || '');
    setFormTugasKhusus('Menyambut siswa di gerbang (5S), Pengawasan jam istirahat & ketertiban');
    setFormAreaPiket('Gerbang Utama & Halaman Sekolah');
    setFormPetugasSiswa('Regu Piket Kelas IV');
    setFormWaktuPiket('07.00 - 12.45 WIT');
    setFormCatatan('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: JadwalPiketItem) => {
    if (item.isLocked) {
      notifyMessage('Jadwal piket ini dikunci, buka kunci terlebih dahulu');
      return;
    }
    setEditingItem(item);
    setFormHari(item.hari);
    setFormKoordinator(item.koordinatorGuru);
    setFormAnggota(item.anggotaGuru.join(', '));
    setFormTugasKhusus(item.tugasKhusus);
    setFormAreaPiket(item.areaPiket);
    setFormPetugasSiswa(item.petugasKebersihanSiswa);
    setFormWaktuPiket(item.waktuPiket || '07.00 - 12.45 WIT');
    setFormCatatan(item.catatan || '');
    setIsModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKoordinator.trim()) {
      notifyMessage('Koordinator guru piket wajib diisi');
      return;
    }

    const anggotaList = formAnggota
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const savedRecord: JadwalPiketItem = {
      id: editingItem ? editingItem.id : `pkt-${Date.now()}`,
      hari: formHari,
      koordinatorGuru: formKoordinator.trim(),
      anggotaGuru: anggotaList,
      tugasKhusus: formTugasKhusus.trim(),
      areaPiket: formAreaPiket.trim(),
      petugasKebersihanSiswa: formPetugasSiswa.trim(),
      waktuPiket: formWaktuPiket.trim(),
      catatan: formCatatan.trim(),
      isLocked: editingItem?.isLocked || false
    };

    onSavePiket(savedRecord);
    setIsModalOpen(false);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handleDelete = (id: string, isLocked?: boolean) => {
    if (isLocked) {
      notifyMessage('Data terkunci, tidak dapat dihapus');
      return;
    }
    if (safeConfirm('Hapus jadwal piket ini?')) {
      onDeletePiket(id);
      notifyMessage('Jadwal piket berhasil dihapus');
    }
  };

  const handleToggleLock = (item: JadwalPiketItem) => {
    const updated: JadwalPiketItem = {
      ...item,
      isLocked: !item.isLocked
    };
    onSavePiket(updated);
    notifyMessage(item.isLocked ? 'Kunci jadwal dibuka' : 'Jadwal piket dikunci aman');
  };

  // Export handlers
  const handleExportExcel = () => {
    const headers = [
      'No',
      'Hari',
      'Waktu Piket',
      'Koordinator Piket',
      'Anggota Guru',
      'Area Piket',
      'Petugas Kebersihan Siswa',
      'Tugas Pokok & Khusus',
      'Catatan'
    ];
    const rows = filteredList.map((item, idx) => [
      idx + 1,
      item.hari,
      item.waktuPiket || '-',
      item.koordinatorGuru,
      item.anggotaGuru.join('; '),
      item.areaPiket,
      item.petugasKebersihanSiswa,
      item.tugasKhusus,
      item.catatan || '-'
    ]);
    exportToExcel(`JADWAL_PIKET_${settings.namaSekolah}`, headers, rows);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handleExportWord = () => {
    const content = `
      <div class="kop">
        <h3>${settings.namaInstansi}</h3>
        <h2>${settings.namaSekolah}</h2>
        <p>${settings.alamatSekolah} | NPSN: ${settings.npsn}</p>
        <hr/>
        <h3>JADWAL TUGAS PIKET GURU & PETUGAS KEBERSIHAN SISWA</h3>
        <p>Tahun Pelajaran 2024/2025</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Hari</th>
            <th>Waktu</th>
            <th>Koordinator Guru</th>
            <th>Anggota Guru</th>
            <th>Area Piket</th>
            <th>Piket Siswa</th>
            <th>Tugas Utama</th>
          </tr>
        </thead>
        <tbody>
          ${filteredList
            .map(
              (p, i) => `
            <tr>
              <td align="center">${i + 1}</td>
              <td><b>${p.hari}</b></td>
              <td>${p.waktuPiket || '-'}</td>
              <td><b>${p.koordinatorGuru}</b></td>
              <td>${p.anggotaGuru.join(', ') || '-'}</td>
              <td>${p.areaPiket}</td>
              <td>${p.petugasKebersihanSiswa}</td>
              <td>${p.tugasKhusus}</td>
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
          <p>Petugas TU / Operator,</p>
          <br/><br/><br/>
          <p><b>${settings.operatorTU}</b><br/>NIP. ${settings.nipOperator}</p>
        </div>
      </div>
    `;
    exportToWord(`Jadwal_Piket_${settings.namaSekolah}`, content);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handleExportPPT = () => {
    const slides = [
      {
        title: 'Jadwal Piket Sekolah',
        subtitle: `${settings.namaSekolah}\nPedalaman Papua Pegunungan`,
        bullets: [
          'Jadwal Piket Guru Harian (Senin - Sabtu)',
          'Petugas Kebersihan Siswa Per Kelas',
          'Penegakan Disiplin 5S & Pelayanan Siswa',
          `Disusun oleh: ${settings.operatorTU}`
        ]
      },
      ...filteredList.map((item) => ({
        title: `Piket Hari ${item.hari}`,
        subtitle: `Koordinator: ${item.koordinatorGuru}`,
        bullets: [
          `Waktu: ${item.waktuPiket || '07.00 - 12.45 WIT'}`,
          `Anggota Guru: ${item.anggotaGuru.join(', ') || '-'}`,
          `Area: ${item.areaPiket}`,
          `Piket Siswa: ${item.petugasKebersihanSiswa}`,
          `Tugas: ${item.tugasKhusus}`
        ]
      }))
    ];
    exportToPPT(`Presentasi_Piket_${settings.namaSekolah}`, slides);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handlePrint = () => {
    triggerPrint();
  };

  return (
    <div id="module-jadwal-piket" className="space-y-4">
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
              <div className="w-10 h-10 rounded-lg bg-emerald-600/10 border border-emerald-500/20 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Jadwal Piket Guru & Siswa</h2>
                <p className="text-xs text-slate-500">
                  Pengelolaan Jadwal Petugas Piket Sekolah, Gerbang 5S, Kebersihan Kelas & Tata Tertib Harian
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                id="btn-print-jadwal-piket"
                onClick={() => setIsPreviewPrintOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                title="Pratinjau & Cetak Lembar Resmi Jadwal Piket"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>Cetak Jadwal Piket</span>
              </button>

              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Jadwal Piket</span>
              </button>
            </div>
          </div>

        {/* Filter and Search Bar */}
        <div className="mt-3 flex flex-col md:flex-row items-center justify-between gap-2.5">
          {/* Day Badges Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => setSelectedHari('Semua')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                selectedHari === 'Semua'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua Hari ({piketList.length})
            </button>
            {HARI_LIST.map((hari) => {
              const count = piketList.filter((p) => p.hari === hari).length;
              return (
                <button
                  key={hari}
                  type="button"
                  onClick={() => setSelectedHari(hari)}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                    selectedHari === hari
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {hari} ({count})
                </button>
              );
            })}
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari guru, hari, tugas..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Cards Grid per Hari */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredList.map((item) => (
          <div
            key={item.id}
            className={`bg-white border rounded-xl p-3.5 shadow-xs transition-shadow relative flex flex-col justify-between ${
              item.isLocked ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200 hover:border-emerald-300'
            }`}
          >
            <div>
              {/* Header Badge Hari & Action Buttons */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-black rounded-md uppercase">
                    {item.hari}
                  </span>
                  <span className="text-[10.5px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {item.waktuPiket || '07.00 - 12.45 WIT'}
                  </span>
                </div>

                <div className="flex items-center gap-1 no-print">
                  <button
                    type="button"
                    onClick={() => handleToggleLock(item)}
                    className={`p-1 rounded-md transition-colors ${
                      item.isLocked
                        ? 'text-amber-600 bg-amber-100 hover:bg-amber-200'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                    }`}
                    title={item.isLocked ? 'Terkunci (Klik untuk buka)' : 'Kunci Jadwal'}
                  >
                    {item.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    disabled={item.isLocked}
                    className="p-1 rounded-md text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors disabled:opacity-40"
                    title="Edit Jadwal"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id, item.isLocked)}
                    disabled={item.isLocked}
                    className="p-1 rounded-md text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors disabled:opacity-40"
                    title="Hapus Jadwal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Koordinator Guru */}
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Koordinator Piket
                  </span>
                  <p className="font-bold text-slate-900 flex items-center gap-1 text-[12.5px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    {item.koordinatorGuru}
                  </p>
                </div>

                {/* Anggota Guru */}
                {item.anggotaGuru.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Guru Pendamping
                    </span>
                    <p className="text-slate-700 font-medium">
                      {item.anggotaGuru.join(', ')}
                    </p>
                  </div>
                )}

                {/* Area Piket */}
                <div className="flex items-start gap-1.5 text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block">Posisi / Area Piket</span>
                    <span className="text-[11.5px] font-medium text-slate-800">{item.areaPiket}</span>
                  </div>
                </div>

                {/* Piket Siswa */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Petugas Kebersihan Siswa
                  </span>
                  <p className="text-slate-800 font-semibold bg-emerald-50/60 text-emerald-900 border border-emerald-200/60 px-2 py-1 rounded-md">
                    {item.petugasKebersihanSiswa}
                  </p>
                </div>

                {/* Tugas Pokok */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Tugas & Fokus
                  </span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {item.tugasKhusus}
                  </p>
                </div>

                {item.catatan && (
                  <p className="text-[10.5px] text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200/50 italic">
                    Catatan: {item.catatan}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
              <span>{item.isLocked ? 'Status: Terkunci' : 'Status: Aktif'}</span>
              <span className="text-emerald-700 font-medium">Standar Disiplin SD</span>
            </div>
          </div>
        ))}
      </div>

      {filteredList.length === 0 && (
        <div className="text-center py-10 bg-white border border-slate-200 rounded-xl">
          <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-600">Belum ada jadwal piket untuk kriteria ini</p>
          <p className="text-xs text-slate-400 mt-0.5">Silakan klik tombol "Tambah Jadwal Piket" untuk menambahkan</p>
        </div>
      )}

      </div>
      {/* End of no-print interactive container */}

      {/* Printable Sheet View - Dedicated Print Output */}
      <div id="print-jadwal-piket-sheet" className="hidden print:block bg-white p-6 text-black print-only">
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
          <h3 className="text-sm font-black uppercase underline">JADWAL RESMI PIKET GURU & PETUGAS KEBERSIHAN SISWA</h3>
          <p className="text-[10.5px]">Tahun Ajaran 2024/2025 • Semester Berjalan</p>
        </div>

        <table className="w-full text-[11px] border-collapse border border-black mb-6">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-black p-1.5 text-center w-8">No</th>
              <th className="border border-black p-1.5 text-center w-16">Hari</th>
              <th className="border border-black p-1.5 text-center w-24">Waktu</th>
              <th className="border border-black p-1.5 text-left">Koordinator Guru</th>
              <th className="border border-black p-1.5 text-left">Guru Pendamping</th>
              <th className="border border-black p-1.5 text-left">Area Piket</th>
              <th className="border border-black p-1.5 text-left">Regu Siswa</th>
              <th className="border border-black p-1.5 text-left">Tugas Khusus</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((item, idx) => (
              <tr key={item.id}>
                <td className="border border-black p-1.5 text-center">{idx + 1}</td>
                <td className="border border-black p-1.5 font-bold text-center">{item.hari}</td>
                <td className="border border-black p-1.5 text-center">{item.waktuPiket || '-'}</td>
                <td className="border border-black p-1.5 font-semibold">{item.koordinatorGuru}</td>
                <td className="border border-black p-1.5">{item.anggotaGuru.join(', ') || '-'}</td>
                <td className="border border-black p-1.5">{item.areaPiket}</td>
                <td className="border border-black p-1.5">{item.petugasKebersihanSiswa}</td>
                <td className="border border-black p-1.5">{item.tugasKhusus}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Official Signatures */}
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
            <p className="font-bold">Koordinator Tata Usaha & Piket</p>
            <div className="h-16"></div>
            <p className="font-bold underline">{settings.operatorTU}</p>
            <p>NIP. {settings.nipOperator || '-'}</p>
          </div>
        </div>
      </div>

      {/* Modal Pratinjau Cetak Jadwal Piket */}
      {isPreviewPrintOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 no-print animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="p-3.5 bg-slate-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm">Pratinjau Lembar Cetak Jadwal Piket Resmi</h3>
                  <p className="text-[10px] text-slate-300">Format Resmi A4/F4 Siap Cetak ke Printer Fisik atau Simpan PDF</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="btn-confirm-print-piket"
                  onClick={() => {
                    triggerPrint();
                    notifyMessage('Perintah Cetak Dikirim ke Printer');
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Sekarang (Print)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreviewPrintOpen(false)}
                  className="text-white/80 hover:text-white p-1 rounded-md text-sm"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Document Sheet Preview Body */}
            <div className="p-6 overflow-y-auto bg-slate-100 flex justify-center">
              <div className="bg-white p-6 shadow-md border border-slate-300 max-w-3xl w-full text-black rounded-lg">
                <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                    {settings.logoKiri && settings.logoKiri.trim() ? (
                      <img src={settings.logoKiri} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    ) : (
                      <School className="w-8 h-8 text-slate-700" />
                    )}
                  </div>
                  <div className="text-center flex-1 px-2">
                    <h2 className="text-xs font-bold uppercase tracking-wider">{settings.namaInstansi}</h2>
                    <h1 className="text-sm sm:text-base font-black uppercase">{settings.namaSekolah}</h1>
                    <p className="text-[10px]">{settings.alamatSekolah} • NPSN: {settings.npsn}</p>
                    <p className="text-[9px] italic text-slate-600">Baalil, Distrik Oksibil, Kabupaten Pegunungan Bintang, Papua Pegunungan</p>
                  </div>
                  <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                    {settings.logoKanan && settings.logoKanan.trim() ? (
                      <img src={settings.logoKanan} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    ) : (
                      <Sparkles className="w-8 h-8 text-slate-700" />
                    )}
                  </div>
                </div>

                <div className="text-center mb-3">
                  <h3 className="text-xs sm:text-sm font-black uppercase underline">JADWAL RESMI PIKET GURU & PETUGAS KEBERSIHAN SISWA</h3>
                  <p className="text-[10px] text-slate-600">Tahun Ajaran 2024/2025 • Semester Berjalan</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-[10.5px] border-collapse border border-black mb-5">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border border-black p-1 text-center w-7">No</th>
                        <th className="border border-black p-1 text-center w-14">Hari</th>
                        <th className="border border-black p-1 text-center w-20">Waktu</th>
                        <th className="border border-black p-1 text-left">Koordinator</th>
                        <th className="border border-black p-1 text-left">Pendamping</th>
                        <th className="border border-black p-1 text-left">Area</th>
                        <th className="border border-black p-1 text-left">Regu Siswa</th>
                        <th className="border border-black p-1 text-left">Tugas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredList.map((item, idx) => (
                        <tr key={item.id}>
                          <td className="border border-black p-1 text-center">{idx + 1}</td>
                          <td className="border border-black p-1 font-bold text-center">{item.hari}</td>
                          <td className="border border-black p-1 text-center">{item.waktuPiket || '-'}</td>
                          <td className="border border-black p-1 font-semibold">{item.koordinatorGuru}</td>
                          <td className="border border-black p-1">{item.anggotaGuru.join(', ') || '-'}</td>
                          <td className="border border-black p-1">{item.areaPiket}</td>
                          <td className="border border-black p-1">{item.petugasKebersihanSiswa}</td>
                          <td className="border border-black p-1">{item.tugasKhusus}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-start pt-3 text-[11px]">
                  <div className="text-center w-52">
                    <p>Mengetahui,</p>
                    <p className="font-bold">Kepala Sekolah</p>
                    <div className="h-12"></div>
                    <p className="font-bold underline">{settings.namaKepsek}</p>
                    <p className="text-[10px]">NIP. {settings.nipKepsek || '-'}</p>
                  </div>
                  <div className="text-center w-52">
                    <p>Dekai, {new Date().toLocaleDateString('id-ID')}</p>
                    <p className="font-bold">Koordinator Piket & TU</p>
                    <div className="h-12"></div>
                    <p className="font-bold underline">{settings.operatorTU}</p>
                    <p className="text-[10px]">NIP. {settings.nipOperator || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500">Ukuran Kertas: <strong>{paperSize.toUpperCase()}</strong> • Siap Dicetak</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPreviewPrintOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg font-semibold cursor-pointer"
                >
                  Tutup Pratinjau
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerPrint();
                    notifyMessage('Perintah Cetak Dikirim ke Printer');
                  }}
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Sekarang (Print)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog Form Tambah/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="p-4 bg-gradient-to-r from-emerald-750 to-emerald-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-200" />
                <h3 className="font-bold text-sm">
                  {editingItem ? 'Edit Jadwal Piket' : 'Tambah Jadwal Piket Baru'}
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hari Piket</label>
                  <select
                    value={formHari}
                    onChange={(e) => setFormHari(e.target.value as HariSekolah)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-emerald-500"
                  >
                    {HARI_LIST.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Waktu Piket</label>
                  <input
                    type="text"
                    value={formWaktuPiket}
                    onChange={(e) => setFormWaktuPiket(e.target.value)}
                    placeholder="Contoh: 07.00 - 12.45 WIT"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Koordinator Guru Piket</label>
                <input
                  type="text"
                  list="teacher-list"
                  value={formKoordinator}
                  onChange={(e) => setFormKoordinator(e.target.value)}
                  placeholder="Ketik atau pilih nama guru koordinator..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-emerald-500 font-semibold"
                  required
                />
                <datalist id="teacher-list">
                  {teachers.map((t) => (
                    <option key={t.id} value={t.nama} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Guru Pendamping (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={formAnggota}
                  onChange={(e) => setFormAnggota(e.target.value)}
                  placeholder="Contoh: Dorkas Sambom, S.Pd., Maria Silak, S.Pd."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Posisi / Area Piket</label>
                  <input
                    type="text"
                    value={formAreaPiket}
                    onChange={(e) => setFormAreaPiket(e.target.value)}
                    placeholder="Contoh: Gerbang Utama & Halaman"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Petugas Siswa / Kelas</label>
                  <input
                    type="text"
                    value={formPetugasSiswa}
                    onChange={(e) => setFormPetugasSiswa(e.target.value)}
                    placeholder="Contoh: Regu Piket Kelas IV (Yance dkk)"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tugas Pokok & Khusus</label>
                <textarea
                  rows={2}
                  value={formTugasKhusus}
                  onChange={(e) => setFormTugasKhusus(e.target.value)}
                  placeholder="Contoh: Upacara bendera, penyambutan 5S di gerbang, pengawasan jam istirahat"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Tambahan (Opsional)</label>
                <input
                  type="text"
                  value={formCatatan}
                  onChange={(e) => setFormCatatan(e.target.value)}
                  placeholder="Contoh: Stok P3K di UKS diperiksa"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-emerald-500"
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
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  Simpan Jadwal Piket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
