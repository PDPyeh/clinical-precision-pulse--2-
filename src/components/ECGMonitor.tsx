import React, { useEffect, useRef } from "react";

interface ECGMonitorProps {
  heartRate: number;
  triageColor: "green" | "yellow" | "red" | "indigo";
}

export const ECGMonitor: React.FC<ECGMonitorProps> = ({ heartRate, triageColor }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let offset = 0;

    // Handle high DPI screens
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Color mapper -> always white as requested by user
    const getStrokeColor = () => {
      return "#ffffff";
    };

    // Render loop
    const render = () => {
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      const centerY = h / 2;

      ctx.clearRect(0, 0, w, h);

      // 1. Draw classic medical peach grid background
      ctx.strokeStyle = "rgba(244, 63, 94, 0.08)";
      ctx.lineWidth = 0.5;
      
      const gridSize = 15;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Draw bold grid lines every 5 blocks
      ctx.strokeStyle = "rgba(244, 63, 94, 0.15)";
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += gridSize * 5) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize * 5) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // 2. Draw ECG Sine-complex wave line
      ctx.beginPath();
      ctx.strokeStyle = getStrokeColor();
      ctx.lineWidth = 2.5;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      // Glow effect
      ctx.shadowBlur = 8;
      ctx.shadowColor = getStrokeColor();

      // Adjust spacing based on heart rate
      // HR = beats per minute. Beats per second = HR / 60
      // We want to scale spacing between peaks.
      // Higher heart rate = peaks closer together.
      const beatsPerSec = Math.max(30, Math.min(220, heartRate)) / 60;
      const pxPerSec = 100; // Speed of scroll
      const beatSpacing = pxPerSec / beatsPerSec;

      for (let x = 0; x < w; x++) {
        // Find position inside the cardiac cycle relative to scrolling offset
        const cycleX = (x + offset) % beatSpacing;
        
        let waveVal = 0;
        const pulseWidth = 55; // pixels representing the active P-Q-R-S-T complex

        if (cycleX >= 0 && cycleX < pulseWidth) {
          const t = cycleX / pulseWidth; // normalized 0 to 1

          if (t < 0.15) {
            // P Wave: small smooth contraction bump
            waveVal = Math.sin((t / 0.15) * Math.PI) * 0.12;
          } else if (t < 0.28) {
            // PR Interval: flat baseline
            waveVal = 0;
          } else if (t < 0.33) {
            // Q Wave: rapid downward decline before push
            waveVal = -0.15 * Math.sin(((t - 0.28) / 0.05) * Math.PI);
          } else if (t < 0.43) {
            // R Spike: intense high ventricular push
            waveVal = 1.0 * Math.sin(((t - 0.33) / 0.1) * Math.PI);
          } else if (t < 0.48) {
            // S Dip: deep cardiac bounce back
            waveVal = -0.3 * Math.sin(((t - 0.43) / 0.05) * Math.PI);
          } else if (t < 0.65) {
            // ST Segment: resting baseline transition
            waveVal = 0;
          } else if (t < 0.85) {
            // T Wave: warm broad recovery wave
            waveVal = 0.25 * Math.sin(((t - 0.65) / 0.2) * Math.PI);
          } else {
            waveVal = 0;
          }
        }

        // Project waveVal to vertical coordinates (height scaler)
        const amplitude = h * 0.32; // occupies 64% of canvas vertical height
        const y = centerY - waveVal * amplitude;

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();

      // Reset shadows for next drawings
      ctx.shadowBlur = 0;

      // 3. Increment offset to scroll the waveform
      // Higher speed scrolling if HR is fast makes it feel super alive!
      const scrollSpeed = 1.2 + (heartRate / 100);
      offset += scrollSpeed;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [heartRate, triageColor]);

  return (
    <div className="relative w-full h-24 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex flex-col justify-between p-3">
      {/* Telemetry Labels */}
      <div className="flex justify-between items-center z-10 select-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
          <span className="text-[9px] font-bold font-mono tracking-widest text-[#a1a1aa] uppercase">Lead II Realtime</span>
        </div>
        <div className="flex items-baseline gap-1 bg-black/40 px-2 py-0.5 rounded-md border border-slate-800/50">
          <span className="text-[10px] font-mono font-semibold text-slate-400">ECG HR:</span>
          <span className="text-xs font-mono font-bold text-red-500">{heartRate}</span>
          <span className="text-[8px] font-mono text-slate-500">bpm</span>
        </div>
      </div>
      
      {/* HTML5 Canvas viewport */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Grid status markings */}
      <div className="flex justify-between items-center text-[8px] font-mono text-slate-600 z-10 select-none">
        <span>Sweep 25mm/s</span>
        <span>Aqt 1mV/div</span>
      </div>
    </div>
  );
};
