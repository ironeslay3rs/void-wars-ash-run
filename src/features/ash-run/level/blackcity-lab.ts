import type { LevelDef } from "./types";

/**
 * Blackcity Lab Escape — slice layout (world units).
 * Containment → acid gap → checkpoint → gate → sentinel → exit.
 */
export function createBlackcityLabLevel(): LevelDef {
  const floorY = 480;
  const floorH = 120;
  const W = 2800;

  return {
    id: "blackcity_lab_escape",
    name: "Blackcity Lab Escape",
    width: W,
    height: 600,
    entities: [
      { kind: "solid", x: 0, y: floorY, w: W, h: floorH },
      { kind: "solid", x: 0, y: 380, w: 280, h: 24 },
      { kind: "solid", x: 320, y: 340, w: 160, h: 20 },
      { kind: "solid", x: 520, y: 300, w: 140, h: 20 },
      {
        kind: "hazard",
        x: 700,
        y: floorY - 40,
        w: 200,
        h: 44,
        dps: 2.2,
      },
      { kind: "solid", x: 940, y: 320, w: 120, h: 20 },
      { kind: "solid", x: 1120, y: 280, w: 200, h: 20 },
      {
        kind: "checkpoint",
        id: "lab_mid",
        x: 1180,
        y: 240,
        w: 48,
        h: 80,
      },
      { kind: "solid", x: 1400, y: 360, w: 100, h: 22 },
      { kind: "solid", x: 1560, y: 300, w: 180, h: 22 },
      {
        kind: "boss_gate",
        x: 1780,
        y: 0,
        w: 48,
        h: 520,
        enterLine:
          "The corridor seals—something heavy wakes on the other side. Ash's fusion spine screams wrong-right-wrong.",
      },
      { kind: "solid", x: 1840, y: 400, w: 320, h: 24 },
      { kind: "solid", x: 2200, y: 340, w: 160, h: 22 },
      {
        kind: "exit",
        x: 2620,
        y: 400,
        w: 40,
        h: 80,
      },
      {
        kind: "patrol",
        id: "drone_a",
        x: 400,
        y: floorY - 40,
        w: 28,
        h: 28,
        vx: -70,
        patrolLeft: 300,
        patrolRight: 620,
        hp: 2,
        damage: 1,
        isMiniboss: false,
        hurtCooldownMs: 0,
      },
    ],
  };
}
