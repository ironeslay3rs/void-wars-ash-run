import type { LevelDef } from "./types";

/**
 * Blackcity Lab Escape — single authored slice.
 *
 * Pressure arc (layout + cadence only):
 * — Early lab (z1–2): softer pools, wider grate — controlled read.
 * — Lockdown mid (z3–5): faster drones, meaner pool, tight ledge — lab reacting.
 * — Escape final (z7–8): sentinel + hatch bite — short safe windows, move now.
 *
 * Flow (left → right):
 * 1. Containment — wide clean steps + high trim; no hostiles.
 * 2. Wash — two beats; first pool gentler, second step-up.
 * 3. Drone corridor — crossing pressure, raised cadence.
 * 4. Relief climb — stairs into checkpoint.
 * 5. Lock approach — pinch + hot pool before seal.
 * 6. Boss gate — seal trigger.
 * 7. Sentinel chamber — arena.
 * 8. Hatch run — floor bite + tight climb to exit.
 */
export function createBlackcityLabLevel(): LevelDef {
  const floorY = 480;
  const floorH = 120;
  const W = 3640;

  return {
    id: "blackcity_lab_escape",
    name: "Blackcity Lab Escape",
    width: W,
    height: 600,
    entities: [
      { kind: "solid", x: 0, y: floorY, w: W, h: floorH },

      /* --- Zone 1: containment — calm, “clean tile” tutorial bay --- */
      { kind: "solid", x: 60, y: 228, w: 520, h: 14 },
      { kind: "solid", x: 88, y: 406, w: 300, h: 22 },
      { kind: "solid", x: 400, y: 366, w: 220, h: 20 },
      { kind: "solid", x: 620, y: 322, w: 180, h: 18 },

      /* --- Zone 2: wash — early pool softer; second beat steps danger up --- */
      { kind: "solid", x: 802, y: 434, w: 92, h: 20 },
      {
        kind: "hazard",
        x: 912,
        y: floorY - 50,
        w: 168,
        h: 50,
        dps: 1.72,
      },
      {
        kind: "hazard",
        x: 1108,
        y: floorY - 50,
        w: 168,
        h: 50,
        dps: 2.12,
      },
      { kind: "solid", x: 966, y: 374, w: 204, h: 18 },
      /* +8px left: cleaner landing after second pool on first attempt */
      { kind: "solid", x: 1272, y: 432, w: 128, h: 20 },

      /* --- Zone 3: drone corridor — pressure slot --- */
      { kind: "solid", x: 1380, y: 318, w: 26, h: 162 },
      { kind: "solid", x: 1468, y: 278, w: 420, h: 22 },
      { kind: "solid", x: 1842, y: 318, w: 26, h: 162 },
      { kind: "solid", x: 1500, y: 402, w: 140, h: 20 },
      {
        kind: "patrol",
        id: "drone_a",
        x: 1775,
        y: floorY - 30,
        w: 28,
        h: 28,
        vx: -100,
        patrolLeft: 1422,
        patrolRight: 1802,
        hp: 2,
        damage: 1,
        isMiniboss: false,
        hurtCooldownMs: 0,
      },
      {
        kind: "patrol",
        id: "drone_b",
        x: 1448,
        y: floorY - 30,
        w: 28,
        h: 28,
        vx: 96,
        patrolLeft: 1430,
        patrolRight: 1790,
        hp: 2,
        damage: 1,
        isMiniboss: false,
        hurtCooldownMs: 0,
      },

      /* --- Zone 4: checkpoint relief — broad readable stairs --- */
      { kind: "solid", x: 1860, y: 412, w: 132, h: 22 },
      { kind: "solid", x: 2034, y: 352, w: 118, h: 22 },
      { kind: "solid", x: 2194, y: 292, w: 118, h: 20 },
      {
        kind: "checkpoint",
        id: "lab_mid",
        x: 2200,
        y: 236,
        w: 52,
        h: 82,
      },

      /* --- Zone 5: lock approach — tension before seal --- */
      { kind: "solid", x: 2280, y: 304, w: 32, h: 176 },
      { kind: "solid", x: 2560, y: 286, w: 32, h: 194 },
      {
        kind: "hazard",
        x: 2344,
        y: floorY - 36,
        w: 136,
        h: 36,
        dps: 2.48,
      },
      { kind: "solid", x: 2320, y: 244, w: 280, h: 18 },
      { kind: "solid", x: 2400, y: 366, w: 152, h: 22 },

      /* --- Zone 6: boss gate --- */
      {
        kind: "boss_gate",
        x: 2612,
        y: 0,
        w: 44,
        h: 520,
        enterLine:
          "Floor shudders—red wash seals behind her. No questions. Deep lab's the door. Run.",
      },

      /* --- Zone 7: sentinel chamber — deliberate arena frame --- */
      { kind: "solid", x: 2680, y: 172, w: 600, h: 26 },
      { kind: "solid", x: 2710, y: 358, w: 48, h: 122 },
      { kind: "solid", x: 3208, y: 358, w: 48, h: 122 },
      { kind: "solid", x: 2880, y: 268, w: 200, h: 20 },

      /* --- Zone 8: hatch run — floor strip forces hop off blind sprint --- */
      {
        kind: "hazard",
        x: 3178,
        y: floorY - 26,
        w: 94,
        h: 26,
        dps: 2.36,
      },
      { kind: "solid", x: 3280, y: 444, w: 206, h: 22 },
      { kind: "solid", x: 3440, y: 392, w: 112, h: 22 },
      { kind: "solid", x: 3548, y: 330, w: 72, h: 22 },
      {
        kind: "exit",
        x: 3560,
        y: 214,
        w: 48,
        h: 86,
      },
    ],
  };
}
