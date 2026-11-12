import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  writeBatch
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  SchoolSettings,
  Student,
  Teacher,
  JadwalPiketItem,
  JadwalPelajaranItem,
  SuratDocument,
  Book,
  SarprasItem,
  FinanceRecord,
  AtkItem,
  ProfilSekolahData
} from '../types';

export interface FirebaseSyncPayload {
  settings: SchoolSettings;
  students: Student[];
  teachers: Teacher[];
  piketList: JadwalPiketItem[];
  jadwalPelajaranList: JadwalPelajaranItem[];
  suratList?: SuratDocument[];
  books?: Book[];
  sarpras?: SarprasItem[];
  financeRecords?: FinanceRecord[];
  atkList?: AtkItem[];
  profilSekolah?: ProfilSekolahData;
}

export interface SyncResult {
  success: boolean;
  message: string;
  timestamp?: string;
  syncedCounts?: {
    students: number;
    teachers: number;
    piket: number;
    pelajaran: number;
  };
}

let firestoreInstance: ReturnType<typeof getFirestore> | null = null;

export function getFirestoreDB() {
  if (firestoreInstance) return firestoreInstance;

  const apps = getApps();
  const app = apps.length > 0 ? getApp() : initializeApp(firebaseConfig);
  // If specific firestoreDatabaseId is provided in config
  if (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)') {
    firestoreInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  } else {
    firestoreInstance = getFirestore(app);
  }
  return firestoreInstance;
}

/**
 * Test connectivity with Firebase Firestore
 */
export async function testFirebaseConnection(): Promise<{ ok: boolean; message: string }> {
  try {
    const db = getFirestoreDB();
    const testRef = doc(db, 'system_health', 'ping');
    await setDoc(testRef, {
      lastPing: new Date().toISOString(),
      appName: 'Aplikasi Administrasi TU Sekolah Papua',
      dbId: firebaseConfig.firestoreDatabaseId || 'default'
    }, { merge: true });
    return { ok: true, message: 'Koneksi ke Firebase Firestore Berhasil & Aktif' };
  } catch (err: any) {
    console.warn('Firebase connection test:', err);
    return {
      ok: false,
      message: err?.message || 'Tidak dapat terhubung ke Firebase. Periksa jaringan internet Anda.'
    };
  }
}

/**
 * Synchronize all school administration data to Firebase Firestore
 */
export async function syncSchoolDataToFirebase(payload: FirebaseSyncPayload): Promise<SyncResult> {
  try {
    const db = getFirestoreDB();
    const schoolKey = (payload.settings.npsn && payload.settings.npsn.trim())
      ? payload.settings.npsn.trim()
      : 'sd_inpres_dekai';

    const nowIso = new Date().toISOString();

    // 1. Simpan Ringkasan Master Snapshot Sekolah
    const schoolDocRef = doc(db, 'schools', schoolKey);
    await setDoc(schoolDocRef, {
      namaSekolah: payload.settings.namaSekolah,
      npsn: payload.settings.npsn,
      namaKepsek: payload.settings.namaKepsek,
      operatorTU: payload.settings.operatorTU,
      alamatSekolah: payload.settings.alamatSekolah,
      kabupaten: payload.settings.kabupaten,
      provinsi: payload.settings.provinsi,
      lastSyncedAt: nowIso,
      stats: {
        totalSiswa: payload.students.length,
        totalGuru: payload.teachers.length,
        totalPiket: payload.piketList.length,
        totalJadwalPelajaran: payload.jadwalPelajaranList.length
      }
    }, { merge: true });

    // 2. Simpan Snapshot Data Lengkap untuk Restore Cepat
    const backupRef = doc(db, 'schools', schoolKey, 'sync_history', 'latest');
    await setDoc(backupRef, {
      updatedAt: nowIso,
      settings: payload.settings,
      students: payload.students,
      teachers: payload.teachers,
      piketList: payload.piketList,
      jadwalPelajaranList: payload.jadwalPelajaranList,
      suratCount: payload.suratList?.length || 0,
      booksCount: payload.books?.length || 0,
      sarprasCount: payload.sarpras?.length || 0,
      financeCount: payload.financeRecords?.length || 0,
      atkCount: payload.atkList?.length || 0,
      profilSekolah: payload.profilSekolah || null
    });

    // 3. Sync Batch Data Jadwal Piket & Jadwal Pelajaran agar terstruktur
    const batch = writeBatch(db);

    // Sync subcollection jadwal_piket (limit batch size max 450)
    const piketSlice = payload.piketList.slice(0, 50);
    for (const item of piketSlice) {
      const pRef = doc(db, 'schools', schoolKey, 'jadwal_piket', item.id);
      batch.set(pRef, { ...item, syncedAt: nowIso }, { merge: true });
    }

    // Sync subcollection jadwal_pelajaran
    const pelajaranSlice = payload.jadwalPelajaranList.slice(0, 100);
    for (const j of pelajaranSlice) {
      const jRef = doc(db, 'schools', schoolKey, 'jadwal_pelajaran', j.id);
      batch.set(jRef, { ...j, syncedAt: nowIso }, { merge: true });
    }

    await batch.commit();

    return {
      success: true,
      message: `Sinkronisasi ke Firebase Berhasil! (${payload.students.length} Siswa, ${payload.teachers.length} Guru, ${payload.piketList.length} Jadwal Piket, ${payload.jadwalPelajaranList.length} Jadwal Pelajaran)`,
      timestamp: nowIso,
      syncedCounts: {
        students: payload.students.length,
        teachers: payload.teachers.length,
        piket: payload.piketList.length,
        pelajaran: payload.jadwalPelajaranList.length
      }
    };
  } catch (error: any) {
    console.error('Gagal sinkronisasi ke Firebase:', error);
    return {
      success: false,
      message: error?.message || 'Gagal melakukan sinkronisasi data ke Firebase Firestore.'
    };
  }
}

/**
 * Load latest snapshot from Firebase Firestore
 */
export async function loadLatestFirebaseData(schoolNpsn?: string): Promise<{
  success: boolean;
  data?: Partial<FirebaseSyncPayload>;
  message: string;
}> {
  try {
    const db = getFirestoreDB();
    const schoolKey = schoolNpsn && schoolNpsn.trim() ? schoolNpsn.trim() : 'sd_inpres_dekai';
    const backupRef = doc(db, 'schools', schoolKey, 'sync_history', 'latest');
    const snap = await getDoc(backupRef);

    if (snap.exists()) {
      const docData = snap.data();
      return {
        success: true,
        data: {
          settings: docData.settings,
          students: docData.students,
          teachers: docData.teachers,
          piketList: docData.piketList,
          jadwalPelajaranList: docData.jadwalPelajaranList
        },
        message: 'Data terbaru dari Firebase Firestore berhasil dimuat!'
      };
    } else {
      return {
        success: false,
        message: 'Belum ada data sinkronisasi tersimpan di Firebase untuk sekolah ini.'
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Gagal membaca data dari Firebase Firestore.'
    };
  }
}
