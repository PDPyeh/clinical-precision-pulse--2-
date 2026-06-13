import React, { useState, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

interface DisclaimerModalProps {
  isOpen: boolean;
  onAcknowledge: () => void;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({
  isOpen,
  onAcknowledge,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-amber-500 to-red-500 p-6 flex items-center gap-3 text-white">
          <AlertTriangle className="w-6 h-6 shrink-0" />
          <h2 className="text-2xl font-bold">MEDICAL DISCLAIMER</h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-slate-900 dark:text-slate-100">
          <section className="space-y-3">
            <h3 className="font-bold text-lg text-amber-600 dark:text-amber-400">
              ⚠️ EDUCATIONAL USE ONLY
            </h3>
            <p className="text-sm leading-relaxed">
              This interactive health assessment and triage simulator is designed{" "}
              <span className="font-bold">EXCLUSIVELY for educational purposes</span>{" "}
              for medical students and healthcare professionals in training. This is{" "}
              <span className="font-bold">NOT a clinical decision support system</span>.
            </p>
          </section>

          <section className="space-y-3 bg-red-50 dark:bg-red-950/30 p-4 rounded-lg border border-red-200 dark:border-red-800">
            <h3 className="font-bold text-red-700 dark:text-red-300">
              ❌ DO NOT USE FOR CLINICAL CARE
            </h3>
            <ul className="text-sm space-y-2 ml-4">
              <li>
                • This simulator is a{" "}
                <span className="font-semibold">TEACHING TOOL ONLY</span>, not for
                real patient management
              </li>
              <li>
                • Do NOT use results for actual patient triage or diagnosis
              </li>
              <li>
                • Real patient management <span className="font-semibold">REQUIRES</span>{" "}
                qualified medical professionals and proper clinical assessment
              </li>
              <li>
                • AI-generated feedback may contain inaccuracies or clinical
                limitations
              </li>
            </ul>
          </section>

          <section className="space-y-3 bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-bold text-blue-700 dark:text-blue-300">
              ℹ️ Limitation of Liability
            </h3>
            <ul className="text-sm space-y-2 ml-4">
              <li>
                • All clinical scenarios and AI-generated feedback are educational
                approximations
              </li>
              <li>
                • Medical and clinical accuracy may vary; professional review is
                always necessary
              </li>
              <li>
                • Users assume full responsibility for all clinical decisions and
                outcomes
              </li>
              <li>
                • Developers and creators are{" "}
                <span className="font-semibold">NOT liable</span> for misuse,
                clinical errors, or adverse outcomes resulting from use of this
                simulator
              </li>
            </ul>
          </section>

          <section className="space-y-3 bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <h3 className="font-bold text-green-700 dark:text-green-300">
              ✓ By Using This Simulator, You Acknowledge:
            </h3>
            <ul className="text-sm space-y-2 ml-4">
              <li>✓ You understand this is educational content only</li>
              <li>
                ✓ You will NOT use this simulator for actual patient care decisions
              </li>
              <li>
                ✓ You understand the limitations of AI-generated medical content
              </li>
              <li>
                ✓ You are responsible for verifying all clinical information with
                authoritative medical sources
              </li>
              <li>✓ You are using this tool within appropriate educational context</li>
            </ul>
          </section>

          <section className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              <span className="font-semibold">Intellectual Property:</span> All
              clinical content, scenarios, and materials in this simulator are
              provided for educational purposes. Reproduction or commercial use
              requires explicit permission.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-50 dark:bg-neutral-800 p-6 border-t border-slate-200 dark:border-slate-700 flex gap-3">
          <button
            onClick={onAcknowledge}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            I Acknowledge & Accept
          </button>
        </div>
      </div>
    </div>
  );
};
