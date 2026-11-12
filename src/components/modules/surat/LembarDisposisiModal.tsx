import React, { useState, useEffect } from 'react';
import { SuratDocument, SchoolSettings } from '../../../types';
import { DISPOSISI_DITERUSKAN_OPTIONS, DISPOSISI_PETUNJUK_OPTIONS } from './persuratanData';
import { Printer, FileText, CheckSquare, Square, X, Download, Save } from 'lucide-react';
import { KopSurat } from '../../KopSurat';
import { exportToWord, triggerPrint } from '../../../utils/exportHelpers';

interface LembarDisposisiModalProps {
  isOpen: boolean;
  onClose: () => void;
  surat: SuratDocument | null;
  settings: SchoolSettings;
  onSaveDisposisi: (updatedSurat: SuratDocument) => void;
  notifyMessage: (msg?: string) => void;
}

export const LembarDisposisiModal: React.FC<LembarDisposisiModalProps> = ({
  isOpen,
  onClose,
  surat,
  settings,
  onSaveDisposisi,
  notifyMessage
}) => {
  if (!isOpen || !surat) return null;

  // Selected Diteruskan items
  const [selectedDiteruskan, setSelectedDiteruskan] = useState<string[]>([]);
  const [diteruskanLainnya, setDiteruskanLainnya] = useState('');

  // Selected Petunjuk items
  const [selectedPetunjuk, setSelectedPetunjuk] = useState<string[]>([]);
  const [petunjukLainnya, setPetunjukLainnya] = useState('');

  // Catatan Kepala Sekolah
  const [catatanKepsek, setCatatanKepsek] = useState('');
  const [tanggalDisposisi, setTanggalDisposisi] = useState('');

  useEffect(() => {
    if (surat) {
      // Parse diteruskan
      const rawDiteruskan = surat.diteruskanKepada || '';
      const partsDiteruskan = rawDiteruskan.split(',').map(s => s.trim()).filter(Boolean);
      const standardDiteruskan = partsDiteruskan.filter(p => DISPOSISI_DITERUSKAN_OPTIONS.includes(p));
      const customDiteruskan = partsDiteruskan.find(p => !DISPOSISI_DITERUSKAN_OPTIONS.includes(p)) || '';
      setSelectedDiteruskan(standardDiteruskan);
      setDiteruskanLainnya(customDiteruskan);

      // Parse petunjuk
      const rawPetunjuk = surat.petunjukDisposisi || '';
      const partsPetunjuk = rawPetunjuk.split(',').map(s => s.trim()).filter(Boolean);
      const standardPetunjuk = partsPetunjuk.filter(p => DISPOSISI_PETUNJUK_OPTIONS.includes(p));
      const customPetunjuk = partsPetunjuk.find(p => !DISPOSISI_PETUNJUK_OPTIONS.includes(p)) || '';
      setSelectedPetunjuk(standardPetunjuk);
      setPetunjukLainnya(customPetunjuk);

      setCatatanKepsek(surat.catatanKepsek || surat.isiDisposisi || '');
      setTanggalDisposisi(surat.tanggalDisposisi || new Date().toISOString().slice(0, 10));
    }
  }, [surat]);

  const toggleDiteruskan = (opt: string) => {
    setSelectedDiteruskan(prev =>
      prev.includes(opt) ? prev.filter(x => x !== opt) : [...prev, opt]
    );
  };

  const togglePetunjuk = (opt: string) => {
    setSelectedPetunjuk(prev =>
      prev.includes(opt) ? prev.filter(x => x !== opt) : [...prev, opt]
    );
  };

  const handleSave = () => {
    const finalDiteruskan = [
      ...selectedDiteruskan,
      diteruskanLainnya ? diteruskanLainnya.trim() : ''
    ].filter(Boolean).join(', ');

    const finalPetunjuk = [
      ...selectedPetunjuk,
      petunjukLainnya ? petunjukLainnya.trim() : ''
    ].filter(Boolean).join(', ');

    const updated: SuratDocument = {
      ...surat,
      diteruskanKepada: finalDiteruskan || 'Kepala Sekolah',
      petunjukDisposisi: finalPetunjuk || 'Untuk diketahui',
      catatanKepsek: catatanKepsek,
      isiDisposisi: catatanKepsek,
      tanggalDisposisi: tanggalDisposisi || new Date().toISOString().slice(0, 10),
      statusSurat: surat.statusSurat === 'Selesai' ? 'Selesai' : 'Diproses'
    };

    onSaveDisposisi(updated);
    notifyMessage('Lembar Disposisi Berhasil Disimpan');
  };

  const handleExportWord = () => {
    const diteruskanStr = [
      ...selectedDiteruskan,
      diteruskanLainnya ? `Lainnya: ${diteruskanLainnya}` : ''
    ].filter(Boolean).join(', ');

    const petunjukStr = [
      ...selectedPetunjuk,
      petunjukLainnya ? `Lainnya: ${petunjukLainnya}` : ''
    ].filter(Boolean).join(', ');

    const content = `
      <div style="font-family: Arial, sans-serif; text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px;">
        <h3 style="margin:0; font-size:12pt; text-transform:uppercase;">${settings.namaInstansi}</h3>
        <h2 style="margin:2px 0; font-size:14pt; text-transform:uppercase;">${settings.namaSekolah}</h2>
        <p style="margin:0; font-size:9pt;">${settings.alamatSekolah} | NPSN: ${settings.npsn}</p>
      </div>
      <div style="text-align: center; margin: 15px 0;">
        <h2 style="margin:0; text-decoration: underline; font-size: 14pt;">LEMBAR DISPOSISI</h2>
      </div>
      <table border="1" cellpadding="6" cellspacing="0" style="width:100%; border-collapse:collapse; font-size:10pt;">
        <tr><td width="30%"><b>Nomor Agenda</b></td><td>${surat.nomorAgenda || '-'}</td></tr>
        <tr><td><b>Nomor Surat</b></td><td>${surat.nomorSurat}</td></tr>
        <tr><td><b>Tanggal Surat</b></td><td>${surat.tanggalSurat}</td></tr>
        <tr><td><b>Tanggal Diterima</b></td><td>${surat.tanggalTerima || surat.tanggalSurat}</td></tr>
        <tr><td><b>Asal / Pengirim Surat</b></td><td>${surat.pengirim}</td></tr>
        <tr><td><b>Perihal</b></td><td><b>${surat.perihal}</b></td></tr>
        <tr><td><b>Klasifikasi</b></td><td>${surat.klasifikasi || surat.kodeKlasifikasi || '-'}</td></tr>
        <tr><td><b>Lampiran</b></td><td>${surat.lampiran || '1 Berkas'}</td></tr>
        <tr><td><b>Diteruskan Kepada</b></td><td>${diteruskanStr || '-'}</td></tr>
        <tr><td><b>Petunjuk / Disposisi</b></td><td>${petunjukStr || '-'}</td></tr>
        <tr><td colspan="2"><b>Catatan Kepala Sekolah:</b><br/><br/>${catatanKepsek || '-'}</td></tr>
      </table>
      <div style="margin-top: 30px; text-align: right; font-size: 10pt;">
        <p>${settings.alamatSekolah.split(',')[0] || 'Dekai'}, ${tanggalDisposisi || surat.tanggalSurat}</p>
        <p>Kepala Sekolah,</p>
        <br/><br/><br/>
        <p><b><u>${settings.namaKepsek}</u></b><br/>NIP. ${settings.nipKepsek}</p>
      </div>
    `;

    exportToWord(`Lembar_Disposisi_${(surat.nomorAgenda || surat.nomorSurat).replace(/[\/\\]/g, '_')}`, content);
    notifyMessage('Lembar Disposisi Diekspor ke Word');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4 print:my-0 print:border-none print:shadow-none print:max-w-none print:w-full">
        {/* Header toolbar (no-print) */}
        <div className="bg-slate-900 text-white p-3.5 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-wide">Lembar Disposisi Surat Masuk</h3>
              <p className="text-[11px] text-slate-300">
                Agenda: <strong>{surat.nomorAgenda || 'SM-???'}</strong> | No: {surat.nomorSurat}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleSave}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan</span>
            </button>
            <button
              type="button"
              onClick={() => triggerPrint()}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak (Print)</span>
            </button>
            <button
              type="button"
              onClick={handleExportWord}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Word</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body / Print Sheet */}
        <div className="p-6 sm:p-8 bg-white max-h-[82vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-4 text-slate-900 font-sans text-xs">
          {/* Header Kop Surat Disposisi */}
          <div className="text-center pb-3 border-b-2 border-slate-900 mb-3">
            <h4 className="font-bold text-xs sm:text-sm tracking-wider uppercase">{settings.namaInstansi}</h4>
            <h2 className="font-black text-base sm:text-lg tracking-wide uppercase text-slate-900">{settings.namaSekolah}</h2>
            <p className="text-[11px] text-slate-600">
              {settings.alamatSekolah} | NPSN: {settings.npsn}
            </p>
          </div>

          <div className="text-center my-3">
            <h3 className="text-sm sm:text-base font-black uppercase tracking-widest text-slate-900 underline decoration-2 underline-offset-4">
              LEMBAR DISPOSISI
            </h3>
          </div>

          {/* Table Data Surat */}
          <table className="w-full border-collapse border border-slate-800 text-xs mb-4">
            <thead className="bg-slate-100 font-bold border-b border-slate-800">
              <tr>
                <th className="p-2 w-1/3 border-r border-slate-800 text-left uppercase">DATA SURAT</th>
                <th className="p-2 text-left uppercase">KETERANGAN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <tr>
                <td className="p-2 border-r border-slate-800 font-semibold bg-slate-50/50">Nomor Agenda</td>
                <td className="p-2 font-bold font-mono text-emerald-800">{surat.nomorAgenda || '-'}</td>
              </tr>
              <tr>
                <td className="p-2 border-r border-slate-800 font-semibold bg-slate-50/50">Nomor Surat</td>
                <td className="p-2 font-bold font-mono">{surat.nomorSurat}</td>
              </tr>
              <tr>
                <td className="p-2 border-r border-slate-800 font-semibold bg-slate-50/50">Tanggal Surat</td>
                <td className="p-2">{surat.tanggalSurat}</td>
              </tr>
              <tr>
                <td className="p-2 border-r border-slate-800 font-semibold bg-slate-50/50">Tanggal Diterima</td>
                <td className="p-2">
                  <input
                    type="date"
                    value={surat.tanggalTerima || surat.tanggalSurat}
                    readOnly
                    className="bg-transparent font-medium"
                  />
                </td>
              </tr>
              <tr>
                <td className="p-2 border-r border-slate-800 font-semibold bg-slate-50/50">Asal Surat</td>
                <td className="p-2 font-semibold text-slate-900">{surat.pengirim}</td>
              </tr>
              <tr>
                <td className="p-2 border-r border-slate-800 font-semibold bg-slate-50/50">Perihal</td>
                <td className="p-2 font-bold text-slate-900">{surat.perihal}</td>
              </tr>
              <tr>
                <td className="p-2 border-r border-slate-800 font-semibold bg-slate-50/50">Klasifikasi</td>
                <td className="p-2">
                  <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">
                    {surat.klasifikasi || surat.kodeKlasifikasi || '-'}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="p-2 border-r border-slate-800 font-semibold bg-slate-50/50">Lampiran</td>
                <td className="p-2">{surat.lampiran || '1 Berkas'}</td>
              </tr>
            </tbody>
          </table>

          {/* Diteruskan Kepada & Petunjuk/Disposisi Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 border border-slate-800 divide-y md:divide-y-0 md:divide-x divide-slate-800 mb-4">
            {/* Diteruskan Kepada */}
            <div className="p-3 bg-white space-y-2">
              <div className="font-bold uppercase text-[11px] text-slate-800 pb-1 border-b border-slate-300">
                DITERUSKAN KEPADA:
              </div>
              <div className="space-y-1.5 text-xs">
                {DISPOSISI_DITERUSKAN_OPTIONS.map((opt) => {
                  const isChecked = selectedDiteruskan.includes(opt);
                  return (
                    <label
                      key={opt}
                      onClick={() => toggleDiteruskan(opt)}
                      className="flex items-center gap-2 cursor-pointer select-none hover:text-emerald-800"
                    >
                      <span className="text-emerald-700">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-emerald-700" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </span>
                      <span className={isChecked ? 'font-bold text-slate-900' : 'text-slate-700'}>
                        {opt}
                      </span>
                    </label>
                  );
                })}

                {/* Lainnya custom input */}
                <div className="pt-1">
                  <input
                    type="text"
                    placeholder="Lainnya: sebutkan nama/posisi..."
                    value={diteruskanLainnya}
                    onChange={(e) => setDiteruskanLainnya(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Petunjuk / Disposisi */}
            <div className="p-3 bg-white space-y-2">
              <div className="font-bold uppercase text-[11px] text-slate-800 pb-1 border-b border-slate-300">
                PETUNJUK / DISPOSISI:
              </div>
              <div className="space-y-1.5 text-xs">
                {DISPOSISI_PETUNJUK_OPTIONS.map((opt) => {
                  const isChecked = selectedPetunjuk.includes(opt);
                  return (
                    <label
                      key={opt}
                      onClick={() => togglePetunjuk(opt)}
                      className="flex items-center gap-2 cursor-pointer select-none hover:text-emerald-800"
                    >
                      <span className="text-emerald-700">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-emerald-700" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </span>
                      <span className={isChecked ? 'font-bold text-slate-900' : 'text-slate-700'}>
                        {opt}
                      </span>
                    </label>
                  );
                })}

                {/* Lainnya custom input */}
                <div className="pt-1">
                  <input
                    type="text"
                    placeholder="Lainnya: petunjuk khusus..."
                    value={petunjukLainnya}
                    onChange={(e) => setPetunjukLainnya(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Catatan Kepala Sekolah */}
          <div className="border border-slate-800 p-3 mb-4 rounded-xs">
            <div className="font-bold uppercase text-[11px] text-slate-800 mb-1.5">
              Catatan Kepala Sekolah:
            </div>
            <textarea
              rows={3}
              value={catatanKepsek}
              onChange={(e) => setCatatanKepsek(e.target.value)}
              placeholder="Tuliskan arahan / catatan tindak lanjut dari Kepala Sekolah..."
              className="w-full border border-slate-300 rounded p-2 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 font-sans"
            />
          </div>

          {/* Signature Block */}
          <div className="flex justify-between items-start pt-2">
            <div className="text-[11px] text-slate-500 space-y-1">
              <div>* Catatan ini bersifat kedinasan & wajib ditindaklanjuti.</div>
              <div>* Diarsipkan pada Buku Agenda Surat Masuk.</div>
            </div>

            <div className="text-center w-64">
              <div className="text-xs mb-1">
                {settings.alamatSekolah.split(',')[0] || 'Dekai'},{' '}
                <input
                  type="date"
                  value={tanggalDisposisi}
                  onChange={(e) => setTanggalDisposisi(e.target.value)}
                  className="bg-transparent border-b border-slate-400 text-xs font-semibold cursor-pointer"
                />
              </div>
              <div className="font-bold text-xs uppercase">Kepala Sekolah,</div>
              <div className="h-16 flex items-center justify-center text-slate-400 italic text-[11px]">
                (Tanda tangan & Stempel)
              </div>
              <div className="font-bold underline text-xs">{settings.namaKepsek}</div>
              <div className="text-[11px] font-mono">NIP. {settings.nipKepsek}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
