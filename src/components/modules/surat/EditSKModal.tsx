import React, { useState, useEffect } from 'react';
import { SuratDocument, SchoolSettings } from '../../../types';
import { X, Save, FileCheck, Trash2 } from 'lucide-react';
import { safeConfirm } from '../../../utils/exportHelpers';

interface EditSKModalProps {
  isOpen: boolean;
  onClose: () => void;
  surat: SuratDocument | null;
  onSave: (surat: SuratDocument) => void;
  onDelete?: (id: string) => void;
  settings: SchoolSettings;
  notifyMessage: (msg?: string) => void;
}

export const EditSKModal: React.FC<EditSKModalProps> = ({
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
    jenisSurat: 'Surat Keputusan Kepala Sekolah',
    nomorSurat: '421.2/001/SK/2026',
    tanggalSurat: '2026-07-01',
    perihal: 'Pembagian Tugas Guru dan Tenaga Kependidikan Tahun Pelajaran 2026/2027',
    pejabatPenetap: 'Kepala Sekolah',
    sasaranSk: 'Guru & Tenaga Kependidikan',
    masaBerlakuSk: 'Tahun Pelajaran 2026/2027',
    statusSurat: 'Berlaku',
    keterangan: 'Berlaku',
    skTentang: 'PEMBAGIAN TUGAS GURU DALAM PROSES BELAJAR MENGAJAR TAHUN PELAJARAN 2026/2027',
    skMenimbang: 'Bahwa dalam rangka kelancaran proses belajar mengajar di lingkungan SD Negeri Balil...',
    skMengingat: 'Undang-Undang Nomor 20 Tahun 2003 tentang Sistem Pendidikan Nasional...',
    skKesatu: 'Menetapkan pembagian tugas mengajar bagi guru sebagaimana tercantum dalam lampiran keputusan ini.',
    skKedua: 'Masing-masing guru melaporkan pelaksanaan tugas secara berkala kepada Kepala Sekolah.',
    skKetiga: 'Segala biaya yang timbul dibebankan pada anggaran sekolah yang sesuai.',
    skKeempat: 'Keputusan ini berlaku sejak tanggal ditetapkan dengan ketentuan akan diperbaiki apabila terdapat kekeliruan.'
  });

  useEffect(() => {
    if (surat) {
      setFormData({
        ...surat,
        jenisSurat: 'Surat Keputusan Kepala Sekolah',
        nomorSurat: surat.nomorSurat || '421.2/001/SK/2026',
        tanggalSurat: surat.tanggalSurat || '2026-07-01',
        perihal: surat.perihal || '',
        pejabatPenetap: surat.pejabatPenetap || 'Kepala Sekolah',
        sasaranSk: surat.sasaranSk || 'Guru & Tenaga Kependidikan',
        masaBerlakuSk: surat.masaBerlakuSk || 'Tahun Pelajaran 2026/2027',
        statusSurat: surat.statusSurat || 'Berlaku',
        keterangan: surat.keterangan || 'Berlaku',
        skTentang: surat.skTentang || surat.perihal || '',
        skMenimbang: Array.isArray(surat.skMenimbang) ? surat.skMenimbang.join('\n') : (surat.skMenimbang || ''),
        skMengingat: Array.isArray(surat.skMengingat) ? surat.skMengingat.join('\n') : (surat.skMengingat || ''),
        skKesatu: surat.skKesatu || '',
        skKedua: surat.skKedua || '',
        skKetiga: surat.skKetiga || '',
        skKeempat: surat.skKeempat || ''
      });
    }
  }, [surat]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nomorSurat?.trim() || !formData.perihal?.trim()) {
      notifyMessage('Nomor SK dan Perihal/Tentang wajib diisi!');
      return;
    }

    const recordToSave: SuratDocument = {
      ...(formData as SuratDocument),
      id: surat?.id || `sk-doc-${Date.now()}`,
      jenisSurat: 'Surat Keputusan Kepala Sekolah',
      nomorSurat: formData.nomorSurat || '',
      tanggalSurat: formData.tanggalSurat || '2026-07-01',
      perihal: formData.perihal || '',
      isiRingkas: formData.skTentang || formData.perihal || '',
      pengirim: settings.namaSekolah,
      penerima: formData.sasaranSk || 'Seluruh Warga Sekolah',
      pejabatPenetap: formData.pejabatPenetap || 'Kepala Sekolah',
      sasaranSk: formData.sasaranSk || 'Guru & Tenaga Kependidikan',
      masaBerlakuSk: formData.masaBerlakuSk || 'Tahun Pelajaran 2026/2027',
      statusSurat: formData.statusSurat || 'Berlaku',
      keterangan: formData.statusSurat || 'Berlaku'
    };

    onSave(recordToSave);
    notifyMessage('Data Surat Keputusan (SK) Berhasil Disimpan');
    onClose();
  };

  const handleDelete = () => {
    if (surat && onDelete) {
      if (safeConfirm(`Hapus SK nomor: ${formData.nomorSurat}?`)) {
        onDelete(surat.id);
        notifyMessage('SK Dihapus');
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-400/30">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">
                {surat ? 'Edit Surat Keputusan (SK)' : 'Tambah Surat Keputusan (SK) Baru'}
              </h3>
              <p className="text-[11px] text-indigo-200">
                Format F: Register Surat Keputusan Resmi Kepala Sekolah
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
              <label className="font-bold text-slate-700 block mb-1">Nomor SK Resmi *</label>
              <input
                type="text"
                required
                value={formData.nomorSurat || ''}
                onChange={(e) => setFormData({ ...formData, nomorSurat: e.target.value })}
                placeholder="421.2/001/SK/2026"
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-bold font-mono text-indigo-900 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Tanggal Penetapan SK *</label>
              <input
                type="date"
                required
                value={formData.tanggalSurat || ''}
                onChange={(e) => setFormData({ ...formData, tanggalSurat: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Pejabat Penetap</label>
              <input
                type="text"
                value={formData.pejabatPenetap || 'Kepala Sekolah'}
                onChange={(e) => setFormData({ ...formData, pejabatPenetap: e.target.value })}
                placeholder="Kepala Sekolah"
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Tentang / Perihal SK *</label>
            <input
              type="text"
              required
              value={formData.perihal || ''}
              onChange={(e) => setFormData({ ...formData, perihal: e.target.value, skTentang: e.target.value })}
              placeholder="Pembagian Tugas Guru / Penetapan Kelulusan / Tim BOS / Panitia PPDB"
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Sasaran Penetapan SK</label>
              <input
                type="text"
                value={formData.sasaranSk || ''}
                onChange={(e) => setFormData({ ...formData, sasaranSk: e.target.value })}
                placeholder="Guru & Tenaga Kependidikan / Siswa"
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Masa Berlaku SK</label>
              <input
                type="text"
                value={formData.masaBerlakuSk || ''}
                onChange={(e) => setFormData({ ...formData, masaBerlakuSk: e.target.value })}
                placeholder="Tahun Pelajaran 2026/2027"
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Status Keberlakuan</label>
              <select
                value={formData.statusSurat || 'Berlaku'}
                onChange={(e) => setFormData({ ...formData, statusSurat: e.target.value, keterangan: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-bold focus:outline-none focus:border-indigo-600 cursor-pointer"
              >
                <option value="Berlaku">Berlaku</option>
                <option value="Diperpanjang">Diperpanjang</option>
                <option value="Dicabut">Dicabut</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <h4 className="font-bold text-slate-800 mb-2">Batang Tubuh Keputusan Resmi (Format G)</h4>
            <div className="space-y-2">
              <div>
                <label className="font-semibold text-slate-600 block mb-0.5">Menimbang</label>
                <textarea
                  rows={2}
                  value={Array.isArray(formData.skMenimbang) ? formData.skMenimbang.join('\n') : (formData.skMenimbang || '')}
                  onChange={(e) => setFormData({ ...formData, skMenimbang: e.target.value })}
                  placeholder="Dasar pertimbangan penerbitan SK..."
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-800"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600 block mb-0.5">Mengingat</label>
                <textarea
                  rows={2}
                  value={Array.isArray(formData.skMengingat) ? formData.skMengingat.join('\n') : (formData.skMengingat || '')}
                  onChange={(e) => setFormData({ ...formData, skMengingat: e.target.value })}
                  placeholder="Dasar hukum / peraturan perundang-undangan..."
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-800"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            {surat && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus SK</span>
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
                className="px-4 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan SK</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
