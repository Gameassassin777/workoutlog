// palm.js – stub; palm tree provided by background video

class PalmTreeEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.isRunning = false;
    if (this.canvas) this.canvas.style.display = 'none';
  }
  start() { this.isRunning = true; }
  stop()  { this.isRunning = false; }
}

window.PalmTreeEngine = PalmTreeEngine;
