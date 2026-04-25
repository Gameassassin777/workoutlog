// shader.js – WebGL Underwater Caustics

const vertexShaderSource = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  uniform float u_time;
  uniform vec2  u_resolution;
  uniform int   u_isLightMode;

  // One caustic layer: domain-warped interference of three sine waves
  float causticLayer(vec2 p, float t, float scale, float speed) {
    p *= scale;

    // Slow organic warp so the pattern breathes
    float wx = sin(p.x * 0.8 + p.y * 0.6 + t * 0.18);
    float wy = sin(p.y * 0.9 - p.x * 0.5 + t * 0.14);
    p += vec2(wx, wy) * 0.3;

    // Three sine waves 120 degrees apart
    float a = sin( p.x * 2.8 + p.y * 1.6 + t * speed);
    float b = sin(-p.x * 1.4 + p.y * 2.9 - t * speed * 0.85 + 2.1);
    float c = sin(-p.x * 1.5 - p.y * 2.4 + t * speed * 0.92 + 4.2);

    float v = (a + b + c) / 3.0;  // -1..1
    v = v * 0.5 + 0.5;             // 0..1
    return pow(v, 4.0);             // sharpen to bright peaks only
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = uv * vec2(u_resolution.x / u_resolution.y, 1.0) * 2.0;
    float t = u_time;

    // Two layers: large slow + smaller faster
    float c1 = causticLayer(p,                     t, 1.0, 0.30);
    float c2 = causticLayer(p + vec2(3.7, 1.9),    t, 2.0, 0.42);
    float caustics = c1 * 0.65 + c2 * 0.35;

    // Depth gradient — darker at bottom, hint of light toward surface
    float depth = uv.y;

    vec3 col;
    if (u_isLightMode == 1) {
      vec3 seaDeep    = vec3(0.0,  0.38, 0.52);
      vec3 seaShallow = vec3(0.04, 0.65, 0.80);
      col  = mix(seaDeep, seaShallow, depth * 0.8);
      col += caustics * vec3(0.7, 1.0, 1.0) * 0.28;
    } else {
      vec3 abyss   = vec3(0.008, 0.052, 0.110);
      vec3 surface = vec3(0.012, 0.085, 0.190);
      col  = mix(abyss, surface, depth * 0.65);
      // Aqua/teal caustic shimmer
      col += caustics * vec3(0.0, 0.82, 1.0) * 0.11;
      // Faint teal bloom near surface
      col += smoothstep(0.55, 1.0, depth) * vec3(0.0, 0.04, 0.08);
    }

    gl_FragColor = vec4(col, 1.0);
  }
`;

class OceanShader {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.gl = this.canvas.getContext('webgl');
    if (!this.gl) return;

    this._prog = this._build(vertexShaderSource, fragmentShaderSource);
    if (!this._prog) return;

    const gl = this.gl;
    this._attr  = gl.getAttribLocation(this._prog, 'a_position');
    this._uTime = gl.getUniformLocation(this._prog, 'u_time');
    this._uRes  = gl.getUniformLocation(this._prog, 'u_resolution');
    this._uLite = gl.getUniformLocation(this._prog, 'u_isLightMode');

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]),
      gl.STATIC_DRAW);
    this._buf = buf;

    this.isRunning = false;
    this._raf = null;
    this._t0  = performance.now();

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  _compile(type, src) {
    const sh = this.gl.createShader(type);
    this.gl.shaderSource(sh, src);
    this.gl.compileShader(sh);
    if (!this.gl.getShaderParameter(sh, this.gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', this.gl.getShaderInfoLog(sh));
      return null;
    }
    return sh;
  }

  _build(vsSrc, fsSrc) {
    const vs = this._compile(this.gl.VERTEX_SHADER,   vsSrc);
    const fs = this._compile(this.gl.FRAGMENT_SHADER, fsSrc);
    if (!vs || !fs) return null;
    const prog = this.gl.createProgram();
    this.gl.attachShader(prog, vs);
    this.gl.attachShader(prog, fs);
    this.gl.linkProgram(prog);
    if (!this.gl.getProgramParameter(prog, this.gl.LINK_STATUS)) {
      console.error('Program link error:', this.gl.getProgramInfoLog(prog));
      return null;
    }
    return prog;
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
    if (this.gl) this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.canvas.style.display = 'block';
    const tick = (now) => {
      if (!this.isRunning) return;
      this._draw(now);
      this._raf = requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  stop() {
    this.isRunning = false;
    if (this._raf) cancelAnimationFrame(this._raf);
    if (this.canvas) this.canvas.style.display = 'none';
  }

  _draw(now) {
    const gl = this.gl;
    if (!this._prog) return;
    const t = (now - this._t0) * 0.001;
    gl.useProgram(this._prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, this._buf);
    gl.enableVertexAttribArray(this._attr);
    gl.vertexAttribPointer(this._attr, 2, gl.FLOAT, false, 0, 0);
    gl.uniform1f(this._uTime, t);
    gl.uniform2f(this._uRes,  gl.canvas.width, gl.canvas.height);
    gl.uniform1i(this._uLite, document.body.classList.contains('theme-light') ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}

window.OceanShaderEngine = OceanShader;
