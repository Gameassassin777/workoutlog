// palm.js – Bioluminescent Particle Layer

class PalmTreeEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.isRunning = false;
    this.animationFrameId = null;
    this._particles = [];

    this.resize();
    window.addEventListener('resize', () => this._onResize());
    this._spawn();
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  _onResize() {
    this.resize();
    const W = window.innerWidth;
    for (const p of this._particles) {
      if (p.x > W) p.x = Math.random() * W;
    }
  }

  _makeParticle(randomY = false) {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const palettes = [
      [0,   232, 255],  // aqua
      [10,  245, 216],  // lagoon
      [0,   194, 212],  // teal
      [46,  232, 138],  // palm green (rare)
    ];
    const w = Math.random();
    const [r, g, b] = w < 0.05
      ? palettes[3]
      : palettes[Math.floor(Math.random() * 3)];

    const radius = Math.random() * 1.6 + 0.4;
    const glow   = radius * 5.5;
    return {
      x:          Math.random() * W,
      y:          randomY ? Math.random() * H : H + glow * 2,
      vy:         Math.random() * 0.28 + 0.06,
      drift:      (Math.random() - 0.5) * 0.10,
      phase:      Math.random() * Math.PI * 2,
      radius, glow,
      r, g, b,
      maxOpacity: Math.random() * 0.20 + 0.04,
      opacity:    0,
    };
  }

  _spawn() {
    const count = Math.max(22, Math.floor(window.innerWidth / 18));
    this._particles = Array.from({ length: count }, () => this._makeParticle(true));
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.canvas.style.display = 'block';
    const tick = (t) => {
      if (!this.isRunning) return;
      this._draw(t);
      this.animationFrameId = requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    if (this.canvas) this.canvas.style.display = 'none';
  }

  _draw(t) {
    const ctx    = this.ctx;
    const W      = window.innerWidth;
    const H      = window.innerHeight;
    const isLight = document.body.classList.contains('theme-light');

    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < this._particles.length; i++) {
      const p = this._particles[i];

      p.y -= p.vy;
      p.x += p.drift + Math.sin(t * 0.00042 + p.phase) * 0.16;

      // Fade in from bottom third, fade out near top
      const frac = 1.0 - (p.y / H);
      const fade = Math.min(frac * 5.0, (1.0 - frac) * 3.0, 1.0);
      p.opacity  = p.maxOpacity * Math.max(0, fade);

      if (p.y < -p.glow * 2) {
        this._particles[i] = this._makeParticle(false);
        continue;
      }

      const alpha = isLight ? p.opacity * 0.40 : p.opacity;
      if (alpha < 0.004) continue;

      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.glow);
      grd.addColorStop(0,    `rgba(${p.r},${p.g},${p.b},${(alpha * 0.95).toFixed(3)})`);
      grd.addColorStop(0.35, `rgba(${p.r},${p.g},${p.b},${(alpha * 0.28).toFixed(3)})`);
      grd.addColorStop(1,    `rgba(${p.r},${p.g},${p.b},0)`);

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.glow, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
    }
  }
}

window.PalmTreeEngine = PalmTreeEngine;
