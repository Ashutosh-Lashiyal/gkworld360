// lib/earth-support.ts — "can this device run the realistic 3D Earth?"
// (31 Oct 2026). Shared by the homepage hero (components/home/HeroEarth.tsx)
// and the World360 Atlas (components/atlas/AtlasExplorer.tsx). Browser only.
//
// No to: data saver on, a very slow network, under 4 GB of memory, fewer
// than 4 processor cores, or no 3D support at all. Those devices get the
// lighter version (a still photo on the homepage, the dotted globe on the Atlas).
//
// `motion`: the homepage Earth turns by itself, so readers who asked for
// less motion get the still photo there. The Atlas Earth only moves when the
// reader picks a place, so it ignores that setting (motion: false).

export function canRun3D({ motion = true }: { motion?: boolean } = {}): boolean {
  // Navigator extras that not every browser has — read them carefully
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean; effectiveType?: string } };
  if (motion && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false; // asked for less motion
  if (nav.connection?.saveData) return false;                                     // data saver on
  if (/(^|-)2g$/.test(nav.connection?.effectiveType ?? "")) return false;          // very slow network
  if (nav.deviceMemory !== undefined && nav.deviceMemory < 4) return false;       // under 4 GB of memory
  if (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency < 4) return false; // fewer than 4 processor cores
  try {
    // Does this browser support 3D drawing at all?
    return !!document.createElement("canvas").getContext("webgl");
  } catch {
    return false;
  }
}
