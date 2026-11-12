import React, { useState, useMemo } from 'react';
import {
  FinanceRecord,
  PaperSize,
  SchoolSettings
} from '../../types';
import { ActionToolbar } from '../ActionToolbar';
import { exportToExcel, exportToWord, exportToPPT, triggerPrint, safeConfirm, safePrompt } from '../../utils/exportHelpers';
import { Wallet, Search, CheckCircle, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface KeuanganModuleProps {
  records: FinanceRecord[];
  onSaveRecord: (record: FinanceRecord) => void;
  onDeleteRecord: (id: string) => void;
  onHome: () => void;
  settings: SchoolSettings;
  notifyMessage: (msg?: string) => void;
  onSync: () => void;
}

export const KeuanganModule: React.FC<KeuanganModuleProps> = ({
  records,
  onSaveRecord,
  onDeleteRecord,
  onHome,
  settings,
  notifyMessage,
  onSync
}) => {
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [paperSize, setPaperSize] = useState<PaperSize>(settings.ukuranKertas);

  const emptyRecord: Omit<FinanceRecord, 'id'> = {
    tanggal: new Date().toISOString().slice(0, 10),
    uraian: '',
    penerimaanDebit: 0,
    pengeluaranKredit: 0,
    saldo: 0,
    buktiTransaksi: 'KWT-001',
    kategoriDana: 'BOS Reguler',
    penanggungJawab: settings.namaKepsek,
    isLocked: false,
    isArchived: false
  };

  const [formData, setFormData] = useState(emptyRecord);

  // Recalculate running saldo for all records chronologically
  const sortedRecords = useMemo(() => {
    const list = [...records].sort((a, b) => (a.tanggal || '').localeCompare(b.tanggal || ''));
    let currentSaldo = 0;
    return list.map((item) => {
      const debit = item.penerimaanDebit !== undefined ? Number(item.penerimaanDebit) : (item.jenis === 'Penerimaan' ? Number(item.jumlah || 0) : 0);
      const kredit = item.pengeluaranKredit !== undefined ? Number(item.pengeluaranKredit) : (item.jenis === 'Pengeluaran' ? Number(item.jumlah || 0) : 0);
      currentSaldo += (debit || 0) - (kredit || 0);
      return {
        ...item,
        penerimaanDebit: debit || 0,
        pengeluaranKredit: kredit || 0,
        saldo: currentSaldo,
        penanggungJawab: item.penanggungJawab || settings.namaKepsek
      };
    });
  }, [records, settings.namaKepsek]);

  const filteredRecords = useMemo(() => {
    return sortedRecords.filter(
      (r) =>
        (r.uraian || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.buktiTransaksi || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.kategoriDana || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.penanggungJawab || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sortedRecords, searchQuery]);

  const selectedRecord = useMemo(() => {
    return sortedRecords.find((r) => r.id === selectedRecordId);
  }, [sortedRecords, selectedRecordId]);

  const totalDebit = sortedRecords.reduce((acc, r) => acc + (r.penerimaanDebit || 0), 0);
  const totalKredit = sortedRecords.reduce((acc, r) => acc + (r.pengeluaranKredit || 0), 0);
  const finalSaldo = totalDebit - totalKredit;

  const handleSelectRecord = (record: FinanceRecord) => {
    setSelectedRecordId(record.id);
    setFormData({
      tanggal: record.tanggal,
      uraian: record.uraian,
      penerimaanDebit: record.penerimaanDebit || 0,
      pengeluaranKredit: record.pengeluaranKredit || 0,
      saldo: record.saldo || 0,
      buktiTransaksi: record.buktiTransaksi,
      kategoriDana: record.kategoriDana,
      penanggungJawab: record.penanggungJawab || settings.namaKepsek,
      isLocked: record.isLocked,
      isArchived: record.isArchived
    });
    setIsEditing(false);
  };

  const handleAddNew = () => {
    setIsEditing(true);
    setSelectedRecordId(null);
    setFormData({
      ...emptyRecord,
      buktiTransaksi: `BOS/${new Date().getMonth() + 1}/${Math.floor(Math.random() * 899 + 100)}`
    });
    notifyMessage('Form Kas Masuk / Keluar Siap');
  };

  const handleSave = () => {
    if (!formData.uraian.trim()) {
      notifyMessage('Uraian transaksi keuangan wajib diisi!');
      return;
    }
    const recordToSave: FinanceRecord = {
      ...formData,
      id: selectedRecordId || `fin-${Date.now()}`
    };
    onSaveRecord(recordToSave);
    setIsEditing(false);
    setSelectedRecordId(recordToSave.id);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handleDelete = () => {
    if (!selectedRecordId) {
      notifyMessage('Pilih catatan kas terlebih dahulu.');
      return;
    }
    if (selectedRecord?.isLocked) {
      notifyMessage('Transaksi kas terkunci!');
      return;
    }
    if (safeConfirm(`Hapus transaksi kas: ${formData.uraian}?`)) {
      onDeleteRecord(selectedRecordId);
      setSelectedRecordId(null);
      setIsEditing(false);
      setFormData(emptyRecord);
      notifyMessage('Catatan Kas Dihapus');
    }
  };

  const handleToggleLock = () => {
    if (!selectedRecordId) {
      setFormData(prev => ({ ...prev, isLocked: !prev.isLocked }));
      notifyMessage('Data Anda Berhasil Disimpan');
      return;
    }
    if (selectedRecord) {
      const updated: FinanceRecord = { ...selectedRecord, isLocked: !selectedRecord.isLocked };
      onSaveRecord(updated);
      setFormData(prev => ({ ...prev, isLocked: updated.isLocked }));
      notifyMessage(updated.isLocked ? 'Data Anda Berhasil Dikunci' : 'Kunci Kas Dibuka');
    }
  };

  const handleToggleArchive = () => {
    if (!selectedRecordId) {
      setFormData(prev => ({ ...prev, isArchived: !prev.isArchived }));
      notifyMessage('Data Anda Berhasil Disimpan');
      return;
    }
    if (selectedRecord) {
      const updated: FinanceRecord = { ...selectedRecord, isArchived: !selectedRecord.isArchived };
      onSaveRecord(updated);
      setFormData(prev => ({ ...prev, isArchived: updated.isArchived }));
      notifyMessage(updated.isArchived ? 'Data Anda Berhasil Disimpan ke Arsip' : 'Data Dikeluarkan dari Arsip');
    }
  };

  // Export handlers
  const handleExcelExport = () => {
    const headers = [
      'No',
      'Tanggal',
      'No Bukti Transaksi',
      'Kategori Dana',
      'Uraian Transaksi',
      'Penerimaan / Debit (Rp)',
      'Pengeluaran / Kredit (Rp)',
      'Saldo Akhir (Rp)',
      'Penanggung Jawab'
    ];
    const rows = sortedRecords.map((r, idx) => [
      idx + 1,
      r.tanggal,
      r.buktiTransaksi,
      r.kategoriDana,
      r.uraian,
      r.penerimaanDebit,
      r.pengeluaranKredit,
      r.saldo,
      r.penanggungJawab
    ]);
    exportToExcel('Buku_Kas_Umum_BKU_Sekolah', headers, rows);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handleWordExport = () => {
    const content = `
      <div class="kop">
        <h2>${settings.namaInstansi}</h2>
        <h1>${settings.namaSekolah}</h1>
        <p>${settings.alamatSekolah}</p>
        <hr />
        <h3>BUKU KAS UMUM (BKU) TATA USAHA SEKOLAH</h3>
        <p>Periode: Tahun Anggaran ${new Date().getFullYear()}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Tanggal</th>
            <th>Bukti</th>
            <th>Uraian Transaksi</th>
            <th>Penerimaan (Debit)</th>
            <th>Pengeluaran (Kredit)</th>
            <th>Saldo Kas</th>
          </tr>
        </thead>
        <tbody>
          ${sortedRecords.map((r, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td>${r.tanggal}</td>
              <td>${r.buktiTransaksi}</td>
              <td>${r.uraian} (${r.kategoriDana})</td>
              <td>Rp ${(r.penerimaanDebit || 0).toLocaleString('id-ID')}</td>
              <td>Rp ${(r.pengeluaranKredit || 0).toLocaleString('id-ID')}</td>
              <td><b>Rp ${(r.saldo || 0).toLocaleString('id-ID')}</b></td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr style="font-weight:bold; background:#eee;">
            <td colspan="4" align="center">JUMLAH KESELURUHAN</td>
            <td>Rp ${(totalDebit || 0).toLocaleString('id-ID')}</td>
            <td>Rp ${(totalKredit || 0).toLocaleString('id-ID')}</td>
            <td>Rp ${(finalSaldo || 0).toLocaleString('id-ID')}</td>
          </tr>
        </tfoot>
      </table>
      <div class="footer">
        <table style="border:none; margin-top:40px;">
          <tr style="border:none;">
            <td style="border:none;" width="50%">
              Lunas Dibayar Tanggal ${new Date().toLocaleDateString('id-ID')}<br/>
              Bendahara Sekolah / Operator TU,<br/><br/><br/>
              <b><u>${settings.operatorTU}</u></b><br/>
              NIP. ${settings.nipOperator}
            </td>
            <td style="border:none;" width="50%" align="right">
              Setuju Dibayar,<br/>
              Kepala Sekolah,<br/><br/><br/>
              <b><u>${settings.namaKepsek}</u></b><br/>
              NIP. ${settings.nipKepsek}
            </td>
          </tr>
        </table>
      </div>
    `;
    exportToWord('Buku_Kas_Umum_Sekolah', content);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handlePPTExport = () => {
    const slides = [
      {
        title: `LAPORAN PERTANGGUNGJAWABAN KEUANGAN SEKOLAH`,
        subtitle: `${settings.namaSekolah} - Papua Pedalaman`,
        bullets: [
          `Total Penerimaan Kas (Debit): Rp ${(totalDebit || 0).toLocaleString('id-ID')}`,
          `Total Pengeluaran Kas (Kredit): Rp ${(totalKredit || 0).toLocaleString('id-ID')}`,
          `Sisa Saldo Kas Riil: Rp ${(finalSaldo || 0).toLocaleString('id-ID')}`,
          `Akuntabilitas: Sesuai Juknis BOS & Format Standar BKU`
        ]
      }
    ];
    exportToPPT('Presentasi_Keuangan_Sekolah', slides);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handleTemplate = () => {
    setFormData({
      tanggal: new Date().toISOString().slice(0, 10),
      uraian: 'Penerimaan Dana BOS Reguler Tahap 1 Tahun Anggaran Berjalan',
      penerimaanDebit: 45000000,
      pengeluaranKredit: 0,
      saldo: finalSaldo + 45000000,
      buktiTransaksi: 'SP2D-BOS-01/YHK',
      kategoriDana: 'BOS Reguler',
      penanggungJawab: settings.namaKepsek,
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
        titleContext="ADMINISTRASI KEUANGAN > BUKU KAS UMUM (BKU)"
        onHome={onHome}
        onAddNew={handleAddNew}
        onSave={handleSave}
        onView={() => {
          if (selectedRecord) notifyMessage(`Uraian: ${selectedRecord.uraian} | Saldo: Rp ${(selectedRecord.saldo || 0).toLocaleString('id-ID')}`);
          else notifyMessage('Pilih transaksi kas terlebih dahulu');
        }}
        onDelete={handleDelete}
        onSearch={() => {
          const q = safePrompt('Cari uraian, nomor bukti, atau penanggung jawab:', searchQuery);
          if (q !== null) setSearchQuery(q);
        }}
        onEdit={() => {
          if (!selectedRecordId) {
            notifyMessage('Pilih data kas terlebih dahulu.');
            return;
          }
          setIsEditing(true);
        }}
        onCancel={() => {
          setIsEditing(false);
          if (selectedRecord) handleSelectRecord(selectedRecord);
          else setFormData(emptyRecord);
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
          setFormData(emptyRecord);
          setIsEditing(true);
        }}
        isLocked={formData.isLocked}
        isArchived={formData.isArchived}
        paperSize={paperSize}
        onChangePaperSize={(size) => setPaperSize(size)}
        notifyMessage={notifyMessage}
      />

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Total Penerimaan (Debit)
            </span>
            <div className="text-xl font-black text-emerald-950 mt-1">
              Rp {(totalDebit || 0).toLocaleString('id-ID')}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-200 text-emerald-900 flex items-center justify-center font-bold text-sm">
            +
          </div>
        </div>

        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-rose-700 font-semibold flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" /> Total Pengeluaran (Kredit)
            </span>
            <div className="text-xl font-black text-rose-950 mt-1">
              Rp {(totalKredit || 0).toLocaleString('id-ID')}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-200 text-rose-900 flex items-center justify-center font-bold text-sm">
            -
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-blue-700 font-semibold flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" /> Sisa Saldo Kas Riil
            </span>
            <div className="text-xl font-black text-blue-950 mt-1">
              Rp {(finalSaldo || 0).toLocaleString('id-ID')}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-200 text-blue-900 flex items-center justify-center font-bold text-sm">
            =
          </div>
        </div>
      </div>

      {/* Grid: Form & List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Form Keuangan */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800 uppercase">
                  Formulir Transaksi Kas
                </h2>
                <p className="text-[11px] text-slate-500">
                  Pencatatan Debit, Kredit, & Bukti Kas
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
                <label className="font-bold text-slate-700 block mb-0.5">Tanggal Transaksi</label>
                <input
                  type="date"
                  value={formData.tanggal}
                  disabled={!isEditing}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1.5"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-0.5">Nomor Bukti Transaksi</label>
                <input
                  type="text"
                  value={formData.buktiTransaksi}
                  disabled={!isEditing}
                  onChange={(e) => setFormData({ ...formData, buktiTransaksi: e.target.value })}
                  placeholder="KWT/001, BKU/01..."
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-0.5">Uraian Transaksi Kas</label>
              <textarea
                rows={2}
                value={formData.uraian}
                disabled={!isEditing}
                onChange={(e) => setFormData({ ...formData, uraian: e.target.value })}
                placeholder="Rincian pembayaran, pembelian, atau penerimaan kas..."
                className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 font-medium text-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-emerald-50/60 p-2.5 rounded border border-emerald-200">
                <label className="font-bold text-emerald-900 block mb-0.5">Penerimaan (Debit)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.penerimaanDebit}
                  disabled={!isEditing}
                  onChange={(e) => setFormData({ ...formData, penerimaanDebit: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white border border-emerald-300 rounded px-2 py-1.5 font-bold text-emerald-900"
                />
                <span className="text-[10px] text-emerald-700 mt-0.5 block font-semibold">Kas Masuk (Rp)</span>
              </div>

              <div className="bg-rose-50/60 p-2.5 rounded border border-rose-200">
                <label className="font-bold text-rose-900 block mb-0.5">Pengeluaran (Kredit)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.pengeluaranKredit}
                  disabled={!isEditing}
                  onChange={(e) => setFormData({ ...formData, pengeluaranKredit: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white border border-rose-300 rounded px-2 py-1.5 font-bold text-rose-900"
                />
                <span className="text-[10px] text-rose-700 mt-0.5 block font-semibold">Kas Keluar (Rp)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-0.5">Kategori Sumber Dana</label>
                <select
                  value={formData.kategoriDana}
                  disabled={!isEditing}
                  onChange={(e) => setFormData({ ...formData, kategoriDana: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 font-semibold"
                >
                  <option value="BOS Reguler">BOS Reguler</option>
                  <option value="BOS Kinerja Afirmasi">BOS Kinerja Afirmasi</option>
                  <option value="BOP Papua / Otsus">BOP Papua / Otsus</option>
                  <option value="Bantuan Sosial Sekolah">Bantuan Sosial Sekolah</option>
                  <option value="Komite Sekolah">Komite Sekolah</option>
                  <option value="Kas Internal TU">Kas Internal TU</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-0.5">Penanggung Jawab / Otorisator</label>
                <input
                  type="text"
                  value={formData.penanggungJawab}
                  disabled={!isEditing}
                  onChange={(e) => setFormData({ ...formData, penanggungJawab: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1.5"
                />
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
                  Simpan Transaksi Kas
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Table Rekapan Keuangan / BKU */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase">
                Buku Kas Umum / Rekapan Keuangan ({filteredRecords.length})
              </h3>
              <p className="text-[11px] text-slate-500">
                Pencatatan Berdasarkan Standar BKU Kasir Sekolah
              </p>
            </div>
          </div>

          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari uraian, nomor bukti, atau kategori dana..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
            />
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-[580px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="p-2 w-8 text-center">No</th>
                  <th className="p-2">Tgl / Bukti</th>
                  <th className="p-2">Uraian Transaksi</th>
                  <th className="p-2 text-right">Debit (Rp)</th>
                  <th className="p-2 text-right">Kredit (Rp)</th>
                  <th className="p-2 text-right">Saldo (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((r, idx) => {
                  const isSelected = r.id === selectedRecordId;
                  return (
                    <tr
                      key={r.id}
                      onClick={() => handleSelectRecord(r)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-emerald-50 font-medium' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="p-2 text-center text-slate-500">{idx + 1}</td>
                      <td className="p-2 font-mono">
                        <div className="font-bold text-slate-900">{r.tanggal}</div>
                        <div className="text-[10px] text-slate-500">{r.buktiTransaksi}</div>
                      </td>
                      <td className="p-2">
                        <div className="font-semibold text-slate-900">{r.uraian}</div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                          {r.kategoriDana}
                        </span>
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-emerald-700">
                        {r.penerimaanDebit && r.penerimaanDebit > 0 ? (r.penerimaanDebit).toLocaleString('id-ID') : '-'}
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-rose-700">
                        {r.pengeluaranKredit && r.pengeluaranKredit > 0 ? (r.pengeluaranKredit).toLocaleString('id-ID') : '-'}
                      </td>
                      <td className="p-2 text-right font-mono font-black text-slate-900">
                        {(r.saldo ?? 0).toLocaleString('id-ID')}
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
