import { SuratType, Student, Teacher, SchoolSettings } from '../types';

export interface AiLetterParams {
  jenisSurat: SuratType;
  namaSekolah: string;
  tujuan: string;
  subjekNama?: string;
  instruksi: string;
  konteksTambahan?: string;
  gayaBahasa?: 'Formal Kedinasan' | 'Santun & Persuasif' | 'Tegas & Disipliner';
  selectedStudent?: Student | null;
  selectedTeacher?: Teacher | null;
}

export interface GeneratedLetterData {
  nomorSurat: string;
  perihal: string;
  pengirim: string;
  penerima: string;
  isiRingkas: string;
  alasanPengirim: string;
  keterangan: string;
  tanggalSurat: string;
}

export async function generateLetterWithAI(
  params: AiLetterParams,
  settings: SchoolSettings
): Promise<GeneratedLetterData> {
  const currentYear = new Date().getFullYear();
  const today = new Date().toISOString().slice(0, 10);

  // Attempt server API call first
  try {
    const response = await fetch('/api/ai/buat-surat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jenisSurat: params.jenisSurat,
        instruksi: params.instruksi,
        namaSiswa: params.selectedStudent ? `${params.selectedStudent.namaSiswa} (NISN: ${params.selectedStudent.nisn}, Kelas: ${params.selectedStudent.kelas})` : params.subjekNama,
        namaSekolah: settings.namaSekolah,
        tujuan: params.tujuan,
        konteksTambahan: params.konteksTambahan,
        gayaBahasa: params.gayaBahasa
      })
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data && result.data.isiRingkas) {
        return {
          nomorSurat: result.data.nomorSurat || `421.2/${Math.floor(Math.random() * 800 + 100)}/SD-DKI/${currentYear}`,
          perihal: result.data.perihal || `Administrasi ${params.jenisSurat}`,
          pengirim: result.data.pengirim || settings.namaSekolah,
          penerima: result.data.penerima || params.tujuan || 'Pihak Terkait',
          isiRingkas: result.data.isiRingkas,
          alasanPengirim: result.data.alasanPengirim || 'Pemenuhan tertib administrasi sekolah.',
          keterangan: result.data.keterangan || 'Telah diverifikasi sesuai standar baku.',
          tanggalSurat: today
        };
      }
    }
  } catch (e) {
    console.warn('Menggunakan generator surat lokal terpadu (mode offline/fallback):', e);
  }

  // Fallback intelligent domain template generator (100% resilient for Papua pedalaman / offline mode)
  return generateOfflineSmartDraft(params, settings, today, currentYear);
}

function generateOfflineSmartDraft(
  params: AiLetterParams,
  settings: SchoolSettings,
  today: string,
  currentYear: number
): GeneratedLetterData {
  const randNum = Math.floor(Math.random() * 800 + 100);
  const student = params.selectedStudent;
  const teacher = params.selectedTeacher;

  if (params.jenisSurat === 'Surat Keterangan Pindah Siswa') {
    const namaSiswa = student ? student.namaSiswa : (params.subjekNama || 'Peserta Didik');
    const nisn = student ? student.nisn : '0123456789';
    const nis = student ? student.nis : '1045';
    const kelas = student ? student.kelas : 'IV';
    const tujuanSekolah = params.tujuan || 'Sekolah Dasar Tujuan di Jayapura';

    return {
      nomorSurat: `421.2/${randNum}/SD-DKI/MUT/${currentYear}`,
      perihal: `Surat Keterangan Pindah Sekolah a.n. ${namaSiswa}`,
      pengirim: settings.namaSekolah,
      penerima: `Kepala ${tujuanSekolah}`,
      isiRingkas: `Menerangkan dengan sebenarnya bahwa peserta didik bernama ${namaSiswa} (NIS: ${nis} / NISN: ${nisn}), jenis kelamin ${student?.jenisKelamin === 'P' ? 'Perempuan' : 'Laki-laki'}, tingkat/kelas ${kelas} pada ${settings.namaSekolah}, telah disetujui untuk mengajukan pindah sekolah ke ${tujuanSekolah}. Segala administrasi nilai raport dan catatan perkembangan karakter siswa telah dilampirkan lengkap.`,
      alasanPengirim: params.instruksi || 'Mengikuti kepindahan domisili / penugasan kerja orang tua/wali siswa.',
      keterangan: 'Buku Raport asli beserta surat mutasi Dapodik terlampir untuk proses validasi.',
      tanggalSurat: today
    };
  }

  if (params.jenisSurat === 'Surat Keterangan Lulus Siswa') {
    const namaSiswa = student ? student.namaSiswa : (params.subjekNama || 'Siswa Kelas VI');
    return {
      nomorSurat: `421.2/${randNum}/SD-DKI/SKL/${currentYear}`,
      perihal: `Surat Keterangan Lulus (SKL) a.n. ${namaSiswa}`,
      pengirim: settings.namaSekolah,
      penerima: params.tujuan || 'Orang Tua / Wali Siswa / Panitia SPMB SMP',
      isiRingkas: `Berdasarkan hasil musyawarah dewan guru dan evaluasi kelulusan tahun pelajaran berjalan, menerangkan bahwa peserta didik bernama ${namaSiswa} dinyatakan LULUS dari ${settings.namaSekolah} dengan predikat BAIK dan berhak melanjutkan ke jenjang pendidikan menengah pertama (SMP/MTs).`,
      alasanPengirim: 'Ketetapan kriteria kelulusan kurikulum satuan pendidikan dan pemenuhan syarat pendaftaran jenjang lanjutan.',
      keterangan: 'Surat Keterangan Lulus sementara berlaku hingga ijazah asli diterbitkan secara resmi.',
      tanggalSurat: today
    };
  }

  if (params.jenisSurat === 'Surat Undangan' || params.jenisSurat === 'Surat Undangan Untuk Orang Tua/Wali') {
    return {
      nomorSurat: `005/${randNum}/SD-DKI/UND/${currentYear}`,
      perihal: params.instruksi ? `Undangan: ${params.instruksi.slice(0, 60)}` : 'Undangan Rapat Pleno Komite dan Orang Tua/Wali Siswa',
      pengirim: settings.namaSekolah,
      penerima: params.tujuan || 'Bapak/Ibu Orang Tua / Wali Siswa',
      isiRingkas: `Dengan hormat, sehubungan dengan agenda ${params.instruksi || 'evaluasi proses belajar mengajar dan koordinasi program sekolah bersama komite'}, kami mengundang Bapak/Ibu untuk hadir dalam pertemuan yang akan diselenggarakan di Ruang Pertemuan ${settings.namaSekolah}. Kehadiran tepat waktu sangat kami harapkan demi kemajuan belajar anak-anak kita.`,
      alasanPengirim: 'Peningkatan peran serta orang tua murid dalam mendukung mutu pendidikan pedalaman.',
      keterangan: 'Diharapkan hadir tanpa mewakilkan. Konfirmasi kehadiran kepada wali kelas masing-masing.',
      tanggalSurat: today
    };
  }

  if (params.jenisSurat === 'Surat Aktif Belajar' || params.jenisSurat === 'Surat Rekomendasi Siswa') {
    const namaSiswa = student ? student.namaSiswa : (params.subjekNama || 'Peserta Didik');
    const nisn = student ? student.nisn : '0123456789';
    const kelas = student ? student.kelas : 'IV';
    return {
      nomorSurat: `421.2/${randNum}/SD-DKI/AKT-BLJ/${currentYear}`,
      perihal: `Surat Keterangan Aktif Belajar & Rekomendasi a.n. ${namaSiswa}`,
      pengirim: `Kepala Sekolah ${settings.namaSekolah}`,
      penerima: params.tujuan || 'Pengelola Beasiswa / Instansi Terkait',
      isiRingkas: `Yang bertanda tangan di bawah ini Kepala Sekolah menerangkan dengan sebenarnya bahwa ${namaSiswa} (NISN: ${nisn}) adalah benar siswa aktif yang saat ini duduk di Kelas ${kelas} pada ${settings.namaSekolah} Tahun Pelajaran berjalan, berkelakuan baik, serta tekun mengikuti kegiatan belajar mengajar. Diberikan rekomendasi untuk pengajuan bantuan pendidikan / beasiswa afirmasi 3T.`,
      alasanPengirim: params.instruksi || 'Persyaratan pengusulan bantuan Program Indonesia Pintar (PIP) atau tunjangan pendidikan anak.',
      keterangan: 'Surat keterangan ini berlaku selama tahun pelajaran berjalan.',
      tanggalSurat: today
    };
  }

  if (params.jenisSurat === 'Surat Keterangan Melaksanakan Tugas') {
    const namaGuru = teacher ? teacher.nama : (params.subjekNama || 'Bapak/Ibu Guru');
    const nip = teacher ? teacher.nip : '-';
    const jabatan = teacher ? teacher.jabatan : 'Guru Kelas';
    return {
      nomorSurat: `421.2/${randNum}/SD-BL/SKMT/${currentYear}`,
      perihal: `Surat Keterangan Melaksanakan Tugas (SKMT) a.n. ${namaGuru}`,
      pengirim: `Kepala Sekolah ${settings.namaSekolah}`,
      penerima: params.tujuan || `Kepala Dinas Pendidikan ${settings.kabupaten || 'Kabupaten Pegunungan Bintang'}`,
      isiRingkas: `Menerangkan dengan sebenarnya bahwa ${namaGuru} (NIP: ${nip}), jabatan ${jabatan}, secara nyata dan aktif telah melaksanakan tugas pembelajaran dan pengabdian secara penuh di wilayah 3T ${settings.namaSekolah} dengan beban kerja tatap muka sesuai ketentuan kurikulum nasional.`,
      alasanPengirim: params.instruksi || 'Pemberkasan pencairan Tunjangan Khusus Guru Pedalaman (TKG) atau Tunjangan Profesi Guru.',
      keterangan: 'Jadwal pembagian tugas mengajar dan rekap kehadiran terlampir lengkap.',
      tanggalSurat: today
    };
  }

  if (params.jenisSurat === 'Surat Keputusan Kepala Sekolah') {
    return {
      nomorSurat: `421.1/${randNum}/SK-KS/${currentYear}`,
      perihal: params.instruksi ? `Keputusan Kepala Sekolah: ${params.instruksi.slice(0, 50)}` : 'Keputusan Kepala Sekolah tentang Pembagian Tugas Guru dan Tata Usaha',
      pengirim: `Kepala Sekolah ${settings.namaSekolah}`,
      penerima: 'Dewan Guru dan Tenaga Kependidikan',
      isiRingkas: `Menimbang kelancaran proses pembelajaran dan ketertiban tata administrasi di satuan pendidikan dasar pedalaman, Kepala Sekolah menetapkan keputusan pembagian beban kerja mengajar dan tugas tambahan bagi segenap tenaga pendidik dan kependidikan di lingkungan ${settings.namaSekolah} untuk dipedomani dengan penuh tanggung jawab.`,
      alasanPengirim: 'Ketentuan Permendikbudristek dan hasil musyawarah dewan guru awal tahun pelajaran.',
      keterangan: 'Keputusan ini mulai berlaku sejak tanggal ditetapkan.',
      tanggalSurat: today
    };
  }

  if (params.jenisSurat === 'Surat Keterangan Kehilangan Ijazah') {
    const namaSiswa = student ? student.namaSiswa : (params.subjekNama || 'Pemohon');
    return {
      nomorSurat: `421.2/${randNum}/SD-DKI/SK-IJZ/${currentYear}`,
      perihal: `Surat Keterangan Pengganti Ijazah yang Hilang/Rusak a.n. ${namaSiswa}`,
      pengirim: settings.namaSekolah,
      penerima: params.tujuan || 'Instansi Terkait / Pengguna Ijazah',
      isiRingkas: `Menerangkan bahwa nama ${namaSiswa} adalah benar alumni peserta didik yang telah dinyatakan lulus dari ${settings.namaSekolah}. Mengingat ijazah aslinya dilaporkan hilang/rusak berdasarkan bukti laporan kepolisian, maka surat keterangan pengganti ini diterbitkan sebagai dokumen sah yang berkekuatan hukum sesuai ketentuan perundang-undangan.`,
      alasanPengirim: params.instruksi || 'Surat tanda penerimaan laporan kehilangan dari kepolisian dan pencocokan nomor seri di buku induk sekolah.',
      keterangan: 'Dilampiri salinan buku register kelulusan sekolah dan pas foto pemohon.',
      tanggalSurat: today
    };
  }

  if (params.jenisSurat === 'Surat Keterangan Aktif Wifi Sekolah') {
    return {
      nomorSurat: `421.2/${randNum}/SD-DKI/BA-WIFI/${currentYear}`,
      perihal: 'Surat Keterangan Ketersediaan & Keaktifan Akses Jaringan Internet Sekolah',
      pengirim: settings.namaSekolah,
      penerima: params.tujuan || 'Kemenkominfo / BAKTI / Dinas Kominfo',
      isiRingkas: `Menerangkan bahwa perangkat akses jaringan internet / wifi satelit (BAKTI/Starlink) pada ${settings.namaSekolah} dalam keadaan aktif, terpelihara dengan baik, dan dimanfaatkan untuk kegiatan sinkronisasi Dapodik, Asesmen Nasional (ANBK), dan media pembelajaran anak pedalaman.`,
      alasanPengirim: params.instruksi || 'Laporan monitoring periodik pemanfaatan sarana TIK pendidikan 3T.',
      keterangan: 'Dokumentasi foto fasilitas dan rincian penggunaan kuota terlampir.',
      tanggalSurat: today
    };
  }

  if (params.jenisSurat === 'Surat Pengantar' || params.jenisSurat === 'Surat Perintah') {
    return {
      nomorSurat: `090/${randNum}/SD-DKI/SPT/${currentYear}`,
      perihal: params.instruksi ? `Surat Perintah Tugas: ${params.instruksi.slice(0, 50)}` : 'Surat Perintah Tugas Dinas Konsultasi & Pengurusan Berkas Sekolah',
      pengirim: `Kepala Sekolah ${settings.namaSekolah}`,
      penerima: params.tujuan || 'Pegawai / Guru yang Ditugaskan',
      isiRingkas: `Kepala Sekolah menugaskan kepada pegawai/guru yang namanya tercantum untuk melaksanakan tugas kedinasan ke kantor Dinas Pendidikan Kabupaten dalam rangka koordinasi administrasi sekolah. Setelah menyelesaikan tugas, wajib melaporkan hasilnya kepada Kepala Sekolah.`,
      alasanPengirim: 'Penyelesaian agenda dinas penting dan pemutakhiran data kelembagaan sekolah.',
      keterangan: 'Segala akomodasi dinas disesuaikan dengan ketentuan yang berlaku.',
      tanggalSurat: today
    };
  }

  if (params.jenisSurat === 'Surat Aktif Mengajar' || params.jenisSurat === 'Surat Rekomendasi Guru') {
    const namaGuru = teacher ? teacher.nama : (params.subjekNama || 'Bapak/Ibu Guru');
    return {
      nomorSurat: `421.2/${randNum}/SD-BL/SK-GURU/${currentYear}`,
      perihal: `Surat Rekomendasi & Keterangan Aktif Mengajar a.n. ${namaGuru}`,
      pengirim: `Kepala Sekolah ${settings.namaSekolah}`,
      penerima: params.tujuan || `Dinas Pendidikan ${settings.kabupaten || 'Kabupaten Pegunungan Bintang'}`,
      isiRingkas: `Yang bertanda tangan di bawah ini Kepala Sekolah menerangkan bahwa ${namaGuru} adalah benar staf pengajar aktif pada ${settings.namaSekolah} yang melaksanakan tugas pembelajaran dengan dedikasi tinggi, berkelakuan baik, serta tidak pernah dijatuhi hukuman disiplin.`,
      alasanPengirim: params.instruksi || 'Persyaratan administrasi pengusulan sertifikasi, tunjangan khusus daerah pedalaman, atau penyesuaian berkas kepegawaian.',
      keterangan: 'Diberikan kepada yang bersangkutan untuk dapat dipergunakan sebagaimana mestinya.',
      tanggalSurat: today
    };
  }

  if (params.jenisSurat === 'Surat Peringatan Untuk Siswa') {
    const namaSiswa = student ? student.namaSiswa : (params.subjekNama || 'Siswa Terkait');
    return {
      nomorSurat: `421.2/${randNum}/SD-DKI/SP-1/${currentYear}`,
      perihal: `Surat Peringatan Pembinaan Siswa a.n. ${namaSiswa}`,
      pengirim: settings.namaSekolah,
      penerima: params.tujuan || `Orang Tua / Wali Siswa dari ${namaSiswa}`,
      isiRingkas: `Sehubungan dengan pemantauan disiplin dan ketertiban belajar di sekolah, kami menyampaikan surat pembinaan kepada peserta didik ${namaSiswa}. Berdasarkan catatan guru kelas, siswa bersangkutan memerlukan perhatian bersama dalam hal kehadiran dan kepatuhan tata tertib kelas. Kami memohon kehadiran Bapak/Ibu untuk koordinasi pembinaan.`,
      alasanPengirim: params.instruksi || 'Ketidakhadiran berturut-turut tanpa pemberitahuan atau pelanggaran disiplin sekolah.',
      keterangan: 'Tindak lanjut konseling guru bimbingan dan wali kelas.',
      tanggalSurat: today
    };
  }

  if (params.jenisSurat === 'Format Surat Permohonan AI' || params.jenisSurat === 'Surat Permohonan Dana') {
    return {
      nomorSurat: `421.2/${randNum}/SD-DKI/PROP-AI/${currentYear}`,
      perihal: 'Permohonan Bantuan Perangkat Komputasi Cerdas & Akses Pembelajaran Mandiri Pedalaman',
      pengirim: `Kepala Sekolah & Operator ${settings.namaSekolah}`,
      penerima: params.tujuan || 'Kementerian Pendidikan Dasar dan Menengah RI / Dinas Pendidikan',
      isiRingkas: `Bersama surat ini kami mengajukan permohonan dukungan fasilitas perangkat pembelajaran berbasis teknologi mandiri/AI offline serta sarana penunjang listrik tenaga surya dan jaringan untuk ${settings.namaSekolah}. Bantuan ini krusial guna mempersempit kesenjangan literasi digital bagi anak-anak pedalaman Papua.`,
      alasanPengirim: params.instruksi || 'Keterbatasan akses jaringan konvensional dan kebutuhan akselerasi literasi numerasi 3T.',
      keterangan: 'Proposal teknis, profil sekolah, dan rincian kebutuhan terlampir lengkap.',
      tanggalSurat: today
    };
  }

  // General standard official school letter
  return {
    nomorSurat: `421.2/${randNum}/SD-DKI/${currentYear}`,
    perihal: params.instruksi ? params.instruksi.slice(0, 50) : `Pemberitahuan Resmi ${params.jenisSurat}`,
    pengirim: settings.namaSekolah,
    penerima: params.tujuan || 'Pihak Berwenang / Terkait',
    isiRingkas: `Sehubungan dengan pelaksanaan agenda ketertiban tata kelola administrasi pendidikan di ${settings.namaSekolah}, bersama ini kami menyampaikan perihal ${params.jenisSurat}. ${params.instruksi || 'Seluruh ketentuan dan kelengkapan dokumen telah disusun sesuai ketentuan yang berlaku.'} Demikian surat ini kami sampaikan untuk dapat ditindaklanjuti.`,
    alasanPengirim: params.konteksTambahan || 'Kebutuhan pemenuhan tata tertib administrasi sekolah standar Dapodik.',
    keterangan: 'Dokumen arsip digital tersimpan dalam buku agenda surat sekolah.',
    tanggalSurat: today
  };
}
