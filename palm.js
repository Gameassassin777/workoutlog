// palm.js - Procedural Swaying Palm Tree Engine

class PalmTreeEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.resize();
    window.addEventListener('resize', () => this.resize());
    
    this.isRunning = false;
    this.animationFrameId = null;
  }
  
  resize() {
    if (!this.canvas) return;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.canvas.style.width = window.innerWidth + 'px';
    this.canvas.style.height = window.innerHeight + 'px';
    this.ctx.scale(dpr, dpr);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.canvas.style.display = 'block';
    
    const render = (time) => {
      if (!this.isRunning) return;
      this.draw(time);
      this.animationFrameId = requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    if (this.canvas) this.canvas.style.display = 'none';
  }

  draw(time) {
    const ctx = this.ctx;
    const w = window.innerWidth;
    const h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);

    const isLightMode = document.body.classList.contains('theme-light');
    
    ctx.save();
    // Start at bottom left
    ctx.translate(w * -0.05, h + 20);
    
    // Draw trunk segments
    let len = h * 0.16;
    let angle = Math.PI / 6; // Leaning right
    let trunkWidth = 35;

    // Volumetric shading for the trunk
    const trunkGradient = ctx.createLinearGradient(-trunkWidth/2, 0, trunkWidth/2, 0);
    if (isLightMode) {
      trunkGradient.addColorStop(0, '#2A1A0B'); // Shadow side
      trunkGradient.addColorStop(0.5, '#6B4423'); // Mid
      trunkGradient.addColorStop(1, '#9C6B3F'); // Sun side
    } else {
      trunkGradient.addColorStop(0, '#010205'); // Deep night
      trunkGradient.addColorStop(0.7, '#0A1526'); // Ambient
      trunkGradient.addColorStop(1, '#FF5E3A'); // Sunset rim light!
    }

    ctx.strokeStyle = trunkGradient;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 15;
    
    for (let i = 0; i < 7; i++) {
      // Wind sway
      const sway = Math.sin(time * 0.001 - i * 0.2) * 0.025;
      angle += sway + 0.06; 
      
      ctx.rotate(angle);
      ctx.lineWidth = trunkWidth;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -len);
      ctx.stroke();
      
      ctx.translate(0, -len);
      trunkWidth *= 0.85;
      len *= 0.94;
    }

    // Draw radial fronds at the top of the trunk
    const numFronds = 14;
    for (let i = 0; i < numFronds; i++) {
      ctx.save();
      // Spread them in a semi-circle mostly drooping down
      const frondAngle = (Math.PI * 1.8 / numFronds) * i - (Math.PI * 0.9);
      // Fronds sway slightly independently
      const frondSway = Math.sin(time * 0.0015 + i) * 0.08;
      ctx.rotate(frondAngle + frondSway);
      
      this.drawFrond(ctx, h * 0.45, isLightMode, time, i);
      ctx.restore();
    }
    
    ctx.restore();
  }

  drawFrond(ctx, len, isLight, time, index) {
    const shadowColor = isLight ? '#145A32' : '#040B1A';
    const midColor = isLight ? '#2ECC71' : '#0B1B3D';
    const highlightColor = isLight ? '#A9DFBF' : '#FFC837'; // Rim light
    
    // Frond Spine (Volumetric)
    const spineGrad = ctx.createLinearGradient(0, 0, len, 0);
    spineGrad.addColorStop(0, shadowColor);
    spineGrad.addColorStop(1, highlightColor);
    
    ctx.strokeStyle = spineGrad;
    ctx.lineWidth = 6;
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 10;
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(len * 0.4, -len * 0.2, len, len * 0.4);
    ctx.stroke();

    // Draw densely packed leaves for a 3D lush look
    ctx.lineWidth = 3;
    ctx.shadowBlur = 4;
    for (let i = 0.05; i < 0.95; i += 0.02) {
      const x = len * i;
      const y = (len * 0.4) * (i * i); 
      
      const ripple = Math.sin(time * 0.005 + x * 0.01 + index) * 6;
      
      // Volumetric shading per leaf based on position
      if (i < 0.4) {
        ctx.strokeStyle = shadowColor; // Deep shadows near trunk
      } else if (i < 0.8) {
        ctx.strokeStyle = midColor;
      } else {
        ctx.strokeStyle = highlightColor; // Tips catch light
      }
      
      // Top leaf layer
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + 15, y - 25 + ripple, x + 40, y - 5 + ripple);
      ctx.stroke();
      
      // Bottom leaf layer (darker for depth)
      ctx.strokeStyle = shadowColor;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x - 15, y + 25 + ripple, x + 30, y + 40 + ripple);
      ctx.stroke();
    }
  }
}

window.PalmTreeEngine = PalmTreeEngine;
