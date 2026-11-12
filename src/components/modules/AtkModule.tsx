import React, { useState, useMemo } from 'react';
import {
  AtkItem,
  PaperSize,
  SchoolSettings
} from '../../types';
import { ActionToolbar } from '../ActionToolbar';
import { exportToExcel, exportToWord, exportToPPT, triggerPrint, safeConfirm, safePrompt } from '../../utils/exportHelpers';
import { Package, Search, CheckCircle, ArrowDownCircle, ArrowUpCircle, Eye, Edit3, Trash2 } from 'lucide-react';

interface AtkModuleProps {
  items: AtkItem[];
  onSaveItem: (item: AtkItem) => void;
  onDeleteItem: (id: string) => void;
  onHome: () => void;
  settings: SchoolSettings;
  notifyMessage: (msg?: string) => void;
  onSync: () => void;
}

export const AtkModule: React.FC<AtkModuleProps> = ({
  items,
  onSaveItem,
  onDeleteItem,
  onHome,
  settings,
  notifyMessage,
  onSync
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [paperSize, setPaperSize] = useState<PaperSize>(settings.ukuranKertas);

  const emptyItem: Omit<AtkItem, 'id'> = {
    no: items.length + 1,
    tanggalMasuk: new Date().toISOString().slice(0, 10),
    namaBarang: '',
    jumlah: 1,
    satuan: 'Rim',
    kategori: 'Kertas & Formulir',
    kondisi: 'Baik',
    hargaSatuan: 85000,
    totalHarga: 85000,
    tanggalKeluar: '',
    penerima: '',
    isLocked: false,
    isArchived: false
  };

  const [formData, setFormData] = useState(emptyItem);

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        (item.namaBarang || '').toLowerCase().includes(q) ||
        (item.kategori || '').toLowerCase().includes(q) ||
        (item.penerima || '').toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  const selectedItem = useMemo(() => {
    return items.find((it) => it.id === selectedItemId);
  }, [items, selectedItemId]);

  const handleSelectItem = (item: AtkItem) => {
    setSelectedItemId(item.id);
    setFormData({
      no: item.no,
      tanggalMasuk: item.tanggalMasuk,
      namaBarang: item.namaBarang,
      jumlah: item.jumlah,
      satuan: item.satuan,
      kategori: item.kategori,
      kondisi: item.kondisi,
      hargaSatuan: item.hargaSatuan,
      totalHarga: item.totalHarga,
      tanggalKeluar: item.tanggalKeluar,
      penerima: item.penerima,
      isLocked: item.isLocked,
      isArchived: item.isArchived
    });
    setIsEditing(false);
  };

  const handleAddNew = () => {
    setIsEditing(true);
    setSelectedItemId(null);
    setFormData({ ...emptyItem, no: items.length + 1 });
    notifyMessage('Form Tambah ATK Baru Siap');
  };

  const handleSave = () => {
    if (!formData.namaBarang.trim()) {
      notifyMessage('Nama Barang ATK wajib diisi!');
      return;
    }
    const calculatedTotal = (formData.jumlah || 0) * (formData.hargaSatuan || 0);
    const itemToSave: AtkItem = {
      ...formData,
      totalHarga: calculatedTotal,
      id: selectedItemId || `atk-${Date.now()}`
    };
    onSaveItem(itemToSave);
    setIsEditing(false);
    setSelectedItemId(itemToSave.id);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handleDelete = () => {
    if (!selectedItemId) {
      notifyMessage('Pilih data ATK terlebih dahulu.');
      return;
    }
    if (selectedItem?.isLocked) {
      notifyMessage('Data ATK ini terkunci!');
      return;
    }
    if (safeConfirm(`Hapus barang ATK: ${formData.namaBarang}?`)) {
      onDeleteItem(selectedItemId);
      setSelectedItemId(null);
      setIsEditing(false);
      setFormData(emptyItem);
      notifyMessage('Data ATK Dihapus');
    }
  };

  const handleToggleLock = () => {
    if (!selectedItemId) {
      setFormData(prev => ({ ...prev, isLocked: !prev.isLocked }));
      notifyMessage('Data Anda Berhasil Disimpan');
      return;
    }
    if (selectedItem) {
      const updated: AtkItem = { ...selectedItem, isLocked: !selectedItem.isLocked };
      onSaveItem(updated);
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
      const updated: AtkItem = { ...selectedItem, isArchived: !selectedItem.isArchived };
      onSaveItem(updated);
      setFormData(prev => ({ ...prev, isArchived: updated.isArchived }));
      notifyMessage(updated.isArchived ? 'Data Anda Berhasil Disimpan ke Arsip' : 'Data Dikeluarkan dari Arsip');
    }
  };

  // Export handlers
  const handleExcelExport = () => {
    const headers = [
      'No',
      'Tanggal Masuk',
      'Nama Barang',
      'Kategori',
      'Jumlah',
      'Satuan',
      'Kondisi',
      'Harga Satuan (Rp)',
      'Total Harga (Rp)',
      'Tanggal Keluar',
      'Penerima / Pemakai'
    ];
    const rows = filteredItems.map((it, idx) => [
      idx + 1,
      it.tanggalMasuk,
      it.namaBarang,
      it.kategori,
      it.jumlah,
      it.satuan,
      it.kondisi,
      it.hargaSatuan,
      it.totalHarga,
      it.tanggalKeluar || '-',
      it.penerima || '-'
    ]);
    exportToExcel('Rekap_Administrasi_ATK_Sekolah', headers, rows);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handleWordExport = () => {
    const content = `
      <div class="kop">
        <h2>${settings.namaInstansi}</h2>
        <h1>${settings.namaSekolah}</h1>
        <p>${settings.alamatSekolah}</p>
        <hr />
        <h3>BUKU INDUK INVENTARIS ALAT TULIS KANTOR (ATK)</h3>
        <p>Dicetak: ${new Date().toLocaleDateString('id-ID')}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Nama Barang ATK</th>
            <th>Kategori</th>
            <th>Jumlah / Satuan</th>
            <th>Kondisi</th>
            <th>Total Harga</th>
            <th>Penerima</th>
          </tr>
        </thead>
        <tbody>
          ${filteredItems.map((it, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td><b>${it.namaBarang}</b></td>
              <td>${it.kategori}</td>
              <td>${it.jumlah} ${it.satuan}</td>
              <td>${it.kondisi}</td>
              <td>Rp ${(it.totalHarga ?? ((it.jumlah || 0) * (it.hargaSatuan || 0)) ?? 0).toLocaleString('id-ID')}</td>
              <td>${it.penerima || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="footer">
        <p align="right">
          Dekai, ${new Date().toLocaleDateString('id-ID')}<br/>
          Pengelola Perlengkapan / TU,<br/><br/><br/>
          <b><u>${settings.operatorTU}</u></b><br/>
          NIP. ${settings.nipOperator}
        </p>
      </div>
    `;
    exportToWord('Buku_Inventaris_ATK', content);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handlePPTExport = () => {
    const totalNilai = items.reduce((acc, curr) => acc + (curr.totalHarga || 0), 0);
    const slides = [
      {
        title: `LAPORAN INVENTARIS ATK SEKOLAH`,
        subtitle: `${settings.namaSekolah} - Papua Pedalaman`,
        bullets: [
          `Total Jenis Barang ATK: ${items.length} Item`,
          `Total Nilai Aset ATK: Rp ${totalNilai.toLocaleString('id-ID')}`,
          `Kondisi Barang Baik: ${items.filter(i => i.kondisi === 'Baik').length} Item`,
          `Pengelolaan: Buku Kas Khusus dan Kartu Stok ATK`
        ]
      }
    ];
    exportToPPT('Presentasi_Inventaris_ATK', slides);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handleTemplate = () => {
    setFormData({
      no: items.length + 1,
      tanggalMasuk: new Date().toISOString().slice(0, 10),
      namaBarang: 'Kertas HVS F4 75 Gsm Sinar Dunia',
      jumlah: 15,
      satuan: 'Rim',
      kategori: 'Kertas & Cetak',
      kondisi: 'Baik',
      hargaSatuan: 95000,
      totalHarga: 15 * 95000,
      tanggalKeluar: '',
      penerima: 'Tata Usaha / Ruang Guru',
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
        titleContext="ADMINISTRASI ATK (ALAT TULIS KANTOR)"
        onHome={onHome}
        onAddNew={handleAddNew}
        onSave={handleSave}
        onView={() => {
          if (selectedItem) notifyMessage(`Barang: ${selectedItem.namaBarang} | Jumlah: ${selectedItem.jumlah} ${selectedItem.satuan}`);
          else notifyMessage('Pilih data ATK terlebih dahulu');
        }}
        onDelete={handleDelete}
        onSearch={() => {
          const q = safePrompt('Cari nama barang ATK atau kategori:', searchQuery);
          if (q !== null) setSearchQuery(q);
        }}
        onEdit={() => {
          if (!selectedItemId) {
            notifyMessage('Pilih data ATK terlebih dahulu.');
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
        {/* Form ATK */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800 uppercase">
                  Formulir Administrasi ATK
                </h2>
                <p className="text-[11px] text-slate-500">
                  Pencatatan Masuk & Distribusi Penggunaan Alat Tulis Kantor
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
                <label className="font-bold text-slate-700 block mb-0.5">Tanggal Masuk</label>
                <input
                  type="date"
                  value={formData.tanggalMasuk}
                  disabled={!isEditing}
                  onChange={(e) => setFormData({ ...formData, tanggalMasuk: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1.5"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-0.5">Kategori ATK</label>
                <select
                  value={formData.kategori}
                  disabled={!isEditing}
                  onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 font-semibold"
                >
                  <option value="Kertas & Formulir">Kertas & Formulir</option>
                  <option value="Tinta & Toner Printer">Tinta & Toner Printer</option>
                  <option value="Alat Tulis & Spidol">Alat Tulis & Spidol</option>
                  <option value="Binder & Map Arsip">Binder & Map Arsip</option>
                  <option value="Perlengkapan Meja & Kantor">Perlengkapan Meja & Kantor</option>
                  <option value="Lain-lain">Lain-lain</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-0.5">Nama Barang ATK</label>
              <input
                type="text"
                value={formData.namaBarang}
                disabled={!isEditing}
                onChange={(e) => setFormData({ ...formData, namaBarang: e.target.value })}
                placeholder="Contoh: Kertas HVS F4 75 Gsm, Spidol Snowman Boardmarker..."
                className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 font-bold text-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-0.5">Jumlah</label>
                <input
                  type="number"
                  min="1"
                  value={formData.jumlah}
                  disabled={!isEditing}
                  onChange={(e) => {
                    const j = parseInt(e.target.value) || 0;
                    setFormData({
                      ...formData,
                      jumlah: j,
                      totalHarga: j * (formData.hargaSatuan || 0)
                    });
                  }}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-0.5">Satuan</label>
                <select
                  value={formData.satuan}
                  disabled={!isEditing}
                  onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1.5"
                >
                  <option value="Rim">Rim</option>
                  <option value="Pcs">Pcs / Buah</option>
                  <option value="Kotak / Box">Kotak / Box</option>
                  <option value="Lusin">Lusin</option>
                  <option value="Pak">Pak</option>
                  <option value="Botol">Botol</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-0.5">Kondisi</label>
                <select
                  value={formData.kondisi}
                  disabled={!isEditing}
                  onChange={(e) => setFormData({ ...formData, kondisi: e.target.value as any })}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 font-semibold text-emerald-800"
                >
                  <option value="Baik">Baik (Baru)</option>
                  <option value="Rusak Ringan">Rusak Ringan</option>
                  <option value="Rusak Berat">Rusak Berat</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-2.5 rounded border border-slate-200">
              <div>
                <label className="font-bold text-slate-700 block mb-0.5">Harga Satuan (Rp)</label>
                <input
                  type="number"
                  value={formData.hargaSatuan}
                  disabled={!isEditing}
                  onChange={(e) => {
                    const h = parseInt(e.target.value) || 0;
                    setFormData({
                      ...formData,
                      hargaSatuan: h,
                      totalHarga: h * (formData.jumlah || 0)
                    });
                  }}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1.5"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-0.5">Total Harga (Rp)</label>
                <input
                  type="text"
                  readOnly
                  value={`Rp ${(formData.totalHarga || 0).toLocaleString('id-ID')}`}
                  className="w-full bg-slate-100 border border-slate-300 rounded px-2 py-1.5 font-bold text-emerald-900"
                />
              </div>
            </div>

            <div className="p-3 bg-amber-50/60 rounded border border-amber-200/80">
              <span className="font-bold text-amber-900 block mb-1">Pencatatan Keluar / Distribusi Penggunaan:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-0.5">Tanggal Keluar / Pemakaian</label>
                  <input
                    type="date"
                    value={formData.tanggalKeluar || ''}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({ ...formData, tanggalKeluar: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1.5"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-0.5">Penerima / Pengguna</label>
                  <input
                    type="text"
                    value={formData.penerima || ''}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({ ...formData, penerima: e.target.value })}
                    placeholder="Nama Guru, Kelas, atau Bagian..."
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1.5"
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow text-xs flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  Simpan Data ATK
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Table Rekapan ATK */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase">
                Rekapan Inventaris ATK ({filteredItems.length})
              </h3>
              <p className="text-[11px] text-slate-500">
                Stok barang dan alokasi pemakaian
              </p>
            </div>
          </div>

          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama barang atau penerima..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
            />
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-[580px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="p-2 w-8 text-center">No</th>
                  <th className="p-2">Nama Barang & Kategori</th>
                  <th className="p-2">Stok / Satuan</th>
                  <th className="p-2">Total Nilai</th>
                  <th className="p-2">Penerima</th>
                  <th className="p-2 text-right">Aksi</th>
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
                        <div className="font-bold text-slate-900">{it.namaBarang}</div>
                        <div className="text-[10px] text-slate-500">{it.kategori} ({it.tanggalMasuk})</div>
                      </td>
                      <td className="p-2">
                        <span className="font-semibold">{it.jumlah} {it.satuan}</span>
                        <div className="text-[10px] text-emerald-700 font-medium">{it.kondisi}</div>
                      </td>
                      <td className="p-2 font-mono font-bold text-slate-800">
                        Rp {(it.totalHarga ?? ((it.jumlah || 0) * (it.hargaSatuan || 0)) ?? 0).toLocaleString('id-ID')}
                      </td>
                      <td className="p-2 text-slate-600">
                        {it.penerima ? (
                          <span className="text-[11px] font-medium text-blue-700">Keluar: {it.penerima}</span>
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-semibold">Tersedia di TU</span>
                        )}
                      </td>
                      <td className="p-2 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectItem(it);
                              setIsEditing(false);
                            }}
                            className="p-1 rounded bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-300 text-[10px] font-bold"
                            title="Lihat"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectItem(it);
                              setIsEditing(true);
                            }}
                            className="p-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-300 text-[10px] font-bold"
                            title="Edit"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectItem(it);
                              handleDelete();
                            }}
                            className="p-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-300 text-[10px] font-bold"
                            title="Hapus"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
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
