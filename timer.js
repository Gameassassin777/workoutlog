// timer.js — Wake Lock + Silent Audio + Countdown Timer
const Timer = {
  wakeLock: null,
  intervalId: null,
  silentCtx: null,
  silentSource: null,
  seconds: 0,
  totalSeconds: 0,
  onTick: null,
  onComplete: null,
  isRunning: false,
  _lifecycleBound: false,

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
    if (this.silentCtx) return;
    try {
      this.silentCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create a silent buffer (1 second)
      const buffer = this.silentCtx.createBuffer(1, this.silentCtx.sampleRate, this.silentCtx.sampleRate);
      
      this.silentSource = this.silentCtx.createBufferSource();
      this.silentSource.buffer = buffer;
      this.silentSource.loop = true;
      this.silentSource.connect(this.silentCtx.destination);
      this.silentSource.start();
      console.log('Programmatic silent audio started');
    } catch (err) {
      console.warn('Silent audio setup failed:', err);
    }
  },

  stopSilentAudio() {
    if (this.silentSource) {
      this.silentSource.stop();
      this.silentSource = null;
    }
    if (this.silentCtx) {
      this.silentCtx.close();
      this.silentCtx = null;
    }
  },

  async requestNotificationPermission() {
    try {
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    } catch (e) {}
  },

  async startWorkoutSession() {
    await this.requestWakeLock();
    this.startSilentAudio();
    await this.requestNotificationPermission();
    this._bindLifecycle();
  },

  endWorkoutSession() {
    this.stop();
    this.releaseWakeLock();
    this.stopSilentAudio();
  },

  _bindLifecycle() {
    if (this._lifecycleBound) return;
    this._lifecycleBound = true;
    const cleanup = () => { try { this.endWorkoutSession(); } catch (e) {} };
    window.addEventListener('pagehide', cleanup);
    window.addEventListener('beforeunload', cleanup);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isRunning && !this.wakeLock) {
        this.requestWakeLock();
      }
    });
  },

  _postToSW(msg) {
    try {
      if (navigator.serviceWorker?.controller) {
        navigator.serviceWorker.controller.postMessage(msg);
      }
    } catch (e) {}
  },

  // userId + apiBase let the SW cancel the server alarm after firing,
  // ensuring SW notification and server push are mutually exclusive.
  scheduleNotification(seconds, exerciseName = '', userId = '', apiBase = '') {
    if (Notification.permission !== 'granted') return;
    this._postToSW({
      type: 'SCHEDULE_REST_NOTIF',
      delay: seconds * 1000,
      exercise: exerciseName,
      userId,
      apiBase,
    });
  },

  cancelNotification() {
    this._postToSW({ type: 'CANCEL_REST_NOTIF' });
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
    // Notification scheduling is the app layer's responsibility (needs userId/apiBase)

    if (this.onTick) this.onTick(this.seconds, this.totalSeconds);

    this.intervalId = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((this.targetEnd - Date.now()) / 1000));
      this.seconds = remaining;

      if (this.onTick) this.onTick(this.seconds, this.totalSeconds);

      if (remaining <= 0) {
        this.stop(); // stop() calls cancelNotification() to dismiss the SW-scheduled notif
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
    this.cancelNotification();
  },

  skip() {
    this.cancelNotification();
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
    return seconds / total; // remaining fraction: 1 at start, 0 at end
  }
};
