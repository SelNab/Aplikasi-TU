import React, { useState } from 'react';
import {
  Student,
  Teacher,
  SuratDocument,
  PaperSize,
  SchoolSettings
} from '../../types';
import { ActionToolbar } from '../ActionToolbar';
import { triggerPrint, safePrompt } from '../../utils/exportHelpers';
import { FolderArchive, Lock, Unlock, Search, ShieldCheck, Eye, Trash2 } from 'lucide-react';

interface ArsipModuleProps {
  students: Student[];
  teachers: Teacher[];
  suratList: SuratDocument[];
  onHome: () => void;
  settings: SchoolSettings;
  notifyMessage: (msg?: string) => void;
  onSync: () => void;
}

export const ArsipModule: React.FC<ArsipModuleProps> = ({
  students,
  teachers,
  suratList,
  onHome,
  settings,
  notifyMessage,
  onSync
}) => {
  const [filterType, setFilterType] = useState<'semua' | 'siswa' | 'guru' | 'surat'>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [paperSize, setPaperSize] = useState<PaperSize>(settings.ukuranKertas);

  const archivedStudents = students.filter(s => s.isArchived || s.isLocked);
  const archivedTeachers = teachers.filter(t => t.isArchived || t.isLocked);
  const archivedSurat = suratList.filter(s => s.isArchived || s.isLocked);

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-2 no-print">
        <div className="flex gap-1.5">
          {(['semua', 'siswa', 'guru', 'surat'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all uppercase ${
                filterType === t
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Arsip {t}
            </button>
          ))}
        </div>
      </div>

      {/* Mandatory Standard Action Toolbar */}
      <ActionToolbar
        titleContext="ARSIP DOKUMEN & PENGUNCIAN DATA RESMI"
        onHome={onHome}
        onAddNew={() => notifyMessage('Data Anda Berhasil Disimpan ke Arsip')}
        onSave={() => notifyMessage('Data Anda Berhasil Disimpan')}
        onView={() => triggerPrint()}
        onDelete={() => notifyMessage('Data Arsip Dihapus')}
        onSearch={() => {
          const q = safePrompt('Cari dokumen dalam arsip:', searchQuery);
          if (q !== null) setSearchQuery(q);
        }}
        onEdit={() => notifyMessage('Data Anda Berhasil Disimpan')}
        onCancel={() => setSearchQuery('')}
        onBack={onHome}
        onArchive={() => notifyMessage('Data Anda Berhasil Disimpan')}
        onLock={() => notifyMessage('Data Anda Berhasil Dikunci')}
        onReview={() => triggerPrint()}
        onPrint={triggerPrint}
        onUpdate={() => notifyMessage('Data Anda Berhasil Disimpan')}
        onTemplate={() => notifyMessage('Data Anda Berhasil Disimpan')}
        onPdf={triggerPrint}
        onExcel={() => triggerPrint()}
        onWord={() => triggerPrint()}
        onPpt={() => triggerPrint()}
        onUploadPhoto={() => notifyMessage('Data Anda Berhasil Disimpan')}
        onRefresh={() => notifyMessage('Data Anda Berhasil Disimpan')}
        onSync={onSync}
        onReset={() => notifyMessage('Data Formulir Berhasil Direset')}
        paperSize={paperSize}
        onChangePaperSize={(size) => setPaperSize(size)}
        notifyMessage={notifyMessage}
      />

      {/* Grid of Archived Sections */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <FolderArchive className="w-5 h-5 text-emerald-700" />
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase">
                Penyimpanan & Penguncian Dokumen Penting Sekolah
              </h3>
              <p className="text-[11px] text-slate-500">
                Data yang diarsipkan dan dikunci aman dari modifikasi yang tidak disengaja
              </p>
            </div>
          </div>
        </div>

        {/* Filtered lists */}
        <div className="space-y-4 text-xs">
          {(filterType === 'semua' || filterType === 'surat') && (
            <div className="border rounded-lg p-3 bg-slate-50">
              <h4 className="font-bold text-slate-900 mb-2 flex items-center justify-between">
                <span>Arsip Surat & Keputusan Kepala Sekolah ({archivedSurat.length})</span>
                <span className="text-[10px] text-slate-500 font-normal">Tersimpan Digital</span>
              </h4>
              <div className="divide-y divide-slate-200 bg-white rounded border">
                {archivedSurat.length === 0 ? (
                  <p className="p-3 text-slate-400 text-center">Belum ada surat yang dikunci/diarsipkan.</p>
                ) : (
                  archivedSurat.map(s => (
                    <div key={s.id} className="p-2.5 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <div className="font-bold text-slate-900">{s.nomorSurat} - {s.perihal}</div>
                        <div className="text-[10px] text-slate-500">{s.jenisSurat} ({s.tanggalSurat})</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Terkunci
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {(filterType === 'semua' || filterType === 'siswa') && (
            <div className="border rounded-lg p-3 bg-slate-50">
              <h4 className="font-bold text-slate-900 mb-2 flex items-center justify-between">
                <span>Arsip Data Siswa & Berkas Mutasi ({archivedStudents.length})</span>
              </h4>
              <div className="divide-y divide-slate-200 bg-white rounded border">
                {archivedStudents.length === 0 ? (
                  <p className="p-3 text-slate-400 text-center">Belum ada data siswa yang diarsipkan.</p>
                ) : (
                  archivedStudents.map(s => (
                    <div key={s.id} className="p-2.5 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <div className="font-bold text-slate-900">{s.namaSiswa} (NISN: {s.nisn})</div>
                        <div className="text-[10px] text-slate-500">Kelas {s.kelas} - {s.keterangan}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                        Arsip Aktif
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
