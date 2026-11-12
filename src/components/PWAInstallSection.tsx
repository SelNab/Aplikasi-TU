import React, { useState } from 'react';
import { usePWAInstall } from '../utils/usePWAInstall';
import {
  DownloadCloud,
  CheckCircle,
  Smartphone,
  Monitor,
  Apple,
  HelpCircle,
  Sparkles,
  WifiOff,
  Zap,
  HardDrive,
  Info,
  X,
  ExternalLink
} from 'lucide-react';

interface PWAInstallSectionProps {
  notifyMessage?: (msg: string) => void;
}

export const PWAInstallSection: React.FC<PWAInstallSectionProps> = ({ notifyMessage }) => {
  const { isInstallable, isInstalled, isStandalone, isIOS, platformName, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState<'desktop' | 'android' | 'ios'>(
    isIOS ? 'ios' : platformName === 'android' ? 'android' : 'desktop'
  );
  const [installStatus, setInstallStatus] = useState<string | null>(null);

  const handleInstallClick = async () => {
    if (isInstallable) {
      try {
        const result = await install();
        if (result === 'accepted') {
          if (notifyMessage) notifyMessage('Aplikasi Berhasil Diinstal ke Perangkat Anda!');
          setInstallStatus('Aplikasi berhasil dipasang!');
        } else if (result === 'dismissed') {
          setInstallStatus('Pemasangan aplikasi ditunda');
        } else {
          setShowGuideModal(true);
        }
      } catch (e) {
        console.error('Install error:', e);
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <div id="pwa-install-section" className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-xs space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
            <DownloadCloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2">
              Instal Aplikasi di Perangkat (PWA / Offline)
              {isInstalled ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Terpasang
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600" /> Siap Pasang
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-500">
              Dapat dipasang di Laptop / Komputer (Windows/Mac) dan HP (Android/iOS) untuk akses tanpa internet
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-pwa-panduan"
            onClick={() => setShowGuideModal(true)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-1.5 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>Petunjuk Pasang</span>
          </button>

          <button
            type="button"
            id="btn-pwa-instal-utama"
            onClick={handleInstallClick}
            className={`px-4 py-2 rounded-lg font-bold shadow-sm flex items-center gap-2 transition-all cursor-pointer ${
              isInstalled
                ? 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white active:scale-95 shadow-emerald-700/20'
            }`}
          >
            {isInstalled ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Aplikasi Terpasang (Buka Mode PWA)</span>
              </>
            ) : (
              <>
                <DownloadCloud className="w-4 h-4 text-emerald-200" />
                <span>Instal Aplikasi Sekarang</span>
              </>
            )}
          </button>
        </div>
      </div>

      {installStatus && (
        <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{installStatus}</span>
        </div>
      )}

      {/* Keuntungan Khusus Sekolah Pedalaman Papua */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2.5">
          <div className="p-1.5 rounded-md bg-amber-100 text-amber-800 flex-shrink-0">
            <WifiOff className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-xs">100% Bisa Offline</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
              Buka aplikasi kapan saja tanpa sinyal HP, internet, atau kuota data di daerah pedalaman.
            </p>
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2.5">
          <div className="p-1.5 rounded-md bg-blue-100 text-blue-800 flex-shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-xs">Cepat dari Desktop / HP</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
              Ikon aplikasi muncul langsung di Desktop Komputer dan layar utama HP layaknya aplikasi bawaan.
            </p>
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2.5">
          <div className="p-1.5 rounded-md bg-emerald-100 text-emerald-800 flex-shrink-0">
            <HardDrive className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-xs">Penyimpanan Aman</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
              Seluruh database siswa, guru, surat, dan keuangan tersimpan aman di disk lokal perangkat Anda.
            </p>
          </div>
        </div>
      </div>

      {/* Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 no-print backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <DownloadCloud className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-sm text-slate-900 uppercase">
                  Panduan Pasang Aplikasi (PWA)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Platform Selector Tabs */}
            <div className="flex border-b border-slate-200 gap-2">
              <button
                type="button"
                onClick={() => setActiveGuideTab('desktop')}
                className={`flex items-center gap-1.5 pb-2 px-3 text-xs font-bold border-b-2 transition-colors ${
                  activeGuideTab === 'desktop'
                    ? 'border-emerald-700 text-emerald-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>Laptop / Komputer</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveGuideTab('android')}
                className={`flex items-center gap-1.5 pb-2 px-3 text-xs font-bold border-b-2 transition-colors ${
                  activeGuideTab === 'android'
                    ? 'border-emerald-700 text-emerald-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>HP Android</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveGuideTab('ios')}
                className={`flex items-center gap-1.5 pb-2 px-3 text-xs font-bold border-b-2 transition-colors ${
                  activeGuideTab === 'ios'
                    ? 'border-emerald-700 text-emerald-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Apple className="w-4 h-4" />
                <span>iPhone / iPad</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="space-y-3 text-xs text-slate-700">
              {activeGuideTab === 'desktop' && (
                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-800">
                    Langkah untuk Google Chrome, Microsoft Edge, atau Brave di Komputer:
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 text-[11px] leading-relaxed">
                    <li>
                      Perhatikan <strong>baris alamat (address bar)</strong> di bagian atas browser Anda.
                    </li>
                    <li>
                      Klik ikon <strong>Komputer dengan panah bawah</strong> atau tombol <strong>Instal TU Sekolah</strong> di sebelah kanan bilah URL.
                    </li>
                    <li>
                      Atau buka menu browser (ikon titik tiga <strong>⋮</strong> di kanan atas) &gt; pilih <strong>"Instal Aplikasi Tata Usaha"</strong>.
                    </li>
                    <li>
                      Klik tombol <strong>"Instal"</strong> saat pop-up konfirmasi muncul.
                    </li>
                    <li>
                      Selesai! Ikon aplikasi akan otomatis muncul di Desktop & Menu Start laptop Anda.
                    </li>
                  </ol>
                </div>
              )}

              {activeGuideTab === 'android' && (
                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-800">
                    Langkah untuk Browser Google Chrome di HP Android:
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 text-[11px] leading-relaxed">
                    <li>
                      Buka aplikasi ini di <strong>Google Chrome</strong> pada HP Android Anda.
                    </li>
                    <li>
                      Ketuk menu titik tiga (<strong>⋮</strong>) di sudut kanan atas layar.
                    </li>
                    <li>
                      Pilih menu <strong>"Instal Aplikasi"</strong> atau <strong>"Tambahkan ke Layar Utama" (Add to Home Screen)</strong>.
                    </li>
                    <li>
                      Tekan tombol <strong>"Instal"</strong>.
                    </li>
                    <li>
                      Aplikasi akan otomatis terpasang seperti aplikasi resmi Android di layar HP Anda.
                    </li>
                  </ol>
                </div>
              )}

              {activeGuideTab === 'ios' && (
                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-800">
                    Langkah untuk Safari di iPhone / iPad (iOS):
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 text-[11px] leading-relaxed">
                    <li>
                      Pastikan Anda membuka aplikasi ini menggunakan browser <strong>Safari</strong> bawaan Apple.
                    </li>
                    <li>
                      Ketuk tombol <strong>Bagikan (Share)</strong> di bagian bawah Safari (ikon kotak bertanda panah ke atas).
                    </li>
                    <li>
                      Gulir ke bawah pada menu yang muncul, lalu pilih <strong>"Tambah ke Layar Utama" (Add to Home Screen)</strong>.
                    </li>
                    <li>
                      Beri nama aplikasi atau biarkan <strong>"TU Sekolah"</strong>, lalu ketuk <strong>"Tambah" (Add)</strong> di sudut kanan atas.
                    </li>
                    <li>
                      Aplikasi kini siap dibuka kapan saja dari layar iPhone Anda dalam mode layar penuh (standalone).
                    </li>
                  </ol>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
              <span className="text-[11px] text-slate-500">
                Mode Offline & Standar Dapodik Papua
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowGuideModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-xs"
                >
                  Tutup
                </button>
                {isInstallable && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowGuideModal(false);
                      handleInstallClick();
                    }}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs flex items-center gap-1.5"
                  >
                    <DownloadCloud className="w-3.5 h-3.5" />
                    <span>Coba Pasang Sekarang</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
