import { getAccessToken } from './googleAuth';

export interface DriveBackupFile {
  id: string;
  name: string;
  createdTime: string;
  modifiedTime: string;
  size?: string;
}

const BACKUP_FILENAME_PREFIX = 'BACKUP_TU_PAPUA_';
const APP_DATA_FOLDER_NAME = 'Backup_TU_Papua_Dekai';

/**
 * Ensures or retrieves the dedicated folder for application backups
 */
async function getOrCreateBackupFolder(accessToken: string): Promise<string | null> {
  try {
    const query = encodeURIComponent(
      `name = '${APP_DATA_FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
    );
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    if (!searchRes.ok) {
      throw new Error(`Gagal mencari folder cadangan: ${searchRes.statusText}`);
    }

    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) {
      return searchData.files[0].id;
    }

    // Create folder
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: APP_DATA_FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
        description: 'Folder penyimpanan otomatis cadangan database Aplikasi Administrasi Tata Usaha Sekolah Papua Pedalaman'
      })
    });

    if (!createRes.ok) {
      throw new Error(`Gagal membuat folder cadangan di Drive: ${createRes.statusText}`);
    }

    const newFolder = await createRes.json();
    return newFolder.id;
  } catch (err) {
    console.warn('Fallback to root drive because folder creation failed:', err);
    return null;
  }
}

/**
 * Uploads database JSON payload to Google Drive (creates or replaces existing latest backup)
 */
export async function uploadBackupToDrive(
  payload: Record<string, unknown>,
  schoolName: string
): Promise<{ fileId: string; fileName: string; webViewLink?: string }> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Belum terhubung ke Google Drive. Silakan Masuk dengan Google terlebih dahulu.');
  }

  const folderId = await getOrCreateBackupFolder(token);
  const dateStr = new Date().toISOString().slice(0, 10);
  const cleanSchool = schoolName.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
  const fileName = `${BACKUP_FILENAME_PREFIX}${cleanSchool}_${dateStr}.json`;

  const fullData = {
    app: 'Aplikasi Administrasi Tata Usaha Sekolah',
    version: '1.0.0',
    developer: 'Selpius Nabyal, S.Pd.Gr. Guru SD',
    targetRegion: 'Papua Pedalaman',
    exportedAt: new Date().toISOString(),
    school: schoolName,
    data: payload
  };

  const fileContent = JSON.stringify(fullData, null, 2);

  // Check if a backup with the exact same name today already exists in the app folder
  let existingFileId: string | null = null;
  try {
    const folderQuery = folderId ? ` and '${folderId}' in parents` : '';
    const q = encodeURIComponent(`name = '${fileName}' and trashed = false${folderQuery}`);
    const checkRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (checkRes.ok) {
      const data = await checkRes.json();
      if (data.files && data.files.length > 0) {
        existingFileId = data.files[0].id;
      }
    }
  } catch (e) {
    console.warn('Check existing backup error:', e);
  }

  if (existingFileId) {
    // Update existing file content
    const updateRes = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: fileContent
      }
    );

    if (!updateRes.ok) {
      const errText = await updateRes.text();
      throw new Error(`Gagal memperbarui berkas di Drive: ${errText}`);
    }

    const updatedFile = await updateRes.json();
    return { fileId: updatedFile.id || existingFileId, fileName };
  }

  // Create multipart upload for new file with metadata
  const metadata: Record<string, unknown> = {
    name: fileName,
    mimeType: 'application/json',
    description: `Cadangan database otomatis TU Sekolah (${schoolName})`
  };
  if (folderId) {
    metadata.parents = [folderId];
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    fileContent +
    closeDelimiter;

  const createRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartRequestBody
    }
  );

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Gagal mengunggah cadangan ke Google Drive: ${errText}`);
  }

  const result = await createRes.json();
  return {
    fileId: result.id,
    fileName: result.name,
    webViewLink: result.webViewLink
  };
}

/**
 * Lists available backup files created by this app in Google Drive
 */
export async function listDriveBackups(): Promise<DriveBackupFile[]> {
  const token = await getAccessToken();
  if (!token) {
    return [];
  }

  try {
    const q = encodeURIComponent(`name contains '${BACKUP_FILENAME_PREFIX}' and trashed = false`);
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${q}&orderBy=modifiedTime desc&pageSize=20&fields=files(id,name,createdTime,modifiedTime,size)`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (!res.ok) {
      throw new Error(`Gagal mengambil daftar cadangan dari Drive: ${res.statusText}`);
    }

    const data = await res.json();
    return data.files || [];
  } catch (err) {
    console.error('List Drive backups error:', err);
    throw err;
  }
}

/**
 * Downloads a backup file content from Google Drive
 */
export async function downloadBackupFromDrive(fileId: string): Promise<any> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Koneksi Google Drive belum aktif.');
  }

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    throw new Error(`Gagal mengunduh file cadangan dari Drive: ${res.statusText}`);
  }

  const content = await res.json();
  if (content && content.data) {
    return content.data;
  }
  return content;
}

/**
 * Deletes a backup file from Google Drive (Requires user confirmation prior to calling)
 */
export async function deleteBackupFromDrive(fileId: string): Promise<void> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Koneksi Google Drive belum aktif.');
  }

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok && res.status !== 204) {
    throw new Error(`Gagal menghapus file dari Drive: ${res.statusText}`);
  }
}
