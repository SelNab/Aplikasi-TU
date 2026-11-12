import React, { useState, useEffect } from 'react';
import {
  Cloud,
  CloudCheck,
  CloudOff,
  RefreshCw,
  LogIn,
  LogOut,
  FolderSync,
  ShieldCheck,
  FileCheck,
  Download,
  Trash2,
  ExternalLink,
  Wifi,
  WifiOff,
  AlertCircle,
  Clock
} from 'lucide-react';
import { SchoolSettings } from '../types';
import {
  initAuth,
  googleSignIn,
  googleSignOut,
  getAccessToken
} from '../utils/googleAuth';
import {
  uploadBackupToDrive,
  listDriveBackups,
  downloadBackupFromDrive,
  deleteBackupFromDrive,
  DriveBackupFile
} from '../utils/googleDriveService';
import { User } from 'firebase/auth';

interface GoogleDriveSyncProps {
  settings: SchoolSettings;
  onUpdateSettings: (newSettings: SchoolSettings) => void;
  onRestoreData: (importedData: any) => void;
  getDatabasePayload: () => Record<string, unknown>;
  notifyMessage: (msg?: string) => void;
  isOnline: boolean;
}

export const GoogleDriveSyncCard: React.FC<GoogleDriveSyncProps> = ({
  settings,
  onUpdateSettings,
  onRestoreData,
  getDatabasePayload,
  notifyMessage,
  isOnline
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isLoadingBackups, setIsLoadingBackups] = useState<boolean>(false);
  const [backups, setBackups] = useState<DriveBackupFile[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmRestoreId, setConfirmRestoreId] = useState<string | null>(null);

  // Initialize Auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setHasToken(!!token);
        if (currentUser?.email && currentUser.email !== settings.googleDriveUserEmail) {
          onUpdateSettings({
            ...settings,
            googleDriveUserEmail: currentUser.email
          });
        }
      },
      () => {
        setUser(null);
        setHasToken(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch backups list if connected
  const refreshBackupList = async () => {
    if (!user || !hasToken) return;
    setIsLoadingBackups(true);
    try {
      const list = await listDriveBackups();
      setBackups(list);
    } catch (err: any) {
      console.warn('Gagal memuat list backup Drive:', err);
    } finally {
      setIsLoadingBackups(false);
    }
  };

  useEffect(() => {
    if (user && hasToken && isOnline) {
      refreshBackupList();
    }
  }, [user, hasToken, isOnline]);

  const handleSignIn = async () => {
    if (!isOnline) {
      notifyMessage('Tidak ada koneksi internet. Aktifkan internet untuk menghubungkan Google Drive.');
      return;
    }
    setIsSigningIn(true);
    setStatusMessage('');
    try {
      const result = await googleSignIn();
      setUser(result.user);
      setHasToken(true);
      const updated = {
        ...settings,
        googleDriveSyncEnabled: true,
        googleDriveUserEmail: result.user.email || ''
      };
      onUpdateSettings(updated);
      notifyMessage(`Terhubung dengan Google Drive: ${result.user.email}`);
      // Refresh list
      const list = await listDriveBackups();
      setBackups(list);
    } catch (err: any) {
      console.error('Sign-in failed:', err);
      setStatusMessage(err.message || 'Gagal masuk dengan Google');
      notifyMessage('Gagal otentikasi Google Drive');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    if (typeof window !== 'undefined' && !window.confirm('Putuskan integrasi Google Drive dari aplikasi ini?')) {
      return;
    }
    await googleSignOut();
    setUser(null);
    setHasToken(false);
    setBackups([]);
    onUpdateSettings({
      ...settings,
      googleDriveSyncEnabled: false,
      googleDriveUserEmail: ''
    });
    notifyMessage('Koneksi Google Drive diputuskan');
  };

  const handleManualSyncNow = async () => {
    if (!isOnline) {
      notifyMessage('Gagal sinkronisasi: Tidak ada sinyal internet.');
      return;
    }
    if (!user || !hasToken) {
      handleSignIn();
      return;
    }

    setIsSyncing(true);
    setStatusMessage('Mengunggah cadangan database ke Google Drive...');
    try {
      const payload = getDatabasePayload();
      const result = await uploadBackupToDrive(payload, settings.namaSekolah);
      const nowIso = new Date().toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });

      onUpdateSettings({
        ...settings,
        googleDriveLastSync: nowIso
      });

      setStatusMessage('');
      notifyMessage(`Database Berhasil Disinkronkan ke Google Drive (${result.fileName})`);
      await refreshBackupList();
    } catch (err: any) {
      console.error('Sync error:', err);
      setStatusMessage(`Gagal sinkronisasi: ${err.message || 'Kesalahan jaringan'}`);
      notifyMessage('Gagal sinkronisasi ke Google Drive');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRestoreFromDrive = async (file: DriveBackupFile) => {
    setIsSyncing(true);
    setStatusMessage(`Memulihkan data dari ${file.name}...`);
    try {
      const data = await downloadBackupFromDrive(file.id);
      onRestoreData(data);
      setConfirmRestoreId(null);
      setStatusMessage('');
      notifyMessage('Data Anda Berhasil Dipulihkan dari Google Drive');
    } catch (err: any) {
      console.error('Restore error:', err);
      setStatusMessage(`Gagal memulihkan data: ${err.message}`);
      notifyMessage('Gagal memulihkan data cadangan');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteBackup = async (fileId: string) => {
    try {
      await deleteBackupFromDrive(fileId);
      setConfirmDeleteId(null);
      notifyMessage('File cadangan di Google Drive berhasil dihapus');
      await refreshBackupList();
    } catch (err: any) {
      console.error('Delete error:', err);
      notifyMessage(`Gagal menghapus file: ${err.message}`);
    }
  };

  const handleToggleAutoSync = (enabled: boolean) => {
    onUpdateSettings({
      ...settings,
      googleDriveAutoSync: enabled
    });
    notifyMessage(enabled ? 'Sinkronisasi Otomatis Diaktifkan' : 'Sinkronisasi Otomatis Dinonaktifkan');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-xs space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <Cloud className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 uppercase flex items-center gap-1.5 text-xs">
              Integrasi Google Drive
              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-blue-100 text-blue-800 border border-blue-200">
                Online Backup
              </span>
            </h3>
            <p className="text-[10px] text-slate-500">
              Cadangan online otomatis saat laptop/HP terhubung internet
            </p>
          </div>
        </div>

        {/* Network Badge */}
        <div className="flex items-center gap-1">
          {isOnline ? (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
              <Wifi className="w-3 h-3" /> Online
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
              <WifiOff className="w-3 h-3" /> Offline (Tersimpan Lokal)
            </span>
          )}
        </div>
      </div>

      {/* Connection Card */}
      {!user || !hasToken ? (
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5">
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Hubungkan akun Google Anda untuk mengaktifkan sinkronisasi otomatis database sekolah ke Google Drive. Cadangan disimpan dengan aman di folder khusus <strong>"Backup_TU_Papua_Dekai"</strong>.
          </p>

          <button
            type="button"
            onClick={handleSignIn}
            disabled={isSigningIn || !isOnline}
            className={`w-full py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-2 text-xs transition-all shadow-sm ${
              isOnline
                ? 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 hover:border-slate-400'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
            }`}
          >
            {isSigningIn ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                <span>Menghubungkan ke Google...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Hubungkan Akun Google Drive</span>
              </>
            )}
          </button>

          {!isOnline && (
            <p className="text-[10px] text-amber-700 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3 h-3" />
              Perangkat saat ini sedang offline. Data tetap aman di penyimpanan lokal dan flashdisk.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {/* User Active Status */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs uppercase shadow-xs">
                {user.email ? user.email.charAt(0) : 'G'}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-800 text-[11px]">{user.displayName || 'Akun Google'}</span>
                  <span className="text-[9px] bg-emerald-200 text-emerald-800 px-1 py-0.2 rounded font-bold">
                    Aktif
                  </span>
                </div>
                <span className="text-[10px] text-slate-600 font-mono block">{user.email}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="px-2 py-1 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded text-[10px] font-bold flex items-center gap-1 shadow-2xs"
            >
              <LogOut className="w-3 h-3" /> Putuskan
            </button>
          </div>

          {/* Sync Controls */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block text-[11px]">
                  Sinkronisasi Otomatis Saat Online
                </span>
                <span className="text-[10px] text-slate-500">
                  Cadangkan database otomatis begitu laptop/HP mendeteksi sinyal internet
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.googleDriveAutoSync ?? true}
                  onChange={(e) => handleToggleAutoSync(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* Last Sync Info */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-600">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Terakhir Sinkron:
              </span>
              <span className="font-semibold text-slate-800">
                {settings.googleDriveLastSync || 'Belum pernah disinkronkan'}
              </span>
            </div>

            {/* Manual Sync Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleManualSyncNow}
                disabled={isSyncing || !isOnline}
                className={`w-full py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 shadow-sm text-xs text-white ${
                  isOnline
                    ? 'bg-emerald-700 hover:bg-emerald-800'
                    : 'bg-slate-400 cursor-not-allowed'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Sedang Menyinkronkan...' : 'Sinkronkan Database ke Drive Sekarang'}</span>
              </button>
            </div>

            {statusMessage && (
              <p className="text-[10px] text-emerald-800 bg-emerald-50 p-2 rounded border border-emerald-200 font-medium">
                {statusMessage}
              </p>
            )}
          </div>

          {/* Drive Backups History & Restore */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 text-[11px] flex items-center gap-1">
                <FolderSync className="w-3.5 h-3.5 text-blue-600" />
                Daftar Cadangan di Google Drive ({backups.length})
              </span>
              <button
                type="button"
                onClick={refreshBackupList}
                disabled={isLoadingBackups || !isOnline}
                className="text-[10px] text-blue-700 hover:text-blue-900 font-bold flex items-center gap-0.5"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingBackups ? 'animate-spin' : ''}`} />
                Perbarui
              </button>
            </div>

            {isLoadingBackups ? (
              <div className="p-3 text-center text-slate-400 text-[11px]">
                Memuat daftar cadangan dari Google Drive...
              </div>
            ) : backups.length === 0 ? (
              <div className="p-3 text-center bg-slate-50 rounded-lg border border-slate-200 text-slate-500 text-[10px]">
                Belum ada cadangan di Google Drive. Klik tombol <strong>"Sinkronkan Database ke Drive Sekarang"</strong> di atas untuk membuat cadangan pertama.
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {backups.map((file) => (
                  <div
                    key={file.id}
                    className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-between transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="font-bold text-slate-800 block truncate text-[11px]">
                        {file.name}
                      </span>
                      <span className="text-[9px] text-slate-500">
                        Diperbarui: {new Date(file.modifiedTime).toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Restore Button */}
                      {confirmRestoreId === file.id ? (
                        <div className="flex items-center gap-1 bg-amber-50 p-1 rounded border border-amber-300">
                          <span className="text-[9px] font-bold text-amber-800">Pulihkan?</span>
                          <button
                            type="button"
                            onClick={() => handleRestoreFromDrive(file)}
                            className="px-1.5 py-0.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded text-[9px]"
                          >
                            Ya
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmRestoreId(null)}
                            className="px-1.5 py-0.5 bg-slate-200 text-slate-700 font-bold rounded text-[9px]"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmRestoreId(file.id)}
                          title="Pulihkan database dari file ini"
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded text-[10px] font-bold flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" /> Pulihkan
                        </button>
                      )}

                      {/* Delete Button with Confirmation Requirement */}
                      {confirmDeleteId === file.id ? (
                        <div className="flex items-center gap-1 bg-rose-50 p-1 rounded border border-rose-300">
                          <span className="text-[9px] font-bold text-rose-800">Hapus?</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteBackup(file.id)}
                            className="px-1.5 py-0.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded text-[9px]"
                          >
                            Ya
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-1.5 py-0.5 bg-slate-200 text-slate-700 font-bold rounded text-[9px]"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(file.id)}
                          title="Hapus cadangan ini dari Google Drive"
                          className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Security note */}
      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[10px] text-slate-600 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <p className="leading-normal">
          <strong>Keamanan Data:</strong> Berkas cadangan dienkripsi sesuai standar Google Drive dengan cakupan terbatas (hanya dapat melihat dan mengelola file cadangan yang dibuat oleh aplikasi ini).
        </p>
      </div>
    </div>
  );
};
