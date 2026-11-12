import React, { useState, useEffect } from 'react';
import { Teacher, TeacherAttendance, TeacherAttendanceStatus } from '../../types';
import { X, Check, Trash2, Calendar, User, FileText, Clock, Award } from 'lucide-react';

interface EditAbsenGuruModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher | null;
  attendance: TeacherAttendance | null;
  tanggal: string;
  index: number;
  onSave: (att: TeacherAttendance) => void;
  onDelete?: (id: string) => void;
  notifyMessage: (msg?: string) => void;
}

export const EditAbsenGuruModal: React.FC<EditAbsenGuruModalProps> = ({
  isOpen,
  onClose,
  teacher,
  attendance,
  tanggal,
  index,
  onSave,
  onDelete,
  notifyMessage
}) => {
  const [status, setStatus] = useState<TeacherAttendanceStatus>('Hadir');
  const [catatan, setCatatan] = useState('');
  const [jamKehadiran, setJamKehadiran] = useState('07.15 - 13.30');

  useEffect(() => {
    if (attendance) {
      setStatus(attendance.keterangan || 'Hadir');
      setCatatan(attendance.catatan || '');
    } else {
      setStatus('Hadir');
      setCatatan('');
      setJamKehadiran('07.15 - 13.30');
    }
  }, [attendance, teacher, isOpen]);

  if (!isOpen || !teacher) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedRecord: TeacherAttendance = {
      id: attendance ? attendance.id : `att-t-${Date.now()}-${teacher.id}`,
      no: index + 1,
      tanggal,
      nama: teacher.nama,
      guruKelas: `${teacher.jabatan} (${teacher.statusKepegawaian})`,
      keterangan: status,
      catatan: catatan.trim()
    };

    onSave(updatedRecord);
    notifyMessage(`Presensi ${teacher.nama} Berhasil Disimpan (${status})`);
    onClose();
  };

  const handleDelete = () => {
    if (attendance && onDelete) {
      onDelete(attendance.id);
      notifyMessage(`Data presensi ${teacher.nama} dihapus`);
      onClose();
    }
  };

  const quickNotes = [
    'Mengajar tatap muka sesuai jadwal',
    'Tugas piket sekolah & apel pagi',
    'Dinas luar ke Dinas Pendidikan Pegunungan Bintang',
    'Mengikuti pelatihan Kurikulum Merdeka / KKG',
    'Izin sakit (surat terlampir)',
    'Cuti resmi yang telah disetujui',
    'Pembinaan peserta didik'
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 no-print animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
              {teacher.foto && teacher.foto.trim() ? (
                <img
                  src={teacher.foto}
                  alt={teacher.nama}
                  className="w-full h-full rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="w-5 h-5 text-emerald-300" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Edit Presensi Guru & Tendik</h3>
              <p className="text-xs text-emerald-200">
                {teacher.nama} • {teacher.jabatan}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2 text-slate-700">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span className="font-semibold">Tanggal Presensi:</span>
              <span className="font-bold text-slate-900">{tanggal}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>NIP:</span>
              <span className="font-mono font-bold text-slate-800">{teacher.nip || '-'}</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                {teacher.statusKepegawaian}
              </span>
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
              Status Kehadiran Guru & Tenaga Kependidikan
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(
                [
                  { id: 'Hadir', label: 'Hadir', color: 'emerald', code: 'H' },
                  { id: 'Izin', label: 'Izin', color: 'blue', code: 'I' },
                  { id: 'Sakit', label: 'Sakit', color: 'amber', code: 'S' },
                  { id: 'Cuti', label: 'Cuti', color: 'purple', code: 'C' },
                  { id: 'Alpa', label: 'Alpa', color: 'rose', code: 'A' }
                ] as const
              ).map((item) => {
                const isSelected = status === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setStatus(item.id)}
                    className={`py-2.5 px-1.5 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border-2 transition-all cursor-pointer ${
                      isSelected
                        ? item.id === 'Hadir'
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-md scale-102'
                          : item.id === 'Izin'
                          ? 'bg-blue-600 text-white border-blue-700 shadow-md scale-102'
                          : item.id === 'Sakit'
                          ? 'bg-amber-600 text-white border-amber-700 shadow-md scale-102'
                          : item.id === 'Cuti'
                          ? 'bg-purple-600 text-white border-purple-700 shadow-md scale-102'
                          : 'bg-rose-600 text-white border-rose-700 shadow-md scale-102'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-sm font-black">{item.code}</span>
                    <span className="text-[11px]">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Jam Kehadiran */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-700" />
              Jam Hadir / Dinas
            </label>
            <input
              type="text"
              value={jamKehadiran}
              onChange={(e) => setJamKehadiran(e.target.value)}
              placeholder="07.15 - 13.30"
              className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>

          {/* Catatan / Keterangan Tugas */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-emerald-700" />
                Catatan Tugas / Materi Mengajar / Alasan
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Opsional</span>
            </label>
            <textarea
              rows={3}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Mengajar IPAS dan Matematika Kelas IV, koordinasi tugas piket..."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />

            {/* Quick Notes Selector */}
            <div className="mt-2">
              <span className="text-[10px] text-slate-500 font-medium block mb-1">
                Pilih Keterangan Cepat:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickNotes.map((note) => (
                  <button
                    key={note}
                    type="button"
                    onClick={() => setCatatan(note)}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 transition-colors"
                  >
                    + {note}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            {attendance && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Data</span>
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
