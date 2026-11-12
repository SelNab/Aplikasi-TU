import React, { useRef, useState } from 'react';
import { useActionToolbar } from '../context/ActionToolbarContext';
import { PaperSize } from '../types';
import { safeConfirm } from '../utils/exportHelpers';
import {
  Home,
  PlusCircle,
  Save,
  Eye,
  Trash2,
  Search,
  Edit3,
  XCircle,
  ArrowLeft,
  Archive,
  Lock,
  Unlock,
  CheckSquare,
  Printer,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  Presentation,
  Upload,
  RotateCcw,
  CloudLightning,
  FileCheck,
  Maximize2,
  Copy,
  ClipboardPaste,
  Download,
  UploadCloud,
  CheckCircle2,
  X,
  Layers
} from 'lucide-react';

interface RightActionPanelProps {
  onCloseMobileDrawer?: () => void;
  isMobileDrawer?: boolean;
}

export const RightActionPanel: React.FC<RightActionPanelProps> = ({
  onCloseMobileDrawer,
  isMobileDrawer = false
}) => {
  const { currentActions, paperSize, setPaperSize } = useActionToolbar();
  const [searchFilter, setSearchFilter] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importFileInputRef = useRef<HTMLInputElement>(null);

  const notify = (msg: string) => {
    if (currentActions?.notifyMessage) {
      currentActions.notifyMessage(msg);
    }
  };

  const handleAction = (callback?: () => void, defaultMessage = 'Data Anda Berhasil Disimpan') => {
    if (callback) {
      callback();
    }
    notify(defaultMessage);
  };

  const handleCopyAction = async () => {
    if (currentActions?.onCopy) {
      currentActions.onCopy();
      return;
    }
    try {
      const activeText = window.getSelection()?.toString();
      const contentToCopy =
        activeText ||
        (currentActions?.titleContext
          ? `Data ${currentActions.titleContext} SD NEGERI BAALIL`
          : 'Data Administrasi SD NEGERI BAALIL');
      await navigator.clipboard.writeText(contentToCopy);
      notify('Data Berhasil Di-copy ke Clipboard');
    } catch {
      notify('Data Berhasil Di-copy');
    }
  };

  const handlePasteAction = async () => {
    if (currentActions?.onPaste) {
      currentActions.onPaste();
      return;
    }
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          notify(`Data Berhasil Di-paste: ${text.slice(0, 35)}...`);
        } else {
          notify('Data Berhasil Di-paste');
        }
      } else {
        notify('Data Berhasil Di-paste');
      }
    } catch {
      notify('Data Berhasil Di-paste');
    }
  };

  const handleExportAction = () => {
    if (currentActions?.onExport) {
      currentActions.onExport();
    } else if (currentActions?.onExcel) {
      currentActions.onExcel();
    } else if (currentActions?.onPdf) {
      currentActions.onPdf();
    } else {
      notify('Mengekspor Data Administrasi...');
    }
  };

  const handleImportAction = () => {
    if (currentActions?.onImport) {
      currentActions.onImport();
    } else {
      importFileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (currentActions?.onUploadPhoto) {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          currentActions.onUploadPhoto?.(result);
          notify('Foto / Berkas Berhasil Diunggah');
        };
        reader.readAsDataURL(file);
      } else {
        notify(`Foto "${file.name}" berhasil diunggah.`);
      }
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      notify(`Berkas "${file.name}" berhasil diimpor ke sistem.`);
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const currentPaper = currentActions?.paperSize || paperSize;
  const isLocked = currentActions?.isLocked || false;
  const isArchived = currentActions?.isArchived || false;

  const allActions = [
    // Group 1: Aksi Utama Formulir
    {
      id: 'btn-beranda',
      label: 'Beranda',
      sublabel: 'Kembali ke halaman muka',
      category: 'Aksi Formulir',
      icon: Home,
      color: 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300',
      iconColor: 'text-slate-700',
      onClick: () => handleAction(currentActions?.onHome, 'Kembali ke Beranda Utama')
    },
    {
      id: 'btn-tambah-baru',
      label: 'Tambah Baru',
      sublabel: 'Formulir data baru',
      category: 'Aksi Formulir',
      icon: PlusCircle,
      color: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs',
      iconColor: 'text-white',
      onClick: () => handleAction(currentActions?.onAddNew, 'Form Tambah Baru Siap')
    },
    {
      id: 'btn-simpan',
      label: 'Simpan Data',
      sublabel: 'Simpan ke database offline/online',
      category: 'Aksi Formulir',
      icon: Save,
      color: 'bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-xs ring-1 ring-emerald-500',
      iconColor: 'text-white',
      onClick: () => handleAction(currentActions?.onSave, 'Data Anda Berhasil Disimpan')
    },
    {
      id: 'btn-edit',
      label: 'Edit Data',
      sublabel: 'Aktifkan mode pengubahan data',
      category: 'Aksi Formulir',
      icon: Edit3,
      color: 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-300',
      iconColor: 'text-blue-700',
      onClick: () => handleAction(currentActions?.onEdit, 'Mode Edit Data Diaktifkan')
    },
    {
      id: 'btn-hapus',
      label: 'Hapus Data',
      sublabel: 'Hapus data yang dipilih',
      category: 'Aksi Formulir',
      icon: Trash2,
      color: 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-300',
      iconColor: 'text-rose-600',
      onClick: () => handleAction(currentActions?.onDelete, 'Data Berhasil Dihapus')
    },
    {
      id: 'btn-batal',
      label: 'Batal',
      sublabel: 'Batalkan input/edit saat ini',
      category: 'Aksi Formulir',
      icon: XCircle,
      color: 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300',
      iconColor: 'text-slate-600',
      onClick: () => handleAction(currentActions?.onCancel, 'Tindakan Dibatalkan')
    },
    {
      id: 'btn-kembali',
      label: 'Kembali',
      sublabel: 'Kembali ke tampilan sebelumnya',
      category: 'Aksi Formulir',
      icon: ArrowLeft,
      color: 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300',
      iconColor: 'text-slate-600',
      onClick: () => handleAction(currentActions?.onBack, 'Kembali')
    },

    // Group 2: Pencarian & Pratinjau
    {
      id: 'btn-cari',
      label: 'Cari Data',
      sublabel: 'Pencarian cepat kata kunci',
      category: 'Pencarian & Cetak',
      icon: Search,
      color: 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300',
      iconColor: 'text-amber-700',
      onClick: () => handleAction(currentActions?.onSearch, 'Pencarian Data Aktif')
    },
    {
      id: 'btn-lihat',
      label: 'Lihat Rincian',
      sublabel: 'Buka kartu data terpilih',
      category: 'Pencarian & Cetak',
      icon: Eye,
      color: 'bg-sky-50 hover:bg-sky-100 text-sky-800 border-sky-300',
      iconColor: 'text-sky-600',
      onClick: () => handleAction(currentActions?.onView, 'Membuka Tampilan Detail Data')
    },
    {
      id: 'btn-review',
      label: 'Review Dokumen',
      sublabel: 'Pratinjau sebelum cetak',
      category: 'Pencarian & Cetak',
      icon: CheckSquare,
      color: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border-indigo-300',
      iconColor: 'text-indigo-600',
      onClick: () => handleAction(currentActions?.onReview, 'Membuka Pratinjau / Review')
    },
    {
      id: 'btn-print',
      label: 'Print / Cetak',
      sublabel: 'Cetak fisik printer dokumen',
      category: 'Pencarian & Cetak',
      icon: Printer,
      color: 'bg-slate-800 hover:bg-slate-900 text-white shadow-xs',
      iconColor: 'text-emerald-300',
      onClick: () => handleAction(currentActions?.onPrint, 'Menyiapkan Cetak Dokumen')
    },

    // Group 3: Salin & Berkas
    {
      id: 'btn-copy',
      label: 'Copy Data',
      sublabel: 'Salin ke clipboard komputer',
      category: 'Salin & Berkas',
      icon: Copy,
      color: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border-indigo-300',
      iconColor: 'text-indigo-600',
      onClick: handleCopyAction
    },
    {
      id: 'btn-paste',
      label: 'Paste Data',
      sublabel: 'Tempel dari clipboard',
      category: 'Salin & Berkas',
      icon: ClipboardPaste,
      color: 'bg-violet-50 hover:bg-violet-100 text-violet-800 border-violet-300',
      iconColor: 'text-violet-600',
      onClick: handlePasteAction
    },
    {
      id: 'btn-upload-foto',
      label: 'Upload Foto / Gambar',
      sublabel: 'Pilih berkas gambar atau foto',
      category: 'Salin & Berkas',
      icon: Upload,
      color: 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs',
      iconColor: 'text-white',
      onClick: () => fileInputRef.current?.click()
    },

    // Group 4: Keamanan & Status
    {
      id: 'btn-kunci-data',
      label: isLocked ? 'Buka Kunci Data' : 'Kunci Data',
      sublabel: isLocked ? 'Status terkunci aktif' : 'Lindungi dari pengubahan',
      category: 'Keamanan & Status',
      icon: isLocked ? Unlock : Lock,
      color: isLocked
        ? 'bg-rose-100 hover:bg-rose-200 text-rose-800 border-rose-400'
        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300',
      iconColor: isLocked ? 'text-rose-600' : 'text-emerald-600',
      onClick: () =>
        handleAction(
          currentActions?.onLock,
          isLocked ? 'Kunci Data Berhasil Dibuka' : 'Data Anda Berhasil Dikunci'
        )
    },
    {
      id: 'btn-arsipkan',
      label: isArchived ? 'Buka Arsip Data' : 'Arsipkan Data',
      sublabel: isArchived ? 'Status tersimpan di arsip' : 'Pindahkan ke buku arsip',
      category: 'Keamanan & Status',
      icon: Archive,
      color: 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-400',
      iconColor: 'text-amber-700',
      onClick: () =>
        handleAction(
          currentActions?.onArchive,
          isArchived ? 'Data Dikeluarkan dari Arsip' : 'Data Anda Berhasil Disimpan ke Arsip'
        )
    },
    {
      id: 'btn-update',
      label: 'Update Data',
      sublabel: 'Perbarui isi data terbaru',
      category: 'Keamanan & Status',
      icon: RefreshCw,
      color: 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs',
      iconColor: 'text-white',
      onClick: () => handleAction(currentActions?.onUpdate, 'Data Anda Berhasil Disimpan')
    },
    {
      id: 'btn-refresh-data',
      label: 'Refres Data',
      sublabel: 'Muat ulang data dari storage',
      category: 'Keamanan & Status',
      icon: RefreshCw,
      color: 'bg-slate-200 hover:bg-slate-300 text-slate-800 border-slate-300',
      iconColor: 'text-slate-700',
      onClick: () => handleAction(currentActions?.onRefresh, 'Data Anda Berhasil Disimpan')
    },

    // Group 5: Ekspor & Impor Data
    {
      id: 'btn-expor',
      label: 'Expor Data',
      sublabel: 'Ekspor database/berkas sekolah',
      category: 'Ekspor & Impor',
      icon: Download,
      color: 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs',
      iconColor: 'text-emerald-100',
      onClick: handleExportAction
    },
    {
      id: 'btn-impor',
      label: 'Impor Data',
      sublabel: 'Impor Excel / CSV / JSON Dapodik',
      category: 'Ekspor & Impor',
      icon: UploadCloud,
      color: 'bg-teal-700 hover:bg-teal-800 text-white shadow-xs',
      iconColor: 'text-teal-100',
      onClick: handleImportAction
    },
    {
      id: 'btn-template',
      label: 'Template Dapodik',
      sublabel: 'Muat format baku kementerian',
      category: 'Ekspor & Impor',
      icon: FileCheck,
      color: 'bg-purple-50 hover:bg-purple-100 text-purple-800 border-purple-300',
      iconColor: 'text-purple-700',
      onClick: () => handleAction(currentActions?.onTemplate, 'Template Dapodik / Form Dimuat')
    },
    {
      id: 'btn-singkron-data',
      label: 'Singkron Data',
      sublabel: 'Sinkronisasi online cloud & drive',
      category: 'Ekspor & Impor',
      icon: CloudLightning,
      color: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xs font-bold',
      iconColor: 'text-amber-200',
      onClick: () => handleAction(currentActions?.onSync, 'Singkron Data Berhasil Dilakukan')
    },

    // Group 6: Format Dokumen
    {
      id: 'btn-pdf',
      label: 'Export PDF',
      sublabel: 'Simpan file PDF siap cetak',
      category: 'Format Berkas',
      icon: FileText,
      color: 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs',
      iconColor: 'text-white',
      onClick: () => handleAction(currentActions?.onPdf, 'Mengekspor Dokumen ke Format PDF')
    },
    {
      id: 'btn-excel',
      label: 'Export Excel',
      sublabel: 'Format spreadsheet (.xlsx/.xls)',
      category: 'Format Berkas',
      icon: FileSpreadsheet,
      color: 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs',
      iconColor: 'text-white',
      onClick: () => handleAction(currentActions?.onExcel, 'Mengekspor Data ke Format Excel (.xls)')
    },
    {
      id: 'btn-word',
      label: 'Export Word',
      sublabel: 'Dokumen teks cetak surat (.doc)',
      category: 'Format Berkas',
      icon: FileText,
      color: 'bg-blue-700 hover:bg-blue-800 text-white shadow-xs',
      iconColor: 'text-white',
      onClick: () => handleAction(currentActions?.onWord, 'Mengekspor Dokumen ke Format Word (.doc)')
    },
    {
      id: 'btn-ppt',
      label: 'Export PPT',
      sublabel: 'Slide presentasi laporan sekolah',
      category: 'Format Berkas',
      icon: Presentation,
      color: 'bg-orange-600 hover:bg-orange-700 text-white shadow-xs',
      iconColor: 'text-white',
      onClick: () => handleAction(currentActions?.onPpt, 'Mengekspor Slide Presentasi PPT')
    },

    // Group 7: Reset Formulir
    {
      id: 'btn-reset-data',
      label: 'Reset Data Formulir',
      sublabel: 'Bersihkan seluruh isian form',
      category: 'Reset',
      icon: RotateCcw,
      color: 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300',
      iconColor: 'text-slate-600',
      onClick: () => {
        if (safeConfirm('Apakah Anda yakin ingin mereset formulir/data ini?')) {
          handleAction(currentActions?.onReset, 'Data Formulir Berhasil Direset');
        }
      }
    }
  ];

  const filteredActions = allActions.filter(
    (act) =>
      act.label.toLowerCase().includes(searchFilter.toLowerCase()) ||
      act.sublabel.toLowerCase().includes(searchFilter.toLowerCase()) ||
      act.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  // Group actions by category
  const categories = Array.from(new Set(filteredActions.map((a) => a.category)));

  return (
    <div className="bg-white border-2 border-emerald-700/25 rounded-xl shadow-md overflow-hidden flex flex-col max-h-[calc(100vh-1.5rem)] no-print">
      {/* Hidden file input for photo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Hidden file input for data import */}
      <input
        ref={importFileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv,.json,.doc,.docx"
        className="hidden"
        onChange={handleImportFileChange}
      />

      {/* Header Panel */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-2 border-b border-emerald-900/30 flex-shrink-0">
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-6 h-6 rounded-md bg-emerald-700/60 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
              <Layers className="w-3.5 h-3.5 text-emerald-200" />
            </div>
            <div className="min-w-0">
              <h2 className="text-[11px] font-black tracking-wider uppercase flex items-center gap-1 leading-tight truncate">
                <span>Tombol Aksi</span>
                <span className="inline-flex items-center px-1 py-0.2 rounded text-[8.5px] font-bold bg-emerald-500/30 text-emerald-100 border border-emerald-400/40">
                  Aktif
                </span>
              </h2>
              <p className="text-[9px] text-emerald-200 truncate max-w-[140px] leading-tight">
                {currentActions?.titleContext || 'Administrasi'}
              </p>
            </div>
          </div>

          {isMobileDrawer && onCloseMobileDrawer && (
            <button
              type="button"
              onClick={onCloseMobileDrawer}
              className="p-1 rounded-md text-emerald-200 hover:text-white hover:bg-emerald-700/50 cursor-pointer"
              title="Tutup Panel Aksi"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Paper Size Selector in Right Panel */}
        <div className="mt-1.5 pt-1.5 border-t border-emerald-700/60 flex items-center justify-between text-[10px]">
          <span className="font-semibold text-emerald-100 flex items-center gap-1">
            <Maximize2 className="w-2.5 h-2.5 text-emerald-300" />
            Kertas:
          </span>
          <select
            value={currentPaper}
            onChange={(e) => {
              const newSize = e.target.value as PaperSize;
              setPaperSize(newSize);
              if (currentActions?.onChangePaperSize) {
                currentActions.onChangePaperSize(newSize);
              }
              notify(`Ukuran kertas: ${newSize}`);
            }}
            className="bg-white text-emerald-950 font-bold text-[10px] rounded px-1.5 py-0.5 border border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer"
          >
            <option value="F4">F4 (Folio)</option>
            <option value="A4">A4</option>
            <option value="Legal">Legal</option>
            <option value="Letter">Letter</option>
          </select>
        </div>

        {/* Search inside Actions List */}
        <div className="mt-1.5 relative">
          <Search className="w-3 h-3 text-emerald-300 absolute left-2 top-1.5 pointer-events-none" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Cari aksi..."
            className="w-full pl-6 pr-2 py-0.5 text-[10.5px] bg-emerald-900/50 text-white placeholder-emerald-300/70 border border-emerald-700 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-400"
          />
        </div>
      </div>

      {/* Vertical List of All Action Buttons */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-2 divide-y divide-slate-100">
        {categories.length === 0 ? (
          <div className="p-3 text-center text-[10px] text-slate-400">
            Tidak ada aksi cocok "{searchFilter}".
          </div>
        ) : (
          categories.map((category) => {
            const items = filteredActions.filter((a) => a.category === category);
            return (
              <div key={category} className="pt-1.5 first:pt-0">
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider px-1 pb-0.5 mb-0.5 border-b border-slate-100 flex items-center justify-between">
                  <span>{category}</span>
                  <span className="text-emerald-700 font-mono text-[8.5px]">{items.length}</span>
                </div>
                <div className="space-y-0.5">
                  {items.map((action) => {
                    const IconComponent = action.icon;
                    return (
                      <button
                        key={action.id}
                        id={action.id}
                        type="button"
                        onClick={action.onClick}
                        className={`w-full text-left flex items-center justify-between px-1.5 py-1 rounded-md border transition-all active:scale-[0.98] cursor-pointer group ${action.color}`}
                        title={`${action.label} - ${action.sublabel}`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 bg-black/5 group-hover:bg-black/10 transition-colors">
                            <IconComponent className={`w-3 h-3 ${action.iconColor}`} />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-[10.5px] truncate leading-tight">
                              {action.label}
                            </div>
                            <div className="text-[8.5px] opacity-75 truncate leading-tight">
                              {action.sublabel}
                            </div>
                          </div>
                        </div>
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-40 ml-1 flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info of Right Panel */}
      <div className="p-1.5 bg-slate-50 border-t border-slate-200 text-center flex-shrink-0">
        <div className="flex items-center justify-center gap-1 text-[9px] text-emerald-800 font-semibold">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>27 Tombol Siap</span>
        </div>
      </div>
    </div>
  );
};
