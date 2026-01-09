/**
 * AudioSys
 * Synthesizer-based sound effects using Web Audio API
 * No external files required.
 */
class AudioSys {
    constructor() {
        this.ctx = null;
        this.masterVolume = 0.5;
        this.sfxVolume = 1.0;
        this.enabled = true;
        this.loadSettings();
    }

    loadSettings() {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('q-gambit-settings');
            if (saved) {
                const settings = JSON.parse(saved);
                this.masterVolume = settings.masterVolume ?? 0.5;
                this.sfxVolume = settings.sfxVolume ?? 1.0;
                this.enabled = settings.soundEnabled ?? true;
            }
        }
    }

    saveSettings() {
        if (typeof window !== 'undefined') {
            localStorage.setItem('q-gambit-settings', JSON.stringify({
                masterVolume: this.masterVolume,
                sfxVolume: this.sfxVolume,
                soundEnabled: this.enabled
            }));
        }
    }

    setMasterVolume(val) {
        this.masterVolume = Math.max(0, Math.min(1, val));
        this.saveSettings();
    }

    setSfxVolume(val) {
        this.sfxVolume = Math.max(0, Math.min(1, val));
        this.saveSettings();
    }

    setEnabled(val) {
        this.enabled = val;
        this.saveSettings();
    }

    init() {
        if (!this.ctx && typeof window !== 'undefined') {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
    }

    playTone(frequency, type, duration, startTime = 0, vol = 1.0) {
        if (!this.enabled || !this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        // Calculate final volume: Tone Vol * SFX Vol * Master Vol
        const finalVol = vol * this.sfxVolume * this.masterVolume;
        if (finalVol <= 0.01) return; // Skip if silent

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.ctx.currentTime + startTime);

        gain.gain.setValueAtTime(0, this.ctx.currentTime + startTime);
        gain.gain.linearRampToValueAtTime(finalVol, this.ctx.currentTime + startTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + startTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + startTime);
        osc.stop(this.ctx.currentTime + startTime + duration);
    }

    playMove() {
        this.init();
        // High-tech snippet sound
        this.playTone(600, 'sine', 0.1, 0, 0.5);
        this.playTone(1200, 'triangle', 0.05, 0.02, 0.3);
    }

    playCapture() {
        this.init();
        // Heavier impact sound
        this.playTone(150, 'square', 0.2, 0, 0.8);
        this.playTone(100, 'sawtooth', 0.3, 0.05, 0.8);
    }

    playCheck() {
        this.init();
        // Warning sound
        this.playTone(800, 'pulse', 0.3, 0, 0.6);
        this.playTone(600, 'pulse', 0.3, 0.1, 0.6);
    }

    playVictory() {
        this.init();
        // Major chord arpeggio
        this.playTone(523.25, 'sine', 0.4, 0, 0.6); // C5
        this.playTone(659.25, 'sine', 0.4, 0.1, 0.6); // E5
        this.playTone(783.99, 'sine', 0.6, 0.2, 0.6); // G5
        this.playTone(1046.50, 'triangle', 0.8, 0.3, 0.5); // C6
    }

    playDefeat() {
        this.init();
        // Descending minor theme
        this.playTone(392.00, 'sawtooth', 0.4, 0, 0.5); // G4
        this.playTone(369.99, 'sawtooth', 0.4, 0.2, 0.5); // F#4
        this.playTone(349.23, 'sawtooth', 0.8, 0.4, 0.5); // F4
    }

    playQuantum() {
        this.init();
        // Sci-fi wobble
        if (this.ctx && this.enabled) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(300, this.ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(600, this.ctx.currentTime + 0.1);
            osc.frequency.linearRampToValueAtTime(200, this.ctx.currentTime + 0.3);

            gain.gain.setValueAtTime(0, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(this.masterVolume * 0.4, this.ctx.currentTime + 0.05);
            gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.4);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.5);
        }
    }
}

export const audioSys = new AudioSys();
