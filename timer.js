// timer.js — Wake Lock + Silent Audio + Countdown Timer
const Timer = {
  wakeLock: null,
  audioElement: null,
  intervalId: null,
  seconds: 0,
  totalSeconds: 0,
  onTick: null,
  onComplete: null,
  isRunning: false,

  async requestWakeLock() {
    try {
      if ('wakeLock' in navigator) {
        this.wakeLock = await navigator.wakeLock.request('screen');
        this.wakeLock.addEventListener('release', () => {
          console.log('Wake lock released');
        });
        console.log('Wake lock acquired');
      }
    } catch (err) {
      console.warn('Wake lock failed:', err);
    }
  },

  releaseWakeLock() {
    if (this.wakeLock) {
      this.wakeLock.release();
      this.wakeLock = null;
    }
  },

  startSilentAudio() {
    if (this.audioElement) return;
    try {
      this.audioElement = new Audio('silence.mp3');
      this.audioElement.loop = true;
      this.audioElement.volume = 0.01;
      this.audioElement.play().catch(err => {
        console.warn('Silent audio failed:', err);
      });
    } catch (err) {
      console.warn('Silent audio setup failed:', err);
    }
  },

  stopSilentAudio() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
      this.audioElement = null;
    }
  },

  async startWorkoutSession() {
    await this.requestWakeLock();
    this.startSilentAudio();
  },

  endWorkoutSession() {
    this.stop();
    this.releaseWakeLock();
    this.stopSilentAudio();
  },

  start(seconds, onTick, onComplete) {
    this.stop();
    this.totalSeconds = seconds;
    this.seconds = seconds;
    this.onTick = onTick;
    this.onComplete = onComplete;
    this.isRunning = true;
    this.startTime = Date.now();
    this.targetEnd = Date.now() + (seconds * 1000);

    if (this.onTick) this.onTick(this.seconds, this.totalSeconds);

    this.intervalId = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((this.targetEnd - Date.now()) / 1000));
      this.seconds = remaining;

      if (this.onTick) this.onTick(this.seconds, this.totalSeconds);

      if (remaining <= 0) {
        this.stop();
        this.playAlert();
        this.vibrate();
        if (this.onComplete) this.onComplete();
      }
    }, 250); // Check 4x per second for accuracy
  },

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  },

  skip() {
    this.stop();
    if (this.onComplete) this.onComplete();
  },

  playAlert() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

      // Play 3 ascending tones
      const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 - major chord
      frequencies.forEach((freq, i) => {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.3;
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5 + i * 0.2);
        oscillator.start(audioCtx.currentTime + i * 0.2);
        oscillator.stop(audioCtx.currentTime + 0.5 + i * 0.2);
      });
    } catch (err) {
      console.warn('Audio alert failed:', err);
    }
  },

  vibrate() {
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 300]);
      }
    } catch (err) {
      console.warn('Vibration failed:', err);
    }
  },

  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  },

  getProgress(seconds, total) {
    if (total === 0) return 0;
    return 1 - (seconds / total);
  }
};
