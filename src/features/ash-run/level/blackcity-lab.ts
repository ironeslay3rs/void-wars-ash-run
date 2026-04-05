import type { LevelDef } from "./types";

/**
 * Blackcity Lab Escape — single authored slice.
 *
 * Flow (left → right):
 * 1. Containment — wide clean steps + high trim; no hostiles.
 * 2. Wash channel — deep spill trough + obvious grate catwalk; dry curbs.
 * 3. Drone corridor — side walls + low ceiling + hop choke; patrol in the slot.
 * 4. Relief climb — broad stairs into checkpoint alcove.
 * 5. Lock approach — columns, drip pool, overhead pinch to gate.
 * 6. Boss gate — seal trigger.
 * 7. Sentinel chamber — framed arena (ceiling + pillars + rear bulkhead).
 * 8. Hatch run — flat release sprint, then tight upward flight to exit.
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

      /* --- Zone 2: wash channel — lab spill + one obvious safe bridge --- */
      { kind: "solid", x: 800, y: 434, w: 100, h: 20 },
      {
        kind: "hazard",
        x: 920,
        y: floorY - 50,
        w: 360,
        h: 50,
        dps: 2.2,
      },
      { kind: "solid", x: 980, y: 374, w: 220, h: 18 },
      { kind: "solid", x: 1280, y: 432, w: 120, h: 20 },

      /* --- Zone 3: drone corridor — pressure slot --- */
      { kind: "solid", x: 1380, y: 318, w: 26, h: 162 },
      { kind: "solid", x: 1468, y: 278, w: 420, h: 22 },
      { kind: "solid", x: 1842, y: 318, w: 26, h: 162 },
      { kind: "solid", x: 1500, y: 402, w: 140, h: 20 },
      {
        kind: "patrol",
        id: "drone_a",
        x: 1620,
        y: floorY - 30,
        w: 28,
        h: 28,
        vx: -78,
        patrolLeft: 1410,
        patrolRight: 1810,
        hp: 2,
        damage: 1,
        isMiniboss: false,
        hurtCooldownMs: 0,
      },

      /* --- Zone 4: checkpoint relief — broad readable stairs --- */
      { kind: "solid", x: 1860, y: 412, w: 140, h: 22 },
      { kind: "solid", x: 2020, y: 352, w: 140, h: 22 },
      { kind: "solid", x: 2180, y: 292, w: 140, h: 20 },
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
        x: 2340,
        y: floorY - 36,
        w: 140,
        h: 36,
        dps: 1.9,
      },
      { kind: "solid", x: 2320, y: 244, w: 280, h: 18 },
      { kind: "solid", x: 2380, y: 366, w: 200, h: 22 },

      /* --- Zone 6: boss gate --- */
      {
        kind: "boss_gate",
        x: 2612,
        y: 0,
        w: 44,
        h: 520,
        enterLine:
          "Red wash floods the corridor—seals slam behind. Whatever they bred in the deep lab just became the only way through. Ash breathes once, then moves.",
      },

      /* --- Zone 7: sentinel chamber — deliberate arena frame --- */
      { kind: "solid", x: 2680, y: 172, w: 600, h: 26 },
      { kind: "solid", x: 2710, y: 358, w: 48, h: 122 },
      { kind: "solid", x: 3208, y: 358, w: 48, h: 122 },
      { kind: "solid", x: 2880, y: 268, w: 200, h: 20 },

      /* --- Zone 8: hatch run — only after arena (x > pillar line) --- */
      { kind: "solid", x: 3280, y: 444, w: 240, h: 22 },
      { kind: "solid", x: 3420, y: 392, w: 150, h: 22 },
      { kind: "solid", x: 3520, y: 330, w: 100, h: 22 },
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
