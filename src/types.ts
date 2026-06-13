export interface Quiz {
  question: string;
  options: string[];
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
}

export interface PatientCase {
  id: string;
  name: string;
  age: number;
  gender: "Laki-laki" | "Perempuan" | string;
  chiefComplaint: string;
  vitals: {
    bloodPressure: string;
    heartRate: number;
    respiratoryRate: number;
    consciousness: string;
  };
  correctTriage: "green" | "yellow" | "red";
  rationale: string;
  questionName: string;
}

export interface QuizHistory {
  id: string;
  patientName: string;
  chiefComplaint: string;
  userDecision: "green" | "yellow" | "red";
  correctDecision: "green" | "yellow" | "red";
  isCorrect: boolean;
  timestamp: string;
  rationale: string;
}

export interface SimulationStats {
  totalAttempted: number;
  totalCorrect: number;
  accuracyRate: number;
  triageBreakdown: {
    green: number;
    yellow: number;
    red: number;
  };
}

export const INITIAL_STATS: SimulationStats = {
  totalAttempted: 0,
  totalCorrect: 0,
  accuracyRate: 0,
  triageBreakdown: {
    green: 0,
    yellow: 0,
    red: 0,
  },
};
