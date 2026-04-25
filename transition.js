// transition.js – ocean wave wipe

class TransitionEngine {
  constructor() {
    this._canvas = document.createElement('canvas');
    this._canvas.id = 'transition-canvas';
    Object.assign(this._canvas.style, {
      position: 'fixed', top: '0', left: '0',
      width: '100vw', height: '100vh',
      zIndex: '9999', pointerEvents: 'none', display: 'none',
    });
    document.body.appendChild(this._canvas);
    this._ctx = this._canvas.getContext('2d');
    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  _resize() {
    const dpr = window.devicePixelRatio || 1;
    this._canvas.width  = window.innerWidth  * dpr;
    this._canvas.height = window.innerHeight * dpr;
    this._ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  async runRandomTransition(callback) {
    return this._waveWipe(callback);
  }

  _waveWipe(callback) {
    return new Promise(resolve => {
      const W = window.innerWidth, H = window.innerHeight;
      const ctx = this._ctx;
      this._canvas.style.display = 'block';

      let swapped = false, start = null;
      const SWEEP = 320, HOLD = 50, TOTAL = SWEEP * 2 + HOLD;

      // Three overlapping sine waves make the edge organic
      const AMPS  = [H * 0.042, H * 0.026, H * 0.016];
      const FREQS = [2.6, 5.4, 9.1];
      const SPDS  = [1.3, 2.2, 3.4];

      const edgeX = (y, t, dir) => {
        let x = 0;
        for (let i = 0; i < 3; i++)
          x += AMPS[i] * Math.sin(FREQS[i] * (y / H) * Math.PI * 2 + t * SPDS[i] * dir);
        return x;
      };

      const tracePath = (cx, t, dir) => {
        ctx.beginPath();
        ctx.moveTo(-W * 0.08, 0);
        for (let y = 0; y <= H; y += 4) ctx.lineTo(cx + edgeX(y, t, dir), y);
        ctx.lineTo(-W * 0.08, H);
        ctx.closePath();
      };

      const tick = (now) => {
        if (!start) start = now;
        const e = now - start;
        ctx.clearRect(0, 0, W, H);

        let cx, dir;
        if      (e < SWEEP)              { cx = (e / SWEEP) * (W + W * 0.1) - W * 0.05; dir = 1; }
        else if (e < SWEEP + HOLD)       { cx = W + W * 0.1; dir = 1;
                                           if (!swapped) { callback(); swapped = true; } }
        else                             { const p = (e - SWEEP - HOLD) / SWEEP;
                                           cx = (1 - p) * (W + W * 0.1) - W * 0.05; dir = -1;
                                           if (!swapped) { callback(); swapped = true; } }

        if (e >= TOTAL) {
          ctx.clearRect(0, 0, W, H);
          this._canvas.style.display = 'none';
          resolve(); return;
        }

        const t = e * 0.001;

        // Dark ocean fill
        tracePath(cx, t, dir);
        const grad = ctx.createLinearGradient(0, 0, W, 0);
        grad.addColorStop(0,    'rgba(10, 18, 38,  0.96)');
        grad.addColorStop(0.5,  'rgba(5,  40, 80,  0.96)');
        grad.addColorStop(1,    'rgba(0, 160, 210, 0.90)');
        ctx.fillStyle = grad;
        ctx.fill();

        // Glowing wave crest
        ctx.beginPath();
        for (let y = 0; y <= H; y += 4) {
          const x = cx + edgeX(y, t, dir);
          y === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(0, 232, 255, 0.75)';
        ctx.lineWidth = 3;
        ctx.shadowColor = 'rgba(0, 220, 255, 0.95)';
        ctx.shadowBlur = 20;
        ctx.stroke();

        // Foam highlight offset
        ctx.beginPath();
        for (let y = 0; y <= H; y += 4) {
          const x = cx + edgeX(y, t, dir) + 9;
          y === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.20)';
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 0;
        ctx.stroke();

        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }
}

window.TransitionEngine = TransitionEngine;
