import React, { useState, useEffect } from 'react';
import { SuratDocument, SchoolSettings } from '../../../types';
import { KLASIFIKASI_SURAT_000_030, DISPOSISI_DITERUSKAN_OPTIONS, DISPOSISI_PETUNJUK_OPTIONS } from './persuratanData';
import { X, Save, FileText, Trash2 } from 'lucide-react';
import { safeConfirm } from '../../../utils/exportHelpers';

interface EditSuratMasukModalProps {
  isOpen: boolean;
  onClose: () => void;
  surat: SuratDocument | null;
  onSave: (surat: SuratDocument) => void;
  onDelete?: (id: string) => void;
  settings: SchoolSettings;
  notifyMessage: (msg?: string) => void;
}

export const EditSuratMasukModal: React.FC<EditSuratMasukModalProps> = ({
  isOpen,
  onClose,
  surat,
  onSave,
  onDelete,
  settings,
  notifyMessage
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<Partial<SuratDocument>>({
    jenisSurat: 'Surat Masuk',
    nomorAgenda: 'SM-001',
    tanggalTerima: new Date().toISOString().slice(0, 10),
    nomorSurat: '',
    tanggalSurat: new Date().toISOString().slice(0, 10),
    pengirim: '',
    alamatPengirim: '',
    penerima: settings.namaSekolah,
    perihal: '',
    klasifikasi: 'UND',
    kodeKlasifikasi: '003',
    lampiran: '1 Berkas',
    diteruskanKepada: 'Kepala Sekolah',
    petunjukDisposisi: 'Untuk dilaksanakan',
    isiDisposisi: '',
    tanggalDisposisi: new Date().toISOString().slice(0, 10),
    tindakLanjut: '',
    keterangan: 'Diproses',
    statusSurat: 'Diproses'
  });

  useEffect(() => {
    if (surat) {
      setFormData({
        ...surat,
        jenisSurat: 'Surat Masuk',
        nomorAgenda: surat.nomorAgenda || 'SM-001',
        tanggalTerima: surat.tanggalTerima || surat.tanggalSurat,
        lampiran: surat.lampiran || '1 Berkas',
        diteruskanKepada: surat.diteruskanKepada || 'Kepala Sekolah',
        petunjukDisposisi: surat.petunjukDisposisi || 'Untuk dilaksanakan',
        isiDisposisi: surat.isiDisposisi || surat.catatanKepsek || '',
        tanggalDisposisi: surat.tanggalDisposisi || surat.tanggalSurat,
        tindakLanjut: surat.tindakLanjut || '',
        keterangan: surat.keterangan || 'Diproses',
        statusSurat: surat.statusSurat || 'Diproses'
      });
    } else {
      setFormData({
        jenisSurat: 'Surat Masuk',
        nomorAgenda: `SM-${String(Math.floor(Math.random() * 900 + 100)).padStart(3, '0')}`,
        tanggalTerima: new Date().toISOString().slice(0, 10),
        nomorSurat: '',
        tanggalSurat: new Date().toISOString().slice(0, 10),
        pengirim: '',
        alamatPengirim: '',
        penerima: settings.namaSekolah,
        perihal: '',
        klasifikasi: 'UND',
        kodeKlasifikasi: '003',
        lampiran: '1 Berkas',
        diteruskanKepada: 'Kepala Sekolah',
        petunjukDisposisi: 'Untuk dilaksanakan',
        isiDisposisi: '',
        tanggalDisposisi: new Date().toISOString().slice(0, 10),
        tindakLanjut: '',
        keterangan: 'Diproses',
        statusSurat: 'Diproses'
      });
    }
  }, [surat, settings.namaSekolah]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nomorSurat?.trim() || !formData.perihal?.trim() || !formData.pengirim?.trim()) {
      notifyMessage('Nomor Surat, Asal Pengirim, dan Perihal wajib diisi!');
      return;
    }

    const recordToSave: SuratDocument = {
      ...(formData as SuratDocument),
      id: surat?.id || `sm-${Date.now()}`,
      jenisSurat: 'Surat Masuk',
      nomorAgenda: formData.nomorAgenda || 'SM-001',
      tanggalTerima: formData.tanggalTerima || formData.tanggalSurat || new Date().toISOString().slice(0, 10),
      nomorSurat: formData.nomorSurat || '',
      tanggalSurat: formData.tanggalSurat || new Date().toISOString().slice(0, 10),
      pengirim: formData.pengirim || '',
      penerima: formData.penerima || settings.namaSekolah,
      perihal: formData.perihal || '',
      isiRingkas: formData.isiRingkas || formData.perihal || '',
      alasanPengirim: formData.alasanPengirim || '',
      keterangan: formData.keterangan || 'Diproses',
      statusSurat: formData.keterangan || 'Diproses'
    };

    onSave(recordToSave);
    notifyMessage('Data Surat Masuk Berhasil Disimpan');
    onClose();
  };

  const handleDelete = () => {
    if (surat && onDelete) {
      if (safeConfirm(`Hapus surat masuk nomor agenda: ${formData.nomorAgenda}?`)) {
        onDelete(surat.id);
        notifyMessage('Data Surat Masuk Dihapus');
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400/30">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">
                {surat ? 'Edit Agenda Surat Masuk' : 'Tambah Agenda Surat Masuk Baru'}
              </h3>
              <p className="text-[11px] text-emerald-200">
                14 Kolom Standar Buku Agenda Surat Masuk Sekolah
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          {/* Baris 1: Nomor Agenda, Tanggal Terima, Nomor Surat, Tanggal Surat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <label className="font-bold text-slate-700 block mb-1">1. Nomor Agenda *</label>
              <input
                type="text"
                required
                value={formData.nomorAgenda || ''}
                onChange={(e) => setFormData({ ...formData, nomorAgenda: e.target.value })}
                placeholder="SM-001"
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-bold font-mono text-emerald-800 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">2. Tanggal Terima *</label>
              <input
                type="date"
                required
                value={formData.tanggalTerima || ''}
                onChange={(e) => setFormData({ ...formData, tanggalTerima: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-emerald-600 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">3. Nomor Surat *</label>
              <input
                type="text"
                required
                value={formData.nomorSurat || ''}
                onChange={(e) => setFormData({ ...formData, nomorSurat: e.target.value })}
                placeholder="800/125/DISDIK"
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-mono focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">4. Tanggal Surat *</label>
              <input
                type="date"
                required
                value={formData.tanggalSurat || ''}
                onChange={(e) => setFormData({ ...formData, tanggalSurat: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-emerald-600 font-medium"
              />
            </div>
          </div>

          {/* Baris 2: Asal Pengirim, Alamat Pengirim */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">5. Asal / Pengirim Surat *</label>
              <input
                type="text"
                required
                value={formData.pengirim || ''}
                onChange={(e) => setFormData({ ...formData, pengirim: e.target.value })}
                placeholder="Dinas Pendidikan / Pengawas Sekolah / Sekolah Lain"
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">6. Alamat Pengirim</label>
              <input
                type="text"
                value={formData.alamatPengirim || ''}
                onChange={(e) => setFormData({ ...formData, alamatPengirim: e.target.value })}
                placeholder="Jl. Pendidikan No. 1 / Distrik"
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Baris 3: Perihal, Klasifikasi, Lampiran */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6">
              <label className="font-bold text-slate-700 block mb-1">7. Perihal Surat *</label>
              <input
                type="text"
                required
                value={formData.perihal || ''}
                onChange={(e) => setFormData({ ...formData, perihal: e.target.value })}
                placeholder="Undangan Rapat / Permohonan Data / Jadwal Supervisi"
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-emerald-600 font-semibold"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="font-bold text-slate-700 block mb-1">8. Klasifikasi Surat</label>
              <select
                value={formData.klasifikasi || 'UND'}
                onChange={(e) => {
                  const val = e.target.value;
                  const found = KLASIFIKASI_SURAT_000_030.find(k => k.kode === val || k.klasifikasi === val);
                  setFormData({
                    ...formData,
                    klasifikasi: val,
                    kodeKlasifikasi: found ? found.kode : val
                  });
                }}
                className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:border-emerald-600 cursor-pointer"
              >
                <option value="UND">UND (Undangan / Rapat)</option>
                <option value="ADM">ADM (Administrasi Umum)</option>
                <option value="SUP">SUP (Supervisi / Pengawasan)</option>
                <option value="KEPEG">KEPEG (Kepegawaian GTK)</option>
                <option value="SIS">SIS (Kesiswaan & Mutasi)</option>
                <option value="KUR">KUR (Kurikulum & Rapor)</option>
                <option value="BOS">BOS (Keuangan BOS)</option>
                {KLASIFIKASI_SURAT_000_030.map(k => (
                  <option key={k.kode} value={k.kode}>
                    {k.kode} - {k.klasifikasi}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="font-bold text-slate-700 block mb-1">9. Jumlah Lampiran</label>
              <input
                type="text"
                value={formData.lampiran || ''}
                onChange={(e) => setFormData({ ...formData, lampiran: e.target.value })}
                placeholder="1 Berkas / 2 Lembar / -"
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Baris 4: Diteruskan Kepada & Petunjuk/Disposisi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-emerald-50/50 p-3 rounded-xl border border-emerald-200">
            <div>
              <label className="font-bold text-emerald-900 block mb-1">10. Diteruskan Kepada</label>
              <select
                value={formData.diteruskanKepada || 'Kepala Sekolah'}
                onChange={(e) => setFormData({ ...formData, diteruskanKepada: e.target.value })}
                className="w-full bg-white border border-emerald-300 rounded px-2.5 py-1.5 focus:outline-none font-semibold cursor-pointer"
              >
                {DISPOSISI_DITERUSKAN_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-emerald-900 block mb-1">Petunjuk Disposisi</label>
              <select
                value={formData.petunjukDisposisi || 'Untuk dilaksanakan'}
                onChange={(e) => setFormData({ ...formData, petunjukDisposisi: e.target.value })}
                className="w-full bg-white border border-emerald-300 rounded px-2.5 py-1.5 focus:outline-none font-semibold cursor-pointer"
              >
                {DISPOSISI_PETUNJUK_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Baris 5: Isi/Disposisi & Tanggal Disposisi */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8">
              <label className="font-bold text-slate-700 block mb-1">11. Isi / Arahan Disposisi</label>
              <textarea
                rows={2}
                value={formData.isiDisposisi || ''}
                onChange={(e) => setFormData({ ...formData, isiDisposisi: e.target.value, catatanKepsek: e.target.value })}
                placeholder="Arahan tindak lanjut dari Kepala Sekolah..."
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="font-bold text-slate-700 block mb-1">12. Tanggal Disposisi</label>
              <input
                type="date"
                value={formData.tanggalDisposisi || ''}
                onChange={(e) => setFormData({ ...formData, tanggalDisposisi: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Baris 6: Tindak Lanjut & Keterangan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">13. Tindak Lanjut Pelaksanaan</label>
              <input
                type="text"
                value={formData.tindakLanjut || ''}
                onChange={(e) => setFormData({ ...formData, tindakLanjut: e.target.value })}
                placeholder="Misal: Hadir rapat, buat surat balasan, siapkan data"
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">14. Keterangan / Status</label>
              <select
                value={formData.keterangan || 'Diproses'}
                onChange={(e) => setFormData({ ...formData, keterangan: e.target.value, statusSurat: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-emerald-600 font-bold cursor-pointer"
              >
                <option value="Selesai">Selesai</option>
                <option value="Diproses">Diproses</option>
                <option value="Dijadwalkan">Dijadwalkan</option>
                <option value="Menunggu">Menunggu</option>
                <option value="Arsip">Diarsipkan</option>
              </select>
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            {surat && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Surat</span>
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Surat Masuk</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
