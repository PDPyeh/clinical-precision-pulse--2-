import React, { useState, useEffect } from "react";
import { BookOpen, TrendingUp, Lightbulb, AlertCircle, CheckCircle2, RotateCcw } from "lucide-react";
import { QuizHistory } from "../types";

interface LearningRecapProps {
  sessionResults: QuizHistory[];
  stats: {
    totalAttempted: number;
    totalCorrect: number;
    accuracyRate: number;
    triageBreakdown: { green: number; yellow: number; red: number };
  };
  onRestart: () => void;
}

export const LearningRecap: React.FC<LearningRecapProps> = ({
  sessionResults,
  stats,
  onRestart,
}) => {
  const [recap, setRecap] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLearningRecap = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/generate-learning-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionResults }),
        });

        if (!response.ok) {
          throw new Error("Gagal membuat ringkasan pembelajaran");
        }

        const data = await response.json();
        setRecap(data);
      } catch (err: any) {
        console.error("[LearningRecap] Error:", err);
        setError(err.message || "Terjadi kesalahan saat membuat ringkasan");
        // Provide fallback recap
        setRecap(generateFallbackRecap(sessionResults));
      } finally {
        setIsLoading(false);
      }
    };

    if (sessionResults.length > 0) {
      fetchLearningRecap();
    }
  }, [sessionResults]);

  const correctCount = sessionResults.filter((r) => r.isCorrect).length;
  const incorrectCases = sessionResults.filter((r) => !r.isCorrect);
  const redCases = sessionResults.filter((r) => r.correctDecision === "red");
  const yellowCases = sessionResults.filter((r) => r.correctDecision === "yellow");
  const greenCases = sessionResults.filter((r) => r.correctDecision === "green");

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-8 mb-6 text-center">
        <BookOpen className="w-12 h-12 mx-auto mb-3" />
        <h1 className="text-3xl font-bold mb-2">Ringkasan Pembelajaran</h1>
        <p className="text-indigo-100">
          Analisis Kinerja & Rekomendasi Pembelajaran
        </p>
      </div>

      {/* Session Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Total Kasus
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {sessionResults.length}
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <div className="text-sm font-semibold text-green-700 dark:text-green-300">
            Jawaban Benar
          </div>
          <div className="text-3xl font-bold text-green-600">
            {correctCount}
            <span className="text-lg text-green-600 dark:text-green-400">/
              {sessionResults.length}</span>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <div className="text-sm font-semibold text-blue-700 dark:text-blue-300">
            Akurasi
          </div>
          <div className="text-3xl font-bold text-blue-600">{stats.accuracyRate}%</div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-950/30 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
          <div className="text-sm font-semibold text-purple-700 dark:text-purple-300">
            Kesimpulan
          </div>
          <div className="text-lg font-bold text-purple-600">
            {stats.accuracyRate >= 80
              ? "Bagus! 🎉"
              : stats.accuracyRate >= 60
                ? "Cukup ✓"
                : "Latihan Lagi"}
          </div>
        </div>
      </div>

      {/* Triage Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 dark:bg-red-950/30 rounded-xl p-4 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-red-600"></div>
            <span className="font-semibold text-red-700 dark:text-red-300">
              Merah (Urgent)
            </span>
          </div>
          <div className="text-2xl font-bold text-red-600">
            {stats.triageBreakdown.red}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Kasus gawat darurat
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="font-semibold text-yellow-700 dark:text-yellow-300">
              Kuning (Delayed)
            </span>
          </div>
          <div className="text-2xl font-bold text-yellow-600">
            {stats.triageBreakdown.yellow}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Kasus darurat sedang
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-green-600"></div>
            <span className="font-semibold text-green-700 dark:text-green-300">
              Hijau (Minor)
            </span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {stats.triageBreakdown.green}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Kasus ringan/stabil
          </div>
        </div>
      </div>

      {/* AI-Generated or Fallback Learning Summary */}
      {isLoading ? (
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-8 border border-slate-200 dark:border-slate-700 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            Menganalisis pembelajaran Anda...
          </p>
        </div>
      ) : recap ? (
        <div className="space-y-6">
          {/* Key Pearls */}
          {recap.keyPearls && recap.keyPearls.length > 0 && (
            <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100">
                  Pokok Pembelajaran Kunci
                </h3>
              </div>
              <ul className="space-y-2">
                {recap.keyPearls.map((pearl: string, idx: number) => (
                  <li key={idx} className="flex gap-3 text-sm">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
                      •
                    </span>
                    <span className="text-slate-700 dark:text-slate-300">{pearl}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Pitfalls Identified */}
          {incorrectCases.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100">
                  Area yang Perlu Peningkatan
                </h3>
              </div>
              <div className="space-y-3">
                {incorrectCases.map((caseResult, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-neutral-800 p-3 rounded-lg text-sm"
                  >
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {caseResult.patientName} - {caseResult.chiefComplaint}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                      Anda pilih:{" "}
                      <span className="font-bold">
                        {caseResult.userDecision === "red"
                          ? "Merah"
                          : caseResult.userDecision === "yellow"
                            ? "Kuning"
                            : "Hijau"}
                      </span>
                      , Seharusnya:{" "}
                      <span className="font-bold">
                        {caseResult.correctDecision === "red"
                          ? "Merah"
                          : caseResult.correctDecision === "yellow"
                            ? "Kuning"
                            : "Hijau"}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {recap.recommendations && recap.recommendations.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">
                  Rekomendasi Pembelajaran Berikutnya
                </h3>
              </div>
              <ul className="space-y-2">
                {recap.recommendations.map((rec: string, idx: number) => (
                  <li key={idx} className="flex gap-3 text-sm">
                    <span className="text-blue-600 dark:text-blue-400 font-bold shrink-0">
                      →
                    </span>
                    <span className="text-slate-700 dark:text-slate-300">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Summary Text */}
          {recap.summary && (
            <div className="bg-slate-100 dark:bg-neutral-800 rounded-xl p-6 border border-slate-300 dark:border-slate-600">
              <h3 className="font-bold mb-3 text-slate-900 dark:text-white">
                Ringkasan Sesi
              </h3>
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                {recap.summary}
              </p>
            </div>
          )}
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-950/30 rounded-xl p-6 border border-red-200 dark:border-red-800">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      ) : null}

      {/* Action Buttons */}
      <div className="flex gap-3 mt-8">
        <button
          onClick={onRestart}
          className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          Mulai Sesi Baru
        </button>
      </div>
    </div>
  );
};

function generateFallbackRecap(sessionResults: QuizHistory[]) {
  const correctCount = sessionResults.filter((r) => r.isCorrect).length;
  const totalCount = sessionResults.length;
  const accuracyRate = Math.round((correctCount / totalCount) * 100);
  const incorrectCases = sessionResults.filter((r) => !r.isCorrect);

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
    summary: `Anda menyelesaikan ${totalCount} kasus dengan akurasi ${accuracyRate}%. ${
      accuracyRate >= 80
        ? "Kinerja Anda luar biasa! Teruskan pembelajaran untuk menguatkan keahlian triage."
        : accuracyRate >= 60
          ? "Anda menunjukkan pemahaman dasar yang baik. Fokus pada studi mendalam untuk meningkatkan akurasi."
          : "Anda memerlukan latihan lebih lanjut. Jangan putus asa—setiap kasus adalah peluang belajar."
    }`,
    keyPearls,
    recommendations,
    pitfallsIdentified: incorrectCases.map(
      (c) =>
        `${c.patientName}: Dipilih ${c.userDecision}, seharusnya ${c.correctDecision}`
    ),
  };
}
