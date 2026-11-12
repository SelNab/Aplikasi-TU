/**
 * Aplikasi Administrasi Tata Usaha Sekolah Pedalaman Papua
 * Pengembang: Selpius Nabyal, S.Pd.Gr. Guru SD
 * Login: SelNab / 1230
 */

import React, { useState, useEffect } from 'react';
import {
  Student,
  Teacher,
  StudentAttendance,
  TeacherAttendance,
  SuratDocument,
  AtkItem,
  Book,
  BookBorrowing,
  SarprasItem,
  FinanceRecord,
  SchoolSettings,
  JadwalPiketItem,
  JadwalPelajaranItem,
  KurikulumDocument,
  MataPelajaran,
  KalenderAkademikItem,
  AppDisplaySize,
  ProfilSekolahData
} from './types';
import {
  initialStudents,
  initialTeachers,
  initialStudentAttendances,
  initialTeacherAttendances,
  initialSuratList,
  initialAtkItems,
  initialBooks,
  initialBookBorrowings,
  initialSarpras,
  initialFinanceRecords,
  initialSchoolSettings,
  initialJadwalPiket,
  initialJadwalPelajaran,
  initialKurikulum,
  initialMataPelajaran,
  initialKalenderAkademik,
  initialProfilSekolah
} from './data/initialData';
import { SchoolHeader } from './components/SchoolHeader';
import { NavigationMenu, MainTab } from './components/NavigationMenu';
import { LoginModal } from './components/LoginModal';
import { SiswaModule } from './components/modules/SiswaModule';
import { AbsenSiswaModule } from './components/modules/AbsenSiswaModule';
import { GuruModule } from './components/modules/GuruModule';
import { AbsenGuruModule } from './components/modules/AbsenGuruModule';
import { JadwalPiketModule } from './components/modules/JadwalPiketModule';
import { JadwalPelajaranModule } from './components/modules/JadwalPelajaranModule';
import { KurikulumModule } from './components/modules/KurikulumModule';
import { KalenderAkademikModule } from './components/modules/KalenderAkademikModule';
import { SuratModule } from './components/modules/SuratModule';
import { AtkModule } from './components/modules/AtkModule';
import { PerpustakaanModule } from './components/modules/PerpustakaanModule';
import { SarprasModule } from './components/modules/SarprasModule';
import { KeuanganModule } from './components/modules/KeuanganModule';
import { LaporanModule } from './components/modules/LaporanModule';
import { IdCardModule } from './components/modules/IdCardModule';
import { ArsipModule } from './components/modules/ArsipModule';
import { ProfilSekolahModule } from './components/modules/ProfilSekolahModule';
import { PengaturanModule } from './components/modules/PengaturanModule';
import { ProfilPengembangModule } from './components/modules/ProfilPengembangModule';
import { ErrorBoundary } from './components/ErrorBoundary';
import { exportDatabaseToUSB, importDatabaseFromUSB, safeConfirm } from './utils/exportHelpers';
import {
  syncSchoolDataToFirebase,
  loadLatestFirebaseData,
  FirebaseSyncPayload
} from './utils/firebaseSync';
import { CheckCircle2, ShieldCheck, Wifi, WifiOff, Layers, LogOut } from 'lucide-react';
import { RightActionPanel } from './components/RightActionPanel';
import { useActionToolbar } from './context/ActionToolbarContext';

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch (err) {
    console.warn(`Gagal memuat penyimpanan lokal untuk kunci ${key}:`, err);
    return fallback;
  }
}

function safeSetStorage(key: string, value: any) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Gagal menyimpan ke penyimpanan lokal untuk kunci ${key}:`, err);
  }
}

export default function App() {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('selnab_logged_in') === 'true';
    } catch {
      return false;
    }
  });

  const { isRightPanelOpen, setIsRightPanelOpen } = useActionToolbar();

  // Active Menu Tab
  const [activeTab, setActiveTab] = useState<MainTab>('siswa');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isSyncingFirebase, setIsSyncingFirebase] = useState<boolean>(false);

  // App Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // In-App Logout Confirmation Modal State
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  // Developer Profile Lock State (Protected by Developer Key: 123093)
  const [isDevProfileUnlocked, setIsDevProfileUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('tusekolah_dev_profile_unlocked') === 'true';
    } catch {
      return false;
    }
  });

  const handleUnlockDevProfile = () => {
    setIsDevProfileUnlocked(true);
    try {
      sessionStorage.setItem('tusekolah_dev_profile_unlocked', 'true');
    } catch (e) {
      console.error(e);
    }
  };

  const handleLockDevProfile = () => {
    setIsDevProfileUnlocked(false);
    try {
      sessionStorage.removeItem('tusekolah_dev_profile_unlocked');
    } catch (e) {
      console.error(e);
    }
  };

  // Settings State
  const [settings, setSettings] = useState<SchoolSettings>(() => {
    return loadStorage<SchoolSettings>('selnab_settings', initialSchoolSettings);
  });

  // Entity States with Local Storage Persistence (Offline-First)
  const [students, setStudents] = useState<Student[]>(() => {
    return loadStorage<Student[]>('selnab_students', initialStudents);
  });

  const [studentAttendances, setStudentAttendances] = useState<StudentAttendance[]>(() => {
    return loadStorage<StudentAttendance[]>('selnab_att_students', initialStudentAttendances);
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    return loadStorage<Teacher[]>('selnab_teachers', initialTeachers);
  });

  const [teacherAttendances, setTeacherAttendances] = useState<TeacherAttendance[]>(() => {
    return loadStorage<TeacherAttendance[]>('selnab_att_teachers', initialTeacherAttendances);
  });

  const [suratList, setSuratList] = useState<SuratDocument[]>(() => {
    return loadStorage<SuratDocument[]>('selnab_surat', initialSuratList);
  });

  const [atkItems, setAtkItems] = useState<AtkItem[]>(() => {
    return loadStorage<AtkItem[]>('selnab_atk', initialAtkItems);
  });

  const [books, setBooks] = useState<Book[]>(() => {
    return loadStorage<Book[]>('selnab_books', initialBooks);
  });

  const [bookBorrowings, setBookBorrowings] = useState<BookBorrowing[]>(() => {
    return loadStorage<BookBorrowing[]>('selnab_borrowings', initialBookBorrowings);
  });

  const [sarpras, setSarpras] = useState<SarprasItem[]>(() => {
    return loadStorage<SarprasItem[]>('selnab_sarpras', initialSarpras);
  });

  const [financeRecords, setFinanceRecords] = useState<FinanceRecord[]>(() => {
    return loadStorage<FinanceRecord[]>('selnab_finance', initialFinanceRecords);
  });

  const [piketList, setPiketList] = useState<JadwalPiketItem[]>(() => {
    return loadStorage<JadwalPiketItem[]>('selnab_piket', initialJadwalPiket);
  });

  const [jadwalPelajaranList, setJadwalPelajaranList] = useState<JadwalPelajaranItem[]>(() => {
    return loadStorage<JadwalPelajaranItem[]>('selnab_jadwal_pelajaran', initialJadwalPelajaran);
  });

  const [kurikulumDocs, setKurikulumDocs] = useState<KurikulumDocument[]>(() => {
    return loadStorage<KurikulumDocument[]>('selnab_kurikulum', initialKurikulum);
  });

  const [mataPelajaranList, setMataPelajaranList] = useState<MataPelajaran[]>(() => {
    return loadStorage<MataPelajaran[]>('selnab_mapel', initialMataPelajaran);
  });

  const [kalenderList, setKalenderList] = useState<KalenderAkademikItem[]>(() => {
    return loadStorage<KalenderAkademikItem[]>('selnab_kalender_akademik', initialKalenderAkademik);
  });

  const [profilSekolah, setProfilSekolah] = useState<ProfilSekolahData>(() => {
    return loadStorage<ProfilSekolahData>('selnab_profil_sekolah', initialProfilSekolah);
  });

  // Auto-save to localStorage safely
  useEffect(() => {
    safeSetStorage('selnab_settings', settings);
  }, [settings]);

  useEffect(() => {
    safeSetStorage('selnab_students', students);
  }, [students]);

  useEffect(() => {
    safeSetStorage('selnab_att_students', studentAttendances);
  }, [studentAttendances]);

  useEffect(() => {
    safeSetStorage('selnab_teachers', teachers);
  }, [teachers]);

  useEffect(() => {
    safeSetStorage('selnab_att_teachers', teacherAttendances);
  }, [teacherAttendances]);

  useEffect(() => {
    safeSetStorage('selnab_surat', suratList);
  }, [suratList]);

  useEffect(() => {
    safeSetStorage('selnab_atk', atkItems);
  }, [atkItems]);

  useEffect(() => {
    safeSetStorage('selnab_books', books);
  }, [books]);

  useEffect(() => {
    safeSetStorage('selnab_borrowings', bookBorrowings);
  }, [bookBorrowings]);

  useEffect(() => {
    safeSetStorage('selnab_sarpras', sarpras);
  }, [sarpras]);

  useEffect(() => {
    safeSetStorage('selnab_finance', financeRecords);
  }, [financeRecords]);

  useEffect(() => {
    safeSetStorage('selnab_piket', piketList);
  }, [piketList]);

  useEffect(() => {
    safeSetStorage('selnab_jadwal_pelajaran', jadwalPelajaranList);
  }, [jadwalPelajaranList]);

  useEffect(() => {
    safeSetStorage('selnab_kurikulum', kurikulumDocs);
  }, [kurikulumDocs]);

  useEffect(() => {
    safeSetStorage('selnab_mapel', mataPelajaranList);
  }, [mataPelajaranList]);

  useEffect(() => {
    safeSetStorage('selnab_kalender_akademik', kalenderList);
  }, [kalenderList]);

  useEffect(() => {
    safeSetStorage('selnab_profil_sekolah', profilSekolah);
  }, [profilSekolah]);

  // Toast notifier matching exact requested string: "Data Anda Berhasil Disimpan"
  const notifyMessage = (msg: string = 'Data Anda Berhasil Disimpan') => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    try {
      localStorage.setItem('selnab_logged_in', 'true');
    } catch (e) {
      console.warn('Storage error on login:', e);
    }
    notifyMessage('Selamat Datang Selpius Nabyal, S.Pd.Gr. di Aplikasi Tata Usaha');
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setIsLoggedIn(false);
    try {
      localStorage.removeItem('selnab_logged_in');
    } catch (e) {
      console.warn('Storage error on logout:', e);
    }
    setShowLogoutModal(false);
    notifyMessage('Anda telah berhasil keluar dari sistem administrasi');
  };

  const handleToggleConnection = () => {
    const nextMode = settings.modeKoneksi === 'Offline' ? 'Online' : 'Offline';
    setSettings((prev) => ({ ...prev, modeKoneksi: nextMode }));
    notifyMessage(`Mode Berganti ke: ${nextMode.toUpperCase()}`);
  };

  // USB Backup & Restore
  const handleExportUSB = () => {
    const fullDB = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      developer: 'Selpius Nabyal, S.Pd.Gr. Guru SD',
      settings,
      students,
      studentAttendances,
      teachers,
      teacherAttendances,
      suratList,
      atkItems,
      books,
      bookBorrowings,
      sarpras,
      financeRecords,
      piketList,
      jadwalPelajaranList,
      kurikulumDocs,
      mataPelajaranList,
      kalenderList,
      profilSekolah
    };
    exportDatabaseToUSB(fullDB, `BACKUP_TU_${settings.namaSekolah.replace(/\s+/g, '_')}`);
    notifyMessage('Data Cadangan USB Berhasil Disimpan');
  };

  const handleImportUSB = (file: File) => {
    importDatabaseFromUSB(
      file,
      (imported) => {
        if (imported.settings) setSettings(imported.settings);
        if (imported.students) setStudents(imported.students);
        if (imported.studentAttendances) setStudentAttendances(imported.studentAttendances);
        if (imported.teachers) setTeachers(imported.teachers);
        if (imported.teacherAttendances) setTeacherAttendances(imported.teacherAttendances);
        if (imported.suratList) setSuratList(imported.suratList);
        if (imported.atkItems) setAtkItems(imported.atkItems);
        if (imported.books) setBooks(imported.books);
        if (imported.bookBorrowings) setBookBorrowings(imported.bookBorrowings);
        if (imported.sarpras) setSarpras(imported.sarpras);
        if (imported.financeRecords) setFinanceRecords(imported.financeRecords);
        if (imported.piketList) setPiketList(imported.piketList);
        if (imported.jadwalPelajaranList) setJadwalPelajaranList(imported.jadwalPelajaranList);
        if (imported.kurikulumDocs) setKurikulumDocs(imported.kurikulumDocs);
        if (imported.mataPelajaranList) setMataPelajaranList(imported.mataPelajaranList);
        if (imported.kalenderList) setKalenderList(imported.kalenderList);
        if (imported.profilSekolah) setProfilSekolah(imported.profilSekolah);
        notifyMessage('Data Anda Berhasil Dipulihkan dari USB');
      },
      (err) => {
        notifyMessage(`Gagal memulihkan data: ${err}`);
      }
    );
  };

  const handleUploadLogoKiri = (base64: string) => {
    setSettings((prev) => {
      const next = { ...prev, logoKiri: base64 };
      safeSetStorage('selnab_settings', next);
      return next;
    });
    notifyMessage('Logo Kiri Berhasil Diperbarui');
  };

  const handleUploadLogoKanan = (base64: string) => {
    setSettings((prev) => {
      const next = { ...prev, logoKanan: base64 };
      safeSetStorage('selnab_settings', next);
      return next;
    });
    notifyMessage('Logo Kanan Berhasil Diperbarui');
  };

  const handleResetAllData = () => {
    if (safeConfirm('Apakah Anda yakin ingin mereset seluruh data aplikasi kembali ke setelan default pabrik?')) {
      try {
        localStorage.clear();
      } catch (e) {
        console.warn('Storage error on clear:', e);
      }
      setSettings(initialSchoolSettings);
      setStudents(initialStudents);
      setStudentAttendances(initialStudentAttendances);
      setTeachers(initialTeachers);
      setTeacherAttendances(initialTeacherAttendances);
      setSuratList(initialSuratList);
      setAtkItems(initialAtkItems);
      setBooks(initialBooks);
      setBookBorrowings(initialBookBorrowings);
      setSarpras(initialSarpras);
      setFinanceRecords(initialFinanceRecords);
      setPiketList(initialJadwalPiket);
      setJadwalPelajaranList(initialJadwalPelajaran);
      setKurikulumDocs(initialKurikulum);
      setMataPelajaranList(initialMataPelajaran);
      setKalenderList(initialKalenderAkademik);
      setProfilSekolah(initialProfilSekolah);
      notifyMessage('Seluruh Database Berhasil Direset ke Awal');
    }
  };

  // Generic Entity Handlers
  const handleSaveStudent = (student: Student) => {
    setStudents((prev) => {
      const idx = prev.findIndex((s) => s.id === student.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = student;
        return next;
      }
      return [student, ...prev];
    });
  };

  const handleDeleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSaveStudentAttendance = (att: StudentAttendance) => {
    setStudentAttendances((prev) => {
      const idx = prev.findIndex((a) => a.id === att.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = att;
        return next;
      }
      return [att, ...prev];
    });
  };

  const handleDeleteStudentAttendance = (id: string) => {
    setStudentAttendances((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSaveTeacher = (teacher: Teacher) => {
    setTeachers((prev) => {
      const idx = prev.findIndex((t) => t.id === teacher.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = teacher;
        return next;
      }
      return [teacher, ...prev];
    });
  };

  const handleDeleteTeacher = (id: string) => {
    setTeachers((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSaveTeacherAttendance = (att: TeacherAttendance) => {
    setTeacherAttendances((prev) => {
      const idx = prev.findIndex((a) => a.id === att.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = att;
        return next;
      }
      return [att, ...prev];
    });
  };

  const handleDeleteTeacherAttendance = (id: string) => {
    setTeacherAttendances((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSaveSurat = (surat: SuratDocument) => {
    setSuratList((prev) => {
      const idx = prev.findIndex((s) => s.id === surat.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = surat;
        return next;
      }
      return [surat, ...prev];
    });
  };

  const handleDeleteSurat = (id: string) => {
    setSuratList((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSaveAtk = (item: AtkItem) => {
    setAtkItems((prev) => {
      const idx = prev.findIndex((it) => it.id === item.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = item;
        return next;
      }
      return [item, ...prev];
    });
  };

  const handleDeleteAtk = (id: string) => {
    setAtkItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleSaveBook = (book: Book) => {
    setBooks((prev) => {
      const idx = prev.findIndex((b) => b.id === book.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = book;
        return next;
      }
      return [book, ...prev];
    });
  };

  const handleDeleteBook = (id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleSaveBorrowing = (bw: BookBorrowing) => {
    setBookBorrowings((prev) => {
      const idx = prev.findIndex((b) => b.id === bw.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = bw;
        return next;
      }
      return [bw, ...prev];
    });
  };

  const handleDeleteBorrowing = (id: string) => {
    setBookBorrowings((prev) => prev.filter((b) => b.id !== id));
  };

  const handleSaveSarpras = (item: SarprasItem) => {
    setSarpras((prev) => {
      const idx = prev.findIndex((it) => it.id === item.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = item;
        return next;
      }
      return [item, ...prev];
    });
  };

  const handleDeleteSarpras = (id: string) => {
    setSarpras((prev) => prev.filter((it) => it.id !== id));
  };

  const handleSaveFinance = (record: FinanceRecord) => {
    setFinanceRecords((prev) => {
      const idx = prev.findIndex((r) => r.id === record.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = record;
        return next;
      }
      return [record, ...prev];
    });
  };

  const handleDeleteFinance = (id: string) => {
    setFinanceRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSavePiket = (item: JadwalPiketItem) => {
    setPiketList((prev) => {
      const idx = prev.findIndex((p) => p.id === item.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = item;
        return next;
      }
      return [item, ...prev];
    });
  };

  const handleDeletePiket = (id: string) => {
    setPiketList((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSaveJadwalPelajaran = (item: JadwalPelajaranItem) => {
    setJadwalPelajaranList((prev) => {
      const idx = prev.findIndex((j) => j.id === item.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = item;
        return next;
      }
      return [item, ...prev];
    });
  };

  const handleDeleteJadwalPelajaran = (id: string) => {
    setJadwalPelajaranList((prev) => prev.filter((j) => j.id !== id));
  };

  const handleSaveKurikulumDoc = (doc: KurikulumDocument) => {
    setKurikulumDocs((prev) => {
      const idx = prev.findIndex((d) => d.id === doc.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = doc;
        return next;
      }
      return [doc, ...prev];
    });
  };

  const handleDeleteKurikulumDoc = (id: string) => {
    setKurikulumDocs((prev) => prev.filter((d) => d.id !== id));
  };

  const handleSaveMapel = (mapel: MataPelajaran) => {
    setMataPelajaranList((prev) => {
      const idx = prev.findIndex((m) => m.id === mapel.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = mapel;
        return next;
      }
      return [mapel, ...prev];
    });
  };

  const handleDeleteMapel = (id: string) => {
    setMataPelajaranList((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSaveKalender = (item: KalenderAkademikItem) => {
    setKalenderList((prev) => {
      const idx = prev.findIndex((k) => k.id === item.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = item;
        return next;
      }
      return [item, ...prev];
    });
  };

  const handleDeleteKalender = (id: string) => {
    setKalenderList((prev) => prev.filter((k) => k.id !== id));
  };

  const handleSyncData = async () => {
    if (isSyncingFirebase) return;
    setIsSyncingFirebase(true);
    notifyMessage('Sedang menyinkronkan data ke Google Firebase Firestore...');

    try {
      const payload: FirebaseSyncPayload = {
        settings,
        students,
        teachers,
        piketList,
        jadwalPelajaranList,
        suratList,
        books,
        sarpras,
        financeRecords,
        atkList: atkItems,
        profilSekolah
      };

      const result = await syncSchoolDataToFirebase(payload);
      if (result.success) {
        notifyMessage(result.message);
      } else {
        notifyMessage(`Peringatan: ${result.message}`);
      }
    } catch (e: any) {
      notifyMessage(`Gagal sinkronisasi ke Firebase: ${e?.message || 'Periksa koneksi internet'}`);
    } finally {
      setIsSyncingFirebase(false);
    }
  };

  const handleRestoreFromFirebase = async () => {
    if (isSyncingFirebase) return;
    if (!safeConfirm('Tarik dan perbarui data dari cloud Firebase Firestore ke aplikasi ini? Data lokal yang belum tersimpan akan diperbarui.')) {
      return;
    }
    setIsSyncingFirebase(true);
    notifyMessage('Mengambil data terbaru dari Firebase Firestore...');
    try {
      const res = await loadLatestFirebaseData(settings.npsn);
      if (res.success && res.data) {
        if (res.data.settings) setSettings(res.data.settings);
        if (res.data.students) setStudents(res.data.students);
        if (res.data.teachers) setTeachers(res.data.teachers);
        if (res.data.piketList) setPiketList(res.data.piketList);
        if (res.data.jadwalPelajaranList) setJadwalPelajaranList(res.data.jadwalPelajaranList);
        if (res.data.profilSekolah) setProfilSekolah(res.data.profilSekolah);
        notifyMessage(res.message);
      } else {
        notifyMessage(res.message);
      }
    } catch (e: any) {
      notifyMessage(`Gagal mengambil data dari Firebase: ${e?.message}`);
    } finally {
      setIsSyncingFirebase(false);
    }
  };

  const currentAppSize: AppDisplaySize = settings.ukuranAplikasi || 'sedang';

  const handleAppSizeChange = (newSize: AppDisplaySize) => {
    const updatedSettings = { ...settings, ukuranAplikasi: newSize };
    setSettings(updatedSettings);
    safeSetStorage('selnab_settings', updatedSettings);
    notifyMessage(`Ukuran Tampilan Diubah: ${newSize.toUpperCase()}`);
  };

  const appZoomStyle: React.CSSProperties = {
    zoom: currentAppSize === 'kecil' ? 0.9 : currentAppSize === 'besar' ? 1.12 : 1.0
  };

  const mainContainerClass = currentAppSize === 'full'
    ? 'w-full max-w-none px-2 sm:px-6'
    : currentAppSize === 'besar'
    ? 'w-full max-w-[1700px] mx-auto p-2 sm:p-4'
    : currentAppSize === 'kecil'
    ? 'w-full max-w-6xl mx-auto p-2 sm:p-3'
    : 'w-full max-w-7xl 2xl:max-w-[1600px] mx-auto p-2 sm:p-4';

  const footerContainerClass = currentAppSize === 'full'
    ? 'w-full max-w-none px-3 sm:px-6'
    : currentAppSize === 'besar'
    ? 'max-w-[1700px] mx-auto px-4'
    : currentAppSize === 'kecil'
    ? 'max-w-6xl mx-auto px-4'
    : 'max-w-7xl 2xl:max-w-[1600px] mx-auto px-4';

  return (
    <div
      id="app-root-layout"
      className={`min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 transition-all duration-200 app-size-${currentAppSize}`}
      style={appZoomStyle}
    >
      {/* User Login Modal when not authenticated */}
      {!isLoggedIn && (
        <LoginModal
          onSuccess={handleLoginSuccess}
          onLoginSuccess={handleLoginSuccess}
          isOnline={settings.modeKoneksi === 'Online'}
          onToggleOnline={handleToggleConnection}
        />
      )}

      {/* Official Top School Header with Papua Pedalaman Online/Offline Mode */}
      <SchoolHeader
        settings={settings}
        isOnline={settings.modeKoneksi === 'Online'}
        onToggleOnline={handleToggleConnection}
        onToggleConnection={handleToggleConnection}
        onBackupUsb={handleExportUSB}
        onExportUSB={handleExportUSB}
        onImportUSB={handleImportUSB}
        currentUser="SelNab"
        onLogout={handleLogout}
        onUploadLogoKiri={handleUploadLogoKiri}
        onUploadLogoKanan={handleUploadLogoKanan}
        onNavigateSettings={() => setActiveTab('pengaturan')}
        onOpenSettings={() => setActiveTab('pengaturan')}
        appSize={currentAppSize}
        onChangeAppSize={handleAppSizeChange}
      />

      {/* Notification Toast ("Data Anda Berhasil Disimpan") */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 animate-bounce no-print">
          <div className="bg-emerald-900 text-white border-2 border-emerald-400 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-300 flex-shrink-0" />
            <div>
              <p className="font-black text-sm text-amber-200">{toastMessage}</p>
              <p className="text-[10px] text-emerald-200">
                Aplikasi Administrasi Tata Usaha SD Pedalaman Papua
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Container: Left Menu List + Active Module View + Right Action Buttons List */}
      <div className={`flex-1 ${mainContainerClass} flex flex-col xl:flex-row gap-4 items-start`}>
        {/* Left Side Navigation Menu List */}
        <aside
          className={`w-full ${
            isSidebarCollapsed ? 'xl:w-16' : 'xl:w-72 2xl:w-80'
          } flex-shrink-0 no-print sticky xl:top-2 self-start z-20 transition-all duration-200`}
        >
          <NavigationMenu
            activeTab={activeTab}
            onSelectTab={(tab) => setActiveTab(tab)}
            badgeCounts={{
              siswa: students.filter((s) => s.keterangan === 'Aktif').length,
              guru: teachers.length,
              surat: suratList.length,
              atk: atkItems.length,
              perpus: books.length,
              sarpras: sarpras.length,
              jadwalPiket: piketList.length,
              jadwalPelajaran: jadwalPelajaranList.length,
              kurikulum: kurikulumDocs.length + mataPelajaranList.length,
              kalenderAkademik: kalenderList.length
            }}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            isDevProfileUnlocked={isDevProfileUnlocked}
            onLogout={handleLogout}
          />
        </aside>

        {/* Main Body View */}
        <main className="flex-1 w-full min-w-0 space-y-4">
          <ErrorBoundary fallbackTitle="Terjadi Kendala pada Modul Ini">
          {activeTab === 'siswa' && (
          <SiswaModule
            students={students}
            onSaveStudent={handleSaveStudent}
            onDeleteStudent={handleDeleteStudent}
            onHome={() => setActiveTab('siswa')}
            settings={settings}
            notifyMessage={notifyMessage}
            onSync={handleSyncData}
          />
        )}

        {activeTab === 'absen_siswa' && (
          <AbsenSiswaModule
            students={students}
            attendances={studentAttendances}
            onSaveAttendance={handleSaveStudentAttendance}
            onDeleteAttendance={handleDeleteStudentAttendance}
            onHome={() => setActiveTab('siswa')}
            settings={settings}
            notifyMessage={notifyMessage}
            onSync={handleSyncData}
          />
        )}

        {activeTab === 'guru' && (
          <GuruModule
            teachers={teachers}
            onSaveTeacher={handleSaveTeacher}
            onDeleteTeacher={handleDeleteTeacher}
            onHome={() => setActiveTab('siswa')}
            settings={settings}
            notifyMessage={notifyMessage}
            onSync={handleSyncData}
          />
        )}

        {activeTab === 'absen_guru' && (
          <AbsenGuruModule
            teachers={teachers}
            attendances={teacherAttendances}
            onSaveAttendance={handleSaveTeacherAttendance}
            onDeleteAttendance={handleDeleteTeacherAttendance}
            onHome={() => setActiveTab('siswa')}
            settings={settings}
            notifyMessage={notifyMessage}
            onSync={handleSyncData}
          />
        )}

        {activeTab === 'jadwal_piket' && (
          <JadwalPiketModule
            piketList={piketList}
            teachers={teachers}
            onSavePiket={handleSavePiket}
            onDeletePiket={handleDeletePiket}
            onHome={() => setActiveTab('siswa')}
            settings={settings}
            notifyMessage={notifyMessage}
            onSync={handleSyncData}
          />
        )}

        {activeTab === 'jadwal_pelajaran' && (
          <JadwalPelajaranModule
            jadwalList={jadwalPelajaranList}
            teachers={teachers}
            onSaveJadwal={handleSaveJadwalPelajaran}
            onDeleteJadwal={handleDeleteJadwalPelajaran}
            onHome={() => setActiveTab('siswa')}
            settings={settings}
            notifyMessage={notifyMessage}
            onSync={handleSyncData}
          />
        )}

        {activeTab === 'kurikulum' && (
          <KurikulumModule
            documents={kurikulumDocs}
            teachers={teachers}
            onSaveDocument={handleSaveKurikulumDoc}
            onDeleteDocument={handleDeleteKurikulumDoc}
            mataPelajaranList={mataPelajaranList}
            onSaveMapel={handleSaveMapel}
            onDeleteMapel={handleDeleteMapel}
            onHome={() => setActiveTab('siswa')}
            settings={settings}
            notifyMessage={notifyMessage}
            onSync={handleSyncData}
          />
        )}

        {activeTab === 'kalender_akademik' && (
          <KalenderAkademikModule
            kalenderList={kalenderList}
            onSaveKalender={handleSaveKalender}
            onDeleteKalender={handleDeleteKalender}
            onHome={() => setActiveTab('siswa')}
            settings={settings}
            notifyMessage={notifyMessage}
            onSync={handleSyncData}
          />
        )}

        {activeTab === 'surat' && (
          <SuratModule
            suratList={suratList}
            onSaveSurat={handleSaveSurat}
            onDeleteSurat={handleDeleteSurat}
            onHome={() => setActiveTab('siswa')}
            settings={settings}
            notifyMessage={notifyMessage}
            onSync={handleSyncData}
            students={students}
            teachers={teachers}
            onUploadLogoKiri={handleUploadLogoKiri}
            onUploadLogoKanan={handleUploadLogoKanan}
          />
        )}

        {activeTab === 'atk' && (
          <AtkModule
            items={atkItems}
            onSaveItem={handleSaveAtk}
            onDeleteItem={handleDeleteAtk}
            onHome={() => setActiveTab('siswa')}
            settings={settings}
            notifyMessage={notifyMessage}
            onSync={handleSyncData}
          />
        )}

        {activeTab === 'perpustakaan' && (
          <PerpustakaanModule
            books={books}
            borrowings={bookBorrowings}
            onSaveBook={handleSaveBook}
            onDeleteBook={handleDeleteBook}
            onSaveBorrowing={handleSaveBorrowing}
            onDeleteBorrowing={handleDeleteBorrowing}
            onHome={() => setActiveTab('siswa')}
            settings={settings}
            notifyMessage={notifyMessage}
            onSync={handleSyncData}
          />
        )}

        {activeTab === 'sarpras' && (
          <SarprasModule
            sarpras={sarpras}
            onSaveSarpras={handleSaveSarpras}
            onDeleteSarpras={handleDeleteSarpras}
            onHome={() => setActiveTab('siswa')}
            settings={settings}
            notifyMessage={notifyMessage}
            onSync={handleSyncData}
          />
        )}

        {activeTab === 'keuangan' && (
          <KeuanganModule
            records={financeRecords}
            onSaveRecord={handleSaveFinance}
            onDeleteRecord={handleDeleteFinance}
            onHome={() => setActiveTab('siswa')}
            settings={settings}
            notifyMessage={notifyMessage}
            onSync={handleSyncData}
          />
        )}

        {activeTab === 'kartu_id' && (
          <IdCardModule
            students={students}
            teachers={teachers}
            onHome={() => setActiveTab('siswa')}
            settings={settings}
            notifyMessage={notifyMessage}
            onSync={handleSyncData}
            onSaveStudent={handleSaveStudent}
            onSaveTeacher={handleSaveTeacher}
          />
        )}

        {activeTab === 'laporan' && (
          <LaporanModule
            students={students}
            teachers={teachers}
            suratList={suratList}
            atkItems={atkItems}
            books={books}
            sarpras={sarpras}
            financeRecords={financeRecords}
            jadwalList={jadwalPelajaranList}
            onHome={() => setActiveTab('siswa')}
            settings={settings}
            notifyMessage={notifyMessage}
            onSync={handleSyncData}
          />
        )}

        {activeTab === 'arsip' && (
          <ArsipModule
            students={students}
            teachers={teachers}
            suratList={suratList}
            onHome={() => setActiveTab('siswa')}
            settings={settings}
            notifyMessage={notifyMessage}
            onSync={handleSyncData}
          />
        )}

        {activeTab === 'profil_sekolah' && (
          <ProfilSekolahModule
            profilData={profilSekolah}
            onSaveProfilData={(data) => setProfilSekolah(data)}
            settings={settings}
            onSaveSettings={(st) => setSettings(st)}
            onHome={() => setActiveTab('siswa')}
            notifyMessage={notifyMessage}
            onSync={handleSyncData}
          />
        )}

        {activeTab === 'pengaturan' && (
          <PengaturanModule
            settings={settings}
            onSaveSettings={(st) => setSettings(st)}
            onHome={() => setActiveTab('siswa')}
            onExportUSBBackup={handleExportUSB}
            onImportUSBBackup={handleImportUSB}
            onResetAllData={handleResetAllData}
            notifyMessage={notifyMessage}
            onSync={handleSyncData}
            onRestoreFromFirebase={handleRestoreFromFirebase}
            isSyncingFirebase={isSyncingFirebase}
          />
        )}

        {activeTab === 'profil_pengembang' && (
          <ProfilPengembangModule
            settings={settings}
            onHome={() => setActiveTab('siswa')}
            notifyMessage={notifyMessage}
            onSync={handleSyncData}
            isUnlocked={isDevProfileUnlocked}
            onUnlock={handleUnlockDevProfile}
            onLock={handleLockDevProfile}
          />
        )}
        </ErrorBoundary>
      </main>

      </div>

      {/* In-App Confirmation Modal for Logout (Reliable & Interactive) */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 no-print animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border-2 border-rose-300 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0">
                <LogOut className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Konfirmasi Keluar Aplikasi
                </h3>
                <p className="text-xs text-slate-500">
                  Sesi Administrasi Tata Usaha SD NEGERI BAALIL
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-1">
              <p className="font-semibold text-slate-800">
                Apakah Anda yakin ingin keluar dari sesi aplikasi?
              </p>
              <p className="text-slate-600">
                Seluruh data Anda yang telah tersimpan tetap aman di memori perangkat lokal sekolah. Anda dapat masuk kembali dengan akun Operator TU kapan saja.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                id="btn-cancel-logout"
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
              >
                Batal / Kembali
              </button>
              <button
                type="button"
                id="btn-confirm-logout"
                onClick={confirmLogout}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <LogOut className="w-4 h-4" />
                <span>Ya, Keluar Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-[11px] py-3 px-4 border-t border-slate-800 no-print">
        <div className={`${footerContainerClass} flex flex-col sm:flex-row items-center justify-between gap-2`}>
          <div>
            <span className="font-bold text-slate-200">Aplikasi Administrasi Tata Usaha Sekolah Pedalaman Papua</span>
            {' '}— Standar Data Pokok Pendidikan (Dapodik)
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('profil_pengembang')}
              className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer transition-colors group text-left"
              title={isDevProfileUnlocked ? 'Profil Pengembang (Terbuka)' : 'Profil Pengembang (Terkunci)'}
            >
              <img
                src="/foto_pengembang.jpg"
                alt="Selpius Nabyal"
                referrerPolicy="no-referrer"
                className="w-5 h-5 rounded-full object-cover border border-amber-400"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="group-hover:underline">Pengembang: Selpius Nabyal, S.Pd.Gr.</span>
              <span className={`text-[9.5px] px-1.5 py-0.5 rounded font-bold ${
                isDevProfileUnlocked
                  ? 'bg-emerald-800 text-emerald-200 border border-emerald-600'
                  : 'bg-rose-900/80 text-rose-200 border border-rose-500/50'
              }`}>
                {isDevProfileUnlocked ? '🔓 Terbuka' : '🔒 Terkunci'}
              </span>
            </button>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-[10px] text-amber-300 italic hidden md:inline">
              "Mengajar dan Melayani Tanpa Mengharapkan Imbalan"
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1 font-mono text-slate-300">
              {settings.modeKoneksi === 'Offline' ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" /> Mode Offline (Lokal)
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" /> Mode Online (Sinkron)
                </>
              )}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
