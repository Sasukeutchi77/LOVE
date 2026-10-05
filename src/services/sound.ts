// Web Audio API Synthesizer for gentle, lightweight romantic audio feedback

class SoundEffects {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  constructor() {
    try {
      if (typeof window !== 'undefined') {
        this.muted = localStorage.getItem('loveplay_sound_muted') === 'true';
      }
    } catch {
      // Ignore
    }
  }

  isMuted(): boolean {
    return this.muted;
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    try {
      localStorage.setItem('loveplay_sound_muted', muted ? 'true' : 'false');
    } catch {
      // Ignore
    }
  }

  toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  private init(): boolean {
    if (this.muted) return false;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return Boolean(this.ctx);
  }

  playTap() {
    try {
      if (!this.init()) return;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, this.ctx!.currentTime);
      osc.frequency.exponentialRampToValueAtTime(780, this.ctx!.currentTime + 0.08);

      gain.gain.setValueAtTime(0.06, this.ctx!.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start();
      osc.stop(this.ctx!.currentTime + 0.08);
    } catch {
      // Ignore
    }
  }

  playHeartbeat() {
    try {
      if (!this.init()) return;
      const now = this.ctx!.currentTime;

      // First thump
      const osc1 = this.ctx!.createOscillator();
      const gain1 = this.ctx!.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(80, now);
      osc1.frequency.exponentialRampToValueAtTime(45, now + 0.12);
      gain1.gain.setValueAtTime(0.18, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(this.ctx!.destination);
      osc1.start(now);
      osc1.stop(now + 0.12);

      // Second thump (closer, softer)
      const osc2 = this.ctx!.createOscillator();
      const gain2 = this.ctx!.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(95, now + 0.15);
      osc2.frequency.exponentialRampToValueAtTime(50, now + 0.28);
      gain2.gain.setValueAtTime(0.15, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc2.connect(gain2);
      gain2.connect(this.ctx!.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.28);
    } catch {
      // Ignore
    }
  }

  playMessage() {
    try {
      if (!this.init()) return;
      const now = this.ctx!.currentTime;
      const notes = [440, 659.25]; // A4, E5
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);
        gain.gain.setValueAtTime(0.07, now + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 0.22);
      });
    } catch {
      // Ignore
    }
  }

  playWin() {
    try {
      if (!this.init()) return;
      const now = this.ctx!.currentTime;
      const chord = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      chord.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.09, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.35);
      });
    } catch {
      // Ignore
    }
  }

  playSpinTick() {
    try {
      if (!this.init()) return;
      const now = this.ctx!.currentTime;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.03);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now);
      osc.stop(now + 0.03);
    } catch {
      // Ignore
    }
  }

  playMatch() {
    try {
      if (!this.init()) return;
      const now = this.ctx!.currentTime;
      const notes = [587.33, 880]; // D5, A5
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0.08, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.25);
      });
    } catch {
      // Ignore
    }
  }

  playChipDrop() {
    try {
      if (!this.init()) return;
      const now = this.ctx!.currentTime;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.12);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch {
      // Ignore
    }
  }

  playSplash() {
    try {
      if (!this.init()) return;
      const now = this.ctx!.currentTime;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.15);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Ignore
    }
  }

  playVoiceNoteChime() {
    try {
      if (!this.init()) return;
      const now = this.ctx!.currentTime;
      const notes = [659.25, 783.99, 987.77, 1318.51]; // E5, G5, B5, E6 sweet whisper chord
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.06, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.35);
      });
    } catch {
      // Ignore
    }
  }

  playCard() {
    try {
      if (!this.init()) return;
      const now = this.ctx!.currentTime;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.07);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // Ignore
    }
  }
}

export const sound = new SoundEffects();
