// lib/earth-scene.ts — the homepage's 3D Earth (redesign phase 3, 30 Oct 2026),
// built with three.js (a library that draws 3D with the phone's/computer's
// graphics chip, through WebGL). Browser only.
//
// This file is loaded ON DEMAND: components/home/HeroEarth.tsx imports it only
// after the page has appeared, and only on devices that can handle it — so
// three.js (~150 KB) never slows the first view, and old phones never fetch it
// (they get a still photo of the Earth instead).
//
// WHAT IT DRAWS:
//   - the Earth: the daytime picture where the sun shines, CITY LIGHTS on the
//     night side (from the night picture), a soft orange band at sunset, a
//     sun glint on the oceans only (the "water" picture says where water is),
//     and a blue edge of atmosphere;
//   - a glow of atmosphere around it;
//   - the World360 Atlas places as small gold dots, and every few seconds a
//     label ("1612 · The English open a factory at Surat") beside one of them.
// It sways gently on its own, and you can drag it sideways to spin it.
//
// The colour maths lives in two small "shaders" — programs that run on the
// graphics chip once per pixel (fragmentShader) or per corner (vertexShader).

import * as THREE from "three";

export type EarthPlace = { lat: number; lng: number; year: string; title: string };

export type EarthScene = {
  /** Which way the Earth is turned now (radians) — the loader matches it. */
  yaw: () => number;
  /** Stop drawing and free the graphics memory (when the homepage is left). */
  dispose: () => void;
  /** A picture of the Earth as it is now (used once, to make the still photo). */
  snapshot: () => string;
};

type Options = {
  textures: { day: string; night: string; water: string };
  places: EarthPlace[];
  phone: boolean;             // smaller sphere detail and pixel count on phones
  onProgress?: () => void;    // called once per picture downloaded (3 in all)
};

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));

// ── THE EARTH'S COLOURS (shared with the Atlas, lib/atlas-earth-layer.ts) ──
// Two small "shaders" — programs that run on the graphics chip once per
// pixel — for the Earth and for the glow around it. The sun is fixed relative
// to the VIEWER (up and to the left), so whatever the Earth turns to, the
// middle of the view is in daylight and the right edge shows the night side.
// `ortho`: the Atlas draws the Earth flat-on (no perspective), so the
// direction to the viewer is the same everywhere: straight out of the screen.
export function makeEarthMaterials(
  maps: { day: THREE.Texture; night: THREE.Texture; water: THREE.Texture },
  { ortho = false }: { ortho?: boolean } = {},
) {
  const SUN = new THREE.Vector3(-0.55, 0.35, 0.76).normalize();
  const earthMaterial = new THREE.ShaderMaterial({
    uniforms: { dayMap: { value: maps.day }, nightMap: { value: maps.night }, waterMap: { value: maps.water }, uSun: { value: SUN } },
    vertexShader: `varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = ${ortho ? "vec3(0.0, 0.0, 1.0)" : "normalize(-mv.xyz)"}; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform sampler2D dayMap; uniform sampler2D nightMap; uniform sampler2D waterMap; uniform vec3 uSun;
      varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main(){
        vec3 base = texture2D(dayMap, vUv).rgb;
        float water = smoothstep(0.35, 0.65, texture2D(waterMap, vUv).r);
        float NdL = dot(vN, uSun), lit = smoothstep(-0.10, 0.22, NdL);
        // daylight, brightest where the sun is overhead
        vec3 col = base * (0.04 + 1.08 * max(NdL, 0.0));
        // a warm sunset band along the day/night line
        col += base * vec3(0.55, 0.22, 0.05) * smoothstep(0.22, 0.0, abs(NdL - 0.04)) * 0.35;
        // city lights on the night side, on land only
        col += pow(texture2D(nightMap, vUv).rgb, vec3(1.5)) * vec3(1.0, 0.8, 0.52) * 1.9 * (1.0 - lit) * (1.0 - water);
        // the sun's glint on the oceans
        float NdH = max(dot(vN, normalize(uSun + vV)), 0.0);
        col += vec3(1.0, 0.95, 0.85) * (pow(NdH, 220.0) * 0.35 + pow(NdH, 18.0) * 0.04) * water * lit;
        // the blue haze of atmosphere at the edge
        float rim = pow(1.0 - max(dot(vN, vV), 0.0), 2.6);
        col = mix(col, vec3(0.34, 0.6, 1.0) * (0.3 + lit), rim * 0.62 * clamp(NdL + 0.45, 0.0, 1.0));
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  const glowMaterial = new THREE.ShaderMaterial({
    uniforms: { uSun: { value: SUN } },
    vertexShader: `varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `uniform vec3 uSun; varying vec3 vN; void main(){ float i = pow(0.68 - dot(vN, vec3(0.0,0.0,1.0)), 3.0);
      gl_FragColor = vec4(0.25, 0.52, 1.0, 1.0) * i * 1.6 * (0.2 + 0.8 * smoothstep(-0.5, 0.6, dot(vN, uSun))); }`,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });
  return { earthMaterial, glowMaterial };
}

export async function createEarthScene(box: HTMLElement, opts: Options): Promise<EarthScene> {
  // ── THE PICTURES ─────────────────────────────────────────────────────────
  const loader = new THREE.TextureLoader();
  const load = (url: string) =>
    loader.loadAsync(url).then((t) => {
      opts.onProgress?.();
      // "anisotropy" keeps the picture sharp near the Earth's edge
      t.anisotropy = 4;
      return t;
    });
  const [day, night, water] = await Promise.all([load(opts.textures.day), load(opts.textures.night), load(opts.textures.water)]);

  // ── RENDERER, SCENE, CAMERA ──────────────────────────────────────────────
  // alpha: a see-through background, so the dark stage shows behind the Earth
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.phone ? 1.5 : 2));
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.className = "gk-earth__canvas";
  box.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  // 37° field of view, a little above the equator, 3.94 Earth-sizes away —
  // lib/globe-loader.ts uses the same numbers so its lines line up
  const camera = new THREE.PerspectiveCamera(37, 1, 0.1, 50);
  camera.position.set(0, 0.55, 3.9);
  camera.lookAt(0, 0, 0);
  // (The sun's direction lives in makeEarthMaterials above.)

  // A latitude/longitude → a point on the sphere (radius r)
  const toVec = (lat: number, lng: number, r: number) => {
    const p = ((90 - lat) * Math.PI) / 180, t = ((lng + 180) * Math.PI) / 180;
    return new THREE.Vector3(-r * Math.sin(p) * Math.cos(t), r * Math.cos(p), r * Math.sin(p) * Math.sin(t));
  };

  // ── THE EARTH AND ITS GLOW (the colour programs are shared with the Atlas) ──
  const { earthMaterial, glowMaterial } = makeEarthMaterials({ day, night, water });
  const globe = new THREE.Group();
  scene.add(globe);
  const detail = opts.phone ? 64 : 96; // how smooth the sphere is (more = rounder, slower)
  globe.add(new THREE.Mesh(new THREE.SphereGeometry(1, detail, detail), earthMaterial));

  const glowGeometry = new THREE.SphereGeometry(1.12, 64, 64);
  scene.add(new THREE.Mesh(glowGeometry, glowMaterial));

  // ── THE ATLAS DOTS AND THE LABEL ─────────────────────────────────────────
  // Plain HTML on top of the 3D picture: each frame, every dot's 3D point is
  // turned into a screen position.
  const layer = document.createElement("div");
  layer.className = "gk-earth__dots";
  layer.setAttribute("aria-hidden", "true");
  box.append(layer);
  const dots = opts.places.map((p) => {
    const el = document.createElement("span");
    el.className = "gk-earth__dot";
    layer.append(el);
    return { ...p, el, pos: toVec(p.lat, p.lng, 1.005), sx: 0, sy: 0, facing: 0 };
  });
  const callout = document.createElement("div");
  callout.className = "gk-earth__callout";
  const calloutBox = document.createElement("div");
  calloutBox.className = "gk-earth__callout-box";
  const calloutYear = document.createElement("b");
  const calloutText = document.createElement("span");
  calloutBox.append(calloutYear, calloutText);
  callout.append(calloutBox);
  layer.append(callout);

  // ── TURNING: a gentle sway around Asia, plus dragging ────────────────────
  const yawFor = (lng: number) => { const v = toVec(30, lng, 1); return -Math.atan2(v.x, v.z); };
  // India faces the viewer (most Atlas places are there); the sway reaches
  // Europe on one side and South-East Asia on the other
  const centre = yawFor(68);
  let drag = 0, dragging = false, lastX = 0, lastTouch = -1e9, yaw = centre;
  const onDown = (e: PointerEvent) => { dragging = true; lastX = e.clientX; box.setPointerCapture(e.pointerId); box.classList.add("is-dragged"); };
  const onMove = (e: PointerEvent) => { if (!dragging) return; drag += (e.clientX - lastX) * 0.006; lastX = e.clientX; lastTouch = performance.now(); };
  const onUp = () => { dragging = false; lastTouch = performance.now(); };
  box.addEventListener("pointerdown", onDown);
  box.addEventListener("pointermove", onMove);
  box.addEventListener("pointerup", onUp);
  box.addEventListener("pointercancel", onUp);

  // ── SIZE, AND ONLY DRAWING WHEN SEEN ─────────────────────────────────────
  let size = 1, onScreen = true;
  const resize = () => { size = box.clientWidth || 1; renderer.setSize(size, size, false); };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(box);
  resize();
  // Scrolled far away, or the tab hidden → no drawing at all (saves battery)
  const seen = new IntersectionObserver(([en]) => { onScreen = en.isIntersecting; }, { rootMargin: "200px" });
  seen.observe(box);

  const tmp = new THREE.Vector3();
  const camDir = camera.position.clone().normalize();
  let pick = -1, nextPick = 0, frame = 0;
  const t0 = performance.now();

  function render(now: number) {
    const t = (now - t0) / 1000;
    // after 4 seconds without touching, a drag slowly eases back
    if (!dragging && now - lastTouch > 4000) drag *= 0.985;
    // data-spin: how far the reader has scrolled the hero (components/home/
    // HeroScrollFx.tsx writes it) — scrolling down turns the Earth too
    const spin = Number(box.dataset.spin || 0);
    const want = centre + 0.5 * Math.sin(t * 0.11) + spin + drag;
    const diff = Math.atan2(Math.sin(want - yaw), Math.cos(want - yaw));
    yaw += dragging ? diff : diff * 0.06;
    globe.rotation.y = yaw;
    globe.updateMatrixWorld();
    renderer.render(scene, camera);

    // place every dot; hide the ones on the far side
    for (const d of dots) {
      tmp.copy(d.pos).applyMatrix4(globe.matrixWorld);
      d.facing = tmp.clone().normalize().dot(camDir);
      d.el.style.opacity = d.facing > 0.15 ? "1" : "0";
      tmp.project(camera);
      d.sx = (tmp.x * 0.5 + 0.5) * size;
      d.sy = (-tmp.y * 0.5 + 0.5) * size;
      d.el.style.transform = `translate(${d.sx}px, ${d.sy}px)`;
    }
    // every 3.4 s, label the next dot that faces the viewer
    const cur = dots[pick];
    if (dots.length && (now > nextPick || (cur && cur.facing < 0.3))) {
      cur?.el.classList.remove("is-on");
      let tries = 0;
      do { pick = (pick + 1) % dots.length; } while (dots[pick].facing < 0.45 && ++tries < dots.length);
      if (dots[pick].facing >= 0.45) {
        dots[pick].el.classList.add("is-on");
        calloutYear.textContent = dots[pick].year;
        calloutText.textContent = dots[pick].title;
        callout.style.opacity = "1";
      } else {
        callout.style.opacity = "0";
        pick = -1;
      }
      nextPick = now + 3400;
    }
    if (pick >= 0) {
      // the label sits beside its dot, on whichever side has room
      const d = dots[pick], bw = calloutBox.offsetWidth || 200;
      const off = clamp(d.sx > size - bw - 20 ? -bw - 10 : 10, 4 - d.sx, size - 4 - bw - d.sx);
      calloutBox.style.left = `${off}px`;
      callout.style.transform = `translate(${d.sx}px, ${d.sy}px)`;
    }
  }

  function loop(now: number) {
    frame = requestAnimationFrame(loop);
    if (!onScreen || document.hidden) return;
    render(now);
  }
  frame = requestAnimationFrame(loop);

  return {
    yaw: () => yaw,
    snapshot: () => { render(performance.now()); return renderer.domElement.toDataURL("image/png"); },
    dispose: () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      seen.disconnect();
      box.removeEventListener("pointerdown", onDown);
      box.removeEventListener("pointermove", onMove);
      box.removeEventListener("pointerup", onUp);
      box.removeEventListener("pointercancel", onUp);
      // Free the graphics chip's memory — pictures, shapes, programs
      [day, night, water].forEach((t) => t.dispose());
      earthMaterial.dispose();
      glowMaterial.dispose();
      glowGeometry.dispose();
      globe.traverse((o) => { if (o instanceof THREE.Mesh) o.geometry.dispose(); });
      renderer.dispose();
      renderer.domElement.remove();
      layer.remove();
    },
  };
}
