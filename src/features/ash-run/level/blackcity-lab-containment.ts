import type { LevelDef } from "./types";

/**
 * Blackcity Lab — Containment (Folio I.a).
 *
 * First lab beat: zones 1-4. Showcases variable jump height — short-hop
 * rungs for the tutorial hop, clean stairs into the checkpoint. No
 * wall-jump, no authored traces here; the next beats introduce those.
 *
 * Lab vocabulary: containment cells, floor tiles, wash bay, relief stairs.
 * Canon: Ash.md §Story Arc Map 1 — escape the laboratory.
 */
export function createBlackcityLabContainmentLevel(): LevelDef {
  const floorY = 480;
  const floorH = 120;
  const W = 2400;

  return {
    id: "blackcity_lab_containment",
    name: "Blackcity Lab — Containment (Folio I.a)",
    width: W,
    height: 600,
    entities: [
      { kind: "solid", x: 0, y: floorY, w: W, h: floorH },

      /* --- Zone 1: containment cells — calm, clean-tile tutorial bay --- */
      { kind: "solid", x: 60, y: 228, w: 520, h: 14 },
      { kind: "solid", x: 88, y: 406, w: 300, h: 22 },
      { kind: "solid", x: 400, y: 366, w: 220, h: 20 },
      { kind: "solid", x: 620, y: 322, w: 180, h: 18 },

      /* Short-hop rungs — teaches variable jump (tap = small, hold = full). */
      { kind: "solid", x: 300, y: 446, w: 32, h: 12 },
      { kind: "solid", x: 360, y: 430, w: 32, h: 12 },
      { kind: "solid", x: 420, y: 414, w: 32, h: 12 },

      /* --- Zone 2: wash — early pool softer; second beat steps danger up --- */
      { kind: "solid", x: 802, y: 434, w: 92, h: 20 },
      {
        kind: "hazard",
        x: 912,
        y: floorY - 50,
        w: 168,
        h: 50,
        dps: 1.72,
        preEcho: true,
      },
      {
        kind: "hazard",
        x: 1108,
        y: floorY - 50,
        w: 168,
        h: 50,
        dps: 2.12,
        preEcho: true,
      },
      { kind: "solid", x: 1080, y: floorY - 10, w: 28, h: 10 },
      { kind: "solid", x: 966, y: 374, w: 204, h: 18 },
      { kind: "solid", x: 1276, y: floorY - 10, w: 12, h: 10 },
      { kind: "solid", x: 1272, y: 432, w: 128, h: 20 },

      /* --- Zone 3: drone corridor (trimmed for containment arc) --- */
      { kind: "solid", x: 1380, y: 318, w: 26, h: 162 },
      { kind: "solid", x: 1468, y: 278, w: 420, h: 22 },
      { kind: "solid", x: 1842, y: 318, w: 26, h: 162 },
      { kind: "solid", x: 1500, y: 402, w: 140, h: 20 },
      {
        kind: "patrol",
        id: "drone_a",
        x: 1782,
        y: floorY - 30,
        w: 28,
        h: 28,
        vx: -106,
        patrolLeft: 1406,
        patrolRight: 1820,
        hp: 1,
        damage: 1,
        isMiniboss: false,
        hurtCooldownMs: 0,
      },
      {
        kind: "patrol",
        id: "drone_b",
        x: 1455,
        y: floorY - 30,
        w: 28,
        h: 28,
        vx: 100,
        patrolLeft: 1430,
        patrolRight: 1795,
        hp: 1,
        damage: 1,
        isMiniboss: false,
        hurtCooldownMs: 0,
      },

      /* --- Zone 4: checkpoint relief — broad readable stairs + handoff --- */
      { kind: "solid", x: 1860, y: 412, w: 132, h: 22 },
      { kind: "solid", x: 2034, y: 352, w: 118, h: 22 },
      { kind: "solid", x: 2194, y: 292, w: 118, h: 20 },
      {
        kind: "checkpoint",
        id: "lab_containment_end",
        x: 2200,
        y: 236,
        w: 52,
        h: 82,
      },

      /* Handoff gate → Deep Lab (exit). */
      {
        kind: "exit",
        x: 2320,
        y: floorY - 64,
        w: 48,
        h: 64,
      },
    ],
  };
}
