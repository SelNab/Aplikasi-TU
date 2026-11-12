import React, { useState, useEffect } from 'react';
import { Student, StudentAttendance, AttendanceStatus } from '../../types';
import { X, Check, Trash2, Calendar, User, FileText, AlertCircle } from 'lucide-react';

interface EditAbsenSiswaModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  attendance: StudentAttendance | null;
  tanggal: string;
  kelas: string;
  rombel: string;
  onSave: (att: StudentAttendance) => void;
  onDelete?: (id: string) => void;
  notifyMessage: (msg?: string) => void;
}

export const EditAbsenSiswaModal: React.FC<EditAbsenSiswaModalProps> = ({
  isOpen,
  onClose,
  student,
  attendance,
  tanggal,
  kelas,
  rombel,
  onSave,
  onDelete,
  notifyMessage
}) => {
  const [status, setStatus] = useState<AttendanceStatus>('Hadir');
  const [catatan, setCatatan] = useState('');

  useEffect(() => {
    if (attendance) {
      setStatus(attendance.keterangan || 'Hadir');
      setCatatan(attendance.catatan || '');
    } else {
      setStatus('Hadir');
      setCatatan('');
    }
  }, [attendance, student, isOpen]);

  if (!isOpen || !student) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedRecord: StudentAttendance = {
      id: attendance ? attendance.id : `att-s-${Date.now()}-${student.id}`,
      tanggal,
      kelas,
      rombel: student.rombel || rombel,
      namaSiswa: student.namaSiswa,
      namaPanggilan: student.namaPanggilan,
      jenisKelamin: student.jenisKelamin,
      agama: student.agama,
      foto: student.foto,
      keterangan: status,
      catatan: catatan.trim()
    };

    onSave(updatedRecord);
    notifyMessage(`Presensi ${student.namaSiswa} Berhasil Disimpan (${status})`);
    onClose();
  };

  const handleDelete = () => {
    if (attendance && onDelete) {
      onDelete(attendance.id);
      notifyMessage(`Data presensi ${student.namaSiswa} dihapus`);
      onClose();
    }
  };

  const quickNotes = [
    'Hadir tepat waktu',
    'Sakit demam / flu',
    'Izin keperluan keluarga',
    'Izin acara adat / duka',
    'Dispensasi kegiatan lomba sekolah',
    'Tanpa keterangan / belum ada kabar'
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 no-print animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
              {student.foto && student.foto.trim() ? (
                <img
                  src={student.foto}
                  alt={student.namaSiswa}
                  className="w-full h-full rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="w-5 h-5 text-emerald-200" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Edit Presensi Siswa</h3>
              <p className="text-xs text-emerald-100">
                {student.namaSiswa} ({student.jenisKelamin}) • Kelas {kelas}
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
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex items-center justify-between text-slate-700">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span className="font-semibold">Tanggal Presensi:</span>
              <span className="font-bold text-slate-900">{tanggal}</span>
            </div>
            <div className="text-slate-500">
              NISN: <span className="font-mono font-bold text-slate-700">{student.nisn || '-'}</span>
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
              Status Kehadiran Siswa
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(
                [
                  { id: 'Hadir', label: 'Hadir', color: 'emerald', code: 'H' },
                  { id: 'Izin', label: 'Izin', color: 'blue', code: 'I' },
                  { id: 'Sakit', label: 'Sakit', color: 'amber', code: 'S' },
                  { id: 'Alpa', label: 'Alpa (A)', color: 'rose', code: 'A' }
                ] as const
              ).map((item) => {
                const isSelected = status === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setStatus(item.id)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border-2 transition-all cursor-pointer ${
                      isSelected
                        ? item.id === 'Hadir'
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-md scale-102'
                          : item.id === 'Izin'
                          ? 'bg-blue-600 text-white border-blue-700 shadow-md scale-102'
                          : item.id === 'Sakit'
                          ? 'bg-amber-600 text-white border-amber-700 shadow-md scale-102'
                          : 'bg-rose-600 text-white border-rose-700 shadow-md scale-102'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-sm font-black">{item.code}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Catatan / Keterangan Khusus */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-emerald-700" />
                Catatan / Alasan Kehadiran
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Opsional</span>
            </label>
            <textarea
              rows={3}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Sakit flu sejak kemarin, surat izin terlampir dari orang tua..."
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
