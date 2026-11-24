import { useEffect, useRef } from "react";

// One full-screen WebGL pass: twinkling stars, aurora curtains and Earth's night limb.
// Scroll drives the story: the limb sinks as you "launch", then rises again at the end (Earthrise).
const VERT = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";
const FRAG = `
precision highp float;
uniform vec2 r; uniform float t; uniform float s; uniform vec2 m;
float h(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p=p*2.03+7.1;a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/r;
  float asp=r.x/r.y;
  vec2 q=vec2((uv.x-.5)*asp,uv.y-.5)+m*vec2(.04,-.03);
  vec3 col=mix(vec3(.018,.024,.04),vec3(.03,.036,.064),uv.y);
  for(int L=0;L<2;L++){
    float fl=float(L);
    vec2 g=(q+vec2(0.,s*(.35+fl*.3)))*(90.+fl*70.);
    vec2 id=floor(g); vec2 f=fract(g)-.5;
    float rnd=h(id+fl*13.);
    if(rnd>.965){
      vec2 o=vec2(h(id+1.),h(id+2.))-.5;
      float d=length(f-o*.6);
      float tw=.6+.4*sin(t*(1.+rnd*3.)+rnd*40.);
      col+=vec3(.85,.9,1.)*(1.-smoothstep(0.,.09,d))*tw*(.9-fl*.4);
    }
  }
  float ai=1.-smoothstep(.12,.42,s)+smoothstep(.8,1.,s)*.7;
  for(int k=0;k<3;k++){
    float fk=float(k);
    float x=q.x*(1.1+fk*.25)+fk*1.7;
    float base=-.02+.22*fbm(vec2(x*.9+t*.025,fk*3.1))-fk*.06+s*.4;
    float d=q.y-base;
    float body=smoothstep(-.015,.03,d)*exp(-max(d,0.)*(4.5+fk));
    float rays=pow(fbm(vec2(x*14.+t*.15,q.y*.8-t*.05)),2.)*2.2;
    vec3 c=mix(vec3(.3,.95,.68),vec3(.55,.42,1.),smoothstep(.02,.35,d));
    col+=c*body*rays*(.42-fk*.09)*ai;
  }
  float R=2.6;
  float limb=mix(-.28,-.95,smoothstep(0.,.22,s))+smoothstep(.82,1.,s)*.62;
  vec2 cc=vec2(m.x*.05,limb-R);
  float dist=length(q-cc)-R;
  float inside=1.-smoothstep(-.002,.002,dist);
  vec3 night=vec3(.006,.01,.02);
  vec2 cg=(q-cc)*120.;
  float cr=h(floor(cg));
  float depth=clamp(-dist*6.,0.,1.);
  night+=vec3(1.,.55,.25)*step(.93,cr)*(1.-smoothstep(0.,.35,length(fract(cg)-.5)))*(1.-depth)*.9;
  col=mix(col,night,inside);
  col+=vec3(.35,.72,1.)*exp(-abs(dist)*160.)*.9;
  col+=vec3(.3,.9,.7)*exp(-max(dist,0.)*9.)*.22*(1.-inside);
  col*=1.-.35*length(uv-.5);
  gl_FragColor=vec4(col,1.);
}`;

const SkyCanvas = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    const gl = c?.getContext("webgl", { antialias: false, alpha: false, powerPreference: "high-performance" });
    if (!c || !gl) return; // the canvas's CSS background stays as the fallback

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(sh));
      return sh;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (name: string) => gl.getUniformLocation(prog, name);
    const [uR, uT, uS, uM] = ["r", "t", "s", "m"].map(u);

    // shortcut: renders at ~50% resolution; the scene is soft, so this is invisible and saves fill-rate on phones
    const scale = Math.min(window.devicePixelRatio, 1.5) * 0.5;
    const resize = () => {
      c.width = (window.innerWidth * scale) | 0;
      c.height = (window.innerHeight * scale) | 0;
      gl.viewport(0, 0, c.width, c.height);
    };
    resize();

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e: PointerEvent) => {
      mouse.tx = e.clientX / window.innerWidth - 0.5;
      mouse.ty = e.clientY / window.innerHeight - 0.5;
    };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t0 = performance.now();
    let raf = 0;

    const draw = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      gl.uniform2f(uR, c.width, c.height);
      gl.uniform1f(uT, reduce ? 20 : (performance.now() - t0) / 1000);
      gl.uniform1f(uS, max > 0 ? Math.min(1, window.scrollY / max) : 0);
      gl.uniform2f(uM, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    draw();

    const onResize = () => { resize(); if (reduce) draw(); };
    const onScroll = () => { if (reduce) draw(); };
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="fixed inset-0 z-0 h-full w-full bg-ink" />;
};

export default SkyCanvas;
