// =========================================================================
// KICKOFF RIVALS - BROWSER SYNTHESIZED SOUND EFFECTS ENGINE (Web Audio API)
// =========================================================================

class SoundEffectsEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      const savedMute = localStorage.getItem("kor_sound_muted");
      this.isMuted = savedMute === "true";
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== "undefined") {
      localStorage.setItem("kor_sound_muted", String(this.isMuted));
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Tactile subtle click for buttons & selections
  public playClick() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (e) {}
  }

  // Referee whistle for match start / phase transitions
  public playWhistle() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(2400, this.ctx.currentTime);
      osc.frequency.setValueAtTime(2600, this.ctx.currentTime + 0.08);
      osc.frequency.setValueAtTime(2400, this.ctx.currentTime + 0.16);
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    } catch (e) {}
  }

  // Goal celebration horn & stadium pulse
  public playGoal() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = "sawtooth";
      osc2.type = "triangle";
      osc1.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc2.frequency.setValueAtTime(480, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.8);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(this.ctx.currentTime + 0.8);
      osc2.stop(this.ctx.currentTime + 0.8);
    } catch (e) {}
  }

  // Winning payout chime
  public playWin() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.08);
        osc.stop(this.ctx.currentTime + idx * 0.08 + 0.3);
      });
    } catch (e) {}
  }

  // Cashout / win alias
  public playCashout() {
    this.playWin();
  }
}

export const soundFx = new SoundEffectsEngine();
