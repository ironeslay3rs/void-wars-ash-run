import type { LevelDef } from "./types";

/**
 * Folio IV — fracture line. Unlocks after vault; sealed exit until the herald falls.
 */
export function createFolioFractureLevel(): LevelDef {
  const floorY = 480;
  const floorH = 120;
  const W = 2680;

  return {
    id: "folio_iv_fracture",
    name: "Fracture Line — Folio IV",
    width: W,
    height: 600,
    entities: [
      { kind: "solid", x: 0, y: floorY, w: W, h: floorH },

      /* Rise — broken catwalk */
      { kind: "solid", x: 56, y: 400, w: 180, h: 18 },
      { kind: "solid", x: 288, y: 336, w: 200, h: 18 },
      {
        kind: "hazard",
        x: 240,
        y: floorY - 38,
        w: 160,
        h: 38,
        dps: 2.05,
      },
      { kind: "solid", x: 520, y: 288, w: 140, h: 16 },
      {
        kind: "hazard",
        x: 680,
        y: floorY - 32,
        w: 280,
        h: 32,
        dps: 2.2,
      },
      { kind: "solid", x: 660, y: 360, w: 32, h: 120 },

      /* Span — twin drones */
      { kind: "solid", x: 740, y: 320, w: 480, h: 22 },
      {
        kind: "patrol",
        id: "fracture_drone_a",
        x: 980,
        y: floorY - 30,
        w: 28,
        h: 28,
        vx: -102,
        patrolLeft: 780,
        patrolRight: 1180,
        hp: 1,
        damage: 1,
        isMiniboss: false,
        hurtCooldownMs: 0,
      },
      {
        kind: "patrol",
        id: "fracture_drone_b",
        x: 1120,
        y: floorY - 30,
        w: 28,
        h: 28,
        vx: 88,
        patrolLeft: 800,
        patrolRight: 1160,
        hp: 1,
        damage: 1,
        isMiniboss: false,
        hurtCooldownMs: 0,
      },

      { kind: "solid", x: 1240, y: 256, w: 120, h: 16 },
      {
        kind: "hazard",
        x: 1288,
        y: floorY - 36,
        w: 96,
        h: 36,
        dps: 2.4,
      },
      { kind: "solid", x: 1388, y: 200, w: 160, h: 18 },

      {
        kind: "checkpoint",
        id: "fracture_mid",
        x: 1420,
        y: 188,
        w: 48,
        h: 74,
      },

      { kind: "solid", x: 1520, y: 292, w: 220, h: 20 },
      {
        kind: "hazard",
        x: 1560,
        y: floorY - 30,
        w: 100,
        h: 30,
        dps: 2.25,
      },

      {
        kind: "boss_gate",
        x: 1688,
        y: 0,
        w: 44,
        h: 520,
        enterLine:
          "The fracture seals—ink runs both ways.\nHerald doesn’t negotiate. Cut the line.",
      },

      /* Arena */
      { kind: "solid", x: 1756, y: 184, w: 780, h: 26 },
      { kind: "solid", x: 1788, y: 364, w: 44, h: 116 },
      { kind: "solid", x: 2460, y: 364, w: 44, h: 116 },
      {
        kind: "hazard",
        x: 1840,
        y: floorY - 30,
        w: 48,
        h: 30,
        dps: 2.15,
      },
      { kind: "solid", x: 1888, y: floorY - 12, w: 36, h: 12 },
      {
        kind: "hazard",
        x: 1924,
        y: floorY - 30,
        w: 48,
        h: 30,
        dps: 2.15,
      },
      { kind: "solid", x: 1976, y: 292, w: 200, h: 22 },
      {
        kind: "hazard",
        x: 2220,
        y: floorY - 28,
        w: 40,
        h: 28,
        dps: 2.28,
      },
      { kind: "solid", x: 2260, y: floorY - 11, w: 28, h: 11 },
      {
        kind: "hazard",
        x: 2288,
        y: floorY - 28,
        w: 40,
        h: 28,
        dps: 2.28,
      },
      { kind: "solid", x: 2320, y: 396, w: 220, h: 22 },
      { kind: "solid", x: 2480, y: 328, w: 120, h: 20 },
      {
        kind: "exit",
        x: 2560,
        y: 232,
        w: 48,
        h: 86,
      },
    ],
  };
}
