import React from "react";

interface PatientAvatarProps {
  gender: string;
  age: number;
  triage: "green" | "yellow" | "red";
  respiratoryRate: number;
}

export const PatientAvatar: React.FC<PatientAvatarProps> = ({
  gender,
  age,
  triage,
  respiratoryRate,
}) => {
  const isFemale = gender.toLowerCase().includes("perempuan") || gender.toLowerCase().includes("wanita") || gender.toLowerCase().includes("ny.") || gender.toLowerCase().includes("nona");
  const isChild = age < 14;
  const isElderly = age >= 60;

  // Map triage state to visual properties
  let skinColor = "#fcd34d"; // Default warm peach skin
  let mouthPath = "M 40 68 Q 50 78 60 68"; // Nice smiling curve
  let eyesPath = "M 32 45 A 3 3 0 0 1 38 45 M 62 45 A 3 3 0 0 1 68 45"; // Calm open eyes
  let expressionDetails: React.ReactNode = null;

  if (triage === "green") {
    skinColor = "#f5ebd6"; // Healthy soft skin tone
    mouthPath = "M 42 66 Q 50 75 58 66"; // Happy peaceful smile
  } else if (triage === "yellow") {
    skinColor = "#fdf2e9"; // Slightly warm flushed skin
    mouthPath = "M 42 70 Q 50 67 58 70"; // Rigid flat mouth indicating distress
    eyesPath = "M 32 46 Q 35 43 38 46 M 62 46 Q 65 43 68 46"; // Tense slightly closed eyes
    expressionDetails = (
      <g>
        {/* Beads of cold sweat */}
        <circle cx="34" cy="35" r="1.5" fill="#38bdf8" opacity="0.8" />
        <circle cx="68" cy="38" r="1.2" fill="#38bdf8" opacity="0.8" />
        {/* Small bandage on forehead */}
        <rect x="42" y="24" width="16" height="5" rx="1.5" fill="#fbcfe8" stroke="#db2777" strokeWidth="0.5" transform="rotate(-5, 50, 26)" />
        <line x1="50" y1="23" x2="50" y2="30" stroke="#db2777" strokeWidth="0.5" />
      </g>
    );
  } else if (triage === "red") {
    skinColor = "#e0f2fe"; // Pale, bluish-grey cold skin (shock/cyanosis)
    mouthPath = "M 43 72 Q 50 65 57 72"; // Wincing curved downward frown
    eyesPath = "M 31 48 L 37 44 M 31 44 L 37 48 M 63 48 L 69 44 M 63 44 L 69 48"; // Wincing "X" pain eyelids
    expressionDetails = (
      <g>
        {/* Heavier distress sweat drops */}
        <path d="M 28 36 Q 28 41 26 43" stroke="#0ea5e9" strokeWidth="1.2" fill="none" />
        <circle cx="70" cy="52" r="1.8" fill="#0ea5e9" opacity="0.9" />
        
        {/* Clinical Oxygen Ventilation Mask overlay */}
        <path d="M 38 58 L 50 50 L 62 58 L 56 75 L 44 75 Z" fill="rgba(6, 182, 212, 0.45)" stroke="#06b6d4" strokeWidth="1.5" />
        {/* Highlight on oxygen mask */}
        <path d="M 43 56 L 47 52" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
        {/* Elastic retention band behind head */}
        <path d="M 38 58 C 24 56 22 48 20 48" stroke="#0369a1" strokeWidth="1" strokeDasharray="2,2" fill="none" />
        <path d="M 62 58 C 76 56 78 48 80 48" stroke="#0369a1" strokeWidth="1" strokeDasharray="2,2" fill="none" />
        {/* Supply Tubing extending downwards */}
        <path d="M 50 74 C 50 85 45 92 48 100" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.8" />
      </g>
    );
  }

  // Animation timing matched to respiratory rate
  // RR = respirations per minute. Cycle time = 60 / RR seconds
  const breathingPeriodSec = Math.max(1.2, Math.min(8.0, 60 / respiratoryRate));

  return (
    <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-inner w-full max-w-[140px] shrink-0">
      
      {/* SVG Container on which we apply animation bobbing */}
      <svg
        id="layer-patient-svg"
        viewBox="0 0 100 100"
        className="w-24 h-24 select-none drop-shadow-md"
        xmlns="http://www.w3.org/2000/svg"
      >
        <style>{`
          @keyframes chestBreathe {
            0% { transform: scale(1.0); }
            50% { transform: scale(1.06) translate(0px, -2px); }
            100% { transform: scale(1.0); }
          }
          @keyframes headBob {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-0.8px); }
            100% { transform: translateY(0px); }
          }
          .animate-chest {
            transform-origin: 50px 85px;
            animation: chestBreathe ${breathingPeriodSec}s ease-in-out infinite;
          }
          .animate-head {
            transform-origin: 50px 50px;
            animation: headBob ${breathingPeriodSec}s ease-in-out infinite;
          }
        `}</style>

        {/* Ambient indicator aura */}
        <circle cx="50" cy="50" r="46" fill={`url(#auraglow-${triage})`} opacity="0.32" />

        {/* 1. Lungs / Neck / Torso (Animate with breathing) */}
        <g className="animate-chest">
          {/* Shoulders and upper chest clothes */}
          <path
            d="M 15 95 L 85 95 C 80 82 72 74 58 74 L 42 74 C 28 74 20 82 15 95 Z"
            fill={isChild ? "#22c55e" : triage === "red" ? "#ef4444" : "#4338ca"} // child has bright green vest, critical red, trauma blue jersey
          />
          {/* Standard patient neck collar */}
          <path d="M 42 74 L 58 74 L 54 84 L 46 84 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.5" />
          
          {/* Medical neck brace if Red is Trauma case (implied) */}
          {triage === "red" && (
            <g>
              <rect x="36" y="75" width="28" height="7" rx="1" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
              <rect x="44" y="75" width="12" height="7" fill="#dc2626" opacity="0.6" />
            </g>
          )}
        </g>

        {/* 2. Head / Faces / Expressions (Animate with subtle syncing headBob) */}
        <g className="animate-head">
          {/* Head Shape */}
          <circle cx="50" cy="48" r="22" fill={skinColor} stroke="#d1d5db" strokeWidth="0.5" />

          {/* Elderly face details */}
          {isElderly && (
            <g>
              {/* Forehead wrinkles */}
              <path d="M 40 33 Q 50 31 60 33" stroke="#94a3b8" strokeWidth="0.5" strokeLinecap="round" fill="none" opacity="0.5" />
              <path d="M 43 36 Q 50 34 57 36" stroke="#94a3b8" strokeWidth="0.5" strokeLinecap="round" fill="none" opacity="0.5" />
            </g>
          )}

          {/* Eyes draws */}
          <path d={eyesPath} stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" fill="none" />

          {/* Cheeks blush (Kids have bright rosy red cheeks) */}
          {isChild && (
            <g>
              <circle cx="32" cy="52" r="3.2" fill="#f87171" opacity="0.5" />
              <circle cx="68" cy="52" r="3.2" fill="#f87171" opacity="0.5" />
            </g>
          )}

          {/* Mouth curve */}
          <path d={mouthPath} stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" fill="none" />

          {/* Nose bump */}
          <path d="M 49 46 Q 51 51 48 53" stroke="#b45309" strokeWidth="0.8" fill="none" opacity="0.3" />

          {/* Ears drawn as custom paths */}
          <circle cx="27" cy="48" r="4" fill={skinColor} stroke="#d1d5db" strokeWidth="0.5" />
          <circle cx="73" cy="48" r="4" fill={skinColor} stroke="#d1d5db" strokeWidth="0.5" />

          {/* HAIRSTYLES */}
          {isElderly ? (
            // Elderly Hairstyles (Silver waves)
            isFemale ? (
              <path d="M 23 44 C 23 23, 77 23, 77 44 C 82 45, 90 60, 78 58 C 76 34, 24 34, 22 58 C 10 60, 18 45, 23 44" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="0.5" />
            ) : (
              // Balding elderly man silver sides
              <path d="M 26 48 C 22 28, 25 35, 33 34 C 36 34, 42 22, 50 25 C 58 22, 64 34, 67 34 C 75 35, 78 28, 74 48" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.5" opacity="0.9" />
            )
          ) : isChild ? (
            // Kid Hairstyles (Playful curls)
            <path d="M 24 45 C 24 23, 76 23, 76 45 C 68 25, 32 25, 24 45 M 46 22 Q 52 14 54 18" fill="#b45309" stroke="#78350f" strokeWidth="0.5" />
          ) : isFemale ? (
            // Standard Female Hair (Ny.) (Long brunette hair)
            <path d="M 23 44 C 23 20, 77 20, 77 44 C 81 50, 83 68, 75 70 C 72 40, 28 40, 25 70 C 17 68, 19 50, 23 44" fill="#78350f" stroke="#451a03" strokeWidth="0.5" />
          ) : (
            // Standard Male Hair (Short cropped black hair)
            <path d="M 24 46 Q 26 23 50 21 Q 74 23 76 46 Q 66 30 50 32 Q 34 30 24 46" fill="#1e293b" />
          )}

          {/* Glasses for elderly */}
          {isElderly && (
            <g stroke="#4b5563" strokeWidth="1" fill="none">
              <circle cx="37" cy="45" r="5" />
              <circle cx="63" cy="45" r="5" />
              <line x1="42" y1="45" x2="58" y2="45" />
            </g>
          )}

          {/* Trigger expressions details overlay (Mask or wounds) */}
          {expressionDetails}
        </g>

        {/* Dynamic radial gradient defs */}
        <defs>
          <radialGradient id="auraglow-green" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="auraglow-yellow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="auraglow-red" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="auraglow-indigo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
      
      {/* Age/Gender sub-marker labels */}
      <span className="text-[10px] font-sans font-bold text-slate-800 uppercase tracking-tight mt-2">{isChild ? "Anak-Anak" : isElderly ? "Lansia" : "Dewasa"}</span>
      <span className="text-[8px] font-mono text-slate-400 capitalize mt-0.5">{gender}</span>
    </div>
  );
};
