import type { LevelDef } from "./types";

/**
 * Blackcity Lab — Deep Lab (Folio I.b).
 *
 * Second lab beat: vertical shaft into the lock-pool seal. Showcases
 * wall jump — the shaft is only clearable by kicking off opposing walls
 * (or a tight dash+coyote; wall jump is the intended read).
 *
 * Lab vocabulary: deep-lab chamber, shaft braces, lock pool, seal gate.
 * Canon: Ash.md §Core Identity — "read the room faster than her captors can close it".
 */
export function createBlackcityLabDeepLevel(): LevelDef {
  const floorY = 480;
  const floorH = 120;
  const W = 2000;

  return {
    id: "blackcity_lab_deep",
    name: "Blackcity Lab — Deep Lab (Folio I.b)",
    width: W,
    height: 600,
    entities: [
      { kind: "solid", x: 0, y: floorY, w: W, h: floorH },

      /* --- Entry platform --- */
      { kind: "solid", x: 80, y: 420, w: 220, h: 20 },

      /* --- Wall-jump shaft: two tall opposing walls, ~120px apart --- */
      /* Left wall — 260px tall. */
      { kind: "solid", x: 360, y: 200, w: 40, h: 280 },
      /* Right wall — stepped, taller at top to force kick-up. */
      { kind: "solid", x: 540, y: 160, w: 40, h: 320 },
      /* Mid-shaft rest perch (optional hold point). */
      { kind: "solid", x: 400, y: 340, w: 60, h: 14 },
      /* Top deck across the shaft. */
      { kind: "solid", x: 360, y: 160, w: 260, h: 18 },

      /* --- Post-shaft corridor leading to lock approach --- */
      { kind: "solid", x: 620, y: 300, w: 120, h: 20 },
      { kind: "solid", x: 760, y: 360, w: 160, h: 20 },
      { kind: "solid", x: 940, y: 412, w: 180, h: 22 },

      /* --- Lock approach — tension before seal --- */
      { kind: "solid", x: 1160, y: 304, w: 32, h: 176 },
      { kind: "solid", x: 1440, y: 286, w: 32, h: 194 },
      {
        kind: "hazard",
        x: 1224,
        y: floorY - 36,
        w: 48,
        h: 36,
        dps: 2.48,
        preEcho: true,
      },
      { kind: "solid", x: 1272, y: floorY - 12, w: 32, h: 12 },
      {
        kind: "hazard",
        x: 1304,
        y: floorY - 36,
        w: 56,
        h: 36,
        dps: 2.48,
        preEcho: true,
      },
      { kind: "solid", x: 1200, y: 244, w: 280, h: 18 },
      { kind: "solid", x: 1280, y: 366, w: 152, h: 22 },

      /* Checkpoint before seal. */
      {
        kind: "checkpoint",
        id: "lab_deep_seal",
        x: 1500,
        y: 236,
        w: 52,
        h: 82,
      },

      /* Handoff gate → Hatch (exit). */
      {
        kind: "exit",
        x: 1900,
        y: floorY - 64,
        w: 48,
        h: 64,
      },

      /* --- Authored safe-route trace across center nail --- */
      {
        kind: "resonance_trace",
        x: 1220,
        y: 460,
        traceKind: "safe_route",
        points: [
          { x: 1220, y: 462 },
          { x: 1272, y: 462 },
          { x: 1288, y: 460 },
          { x: 1304, y: 462 },
          { x: 1360, y: 462 },
        ],
        intensityFalloff: 0.75,
      },
    ],
  };
}
