import React, { useState, useMemo } from 'react';
import {
  KurikulumDocument,
  KurikulumJenis,
  MataPelajaran,
  KelompokMapel,
  Teacher,
  PaperSize,
  SchoolSettings
} from '../../types';
import { ActionToolbar } from '../ActionToolbar';
import { exportToExcel, exportToWord, exportToPPT, triggerPrint, safeConfirm } from '../../utils/exportHelpers';
import {
  BookMarked,
  BookOpen,
  Award,
  Plus,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  Eye,
  Clock,
  Search,
  Sparkles,
  GraduationCap,
  Users
} from 'lucide-react';

interface KurikulumModuleProps {
  documents: KurikulumDocument[];
  teachers: Teacher[];
  onSaveDocument: (doc: KurikulumDocument) => void;
  onDeleteDocument: (id: string) => void;
  mataPelajaranList?: MataPelajaran[];
  onSaveMapel?: (mapel: MataPelajaran) => void;
  onDeleteMapel?: (id: string) => void;
  onHome: () => void;
  settings: SchoolSettings;
  notifyMessage: (msg?: string) => void;
  onSync: () => void;
}

const JENIS_LIST: KurikulumJenis[] = [
  'Struktur Kurikulum',
  'Capaian Pembelajaran (CP)',
  'Tujuan Pembelajaran (TP)',
  'Modul Ajar',
  'Alur Tujuan Pembelajaran (ATP)',
  'Program Tahunan (Prota)',
  'Program Semester (Prosem)',
  'Kalender Pendidikan',
  'Modul Projek P5'
];

const FASE_LIST = [
  'Semua Fase',
  'Fase Fondasi (PAUD)',
  'Fase A (Kelas 1-2)',
  'Fase B (Kelas 3-4)',
  'Fase C (Kelas 5-6)'
];

const KELOMPOK_MAPEL_LIST: KelompokMapel[] = [
  'Kelompok A (Wajib/Umum)',
  'Kelompok B (Seni & Olahraga)',
  'Muatan Lokal',
  'Projek Penguatan Profil Pelajar Pancasila (P5)',
  'Pilihan / Pendukung'
];

export const KurikulumModule: React.FC<KurikulumModuleProps> = ({
  documents,
  teachers,
  onSaveDocument,
  onDeleteDocument,
  mataPelajaranList = [],
  onSaveMapel,
  onDeleteMapel,
  onHome,
  settings,
  notifyMessage,
  onSync
}) => {
  // Main Sub-Module Switcher: 'mapel' (Data Mata Pelajaran) | 'perangkat' (Dokumen & Perangkat Ajar)
  const [activeSection, setActiveSection] = useState<'mapel' | 'perangkat'>('mapel');

  // Filter States for Dokumen
  const [activeDocTab, setActiveDocTab] = useState<string>('Semua');
  const [selectedDocFase, setSelectedDocFase] = useState<string>('Semua');
  const [docSearchQuery, setDocSearchQuery] = useState('');

  // Filter States for Mata Pelajaran
  const [selectedKelompok, setSelectedKelompok] = useState<string>('Semua');
  const [selectedMapelFase, setSelectedMapelFase] = useState<string>('Semua');
  const [selectedMapelStatus, setSelectedMapelStatus] = useState<string>('Semua');
  const [mapelSearchQuery, setMapelSearchQuery] = useState('');

  // Print paper size
  const [paperSize, setPaperSize] = useState<PaperSize>(settings.ukuranKertas);

  // Modal State for Dokumen
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<KurikulumDocument | null>(null);
  const [viewDetailDoc, setViewDetailDoc] = useState<KurikulumDocument | null>(null);

  // Form Fields for Dokumen
  const [formJudul, setFormJudul] = useState('');
  const [formJenis, setFormJenis] = useState<KurikulumJenis>('Modul Ajar');
  const [formFase, setFormFase] = useState<any>('Fase B (Kelas 3-4)');
  const [formMapel, setFormMapel] = useState('Bahasa Indonesia');
  const [formKelas, setFormKelas] = useState('Kelas IV');
  const [formSemester, setFormSemester] = useState<'Ganjil' | 'Genap' | '1 Tahun Penuh'>('1 Tahun Penuh');
  const [formTahunAjaran, setFormTahunAjaran] = useState('2024/2025');
  const [formPenyusun, setFormPenyusun] = useState('Selpius Nabyal, S.Pd.Gr.');
  const [formStatus, setFormStatus] = useState<'Draft' | 'Divalidasi' | 'Ditetapkan Kepala Sekolah'>(
    'Ditetapkan Kepala Sekolah'
  );
  const [formRingkasan, setFormRingkasan] = useState('');
  const [formAlokasiWaktu, setFormAlokasiWaktu] = useState('144 JP / Tahun');

  // Modal State for Mata Pelajaran
  const [isMapelModalOpen, setIsMapelModalOpen] = useState(false);
  const [editingMapel, setEditingMapel] = useState<MataPelajaran | null>(null);
  const [viewDetailMapel, setViewDetailMapel] = useState<MataPelajaran | null>(null);

  // Form Fields for Mata Pelajaran
  const [formMapelKode, setFormMapelKode] = useState('');
  const [formMapelNama, setFormMapelNama] = useState('');
  const [formMapelKelompok, setFormMapelKelompok] = useState<KelompokMapel>('Kelompok A (Wajib/Umum)');
  const [formMapelFase, setFormMapelFase] = useState<any>('Semua Fase');
  const [formMapelKelasTarget, setFormMapelKelasTarget] = useState('Kelas I - VI');
  const [formMapelJpMinggu, setFormMapelJpMinggu] = useState<number>(4);
  const [formMapelJpTahun, setFormMapelJpTahun] = useState<number>(144);
  const [formMapelKktp, setFormMapelKktp] = useState<number>(75);
  const [formMapelGuru, setFormMapelGuru] = useState('');
  const [formMapelKurikulum, setFormMapelKurikulum] = useState<'Kurikulum Merdeka' | 'Kurikulum 2013' | 'Kombinasi'>('Kurikulum Merdeka');
  const [formMapelStatus, setFormMapelStatus] = useState<'Aktif' | 'Non-Aktif'>('Aktif');
  const [formMapelRuangLingkup, setFormMapelRuangLingkup] = useState('');

  // Auto calculate JP per tahun when JP per minggu changes (36 minggu efektif standar kalender)
  const handleJpMingguChange = (val: number) => {
    setFormMapelJpMinggu(val);
    setFormMapelJpTahun(val * 36);
  };

  // Filtered Dokumen
  const filteredDocList = useMemo(() => {
    return documents.filter((doc) => {
      const matchJenis = activeDocTab === 'Semua' || doc.jenis === activeDocTab;
      const matchFase = selectedDocFase === 'Semua' || doc.fase === selectedDocFase;
      const matchSearch =
        doc.judul.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
        doc.mataPelajaran.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
        doc.penyusun.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
        doc.ringkasan.toLowerCase().includes(docSearchQuery.toLowerCase());
      return matchJenis && matchFase && matchSearch;
    });
  }, [documents, activeDocTab, selectedDocFase, docSearchQuery]);

  // Filtered Mata Pelajaran
  const filteredMapelList = useMemo(() => {
    return mataPelajaranList.filter((m) => {
      const matchKelompok = selectedKelompok === 'Semua' || m.kelompok === selectedKelompok;
      const matchFase = selectedMapelFase === 'Semua' || m.fase === selectedMapelFase;
      const matchStatus = selectedMapelStatus === 'Semua' || m.status === selectedMapelStatus;
      const matchSearch =
        m.nama.toLowerCase().includes(mapelSearchQuery.toLowerCase()) ||
        m.kode.toLowerCase().includes(mapelSearchQuery.toLowerCase()) ||
        m.guruPengampu.toLowerCase().includes(mapelSearchQuery.toLowerCase()) ||
        m.ruangLingkup.toLowerCase().includes(mapelSearchQuery.toLowerCase());
      return matchKelompok && matchFase && matchStatus && matchSearch;
    });
  }, [mataPelajaranList, selectedKelompok, selectedMapelFase, selectedMapelStatus, mapelSearchQuery]);

  // Summary Metrics for Mata Pelajaran
  const mapelMetrics = useMemo(() => {
    const totalMapel = mataPelajaranList.length;
    const totalJpMinggu = mataPelajaranList.reduce((acc, curr) => acc + (Number(curr.alokasiJpPerMinggu) || 0), 0);
    const totalJpTahun = mataPelajaranList.reduce((acc, curr) => acc + (Number(curr.alokasiJpPerTahun) || 0), 0);
    const wajibCount = mataPelajaranList.filter((m) => m.kelompok === 'Kelompok A (Wajib/Umum)').length;
    const mulokP5Count = mataPelajaranList.filter(
      (m) => m.kelompok === 'Muatan Lokal' || m.kelompok === 'Projek Penguatan Profil Pelajar Pancasila (P5)'
    ).length;
    const avgKktp =
      totalMapel > 0
        ? Math.round((mataPelajaranList.reduce((acc, curr) => acc + (Number(curr.kktp) || 0), 0) / totalMapel) * 10) / 10
        : 0;

    return { totalMapel, totalJpMinggu, totalJpTahun, wajibCount, mulokP5Count, avgKktp };
  }, [mataPelajaranList]);

  // --- Handlers for Dokumen Kurikulum ---
  const handleOpenAddDoc = () => {
    setEditingDoc(null);
    setFormJudul('');
    setFormJenis(activeDocTab === 'Semua' ? 'Modul Ajar' : (activeDocTab as KurikulumJenis));
    setFormFase('Fase B (Kelas 3-4)');
    setFormMapel(mataPelajaranList[0]?.nama || 'Bahasa Indonesia');
    setFormKelas('Kelas IV');
    setFormSemester('1 Tahun Penuh');
    setFormTahunAjaran('2024/2025');
    setFormPenyusun(teachers[0]?.nama || 'Selpius Nabyal, S.Pd.Gr.');
    setFormStatus('Divalidasi');
    setFormRingkasan('');
    setFormAlokasiWaktu('144 JP / Tahun');
    setIsDocModalOpen(true);
  };

  const handleOpenEditDoc = (doc: KurikulumDocument) => {
    if (doc.isLocked) {
      notifyMessage('Dokumen kurikulum ini terkunci');
      return;
    }
    setEditingDoc(doc);
    setFormJudul(doc.judul);
    setFormJenis(doc.jenis);
    setFormFase(doc.fase);
    setFormMapel(doc.mataPelajaran);
    setFormKelas(doc.kelas);
    setFormSemester(doc.semester);
    setFormTahunAjaran(doc.tahunAjaran);
    setFormPenyusun(doc.penyusun);
    setFormStatus(doc.status);
    setFormRingkasan(doc.ringkasan);
    setFormAlokasiWaktu(doc.alokasiWaktu || '');
    setIsDocModalOpen(true);
  };

  const handleSubmitDocForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formJudul.trim() || !formRingkasan.trim()) {
      notifyMessage('Judul dan ringkasan kurikulum wajib diisi');
      return;
    }

    const savedDoc: KurikulumDocument = {
      id: editingDoc ? editingDoc.id : `kkl-${Date.now()}`,
      judul: formJudul.trim(),
      jenis: formJenis,
      fase: formFase,
      mataPelajaran: formMapel.trim(),
      kelas: formKelas.trim(),
      semester: formSemester,
      tahunAjaran: formTahunAjaran.trim(),
      penyusun: formPenyusun.trim(),
      status: formStatus,
      ringkasan: formRingkasan.trim(),
      alokasiWaktu: formAlokasiWaktu.trim(),
      isLocked: editingDoc?.isLocked || false
    };

    onSaveDocument(savedDoc);
    setIsDocModalOpen(false);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handleDeleteDoc = (id: string, isLocked?: boolean) => {
    if (isLocked) {
      notifyMessage('Dokumen terkunci, tidak dapat dihapus');
      return;
    }
    if (safeConfirm('Hapus dokumen kurikulum ini?')) {
      onDeleteDocument(id);
      notifyMessage('Dokumen kurikulum berhasil dihapus');
    }
  };

  const handleToggleDocLock = (doc: KurikulumDocument) => {
    const updated: KurikulumDocument = {
      ...doc,
      isLocked: !doc.isLocked
    };
    onSaveDocument(updated);
    notifyMessage(doc.isLocked ? 'Kunci dokumen dibuka' : 'Dokumen kurikulum dikunci');
  };

  // --- Handlers for Mata Pelajaran ---
  const handleOpenAddMapel = () => {
    setEditingMapel(null);
    setFormMapelKode(`MAPEL-${mataPelajaranList.length + 1}`);
    setFormMapelNama('');
    setFormMapelKelompok('Kelompok A (Wajib/Umum)');
    setFormMapelFase('Semua Fase');
    setFormMapelKelasTarget('Kelas I - VI');
    setFormMapelJpMinggu(4);
    setFormMapelJpTahun(144);
    setFormMapelKktp(75);
    setFormMapelGuru(teachers[0]?.nama || 'Selpius Nabyal, S.Pd.Gr.');
    setFormMapelKurikulum('Kurikulum Merdeka');
    setFormMapelStatus('Aktif');
    setFormMapelRuangLingkup('');
    setIsMapelModalOpen(true);
  };

  const handleOpenEditMapel = (mapel: MataPelajaran) => {
    if (mapel.isLocked) {
      notifyMessage('Data mata pelajaran ini terkunci');
      return;
    }
    setEditingMapel(mapel);
    setFormMapelKode(mapel.kode);
    setFormMapelNama(mapel.nama);
    setFormMapelKelompok(mapel.kelompok);
    setFormMapelFase(mapel.fase);
    setFormMapelKelasTarget(mapel.kelasTarget);
    setFormMapelJpMinggu(mapel.alokasiJpPerMinggu);
    setFormMapelJpTahun(mapel.alokasiJpPerTahun);
    setFormMapelKktp(mapel.kktp);
    setFormMapelGuru(mapel.guruPengampu);
    setFormMapelKurikulum(mapel.kurikulum);
    setFormMapelStatus(mapel.status);
    setFormMapelRuangLingkup(mapel.ruangLingkup);
    setIsMapelModalOpen(true);
  };

  const handleSubmitMapelForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMapelKode.trim() || !formMapelNama.trim()) {
      notifyMessage('Kode dan Nama Mata Pelajaran wajib diisi');
      return;
    }

    const savedMapel: MataPelajaran = {
      id: editingMapel ? editingMapel.id : `mpl-${Date.now()}`,
      kode: formMapelKode.trim().toUpperCase(),
      nama: formMapelNama.trim(),
      kelompok: formMapelKelompok,
      fase: formMapelFase,
      kelasTarget: formMapelKelasTarget.trim() || 'Kelas I - VI',
      alokasiJpPerMinggu: Number(formMapelJpMinggu) || 0,
      alokasiJpPerTahun: Number(formMapelJpTahun) || (Number(formMapelJpMinggu) || 0) * 36,
      kktp: Number(formMapelKktp) || 75,
      guruPengampu: formMapelGuru.trim() || teachers[0]?.nama || 'Selpius Nabyal, S.Pd.Gr.',
      ruangLingkup: formMapelRuangLingkup.trim() || 'Elemen Capaian Pembelajaran & Ruang Lingkup Materi SD',
      kurikulum: formMapelKurikulum,
      status: formMapelStatus,
      isLocked: editingMapel?.isLocked || false
    };

    if (onSaveMapel) {
      onSaveMapel(savedMapel);
    }
    setIsMapelModalOpen(false);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handleDeleteMapel = (id: string, isLocked?: boolean) => {
    if (isLocked) {
      notifyMessage('Mata pelajaran terkunci, tidak dapat dihapus');
      return;
    }
    if (safeConfirm('Apakah Anda yakin ingin menghapus data mata pelajaran ini?')) {
      if (onDeleteMapel) {
        onDeleteMapel(id);
      }
      notifyMessage('Data Mata Pelajaran berhasil dihapus');
    }
  };

  const handleToggleMapelLock = (mapel: MataPelajaran) => {
    if (onSaveMapel) {
      onSaveMapel({
        ...mapel,
        isLocked: !mapel.isLocked
      });
      notifyMessage(mapel.isLocked ? 'Kunci mata pelajaran dibuka' : 'Mata pelajaran berhasil dikunci');
    }
  };

  // --- Export & Print Handlers ---
  const handlePrintAction = () => {
    triggerPrint();
  };

  const handleExportExcel = () => {
    if (activeSection === 'mapel') {
      const headers = [
        'No',
        'Kode Mapel',
        'Nama Mata Pelajaran',
        'Kelompok Mapel',
        'Fase & Kelas Sasaran',
        'JP / Minggu',
        'JP / Tahun',
        'KKTP (Nilai KKM)',
        'Guru Pengampu',
        'Kurikulum',
        'Status',
        'Ruang Lingkup Materi Pokok'
      ];
      const rows = filteredMapelList.map((m, idx) => [
        idx + 1,
        m.kode,
        m.nama,
        m.kelompok,
        `${m.fase} (${m.kelasTarget})`,
        m.alokasiJpPerMinggu,
        m.alokasiJpPerTahun,
        m.kktp,
        m.guruPengampu,
        m.kurikulum,
        m.status,
        m.ruangLingkup
      ]);
      exportToExcel(`DATA_MATA_PELAJARAN_${settings.namaSekolah.replace(/\s+/g, '_')}`, headers, rows);
    } else {
      const headers = [
        'No',
        'Judul Dokumen Kurikulum',
        'Jenis Perangkat',
        'Fase & Kelas',
        'Mata Pelajaran',
        'Semester',
        'Tahun Ajaran',
        'Alokasi Waktu',
        'Penyusun',
        'Status Dokumen',
        'Ringkasan Deskripsi'
      ];
      const rows = filteredDocList.map((d, idx) => [
        idx + 1,
        d.judul,
        d.jenis,
        `${d.fase} - ${d.kelas}`,
        d.mataPelajaran,
        d.semester,
        d.tahunAjaran,
        d.alokasiWaktu || '-',
        d.penyusun,
        d.status,
        d.ringkasan
      ]);
      exportToExcel(`KURIKULUM_MERDEKA_${settings.namaSekolah.replace(/\s+/g, '_')}`, headers, rows);
    }
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handleExportWord = () => {
    if (activeSection === 'mapel') {
      const content = `
        <div class="kop" style="text-align: center; border-bottom: 2px solid black; padding-bottom: 10px; margin-bottom: 20px;">
          <h3>${settings.namaInstansi}</h3>
          <h2>${settings.namaSekolah}</h2>
          <p>${settings.alamatSekolah} | NPSN: ${settings.npsn}</p>
          <hr/>
          <h3>STRUKTUR KURIKULUM & DAFTAR MATA PELAJARAN</h3>
          <p>Standar Kurikulum Merdeka Kemendikbudristek • Tahun Pelajaran 2024/2025</p>
        </div>
        <table border="1" cellpadding="6" cellspacing="0" style="width:100%; border-collapse: collapse; font-size: 11px;">
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th>No</th>
              <th>Kode</th>
              <th>Mata Pelajaran</th>
              <th>Kelompok</th>
              <th>Fase / Kelas</th>
              <th>JP/Mgg</th>
              <th>JP/Thn</th>
              <th>KKTP</th>
              <th>Guru Pengampu</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${filteredMapelList
              .map(
                (m, i) => `
              <tr>
                <td align="center">${i + 1}</td>
                <td align="center"><b>${m.kode}</b></td>
                <td><b>${m.nama}</b><br/><small>${m.ruangLingkup}</small></td>
                <td>${m.kelompok}</td>
                <td>${m.fase}<br/>${m.kelasTarget}</td>
                <td align="center">${m.alokasiJpPerMinggu} JP</td>
                <td align="center">${m.alokasiJpPerTahun} JP</td>
                <td align="center"><b>${m.kktp}</b></td>
                <td>${m.guruPengampu}</td>
                <td align="center">${m.status}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
        <div style="margin-top: 30px; display: flex; justify-content: space-between;">
          <div style="text-align: center; width: 250px;">
            <p>Mengesahkan,</p>
            <p><b>Kepala Sekolah</b></p>
            <br/><br/><br/>
            <p><b><u>${settings.namaKepsek}</u></b><br/>NIP. ${settings.nipKepsek}</p>
          </div>
          <div style="text-align: center; width: 250px;">
            <p>Dekai, ${new Date().toLocaleDateString('id-ID')}</p>
            <p><b>Koordinator Kurikulum</b></p>
            <br/><br/><br/>
            <p><b><u>${settings.operatorTU}</u></b><br/>NIP. ${settings.nipOperator}</p>
          </div>
        </div>
      `;
      exportToWord(`Data_Mata_Pelajaran_${settings.namaSekolah.replace(/\s+/g, '_')}`, content);
    } else {
      const content = `
        <div class="kop" style="text-align: center; border-bottom: 2px solid black; padding-bottom: 10px; margin-bottom: 20px;">
          <h3>${settings.namaInstansi}</h3>
          <h2>${settings.namaSekolah}</h2>
          <p>${settings.alamatSekolah} | NPSN: ${settings.npsn}</p>
          <hr/>
          <h3>ARSIP PERANGKAT KURIKULUM OPERASIONAL SATUAN PENDIDIKAN (KOSP)</h3>
          <p>Standar Kurikulum Merdeka Kemendikbudristek • Tahun Pelajaran 2024/2025</p>
        </div>
        <table border="1" cellpadding="6" cellspacing="0" style="width:100%; border-collapse: collapse; font-size: 11px;">
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th>No</th>
              <th>Dokumen Kurikulum</th>
              <th>Jenis Perangkat</th>
              <th>Fase / Kelas</th>
              <th>Mata Pelajaran</th>
              <th>Alokasi Waktu</th>
              <th>Penyusun</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${filteredDocList
              .map(
                (d, i) => `
              <tr>
                <td align="center">${i + 1}</td>
                <td><b>${d.judul}</b><br/><small>${d.ringkasan}</small></td>
                <td>${d.jenis}</td>
                <td>${d.fase}<br/>${d.kelas}</td>
                <td>${d.mataPelajaran}</td>
                <td>${d.alokasiWaktu || '-'}</td>
                <td>${d.penyusun}</td>
                <td><b>${d.status}</b></td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
        <div style="margin-top: 30px; display: flex; justify-content: space-between;">
          <div style="text-align: center; width: 250px;">
            <p>Mengesahkan,</p>
            <p><b>Kepala Sekolah</b></p>
            <br/><br/><br/>
            <p><b><u>${settings.namaKepsek}</u></b><br/>NIP. ${settings.nipKepsek}</p>
          </div>
          <div style="text-align: center; width: 250px;">
            <p>Dekai, ${new Date().toLocaleDateString('id-ID')}</p>
            <p><b>Tim Pengembang Kurikulum</b></p>
            <br/><br/><br/>
            <p><b><u>${settings.operatorTU}</u></b><br/>NIP. ${settings.nipOperator}</p>
          </div>
        </div>
      `;
      exportToWord(`Kurikulum_Merdeka_${settings.namaSekolah.replace(/\s+/g, '_')}`, content);
    }
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handleExportPPT = () => {
    if (activeSection === 'mapel') {
      const slides = [
        {
          title: 'Struktur Mata Pelajaran & Kurikulum Merdeka',
          subtitle: `${settings.namaSekolah}\nBaalil, Kabupaten Pegunungan Bintang`,
          bullets: [
            `Total Mata Pelajaran: ${mataPelajaranList.length} Mapel Aktif`,
            `Total Beban Belajar: ${mapelMetrics.totalJpMinggu} JP / Minggu (${mapelMetrics.totalJpTahun} JP / Tahun)`,
            'Struktur Intrakurikuler & Kokurikuler P5 Berbasis Kearifan Lokal Papua',
            `Koordinator: ${settings.operatorTU}`
          ]
        },
        ...filteredMapelList.map((m) => ({
          title: `${m.kode}: ${m.nama}`,
          subtitle: `${m.kelompok} • ${m.fase}`,
          bullets: [
            `Kelas Sasaran: ${m.kelasTarget}`,
            `Alokasi Beban: ${m.alokasiJpPerMinggu} JP/Minggu (${m.alokasiJpPerTahun} JP/Tahun)`,
            `Kriteria Ketercapaian (KKTP): ${m.kktp}`,
            `Guru Pengampu: ${m.guruPengampu}`,
            `Materi Inti: ${m.ruangLingkup}`
          ]
        }))
      ];
      exportToPPT(`Struktur_Mata_Pelajaran_${settings.namaSekolah.replace(/\s+/g, '_')}`, slides);
    } else {
      const slides = [
        {
          title: 'Kurikulum Operasional Satuan Pendidikan (KOSP)',
          subtitle: `${settings.namaSekolah}\nKurikulum Merdeka SD Pedalaman Papua`,
          bullets: [
            'Capaian Pembelajaran (CP) & Alur Tujuan Pembelajaran (ATP)',
            'Modul Ajar Berbasis Kontekstual & Benda Konkret',
            'Projek Penguatan Profil Pelajar Pancasila (P5) Kearifan Lokal Noken',
            `Disusun oleh: ${settings.operatorTU}`
          ]
        },
        ...filteredDocList.map((doc) => ({
          title: doc.judul,
          subtitle: `${doc.jenis} • ${doc.fase}`,
          bullets: [
            `Mata Pelajaran: ${doc.mataPelajaran}`,
            `Kelas/Semester: ${doc.kelas} (${doc.semester})`,
            `Alokasi Waktu: ${doc.alokasiWaktu || '-'}`,
            `Penyusun: ${doc.penyusun}`,
            `Status: ${doc.status}`
          ]
        }))
      ];
      exportToPPT(`Presentasi_Kurikulum_${settings.namaSekolah.replace(/\s+/g, '_')}`, slides);
    }
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  return (
    <div id="module-kurikulum" className="space-y-4">
      {/* Action Toolbar */}
      <ActionToolbar
        onHome={onHome}
        onSave={() => {
          if (activeSection === 'mapel') {
            handleOpenAddMapel();
          } else {
            handleOpenAddDoc();
          }
        }}
        onDelete={() => {
          notifyMessage('Pilih tombol hapus pada baris data yang ingin dihapus');
        }}
        onPrint={handlePrintAction}
        onExcel={handleExportExcel}
        onWord={handleExportWord}
        onPpt={handleExportPPT}
        paperSize={paperSize}
        onChangePaperSize={setPaperSize}
        onSync={onSync}
        notifyMessage={notifyMessage}
      />

      {/* Main Header & Sub-Navigation Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-700 flex items-center justify-center flex-shrink-0">
              {activeSection === 'mapel' ? <BookOpen className="w-5 h-5" /> : <BookMarked className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-800">
                  {activeSection === 'mapel' ? 'Data Mata Pelajaran & Beban Belajar' : 'Perangkat Kurikulum & Modul Ajar'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                  Kurikulum Merdeka SD
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {activeSection === 'mapel'
                  ? 'Pengaturan master mata pelajaran, alokasi JP mingguan, standar KKTP, dan guru pengampu'
                  : 'Arsip Struktur Kurikulum (KOSP), Capaian Pembelajaran (CP), Alur ATP, Modul Ajar & Kaldik'}
              </p>
            </div>
          </div>

          {/* Sub-Module Switcher Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveSection('mapel')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                activeSection === 'mapel'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Data Mata Pelajaran</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeSection === 'mapel' ? 'bg-indigo-100 text-indigo-700 font-extrabold' : 'bg-slate-200 text-slate-600'
              }`}>
                {mataPelajaranList.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('perangkat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                activeSection === 'perangkat'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookMarked className="w-3.5 h-3.5" />
              <span>Perangkat Ajar & CP</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeSection === 'perangkat' ? 'bg-indigo-100 text-indigo-700 font-extrabold' : 'bg-slate-200 text-slate-600'
              }`}>
                {documents.length}
              </span>
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* SECTION 1: DATA MATA PELAJARAN (MAPEL)                       */}
        {/* ------------------------------------------------------------- */}
        {activeSection === 'mapel' && (
          <div className="mt-3.5 space-y-3.5">
            {/* KPI Bento Cards for Mata Pelajaran */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-lg p-2.5">
                <span className="text-[10.5px] font-bold text-indigo-900 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  Total Mapel
                </span>
                <p className="text-xl font-black text-indigo-950 mt-0.5">{mapelMetrics.totalMapel} Mapel</p>
                <span className="text-[10px] text-indigo-700">Kurikulum Merdeka</span>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-lg p-2.5">
                <span className="text-[10.5px] font-bold text-emerald-900 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  Beban Belajar
                </span>
                <p className="text-xl font-black text-emerald-950 mt-0.5">{mapelMetrics.totalJpMinggu} JP/Mgg</p>
                <span className="text-[10px] text-emerald-700">~{mapelMetrics.totalJpTahun} JP / Tahun</span>
              </div>

              <div className="bg-blue-50/70 border border-blue-200/80 rounded-lg p-2.5">
                <span className="text-[10.5px] font-bold text-blue-900 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                  Mapel Umum (A)
                </span>
                <p className="text-xl font-black text-blue-950 mt-0.5">{mapelMetrics.wajibCount} Mata Pelajaran</p>
                <span className="text-[10px] text-blue-700">Agama, Pancasila, B.Indo, Mat, IPAS</span>
              </div>

              <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-2.5">
                <span className="text-[10.5px] font-bold text-amber-900 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Mulok & P5
                </span>
                <p className="text-xl font-black text-amber-950 mt-0.5">{mapelMetrics.mulokP5Count} Muatan</p>
                <span className="text-[10px] text-amber-700">Bahasa Daerah & Noken Papua Pegunungan</span>
              </div>

              <div className="bg-purple-50/70 border border-purple-200/80 rounded-lg p-2.5 col-span-2 sm:col-span-1">
                <span className="text-[10.5px] font-bold text-purple-900 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-purple-600" />
                  Rata-rata KKTP
                </span>
                <p className="text-xl font-black text-purple-950 mt-0.5">{mapelMetrics.avgKktp}</p>
                <span className="text-[10px] text-purple-700">Standar Kelulusan SD</span>
              </div>
            </div>

            {/* Filter & Action Controls for Mata Pelajaran */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-2.5 pt-1">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                <button
                  type="button"
                  onClick={() => setSelectedKelompok('Semua')}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                    selectedKelompok === 'Semua'
                      ? 'bg-indigo-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Semua Kelompok ({mataPelajaranList.length})
                </button>
                {KELOMPOK_MAPEL_LIST.map((k) => {
                  const count = mataPelajaranList.filter((m) => m.kelompok === k).length;
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setSelectedKelompok(k)}
                      className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                        selectedKelompok === k
                          ? 'bg-indigo-700 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {k.replace('Kelompok ', 'Kel. ')} ({count})
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <div className="relative w-full md:w-56">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={mapelSearchQuery}
                    onChange={(e) => setMapelSearchQuery(e.target.value)}
                    placeholder="Cari mapel, kode, guru..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddMapel}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Mapel</span>
                </button>
              </div>
            </div>

            {/* Table of Mata Pelajaran */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/90 text-slate-700 border-b border-slate-200 font-bold">
                    <th className="py-2.5 px-3 text-center w-10">No</th>
                    <th className="py-2.5 px-3 w-28">Kode</th>
                    <th className="py-2.5 px-3">Mata Pelajaran & Ruang Lingkup</th>
                    <th className="py-2.5 px-3">Kelompok</th>
                    <th className="py-2.5 px-3 text-center">Fase / Kelas</th>
                    <th className="py-2.5 px-3 text-center">Beban JP</th>
                    <th className="py-2.5 px-3 text-center">KKTP</th>
                    <th className="py-2.5 px-3">Guru Pengampu</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMapelList.map((mapel, index) => (
                    <tr
                      key={mapel.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        mapel.isLocked ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center font-bold text-slate-500">{index + 1}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-800 text-[11px]">
                          {mapel.kode}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{mapel.nama}</span>
                          {mapel.isLocked && <Lock className="w-3 h-3 text-amber-600" />}
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 leading-snug">
                          {mapel.ruangLingkup}
                        </p>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          mapel.kelompok === 'Kelompok A (Wajib/Umum)'
                            ? 'bg-blue-100 text-blue-800'
                            : mapel.kelompok === 'Kelompok B (Seni & Olahraga)'
                            ? 'bg-emerald-100 text-emerald-800'
                            : mapel.kelompok === 'Muatan Lokal'
                            ? 'bg-amber-100 text-amber-800'
                            : mapel.kelompok === 'Projek Penguatan Profil Pelajar Pancasila (P5)'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {mapel.kelompok}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="font-semibold text-slate-700 block">{mapel.fase}</span>
                        <span className="text-[10px] text-slate-400">{mapel.kelasTarget}</span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="font-bold text-indigo-700 block">{mapel.alokasiJpPerMinggu} JP/Mgg</span>
                        <span className="text-[10px] text-slate-400">{mapel.alokasiJpPerTahun} JP/Thn</span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-md font-extrabold bg-slate-100 border border-slate-200 text-slate-800">
                          {mapel.kktp}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-slate-800 flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          {mapel.guruPengampu}
                        </span>
                        <span className="text-[10px] text-slate-400">{mapel.kurikulum}</span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          mapel.status === 'Aktif'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {mapel.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            title="Buka Detail Ruang Lingkup"
                            onClick={() => setViewDetailMapel(mapel)}
                            className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            title={mapel.isLocked ? 'Buka Kunci' : 'Kunci Data'}
                            onClick={() => handleToggleMapelLock(mapel)}
                            className="p-1 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                          >
                            {mapel.isLocked ? <Lock className="w-3.5 h-3.5 text-amber-600" /> : <Unlock className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            title="Edit Data Mapel"
                            onClick={() => handleOpenEditMapel(mapel)}
                            className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Hapus Mapel"
                            onClick={() => handleDeleteMapel(mapel.id, mapel.isLocked)}
                            className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredMapelList.length === 0 && (
                <div className="text-center py-10">
                  <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-600">Belum ada data mata pelajaran</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Klik tombol "Tambah Mapel" untuk menambahkan mata pelajaran Kurikulum Merdeka
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SECTION 2: DOKUMEN & PERANGKAT AJAR (KOSP)                    */}
        {/* ------------------------------------------------------------- */}
        {activeSection === 'perangkat' && (
          <div className="mt-3.5 space-y-3.5">
            {/* Kurikulum Merdeka Highlights Bento Box */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="bg-indigo-50/60 border border-indigo-200/70 p-3 rounded-lg flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs flex-shrink-0">
                  A
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-indigo-900">Fase A (Kelas 1 - 2)</p>
                  <p className="text-[10px] text-indigo-700 truncate">Calistung & Pengenalan Lingkungan Papua</p>
                </div>
              </div>

              <div className="bg-emerald-50/60 border border-emerald-200/70 p-3 rounded-lg flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs flex-shrink-0">
                  B
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-emerald-900">Fase B (Kelas 3 - 4)</p>
                  <p className="text-[10px] text-emerald-700 truncate">Penguatan IPAS & Konsep Bilangan Nyata</p>
                </div>
              </div>

              <div className="bg-amber-50/60 border border-amber-200/70 p-3 rounded-lg flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-black text-xs flex-shrink-0">
                  C
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-amber-900">Fase C (Kelas 5 - 6)</p>
                  <p className="text-[10px] text-amber-700 truncate">Literasi Kritis, Pecahan & P5 Mandiri</p>
                </div>
              </div>
            </div>

            {/* Filter Navigation Tabs */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-2.5">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                <button
                  type="button"
                  onClick={() => setActiveDocTab('Semua')}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                    activeDocTab === 'Semua'
                      ? 'bg-indigo-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Semua Dokumen ({documents.length})
                </button>
                {JENIS_LIST.map((jenis) => {
                  const count = documents.filter((d) => d.jenis === jenis).length;
                  return (
                    <button
                      key={jenis}
                      type="button"
                      onClick={() => setActiveDocTab(jenis)}
                      className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                        activeDocTab === jenis
                          ? 'bg-indigo-700 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {jenis} ({count})
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <div className="relative w-full md:w-60">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={docSearchQuery}
                    onChange={(e) => setDocSearchQuery(e.target.value)}
                    placeholder="Cari CP, modul, P5..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddDoc}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Dokumen</span>
                </button>
              </div>
            </div>

            {/* Documents Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredDocList.map((doc) => (
                <div
                  key={doc.id}
                  className={`bg-white border rounded-xl p-4 shadow-xs flex flex-col justify-between transition-all ${
                    doc.isLocked ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="inline-block px-2 py-0.5 rounded text-[10.5px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {doc.jenis}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleDocLock(doc)}
                          className="p-1 text-slate-400 hover:text-amber-600 rounded transition-colors"
                          title={doc.isLocked ? 'Buka Kunci' : 'Kunci Dokumen'}
                        >
                          {doc.isLocked ? <Lock className="w-3.5 h-3.5 text-amber-600" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditDoc(doc)}
                          className="p-1 text-slate-400 hover:text-emerald-600 rounded transition-colors"
                          title="Edit Dokumen"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDoc(doc.id, doc.isLocked)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Hapus Dokumen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-800 mt-2 line-clamp-2 leading-snug">
                      {doc.judul}
                    </h3>

                    <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700">{doc.fase}</span>
                      <span>•</span>
                      <span>{doc.kelas}</span>
                      <span>•</span>
                      <span className="font-medium text-indigo-700">{doc.mataPelajaran}</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-semibold">{doc.status}</span>
                    </div>

                    <div className="mt-2.5">
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                        {doc.ringkasan}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10.5px] text-slate-400">
                    <span>Tahun Ajaran: <strong className="text-slate-700">{doc.tahunAjaran}</strong></span>
                    <button
                      type="button"
                      onClick={() => setViewDetailDoc(doc)}
                      className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline"
                    >
                      Buka Selengkapnya →
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredDocList.length === 0 && (
              <div className="text-center py-10 bg-white border border-slate-200 rounded-xl">
                <BookMarked className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-600">Belum ada dokumen kurikulum pada kategori ini</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Klik tombol "Tambah Dokumen" untuk menyusun perangkat ajar baru
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PRINTABLE SHEET VIEW (Formatted for Official Print)           */}
      {/* ------------------------------------------------------------- */}
      <div className="hidden print:block bg-white p-6 text-black">
        <div className="text-center border-b-2 border-black pb-3 mb-4">
          <h2 className="text-sm font-bold uppercase">{settings.namaInstansi}</h2>
          <h1 className="text-lg font-black uppercase">{settings.namaSekolah}</h1>
          <p className="text-xs">{settings.alamatSekolah} | NPSN: {settings.npsn}</p>
          <div className="border-b border-black mt-1"></div>
          <h3 className="text-sm font-bold uppercase mt-2">
            {activeSection === 'mapel'
              ? 'DAFTAR MATA PELAJARAN & STRUKTUR BEBAN BELAJAR KURIKULUM MERDEKA'
              : 'DAFTAR ARSIP PERANGKAT KURIKULUM OPERASIONAL SEKOLAH (KOSP)'}
          </h3>
          <p className="text-xs font-bold">
            Tahun Ajaran 2024/2025 • Baalil, Kabupaten Pegunungan Bintang, Papua Pegunungan
          </p>
        </div>

        {activeSection === 'mapel' ? (
          <table className="w-full text-xs border-collapse border border-black mb-6">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-black p-1 text-center w-8">No</th>
                <th className="border border-black p-1 text-center w-20">Kode</th>
                <th className="border border-black p-1 text-left">Nama Mata Pelajaran</th>
                <th className="border border-black p-1 text-left w-36">Kelompok</th>
                <th className="border border-black p-1 text-center w-28">Fase / Kelas</th>
                <th className="border border-black p-1 text-center w-16">JP/Mgg</th>
                <th className="border border-black p-1 text-center w-16">JP/Thn</th>
                <th className="border border-black p-1 text-center w-14">KKTP</th>
                <th className="border border-black p-1 text-left">Guru Pengampu</th>
                <th className="border border-black p-1 text-center w-16">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredMapelList.map((m, idx) => (
                <tr key={m.id}>
                  <td className="border border-black p-1 text-center">{idx + 1}</td>
                  <td className="border border-black p-1 text-center font-mono font-bold">{m.kode}</td>
                  <td className="border border-black p-1">
                    <b>{m.nama}</b>
                    <br />
                    <small>{m.ruangLingkup}</small>
                  </td>
                  <td className="border border-black p-1">{m.kelompok}</td>
                  <td className="border border-black p-1 text-center">{m.fase}<br />{m.kelasTarget}</td>
                  <td className="border border-black p-1 text-center font-bold">{m.alokasiJpPerMinggu} JP</td>
                  <td className="border border-black p-1 text-center">{m.alokasiJpPerTahun} JP</td>
                  <td className="border border-black p-1 text-center font-bold">{m.kktp}</td>
                  <td className="border border-black p-1">{m.guruPengampu}</td>
                  <td className="border border-black p-1 text-center">{m.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-xs border-collapse border border-black mb-6">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-black p-1 text-center w-8">No</th>
                <th className="border border-black p-1 text-left">Nama Dokumen Perangkat</th>
                <th className="border border-black p-1 text-center w-28">Jenis</th>
                <th className="border border-black p-1 text-center w-24">Fase / Kelas</th>
                <th className="border border-black p-1 text-left">Mata Pelajaran</th>
                <th className="border border-black p-1 text-center w-20">Alokasi JP</th>
                <th className="border border-black p-1 text-left">Penyusun</th>
                <th className="border border-black p-1 text-center w-20">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocList.map((d, idx) => (
                <tr key={d.id}>
                  <td className="border border-black p-1 text-center">{idx + 1}</td>
                  <td className="border border-black p-1 font-semibold">{d.judul}</td>
                  <td className="border border-black p-1 text-center">{d.jenis}</td>
                  <td className="border border-black p-1 text-center">{d.fase}<br />{d.kelas}</td>
                  <td className="border border-black p-1">{d.mataPelajaran}</td>
                  <td className="border border-black p-1 text-center">{d.alokasiWaktu || '-'}</td>
                  <td className="border border-black p-1">{d.penyusun}</td>
                  <td className="border border-black p-1 text-center font-bold">{d.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Official Signatures */}
        <div className="flex justify-between items-start mt-8 pt-4 text-xs">
          <div className="text-center w-64">
            <p>Mengesahkan,</p>
            <p className="font-bold">Kepala Sekolah</p>
            <div className="h-16"></div>
            <p className="font-bold underline">{settings.namaKepsek}</p>
            <p>NIP. {settings.nipKepsek}</p>
          </div>
          <div className="text-center w-64">
            <p>Dekai, {new Date().toLocaleDateString('id-ID')}</p>
            <p className="font-bold">Koordinator Kurikulum & TU</p>
            <div className="h-16"></div>
            <p className="font-bold underline">{settings.operatorTU}</p>
            <p>NIP. {settings.nipOperator}</p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: DETAIL MATA PELAJARAN                                  */}
      {/* ------------------------------------------------------------- */}
      {viewDetailMapel && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="p-4 bg-gradient-to-r from-indigo-750 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-200" />
                <h3 className="font-bold text-sm">Detail Informasi Mata Pelajaran</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewDetailMapel(null)}
                className="text-white/80 hover:text-white p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3 max-h-[80vh] overflow-y-auto text-xs">
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-800">
                    {viewDetailMapel.kode}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-1">{viewDetailMapel.nama}</h4>
                </div>
                <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {viewDetailMapel.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block">Kelompok Mapel</span>
                  <span className="font-semibold text-slate-800">{viewDetailMapel.kelompok}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block">Fase & Sasaran</span>
                  <span className="font-semibold text-slate-800">
                    {viewDetailMapel.fase} ({viewDetailMapel.kelasTarget})
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block">Alokasi Beban Belajar</span>
                  <span className="font-bold text-indigo-800">
                    {viewDetailMapel.alokasiJpPerMinggu} JP/Minggu ({viewDetailMapel.alokasiJpPerTahun} JP/Tahun)
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block">Standar KKTP / KKM</span>
                  <span className="font-bold text-emerald-800">{viewDetailMapel.kktp} (Skala 100)</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block">Guru Pengampu</span>
                  <span className="font-semibold text-slate-800">{viewDetailMapel.guruPengampu}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block">Kurikulum Terapan</span>
                  <span className="font-semibold text-slate-800">{viewDetailMapel.kurikulum}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Ruang Lingkup Materi & Capaian Pembelajaran
                </span>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-700 leading-relaxed whitespace-pre-line">
                  {viewDetailMapel.ruangLingkup}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setViewDetailMapel(null)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-md font-semibold cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: TAMBAH / EDIT MATA PELAJARAN                           */}
      {/* ------------------------------------------------------------- */}
      {isMapelModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="p-4 bg-gradient-to-r from-indigo-750 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-200" />
                <h3 className="font-bold text-sm">
                  {editingMapel ? 'Edit Data Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMapelModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitMapelForm} className="p-4 space-y-3 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kode Mapel</label>
                  <input
                    type="text"
                    value={formMapelKode}
                    onChange={(e) => setFormMapelKode(e.target.value)}
                    placeholder="Contoh: BINDO"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono font-bold focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Mata Pelajaran</label>
                  <input
                    type="text"
                    value={formMapelNama}
                    onChange={(e) => setFormMapelNama(e.target.value)}
                    placeholder="Contoh: Bahasa Indonesia"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kelompok Mapel</label>
                  <select
                    value={formMapelKelompok}
                    onChange={(e) => setFormMapelKelompok(e.target.value as KelompokMapel)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-indigo-500"
                  >
                    {KELOMPOK_MAPEL_LIST.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fase Kurikulum</label>
                  <select
                    value={formMapelFase}
                    onChange={(e) => setFormMapelFase(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-indigo-500"
                  >
                    {FASE_LIST.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sasaran Kelas</label>
                  <input
                    type="text"
                    value={formMapelKelasTarget}
                    onChange={(e) => setFormMapelKelasTarget(e.target.value)}
                    placeholder="Kelas I - VI"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">JP / Minggu</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={formMapelJpMinggu}
                    onChange={(e) => handleJpMingguChange(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-bold focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">JP / Tahun</label>
                  <input
                    type="number"
                    value={formMapelJpTahun}
                    onChange={(e) => setFormMapelJpTahun(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-bold focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Standar KKTP (KKM)</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={formMapelKktp}
                    onChange={(e) => setFormMapelKktp(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-bold focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Guru Pengampu</label>
                  <select
                    value={formMapelGuru}
                    onChange={(e) => setFormMapelGuru(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-indigo-500"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.nama}>
                        {t.nama} ({t.jabatan})
                      </option>
                    ))}
                    <option value="Selpius Nabyal, S.Pd.Gr.">Selpius Nabyal, S.Pd.Gr.</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Standar Kurikulum</label>
                  <select
                    value={formMapelKurikulum}
                    onChange={(e) => setFormMapelKurikulum(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Kurikulum Merdeka">Kurikulum Merdeka</option>
                    <option value="Kurikulum 2013">Kurikulum 2013</option>
                    <option value="Kombinasi">Kombinasi Kontekstual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status Keaktifan</label>
                  <select
                    value={formMapelStatus}
                    onChange={(e) => setFormMapelStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Aktif">Aktif Diajarkan</option>
                    <option value="Non-Aktif">Non-Aktif / Cadangan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ruang Lingkup Materi Pokok & Elemen Capaian
                </label>
                <textarea
                  rows={3}
                  value={formMapelRuangLingkup}
                  onChange={(e) => setFormMapelRuangLingkup(e.target.value)}
                  placeholder="Uraian kompetensi dasar, capaian pembelajaran per fase, materi kontekstual Papua..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-indigo-500 leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMapelModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  Simpan Mata Pelajaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: DETAIL DOKUMEN KURIKULUM                               */}
      {/* ------------------------------------------------------------- */}
      {viewDetailDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="p-4 bg-gradient-to-r from-indigo-750 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-indigo-200" />
                <h3 className="font-bold text-sm">Detail Dokumen Kurikulum</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewDetailDoc(null)}
                className="text-white/80 hover:text-white p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3 max-h-[80vh] overflow-y-auto text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Judul Perangkat
                </span>
                <p className="text-sm font-bold text-slate-900">{viewDetailDoc.judul}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block">Jenis Perangkat</span>
                  <span className="font-semibold text-slate-800">{viewDetailDoc.jenis}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block">Fase & Kelas</span>
                  <span className="font-semibold text-slate-800">
                    {viewDetailDoc.fase} ({viewDetailDoc.kelas})
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block">Mata Pelajaran</span>
                  <span className="font-semibold text-slate-800">{viewDetailDoc.mataPelajaran}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block">Alokasi Waktu</span>
                  <span className="font-semibold text-indigo-800">{viewDetailDoc.alokasiWaktu || '-'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block">Semester & Tahun</span>
                  <span className="font-semibold text-slate-800">
                    {viewDetailDoc.semester} • {viewDetailDoc.tahunAjaran}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block">Status Dokumen</span>
                  <span className="font-semibold text-emerald-800">{viewDetailDoc.status}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Uraian Lengkap / Capaian Pembelajaran / Modul
                </span>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-700 leading-relaxed whitespace-pre-line">
                  {viewDetailDoc.ringkasan}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-500">
                <span>Penyusun: <strong>{viewDetailDoc.penyusun}</strong></span>
                <button
                  type="button"
                  onClick={() => setViewDetailDoc(null)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-md font-semibold cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: FORM TAMBAH / EDIT DOKUMEN KURIKULUM                   */}
      {/* ------------------------------------------------------------- */}
      {isDocModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="p-4 bg-gradient-to-r from-indigo-750 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-indigo-200" />
                <h3 className="font-bold text-sm">
                  {editingDoc ? 'Edit Dokumen Kurikulum' : 'Tambah Dokumen Kurikulum'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDocModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitDocForm} className="p-4 space-y-3 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Dokumen Perangkat</label>
                <input
                  type="text"
                  value={formJudul}
                  onChange={(e) => setFormJudul(e.target.value)}
                  placeholder="Contoh: Modul Ajar IPAS Fase B Kelas IV: Ekosistem Pedalaman Papua"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Perangkat</label>
                  <select
                    value={formJenis}
                    onChange={(e) => setFormJenis(e.target.value as KurikulumJenis)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-indigo-500"
                  >
                    {JENIS_LIST.map((j) => (
                      <option key={j} value={j}>
                        {j}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fase Kurikulum</label>
                  <select
                    value={formFase}
                    onChange={(e) => setFormFase(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-indigo-500"
                  >
                    {FASE_LIST.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mata Pelajaran</label>
                  <select
                    value={formMapel}
                    onChange={(e) => setFormMapel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:ring-1 focus:ring-indigo-500"
                  >
                    {mataPelajaranList.map((m) => (
                      <option key={m.id} value={m.nama}>
                        {m.nama}
                      </option>
                    ))}
                    <option value="Umum / Manajerial">Umum / Manajerial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kelas</label>
                  <input
                    type="text"
                    value={formKelas}
                    onChange={(e) => setFormKelas(e.target.value)}
                    placeholder="Kelas IV"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Semester</label>
                  <select
                    value={formSemester}
                    onChange={(e) => setFormSemester(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="1 Tahun Penuh">1 Tahun Penuh</option>
                    <option value="Ganjil">Semester Ganjil</option>
                    <option value="Genap">Semester Genap</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Alokasi Waktu (JP)</label>
                  <input
                    type="text"
                    value={formAlokasiWaktu}
                    onChange={(e) => setFormAlokasiWaktu(e.target.value)}
                    placeholder="Contoh: 144 JP / Tahun"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tahun Ajaran</label>
                  <input
                    type="text"
                    value={formTahunAjaran}
                    onChange={(e) => setFormTahunAjaran(e.target.value)}
                    placeholder="2024/2025"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Penyusun / Guru</label>
                  <input
                    type="text"
                    value={formPenyusun}
                    onChange={(e) => setFormPenyusun(e.target.value)}
                    placeholder="Nama Penyusun"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status Dokumen</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Draft">Draft (Dalam Penyusunan)</option>
                    <option value="Divalidasi">Divalidasi Tim Kurikulum</option>
                    <option value="Ditetapkan Kepala Sekolah">Ditetapkan Kepala Sekolah</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ringkasan Isi / Capaian Pembelajaran / Rencana Projek
                </label>
                <textarea
                  rows={4}
                  value={formRingkasan}
                  onChange={(e) => setFormRingkasan(e.target.value)}
                  placeholder="Deskripsikan Capaian Pembelajaran (CP), materi ajar pokok, tujuan kegiatan, atau tahapan asesmen..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-indigo-500 leading-relaxed"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDocModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  Simpan Dokumen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
