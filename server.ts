import express from "express";
import http from "http";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const server = http.createServer(app);

  app.use(express.json({ limit: "10mb" }));

  // API health
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // AI letter generation endpoint
  app.post("/api/ai/buat-surat", async (req, res) => {
    try {
      const { jenisSurat, instruksi, namaSiswa, namaSekolah, tujuan, konteksTambahan, gayaBahasa } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.status(200).json({
          success: false,
          fallback: true,
          message: "GEMINI_API_KEY belum disetel. Generator otomatis cerdas digunakan."
        });
      }

      const prompt = `Anda adalah asisten administrasi tata usaha sekolah dasar profesional di Indonesia (khususnya wilayah Papua / sekolah pedalaman berstandar Dapodik Kemendikbudristek).
Tugas Anda: Buat rancangan/draf naskah dinas surat resmi sekolah.
Parameter:
- Jenis Surat: ${jenisSurat || 'Surat Dinas'}
- Instansi/Sekolah: ${namaSekolah || 'SD Negeri Inpres Dekai'}
- Ditujukan Kepada (Penerima): ${tujuan || 'Pihak Terkait'}
- Subjek / Nama Siswa / Guru (bila ada): ${namaSiswa || '-'}
- Instruksi / Pokok Permasalahan: ${instruksi || 'Buat surat resmi yang sopan, terstruktur, dan sesuai format kedinasan'}
- Konteks Tambahan: ${konteksTambahan || '-'}
- Gaya Bahasa: ${gayaBahasa || 'Formal Kedinasan'}

Output WAJIB berupa JSON valid dengan format:
{
  "nomorSurat": "421.2/XXX/SD-DKI/TAHUN",
  "perihal": "Perihal surat yang ringkas dan resmi",
  "pengirim": "SD Negeri Inpres Dekai",
  "penerima": "Penerima surat",
  "isiRingkas": "Isi lengkap surat dengan alinea pembuka, pokok isi surat yang jelas, dan alinea penutup yang formal",
  "alasanPengirim": "Dasar hukum atau pertimbangan dikeluarkannya surat",
  "keterangan": "Catatan tindak lanjut atau berkas lampiran"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text || '';
      let parsed;
      try {
        parsed = JSON.parse(responseText);
      } catch {
        const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleaned);
      }

      return res.json({
        success: true,
        data: parsed
      });
    } catch (err: any) {
      console.error("AI Letter Generation error:", err);
      return res.status(200).json({
        success: false,
        fallback: true,
        error: err.message
      });
    }
  });

  // Check if running in production mode (dist bundle or NODE_ENV=production)
  const isProduction =
    process.env.NODE_ENV === "production" ||
    (typeof __filename !== 'undefined' && __filename.includes('dist'));

  if (!isProduction) {
    // Vite middleware for development with HMR disabled to avoid WebSocket errors in iFrame
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
