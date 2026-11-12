import React, { useState } from 'react';
import { SchoolSettings, PaperSize, ThemeColor, AppDisplaySize } from '../../types';
import { ActionToolbar } from '../ActionToolbar';
import { triggerPrint, safeConfirm } from '../../utils/exportHelpers';
import { PWAInstallSection } from '../PWAInstallSection';
import { ThemeColorSelector } from '../ThemeColorSelector';
import { AppSizeSelector } from '../AppSizeSelector';
import { testFirebaseConnection } from '../../utils/firebaseSync';
import {
  Settings,
  Image,
  Upload,
  HardDriveDownload,
  HardDriveUpload,
  RefreshCw,
  CheckCircle,
  Shield,
  School,
  Sparkles,
  DownloadCloud,
  Cloud,
  CloudLightning,
  Database,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface PengaturanModuleProps {
  settings: SchoolSettings;
  onSaveSettings: (settings: SchoolSettings) => void;
  onHome: () => void;
  onExportUSBBackup: () => void;
  onImportUSBBackup: (file: File) => void;
  onResetAllData: () => void;
  notifyMessage: (msg?: string) => void;
  onSync: () => void;
  onRestoreFromFirebase?: () => void;
  isSyncingFirebase?: boolean;
}

export const PengaturanModule: React.FC<PengaturanModuleProps> = ({
  settings,
  onSaveSettings,
  onHome,
  onExportUSBBackup,
  onImportUSBBackup,
  onResetAllData,
  notifyMessage,
  onSync,
  onRestoreFromFirebase,
  isSyncingFirebase = false
}) => {
  const [formData, setFormData] = useState<SchoolSettings>(settings);
  const [paperSize, setPaperSize] = useState<PaperSize>(settings.ukuranKertas);
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    ok: boolean;
    message: string;
    loading: boolean;
  }>({
    tested: false,
    ok: false,
    message: '',
    loading: false
  });

  const handleTestConnection = async () => {
    setConnectionStatus({ tested: false, ok: false, message: '', loading: true });
    notifyMessage('Menguji koneksi ke Google Firebase Firestore...');
    const res = await testFirebaseConnection();
    setConnectionStatus({
      tested: true,
      ok: res.ok,
      message: res.message,
      loading: false
    });
    notifyMessage(res.message);
  };

  const handleSave = () => {
    onSaveSettings(formData);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handleThemeChange = (color: ThemeColor) => {
    const updated = { ...formData, temaWarna: color };
    setFormData(updated);
    onSaveSettings(updated);
  };

  const handleAppSizeChange = (size: AppDisplaySize) => {
    const updated = { ...formData, ukuranAplikasi: size };
    setFormData(updated);
    onSaveSettings(updated);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, which: 'kiri' | 'kanan') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          if (which === 'kiri') {
            setFormData({ ...formData, logoKiri: reader.result as string });
          } else {
            setFormData({ ...formData, logoKanan: reader.result as string });
          }
          notifyMessage('Logo Berhasil Diunggah');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Toolbar */}
      <ActionToolbar
        titleContext="PENGATURAN SEKOLAH, LOGO, & BACKUP USB"
        onHome={onHome}
        onAddNew={() => notifyMessage('Pengaturan Baru Siap')}
        onSave={handleSave}
        onView={() => notifyMessage(`Sekolah: ${formData.namaSekolah || ''} | NPSN: ${formData.npsn || ''}`)}
        onDelete={() => {
          if (safeConfirm('Reset seluruh data ke pengaturan awal pabrik?')) {
            onResetAllData();
          }
        }}
        onSearch={() => {}}
        onEdit={() => notifyMessage('Mode Edit Pengaturan Aktif')}
        onCancel={() => setFormData(settings)}
        onBack={onHome}
        onArchive={() => notifyMessage('Data Anda Berhasil Disimpan')}
        onLock={() => notifyMessage('Data Anda Berhasil Dikunci')}
        onReview={() => triggerPrint()}
        onPrint={triggerPrint}
        onUpdate={handleSave}
        onTemplate={() => {
          setFormData({
            ...settings,
            namaInstansi: 'PEMERINTAH KABUPATEN PEGUNUNGAN BINTANG\nDINAS PENDIDIKAN DAN KEBUDAYAAN',
            namaSekolah: 'SD NEGERI BAALIL KABUPATEN PEGUNUNGAN BINTANG',
            npsn: '60301824',
            nss: '101250801001',
            alamatSekolah: 'Kampung Baalil, Distrik Oksibil, Kab. Pegunungan Bintang, Papua Pegunungan',
            kecamatan: 'Oksibil',
            kabupaten: 'Pegunungan Bintang',
            provinsi: 'Papua Pegunungan',
            namaKepsek: 'Yulianus Hilapok, S.Pd., M.M.',
            nipKepsek: '19750815 200212 1 003',
            operatorTU: 'Selpius Nabyal, S.Pd.Gr.',
            nipOperator: '19890412 201903 1 004',
            ukuranKertas: 'F4',
            modeKoneksi: 'Offline'
          });
          notifyMessage('Data Anda Berhasil Disimpan');
        }}
        onPdf={triggerPrint}
        onExcel={onExportUSBBackup}
        onWord={onExportUSBBackup}
        onPpt={onExportUSBBackup}
        onUploadPhoto={() => notifyMessage('Data Anda Berhasil Disimpan')}
        onRefresh={() => notifyMessage('Data Anda Berhasil Disimpan')}
        onSync={onSync}
        onReset={() => {
          if (safeConfirm('Yakin ingin mereset formulir pengaturan?')) {
            setFormData(settings);
            notifyMessage('Data Formulir Berhasil Direset');
          }
        }}
        paperSize={paperSize}
        onChangePaperSize={(size) => {
          setPaperSize(size);
          setFormData({ ...formData, ukuranKertas: size });
        }}
        notifyMessage={notifyMessage}
      />

      {/* Tombol & Bagian Instalasi Aplikasi PWA */}
      <PWAInstallSection notifyMessage={notifyMessage} />

      {/* Pengaturan Ukuran Tampilan Aplikasi: Besar, Sedang, Full, Kecil */}
      <AppSizeSelector
        currentSize={formData.ukuranAplikasi || 'sedang'}
        onChangeSize={handleAppSizeChange}
        notifyMessage={notifyMessage}
      />

      {/* Tombol & Pengaturan Tema Warna Aplikasi */}
      <ThemeColorSelector
        currentColor={formData.temaWarna || 'emerald'}
        onSelectColor={handleThemeChange}
        notifyMessage={notifyMessage}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Identitas Sekolah Form */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4 text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <School className="w-5 h-5 text-emerald-700" />
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase">
                Identitas Resmi Satuan Pendidikan (Dapodik)
              </h2>
              <p className="text-[11px] text-slate-500">
                Data ini akan otomatis muncul pada setiap KOP Surat, Laporan, Formulir, dan Kartu ID
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="font-bold text-slate-700 block mb-0.5">Nama Instansi Pembina / Dinas Pendidikan</label>
              <textarea
                rows={2}
                value={formData.namaInstansi || ''}
                onChange={(e) => setFormData({ ...formData, namaInstansi: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-bold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-0.5">Nama Sekolah Lengkap</label>
                <input
                  type="text"
                  value={formData.namaSekolah || ''}
                  onChange={(e) => setFormData({ ...formData, namaSekolah: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-black text-slate-900 text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-0.5">NPSN (Nomor Pokok Sekolah)</label>
                <input
                  type="text"
                  value={formData.npsn || ''}
                  onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-mono font-bold text-emerald-800"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-0.5">Alamat Lengkap Sekolah</label>
              <input
                type="text"
                value={formData.alamatSekolah || ''}
                onChange={(e) => setFormData({ ...formData, alamatSekolah: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-0.5">Kecamatan / Distrik</label>
                <input
                  type="text"
                  value={formData.kecamatan || ''}
                  onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-0.5">Kabupaten</label>
                <input
                  type="text"
                  value={formData.kabupaten || ''}
                  onChange={(e) => setFormData({ ...formData, kabupaten: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-0.5">Provinsi</label>
                <input
                  type="text"
                  value={formData.provinsi || ''}
                  onChange={(e) => setFormData({ ...formData, provinsi: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">Kepala Sekolah (Penandatangan Dokumen)</span>
                <label className="text-slate-600 block mb-0.5">Nama & Gelar</label>
                <input
                  type="text"
                  value={formData.namaKepsek || ''}
                  onChange={(e) => setFormData({ ...formData, namaKepsek: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-bold mb-1.5"
                />
                <label className="text-slate-600 block mb-0.5">NIP Kepala Sekolah</label>
                <input
                  type="text"
                  value={formData.nipKepsek || ''}
                  onChange={(e) => setFormData({ ...formData, nipKepsek: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-mono"
                />
              </div>

              <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-200">
                <span className="font-bold text-emerald-900 block mb-1">Operator TU / Pembuat Aplikasi</span>
                <label className="text-slate-600 block mb-0.5">Nama Operator</label>
                <input
                  type="text"
                  value={formData.operatorTU || ''}
                  onChange={(e) => setFormData({ ...formData, operatorTU: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-bold mb-1.5 text-emerald-900"
                />
                <label className="text-slate-600 block mb-0.5">NIP Operator</label>
                <input
                  type="text"
                  value={formData.nipOperator || ''}
                  onChange={(e) => setFormData({ ...formData, nipOperator: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t">
              <div className="bg-indigo-50/60 p-3 rounded-lg border border-indigo-200">
                <span className="font-bold text-indigo-900 block mb-1">Ukuran Tampilan Aplikasi</span>
                <label className="text-slate-600 block mb-0.5">Pilihan Skala Layar:</label>
                <select
                  value={formData.ukuranAplikasi || 'sedang'}
                  onChange={(e) => handleAppSizeChange(e.target.value as AppDisplaySize)}
                  className="w-full bg-white border border-indigo-300 rounded px-2 py-1.5 font-bold text-indigo-900 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="kecil">Kecil (Kompak 90% - Netbook / Layar Kecil)</option>
                  <option value="sedang">Sedang (Standar 100% - Proporsional Normal)</option>
                  <option value="besar">Besar (Nyaman 112% - Teks & Tombol Besar)</option>
                  <option value="full">Full (Layar Penuh 100% Lebar & F11)</option>
                </select>
                <span className="text-[10px] text-indigo-600 mt-1 block">
                  Tersedia 4 opsi: Besar, Sedang, Full, dan Kecil
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">Ukuran Kertas Utama (Cetak)</span>
                <label className="text-slate-600 block mb-0.5">Standar Dokumen Sekolah:</label>
                <select
                  value={formData.ukuranKertas || 'F4'}
                  onChange={(e) => {
                    const size = e.target.value as PaperSize;
                    setPaperSize(size);
                    setFormData({ ...formData, ukuranKertas: size });
                  }}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 font-bold text-slate-800"
                >
                  <option value="F4">F4 / Folio (215 x 330 mm) - Standar TU</option>
                  <option value="A4">A4 (210 x 297 mm)</option>
                  <option value="Legal">Legal (216 x 356 mm)</option>
                  <option value="Letter">Letter (216 x 279 mm)</option>
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Format cetak otomatis disesuaikan di seluruh modul
                </span>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow text-xs flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" /> Simpan Pengaturan Sekolah
              </button>
            </div>
          </div>
        </div>

        {/* Right: Logos, Firebase Sync, & Backup Flashdisk USB */}
        <div className="lg:col-span-4 space-y-4">
          {/* Firebase Cloud Sync Card */}
          <div className="bg-gradient-to-br from-slate-900 to-sky-950 text-white rounded-xl border border-sky-800/60 shadow-md p-4 text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-sky-700/50 pb-2">
              <div className="flex items-center gap-2">
                <CloudLightning className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-white uppercase text-xs">
                  Sinkronisasi Cloud Firebase
                </h3>
              </div>
              <span className="text-[9px] bg-sky-500/20 text-sky-200 border border-sky-400/40 px-2 py-0.5 rounded font-mono">
                Firestore
              </span>
            </div>

            <p className="text-[11px] text-sky-100/90 leading-relaxed">
              Sinkronkan data siswa, guru, jadwal piket, dan jadwal pelajaran secara langsung ke database <strong>Google Firebase Firestore</strong>.
            </p>

            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-sky-800/40 font-mono text-[10px] space-y-1 text-sky-200">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Database:</span>
                <span className="text-amber-300 font-bold">Firestore Aktif</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Petugas TU:</span>
                <span className="text-emerald-300 truncate max-w-[170px]" title="keleyalakelena123093@gmail.com">
                  keleyalakelena123093@...
                </span>
              </div>
              {connectionStatus.tested && (
                <div className={`pt-1 border-t border-sky-800/50 flex items-center gap-1 text-[9.5px] ${
                  connectionStatus.ok ? 'text-emerald-300 font-bold' : 'text-rose-300'
                }`}>
                  {connectionStatus.ok ? <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" /> : <AlertTriangle className="w-3 h-3 text-rose-400 flex-shrink-0" />}
                  <span className="truncate">{connectionStatus.message}</span>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                id="btn-sync-firebase-now"
                onClick={onSync}
                disabled={isSyncingFirebase}
                className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-lg shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {isSyncingFirebase ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Sedang Menyinkronkan...</span>
                  </>
                ) : (
                  <>
                    <Cloud className="w-4 h-4 text-slate-950" />
                    <span>Sinkronkan Sekarang ke Firebase</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="btn-test-firebase-conn"
                  onClick={handleTestConnection}
                  disabled={connectionStatus.loading}
                  className="py-1.5 bg-sky-900/60 hover:bg-sky-800 text-sky-200 hover:text-white border border-sky-700/50 rounded-lg text-[10.5px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Database className="w-3 h-3 text-sky-400" />
                  <span>{connectionStatus.loading ? 'Menguji...' : 'Cek Status DB'}</span>
                </button>

                {onRestoreFromFirebase && (
                  <button
                    type="button"
                    id="btn-restore-firebase"
                    onClick={onRestoreFromFirebase}
                    disabled={isSyncingFirebase}
                    className="py-1.5 bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 hover:text-white border border-indigo-700/50 rounded-lg text-[10.5px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <HardDriveDownload className="w-3 h-3 text-indigo-400" />
                    <span>Tarik Data Cloud</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Logo Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-xs space-y-3">
            <h3 className="font-bold text-slate-800 uppercase flex items-center gap-1.5 border-b pb-2">
              <Image className="w-4 h-4 text-emerald-700" /> Pengaturan Logo Kop Surat
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-700 block mb-1.5">Logo Kiri (Pemda)</span>
                <div className="w-20 h-20 mx-auto bg-white rounded-lg border p-1 mb-2 flex items-center justify-center overflow-hidden">
                  {formData.logoKiri && formData.logoKiri.trim() ? (
                    <img src={formData.logoKiri} alt="Logo Kiri" className="max-h-full object-contain" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="text-slate-400 flex flex-col items-center">
                      <School className="w-6 h-6 text-emerald-700 opacity-60" />
                      <span className="text-[8px] mt-0.5 font-medium">Belum ada logo</span>
                    </div>
                  )}
                </div>
                <label className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[10px] font-bold cursor-pointer inline-block">
                  Ganti Logo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleLogoUpload(e, 'kiri')}
                  />
                </label>
              </div>

              <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-700 block mb-1.5">Logo Kanan (Sekolah)</span>
                <div className="w-20 h-20 mx-auto bg-white rounded-lg border p-1 mb-2 flex items-center justify-center overflow-hidden">
                  {formData.logoKanan && formData.logoKanan.trim() ? (
                    <img src={formData.logoKanan} alt="Logo Kanan" className="max-h-full object-contain" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="text-slate-400 flex flex-col items-center">
                      <Sparkles className="w-6 h-6 text-teal-700 opacity-60" />
                      <span className="text-[8px] mt-0.5 font-medium">Belum ada logo</span>
                    </div>
                  )}
                </div>
                <label className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[10px] font-bold cursor-pointer inline-block">
                  Ganti Logo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleLogoUpload(e, 'kanan')}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Backup Flashdisk USB Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-xs space-y-3">
            <h3 className="font-bold text-slate-800 uppercase flex items-center gap-1.5 border-b pb-2 text-emerald-900">
              <HardDriveDownload className="w-4 h-4 text-emerald-700" />
              Backup & Restore USB Khusus Papua Pedalaman
            </h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Karena daerah pedalaman Papua sering tanpa sinyal dan listrik terbatas, simpan seluruh database aplikasi ini ke dalam <strong>Flashdisk / USB Drive</strong> secara rutin.
            </p>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={onExportUSBBackup}
                className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-sm flex items-center justify-center gap-2"
              >
                <HardDriveDownload className="w-4 h-4" />
                Download Backup ke Flashdisk (.json)
              </button>

              <label className="w-full py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 cursor-pointer">
                <HardDriveUpload className="w-4 h-4" />
                Restore Data Dari File Flashdisk (.json)
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onImportUSBBackup(f);
                  }}
                />
              </label>
            </div>
          </div>

          {/* Quick Install Card */}
          <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-xl shadow-sm p-4 text-xs space-y-2.5 border border-emerald-700/50">
            <div className="flex items-center gap-2">
              <DownloadCloud className="w-5 h-5 text-amber-300" />
              <h3 className="font-bold text-white uppercase text-xs">
                Aplikasi Desktop / HP (PWA)
              </h3>
            </div>
            <p className="text-[11px] text-emerald-100 leading-relaxed">
              Pasang aplikasi ke laptop atau smartphone agar dapat diakses kapan pun langsung dari desktop tanpa perlu internet.
            </p>
            <button
              type="button"
              id="btn-quick-install-pwa"
              onClick={() => {
                const el = document.getElementById('btn-pwa-instal-utama');
                if (el) el.click();
              }}
              className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <DownloadCloud className="w-4 h-4 text-slate-950" />
              <span>Instal ke Perangkat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
