import React, { useState, useRef } from 'react';
import { SchoolSettings, PaperSize } from '../../types';
import { ActionToolbar } from '../ActionToolbar';
import { triggerPrint, exportToWord, exportToExcel, exportToPPT } from '../../utils/exportHelpers';
import {
  Award,
  BookOpen,
  CheckCircle,
  GraduationCap,
  HeartHandshake,
  MapPin,
  ShieldCheck,
  Sparkles,
  WifiOff,
  Wifi,
  Quote,
  Upload,
  RotateCcw,
  Camera,
  Mail,
  School,
  Heart,
  Compass,
  FileCheck,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  Home
} from 'lucide-react';

interface ProfilPengembangModuleProps {
  settings: SchoolSettings;
  onHome: () => void;
  notifyMessage: (msg?: string) => void;
  onSync: () => void;
  isUnlocked?: boolean;
  onUnlock?: () => void;
  onLock?: () => void;
}

const DEFAULT_DEV_PHOTO = '/foto_pengembang.jpg';
const DEVELOPER_KEY = '123093';

export const ProfilPengembangModule: React.FC<ProfilPengembangModuleProps> = ({
  settings,
  onHome,
  notifyMessage,
  onSync,
  isUnlocked,
  onUnlock,
  onLock
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [internalUnlocked, setInternalUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('tusekolah_dev_profile_unlocked') === 'true';
    } catch {
      return false;
    }
  });

  const isModuleUnlocked = isUnlocked !== undefined ? isUnlocked : internalUnlocked;

  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  const handleUnlock = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pinInput.trim() === DEVELOPER_KEY) {
      setPinError(null);
      setInternalUnlocked(true);
      try {
        sessionStorage.setItem('tusekolah_dev_profile_unlocked', 'true');
      } catch (err) {
        console.error(err);
      }
      onUnlock?.();
      notifyMessage('Kunci Profil Pengembang Terbuka! Selamat Datang Bapak Selpius Nabyal, S.Pd.Gr.');
    } else {
      setPinError('Kunci salah! Akses ditolak. Hanya Pengembang (Selpius Nabyal, S.Pd.Gr.) yang berhak membuka profil ini.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);
      notifyMessage('Kunci Salah! Akses Pengembang Ditolak.');
    }
  };

  const handleLock = () => {
    setInternalUnlocked(false);
    try {
      sessionStorage.removeItem('tusekolah_dev_profile_unlocked');
    } catch (err) {
      console.error(err);
    }
    setPinInput('');
    setPinError(null);
    onLock?.();
    notifyMessage('Profil Pengembang Berhasil Dikunci! Akses hanya untuk Pengembang.');
  };

  const handleKeypadPress = (val: string) => {
    if (pinInput.length < 10) {
      setPinInput((prev) => prev + val);
      setPinError(null);
    }
  };

  const handleKeypadBackspace = () => {
    setPinInput((prev) => prev.slice(0, -1));
    setPinError(null);
  };

  const handleKeypadClear = () => {
    setPinInput('');
    setPinError(null);
  };
  const [devPhoto, setDevPhoto] = useState<string>(() => {
    try {
      return localStorage.getItem('tusekolah_dev_photo') || DEFAULT_DEV_PHOTO;
    } catch {
      return DEFAULT_DEV_PHOTO;
    }
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        notifyMessage('Ukuran foto maksimal 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          setDevPhoto(result);
          try {
            localStorage.setItem('tusekolah_dev_photo', result);
          } catch (err) {
            console.error('Failed to save to localStorage', err);
          }
          notifyMessage('Foto Pengembang Berhasil Diperbarui!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetPhoto = () => {
    setDevPhoto(DEFAULT_DEV_PHOTO);
    try {
      localStorage.removeItem('tusekolah_dev_photo');
    } catch (err) {
      console.error(err);
    }
    notifyMessage('Foto Pengembang Dikembalikan ke Foto Asli');
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleExportWord = () => {
    const wordContent = `
      <div style="font-family: Arial, sans-serif;">
        <h2 style="text-align: center; color: #064e3b; margin-bottom: 5px;">PROFIL PENGEMBANG APLIKASI ADMINISTRASI TATA USAHA</h2>
        <h4 style="text-align: center; color: #555; margin-top: 0;">SELPIUS NABYAL, S.Pd.Gr. — GURU SD PEDALAMAN PAPUA</h4>
        <hr style="border: 1px solid #064e3b; margin-bottom: 20px;" />
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr><td style="padding: 6px; font-weight: bold; width: 35%;">Nama Lengkap</td><td style="padding: 6px;">Selpius Nabyal, S.Pd.Gr.</td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">Profesi / Jabatan</td><td style="padding: 6px;">Guru Sekolah Dasar (SD) Pedalaman Papua</td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">Kabupaten / Provinsi</td><td style="padding: 6px;">Kab. Pegunungan Bintang, Provinsi Papua Pegunungan</td></tr>
          <tr><td style="padding: 6px; font-weight: bold;">Kontak / Email</td><td style="padding: 6px;">keleyalakelena123093@gmail.com</td></tr>
        </table>

        <h3 style="color: #b45309; border-bottom: 2px solid #f59e0b; padding-bottom: 4px;">MOTO PENGABDIAN & PELAYANAN</h3>
        <p style="font-size: 14pt; font-style: italic; font-weight: bold; color: #1e293b;">
          1. "Mengajar dan Melayani Tanpa Mengharapkan Imbalan."
        </p>
        <p style="font-size: 14pt; font-style: italic; font-weight: bold; color: #064e3b;">
          2. "Berangkat, berjalan, tiba, kerja dengan yesus."
        </p>
      </div>
    `;
    exportToWord('Profil_Pengembang_Selpius_Nabyal', wordContent);
    notifyMessage('Profil Pengembang Berhasil Diunduh (Word)');
  };

  const handleExportExcel = () => {
    exportToExcel(
      'Profil_Pengembang_Selpius_Nabyal',
      ['No', 'Kategori', 'Keterangan'],
      [
        ['1', 'Nama Pengembang', 'Selpius Nabyal, S.Pd.Gr.'],
        ['2', 'Profesi', 'Guru SD Pedalaman Papua & Pengembang Aplikasi TU'],
        ['3', 'Wilayah', 'Kab. Pegunungan Bintang, Papua Pegunungan'],
        ['4', 'Motto 1', 'Mengajar dan Melayani Tanpa Mengharapkan Imbalan.'],
        ['5', 'Motto 2', 'Berangkat, berjalan, tiba, kerja dengan yesus.'],
        ['6', 'Kontak', 'keleyalakelena123093@gmail.com']
      ]
    );
    notifyMessage('Profil Pengembang Berhasil Diunduh (Excel)');
  };

  const handleExportPPT = () => {
    exportToPPT('Presentasi_Profil_Pengembang', [
      {
        title: 'Profil Pengembang Aplikasi TU',
        subtitle: 'Selpius Nabyal, S.Pd.Gr. - Guru SD Pedalaman Papua',
        bullets: [
          'Nama: Selpius Nabyal, S.Pd.Gr.',
          'Profesi: Guru SD di Kabupaten Pegunungan Bintang, Papua Pegunungan',
          'Penggagas Aplikasi Administrasi Tata Usaha Khusus Pedalaman 3T',
          'Sistem 100% Offline, Mandiri, dan Sesuai Standar Dapodik Kemendikbud'
        ]
      },
      {
        title: 'Motto Pengabdian Guru Pedalaman',
        subtitle: 'Pegangan Hidup & Dedikasi Pelayanan',
        bullets: [
          'Motto 1: "Mengajar dan Melayani Tanpa Mengharapkan Imbalan."',
          'Motto 2: "Berangkat, berjalan, tiba, kerja dengan yesus."',
          'Didedikasikan untuk kemajuan pendidikan anak-anak pedalaman Papua.'
        ]
      }
    ]);
    notifyMessage('Presentasi Profil Pengembang Berhasil Diunduh (PPT)');
  };

  // If locked, render the Developer Security Lock Screen
  if (!isModuleUnlocked) {
    return (
      <div className="space-y-4">
        <ActionToolbar
          titleContext="PENGAMANAN SISTEM > PROFIL PENGEMBANG (TERKUNCI)"
          onHome={onHome}
          onBack={onHome}
          onRefresh={() => {
            setPinInput('');
            setPinError(null);
            notifyMessage('Tampilan Direset');
          }}
          isLocked={true}
          notifyMessage={notifyMessage}
        />

        <div className="max-w-md mx-auto my-4 sm:my-8 bg-white rounded-2xl border-2 border-emerald-600/30 shadow-2xl overflow-hidden animate-fadeIn">
          {/* Header with Developer Photo */}
          <div className="bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 p-6 text-center text-white relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/5 rounded-full blur-xl pointer-events-none" />

            <div className="relative inline-block mx-auto mb-3">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-amber-400 shadow-xl bg-slate-800">
                <img
                  src={devPhoto}
                  alt="Selpius Nabyal, S.Pd.Gr."
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    if (e.currentTarget.src !== DEFAULT_DEV_PHOTO) {
                      e.currentTarget.src = DEFAULT_DEV_PHOTO;
                    }
                  }}
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-rose-600 text-white border-2 border-white flex items-center justify-center shadow-md">
                <Lock className="w-4 h-4" />
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-900/80 border border-rose-400/60 text-rose-200 text-[11px] font-bold uppercase tracking-wider mb-2 shadow-xs">
              <Lock className="w-3 h-3 text-rose-300" />
              <span>Akses Terkunci</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Profil Pengembang Terkunci
            </h1>
            <p className="text-xs text-emerald-200 mt-1 font-semibold">
              Selpius Nabyal, S.Pd.Gr. — Guru SD Pedalaman Papua
            </p>
          </div>

          {/* Form & PIN Entry */}
          <div className="p-6 space-y-4">
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs leading-relaxed flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900">Hanya Dapat Dibuka oleh Pengembang</p>
                <p className="text-amber-800 text-[11.5px] mt-0.5">
                  Halaman ini memuat identitas sah, foto resmi, visi, moto pelayanan, dan kredensial utama sistem. Masukkan kunci pengembang untuk membuka akses.
                </p>
              </div>
            </div>

            {pinError && (
              <div className="p-3 rounded-xl bg-rose-50 border-2 border-rose-400 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            <form onSubmit={handleUnlock} className={`space-y-4 ${isShaking ? 'animate-pulse' : ''}`}>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Kunci Pengembang:
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4 text-emerald-600" />
                  </div>
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value);
                      setPinError(null);
                    }}
                    placeholder="Masukkan Kunci Pengembang..."
                    autoFocus
                    maxLength={10}
                    className="w-full pl-10 pr-12 py-3 bg-slate-50 border-2 border-slate-300 rounded-xl font-mono text-xl tracking-widest text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showPin ? 'Sembunyikan Kunci' : 'Tampilkan Kunci'}
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* On-Screen Touch Keypad */}
              <div className="pt-1">
                <div className="grid grid-cols-3 gap-2">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                    <button
                      key={digit}
                      type="button"
                      onClick={() => handleKeypadPress(digit)}
                      className="py-2.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-800 font-bold text-lg rounded-lg border border-slate-200 shadow-xs active:scale-95 transition-all cursor-pointer"
                    >
                      {digit}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleKeypadClear}
                    className="py-2.5 bg-slate-100 hover:bg-rose-50 text-rose-700 font-semibold text-xs rounded-lg border border-slate-200 shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
                    Bersihkan
                  </button>
                  <button
                    type="button"
                    onClick={() => handleKeypadPress('0')}
                    className="py-2.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-800 font-bold text-lg rounded-lg border border-slate-200 shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={handleKeypadBackspace}
                    className="py-2.5 bg-slate-100 hover:bg-amber-50 text-amber-800 font-semibold text-xs rounded-lg border border-slate-200 shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
                    ⌫ Hapus
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  id="btn-buka-kunci-pengembang"
                  disabled={!pinInput.trim()}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                    pinInput.trim()
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400/50'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Unlock className="w-4 h-4" />
                  <span>Buka Kunci Profil Pengembang</span>
                </button>

                <button
                  type="button"
                  onClick={onHome}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Home className="w-4 h-4" />
                  <span>Kembali ke Beranda (Data Siswa)</span>
                </button>
              </div>
            </form>

            <div className="text-center pt-2 border-t border-slate-100">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Kunci Akses Rahasia Pengembang — Hanya Diketahui Oleh Pengembang</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ActionToolbar
        titleContext="PROFIL PENGEMBANG APLIKASI > SELPIUS NABYAL, S.Pd.Gr."
        onHome={onHome}
        onAddNew={() => notifyMessage('Data Anda Berhasil Disimpan')}
        onSave={() => notifyMessage('Data Profil Berhasil Disimpan')}
        onView={() => triggerPrint()}
        onDelete={handleResetPhoto}
        onSearch={() => {}}
        onEdit={handleTriggerUpload}
        onCancel={() => {}}
        onBack={onHome}
        onArchive={() => notifyMessage('Data Anda Berhasil Disimpan')}
        onLock={handleLock}
        onReview={() => triggerPrint()}
        onPrint={triggerPrint}
        onUpdate={() => notifyMessage('Data Anda Berhasil Disimpan')}
        onTemplate={() => notifyMessage('Data Format Profil Telah Dimuat')}
        onPdf={triggerPrint}
        onExcel={handleExportExcel}
        onWord={handleExportWord}
        onPpt={handleExportPPT}
        onUploadPhoto={handleTriggerUpload}
        onRefresh={() => notifyMessage('Tampilan Profil Telah Disinkronkan')}
        onSync={onSync}
        onReset={handleResetPhoto}
        isLocked={false}
        paperSize={settings.ukuranKertas}
        onChangePaperSize={() => {}}
        notifyMessage={notifyMessage}
      />

      {/* Developer Security Status Bar with Direct Lock Button */}
      <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs no-print">
        <div className="flex items-center gap-2.5 text-emerald-950">
          <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
            <Unlock className="w-4 h-4" />
          </div>
          <div>
            <span className="font-black text-emerald-900">Kunci Profil Pengembang Terbuka</span>
            <span className="text-emerald-700 hidden sm:inline"> — Anda memiliki akses penuh ke profil Selpius Nabyal, S.Pd.Gr.</span>
          </div>
        </div>

        <button
          type="button"
          id="btn-kunci-profil-top"
          onClick={handleLock}
          className="w-full sm:w-auto px-4 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer border border-rose-500"
          title="Kunci Profil Pengembang Sekarang"
        >
          <Lock className="w-4 h-4" />
          <span>KUNCI PROFIL PENGEMBANG</span>
        </button>
      </div>

      {/* Hidden file input for uploading developer photo */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/*"
        className="hidden"
      />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" id="area-profil-pengembang">
        {/* Banner Header with Official Photo & Badges */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white p-6 relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-white/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
            {/* Developer Official Photo Container */}
            <div className="relative group flex-shrink-0">
              <div className="w-36 h-40 sm:w-40 sm:h-44 rounded-2xl bg-white p-1.5 border-4 border-amber-400 shadow-2xl overflow-hidden flex items-center justify-center relative">
                <img
                  src={devPhoto}
                  alt="Selpius Nabyal, S.Pd.Gr. - Pengembang Aplikasi"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback to default if loaded image fails
                    const target = e.currentTarget;
                    if (target.src !== DEFAULT_DEV_PHOTO) {
                      target.src = DEFAULT_DEV_PHOTO;
                    }
                  }}
                  className="w-full h-full object-cover object-top rounded-xl"
                />
              </div>

              {/* Photo change hover button */}
              <button
                type="button"
                onClick={handleTriggerUpload}
                className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-bold gap-1 cursor-pointer no-print"
                title="Ganti / Unggah Foto Pengembang"
              >
                <Camera className="w-6 h-6 text-amber-300" />
                <span>Ganti Foto</span>
              </button>

              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md border border-amber-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-900" /> Pengembang
              </div>
            </div>

            {/* Developer Identity Details */}
            <div className="text-center md:text-left space-y-2 flex-1 pt-2 md:pt-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/90 text-amber-300 text-xs font-bold border border-amber-400/40 shadow-xs">
                <Award className="w-3.5 h-3.5 text-amber-300" />
                <span>PENGEMBANG UTAMA APLIKASI TATA USAHA SEKOLAH</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span>Selpius Nabyal, S.Pd.Gr.</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-700/80 text-emerald-100 border border-emerald-500/50">
                  Guru SD
                </span>
              </h1>

              <p className="text-sm font-semibold text-emerald-100">
                Pendidik SD Pedalaman Papua & Penggagas Sistem Tata Kelola Sekolah Mandiri (Offline)
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1 text-xs text-emerald-100">
                <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                  <MapPin className="w-3.5 h-3.5 text-amber-300" /> Kabupaten Pegunungan Bintang, Papua Pegunungan
                </span>
                <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> Standar Data Pokok Pendidikan (Dapodik)
                </span>
                <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                  <Mail className="w-3.5 h-3.5 text-amber-200" /> keleyalakelena123093@gmail.com
                </span>
              </div>

              {/* Photo upload / reset actions and Lock Button on header */}
              <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-2 no-print">
                <button
                  type="button"
                  id="btn-dev-lock-profile-banner"
                  onClick={handleLock}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer border border-rose-400"
                  title="Kunci Profil Pengembang"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Kunci Profil Pengembang</span>
                </button>

                <button
                  type="button"
                  id="btn-dev-upload-photo"
                  onClick={handleTriggerUpload}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-950" />
                  <span>Unggah Foto Baru</span>
                </button>

                {devPhoto !== DEFAULT_DEV_PHOTO && (
                  <button
                    type="button"
                    onClick={handleResetPhoto}
                    className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Foto Asli</span>
                  </button>
                )}
              </div>
            </div>

            {/* Master Credentials Box */}
            <div className="bg-emerald-950/80 p-4 rounded-xl border border-emerald-600/50 text-center text-xs w-full md:w-auto shadow-lg flex-shrink-0">
              <span className="text-amber-300 block text-[10px] uppercase font-bold tracking-wider">
                Akses Login Master
              </span>
              <div className="font-mono text-white font-bold text-sm mt-1 bg-white/10 px-3 py-1 rounded border border-white/10">
                User: SelNab
              </div>
              <div className="font-mono text-amber-300 text-xs mt-1 bg-white/5 px-3 py-0.5 rounded">
                Pass: 1230
              </div>
              <button
                type="button"
                onClick={handleLock}
                className="w-full mt-2.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs border border-rose-400"
                title="Kunci Profil Pengembang Sekarang"
              >
                <Lock className="w-3 h-3" />
                <span>Kunci Profil</span>
              </button>
            </div>
          </div>
        </div>

        {/* MOTO PENGEMBANG SECTION (HIGHLIGHTED) */}
        <div className="p-6 bg-gradient-to-br from-amber-50/80 via-emerald-50/40 to-slate-50 border-b border-slate-200">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold">
                <Quote className="w-3.5 h-3.5 text-amber-700" />
                <span>MOTO PENGABDIAN & PELAYANAN PENGEMBANG</span>
              </div>
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                Pegangan Hidup & Jiwa Pengabdian Guru di Pedalaman Papua
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Motto 1 */}
              <div className="bg-white rounded-xl p-5 border-2 border-amber-300 shadow-sm relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-20 h-20 bg-amber-100/50 rounded-bl-full pointer-events-none" />
                <div className="space-y-3 relative z-10">
                  <div className="flex items-center gap-2 text-amber-700 font-bold text-xs">
                    <HeartHandshake className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>MOTO 1 : PELAYANAN TANPA PAMRIH</span>
                  </div>
                  <blockquote className="text-base sm:text-lg font-black text-slate-900 italic leading-snug border-l-4 border-amber-500 pl-3">
                    "Mengajar dan Melayani Tanpa Mengharapkan Imbalan."
                  </blockquote>
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    Prinsip ketulusan hati seorang pendidik sejati. Memberikan seluruh dedikasi ilmu, tenaga, dan waktu demi mencerdaskan tunas-tunas bangsa di daerah terpencil pedalaman Papua tanpa mengharapkan balas jasa duniawi.
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-amber-100 flex items-center justify-between text-[11px] text-amber-800 font-semibold">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3 text-red-500 fill-red-500" /> Pengabdian Penuh Kasih
                  </span>
                  <span>Selpius Nabyal, S.Pd.Gr.</span>
                </div>
              </div>

              {/* Motto 2 */}
              <div className="bg-white rounded-xl p-5 border-2 border-emerald-300 shadow-sm relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-100/50 rounded-bl-full pointer-events-none" />
                <div className="space-y-3 relative z-10">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                    <Compass className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                    <span>MOTO 2 : PRINSIP IMAN DALAM SETIAP LANGKAH</span>
                  </div>
                  <blockquote className="text-base sm:text-lg font-black text-emerald-950 italic leading-snug border-l-4 border-emerald-600 pl-3">
                    "Berangkat, berjalan, tiba, kerja dengan yesus."
                  </blockquote>
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    Kekuatan iman yang senantiasa menuntun setiap pergerakan. Dimulai dari melangkahkan kaki dari rumah, menempuh perjalanan melintasi medan pedalaman, tiba di tempat tugas, hingga menunaikan seluruh tanggung jawab mengajar dan bekerja bersama penyertaan Tuhan Yesus.
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-emerald-100 flex items-center justify-between text-[11px] text-emerald-800 font-semibold">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-600" /> Doa & Langkah Nyata
                  </span>
                  <span>Guru SD Pedalaman Papua</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Story & Background */}
        <div className="p-6 space-y-6 text-xs text-slate-700 leading-relaxed">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200/80 space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-200 text-emerald-900 flex items-center justify-center font-bold">
                <WifiOff className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-emerald-950">Mode Khusus Papua Pedalaman</h3>
              <p className="text-slate-600 text-[11px]">
                Dirancang khusus bekerja 100% secara <strong>Offline</strong> tanpa ketergantungan sinyal internet atau server cloud yang sering padam di pedalaman Pegunungan Bintang dan Papua.
              </p>
            </div>

            <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200/80 space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-blue-200 text-blue-900 flex items-center justify-center font-bold">
                <HardDriveDownloadIcon className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-blue-950">Penyimpanan Fisik & USB Drive</h3>
              <p className="text-slate-600 text-[11px]">
                Dukungan transfer dan backup data melalui Flashdisk / USB drive langsung ke komputer TU, laptop guru piket, atau hardisk eksternal sekolah.
              </p>
            </div>

            <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200/80 space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-amber-200 text-amber-900 flex items-center justify-center font-bold">
                <CheckCircle className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-amber-950">Selaras Standar Dapodik</h3>
              <p className="text-slate-600 text-[11px]">
                Format tabel data siswa, NISN, NIK, guru, NUPTK, sarpras, hingga BKU keuangan disesuaikan persis dengan petunjuk teknis Kemendikbudristek.
              </p>
            </div>
          </div>

          {/* Visi & Latar Belakang */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase flex items-center gap-2">
              <School className="w-4 h-4 text-emerald-700" />
              <span>Visi Dedikasi Pengembang</span>
            </h3>
            <p>
              Aplikasi Administrasi Tata Usaha Sekolah ini dikembangkan oleh <strong>Selpius Nabyal, S.Pd.Gr.</strong>, seorang guru SD yang bertugas langsung di tanah Papua. Berangkat dari tantangan nyata di lapangan seperti ketiadaan jaringan internet stabil, kesulitan sinkronisasi data pusat, dan rumitnya pembukuan manual tata usaha, aplikasi ini hadir sebagai solusi mandiri yang tangguh, cepat, dan mudah digunakan oleh siapa pun di ruang tata usaha sekolah pedalaman.
            </p>
            <p>
              Dengan tersedianya tombol aksi lengkap (Beranda, Tambah Baru, Simpan, Lihat, Hapus, Cari, Edit, Batal, Kembali, Arsipkan, Kunci Data, Review, Print, Update, Template, PDF, Excel, Word, PPT, Upload Foto, Refresh, Singkron, Reset, serta Ukuran Kertas Otomatis A4/F4/Legal), pekerjaan tata usaha dapat diselesaikan secara tertib, rapi, dan siap dilaporkan ke Dinas Pendidikan Kabupaten maupun Kementerian.
            </p>
          </div>

          {/* Profil Singkat & Ringkasan Dokumen */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
              <h4 className="font-bold text-slate-900 text-xs uppercase flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-emerald-700" />
                <span>Identitas & Kompetensi Pengembang</span>
              </h4>
              <table className="w-full text-[11px] text-slate-700">
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="py-1 text-slate-500 w-36">Nama Lengkap</td>
                    <td className="py-1 font-bold text-slate-900">Selpius Nabyal, S.Pd.Gr.</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-1 text-slate-500">Jabatan / Profesi</td>
                    <td className="py-1 font-semibold">Guru Sekolah Dasar (SD)</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-1 text-slate-500">Wilayah Tugas</td>
                    <td className="py-1">Kab. Pegunungan Bintang, Papua Pegunungan</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-1 text-slate-500">Keahlian Tambahan</td>
                    <td className="py-1">Tata Kelola Administrasi & Sistem Sekolah Offline</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-slate-500">Kontak Resmi</td>
                    <td className="py-1 font-mono text-emerald-800">keleyalakelena123093@gmail.com</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
              <h4 className="font-bold text-slate-900 text-xs uppercase flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-700" />
                <span>Dokumen & Lembar Sah Pengembang</span>
              </h4>
              <p className="text-[11px] text-slate-600">
                Profil pengembang ini dapat dicetak dan diekspor ke berbagai format resmi untuk keperluan verifikasi sekolah, laporan Dinas Pendidikan, ataupun lampiran portofolio:
              </p>
              <div className="flex flex-wrap gap-2 pt-1 no-print">
                <button
                  type="button"
                  onClick={triggerPrint}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Cetak / Cetak PDF</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportWord}
                  className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Ekspor Word</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Ekspor Excel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HardDriveDownloadIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="8" x="2" y="14" rx="2" />
    <path d="M6 18h.01" />
    <path d="M10 18h.01" />
    <path d="M12 2v8" />
    <path d="m16 6-4 4-4-4" />
  </svg>
);

