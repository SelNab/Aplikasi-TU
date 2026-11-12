import React, { useState } from 'react';
import {
  Users,
  CalendarCheck,
  GraduationCap,
  ClipboardList,
  Mail,
  Package,
  BookOpen,
  Building2,
  DollarSign,
  IdCard,
  FileBarChart,
  FolderArchive,
  Settings,
  UserCheck,
  Search,
  ChevronRight,
  Menu,
  X,
  Layers,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
  ShieldCheck,
  BookOpenCheck,
  BookMarked,
  CalendarDays,
  Lock,
  Unlock,
  School,
  LogOut
} from 'lucide-react';


export type MainTab =
  | 'siswa'
  | 'absen_siswa'
  | 'guru'
  | 'absen_guru'
  | 'jadwal_piket'
  | 'jadwal_pelajaran'
  | 'kurikulum'
  | 'kalender_akademik'
  | 'surat'
  | 'atk'
  | 'perpustakaan'
  | 'sarpras'
  | 'keuangan'
  | 'kartu_id'
  | 'laporan'
  | 'arsip'
  | 'profil_sekolah'
  | 'pengaturan'
  | 'profil_pengembang';

interface NavigationMenuProps {
  activeTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
  badgeCounts: {
    siswa: number;
    guru: number;
    surat: number;
    atk: number;
    perpus: number;
    sarpras: number;
    jadwalPiket?: number;
    jadwalPelajaran?: number;
    kurikulum?: number;
    kalenderAkademik?: number;
  };
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isDevProfileUnlocked?: boolean;
  onLogout?: () => void;
}

export type MenuCategory =
  | 'Profil & Pengaturan'
  | 'Kesiswaan & Guru'
  | 'Kurikulum & Pembelajaran'
  | 'Persuratan & Sarana'
  | 'Keuangan & Arsip';

interface MenuItem {
  id: MainTab;
  label: string;
  category: MenuCategory;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  desc: string;
}

export const NavigationMenu: React.FC<NavigationMenuProps> = ({
  activeTab,
  onSelectTab,
  badgeCounts,
  isCollapsed = false,
  onToggleCollapse,
  isDevProfileUnlocked = false,
  onLogout
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const menuItems: MenuItem[] = [
    {
      id: 'profil_sekolah',
      label: 'Profil Sekolah',
      category: 'Profil & Pengaturan',
      icon: School,
      desc: 'Struktur, Visi, Misi & Misi TU'
    },
    {
      id: 'pengaturan',
      label: 'Pengaturan Sekolah',
      category: 'Profil & Pengaturan',
      icon: Settings,
      desc: 'Kop Sekolah, Logo & Identitas'
    },
    {
      id: 'profil_pengembang',
      label: 'Profil Pengembang',
      category: 'Profil & Pengaturan',
      icon: isDevProfileUnlocked ? UserCheck : Lock,
      desc: isDevProfileUnlocked ? 'Selpius Nabyal, S.Pd.Gr. (Terbuka)' : 'Terkunci (Khusus Pengembang)'
    },
    {
      id: 'siswa',
      label: 'Data Siswa',
      category: 'Kesiswaan & Guru',
      icon: Users,
      badge: badgeCounts.siswa,
      desc: 'Identitas, Mutasi & Alumni'
    },
    {
      id: 'absen_siswa',
      label: 'Absen Siswa',
      category: 'Kesiswaan & Guru',
      icon: CalendarCheck,
      desc: 'Presensi Harian & Rekapan Kelas'
    },
    {
      id: 'guru',
      label: 'Guru & GTK',
      category: 'Kesiswaan & Guru',
      icon: GraduationCap,
      badge: badgeCounts.guru,
      desc: 'Data Tenaga Pendidik & Pegawai'
    },
    {
      id: 'absen_guru',
      label: 'Absen Guru',
      category: 'Kesiswaan & Guru',
      icon: ClipboardList,
      desc: 'Kehadiran Harian & Bulanan Guru'
    },
    {
      id: 'jadwal_piket',
      label: 'Jadwal Piket',
      category: 'Kurikulum & Pembelajaran',
      icon: ShieldCheck,
      badge: badgeCounts.jadwalPiket,
      desc: 'Petugas Piket Guru & Siswa'
    },
    {
      id: 'jadwal_pelajaran',
      label: 'Jadwal Pelajaran',
      category: 'Kurikulum & Pembelajaran',
      icon: BookOpenCheck,
      badge: badgeCounts.jadwalPelajaran,
      desc: 'Jadwal Kelas I-VI Kurikulum Merdeka'
    },
    {
      id: 'kurikulum',
      label: 'Kurikulum & Perangkat',
      category: 'Kurikulum & Pembelajaran',
      icon: BookMarked,
      badge: badgeCounts.kurikulum,
      desc: 'Struktur, Modul Ajar & P5 Papua'
    },
    {
      id: 'kalender_akademik',
      label: 'Kalender Akademik',
      category: 'Kurikulum & Pembelajaran',
      icon: CalendarDays,
      badge: badgeCounts.kalenderAkademik,
      desc: 'Tanggal Penting, Libur & Ujian'
    },
    {
      id: 'surat',
      label: 'Administrasi Surat',
      category: 'Persuratan & Sarana',
      icon: Mail,
      badge: badgeCounts.surat,
      desc: 'Surat Masuk, Keluar, Mutasi & SK'
    },
    {
      id: 'atk',
      label: 'Administrasi ATK',
      category: 'Persuratan & Sarana',
      icon: Package,
      badge: badgeCounts.atk,
      desc: 'Buku Pengambilan & Stok ATK'
    },
    {
      id: 'perpustakaan',
      label: 'Perpustakaan',
      category: 'Persuratan & Sarana',
      icon: BookOpen,
      badge: badgeCounts.perpus,
      desc: 'Buku, Peminjaman & Pengembalian'
    },
    {
      id: 'sarpras',
      label: 'Sarana & Prasarana',
      category: 'Persuratan & Sarana',
      icon: Building2,
      badge: badgeCounts.sarpras,
      desc: 'Inventaris Ruang, Gedung & Aset'
    },
    {
      id: 'keuangan',
      label: 'Keuangan Sekolah',
      category: 'Keuangan & Arsip',
      icon: DollarSign,
      desc: 'Buku Kas BOS & Pembukuan'
    },
    {
      id: 'kartu_id',
      label: 'Kartu ID Card',
      category: 'Keuangan & Arsip',
      icon: IdCard,
      desc: 'Cetak Kartu Siswa & Guru'
    },
    {
      id: 'laporan',
      label: 'Rekap & Laporan',
      category: 'Keuangan & Arsip',
      icon: FileBarChart,
      desc: 'Laporan Rekapitulasi Tahunan'
    },
    {
      id: 'arsip',
      label: 'Arsip Dokumen',
      category: 'Keuangan & Arsip',
      icon: FolderArchive,
      desc: 'Penguncian & Penyimpanan Data'
    }
  ];

  const filteredItems = searchQuery.trim()
    ? menuItems.filter(
        (item) =>
          item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : menuItems;

  const currentActiveItem = menuItems.find((m) => m.id === activeTab) || menuItems[0];
  const CurrentIcon = currentActiveItem.icon;

  const categories: MenuCategory[] = [
    'Profil & Pengaturan',
    'Kesiswaan & Guru',
    'Kurikulum & Pembelajaran',
    'Persuratan & Sarana',
    'Keuangan & Arsip'
  ];

  return (
    <nav aria-label="Menu Utama Administrasi" className="w-full">
      {/* Mobile Toggle Bar */}
      <div className="md:hidden bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md mb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <CurrentIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Menu Aktif</p>
              <p className="text-xs font-bold text-emerald-300 truncate">{currentActiveItem.label}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow transition-colors"
          >
            {isMobileOpen ? (
              <>
                <X className="w-4 h-4" />
                <span>Tutup Menu</span>
              </>
            ) : (
              <>
                <Menu className="w-4 h-4" />
                <span>Daftar Menu (14)</span>
                <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Left Side Menu Card (Always visible on md+, collapsible on mobile and toggleable) */}
      <div
        className={`${
          isMobileOpen ? 'block' : 'hidden'
        } md:block bg-slate-900 border border-slate-800 rounded-xl shadow-lg overflow-hidden text-slate-200 transition-all`}
      >
        {/* Menu Header with optional Collapse/Expand Toggle */}
        <div className="p-3.5 bg-gradient-to-b from-slate-850 to-slate-900 border-b border-slate-800">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm ring-2 ring-emerald-400/30 flex-shrink-0">
                <Layers className="w-4.5 h-4.5" />
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <h2 className="text-xs font-black tracking-wider text-white uppercase truncate">Menu Utama Administrasi</h2>
                  <p className="text-[10.5px] text-emerald-400 font-medium truncate">14 Modul Tata Usaha Sekolah</p>
                </div>
              )}
            </div>

            {/* Desktop Collapse Button */}
            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden md:inline-flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title={isCollapsed ? "Perluas Menu Sidebar" : "Perkecil Menu Sidebar"}
              >
                {isCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
              </button>
            )}
          </div>

          {/* Quick Search in Menu (Hidden when collapsed) */}
          {!isCollapsed && (
            <div className="relative mt-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari menu & formulir..."
                className="w-full bg-slate-800 border border-slate-700/80 rounded-lg pl-8 pr-7 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  title="Hapus pencarian"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Menu Items List */}
        <div className={`p-2 space-y-2.5 max-h-[calc(100vh-210px)] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-750 ${isCollapsed ? 'px-1' : ''}`}>
          {!isCollapsed && searchQuery.trim() ? (
            /* Search Results View */
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-0.5">
                Hasil Pencarian ({filteredItems.length})
              </p>
              {filteredItems.length === 0 ? (
                <div className="text-center py-4 px-2">
                  <p className="text-xs text-slate-400">Modul tidak ditemukan</p>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-emerald-400 hover:underline mt-1 block mx-auto"
                  >
                    Tampilkan Semua Menu
                  </button>
                </div>
              ) : (
                filteredItems.map((item) => renderButton(item))
              )}
            </div>
          ) : (
            /* Categorized Menu List */
            categories.map((category) => {
              const itemsInCategory = menuItems.filter((m) => m.category === category);
              if (itemsInCategory.length === 0) return null;

              return (
                <div key={category} className="space-y-0.5">
                  {!isCollapsed && (
                    <div className="px-2 pt-1 pb-0.5">
                      <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-slate-400">
                        {category}
                      </span>
                    </div>
                  )}

                  <div className="space-y-0.5">
                    {itemsInCategory.map((item) => renderButton(item))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Quick Logout Button */}
        {onLogout && (
          <div className="p-2 border-t border-slate-800/80 bg-slate-950/40">
            <button
              type="button"
              id="btn-nav-logout"
              onClick={onLogout}
              className={`w-full py-1.5 px-2.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/80 text-rose-200 border border-rose-800/60 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95 ${
                isCollapsed ? 'p-2' : ''
              }`}
              title="Keluar dari Aplikasi (Logout)"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              {!isCollapsed && <span>Keluar dari Aplikasi</span>}
            </button>
          </div>
        )}

        {/* Menu Footer Card */}
        {!isCollapsed && (
          <div className="p-2 bg-slate-950/60 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <div className="flex items-center gap-1.5 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              <span className="truncate">SD Pedalaman Papua</span>
            </div>
            <span className="text-emerald-400 font-mono font-semibold flex-shrink-0">v2.5</span>
          </div>
        )}
      </div>
    </nav>
  );

  function renderButton(item: MenuItem) {
    const Icon = item.icon;
    const isActive = activeTab === item.id;

    if (isCollapsed) {
      return (
        <button
          key={item.id}
          type="button"
          onClick={() => {
            onSelectTab(item.id);
            setIsMobileOpen(false);
          }}
          title={`${item.label} - ${item.desc}`}
          className={`w-full p-2 rounded-lg transition-all flex items-center justify-center group cursor-pointer relative ${
            isActive
              ? 'bg-emerald-600 text-white shadow-md'
              : 'hover:bg-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          <Icon className="w-4 h-4" />
          {item.id === 'profil_pengembang' && (
            <span
              className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center ring-2 ring-slate-900 ${
                isDevProfileUnlocked ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
              }`}
              title={isDevProfileUnlocked ? 'Profil Terbuka' : 'Profil Terkunci (Khusus Pengembang)'}
            >
              {isDevProfileUnlocked ? <Unlock className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
            </span>
          )}
          {item.badge !== undefined && item.badge > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-slate-900">
              {item.badge}
            </span>
          )}
        </button>
      );
    }

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => {
          onSelectTab(item.id);
          setIsMobileOpen(false);
        }}
        className={`w-full text-left px-2.5 py-2 rounded-lg transition-all flex items-center justify-between group cursor-pointer ${
          isActive
            ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-sm font-bold'
            : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
              isActive
                ? 'bg-white/20 text-white shadow-xs'
                : 'bg-slate-800 text-emerald-400 group-hover:bg-slate-700 group-hover:text-emerald-300'
            }`}
          >
            <Icon className="w-4 h-4" />
          </div>

          <div className="min-w-0">
            <p
              className={`text-xs truncate leading-snug ${
                isActive ? 'text-white font-bold' : 'font-semibold text-slate-200 group-hover:text-white'
              }`}
            >
              {item.label}
            </p>
            <p
              className={`text-[10px] truncate leading-tight ${
                isActive ? 'text-emerald-100' : 'text-slate-400 group-hover:text-slate-300'
              }`}
            >
              {item.desc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0 ml-1.5">
          {item.id === 'profil_pengembang' && (
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] font-bold ${
                isDevProfileUnlocked
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}
            >
              {isDevProfileUnlocked ? (
                <>
                  <Unlock className="w-2.5 h-2.5 text-emerald-400" />
                  <span className="hidden sm:inline">Buka</span>
                </>
              ) : (
                <>
                  <Lock className="w-2.5 h-2.5 text-rose-400" />
                  <span>Kunci</span>
                </>
              )}
            </span>
          )}
          {item.badge !== undefined && item.badge > 0 && (
            <span
              className={`px-1.5 py-0.5 rounded-full text-[9.5px] font-black min-w-[16px] text-center ${
                isActive
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 group-hover:bg-emerald-500/30'
              }`}
            >
              {item.badge}
            </span>
          )}
          <ChevronRight
            className={`w-3 h-3 transition-transform ${
              isActive
                ? 'text-white translate-x-0.5'
                : 'text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5'
            }`}
          />
        </div>
      </button>
    );
  }
};
