import React, { useState, useEffect } from "react";
import { 
  EXTENDED_SCENARIOS as DEFAULT_SCENARIOS 
} from "./scenarios";
import { 
  PatientCase, 
  QuizHistory, 
  SimulationStats, 
  INITIAL_STATS 
} from "./types";
import { 
  Activity, 
  Settings, 
  HelpCircle, 
  Sparkles, 
  Plus, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  AlertTriangle,
  BookOpen,
  TrendingUp,
  FileText,
  User,
  Heart,
  TrendingDown,
  Calendar,
  Layers,
  Award,
  Zap,
  CheckCircle,
  Clock,
  Menu,
  CheckCircle2 as CheckIcon,
  Palette,
  Type,
  Volume2,
  VolumeX,
  Music
} from "lucide-react";
import { audioEngine } from "./components/AudioEngine";
import { ECGMonitor } from "./components/ECGMonitor";
import { PatientAvatar } from "./components/PatientAvatar";
import { DisclaimerModal } from "./components/DisclaimerModal";
import { LearningRecap } from "./components/LearningRecap";

const getRandomScenarios = (allScenarios: PatientCase[], count: number = 5): PatientCase[] => {
  const shuffled = [...allScenarios].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export default function App() {
  // Medical Disclaimer State
  const [showDisclaimer, setShowDisclaimer] = useState(() => {
    if (typeof window !== "undefined") {
      const acknowledged = localStorage.getItem("medicalDisclaimerAcknowledged");
      return !acknowledged;
    }
    return true;
  });

  // Navigation State -> Default immediately to "cases" as requested by user
  const [activeTab, setActiveTab] = useState<"home" | "cases" | "history" | "analytics" | "settings" | "support">("cases");

  // Dynamic Groq Evaluation & Quiz States (updated comment from Gemini→Groq)
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [quizzes, setQuizzes] = useState<any[]>([]); // Array of 5 quizzes
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0); // Track which quiz (0-4)
  const [quizActive, setQuizActive] = useState(false);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({}); // Track answers

  // Multimedia Design System States
  const [themeAccent, setThemeAccent] = useState<"classic-teal" | "midnight-navy" | "amber-alert" | "crimson-critical" | "dark-stealth">("classic-teal");
  const [fontScale, setFontScale] = useState<"sm" | "base" | "lg" | "xl">("base");
  const [fontFamily, setFontFamily] = useState<"sans" | "mono" | "dyslexic">("sans");
  const [isMuted, setIsMuted] = useState(false);
  const [isAmbientOn, setIsAmbientOn] = useState(false);
  const [isHeartSoundOn, setIsHeartSoundOn] = useState(false);
  
  // Simulation Platform State
  const [cases, setCases] = useState<PatientCase[]>(() => getRandomScenarios(DEFAULT_SCENARIOS, 5));
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  
  // Interactive Simulation Game State
  // "patient_card" | "prediction_screen" | "feedback" | "learning_summary" | "complete"
  const [gameState, setGameState] = useState<"patient_card" | "prediction_screen" | "feedback" | "learning_summary" | "complete">("patient_card");
  
  // Selection State
  const [selectedTriage, setSelectedTriage] = useState<"green" | "yellow" | "red" | null>(null);
  const [activeDecision, setActiveDecision] = useState<QuizHistory | null>(null);
  
  // History Logs & Statistics
  const [history, setHistory] = useState<QuizHistory[]>([]);
  const [stats, setStats] = useState<SimulationStats>(INITIAL_STATS);
  const [sessionResults, setSessionResults] = useState<QuizHistory[]>([]);

  // Dialog System State (New Custom Case)
  const [isNewCaseOpen, setIsNewCaseOpen] = useState(false);
  const [newCaseCategory, setNewCaseCategory] = useState("Random");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Manual Case fields (for offline creation)
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualAge, setManualAge] = useState<number>(30);
  const [manualGender, setManualGender] = useState("Laki-laki");
  const [manualComplaint, setManualComplaint] = useState("");
  const [manualBP, setManualBP] = useState("120/80");
  const [manualHR, setManualHR] = useState<number>(80);
  const [manualRR, setManualRR] = useState<number>(18);
  const [manualConsciousness, setManualConsciousness] = useState("Sadar (Alert)");
  const [manualTriage, setManualTriage] = useState<"green" | "yellow" | "red">("green");
  const [manualRationale, setManualRationale] = useState("");

  // Guide helper
  const [selectedGuideTopic, setSelectedGuideTopic] = useState<string>("START");

  // Mobile menu controller
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedHL = localStorage.getItem("pulse_history");
    const savedST = localStorage.getItem("pulse_stats");
    if (savedHL) {
      try {
        const parsed = JSON.parse(savedHL);
        setHistory(parsed);
      } catch (e) {
        console.error(e);
      }
    }
    if (savedST) {
      try {
        const parsed = JSON.parse(savedST);
        setStats(parsed);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Sync dark mode class on document root with theme accent
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = themeAccent === "midnight-navy" || themeAccent === "dark-stealth";
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [themeAccent]);

  // Synchronize sonification loops when dependencies alter
  useEffect(() => {
    if (activeTab === "cases" && isHeartSoundOn && gameState !== "complete" && cases[currentCaseIndex]) {
      audioEngine.startHeartSonification(cases[currentCaseIndex].vitals.heartRate);
    } else {
      audioEngine.stopHeartSonification();
    }
    return () => {
      audioEngine.stopHeartSonification();
    };
  }, [currentCaseIndex, isHeartSoundOn, activeTab, gameState, cases]);

  // Handle ambient background soundtrack
  useEffect(() => {
    if (isAmbientOn && !isMuted) {
      audioEngine.startAmbient();
    } else {
      audioEngine.stopAmbient();
    }
    return () => {
      audioEngine.stopAmbient();
    };
  }, [isAmbientOn, isMuted]);

  // Stop sound synthesis completely if the user leaves the tab or window closes
  useEffect(() => {
    return () => {
      audioEngine.stopAll();
    };
  }, []);

  // Update stats whenever history logs append
  const updateStats = (updatedHistory: QuizHistory[]) => {
    if (updatedHistory.length === 0) {
      setStats(INITIAL_STATS);
      localStorage.setItem("pulse_stats", JSON.stringify(INITIAL_STATS));
      return;
    }
    const totalAttempted = updatedHistory.length;
    const totalCorrect = updatedHistory.filter(h => h.isCorrect).length;
    const accuracyRate = Math.round((totalCorrect / totalAttempted) * 100);
    
    const triageBreakdown = {
      green: updatedHistory.filter(h => h.correctDecision === "green").length,
      yellow: updatedHistory.filter(h => h.correctDecision === "yellow").length,
      red: updatedHistory.filter(h => h.correctDecision === "red").length,
    };

    const newStats: SimulationStats = {
      totalAttempted,
      totalCorrect,
      accuracyRate,
      triageBreakdown
    };

    setStats(newStats);
    localStorage.setItem("pulse_stats", JSON.stringify(newStats));
  };

  // Fallback quizzes if Gemini API is offline or unconfigured
  const FALLBACK_QUIZZES: Record<string, any> = {
    "case-1": {
      question: "Tanda vital manakah dari Tn. Ahmad yang paling krusial mendasari klasifikasi triage Kuning (Delayed)?",
      options: [
        "Tekanan darah 150/90 mmHg (Hipertensi tingkat 2)",
        "Frekuensi pernapasan 28 kali per menit (Takipnea sedang)",
        "Detak jantung (HR) 110 kali per menit (Takikardia ringan)",
        "Status kesadaran yang Sadar Penuh (Alert)"
      ],
      correctAnswer: "B",
      explanation: "Frekuensi pernapasan 28 x/mnt (takipnea sedang) merupakan tanda objektif distres pernapasan sedang yang menuntut kategori Kuning (Delayed/Urgent). Kesadaran sadar penuh dan tekanan darah stabil menepis urgensi Merah (Immediate)."
    },
    "case-2": {
      question: "Kombinasi tanda klinis utama apa pada Ny. Susi yang mengindikasikan kondisi Syok Septik (Kategori Merah)?",
      options: [
        "Demam tinggi mendadak disertai dengan batuk berdahak",
        "Penurunan sirkulasi hemodinamik (TD 85/50 dan HR 125) di tengah dugaan infeksi",
        "Kulit teraba dingin di daerah kaki dan tangan saja",
        "Status mental sadar penuh dengan laju respirasi 24 kali per menit"
      ],
      correctAnswer: "B",
      explanation: "Kombinasi demam (infeksi) dengan hipotensi berat (TD 85/50 mmHg) dan takikardia ekstrem (125 bpm) adalah tanda kardinal syok septik (hipoperfusi). Pasien membutuhkan resusitasi cairan segera (Merah / Immediate)."
    },
    "case-3": {
      question: "Mengapa luka robek terisolasi sepanjang 4 cm pada lutut kaki An. Budi dikategorikan Hijau (Minor)?",
      options: [
        "Karena pasien masih anak-anak berumur 8 tahun",
        "Karena tidak ada gangguan hemodinamik sistemik dan luka bersifat superfisial non-ancaman nyawa",
        "Sebab luka robek tersebut kotor terkena pasir jalanan",
        "Menandakan bahwa anak tersebut bisa dimobilisasi tanpa alat bantu"
      ],
      correctAnswer: "B",
      explanation: "Pada triage START/ESI, jika tanda vital stabil (TD 110/70, HR 95) dan cedera bersifat minor terlokalisir tanpa kegawatdaruratan jalan napas, ventilasi atau sirkulasi, penanganan aman ditunda (Hijau)."
    },
    "case-4": {
      question: "Tindakan klinis prioritas utama apa yang wajib segera didapatkan Tn. Doni dalam 10 menit pertama sejak tiba di UGD?",
      options: [
        "Pemberian antibiotik berspektrum kardiak secara intravena",
        "Pemeriksaan urinalisis lengkap dan kreatinin darah",
        "Perekaman EKG (Elektrokardiogram) 12-lead lengkap",
        "Rujukan langsung ke unit operasi kateterisasi arteri koroner"
      ],
      correctAnswer: "C",
      explanation: "Berdasarkan pedoman penanganan Sindrom Koroner Akut (SKA), perekaman EKG 12-lead sangat krusial dilakukan dalam waktu kurang dari 10 menit sejak pasien tiba di UGD guna membedakan STEMI dengan NSTEMI."
    },
    "case-5": {
      question: "Gejala profus utama apakah pada Ny. Rina yang memicu risiko dehidrasi berat dan kompensasi denyut nadi takikardia?",
      options: [
        "Diare cair lebih dari 8 kali disertai rasa haus ekstrem dan muntah",
        "Pusing berputar disertai keram otot tungkai bawah",
        "Laju pernapasan normal (18 x/mnt) dengan nafsu makan berkurang",
        "Tekanan darah 100/65 mmHg yang tergolong normal rendah"
      ],
      correctAnswer: "A",
      explanation: "Kehilangan cairan masif lewat diare cair berulang disertai muntah memicu hipovolemia sedang, ditandai respon takikardia kompensatori (HR 105 bpm). Rehidrasi intravena segera diperlukan di kategorial Kuning."
    }
  };

  // Handle triage decision submission
  const handleSubmitPrediction = async () => {
    if (!selectedTriage) return;
    
    setIsEvaluating(true);
    const currentCase = cases[currentCaseIndex];
    const isCorrect = selectedTriage === currentCase.correctTriage;
    
    let generatedRationale = currentCase.rationale;
    let generatedQuizzes: any[] = []; // Array of 5 quizzes

    try {
      console.log("[App] Fetching live Groq evaluation and quizzes (5 questions)...");
      const response = await fetch("/api/evaluate-and-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientCase: currentCase,
          userDecision: selectedTriage
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.rationale) {
          generatedRationale = result.rationale;
        }
        if (result.quizzes && Array.isArray(result.quizzes)) {
          generatedQuizzes = result.quizzes;
        }
      } else {
        console.warn("[App] Groq API evaluation failed. Using fallback quizzes.");
      }
    } catch (e) {
      console.error("[App] Error connecting to evaluation server:", e);
    } finally {
      setIsEvaluating(false);
    }

    // If no quizzes from API, generate fallback set of 5
    if (generatedQuizzes.length === 0) {
      generatedQuizzes = generateFallbackQuizzes(currentCase);
    }

    const decisionRecord: QuizHistory = {
      id: `${currentCase.id}-${Date.now()}`,
      patientName: currentCase.name,
      chiefComplaint: currentCase.chiefComplaint,
      userDecision: selectedTriage,
      correctDecision: currentCase.correctTriage,
      isCorrect,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      rationale: generatedRationale
    };

    // Update active states with multiple quizzes
    setQuizzes(generatedQuizzes);
    setCurrentQuizIndex(0); // Start with first quiz
    setQuizAnswers({}); // Reset answers
    setActiveDecision(decisionRecord);
    setSessionResults(prev => [...prev, decisionRecord]);
    
    // Play clinical alarm sounds based on triage color
    if (currentCase.correctTriage === "red") {
      audioEngine.playAlarmRed();
    } else if (currentCase.correctTriage === "yellow") {
      audioEngine.playAlarmYellow();
    } else {
      audioEngine.playAlarmGreen();
    }

    // Morph to feedback screen
    setGameState("feedback");

    // Add to historical database
    const updatedHistory = [decisionRecord, ...history];
    setHistory(updatedHistory);
    localStorage.setItem("pulse_history", JSON.stringify(updatedHistory));
    updateStats(updatedHistory);
  };

  // Generate fallback set of 5 quizzes for a case
  const generateFallbackQuizzes = (currentCase: PatientCase) => {
    return [
      {
        question: `Tanda vital manakah dari ${currentCase.name} yang PALING krusial mendasari pengambilan keputusan triage?`,
        options: [
          `Tekanan darah ${currentCase.vitals.bloodPressure}`,
          `Denyut jantung ${currentCase.vitals.heartRate} bpm`,
          `Frekuensi napas ${currentCase.vitals.respiratoryRate} x/mnt`,
          `Status kesadaran: ${currentCase.vitals.consciousness}`
        ],
        correctAnswer: "A",
        explanation: currentCase.rationale
      },
      {
        question: `Berdasarkan algoritma START/ESI, kategori triage ${currentCase.name} adalah "${currentCase.correctTriage === 'red' ? 'MERAH' : currentCase.correctTriage === 'yellow' ? 'KUNING' : 'HIJAU'}". Apa alasan klinis utamanya?`,
        options: [
          "Usia pasien yang lanjut",
          currentCase.rationale.substring(0, 50) + "...",
          "Ketersediaan tempat tidur",
          "Preferensi pasien"
        ],
        correctAnswer: "B",
        explanation: currentCase.rationale
      },
      {
        question: `Tindakan medis prioritas PERTAMA untuk ${currentCase.name} dalam 10 menit pertama adalah?`,
        options: [
          "Pemeriksaan radiologi lengkap",
          currentCase.correctTriage === 'red' ? "Resusitasi dan stabilisasi ABC" : "Observasi dan monitoring vital",
          "Konsultasi spesialis",
          "Pemberian obat-obatan"
        ],
        correctAnswer: currentCase.correctTriage === 'red' ? "B" : "B",
        explanation: "Pada triage " + (currentCase.correctTriage === 'red' ? 'MERAH, fokus pada ABC (Airway, Breathing, Circulation) dan resusitasi' : 'KUNING/HIJAU, fokus pada monitoring dan pemeriksaan dasar')
      },
      {
        question: `Komplikasi potensial yang PALING perlu diwaspadai pada pasien seperti ${currentCase.name} adalah?`,
        options: [
          "Dehidrasi ringan",
          currentCase.correctTriage === 'red' ? "Syok progresif dan kegagalan organ" : "Kondisi stabil yang memburuk",
          "Alergi obat",
          "Infeksi nosokomial"
        ],
        correctAnswer: "B",
        explanation: "Monitoring ketat diperlukan untuk mendeteksi dini tanda-tanda perburukan"
      },
      {
        question: `Indikasi RUJUKAN ke unit spesialis untuk ${currentCase.name} adalah jika terjadi?`,
        options: [
          "Pasien menginginkan konsultasi",
          "Stabilitas hemodinamik meningkat",
          currentCase.correctTriage === 'red' ? "Tidak ada respons terhadap resusitasi awal" : "Kondisi kritis yang memerlukan intervensi spesifik",
          "Waktu tunggu lebih dari 30 menit"
        ],
        correctAnswer: "C",
        explanation: "Kriteria rujukan berbeda sesuai kondisi klinis dan respons terhadap manajemen awal"
      }
    ];
  };

  // Handle quiz answer submission
  const handleSubmitQuizAnswer = () => {
    if (!selectedQuizOption) return;

    // Record answer
    setQuizAnswers(prev => ({
      ...prev,
      [currentQuizIndex]: selectedQuizOption
    }));

    // Check if there are more quizzes
    if (currentQuizIndex < quizzes.length - 1) {
      // Move to next quiz
      setCurrentQuizIndex(prev => prev + 1);
      setSelectedQuizOption(null);
    } else {
      // All quizzes completed - move to next case or learning summary
      handleProceedNext();
    }
  };

  // Move to next case in deck or learning summary if all quizzes completed
  const handleProceedNext = () => {
    // If we're on the last case and all quizzes done, show learning summary
    if (currentCaseIndex >= cases.length - 1 && Object.keys(quizAnswers).length === quizzes.length) {
      setSelectedTriage(null);
      setActiveDecision(null);
      setQuizActive(false);
      setSelectedQuizOption(null);
      setQuizzes([]);
      setCurrentQuizIndex(0);
      setQuizAnswers({});
      setGameState("learning_summary");
    } else if (currentCaseIndex < cases.length - 1) {
      // Move to next case
      setSelectedTriage(null);
      setActiveDecision(null);
      setQuizActive(false);
      setSelectedQuizOption(null);
      setQuizzes([]);
      setCurrentQuizIndex(0);
      setQuizAnswers({});
      setCurrentCaseIndex(prev => prev + 1);
      setGameState("patient_card");
    } else {
      // Fallback: if on last case but not in quiz, complete session
      setGameState("complete");
    }
  };

  // Trigger generator using Express Endpoint
  const handleGenerateAICase = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const response = await fetch("/api/generate-patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: newCaseCategory }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Gagal mensintesis kasus klinis baru.");
      }
      
      const newGeneratedCase: PatientCase = {
        id: `ai-case-${Date.now()}`,
        name: data.name,
        age: data.age,
        gender: data.gender,
        chiefComplaint: data.chiefComplaint,
        vitals: {
          bloodPressure: data.bloodPressure,
          heartRate: data.heartRate,
          respiratoryRate: data.respiratoryRate,
          consciousness: data.consciousness
        },
        correctTriage: data.correctTriage,
        rationale: data.rationale,
        questionName: data.questionName || "KASUS GENERATIF AI"
      };

      // Add to cases array and focus immediately
      setCases(prev => [newGeneratedCase, ...prev]);
      setCurrentCaseIndex(0);
      setGameState("patient_card");
      setIsNewCaseOpen(false);
      setActiveTab("cases");
      
    } catch (err: any) {
      console.error(err);
      setGenerationError(err.message || "Gagal menyambung ke UGD AI Generator.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle manual case submission
  const handleCreateManualCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName || !manualComplaint || !manualRationale) {
      alert("Harap isi semua kolom formulir.");
      return;
    }

    const customCase: PatientCase = {
      id: `manual-case-${Date.now()}`,
      name: manualName,
      age: manualAge,
      gender: manualGender,
      chiefComplaint: manualComplaint,
      vitals: {
        bloodPressure: manualBP,
        heartRate: Number(manualHR),
        respiratoryRate: Number(manualRR),
        consciousness: manualConsciousness
      },
      correctTriage: manualTriage,
      rationale: manualRationale,
      questionName: "KASUS KLINIS KUSTOM"
    };

    setCases(prev => [customCase, ...prev]);
    setCurrentCaseIndex(0);
    setGameState("patient_card");
    setIsNewCaseOpen(false);
    setIsManualMode(false);
    setActiveTab("cases");

    // Reset manual fields
    setManualName("");
    setManualComplaint("");
    setManualRationale("");
  };

  // Reset entire simulator
  const handleRestartSimulation = () => {
    setCases(getRandomScenarios(DEFAULT_SCENARIOS, 5));
    setCurrentCaseIndex(0);
    setGameState("patient_card");
    setSelectedTriage(null);
    setActiveDecision(null);
    setSessionResults([]);
  };

  // Clear training history
  const handleClearHistory = () => {
    setHistory([]);
    setStats(INITIAL_STATS);
    localStorage.removeItem("pulse_history");
    localStorage.removeItem("pulse_stats");
  };

  // Dynamic CSS-variables style binding for font-sizing & typography
  const fontStyles = {
    fontFamily: fontFamily === "dyslexic" 
      ? "Comic Sans MS, cursive, sans-serif" 
      : fontFamily === "mono" 
        ? "JetBrains Mono, monospace" 
        : "Inter, sans-serif",
    fontSize: fontScale === "sm" ? "14px" : fontScale === "lg" ? "17px" : fontScale === "xl" ? "19px" : "15px"
  };

  // Thematic background container color mapper
  const themeBgClass = 
    themeAccent === "midnight-navy" ? "bg-slate-950 text-slate-200" :
    themeAccent === "dark-stealth" ? "bg-neutral-950 text-slate-200" :
    themeAccent === "amber-alert" ? "bg-amber-50/40 text-neutral-900" :
    themeAccent === "crimson-critical" ? "bg-rose-50/10 text-neutral-900" :
    "bg-slate-50 text-slate-900";

  // Dynamic Theme Helpers
  const isDarkAccent = themeAccent === "midnight-navy" || themeAccent === "dark-stealth";
  const cardBgClass = isDarkAccent 
    ? "bg-neutral-900/90 border border-neutral-800 text-neutral-100 shadow-[0_12px_45px_rgba(0,0,0,0.35)]" 
    : "bg-white border border-slate-100 text-slate-900 shadow-[0_10px_40px_rgba(0,0,0,0.03)]";
  const subTextClass = isDarkAccent ? "text-slate-400" : "text-slate-500";
  const mainTitleClass = isDarkAccent ? "text-white" : "text-slate-900";
  const themeBorderClass = isDarkAccent ? "border-neutral-800" : "border-slate-100";

  // Navigation accent mappings
  const primaryThemeColor = 
    themeAccent === "classic-teal" ? "bg-teal-600 hover:bg-teal-700 hover:shadow-teal-100" :
    themeAccent === "midnight-navy" ? "bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-900" :
    themeAccent === "amber-alert" ? "bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold" :
    themeAccent === "crimson-critical" ? "bg-red-650 hover:bg-red-750 hover:shadow-red-900" :
    "bg-zinc-850 hover:bg-zinc-750 text-white font-bold";

  const activeTabClass = (tab: "home" | "cases" | "history" | "analytics" | "settings" | "support") => {
    if (activeTab === tab) {
      if (themeAccent === "classic-teal") return `bg-teal-600 text-white font-bold shadow-md shadow-teal-500/20`;
      if (themeAccent === "crimson-critical") return `bg-red-650 text-white font-bold shadow-md shadow-red-500/20`;
      if (themeAccent === "amber-alert") return `bg-amber-550 text-slate-950 font-bold shadow-md shadow-amber-500/20`;
      if (themeAccent === "midnight-navy") return `bg-indigo-650 text-white font-bold shadow-md shadow-indigo-500/20`;
      if (themeAccent === "dark-stealth") return `bg-zinc-800 text-white font-bold shadow-md shadow-zinc-800/20`;
      return `bg-indigo-600 text-white font-bold`;
    }
    return isDarkAccent 
      ? "text-slate-400 hover:text-white hover:bg-neutral-800" 
      : "text-slate-500 hover:text-indigo-600 hover:bg-slate-50";
  };

  // Speech helper
  const handleReadActiveComplaint = () => {
    const currentCase = cases[currentCaseIndex];
    if (currentCase) {
      const gdr = currentCase.gender.toLowerCase().includes("perempuan") ? "Perempuan" : "Laki-laki";
      const call = `Kasus Triage Medis: Pasien bernama ${currentCase.name}, umur ${currentCase.age} tahun, berjenis kelamin ${gdr}. Keluhan utama pasien adalah: ${currentCase.chiefComplaint}`;
      audioEngine.speakText(call);
    }
  };

  const handleReadActiveExplanation = () => {
    if (activeDecision) {
      const rationaleType = activeDecision.isCorrect ? "Jawaban Anda Tepat!" : "Beda Rekomendasi Medis.";
      const call = `${rationaleType} Penjelasan hubungan patofisiologi: ${activeDecision.rationale}`;
      audioEngine.speakText(call);
    }
  };

  return (
    <>
      {/* Medical Disclaimer Modal (shown on first load) */}
      <DisclaimerModal
        isOpen={showDisclaimer}
        onAcknowledge={() => {
          setShowDisclaimer(false);
          localStorage.setItem("medicalDisclaimerAcknowledged", "true");
        }}
      />

      <div 
        id="app-viewport" 
        style={fontStyles}
        className={`min-h-screen ${themeBgClass} p-4 md:p-6 lg:p-8 flex flex-col overflow-x-hidden transition-all duration-300`}
      >
      
      {/* HEADER NAVBAR (BENTO STYLE) */}
      <header id="main-header" className={`${cardBgClass} rounded-[2rem] p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4 mb-6 shrink-0 z-30 transition-all duration-300`}>
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${themeAccent === "classic-teal" ? "bg-teal-600 animate-pulse" : themeAccent === "crimson-critical" ? "bg-rose-600 animate-pulse" : "bg-indigo-600"} rounded-2xl flex items-center justify-center shadow-md shrink-0`}>
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className={`text-lg font-bold tracking-tight ${mainTitleClass} block leading-tight`}>Health Assessment & Triage</span>
              <span className={`text-[9px] uppercase font-bold tracking-widest ${subTextClass} font-mono block mt-0.5`}>Sistem Penilaian & Triase Gawat Darurat</span>
            </div>
          </div>
          
          {/* Mobile menu toggle button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 ${subTextClass} hover:text-slate-200`}
            aria-label="Toggle Navigation"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Floating navbar tabs links */}
        <nav 
          id="nav-links" 
          className={`${isMobileMenuOpen ? "flex" : "hidden"} md:flex flex-col md:flex-row w-full md:w-auto gap-2 md:gap-1.5 lg:gap-2.5 text-xs font-semibold mt-4 md:mt-0`}
        >
          
          <button 
            onClick={() => { setActiveTab("cases"); setIsMobileMenuOpen(false); }} 
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 justify-center md:justify-start ${activeTabClass("cases")}`}
          >
            <span className="material-symbols-outlined text-[16px]">home</span>
            Simulator
          </button>

          <button 
            onClick={() => { setActiveTab("history"); setIsMobileMenuOpen(false); }} 
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 justify-center md:justify-start ${activeTabClass("history")}`}
          >
            <span className="material-symbols-outlined text-[16px]">quiz</span>
            Activity Log
          </button>

          <button 
            onClick={() => { setActiveTab("analytics"); setIsMobileMenuOpen(false); }} 
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 justify-center md:justify-start ${activeTabClass("analytics")}`}
          >
            <span className="material-symbols-outlined text-[16px]">analytics</span>
            Analytics
          </button>

          <button 
            onClick={() => { setActiveTab("support"); setIsMobileMenuOpen(false); }} 
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 justify-center md:justify-start ${activeTabClass("support")}`}
          >
            <span className="material-symbols-outlined text-[16px]">help</span>
            Study Center
          </button>

          <button 
            onClick={() => { setActiveTab("settings"); setIsMobileMenuOpen(false); }} 
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 justify-center md:justify-start ${activeTabClass("settings")}`}
          >
            <span className="material-symbols-outlined text-[16px]">settings</span>
            Settings
          </button>
        </nav>

      </header>

      {/* DYNAMIC WINDOW ENGINE */}
      <main id="main-content-area" className="flex-grow flex flex-col relative w-full">
        
        {/* TAB: OVERVIEW (HOME) */}
        {activeTab === "home" && (
          <div id="welcome-bento-grid" className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-auto">
            
            {/* Bento P1: Main Presentation (col-span-8) */}
            <div id="intro-bento-card" className="md:col-span-8 bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[320px]">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shrink-0">
                    <Activity className="w-7 h-7" />
                  </div>
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">Health Assessment & Triage</h1>
                    <p className="text-xs font-medium text-slate-500">Sistem Simulasi & Evaluasi Ketepatan Triage Klinis UGD interaktif</p>
                  </div>
                </div>

                <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                  Selamat datang di portal pelatihan pengambilan keputusan triage gawat darurat. Simulator ini dirancang berdasarkan pedoman standar <strong>START (Simple Triage and Rapid Treatment)</strong> dan <strong>ESI (Emergency Severity Index)</strong> untuk mengasah insting dan kecepatan pemilahan tingkat kegawatan pasien.
                </p>
              </div>

              {/* In-app accuracy visual progression */}
              <div className="pt-6 border-t border-slate-100/90 mt-6">
                <div className="flex justify-between items-center text-[10px] font-bold tracking-wider font-mono text-slate-400 uppercase mb-2">
                  <span>Rasio Ketepatan Pemilahan Klinis</span>
                  <span className="text-indigo-600">{stats.accuracyRate}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${stats.accuracyRate}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Bento P2: Live Server Connectivity Status (col-span-4) */}
            <div id="status-bento-card" className="md:col-span-4 bg-indigo-600 text-white rounded-[2rem] p-6 md:p-8 flex flex-col justify-between shadow-[0_10px_40px_rgba(79,70,229,0.12)] min-h-[320px]">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[9px] uppercase font-bold tracking-wider font-mono text-indigo-200">System Monitoring</span>
                  <span className="flex items-center gap-1 text-[9px] font-bold bg-indigo-500/35 px-2.5 py-1 rounded-full border border-indigo-400">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    ACTIVE
                  </span>
                </div>
                <h3 className="text-lg font-bold tracking-tight mb-2">Express + Vite Server Integration</h3>
                <p className="text-xs text-indigo-100/90 leading-relaxed">
                  Server backend fungsional interaktif berjalan mulus di latar belakang untuk memproses generasi AI, evaluasi database, dan persistensi sesi studi.
                </p>
              </div>

              <div className="pt-4 border-t border-indigo-500/60 mt-4 text-[10px] font-mono">
                <span className="block text-indigo-300">SERVER ENDPOINT ADDRESS</span>
                <span className="font-semibold block mt-0.5 text-xs truncate">http://localhost:3000 (Ingress Active)</span>
              </div>
            </div>

            {/* Bento P3: Cases count (col-span-3) */}
            <div id="stat1-bento-card" className="md:col-span-3 bg-white rounded-[2rem] p-6 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col justify-between min-h-[150px]">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest font-mono">Cases Processed</span>
              <div className="my-1">
                <span className="text-4xl md:text-5xl font-extrabold font-mono text-slate-900 tracking-tight">{stats.totalAttempted}</span>
              </div>
              <span className="text-[11px] text-slate-500">Jumlah kasus pasien darurat diklasifikasikan</span>
            </div>

            {/* Bento P4: Perfect Answers count (col-span-3) */}
            <div id="stat2-bento-card" className="md:col-span-3 bg-white rounded-[2rem] p-6 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col justify-between min-h-[150px]">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest font-mono">Correct Decisions</span>
              <div className="my-1">
                <span className="text-4xl md:text-5xl font-extrabold font-mono text-emerald-600 tracking-tight">{stats.totalCorrect}</span>
              </div>
              <span className="text-[11px] text-slate-500">Klasifikasi tepat sesuai standarisasi</span>
            </div>

            {/* Bento P5: Quick Active actions controller (col-span-6) */}
            <div id="deck-bento-card" className="md:col-span-6 bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col justify-between min-h-[150px]">
              <div className="space-y-2">
                <h3 className="text-sm font-bold tracking-tight text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                  Dek Skenario Hub Simulator
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Anda memiliki <strong className="text-slate-800">{cases.length} kasus pasien</strong> aktif dalam antrean triage. Mulai simulasi pelatihan atau setel ulang deck.
                </p>
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <button 
                  onClick={handleRestartSimulation}
                  title="Reset Skenario"
                  className="px-4 bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80 rounded-xl flex items-center justify-center transition-colors shrink-0"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setActiveTab("cases")}
                  className="flex-1 max-w-[200px] bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-sm shadow-indigo-100"
                >
                  Mulai Simulasi
                </button>
              </div>
            </div>

            {/* Bento P6: Generative System model trigger (col-span-6) */}
            <div id="gemini-bento-card" className="md:col-span-6 bg-slate-900 text-white rounded-[2rem] p-6 md:p-8 flex flex-col justify-between shadow-[0_10px_40px_rgba(15,23,42,0.12)] min-h-[260px]">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Generative AI System</span>
                </div>
                <h3 className="text-lg md:text-xl font-bold tracking-tight">Sintesis Pasien Gemini AI</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Gunakan kecerdasan buatan Gemini AI untuk menghasilkan skenario patofisiologi unik yang logis secara keilmuan kedokteran untuk memicu tantangan klinis baru.
                </p>
              </div>

              <button 
                onClick={() => {
                  setGenerationError(null);
                  setIsNewCaseOpen(true);
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 mt-6 transition-all"
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                Synthesize New Patient Case
              </button>
            </div>

            {/* Bento P7: Quick reference clinical rules (col-span-6) */}
            <div id="guide-bento-card" className="md:col-span-6 bg-amber-50 rounded-[2rem] p-6 md:p-8 border border-amber-100 text-amber-950 flex flex-col justify-between min-h-[260px]">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-amber-800">
                  <HelpCircle className="w-4 h-4" />
                  <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Triage Protocol</span>
                </div>
                <h3 className="text-base font-bold tracking-tight text-amber-900">Physiology Trigger Reference</h3>

                <div className="grid grid-cols-1 gap-2 text-xs text-amber-900/95 leading-relaxed">
                  <div className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-600 shrink-0 mt-1.5"></span>
                    <span><strong>Red (Immediate):</strong> Napas &gt; 30 x/mnt, capillary refill &gt; 2 dtk, atau gangguan mental status berat.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1.5"></span>
                    <span><strong>Yellow (Delayed):</strong> Cedera gawat hemodinamik stabil terkompensasi (nyeri dada hebat, trauma patah).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 mt-1.5"></span>
                    <span><strong>Green (Minor):</strong> Walking wounded. Sadar penuh dengan vital signs dalam rentang batas aman.</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-amber-200 mt-4 flex justify-between items-center text-xs">
                <span className="font-mono text-[10px] text-amber-700 font-bold uppercase">Emergency Severity Index Standard</span>
                <button 
                  onClick={() => setActiveTab("support")} 
                  className="text-amber-900 underline font-bold flex items-center gap-0.5 hover:text-amber-950"
                >
                  Detail Study Center
                  <ChevronRight className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Overview bottom spacer */}

          </div>
        )}

        {/* TAB: CASES SIMULATOR (ACTIVE WORKING DECK) */}
        {activeTab === "cases" && (
          <div id="cases-workspace" className="w-full flex-grow flex items-center justify-center">
            
            {gameState === "learning_summary" ? (
              <LearningRecap 
                sessionResults={sessionResults}
                stats={stats}
                onRestart={() => {
                  handleRestartSimulation();
                  setActiveTab("home");
                }}
              />
            ) : gameState === "complete" ? (
              <div className="max-w-xl mx-auto w-full bg-white rounded-[2rem] p-6 md:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col min-h-[460px]">
                <div className="text-center mb-6">
                  <div className="inline-block p-4 bg-emerald-50 rounded-full mb-3">
                    <CheckCircle className="text-emerald-600 w-10 h-10" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">Simulasi Selesai</h2>
                  <p className="text-xs text-slate-500">Seluruh kasus aktif dalam antrean simulasi telah berhasil dievaluasi.</p>
                </div>

                <div className="space-y-3 mb-6 flex-grow overflow-y-auto max-h-[250px] pr-2">
                  {sessionResults.map((dec, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-100/50 rounded-xl p-4 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-800 uppercase tracking-wide">{dec.patientName}</span>
                        <span className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded-full ${dec.isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                          {dec.isCorrect ? "BETUL" : "SALAH"}
                        </span>
                      </div>
                      <p className="text-slate-600 mb-2">
                        <strong>Keluhan:</strong> {dec.chiefComplaint}
                      </p>
                      <p className="text-slate-500 text-[11px] leading-relaxed">
                        <strong>Rasional Medis:</strong> {dec.rationale}
                      </p>
                    </div>
                  ))}
                  {sessionResults.length === 0 && (
                    <p className="text-xs text-slate-400 text-center italic py-8">Belum ada keputusan tersimpan di sesi latihan ini.</p>
                  )}
                </div>

                <button 
                  onClick={() => {
                    handleRestartSimulation();
                    setActiveTab("home");
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs transition-colors shadow-sm"
                >
                  Kembali ke Dashboard
                </button>
              </div>
            ) : (             <div id="simulator-split-layout" className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full items-stretch animate-fade-in-up">
                
                {/* Left Bento: Patient Physiology Dossier (spans col-span-7) */}
                <div id="patient-physiology-card" className={`${cardBgClass} md:col-span-7 rounded-[2rem] p-6 md:p-8 flex flex-col justify-between transition-all duration-300`}>
                  <div className="space-y-6">
                    {/* Progression tracking header */}
                    <div className={`flex justify-between items-center border-b ${themeBorderClass} pb-4`}>
                      <div>
                        <span className={`text-[10px] font-bold font-mono uppercase tracking-widest ${subTextClass}`}>PATIENT CLINICAL DOSSIER</span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 ${isDarkAccent ? "bg-neutral-800 text-indigo-400" : "bg-slate-100 text-indigo-700"} rounded-full font-mono`}>SCENARIO {currentCaseIndex + 1} OF {cases.length}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          if (confirm("Yakin ingin menyelesaikan sesi simulasi?")) {
                            setActiveTab("home");
                          }
                        }}
                        className={`${subTextClass} hover:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors`}
                      >
                        Keluar
                      </button>
                    </div>

                    {/* Patient Information block with dynamic breathing avatar */}
                    <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                      <div className="flex-grow space-y-2">
                        <span className={`text-[10px] font-bold ${isDarkAccent ? "bg-neutral-800 text-indigo-400 font-mono" : "bg-indigo-50 text-indigo-650"} tracking-wider uppercase px-2.5 py-1 rounded-md font-mono`}>
                          {cases[currentCaseIndex].questionName}
                        </span>
                        <h2 className={`text-xl md:text-2xl font-bold tracking-tight ${mainTitleClass} mt-2`}>
                          {cases[currentCaseIndex].name}
                        </h2>
                        <div className={`flex gap-4 text-xs font-semibold ${subTextClass} mt-1`}>
                          <span>Lahir/Usia: {cases[currentCaseIndex].age} Tahun</span>
                          <span>•</span>
                          <span>Gender: {cases[currentCaseIndex].gender}</span>
                        </div>
                      </div>
                      <PatientAvatar 
                        gender={cases[currentCaseIndex].gender}
                        age={cases[currentCaseIndex].age}
                        triage={cases[currentCaseIndex].correctTriage}
                        respiratoryRate={cases[currentCaseIndex].vitals.respiratoryRate}
                      />
                    </div>

                    {/* Chief Complaint block */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className={`text-[10px] font-bold font-mono tracking-widest ${subTextClass} uppercase`}>KELUHAN KHUSUS (CHIEF COMPLAINT)</span>
                        <button
                          type="button"
                          onClick={handleReadActiveComplaint}
                          className={`px-2 py-1 text-[10px] font-bold rounded-lg flex items-center gap-1 border transition-all ${isDarkAccent ? "bg-neutral-800 border-neutral-700 hover:bg-neutral-750 text-indigo-400" : "bg-indigo-50/50 border-indigo-100/50 hover:bg-indigo-100/50 text-indigo-700"}`}
                          title="Dengarkan keluhan suara pasien"
                        >
                          <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                          Dengar Narasi Audio
                        </button>
                      </div>
                      <div className={`${isDarkAccent ? "bg-neutral-850/60 border border-neutral-800" : "bg-red-50/15 border border-red-50"} rounded-2xl p-4 md:p-5 shadow-inner`}>
                        <p className={`text-xs md:text-sm font-medium ${isDarkAccent ? "text-neutral-200" : "text-slate-800"} leading-relaxed`}>
                          {cases[currentCaseIndex].chiefComplaint}
                        </p>
                      </div>
                    </div>

                    {/* DYNAMIC TELEMETRY ECG WAVEFORM COMPONENT */}
                    <div className="space-y-2">
                      <span className={`text-[10px] font-bold font-mono tracking-widest ${subTextClass} uppercase block`}>REALTIME MONITORING TELEMETRY (ECG)</span>
                      <ECGMonitor 
                        heartRate={cases[currentCaseIndex].vitals.heartRate}
                        triageColor={cases[currentCaseIndex].correctTriage}
                      />
                    </div>

                    {/* Physiological Vital indicators dashboard */}
                    <div className="space-y-2">
                      <span className={`text-[10px] font-bold font-mono tracking-widest ${subTextClass} uppercase block`}>INDISPENSABLE VITAL SIGNS</span>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        
                        <div className={`p-3 rounded-xl flex flex-col justify-between border ${isDarkAccent ? "bg-neutral-850/50 border-neutral-800" : "bg-slate-50 border-slate-100/55"}`}>
                          <span className={`text-[10px] font-bold ${subTextClass} block mb-2`}>Sistol/Diastol</span>
                          <div className="flex items-baseline gap-0.5">
                            <span className={`text-sm md:text-base font-mono font-bold ${isDarkAccent ? "text-slate-100" : "text-slate-800"}`}>{cases[currentCaseIndex].vitals.bloodPressure}</span>
                            <span className={`text-[8px] font-mono ${subTextClass} uppercase`}>mmHg</span>
                          </div>
                        </div>

                        <div className={`p-3 rounded-xl flex flex-col justify-between border ${isDarkAccent ? "bg-neutral-850/50 border-neutral-800" : "bg-slate-50 border-slate-100/55"}`}>
                          <span className={`text-[10px] font-bold ${subTextClass} block mb-2`}>Denyut Nadi</span>
                          <div className="flex items-baseline gap-0.5">
                            <span className="text-sm md:text-base font-mono font-bold text-red-500">{cases[currentCaseIndex].vitals.heartRate}</span>
                            <span className={`text-[8px] font-mono ${subTextClass} uppercase`}>bpm</span>
                          </div>
                        </div>

                        <div className={`p-3 rounded-xl flex flex-col justify-between border ${isDarkAccent ? "bg-neutral-850/50 border-neutral-800" : "bg-slate-50 border-slate-100/55"}`}>
                          <span className={`text-[10px] font-bold ${subTextClass} block mb-2`}>Napas (RR)</span>
                          <div className="flex items-baseline gap-0.5">
                            <span className="text-sm md:text-base font-mono font-bold text-red-500">{cases[currentCaseIndex].vitals.respiratoryRate}</span>
                            <span className={`text-[8px] font-mono ${subTextClass} uppercase`}>x/mnt</span>
                          </div>
                        </div>

                        <div className={`p-3 rounded-xl flex flex-col justify-between border ${isDarkAccent ? "bg-neutral-850/50 border-neutral-800" : "bg-slate-50 border-slate-100/55"}`}>
                          <span className={`text-[10px] font-bold ${subTextClass} block mb-2`}>Kesadaran</span>
                          <span className={`text-xs font-bold ${isDarkAccent ? "text-slate-100" : "text-slate-800"} tracking-tight block truncate mt-1`} title={cases[currentCaseIndex].vitals.consciousness}>
                            {cases[currentCaseIndex].vitals.consciousness}
                          </span>
                        </div>

                      </div>
                    </div>

                  </div>

                  <div className={`pt-6 border-t ${themeBorderClass} mt-6 flex justify-between items-center text-[11px] font-mono ${subTextClass}`}>
                    <span>Clinical Precision Engine</span>
                    {gameState === "patient_card" && (
                      <button 
                        onClick={() => setGameState("prediction_screen")}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all"
                      >
                        Analisis Kasus
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Right Bento: Active triage selection desk (spans col-span-5) */}
                <div id="triage-selection-card" className={`${cardBgClass} md:col-span-5 rounded-[2rem] p-6 md:p-8 flex flex-col justify-between transition-all duration-300`}>
                  
                  {/* Triage Selector State 1: Help Instruction block */}
                  {gameState === "patient_card" && (
                    <div className="flex flex-col justify-between h-full flex-grow">
                      <div>
                        <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-slate-400">DECISION STATION</span>
                        <h3 className="text-base font-bold tracking-tight text-slate-900 mt-2 mb-3">Triage Guideline Quick Check</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Bacalah patofisiologi keluhan utama pasien secara beriringan dengan visual tanda vital. Sebelum memutus triage, konfirmasi apakah terdapat:
                        </p>

                        <div className="space-y-3 mt-6">
                          <div className="p-3 bg-red-50/50 rounded-xl border border-red-50 text-[11px] text-red-950">
                            <strong>1. Syok atau Penurunan Kesadaran?</strong>
                            <p className="text-[10px] text-slate-500 mt-0.5">Tandakan prioritas segera (Merah) jika HR melebihi 120 disertai kesadaran menurun.</p>
                          </div>
                          <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-50 text-[11px] text-amber-950">
                            <strong>2. Gangguan Organ Terkompensasi?</strong>
                            <p className="text-[10px] text-slate-500 mt-0.5">Tandakan sedang (Kuning) jika menderita nyeri akut terlokalisasi parah dengan organ stabil.</p>
                          </div>
                          <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-50 text-[11px] text-emerald-950">
                            <strong>3. Trauma Ringan & Mobilisasi Mandiri?</strong>
                            <p className="text-[10px] text-slate-500 mt-0.5">Pilih minor (Hijau) jika status mental normal bugar dan nadi stabil.</p>
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => setGameState("prediction_screen")}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider block mt-8 transition-colors shadow-sm shadow-indigo-50"
                      >
                        Proceed to Assessment Input
                      </button>
                    </div>
                  )}

                  {/* Triage Selector State 2: Prediction form selections */}
                  {gameState === "prediction_screen" && (
                    <div className="flex flex-col justify-between h-full flex-grow">
                      <div>
                        <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-slate-400">DECISION STATION</span>
                        <h3 className="text-base font-bold tracking-tight text-slate-900 mt-2 mb-1">Select Triage Category</h3>
                        <p className="text-xs text-slate-500 mb-6 font-medium">Bandingkan hemodinamik dan pilih prioritas perawatan gawat darurat.</p>

                        <div className="space-y-3">
                          {/* Green Option */}
                          <button 
                            onClick={() => setSelectedTriage("green")}
                            className={`w-full border p-4 rounded-xl flex items-center justify-between text-left transition-all ${selectedTriage === "green" ? "bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/50" : "border-slate-100/80 hover:bg-slate-50"}`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shrink-0"></span>
                              <div>
                                <h4 className="font-bold text-xs text-emerald-950 uppercase font-mono">🟢 GREEN (MINOR)</h4>
                                <span className="text-[10px] text-slate-400 block mt-0.5 leading-none">Walking wounded / Non-Urgent</span>
                              </div>
                            </div>
                            {selectedTriage === "green" && (
                              <CheckCircle className="text-emerald-600 w-4 h-4 shrink-0" />
                            )}
                          </button>

                          {/* Yellow Option */}
                          <button 
                            onClick={() => setSelectedTriage("yellow")}
                            className={`w-full border p-4 rounded-xl flex items-center justify-between text-left transition-all ${selectedTriage === "yellow" ? "bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/50" : "border-slate-100/80 hover:bg-slate-50"}`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-3.5 h-3.5 rounded-full bg-amber-500 shrink-0"></span>
                              <div>
                                <h4 className="font-bold text-xs text-amber-950 uppercase font-mono">🟡 YELLOW (DELAYED)</h4>
                                <span className="text-[10px] text-slate-400 block mt-0.5 leading-none">Urgent / Organ Stable comp</span>
                              </div>
                            </div>
                            {selectedTriage === "yellow" && (
                              <CheckCircle className="text-amber-600 w-4 h-4 shrink-0" />
                            )}
                          </button>

                          {/* Red Option */}
                          <button 
                            onClick={() => setSelectedTriage("red")}
                            className={`w-full border p-4 rounded-xl flex items-center justify-between text-left transition-all ${selectedTriage === "red" ? "bg-red-50/80 border-red-500 ring-2 ring-red-500/50" : "border-slate-100/80 hover:bg-slate-50"}`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-3.5 h-3.5 rounded-full bg-red-500 shrink-0"></span>
                              <div>
                                <h4 className="font-bold text-xs text-red-950 uppercase font-mono">🔴 RED (IMMEDIATE)</h4>
                                <span className="text-[10px] text-slate-400 block mt-0.5 leading-none">Emergency / Vital threat</span>
                              </div>
                            </div>
                            {selectedTriage === "red" && (
                              <CheckCircle className="text-red-600 w-4 h-4 shrink-0" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-8 gap-3 pt-4 border-t border-slate-100">
                        <button 
                          disabled={isEvaluating}
                          onClick={() => setGameState("patient_card")}
                          className="bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100 py-2.5 px-5 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                        >
                          Kembali
                        </button>
                        <button 
                          disabled={!selectedTriage || isEvaluating}
                          onClick={handleSubmitPrediction}
                          className={`flex-grow text-xs font-bold py-2.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 ${
                            isEvaluating 
                              ? "bg-slate-205 text-slate-500 cursor-wait animate-pulse border border-slate-200" 
                              : selectedTriage 
                                ? "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-sm shadow-indigo-50" 
                                : "bg-slate-100 text-slate-400 cursor-not-allowed"
                          }`}
                        >
                          {isEvaluating ? (
                            <>
                              <Activity className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                              Menganalisis Kasus...
                            </>
                          ) : (
                            "Submit Decision"
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Triage Selector State 3: Feedback evaluation logs OR Case Quiz */}
                  {gameState === "feedback" && activeDecision && (
                    <div className="flex flex-col justify-between h-full flex-grow">
                      {!quizActive ? (
                        // Phase A: Display standard triage comparison and patient rationale
                        <div className="flex flex-col justify-between h-full flex-grow">
                          <div>
                            <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-slate-400">DECISION STATION</span>
                            
                            <div className="text-center my-6">
                              <div className={`inline-block p-2 rounded-full mb-2 ${isDarkAccent ? "bg-neutral-850" : "bg-slate-50"}`}>
                                {activeDecision.isCorrect ? (
                                  <CheckCircle className="text-emerald-500 w-10 h-10" />
                                ) : (
                                  <AlertTriangle className="text-rose-500 w-10 h-10" />
                                )}
                              </div>
                              <h3 className={`text-lg font-bold leading-tight ${isDarkAccent ? "text-slate-100" : "text-slate-900"}`}>
                                {activeDecision.isCorrect ? "Kunci Triage Tepat!" : "Beda Rekomendasi Medis!"}
                              </h3>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-center mb-4 font-mono">
                              <div className={`border rounded-xl p-2.5 ${isDarkAccent ? "bg-neutral-850 border-neutral-800 text-slate-200" : "bg-slate-50 border-slate-100"}`}>
                                <span className={`text-[9px] ${subTextClass} uppercase tracking-wider block block`}>Pilihan Anda</span>
                                <span className="text-xs font-bold uppercase mt-1 block font-mono">
                                  {activeDecision.userDecision === "red" ? "🔴 Red" : activeDecision.userDecision === "yellow" ? "🟡 Yellow" : "🟢 Green"}
                                </span>
                              </div>
                              <div className={`border rounded-xl p-2.5 ${isDarkAccent ? "bg-neutral-850 border-neutral-800 text-slate-200" : "bg-slate-50 border-slate-100"}`}>
                                <span className={`text-[9px] ${subTextClass} uppercase tracking-wider block block`}>Panduan Standar</span>
                                <span className="text-xs font-bold uppercase mt-1 block font-mono">
                                  {activeDecision.correctDecision === "red" ? "🔴 Red" : activeDecision.correctDecision === "yellow" ? "🟡 Yellow" : "🟢 Green"}
                                </span>
                              </div>
                            </div>

                            <div className={`p-4 rounded-xl border text-xs max-h-[180px] overflow-y-auto leading-relaxed transition-all duration-300 ${isDarkAccent ? "bg-neutral-850/50 border-neutral-800 text-slate-100" : (activeDecision.isCorrect ? "bg-emerald-50/50 border-emerald-100" : "bg-red-50/50 border-red-100")}`}>
                              <div className="flex justify-between items-center mb-2 pb-1 border-b border-indigo-100/35">
                                <span className={`font-bold flex items-center gap-1.5 ${isDarkAccent ? "text-indigo-300" : "text-indigo-950"}`}>
                                  <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                  Hubungan Patofisiologi:
                                </span>
                                <button
                                  type="button"
                                  onClick={handleReadActiveExplanation}
                                  className={`px-2 py-0.5 text-[9px] font-bold rounded-md flex items-center gap-1 border transition-all ${isDarkAccent ? "bg-neutral-800 border-neutral-700 hover:bg-neutral-750 text-indigo-400" : "bg-indigo-50 border-indigo-100 hover:bg-indigo-100 text-indigo-750"}`}
                                  title="Dengarkan penjelasan suara"
                                >
                                  <Volume2 className="w-3 h-3 animate-pulse" />
                                  Dengar Rationale (TTS)
                                </button>
                              </div>
                              <p className={`${isDarkAccent ? "text-slate-300" : "text-slate-600"} font-medium`}>
                                {activeDecision.rationale}
                              </p>
                            </div>
                          </div>

                          <button 
                            onClick={() => setQuizActive(true)}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 mt-8 transition-colors shadow-sm"
                          >
                            OK (Uji Kuis Kasus)
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        // Phase B: Display 5 MCQ Quizzes generated dynamically by Groq AI
                        <div className="flex flex-col justify-between h-full flex-grow">
                          <div>
                            <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-slate-400">
                              CASE EVALUATION QUIZ SET - {currentQuizIndex + 1} OF 5
                            </span>
                            <h3 className={`text-base font-bold tracking-tight mt-2 mb-1 ${isDarkAccent ? "text-slate-150" : "text-slate-900"}`}>
                              Uji Pemahaman Klinis Mendalam ({currentQuizIndex + 1}/5)
                            </h3>
                            <p className={`text-[11px] ${subTextClass} mb-4 leading-normal`}>
                              Jawab 5 kuis buatan Groq AI yang berkaitan dengan skenario {cases[currentCaseIndex].name}. Setiap pertanyaan menguji aspek klinis berbeda:
                            </p>

                            {/* Progress bar showing quiz progress */}
                            <div className="mb-4 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className={`text-[9px] font-bold uppercase tracking-wider ${subTextClass}`}>
                                  {currentQuizIndex === 0 && "Tanda Vital & Patofisiologi"}
                                  {currentQuizIndex === 1 && "Algoritma Triage START/ESI"}
                                  {currentQuizIndex === 2 && "Tindakan Prioritas Medis"}
                                  {currentQuizIndex === 3 && "Diagnosis Banding & Kondisi"}
                                  {currentQuizIndex === 4 && "Monitoring & Komplikasi"}
                                </span>
                              </div>
                              <div className={`h-1.5 rounded-full overflow-hidden ${isDarkAccent ? "bg-neutral-800" : "bg-slate-200"}`}>
                                <div 
                                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                                  style={{ width: `${((currentQuizIndex + 1) / 5) * 100}%` }}
                                ></div>
                              </div>
                            </div>

                            {/* Current Quiz Display */}
                            {quizzes[currentQuizIndex] && (
                              <>
                                <div className={`p-3.5 rounded-[1.25rem] border mb-4 text-xs font-bold leading-relaxed ${isDarkAccent ? "bg-neutral-850/40 border-neutral-850 text-slate-200" : "bg-slate-50 border-slate-100 text-slate-800 shadow-sm shadow-slate-100/40"}`}>
                                  {quizzes[currentQuizIndex].question}
                                </div>

                                <div className="space-y-2">
                                  {quizzes[currentQuizIndex].options.map((option: string, index: number) => {
                                    const optionLetter = ["A", "B", "C", "D"][index];
                                    const isSelected = selectedQuizOption === optionLetter;
                                    const isCorrectAnswer = optionLetter === quizzes[currentQuizIndex].correctAnswer;
                                    const hasChosen = selectedQuizOption !== null;

                                    let btnClass = "";
                                    let badgeClass = "";

                                    if (hasChosen) {
                                      if (isCorrectAnswer) {
                                        btnClass = isDarkAccent 
                                          ? "bg-emerald-950/40 border-emerald-500 text-emerald-200" 
                                          : "bg-emerald-50/70 border-emerald-300 text-emerald-950 font-semibold";
                                        badgeClass = "bg-emerald-500 text-white";
                                      } else if (isSelected) {
                                        btnClass = isDarkAccent 
                                          ? "bg-red-950/40 border-red-500 text-slate-200" 
                                          : "bg-red-50/70 border-red-300 text-red-950 font-semibold";
                                        badgeClass = "bg-red-500 text-white";
                                      } else {
                                        btnClass = isDarkAccent 
                                          ? "border-neutral-850 text-slate-500 opacity-60" 
                                          : "border-slate-100 text-slate-400 opacity-60";
                                        badgeClass = isDarkAccent ? "bg-neutral-800 text-neutral-600" : "bg-slate-100 text-slate-400";
                                      }
                                    } else {
                                      btnClass = isDarkAccent 
                                        ? "border-neutral-800 hover:bg-neutral-800/40 hover:border-neutral-700 text-slate-350" 
                                        : "border-slate-100 hover:bg-indigo-50/10 hover:border-slate-200 text-slate-705 shadow-sm shadow-slate-100/10";
                                      badgeClass = isDarkAccent ? "bg-neutral-800 text-slate-400" : "bg-slate-50 text-slate-600";
                                    }

                                    return (
                                      <button
                                        key={index}
                                        disabled={hasChosen}
                                        onClick={() => {
                                          setSelectedQuizOption(optionLetter);
                                          if (optionLetter === quizzes[currentQuizIndex].correctAnswer) {
                                            audioEngine.playSuccess();
                                          } else {
                                            audioEngine.playFailure();
                                          }
                                        }}
                                        className={`w-full border p-3 rounded-xl flex items-center justify-between text-left text-xs transition-transform duration-200 ease-out ${btnClass}`}
                                      >
                                        <div className="flex items-center gap-2.5">
                                          <span className={`w-5.5 h-5.5 rounded-lg text-[9px] font-bold font-mono flex items-center justify-center shrink-0 ${badgeClass}`}>
                                            {optionLetter}
                                          </span>
                                          <span className="leading-tight text-[11px]">{option}</span>
                                        </div>
                                        {hasChosen && isCorrectAnswer && (
                                          <CheckCircle className="text-emerald-550 w-4 h-4 shrink-0" />
                                        )}
                                        {hasChosen && isSelected && !isCorrectAnswer && (
                                          <XCircle className="text-red-550 w-4 h-4 shrink-0" />
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>

                                {selectedQuizOption !== null && (
                                  <div className={`mt-4 p-3 rounded-xl border text-[11px] leading-relaxed max-h-[140px] overflow-y-auto transition-all ${isDarkAccent ? "bg-neutral-850/40 border-neutral-800 text-slate-300" : "bg-indigo-50/30 border-indigo-100/40 text-indigo-950"}`}>
                                    <div className="flex justify-between items-center mb-1.5 pb-1 border-b border-indigo-100/20">
                                      <span className={`font-bold flex items-center gap-1.5 ${isDarkAccent ? "text-indigo-300" : "text-indigo-950"}`}>
                                        <BookOpen className="w-3 h-3 text-indigo-500" />
                                        Penjelasan Kuis:
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const currentQ = quizzes[currentQuizIndex];
                                          const status = selectedQuizOption === currentQ.correctAnswer ? "Jawaban Anda Betul!" : "Jawaban kurang tepat.";
                                          const call = `${status} Penjelasan kuis: ${currentQ.explanation}`;
                                          audioEngine.speakText(call);
                                        }}
                                        className={`px-2 py-0.5 text-[8px] font-bold rounded flex items-center gap-1 border transition-all ${isDarkAccent ? "bg-neutral-800 border-neutral-700 hover:bg-neutral-750 text-indigo-400" : "bg-indigo-50 border-indigo-100 hover:bg-indigo-100 text-indigo-750"}`}
                                      >
                                        <Volume2 className="w-2.5 h-2.5 animate-pulse" />
                                        Dengar Kuis (TTS)
                                      </button>
                                    </div>
                                    <p className="font-medium text-slate-600">
                                      {quizzes[currentQuizIndex]?.explanation}
                                    </p>
                                  </div>
                                )}
                              </>
                            )}
                          </div>

                          <button 
                            disabled={selectedQuizOption === null}
                            onClick={handleSubmitQuizAnswer}
                            className={`w-full font-bold py-3 rounded-xl text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 mt-6 transition-all ${
                              selectedQuizOption !== null 
                                ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm" 
                                : "bg-slate-100 text-slate-400 cursor-not-allowed"
                            }`}
                          >
                            {currentQuizIndex < 4 ? (
                              <>
                                Lanjut ke Kuis {currentQuizIndex + 2}/5
                                <ChevronRight className="w-4 h-4" />
                              </>
                            ) : (
                              <>
                                Selesaikan Seri Kuis
                                <CheckCircle className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                </div>

              </div>
            )}
            
          </div>
        )}

        {/* TAB: ACTIVITY HISTORY RECORDER TABLE */}
        {activeTab === "history" && (
          <div id="activity-tab-content" className="w-full max-w-5xl mx-auto space-y-6">
            <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-50 pb-4">
                <div>
                  <h1 className="text-lg md:text-xl font-bold tracking-tight text-slate-900">Training Activity Log</h1>
                  <p className="text-xs text-slate-500 mt-0.5">Histori rekaman hasil pengelompokan triage dan analisis logis.</p>
                </div>
                {history.length > 0 && (
                  <button 
                    onClick={() => {
                      if (confirm("Apakah Anda ingin menghapus seluruh riwayat latihan?")) {
                        handleClearHistory();
                      }
                    }}
                    className="px-4 py-2 border border-rose-100 text-rose-600 rounded-xl hover:bg-rose-50 text-xs font-bold transition-all shrink-0"
                  >
                    Clear History Logs
                  </button>
                )}
              </div>

              {/* Data Table display */}
              <div className="overflow-x-auto border border-slate-100 rounded-2xl bg-slate-50/50">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-150 border-b border-slate-100 text-[10px] uppercase font-bold tracking-wider text-slate-500">
                      <th className="p-4 font-mono">Patient</th>
                      <th className="p-4 font-mono">Diagnosis / Complaint</th>
                      <th className="p-4 font-mono">Prediksi Dokter</th>
                      <th className="p-4 font-mono">Sebenarnya</th>
                      <th className="p-4 text-center font-mono">Hasil Evaluasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {history.map((h, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-bold text-slate-800 whitespace-nowrap">{h.patientName}</td>
                        <td className="p-4 text-slate-500 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">{h.chiefComplaint}</td>
                        <td className="p-4 whitespace-nowrap">
                          <span className={`font-mono font-bold uppercase ${h.userDecision === "red" ? "text-red-600" : h.userDecision === "yellow" ? "text-amber-600" : "text-emerald-600"}`}>
                            {h.userDecision}
                          </span>
                        </td>
                        <td className="p-4 whitespace-nowrap font-bold uppercase font-mono">
                          {h.correctDecision}
                        </td>
                        <td className="p-4 text-center whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold ${h.isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                            {h.isCorrect ? "CORRECT" : "INCORRECT"}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {history.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-12 text-center italic text-slate-400">
                          Belum ada aktivitas triage yang terekam. Silakan menyelesaikan simulasi di menu 'Simulator' untuk merekam data.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: ANALYTICS */}
        {activeTab === "analytics" && (
          <div id="analytics-tab-content" className="w-full max-w-5xl mx-auto space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full">
              {/* Precision Gauge display (col-span-4) */}
              <div className="md:col-span-4 bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] flex flex-col justify-between items-center text-center min-h-[300px]">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono">Triage Precision Index</span>
                
                <div className="relative flex items-center justify-center w-36 h-36 my-4">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="72" cy="72" r="55" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                    <circle cx="72" cy="72" r="55" stroke="#4f46e5" strokeWidth="12" fill="transparent" 
                      strokeDasharray={345}
                      strokeDashoffset={345 - (345 * (stats.accuracyRate || 0)) / 100}
                    />
                  </svg>
                  <span className="absolute text-3xl font-extrabold font-mono text-slate-900">{stats.accuracyRate}%</span>
                </div>

                <div className="mt-2 text-xs font-semibold text-slate-500">
                  {stats.accuracyRate >= 80 ? (
                    <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">Presisi Sangat Kuat</span>
                  ) : stats.accuracyRate >= 50 ? (
                    <span className="text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">Kapasitas Sedang</span>
                  ) : (
                    <span className="text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">Tingkat Risiko Tinggi</span>
                  )}
                </div>
              </div>

              {/* Priority categories breakdown (col-span-8) */}
              <div className="md:col-span-8 bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[300px]">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono block mb-4">Kasus Terpecah Berdasarkan Kategori Standar Sebenarnya</span>
                
                <div className="space-y-4 flex-grow justify-center flex flex-col">
                  {/* Immediate Red */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                        Immediate (Red)
                      </span>
                      <span className="font-mono text-slate-400">{stats.triageBreakdown.red} kas</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-red-500 h-full rounded-full" style={{ width: `${stats.totalAttempted > 0 ? (stats.triageBreakdown.red / stats.totalAttempted) * 100 : 0}%` }}></div>
                    </div>
                  </div>

                  {/* Delayed Yellow */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
                        Delayed (Yellow)
                      </span>
                      <span className="font-mono text-slate-400">{stats.triageBreakdown.yellow} kas</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full rounded-full" style={{ width: `${stats.totalAttempted > 0 ? (stats.triageBreakdown.yellow / stats.totalAttempted) * 100 : 0}%` }}></div>
                    </div>
                  </div>

                  {/* Minor Green */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                        Minor (Green)
                      </span>
                      <span className="font-mono text-slate-400">{stats.triageBreakdown.green} kas</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${stats.totalAttempted > 0 ? (stats.triageBreakdown.green / stats.totalAttempted) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations guide */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <div className="bg-rose-50/30 rounded-3xl p-6 border border-rose-100 flex gap-4">
                <AlertTriangle className="text-rose-600 w-8 h-8 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-slate-800">Menghindari Under-Triage berbahaya</h4>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">
                    Klasifikasi salah pasien gawat darurat (Kategori Merah/Immediate) masuk sebagai golongan sedang dapat berdampak buruk. Pastikan hemodinamik sirkulasi tidak lolos dekompensasi saat memeriksa saturasi oksigen/nadi.
                  </p>
                </div>
              </div>

              <div className="bg-blue-50/30 rounded-3xl p-6 border border-blue-100 flex gap-4">
                <TrendingDown className="text-indigo-600 w-8 h-8 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-slate-800">Menekan Dampak Over-Triage berlebih</h4>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">
                    Memasukkan keluhan minor (Kategori Hijau) ke area resusitasi merah menyedot kapasitas tempat tidur darurat rumah sakit yang sangat terbatas. Maksimalkan ketepatan membaca vital signs.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB: STUDY REFERENCE SUPPORT / LESSON CORNER */}
        {activeTab === "support" && (
          <div id="support-tab-content" className="w-full max-w-5xl mx-auto space-y-6">
            <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <div className="p-3 bg-amber-50 rounded-2xl text-amber-700 shrink-0">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-lg md:text-xl font-bold tracking-tight text-slate-900">Clinical Guide & Study Reference</h1>
                  <p className="text-xs text-slate-500">Tingkatkan penalaran patofisiologi gawat darurat di sela-sela simulasi praktis.</p>
                </div>
              </div>

              {/* Selector pills */}
              <div className="flex gap-2 p-1 bg-slate-50 border border-slate-100 rounded-xl max-w-md">
                <button 
                  onClick={() => setSelectedGuideTopic("START")}
                  className={`flex-1 text-center py-2 rounded-lg text-xs font-bold transition-all ${selectedGuideTopic === "START" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:bg-white/50"}`}
                >
                  Metode START (Insiden Korban Massal)
                </button>
                <button 
                  onClick={() => setSelectedGuideTopic("ESI")}
                  className={`flex-1 text-center py-2 rounded-lg text-xs font-bold transition-all ${selectedGuideTopic === "ESI" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:bg-white/50"}`}
                >
                  Pedoman ESI (Emergency Severity Index)
                </button>
              </div>

              {/* Content box details */}
              {selectedGuideTopic === "START" ? (
                <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100/80 text-xs text-slate-600 leading-relaxed space-y-3">
                  <p className="text-sm font-semibold text-slate-800">Metodologi Simple Triage and Rapid Treatment (START)</p>
                  <p>
                    Algoritme START diprioritaskan untuk pemilahan cepat korban dalam bencana atau insiden gawat darurat massal kurang dari 60 detik per pasien, berfokus pada tiga pilar fungsional organ:
                  </p>
                  <ul className="list-decimal pl-5 space-y-2 text-xs">
                    <li>
                      <strong>Respiration (Laju Napas):</strong> Jika tidak bernapas, rapikan posisi leher untuk membuka jalan napas. Bila masih tidak bernapas, beri tag <strong>Hitam (Deceased)</strong>. Jika bernapas &gt;30 kali/menit, langsung beri tag <strong>Merah (Immediate)</strong>.
                    </li>
                    <li>
                      <strong>Perfusi (Sirkulasi):</strong> Periksa denyut nadi radialis. Jika nadi hilang atau pengisian kapiler (capillary refill) &gt;2 detik, beri tag <strong>Merah (Immediate)</strong>.
                    </li>
                    <li>
                      <strong>Mental Status (Kesadaran):</strong> Jika mampu mengikuti perintah sederhana (meremas tangan), beri tag <strong>Kuning (Delayed)</strong>. Jika tidak sadar atau disorientasi berat, beri tag <strong>Merah (Immediate)</strong>.
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100/80 text-xs text-slate-600 leading-relaxed space-y-3">
                  <p className="text-sm font-semibold text-slate-800">Pedoman Emergency Severity Index (ESI) Rumah Sakit</p>
                  <p>
                    Sistem 5 level ESI disederhanakan dalam simulator UGD ini menjadi 3 kategori tingkat kegawatdaruratan utama:
                  </p>
                  <ul className="list-decimal pl-5 space-y-2 text-xs">
                    <li>
                      <strong>Setara Kategori Merah (Level 1 & 2):</strong> Kondisi kritis mengancam nyawa. Pasien membutuhkan intervensi penyelamatan jiwa segera (henti napas, trauma toraks terbuka, syok anafilaksis berat, amuk krisis pernapasan hebat).
                    </li>
                    <li>
                      <strong>Setara Kategori Kuning (Level 3):</strong> Situasi darurat berisiko tinggi. Organ terkompensasi penuh namun dapat memburuk cepat jika tidak ditangani segera (misal nyeri abdomen tajam dicurigai apendisitis akut, fraktur tulang tertutup parah).
                    </li>
                    <li>
                      <strong>Setara Kategori Hijau (Level 4 & 5):</strong> Kondisi minor ringan tidak urgent (pasien luka lecet luar, radang tenggorokan ringan biasa). Penanganan aman ditunda beberapa jam.
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: SETTINGS & DANGER CONTROLS */}
        {activeTab === "settings" && (
          <div id="settings-tab-content" className="w-full max-w-5xl mx-auto space-y-6">

            <div className={`${cardBgClass} rounded-[2rem] p-6 md:p-8 space-y-6 transition-all duration-300`}>
              <div className={`border-b ${isDarkAccent ? "border-neutral-800" : "border-slate-50"} pb-4`}>
                <h1 className={`text-lg md:text-xl font-bold tracking-tight ${mainTitleClass} flex items-center gap-1.5`}>
                  <Settings className="w-5 h-5 text-indigo-600/80 shrink-0" />
                  Settings & Environment Status
                </h1>
                <p className={`text-xs ${subTextClass} mt-0.5`}>Kustomisasi parameter simulasi.</p>
              </div>

              <div className="divide-y divide-slate-100 text-xs text-slate-600 space-y-4">
                

                {/* VISUAL STYLE & COLOR THEME OPTIONS */}
                <div className="py-5">
                  <h4 className={`font-bold ${isDarkAccent ? "text-slate-200" : "text-slate-800"} flex items-center gap-1.5 mb-1.5`}>
                    <Palette className="w-4 h-4 text-indigo-500 animate-pulse" />
                    Pilihan Tema Visual (Warna & Aksen)
                  </h4>
                  <p className={`text-[11px] ${subTextClass} mb-3`}>Ubah palet warna dominan dan mood visual draf proyek sesuai preferensi.</p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {[
                      { id: "classic-teal", label: "Classic Teal", color: "bg-teal-600", desc: "Medis Higienis" },
                      { id: "midnight-navy", label: "Midnight Navy", color: "bg-slate-900", desc: "Surgical Dark" },
                      { id: "amber-alert", label: "Amber Alert", color: "bg-amber-500", desc: "Kontras Tinggi" },
                      { id: "crimson-critical", label: "Crimson Red", color: "bg-red-650", desc: "Trauma Resus" },
                      { id: "dark-stealth", label: "Stealth Dark", color: "bg-neutral-950", desc: "Cyber Klinik" }
                    ].map((th) => (
                      <button 
                        key={th.id}
                        type="button"
                        onClick={() => {
                          setThemeAccent(th.id as any);
                          audioEngine.playTone(400, 0.1, "sine");
                        }}
                        className={`flex flex-col gap-1 text-left p-2.5 rounded-xl border transition-all ${themeAccent === th.id ? (isDarkAccent ? "border-indigo-500 bg-indigo-950/20 shadow-md ring-1 ring-indigo-500/50" : "border-indigo-600 bg-indigo-50/20 shadow-sm") : (isDarkAccent ? "border-neutral-800 hover:bg-neutral-850/60" : "border-slate-100 hover:bg-slate-50")}`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className={`w-3 h-3 rounded-full ${th.color} shrink-0`} />
                          <span className={`font-bold text-[11px] ${isDarkAccent ? "text-slate-100" : "text-slate-800"}`}>{th.label}</span>
                        </div>
                        <span className={`text-[9px] ${subTextClass}`}>{th.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ACCESSIBILITY & FONTS OPTIONS */}
                <div className="py-5">
                  <h4 className={`font-bold ${isDarkAccent ? "text-slate-200" : "text-slate-800"} flex items-center gap-1.5 mb-1.5`}>
                    <Type className="w-4 h-4 text-indigo-505" />
                    Aspek Aksesibilitas Font & Teks
                  </h4>
                  <p className={`text-[11px] ${subTextClass} mb-3`}>Sesuaikan ukuran teks dasar dan jenis fon agar nyaman dibaca.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className={`p-3 rounded-xl border ${isDarkAccent ? "bg-neutral-850/40 border-neutral-800" : "bg-slate-50/80 border-slate-100"}`}>
                      <span className={`text-[10.5px] font-bold ${subTextClass} uppercase block mb-1.5 font-mono`}>Ukuran Dasar Fon (Font Sizing)</span>
                      <div className="grid grid-cols-4 gap-1 p-1 bg-white/70 dark:bg-neutral-900 rounded-lg border border-slate-200/50">
                        {[
                          { id: "sm", label: "Kecil" },
                          { id: "base", label: "Normal" },
                          { id: "lg", label: "Besar" },
                          { id: "xl", label: "Ekstra" }
                        ].map((sz) => (
                          <button 
                            key={sz.id}
                            type="button"
                            onClick={() => setFontScale(sz.id as any)}
                            className={`py-1 text-center text-[10px] font-bold rounded-md transition-all ${fontScale === sz.id ? "bg-indigo-600 text-white shadow-sm" : (isDarkAccent ? "text-slate-400 hover:text-white" : "text-slate-500 hover:bg-slate-100")}`}
                          >
                            {sz.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className={`p-3 rounded-xl border ${isDarkAccent ? "bg-neutral-850/40 border-neutral-800" : "bg-slate-50/80 border-slate-100"}`}>
                      <span className={`text-[10.5px] font-bold ${subTextClass} uppercase block mb-1.5 font-mono`}>Keluarga Fon (Font Family)</span>
                      <div className="grid grid-cols-3 gap-1 p-1 bg-white/70 dark:bg-neutral-900 rounded-lg border border-slate-200/50">
                        <button 
                          type="button"
                          onClick={() => setFontFamily("sans")}
                          className={`py-1 text-center text-[10px] font-bold rounded-md transition-all ${fontFamily === "sans" ? "bg-indigo-600 text-white shadow-sm" : (isDarkAccent ? "text-slate-400 hover:text-white" : "text-slate-500 hover:bg-slate-100")}`}
                        >
                          Inter Sans
                        </button>
                        <button 
                          type="button"
                          onClick={() => setFontFamily("mono")}
                          className={`py-1 text-center text-[10px] font-mono font-bold rounded-md transition-all ${fontFamily === "mono" ? "bg-indigo-600 text-white shadow-sm" : (isDarkAccent ? "text-slate-400 hover:text-white" : "text-slate-500 hover:bg-slate-100")}`}
                        >
                          JetMono
                        </button>
                        <button 
                          type="button"
                          onClick={() => setFontFamily("dyslexic")}
                          style={{ fontFamily: "Comic Sans MS, sans-serif" }}
                          className={`py-1 text-center text-[10px] font-bold rounded-md transition-all ${fontFamily === "dyslexic" ? "bg-indigo-600 text-white shadow-sm" : (isDarkAccent ? "text-slate-400 hover:text-white" : "text-slate-500 hover:bg-slate-100")}`}
                        >
                          Dyslexia
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SOUND & AUDIO CONTROLS */}
                <div className="py-5">
                  <h4 className={`font-bold ${isDarkAccent ? "text-slate-200" : "text-slate-800"} flex items-center gap-1.5 mb-1.5`}>
                    <Volume2 className="w-4 h-4 text-indigo-650" />
                    Audio Gawat Darurat & Sonifikasi
                  </h4>
                  <p className={`text-[11px] ${subTextClass} mb-3`}>Kelola efek suara, suara musik latar belakang drone UGD, serta suara sonifikasi denyut jantung terus menerus.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button 
                      type="button"
                      onClick={() => {
                        const next = !isMuted;
                        setIsMuted(next);
                        audioEngine.setMute(next);
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl border text-[11px] font-bold transition-all ${isMuted ? "bg-red-50/50 border-red-200 text-red-700" : "bg-emerald-50/50 border-emerald-200 text-emerald-800"}`}
                    >
                      <span className="flex items-center gap-1.5">
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        Mute Efek Suara
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-wider bg-white/80 px-2 py-0.5 rounded-md">
                        {isMuted ? "MUTED" : "ON"}
                      </span>
                    </button>

                    <button 
                      type="button"
                      onClick={() => {
                        if (isMuted) {
                          setIsMuted(false);
                          audioEngine.setMute(false);
                        }
                        const next = !isAmbientOn;
                        setIsAmbientOn(next);
                        if (next) {
                          audioEngine.startAmbient();
                        } else {
                          audioEngine.stopAmbient();
                        }
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl border text-[11px] font-bold transition-all ${isAmbientOn ? "bg-indigo-50/50 border-indigo-200 text-indigo-800" : (isDarkAccent ? "border-neutral-800 hover:bg-neutral-850/60 text-slate-300 bg-neutral-900" : "border-slate-100 hover:bg-slate-50 text-slate-600 bg-white")}`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Music className="w-4 h-4" />
                        Musik Drone UGD (Ambient)
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-wider bg-white/80 px-2 py-0.5 rounded-md">
                        {isAmbientOn ? "PLAYING" : "STOP"}
                      </span>
                    </button>

                    <button 
                      type="button"
                      onClick={() => {
                        if (isMuted) {
                          setIsMuted(false);
                          audioEngine.setMute(false);
                        }
                        setIsHeartSoundOn(!isHeartSoundOn);
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl border text-[11px] font-bold transition-all ${isHeartSoundOn ? "bg-indigo-50/50 border-indigo-200 text-indigo-800" : (isDarkAccent ? "border-neutral-800 hover:bg-neutral-850/60 text-slate-300 bg-neutral-900" : "border-slate-100 hover:bg-slate-50 text-slate-600 bg-white")}`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Heart className={`w-4 h-4 ${isHeartSoundOn ? "text-red-500 fill-red-500 animate-pulse" : "text-slate-400"}`} />
                        Denyut Jantung (Pulse Sonify)
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-wider bg-white/80 px-2 py-0.5 rounded-md">
                        {isHeartSoundOn ? "ACTIVE" : "STANDBY"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Danger zone resetters */}
                <div className="pt-6">
                  <h4 className="font-bold text-rose-700 block mb-1">Daerah Bahaya (Danger Zone)</h4>
                  <p className="text-[10px] text-slate-400 block mb-4">Aksi pembersihan permanen data lokal latihan atau data scenario.</p>
                  
                  <div className="flex flex-wrap gap-3">
                    <button 
                      onClick={() => {
                        if (confirm("Reset ulang portal ke skenario awal? Semua kasus AI generatif buatan lama Anda akan dihapus.")) {
                          handleRestartSimulation();
                          alert("Simulator diatur ulang ke skenario default.");
                        }
                      }}
                      className="px-4 py-2 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl hover:bg-rose-100 transition-colors text-xs font-bold"
                    >
                      Reset Skenario Default
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm("Apakah Anda ingin menghapus seluruh data analitik dan riwayat triage medis Anda secara permanen?")) {
                          handleClearHistory();
                          alert("Seluruh data analitik dan tabel riwayat dibersihkan.");
                        }
                      }}
                      className="px-4 py-2 bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-250 rounded-xl text-xs font-bold transition-colors"
                    >
                      Clear Database Historis
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </main>

      {/* SYNTHESIZE OR CREATE CASE MODAL WINDOW (DIALOG TOOL) */}
      {isNewCaseOpen && (
        <div id="triage-modal-container" className="fixed inset-0 bg-neutral-950/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div id="triage-modal-panel" className="bg-white rounded-[2rem] max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
            
            {/* Modal layout header */}
            <div className="flex justify-between items-center border-b border-slate-50 pb-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  Synthesize Clinical Patient
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">Sintesis skenario keluhan klinis logis dengan Gemini AI atau buat manual.</p>
              </div>
              <button 
                onClick={() => {
                  setIsNewCaseOpen(false);
                  setIsManualMode(false);
                }}
                className="text-slate-400 hover:text-slate-700 bg-slate-50 rounded-full p-1"
                aria-label="Tutup Dialog"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Selector modes toggle switcher */}
            <div className="flex gap-1.5 bg-slate-50 p-1 rounded-xl mb-4">
              <button 
                onClick={() => setIsManualMode(false)}
                className={`flex-1 text-center py-2 rounded-lg text-xs font-bold transition-all ${!isManualMode ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:bg-white/50"}`}
              >
                Gemini AI Generator
              </button>
              <button 
                onClick={() => setIsManualMode(true)}
                className={`flex-1 text-center py-2 rounded-lg text-xs font-bold transition-all ${isManualMode ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:bg-white/50"}`}
              >
                Formulir Manual
              </button>
            </div>

            {/* Synthesis error alerts display */}
            {generationError && (
              <div className="p-3 mb-4 rounded-xl bg-orange-50 border border-orange-100 text-orange-900 text-xs flex gap-2 items-start leading-relaxed animate-shake">
                <AlertTriangle className="w-5 h-5 shrink-0 text-orange-600 mt-0.5" />
                <div>
                  <strong>Sintesis AI Mengalami Kendala:</strong>
                  <p className="text-[10px] text-orange-700 mt-0.5">
                    {generationError}. Mohon cek sambungan server lokal atau kredensial API Key di Secrets.
                  </p>
                </div>
              </div>
            )}

            {/* Category Mode: Gemini AI Synthesis */}
            {!isManualMode ? (
              <div className="flex-grow flex flex-col justify-between overflow-y-auto">
                <div className="space-y-4 my-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">Model Patofisiologi Utama</label>
                    <select 
                      value={newCaseCategory}
                      onChange={(e) => setNewCaseCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs text-slate-800 focus:outline-indigo-600 focus:bg-white font-semibold"
                    >
                      <option value="Random">Skenario Acak (Acak Fisiologi)</option>
                      <option value="Sepsis & Infeksi Berat">Sepsis & Infeksi Berat (SIRS/Septisiti)</option>
                      <option value="Trauma & Pendarahan">Major Trauma & Pendarahan Hebat (Patah Tulang)</option>
                      <option value="Kardiovaskular & Nyeri Dada">Kardiovaskular (ACS / Gejala Infark Miokard)</option>
                      <option value="Gangguan Sistem Pernapasan">Sistem Pernapasan (Asma / Takipnea Kronis)</option>
                    </select>
                  </div>

                  <p className="text-xs text-indigo-900/90 bg-indigo-50/70 border border-indigo-100 p-3.5 rounded-xl leading-relaxed">
                    <strong>Pemberitahuan AI:</strong> Mesin AI Gemini 3.5 secara klinis menyeimbangkan tekanan darah, denyut nadi, laju respirator, kesadaran, dan rasio kepatutan medis triage agar akurat dan mendidik.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                  <button 
                    onClick={() => setIsNewCaseOpen(false)}
                    className="px-4 py-2 bg-slate-50 text-slate-500 rounded-xl text-xs font-bold font-sans hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button 
                    disabled={isGenerating}
                    onClick={handleGenerateAICase}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold font-sans hover:bg-indigo-700 transition-all flex items-center gap-1.5 shadow-sm shadow-indigo-100"
                  >
                    {isGenerating ? "Menyusun Skenario Medis..." : "Mulai Generasi AI"}
                    {!isGenerating && <Sparkles className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ) : (
              /* Category Mode: Offline Manual Input Card fields */
              <form onSubmit={handleCreateManualCase} className="space-y-3 flex-grow overflow-y-auto pr-1">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block mb-1">Nama Fiktif Pasien</label>
                    <input 
                      type="text" 
                      placeholder="Contoh: Tn. Heri"
                      value={manualName} 
                      onChange={(e) => setManualName(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block mb-1">Usia &amp; Gender</label>
                    <div className="flex gap-1.5">
                      <input 
                        type="number" 
                        value={manualAge} 
                        onChange={(e) => setManualAge(Number(e.target.value))}
                        required
                        className="w-16 bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-xs text-slate-800"
                      />
                      <select 
                        value={manualGender} 
                        onChange={(e) => setManualGender(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-xs text-slate-800"
                      >
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block mb-1">Keluhan Utama</label>
                  <textarea 
                    rows={2}
                    placeholder="Tulis ringkasan gejala dan trauma klinis..."
                    value={manualComplaint} 
                    onChange={(e) => setManualComplaint(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-xs text-slate-800"
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block mb-1">Tekanan Darah (mmHg)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 130/85" 
                      value={manualBP} 
                      onChange={(e) => setManualBP(e.target.value)} 
                      required
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block mb-1">Heart Rate (bpm)</label>
                    <input 
                      type="number" 
                      value={manualHR} 
                      onChange={(e) => setManualHR(Number(e.target.value))} 
                      required
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-xs text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block mb-1">Respirasi (x/mnt)</label>
                    <input 
                      type="number" 
                      value={manualRR} 
                      onChange={(e) => setManualRR(Number(e.target.value))} 
                      required
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block mb-1">Kesadaran GCS</label>
                    <input 
                      type="text" 
                      value={manualConsciousness} 
                      onChange={(e) => setManualConsciousness(e.target.value)} 
                      required
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-xs text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block mb-1">Rekomendasi Triage Layak</label>
                    <select 
                      value={manualTriage} 
                      onChange={(e) => setManualTriage(e.target.value as "green" | "yellow" | "red")}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-xs text-slate-800 font-bold"
                    >
                      <option value="green">🟢 Green (Minor)</option>
                      <option value="yellow">🟡 Yellow (Delayed)</option>
                      <option value="red">🔴 Red (Immediate)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block mb-1">Rasional Medis</label>
                  <textarea 
                    rows={2}
                    placeholder="Alasan patut keluhan penanda vital sesuai klasifikasi..."
                    value={manualRationale} 
                    onChange={(e) => setManualRationale(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-xs text-slate-800"
                  ></textarea>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white py-1">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsNewCaseOpen(false);
                      setIsManualMode(false);
                    }}
                    className="px-4 py-2 bg-slate-50 text-slate-500 rounded-xl text-xs font-bold font-sans"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
                  >
                    Simpan Kasus Manual
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
    </>
  );
}
