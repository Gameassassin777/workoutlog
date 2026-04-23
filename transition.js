// transition.js - Fast randomized UI transitions

class TransitionEngine {
  constructor() {
    this.createSandOverlay();
  }
  
  createSandOverlay() {
    this.sandCanvas = document.createElement('canvas');
    this.sandCanvas.id = 'sand-canvas';
    this.sandCanvas.style.position = 'fixed';
    this.sandCanvas.style.top = '0';
    this.sandCanvas.style.left = '0';
    this.sandCanvas.style.width = '100vw';
    this.sandCanvas.style.height = '100vh';
    this.sandCanvas.style.zIndex = '9999'; 
    this.sandCanvas.style.pointerEvents = 'none';
    this.sandCanvas.style.display = 'none';
    document.body.appendChild(this.sandCanvas);
    this.ctx = this.sandCanvas.getContext('2d');
    
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    this.sandCanvas.width = window.innerWidth * dpr;
    this.sandCanvas.height = window.innerHeight * dpr;
    this.ctx.scale(dpr, dpr);
  }

  async runRandomTransition(callback) {
    if (Math.random() > 0.5 && window.oceanShader && window.oceanShader.isRunning) {
       await this.runSplashTransition(callback);
    } else {
       await this.runSandTransition(callback);
    }
  }

  runSplashTransition(callback) {
    return new Promise(resolve => {
       window.oceanShader.triggerSplash();
       // Wait for the ripple to expand (approx 150ms)
       setTimeout(() => {
          callback();
       }, 150); 
       // Finish
       setTimeout(() => {
          resolve();
       }, 500);
    });
  }

  runSandTransition(callback) {
    return new Promise(resolve => {
       this.sandCanvas.style.display = 'block';
       const ctx = this.ctx;
       const w = window.innerWidth;
       const h = window.innerHeight;
       
       let progress = 0;
       let hasSwapped = false;
       const isLight = document.body.classList.contains('theme-light');
       
       // Create a noisy sand block
       const animate = () => {
         progress += 0.08; // extremely fast ~12 frames
         ctx.clearRect(0, 0, w, h);
         
         if (progress >= 1.0) {
           this.sandCanvas.style.display = 'none';
           resolve();
           return;
         }
         
         if (progress >= 0.4 && !hasSwapped) {
            callback();
            hasSwapped = true;
         }

         // Draw sweeping block of sand
         const blockX = (progress * w * 2.5) - w;
         
         ctx.fillStyle = isLight ? '#E5C494' : '#6B4423';
         ctx.fillRect(blockX, 0, w * 0.8, h);
         
         // Draw trailing/leading particles
         ctx.fillStyle = isLight ? '#CBA36E' : '#4A2A10';
         for(let i=0; i<300; i++) {
            const px = blockX + (Math.random() * w * 1.5) - w*0.2;
            const py = Math.random() * h;
            const size = Math.random() * 8 + 2;
            ctx.fillRect(px, py, size * 2, size * 0.5);
         }

         requestAnimationFrame(animate);
       };
       requestAnimationFrame(animate);
    });
  }
}
window.TransitionEngine = TransitionEngine;
