// shader.js – stub; background provided by #bg-video

class OceanShader {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.isRunning = false;
    // Hide the canvas — video is the background now
    if (this.canvas) this.canvas.style.display = 'none';
  }
  start() { this.isRunning = true; }
  stop()  { this.isRunning = false; }
}

window.OceanShaderEngine = OceanShader;
