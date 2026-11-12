import { ThemeColor } from '../types';

export interface ThemeConfig {
  id: ThemeColor;
  name: string;
  label: string;
  description: string;
  primaryHex: string;
  secondaryHex: string;
  accentHex: string;
  // Tailwind color classes
  headerTitleClass: string;
  headerKopBorder: string;
  headerKopSubBorder: string;
  topBannerOnline: string;
  sidebarActiveBg: string;
  sidebarActiveIcon: string;
  sidebarActiveBadge: string;
  sidebarActiveText: string;
  sidebarBadge: string;
  btnPrimary: string;
  btnPrimaryRing: string;
  badgeBg: string;
  badgeText: string;
  borderActive: string;
  cardHighlight: string;
  dotColor: string;
}

export const THEMES: Record<ThemeColor, ThemeConfig> = {
  emerald: {
    id: 'emerald',
    name: 'Hijau Zamrud',
    label: 'Hijau Zamrud (Standar Sekolah Papua)',
    description: 'Harmoni alam pegunungan Papua & keteduhan lingkungan belajar',
    primaryHex: '#047857', // emerald-700
    secondaryHex: '#065f46', // emerald-800
    accentHex: '#10b981', // emerald-500
    headerTitleClass: 'text-emerald-950',
    headerKopBorder: 'border-emerald-900',
    headerKopSubBorder: 'border-emerald-700/60',
    topBannerOnline: 'bg-gradient-to-r from-teal-800 via-emerald-850 to-emerald-900',
    sidebarActiveBg: 'bg-gradient-to-r from-emerald-600 to-emerald-700',
    sidebarActiveIcon: 'text-white',
    sidebarActiveBadge: 'bg-white text-emerald-800',
    sidebarActiveText: 'text-emerald-100',
    sidebarBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    btnPrimary: 'bg-emerald-700 hover:bg-emerald-800 text-white',
    btnPrimaryRing: 'focus:ring-emerald-500',
    badgeBg: 'bg-emerald-50 border-emerald-200',
    badgeText: 'text-emerald-800',
    borderActive: 'border-emerald-500',
    cardHighlight: 'bg-emerald-50/50 border-emerald-200',
    dotColor: 'bg-emerald-500'
  },
  blue: {
    id: 'blue',
    name: 'Biru Bahari',
    label: 'Biru Bahari (Resmi Kemendikbud & Dapodik)',
    description: 'Nuansa formal kedinasan, integritas data, dan wibawa pendidikan',
    primaryHex: '#1d4ed8', // blue-700
    secondaryHex: '#1e40af', // blue-800
    accentHex: '#3b82f6', // blue-500
    headerTitleClass: 'text-blue-950',
    headerKopBorder: 'border-blue-900',
    headerKopSubBorder: 'border-blue-700/60',
    topBannerOnline: 'bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900',
    sidebarActiveBg: 'bg-gradient-to-r from-blue-600 to-blue-700',
    sidebarActiveIcon: 'text-white',
    sidebarActiveBadge: 'bg-white text-blue-800',
    sidebarActiveText: 'text-blue-100',
    sidebarBadge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    btnPrimary: 'bg-blue-700 hover:bg-blue-800 text-white',
    btnPrimaryRing: 'focus:ring-blue-500',
    badgeBg: 'bg-blue-50 border-blue-200',
    badgeText: 'text-blue-800',
    borderActive: 'border-blue-500',
    cardHighlight: 'bg-blue-50/50 border-blue-200',
    dotColor: 'bg-blue-500'
  },
  indigo: {
    id: 'indigo',
    name: 'Indigo Edukasi',
    label: 'Indigo Edukasi (Modern & Profesional)',
    description: 'Gaya modern Kurikulum Merdeka, cerdas, inovatif, dan berwawasan luas',
    primaryHex: '#4338ca', // indigo-700
    secondaryHex: '#3730a3', // indigo-800
    accentHex: '#6366f1', // indigo-500
    headerTitleClass: 'text-indigo-950',
    headerKopBorder: 'border-indigo-900',
    headerKopSubBorder: 'border-indigo-700/60',
    topBannerOnline: 'bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950',
    sidebarActiveBg: 'bg-gradient-to-r from-indigo-600 to-indigo-700',
    sidebarActiveIcon: 'text-white',
    sidebarActiveBadge: 'bg-white text-indigo-800',
    sidebarActiveText: 'text-indigo-100',
    sidebarBadge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    btnPrimary: 'bg-indigo-700 hover:bg-indigo-800 text-white',
    btnPrimaryRing: 'focus:ring-indigo-500',
    badgeBg: 'bg-indigo-50 border-indigo-200',
    badgeText: 'text-indigo-800',
    borderActive: 'border-indigo-500',
    cardHighlight: 'bg-indigo-50/50 border-indigo-200',
    dotColor: 'bg-indigo-500'
  },
  amber: {
    id: 'amber',
    name: 'Kuning Emas Yahukimo',
    label: 'Kuning Emas Yahukimo (Kearifan Budaya & Noken)',
    description: 'Kehangatan sinar matahari lembah Dekai, anyaman noken, dan persahabatan',
    primaryHex: '#b45309', // amber-700
    secondaryHex: '#92400e', // amber-800
    accentHex: '#f59e0b', // amber-500
    headerTitleClass: 'text-amber-950',
    headerKopBorder: 'border-amber-900',
    headerKopSubBorder: 'border-amber-700/60',
    topBannerOnline: 'bg-gradient-to-r from-amber-800 via-yellow-900 to-orange-950',
    sidebarActiveBg: 'bg-gradient-to-r from-amber-600 to-amber-700',
    sidebarActiveIcon: 'text-white',
    sidebarActiveBadge: 'bg-white text-amber-900',
    sidebarActiveText: 'text-amber-100',
    sidebarBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    btnPrimary: 'bg-amber-600 hover:bg-amber-700 text-white',
    btnPrimaryRing: 'focus:ring-amber-500',
    badgeBg: 'bg-amber-50 border-amber-200',
    badgeText: 'text-amber-900',
    borderActive: 'border-amber-500',
    cardHighlight: 'bg-amber-50/50 border-amber-200',
    dotColor: 'bg-amber-500'
  },
  rose: {
    id: 'rose',
    name: 'Merah Delima',
    label: 'Merah Delima (Semangat Merah Putih & Tegas)',
    description: 'Semangat pengabdian guru di garis depan pedalaman, disiplin, dan keberanian',
    primaryHex: '#be123c', // rose-700
    secondaryHex: '#9f1239', // rose-800
    accentHex: '#f43f5e', // rose-500
    headerTitleClass: 'text-rose-950',
    headerKopBorder: 'border-rose-900',
    headerKopSubBorder: 'border-rose-700/60',
    topBannerOnline: 'bg-gradient-to-r from-rose-900 via-red-950 to-pink-950',
    sidebarActiveBg: 'bg-gradient-to-r from-rose-600 to-rose-700',
    sidebarActiveIcon: 'text-white',
    sidebarActiveBadge: 'bg-white text-rose-900',
    sidebarActiveText: 'text-rose-100',
    sidebarBadge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    btnPrimary: 'bg-rose-700 hover:bg-rose-800 text-white',
    btnPrimaryRing: 'focus:ring-rose-500',
    badgeBg: 'bg-rose-50 border-rose-200',
    badgeText: 'text-rose-900',
    borderActive: 'border-rose-500',
    cardHighlight: 'bg-rose-50/50 border-rose-200',
    dotColor: 'bg-rose-500'
  },
  teal: {
    id: 'teal',
    name: 'Hijau Toska',
    label: 'Hijau Toska (Sejuk & Konsentrasi Tinggi)',
    description: 'Kesejukan sungai pedalaman Yahukimo, kenyamanan membaca dan ketelitian TU',
    primaryHex: '#0f766e', // teal-700
    secondaryHex: '#115e59', // teal-800
    accentHex: '#14b8a6', // teal-500
    headerTitleClass: 'text-teal-950',
    headerKopBorder: 'border-teal-900',
    headerKopSubBorder: 'border-teal-700/60',
    topBannerOnline: 'bg-gradient-to-r from-teal-900 via-cyan-950 to-emerald-950',
    sidebarActiveBg: 'bg-gradient-to-r from-teal-600 to-teal-700',
    sidebarActiveIcon: 'text-white',
    sidebarActiveBadge: 'bg-white text-teal-900',
    sidebarActiveText: 'text-teal-100',
    sidebarBadge: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    btnPrimary: 'bg-teal-700 hover:bg-teal-800 text-white',
    btnPrimaryRing: 'focus:ring-teal-500',
    badgeBg: 'bg-teal-50 border-teal-200',
    badgeText: 'text-teal-900',
    borderActive: 'border-teal-500',
    cardHighlight: 'bg-teal-50/50 border-teal-200',
    dotColor: 'bg-teal-500'
  },
  purple: {
    id: 'purple',
    name: 'Ungu Lembayung',
    label: 'Ungu Lembayung (Kreativitas & P5)',
    description: 'Inovasi kurikulum, keanggunan seni tari Papua, dan karakter mulia peserta didik',
    primaryHex: '#7e22ce', // purple-700
    secondaryHex: '#6b21a8', // purple-800
    accentHex: '#a855f7', // purple-500
    headerTitleClass: 'text-purple-950',
    headerKopBorder: 'border-purple-900',
    headerKopSubBorder: 'border-purple-700/60',
    topBannerOnline: 'bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-950',
    sidebarActiveBg: 'bg-gradient-to-r from-purple-600 to-purple-700',
    sidebarActiveIcon: 'text-white',
    sidebarActiveBadge: 'bg-white text-purple-900',
    sidebarActiveText: 'text-purple-100',
    sidebarBadge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    btnPrimary: 'bg-purple-700 hover:bg-purple-800 text-white',
    btnPrimaryRing: 'focus:ring-purple-500',
    badgeBg: 'bg-purple-50 border-purple-200',
    badgeText: 'text-purple-900',
    borderActive: 'border-purple-500',
    cardHighlight: 'bg-purple-50/50 border-purple-200',
    dotColor: 'bg-purple-500'
  },
  slate: {
    id: 'slate',
    name: 'Abu-Abu Elegan',
    label: 'Abu-Abu Elegan (Minimalis & Kontras Tinggi)',
    description: 'Tampilan bersih, tenang, hemat daya baterai laptop, dan fokus tinggi pada teks arsip',
    primaryHex: '#334155', // slate-700
    secondaryHex: '#1e293b', // slate-800
    accentHex: '#64748b', // slate-500
    headerTitleClass: 'text-slate-900',
    headerKopBorder: 'border-slate-800',
    headerKopSubBorder: 'border-slate-600/60',
    topBannerOnline: 'bg-gradient-to-r from-slate-800 via-slate-900 to-zinc-950',
    sidebarActiveBg: 'bg-gradient-to-r from-slate-700 to-slate-800',
    sidebarActiveIcon: 'text-white',
    sidebarActiveBadge: 'bg-white text-slate-800',
    sidebarActiveText: 'text-slate-200',
    sidebarBadge: 'bg-slate-600/30 text-slate-300 border-slate-500/30',
    btnPrimary: 'bg-slate-800 hover:bg-slate-900 text-white',
    btnPrimaryRing: 'focus:ring-slate-500',
    badgeBg: 'bg-slate-100 border-slate-300',
    badgeText: 'text-slate-800',
    borderActive: 'border-slate-600',
    cardHighlight: 'bg-slate-100 border-slate-300',
    dotColor: 'bg-slate-600'
  }
};

export const getThemeConfig = (color?: ThemeColor): ThemeConfig => {
  if (color && THEMES[color]) {
    return THEMES[color];
  }
  return THEMES.emerald;
};
