export class AudioSystem {
  constructor() {
    this.context = null;
  }

  ensureContext() {
    if (this.context) return this.context;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    this.context = new AudioContextClass();
    return this.context;
  }

  resume() {
    const context = this.ensureContext();
    if (context?.state === 'suspended') context.resume();
  }

  playCue(type = 'collect') {
    const context = this.ensureContext();
    if (!context) return;

    const frequencies = {
      start: 220,
      collect: 420,
      warn: 170,
      success: 620,
      fail: 110,
      switch: 320,
    };

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type === 'warn' ? 'square' : 'sawtooth';
    oscillator.frequency.value = frequencies[type] || 420;
    gain.gain.value = 0.03;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.12);
    oscillator.stop(context.currentTime + 0.14);
  }
}
