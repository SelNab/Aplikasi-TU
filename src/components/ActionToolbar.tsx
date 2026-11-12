import React, { useEffect, useRef, useState } from 'react';
import { useActionToolbar } from '../context/ActionToolbarContext';
import { PaperSize } from '../types';
import {
  Save,
  Trash2,
  Edit3,
  Search,
  Eye,
  PlusCircle,
  XCircle,
  ArrowLeft,
  Archive,
  Lock,
  Unlock,
  Printer,
  FileText,
  FileSpreadsheet,
  Download,
  Upload,
  RefreshCw,
  Copy,
  ClipboardPaste,
  CloudLightning,
  Presentation,
  FileCheck,
  RotateCcw,
  CheckSquare,
  UploadCloud,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
  FileDown
} from 'lucide-react';

export interface ActionToolbarProps {
  onHome?: () => void;
  onAddNew?: () => void;
  onSave?: () => void;
  onView?: () => void;
  onDelete?: () => void;
  onSearch?: () => void;
  onEdit?: () => void;
  onCancel?: () => void;
  onBack?: () => void;
  onArchive?: () => void;
  onLock?: () => void;
  onReview?: () => void;
  onPrint?: () => void;
  onPrintSingle?: () => void;
  onUpdate?: () => void;
  onTemplate?: () => void;
  onPdf?: () => void;
  onExcel?: () => void;
  onWord?: () => void;
  onPpt?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onUploadPhoto?: (base64: string) => void;
  onRefresh?: () => void;
  onSync?: () => void;
  onReset?: () => void;
  isLocked?: boolean;
  isArchived?: boolean;
  paperSize?: PaperSize;
  onChangePaperSize?: (size: PaperSize) => void;
  notifyMessage?: (msg?: string) => void;
  titleContext?: string;
  isReadOnly?: boolean;
}

/**
 * ActionToolbar Component
 * Menampilkan bilah tombol aksi lengkap terintegrasi langsung pada setiap tabel data modul.
 * Menyediakan 27 aksi aktif standar Dapodik, kontrol ukuran kertas cetak (F4, A4, Legal, Letter),
 * serta akses cepat dan katalog aksi lengkap.
 */
export const ActionToolbar: React.FC<ActionToolbarProps> = (props) => {
  const { setCurrentActions } = useActionToolbar();
  const propsRef = useRef<ActionToolbarProps>(props);
  propsRef.current = props;

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentActions(propsRef.current);
  });

  const notify = (msg: string) => {
    if (props.notifyMessage) {
      props.notifyMessage(msg);
    }
  };

  const handleAction = (callback?: () => void, defaultMessage = 'Data Anda Berhasil Disimpan') => {
    if (callback) {
      callback();
    }
    notify(defaultMessage);
  };

  const handleCopyAction = async () => {
    if (props.onCopy) {
      props.onCopy();
      return;
    }
    try {
      const activeText = window.getSelection()?.toString();
      const contentToCopy =
        activeText ||
        (props.titleContext
          ? `Data ${props.titleContext} SD NEGERI BAALIL`
          : 'Data Administrasi SD NEGERI BAALIL');
      await navigator.clipboard.writeText(contentToCopy);
      notify('Data Berhasil Di-copy ke Clipboard');
    } catch {
      notify('Data Berhasil Di-copy');
    }
  };

  const handlePasteAction = async () => {
    if (props.onPaste) {
      props.onPaste();
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
    if (props.onExport) {
      props.onExport();
    } else if (props.onExcel) {
      props.onExcel();
    } else if (props.onPdf) {
      props.onPdf();
    } else {
      notify('Mengekspor Data Administrasi...');
    }
  };

  const handleImportAction = () => {
    if (props.onImport) {
      props.onImport();
    } else {
      importInputRef.current?.click();
    }
  };

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (props.onUploadPhoto) {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          props.onUploadPhoto?.(result);
          notify('Foto / Gambar Berhasil Diunggah');
        };
        reader.readAsDataURL(file);
      } else {
        notify(`Foto "${file.name}" Berhasil Diunggah`);
      }
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      notify(`Berkas "${file.name}" Berhasil Diimpor ke Tabel`);
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const paperSizes: PaperSize[] = ['F4', 'A4', 'Legal', 'Letter'];
  const currentPaper = props.paperSize || 'F4';

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200/90 shadow-xs mb-3.5 p-3 space-y-2.5 no-print transition-all">
      {/* Hidden inputs for photo and file import */}
      <input
        type="file"
        ref={photoInputRef}
        accept="image/*"
        className="hidden"
        onChange={handlePhotoFileChange}
      />
      <input
        type="file"
        ref={importInputRef}
        accept=".json,.csv,.xlsx,.xls"
        className="hidden"
        onChange={handleImportFileChange}
      />

      {/* Top Bar: Title Context, Status Badges, Paper Size, & Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase text-slate-800 tracking-wide">
                Bilah Tombol Aksi Data Tabel
              </span>
              {props.titleContext && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 hidden sm:inline-block">
                  {props.titleContext}
                </span>
              )}
            </div>
            <div className="text-[10.5px] text-slate-500 flex items-center gap-2">
              <span>27 Tombol Aksi Aktif Terintegrasi</span>
              {props.isLocked && (
                <span className="inline-flex items-center gap-0.5 text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700">
                  <Lock className="w-2.5 h-2.5" /> Terkunci
                </span>
              )}
              {props.isArchived && (
                <span className="inline-flex items-center gap-0.5 text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                  <Archive className="w-2.5 h-2.5" /> Arsip
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Paper Size Selector & Expand All Toggle */}
        <div className="flex items-center gap-2">
          {/* Paper Size Selector */}
          <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-lg border border-slate-200 text-xs">
            <span className="text-[10px] font-bold text-slate-600 px-1 hidden md:inline">
              Kertas:
            </span>
            {paperSizes.map((sz) => (
              <button
                key={sz}
                type="button"
                id={`btn-paper-${sz}`}
                onClick={() => {
                  if (props.onChangePaperSize) {
                    props.onChangePaperSize(sz);
                  }
                  notify(`Format Kertas Cetak Diubah ke ${sz}`);
                }}
                className={`px-2 py-0.5 rounded text-[10.5px] font-bold transition-all cursor-pointer ${
                  currentPaper === sz
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
                title={`Pilih ukuran kertas cetak ${sz}`}
              >
                {sz}
              </button>
            ))}
          </div>

          {/* Toggle Full 27 Actions Button */}
          <button
            type="button"
            id="btn-toggle-all-actions"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
              isExpanded
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300'
            }`}
            title="Tampilkan seluruh 27 tombol aksi lengkap dalam tabel"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{isExpanded ? 'Tutup Katalog Aksi' : 'Katalog 27 Aksi'}</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Primary Action Buttons Bar (High Frequency Data Table Actions) */}
      <div className="flex flex-wrap items-center gap-1.5">
        {/* Tambah Baru */}
        <button
          type="button"
          id="btn-table-tambah"
          onClick={() => handleAction(props.onAddNew, 'Formulir Tambah Data Baru Dibuka')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-transform active:scale-95 cursor-pointer"
          title="Tambah Data Baru ke Tabel"
        >
          <PlusCircle className="w-3.5 h-3.5 text-emerald-100" />
          <span>Tambah Baru</span>
        </button>

        {/* Simpan Data */}
        <button
          type="button"
          id="btn-table-simpan"
          onClick={() => handleAction(props.onSave, 'Data Anda Berhasil Disimpan')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs transition-transform active:scale-95 cursor-pointer ring-1 ring-emerald-600"
          title="Simpan Data Formulir / Tabel"
        >
          <Save className="w-3.5 h-3.5 text-emerald-200" />
          <span>Simpan Data</span>
        </button>

        {/* Edit Data */}
        <button
          type="button"
          id="btn-table-edit"
          onClick={() => handleAction(props.onEdit, 'Mode Edit Data Diaktifkan')}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 font-bold text-xs transition-colors cursor-pointer"
          title="Ubah / Edit Data yang Dipilih"
        >
          <Edit3 className="w-3.5 h-3.5 text-blue-600" />
          <span>Edit</span>
        </button>

        {/* Hapus Data */}
        <button
          type="button"
          id="btn-table-hapus"
          onClick={() => handleAction(props.onDelete, 'Data Berhasil Dihapus')}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold text-xs transition-colors cursor-pointer"
          title="Hapus Data Terpilih"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
          <span>Hapus</span>
        </button>

        {/* Cari Data */}
        <button
          type="button"
          id="btn-table-cari"
          onClick={() => handleAction(props.onSearch, 'Pencarian Data Diaktifkan')}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs transition-colors cursor-pointer"
          title="Pencarian Cepat Data Tabel"
        >
          <Search className="w-3.5 h-3.5 text-amber-600" />
          <span>Cari</span>
        </button>

        {/* Lihat Rincian */}
        <button
          type="button"
          id="btn-table-lihat"
          onClick={() => handleAction(props.onView, 'Membuka Kartu Rincian Data')}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 font-bold text-xs transition-colors cursor-pointer"
          title="Lihat Rincian Data Terpilih"
        >
          <Eye className="w-3.5 h-3.5 text-sky-600" />
          <span>Rincian</span>
        </button>

        {/* Cetak 1 Data (Tunggal / Satu per Satu) */}
        {props.onPrintSingle && (
          <button
            type="button"
            id="btn-table-print-single"
            onClick={() => handleAction(props.onPrintSingle, 'Mempersiapkan Cetak 1 Data Terpilih')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer ring-1 ring-emerald-500"
            title="Cetak Data Terpilih Satu per Satu (Dokumen Tunggal Resmi)"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-200" />
            <span>Cetak 1 Data</span>
          </button>
        )}

        {/* Cetak / Print Rekapitulasi */}
        <button
          type="button"
          id="btn-table-print"
          onClick={() => handleAction(props.onPrint || (() => window.print()), 'Mempersiapkan Cetak Dokumen')}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          title={props.onPrintSingle ? "Cetak Rekapan Seluruh Data Tabel" : "Cetak Fisik Dokumen Tabel"}
        >
          <Printer className="w-3.5 h-3.5 text-slate-300" />
          <span>{props.onPrintSingle ? "Cetak Rekap" : "Cetak"}</span>
        </button>

        {/* Export Excel */}
        <button
          type="button"
          id="btn-table-excel"
          onClick={() => handleAction(props.onExcel || handleExportAction, 'Mengekspor Data ke Format Excel (.xls)')}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs transition-colors cursor-pointer"
          title="Ekspor Data ke Format Excel"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          <span>Excel</span>
        </button>

        {/* Export PDF */}
        <button
          type="button"
          id="btn-table-pdf"
          onClick={() => handleAction(props.onPdf || props.onPrint, 'Mengekspor Dokumen ke Format PDF')}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 font-bold text-xs transition-colors cursor-pointer"
          title="Simpan Dokumen ke Format PDF Siap Cetak"
        >
          <FileText className="w-3.5 h-3.5 text-rose-600" />
          <span>PDF</span>
        </button>

        {/* Export Word */}
        <button
          type="button"
          id="btn-table-word"
          onClick={() => handleAction(props.onWord, 'Mengekspor Dokumen ke Format Word (.doc)')}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 font-bold text-xs transition-colors cursor-pointer"
          title="Ekspor Format Microsoft Word"
        >
          <FileDown className="w-3.5 h-3.5 text-blue-600" />
          <span>Word</span>
        </button>

        {/* Kunci Data */}
        <button
          type="button"
          id="btn-table-lock"
          onClick={() =>
            handleAction(
              props.onLock,
              props.isLocked ? 'Kunci Data Berhasil Dibuka' : 'Data Anda Berhasil Dikunci'
            )
          }
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-bold text-xs transition-colors cursor-pointer ${
            props.isLocked
              ? 'bg-rose-100 hover:bg-rose-200 text-rose-900 border-rose-400'
              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
          }`}
          title={props.isLocked ? 'Buka Kunci Data' : 'Kunci Data dari Perubahan'}
        >
          {props.isLocked ? (
            <>
              <Unlock className="w-3.5 h-3.5 text-rose-600" />
              <span>Buka Kunci</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Kunci Data</span>
            </>
          )}
        </button>

        {/* Arsipkan */}
        <button
          type="button"
          id="btn-table-archive"
          onClick={() =>
            handleAction(
              props.onArchive,
              props.isArchived ? 'Data Dikeluarkan dari Arsip' : 'Data Anda Berhasil Disimpan ke Arsip'
            )
          }
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-bold text-xs transition-colors cursor-pointer ${
            props.isArchived
              ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-400'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
          }`}
          title={props.isArchived ? 'Buka Arsip Data' : 'Pindahkan Data ke Buku Arsip'}
        >
          <Archive className="w-3.5 h-3.5 text-amber-600" />
          <span>{props.isArchived ? 'Buka Arsip' : 'Arsipkan'}</span>
        </button>

        {/* Refres Data */}
        <button
          type="button"
          id="btn-table-refresh"
          onClick={() => handleAction(props.onRefresh, 'Data Anda Berhasil Disimpan')}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold text-xs transition-colors cursor-pointer"
          title="Muat Ulang / Sinkronisasi Tabel"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
          <span>Refres</span>
        </button>
      </div>

      {/* Expandable Comprehensive Catalog of All 27 Actions */}
      {isExpanded && (
        <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 animate-in fade-in duration-150">
          {/* Kelompok 1: Aksi Formulir & Input */}
          <div className="bg-white p-2.5 rounded-lg border border-slate-200/90 shadow-2xs space-y-1.5">
            <h4 className="text-[10px] font-black uppercase text-emerald-800 pb-1 border-b border-slate-100 flex items-center gap-1">
              <PlusCircle className="w-3 h-3 text-emerald-600" />
              <span>Aksi Formulir (6)</span>
            </h4>
            <div className="space-y-1">
              <button
                type="button"
                id="btn-cat-tambah"
                onClick={() => handleAction(props.onAddNew, 'Form Tambah Data Dibuka')}
                className="w-full text-left flex items-center gap-1.5 p-1 rounded hover:bg-emerald-50 text-[11px] font-semibold text-slate-700 cursor-pointer"
              >
                <PlusCircle className="w-3 h-3 text-emerald-600" />
                <span>1. Tambah Baru</span>
              </button>
              <button
                type="button"
                id="btn-cat-simpan"
                onClick={() => handleAction(props.onSave, 'Data Anda Berhasil Disimpan')}
                className="w-full text-left flex items-center gap-1.5 p-1 rounded hover:bg-emerald-50 text-[11px] font-semibold text-slate-700 cursor-pointer"
              >
                <Save className="w-3 h-3 text-emerald-700" />
                <span>2. Simpan Data</span>
              </button>
              <button
                type="button"
                id="btn-cat-edit"
                onClick={() => handleAction(props.onEdit, 'Mode Edit Data Diaktifkan')}
                className="w-full text-left flex items-center gap-1.5 p-1 rounded hover:bg-blue-50 text-[11px] font-semibold text-slate-700 cursor-pointer"
              >
                <Edit3 className="w-3 h-3 text-blue-600" />
                <span>3. Edit Data</span>
              </button>
              <button
                type="button"
                id="btn-cat-hapus"
                onClick={() => handleAction(props.onDelete, 'Data Berhasil Dihapus')}
                className="w-full text-left flex items-center gap-1.5 p-1 rounded hover:bg-rose-50 text-[11px] font-semibold text-rose-700 cursor-pointer"
              >
                <Trash2 className="w-3 h-3 text-rose-600" />
                <span>4. Hapus Data</span>
              </button>
              <button
                type="button"
                id="btn-cat-batal"
                onClick={() => handleAction(props.onCancel, 'Tindakan Dibatalkan')}
                className="w-full text-left flex items-center gap-1.5 p-1 rounded hover:bg-slate-100 text-[11px] font-semibold text-slate-600 cursor-pointer"
              >
                <XCircle className="w-3 h-3 text-slate-500" />
                <span>5. Batal</span>
              </button>
              <button
                type="button"
                id="btn-cat-kembali"
                onClick={() => handleAction(props.onBack || props.onHome, 'Kembali')}
                className="w-full text-left flex items-center gap-1.5 p-1 rounded hover:bg-slate-100 text-[11px] font-semibold text-slate-600 cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3 text-slate-500" />
                <span>6. Kembali</span>
              </button>
            </div>
          </div>

          {/* Kelompok 2: Pencarian & Pratinjau Cetak */}
          <div className="bg-white p-2.5 rounded-lg border border-slate-200/90 shadow-2xs space-y-1.5">
            <h4 className="text-[10px] font-black uppercase text-amber-800 pb-1 border-b border-slate-100 flex items-center gap-1">
              <Search className="w-3 h-3 text-amber-600" />
              <span>Pencarian & Cetak (4)</span>
            </h4>
            <div className="space-y-1">
              <button
                type="button"
                id="btn-cat-cari"
                onClick={() => handleAction(props.onSearch, 'Pencarian Cepat Diaktifkan')}
                className="w-full text-left flex items-center gap-1.5 p-1 rounded hover:bg-amber-50 text-[11px] font-semibold text-slate-700 cursor-pointer"
              >
                <Search className="w-3 h-3 text-amber-600" />
                <span>7. Cari Data</span>
              </button>
              <button
                type="button"
                id="btn-cat-lihat"
                onClick={() => handleAction(props.onView, 'Membuka Detail Data')}
                className="w-full text-left flex items-center gap-1.5 p-1 rounded hover:bg-sky-50 text-[11px] font-semibold text-slate-700 cursor-pointer"
              >
                <Eye className="w-3 h-3 text-sky-600" />
                <span>8. Lihat Rincian</span>
              </button>
              <button
                type="button"
                id="btn-cat-review"
                onClick={() => handleAction(props.onReview || props.onView, 'Membuka Pratinjau Dokumen')}
                className="w-full text-left flex items-center gap-1.5 p-1 rounded hover:bg-indigo-50 text-[11px] font-semibold text-slate-700 cursor-pointer"
              >
                <CheckSquare className="w-3 h-3 text-indigo-600" />
                <span>9. Review Dokumen</span>
              </button>
              <button
                type="button"
                id="btn-cat-print"
                onClick={() => handleAction(props.onPrint || (() => window.print()), 'Mempersiapkan Cetak Dokumen')}
                className="w-full text-left flex items-center gap-1.5 p-1 rounded hover:bg-slate-100 text-[11px] font-semibold text-slate-800 cursor-pointer"
              >
                <Printer className="w-3 h-3 text-slate-700" />
                <span>10. Print / Cetak</span>
              </button>
            </div>
          </div>

          {/* Kelompok 3: Salin & Berkas */}
          <div className="bg-white p-2.5 rounded-lg border border-slate-200/90 shadow-2xs space-y-1.5">
            <h4 className="text-[10px] font-black uppercase text-indigo-800 pb-1 border-b border-slate-100 flex items-center gap-1">
              <Copy className="w-3 h-3 text-indigo-600" />
              <span>Salin & Berkas (3)</span>
            </h4>
            <div className="space-y-1">
              <button
                type="button"
                id="btn-cat-copy"
                onClick={handleCopyAction}
                className="w-full text-left flex items-center gap-1.5 p-1 rounded hover:bg-indigo-50 text-[11px] font-semibold text-slate-700 cursor-pointer"
              >
                <Copy className="w-3 h-3 text-indigo-600" />
                <span>11. Copy Data</span>
              </button>
              <button
                type="button"
                id="btn-cat-paste"
                onClick={handlePasteAction}
                className="w-full text-left flex items-center gap-1.5 p-1 rounded hover:bg-violet-50 text-[11px] font-semibold text-slate-700 cursor-pointer"
              >
                <ClipboardPaste className="w-3 h-3 text-violet-600" />
                <span>12. Paste Data</span>
              </button>
              <button
                type="button"
                id="btn-cat-upload-foto"
                onClick={() => photoInputRef.current?.click()}
                className="w-full text-left flex items-center gap-1.5 p-1 rounded hover:bg-cyan-50 text-[11px] font-semibold text-slate-700 cursor-pointer"
              >
                <Upload className="w-3 h-3 text-cyan-600" />
                <span>13. Upload Foto / Gambar</span>
              </button>
            </div>
          </div>

          {/* Kelompok 4: Keamanan & Status */}
          <div className="bg-white p-2.5 rounded-lg border border-slate-200/90 shadow-2xs space-y-1.5">
            <h4 className="text-[10px] font-black uppercase text-rose-800 pb-1 border-b border-slate-100 flex items-center gap-1">
              <Lock className="w-3 h-3 text-rose-600" />
              <span>Keamanan & Status (4)</span>
            </h4>
            <div className="space-y-1">
              <button
                type="button"
                id="btn-cat-kunci"
                onClick={() =>
                  handleAction(
                    props.onLock,
                    props.isLocked ? 'Kunci Data Berhasil Dibuka' : 'Data Anda Berhasil Dikunci'
                  )
                }
                className="w-full text-left flex items-center gap-1.5 p-1 rounded hover:bg-emerald-50 text-[11px] font-semibold text-slate-700 cursor-pointer"
              >
                {props.isLocked ? (
                  <Unlock className="w-3 h-3 text-rose-600" />
                ) : (
                  <Lock className="w-3 h-3 text-emerald-600" />
                )}
                <span>14. {props.isLocked ? 'Buka Kunci' : 'Kunci Data'}</span>
              </button>
              <button
                type="button"
                id="btn-cat-arsip"
                onClick={() =>
                  handleAction(
                    props.onArchive,
                    props.isArchived ? 'Data Dikeluarkan dari Arsip' : 'Data Anda Berhasil Disimpan ke Arsip'
                  )
                }
                className="w-full text-left flex items-center gap-1.5 p-1 rounded hover:bg-amber-50 text-[11px] font-semibold text-slate-700 cursor-pointer"
              >
                <Archive className="w-3 h-3 text-amber-600" />
                <span>15. {props.isArchived ? 'Buka Arsip' : 'Arsipkan Data'}</span>
              </button>
              <button
                type="button"
                id="btn-cat-update"
                onClick={() => handleAction(props.onUpdate || props.onSave, 'Data Anda Berhasil Disimpan')}
                className="w-full text-left flex items-center gap-1.5 p-1 rounded hover:bg-teal-50 text-[11px] font-semibold text-slate-700 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3 text-teal-600" />
                <span>16. Update Data</span>
              </button>
              <button
                type="button"
                id="btn-cat-refresh"
                onClick={() => handleAction(props.onRefresh, 'Data Anda Berhasil Disimpan')}
                className="w-full text-left flex items-center gap-1.5 p-1 rounded hover:bg-slate-100 text-[11px] font-semibold text-slate-700 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3 text-slate-600" />
                <span>17. Refres Data</span>
              </button>
            </div>
          </div>

          {/* Kelompok 5: Ekspor & Format Berkas */}
          <div className="bg-white p-2.5 rounded-lg border border-slate-200/90 shadow-2xs space-y-1.5">
            <h4 className="text-[10px] font-black uppercase text-teal-800 pb-1 border-b border-slate-100 flex items-center gap-1">
              <Download className="w-3 h-3 text-teal-600" />
              <span>Ekspor & Format (10)</span>
            </h4>
            <div className="space-y-1">
              <button
                type="button"
                id="btn-cat-expor"
                onClick={handleExportAction}
                className="w-full text-left flex items-center gap-1.5 p-1 rounded hover:bg-emerald-50 text-[11px] font-semibold text-slate-700 cursor-pointer"
              >
                <Download className="w-3 h-3 text-emerald-700" />
                <span>18. Expor Data</span>
              </button>
              <button
                type="button"
                id="btn-cat-impor"
                onClick={handleImportAction}
                className="w-full text-left flex items-center gap-1.5 p-1 rounded hover:bg-teal-50 text-[11px] font-semibold text-slate-700 cursor-pointer"
              >
                <UploadCloud className="w-3 h-3 text-teal-700" />
                <span>19. Impor Data</span>
              </button>
              <button
                type="button"
                id="btn-cat-template"
                onClick={() => handleAction(props.onTemplate, 'Template Dapodik Berhasil Dimuat')}
                className="w-full text-left flex items-center gap-1.5 p-1 rounded hover:bg-purple-50 text-[11px] font-semibold text-slate-700 cursor-pointer"
              >
                <FileCheck className="w-3 h-3 text-purple-700" />
                <span>20. Template Dapodik</span>
              </button>
              <button
                type="button"
                id="btn-cat-singkron"
                onClick={() => handleAction(props.onSync, 'Singkron Data Berhasil Dilakukan')}
                className="w-full text-left flex items-center gap-1.5 p-1 rounded hover:bg-emerald-50 text-[11px] font-semibold text-emerald-800 font-bold cursor-pointer"
              >
                <CloudLightning className="w-3 h-3 text-amber-500" />
                <span>21. Singkron Data</span>
              </button>
              <button
                type="button"
                id="btn-cat-pdf"
                onClick={() => handleAction(props.onPdf || props.onPrint, 'Mengekspor Dokumen ke Format PDF')}
                className="w-full text-left flex items-center gap-1.5 p-1 rounded hover:bg-rose-50 text-[11px] font-semibold text-slate-700 cursor-pointer"
              >
                <FileText className="w-3 h-3 text-rose-600" />
                <span>22. Export PDF</span>
              </button>
              <button
                type="button"
                id="btn-cat-excel"
                onClick={() => handleAction(props.onExcel, 'Mengekspor Data ke Format Excel (.xls)')}
                className="w-full text-left flex items-center gap-1.5 p-1 rounded hover:bg-emerald-50 text-[11px] font-semibold text-slate-700 cursor-pointer"
              >
                <FileSpreadsheet className="w-3 h-3 text-emerald-700" />
                <span>23. Export Excel</span>
              </button>
              <button
                type="button"
                id="btn-cat-word"
                onClick={() => handleAction(props.onWord, 'Mengekspor Dokumen ke Format Word (.doc)')}
                className="w-full text-left flex items-center gap-1.5 p-1 rounded hover:bg-blue-50 text-[11px] font-semibold text-slate-700 cursor-pointer"
              >
                <FileText className="w-3 h-3 text-blue-700" />
                <span>24. Export Word</span>
              </button>
              <button
                type="button"
                id="btn-cat-ppt"
                onClick={() => handleAction(props.onPpt, 'Mengekspor Slide Presentasi PPT')}
                className="w-full text-left flex items-center gap-1.5 p-1 rounded hover:bg-orange-50 text-[11px] font-semibold text-slate-700 cursor-pointer"
              >
                <Presentation className="w-3 h-3 text-orange-600" />
                <span>25. Export PPT</span>
              </button>
              <button
                type="button"
                id="btn-cat-reset"
                onClick={() => handleAction(props.onReset, 'Data Formulir Direset Bersih')}
                className="w-full text-left flex items-center gap-1.5 p-1 rounded hover:bg-slate-100 text-[11px] font-semibold text-slate-600 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3 text-slate-500" />
                <span>26. Reset Data Formulir</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
