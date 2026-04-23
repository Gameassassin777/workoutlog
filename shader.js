// shader.js - WebGL Cresting Waves & Splash Engine

const vertexShaderSource = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision highp float;
  varying vec2 v_uv;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform int u_isLightMode;
  uniform float u_splashProgress; // 0.0 to 1.0 for splash transition

  // Simplex 2D noise
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
             -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
      dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // Fractal Brownian Motion
  float fbm(vec2 st) {
      float value = 0.0;
      float amplitude = .5;
      for (int i = 0; i < 5; i++) {
          value += amplitude * snoise(st);
          st *= 2.;
          amplitude *= .5;
      }
      return value;
  }

  void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;
    vec2 uv = v_uv;

    // Splash Distortion Effect
    float splashRipple = 0.0;
    if (u_splashProgress > 0.0 && u_splashProgress < 1.0) {
      float dist = length(uv - vec2(0.5));
      // Exploding ripple ring
      splashRipple = sin(dist * 40.0 - u_splashProgress * 30.0) * exp(-dist * 8.0) * sin(u_splashProgress * 3.1415);
      st += splashRipple * 0.15;
    }

    float time = u_time * 0.15;
    
    // Wave distortion (Domain Warping)
    vec2 q = vec2(0.);
    q.x = fbm( st + 0.0*time);
    q.y = fbm( st + vec2(1.0));

    vec2 r = vec2(0.);
    r.x = fbm( st + 1.0*q + vec2(1.7,9.2)+ 0.15*time );
    r.y = fbm( st + 1.0*q + vec2(8.3,2.8)+ 0.126*time);

    float f = fbm(st+r);

    // Calculate Normal for Light Sparkles
    vec2 eps = vec2(0.02, 0.0);
    float dx = fbm(st + r + eps.xy) - fbm(st + r - eps.xy);
    float dy = fbm(st + r + eps.yx) - fbm(st + r - eps.yx);
    vec3 normal = normalize(vec3(-dx, -dy, 0.6));
    
    // Sun / Moon position
    vec3 lightDir = normalize(vec3(0.5, 0.6, 0.8));
    if (u_isLightMode == 0) {
      lightDir = normalize(vec3(0.2, 0.4, 0.6)); // Lower angle for sunset
    }

    // Specular Highlight (Sparkles!)
    float spec = pow(max(dot(normal, lightDir), 0.0), 32.0);
    // Add tiny sharp sparkles
    float sharpSparkle = pow(max(dot(normal, lightDir), 0.0), 128.0) * 1.5;

    // Color palettes based on theme
    vec3 deepWater, shallowWater, crestColor, sparkleColor;
    
    if (u_isLightMode == 1) {
      // Bright Beach Day
      deepWater = vec3(0.0, 0.48, 0.6);      // Ocean blue
      shallowWater = vec3(0.0, 0.8, 0.9);    // Bright cyan
      crestColor = vec3(0.8, 0.95, 1.0);     // Foam
      sparkleColor = vec3(1.0, 1.0, 1.0);    // White sun
    } else {
      // Sunset Ocean
      deepWater = vec3(0.04, 0.11, 0.24);    // Deep twilight blue
      shallowWater = vec3(0.88, 0.24, 0.21); // Deep red
      crestColor = vec3(1.0, 0.37, 0.23);    // Orange foam
      sparkleColor = vec3(1.0, 0.8, 0.4);    // Golden sun
    }

    vec3 color = mix(deepWater, shallowWater, clamp((f*f)*3.0, 0.0, 1.0));
    color = mix(color, crestColor, clamp(length(q), 0.0, 1.0));
    
    // Mix in sparkles
    color += spec * sparkleColor * 0.4;
    color += sharpSparkle * sparkleColor;
    
    // Add Splash Brightness
    if (splashRipple > 0.0) {
      color += vec3(0.2, 0.4, 0.8) * splashRipple; // Water flash
    }

    gl_FragColor = vec4((f*f*f+.6*f*f+.5*f)*color + (splashRipple * 0.2), 1.0);
  }
`;

class OceanShader {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    
    this.gl = this.canvas.getContext('webgl');
    if (!this.gl) return;

    this.program = this.createProgram(this.gl, vertexShaderSource, fragmentShaderSource);
    this.positionAttributeLocation = this.gl.getAttribLocation(this.program, "a_position");
    this.timeLocation = this.gl.getUniformLocation(this.program, "u_time");
    this.resolutionLocation = this.gl.getUniformLocation(this.program, "u_resolution");
    this.isLightModeLocation = this.gl.getUniformLocation(this.program, "u_isLightMode");
    this.splashProgressLocation = this.gl.getUniformLocation(this.program, "u_splashProgress");

    this.positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    const positions = [
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ];
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);

    this.resize();
    window.addEventListener('resize', () => this.resize());

    this.isRunning = false;
    this.animationFrameId = null;
    this.startTime = performance.now();
    this.splashProgress = 0.0;
  }

  createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) return shader;
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
  }

  createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    const vs = this.createShader(gl, gl.VERTEX_SHADER, vertexShader);
    const fs = this.createShader(gl, gl.FRAGMENT_SHADER, fragmentShader);
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    return program;
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  triggerSplash() {
    this.splashProgress = 0.01;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.canvas.style.display = 'block';
    const render = (now) => {
      if (!this.isRunning) return;
      this.draw(now);
      this.animationFrameId = requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.canvas) {
      this.canvas.style.display = 'none';
    }
  }

  draw(now) {
    const gl = this.gl;
    const time = (now - this.startTime) * 0.001;

    // Advance splash progress
    if (this.splashProgress > 0.0 && this.splashProgress < 1.0) {
      this.splashProgress += 0.03; // ~33 frames to complete, ~0.5s at 60fps
      if (this.splashProgress >= 1.0) this.splashProgress = 0.0;
    }

    gl.useProgram(this.program);
    gl.enableVertexAttribArray(this.positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.vertexAttribPointer(this.positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    gl.uniform1f(this.timeLocation, time);
    gl.uniform2f(this.resolutionLocation, gl.canvas.width, gl.canvas.height);
    gl.uniform1f(this.splashProgressLocation, this.splashProgress);
    
    const isLightMode = document.body.classList.contains('theme-light') ? 1 : 0;
    gl.uniform1i(this.isLightModeLocation, isLightMode);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}

window.OceanShaderEngine = OceanShader;
