/**
 * Sound Sonification and Speech Synthesizer Engine for Clinical Precision Pulse
 * Generates custom soundscapes and alerts surgically using the Web Audio API
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private ambientOsc: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private ambientInterval: any = null;
  private heartbeatInterval: any = null;
  
  private isAmbientPlaying = false;
  private isHeartbeatPlaying = false;
  private isMuted = false;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      // Pause active loops
      const savedAmbient = this.isAmbientPlaying;
      const savedHeart = this.isHeartbeatPlaying;
      this.stopAll();
      // Keep state values
      this.isAmbientPlaying = savedAmbient;
      this.isHeartbeatPlaying = savedHeart;
    } else {
      // Resume loops if they were active
      if (this.isAmbientPlaying) {
        this.startAmbient();
      }
    }
  }

  public playTone(freq: number, duration: number, type: OscillatorType = "sine", gainVal: number = 0.1) {
    if (this.isMuted) return;
    const context = this.initContext();
    if (!context) return;

    try {
      const osc = context.createOscillator();
      const gain = context.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, context.currentTime);

      gain.gain.setValueAtTime(gainVal, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);

      osc.connect(gain);
      gain.connect(context.destination);

      osc.start();
      osc.stop(context.currentTime + duration);
    } catch (e) {
      console.warn("Audio Tone Error:", e);
    }
  }

  public playSuccess() {
    // Beautiful ascending major triad clinical chime
    const delay = 0.12;
    this.playTone(523.25, 0.4, "sine", 0.08); // C5
    setTimeout(() => this.playTone(659.25, 0.4, "sine", 0.08), delay * 1000); // E5
    setTimeout(() => this.playTone(783.99, 0.6, "sine", 0.1), delay * 2 * 1000); // G5
  }

  public playFailure() {
    // Medical warning buzzer - dual rapid low dissonance tones
    this.playTone(180, 0.15, "triangle", 0.12);
    setTimeout(() => {
      this.playTone(160, 0.25, "triangle", 0.15);
    }, 130);
  }

  public playAlarmRed() {
    // URGENT Clinical Monitor Alarm - RED TRIAGE (Immediate)
    // High-pitched urgent rapid dual-tone alarm mimicking emergency monitor
    if (this.isMuted) return;
    
    // First urgent beep pair (high frequency)
    this.playTone(1046.5, 0.2, "square", 0.15); // C6
    setTimeout(() => {
      this.playTone(1174.66, 0.2, "square", 0.15); // D6
    }, 150);
    
    // Second urgent beep pair
    setTimeout(() => {
      this.playTone(1046.5, 0.2, "square", 0.15); // C6
      setTimeout(() => {
        this.playTone(1174.66, 0.2, "square", 0.15); // D6
      }, 150);
    }, 450);
    
    // Third beep for sustained urgency
    setTimeout(() => {
      this.playTone(1046.5, 0.3, "square", 0.18); // Sustained C6
    }, 900);
  }

  public playAlarmYellow() {
    // WARNING Clinical Monitor Alarm - YELLOW TRIAGE (Delayed/Urgent)
    // Medium-pitched repeated warning tone mimicking caution alarm
    if (this.isMuted) return;
    
    // First warning beep
    this.playTone(784, 0.2, "triangle", 0.12); // G5
    setTimeout(() => {
      this.playTone(880, 0.2, "triangle", 0.12); // A5
    }, 120);
    
    // Second warning beep (slightly delayed)
    setTimeout(() => {
      this.playTone(784, 0.2, "triangle", 0.12); // G5
    }, 500);
  }

  public playAlarmGreen() {
    // CONFIRMATION Clinical Monitor Tone - GREEN TRIAGE (Minor/Safe)
    // Soft, reassuring two-tone confirmation mimicking normal monitor
    if (this.isMuted) return;
    
    // Soft ascending confirmation
    this.playTone(523.25, 0.25, "sine", 0.07); // C5
    setTimeout(() => {
      this.playTone(659.25, 0.3, "sine", 0.08); // E5
    }, 150);
  }

  public playHeartBeat(bpm: number) {
    if (this.isMuted) return;
    // Standard ECG pulse sound beep: higher frequency, short decays
    // Tachypnea/Tachycardia pitches might change slightly to reflect medical stress
    const frequency = bpm > 110 ? 950 : bpm < 60 ? 800 : 900;
    this.playTone(frequency, 0.08, "sine", 0.06);
  }

  public toggleAmbient(bpm: number = 75): boolean {
    if (this.isAmbientPlaying) {
      this.stopAmbient();
      return false;
    } else {
      this.startAmbient();
      return true;
    }
  }

  public startAmbient() {
    this.isAmbientPlaying = true;
    if (this.isMuted) return;

    const context = this.initContext();
    if (!context) return;

    try {
      this.stopAmbient();

      // Low frequency ventilation drone for space hum
      const osc = context.createOscillator();
      const gain = context.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(45, context.currentTime); // 45 Hz dark hum
      
      gain.gain.setValueAtTime(0.015, context.currentTime); // very subtle
      
      osc.connect(gain);
      gain.connect(context.destination);
      osc.start();

      this.ambientOsc = osc;
      this.ambientGain = gain;

      // Random nurse intercom / ECG monitor beeps in background
      this.ambientInterval = setInterval(() => {
        if (Math.random() > 0.4) {
          // Play distant random telemetry chimes
          const pitch = [440, 554.37, 659.25, 880][Math.floor(Math.random() * 4)];
          const subGain = 0.01 + Math.random() * 0.015;
          this.playTone(pitch, 0.3, "sine", subGain);
        }
      }, 7000);

    } catch (e) {
      console.warn("Ambient Audio Error:", e);
    }
  }

  public stopAmbient() {
    this.isAmbientPlaying = false;
    if (this.ambientOsc) {
      try {
        this.ambientOsc.stop();
        this.ambientOsc.disconnect();
      } catch (e) {}
      this.ambientOsc = null;
    }
    if (this.ambientGain) {
      this.ambientGain.disconnect();
      this.ambientGain = null;
    }
    if (this.ambientInterval) {
      clearInterval(this.ambientInterval);
      this.ambientInterval = null;
    }
  }

  public startHeartSonification(bpm: number) {
    this.isHeartbeatPlaying = true;
    if (this.isMuted) return;

    this.stopHeartSonification();
    
    const intervalMs = (60 * 1000) / bpm;
    // Play immediately
    this.playHeartBeat(bpm);

    this.heartbeatInterval = setInterval(() => {
      this.playHeartBeat(bpm);
    }, intervalMs);
  }

  public stopHeartSonification() {
    this.isHeartbeatPlaying = false;
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  public speakText(text: string) {
    if (this.isMuted) return;
    if (!window.speechSynthesis) {
      console.warn("Speech synthesis not supported in this browser.");
      return;
    }

    try {
      window.speechSynthesis.cancel(); // cancel any active queue

      // Indonesian TTS falls back to default system voice
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "id-ID";
      utterance.rate = 0.95; // slightly slower for professional emergency medical tone
      utterance.pitch = 1.0;
      utterance.volume = 0.8;

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech Synthesis Error:", e);
    }
  }

  public stopAll() {
    this.stopAmbient();
    this.stopHeartSonification();
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }
}

export const audioEngine = new AudioEngine();
