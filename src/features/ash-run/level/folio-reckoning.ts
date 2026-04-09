import type { LevelDef } from "./types";

/**
 * Folio V — reckoning. Unlocks after fracture; exit sealed until the arbiter falls.
 */
export function createFolioReckoningLevel(): LevelDef {
  const floorY = 480;
  const floorH = 120;
  const W = 3040;

  return {
    id: "folio_v_reckoning",
    name: "Reckoning — Folio V",
    width: W,
    height: 600,
    entities: [
      { kind: "solid", x: 0, y: floorY, w: W, h: floorH },

      /* Opening climb */
      { kind: "solid", x: 48, y: 408, w: 160, h: 18 },
      { kind: "solid", x: 260, y: 344, w: 200, h: 18 },
      {
        kind: "hazard",
        x: 220,
        y: floorY - 40,
        w: 200,
        h: 40,
        dps: 2.1,
      },
      { kind: "solid", x: 500, y: 292, w: 150, h: 17 },
      {
        kind: "hazard",
        x: 640,
        y: floorY - 34,
        w: 240,
        h: 34,
        dps: 2.28,
      },

      /* Triple rhythm patrols */
      { kind: "solid", x: 720, y: 340, w: 520, h: 22 },
      {
        kind: "patrol",
        id: "reck_drone_a",
        x: 980,
        y: floorY - 30,
        w: 28,
        h: 28,
        vx: -98,
        patrolLeft: 760,
        patrolRight: 1200,
        hp: 1,
        damage: 1,
        isMiniboss: false,
        hurtCooldownMs: 0,
      },
      {
        kind: "patrol",
        id: "reck_drone_b",
        x: 1120,
        y: floorY - 30,
        w: 28,
        h: 28,
        vx: 90,
        patrolLeft: 780,
        patrolRight: 1180,
        hp: 1,
        damage: 1,
        isMiniboss: false,
        hurtCooldownMs: 0,
      },
      {
        kind: "patrol",
        id: "reck_drone_c",
        x: 880,
        y: floorY - 30,
        w: 28,
        h: 28,
        vx: -72,
        patrolLeft: 800,
        patrolRight: 1140,
        hp: 1,
        damage: 1,
        isMiniboss: false,
        hurtCooldownMs: 0,
      },

      { kind: "solid", x: 1260, y: 272, w: 130, h: 18 },
      {
        kind: "hazard",
        x: 1320,
        y: floorY - 38,
        w: 140,
        h: 38,
        dps: 2.42,
      },
      { kind: "solid", x: 1460, y: 210, w: 180, h: 18 },

      {
        kind: "checkpoint",
        id: "reckoning_mid",
        x: 1520,
        y: 196,
        w: 48,
        h: 76,
      },

      { kind: "solid", x: 1640, y: 300, w: 240, h: 22 },
      {
        kind: "hazard",
        x: 1720,
        y: floorY - 32,
        w: 120,
        h: 32,
        dps: 2.32,
      },
      { kind: "solid", x: 1880, y: 248, w: 100, h: 16 },

      {
        kind: "boss_gate",
        x: 2008,
        y: 0,
        w: 44,
        h: 520,
        enterLine:
          "Last page—reckoning doesn’t blink.\nArbiter measures the run. Outpace the verdict.",
      },

      /* Arena — wider than Folio IV */
      { kind: "solid", x: 2076, y: 180, w: 880, h: 28 },
      { kind: "solid", x: 2112, y: 368, w: 48, h: 112 },
      { kind: "solid", x: 2872, y: 368, w: 48, h: 112 },
      {
        kind: "hazard",
        x: 2168,
        y: floorY - 32,
        w: 52,
        h: 32,
        dps: 2.2,
      },
      { kind: "solid", x: 2220, y: floorY - 12, w: 40, h: 12 },
      {
        kind: "hazard",
        x: 2260,
        y: floorY - 32,
        w: 52,
        h: 32,
        dps: 2.2,
      },
      { kind: "solid", x: 2320, y: 300, w: 220, h: 22 },
      {
        kind: "hazard",
        x: 2580,
        y: floorY - 30,
        w: 44,
        h: 30,
        dps: 2.38,
      },
      { kind: "solid", x: 2624, y: floorY - 11, w: 32, h: 11 },
      {
        kind: "hazard",
        x: 2656,
        y: floorY - 30,
        w: 44,
        h: 30,
        dps: 2.38,
      },
      { kind: "solid", x: 2688, y: 404, w: 260, h: 22 },
      { kind: "solid", x: 2840, y: 336, w: 140, h: 20 },
      {
        kind: "exit",
        x: 2920,
        y: 228,
        w: 48,
        h: 86,
      },
    ],
  };
}
