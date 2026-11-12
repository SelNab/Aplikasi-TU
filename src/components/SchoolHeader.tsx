import React, { useRef, useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  HardDriveDownload,
  HardDriveUpload,
  UserCheck,
  LogOut,
  Image,
  Sparkles,
  School,
  DownloadCloud,
  Palette,
  Monitor,
  Maximize,
  Shrink,
  Minimize2,
  Square,
  Maximize2
} from 'lucide-react';
import { SchoolSettings, AppDisplaySize } from '../types';
import { getThemeConfig } from '../utils/themeHelper';

interface SchoolHeaderProps {
  settings: SchoolSettings;
  isOnline?: boolean;
  onToggleOnline?: () => void;
  onToggleConnection?: () => void;
  onBackupUsb?: () => void;
  onExportUSB?: () => void;
  onImportUsb?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImportUSB?: (file: File) => void;
  currentUser?: string;
  onLogout?: () => void;
  onUploadLogoKiri?: (base64: string) => void;
  onUploadLogoKanan?: (base64: string) => void;
  onNavigateSettings?: () => void;
  onOpenSettings?: () => void;
  appSize?: AppDisplaySize;
  onChangeAppSize?: (size: AppDisplaySize) => void;
}

export const SchoolHeader: React.FC<SchoolHeaderProps> = ({
  settings,
  isOnline = false,
  onToggleOnline,
  onToggleConnection,
  onBackupUsb,
  onExportUSB,
  onImportUsb,
  onImportUSB,
  currentUser = 'SelNab',
  onLogout,
  onUploadLogoKiri,
  onUploadLogoKanan,
  onNavigateSettings,
  onOpenSettings,
  appSize,
  onChangeAppSize
}) => {
  const logoKiriRef = useRef<HTMLInputElement>(null);
  const logoKananRef = useRef<HTMLInputElement>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  const currentSize: AppDisplaySize = appSize || settings.ukuranAplikasi || 'sedang';

  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => {
    return !!document.fullscreenElement;
  });

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen error:', err);
    }
  };

  const containerClass = currentSize === 'full' 
    ? 'w-full max-w-none px-3 sm:px-6'
    : currentSize === 'besar'
    ? 'w-full max-w-[1700px] mx-auto px-4'
    : currentSize === 'kecil'
    ? 'w-full max-w-6xl mx-auto px-4'
    : 'max-w-7xl 2xl:max-w-[1600px] mx-auto px-4';

  const toggleConnectionHandler = onToggleOnline || onToggleConnection;
  const backupHandler = onBackupUsb || onExportUSB;
  const settingsHandler = onNavigateSettings || onOpenSettings;
  const theme = getThemeConfig(settings.temaWarna);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, isLeft: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const res = reader.result as string;
        if (isLeft) {
          if (typeof onUploadLogoKiri === 'function') {
            onUploadLogoKiri(res);
          }
        } else {
          if (typeof onUploadLogoKanan === 'function') {
            onUploadLogoKanan(res);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (typeof onImportUSB === 'function') {
        onImportUSB(file);
      } else if (typeof onImportUsb === 'function') {
        onImportUsb(e);
      }
    }
    e.target.value = '';
  };

  return (
    <header className="bg-white border-b-2 border-slate-200 shadow-sm no-print">
      {/* Top Banner: Online/Offline Mode Khusus Papua Pedalaman & Fast Action Bar */}
      <div className={`px-4 py-2 text-xs transition-colors duration-300 no-print ${
        isOnline ? 'bg-gradient-to-r from-teal-800 to-emerald-900 text-white' : 'bg-gradient-to-r from-amber-700 via-amber-800 to-orange-900 text-amber-50'
      }`}>
        <div className={`${containerClass} flex flex-wrap items-center justify-between gap-3`}>
          {/* Mode Switcher */}
          <div className="flex items-center gap-3">
            <span className="font-semibold uppercase tracking-wider text-[11px] opacity-90">
              Konektivitas Wilayah:
            </span>
            <button
              type="button"
              onClick={toggleConnectionHandler}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-xs shadow-md transition-transform transform active:scale-95 cursor-pointer border ${
                isOnline 
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-emerald-300' 
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-200 animate-pulse'
              }`}
              title="Klik untuk beralih mode jaringan"
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-950" />
                  <span>MODE ONLINE (TERHUBUNG)</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-950" />
                  <span>MODE OFFLINE (KHUSUS PAPUA PEDALAMAN)</span>
                </>
              )}
            </button>
            <span className="hidden md:inline-block text-[11px] text-slate-200">
              {isOnline 
                ? '• Siap sinkronisasi Dapodik & integrasi cloud'
                : '• Data tersimpan mandiri di perangkat lokal tanpa perlu pulsa data / sinyal'}
            </span>
          </div>

          {/* Quick Size Controller & Flashdisk / USB Sync Tools */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Quick App Size Control: Kecil | Sedang | Besar | Full */}
            <div className="flex items-center gap-0.5 bg-black/30 p-1 rounded-lg border border-white/20 shadow-xs">
              <span className="text-[10px] font-bold text-amber-200 px-1.5 flex items-center gap-1">
                <Monitor className="w-3 h-3 text-amber-300" />
                <span className="hidden xl:inline">Ukuran:</span>
              </span>
              {(['kecil', 'sedang', 'besar', 'full'] as AppDisplaySize[]).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  id={`header-size-${sz}`}
                  onClick={() => {
                    if (onChangeAppSize) {
                      onChangeAppSize(sz);
                    }
                  }}
                  className={`px-2 py-0.5 rounded text-[10.5px] font-bold capitalize transition-all cursor-pointer ${
                    currentSize === sz
                      ? 'bg-amber-400 text-slate-950 shadow-xs scale-105'
                      : 'text-white/80 hover:text-white hover:bg-white/15'
                  }`}
                  title={`Ganti ukuran aplikasi ke ${sz.toUpperCase()}`}
                >
                  {sz}
                </button>
              ))}
            </div>

            {/* Fullscreen Button */}
            <button
              type="button"
              id="btn-header-fullscreen"
              onClick={handleToggleFullscreen}
              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/20 hover:bg-white/30 text-white font-medium border border-white/20 transition-colors cursor-pointer text-[11px]"
              title={isFullscreen ? 'Keluar dari Layar Penuh' : 'Mode Layar Penuh (F11)'}
            >
              {isFullscreen ? (
                <>
                  <Shrink className="w-3.5 h-3.5 text-amber-200" />
                  <span className="hidden lg:inline">Keluar Layar Penuh</span>
                </>
              ) : (
                <>
                  <Maximize className="w-3.5 h-3.5 text-amber-200" />
                  <span className="hidden lg:inline">Layar Penuh</span>
                </>
              )}
            </button>

            <button
              type="button"
              id="btn-header-install-pwa"
              onClick={settingsHandler}
              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold border border-amber-200 shadow-xs transition-colors cursor-pointer text-[11px]"
              title="Buka Pengaturan untuk Instal Aplikasi PWA ke Laptop / HP"
            >
              <DownloadCloud className="w-3.5 h-3.5 text-slate-950" />
              <span>Instal App</span>
            </button>

            <button
              type="button"
              id="btn-header-theme"
              onClick={settingsHandler}
              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/20 hover:bg-white/30 text-white font-medium border border-white/20 transition-colors cursor-pointer text-[11px]"
              title="Pengaturan Warna Aplikasi"
            >
              <Palette className="w-3.5 h-3.5 text-amber-200" />
              <span className="hidden sm:inline">Warna</span>
            </button>

            <button
              type="button"
              onClick={backupHandler}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/20 hover:bg-black/30 text-white border border-white/20 transition-colors"
              title="Unduh file cadangan untuk dibawa dengan Flashdisk ke Kota / Posko Dapodik"
            >
              <HardDriveDownload className="w-3.5 h-3.5 text-amber-300" />
              <span>Backup Flashdisk</span>
            </button>

            <button
              type="button"
              onClick={() => importFileRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/20 hover:bg-black/30 text-white border border-white/20 transition-colors"
              title="Buka file backup dari Flashdisk"
            >
              <HardDriveUpload className="w-3.5 h-3.5 text-sky-300" />
              <span>Restore Data</span>
            </button>
            <input
              ref={importFileRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileImport}
            />

            <div className="h-4 w-px bg-white/20 mx-1"></div>

            {/* Operator Tag */}
            <div className="flex items-center gap-1 text-slate-200">
              <UserCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span className="font-semibold text-white">{currentUser}</span>
              <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-slate-200 hidden sm:inline">
                Operator TU
              </span>
            </div>

            <button
              type="button"
              id="btn-header-logout"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer border border-rose-400 active:scale-95"
              title="Keluar dari Aplikasi (Logout)"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Official Kop Surat & School Header */}
      <div className={`${containerClass} py-2.5`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Logo Kiri */}
          <div className="flex flex-col items-center group relative flex-shrink-0">
            <div className="w-16 h-16 rounded-lg border border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-slate-50 relative shadow-xs">
              {settings.logoKiri && settings.logoKiri.trim() ? (
                <img
                  src={settings.logoKiri}
                  alt="Logo Kiri Instansi"
                  className="w-full h-full object-contain p-1"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="text-center p-1 text-slate-400">
                  <School className="w-7 h-7 mx-auto text-emerald-700 opacity-80" />
                  <span className="text-[8.5px] block font-medium">Logo Kiri</span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => logoKiriRef.current?.click()}
              className="no-print mt-0.5 text-[9.5px] text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-0.5"
            >
              <Image className="w-2.5 h-2.5" /> Ganti Logo
            </button>
            <input
              ref={logoKiriRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleLogoUpload(e, true)}
            />
          </div>

          {/* Central Kop Teks */}
          <div className="text-center flex-1 px-2">
            <p className="text-xs sm:text-xs font-bold tracking-wider text-slate-700 uppercase">
              {settings.namaInstansi}
            </p>
            <h1
              className="text-base sm:text-xl font-black tracking-tight uppercase my-0.5"
              style={{ color: theme.primaryHex }}
            >
              {settings.namaSekolah}
            </h1>
            <p className="text-[11px] text-slate-600 font-medium">
              NPSN: <span className="font-bold text-slate-900">{settings.npsn}</span> | Status: Negeri (Terakreditasi) | Kurikulum Merdeka & Dapodik
            </p>
            <p className="text-[10.5px] text-slate-500 mt-0.5 leading-snug">
              {settings.alamatSekolah}
            </p>
            <div className="mt-0.5 flex items-center justify-center gap-3 text-[10px] text-slate-600 no-print">
              <span>Kepala Sekolah: <strong>{settings.namaKepsek}</strong></span>
              <span>•</span>
              <span>Operator Dapodik & TU: <strong>{settings.operatorTU}</strong></span>
            </div>
          </div>

          {/* Logo Kanan */}
          <div className="flex flex-col items-center group relative flex-shrink-0">
            <div className="w-16 h-16 rounded-lg border border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-slate-50 relative shadow-xs">
              {settings.logoKanan && settings.logoKanan.trim() ? (
                <img
                  src={settings.logoKanan}
                  alt="Logo Kanan Sekolah"
                  className="w-full h-full object-contain p-1"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="text-center p-1 text-slate-400">
                  <Sparkles className="w-7 h-7 mx-auto text-teal-700 opacity-80" />
                  <span className="text-[8.5px] block font-medium">Logo Kanan</span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => logoKananRef.current?.click()}
              className="no-print mt-0.5 text-[9.5px] text-teal-700 hover:text-teal-800 font-medium flex items-center gap-0.5"
            >
              <Image className="w-2.5 h-2.5" /> Ganti Logo
            </button>
            <input
              ref={logoKananRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleLogoUpload(e, false)}
            />
          </div>

        </div>

        {/* Triple Border Official Kop */}
        <div className="mt-2 border-b-2" style={{ borderColor: theme.primaryHex }}>
          <div className="border-b pb-[1px]" style={{ borderColor: theme.accentHex }}></div>
        </div>
      </div>
    </header>
  );
};
