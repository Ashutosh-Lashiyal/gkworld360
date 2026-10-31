// lib/atlas-earth-layer.ts — the REALISTIC EARTH under the World360 Atlas
// globe (redesign, 31 Oct 2026; owner chose "Full design"). Browser only.
//
// HOW IT FITS WITH THE EXISTING GLOBE: lib/atlas-globe.ts still does all the
// work it always did — turning, flying to a place, tapping dots, numbered
// dots, zooming, the labels — and draws its dots on a see-through canvas.
// This file draws a second canvas UNDERNEATH it: the same Earth as the
// homepage (daylight, city lights at night, sun glint, atmosphere), turned
// and sized EXACTLY like the dotted globe on every frame. The globe hands us
// its view (which longitude/latitude faces us, how big it is, where its
// centre is) and we draw the Earth to match, so every dot sits on its place.
//
// FLAT-ON VIEW: the dotted globe is drawn without perspective (an
// "orthographic" view — like looking at the Earth from very far away), so this
// layer uses an orthographic camera too, or the two would drift apart near
// the edges.
//
// Loaded on demand (AtlasExplorer imports it after the page has appeared), so
// three.js never slows the first view; weak devices never load it at all and
// keep the dotted globe.

import * as THREE from "three";
import { makeEarthMaterials } from "@/lib/earth-scene";

export type AtlasView = { lon: number; lat: number; Rz: number; CX: number; CY: number; W: number; H: number; zoom: number };

export type AtlasEarthLayer = {
  render: (v: AtlasView) => void;
  dispose: () => void;
};

const RAD = Math.PI / 180;

export async function createAtlasEarthLayer(host: HTMLElement, { phone }: { phone: boolean }): Promise<AtlasEarthLayer> {
  // The same pictures as the homepage (phones get the smaller ones)
  const loader = new THREE.TextureLoader();
  const load = (url: string) => loader.loadAsync(url).then((t) => { t.anisotropy = 4; return t; });
  const [day, night, water] = await Promise.all([
    load(phone ? "/earth/day-1024.jpg" : "/earth/day-2048.jpg"),
    load(phone ? "/earth/night-1024.jpg" : "/earth/night-2048.jpg"),
    load("/earth/water-512.jpg"),
  ]);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, phone ? 1.5 : 2));
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.className = "gp-earth";
  renderer.domElement.setAttribute("aria-hidden", "true");
  // Underneath the dotted globe's canvas (CSS puts it on the bottom layer)
  host.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.set(0, 0, 5);

  const { earthMaterial, glowMaterial } = makeEarthMaterials({ day, night, water }, { ortho: true });
  const detail = phone ? 64 : 96;
  const earthGeometry = new THREE.SphereGeometry(1, detail, detail);
  const glowGeometry = new THREE.SphereGeometry(1.06, 64, 64);
  const earth = new THREE.Mesh(earthGeometry, earthMaterial);
  // We set the Earth's turn ourselves each frame (below), so three.js
  // shouldn't recalculate it from position/rotation
  earth.matrixAutoUpdate = false;
  scene.add(earth, new THREE.Mesh(glowGeometry, glowMaterial));

  let w = 0, h = 0;

  return {
    render(v: AtlasView) {
      if (!v.W || !v.H) return;
      if (v.W !== w || v.H !== h) { w = v.W; h = v.H; renderer.setSize(w, h, false); }

      // THE TURN: the same maths as the dotted globe's screen() in
      // lib/atlas-globe.ts, written as one matrix (a table of 9 numbers that
      // turns every point of the Earth at once). L = the longitude facing us,
      // P = minus the latitude facing us.
      const cL = Math.cos(v.lon * RAD), sL = Math.sin(v.lon * RAD);
      const cP = Math.cos(-v.lat * RAD), sP = Math.sin(-v.lat * RAD);
      earth.matrix.set(
        -sL, 0, -cL, 0,
        cL * sP, cP, -sL * sP, 0,
        cL * cP, -sP, -sL * cP, 0,
        0, 0, 0, 1,
      );
      earth.matrixWorldNeedsUpdate = true;

      // THE SIZE AND PLACE: one Earth-radius = Rz screen pixels, and the
      // Earth's centre at (CX, CY) — the camera's window is set to match.
      camera.left = -v.CX / v.Rz;
      camera.right = (v.W - v.CX) / v.Rz;
      camera.top = v.CY / v.Rz;
      camera.bottom = -(v.H - v.CY) / v.Rz;
      camera.updateProjectionMatrix();

      // Zoomed far in, the photo of the Earth turns blurry (it's only 2048
      // pixels wide for the whole world), so it dims as the dotted land —
      // sharp at any zoom — fades in on top (lib/atlas-globe.ts).
      renderer.domElement.style.opacity = String(1 - 0.55 * Math.min(1, Math.max(0, (v.zoom - 2.5) / 2.5)));
      renderer.render(scene, camera);
    },
    dispose() {
      [day, night, water].forEach((t) => t.dispose());
      earthMaterial.dispose();
      glowMaterial.dispose();
      earthGeometry.dispose();
      glowGeometry.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
