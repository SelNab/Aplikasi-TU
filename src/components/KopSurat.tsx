import React, { useRef, useState } from 'react';
import { SchoolSettings } from '../types';
import { compressAndResizeImage } from '../utils/imageHelper';
import { Upload, Image as ImageIcon, Trash2, School, Building2, Check } from 'lucide-react';

export interface KopSuratProps {
  settings: SchoolSettings;
  onUploadLogoKiri?: (base64: string) => void;
  onUploadLogoKanan?: (base64: string) => void;
  onRemoveLogoKiri?: () => void;
  onRemoveLogoKanan?: () => void;
  showUploadButtons?: boolean;
  compact?: boolean;
  className?: string;
  variant?: 'formal' | 'card';
}

export const KopSurat: React.FC<KopSuratProps> = ({
  settings,
  onUploadLogoKiri,
  onUploadLogoKanan,
  onRemoveLogoKiri,
  onRemoveLogoKanan,
  showUploadButtons = true,
  compact = false,
  className = '',
  variant = 'formal'
}) => {
  const fileInputKiriRef = useRef<HTMLInputElement>(null);
  const fileInputKananRef = useRef<HTMLInputElement>(null);

  const [isHoveringKiri, setIsHoveringKiri] = useState(false);
  const [isHoveringKanan, setIsHoveringKanan] = useState(false);
  const [isDraggingKiri, setIsDraggingKiri] = useState(false);
  const [isDraggingKanan, setIsDraggingKanan] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Helper to persist to localStorage as fallback safety
  const persistLogoToStorage = (which: 'kiri' | 'kanan', base64: string) => {
    try {
      const raw = localStorage.getItem('selnab_settings');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (which === 'kiri') parsed.logoKiri = base64;
        else parsed.logoKanan = base64;
        localStorage.setItem('selnab_settings', JSON.stringify(parsed));
      }
    } catch (e) {
      console.warn('Storage sync error:', e);
    }
  };

  const handleFileProcess = async (file: File, which: 'kiri' | 'kanan') => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Silakan pilih berkas gambar (PNG, JPG, JPEG, WebP).');
      return;
    }

    try {
      // Compress and resize for crisp printing without exceeding localStorage limits
      const base64 = await compressAndResizeImage(file, 280, 280, 0.92);
      
      if (which === 'kiri') {
        if (onUploadLogoKiri) {
          onUploadLogoKiri(base64);
        }
        persistLogoToStorage('kiri', base64);
        setUploadStatus('Logo Kiri berhasil diperbarui!');
      } else {
        if (onUploadLogoKanan) {
          onUploadLogoKanan(base64);
        }
        persistLogoToStorage('kanan', base64);
        setUploadStatus('Logo Kanan berhasil diperbarui!');
      }

      setTimeout(() => setUploadStatus(null), 3000);
    } catch (err: any) {
      console.error('Error processing logo image:', err);
      alert('Gagal memproses gambar logo. Silakan coba berkas gambar lain.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, which: 'kiri' | 'kanan') => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file, which);
    }
    // reset input value so user can re-upload the same file if needed
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent, which: 'kiri' | 'kanan') => {
    e.preventDefault();
    if (which === 'kiri') setIsDraggingKiri(false);
    else setIsDraggingKanan(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file, which);
    }
  };

  const handleRemove = (which: 'kiri' | 'kanan', e: React.MouseEvent) => {
    e.stopPropagation();
    if (which === 'kiri') {
      if (onRemoveLogoKiri) {
        onRemoveLogoKiri();
      } else if (onUploadLogoKiri) {
        onUploadLogoKiri('');
      }
      persistLogoToStorage('kiri', '');
      setUploadStatus('Logo Kiri dihapus');
    } else {
      if (onRemoveLogoKanan) {
        onRemoveLogoKanan();
      } else if (onUploadLogoKanan) {
        onUploadLogoKanan('');
      }
      persistLogoToStorage('kanan', '');
      setUploadStatus('Logo Kanan dihapus');
    }
    setTimeout(() => setUploadStatus(null), 3000);
  };

  const hasLogoKiri = Boolean(settings.logoKiri && settings.logoKiri.trim());
  const hasLogoKanan = Boolean(settings.logoKanan && settings.logoKanan.trim());

  // Size configurations
  const logoDimensionClass = compact
    ? 'w-12 h-12 sm:w-14 sm:h-14'
    : 'w-16 h-16 sm:w-20 sm:h-20';

  return (
    <div
      className={`kop-surat-wrapper select-none ${
        variant === 'card'
          ? 'bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs'
          : 'bg-transparent'
      } ${className}`}
    >
      {/* Hidden File Inputs */}
      <input
        ref={fileInputKiriRef}
        id="file-input-logo-kiri"
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => handleInputChange(e, 'kiri')}
      />
      <input
        ref={fileInputKananRef}
        id="file-input-logo-kanan"
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => handleInputChange(e, 'kanan')}
      />

      {/* Floating temporary notification (no-print) */}
      {uploadStatus && (
        <div className="no-print mb-2 py-1 px-2.5 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 animate-fadeIn">
          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{uploadStatus}</span>
        </div>
      )}

      {/* Main KOP Layout: Logo Kiri | Teks Kop Tengah | Logo Kanan */}
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        
        {/* ===================== LOGO KIRI ===================== */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <div
            onMouseEnter={() => setIsHoveringKiri(true)}
            onMouseLeave={() => setIsHoveringKiri(false)}
            onDragOver={(e) => { e.preventDefault(); setIsDraggingKiri(true); }}
            onDragLeave={() => setIsDraggingKiri(false)}
            onDrop={(e) => handleDrop(e, 'kiri')}
            onClick={() => showUploadButtons && fileInputKiriRef.current?.click()}
            title={showUploadButtons ? 'Klik atau seret gambar untuk mengunggah Logo Kiri (Dinas/Pemda)' : 'Logo Kiri'}
            className={`${logoDimensionClass} rounded-lg flex items-center justify-center relative transition-all duration-150 ${
              showUploadButtons ? 'cursor-pointer' : ''
            } ${
              hasLogoKiri
                ? 'bg-transparent'
                : 'border-2 border-dashed border-slate-300 bg-slate-50 hover:border-emerald-500 hover:bg-emerald-50/40'
            } ${isDraggingKiri ? 'ring-2 ring-emerald-500 bg-emerald-100/60' : ''}`}
          >
            {hasLogoKiri ? (
              <img
                src={settings.logoKiri}
                alt="Logo Kiri (Dinas / Pemda)"
                className="w-full h-full object-contain p-0.5 select-none"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-1 text-slate-400 text-center">
                <Building2 className="w-6 h-6 sm:w-7 sm:h-7 text-slate-400 opacity-80" />
                <span className="text-[8px] sm:text-[9px] font-semibold block leading-tight text-slate-500 mt-0.5">
                  Logo Kiri
                </span>
              </div>
            )}

            {/* Hover overlay on desktop (no-print) */}
            {showUploadButtons && hasLogoKiri && isHoveringKiri && (
              <div className="no-print absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center text-white text-[10px] font-bold p-1 text-center transition-opacity">
                Ganti Logo
              </div>
            )}
          </div>

          {/* Tombol Upload & Hapus Logo Kiri (no-print) */}
          {showUploadButtons && (
            <div className="no-print mt-1.5 flex flex-col sm:flex-row items-center gap-1">
              <button
                type="button"
                id="btn-upload-logo-kiri"
                onClick={() => fileInputKiriRef.current?.click()}
                className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-[10px] font-bold flex items-center gap-1 shadow-xs cursor-pointer transition-colors active:scale-95"
                title="Unggah berkas gambar untuk Logo Kiri"
              >
                <Upload className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span>{hasLogoKiri ? 'Ganti' : 'Upload Logo Kiri'}</span>
              </button>

              {hasLogoKiri && (
                <button
                  type="button"
                  id="btn-remove-logo-kiri"
                  onClick={(e) => handleRemove('kiri', e)}
                  className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Hapus Logo Kiri"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* ===================== TEKS KOP TENGAH ===================== */}
        <div className="flex-1 text-center px-1 sm:px-3 text-slate-950 font-sans leading-tight">
          <p className="text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-wider text-slate-800">
            {settings.namaInstansi || 'PEMERINTAH KABUPATEN PEGUNUNGAN BINTANG / DINAS PENDIDIKAN'}
          </p>
          <h1 className="text-sm sm:text-lg md:text-xl font-black uppercase text-slate-950 my-0.5 tracking-tight">
            {settings.namaSekolah || 'SD NEGERI BAALIL KABUPATEN PEGUNUNGAN BINTANG'}
          </h1>
          <p className="text-[9px] sm:text-[11px] md:text-xs text-slate-700 font-normal leading-normal">
            {settings.alamatSekolah || 'Baalil, Distrik Oksibil, Kabupaten Pegunungan Bintang, Papua Pegunungan'}
          </p>
          <p className="text-[8.5px] sm:text-[10px] md:text-[11px] text-slate-600 font-mono mt-0.5">
            NPSN: <span className="font-bold text-slate-800">{settings.npsn || '60301824'}</span>
            {settings.nss && (
              <span> | NSS: <span className="font-bold text-slate-800">{settings.nss}</span></span>
            )}
          </p>
        </div>

        {/* ===================== LOGO KANAN ===================== */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <div
            onMouseEnter={() => setIsHoveringKanan(true)}
            onMouseLeave={() => setIsHoveringKanan(false)}
            onDragOver={(e) => { e.preventDefault(); setIsDraggingKanan(true); }}
            onDragLeave={() => setIsDraggingKanan(false)}
            onDrop={(e) => handleDrop(e, 'kanan')}
            onClick={() => showUploadButtons && fileInputKananRef.current?.click()}
            title={showUploadButtons ? 'Klik atau seret gambar untuk mengunggah Logo Kanan (Sekolah / Tut Wuri)' : 'Logo Kanan'}
            className={`${logoDimensionClass} rounded-lg flex items-center justify-center relative transition-all duration-150 ${
              showUploadButtons ? 'cursor-pointer' : ''
            } ${
              hasLogoKanan
                ? 'bg-transparent'
                : 'border-2 border-dashed border-slate-300 bg-slate-50 hover:border-emerald-500 hover:bg-emerald-50/40'
            } ${isDraggingKanan ? 'ring-2 ring-emerald-500 bg-emerald-100/60' : ''}`}
          >
            {hasLogoKanan ? (
              <img
                src={settings.logoKanan}
                alt="Logo Kanan (Sekolah / Tut Wuri)"
                className="w-full h-full object-contain p-0.5 select-none"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-1 text-slate-400 text-center">
                <School className="w-6 h-6 sm:w-7 sm:h-7 text-slate-400 opacity-80" />
                <span className="text-[8px] sm:text-[9px] font-semibold block leading-tight text-slate-500 mt-0.5">
                  Logo Kanan
                </span>
              </div>
            )}

            {/* Hover overlay on desktop (no-print) */}
            {showUploadButtons && hasLogoKanan && isHoveringKanan && (
              <div className="no-print absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center text-white text-[10px] font-bold p-1 text-center transition-opacity">
                Ganti Logo
              </div>
            )}
          </div>

          {/* Tombol Upload & Hapus Logo Kanan (no-print) */}
          {showUploadButtons && (
            <div className="no-print mt-1.5 flex flex-col sm:flex-row items-center gap-1">
              <button
                type="button"
                id="btn-upload-logo-kanan"
                onClick={() => fileInputKananRef.current?.click()}
                className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-[10px] font-bold flex items-center gap-1 shadow-xs cursor-pointer transition-colors active:scale-95"
                title="Unggah berkas gambar untuk Logo Kanan"
              >
                <Upload className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span>{hasLogoKanan ? 'Ganti' : 'Upload Logo Kanan'}</span>
              </button>

              {hasLogoKanan && (
                <button
                  type="button"
                  id="btn-remove-logo-kanan"
                  onClick={(e) => handleRemove('kanan', e)}
                  className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Hapus Logo Kanan"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Official Government Double Border Divider Line */}
      <div className="mt-3 pt-1 border-b-4 border-double border-slate-900 w-full" />
    </div>
  );
};
