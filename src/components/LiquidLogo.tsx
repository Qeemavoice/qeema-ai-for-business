import React, { useEffect, useRef, useState } from 'react';

/**
 * Glass play-triangle (the Qeema logo) with audio-reactive liquid colour inside.
 * Port of the designer's render_liquid.py: same blobs, warps, speeds and smoothing.
 * One shared WebGL2 canvas renders every instance; idle instances show a cached still.
 */

// Liquid looks: 7 blob colours, deep valley colour, spray colours left to right.
export const LIQUID_VARIANTS = [
  { name: 'lilac', blobs: [[.47, .52, 1], [.64, .46, .98], [1, .58, .82], [1, .74, .70], [.52, .33, .92], [.58, .78, 1], [.96, .48, .96]], deep: [.30, .22, .62], spray: [[.55, .65, 1], [.70, .55, 1], [1, .62, .88], [1, .75, .78], [.8, .7, 1]] },
  { name: 'ember', blobs: [[1, .42, .10], [1, .70, .34], [.86, .20, .06], [1, .80, .56], [.70, .24, .07], [1, .56, .20], [1, .87, .66]], deep: [.32, .06, .02], spray: [[1, .55, .25], [1, .68, .35], [1, .45, .15], [1, .78, .45], [1, .62, .30]] },
  { name: 'garnet', blobs: [[.76, .28, .20], [.26, .08, .06], [.06, .03, .03], [.92, .44, .36], [.66, .66, 1], [.46, .10, .10], [.12, .04, .04]], deep: [.03, .01, .01], spray: [[.70, .70, 1], [.85, .45, .45], [.95, .40, .32], [.80, .30, .25], [.95, .55, .45]] },
  { name: 'grove', blobs: [[1, .68, .20], [1, .54, .14], [.34, .66, .30], [.62, .86, .42], [.10, .40, .34], [.05, .20, .15], [1, .86, .42]], deep: [.02, .10, .08], spray: [[.40, .80, .50], [.60, .88, .45], [1, .75, .30], [1, .62, .22], [.95, .85, .45]] },
];

/** Stable look for any id (voice id, category key...). */
export const variantFor = (id: string) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h) % LIQUID_VARIANTS.length;
};

const VERT = `#version 300 es
in vec2 a; out vec2 p;
void main(){ p = a; gl_Position = vec4(a, 0., 1.); }`;

const FRAG = `#version 300 es
precision highp float;
in vec2 p; out vec4 o;
uniform vec3 uCol[7]; uniform vec3 uDeep; uniform float uT, uE, uPad;
const float B[42] = float[42](
  -.75,-.55,.85,.34,.31,0., -.15,-.95,.70,.30,-.27,1.3, -.55,.65,.75,.36,.23,2.6,
  .25,.45,.80,.32,-.35,3.9, .80,.05,.72,.28,.29,5.1, .35,-.20,.62,.38,.41,.7, 1.,.20,.55,.22,-.38,4.4);
float sdTri(vec2 q, vec2 a, vec2 b, vec2 c){
  vec2 e0=b-a,e1=c-b,e2=a-c,v0=q-a,v1=q-b,v2=q-c;
  vec2 p0=v0-e0*clamp(dot(v0,e0)/dot(e0,e0),0.,1.);
  vec2 p1=v1-e1*clamp(dot(v1,e1)/dot(e1,e1),0.,1.);
  vec2 p2=v2-e2*clamp(dot(v2,e2)/dot(e2,e2),0.,1.);
  float s=sign(e0.x*e2.y-e0.y*e2.x);
  vec2 d=min(min(vec2(dot(p0,p0),s*(v0.x*e0.y-v0.y*e0.x)),vec2(dot(p1,p1),s*(v1.x*e1.y-v1.y*e1.x))),vec2(dot(p2,p2),s*(v2.x*e2.y-v2.y*e2.x)));
  return -sqrt(d.x)*sign(d.y);
}
vec2 warp(vec2 q){
  float r=length(q), a=(.32+uE)*sin(r*1.7-.8*uT), w=.18+.62*uE;
  vec2 u=vec2(q.x*cos(a)-q.y*sin(a), q.x*sin(a)+q.y*cos(a));
  float q1=sin(1.8*u.y+1.1*uT+.7*sin(1.2*u.x-.5*uT)), q2=sin(1.6*u.x-.9*uT+.7*sin(1.3*u.y+.6*uT));
  vec2 u2=u+w*vec2(q1,q2);
  return u2+w*.55*vec2(sin(3.1*u2.y-1.5*uT+2.*q2), sin(2.9*u2.x+1.3*uT+2.*q1));
}
float height(vec2 w, out vec3 col){
  vec3 top=vec3(0.); float bot=1e-4, h=0.;
  for(int i=0;i<7;i++){
    float bx=B[i*6],by=B[i*6+1],br=B[i*6+2],orb=B[i*6+3],sp=B[i*6+4],ph=B[i*6+5];
    vec2 c=vec2(bx+orb*cos(sp*uT+ph), by+orb*sin(sp*1.3*uT+ph*1.7));
    float rad=br*(1.+(.12+.34*uE)*sin(.9*uT+ph*2.));
    vec2 dd=w-c; float g=exp(-dot(dd,dd)/(rad*rad)), g2=pow(g,2.2);
    top+=g2*uCol[i]; bot+=g2; h+=g;
  }
  col=(top+uDeep*.05)/(bot+.05);
  return h;
}
vec3 screenB(vec3 a, vec3 b){ return 1.-(1.-clamp(a,0.,1.))*(1.-clamp(b,0.,1.)); }
void main(){
  vec2 q=p*uPad;                      // shape space: triangle spans about -1..1
  q.y=-q.y;
  float d=sdTri(q,vec2(-.56,-.70),vec2(-.56,.70),vec2(.66,0.))-.26;
  float aa=fwidth(d)*1.2;
  float shape=1.-smoothstep(-aa,aa,d);
  // liquid
  vec2 lq=warp(q*1.25);
  vec3 col; float e=.004;
  vec3 tmp;
  float h=height(lq,col);
  float hx=height(warp((q+vec2(e,0.))*1.25),tmp)-height(warp((q-vec2(e,0.))*1.25),tmp);
  float hy=height(warp((q+vec2(0.,e))*1.25),tmp)-height(warp((q-vec2(0.,e))*1.25),tmp);
  vec3 n=normalize(vec3(-hx/(2.*e)*.3,-hy/(2.*e)*.3,1.));
  vec3 l=vec3(.75*cos(.55*uT),.75*sin(.43*uT+1.),.66);
  float dif=clamp(dot(n,l),0.,1.);
  float spec=pow(clamp(dot(n,normalize(l+vec3(0.,0.,1.))),0.,1.),22.)*(.55+.5*uE);
  float depth=smoothstep(.15,1.5,h);
  col=col*(.5+.7*dif)*(.62+.55*depth)+uDeep*(1.-depth)*.4;
  col=screenB(col,spec*vec3(.92,.88,1.));
  // glass rim: fixed, iridescent blue -> pink -> orange toward the tip
  float W=.22;
  float rim=smoothstep(-W,-W*.35,d);
  vec3 irid=mix(vec3(.30,.48,1.),vec3(1.,.42,.86),.5+.5*sin(atan(q.y,q.x)*2.+1.));
  irid=mix(irid,vec3(1.,.62,.28),smoothstep(.15,.75,q.x));
  vec3 glass=mix(col*.7+irid*.45,irid*1.1+.18,pow(rim,2.2));
  col=mix(col,glass,rim*.92);
  col+=.28*exp(-pow((d+W)/.02,2.))*mix(vec3(1.),irid,.4);   // inner bevel line
  col+=.75*exp(-pow((d+.018)/.012,2.))*mix(irid,vec3(1.),.35); // outer edge light
  // fixed gloss on top of the liquid
  float core=1.-rim;
  float sh=exp(-pow((q.x+.30)*3.2,2.)-pow((q.y-.42)*2.4,2.));
  sh+=.6*exp(-pow((d+W*1.25)/.03,2.))*smoothstep(.1,.6,q.y);
  col=mix(col,vec3(1.),clamp(sh,0.,1.)*.32*core);
  // soft outer glow
  float glow=exp(-max(d,0.)/.07)*(1.-shape)*(.22+.35*uE);
  float alpha=shape+glow;
  vec3 outc=col*shape+irid*glow;
  o=vec4(outc,clamp(alpha,0.,1.));
}`;

type Renderer = { canvas: HTMLCanvasElement; draw: (variant: number, T: number, e: number, px: number, pad: number) => void };
let renderer: Renderer | null | undefined;

function getRenderer(): Renderer | null {
  if (renderer !== undefined) return renderer;
  renderer = null;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2', { premultipliedAlpha: false, preserveDrawingBuffer: true, antialias: true });
    if (!gl) return null;
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader');
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (n: string) => gl.getUniformLocation(prog, n);
    const uCol = u('uCol'), uDeep = u('uDeep'), uT = u('uT'), uE = u('uE'), uPad = u('uPad');
    const flat = LIQUID_VARIANTS.map(v => new Float32Array(v.blobs.flat()));
    renderer = {
      canvas,
      draw(variant, T, e, px, pad) {
        if (canvas.width !== px) { canvas.width = px; canvas.height = px; }
        gl.viewport(0, 0, px, px);
        gl.uniform3fv(uCol, flat[variant]);
        gl.uniform3fv(uDeep, LIQUID_VARIANTS[variant].deep);
        gl.uniform1f(uT, T);
        gl.uniform1f(uE, e);
        gl.uniform1f(uPad, pad);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      },
    };
  } catch (err) {
    console.debug('LiquidLogo: WebGL2 unavailable', err);
    renderer = null;
  }
  return renderer;
}

const stills = new Map<string, string>();
function still(variant: number, px: number, pad: number): string | null {
  const key = `${variant}-${px}-${pad}`;
  if (stills.has(key)) return stills.get(key)!;
  const r = getRenderer();
  if (!r) return null;
  r.draw(variant, 4.4 + variant * 1.7, 0, px, pad);
  const url = r.canvas.toDataURL('image/png');
  stills.set(key, url);
  return url;
}

// ---- Audio energy: one analyser per media element (an element can only be wired once) ----
let actx: AudioContext | null = null;
const analysers = new WeakMap<HTMLMediaElement, AnalyserNode>();
function analyserFor(el: HTMLMediaElement): AnalyserNode | null {
  if (analysers.has(el)) return analysers.get(el)!;
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    actx = actx || new AC();
    const src = actx.createMediaElementSource(el);
    const an = actx.createAnalyser();
    an.fftSize = 1024;
    src.connect(an);
    an.connect(actx.destination);
    analysers.set(el, an);
    return an;
  } catch {
    return null;
  }
}

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

interface LiquidLogoProps {
  variant: number;
  /** CSS pixel size of the square box. */
  size: number;
  /** Animate (otherwise a cached still). */
  live?: boolean;
  /** Voice is playing: drives the energy (from `audio` when given, simulated otherwise). */
  playing?: boolean;
  audio?: HTMLMediaElement | null;
  /** Particles around the logo (large sizes only). */
  spray?: boolean;
  className?: string;
}

export const LiquidLogo: React.FC<LiquidLogoProps> = ({ variant, size, live = false, playing = false, audio, spray = false, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playingRef = useRef(playing);
  playingRef.current = playing;
  const stateRef = useRef({ e: 0, T: 4.4 + variant * 1.7 });
  const [fallback, setFallback] = useState(false);
  const pad = spray ? 1.55 : 1.08;           // room around the glass for spray / edge light
  const dpr = Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
  const px = Math.round(size * dpr);
  const animate = live && !reducedMotion();

  useEffect(() => {
    if (!animate) return;
    const r = getRenderer();
    const cv = canvasRef.current;
    const ctx = cv?.getContext('2d');
    if (!r || !cv || !ctx) { setFallback(true); return; }
    if (playing && audio && actx?.state === 'suspended') actx.resume();
    const an = playing && audio ? analyserFor(audio) : null;
    if (an && actx?.state === 'suspended') actx.resume();
    const buf = new Float32Array(an ? an.fftSize : 0);
    const look = LIQUID_VARIANTS[variant];
    const parts = spray ? makeParticles(110) : [];
    const st = stateRef.current;               // clock survives play/pause re-runs
    let { e, T } = st, last = performance.now(), raf = 0;
    const tick = (now: number) => {
      const dt = Math.min(.05, (now - last) / 1000);
      last = now;
      let target = 0;
      if (playingRef.current) {
        if (an) {
          an.getFloatTimeDomainData(buf);
          let s = 0;
          for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i];
          target = Math.min(1, Math.sqrt(s / buf.length) / .18);
        } else {
          target = .45 + .3 * Math.sin(now / 170) * Math.sin(now / 410 + 1); // ponytail: simulated voice when there is no real audio stream (speech synthesis)
        }
      }
      const k = (target > e ? .14 : .045) * dt * 60;   // attack faster than release
      e += (target - e) * Math.min(1, k);
      T += dt * (.22 + 3 * e);
      st.e = e; st.T = T;
      r.draw(variant, T, e, px, pad);
      ctx.clearRect(0, 0, px, px);
      if (parts.length) drawSpray(ctx, parts, now / 1000, e, px, pad, look.spray);
      ctx.drawImage(r.canvas, 0, 0);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animate, variant, px, pad, spray, audio, playing]);

  const box = { width: size, height: size };
  if (animate && !fallback) {
    return <canvas ref={canvasRef} width={px} height={px} style={box} className={className} aria-hidden="true" />;
  }
  const url = still(variant, px, pad);
  if (url) return <img src={url} alt="" style={box} className={className} draggable={false} />;
  const c = LIQUID_VARIANTS[variant].blobs.map(([r, g, b]) => `rgb(${r * 255},${g * 255},${b * 255})`);
  return <div style={{ ...box, background: `linear-gradient(135deg, ${c[0]}, ${c[2]}, ${c[4]})`, clipPath: 'polygon(18% 8%, 92% 50%, 18% 92%)' }} className={className} />;
};

// ---- Spray: particles born just outside the glass, drifting out and fading ----
type Particle = { x: number; y: number; nx: number; ny: number; life: number; off: number; size: number; drift: number; push: number; rate: number; ph: number; gate: number };
const TRI: [number, number][] = [[-.56, -.70], [.66, 0], [-.56, .70]];
function makeParticles(n: number): Particle[] {
  const out: Particle[] = [];
  for (let i = 0; i < n; i++) {
    const s = Math.floor(Math.random() * 3), t = Math.random();
    const [ax, ay] = TRI[s], [bx, by] = TRI[(s + 1) % 3];
    const ex = bx - ax, ey = by - ay, len = Math.hypot(ex, ey);
    const nx = ey / len, ny = -ex / len;          // outward normal (clockwise winding)
    const o = .29 + Math.random() * .14;
    out.push({ x: ax + ex * t + nx * o, y: ay + ey * t + ny * o, nx, ny, life: .9 + Math.random() * 2.1, off: Math.random() * 3,
      size: Math.random() ** 6, drift: .04 + Math.random() * .16, push: .5 + Math.random(), rate: 5 + Math.random() * 9, ph: Math.random() * 6.28, gate: Math.random() * .5 });
  }
  return out;
}
function drawSpray(ctx: CanvasRenderingContext2D, parts: Particle[], t: number, e: number, px: number, pad: number, pal: number[][]) {
  const s = px / 2 / pad;                           // shape units -> pixels
  for (const p of parts) {
    const pos = (t + p.off) / p.life, u = pos - Math.floor(pos);
    const fade = Math.sin(Math.PI * u) ** 1.3;
    const voice = Math.min(1, Math.max(0, (e + .22 - (p.gate - .12)) / .24));
    const a = fade * (.6 + .4 * Math.sin(t * p.rate + p.ph)) * voice * (.5 + .6 * e);
    if (a < .02) continue;
    const dist = p.drift * u * p.life + (2 + 11 * e) * p.push / s;
    const wob = Math.sin(t * .9 + p.ph) * .02;
    const x = px / 2 + (p.x + p.nx * dist - p.ny * wob) * s;
    const y = px / 2 + (p.y + p.ny * dist + p.nx * wob) * s;
    const f = Math.min(.999, Math.max(0, (p.x + .7) / 1.6)) * (pal.length - 1), i = Math.floor(f), k = f - i;
    const c = pal[i].map((v, j) => Math.round(255 * (v * (1 - k) + pal[i + 1][j] * k)));
    ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${Math.min(1, a)})`;
    ctx.beginPath();
    ctx.arc(x, y, (.6 + p.size * 2.6) * (px / 400) + .5, 0, 6.283);
    ctx.fill();
  }
}
