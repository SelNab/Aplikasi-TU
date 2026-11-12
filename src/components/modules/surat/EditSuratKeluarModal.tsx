import React, { useState, useEffect } from 'react';
import { SuratDocument, SchoolSettings } from '../../../types';
import { KLASIFIKASI_SURAT_000_030, KLASIFIKASI_SUBJEK } from './persuratanData';
import { X, Save, Send, Trash2 } from 'lucide-react';
import { safeConfirm } from '../../../utils/exportHelpers';

interface EditSuratKeluarModalProps {
  isOpen: boolean;
  onClose: () => void;
  surat: SuratDocument | null;
  onSave: (surat: SuratDocument) => void;
  onDelete?: (id: string) => void;
  settings: SchoolSettings;
  notifyMessage: (msg?: string) => void;
}

export const EditSuratKeluarModal: React.FC<EditSuratKeluarModalProps> = ({
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
    jenisSurat: 'Surat Keluar',
    nomorAgenda: 'SK-001',
    nomorSurat: `421.2/00${Math.floor(Math.random() * 9 + 1)}/SD-BL/2026`,
    tanggalSurat: new Date().toISOString().slice(0, 10),
    penerima: 'Dinas Pendidikan',
    pengirim: settings.namaSekolah,
    perihal: '',
    klasifikasi: 'ADM',
    kodeKlasifikasi: 'PEG-01',
    lampiran: '1 Berkas',
    penandatangan: 'Kepala Sekolah',
    penanggungJawab: 'TU',
    keterangan: 'Terkirim',
    statusSurat: 'Terkirim',
    isiRingkas: '',
    alasanPengirim: ''
  });

  useEffect(() => {
    if (surat) {
      setFormData({
        ...surat,
        jenisSurat: 'Surat Keluar',
        nomorAgenda: surat.nomorAgenda || 'SK-001',
        nomorSurat: surat.nomorSurat || '',
        tanggalSurat: surat.tanggalSurat || new Date().toISOString().slice(0, 10),
        penerima: surat.penerima || '',
        pengirim: surat.pengirim || settings.namaSekolah,
        perihal: surat.perihal || '',
        klasifikasi: surat.klasifikasi || 'ADM',
        kodeKlasifikasi: surat.kodeKlasifikasi || 'PEG-01',
        lampiran: surat.lampiran || '1 Berkas',
        penandatangan: surat.penandatangan || 'Kepala Sekolah',
        penanggungJawab: surat.penanggungJawab || 'TU',
        keterangan: surat.keterangan || 'Terkirim',
        statusSurat: surat.statusSurat || 'Terkirim',
        isiRingkas: surat.isiRingkas || '',
        alasanPengirim: surat.alasanPengirim || ''
      });
    } else {
      setFormData({
        jenisSurat: 'Surat Keluar',
        nomorAgenda: `SK-${String(Math.floor(Math.random() * 900 + 100)).padStart(3, '0')}`,
        nomorSurat: `421.2/00${Math.floor(Math.random() * 9 + 1)}/SD-BL/2026`,
        tanggalSurat: new Date().toISOString().slice(0, 10),
        penerima: '',
        pengirim: settings.namaSekolah,
        perihal: '',
        klasifikasi: 'ADM',
        kodeKlasifikasi: 'PEG-01',
        lampiran: '1 Berkas',
        penandatangan: 'Kepala Sekolah',
        penanggungJawab: 'TU',
        keterangan: 'Terkirim',
        statusSurat: 'Terkirim',
        isiRingkas: '',
        alasanPengirim: ''
      });
    }
  }, [surat, settings.namaSekolah]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nomorSurat?.trim() || !formData.perihal?.trim() || !formData.penerima?.trim()) {
      notifyMessage('Nomor Surat, Tujuan Surat, dan Perihal wajib diisi!');
      return;
    }

    const recordToSave: SuratDocument = {
      ...(formData as SuratDocument),
      id: surat?.id || `sk-out-${Date.now()}`,
      jenisSurat: 'Surat Keluar',
      nomorAgenda: formData.nomorAgenda || 'SK-001',
      nomorSurat: formData.nomorSurat || '',
      tanggalSurat: formData.tanggalSurat || new Date().toISOString().slice(0, 10),
      penerima: formData.penerima || '',
      pengirim: formData.pengirim || settings.namaSekolah,
      perihal: formData.perihal || '',
      isiRingkas: formData.isiRingkas || formData.perihal || '',
      alasanPengirim: formData.alasanPengirim || '',
      keterangan: formData.keterangan || 'Terkirim',
      statusSurat: formData.statusSurat || 'Terkirim'
    };

    onSave(recordToSave);
    notifyMessage('Data Surat Keluar Berhasil Disimpan');
    onClose();
  };

  const handleDelete = () => {
    if (surat && onDelete) {
      if (safeConfirm(`Hapus surat keluar nomor: ${formData.nomorSurat}?`)) {
        onDelete(surat.id);
        notifyMessage('Data Surat Keluar Dihapus');
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-400/30">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">
                {surat ? 'Edit Agenda Surat Keluar' : 'Tambah Agenda Surat Keluar Baru'}
              </h3>
              <p className="text-[11px] text-teal-200">
                Format C & E: Buku Agenda & Register Surat Keluar Sekolah
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

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nomor Agenda *</label>
              <input
                type="text"
                required
                value={formData.nomorAgenda || ''}
                onChange={(e) => setFormData({ ...formData, nomorAgenda: e.target.value })}
                placeholder="SK-001"
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-bold font-mono text-teal-800 focus:outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Nomor Surat Resmi *</label>
              <input
                type="text"
                required
                value={formData.nomorSurat || ''}
                onChange={(e) => setFormData({ ...formData, nomorSurat: e.target.value })}
                placeholder="421.2/001/SD-BL/2026"
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-mono font-bold focus:outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Tanggal Surat *</label>
              <input
                type="date"
                required
                value={formData.tanggalSurat || ''}
                onChange={(e) => setFormData({ ...formData, tanggalSurat: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-medium focus:outline-none focus:border-teal-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Tujuan Surat (Kepada Yth.) *</label>
              <input
                type="text"
                required
                value={formData.penerima || ''}
                onChange={(e) => setFormData({ ...formData, penerima: e.target.value })}
                placeholder="Dinas Pendidikan / Orang Tua Siswa / Guru"
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Pengirim (Instansi Asal)</label>
              <input
                type="text"
                value={formData.pengirim || ''}
                onChange={(e) => setFormData({ ...formData, pengirim: e.target.value })}
                placeholder={settings.namaSekolah}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-teal-600"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Perihal Surat *</label>
            <input
              type="text"
              required
              value={formData.perihal || ''}
              onChange={(e) => setFormData({ ...formData, perihal: e.target.value })}
              placeholder="Pengiriman Data Sekolah / Undangan Pertemuan / Pembagian Tugas"
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-semibold focus:outline-none focus:border-teal-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Klasifikasi / Kode</label>
              <select
                value={formData.klasifikasi || 'ADM'}
                onChange={(e) => setFormData({ ...formData, klasifikasi: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-teal-600 cursor-pointer"
              >
                <option value="ADM">ADM (Administrasi)</option>
                <option value="UND">UND (Undangan)</option>
                <option value="KEPEG">KEPEG (Kepegawaian)</option>
                <option value="SIS">SIS (Kesiswaan)</option>
                <option value="KUR">KUR (Kurikulum)</option>
                <option value="BOS">BOS (Keuangan)</option>
                <option value="ST">ST (Surat Tugas)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Jumlah Lampiran</label>
              <input
                type="text"
                value={formData.lampiran || ''}
                onChange={(e) => setFormData({ ...formData, lampiran: e.target.value })}
                placeholder="1 Berkas / 1 Lembar"
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Penandatangan</label>
              <input
                type="text"
                value={formData.penandatangan || 'Kepala Sekolah'}
                onChange={(e) => setFormData({ ...formData, penandatangan: e.target.value })}
                placeholder="Kepala Sekolah"
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-teal-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Penanggung Jawab (Register)</label>
              <select
                value={formData.penanggungJawab || 'TU'}
                onChange={(e) => setFormData({ ...formData, penanggungJawab: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-teal-600 cursor-pointer"
              >
                <option value="TU">Tata Usaha (TU)</option>
                <option value="Kepala Sekolah">Kepala Sekolah</option>
                <option value="Guru Kelas">Guru Kelas</option>
                <option value="Operator">Operator Dapodik</option>
                <option value="Bendahara">Bendahara Sekolah</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Status Pengiriman</label>
              <select
                value={formData.statusSurat || 'Terkirim'}
                onChange={(e) => setFormData({ ...formData, statusSurat: e.target.value, keterangan: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-bold focus:outline-none focus:border-teal-600 cursor-pointer"
              >
                <option value="Terkirim">Terkirim</option>
                <option value="Selesai">Selesai</option>
                <option value="Diproses">Diproses</option>
                <option value="Konsep">Konsep / Draft</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Isi Ringkas / Uraian Surat</label>
            <textarea
              rows={2}
              value={formData.isiRingkas || ''}
              onChange={(e) => setFormData({ ...formData, isiRingkas: e.target.value })}
              placeholder="Uraian isi pokok surat keluar resmi..."
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-teal-600"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            {surat && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
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
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Surat Keluar</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
