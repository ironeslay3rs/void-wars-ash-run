import type { Ash } from "../entities/types";
import type { Rect, Solid } from "../level/types";

export function rectsOverlap(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

export function ashBounds(ash: Ash): Rect {
  return { x: ash.x, y: ash.y, w: ash.width, h: ash.height };
}

export function resolveX(ash: Ash, solids: Solid[], dx: number): number {
  if (dx === 0) return ash.x;
  let nx = ash.x + dx;
  const r: Rect = { x: nx, y: ash.y, w: ash.width, h: ash.height };
  for (const s of solids) {
    if (rectsOverlap(r, s)) {
      if (dx > 0) nx = Math.min(nx, s.x - ash.width);
      else nx = Math.max(nx, s.x + s.w);
      r.x = nx;
    }
  }
  return nx;
}

export function resolveY(
  ash: Ash,
  solids: Solid[],
  dy: number,
): { y: number; grounded: boolean } {
  if (dy === 0) return { y: ash.y, grounded: ash.grounded };
  let ny = ash.y + dy;
  let grounded = false;
  const r: Rect = { x: ash.x, y: ny, w: ash.width, h: ash.height };
  for (const s of solids) {
    if (rectsOverlap(r, s)) {
      if (dy > 0) {
        ny = Math.min(ny, s.y - ash.height);
        grounded = true;
      } else {
        ny = Math.max(ny, s.y + s.h);
      }
      r.y = ny;
    }
  }
  return { y: ny, grounded };
}

export function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
