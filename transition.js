// transition.js – water puddle blur

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
    return this._puddleBlur(callback);
  }

  _puddleBlur(callback) {
    return new Promise(resolve => {
      const W = window.innerWidth, H = window.innerHeight;
      const ctx = this._ctx;
      this._canvas.style.display = 'block';

      // ── Timing ──────────────────────────────────────────────
      const SPREAD  = 260;          // ms: circles burst outward
      const HOLD    = 55;           // ms: everything covered, hold
      const FADE    = 200;          // ms: dissolve back out
      const SWAP_AT = SPREAD * 0.5; // swap content at 50% spread

      // ── Drop grid: 4×3 semi-random for guaranteed coverage ──
      const COLS = 4, ROWS = 3;
      const diagR = Math.hypot(W, H) * 0.64; // enough radius from any point
      const drops = [];
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          drops.push({
            x: W * ((c + 0.5) / COLS) + (Math.random() - 0.5) * (W / COLS) * 0.55,
            y: H * ((r + 0.5) / ROWS) + (Math.random() - 0.5) * (H / ROWS) * 0.55,
            delay: (r * COLS + c) * 12 + Math.random() * 18,
            r: diagR,
          });
        }
      }

      let swapped = false, start = null, done = false;
      const appEl = document.getElementById('app');
      const cleanup = () => { if (appEl) appEl.style.filter = ''; };
      // Safety: if anything goes wrong, ensure filter is always cleaned up
      const safeResolve = () => { if (!done) { done = true; cleanup(); resolve(); } };

      const tick = (now) => {
        if (!start) start = now;
        const t = now - start;
        const TOTAL = SPREAD + HOLD + FADE;

        if (t > TOTAL) {
          ctx.clearRect(0, 0, W, H);
          this._canvas.style.display = 'none';
          safeResolve();
          return;
        }

        ctx.clearRect(0, 0, W, H);

        // ── Phase 1 + 2: spread and hold ────────────────────
        if (t <= SPREAD + HOLD) {
          const rawP = Math.min(1, t / SPREAD);
          const blurPx = easeOut(rawP) * 10;
          if (appEl) appEl.style.filter = `blur(${blurPx.toFixed(1)}px)`;

          drops.forEach(drop => {
            const dt = Math.max(0, t - drop.delay);
            if (dt <= 0) return;
            const p  = Math.min(1, dt / SPREAD);
            const ep = easeOut(p);
            const r  = ep * drop.r;

            // ── Water fill (deep radial gradient) ───────────
            const a = Math.min(0.80, ep * 1.65);
            const g = ctx.createRadialGradient(drop.x, drop.y, 0, drop.x, drop.y, r);
            g.addColorStop(0,    `rgba(2,  13, 34,  ${a * 0.97})`);
            g.addColorStop(0.5,  `rgba(3,  24, 58,  ${a * 0.85})`);
            g.addColorStop(0.8,  `rgba(0,  55, 95,  ${a * 0.50})`);
            g.addColorStop(1,    `rgba(0, 110, 155, ${a * 0.14})`);
            ctx.beginPath();
            ctx.arc(drop.x, drop.y, r, 0, Math.PI * 2);
            ctx.fillStyle = g;
            ctx.fill();

            // ── Ripple rings (2 concentric) ──────────────────
            for (let i = 0; i < 2; i++) {
              const rp = Math.max(0, p - i * 0.20);
              if (rp <= 0) continue;
              const ringR = easeOut(rp) * drop.r * (0.90 + i * 0.09);
              const ringA = Math.max(0, (0.52 - easeOut(rp) * 0.48) - i * 0.12);
              if (ringA < 0.01) continue;
              ctx.beginPath();
              ctx.arc(drop.x, drop.y, ringR, 0, Math.PI * 2);
              ctx.strokeStyle = `rgba(0, 215, 248, ${ringA})`;
              ctx.lineWidth = 1.8 - i * 0.6;
              ctx.stroke();
            }
          });

          // ── Surface gloss (single specular pass across all drops) ──
          ctx.globalAlpha = Math.min(0.18, rawP * 0.22);
          drops.forEach(drop => {
            const dt = Math.max(0, t - drop.delay);
            if (dt <= 0) return;
            const r = easeOut(Math.min(1, dt / SPREAD)) * drop.r * 0.38;
            const sg = ctx.createRadialGradient(
              drop.x - r * 0.28, drop.y - r * 0.28, 0,
              drop.x, drop.y, r
            );
            sg.addColorStop(0,   'rgba(80, 200, 240, 0.7)');
            sg.addColorStop(0.4, 'rgba(20, 130, 200, 0.2)');
            sg.addColorStop(1,   'rgba(0,   0,   0, 0)');
            ctx.beginPath();
            ctx.arc(drop.x - r * 0.18, drop.y - r * 0.18, r, 0, Math.PI * 2);
            ctx.fillStyle = sg;
            ctx.fill();
          });
          ctx.globalAlpha = 1;

          if (!swapped && t >= SWAP_AT) { callback(); swapped = true; }

        // ── Phase 3: dissolve out ────────────────────────────
        } else {
          const fp    = (t - SPREAD - HOLD) / FADE;
          const alpha = 1 - easeIn(fp);
          if (appEl) appEl.style.filter = `blur(${(alpha * 10).toFixed(1)}px)`;

          ctx.fillStyle = `rgba(2, 11, 30, ${alpha * 0.84})`;
          ctx.fillRect(0, 0, W, H);

          // Lingering cyan halo rings
          ctx.globalAlpha = alpha * 0.09;
          drops.forEach(drop => {
            ctx.beginPath();
            ctx.arc(drop.x, drop.y, drop.r * 0.96, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0, 205, 240, 1)';
            ctx.lineWidth = 1.2;
            ctx.stroke();
          });
          ctx.globalAlpha = 1;
        }

        requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    });
  }
}

// ── Easing helpers ───────────────────────────────────────────
function easeOut(t) { return 1 - Math.pow(1 - t, 2.8); }
function easeIn(t)  { return t * t; }

window.TransitionEngine = TransitionEngine;
