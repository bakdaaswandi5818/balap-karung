// Sound Effects Module using Web Audio API
// Generates simple, fun sound effects for the sack race

class SoundEffects {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.volume = 0.3;
    }

    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    // Play starting whistle sound - energetic and attention-grabbing
    playStartSound() {
        if (!this.enabled || !this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Whistle effect: quick frequency sweep
        oscillator.frequency.setValueAtTime(800, now);
        oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
        oscillator.frequency.exponentialRampToValueAtTime(1000, now + 0.2);
        
        gainNode.gain.setValueAtTime(this.volume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        
        oscillator.type = 'sine';
        oscillator.start(now);
        oscillator.stop(now + 0.3);
    }

    // Play jumping/hopping sound - fun bouncy effect
    playJumpSound() {
        if (!this.enabled || !this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Boing effect
        oscillator.frequency.setValueAtTime(200, now);
        oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.1);
        
        gainNode.gain.setValueAtTime(this.volume * 0.5, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        oscillator.type = 'sine';
        oscillator.start(now);
        oscillator.stop(now + 0.1);
    }

    // Play finish sound - celebratory fanfare
    playFinishSound() {
        if (!this.enabled || !this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        
        // Play a happy chord progression
        const notes = [523.25, 659.25, 783.99]; // C, E, G (C major chord)
        
        notes.forEach((freq, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(freq, now + index * 0.1);
            
            gainNode.gain.setValueAtTime(this.volume * 0.6, now + index * 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + index * 0.1 + 0.5);
            
            oscillator.type = 'triangle';
            oscillator.start(now + index * 0.1);
            oscillator.stop(now + index * 0.1 + 0.5);
        });
        
        // Add a celebratory ascending tone
        const celebrateOsc = this.audioContext.createOscillator();
        const celebrateGain = this.audioContext.createGain();
        
        celebrateOsc.connect(celebrateGain);
        celebrateGain.connect(this.audioContext.destination);
        
        celebrateOsc.frequency.setValueAtTime(400, now + 0.3);
        celebrateOsc.frequency.exponentialRampToValueAtTime(800, now + 0.6);
        
        celebrateGain.gain.setValueAtTime(this.volume * 0.4, now + 0.3);
        celebrateGain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
        
        celebrateOsc.type = 'square';
        celebrateOsc.start(now + 0.3);
        celebrateOsc.stop(now + 0.7);
    }

    // Play crowd cheering sound (subtle background noise)
    playCrowdCheer() {
        if (!this.enabled || !this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        const bufferSize = this.audioContext.sampleRate * 1;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Generate pink noise for crowd effect
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.audioContext.createBufferSource();
        const filter = this.audioContext.createBiquadFilter();
        const gainNode = this.audioContext.createGain();
        
        noise.buffer = buffer;
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        
        gainNode.gain.setValueAtTime(this.volume * 0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1);
        
        noise.start(now);
        noise.stop(now + 1);
    }

    toggleSound() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
    }
}

export default SoundEffects;
