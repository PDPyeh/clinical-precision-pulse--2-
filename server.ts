import express from "express";
import path from "path";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialized Groq client
let aiInstance: Groq | null = null;
function getAI() {
  const key = process.env.GROQ_API_KEY;
  if (!key || key === "MY_GROQ_API_KEY" || key.trim() === "") {
    return null;
  }
  if (!aiInstance) {
    aiInstance = new Groq({
      apiKey: key,
    });
  }
  return aiInstance;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", time: new Date() });
});

// Helper function to synthesize scenario with retry & fallback models
async function generatePatientWithRetryAndFallback(ai: Groq, prompt: string) {
  // Groq models that support JSON mode
  const modelsToTry = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];
  let lastError: any = null;

  for (const model of modelsToTry) {
    // Attempt up to 3 times per model
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`[AI Synthesis] Attempting with model: ${model} (Attempt ${attempt}/3)...`);
        const response = await ai.chat.completions.create({
          model: model,
          messages: [
            {
              role: "user",
              content: prompt,
            }
          ],
          temperature: 1,
          max_tokens: 2048,
          response_format: { type: "json_object" },
        });

        const text = response.choices[0]?.message?.content;
        if (text && text.trim().length > 0) {
          console.log(`[AI Synthesis] Successfully generated patient case using model: ${model}`);
          return text;
        }
        throw new Error("Respons teks kosong diterima dari API Groq.");
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || JSON.stringify(err);
        console.warn(`[AI Synthesis warning] Model ${model} (Attempt ${attempt}/3) failed: ${msg}`);
        
        // Wait/delay before next retry, except on the last attempt of the last model
        if (model !== modelsToTry[modelsToTry.length - 1] || attempt < 3) {
          const delay = attempt * 1200; // 1.2s, 2.4s...
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
  }

  throw lastError || new Error("Sintesis AI gagal setelah mencoba semua model cadangan.");
}

// AI Patient Scenario Generation
app.post("/api/generate-patient", async (req, res) => {
  const { category } = req.body; // e.g., "Sepsis", "Trauma", "Respiratory", "Cardiac", "Random"
  
  const ai = getAI();
  if (!ai) {
    return res.status(400).json({
      error: "API_KEY_NOT_CONFIGURED",
      message: "Kunci API Groq belum dikonfigurasi di Settings > Secrets.",
    });
  }

  try {
    const prompt = `Hasilkan sebuah kasus klinis pasien baru UGD (Unit Gawat Darurat) yang sangat realistis untuk simulasi triage.
Kategori kasus yang diminta: ${category || "Acak (Kombinasi Trauma, Kardiovaskular, Sepsis, atau Gangguan Pernapasan)"}.
Semua teks harus dalam Bahasa Indonesia yang profesional dan baku medis.

Nama pasien wajib diawali dengan gelar keluarga ("Tn. ", "Ny. ", "An. ", "Nn. ") berserta nama lokal yang relevan dengan Indonesia.
Usia pasien dalam hitungan tahun (sesuai skenario medis).
Jenis kelamin diisi "Laki-laki" atau "Perempuan".
Chief Complaint (Keluhan Utama) menceritakan gejala utama pasien dengan deskripsi klinis yang kaya dan berbobot.
Status tanda vital (Vital Signs) harus konsisten dan logis secara fisiologi medis dengan keluhan utama pasien. 
Tentukan Kategori Triage secara akurat berdasarkan algoritma START (Simple Triage and Rapid Treatment) atau Emergency Severity Index (ESI):
- "red" (Immediate / Gawat Darurat): Ancaman nyawa langsung (gagal napas, syok anafilaktis/sistemik, koma sekunder, infark miokard akut).
- "yellow" (Delayed / Darurat): Serius tapi stabil untuk sementara (fraktur tertutup tanpa tanda kompartemen, kolik ginjal, asma sedang terkontrol, dehidrasi sedang dengan tekanan darah normotensif).
- "green" (Minor / Aman ditunda): Kondisi ringan (luka lecet superfisial terisolasi, tonsilofaringitis ringan, luka memar, ISPA ringan).

Sertakan Rationale (Alasan Medis) penentuan kategori triage dengan logis, mendalam, dan mendidik bagi profesional medis.

IMPORTANT: Respond with ONLY valid JSON in this exact format:
{
  "name": "Tn./Ny./An./Nn. [Name]",
  "age": [number],
  "gender": "Laki-laki" or "Perempuan",
  "chiefComplaint": "[complaint description]",
  "bloodPressure": "[e.g., 120/80]",
  "heartRate": [number],
  "respiratoryRate": [number],
  "consciousness": "[status]",
  "correctTriage": "red" or "yellow" or "green",
  "rationale": "[medical reasoning]",
  "questionName": "[scenario title]"
}`;

    const patientText = await generatePatientWithRetryAndFallback(ai, prompt);
    const patientData = JSON.parse(patientText.trim());
    return res.json(patientData);

  } catch (error: any) {
    console.error("Groq Generation Error:", error);
    return res.status(500).json({
      error: "AI_GENERATION_FAILED",
      message: "Gagal memproses pembuatan skenario klinis dengan AI.",
      details: error.message || error,
    });
  }
});

// AI Evaluate Triage & Generate Scenario-specific Quiz
app.post("/api/evaluate-and-quiz", async (req, res) => {
  const { patientCase, userDecision } = req.body;
  
  const ai = getAI();
  if (!ai) {
    return res.status(400).json({
      error: "API_KEY_NOT_CONFIGURED",
      message: "Kunci API Groq belum dikonfigurasi di Settings > Secrets.",
    });
  }

  try {
    const prompt = `Anda adalah ahli edukasi kedokteran gawat darurat dan triage UGD di Indonesia yang sangat ramah, suportif, dan profesional.
Evaluasilah keputusan triage pengguna untuk kasus pasien berikut:
- Nama Pasien: ${patientCase.name}
- Usia: ${patientCase.age}
- Gender: ${patientCase.gender}
- Keluhan Utama: ${patientCase.chiefComplaint}
- Tanda Vital: TD ${patientCase.vitals.bloodPressure}, HR ${patientCase.vitals.heartRate} bpm, RR ${patientCase.vitals.respiratoryRate} x/mnt, Kesadaran: ${patientCase.vitals.consciousness}
- Triage Seharusnya (Kunci Jawaban Dokter): ${patientCase.correctTriage} (green atau yellow atau red)
- Keputusan Triage Pengguna: ${userDecision} (green atau yellow atau red)

Tugas Anda:
1. Berikan analisis klinis interaktif (rationale) mengapa pilihan pengguna tepat atau jika kurang tepat kenapa demikian, didasarkan pada algoritma triage standar seperti START (Simple Triage and Rapid Treatment), ESI (Emergency Severity Index), dan pedoman klinis ATLS (Advanced Trauma Life Support).
   Penjelasan harus mendalam, edukatif, ramah, dan ringkas dalam Bahasa Indonesia medis baku yang profesional. Jelaskan hubungan patofisiologi antara tanda-tanda vital dengan keluhan utama pasien.

2. Hasilkan LIMA (5) soal kuis pilihan ganda yang sangat relevan dan mendalam terkait skenario di atas dengan mematuhi ketentuan berikut:
   - Kuis 1: Interpretasi tanda vital utama / patofisiologi (menghubungkan keluhan dengan status tanda vital sesuai kriteria Oh & Jung 2024 tentang signifikansi modifier tanda vital).
   - Kuis 2: Algoritma triage START/ESI yang tepat (menjelaskan klasifikasi Merah/Kuning/Hijau berdasarkan parameter fisiologis).
   - Kuis 3: Tindakan medis prioritas pertama berdasarkan protokol ATLS (misalnya: manajemen Airway dengan proteksi servikal, Breathing dengan dekompresi jarum jika tension pneumotoraks, Circulation dengan balut tekan/tourniquet/resusitasi cairan jika syok hemoragik).
   - Kuis 4: Diagnosis banding (differential diagnosis) atau kondisi klinis terkait yang paling mungkin terjadi.
   - Kuis 5: Monitoring penting atau komplikasi potensial yang wajib diwaspadai (misalnya: refleks Cushing untuk cedera otak berat, sindrom kompartemen untuk patah tulang, edema laring untuk luka bakar inhalasi).

PENTING UNTUK PEMBUATAN SOAL & JAWABAN:
- Kuis harus berakar kuat pada bukti medis dan skenario pasien.
- Setiap kuis harus memiliki 4 opsi berlabel A, B, C, D.
- HANYA boleh ada SATU opsi jawaban yang secara klinis benar. Tiga opsi lainnya harus berupa pengecoh (distractor) yang realistis secara medis tetapi secara objektif salah atau bukan prioritas utama.
- Berikan penjelasan (explanation) yang mendalam untuk setiap kuis yang menerangkan MENGAPA kunci jawaban itu benar dan mengapa pilihan lainnya kurang tepat.
- Seluruh teks soal, pilihan jawaban, dan penjelasan harus ditulis menggunakan Bahasa Indonesia medis baku yang benar dan profesional, tanpa istilah yang membingungkan atau "ngelantur".

IMPORTANT: Respond with ONLY valid JSON in this exact format (do not add any markdown formatting around or outside of the JSON block):
{
  "rationale": "Ulasan evaluasi keputusan triage di sini dalam Bahasa Indonesia (sekitar 3-5 kalimat).",
  "quizzes": [
    {
      "question": "Kalimat pertanyaan kuis 1",
      "options": ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
      "correctAnswer": "A",
      "explanation": "Penjelasan detail mengapa opsi A benar dan yang lain salah."
    },
    {
      "question": "Kalimat pertanyaan kuis 2",
      "options": ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
      "correctAnswer": "B",
      "explanation": "Penjelasan detail mengapa opsi B benar dan yang lain salah."
    },
    {
      "question": "Kalimat pertanyaan kuis 3",
      "options": ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
      "correctAnswer": "C",
      "explanation": "Penjelasan detail mengapa opsi C benar dan yang lain salah."
    },
    {
      "question": "Kalimat pertanyaan kuis 4",
      "options": ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
      "correctAnswer": "D",
      "explanation": "Penjelasan detail mengapa opsi D benar dan yang lain salah."
    },
    {
      "question": "Kalimat pertanyaan kuis 5",
      "options": ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
      "correctAnswer": "A",
      "explanation": "Penjelasan detail mengapa opsi A benar dan yang lain salah."
    }
  ]
}`;

    const modelsToTry = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];
    let textResult = "";
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        console.log(`[AI Evaluation] Generating with ${model}...`);
        const response = await ai.chat.completions.create({
          model: model,
          messages: [
            {
              role: "user",
              content: prompt,
            }
          ],
          temperature: 0.7,
          max_tokens: 4096,
          response_format: { type: "json_object" },
        });
        if (response.choices[0]?.message?.content) {
          textResult = response.choices[0].message.content;
          break;
        }
      } catch (err) {
        lastError = err;
        console.warn(`[AI Evaluation Warning] Model ${model} failed:`, err);
      }
    }

    if (!textResult) {
      throw lastError || new Error("Gagal memperoleh respon dari Groq.");
    }

    const data = JSON.parse(textResult.trim());
    return res.json(data);

  } catch (error: any) {
    console.error("Evaluation and Quiz Groq Error:", error);
    return res.status(500).json({
      error: "EVALUATION_FAILED",
      message: "Gagal memproses penilaian keputusan dan pembuatan kuis dengan Groq.",
      details: error.message || error,
    });
  }
});

// AI Generate Learning Summary & Recommendations
app.post("/api/generate-learning-summary", async (req, res) => {
  const { sessionResults } = req.body;

  if (!sessionResults || !Array.isArray(sessionResults) || sessionResults.length === 0) {
    return res.status(400).json({
      error: "INVALID_INPUT",
      message: "Session results harus berupa array non-kosong.",
    });
  }

  const ai = getAI();
  if (!ai) {
    // Return fallback recap if API not configured
    return res.json(generateFallbackLearningRecap(sessionResults));
  }

  try {
    const correctCount = sessionResults.filter((r: any) => r.isCorrect).length;
    const totalCount = sessionResults.length;
    const accuracyRate = Math.round((correctCount / totalCount) * 100);
    const incorrectCases = sessionResults.filter((r: any) => !r.isCorrect);

    const casesSummary = sessionResults
      .map(
        (r: any) =>
          `- ${r.patientName} (${r.chiefComplaint}): Pengguna pilih ${r.userDecision}, Seharusnya ${r.correctDecision} (${
            r.isCorrect ? "✓ Benar" : "✗ Salah"
          })`
      )
      .join("\n");

    const prompt = `Anda adalah ahli pendidikan kedokteran gawat darurat di Indonesia yang membimbing mahasiswa medis.
Seorang pelajar baru saja menyelesaikan simulasi triage dengan hasil berikut:

STATISTIK KINERJA:
- Total Kasus: ${totalCount}
- Jawaban Benar: ${correctCount}
- Akurasi: ${accuracyRate}%

DETAIL KASUS:
${casesSummary}

TUGAS ANDA:
Buatlah ringkasan pembelajaran yang komprehensif dalam Bahasa Indonesia yang mencakup:

1. **Pokok Pembelajaran Kunci** (3-5 poin): Identifikasi konsep-konsep medis dan triage paling penting yang harus dipahami dari kasus-kasus yang diselesaikan.

2. **Area yang Perlu Peningkatan** (jika ada): Analisis kasus-kasus yang dijawab salah dan jelaskan mengapa jawaban pengguna kurang tepat secara klinis.

3. **Rekomendasi Pembelajaran Berikutnya** (3-4 poin): Saran konkret untuk meningkatkan pemahaman dan keterampilan triage ke level berikutnya.

4. **Ringkasan Sesi**: Kalimat penutup motivasional dan profesional (2-3 kalimat) berdasarkan kinerja mereka, dengan arahan pembelajaran lanjutan.

PENTING: Respond dengan ONLY valid JSON dalam format ini:
{
  "keyPearls": ["Pearl 1", "Pearl 2", ...],
  "pitfallsIdentified": ["Pitfall 1", "Pitfall 2", ...],
  "recommendations": ["Rekomendasi 1", "Rekomendasi 2", ...],
  "summary": "Ringkasan sesi singkat dan motivasional..."
}`;

    const modelsToTry = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];
    let text = "";
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        console.log(`[AI Learning Summary] Generating with ${model}...`);
        const response = await ai.chat.completions.create({
          model: model,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2048,
          response_format: { type: "json_object" },
        });
        if (response.choices[0]?.message?.content) {
          text = response.choices[0].message.content;
          break;
        }
      } catch (err) {
        lastError = err;
        console.warn(`[AI Learning Summary Warning] Model ${model} failed:`, err);
      }
    }

    if (!text) {
      throw lastError || new Error("Respons kosong dari Groq");
    }

    const data = JSON.parse(text.trim());
    return res.json(data);
  } catch (error: any) {
    console.error("[Learning Summary Error]:", error);
    // Return fallback on any error
    return res.json(generateFallbackLearningRecap(sessionResults));
  }
});

// Helper function to generate fallback learning recap
function generateFallbackLearningRecap(sessionResults: any[]) {
  const correctCount = sessionResults.filter((r: any) => r.isCorrect).length;
  const totalCount = sessionResults.length;
  const accuracyRate = Math.round((correctCount / totalCount) * 100);
  const incorrectCases = sessionResults.filter((r: any) => !r.isCorrect);
  

  const keyPearls = [
    "Algoritma START/ESI adalah standar triage yang mengutamakan ABC (Airway, Breathing, Circulation) sebelum kondisi lainnya",
    "Triage MERAH (Immediate): Gangguan pernapasan, sirkulasi, atau kesadaran membutuhkan intervensi cepat",
    "Triage KUNING (Delayed): Kondisi serius namun stabil sementara, dapat ditunda hingga pasien Merah ditangani",
    "Triage HIJAU (Minor): Pasien stabil dengan luka/keluhan ringan yang dapat menunggu lama tanpa risiko tinggi",
    "Tanda vital abnormal harus SELALU dipertimbangkan dalam konteks gejala klinis pasien secara keseluruhan",
  ];

  const recommendations = [
    "Pelajari kembali algoritma START untuk memahami urutan pengambilan keputusan triage",
    "Review patofisiologi kondisi-kondisi gawat darurat yang sering muncul (sepsis, stroke, infark miokard)",
    "Latihan kasus dengan fokus pada kategori yang paling sulit untuk Anda",
    `Identifikasi ${incorrectCases.length > 0 ? `${incorrectCases.length} kasus` : "0 kasus"} yang Anda jawab salah dan pahami alasan medisnya`,
    "Konsultasi dengan mentor klinis untuk diskusi kasus-kasus yang menantang",
  ];

  return {
    keyPearls,
    pitfallsIdentified: incorrectCases.map(
      (c: any) => `${c.patientName}: Dipilih ${c.userDecision}, seharusnya ${c.correctDecision}`
    ),
    recommendations,
    summary: `Anda menyelesaikan ${totalCount} kasus dengan akurasi ${accuracyRate}%. ${
      accuracyRate >= 80
        ? "Kinerja Anda luar biasa! Teruskan pembelajaran untuk menguatkan keahlian triage."
        : accuracyRate >= 60
          ? "Anda menunjukkan pemahaman dasar yang baik. Fokus pada studi mendalam untuk meningkatkan akurasi."
          : "Anda memerlukan latihan lebih lanjut. Jangan putus asa—setiap kasus adalah peluang belajar."
    }`,
  };
}

// Configure development or production assets pipelines
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Clinical Precision Pulse] Server operational on http://0.0.0.0:${PORT}`);
  });
}

startServer();
