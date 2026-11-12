import React, { useState } from 'react';
import { Lock, User, ShieldCheck, School, KeyRound, Sparkles, AlertCircle } from 'lucide-react';

interface LoginModalProps {
  onSuccess?: (username: string) => void;
  onLoginSuccess?: (username: string) => void;
  isOnline?: boolean;
  onToggleOnline?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  onSuccess,
  onLoginSuccess,
  isOnline = false,
  onToggleOnline
}) => {
  const [username, setUsername] = useState('SelNab');
  const [password, setPassword] = useState('1230');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === 'SelNab' && password.trim() === '1230') {
      setError('');
      const trimmedUser = username.trim();
      if (typeof onSuccess === 'function') {
        onSuccess(trimmedUser);
      }
      if (typeof onLoginSuccess === 'function') {
        onLoginSuccess(trimmedUser);
      }
    } else {
      setError('UserNama atau Password salah! (UserNama: SelNab, Password: 1230)');
    }
  };

  const handleFillCredentials = () => {
    setUsername('SelNab');
    setPassword('1230');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 p-6 text-white text-center relative">
          <div className="w-16 h-16 bg-white/10 rounded-2xl border border-white/20 flex items-center justify-center mx-auto mb-3 backdrop-blur-md shadow-inner">
            <School className="w-9 h-9 text-emerald-300" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">
            SISTEM ADMINISTRASI TATA USAHA
          </h2>
          <p className="text-emerald-200 text-xs mt-1 font-medium">
            Standar Dapodik &bull; Khusus Sekolah Pedalaman Papua
          </p>

          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={onToggleOnline}
              className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                isOnline
                  ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                  : 'bg-amber-400 text-slate-950 border-amber-200'
              }`}
            >
              {isOnline ? '🟢 Mode Online Aktif' : '🟠 Mode Offline (Papua Pedalaman)'}
            </button>
          </div>
        </div>

        {/* Developer Badge with Photo */}
        <div className="bg-emerald-50 px-6 py-2.5 border-b border-emerald-100 flex items-center justify-between text-xs text-emerald-900 font-medium">
          <div className="flex items-center gap-2">
            <img
              src="/foto_pengembang.jpg"
              alt="Selpius Nabyal"
              referrerPolicy="no-referrer"
              className="w-7 h-7 rounded-full object-cover border border-amber-400 shadow-xs"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="text-emerald-800 font-bold">Selpius Nabyal, S.Pd.Gr.</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-emerald-200 text-emerald-800 rounded font-medium">
              Guru SD
            </span>
          </div>
          <span className="text-[11px] text-emerald-700 italic hidden sm:inline">
            "Mengajar dan Melayani Tanpa Mengharapkan Imbalan"
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleLogin} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700 font-medium animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              UserNama
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan UserNama (SelNab)"
                required
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan Password (1230)"
                required
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent font-medium tracking-wider"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleFillCredentials}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 hover:underline"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Isi Otomatis (SelNab / 1230)
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 text-sm mt-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Masuk ke Sistem Tata Usaha</span>
          </button>
        </form>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-center text-[11px] text-slate-500">
          <p>Kontak Pengembang: 0821993391 | Keleyalakelena123093@gmail.com</p>
        </div>
      </div>
    </div>
  );
};
