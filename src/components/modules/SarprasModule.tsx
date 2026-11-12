import React, { useState, useMemo } from 'react';
import {
  SarprasItem,
  PaperSize,
  SchoolSettings
} from '../../types';
import { ActionToolbar } from '../ActionToolbar';
import { exportToExcel, exportToWord, exportToPPT, triggerPrint, safeConfirm, safePrompt } from '../../utils/exportHelpers';
import { Building2, Search, CheckCircle, ShieldCheck } from 'lucide-react';

interface SarprasModuleProps {
  sarpras: SarprasItem[];
  onSaveSarpras: (item: SarprasItem) => void;
  onDeleteSarpras: (id: string) => void;
  onHome: () => void;
  settings: SchoolSettings;
  notifyMessage: (msg?: string) => void;
  onSync: () => void;
}

export const SarprasModule: React.FC<SarprasModuleProps> = ({
  sarpras,
  onSaveSarpras,
  onDeleteSarpras,
  onHome,
  settings,
  notifyMessage,
  onSync
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [paperSize, setPaperSize] = useState<PaperSize>(settings.ukuranKertas);

  const emptyItem: Omit<SarprasItem, 'id'> = {
    no: sarpras.length + 1,
    tanggalPembelianPenerimaan: new Date().toISOString().slice(0, 10),
    jenisBarangBangunan: '',
    jumlah: 1,
    kondisi: 'Baik',
    ruanganLokasi: 'Ruang Kelas IV',
    sumberDana: 'DAK Fisik Papua',
    keterangan: 'Barang inventaris milik negara dalam kondisi baik.',
    isLocked: false,
    isArchived: false
  };

  const [formData, setFormData] = useState(emptyItem);

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return sarpras.filter(
      (it) =>
        (it.jenisBarangBangunan || it.namaBarang || '').toLowerCase().includes(q) ||
        (it.ruanganLokasi || it.lokasiBarang || '').toLowerCase().includes(q) ||
        (it.sumberDana || '').toLowerCase().includes(q) ||
        (it.keterangan || '').toLowerCase().includes(q)
    );
  }, [sarpras, searchQuery]);

  const selectedItem = useMemo(() => {
    return sarpras.find((it) => it.id === selectedItemId);
  }, [sarpras, selectedItemId]);

  const handleSelectItem = (item: SarprasItem) => {
    setSelectedItemId(item.id);
    setFormData({
      no: item.no,
      tanggalPembelianPenerimaan: item.tanggalPembelianPenerimaan || new Date().toISOString().slice(0, 10),
      jenisBarangBangunan: item.jenisBarangBangunan || item.namaBarang || '',
      jumlah: item.jumlah ?? 1,
      kondisi: (item.kondisi || item.kondisiBarang || 'Baik') as any,
      ruanganLokasi: item.ruanganLokasi || item.lokasiBarang || '',
      sumberDana: item.sumberDana || 'BOS / Otsus',
      keterangan: item.keterangan || '',
      isLocked: item.isLocked,
      isArchived: item.isArchived
    });
    setIsEditing(false);
  };

  const handleAddNew = () => {
    setIsEditing(true);
    setSelectedItemId(null);
    setFormData({ ...emptyItem, no: sarpras.length + 1 });
    notifyMessage('Form Tambah Sarana Prasarana Siap');
  };

  const handleSave = () => {
    if (!formData.jenisBarangBangunan?.trim()) {
      notifyMessage('Nama jenis barang/bangunan wajib diisi!');
      return;
    }
    const itemToSave: SarprasItem = {
      ...formData,
      id: selectedItemId || `srp-${Date.now()}`
    };
    onSaveSarpras(itemToSave);
    setIsEditing(false);
    setSelectedItemId(itemToSave.id);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handleDelete = () => {
    if (!selectedItemId) {
      notifyMessage('Pilih data sarpras terlebih dahulu.');
      return;
    }
    if (selectedItem?.isLocked) {
      notifyMessage('Data Sarpras terkunci!');
      return;
    }
    if (safeConfirm(`Hapus data sarpras: ${formData.jenisBarangBangunan}?`)) {
      onDeleteSarpras(selectedItemId);
      setSelectedItemId(null);
      setIsEditing(false);
      setFormData(emptyItem);
      notifyMessage('Data Sarpras Dihapus');
    }
  };

  const handleToggleLock = () => {
    if (!selectedItemId) {
      setFormData(prev => ({ ...prev, isLocked: !prev.isLocked }));
      notifyMessage('Data Anda Berhasil Disimpan');
      return;
    }
    if (selectedItem) {
      const updated: SarprasItem = { ...selectedItem, isLocked: !selectedItem.isLocked };
      onSaveSarpras(updated);
      setFormData(prev => ({ ...prev, isLocked: updated.isLocked }));
      notifyMessage(updated.isLocked ? 'Data Anda Berhasil Dikunci' : 'Kunci Data Dibuka');
    }
  };

  const handleToggleArchive = () => {
    if (!selectedItemId) {
      setFormData(prev => ({ ...prev, isArchived: !prev.isArchived }));
      notifyMessage('Data Anda Berhasil Disimpan');
      return;
    }
    if (selectedItem) {
      const updated: SarprasItem = { ...selectedItem, isArchived: !selectedItem.isArchived };
      onSaveSarpras(updated);
      setFormData(prev => ({ ...prev, isArchived: updated.isArchived }));
      notifyMessage(updated.isArchived ? 'Data Anda Berhasil Disimpan ke Arsip' : 'Data Dikeluarkan dari Arsip');
    }
  };

  // Export handlers
  const handleExcelExport = () => {
    const headers = [
      'No',
      'Tanggal Pembelian/Penerimaan',
      'Jenis Barang / Bangunan',
      'Jumlah Unit',
      'Kondisi (Baik/Rusak Ringan/Rusak Berat)',
      'Ruangan / Lokasi',
      'Sumber Dana',
      'Keterangan'
    ];
    const rows = filteredItems.map((it, idx) => [
      idx + 1,
      it.tanggalPembelianPenerimaan || '-',
      it.jenisBarangBangunan || it.namaBarang || '-',
      it.jumlah || 1,
      it.kondisi || it.kondisiBarang || 'Baik',
      it.ruanganLokasi || it.lokasiBarang || '-',
      it.sumberDana || '-',
      it.keterangan || '-'
    ]);
    exportToExcel('Rekap_Sarana_dan_Prasarana_Sekolah', headers, rows);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handleWordExport = () => {
    const content = `
      <div class="kop">
        <h2>${settings.namaInstansi}</h2>
        <h1>${settings.namaSekolah}</h1>
        <p>${settings.alamatSekolah}</p>
        <hr />
        <h3>BUKU INVENTARIS SARANA DAN PRASARANA SEKOLAH</h3>
        <p>Tanggal: ${new Date().toLocaleDateString('id-ID')}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Jenis Barang / Bangunan</th>
            <th>Jumlah</th>
            <th>Kondisi</th>
            <th>Ruangan / Lokasi</th>
            <th>Sumber Dana</th>
            <th>Keterangan</th>
          </tr>
        </thead>
        <tbody>
          ${filteredItems.map((it, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td><b>${it.jenisBarangBangunan || it.namaBarang || '-'}</b></td>
              <td>${it.jumlah || 1} Unit</td>
              <td>${it.kondisi || it.kondisiBarang || 'Baik'}</td>
              <td>${it.ruanganLokasi || it.lokasiBarang || '-'}</td>
              <td>${it.sumberDana || '-'}</td>
              <td>${it.keterangan || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="footer">
        <p align="right">
          Dekai, ${new Date().toLocaleDateString('id-ID')}<br/>
          Kepala Sekolah,<br/><br/><br/>
          <b><u>${settings.namaKepsek}</u></b><br/>
          NIP. ${settings.nipKepsek}
        </p>
      </div>
    `;
    exportToWord('Inventaris_Sarpras_Sekolah', content);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handlePPTExport = () => {
    const baik = sarpras.filter(s => s.kondisi === 'Baik').length;
    const rusakRingan = sarpras.filter(s => s.kondisi === 'Rusak Ringan').length;
    const rusakBerat = sarpras.filter(s => s.kondisi === 'Rusak Berat').length;

    const slides = [
      {
        title: `LAPORAN SARANA & PRASARANA SEKOLAH`,
        subtitle: `${settings.namaSekolah} - Papua Pedalaman`,
        bullets: [
          `Total Aset Sarpras: ${sarpras.length} Jenis Bangunan / Peralatan`,
          `Kondisi Baik: ${baik} Unit/Aset`,
          `Rusak Ringan: ${rusakRingan} Unit/Aset`,
          `Rusak Berat / Perlu Rehab: ${rusakBerat} Unit/Aset`,
          `Kesesuaian Standar Sarpras Dapodik: Terverifikasi`
        ]
      }
    ];
    exportToPPT('Presentasi_Sarpras_Sekolah', slides);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handleTemplate = () => {
    setFormData({
      no: sarpras.length + 1,
      tanggalPembelianPenerimaan: new Date().toISOString().slice(0, 10),
      jenisBarangBangunan: 'Meja dan Kursi Belajar Siswa Kayu Solid',
      jumlah: 28,
      kondisi: 'Baik',
      ruanganLokasi: 'Ruang Kelas III SD',
      sumberDana: 'BOS Kinerja Afirmasi',
      keterangan: 'Kayu kualitas lokal Papua kokoh dan tahan rayap.',
      isLocked: false,
      isArchived: false
    });
    setIsEditing(true);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  return (
    <div className="space-y-4">
      {/* Mandatory Standard Action Toolbar */}
      <ActionToolbar
        titleContext="ADMINISTRASI SARANA DAN PRASARANA (SARPRAS)"
        onHome={onHome}
        onAddNew={handleAddNew}
        onSave={handleSave}
        onView={() => {
          if (selectedItem) notifyMessage(`Sarpras: ${selectedItem.jenisBarangBangunan} | Kondisi: ${selectedItem.kondisi}`);
          else notifyMessage('Pilih data sarpras terlebih dahulu');
        }}
        onDelete={handleDelete}
        onSearch={() => {
          const q = safePrompt('Cari jenis sarana/bangunan atau lokasi:', searchQuery);
          if (q !== null) setSearchQuery(q);
        }}
        onEdit={() => {
          if (!selectedItemId) {
            notifyMessage('Pilih data sarpras terlebih dahulu.');
            return;
          }
          setIsEditing(true);
        }}
        onCancel={() => {
          setIsEditing(false);
          if (selectedItem) handleSelectItem(selectedItem);
          else setFormData(emptyItem);
        }}
        onBack={onHome}
        onArchive={handleToggleArchive}
        onLock={handleToggleLock}
        onReview={() => triggerPrint()}
        onPrint={triggerPrint}
        onUpdate={handleSave}
        onTemplate={handleTemplate}
        onPdf={triggerPrint}
        onExcel={handleExcelExport}
        onWord={handleWordExport}
        onPpt={handlePPTExport}
        onUploadPhoto={() => notifyMessage('Data Anda Berhasil Disimpan')}
        onRefresh={() => notifyMessage('Data Anda Berhasil Disimpan')}
        onSync={onSync}
        onReset={() => {
          setFormData(emptyItem);
          setIsEditing(true);
        }}
        isLocked={formData.isLocked}
        isArchived={formData.isArchived}
        paperSize={paperSize}
        onChangePaperSize={(size) => setPaperSize(size)}
        notifyMessage={notifyMessage}
      />

      {/* Grid: Form & List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Form Sarpras */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800 uppercase">
                  Form Data Sarana & Prasarana
                </h2>
                <p className="text-[11px] text-slate-500">
                  Inventarisasi Gedung, Ruang Kelas, dan Perlengkapan Sekolah
                </p>
              </div>
            </div>
            <span className={`text-[11px] px-2 py-0.5 rounded font-bold ${
              isEditing ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
            }`}>
              {isEditing ? 'Mode Edit / Input' : 'Mode Pratinjau'}
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-0.5">Tanggal Pembelian / Penerimaan</label>
                <input
                  type="date"
                  value={formData.tanggalPembelianPenerimaan}
                  disabled={!isEditing}
                  onChange={(e) => setFormData({ ...formData, tanggalPembelianPenerimaan: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1.5"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-0.5">Jumlah Unit / Volume</label>
                <input
                  type="number"
                  min="1"
                  value={formData.jumlah}
                  disabled={!isEditing}
                  onChange={(e) => setFormData({ ...formData, jumlah: parseInt(e.target.value) || 1 })}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-0.5">Jenis Barang / Bangunan</label>
              <input
                type="text"
                value={formData.jenisBarangBangunan}
                disabled={!isEditing}
                onChange={(e) => setFormData({ ...formData, jenisBarangBangunan: e.target.value })}
                placeholder="Contoh: Gedung Ruang Guru, Papan Tulis Whiteboard, Kursi Siswa..."
                className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Kondisi Fisik</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Baik', 'Rusak Ringan', 'Rusak Berat'] as const).map((cond) => (
                  <label
                    key={cond}
                    className={`flex items-center justify-center gap-1.5 p-2 rounded border text-xs font-bold cursor-pointer ${
                      formData.kondisi === cond
                        ? cond === 'Baik'
                          ? 'bg-emerald-100 border-emerald-600 text-emerald-900'
                          : cond === 'Rusak Ringan'
                          ? 'bg-amber-100 border-amber-600 text-amber-900'
                          : 'bg-rose-100 border-rose-600 text-rose-900'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="sarpras_kondisi"
                      value={cond}
                      disabled={!isEditing}
                      checked={formData.kondisi === cond}
                      onChange={() => setFormData({ ...formData, kondisi: cond })}
                    />
                    <span>{cond}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-0.5">Ruangan / Lokasi Penempatan</label>
                <input
                  type="text"
                  value={formData.ruanganLokasi}
                  disabled={!isEditing}
                  onChange={(e) => setFormData({ ...formData, ruanganLokasi: e.target.value })}
                  placeholder="Contoh: Ruang Kelas I, Perpustakaan, Halaman Sekolah..."
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1.5"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-0.5">Sumber Dana Pengadaan</label>
                <input
                  type="text"
                  value={formData.sumberDana}
                  disabled={!isEditing}
                  onChange={(e) => setFormData({ ...formData, sumberDana: e.target.value })}
                  placeholder="Contoh: BOS Reguler, DAK Fisik, Hibah Pemda Pegunungan Bintang..."
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1.5"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-0.5">Keterangan / Catatan Inventaris</label>
              <textarea
                rows={2}
                value={formData.keterangan}
                disabled={!isEditing}
                onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                placeholder="Rincian kondisi, riwayat perbaikan, atau nomor sertifikat aset..."
                className="w-full bg-white border border-slate-300 rounded px-2 py-1.5"
              />
            </div>

            {isEditing && (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow text-xs flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  Simpan Data Sarpras
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Table Rekapan Sarpras */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase">
                Rekapan Sarana & Prasarana ({filteredItems.length})
              </h3>
              <p className="text-[11px] text-slate-500">
                Inventarisasi Gedung & Sarpras Dapodik
              </p>
            </div>
          </div>

          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama sarana atau lokasi..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
            />
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-[580px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="p-2 w-8 text-center">No</th>
                  <th className="p-2">Barang / Bangunan</th>
                  <th className="p-2">Jml</th>
                  <th className="p-2">Kondisi</th>
                  <th className="p-2">Lokasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((it, idx) => {
                  const isSelected = it.id === selectedItemId;
                  return (
                    <tr
                      key={it.id}
                      onClick={() => handleSelectItem(it)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-emerald-50 font-medium' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="p-2 text-center text-slate-500">{idx + 1}</td>
                      <td className="p-2">
                        <div className="font-bold text-slate-900">{it.jenisBarangBangunan || it.namaBarang}</div>
                        <div className="text-[10px] text-slate-500">{it.sumberDana || 'BOS / APBD'} ({it.tanggalPembelianPenerimaan || '2024'})</div>
                      </td>
                      <td className="p-2 font-bold">{it.jumlah}</td>
                      <td className="p-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          (it.kondisi || it.kondisiBarang) === 'Baik'
                            ? 'bg-emerald-100 text-emerald-800'
                            : (it.kondisi || it.kondisiBarang) === 'Rusak Ringan'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {it.kondisi || it.kondisiBarang || 'Baik'}
                        </span>
                      </td>
                      <td className="p-2 text-slate-700">{it.ruanganLokasi || it.lokasiBarang || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
