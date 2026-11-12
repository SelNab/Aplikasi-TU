import React, { useState, useMemo } from 'react';
import {
  Book,
  BookBorrowing,
  PaperSize,
  SchoolSettings
} from '../../types';
import { ActionToolbar } from '../ActionToolbar';
import { exportToExcel, exportToWord, exportToPPT, triggerPrint, safeConfirm, safePrompt } from '../../utils/exportHelpers';
import { BookOpen, Bookmark, CheckCircle, Search, Clock, ArrowRightLeft } from 'lucide-react';

interface PerpustakaanModuleProps {
  books: Book[];
  borrowings: BookBorrowing[];
  onSaveBook: (book: Book) => void;
  onDeleteBook: (id: string) => void;
  onSaveBorrowing: (borrow: BookBorrowing) => void;
  onDeleteBorrowing: (id: string) => void;
  onHome: () => void;
  settings: SchoolSettings;
  notifyMessage: (msg?: string) => void;
  onSync: () => void;
}

export const PerpustakaanModule: React.FC<PerpustakaanModuleProps> = ({
  books,
  borrowings,
  onSaveBook,
  onDeleteBook,
  onSaveBorrowing,
  onDeleteBorrowing,
  onHome,
  settings,
  notifyMessage,
  onSync
}) => {
  const [activeTab, setActiveTab] = useState<'buku' | 'peminjaman' | 'rekapan'>('buku');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [selectedBorrowId, setSelectedBorrowId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [paperSize, setPaperSize] = useState<PaperSize>(settings.ukuranKertas);

  // Empty Book Form
  const emptyBook: Omit<Book, 'id'> = {
    no: books.length + 1,
    judulBuku: '',
    pengarang: '',
    penerbit: 'Kemendikbudristek',
    tahunTerbit: 2023,
    jumlahBuku: 20,
    kategoriBuku: 'Buku Tematik / Pelajaran',
    sumberBuku: 'Dana BOS Afirmasi',
    nomorRak: 'Rak A-01',
    isLocked: false,
    isArchived: false
  };
  const [bookFormData, setBookFormData] = useState(emptyBook);

  // Empty Borrowing Form
  const emptyBorrowing: Omit<BookBorrowing, 'id'> = {
    no: borrowings.length + 1,
    tanggalPeminjaman: new Date().toISOString().slice(0, 10),
    tanggalPengembalian: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    namaPeminjam: '',
    judulBuku: books[0]?.judulBuku || '',
    kelasUmum: 'Kelas IV',
    jumlah: 1,
    keterangan: 'Belum',
    isLocked: false,
    isArchived: false
  };
  const [borrowFormData, setBorrowFormData] = useState(emptyBorrowing);

  const filteredBooks = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return books.filter(
      (b) =>
        (b.judulBuku || '').toLowerCase().includes(q) ||
        (b.pengarang || '').toLowerCase().includes(q) ||
        (b.kategoriBuku || b.kategori || '').toLowerCase().includes(q) ||
        (b.nomorRak || b.rak || '').toLowerCase().includes(q)
    );
  }, [books, searchQuery]);

  const filteredBorrowings = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return borrowings.filter(
      (bw) =>
        (bw.namaPeminjam || '').toLowerCase().includes(q) ||
        (bw.judulBuku || '').toLowerCase().includes(q) ||
        (bw.kelasUmum || '').toLowerCase().includes(q) ||
        (bw.status || '').toLowerCase().includes(q)
    );
  }, [borrowings, searchQuery]);

  // Book selection
  const handleSelectBook = (b: Book) => {
    setSelectedBookId(b.id);
    setBookFormData({
      no: b.no,
      judulBuku: b.judulBuku || '',
      pengarang: b.pengarang || '',
      penerbit: b.penerbit || '',
      tahunTerbit: b.tahunTerbit || '',
      jumlahBuku: b.jumlahBuku ?? b.stok ?? 1,
      kategoriBuku: b.kategoriBuku || b.kategori || 'Buku Pelajaran',
      sumberBuku: b.sumberBuku || 'Dana BOS',
      nomorRak: b.nomorRak || b.rak || 'Rak 1',
      isLocked: b.isLocked,
      isArchived: b.isArchived
    });
    setIsEditing(false);
  };

  // Borrowing selection
  const handleSelectBorrow = (bw: BookBorrowing) => {
    setSelectedBorrowId(bw.id);
    setBorrowFormData({
      no: bw.no,
      tanggalPeminjaman: bw.tanggalPeminjaman || bw.tglPinjam || new Date().toISOString().slice(0, 10),
      tanggalPengembalian: bw.tanggalPengembalian || bw.tglKembaliRencana || new Date().toISOString().slice(0, 10),
      namaPeminjam: bw.namaPeminjam || '',
      judulBuku: bw.judulBuku || '',
      kelasUmum: bw.kelasUmum || 'Kelas IV',
      jumlah: bw.jumlah ?? 1,
      keterangan: bw.keterangan || bw.status || 'Dipinjam',
      isLocked: bw.isLocked,
      isArchived: bw.isArchived
    });
    setIsEditing(false);
  };

  const handleAddNew = () => {
    setIsEditing(true);
    if (activeTab === 'buku') {
      setSelectedBookId(null);
      setBookFormData({ ...emptyBook, no: books.length + 1 });
    } else {
      setSelectedBorrowId(null);
      setBorrowFormData({ ...emptyBorrowing, no: borrowings.length + 1 });
    }
    notifyMessage('Formulir Baru Siap Diisi');
  };

  const handleSave = () => {
    if (activeTab === 'buku') {
      if (!bookFormData.judulBuku.trim()) {
        notifyMessage('Judul buku wajib diisi!');
        return;
      }
      const bToSave: Book = {
        ...bookFormData,
        id: selectedBookId || `bk-${Date.now()}`
      };
      onSaveBook(bToSave);
      setIsEditing(false);
      setSelectedBookId(bToSave.id);
    } else {
      if (!borrowFormData.namaPeminjam.trim()) {
        notifyMessage('Nama peminjam wajib diisi!');
        return;
      }
      const bwToSave: BookBorrowing = {
        ...borrowFormData,
        id: selectedBorrowId || `bw-${Date.now()}`
      };
      onSaveBorrowing(bwToSave);
      setIsEditing(false);
      setSelectedBorrowId(bwToSave.id);
    }
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handleDelete = () => {
    if (activeTab === 'buku') {
      if (!selectedBookId) return;
      if (safeConfirm('Hapus data buku ini?')) {
        onDeleteBook(selectedBookId);
        setSelectedBookId(null);
        setIsEditing(false);
        setBookFormData(emptyBook);
        notifyMessage('Data Buku Dihapus');
      }
    } else {
      if (!selectedBorrowId) return;
      if (safeConfirm('Hapus data peminjaman buku ini?')) {
        onDeleteBorrowing(selectedBorrowId);
        setSelectedBorrowId(null);
        setIsEditing(false);
        setBorrowFormData(emptyBorrowing);
        notifyMessage('Data Peminjaman Dihapus');
      }
    }
  };

  // Export handlers
  const handleExcelExport = () => {
    if (activeTab === 'buku' || activeTab === 'rekapan') {
      const headers = [
        'No',
        'Judul Buku',
        'Pengarang',
        'Penerbit',
        'Tahun Terbit',
        'Jumlah Eks',
        'Kategori Buku',
        'Sumber Buku',
        'Nomor Rak'
      ];
      const rows = books.map((b, i) => [
        i + 1,
        b.judulBuku,
        b.pengarang,
        b.penerbit,
        b.tahunTerbit,
        b.jumlahBuku,
        b.kategoriBuku,
        b.sumberBuku,
        b.nomorRak
      ]);
      exportToExcel('Katalog_Buku_Perpustakaan', headers, rows);
    } else {
      const headers = [
        'No',
        'Tgl Pinjam',
        'Tgl Kembali',
        'Nama Peminjam',
        'Judul Buku',
        'Kelas / Umum',
        'Jumlah',
        'Status (Kembali/Belum)'
      ];
      const rows = borrowings.map((bw, i) => [
        i + 1,
        bw.tanggalPeminjaman,
        bw.tanggalPengembalian,
        bw.namaPeminjam,
        bw.judulBuku,
        bw.kelasUmum,
        bw.jumlah,
        bw.keterangan
      ]);
      exportToExcel('Daftar_Peminjaman_Buku_Perpustakaan', headers, rows);
    }
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handleWordExport = () => {
    const content = `
      <div class="kop">
        <h2>${settings.namaInstansi}</h2>
        <h1>${settings.namaSekolah}</h1>
        <p>${settings.alamatSekolah}</p>
        <hr />
        <h3>REKAPITULASI BUKU DAN SIRKULASI PERPUSTAKAAN SEKOLAH</h3>
        <p>Tanggal: ${new Date().toLocaleDateString('id-ID')}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Judul Buku</th>
            <th>Pengarang / Penerbit</th>
            <th>Tahun</th>
            <th>Eks</th>
            <th>Kategori</th>
            <th>Lokasi Rak</th>
          </tr>
        </thead>
        <tbody>
          ${books.map((b, i) => `
            <tr>
              <td>${i + 1}</td>
              <td><b>${b.judulBuku}</b></td>
              <td>${b.pengarang} (${b.penerbit})</td>
              <td>${b.tahunTerbit}</td>
              <td>${b.jumlahBuku}</td>
              <td>${b.kategoriBuku}</td>
              <td>${b.nomorRak}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="footer">
        <p align="right">
          Dekai, ${new Date().toLocaleDateString('id-ID')}<br/>
          Pengelola Perpustakaan,<br/><br/><br/>
          <b><u>${settings.operatorTU}</u></b><br/>
          NIP. ${settings.nipOperator}
        </p>
      </div>
    `;
    exportToWord('Laporan_Perpustakaan', content);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  const handlePPTExport = () => {
    const totalEks = books.reduce((sum, b) => sum + b.jumlahBuku, 0);
    const slides = [
      {
        title: `LAPORAN PERPUSTAKAAN SEKOLAH`,
        subtitle: `${settings.namaSekolah} - Papua Pedalaman`,
        bullets: [
          `Total Koleksi Judul Buku: ${books.length} Judul`,
          `Total Eksemplar Buku: ${totalEks} Eksemplar`,
          `Peminjaman Sedang Berjalan: ${borrowings.filter(b => b.keterangan === 'Belum').length} Peminjam`,
          `Pengelolaan: Standar Otomasi Perpustakaan Sekolah Terpadu`
        ]
      }
    ];
    exportToPPT('Presentasi_Perpustakaan_Sekolah', slides);
    notifyMessage('Data Anda Berhasil Disimpan');
  };

  return (
    <div className="space-y-4">
      {/* Sub-view switcher */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-2 no-print">
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('buku');
              setIsEditing(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'buku'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Form Data Buku (Katalog)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('peminjaman');
              setIsEditing(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'peminjaman'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Form Peminjaman Buku
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('rekapan');
              setIsEditing(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'rekapan'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Rekapan Buku Perpustakaan
          </button>
        </div>
      </div>

      {/* Mandatory Standard Action Toolbar */}
      <ActionToolbar
        titleContext={`ADMINISTRASI PERPUSTAKAAN > ${activeTab.toUpperCase()}`}
        onHome={onHome}
        onAddNew={handleAddNew}
        onSave={handleSave}
        onView={() => setActiveTab('rekapan')}
        onDelete={handleDelete}
        onSearch={() => {
          const q = safePrompt('Cari judul buku, pengarang, peminjam, atau nomor rak:', searchQuery);
          if (q !== null) setSearchQuery(q);
        }}
        onEdit={() => setIsEditing(true)}
        onCancel={() => {
          setIsEditing(false);
          if (activeTab === 'buku' && selectedBookId) {
            const b = books.find(x => x.id === selectedBookId);
            if (b) handleSelectBook(b);
          } else if (activeTab === 'peminjaman' && selectedBorrowId) {
            const bw = borrowings.find(x => x.id === selectedBorrowId);
            if (bw) handleSelectBorrow(bw);
          }
        }}
        onBack={onHome}
        onArchive={() => notifyMessage('Data Anda Berhasil Disimpan')}
        onLock={() => notifyMessage('Data Anda Berhasil Dikunci')}
        onReview={() => triggerPrint()}
        onPrint={triggerPrint}
        onUpdate={handleSave}
        onTemplate={() => {
          if (activeTab === 'buku') {
            setBookFormData({
              no: books.length + 1,
              judulBuku: 'Pendidikan Agama Kristen dan Budi Pekerti Kelas IV SD',
              pengarang: 'Pdt. R. Sihombing, M.Th.',
              penerbit: 'Pusat Kurikulum dan Perbukuan Kemendikbud',
              tahunTerbit: 2023,
              jumlahBuku: 25,
              kategoriBuku: 'Buku Pelajaran Utama',
              sumberBuku: 'BOS Kinerja Papua',
              nomorRak: 'Rak B-02',
              isLocked: false,
              isArchived: false
            });
          }
          setIsEditing(true);
          notifyMessage('Data Anda Berhasil Disimpan');
        }}
        onPdf={triggerPrint}
        onExcel={handleExcelExport}
        onWord={handleWordExport}
        onPpt={handlePPTExport}
        onUploadPhoto={() => notifyMessage('Data Anda Berhasil Disimpan')}
        onRefresh={() => notifyMessage('Data Anda Berhasil Disimpan')}
        onSync={onSync}
        onReset={() => {
          if (activeTab === 'buku') setBookFormData(emptyBook);
          else setBorrowFormData(emptyBorrowing);
          setIsEditing(true);
        }}
        paperSize={paperSize}
        onChangePaperSize={(size) => setPaperSize(size)}
        notifyMessage={notifyMessage}
      />

      {/* Main Content Area */}
      {activeTab === 'buku' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Form Buku */}
          <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-700" />
                <h3 className="text-sm font-bold uppercase text-slate-800">Form Data Buku</h3>
              </div>
              <span className={`text-[11px] px-2 py-0.5 rounded font-bold ${
                isEditing ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {isEditing ? 'Mode Edit / Input' : 'Mode Pratinjau'}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-0.5">Judul Buku</label>
                <input
                  type="text"
                  value={bookFormData.judulBuku}
                  disabled={!isEditing}
                  onChange={(e) => setBookFormData({ ...bookFormData, judulBuku: e.target.value })}
                  placeholder="Judul lengkap buku..."
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-0.5">Pengarang / Penulis</label>
                  <input
                    type="text"
                    value={bookFormData.pengarang}
                    disabled={!isEditing}
                    onChange={(e) => setBookFormData({ ...bookFormData, pengarang: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1.5"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-0.5">Penerbit</label>
                  <input
                    type="text"
                    value={bookFormData.penerbit}
                    disabled={!isEditing}
                    onChange={(e) => setBookFormData({ ...bookFormData, penerbit: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-0.5">Tahun Terbit</label>
                  <input
                    type="number"
                    value={bookFormData.tahunTerbit}
                    disabled={!isEditing}
                    onChange={(e) => setBookFormData({ ...bookFormData, tahunTerbit: parseInt(e.target.value) || 2020 })}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1.5"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-0.5">Jumlah Buku (Eks)</label>
                  <input
                    type="number"
                    value={bookFormData.jumlahBuku}
                    disabled={!isEditing}
                    onChange={(e) => setBookFormData({ ...bookFormData, jumlahBuku: parseInt(e.target.value) || 1 })}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-0.5">Nomor Rak / Lemari</label>
                  <input
                    type="text"
                    value={bookFormData.nomorRak}
                    disabled={!isEditing}
                    onChange={(e) => setBookFormData({ ...bookFormData, nomorRak: e.target.value })}
                    placeholder="Contoh: Rak A-01"
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 font-semibold text-emerald-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-0.5">Kategori Buku</label>
                  <select
                    value={bookFormData.kategoriBuku}
                    disabled={!isEditing}
                    onChange={(e) => setBookFormData({ ...bookFormData, kategoriBuku: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1.5"
                  >
                    <option value="Buku Tematik / Pelajaran">Buku Tematik / Pelajaran</option>
                    <option value="Buku Cerita & Dongeng Anak">Buku Cerita & Dongeng Anak</option>
                    <option value="Ensiklopedia & Kamus">Ensiklopedia & Kamus</option>
                    <option value="Buku Agama & Budi Pekerti">Buku Agama & Budi Pekerti</option>
                    <option value="Buku Panduan Guru">Buku Panduan Guru</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-0.5">Sumber Pengadaan</label>
                  <input
                    type="text"
                    value={bookFormData.sumberBuku}
                    disabled={!isEditing}
                    onChange={(e) => setBookFormData({ ...bookFormData, sumberBuku: e.target.value })}
                    placeholder="BOS Reguler / Bantuan / DAK..."
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
                    Simpan Data Buku
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* List Buku */}
          <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold uppercase text-slate-800">
                Katalog Buku ({filteredBooks.length})
              </h3>
            </div>
            <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-[520px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="p-2 w-8 text-center">No</th>
                    <th className="p-2">Judul & Pengarang</th>
                    <th className="p-2">Eks</th>
                    <th className="p-2">Rak</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBooks.map((b, idx) => (
                    <tr
                      key={b.id}
                      onClick={() => handleSelectBook(b)}
                      className={`cursor-pointer transition-colors ${
                        b.id === selectedBookId ? 'bg-emerald-50 font-medium' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="p-2 text-center text-slate-500">{idx + 1}</td>
                      <td className="p-2">
                        <div className="font-bold text-slate-900">{b.judulBuku}</div>
                        <div className="text-[10px] text-slate-500">{b.pengarang} ({b.tahunTerbit})</div>
                      </td>
                      <td className="p-2 font-bold text-emerald-800">{b.jumlahBuku ?? b.stok ?? 1}</td>
                      <td className="p-2 font-semibold text-slate-700">{b.nomorRak || b.rak || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Form Peminjaman Buku */}
      {activeTab === 'peminjaman' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-emerald-700" />
                <h3 className="text-sm font-bold uppercase text-slate-800">Form Peminjaman Buku</h3>
              </div>
              <span className={`text-[11px] px-2 py-0.5 rounded font-bold ${
                isEditing ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {isEditing ? 'Mode Edit / Input' : 'Mode Pratinjau'}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-0.5">Tanggal Peminjaman</label>
                  <input
                    type="date"
                    value={borrowFormData.tanggalPeminjaman}
                    disabled={!isEditing}
                    onChange={(e) => setBorrowFormData({ ...borrowFormData, tanggalPeminjaman: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1.5"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-0.5">Tanggal Pengembalian</label>
                  <input
                    type="date"
                    value={borrowFormData.tanggalPengembalian}
                    disabled={!isEditing}
                    onChange={(e) => setBorrowFormData({ ...borrowFormData, tanggalPengembalian: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1.5"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-0.5">Nama Peminjam (Siswa / Guru / Umum)</label>
                <input
                  type="text"
                  value={borrowFormData.namaPeminjam}
                  disabled={!isEditing}
                  onChange={(e) => setBorrowFormData({ ...borrowFormData, namaPeminjam: e.target.value })}
                  placeholder="Nama peminjam..."
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-0.5">Kelas / Status</label>
                  <input
                    type="text"
                    value={borrowFormData.kelasUmum}
                    disabled={!isEditing}
                    onChange={(e) => setBorrowFormData({ ...borrowFormData, kelasUmum: e.target.value })}
                    placeholder="Contoh: Kelas IV, Guru, Staf TU..."
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1.5"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-0.5">Jumlah Buku Dipinjam</label>
                  <input
                    type="number"
                    min="1"
                    value={borrowFormData.jumlah}
                    disabled={!isEditing}
                    onChange={(e) => setBorrowFormData({ ...borrowFormData, jumlah: parseInt(e.target.value) || 1 })}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-0.5">Judul Buku Dipinjam</label>
                <input
                  type="text"
                  value={borrowFormData.judulBuku}
                  disabled={!isEditing}
                  onChange={(e) => setBorrowFormData({ ...borrowFormData, judulBuku: e.target.value })}
                  placeholder="Judul buku..."
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1.5"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Status Pengembalian</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 font-bold cursor-pointer text-emerald-800">
                    <input
                      type="radio"
                      name="status_pinjam"
                      value="Kembali"
                      disabled={!isEditing}
                      checked={borrowFormData.keterangan === 'Kembali'}
                      onChange={() => setBorrowFormData({ ...borrowFormData, keterangan: 'Kembali' })}
                    />
                    <span>Sudah Dikembalikan</span>
                  </label>
                  <label className="flex items-center gap-1.5 font-bold cursor-pointer text-rose-800">
                    <input
                      type="radio"
                      name="status_pinjam"
                      value="Belum"
                      disabled={!isEditing}
                      checked={borrowFormData.keterangan === 'Belum'}
                      onChange={() => setBorrowFormData({ ...borrowFormData, keterangan: 'Belum' })}
                    />
                    <span>Belum Dikembalikan (Sedang Dipinjam)</span>
                  </label>
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
                    Simpan Data Peminjaman
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* List Peminjaman */}
          <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold uppercase text-slate-800">
                Riwayat Peminjaman Buku ({filteredBorrowings.length})
              </h3>
            </div>
            <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-[520px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="p-2 w-8 text-center">No</th>
                    <th className="p-2">Peminjam</th>
                    <th className="p-2">Judul Buku</th>
                    <th className="p-2">Batas Kembali</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBorrowings.map((bw, idx) => (
                    <tr
                      key={bw.id}
                      onClick={() => handleSelectBorrow(bw)}
                      className={`cursor-pointer transition-colors ${
                        bw.id === selectedBorrowId ? 'bg-emerald-50 font-medium' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="p-2 text-center text-slate-500">{idx + 1}</td>
                      <td className="p-2">
                        <div className="font-bold text-slate-900">{bw.namaPeminjam}</div>
                        <div className="text-[10px] text-slate-500">{bw.kelasUmum || 'Siswa/Guru'}</div>
                      </td>
                      <td className="p-2 font-semibold text-slate-800">{bw.judulBuku}</td>
                      <td className="p-2 text-slate-600">{bw.tanggalPengembalian}</td>
                      <td className="p-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          bw.keterangan === 'Kembali'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {bw.keterangan === 'Kembali' ? 'Kembali' : 'Dipinjam'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Rekapan Buku Perpustakaan */}
      {activeTab === 'rekapan' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold uppercase text-slate-800">
                Rekapan Keseluruhan Buku & Inventaris Perpustakaan
              </h3>
              <p className="text-[11px] text-slate-500">
                {settings.namaSekolah} - Koleksi Lengkap
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="p-2 w-8 text-center">No</th>
                  <th className="p-2">Judul Buku</th>
                  <th className="p-2">Pengarang</th>
                  <th className="p-2">Penerbit</th>
                  <th className="p-2 text-center">Tahun</th>
                  <th className="p-2 text-center">Jumlah Eks</th>
                  <th className="p-2">Kategori</th>
                  <th className="p-2">Sumber Pengadaan</th>
                  <th className="p-2 text-center">Lokasi Rak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {books.map((b, idx) => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="p-2 text-center text-slate-500">{idx + 1}</td>
                    <td className="p-2 font-bold text-slate-900">{b.judulBuku}</td>
                    <td className="p-2 text-slate-700">{b.pengarang}</td>
                    <td className="p-2 text-slate-600">{b.penerbit}</td>
                    <td className="p-2 text-center text-slate-600">{b.tahunTerbit}</td>
                    <td className="p-2 text-center font-bold text-emerald-800">{b.jumlahBuku ?? b.stok ?? 1}</td>
                    <td className="p-2 text-slate-600">{b.kategoriBuku || b.kategori || '-'}</td>
                    <td className="p-2 text-slate-600">{b.sumberBuku || 'Dana BOS'}</td>
                    <td className="p-2 text-center font-semibold text-slate-800">{b.nomorRak || b.rak || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
