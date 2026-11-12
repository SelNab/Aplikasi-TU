import React, { useState, useMemo } from 'react';
import {
  SchoolSettings,
  ProfilSekolahData,
  StrukturOrganisasiItem,
  StrukturKategori,
  PaperSize
} from '../../types';
import { ActionToolbar } from '../ActionToolbar';
import { KopSurat } from '../KopSurat';
import {
  exportToExcel,
  exportToWord,
  triggerPrint,
  safeConfirm
} from '../../utils/exportHelpers';
import {
  School,
  Building2,
  Users,
  Compass,
  Target,
  FileText,
  Printer,
  FileSpreadsheet,
  Award,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Lock,
  Unlock,
  Eye,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  ChevronRight,
  Info,
  BookOpen,
  GraduationCap,
  HeartHandshake,
  Layers,
  ArrowUpDown,
  Search
} from 'lucide-react';

interface ProfilSekolahModuleProps {
  profilData: ProfilSekolahData;
  onSaveProfilData: (data: ProfilSekolahData) => void;
  settings: SchoolSettings;
  onSaveSettings: (settings: SchoolSettings) => void;
  onHome: () => void;
  notifyMessage: (msg?: string) => void;
  onSync: () => void;
}

type SubTab = 'ringkasan' | 'struktur' | 'visi' | 'misi' | 'tujuan' | 'misi_tu' | 'cetak';

export const ProfilSekolahModule: React.FC<ProfilSekolahModuleProps> = ({
  profilData,
  onSaveProfilData,
  settings,
  onSaveSettings,
  onHome,
  notifyMessage,
  onSync
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('ringkasan');
  const [data, setData] = useState<ProfilSekolahData>(profilData);
  const [filterKategori, setFilterKategori] = useState<string>('Semua');
  const [searchStruktur, setSearchStruktur] = useState<string>('');
  const [tampilanStruktur, setTampilanStruktur] = useState<'bagan' | 'tabel'>('bagan');

  // Modal State for Struktur Item (Add / Edit)
  const [isStrukturModalOpen, setIsStrukturModalOpen] = useState(false);
  const [editingStrukturItem, setEditingStrukturItem] = useState<StrukturOrganisasiItem | null>(null);
  const [strukturFormData, setStrukturFormData] = useState<Partial<StrukturOrganisasiItem>>({
    jabatan: '',
    nama: '',
    nip: '',
    kategori: 'Tata Usaha',
    urutan: 1,
    tugasUtama: '',
    kontak: ''
  });

  // Modal State for Misi Edit / Add
  const [isMisiModalOpen, setIsMisiModalOpen] = useState(false);
  const [editingMisiIndex, setEditingMisiIndex] = useState<number | null>(null);
  const [misiInputText, setMisiInputText] = useState('');

  // Modal State for Misi TU Edit / Add
  const [isMisiTUModalOpen, setIsMisiTUModalOpen] = useState(false);
  const [editingMisiTUIndex, setEditingMisiTUIndex] = useState<number | null>(null);
  const [misiTUInputText, setMisiTUInputText] = useState('');

  // Modal State for Tujuan Sekolah Edit / Add
  const [isTujuanModalOpen, setIsTujuanModalOpen] = useState(false);
  const [editingTujuanIndex, setEditingTujuanIndex] = useState<number | null>(null);
  const [tujuanKategoriInput, setTujuanKategoriInput] = useState<'Jangka Pendek (1 Tahun)' | 'Jangka Menengah (4 Tahun)' | 'Jangka Panjang'>('Jangka Pendek (1 Tahun)');
  const [tujuanTextInput, setTujuanTextInput] = useState('');

  // Modal State for Visi Edit
  const [isVisiModalOpen, setIsVisiModalOpen] = useState(false);
  const [visiTextInput, setVisiTextInput] = useState('');
  const [mottoTextInput, setMottoTextInput] = useState('');

  // Synchronize internal state if prop updates externally
  React.useEffect(() => {
    setData(profilData);
  }, [profilData]);

  const commitData = (nextData: ProfilSekolahData, msg = 'Data Anda Berhasil Disimpan') => {
    setData(nextData);
    onSaveProfilData(nextData);
    notifyMessage(msg);
  };

  // Filtered Struktur Items
  const filteredStruktur = useMemo(() => {
    return data.strukturOrganisasi
      .filter(item => {
        const matchKat = filterKategori === 'Semua' || item.kategori === filterKategori;
        const matchSearch =
          item.nama.toLowerCase().includes(searchStruktur.toLowerCase()) ||
          item.jabatan.toLowerCase().includes(searchStruktur.toLowerCase()) ||
          (item.nip && item.nip.toLowerCase().includes(searchStruktur.toLowerCase()));
        return matchKat && matchSearch;
      })
      .sort((a, b) => a.urutan - b.urutan);
  }, [data.strukturOrganisasi, filterKategori, searchStruktur]);

  // Handler: Open Struktur Modal
  const handleOpenAddStruktur = () => {
    const nextUrutan = data.strukturOrganisasi.length + 1;
    setEditingStrukturItem(null);
    setStrukturFormData({
      jabatan: '',
      nama: '',
      nip: '',
      kategori: 'Tata Usaha',
      urutan: nextUrutan,
      tugasUtama: '',
      kontak: ''
    });
    setIsStrukturModalOpen(true);
  };

  const handleOpenEditStruktur = (item: StrukturOrganisasiItem) => {
    setEditingStrukturItem(item);
    setStrukturFormData({ ...item });
    setIsStrukturModalOpen(true);
  };

  const handleSaveStrukturModal = () => {
    if (!strukturFormData.nama?.trim() || !strukturFormData.jabatan?.trim()) {
      alert('Nama personel dan jabatan wajib diisi!');
      return;
    }

    let updatedList: StrukturOrganisasiItem[];
    if (editingStrukturItem) {
      updatedList = data.strukturOrganisasi.map(it =>
        it.id === editingStrukturItem.id
          ? ({ ...it, ...strukturFormData } as StrukturOrganisasiItem)
          : it
      );
    } else {
      const newItem: StrukturOrganisasiItem = {
        id: `org-${Date.now()}`,
        jabatan: strukturFormData.jabatan?.trim() || '',
        nama: strukturFormData.nama?.trim() || '',
        nip: strukturFormData.nip?.trim() || '-',
        kategori: (strukturFormData.kategori as StrukturKategori) || 'Tata Usaha',
        urutan: Number(strukturFormData.urutan) || data.strukturOrganisasi.length + 1,
        tugasUtama: strukturFormData.tugasUtama?.trim() || '',
        kontak: strukturFormData.kontak?.trim() || ''
      };
      updatedList = [...data.strukturOrganisasi, newItem];
    }

    commitData({ ...data, strukturOrganisasi: updatedList });
    setIsStrukturModalOpen(false);
  };

  const handleDeleteStruktur = (id: string, nama: string) => {
    if (safeConfirm(`Hapus personel "${nama}" dari struktur organisasi sekolah?`)) {
      const updatedList = data.strukturOrganisasi.filter(it => it.id !== id);
      commitData({ ...data, strukturOrganisasi: updatedList });
    }
  };

  // Handler: Visi
  const handleOpenEditVisi = () => {
    setVisiTextInput(data.visiSekolah);
    setMottoTextInput(data.mottoSekolah);
    setIsVisiModalOpen(true);
  };

  const handleSaveVisiModal = () => {
    if (!visiTextInput.trim()) {
      alert('Teks visi sekolah tidak boleh kosong!');
      return;
    }
    commitData({
      ...data,
      visiSekolah: visiTextInput.trim(),
      mottoSekolah: mottoTextInput.trim()
    });
    // Also sync to settings.visiMisiSekolah
    onSaveSettings({
      ...settings,
      visiMisiSekolah: `Visi: ${visiTextInput.trim()}\nMisi: ${data.misiSekolahList.join('; ')}`
    });
    setIsVisiModalOpen(false);
  };

  // Handler: Misi Sekolah
  const handleOpenAddMisi = () => {
    setEditingMisiIndex(null);
    setMisiInputText('');
    setIsMisiModalOpen(true);
  };

  const handleOpenEditMisi = (index: number) => {
    setEditingMisiIndex(index);
    setMisiInputText(data.misiSekolahList[index] || '');
    setIsMisiModalOpen(true);
  };

  const handleSaveMisiModal = () => {
    if (!misiInputText.trim()) {
      alert('Teks butir misi tidak boleh kosong!');
      return;
    }
    const list = [...data.misiSekolahList];
    if (editingMisiIndex !== null) {
      list[editingMisiIndex] = misiInputText.trim();
    } else {
      list.push(misiInputText.trim());
    }
    commitData({ ...data, misiSekolahList: list });
    setIsMisiModalOpen(false);
  };

  const handleDeleteMisi = (index: number) => {
    if (safeConfirm(`Hapus butir misi nomor ${index + 1}?`)) {
      const list = data.misiSekolahList.filter((_, idx) => idx !== index);
      commitData({ ...data, misiSekolahList: list });
    }
  };

  // Handler: Misi TU
  const handleOpenAddMisiTU = () => {
    setEditingMisiTUIndex(null);
    setMisiTUInputText('');
    setIsMisiTUModalOpen(true);
  };

  const handleOpenEditMisiTU = (index: number) => {
    setEditingMisiTUIndex(index);
    setMisiTUInputText(data.misiTUList[index] || '');
    setIsMisiTUModalOpen(true);
  };

  const handleSaveMisiTUModal = () => {
    if (!misiTUInputText.trim()) {
      alert('Teks misi TU tidak boleh kosong!');
      return;
    }
    const list = [...data.misiTUList];
    if (editingMisiTUIndex !== null) {
      list[editingMisiTUIndex] = misiTUInputText.trim();
    } else {
      list.push(misiTUInputText.trim());
    }
    commitData({ ...data, misiTUList: list });
    // Also sync to settings.visiMisiTU
    onSaveSettings({
      ...settings,
      visiMisiTU: list.join('\n')
    });
    setIsMisiTUModalOpen(false);
  };

  const handleDeleteMisiTU = (index: number) => {
    if (safeConfirm(`Hapus butir misi tata usaha nomor ${index + 1}?`)) {
      const list = data.misiTUList.filter((_, idx) => idx !== index);
      commitData({ ...data, misiTUList: list });
    }
  };

  // Handler: Tujuan Sekolah
  const handleOpenAddTujuan = () => {
    setEditingTujuanIndex(null);
    setTujuanKategoriInput('Jangka Pendek (1 Tahun)');
    setTujuanTextInput('');
    setIsTujuanModalOpen(true);
  };

  const handleOpenEditTujuan = (index: number) => {
    const item = data.tujuanSekolahList[index];
    if (!item) return;
    setEditingTujuanIndex(index);
    setTujuanKategoriInput(item.kategori);
    setTujuanTextInput(item.butir);
    setIsTujuanModalOpen(true);
  };

  const handleSaveTujuanModal = () => {
    if (!tujuanTextInput.trim()) {
      alert('Teks butir tujuan sekolah tidak boleh kosong!');
      return;
    }
    const list = [...data.tujuanSekolahList];
    if (editingTujuanIndex !== null) {
      list[editingTujuanIndex] = {
        kategori: tujuanKategoriInput,
        butir: tujuanTextInput.trim()
      };
    } else {
      list.push({
        kategori: tujuanKategoriInput,
        butir: tujuanTextInput.trim()
      });
    }
    commitData({ ...data, tujuanSekolahList: list });
    setIsTujuanModalOpen(false);
  };

  const handleDeleteTujuan = (index: number) => {
    if (safeConfirm(`Hapus butir tujuan sekolah ini?`)) {
      const list = data.tujuanSekolahList.filter((_, idx) => idx !== index);
      commitData({ ...data, tujuanSekolahList: list });
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    const headers = ['No. Urut', 'Kategori', 'Jabatan', 'Nama Personel', 'NIP', 'Kontak / Telepon', 'Tugas Pokok (Tupoksi)'];
    const rows = data.strukturOrganisasi
      .sort((a, b) => a.urutan - b.urutan)
      .map((item, idx) => [
        idx + 1,
        item.kategori,
        item.jabatan,
        item.nama,
        item.nip || '-',
        item.kontak || '-',
        item.tugasUtama || '-'
      ]);
    exportToExcel(`Struktur_Organisasi_${settings.namaSekolah}`, headers, rows);
    notifyMessage('Data Struktur Organisasi berhasil diekspor ke format Excel');
  };

  // Export to Word
  const handleExportWord = () => {
    const content = `
      <div class="kop">
        <h2>${settings.namaInstansi.toUpperCase()}</h2>
        <h1>${settings.namaSekolah.toUpperCase()}</h1>
        <p>${settings.alamatSekolah} | NPSN: ${settings.npsn}</p>
      </div>

      <h2 style="text-align: center; text-decoration: underline;">PROFIL, VISI, MISI, TUJUAN DAN STRUKTUR SEKOLAH</h2>

      <h3>I. VISI SEKOLAH</h3>
      <p style="font-style: italic; font-weight: bold; background-color: #f0fdf4; padding: 10px; border-left: 4px solid #047857;">
        "${data.visiSekolah}"
      </p>

      <h3>II. MISI SATUAN PENDIDIKAN</h3>
      <ol>
        ${data.misiSekolahList.map(m => `<li>${m}</li>`).join('')}
      </ol>

      <h3>III. TUJUAN SEKOLAH</h3>
      <h4>A. Jangka Pendek (1 Tahun)</h4>
      <ul>
        ${data.tujuanSekolahList.filter(t => t.kategori === 'Jangka Pendek (1 Tahun)').map(t => `<li>${t.butir}</li>`).join('')}
      </ul>
      <h4>B. Jangka Menengah (4 Tahun)</h4>
      <ul>
        ${data.tujuanSekolahList.filter(t => t.kategori === 'Jangka Menengah (4 Tahun)').map(t => `<li>${t.butir}</li>`).join('')}
      </ul>
      <h4>C. Jangka Panjang</h4>
      <ul>
        ${data.tujuanSekolahList.filter(t => t.kategori === 'Jangka Panjang').map(t => `<li>${t.butir}</li>`).join('')}
      </ul>

      <h3>IV. VISI, MISI DAN MAKLUMAT TATA USAHA</h3>
      <p><strong>Visi TU:</strong> ${data.visiTU}</p>
      <p><strong>Misi Pelayanan TU:</strong></p>
      <ol>
        ${data.misiTUList.map(m => `<li>${m}</li>`).join('')}
      </ol>
      <p><strong>Maklumat Pelayanan TU:</strong></p>
      <blockquote style="font-style: italic; border-left: 3px solid #065f46; padding-left: 10px;">
        ${data.maklumatPelayananTU}
      </blockquote>

      <h3>V. STRUKTUR ORGANISASI DAN PERSONALIA SEKOLAH</h3>
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Jabatan</th>
            <th>Nama</th>
            <th>NIP</th>
            <th>Kategori</th>
            <th>Tugas Utama</th>
          </tr>
        </thead>
        <tbody>
          ${data.strukturOrganisasi.sort((a, b) => a.urutan - b.urutan).map((item, idx) => `
            <tr>
              <td style="text-align: center;">${idx + 1}</td>
              <td><strong>${item.jabatan}</strong></td>
              <td>${item.nama}</td>
              <td>${item.nip || '-'}</td>
              <td>${item.kategori}</td>
              <td>${item.tugasUtama}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <br/><br/>
      <table style="width: 100%; border: none; margin-top: 30px;">
        <tr style="border: none;">
          <td style="width: 50%; border: none; text-align: center;">
            Mengetahui,<br/>
            Kepala Sekolah<br/><br/><br/><br/>
            <strong><u>${settings.namaKepsek}</u></strong><br/>
            NIP. ${settings.nipKepsek}
          </td>
          <td style="width: 50%; border: none; text-align: center;">
            Dekai, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br/>
            Kepala Tata Usaha / Operator<br/><br/><br/><br/>
            <strong><u>${settings.operatorTU}</u></strong><br/>
            NIP. ${settings.nipOperator}
          </td>
        </tr>
      </table>
    `;

    exportToWord(`Profil_Sekolah_${settings.namaSekolah}`, content);
    notifyMessage('Dokumen Profil Sekolah berhasil diekspor ke format Word');
  };

  return (
    <div id="profil-sekolah-module" className="space-y-6">
      {/* Top Action Toolbar */}
      <div className="no-print">
        <ActionToolbar
          onHome={onHome}
          onSave={() => {
            commitData(data);
          }}
          onPrint={triggerPrint}
          onPdf={triggerPrint}
          onWord={handleExportWord}
          onExcel={handleExportExcel}
          onAddNew={
            activeSubTab === 'struktur'
              ? handleOpenAddStruktur
              : activeSubTab === 'misi'
              ? handleOpenAddMisi
              : activeSubTab === 'misi_tu'
              ? handleOpenAddMisiTU
              : activeSubTab === 'tujuan'
              ? handleOpenAddTujuan
              : handleOpenAddStruktur
          }
          onSync={onSync}
          onRefresh={() => {
            setData(profilData);
            notifyMessage('Data Profil Sekolah disegarkan');
          }}
        />
      </div>

      {/* Hero Title & Sub-navigation */}
      <div className="no-print bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl shadow-xs">
              <School className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                  Profil Lembaga & Satuan Pendidikan
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Resmi Kemendikbud & Dapodik
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-1">
                Struktur Organisasi Sekolah, Visi, Misi, Tujuan Pendidikan, dan Misi Pelayanan Tata Usaha {settings.namaSekolah}
              </p>
            </div>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center gap-1.5 font-medium">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>Struktur: <strong>{data.strukturOrganisasi.length}</strong> Personel</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center gap-1.5 font-medium">
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              <span>Misi: <strong>{data.misiSekolahList.length}</strong> Butir</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center gap-1.5 font-medium">
              <Target className="w-3.5 h-3.5 text-purple-600" />
              <span>Tujuan: <strong>{data.tujuanSekolahList.length}</strong> Target</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-1.5 font-medium">
              <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
              <span>Misi TU: <strong>{data.misiTUList.length}</strong> Butir</span>
            </div>
          </div>
        </div>

        {/* Horizontal Navigation Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 scrollbar-thin">
          <button
            type="button"
            onClick={() => setActiveSubTab('ringkasan')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeSubTab === 'ringkasan'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Identitas Sekolah</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('struktur')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeSubTab === 'struktur'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Struktur Sekolah</span>
            <span className={`px-1.5 py-0.2 rounded-full text-xs ${activeSubTab === 'struktur' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 text-slate-700'}`}>
              {data.strukturOrganisasi.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('visi')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeSubTab === 'visi'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Visi Sekolah</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('misi')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeSubTab === 'misi'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Misi Sekolah</span>
            <span className={`px-1.5 py-0.2 rounded-full text-xs ${activeSubTab === 'misi' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 text-slate-700'}`}>
              {data.misiSekolahList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('tujuan')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeSubTab === 'tujuan'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Tujuan Sekolah</span>
            <span className={`px-1.5 py-0.2 rounded-full text-xs ${activeSubTab === 'tujuan' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 text-slate-700'}`}>
              {data.tujuanSekolahList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('misi_tu')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeSubTab === 'misi_tu'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Misi Tata Usaha</span>
            <span className={`px-1.5 py-0.2 rounded-full text-xs ${activeSubTab === 'misi_tu' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 text-slate-700'}`}>
              {data.misiTUList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('cetak')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeSubTab === 'cetak'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen Resmi</span>
          </button>
        </div>
      </div>

      {/* TAB 1: IDENTITAS & RINGKASAN */}
      {activeSubTab === 'ringkasan' && (
        <div className="space-y-6">
          {/* Banner Visi Singkat */}
          <div className="bg-gradient-to-r from-emerald-800 via-teal-850 to-emerald-900 text-white rounded-2xl p-6 shadow-sm border border-emerald-700/50">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  Motto & Visi Utama Pendidikan Pedalaman Papua
                </span>
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white leading-snug">
                  &ldquo;{data.visiSekolah}&rdquo;
                </h2>
                <p className="text-emerald-100/90 text-sm font-medium">
                  Motto: <span className="text-white font-semibold">{data.mottoSekolah}</span>
                </p>
              </div>
              <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                <button
                  type="button"
                  onClick={handleOpenEditVisi}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-colors flex items-center gap-2 border border-white/20"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Visi & Motto
                </button>
              </div>
            </div>
          </div>

          {/* Grid Informasi Identitas Sekolah */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Card 1: Profil Satuan Pendidikan */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Identitas Lembaga</h3>
                  <p className="text-xs text-slate-500">Legalitas & Status Sekolah</p>
                </div>
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Nama Sekolah</span>
                  <span className="font-semibold text-slate-800 text-right">{settings.namaSekolah}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">NPSN</span>
                  <span className="font-semibold text-slate-800">{settings.npsn}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">NSS</span>
                  <span className="font-semibold text-slate-800">{settings.nss || '1012501004'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Status Akreditasi</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {data.akreditasi}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Kurikulum Operasional</span>
                  <span className="font-semibold text-slate-800 text-right text-xs">{data.kurikulum}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Tahun Berdiri</span>
                  <span className="font-semibold text-slate-800">{data.tahunBerdiri}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">SK Pendirian</span>
                  <span className="font-mono text-xs text-slate-800 text-right">{data.skPendirian}</span>
                </div>
              </div>
            </div>

            {/* Card 2: Pimpinan & Tata Usaha */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Pimpinan & Pelaksana</h3>
                  <p className="text-xs text-slate-500">Penanggung Jawab Sekolah</p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-medium">Kepala Sekolah:</p>
                  <p className="font-bold text-slate-900 mt-0.5">{settings.namaKepsek}</p>
                  <p className="text-xs font-mono text-slate-500">NIP. {settings.nipKepsek}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-medium">Kepala Urusan TU / Operator Sekolah:</p>
                  <p className="font-bold text-slate-900 mt-0.5">{settings.operatorTU}</p>
                  <p className="text-xs font-mono text-slate-500">NIP. {settings.nipOperator}</p>
                </div>

                <div className="flex justify-between py-1 border-t border-slate-100 text-xs">
                  <span className="text-slate-500">Instansi Pembina:</span>
                  <span className="font-semibold text-slate-700 text-right">{settings.namaInstansi}</span>
                </div>
              </div>
            </div>

            {/* Card 3: Kontak & Lokasi Wilayah Pedalaman */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="p-2.5 bg-purple-50 text-purple-700 rounded-xl">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Lokasi & Kontak Resmi</h3>
                  <p className="text-xs text-slate-500">Wilayah Kabupaten Pegunungan Bintang, Papua</p>
                </div>
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex items-start gap-2.5 py-1 border-b border-slate-50">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-700">
                    <p className="font-semibold">{settings.alamatSekolah}</p>
                    <p className="text-slate-500 mt-0.5">Baalil, Kab. Pegunungan Bintang, Prov. Papua Pegunungan</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 py-1 border-b border-slate-50 text-xs">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-slate-700 font-medium">{data.telepon}</span>
                </div>

                <div className="flex items-center gap-2.5 py-1 border-b border-slate-50 text-xs">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-slate-700 font-medium">{data.emailSekolah}</span>
                </div>

                <div className="mt-3 p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Sistem Tersedia dalam Mode Offline (Luring) & Online Sync</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ringkasan Maklumat Pelayanan Tata Usaha */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Maklumat Komitmen Pelayanan Tata Usaha</h3>
                  <p className="text-xs text-slate-500">Janji Layanan Prima Administrasi Sekolah Pedalaman</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubTab('misi_tu')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                Lihat Selengkapnya <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-4 bg-emerald-50/60 rounded-xl border-l-4 border-emerald-600 text-slate-700 text-sm italic">
              &ldquo;{data.maklumatPelayananTU}&rdquo;
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STRUKTUR ORGANISASI SEKOLAH */}
      {activeSubTab === 'struktur' && (
        <div className="space-y-6">
          {/* Header Action Bar for Struktur */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama / jabatan / NIP..."
                  value={searchStruktur}
                  onChange={(e) => setSearchStruktur(e.target.value)}
                  className="pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 w-52 md:w-64"
                />
              </div>

              <select
                value={filterKategori}
                onChange={(e) => setFilterKategori(e.target.value)}
                className="py-2 px-3 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Semua">Semua Kategori ({data.strukturOrganisasi.length})</option>
                <option value="Kepala Sekolah">Kepala Sekolah</option>
                <option value="Komite Sekolah">Komite Sekolah</option>
                <option value="Tata Usaha">Tata Usaha</option>
                <option value="Urusan / Koordinator">Urusan / Koordinator</option>
                <option value="Dewan Guru">Dewan Guru</option>
                <option value="Staf Pendukung">Staf Pendukung</option>
              </select>

              {/* Toggle Bagan / Tabel */}
              <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setTampilanStruktur('bagan')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    tampilanStruktur === 'bagan' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Bagan Hierarki
                </button>
                <button
                  type="button"
                  onClick={() => setTampilanStruktur('tabel')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    tampilanStruktur === 'tabel' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Daftar Roster
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenAddStruktur}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                Tambah Personel
              </button>
              <button
                type="button"
                onClick={handleExportExcel}
                className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                Excel
              </button>
            </div>
          </div>

          {/* TAMPILAN 1: BAGAN HIERARKI ORGANISASI VISUAL */}
          {tampilanStruktur === 'bagan' && (
            <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-6 overflow-x-auto">
              <div className="min-w-[840px] flex flex-col items-center space-y-6">
                {/* Level 1: Kepala Sekolah & Komite Sekolah */}
                <div className="flex items-center justify-center gap-8 w-full max-w-4xl relative">
                  {/* Komite Sekolah (Sebelah Kiri - Garis Koordinasi) */}
                  {data.strukturOrganisasi.filter(i => i.kategori === 'Komite Sekolah').map(komite => (
                    <div
                      key={komite.id}
                      className="w-72 bg-amber-50/90 border-2 border-dashed border-amber-400 rounded-2xl p-4 shadow-xs relative text-center"
                    >
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 border border-amber-300">
                        Mitra & Pengawas
                      </span>
                      <p className="text-xs font-bold text-amber-900 uppercase tracking-wide mt-1">{komite.jabatan}</p>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{komite.nama}</h4>
                      <p className="text-[11px] text-slate-500 font-mono">NIP: {komite.nip || '-'}</p>
                      <p className="text-[11px] text-slate-600 mt-2 line-clamp-2 bg-white/70 p-2 rounded-lg border border-amber-200/60">
                        {komite.tugasUtama}
                      </p>
                      <div className="mt-3 flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditStruktur(komite)}
                          className="px-2 py-1 bg-white hover:bg-amber-100 text-amber-800 rounded-md text-[11px] font-medium border border-amber-200 flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" /> Edit
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Garis Hubung Koordinasi Horizontal */}
                  <div className="hidden md:block w-8 border-t-2 border-dashed border-slate-300"></div>

                  {/* Kepala Sekolah (Pusat Pimpinan) */}
                  {data.strukturOrganisasi.filter(i => i.kategori === 'Kepala Sekolah').map(kepsek => (
                    <div
                      key={kepsek.id}
                      className="w-80 bg-gradient-to-br from-emerald-800 to-emerald-950 text-white border-2 border-emerald-600 rounded-2xl p-5 shadow-md relative text-center"
                    >
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400 text-emerald-950 shadow-xs">
                        Pimpinan Tertinggi
                      </span>
                      <p className="text-xs font-bold text-emerald-200 uppercase tracking-wider mt-1">{kepsek.jabatan}</p>
                      <h3 className="font-bold text-white text-base mt-1">{kepsek.nama}</h3>
                      <p className="text-xs font-mono text-emerald-200/80">NIP: {kepsek.nip}</p>
                      <p className="text-xs text-emerald-100/90 mt-2 bg-black/20 p-2.5 rounded-xl border border-white/10 text-left">
                        {kepsek.tugasUtama}
                      </p>
                      <div className="mt-3 flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditStruktur(kepsek)}
                          className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-medium border border-white/20 flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" /> Edit Data
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Garis Vertikal Utama Penghubung ke Tata Usaha */}
                <div className="w-0.5 h-6 bg-slate-300"></div>

                {/* Level 2: Kepala Urusan Tata Usaha & Bendahara BOS */}
                <div className="w-full max-w-2xl bg-white border border-emerald-200 rounded-2xl p-4 shadow-xs">
                  <div className="text-center mb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Unsur Tata Usaha & Administrasi Sekolah
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.strukturOrganisasi.filter(i => i.kategori === 'Tata Usaha').map(tu => (
                      <div key={tu.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-emerald-800 uppercase px-2 py-0.5 rounded bg-emerald-100">
                              {tu.jabatan}
                            </span>
                            <h4 className="font-bold text-slate-900 text-sm mt-1">{tu.nama}</h4>
                            <p className="text-[11px] font-mono text-slate-500">NIP: {tu.nip}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleOpenEditStruktur(tu)}
                            className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-white rounded-lg"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-600 bg-white p-2 rounded-lg border border-slate-100">
                          {tu.tugasUtama}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Garis Vertikal Penghubung ke Koordinator Urusan */}
                <div className="w-0.5 h-6 bg-slate-300"></div>

                {/* Level 3: Koordinator Urusan / Bidang */}
                <div className="w-full">
                  <div className="text-center mb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                      Koordinator Urusan / Bidang Penunjang
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {data.strukturOrganisasi.filter(i => i.kategori === 'Urusan / Koordinator').map(bidang => (
                      <div key={bidang.id} className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-2">
                        <div className="flex items-start justify-between">
                          <span className="text-[10px] font-bold text-blue-800 uppercase px-1.5 py-0.5 rounded bg-blue-50">
                            {bidang.jabatan.replace('Koordinator ', '')}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenEditStruktur(bidang)}
                            className="p-1 text-slate-400 hover:text-blue-700"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                        <h5 className="font-bold text-slate-900 text-xs">{bidang.nama}</h5>
                        <p className="text-[10px] font-mono text-slate-500">NIP: {bidang.nip}</p>
                        <p className="text-[11px] text-slate-600 line-clamp-3 bg-slate-50 p-2 rounded-lg">
                          {bidang.tugasUtama}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Garis Vertikal Penghubung ke Dewan Guru & Staf */}
                <div className="w-0.5 h-6 bg-slate-300"></div>

                {/* Level 4: Dewan Guru & Staf Pendukung */}
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Dewan Guru & Wali Kelas */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-purple-800 flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4" />
                        Dewan Guru & Wali Kelas I - VI
                      </span>
                    </div>
                    {data.strukturOrganisasi.filter(i => i.kategori === 'Dewan Guru').map(guru => (
                      <div key={guru.id} className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-purple-900">{guru.jabatan}</span>
                          <button
                            type="button"
                            onClick={() => handleOpenEditStruktur(guru)}
                            className="p-1 text-purple-600 hover:bg-purple-100 rounded"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-xs font-semibold text-slate-800">{guru.nama}</p>
                        <p className="text-[10px] font-mono text-slate-500">NIP. {guru.nip}</p>
                        <p className="text-xs text-slate-600">{guru.tugasUtama}</p>
                      </div>
                    ))}
                  </div>

                  {/* Staf Pendukung / Keamanan & Kebersihan */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        Staf Pelaksana & Layanan Khusus
                      </span>
                    </div>
                    {data.strukturOrganisasi.filter(i => i.kategori === 'Staf Pendukung').map(staf => (
                      <div key={staf.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-800">{staf.jabatan}</span>
                          <button
                            type="button"
                            onClick={() => handleOpenEditStruktur(staf)}
                            className="p-1 text-slate-600 hover:bg-slate-200 rounded"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-xs font-semibold text-slate-800">{staf.nama}</p>
                        <p className="text-[10px] font-mono text-slate-500">NIP. {staf.nip || '-'}</p>
                        <p className="text-xs text-slate-600">{staf.tugasUtama}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAMPILAN 2: DAFTAR / TABEL LENGKAP ROSTER STRUKTUR */}
          {tampilanStruktur === 'tabel' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700">
                    <tr>
                      <th className="py-3 px-4 w-12 text-center">Urutan</th>
                      <th className="py-3 px-4">Jabatan & Kategori</th>
                      <th className="py-3 px-4">Nama Personel</th>
                      <th className="py-3 px-4">NIP</th>
                      <th className="py-3 px-4">Kontak</th>
                      <th className="py-3 px-4">Tugas Pokok (Tupoksi)</th>
                      <th className="py-3 px-4 text-center w-28">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStruktur.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400 text-sm">
                          Tidak ada personel yang sesuai kriteria pencarian.
                        </td>
                      </tr>
                    ) : (
                      filteredStruktur.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 text-center font-bold text-slate-500">
                            {item.urutan}
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-bold text-slate-900">{item.jabatan}</p>
                            <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                              {item.kategori}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-800">
                            {item.nama}
                          </td>
                          <td className="py-3 px-4 font-mono text-xs text-slate-600">
                            {item.nip || '-'}
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-600">
                            {item.kontak || '-'}
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-600 max-w-xs">
                            {item.tugasUtama}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEditStruktur(item)}
                                className="p-1.5 hover:bg-emerald-50 text-emerald-700 rounded-lg transition-colors"
                                title="Edit Personel"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteStruktur(item.id, item.nama)}
                                className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                                title="Hapus Personel"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: VISI SEKOLAH */}
      {activeSubTab === 'visi' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Visi Satuan Pendidikan</h2>
                  <p className="text-xs text-slate-500">Cita-cita luhur dan arah pengembangan SD Negeri Inpres Dekai</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleOpenEditVisi}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors self-start md:self-auto"
              >
                <Edit2 className="w-4 h-4" />
                Ubah Visi & Motto
              </button>
            </div>

            {/* Visi Display Card */}
            <div className="p-6 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-2xl border border-emerald-200/80">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Pernyataan Visi:</span>
              <h3 className="text-xl md:text-2xl font-bold text-emerald-950 mt-2 leading-relaxed">
                &ldquo;{data.visiSekolah}&rdquo;
              </h3>

              <div className="mt-4 pt-4 border-t border-emerald-200/60 flex items-center gap-2 text-xs text-emerald-900">
                <span className="font-bold">Motto Sekolah:</span>
                <span className="font-semibold text-emerald-800 bg-white/80 px-2.5 py-1 rounded-lg border border-emerald-300">
                  {data.mottoSekolah}
                </span>
              </div>
            </div>

            {/* Indikator Ketercapaian Visi */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Indikator Ketercapaian Visi Sekolah
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.indikatorVisi.map((ind, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{ind}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MISI SEKOLAH */}
      {activeSubTab === 'misi' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 text-blue-800 rounded-xl">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Misi Satuan Pendidikan</h2>
                  <p className="text-xs text-slate-500">Langkah-langkah strategis untuk mewujudkan visi sekolah</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleOpenAddMisi}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors self-start md:self-auto"
              >
                <Plus className="w-4 h-4" />
                Tambah Butir Misi
              </button>
            </div>

            {/* List Misi Sekolah */}
            <div className="space-y-3">
              {data.misiSekolahList.map((misi, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-50/80 hover:bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-4 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-xl bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-sm text-slate-800 leading-relaxed font-medium">
                      {misi}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEditMisi(idx)}
                      className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-white rounded-lg transition-colors"
                      title="Edit Butir Misi"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteMisi(idx)}
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                      title="Hapus Butir Misi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: TUJUAN SEKOLAH */}
      {activeSubTab === 'tujuan' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-100 text-purple-800 rounded-xl">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Tujuan Satuan Pendidikan</h2>
                  <p className="text-xs text-slate-500">Target terukur jangka pendek, menengah, dan jangka panjang</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleOpenAddTujuan}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors self-start md:self-auto"
              >
                <Plus className="w-4 h-4" />
                Tambah Butir Tujuan
              </button>
            </div>

            {/* 3 Kategori Tujuan */}
            {(['Jangka Pendek (1 Tahun)', 'Jangka Menengah (4 Tahun)', 'Jangka Panjang'] as const).map((kat) => {
              const items = data.tujuanSekolahList
                .map((t, originalIndex) => ({ ...t, originalIndex }))
                .filter((t) => t.kategori === kat);

              return (
                <div key={kat} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${
                      kat === 'Jangka Pendek (1 Tahun)' ? 'bg-emerald-600' :
                      kat === 'Jangka Menengah (4 Tahun)' ? 'bg-blue-600' : 'bg-purple-600'
                    }`} />
                    <h3 className="font-bold text-slate-800 text-base">{kat}</h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                      {items.length} Butir
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {items.map((t, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <p className="text-xs text-slate-700 font-medium leading-relaxed">
                            {t.butir}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenEditTujuan(t.originalIndex)}
                            className="p-1 text-slate-400 hover:text-emerald-700"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTujuan(t.originalIndex)}
                            className="p-1 text-slate-400 hover:text-red-600"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 6: MISI & TUJUAN TATA USAHA (TU) */}
      {activeSubTab === 'misi_tu' && (
        <div className="space-y-6">
          {/* Card Maklumat Layanan */}
          <div className="bg-gradient-to-br from-emerald-800 to-teal-950 text-white rounded-2xl p-6 shadow-sm border border-emerald-700/60 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/10 rounded-xl">
                <Briefcase className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Administrasi Tata Usaha</span>
                <h2 className="text-xl font-bold text-white">Visi & Maklumat Pelayanan Tata Usaha Sekolah</h2>
              </div>
            </div>

            <div className="p-4 bg-white/10 rounded-xl border border-white/15">
              <p className="text-xs text-emerald-200 font-medium">Visi Tata Usaha:</p>
              <p className="text-base font-bold text-white mt-1 leading-snug">
                &ldquo;{data.visiTU}&rdquo;
              </p>
            </div>

            <div className="p-4 bg-emerald-900/60 rounded-xl border border-emerald-600/40 space-y-1">
              <p className="text-xs text-emerald-300 font-bold uppercase tracking-wide">Maklumat Komitmen Pelayanan:</p>
              <p className="text-xs text-emerald-100 leading-relaxed italic">
                &ldquo;{data.maklumatPelayananTU}&rdquo;
              </p>
            </div>
          </div>

          {/* Misi & Tujuan Tata Usaha Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Butir-butir Misi TU */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                    <Compass className="w-4 h-4" />
                  </span>
                  <h3 className="font-bold text-slate-900 text-base">Misi Pelayanan Tata Usaha</h3>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddMisiTU}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah
                </button>
              </div>

              <div className="space-y-2.5">
                {data.misiTUList.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3 text-xs text-slate-800"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{m}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditMisiTU(idx)}
                        className="p-1 text-slate-400 hover:text-emerald-700"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMisiTU(idx)}
                        className="p-1 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Target & Tujuan Tata Usaha */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-lg bg-purple-100 text-purple-800">
                    <Target className="w-4 h-4" />
                  </span>
                  <h3 className="font-bold text-slate-900 text-base">Tujuan & Target Mutu Tata Usaha</h3>
                </div>
              </div>

              <div className="space-y-2.5">
                {data.tujuanTUList.map((t, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5 text-xs text-slate-800"
                  >
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{t}</span>
                  </div>
                ))}
              </div>

              {/* Budaya 5S Pelayanan TU Pedalaman */}
              <div className="mt-4 p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1.5 text-xs">
                <p className="font-bold text-emerald-900">Budaya Layanan Prima TU (5S):</p>
                <div className="grid grid-cols-5 gap-1.5 text-center font-semibold text-emerald-800">
                  <span className="bg-white py-1 rounded border border-emerald-200">Senyum</span>
                  <span className="bg-white py-1 rounded border border-emerald-200">Sapa</span>
                  <span className="bg-white py-1 rounded border border-emerald-200">Salam</span>
                  <span className="bg-white py-1 rounded border border-emerald-200">Sopan</span>
                  <span className="bg-white py-1 rounded border border-emerald-200">Santun</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: CETAK DOKUMEN RESMI BERKOP */}
      {activeSubTab === 'cetak' && (
        <div className="space-y-4">
          <div className="no-print bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Printer className="w-4 h-4 text-emerald-700" />
              <span>Pratinjau Format Cetak Dokumen Profil Resmi Berkop Sekolah (Kertas {settings.ukuranKertas})</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={triggerPrint}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Printer className="w-4 h-4" />
                Cetak / Simpan PDF
              </button>
              <button
                type="button"
                onClick={handleExportWord}
                className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <FileText className="w-4 h-4 text-blue-600" />
                Ekspor Word
              </button>
            </div>
          </div>

          {/* Paper Sheet Preview Area */}
          <div className="flex justify-center">
            <div className={`bg-white shadow-lg border border-slate-300 p-8 md:p-12 text-slate-900 mx-auto ${
              settings.ukuranKertas === 'A4' ? 'paper-a4' : 'paper-f4'
            }`}>
              {/* Kop Surat Resmi */}
              <KopSurat settings={settings} showUploadButtons={false} variant="formal" />

              {/* Judul Dokumen */}
              <div className="text-center my-6 space-y-1 border-b-2 border-slate-900 pb-3">
                <h2 className="text-base md:text-lg font-black uppercase tracking-wider text-slate-950">
                  PROFIL, VISI, MISI, TUJUAN DAN STRUKTUR ORGANISASI SEKOLAH
                </h2>
                <p className="text-xs font-semibold text-slate-700 uppercase">
                  TAHUN AJARAN 2026/2027 &bull; {settings.namaSekolah}
                </p>
              </div>

              {/* I. Identitas Satuan Pendidikan */}
              <div className="space-y-2 mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                  I. IDENTITAS SATUAN PENDIDIKAN
                </h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                  <div className="flex"><span className="w-36 text-slate-600">1. Nama Sekolah</span><span className="font-bold">: {settings.namaSekolah}</span></div>
                  <div className="flex"><span className="w-36 text-slate-600">2. NPSN / NSS</span><span>: {settings.npsn} / {settings.nss || '-'}</span></div>
                  <div className="flex"><span className="w-36 text-slate-600">3. Status Akreditasi</span><span className="font-semibold">: {data.akreditasi}</span></div>
                  <div className="flex"><span className="w-36 text-slate-600">4. Kurikulum</span><span>: {data.kurikulum}</span></div>
                  <div className="flex"><span className="w-36 text-slate-600">5. Alamat Lengkap</span><span>: {settings.alamatSekolah}</span></div>
                  <div className="flex"><span className="w-36 text-slate-600">6. Kepala Sekolah</span><span className="font-semibold">: {settings.namaKepsek}</span></div>
                  <div className="flex"><span className="w-36 text-slate-600">7. Kepala Urusan TU</span><span>: {settings.operatorTU}</span></div>
                  <div className="flex"><span className="w-36 text-slate-600">8. Kontak / Surel</span><span>: {data.telepon} / {data.emailSekolah}</span></div>
                </div>
              </div>

              {/* II. Visi Satuan Pendidikan */}
              <div className="space-y-2 mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                  II. VISI SATUAN PENDIDIKAN
                </h3>
                <p className="text-xs italic font-bold p-2.5 bg-slate-50 border-l-3 border-emerald-700 text-slate-900">
                  &ldquo;{data.visiSekolah}&rdquo;
                </p>
                <div className="text-[11px] text-slate-700 pl-2">
                  <p className="font-semibold mb-1">Indikator Ketercapaian:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {data.indikatorVisi.map((ind, idx) => (
                      <li key={idx}>{ind}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* III. Misi Satuan Pendidikan */}
              <div className="space-y-2 mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                  III. MISI SATUAN PENDIDIKAN
                </h3>
                <ol className="list-decimal list-inside text-xs text-slate-800 space-y-1">
                  {data.misiSekolahList.map((m, idx) => (
                    <li key={idx} className="leading-relaxed">{m}</li>
                  ))}
                </ol>
              </div>

              {/* IV. Tujuan Satuan Pendidikan */}
              <div className="space-y-2 mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                  IV. TUJUAN SATUAN PENDIDIKAN
                </h3>
                <div className="space-y-2 text-xs text-slate-800">
                  <div>
                    <p className="font-bold text-slate-900">A. Jangka Pendek (1 Tahun):</p>
                    <ul className="list-disc list-inside space-y-0.5 pl-2">
                      {data.tujuanSekolahList.filter(t => t.kategori === 'Jangka Pendek (1 Tahun)').map((t, idx) => (
                        <li key={idx}>{t.butir}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">B. Jangka Menengah (4 Tahun):</p>
                    <ul className="list-disc list-inside space-y-0.5 pl-2">
                      {data.tujuanSekolahList.filter(t => t.kategori === 'Jangka Menengah (4 Tahun)').map((t, idx) => (
                        <li key={idx}>{t.butir}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">C. Jangka Panjang:</p>
                    <ul className="list-disc list-inside space-y-0.5 pl-2">
                      {data.tujuanSekolahList.filter(t => t.kategori === 'Jangka Panjang').map((t, idx) => (
                        <li key={idx}>{t.butir}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* V. Misi Tata Usaha & Maklumat */}
              <div className="space-y-2 mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                  V. VISI, MISI DAN MAKLUMAT PELAYANAN TATA USAHA (TU)
                </h3>
                <p className="text-xs"><strong>Visi TU:</strong> {data.visiTU}</p>
                <div className="text-xs">
                  <p className="font-semibold">Misi Pelayanan Tata Usaha:</p>
                  <ol className="list-decimal list-inside space-y-0.5 pl-2 mt-0.5">
                    {data.misiTUList.map((m, idx) => (
                      <li key={idx}>{m}</li>
                    ))}
                  </ol>
                </div>
                <p className="text-xs italic bg-slate-50 p-2 border-l-2 border-slate-700">
                  <strong>Maklumat Layanan:</strong> &ldquo;{data.maklumatPelayananTU}&rdquo;
                </p>
              </div>

              {/* VI. Struktur Organisasi & Personalia */}
              <div className="space-y-2 mb-8">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                  VI. STRUKTUR ORGANISASI DAN PERSONALIA SATUAN PENDIDIKAN
                </h3>
                <table className="w-full border-collapse border border-slate-900 text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-950 font-bold">
                      <th className="border border-slate-900 p-1.5 w-8 text-center">No</th>
                      <th className="border border-slate-900 p-1.5">Jabatan</th>
                      <th className="border border-slate-900 p-1.5">Nama Personel</th>
                      <th className="border border-slate-900 p-1.5">NIP</th>
                      <th className="border border-slate-900 p-1.5">Kategori</th>
                      <th className="border border-slate-900 p-1.5">Tugas Utama</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.strukturOrganisasi.sort((a, b) => a.urutan - b.urutan).map((item, idx) => (
                      <tr key={item.id}>
                        <td className="border border-slate-900 p-1.5 text-center">{idx + 1}</td>
                        <td className="border border-slate-900 p-1.5 font-bold">{item.jabatan}</td>
                        <td className="border border-slate-900 p-1.5">{item.nama}</td>
                        <td className="border border-slate-900 p-1.5 font-mono text-[11px]">{item.nip || '-'}</td>
                        <td className="border border-slate-900 p-1.5">{item.kategori}</td>
                        <td className="border border-slate-900 p-1.5 text-[11px]">{item.tugasUtama}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tanda Tangan Resmi Pengesahan */}
              <div className="pt-6 border-t border-slate-300 print-break-inside-avoid">
                <div className="grid grid-cols-2 text-center text-xs">
                  <div className="space-y-1">
                    <p>Mengetahui,</p>
                    <p className="font-bold">Kepala Sekolah</p>
                    <div className="h-20 flex items-center justify-center">
                      <span className="text-[10px] text-slate-300 italic">(Tanda Tangan & Cap Stempel)</span>
                    </div>
                    <p className="font-bold underline text-slate-950">{settings.namaKepsek}</p>
                    <p className="font-mono text-[11px]">NIP. {settings.nipKepsek}</p>
                  </div>

                  <div className="space-y-1">
                    <p>Dekai, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p className="font-bold">Kepala Urusan Tata Usaha / Operator</p>
                    <div className="h-20 flex items-center justify-center">
                      <span className="text-[10px] text-slate-300 italic">(Tanda Tangan)</span>
                    </div>
                    <p className="font-bold underline text-slate-950">{settings.operatorTU}</p>
                    <p className="font-mono text-[11px]">NIP. {settings.nipOperator}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL EDIT / TAMBAH STRUKTUR ===================== */}
      {isStrukturModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-700" />
                {editingStrukturItem ? 'Ubah Data Personel Struktur' : 'Tambah Personel Struktur Sekolah'}
              </h3>
              <button
                type="button"
                onClick={() => setIsStrukturModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Lengkap & Gelar *</label>
                <input
                  type="text"
                  placeholder="Contoh: Yohanes Wandikbo, S.Pd., M.Pd."
                  value={strukturFormData.nama || ''}
                  onChange={(e) => setStrukturFormData({ ...strukturFormData, nama: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Jabatan dalam Struktur *</label>
                  <input
                    type="text"
                    placeholder="Contoh: Kepala Sekolah / Bendahara BOS"
                    value={strukturFormData.jabatan || ''}
                    onChange={(e) => setStrukturFormData({ ...strukturFormData, jabatan: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kategori Bagian</label>
                  <select
                    value={strukturFormData.kategori || 'Tata Usaha'}
                    onChange={(e) => setStrukturFormData({ ...strukturFormData, kategori: e.target.value as StrukturKategori })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Kepala Sekolah">Kepala Sekolah</option>
                    <option value="Komite Sekolah">Komite Sekolah</option>
                    <option value="Tata Usaha">Tata Usaha</option>
                    <option value="Urusan / Koordinator">Urusan / Koordinator</option>
                    <option value="Dewan Guru">Dewan Guru</option>
                    <option value="Staf Pendukung">Staf Pendukung</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">NIP (Kosongkan jika non-PNS)</label>
                  <input
                    type="text"
                    placeholder="19920415 201903 1 007 / -"
                    value={strukturFormData.nip || ''}
                    onChange={(e) => setStrukturFormData({ ...strukturFormData, nip: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">No. Urut Tampil</label>
                  <input
                    type="number"
                    min={1}
                    value={strukturFormData.urutan || 1}
                    onChange={(e) => setStrukturFormData({ ...strukturFormData, urutan: parseInt(e.target.value) || 1 })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">No. Kontak / Telepon / WA</label>
                <input
                  type="text"
                  placeholder="0821-xxxx-xxxx"
                  value={strukturFormData.kontak || ''}
                  onChange={(e) => setStrukturFormData({ ...strukturFormData, kontak: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tugas Pokok & Fungsi (Tupoksi)</label>
                <textarea
                  rows={3}
                  placeholder="Jelaskan uraian tugas dan wewenang jabatan ini..."
                  value={strukturFormData.tugasUtama || ''}
                  onChange={(e) => setStrukturFormData({ ...strukturFormData, tugasUtama: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsStrukturModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveStrukturModal}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors"
              >
                Simpan Personel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL EDIT VISI ===================== */}
      {isVisiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-700" />
                Ubah Visi & Motto Sekolah
              </h3>
              <button
                type="button"
                onClick={() => setIsVisiModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Teks Pernyataan Visi *</label>
                <textarea
                  rows={4}
                  value={visiTextInput}
                  onChange={(e) => setVisiTextInput(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-sm"
                  placeholder="Tuliskan pernyataan visi sekolah..."
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Motto Sekolah</label>
                <input
                  type="text"
                  value={mottoTextInput}
                  onChange={(e) => setMottoTextInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  placeholder="Contoh: Cerdas, Berkarakter, Berakar Budaya Papua"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsVisiModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveVisiModal}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors"
              >
                Simpan Visi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL EDIT / TAMBAH MISI ===================== */}
      {isMisiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Compass className="w-5 h-5 text-emerald-700" />
                {editingMisiIndex !== null ? `Ubah Butir Misi #${editingMisiIndex + 1}` : 'Tambah Butir Misi Sekolah'}
              </h3>
              <button
                type="button"
                onClick={() => setIsMisiModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Teks Butir Misi *</label>
                <textarea
                  rows={4}
                  value={misiInputText}
                  onChange={(e) => setMisiInputText(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-sm"
                  placeholder="Contoh: Menyelenggarakan pembelajaran aktif dengan pendekatan kearifan lokal Papua..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsMisiModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveMisiModal}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors"
              >
                Simpan Butir Misi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL EDIT / TAMBAH MISI TU ===================== */}
      {isMisiTUModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-700" />
                {editingMisiTUIndex !== null ? `Ubah Butir Misi TU #${editingMisiTUIndex + 1}` : 'Tambah Butir Misi Tata Usaha'}
              </h3>
              <button
                type="button"
                onClick={() => setIsMisiTUModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Teks Butir Misi Tata Usaha *</label>
                <textarea
                  rows={4}
                  value={misiTUInputText}
                  onChange={(e) => setMisiTUInputText(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-sm"
                  placeholder="Contoh: Memberikan pelayanan administrasi persuratan dan Dapodik secara cepat dan ramah..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsMisiTUModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveMisiTUModal}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors"
              >
                Simpan Misi TU
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL EDIT / TAMBAH TUJUAN ===================== */}
      {isTujuanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-700" />
                {editingTujuanIndex !== null ? 'Ubah Butir Tujuan Sekolah' : 'Tambah Butir Tujuan Sekolah'}
              </h3>
              <button
                type="button"
                onClick={() => setIsTujuanModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Kategori Horizon Waktu</label>
                <select
                  value={tujuanKategoriInput}
                  onChange={(e) => setTujuanKategoriInput(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Jangka Pendek (1 Tahun)">Jangka Pendek (1 Tahun)</option>
                  <option value="Jangka Menengah (4 Tahun)">Jangka Menengah (4 Tahun)</option>
                  <option value="Jangka Panjang">Jangka Panjang</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Teks Butir Tujuan *</label>
                <textarea
                  rows={4}
                  value={tujuanTextInput}
                  onChange={(e) => setTujuanTextInput(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-sm"
                  placeholder="Contoh: 100% siswa kelas I dan II mampu membaca dan berhitung dasar..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsTujuanModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveTujuanModal}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors"
              >
                Simpan Tujuan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
