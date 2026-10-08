/**
 * Web Audio API Procedural Synthesizer for Mafia Host OS.
 * Zero external asset dependencies. Works reliably in all modern browsers.
 */

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private nightVolume: number = 0.25;
  private nightAmbianceNodes: {
    noiseSource?: AudioBufferSourceNode;
    droneOsc?: OscillatorNode;
    droneOsc2?: OscillatorNode;
    padOsc1?: OscillatorNode;
    padOsc2?: OscillatorNode;
    gainNode?: GainNode;
    filterNode?: BiquadFilterNode;
    melodyTimer?: number;
  } | null = null;
  private isNightPlaying: boolean = false;

  constructor() {
    // Read saved user preference
    try {
      const savedMute = localStorage.getItem('mafia_audio_muted');
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }
      const savedVol = localStorage.getItem('mafia_night_volume');
      if (savedVol !== null) {
        this.nightVolume = parseFloat(savedVol) || 0.25;
      }
    } catch {
      // Ignore in strict environments
    }
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      localStorage.setItem('mafia_audio_muted', String(muted));
    } catch {}

    if (muted) {
      this.stopNightAmbiance();
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setNightVolume(volume: number) {
    this.nightVolume = Math.max(0, Math.min(1, volume));
    try {
      localStorage.setItem('mafia_night_volume', String(this.nightVolume));
    } catch {}

    if (this.nightAmbianceNodes?.gainNode && this.ctx) {
      const now = this.ctx.currentTime;
      this.nightAmbianceNodes.gainNode.gain.setValueAtTime(
        this.nightAmbianceNodes.gainNode.gain.value,
        now
      );
      this.nightAmbianceNodes.gainNode.gain.linearRampToValueAtTime(this.nightVolume, now + 0.3);
    }
  }

  public getNightVolume(): number {
    return this.nightVolume;
  }

  public getIsNightPlaying(): boolean {
    return this.isNightPlaying;
  }

  /**
   * Start soft soothing harmonic night ambiance (Warm Rhodes Pad + 432Hz ambient drone + soft vinyl warmth)
   * This gently masks movement and whisper sounds so Mafia can coordinate in the dark.
   */
  public startNightAmbiance(volume?: number) {
    const targetVol = volume !== undefined ? volume : this.nightVolume;
    if (this.isMuted || this.isNightPlaying) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, now);
      masterGain.gain.exponentialRampToValueAtTime(Math.max(0.001, targetVol), now + 2.0);
      masterGain.connect(this.ctx.destination);

      // Create continuous looping gentle pink/brown noise buffer for soft whisper masking
      const bufferSize = this.ctx.sampleRate * 4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.015 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 2.8;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      const lowpassFilter = this.ctx.createBiquadFilter();
      lowpassFilter.type = 'lowpass';
      lowpassFilter.frequency.setValueAtTime(260, now);

      noiseSource.connect(lowpassFilter);
      lowpassFilter.connect(masterGain);

      // Harmonic warm drone (108Hz + 216Hz gentle sine)
      const droneOsc = this.ctx.createOscillator();
      droneOsc.type = 'sine';
      droneOsc.frequency.setValueAtTime(108, now); // A2 harmonic

      const droneGain = this.ctx.createGain();
      droneGain.gain.setValueAtTime(0.05, now);
      droneOsc.connect(droneGain);
      droneGain.connect(masterGain);

      const droneOsc2 = this.ctx.createOscillator();
      droneOsc2.type = 'triangle';
      droneOsc2.frequency.setValueAtTime(216, now); // A3 harmonic

      const droneGain2 = this.ctx.createGain();
      droneGain2.gain.setValueAtTime(0.025, now);
      droneOsc2.connect(droneGain2);
      droneGain2.connect(masterGain);

      // Warm soothing chords (F#m / Dmaj7 ambient chill pad)
      const padOsc1 = this.ctx.createOscillator();
      padOsc1.type = 'sine';
      padOsc1.frequency.setValueAtTime(293.66, now); // D4
      const padGain1 = this.ctx.createGain();
      padGain1.gain.setValueAtTime(0.02, now);
      padOsc1.connect(padGain1);
      padGain1.connect(masterGain);

      const padOsc2 = this.ctx.createOscillator();
      padOsc2.type = 'sine';
      padOsc2.frequency.setValueAtTime(369.99, now); // F#4
      const padGain2 = this.ctx.createGain();
      padGain2.gain.setValueAtTime(0.018, now);
      padOsc2.connect(padGain2);
      padGain2.connect(masterGain);

      noiseSource.start(now);
      droneOsc.start(now);
      droneOsc2.start(now);
      padOsc1.start(now);
      padOsc2.start(now);

      // Soft procedural chime arpeggios every few seconds
      const chimeNotes = [440, 554.37, 659.25, 880, 659.25, 739.99];
      let chimeIndex = 0;
      const melodyTimer = window.setInterval(() => {
        if (!this.isNightPlaying || !this.ctx || this.isMuted) return;
        try {
          const t = this.ctx.currentTime;
          const chimeOsc = this.ctx.createOscillator();
          const chimeGain = this.ctx.createGain();
          chimeOsc.type = 'sine';
          chimeOsc.frequency.setValueAtTime(chimeNotes[chimeIndex % chimeNotes.length], t);
          chimeIndex++;

          chimeGain.gain.setValueAtTime(0.015, t);
          chimeGain.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);

          chimeOsc.connect(chimeGain);
          chimeGain.connect(masterGain);

          chimeOsc.start(t);
          chimeOsc.stop(t + 2.3);
        } catch {}
      }, 3500);

      this.nightAmbianceNodes = {
        noiseSource,
        droneOsc,
        droneOsc2,
        padOsc1,
        padOsc2,
        gainNode: masterGain,
        filterNode: lowpassFilter,
        melodyTimer
      };
      this.isNightPlaying = true;
    } catch (err) {
      console.warn('Failed to start night ambiance audio:', err);
    }
  }

  /**
   * Smoothly fade out and stop night ambiance sound
   */
  public stopNightAmbiance() {
    if (!this.isNightPlaying || !this.nightAmbianceNodes || !this.ctx) return;

    try {
      const { gainNode, noiseSource, droneOsc, droneOsc2, padOsc1, padOsc2, melodyTimer } = this.nightAmbianceNodes;
      if (melodyTimer) {
        clearInterval(melodyTimer);
      }

      const now = this.ctx.currentTime;

      if (gainNode) {
        gainNode.gain.setValueAtTime(gainNode.gain.value, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
      }

      setTimeout(() => {
        try {
          noiseSource?.stop();
          droneOsc?.stop();
          droneOsc2?.stop();
          padOsc1?.stop();
          padOsc2?.stop();
        } catch {
          // Ignore if already stopped
        }
      }, 850);

      this.nightAmbianceNodes = null;
      this.isNightPlaying = false;
    } catch (err) {
      console.warn('Error stopping night ambiance:', err);
    }
  }

  public playAccuse() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.18);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  public playGunshot() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Noise buffer for blast
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    // Filter to shape into explosion
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, now);
    filter.frequency.exponentialRampToValueAtTime(80, now + 0.35);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.38);

    // Deep sub kick
    const kick = this.ctx.createOscillator();
    const kickGain = this.ctx.createGain();
    kick.frequency.setValueAtTime(180, now);
    kick.frequency.exponentialRampToValueAtTime(30, now + 0.3);
    kickGain.gain.setValueAtTime(0.8, now);
    kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    kick.connect(kickGain);
    kickGain.connect(this.ctx.destination);

    whiteNoise.start(now);
    kick.start(now);
    whiteNoise.stop(now + 0.4);
    kick.stop(now + 0.4);
  }

  public playGong() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const freqs = [130, 260, 390, 520, 780];
    freqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      const amp = 0.25 / (idx + 1);
      gain.gain.setValueAtTime(amp, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 2.6);
    });
  }

  public playMorningDawn() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((note, index) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + index * 0.12;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note, startTime);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.7);
    });
  }

  public playNightSuspense() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(65, now);
    osc.frequency.linearRampToValueAtTime(55, now + 1.8);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, now);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.6);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 2.1);
  }

  public playTick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, now);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  /**
   * Warning beep for last 5 seconds of speaking/challenge timer
   */
  public playWarningBeep() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1050, now);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  /**
   * Long buzzer sound when speech/challenge timer hits zero
   */
  public playEndBuzzer() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.setValueAtTime(180, now + 0.25);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.75);
  }

  /**
   * Warning sound when God gives a foul / penalty to a player
   */
  public playFoulSound() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.setValueAtTime(280, now + 0.1);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.32);
  }

  /**
   * Smooth mystic chime when player taps to reveal their secret role card
   */
  public playRoleReveal() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [440, 554.37, 659.25, 880].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const st = now + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, st);
      gain.gain.setValueAtTime(0.2, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(st);
      osc.stop(st + 0.85);
    });
  }

  public playVictory() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const chord = [392, 523.25, 659.25, 783.99, 1046.5]; // G4, C5, E5, G5, C6
    chord.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + i * 0.09;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 1.3);
    });
  }

  // --- Multi-track Cinematic Procedural Music Engine ---
  private currentTrackId: 'NOIR_MYSTERY' | 'NIGHT_SUSPENSE' | 'COURT_DRAMA' | 'VICTORY_ANTHEM' | null = null;
  private trackTimer: number | null = null;
  private trackNodes: {
    oscillators: OscillatorNode[];
    gains: GainNode[];
    masterGain: GainNode;
  } | null = null;

  public getActiveTrack(): 'NOIR_MYSTERY' | 'NIGHT_SUSPENSE' | 'COURT_DRAMA' | 'VICTORY_ANTHEM' | null {
    return this.currentTrackId;
  }

  public playBackgroundTrack(trackId: 'NOIR_MYSTERY' | 'NIGHT_SUSPENSE' | 'COURT_DRAMA' | 'VICTORY_ANTHEM', volume = 0.22) {
    if (this.isMuted) return;
    this.stopBackgroundTrack();
    this.initCtx();
    if (!this.ctx) return;

    try {
      this.currentTrackId = trackId;
      const now = this.ctx.currentTime;
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, now);
      masterGain.gain.exponentialRampToValueAtTime(Math.max(0.001, volume), now + 1.2);
      masterGain.connect(this.ctx.destination);

      const oscillators: OscillatorNode[] = [];
      const gains: GainNode[] = [];

      if (trackId === 'NOIR_MYSTERY') {
        // Godfather / Noir Jazz Minor Chord Drone (D minor 9th / A7 harmonic)
        const chords = [
          [146.83, 220.00, 261.63, 329.63], // D3, A3, C4, E4 (Dm9)
          [130.81, 196.00, 246.94, 329.63], // C3, G3, B3, E4 (Cmaj7#11)
          [116.54, 174.61, 233.08, 293.66], // Bb2, F3, Bb3, D4 (Bbmaj7)
          [110.00, 164.81, 220.00, 277.18]  // A2, E3, A3, C#4 (A7)
        ];
        let chordStep = 0;

        // Bass Drone
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(73.42, now); // D2
        bassGain.gain.setValueAtTime(0.08, now);
        bassOsc.connect(bassGain);
        bassGain.connect(masterGain);
        bassOsc.start(now);
        oscillators.push(bassOsc);
        gains.push(bassGain);

        // Melodic loop
        this.trackTimer = window.setInterval(() => {
          if (!this.ctx || this.isMuted || this.currentTrackId !== 'NOIR_MYSTERY') return;
          try {
            const t = this.ctx.currentTime;
            const currentChord = chords[chordStep % chords.length];
            chordStep++;

            currentChord.forEach((freq, idx) => {
              if (!this.ctx) return;
              const osc = this.ctx.createOscillator();
              const g = this.ctx.createGain();
              osc.type = idx === 0 ? 'sine' : 'sine';
              osc.frequency.setValueAtTime(freq, t + idx * 0.15);
              g.gain.setValueAtTime(0.02, t + idx * 0.15);
              g.gain.exponentialRampToValueAtTime(0.0001, t + 3.8);
              osc.connect(g);
              g.connect(masterGain);
              osc.start(t + idx * 0.15);
              osc.stop(t + 4.0);
            });
          } catch {}
        }, 4000);

      } else if (trackId === 'NIGHT_SUSPENSE') {
        // Deep clockwork & heart rhythm
        const pulseOsc = this.ctx.createOscillator();
        const pulseGain = this.ctx.createGain();
        pulseOsc.type = 'sine';
        pulseOsc.frequency.setValueAtTime(55, now); // A1
        pulseGain.gain.setValueAtTime(0.09, now);
        pulseOsc.connect(pulseGain);
        pulseGain.connect(masterGain);
        pulseOsc.start(now);
        oscillators.push(pulseOsc);
        gains.push(pulseGain);

        let tickToggle = false;
        this.trackTimer = window.setInterval(() => {
          if (!this.ctx || this.isMuted || this.currentTrackId !== 'NIGHT_SUSPENSE') return;
          try {
            const t = this.ctx.currentTime;
            const tickOsc = this.ctx.createOscillator();
            const tickG = this.ctx.createGain();
            tickOsc.type = 'triangle';
            tickOsc.frequency.setValueAtTime(tickToggle ? 880 : 784, t);
            tickToggle = !tickToggle;
            tickG.gain.setValueAtTime(0.035, t);
            tickG.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
            tickOsc.connect(tickG);
            tickG.connect(masterGain);
            tickOsc.start(t);
            tickOsc.stop(t + 0.09);
          } catch {}
        }, 1000);

      } else if (trackId === 'COURT_DRAMA') {
        // Tension Ostinato (C Minor courtroom staccato)
        const notes = [130.81, 155.56, 196.00, 233.08]; // C3, Eb3, G3, Bb3
        let noteIdx = 0;
        this.trackTimer = window.setInterval(() => {
          if (!this.ctx || this.isMuted || this.currentTrackId !== 'COURT_DRAMA') return;
          try {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(notes[noteIdx % notes.length], t);
            noteIdx++;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(450, t);

            g.gain.setValueAtTime(0.04, t);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);

            osc.connect(filter);
            filter.connect(g);
            g.connect(masterGain);

            osc.start(t);
            osc.stop(t + 0.38);
          } catch {}
        }, 450);

      } else if (trackId === 'VICTORY_ANTHEM') {
        // Triumphant Fanfares
        const victoryChords = [
          [261.63, 329.63, 392.00, 523.25], // C Major
          [293.66, 369.99, 440.00, 587.33], // D Major
          [329.63, 415.30, 493.88, 659.25], // E Major
          [392.00, 493.88, 587.33, 783.99]  // G Major
        ];
        let vIdx = 0;
        this.trackTimer = window.setInterval(() => {
          if (!this.ctx || this.isMuted || this.currentTrackId !== 'VICTORY_ANTHEM') return;
          try {
            const t = this.ctx.currentTime;
            const chord = victoryChords[vIdx % victoryChords.length];
            vIdx++;
            chord.forEach(f => {
              if (!this.ctx) return;
              const osc = this.ctx.createOscillator();
              const g = this.ctx.createGain();
              osc.type = 'triangle';
              osc.frequency.setValueAtTime(f, t);
              g.gain.setValueAtTime(0.04, t);
              g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
              osc.connect(g);
              g.connect(masterGain);
              osc.start(t);
              osc.stop(t + 1.9);
            });
          } catch {}
        }, 2200);
      }

      this.trackNodes = {
        oscillators,
        gains,
        masterGain
      };
    } catch (err) {
      console.warn('Failed to play background track:', err);
    }
  }

  public stopBackgroundTrack() {
    if (this.trackTimer) {
      clearInterval(this.trackTimer);
      this.trackTimer = null;
    }
    if (this.trackNodes && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        this.trackNodes.masterGain.gain.setValueAtTime(this.trackNodes.masterGain.gain.value, now);
        this.trackNodes.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
        setTimeout(() => {
          try {
            this.trackNodes?.oscillators.forEach(o => o.stop());
          } catch {}
          this.trackNodes = null;
        }, 650);
      } catch {}
    }
    this.currentTrackId = null;
  }
}

export const soundEngine = new AudioSynthesizer();
