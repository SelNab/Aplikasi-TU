import React, { useState, useEffect } from 'react';
import { AppDisplaySize } from '../types';
import {
  Minimize2,
  Square,
  Maximize2,
  Maximize,
  Check,
  Monitor,
  Sparkles,
  Shrink
} from 'lucide-react';

interface AppSizeSelectorProps {
  currentSize?: AppDisplaySize;
  onChangeSize: (size: AppDisplaySize) => void;
  notifyMessage?: (msg: string) => void;
}

interface SizeOption {
  id: AppDisplaySize;
  title: string;
  badge: string;
  scaleNote: string;
  icon: React.FC<{ className?: string }>;
  description: string;
  idealFor: string;
  colorClass: string;
}

const SIZE_OPTIONS: SizeOption[] = [
  {
    id: 'kecil',
    title: 'Kecil (Kompak)',
    badge: 'Skala 90%',
    scaleNote: '0.90x',
    icon: Minimize2,
    description: 'Tampilan teks dan baris data lebih padat dan ringkas.',
    idealFor: 'Netbook, laptop 11-14 inci, atau tabel data panjang',
    colorClass: 'text-sky-700 bg-sky-50 border-sky-200'
  },
  {
    id: 'sedang',
    title: 'Sedang (Standar)',
    badge: 'Skala 100%',
    scaleNote: '1.00x',
    icon: Square,
    description: 'Ukuran default proporsional sistem administrasi sekolah.',
    idealFor: 'Monitor standar, laptop 14-16 inci, pemakaian harian',
    colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200'
  },
  {
    id: 'besar',
    title: 'Besar (Nyaman)',
    badge: 'Skala 112%',
    scaleNote: '1.12x',
    icon: Maximize2,
    description: 'Teks, tombol, dan formulir diperbesar sehingga sangat jelas.',
    idealFor: 'Layar proyektor, monitor resolusi tinggi, atau kenyamanan mata',
    colorClass: 'text-amber-700 bg-amber-50 border-amber-200'
  },
  {
    id: 'full',
    title: 'Full (Layar Penuh)',
    badge: 'Lebar 100% / F11',
    scaleNote: 'Max-Width',
    icon: Maximize,
    description: 'Memaksimalkan seluruh lebar layar monitor tanpa batasan container.',
    idealFor: 'Layar ultra-wide, mode kerja intensif, desktop app feeling',
    colorClass: 'text-purple-700 bg-purple-50 border-purple-200'
  }
];

export const AppSizeSelector: React.FC<AppSizeSelectorProps> = ({
  currentSize = 'sedang',
  onChangeSize,
  notifyMessage
}) => {
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

  const handleSelect = (size: AppDisplaySize) => {
    onChangeSize(size);
    const opt = SIZE_OPTIONS.find((o) => o.id === size);
    if (notifyMessage && opt) {
      notifyMessage(`Ukuran Aplikasi Diubah ke: ${opt.title}`);
    }
  };

  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        if (notifyMessage) notifyMessage('Mode Layar Penuh (Fullscreen) Diaktifkan');
      } else {
        await document.exitFullscreen();
        if (notifyMessage) notifyMessage('Keluar dari Mode Layar Penuh');
      }
    } catch (err) {
      console.warn('Fullscreen request blocked or not supported:', err);
      if (notifyMessage) {
        notifyMessage('Gunakan tombol F11 pada keyboard untuk Layar Penuh browser');
      }
    }
  };

  return (
    <div id="app-size-selector" className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-xs space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-100 text-indigo-800">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2">
              Pengaturan Ukuran & Tampilan Aplikasi
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Besar • Sedang • Full • Kecil
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Sesuaikan skala tampilan visual aplikasi sesuai kenyamanan mata, layar laptop guru, atau proyektor
            </p>
          </div>
        </div>

        {/* Current Size Badge & Fullscreen Quick Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-800 capitalize">
              {currentSize}
            </span>
            <span className="text-[10px] text-slate-500">
              ({SIZE_OPTIONS.find((o) => o.id === currentSize)?.badge})
            </span>
          </div>

          <button
            type="button"
            id="btn-toggle-fullscreen"
            onClick={handleToggleFullscreen}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs border ${
              isFullscreen
                ? 'bg-purple-700 hover:bg-purple-800 text-white border-purple-600'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
            title="Klik untuk Masuk / Keluar Mode Layar Penuh (F11)"
          >
            {isFullscreen ? (
              <>
                <Shrink className="w-3.5 h-3.5 text-purple-200" />
                <span>Keluar Layar Penuh</span>
              </>
            ) : (
              <>
                <Maximize className="w-3.5 h-3.5 text-indigo-600" />
                <span>Mode Layar Penuh (F11)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 4 Size Cards: Kecil, Sedang, Besar, Full */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 pt-1">
        {SIZE_OPTIONS.map((opt) => {
          const isSelected = currentSize === opt.id;
          const IconComponent = opt.icon;

          return (
            <button
              key={opt.id}
              type="button"
              id={`size-btn-${opt.id}`}
              onClick={() => handleSelect(opt.id)}
              className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between group cursor-pointer ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/60 shadow-sm ring-2 ring-indigo-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center border shadow-xs ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-700'
                          : 'bg-slate-100 text-slate-700 border-slate-200 group-hover:bg-indigo-50 group-hover:text-indigo-700'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 text-xs block">
                        {opt.title}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {opt.scaleNote}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="p-1 rounded-full bg-indigo-600 text-white flex-shrink-0">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-600 leading-snug">
                  {opt.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 italic">
                  Cocok: {opt.idealFor}
                </span>
                <span
                  className={`text-[9.5px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-800'
                  }`}
                >
                  {isSelected ? 'Aktif' : 'Pilih'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Mini Quick Bar in Card */}
      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[11px] text-slate-600">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
          <span>
            Pintasan Cepat: Ukuran langsung tersimpan otomatis dan aktif pada setiap sesi pembukaan aplikasi.
          </span>
        </div>

        <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-white shadow-xs">
          {(['kecil', 'sedang', 'besar', 'full'] as AppDisplaySize[]).map((sz) => (
            <button
              key={sz}
              type="button"
              onClick={() => handleSelect(sz)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded capitalize cursor-pointer transition-all ${
                currentSize === sz
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {sz}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
