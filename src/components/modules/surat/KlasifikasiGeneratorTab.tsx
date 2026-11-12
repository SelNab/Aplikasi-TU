import React, { useState } from 'react';
import {
  KLASIFIKASI_SURAT_000_030,
  KLASIFIKASI_SUBJEK,
  DAFTAR_SURAT_GURU,
  DAFTAR_SURAT_SISWA,
  DAFTAR_SURAT_SEKOLAH
} from './persuratanData';
import { SchoolSettings } from '../../../types';
import { Hash, Copy, Check, Sparkles, BookOpen, Users, GraduationCap, Building2 } from 'lucide-react';

interface KlasifikasiGeneratorTabProps {
  settings: SchoolSettings;
  notifyMessage: (msg?: string) => void;
}

export const KlasifikasiGeneratorTab: React.FC<KlasifikasiGeneratorTabProps> = ({
  settings,
  notifyMessage
}) => {
  // Generator State
  const [noUrut, setNoUrut] = useState('001');
  const [kodeSekolah, setKodeSekolah] = useState('SD-BL');
  const [subjekKode, setSubjekKode] = useState('PEG');
  const [bulanRomawi, setBulanRomawi] = useState('VII');
  const [tahun, setTahun] = useState('2026');
  const [copied, setCopied] = useState(false);

  // Active Sub-view for References
  const [activeSubTab, setActiveSubTab] = useState<'generator' | 'guru' | 'siswa' | 'sekolah' | 'kode000' | 'subjek'>(
    'generator'
  );

  const generatedNomorSurat = `${noUrut}/${kodeSekolah}/${subjekKode}/${bulanRomawi}/${tahun}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedNomorSurat);
    setCopied(true);
    notifyMessage(`Nomor surat disalin: ${generatedNomorSurat}`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Sub Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveSubTab('generator')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
            activeSubTab === 'generator'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
          }`}
        >
          <Hash className="w-3.5 h-3.5" />
          <span>Generator Nomor Surat</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('guru')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
            activeSubTab === 'guru'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>17 Surat Guru</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('siswa')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
            activeSubTab === 'siswa'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>17 Surat Siswa</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('sekolah')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
            activeSubTab === 'sekolah'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>20 Surat Sekolah</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('kode000')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
            activeSubTab === 'kode000'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Klasifikasi 000-030</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('subjek')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
            activeSubTab === 'subjek'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Subjek (PEG/SIS/KUR/SAR/KEU)</span>
        </button>
      </div>

      {/* GENERATOR VIEW */}
      {activeSubTab === 'generator' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Hash className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">N. Sistem Kode & Generator Nomor Surat Otomatis</h3>
              <p className="text-xs text-slate-500">Format Baku Tata Naskah Dinas: [Nomor Urut] / [Kode Sekolah] / [Klasifikasi] / [Bulan Romawi] / [Tahun]</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-4">
            <div>
              <label className="font-semibold text-xs text-slate-700 block mb-1">Nomor Urut</label>
              <input
                type="text"
                value={noUrut}
                onChange={(e) => setNoUrut(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-center focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-xs text-slate-700 block mb-1">Kode Sekolah</label>
              <input
                type="text"
                value={kodeSekolah}
                onChange={(e) => setKodeSekolah(e.target.value)}
                placeholder="SD-BL"
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-center focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-xs text-slate-700 block mb-1">Subjek / Klasifikasi</label>
              <select
                value={subjekKode}
                onChange={(e) => setSubjekKode(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold cursor-pointer focus:border-emerald-600 focus:outline-none"
              >
                <option value="PEG">PEG (Kepegawaian)</option>
                <option value="SIS">SIS (Kesiswaan)</option>
                <option value="KUR">KUR (Kurikulum)</option>
                <option value="SAR">SAR (Sarana Prasarana)</option>
                <option value="KEU">KEU (Keuangan / BOS)</option>
                <option value="UND">UND (Undangan)</option>
                <option value="ADM">ADM (Administrasi)</option>
                <option value="SK">SK (Surat Keputusan)</option>
                <option value="MUT">MUT (Mutasi Siswa)</option>
                <option value="ST">ST (Surat Tugas)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-xs text-slate-700 block mb-1">Bulan Romawi</label>
              <select
                value={bulanRomawi}
                onChange={(e) => setBulanRomawi(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold cursor-pointer focus:border-emerald-600 focus:outline-none"
              >
                {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'].map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-xs text-slate-700 block mb-1">Tahun</label>
              <input
                type="text"
                value={tahun}
                onChange={(e) => setTahun(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-center focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Generated Result Box */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Hasil Format Nomor Surat:</span>
              <span className="text-lg font-black font-mono text-emerald-950">{generatedNomorSurat}</span>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin Nomor Surat'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 17 SURAT GURU */}
      {activeSubTab === 'guru' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-3 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
            <h4 className="font-bold text-xs uppercase text-slate-800">H. Daftar Jenis Surat Sekolah untuk Guru / Tenaga Pendidik (17 Jenis)</h4>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">17 Format Standar</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 uppercase font-semibold">
                <tr>
                  <th className="p-2.5 w-12 text-center">No</th>
                  <th className="p-2.5">Nama Jenis Surat</th>
                  <th className="p-2.5 w-28 text-center">Kode Surat</th>
                  <th className="p-2.5 w-32">Kategori</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {DAFTAR_SURAT_GURU.map(item => (
                  <tr key={item.no} className="hover:bg-slate-50/70">
                    <td className="p-2.5 text-center font-bold text-slate-500">{item.no}</td>
                    <td className="p-2.5 font-semibold text-slate-900">{item.nama}</td>
                    <td className="p-2.5 text-center">
                      <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-300 text-emerald-800">
                        {item.kode}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-600">{item.kategori}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 17 SURAT SISWA */}
      {activeSubTab === 'siswa' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-3 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
            <h4 className="font-bold text-xs uppercase text-slate-800">I. Daftar Jenis Surat untuk Siswa / Peserta Didik (17 Jenis)</h4>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">17 Format Standar</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 uppercase font-semibold">
                <tr>
                  <th className="p-2.5 w-12 text-center">No</th>
                  <th className="p-2.5">Nama Jenis Surat</th>
                  <th className="p-2.5 w-28 text-center">Kode Surat</th>
                  <th className="p-2.5 w-32">Kategori</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {DAFTAR_SURAT_SISWA.map(item => (
                  <tr key={item.no} className="hover:bg-slate-50/70">
                    <td className="p-2.5 text-center font-bold text-slate-500">{item.no}</td>
                    <td className="p-2.5 font-semibold text-slate-900">{item.nama}</td>
                    <td className="p-2.5 text-center">
                      <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-300 text-teal-800">
                        {item.kode}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-600">{item.kategori}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 20 SURAT KEPENTINGAN SEKOLAH */}
      {activeSubTab === 'sekolah' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-3 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
            <h4 className="font-bold text-xs uppercase text-slate-800">J. Daftar Jenis Surat untuk Kepentingan Sekolah (20 Jenis)</h4>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">20 Format Standar</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 uppercase font-semibold">
                <tr>
                  <th className="p-2.5 w-12 text-center">No</th>
                  <th className="p-2.5">Nama Jenis Surat</th>
                  <th className="p-2.5 w-28 text-center">Kode Surat</th>
                  <th className="p-2.5 w-32">Kategori</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {DAFTAR_SURAT_SEKOLAH.map(item => (
                  <tr key={item.no} className="hover:bg-slate-50/70">
                    <td className="p-2.5 text-center font-bold text-slate-500">{item.no}</td>
                    <td className="p-2.5 font-semibold text-slate-900">{item.nama}</td>
                    <td className="p-2.5 text-center">
                      <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-300 text-blue-800">
                        {item.kode}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-600">{item.kategori}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* KLASIFIKASI 000 - 030 */}
      {activeSubTab === 'kode000' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-3 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
            <h4 className="font-bold text-xs uppercase text-slate-800">K. Klasifikasi Surat Sekolah (Kode 000 s.d 030)</h4>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">Standar Kearsipan Nasional</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 uppercase font-semibold">
                <tr>
                  <th className="p-2.5 w-20 text-center">Kode</th>
                  <th className="p-2.5 w-48">Klasifikasi</th>
                  <th className="p-2.5">Contoh Perihal / Penggunaan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {KLASIFIKASI_SURAT_000_030.map(item => (
                  <tr key={item.kode} className="hover:bg-slate-50/70">
                    <td className="p-2.5 text-center">
                      <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-300 text-slate-800">
                        {item.kode}
                      </span>
                    </td>
                    <td className="p-2.5 font-bold text-slate-900">{item.klasifikasi}</td>
                    <td className="p-2.5 text-slate-600">{item.contoh}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* KLASIFIKASI SUBJEK */}
      {activeSubTab === 'subjek' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-3 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
            <h4 className="font-bold text-xs uppercase text-slate-800">L. Klasifikasi Khusus Berdasarkan Subjek (PEG, SIS, KUR, SAR, KEU)</h4>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">5 Bidang Pokok</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 uppercase font-semibold">
                <tr>
                  <th className="p-2.5 w-24 text-center">Kode</th>
                  <th className="p-2.5">Uraian Klasifikasi Subjek</th>
                  <th className="p-2.5 w-32 text-center">Subjek Pokok</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {KLASIFIKASI_SUBJEK.map(item => (
                  <tr key={item.kode} className="hover:bg-slate-50/70">
                    <td className="p-2.5 text-center">
                      <span className="font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-emerald-800">
                        {item.kode}
                      </span>
                    </td>
                    <td className="p-2.5 font-semibold text-slate-900">{item.nama}</td>
                    <td className="p-2.5 text-center">
                      <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {item.subjek}
                      </span>
                    </td>
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
